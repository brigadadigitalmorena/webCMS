"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useActivationCodeStore } from "@/store/activation-code-store";
import { IdentifierType, UserRole } from "@/types/activation";
import { Loader2 } from "lucide-react";

interface CreateCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  nombre: string;
  apellido: string;
  identifier: string;
  identifier_type: IdentifierType;
  assigned_role: UserRole;
  supervisor_id?: number;
  expires_in_hours: number;
  notes?: string;
}

const initialFormData: FormData = {
  nombre: "",
  apellido: "",
  identifier: "",
  identifier_type: "email",
  assigned_role: "brigadista",
  expires_in_hours: 72,
  notes: "",
};

export function CreateCodeModal({ isOpen, onClose }: CreateCodeModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  const { generateCode, isGenerating } = useActivationCodeStore();

  const handleChange = (
    field: keyof FormData,
    value: string | number | undefined,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "First name is required";
    }
    if (!formData.apellido.trim()) {
      newErrors.apellido = "Last name is required";
    }
    if (!formData.identifier.trim()) {
      newErrors.identifier = "Identifier is required";
    } else {
      // Basic validation
      if (formData.identifier_type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.identifier)) {
          newErrors.identifier = "Invalid email format";
        }
      } else if (formData.identifier_type === "phone") {
        const phoneRegex = /^\+?[\d\s-()]+$/;
        if (!phoneRegex.test(formData.identifier)) {
          newErrors.identifier = "Invalid phone format";
        }
      }
    }
    if (formData.expires_in_hours < 1) {
      newErrors.expires_in_hours = "Must be at least 1 hour";
    }
    if (formData.expires_in_hours > 720) {
      newErrors.expires_in_hours = "Maximum 720 hours (30 days)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await generateCode({
        ...formData,
        supervisor_id: formData.supervisor_id || undefined,
        notes: formData.notes?.trim() || undefined,
      });

      // Reset form and close
      setFormData(initialFormData);
      setErrors({});
      onClose();
    } catch (error) {
      // Error handled in store
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setFormData(initialFormData);
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate Activation Code"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Code"
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              placeholder="John"
              disabled={isGenerating}
            />
            {errors.nombre && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.nombre}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.apellido}
              onChange={(e) => handleChange("apellido", e.target.value)}
              placeholder="Doe"
              disabled={isGenerating}
            />
            {errors.apellido && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.apellido}
              </p>
            )}
          </div>
        </div>

        {/* Identifier Type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Identifier Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.identifier_type}
            onChange={(e) =>
              handleChange("identifier_type", e.target.value as IdentifierType)
            }
            disabled={isGenerating}
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="national_id">National ID</option>
          </Select>
        </div>

        {/* Identifier */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Identifier <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.identifier}
            onChange={(e) => handleChange("identifier", e.target.value)}
            placeholder={
              formData.identifier_type === "email"
                ? "user@example.com"
                : formData.identifier_type === "phone"
                  ? "+1234567890"
                  : "ID-12345"
            }
            disabled={isGenerating}
          />
          {errors.identifier && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.identifier}
            </p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Assigned Role <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.assigned_role}
            onChange={(e) =>
              handleChange("assigned_role", e.target.value as UserRole)
            }
            disabled={isGenerating}
          >
            <option value="brigadista">Brigadista</option>
            <option value="encargado">Encargado</option>
            <option value="admin">Admin</option>
          </Select>
        </div>

        {/* Expiration */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Expires In (Hours) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            value={formData.expires_in_hours}
            onChange={(e) =>
              handleChange("expires_in_hours", parseInt(e.target.value))
            }
            min={1}
            max={720}
            disabled={isGenerating}
          />
          {errors.expires_in_hours && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.expires_in_hours}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Default: 72 hours (3 days). Maximum: 720 hours (30 days)
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Internal notes about this activation..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isGenerating}
          />
        </div>
      </div>
    </Modal>
  );
}
