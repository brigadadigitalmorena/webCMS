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
import { exportDetailedCSV, answerToString } from "../_lib/export";
import type { SurveySummary, ExportRow, TimelinePoint } from "../_lib/types";

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
  const [activeTab, setActiveTab] = useState<"analytics" | "responses">(
    "analytics",
  );
  const [expandedResponse, setExpandedResponse] = useState<number | null>(null);

  const analytics = useMemo(() => buildAnalytics(exportRows), [exportRows]);

  // Group rows by response_id for the raw-responses tab
  const responseMap = useMemo(() => {
    const map = new Map<number, ExportRow[]>();
    for (const row of exportRows) {
      if (!map.has(row.response_id)) map.set(row.response_id, []);
      map.get(row.response_id)!.push(row);
    }
    return Array.from(map.entries());
  }, [exportRows]);

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
                        contentStyle={{
                          backgroundColor: "var(--color-bg,#fff)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
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
                      onClick={() =>
                        setExpandedResponse(isExpanded ? null : responseId)
                      }
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                          #{responseId}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Usuario {first.user_id}
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
                        <table className="w-full text-xs mt-2">
                          <thead>
                            <tr className="text-gray-500 dark:text-gray-400">
                              <th className="text-left py-1 pr-4 font-medium w-1/2">
                                Pregunta
                              </th>
                              <th className="text-left py-1 font-medium">
                                Respuesta
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
