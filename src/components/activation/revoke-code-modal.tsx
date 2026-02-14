"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useActivationCodeStore } from "@/store/activation-code-store";
import { ActivationCode } from "@/types/activation";
import { AlertTriangle, Loader2 } from "lucide-react";

interface RevokeCodeModalProps {
  isOpen: boolean;
  code: ActivationCode;
  onClose: () => void;
}

export function RevokeCodeModal({
  isOpen,
  code,
  onClose,
}: RevokeCodeModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const { revokeCode, isLoading } = useActivationCodeStore();

  const handleRevoke = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for revoking this code");
      return;
    }

    try {
      await revokeCode(code.id, reason);
      setReason("");
      setError("");
      onClose();
    } catch (error) {
      // Error handled in store
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      setError("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Revoke Activation Code"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleRevoke}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Revoking...
              </>
            ) : (
              "Revoke Code"
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
              Permanent Action
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200">
              This will permanently revoke the activation code. The user will
              not be able to use it to activate their account.
            </p>
          </div>
        </div>

        {/* Code Information */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-sm mb-2">Code Details</h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">User:</span>{" "}
              <span className="font-medium">
                {code.whitelist.nombre} {code.whitelist.apellido}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Identifier:</span>{" "}
              <span className="font-mono">{code.whitelist.identifier}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Role:</span>{" "}
              <span className="font-medium">
                {code.whitelist.assigned_role}
              </span>
            </p>
          </div>
        </div>

        {/* Reason Input */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Reason for Revocation <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            placeholder="e.g., User request, security concern, incorrect information..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={3}
            disabled={isLoading}
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {error}
            </p>
          )}
        </div>

        {/* Confirmation */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> After revocation, you can generate a new code
            for this user if needed. The revocation will be logged in the audit
            trail.
          </p>
        </div>
      </div>
    </Modal>
  );
}
