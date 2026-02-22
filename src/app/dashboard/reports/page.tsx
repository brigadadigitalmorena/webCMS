"use client";

import { useState } from "react";
import { useAsync } from "@/hooks/use-async";
import { useDisclosure } from "@/hooks/use-disclosure";
import { AdminGuard } from "@/components/auth/admin-guard";
import { useRequireAuth } from "@/hooks/use-auth";
import {
  BarChart3,
  FileDown,
  RefreshCw,
  TrendingUp,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  Eye,
  X,
  Download,
} from "lucide-react";
import apiClient from "@/lib/api/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

interface SurveySummary {
  survey_id: number;
  survey_title: string;
  is_active: boolean;
  total_responses: number;
  last_response_at: string | null;
}

interface ExportRow {
  survey_id: number;
  survey_title: string;
  response_id: number;
  user_id: number;
  client_id: string;
  completed_at: string | null;
  started_at: string | null;
  location: Record<string, unknown> | null;
  question_id: number;
  question_text: string;
  question_type: string;
  question_order: number;
  answer_value: unknown;
  media_url: string | null;
  answered_at: string | null;
}

interface TimelinePoint {
  date: string;
  count: number;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function answerToString(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function exportToCSV(rows: ExportRow[], surveyTitle: string) {
  const headers = [
    "response_id",
    "user_id",
    "pregunta",
    "tipo_pregunta",
    "respuesta",
    "fecha_completado",
    "ubicación_lat",
    "ubicación_lng",
  ];

  const data = rows.map((r) => {
    const lat =
      r.location && typeof r.location === "object" && "lat" in r.location
        ? String((r.location as { lat: number }).lat)
        : "";
    const lng =
      r.location && typeof r.location === "object" && "lng" in r.location
        ? String((r.location as { lng: number }).lng)
        : "";
    return [
      r.response_id,
      r.user_id,
      `"${r.question_text.replace(/"/g, '""')}"`,
      r.question_type,
      `"${answerToString(r.answer_value).replace(/"/g, '""')}"`,
      r.completed_at
        ? format(parseISO(r.completed_at), "dd/MM/yyyy HH:mm", { locale: es })
        : "",
      lat,
      lng,
    ].join(",");
  });

  // \uFEFF = UTF-8 BOM so Excel opens accents correctly
  const csv = "\uFEFF" + [headers.join(","), ...data].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const slug = surveyTitle
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  a.download = `respuestas-${slug}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { isChecking } = useRequireAuth();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const {
    data: summaries,
    isLoading,
    error,
    refetch: handleRefresh,
  } = useAsync(async () => {
    const params: Record<string, string> = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    const res = await apiClient.get<SurveySummary[]>(
      "/admin/responses/summary",
      { params },
    );
    return res.data;
  }, [dateFrom, dateTo]);

  // Detail modal
  const detailModal = useDisclosure<SurveySummary>();
  const [exportRows, setExportRows] = useState<ExportRow[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Summary CSV (one row per survey)
  const handleExportSummaryCSV = () => {
    if (!summaries?.length) return;
    const headers = [
      "ID",
      "Encuesta",
      "Estado",
      "Respuestas",
      "Última Respuesta",
    ];
    const rows = summaries.map((s) => [
      s.survey_id,
      `"${s.survey_title.replace(/"/g, '""')}"`,
      s.is_active ? "Activa" : "Inactiva",
      s.total_responses,
      s.last_response_at
        ? format(parseISO(s.last_response_at), "dd/MM/yyyy HH:mm", {
            locale: es,
          })
        : "Sin respuestas",
    ]);
    const csv =
      "\uFEFF" + [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-encuestas-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenSurvey = async (survey: SurveySummary) => {
    if (survey.total_responses === 0) return;
    detailModal.open(survey);
    setIsLoadingDetail(true);
    setExportRows([]);
    setTimeline([]);
    try {
      const [exportRes, timelineRes] = await Promise.all([
        apiClient.get<ExportRow[]>(
          `/admin/responses/survey/${survey.survey_id}/export`,
        ),
        apiClient.get<TimelinePoint[]>(
          `/admin/responses/survey/${survey.survey_id}/timeline`,
        ),
      ]);
      setExportRows(exportRes.data);
      setTimeline(timelineRes.data);
    } catch {
      // non-fatal, show empty
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Server-side filtering via date_from/date_to — useAsync already applies filters
  const filteredSummaries = summaries ?? [];

  const totalResponses = filteredSummaries.reduce(
    (s, r) => s + r.total_responses,
    0,
  );
  const surveysWithResponses = filteredSummaries.filter(
    (s) => s.total_responses > 0,
  ).length;
  const activeSurveys = filteredSummaries.filter((s) => s.is_active).length;

  // Chart data for overview bar chart
  const chartData = filteredSummaries
    .filter((s) => s.total_responses > 0)
    .sort((a, b) => b.total_responses - a.total_responses)
    .slice(0, 10)
    .map((s) => ({
      name:
        s.survey_title.length > 20
          ? s.survey_title.slice(0, 20) + "…"
          : s.survey_title,
      respuestas: s.total_responses,
    }));

  if (isChecking) return null;

  return (
    <AdminGuard>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Reportes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Resumen de respuestas por encuesta
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Date range filter */}
            <div className="flex flex-wrap items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Desde"
              />
              <span className="text-gray-400 dark:text-gray-500 text-sm">
                –
              </span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Hasta"
              />
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="p-1 rounded text-gray-400 dark:text-gray-500 hover:text-gray-600"
                  title="Limpiar filtro"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
            <button
              onClick={handleExportSummaryCSV}
              disabled={filteredSummaries.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              Exportar Resumen
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <KpiCard
            icon={TrendingUp}
            label="Total de Respuestas"
            value={isLoading ? "--" : totalResponses.toLocaleString()}
            color="text-blue-600"
            bg="bg-blue-50 dark:bg-blue-900/20"
          />
          <KpiCard
            icon={ClipboardCheck}
            label="Encuestas con Respuestas"
            value={
              isLoading
                ? "--"
                : `${surveysWithResponses} / ${(summaries ?? []).length}`
            }
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <KpiCard
            icon={BarChart3}
            label="Encuestas Activas"
            value={isLoading ? "--" : activeSurveys.toString()}
            color="text-purple-600"
            bg="bg-purple-50"
          />
        </div>

        {/* Overview bar chart */}
        {!isLoading && chartData.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Respuestas por Encuesta (Top 10)
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 16, left: -10, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  allowDecimals={false}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-bg, #fff)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(v: number | undefined) =>
                    [v ?? 0, "Respuestas"] as [number, string]
                  }
                />
                <Bar
                  dataKey="respuestas"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Respuestas por Encuesta
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Haz clic en <Eye className="inline w-3 h-3 mx-0.5" /> para ver las
              respuestas detalladas y exportar CSV con todos los datos.
            </p>
          </div>

          {isLoading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto" />
                </div>
              ))}
            </div>
          ) : filteredSummaries.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              {(summaries ?? []).length === 0
                ? "No hay encuestas registradas aún"
                : "Sin resultados para el rango de fechas seleccionado"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/40">
                    <th className="text-left px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                      Encuesta
                    </th>
                    <th className="text-center px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                      Estado
                    </th>
                    <th className="text-right px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                      Respuestas
                    </th>
                    <th className="text-right px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                      Última Respuesta
                    </th>
                    <th className="text-center px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                      Detalles
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredSummaries.map((s) => (
                    <tr
                      key={s.survey_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {s.survey_title}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {s.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            <XCircle className="w-3 h-3" />
                            Inactiva
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-semibold ${
                            s.total_responses > 0
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {s.total_responses.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400">
                        {s.last_response_at ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {format(
                              parseISO(s.last_response_at),
                              "dd MMM yyyy",
                              { locale: es },
                            )}
                          </span>
                        ) : (
                          <span className="text-xs">Sin respuestas</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOpenSurvey(s)}
                          disabled={s.total_responses === 0}
                          title={
                            s.total_responses === 0
                              ? "Sin respuestas"
                              : "Ver detalles"
                          }
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {detailModal.isOpen && detailModal.data && (
        <SurveyDetailModal
          survey={detailModal.data}
          exportRows={exportRows}
          timeline={timeline}
          isLoading={isLoadingDetail}
          onClose={detailModal.close}
        />
      )}
    </AdminGuard>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Survey Detail Modal ───────────────────────────────────────────────────────

function SurveyDetailModal({
  survey,
  exportRows,
  timeline,
  isLoading,
  onClose,
}: {
  survey: SurveySummary;
  exportRows: ExportRow[];
  timeline: TimelinePoint[];
  isLoading: boolean;
  onClose: () => void;
}) {
  // Group rows by response_id to build a per-response view
  const responseMap = new Map<number, ExportRow[]>();
  for (const row of exportRows) {
    if (!responseMap.has(row.response_id)) {
      responseMap.set(row.response_id, []);
    }
    responseMap.get(row.response_id)!.push(row);
  }
  const responses = Array.from(responseMap.entries());

  const [expandedResponse, setExpandedResponse] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Modal header */}
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
              onClick={() => exportToCSV(exportRows, survey.survey_title)}
              disabled={exportRows.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Exportar CSV Detallado
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
            </div>
          ) : (
            <>
              {/* Timeline chart */}
              {timeline.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    Respuestas por Fecha
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
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

              {/* Response list */}
              {responses.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No hay datos de respuestas disponibles
                </p>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    Respuestas Detalladas
                  </h3>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {responses.map(([responseId, rows]) => {
                      const first = rows[0];
                      const isExpanded = expandedResponse === responseId;
                      return (
                        <div key={responseId}>
                          <button
                            onClick={() =>
                              setExpandedResponse(
                                isExpanded ? null : responseId,
                              )
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
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {rows.length} respuesta
                                {rows.length !== 1 ? "s" : ""}
                              </span>
                              {first.completed_at && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {format(
                                    parseISO(first.completed_at),
                                    "dd MMM yyyy HH:mm",
                                    { locale: es },
                                  )}
                                </span>
                              )}
                              <span className="text-gray-400 dark:text-gray-500">
                                {isExpanded ? "▲" : "▼"}
                              </span>
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
                                      (a, b) =>
                                        a.question_order - b.question_order,
                                    )
                                    .map((r) => (
                                      <tr key={r.question_id}>
                                        <td className="py-1.5 pr-4 text-gray-700 dark:text-gray-300 align-top">
                                          {r.question_text}
                                          <span className="ml-1 text-gray-400 dark:text-gray-500">
                                            ({r.question_type})
                                          </span>
                                        </td>
                                        <td className="py-1.5 text-gray-900 dark:text-white align-top font-medium">
                                          {answerToString(r.answer_value) ||
                                            "—"}
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
