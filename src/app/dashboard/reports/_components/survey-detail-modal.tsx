"use client";

import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Download, X, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/contexts/theme-context";
import apiClient from "@/lib/api/client";
import { exportDetailedCSV, answerToString } from "../_lib/export";
import type {
  SurveySummary,
  ExportRow,
  TimelinePoint,
  ResponseDetail,
} from "../_lib/types";

// ── Answer analytics helpers ──────────────────────────────────────────────────

interface QuestionAnalytics {
  question_id: number;
  question_text: string;
  question_type: string;
  question_order: number;
  total: number;
  /** For choice/radio/select: frequency map */
  frequencies?: Map<string, number>;
  /** For rating/number: stats */
  avg?: number;
  min?: number;
  max?: number;
  /** For text/textarea: last answers */
  samples?: string[];
}

interface UserPerformance {
  user_id: number;
  user_name: string;
  responses: number;
  avg_answered_questions: number;
  completion_rate_pct: number;
  avg_duration_min: number | null;
  score: number;
}

interface UserRisk {
  user_id: number;
  user_name: string;
  level: "low" | "medium" | "high";
  risk_score: number;
  reasons: string[];
}

const CHOICE_TYPES = new Set([
  "multiple_choice",
  "radio",
  "select",
  "checkbox",
  "single_choice",
]);
const NUMERIC_TYPES = new Set(["rating", "number", "scale"]);

function buildAnalytics(rows: ExportRow[]): QuestionAnalytics[] {
  const map = new Map<number, ExportRow[]>();
  for (const row of rows) {
    if (!map.has(row.question_id)) map.set(row.question_id, []);
    map.get(row.question_id)!.push(row);
  }

  return Array.from(map.values())
    .map((qRows): QuestionAnalytics => {
      const first = qRows[0];
      const type = first.question_type?.toLowerCase() ?? "";
      const base: QuestionAnalytics = {
        question_id: first.question_id,
        question_text: first.question_text,
        question_type: first.question_type,
        question_order: first.question_order,
        total: qRows.length,
      };

      if (CHOICE_TYPES.has(type)) {
        const freq = new Map<string, number>();
        for (const r of qRows) {
          // Handle both string and array answers
          const raw = r.answer_value;
          const values: string[] = Array.isArray(raw)
            ? raw.map(String)
            : [answerToString(raw)];
          for (const v of values) {
            if (v) freq.set(v, (freq.get(v) ?? 0) + 1);
          }
        }
        return { ...base, frequencies: freq };
      }

      if (NUMERIC_TYPES.has(type)) {
        const nums = qRows
          .map((r) => Number(r.answer_value))
          .filter((n) => !Number.isNaN(n));
        if (nums.length > 0) {
          const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
          return {
            ...base,
            avg: Math.round(avg * 10) / 10,
            min: Math.min(...nums),
            max: Math.max(...nums),
          };
        }
      }

      // Text / fallback — show up to 5 sample answers
      const samples = qRows
        .filter((r) => answerToString(r.answer_value).trim().length > 0)
        .slice(0, 5)
        .map((r) => answerToString(r.answer_value));
      return { ...base, samples };
    })
    .sort((a, b) => a.question_order - b.question_order);
}

function toMinutes(
  startedAt: string | null,
  completedAt: string | null,
): number | null {
  if (!startedAt || !completedAt) return null;
  const start = parseISO(startedAt);
  const end = parseISO(completedAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const minutes = (end.getTime() - start.getTime()) / 60000;
  return minutes >= 0 ? minutes : null;
}

function buildUserPerformance(rows: ExportRow[]): UserPerformance[] {
  if (rows.length === 0) return [];

  const totalQuestions = new Set(rows.map((r) => r.question_id)).size || 1;
  const responsesById = new Map<
    number,
    {
      user_id: number;
      user_name: string;
      started_at: string | null;
      completed_at: string | null;
      answered_questions: Set<number>;
    }
  >();

  for (const row of rows) {
    if (!responsesById.has(row.response_id)) {
      responsesById.set(row.response_id, {
        user_id: row.user_id,
        user_name:
          row.user_name?.trim() ||
          row.user_email?.trim() ||
          `Usuario ${row.user_id}`,
        started_at: row.started_at,
        completed_at: row.completed_at,
        answered_questions: new Set<number>(),
      });
    }

    const response = responsesById.get(row.response_id)!;
    response.answered_questions.add(row.question_id);
    if (!response.started_at && row.started_at)
      response.started_at = row.started_at;
    if (!response.completed_at && row.completed_at)
      response.completed_at = row.completed_at;
  }

  const byUser = new Map<
    number,
    {
      user_name: string;
      responses: number;
      answered_questions_total: number;
      completion_rate_total: number;
      duration_samples: number[];
    }
  >();

  for (const response of Array.from(responsesById.values())) {
    const answeredCount = response.answered_questions.size;
    const completionPct = (answeredCount / totalQuestions) * 100;
    const durationMin = toMinutes(response.started_at, response.completed_at);

    if (!byUser.has(response.user_id)) {
      byUser.set(response.user_id, {
        user_name: response.user_name,
        responses: 0,
        answered_questions_total: 0,
        completion_rate_total: 0,
        duration_samples: [],
      });
    }

    const user = byUser.get(response.user_id)!;
    user.responses += 1;
    user.answered_questions_total += answeredCount;
    user.completion_rate_total += completionPct;
    if (durationMin !== null) user.duration_samples.push(durationMin);
  }

  const preliminary = Array.from(byUser.entries()).map(([userId, data]) => {
    const avgDuration =
      data.duration_samples.length > 0
        ? data.duration_samples.reduce((a, b) => a + b, 0) /
          data.duration_samples.length
        : null;

    return {
      user_id: userId,
      user_name: data.user_name,
      responses: data.responses,
      avg_answered_questions: data.answered_questions_total / data.responses,
      completion_rate_pct: data.completion_rate_total / data.responses,
      avg_duration_min: avgDuration,
    };
  });

  const minAvgDuration = preliminary
    .map((u) => u.avg_duration_min)
    .filter((n): n is number => n !== null)
    .reduce((min, n) => Math.min(min, n), Number.POSITIVE_INFINITY);

  return preliminary
    .map((u) => {
      const durationScore =
        u.avg_duration_min !== null && Number.isFinite(minAvgDuration)
          ? Math.max(
              35,
              Math.min(100, (minAvgDuration / u.avg_duration_min) * 100),
            )
          : 60;
      const volumeScore = Math.min(100, 40 + u.responses * 10);
      const qualityScore = Math.min(100, u.completion_rate_pct);
      const score =
        qualityScore * 0.5 + durationScore * 0.3 + volumeScore * 0.2;

      return {
        ...u,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes.toFixed(1)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

function buildUserRisk(performance: UserPerformance[]): UserRisk[] {
  return performance
    .map((u) => {
      let risk = 0;
      const reasons: string[] = [];

      if (u.completion_rate_pct < 70) {
        risk += 35;
        reasons.push("Completitud baja (<70%)");
      } else if (u.completion_rate_pct < 85) {
        risk += 15;
        reasons.push("Completitud media (<85%)");
      }

      if (u.avg_duration_min !== null && u.avg_duration_min < 1.5) {
        risk += 30;
        reasons.push("Tiempo promedio inusualmente rápido");
      }

      if (u.responses >= 3 && u.score < 60) {
        risk += 20;
        reasons.push("Score de desempeño bajo");
      }

      if (u.responses === 1) {
        risk += 10;
        reasons.push("Muestra limitada (1 respuesta)");
      }

      const level: UserRisk["level"] =
        risk >= 60 ? "high" : risk >= 30 ? "medium" : "low";

      return {
        user_id: u.user_id,
        user_name: u.user_name,
        level,
        risk_score: Math.min(100, risk),
        reasons,
      };
    })
    .sort((a, b) => b.risk_score - a.risk_score);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FrequencyBars({
  frequencies,
  total,
}: {
  frequencies: Map<string, number>;
  total: number;
}) {
  const sorted = Array.from(frequencies.entries()).sort((a, b) => b[1] - a[1]);
  const COLORS = [
    "#6366f1",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];

  return (
    <div className="space-y-1.5 mt-2">
      {sorted.map(([label, count], i) => {
        const pct = Math.round((count / total) * 100);
        return (
          <div key={label} className="flex items-center gap-2 text-xs">
            <span
              className="w-36 truncate text-gray-700 dark:text-gray-300 shrink-0"
              title={label}
            >
              {label}
            </span>
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                }}
              />
            </div>
            <span className="w-20 text-right text-gray-500 dark:text-gray-400 tabular-nums shrink-0">
              {count} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RatingStats({
  avg,
  min,
  max,
}: {
  avg: number;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-6 mt-2 text-sm">
      <div className="text-center">
        <p className="text-2xl font-bold text-indigo-600">{avg}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Promedio</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {min}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Mínimo</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {max}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Máximo</p>
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

interface Props {
  survey: SurveySummary;
  exportRows: ExportRow[];
  timeline: TimelinePoint[];
  isLoading: boolean;
  onClose: () => void;
}

export function SurveyDetailModal({
  survey,
  exportRows,
  timeline,
  isLoading,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"analytics" | "responses">(
    "analytics",
  );
  const [expandedResponse, setExpandedResponse] = useState<number | null>(null);
  const [responseDetails, setResponseDetails] = useState<
    Record<number, ResponseDetail | undefined>
  >({});
  const [loadingResponseId, setLoadingResponseId] = useState<number | null>(
    null,
  );

  const tooltipContentStyle =
    theme === "dark"
      ? {
          backgroundColor: "#111827",
          border: "1px solid #374151",
          borderRadius: "8px",
          color: "#f3f4f6",
          fontSize: "12px",
        }
      : {
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          color: "#111827",
          fontSize: "12px",
        };

  const tooltipLabelStyle = {
    color: theme === "dark" ? "#f3f4f6" : "#111827",
  };

  const tooltipItemStyle = {
    color: theme === "dark" ? "#e5e7eb" : "#374151",
  };

  const analytics = useMemo(() => buildAnalytics(exportRows), [exportRows]);
  const performanceByUser = useMemo(
    () => buildUserPerformance(exportRows),
    [exportRows],
  );
  const riskByUser = useMemo(
    () => buildUserRisk(performanceByUser),
    [performanceByUser],
  );

  // Group rows by response_id for the raw-responses tab
  const responseMap = useMemo(() => {
    const map = new Map<number, ExportRow[]>();
    for (const row of exportRows) {
      if (!map.has(row.response_id)) map.set(row.response_id, []);
      map.get(row.response_id)!.push(row);
    }
    return Array.from(map.entries());
  }, [exportRows]);

  const formatMetaValue = (value: unknown): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  const loadResponseDetail = async (responseId: number) => {
    if (responseDetails[responseId]) return;
    setLoadingResponseId(responseId);
    try {
      const res = await apiClient.get<ResponseDetail>(
        `/admin/responses/${responseId}`,
      );
      setResponseDetails((prev) => ({ ...prev, [responseId]: res.data }));
    } catch {
      setResponseDetails((prev) => ({ ...prev, [responseId]: undefined }));
    } finally {
      setLoadingResponseId((current) =>
        current === responseId ? null : current,
      );
    }
  };

  const renderMetaSection = (
    title: string,
    data: Record<string, unknown> | null | undefined,
  ) => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          {title}
        </h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              className="rounded bg-gray-50 dark:bg-gray-800 px-2.5 py-2"
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 break-all">
                {key}
              </p>
              {typeof value === "object" && value !== null ? (
                <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words font-mono">
                  {formatMetaValue(value)}
                </pre>
              ) : (
                <p className="text-xs text-gray-800 dark:text-gray-200 break-words">
                  {formatMetaValue(value)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {survey.survey_title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {survey.total_responses} respuesta
              {survey.total_responses !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportDetailedCSV(exportRows, survey.survey_title)}
              disabled={exportRows.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          {(["analytics", "responses"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              {tab === "analytics"
                ? "Análisis de Respuestas"
                : "Respuestas Individuales"}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
            </div>
          ) : activeTab === "analytics" ? (
            <>
              {/* Timeline */}
              {timeline.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Tendencia de Respuestas
                  </h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart
                      data={timeline}
                      margin={{ top: 0, right: 16, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "currentColor" }}
                        className="text-gray-500 dark:text-gray-400"
                        tickFormatter={(d: string) =>
                          format(parseISO(d), "dd MMM", { locale: es })
                        }
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "currentColor" }}
                        allowDecimals={false}
                        className="text-gray-500 dark:text-gray-400"
                      />
                      <Tooltip
                        formatter={(v: number | undefined) =>
                          [v ?? 0, "Respuestas"] as [number, string]
                        }
                        labelFormatter={(d: unknown) =>
                          typeof d === "string"
                            ? format(parseISO(d), "dd/MM/yyyy", { locale: es })
                            : String(d)
                        }
                        contentStyle={tooltipContentStyle}
                        labelStyle={tooltipLabelStyle}
                        itemStyle={tooltipItemStyle}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Respuestas"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Per-question analytics */}
              {analytics.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Análisis por Pregunta
                  </h3>
                  <div className="space-y-3">
                    {analytics.map((q) => (
                      <div
                        key={q.question_id}
                        className="bg-gray-50 dark:bg-gray-800/40 rounded-lg p-4 border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {q.question_text}
                          </p>
                          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">
                            {q.question_type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                          {q.total} respuesta{q.total !== 1 ? "s" : ""}
                        </p>

                        {q.frequencies && (
                          <FrequencyBars
                            frequencies={q.frequencies}
                            total={q.total}
                          />
                        )}
                        {q.avg !== undefined &&
                          q.min !== undefined &&
                          q.max !== undefined && (
                            <RatingStats avg={q.avg} min={q.min} max={q.max} />
                          )}
                        {q.samples && q.samples.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {q.samples.map((s, i) => (
                              <li
                                key={i}
                                className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded px-2 py-1 border border-gray-100 dark:border-gray-700 truncate"
                              >
                                {s}
                              </li>
                            ))}
                            {q.total > q.samples.length && (
                              <li className="text-xs text-gray-400 dark:text-gray-500 px-2">
                                + {q.total - q.samples.length} más…
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User performance analytics */}
              {performanceByUser.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Performance por Usuario
                  </h3>

                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
                          <th className="text-left px-3 py-2 font-medium">
                            Usuario
                          </th>
                          <th className="text-right px-3 py-2 font-medium">
                            Respuestas
                          </th>
                          <th className="text-right px-3 py-2 font-medium hidden sm:table-cell">
                            Prom. preguntas
                          </th>
                          <th className="text-right px-3 py-2 font-medium">
                            Completitud
                          </th>
                          <th className="text-right px-3 py-2 font-medium hidden md:table-cell">
                            Tiempo prom.
                          </th>
                          <th className="text-right px-3 py-2 font-medium">
                            Score
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {performanceByUser.map((user, idx) => (
                          <tr
                            key={user.user_id}
                            className="text-gray-700 dark:text-gray-300"
                          >
                            <td className="px-3 py-2 font-medium">
                              {user.user_name}
                              {idx < 3 && (
                                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                                  Top {idx + 1}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {user.responses}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums hidden sm:table-cell">
                              {user.avg_answered_questions.toFixed(1)}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {user.completion_rate_pct.toFixed(0)}%
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums hidden md:table-cell">
                              {formatDuration(user.avg_duration_min)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className="inline-flex items-center justify-end min-w-[3.5rem] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold tabular-nums">
                                {user.score.toFixed(0)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* User risk analytics */}
              {riskByUser.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Riesgo por Usuario
                  </h3>

                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
                          <th className="text-left px-3 py-2 font-medium">
                            Usuario
                          </th>
                          <th className="text-center px-3 py-2 font-medium">
                            Nivel
                          </th>
                          <th className="text-right px-3 py-2 font-medium">
                            Riesgo
                          </th>
                          <th className="text-left px-3 py-2 font-medium hidden md:table-cell">
                            Motivos
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {riskByUser.map((u) => {
                          const badgeClass =
                            u.level === "high"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                              : u.level === "medium"
                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";

                          const levelLabel =
                            u.level === "high"
                              ? "Alto"
                              : u.level === "medium"
                                ? "Medio"
                                : "Bajo";

                          return (
                            <tr
                              key={u.user_id}
                              className="text-gray-700 dark:text-gray-300"
                            >
                              <td className="px-3 py-2 font-medium">
                                {u.user_name}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${badgeClass}`}
                                >
                                  {levelLabel}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums font-semibold">
                                {u.risk_score}
                              </td>
                              <td className="px-3 py-2 hidden md:table-cell text-xs text-gray-500 dark:text-gray-400">
                                {u.reasons.length > 0
                                  ? u.reasons.join("; ")
                                  : "Sin alertas relevantes"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : /* Raw responses tab */
          responseMap.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No hay datos disponibles
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {responseMap.map(([responseId, rows]) => {
                const first = rows[0];
                const isExpanded = expandedResponse === responseId;
                return (
                  <div key={responseId}>
                    <button
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedResponse(null);
                          return;
                        }
                        setExpandedResponse(responseId);
                        void loadResponseDetail(responseId);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                          #{responseId}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {first.user_name?.trim() ||
                            first.user_email?.trim() ||
                            `Usuario ${first.user_id}`}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {rows.length} preg.
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {first.completed_at && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(
                              parseISO(first.completed_at),
                              "dd MMM yyyy HH:mm",
                              {
                                locale: es,
                              },
                            )}
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="bg-gray-50 dark:bg-gray-800/40 px-4 pb-3">
                        {loadingResponseId === responseId &&
                        !responseDetails[responseId] ? (
                          <div className="py-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Cargando metadatos...
                          </div>
                        ) : (
                          <div className="grid gap-3 mt-3 mb-3">
                            {renderMetaSection(
                              "Metadatos de Captura",
                              responseDetails[responseId]?.capture_meta,
                            )}
                            {renderMetaSection(
                              "Ubicación",
                              responseDetails[responseId]?.location,
                            )}
                            {renderMetaSection(
                              "Dispositivo",
                              responseDetails[responseId]?.device_info,
                            )}
                          </div>
                        )}
                        <table className="w-full text-xs mt-2">
                          <thead>
                            <tr className="text-gray-500 dark:text-gray-400">
                              <th className="text-left py-1 pr-4 font-medium w-1/2">
                                Pregunta
                              </th>
                              <th className="text-left py-1 font-medium">
                                Respuesta
                              </th>
                              <th className="text-left py-1 pl-4 font-medium w-1/3">
                                Metadatos
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {rows
                              .sort(
                                (a, b) => a.question_order - b.question_order,
                              )
                              .map((r) => (
                                <tr key={r.question_id}>
                                  <td className="py-1.5 pr-4 text-gray-700 dark:text-gray-300 align-top">
                                    {r.question_text}
                                  </td>
                                  <td className="py-1.5 text-gray-900 dark:text-white align-top font-medium">
                                    {answerToString(r.answer_value) || "—"}
                                  </td>
                                  <td className="py-1.5 pl-4 align-top">
                                    {responseDetails[responseId]?.answers?.find(
                                      (answer) =>
                                        answer.question_id === r.question_id,
                                    )?.answer_meta ? (
                                      <pre className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words font-mono rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2">
                                        {formatMetaValue(
                                          responseDetails[
                                            responseId
                                          ]?.answers?.find(
                                            (answer) =>
                                              answer.question_id ===
                                              r.question_id,
                                          )?.answer_meta,
                                        )}
                                      </pre>
                                    ) : (
                                      <span className="text-gray-400 dark:text-gray-500">
                                        —
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
