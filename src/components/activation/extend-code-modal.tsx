"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActivationCodeStore } from "@/store/activation-code-store";
import { ActivationCode } from "@/types/activation";
import { Clock, Loader2, AlertCircle } from "lucide-react";
import { format, addHours } from "date-fns";

interface ExtendCodeModalProps {
  isOpen: boolean;
  code: ActivationCode;
  onClose: () => void;
}

export function ExtendCodeModal({
  isOpen,
  code,
  onClose,
}: ExtendCodeModalProps) {
  const [additionalHours, setAdditionalHours] = useState(24);
  const [error, setError] = useState("");

  const { extendCode, isLoading } = useActivationCodeStore();

  const currentExpiry = code.expires_at ? new Date(code.expires_at) : null;
  const newExpiry = currentExpiry
    ? addHours(currentExpiry, additionalHours)
    : null;

  const handleExtend = async () => {
    if (additionalHours < 1) {
      setError("Must be at least 1 hour");
      return;
    }
    if (additionalHours > 720) {
      setError("Maximum 720 hours (30 days)");
      return;
    }

    try {
      await extendCode(code.id, additionalHours);
      setAdditionalHours(24);
      setError("");
      onClose();
    } catch (error) {
      // Error handled in store
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setAdditionalHours(24);
      setError("");
      onClose();
    }
  };

  const quickOptions = [
    { label: "12 hours", hours: 12 },
    { label: "24 hours", hours: 24 },
    { label: "72 hours", hours: 72 },
    { label: "7 days", hours: 168 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Extend Code Expiration"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleExtend} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extending...
              </>
            ) : (
              "Extend Expiration"
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
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
              <span className="text-muted-foreground">Current Expiry:</span>{" "}
              <span
                className={
                  currentExpiry && currentExpiry < new Date()
                    ? "text-red-600 dark:text-red-400 font-medium"
                    : "font-medium"
                }
              >
                {currentExpiry ? format(currentExpiry, "PPpp") : "Never"}
              </span>
            </p>
          </div>
        </div>

        {/* Expired Warning */}
        {currentExpiry && currentExpiry < new Date() && (
          <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-orange-800 dark:text-orange-200">
              This code has already expired. Extending it will make it valid
              again.
            </p>
          </div>
        )}

        {/* Quick Options */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Quick Options
          </label>
          <div className="grid grid-cols-2 gap-2">
            {quickOptions.map((option) => (
              <Button
                key={option.hours}
                variant={additionalHours === option.hours ? "default" : "ghost"}
                onClick={() => {
                  setAdditionalHours(option.hours);
                  setError("");
                }}
                disabled={isLoading}
                className="justify-center"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Hours Input */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Additional Hours <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            value={additionalHours}
            onChange={(e) => {
              setAdditionalHours(parseInt(e.target.value) || 0);
              setError("");
            }}
            min={1}
            max={720}
            disabled={isLoading}
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {error}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Maximum: 720 hours (30 days)
          </p>
        </div>

        {/* New Expiry Preview */}
        {newExpiry && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                New Expiration Time
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {format(newExpiry, "PPpp")}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                ({additionalHours} hours from current expiration)
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
