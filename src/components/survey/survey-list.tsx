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
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay encuestas
        </h3>
        <p className="text-gray-500">
          Crea tu primera encuesta para comenzar a recopilar datos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Encuesta
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Versiones
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha de Creación
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {surveys.map((survey) => {
            const publishedVersion = survey.versions?.find(
              (v) => v.is_published,
            );
            const totalVersions = survey.versions?.length || 0;

            return (
              <tr
                key={survey.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onView(survey)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {survey.title}
                      </div>
                      {survey.description && (
                        <div className="text-sm text-gray-500">
                          {survey.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {totalVersions}{" "}
                    {totalVersions === 1 ? "versión" : "versiones"}
                  </div>
                  {publishedVersion && (
                    <div className="text-xs text-gray-500">
                      v{publishedVersion.version_number} publicada
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      survey.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {survey.is_active ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(survey.created_at), "dd MMM yyyy", {
                      locale: es,
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(
                          openMenuId === survey.id ? null : survey.id,
                        );
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {openMenuId === survey.id && (
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                        onMouseLeave={() => setOpenMenuId(null)}
                      >
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(survey);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(survey);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStatus(survey);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Power className="h-4 w-4 mr-2" />
                            {survey.is_active ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(survey);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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
  );
}
