"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useWhitelistStore } from "@/store/whitelist-store";
import { useActivationCodeStore } from "@/store/activation-code-store";
import { activationCodeService } from "@/lib/api/activation-code.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import { CreateCodeModal } from "@/components/activation/create-code-modal";
import { CodeGeneratedModal } from "@/components/activation/code-generated-modal";
import {
  Plus,
  Search,
  Mail,
  RefreshCw,
  Trash2,
  Clock4,
  Download,
} from "lucide-react";

export default function WhitelistPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const {
    entries,
    stats,
    isLoading,
    error,
    statusFilter,
    roleFilter,
    currentPage,
    totalPages,
    totalItems,
    fetchEntries,
    fetchStats,
    setStatusFilter,
    setRoleFilter,
    setSearchTerm,
    setCurrentPage,
    clearError,
  } = useWhitelistStore();

  const { generateCode, showGeneratedCode, generatedCode, clearGeneratedCode } =
    useActivationCodeStore();

  // Auto-debounce search input — fires 300 ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      fetchEntries();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchStats();
  }, [entries]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    fetchEntries();
  };

  const exportWhitelistCSV = () => {
    if (entries.length === 0) return;
    const headers = [
      "ID",
      "Identificador",
      "Tipo",
      "Nombre completo",
      "Rol asignado",
      "Estado",
      "Codigo activo",
    ];
    const rows = entries.map((e) => [
      e.id,
      e.identifier,
      e.identifier_type,
      `"${(e.full_name || "").replace(/"/g, '""')}"`,
      e.assigned_role,
      e.is_activated ? "Activado" : "Pendiente",
      e.has_active_code ? "S\u00ed" : "No",
    ]);
    const csv =
      "\uFEFF" + [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whitelist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateCode = async (whitelistId: number) => {
    try {
      await generateCode({
        whitelist_id: whitelistId,
        expires_in_hours: 72,
        send_email: true,
      });
      // Refresh entries to update has_active_code status
      await fetchEntries();
    } catch (error) {
      console.error("Failed to generate code:", error);
    }
  };

  const handleExtendCode = async (whitelistId: number) => {
    try {
      // Fetch codes by whitelist_id only (no status filter) so we find
      // codes that may be expired/locked but not yet used or revoked.
      const codesResponse = await activationCodeService.list({
        whitelist_id: whitelistId,
      });
      const usableCode = codesResponse.items.find(
        (c) => c.status !== "used" && c.status !== "revoked",
      );
      if (!usableCode) {
        toast.warning(
          "No se encontró un código válido para extender. Genera un nuevo código.",
        );
        return;
      }

      await useActivationCodeStore.getState().extendCode(usableCode.id, 24);
      await fetchEntries();
    } catch (error) {
      console.error("Failed to extend code:", error);
      toast.error("Error al extender el código. Intenta de nuevo.");
    }
  };

  const handleResendEmail = async (whitelistId: number) => {
    try {
      // Fetch codes by whitelist_id only (no status filter) so we find
      // codes that may be expired/locked but not yet used or revoked.
      // The resend endpoint regenerates the code regardless of current status.
      const codesResponse = await activationCodeService.list({
        whitelist_id: whitelistId,
      });
      const usableCode = codesResponse.items.find(
        (c) => c.status !== "used" && c.status !== "revoked",
      );
      if (!usableCode) {
        toast.warning(
          "No se encontró un código válido para reenviar. Genera un nuevo código.",
        );
        return;
      }

      await useActivationCodeStore.getState().resendEmail(usableCode.id);
      await fetchEntries();
    } catch (error) {
      console.error("Failed to resend email:", error);
      toast.error("Error al reenviar el correo. Intenta de nuevo.");
    }
  };

  const handleDeleteEntry = async (whitelistId: number) => {
    if (!confirm("¿Estás seguro de eliminar esta invitación?")) return;

    try {
      await useWhitelistStore.getState().deleteEntry(whitelistId);
      await fetchEntries();
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Whitelist de usuarios
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Registra usuarios y genera codigos de activacion seguros.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchEntries()}
            disabled={isLoading}
            className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 transition-colors"
            title="Recargar"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={exportWhitelistCSV}
            disabled={entries.length === 0}
            className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-40"
            title="Exportar CSV"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Plus className="h-5 w-5" />
            Agregar usuario
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
          <span className="text-sm text-red-700 dark:text-red-300">
            {error}
          </span>
          <button
            onClick={clearError}
            className="text-red-700 dark:text-red-300 hover:text-red-900 ml-4 text-lg leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total entradas
            </p>
            <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
              {stats.total_entries}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Activados
            </p>
            <p className="text-3xl font-bold mt-1 text-green-600">
              {stats.activated}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pendientes
            </p>
            <p className="text-3xl font-bold mt-1 text-amber-600">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Con codigo activo
            </p>
            <p className="text-3xl font-bold mt-1 text-indigo-600">
              {stats.with_active_codes}
            </p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "pending" | "activated")
            }
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="activated">Activados</option>
          </Select>

          <Select
            value={roleFilter || "all"}
            onChange={(e) =>
              setRoleFilter(e.target.value === "all" ? null : e.target.value)
            }
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="encargado">Encargado</option>
            <option value="brigadista">Brigadista</option>
          </Select>
        </div>
      </div>

      {/* Whitelist Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identificador</TableHead>
              <TableHead>Nombre completo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden sm:table-cell">Codigo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-32" />
                  </TableCell>
                </TableRow>
              ))
            ) : entries.length === 0 ? (
              <TableEmpty
                message="No hay entradas en la whitelist"
                description="Agrega un usuario y genera su codigo de activacion."
              />
            ) : (
              entries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.identifier}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {entry.identifier_type}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {entry.full_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        entry.assigned_role === "admin"
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          : entry.assigned_role === "encargado"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {entry.assigned_role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        entry.is_activated
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {entry.is_activated ? "Activado" : "Pendiente"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {entry.has_active_code ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        Codigo activo
                      </span>
                    ) : entry.is_activated ? (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        N/A
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Sin codigo
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {!entry.is_activated && !entry.has_active_code && (
                        <Button
                          size="sm"
                          onClick={() => handleGenerateCode(entry.id)}
                          title="Generar código de activación"
                          className="px-2 sm:px-3"
                        >
                          <Mail className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Generar</span>
                        </Button>
                      )}
                      {entry.has_active_code && !entry.is_activated && (
                        <>
                          {entry.identifier_type === "email" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendEmail(entry.id)}
                              title="Reenviar código por email"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExtendCode(entry.id)}
                            title="Extender expiración del código"
                          >
                            <Clock4 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {!entry.is_activated && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                          title="Eliminar invitación"
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      )}
                      {entry.is_activated && (
                        <span className="text-xs text-emerald-600 font-medium px-2">
                          ✓ Activado
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={20}
          />
        )}
      </div>

      <CreateCodeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <CodeGeneratedModal
        isOpen={showGeneratedCode}
        code={generatedCode || ""}
        onClose={clearGeneratedCode}
      />
    </div>
  );
}
