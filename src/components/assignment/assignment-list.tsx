"use client";

import { Assignment, AssignmentStatus } from "@/types";
import {
  MoreVertical,
  CheckCircle,
  Clock,
  PlayCircle,
  Trash2,
  User,
  ClipboardList,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AssignmentListProps {
  assignments: Assignment[];
  onUpdateStatus: (id: number, status: AssignmentStatus) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

const statusConfig: Record<
  AssignmentStatus,
  { label: string; className: string; Icon: any }
> = {
  pending: {
    label: "Pendiente",
    className: "bg-yellow-100 text-yellow-800",
    Icon: Clock,
  },
  in_progress: {
    label: "En progreso",
    className: "bg-blue-100 text-blue-800",
    Icon: PlayCircle,
  },
  completed: {
    label: "Completada",
    className: "bg-green-100 text-green-800",
    Icon: CheckCircle,
  },
};

function StatusBadge({ status }: { status: AssignmentStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.pending;
  const { Icon } = cfg;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

function ActionsMenu({
  assignment,
  onUpdateStatus,
  onDelete,
}: {
  assignment: Assignment;
  onUpdateStatus: (id: number, status: AssignmentStatus) => void;
  onDelete: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);

  const nextStatuses: AssignmentStatus[] = (
    ["pending", "in_progress", "completed"] as AssignmentStatus[]
  ).filter((s) => s !== assignment.status);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
            {nextStatuses.map((s) => {
              const cfg = statusConfig[s];
              const { Icon } = cfg;
              return (
                <button
                  key={s}
                  onClick={() => {
                    onUpdateStatus(assignment.id, s);
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  Marcar como {cfg.label}
                </button>
              );
            })}
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={() => {
                onDelete(assignment.id);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function AssignmentList({
  assignments,
  onUpdateStatus,
  onDelete,
  isLoading,
}: AssignmentListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-gray-500">Cargando asignaciones...</p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <ClipboardList className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Sin asignaciones
        </h3>
        <p className="text-gray-500">
          Crea la primera asignación con el botón de arriba.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Brigadista
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Encuesta
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Zona / Ubicación
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asignada
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {assignments.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50 transition-colors">
              {/* Brigadista */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {a.user?.full_name ? (
                      a.user.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {a.user?.full_name ?? `Usuario #${a.user_id}`}
                    </p>
                    <p className="text-xs text-gray-500">{a.user?.email}</p>
                  </div>
                </div>
              </td>

              {/* Encuesta */}
              <td className="px-6 py-4">
                <p className="text-sm text-gray-900 font-medium">
                  {a.survey?.title ?? `Encuesta #${a.survey_id}`}
                </p>
              </td>

              {/* Estado */}
              <td className="px-6 py-4">
                <StatusBadge status={a.status} />
              </td>

              {/* Zona */}
              <td className="px-6 py-4">
                {a.location ? (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    {a.location}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">Sin zona</span>
                )}
              </td>

              {/* Fecha */}
              <td className="px-6 py-4 text-sm text-gray-500">
                {format(new Date(a.created_at), "d MMM yyyy", { locale: es })}
              </td>

              {/* Acciones */}
              <td className="px-6 py-4 text-right">
                <ActionsMenu
                  assignment={a}
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
