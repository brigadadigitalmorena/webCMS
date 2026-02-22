import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { ExportRow, SurveySummary } from "./types";

export function answerToString(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function downloadCsv(csv: string, filename: string): void {
  // \uFEFF = UTF-8 BOM so Excel opens accents correctly
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** One row per survey — high-level overview export */
export function exportSummaryCSV(summaries: SurveySummary[]): void {
  const headers = ["ID", "Encuesta", "Estado", "Respuestas", "Última Respuesta"];
  const rows = summaries.map((s) => [
    s.survey_id,
    `"${s.survey_title.replace(/"/g, '""')}"`,
    s.is_active ? "Activa" : "Inactiva",
    s.total_responses,
    s.last_response_at
      ? format(parseISO(s.last_response_at), "dd/MM/yyyy HH:mm", { locale: es })
      : "Sin respuestas",
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  downloadCsv(csv, `reporte-encuestas-${format(new Date(), "yyyy-MM-dd")}.csv`);
}

/** Full granular export — one row per question answer */
export function exportDetailedCSV(rows: ExportRow[], surveyTitle: string): void {
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

  const csv = [headers.join(","), ...data].join("\n");
  downloadCsv(
    csv,
    `respuestas-${slugify(surveyTitle)}-${format(new Date(), "yyyy-MM-dd")}.csv`,
  );
}
