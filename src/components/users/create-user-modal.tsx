"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { whitelistService } from "@/lib/api/whitelist.service";
import { activationCodeService } from "@/lib/api/activation-code.service";
import {
  Copy,
  Check,
  UserPlus,
  Info,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface InviteUserFormData {
  nombre: string;
  apellido: string;
  email: string;
  rol: "admin" | "encargado" | "brigadista";
  telefono?: string;
  notas?: string;
}

const initialForm: InviteUserFormData = {
  nombre: "",
  apellido: "",
  email: "",
  rol: "brigadista",
  telefono: "",
  notas: "",
};

export function CreateUserModal({
  isOpen,
  onClose,
  onCreated,
}: CreateUserModalProps) {
  const [formData, setFormData] = useState<InviteUserFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<InviteUserFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [activationCode, setActivationCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const updateField = (field: keyof InviteUserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const validate = () => {
    const nextErrors: Partial<InviteUserFormData> = {};
    if (!formData.nombre.trim()) nextErrors.nombre = "Nombre requerido";
    if (!formData.apellido.trim()) nextErrors.apellido = "Apellido requerido";
    if (!formData.email.trim()) nextErrors.email = "Email requerido";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setServerError(null);
    try {
      // Step 1: Create whitelist entry
      const whitelist = await whitelistService.create({
        identifier: formData.email.trim(),
        identifier_type: "email",
        full_name: `${formData.nombre.trim()} ${formData.apellido.trim()}`,
        assigned_role: formData.rol,
        phone: formData.telefono?.trim() || undefined,
        notes: formData.notas?.trim() || undefined,
      });

      // Step 2: Generate activation code
      const codeResponse = await activationCodeService.generate({
        whitelist_id: whitelist.id,
        expires_in_hours: 72,
        send_email: true,
        email_template: "default",
      });

      setActivationCode(codeResponse.code);
      onCreated();
    } catch (error: any) {
      setServerError(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "No se pudo crear el registro",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!activationCode) return;
    try {
      await navigator.clipboard.writeText(activationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar:", err);
    }
  };

  const handleClose = () => {
    setFormData(initialForm);
    setErrors({});
    setServerError(null);
    setActivationCode(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={activationCode ? "Usuario registrado" : "Invitar usuario"}
      size="lg"
    >
      {!activationCode ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Completa los datos del usuario. Se generará un código de activación
            que el usuario usará para crear su cuenta.
          </p>

          {serverError && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                {serverError}
              </p>
            </div>
          )}

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

          <div className="grid gap-4 md:grid-cols-2">
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

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Rol"
              value={formData.rol}
              onChange={(e) => updateField("rol", e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="encargado">Encargado</option>
              <option value="brigadista">Brigadista</option>
            </Select>
            <Input
              label="Notas (opcional)"
              value={formData.notas}
              onChange={(e) => updateField("notas", e.target.value)}
            />
          </div>

          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Se enviará un email automáticamente con el código de activación.
              El código expirará en 72 horas.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              <UserPlus className="mr-2 h-4 w-4" />
              Registrar usuario
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
              Usuario registrado exitosamente
            </p>
          </div>

          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
              Este es el código de activación. Se muestra{" "}
              <strong>una sola vez</strong>.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código de activación
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={activationCode}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/40 text-gray-900 dark:text-white font-mono text-lg text-center tracking-wider"
              />
              <Button
                variant="outline"
                size="md"
                onClick={handleCopy}
                title="Copiar"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              El usuario recibirá un email con este código. También puedes
              compartirlo manualmente de forma segura.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleClose}>Cerrar</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
