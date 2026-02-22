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
  Activity,
  Target,
  AlertTriangle,
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
  CartesianGrid,
} from "recharts";
import { KpiCard } from "./_components/kpi-card";
import { SurveyDetailModal } from "./_components/survey-detail-modal";
import { exportSummaryCSV } from "./_lib/export";
import type { SurveySummary, ExportRow, TimelinePoint } from "./_lib/types";

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

  // Detail modal state
  const detailModal = useDisclosure<SurveySummary>();
  const [exportRows, setExportRows] = useState<ExportRow[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

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
      // non-fatal — modal shows empty state
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ── Derived strategic metrics ──────────────────────────────────────────────
  const all = summaries ?? [];
  const totalResponses = all.reduce((s, r) => s + r.total_responses, 0);
  const totalSurveys = all.length;
  const surveysWithResponses = all.filter((s) => s.total_responses > 0).length;
  const activeSurveys = all.filter((s) => s.is_active).length;
  const surveysNoActivity = totalSurveys - surveysWithResponses;
  const completionRate =
    totalSurveys > 0
      ? Math.round((surveysWithResponses / totalSurveys) * 100)
      : 0;
  const avgPerActive =
    activeSurveys > 0 ? (totalResponses / activeSurveys).toFixed(1) : "—";
  const topSurvey =
    all.length > 0
      ? all.reduce((a, b) => (a.total_responses > b.total_responses ? a : b))
      : null;

  // ── Bar chart ──────────────────────────────────────────────────────────────
  const chartData = all
    .filter((s) => s.total_responses > 0)
    .sort((a, b) => b.total_responses - a.total_responses)
    .slice(0, 10)
    .map((s) => ({
      name:
        s.survey_title.length > 22
          ? s.survey_title.slice(0, 22) + "…"
          : s.survey_title,
      respuestas: s.total_responses,
    }));

  if (isChecking) return null;

  return (
    <AdminGuard>
      <div className="space-y-6 p-6">
        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Reportes Estratégicos
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Análisis de participación y respuestas por encuesta
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              title="Desde"
            />
            <span className="text-gray-400 dark:text-gray-500 text-sm">–</span>
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
                className="p-1 rounded text-gray-400 hover:text-gray-600"
                title="Limpiar filtro"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button
              onClick={() => exportSummaryCSV(all)}
              disabled={all.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* ── KPI Row 1: volume ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            icon={TrendingUp}
            label="Total de Respuestas"
            value={isLoading ? "—" : totalResponses.toLocaleString()}
            color="text-blue-600"
            bg="bg-blue-50 dark:bg-blue-900/20"
          />
          <KpiCard
            icon={ClipboardCheck}
            label="Encuestas con Datos"
            value={
              isLoading ? "—" : `${surveysWithResponses} / ${totalSurveys}`
            }
            sub="encuestas respondidas"
            color="text-emerald-600"
            bg="bg-emerald-50 dark:bg-emerald-900/20"
          />
          <KpiCard
            icon={BarChart3}
            label="Encuestas Activas"
            value={isLoading ? "—" : activeSurveys.toString()}
            sub={`de ${totalSurveys} en total`}
            color="text-purple-600"
            bg="bg-purple-50 dark:bg-purple-900/20"
          />
        </div>

        {/* ── KPI Row 2: strategic ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            icon={Target}
            label="Tasa de Participación"
            value={isLoading ? "—" : `${completionRate}%`}
            sub="encuestas con ≥1 respuesta"
            color="text-indigo-600"
            bg="bg-indigo-50 dark:bg-indigo-900/20"
            trend={
              completionRate >= 70
                ? "up"
                : completionRate < 40
                  ? "down"
                  : "neutral"
            }
          />
          <KpiCard
            icon={Activity}
            label="Prom. por Enc. Activa"
            value={isLoading ? "—" : String(avgPerActive)}
            sub="respuestas promedio"
            color="text-cyan-600"
            bg="bg-cyan-50 dark:bg-cyan-900/20"
          />
          <KpiCard
            icon={AlertTriangle}
            label="Sin Actividad"
            value={isLoading ? "—" : surveysNoActivity.toString()}
            sub="encuestas sin respuestas"
            color={surveysNoActivity > 0 ? "text-amber-600" : "text-gray-400"}
            bg={
              surveysNoActivity > 0
                ? "bg-amber-50 dark:bg-amber-900/20"
                : "bg-gray-50 dark:bg-gray-800"
            }
            trend={surveysNoActivity > 0 ? "down" : "neutral"}
          />
        </div>

        {/* ── Top survey callout ────────────────────────────────────────────── */}
        {!isLoading && topSurvey && topSurvey.total_responses > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 p-4 flex items-center gap-4">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg shrink-0">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wide">
                Encuesta Más Activa
              </p>
              <p className="font-bold text-gray-900 dark:text-white truncate">
                {topSurvey.survey_title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {topSurvey.total_responses.toLocaleString()} respuestas
                {topSurvey.last_response_at &&
                  ` · Última: ${format(parseISO(topSurvey.last_response_at), "dd MMM yyyy", { locale: es })}`}
              </p>
            </div>
            <button
              onClick={() => handleOpenSurvey(topSurvey)}
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Analizar
            </button>
          </div>
        )}

        {/* ── Bar chart ─────────────────────────────────────────────────────── */}
        {!isLoading && chartData.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Top 10 — Respuestas por Encuesta
            </h2>
            <ResponsiveContainer width="100%" height={240}>
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
                    backgroundColor: "var(--color-bg,#fff)",
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

        {/* ── Survey table ──────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Detalle por Encuesta
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Clic en <Eye className="inline w-3 h-3 mx-0.5" /> para ver
              análisis detallado y exportar CSV.
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
          ) : all.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              {summaries === undefined
                ? "No hay encuestas registradas"
                : "Sin resultados para el período seleccionado"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/40">
                    <th className="text-left px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                      Encuesta
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                      Estado
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                      Respuestas
                    </th>
                    <th className="hidden sm:table-cell text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                      Última Resp.
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                      Análisis
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {all.map((s) => (
                    <tr
                      key={s.survey_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                        {s.survey_title}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {s.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">
                            <XCircle className="w-3 h-3" /> Inactiva
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums text-gray-900 dark:text-white">
                        {s.total_responses > 0 ? (
                          s.total_responses.toLocaleString()
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 font-normal">
                            —
                          </span>
                        )}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-4 text-right text-gray-400 dark:text-gray-500 text-xs">
                        {s.last_response_at
                          ? format(
                              parseISO(s.last_response_at),
                              "dd MMM yyyy",
                              {
                                locale: es,
                              },
                            )
                          : "—"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleOpenSurvey(s)}
                          disabled={s.total_responses === 0}
                          title={
                            s.total_responses === 0
                              ? "Sin respuestas"
                              : "Ver análisis"
                          }
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
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
