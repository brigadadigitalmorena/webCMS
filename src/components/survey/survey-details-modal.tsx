"use client";

import { useState } from "react";
import { Survey, SurveyVersion } from "@/types";
import {
  X,
  FileText,
  Calendar,
  User,
  BadgeCheck,
  CalendarRange,
  Clock,
  Users,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import SurveyVersions from "./survey-versions";
import SurveyPreviewModal from "./survey-preview-modal";

interface SurveyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: Survey | null;
  onPublish: (versionId: number) => void;
  isPublishing?: boolean;
}

export default function SurveyDetailsModal({
  isOpen,
  onClose,
  survey,
  onPublish,
  isPublishing = false,
}: SurveyDetailsModalProps) {
  const [previewVersion, setPreviewVersion] = useState<SurveyVersion | null>(
    null,
  );

  if (!isOpen || !survey) return null;

  const publishedVersion = survey.versions?.find((v) => v.is_published);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-lg max-w-4xl w-full max-h-[95dvh] sm:max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between p-4 sm:p-6 border-b">
            <div className="flex-1 min-w-0 pr-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">
                {survey.title}
              </h2>
              {survey.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {survey.description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 ml-4"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Info Cards */}
          <div className="p-4 sm:p-6 border-b bg-gray-50 dark:bg-gray-800/40">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {/* Estado */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Estado
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {survey.is_active ? "Activa" : "Inactiva"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Publicación */}
              <div
                className={`bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border ${publishedVersion ? "border-green-200" : "border-gray-200 dark:border-gray-700"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${publishedVersion ? "bg-green-100" : "bg-gray-100 dark:bg-gray-800"}`}
                  >
                    <BadgeCheck
                      className={`h-5 w-5 ${publishedVersion ? "text-green-600" : "text-gray-400 dark:text-gray-500"}`}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Publicación
                    </p>
                    <p
                      className={`font-semibold ${publishedVersion ? "text-green-700" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {publishedVersion
                        ? `v${publishedVersion.version_number} publicada`
                        : "Sin publicar"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vigencia */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    <CalendarRange className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Vigencia
                    </p>
                    {survey.starts_at || survey.ends_at ? (
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {survey.starts_at && (
                          <div>
                            Inicio:{" "}
                            {format(new Date(survey.starts_at), "dd MMM yyyy", {
                              locale: es,
                            })}
                          </div>
                        )}
                        {survey.ends_at && (
                          <div
                            className={
                              new Date(survey.ends_at) < new Date()
                                ? "text-red-600"
                                : ""
                            }
                          >
                            Cierre:{" "}
                            {format(new Date(survey.ends_at), "dd MMM yyyy", {
                              locale: es,
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="font-semibold text-gray-400 dark:text-gray-500">
                        Sin límite
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Creada */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Creada
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {format(new Date(survey.created_at), "dd MMM yyyy", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Duración estimada */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg flex-shrink-0">
                    <Clock className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Duración estimada
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {survey.estimated_duration_minutes
                        ? `${survey.estimated_duration_minutes} min`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Máx. respuestas */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Máx. respuestas
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {survey.max_responses
                        ? survey.max_responses.toLocaleString()
                        : "Sin límite"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Anónimo */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`p-2 rounded-lg ${survey.allow_anonymous ? "bg-yellow-100" : "bg-gray-100 dark:bg-gray-800"}`}
                  >
                    <UserCheck
                      className={`h-5 w-5 ${survey.allow_anonymous ? "text-yellow-600" : "text-gray-400 dark:text-gray-500"}`}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Respuestas anónimas
                    </p>
                    <p
                      className={`font-semibold ${survey.allow_anonymous ? "text-yellow-700" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {survey.allow_anonymous ? "Permitidas" : "No permitidas"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Versions Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <SurveyVersions
              survey={survey}
              onPublish={onPublish}
              onPreview={setPreviewVersion}
              isPublishing={isPublishing}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 dark:bg-gray-800/40">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <SurveyPreviewModal
        isOpen={previewVersion !== null}
        onClose={() => setPreviewVersion(null)}
        version={previewVersion}
        surveyTitle={survey.title}
        surveyDescription={survey.description}
      />
    </>
  );
}
