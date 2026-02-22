"use client";

import { useState, useEffect, useRef } from "react";
import { useRequireAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Save,
  X,
} from "lucide-react";
import { userService } from "@/lib/api/user.service";

interface SettingsForm {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { isChecking } = useRequireAuth();
  const currentUser = useAuthStore((state) => state.user);
  const { theme: currentTheme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "system">(
    "profile",
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<SettingsForm>({
    firstName: "",
    lastName: "",
    email: "",
    avatarUrl: "",
    theme: "system",
    emailNotifications: true,
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        firstName: currentUser.nombre || "",
        lastName: currentUser.apellido || "",
        email: currentUser.email || "",
        avatarUrl: currentUser.avatar_url || "",
        theme:
          (localStorage.getItem("theme") as "light" | "dark") ||
          currentTheme ||
          "system",
      }));
    }
    setIsLoading(false);
  }, [currentUser, currentTheme]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Si cambia el tema, aplicarlo inmediatamente
    if (name === "theme") {
      if (value === "light" || value === "dark") {
        setTheme(value as "light" | "dark");
        setSuccessMessage("Tema actualizado");
        setTimeout(() => setSuccessMessage(null), 2000);
      } else if (value === "system") {
        // Usar preferencia del sistema
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        setTheme(prefersDark ? "dark" : "light");
        localStorage.removeItem("theme"); // Remover para que use siempre la preferencia del sistema
        setSuccessMessage("Usando tema del sistema");
        setTimeout(() => setSuccessMessage(null), 2000);
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      // Upload new avatar if one was selected
      let finalAvatarUrl = formData.avatarUrl;
      if (pendingAvatarFile) {
        const uploadedUser = await userService.uploadAvatar(pendingAvatarFile);
        finalAvatarUrl = uploadedUser.avatar_url || "";
        setPendingAvatarFile(null);
        setFormData((prev) => ({ ...prev, avatarUrl: finalAvatarUrl }));
      }
      const updated = await userService.updateProfile({
        nombre: formData.firstName,
        apellido: formData.lastName,
        email: formData.email,
        avatar_url: finalAvatarUrl || undefined,
      });
      // Sync updated name/email into auth store
      const store = useAuthStore.getState();
      if (store.user) {
        store.setUser({ ...store.user, ...updated });
      }
      setSuccessMessage("Perfil actualizado exitosamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setErrorMessage("Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      await userService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      setSuccessMessage("Contraseña actualizada exitosamente");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Error al cambiar la contraseña";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isChecking || isLoading) {
    return <Skeleton className="w-full h-screen" />;
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra tu perfil, contraseña y preferencias del sistema
        </p>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-300">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-300">{errorMessage}</p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-1 sm:gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "profile"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Perfil
            </div>
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "password"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Contraseña
            </div>
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "system"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Preferencias
            </div>
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 max-w-2xl">
          <div className="space-y-6">
            {/* Avatar Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Foto de perfil
              </label>
              <div className="flex items-center gap-4">
                {/* Avatar preview */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                    {avatarPreview || formData.avatarUrl ? (
                      <img
                        src={avatarPreview || formData.avatarUrl}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400 select-none">
                        {(formData.firstName?.[0] || "").toUpperCase()}
                        {(formData.lastName?.[0] || "").toUpperCase() ||
                          (formData.firstName?.[1] || "").toUpperCase()}
                      </span>
                    )}
                  </div>
                  {pendingAvatarFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setPendingAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                      title="Quitar foto seleccionada"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    {pendingAvatarFile ? "Foto seleccionada" : "Cambiar foto"}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    JPG, PNG o WEBP · máx. 5 MB
                  </p>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPendingAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre
              </label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleFormChange}
                placeholder="Tu nombre"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Apellido
              </label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleFormChange}
                placeholder="Tu apellido"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="correo@example.com"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rol
              </label>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
                {currentUser?.rol === "admin" && "Administrador"}
                {currentUser?.rol === "encargado" && "Encargado"}
                {currentUser?.rol === "brigadista" && "Brigadista"}
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 max-w-2xl">
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Utiliza una contraseña fuerte con al menos 8 caracteres,
                incluyendo mayúsculas, minúsculas y números.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña actual
              </label>
              <Input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Ingresa tu contraseña actual"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nueva contraseña
              </label>
              <Input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Ingresa una nueva contraseña"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar contraseña
              </label>
              <Input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirma tu nueva contraseña"
                disabled={isSaving}
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              <Lock className="w-4 h-4 mr-2" />
              {isSaving ? "Cambiando..." : "Cambiar contraseña"}
            </Button>
          </div>
        </div>
      )}

      {/* System Preferences Tab */}
      {activeTab === "system" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 max-w-2xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tema
              </label>
              <Select
                value={formData.theme}
                onChange={(e) => handleSelectChange("theme", e.target.value)}
                disabled={isSaving}
              >
                <option value="system">Sistema</option>
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
              </Select>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                Notificaciones por correo
              </h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      emailNotifications: e.target.checked,
                    }))
                  }
                  disabled={isSaving}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Recibir notificaciones por correo
                </span>
              </label>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar preferencias"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
