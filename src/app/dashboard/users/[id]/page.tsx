"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminGuard } from "@/components/auth/admin-guard";
import { useRequireAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ResetPasswordModal } from "@/components/users/reset-password-modal";
import { userService } from "@/lib/api/user.service";
import type { User, UserRole } from "@/types";
import { Key } from "lucide-react";

interface UserFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: UserRole;
  activo: boolean;
}

const buildForm = (user: User): UserFormData => ({
  nombre: user.nombre || "",
  apellido: user.apellido || "",
  email: user.email || "",
  telefono: user.telefono || "",
  rol: user.rol,
  activo: user.activo,
});

export default function UserDetailPage() {
  const { isChecking } = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const currentUser = useAuthStore((state) => state.user);

  const userId = useMemo(() => {
    const rawId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
    return rawId ? Number(rawId) : NaN;
  }, [params]);

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData | null>(null);
  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (Number.isNaN(userId)) {
        setError("Usuario no valido");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const data = await userService.getUser(userId);
        setUser(data);
        setFormData(buildForm(data));
      } catch (err: any) {
        setError(err.message || "No se pudo cargar el usuario");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isChecking) {
      loadUser();
    }
  }, [isChecking, userId]);

  const updateField = (field: keyof UserFormData, value: string | boolean) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (error) {
      setError(null);
    }

    if (success) {
      setSuccess(null);
    }
  };

  const validate = () => {
    if (!formData) return false;
    const nextErrors: Partial<UserFormData> = {};
    if (!formData.nombre.trim()) nextErrors.nombre = "Nombre requerido";
    if (!formData.apellido.trim()) nextErrors.apellido = "Apellido requerido";
    if (!formData.email.trim()) nextErrors.email = "Email requerido";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!formData || !user) return;
    if (!validate()) return;

    if (currentUser?.id === user.id && !formData.activo) {
      setError("No puedes desactivar tu propia cuenta");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await userService.updateUser(user.id, {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim() || undefined,
        rol: formData.rol,
        activo: formData.activo,
      });
      setUser(updated);
      setFormData(buildForm(updated));
      setSuccess("Cambios guardados");
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar el usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!user) return;
    setFormData(buildForm(user));
    setErrors({});
    setError(null);
    setSuccess(null);
  };

  if (isChecking || isLoading || !formData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Administracion</p>
            <h1 className="font-display text-3xl font-semibold text-gray-900 dark:text-white">
              Editar usuario
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Actualiza los datos de contacto, rol y estado.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/users">
              <Button variant="ghost">Volver a usuarios</Button>
            </Link>
            <Button variant="outline" onClick={() => router.refresh()}>
              Recargar
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50/70 text-red-700">
            <p className="text-sm font-medium">{error}</p>
          </Card>
        )}

        {success && (
          <Card className="border-emerald-200 bg-emerald-50/70 text-emerald-700">
            <p className="text-sm font-medium">{success}</p>
          </Card>
        )}

        <Card>
          <CardHeader
            title="Informacion del usuario"
            description={`ID ${user?.id} • Creado ${new Intl.DateTimeFormat(
              "es-MX",
              {
                dateStyle: "medium",
              },
            ).format(new Date(user?.created_at || ""))}`}
          />
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => updateField("nombre", e.target.value)}
                error={errors.nombre}
              />
              <Input
                label="Apellido"
                value={formData.apellido}
                onChange={(e) => updateField("apellido", e.target.value)}
                error={errors.apellido}
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                error={errors.email}
              />
              <Input
                label="Telefono"
                value={formData.telefono}
                onChange={(e) => updateField("telefono", e.target.value)}
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Select
                label="Rol"
                value={formData.rol}
                onChange={(e) => updateField("rol", e.target.value as UserRole)}
              >
                <option value="admin">Admin</option>
                <option value="encargado">Encargado</option>
                <option value="brigadista">Brigadista</option>
              </Select>
              <Select
                label="Estado"
                value={formData.activo ? "active" : "inactive"}
                onChange={(e) =>
                  updateField("activo", e.target.value === "active")
                }
                disabled={currentUser?.id === user?.id}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </Select>
            </div>
            {currentUser?.id === user?.id && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Tu cuenta no puede desactivarse desde aqui.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={handleReset}>
              Restablecer
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Guardar cambios
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader
            title="Seguridad"
            description="Gestiona el acceso y credenciales del usuario"
          />
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Restablecer contrasena
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Genera una contrasena temporal para el usuario
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsResetPasswordOpen(true)}
              >
                <Key className="mr-2 h-4 w-4" />
                Restablecer
              </Button>
            </div>
          </CardContent>
        </Card>

        {user && (
          <ResetPasswordModal
            isOpen={isResetPasswordOpen}
            onClose={() => setIsResetPasswordOpen(false)}
            userId={user.id}
            userName={`${user.nombre} ${user.apellido}`}
          />
        )}
      </div>
    </AdminGuard>
  );
}
