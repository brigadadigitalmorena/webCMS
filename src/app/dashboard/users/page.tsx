"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { AdminGuard } from "@/components/auth/admin-guard";
import { Card } from "@/components/ui/card";
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
import { Search, UserPlus, Users, Shield, UserCheck } from "lucide-react";

const PAGE_SIZE = 10;

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
        <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white dark:bg-gray-900 p-6 shadow-sm backdrop-blur">
          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-primary-500/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-20 w-20 rounded-full bg-emerald-400/20 blur-2xl" />
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Administracion
              </p>
              <h1 className="font-display text-3xl font-semibold text-gray-900 dark:text-white">
                Usuarios
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Gestiona accesos, roles y estado de actividad del equipo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={loadUsers} disabled={loading}>
                Actualizar
              </Button>
              <Button onClick={() => setIsCreateOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invitar usuario
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50/70 text-red-700">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{error}</p>
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                Cerrar
              </Button>
            </div>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Total usuarios
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {stats.total}
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
                  Activos
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {stats.active}
                </p>
              </div>
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Inactivos
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {stats.inactive}
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Administradores
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {stats.admins}
                </p>
              </div>
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 text-slate-700 dark:text-slate-300">
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </div>

        <Card>
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
        </Card>

        <Card>
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
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
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
        </Card>

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
