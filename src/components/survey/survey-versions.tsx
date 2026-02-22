"use client";

import { useState } from "react";
import { Survey, SurveyVersion } from "@/types";
import {
  CheckCircle,
  Clock,
  Eye,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SurveyVersionsProps {
  survey: Survey;
  onPublish: (versionId: number) => void;
  onPreview: (version: SurveyVersion) => void;
  isPublishing?: boolean;
}

export default function SurveyVersions({
  survey,
  onPublish,
  onPreview,
  isPublishing = false,
}: SurveyVersionsProps) {
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(
    new Set(),
  );

  if (!survey.versions || survey.versions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8 text-center">
        <Clock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No hay versiones
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Esta encuesta aún no tiene versiones creadas.
        </p>
      </div>
    );
  }

  const toggleVersion = (versionId: number) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  // Sort versions by version number descending (newest first)
  const sortedVersions = [...survey.versions].sort(
    (a, b) => b.version_number - a.version_number,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Historial de Versiones
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {survey.versions.length}{" "}
          {survey.versions.length === 1 ? "versión" : "versiones"}
        </span>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {sortedVersions.map((version) => {
          const isExpanded = expandedVersions.has(version.id);

          return (
            <div
              key={version.id}
              className={`border rounded-lg overflow-hidden transition-all ${
                version.is_published
                  ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              }`}
            >
              {/* Version Header */}
              <div className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {version.is_published ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Versión {version.version_number}
                        </h4>
                        {version.is_published && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400">
                            Publicada
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div>
                          Creada el{" "}
                          {format(
                            new Date(version.created_at),
                            "dd MMM yyyy HH:mm",
                            {
                              locale: es,
                            },
                          )}
                        </div>
                        <div>
                          {version.questions.length}{" "}
                          {version.questions.length === 1
                            ? "pregunta"
                            : "preguntas"}
                        </div>
                      </div>

                      {version.change_summary && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                          "{version.change_summary}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onPreview(version)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title="Ver previa"
                    >
                      <Eye className="h-5 w-5" />
                    </button>

                    {!version.is_published && (
                      <button
                        onClick={() => onPublish(version.id)}
                        disabled={isPublishing}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Publicar versión"
                      >
                        <Send className="h-4 w-4" />
                        Publicar
                      </button>
                    )}

                    <button
                      onClick={() => toggleVersion(version.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title={isExpanded ? "Contraer" : "Expandir"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Questions List */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-3 sm:p-4">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Preguntas en esta versión:
                  </h5>
                  <div className="space-y-2">
                    {version.questions
                      .sort((a, b) => a.order - b.order)
                      .map((question, index) => (
                        <div
                          key={question.id}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">
                            {index + 1}.
                          </span>
                          <div className="flex-1">
                            <div className="text-gray-900 dark:text-white">
                              {question.question_text}
                              {question.is_required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                              Tipo:{" "}
                              {getQuestionTypeLabel(question.question_type)}
                            </div>
                            {question.options &&
                              question.options.length > 0 && (
                                <div className="mt-1 ml-4 space-y-0.5">
                                  {question.options.map((option) => (
                                    <div
                                      key={option.id}
                                      className="text-xs text-gray-600 dark:text-gray-400"
                                    >
                                      • {option.option_text}
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    text: "Texto",
    number: "Número",
    single_choice: "Selección Única",
    multiple_choice: "Selección Múltiple",
    date: "Fecha",
    location: "Ubicación",
    photo: "Foto",
    signature: "Firma",
  };
  return labels[type] || type;
}
