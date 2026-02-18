"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { AdminGuard } from "@/components/auth/admin-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { CreateUserModal } from "@/components/users/create-user-modal";
import { userService } from "@/lib/api/user.service";
import type { User } from "@/types";
import { Search, UserPlus, RefreshCw, Download } from "lucide-react";

const PAGE_SIZE = 10;

function exportUsersCSV(users: User[]) {
  if (users.length === 0) return;
  const headers = [
    "ID",
    "Nombre",
    "Apellido",
    "Email",
    "Rol",
    "Estado",
    "Telefono",
    "Creado",
  ];
  const rows = users.map((u) => [
    u.id,
    `"${(u.nombre || "").replace(/"/g, '""')}"`,
    `"${(u.apellido || "").replace(/"/g, '""')}"`,
    u.email,
    u.rol,
    u.activo ? "Activo" : "Inactivo",
    u.telefono || "",
    new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(
      new Date(u.created_at),
    ),
  ]);
  const csv = "\uFEFF" + [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `usuarios-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function UsersPage() {
  const { isChecking } = useRequireAuth();
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [roleFilter, statusFilter, searchTerm, currentPage]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getUsersPaginated({
        page: currentPage,
        size: PAGE_SIZE,
        rol: roleFilter === "all" ? undefined : roleFilter,
        activo: statusFilter === "all" ? undefined : statusFilter === "active",
        search: searchTerm.trim() || undefined,
      });
      setUsers(response.items);
      setTotalItems(response.total);
    } catch (err: any) {
      setError(err.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const stats = {
    total: totalItems,
    active: users.filter((user) => user.activo).length,
    inactive: users.filter((user) => !user.activo).length,
    admins: users.filter((user) => user.rol === "admin").length,
  };

  const handleToggleActive = async (user: User) => {
    if (currentUser?.id === user.id && user.activo) {
      setError("No puedes desactivar tu propia cuenta");
      return;
    }
    try {
      const updated = await userService.toggleUserStatus(user.id, !user.activo);
      setUsers((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar el estado");
    }
  };

  if (isChecking) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Usuarios
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gestiona accesos, roles y estado de actividad del equipo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadUsers}
              disabled={loading}
              className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 transition-colors"
              title="Recargar"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => exportUsersCSV(users)}
              disabled={users.length === 0}
              className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-40"
              title="Exportar CSV"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <UserPlus className="h-5 w-5" />
              Invitar usuario
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="text-red-700 dark:text-red-300 hover:text-red-900 ml-4 text-lg leading-none"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total usuarios
            </p>
            <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Activos</p>
            <p className="text-3xl font-bold mt-1 text-green-600">
              {stats.active}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Inactivos
            </p>
            <p className="text-3xl font-bold mt-1 text-amber-600">
              {stats.inactive}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Administradores
            </p>
            <p className="text-3xl font-bold mt-1 text-indigo-600">
              {stats.admins}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar por nombre, email o telefono"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Admin</option>
                <option value="encargado">Encargado</option>
                <option value="brigadista">Brigadista</option>
              </Select>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableEmpty
                    message="No hay usuarios"
                    description="Prueba ajustando los filtros o crea un nuevo usuario."
                  />
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.nombre} {user.apellido}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {user.rol}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            user.activo
                              ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                              : "inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"
                          }
                        >
                          {user.activo ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {user.telefono || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Intl.DateTimeFormat("es-MX", {
                            dateStyle: "medium",
                          }).format(new Date(user.created_at))}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link href={`/dashboard/users/${user.id}`}>
                            <Button variant="ghost" size="sm">
                              Editar
                            </Button>
                          </Link>
                          {currentUser?.id === user.id ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              title="No puedes desactivar tu propia cuenta"
                            >
                              Tu cuenta
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(user)}
                            >
                              {user.activo ? "Desactivar" : "Activar"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={PAGE_SIZE}
            />
          )}
        </div>

        <CreateUserModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            loadUsers();
            setIsCreateOpen(false);
          }}
        />
      </div>
    </AdminGuard>
  );
}
