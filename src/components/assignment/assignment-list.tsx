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
  FileText,
  ChevronDown,
  ChevronUp,
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
  active: {
    label: "Activo",
    className: "bg-green-100 text-green-800",
    Icon: CheckCircle,
  },
  inactive: {
    label: "Inactivo",
    className: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
    Icon: Clock,
  },
};

const ROLE_LABELS: Record<string, { label: string; className: string }> = {
  brigadista: {
    label: "Brigadista",
    className: "bg-purple-100 text-purple-700",
  },
  encargado: { label: "Encargado", className: "bg-indigo-100 text-indigo-700" },
  admin: {
    label: "Admin",
    className: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  },
};

function RoleBadge({ role }: { role?: string }) {
  const cfg = ROLE_LABELS[role ?? ""] ?? {
    label: role ?? "—",
    className: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  };
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: AssignmentStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.active;
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
    ["active", "inactive"] as AssignmentStatus[]
  ).filter((s) => s !== assignment.status);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1">
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
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  Marcar como {cfg.label}
                </button>
              );
            })}
            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
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

function NotesRow({ notes }: { notes: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <tr className="bg-amber-50 border-b border-amber-100">
      <td colSpan={7} className="px-6 py-2">
        <div
          className="flex items-start gap-2 text-sm text-amber-800 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <FileText className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
          <span className={expanded ? "" : "line-clamp-1"}>{notes}</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 ml-auto flex-shrink-0 text-amber-400" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-auto flex-shrink-0 text-amber-400" />
          )}
        </div>
      </td>
    </tr>
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
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">
          Cargando asignaciones...
        </p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
        <ClipboardList className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          Sin asignaciones
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Crea la primera asignación con el botón de arriba.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* ── Mobile card list (hidden on sm+) ── */}
      <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {assignments.map((a) => (
          <div key={a.id} className="p-4 space-y-2.5">
            {/* Survey title — full, never truncated */}
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
              {a.survey?.title ?? `Encuesta #${a.survey_id}`}
            </p>
            {/* User + status */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                  {a.user?.full_name ? (
                    a.user.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {a.user?.full_name ?? `Usuario #${a.user_id}`}
                  </p>
                  <RoleBadge role={a.user?.role} />
                </div>
              </div>
              <StatusBadge status={a.status} />
            </div>
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              {a.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  {a.location}
                </span>
              )}
              <span>
                {format(new Date(a.created_at), "d MMM yyyy", { locale: es })}
              </span>
            </div>
            {/* Notes */}
            {a.notes && (
              <div className="flex items-start gap-1.5 bg-amber-50 rounded-md p-2 text-xs text-amber-800">
                <FileText className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                <span>{a.notes}</span>
              </div>
            )}
            {/* Actions */}
            <div className="flex justify-end pt-1">
              <ActionsMenu
                assignment={a}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop table (hidden below sm) ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/40">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Usuario asignado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Encuesta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Zona
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Asignada por
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {assignments.map((a) => (
              <>
                <tr
                  key={a.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {/* Usuario asignado */}
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
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {a.user?.full_name ?? `Usuario #${a.user_id}`}
                          </p>
                          <RoleBadge role={a.user?.role} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {a.user?.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Encuesta */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
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
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        {a.location}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                        Sin zona
                      </span>
                    )}
                  </td>

                  {/* Asignada por */}
                  <td className="px-6 py-4">
                    {a.assigned_by_user ? (
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {a.assigned_by_user.full_name}
                        </p>
                        <RoleBadge role={a.assigned_by_user.role} />
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                        —
                      </span>
                    )}
                  </td>

                  {/* Fecha */}
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(a.created_at), "d MMM yyyy", {
                      locale: es,
                    })}
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
                {/* Notes sub-row */}
                {a.notes && <NotesRow key={`notes-${a.id}`} notes={a.notes} />}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
