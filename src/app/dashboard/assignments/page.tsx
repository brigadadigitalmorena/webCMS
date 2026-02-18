"use client";

import { useState, useEffect, useCallback } from "react";
import { Assignment, AssignmentStatus } from "@/types";
import { assignmentService } from "@/lib/api/assignment.service";
import AssignmentList from "@/components/assignment/assignment-list";
import CreateAssignmentModal from "@/components/assignment/create-assignment-modal";
import { Plus, Search, RefreshCw, ClipboardList } from "lucide-react";

const STATUS_OPTIONS: { value: AssignmentStatus | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En progreso" },
  { value: "completed", label: "Completada" },
];

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<AssignmentStatus | "">("");

  const loadAssignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await assignmentService.getAssignments(
        filterStatus ? { status: filterStatus } : undefined,
      );
      setAssignments(data);
    } catch (err) {
      console.error("Error loading assignments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleCreate = async (data: {
    user_id: number;
    survey_id: number;
    location?: string;
  }) => {
    setIsSaving(true);
    try {
      const created = await assignmentService.createAssignment(data);
      setAssignments((prev) => [created, ...prev]);
      setIsModalOpen(false);
      // Reload to get the enriched version with user/survey names
      loadAssignments();
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: AssignmentStatus) => {
    try {
      const updated = await assignmentService.updateAssignment(id, { status });
      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updated } : a)),
      );
    } catch (err) {
      console.error("Error updating assignment:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta asignación?")) return;
    try {
      await assignmentService.deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting assignment:", err);
    }
  };

  // Client-side search filter
  const filtered = assignments.filter((a) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.user?.full_name?.toLowerCase().includes(term) ||
      a.user?.email?.toLowerCase().includes(term) ||
      a.survey?.title?.toLowerCase().includes(term) ||
      a.location?.toLowerCase().includes(term)
    );
  });

  // Stats
  const stats = {
    total: assignments.length,
    pending: assignments.filter((a) => a.status === "pending").length,
    in_progress: assignments.filter((a) => a.status === "in_progress").length,
    completed: assignments.filter((a) => a.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asignaciones</h1>
          <p className="text-gray-500 mt-1">
            Gestiona qué encuestas trabaja cada brigadista
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          Nueva Asignación
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-gray-900" },
          {
            label: "Pendientes",
            value: stats.pending,
            color: "text-yellow-600",
          },
          {
            label: "En progreso",
            value: stats.in_progress,
            color: "text-blue-600",
          },
          {
            label: "Completadas",
            value: stats.completed,
            color: "text-green-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por brigadista, encuesta o zona..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as AssignmentStatus | "")
          }
          className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          onClick={loadAssignments}
          className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          title="Recargar"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Recargar</span>
        </button>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ClipboardList className="h-4 w-4" />
          {filtered.length === assignments.length
            ? `${assignments.length} asignaciones`
            : `${filtered.length} de ${assignments.length} asignaciones`}
        </div>
      )}

      {/* Table */}
      <AssignmentList
        assignments={filtered}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Create Modal */}
      <CreateAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={isSaving}
      />
    </div>
  );
}
