"use client";

import { useState } from "react";
import { Survey } from "@/types";
import {
  Eye,
  Pencil,
  Trash2,
  Power,
  FileText,
  Calendar,
  MoreVertical,
  GitBranch,
  BadgeCheck,
  CalendarRange,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SurveyListProps {
  surveys: Survey[];
  onView: (survey: Survey) => void;
  onEdit: (survey: Survey) => void;
  onDelete: (survey: Survey) => void;
  onToggleStatus: (survey: Survey) => void;
}

export default function SurveyList({
  surveys,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: SurveyListProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  if (surveys.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No hay encuestas
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Crea tu primera encuesta para comenzar a recopilar datos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
      {/* ── Mobile card list (hidden on sm+) ── */}
      <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {surveys.map((survey) => {
          const publishedVersion = survey.versions?.find((v) => v.is_published);
          const latestVersion = survey.versions?.sort(
            (a, b) => b.version_number - a.version_number,
          )[0];
          const totalVersions = survey.versions?.length || 0;
          const hasDraft =
            latestVersion && !latestVersion.is_published && totalVersions > 1;

          return (
            <div key={survey.id} className="p-4">
              {/* Title row */}
              <button
                className="w-full text-left mb-2"
                onClick={() => onView(survey)}
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                  {survey.title}
                </p>
                {survey.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {survey.description}
                  </p>
                )}
              </button>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    survey.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {survey.is_active ? "Activa" : "Inactiva"}
                </span>
                {publishedVersion ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    <BadgeCheck className="h-3 w-3" />v
                    {publishedVersion.version_number} publicada
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700">
                    Sin publicar
                  </span>
                )}
                {hasDraft && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700">
                    borrador v{latestVersion!.version_number}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <GitBranch className="h-3 w-3" />
                  {totalVersions}{" "}
                  {totalVersions === 1 ? "versión" : "versiones"}
                </span>
              </div>

              {/* Actions row — always visible on mobile */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onView(survey)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ver
                </button>
                <button
                  onClick={() => onEdit(survey)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => onToggleStatus(survey)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                >
                  <Power className="h-3.5 w-3.5" />
                  {survey.is_active ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => onDelete(survey)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop table (hidden below sm) ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/40">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[28%]">
                Encuesta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[15%]">
                Versiones
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[17%]">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[22%] whitespace-nowrap">
                Vigencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%] whitespace-nowrap">
                Creada
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[8%]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {surveys.map((survey) => {
              const publishedVersion = survey.versions?.find(
                (v) => v.is_published,
              );
              const latestVersion = survey.versions?.sort(
                (a, b) => b.version_number - a.version_number,
              )[0];
              const totalVersions = survey.versions?.length || 0;
              const hasDraft =
                latestVersion &&
                !latestVersion.is_published &&
                totalVersions > 1;

              return (
                <tr
                  key={survey.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => onView(survey)}
                >
                  {/* ENCUESTA */}
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {survey.title}
                      </div>
                      {survey.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {survey.description}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* VERSIONES */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                      <GitBranch className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <span>
                        {totalVersions}{" "}
                        {totalVersions === 1 ? "versión" : "versiones"}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-col gap-1">
                      {publishedVersion && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                          <BadgeCheck className="h-3 w-3" />v
                          {publishedVersion.version_number} publicada
                        </span>
                      )}
                      {hasDraft && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          v{latestVersion!.version_number} borrador
                        </span>
                      )}
                      {totalVersions === 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          Sin versiones
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ESTADO */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`self-start px-2 py-0.5 text-xs font-semibold rounded-full ${
                          survey.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {survey.is_active ? "Activa" : "Inactiva"}
                      </span>
                      {publishedVersion ? (
                        <span className="self-start inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          <BadgeCheck className="h-3 w-3" />
                          Publicada
                        </span>
                      ) : (
                        <span className="self-start px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700">
                          Sin publicar
                        </span>
                      )}
                    </div>
                  </td>

                  {/* VIGENCIA */}
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {survey.starts_at || survey.ends_at ? (
                      <div className="flex items-start gap-1.5">
                        <CalendarRange className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                        <div>
                          {survey.starts_at && (
                            <div className="whitespace-nowrap">
                              Inicio:{" "}
                              {format(
                                new Date(survey.starts_at),
                                "dd MMM yyyy",
                                { locale: es },
                              )}
                            </div>
                          )}
                          {survey.ends_at && (
                            <div className="whitespace-nowrap">
                              Cierre:{" "}
                              <span
                                className={
                                  new Date(survey.ends_at) < new Date()
                                    ? "text-red-500 font-medium"
                                    : ""
                                }
                              >
                                {format(
                                  new Date(survey.ends_at),
                                  "dd MMM yyyy",
                                  { locale: es },
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic text-xs">
                        Sin límite
                      </span>
                    )}
                  </td>

                  {/* FECHA CREACIÓN */}
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      {format(new Date(survey.created_at), "dd MMM yy", {
                        locale: es,
                      })}
                    </div>
                  </td>

                  {/* ACCIONES */}
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === survey.id ? null : survey.id,
                          );
                        }}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>

                      {openMenuId === survey.id && (
                        <div
                          className="origin-top-right absolute right-0 mt-2 w-52 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 z-10"
                          onMouseLeave={() => setOpenMenuId(null)}
                        >
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(survey);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Ver versiones
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(survey);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Pencil className="h-4 w-4" />
                              <span>
                                Editar
                                <span className="block text-xs text-gray-400 dark:text-gray-500 leading-none mt-0.5">
                                  (crea nueva versión)
                                </span>
                              </span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleStatus(survey);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Power className="h-4 w-4" />
                              {survey.is_active ? "Desactivar" : "Activar"}
                            </button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(survey);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
