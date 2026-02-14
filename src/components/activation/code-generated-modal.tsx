"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Copy, Check, AlertTriangle } from "lucide-react";

interface CodeGeneratedModalProps {
  isOpen: boolean;
  code: string;
  onClose: () => void;
}

export function CodeGeneratedModal({
  isOpen,
  code,
  onClose,
}: CodeGeneratedModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Activation Code Generated"
      size="md"
      footer={
        <Button onClick={onClose} className="w-full">
          I've Saved the Code
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
              Important: Save This Code Now
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This is the only time you'll see this activation code in plain
              text. Make sure to copy it and send it to the user securely.
            </p>
          </div>
        </div>

        {/* Code Display */}
        <div className="relative">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Activation Code
            </p>
            <div className="flex items-center justify-between gap-3">
              <code className="text-2xl font-mono font-bold text-gray-900 dark:text-gray-100 tracking-wider">
                {code}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Next Steps:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Copy the activation code above</li>
            <li>
              Send it to the user through a secure channel (email, SMS, etc.)
            </li>
            <li>
              The user can use this code to activate their account in the mobile
              app
            </li>
            <li>
              The code will expire after the configured time period or after use
            </li>
          </ol>
        </div>

        {/* Security Note */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Security:</strong> The code is hashed and stored securely.
            You won't be able to retrieve it again, but you can generate a new
            code if needed.
          </p>
        </div>
      </div>
    </Modal>
  );
}
