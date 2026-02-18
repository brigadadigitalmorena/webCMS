"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, RefreshCw, Check } from "lucide-react";
import { userService } from "@/lib/api/user.service";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  userId,
  userName,
}: ResetPasswordModalProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    setError(null);
    setTemporaryPassword(null);
    try {
      const response = await userService.resetPassword(userId);
      setTemporaryPassword(response.temporary_password);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "No se pudo restablecer la contrasena",
      );
    } finally {
      setIsResetting(false);
    }
  };

  const handleCopy = async () => {
    if (!temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar:", err);
    }
  };

  const handleClose = () => {
    setTemporaryPassword(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Restablecer contrasena"
      size="md"
    >
      <div className="space-y-4">
        {!temporaryPassword && !error && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Se generara una contrasena temporal para{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{userName}</span>.
            </p>
            <Card className="border-amber-200 bg-amber-50/70 text-amber-800">
              <p className="text-sm font-medium">
                ⚠️ La contrasena temporal se mostrara{" "}
                <strong>una sola vez</strong>. Asegurate de copiarla antes de
                cerrar.
              </p>
            </Card>
          </>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50/70 text-red-700">
            <p className="text-sm font-medium">{error}</p>
          </Card>
        )}

        {temporaryPassword && (
          <div className="space-y-3">
            <Card className="border-emerald-200 bg-emerald-50/70 text-emerald-700">
              <p className="text-sm font-medium">
                ✓ Contrasena restablecida exitosamente
              </p>
            </Card>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contrasena temporal
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={temporaryPassword}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/40 text-gray-900 dark:text-white font-mono text-sm"
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
                El usuario debera cambiar esta contrasena en su primer inicio de
                sesion.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={handleClose}>
            {temporaryPassword ? "Cerrar" : "Cancelar"}
          </Button>
          {!temporaryPassword && (
            <Button onClick={handleReset} isLoading={isResetting}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generar contrasena
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
