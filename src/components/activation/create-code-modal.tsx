"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useWhitelistStore } from "@/store/whitelist-store";
import { useActivationCodeStore } from "@/store/activation-code-store";
import { UserRole, CreateWhitelistRequest } from "@/types/activation";
import { userService } from "@/lib/api/user.service";
import { User } from "@/types";
import { Loader2 } from "lucide-react";

interface CreateCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  nombre: string;
  apellido: string;
  email: string; // Obligatorio para enviar código
  phone?: string; // Opcional
  assigned_role: UserRole;
  supervisor_id?: number;
  expires_in_hours: number;
  notes?: string;
  custom_message?: string;
}

const initialFormData: FormData = {
  nombre: "",
  apellido: "",
  email: "",
  phone: "",
  assigned_role: "brigadista",
  expires_in_hours: 72,
  notes: "",
  custom_message: "",
};

export function CreateCodeModal({ isOpen, onClose }: CreateCodeModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);

  const { createEntry } = useWhitelistStore();
  const { generateCode } = useActivationCodeStore();

  // Load supervisors when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSupervisors();
    }
  }, [isOpen]);

  const loadSupervisors = async () => {
    setLoadingSupervisors(true);
    try {
      const response = await userService.getUsers({
        activo: true,
      });
      // Filter only admin and encargado
      const supervisorList = response.filter(
        (user) => user.rol === "admin" || user.rol === "encargado",
      );
      setSupervisors(supervisorList);
    } catch (error) {
      console.error("Error loading supervisors:", error);
    } finally {
      setLoadingSupervisors(false);
    }
  };

  const handleChange = (
    field: keyof FormData,
    value: string | number | undefined,
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Clear supervisor_id if role is changed to non-brigadista
      if (field === "assigned_role" && value !== "brigadista") {
        updated.supervisor_id = undefined;
      }

      return updated;
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear server error when user types
    if (serverError) {
      setServerError(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }
    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido";
    }
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Formato de email inválido";
      }
    }
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^\+?[\d\s-()]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "Formato de teléfono inválido";
      }
    }
    // Supervisor is required for brigadista
    if (formData.assigned_role === "brigadista" && !formData.supervisor_id) {
      newErrors.supervisor_id = "El supervisor es requerido para brigadistas";
    }
    if (formData.expires_in_hours < 1) {
      newErrors.expires_in_hours = "Debe ser al menos 1 hora";
    }
    if (formData.expires_in_hours > 720) {
      newErrors.expires_in_hours = "Máximo 720 horas (30 días)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      // Step 1: Create whitelist entry
      const whitelistRequest: CreateWhitelistRequest = {
        identifier: formData.email.trim(),
        identifier_type: "email", // Siempre email para enviar código
        full_name: `${formData.nombre.trim()} ${formData.apellido.trim()}`,
        assigned_role: formData.assigned_role,
        assigned_supervisor_id: formData.supervisor_id,
        phone: formData.phone?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      };

      const whitelistEntry = await createEntry(whitelistRequest);

      // Step 2: Generate activation code for the whitelist entry
      await generateCode({
        whitelist_id: whitelistEntry.id,
        expires_in_hours: formData.expires_in_hours,
        send_email: true,
        email_template: "default",
        custom_message: formData.custom_message?.trim() || undefined,
      });

      // Reset form and close
      setFormData(initialFormData);
      setErrors({});
      setServerError(null);
      setIsSubmitting(false);
      onClose();
    } catch (error: any) {
      // Show error in UI with custom messages
      let errorMessage = "Error al crear usuario. Por favor intenta de nuevo.";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
        // Customize common error messages to Spanish
        if (errorMessage === "Could not validate credentials") {
          errorMessage = "Sesión expirada. Por favor vuelve a iniciar sesión.";
        } else if (
          errorMessage === "Supervisor is required for brigadista role."
        ) {
          errorMessage = "El supervisor es requerido para el rol brigadista.";
        } else if (errorMessage.includes("Supervisor with ID")) {
          errorMessage =
            "El supervisor seleccionado no existe o no tiene permisos.";
        } else if (errorMessage.includes("already exists")) {
          errorMessage = "Este email ya está registrado en el sistema.";
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setServerError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData(initialFormData);
      setErrors({});
      setServerError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Usuario y Generar Código"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear y Generar Código"
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Server Error Alert */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {serverError}
                </p>
              </div>
              <button
                onClick={() => setServerError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Nombre <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              placeholder="Juan"
              disabled={isSubmitting}
            />
            {errors.nombre && (
              <p className="text-sm text-red-600 mt-1">
                {errors.nombre}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Apellido <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.apellido}
              onChange={(e) => handleChange("apellido", e.target.value)}
              placeholder="Pérez"
              disabled={isSubmitting}
            />
            {errors.apellido && (
              <p className="text-sm text-red-600 mt-1">
                {errors.apellido}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="usuario@ejemplo.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">
              {errors.email}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            El código de activación se enviará a este email
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
            Teléfono (Opcional)
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+52 123 456 7890"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
            Rol Asignado <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.assigned_role}
            onChange={(e) =>
              handleChange("assigned_role", e.target.value as UserRole)
            }
            disabled={isSubmitting}
          >
            <option value="brigadista">Brigadista</option>
            <option value="encargado">Encargado</option>
            <option value="admin">Admin</option>
          </Select>
        </div>

        {/* Supervisor (Only for Brigadista) */}
        {formData.assigned_role === "brigadista" && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Supervisor <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.supervisor_id?.toString() || ""}
              onChange={(e) =>
                handleChange(
                  "supervisor_id",
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
              disabled={isSubmitting || loadingSupervisors}
            >
              <option value="">
                {loadingSupervisors
                  ? "Cargando supervisores..."
                  : "Selecciona un supervisor"}
              </option>
              {supervisors.map((supervisor) => (
                <option key={supervisor.id} value={supervisor.id}>
                  {supervisor.nombre} {supervisor.apellido} -{" "}
                  {supervisor.rol === "admin" ? "Admin" : "Encargado"}
                </option>
              ))}
            </Select>
            {errors.supervisor_id && (
              <p className="text-sm text-red-600 mt-1">
                {errors.supervisor_id}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Los brigadistas requieren un supervisor (Admin o Encargado)
            </p>
          </div>
        )}

        {/* Expiration */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
            Expira en (Horas) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            value={formData.expires_in_hours}
            onChange={(e) =>
              handleChange("expires_in_hours", parseInt(e.target.value))
            }
            min={1}
            max={720}
            disabled={isSubmitting}
          />
          {errors.expires_in_hours && (
            <p className="text-sm text-red-600 mt-1">
              {errors.expires_in_hours}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Por defecto: 72 horas (3 días). Máximo: 720 horas (30 días)
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
            Notas (Opcional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Notas internas sobre esta activación..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </Modal>
  );
}
