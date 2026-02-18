"use client";

import { useEffect, useState } from "react";
import { useWhitelistStore } from "@/store/whitelist-store";
import { useActivationCodeStore } from "@/store/activation-code-store";
import { activationCodeService } from "@/lib/api/activation-code.service";
import { Card } from "@/components/ui/card";
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
  Users,
  CheckCircle2,
  Clock,
  Shield,
  Mail,
  Eye,
  RefreshCw,
  Trash2,
  Clock4,
  Ban,
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
    searchTerm,
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

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [entries]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
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
      const entry = entries.find((e) => e.id === whitelistId);
      if (!entry?.has_active_code) return;

      // Fetch codes to find the active one for this whitelist entry
      const codesResponse = await activationCodeService.list({
        whitelist_id: whitelistId,
        status: "active",
      });
      if (codesResponse.items.length === 0) {
        throw new Error("No active code found");
      }

      const activeCodeId = codesResponse.items[0].id;
      await useActivationCodeStore.getState().extendCode(activeCodeId, 24);
      await fetchEntries();
    } catch (error) {
      console.error("Failed to extend code:", error);
    }
  };

  const handleResendEmail = async (whitelistId: number) => {
    try {
      // Fetch codes to find the active one for this whitelist entry
      const codesResponse = await activationCodeService.list({
        whitelist_id: whitelistId,
        status: "active",
      });
      if (codesResponse.items.length === 0) {
        throw new Error("No active code found");
      }

      const activeCodeId = codesResponse.items[0].id;
      await useActivationCodeStore.getState().resendEmail(activeCodeId);
      await fetchEntries();
    } catch (error) {
      console.error("Failed to resend email:", error);
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
      <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white dark:bg-gray-900 p-6 shadow-sm backdrop-blur">
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-primary-500/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-20 w-20 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Pre-autorizaciones
            </p>
            <h1 className="font-display text-3xl font-semibold text-gray-900 dark:text-white">
              Whitelist de usuarios
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Registra usuarios y genera codigos de activacion seguros.
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar usuario y codigo
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Total entradas
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {stats.total_entries}
                </p>
              </div>
              <div className="rounded-full bg-primary-100 p-3 text-primary-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Activados
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {stats.activated}
                </p>
              </div>
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Pendientes
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {stats.pending}
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Con codigo activo
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {stats.with_active_codes}
                </p>
              </div>
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 text-slate-700 dark:text-slate-300">
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters & Search */}
      <Card>
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
      </Card>

      {/* Whitelist Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identificador</TableHead>
              <TableHead>Nombre completo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Codigo</TableHead>
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
                  <TableCell>
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
                <TableRow key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
                  <TableCell>
                    {entry.has_active_code ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        Codigo activo
                      </span>
                    ) : entry.is_activated ? (
                      <span className="text-xs text-gray-500 dark:text-gray-400">N/A</span>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">Sin codigo</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {!entry.is_activated && !entry.has_active_code && (
                        <Button
                          size="sm"
                          onClick={() => handleGenerateCode(entry.id)}
                          title="Generar código de activación"
                        >
                          <Mail className="mr-1 h-3 w-3" />
                          Generar
                        </Button>
                      )}
                      {entry.has_active_code && !entry.is_activated && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendEmail(entry.id)}
                            title="Reenviar código por email"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
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
      </Card>

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
