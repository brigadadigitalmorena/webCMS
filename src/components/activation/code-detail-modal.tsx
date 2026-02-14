"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ActivationStatusBadge } from "./activation-status-badge";
import { ActivationCode } from "@/types/activation";
import { format } from "date-fns";
import {
  User,
  Mail,
  Phone,
  IdCard,
  Calendar,
  Clock,
  Shield,
  FileText,
} from "lucide-react";

interface CodeDetailModalProps {
  isOpen: boolean;
  code: ActivationCode;
  onClose: () => void;
}

export function CodeDetailModal({
  isOpen,
  code,
  onClose,
}: CodeDetailModalProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "PPpp");
  };

  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="mt-0.5">{value}</div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Activation Code Details"
      size="lg"
      footer={<Button onClick={onClose}>Close</Button>}
    >
      <div className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Status</h3>
          <ActivationStatusBadge status={code.status} />
        </div>

        {/* User Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3">User Information</h3>
          <div className="space-y-0">
            <InfoRow
              icon={User}
              label="Full Name"
              value={`${code.whitelist.nombre} ${code.whitelist.apellido}`}
            />
            <InfoRow
              icon={IdCard}
              label="Identifier"
              value={
                <div className="flex items-center gap-2">
                  <span className="font-mono">{code.whitelist.identifier}</span>
                  <span className="text-xs text-muted-foreground uppercase bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                    {code.whitelist.identifier_type}
                  </span>
                </div>
              }
            />
            <InfoRow
              icon={Shield}
              label="Assigned Role"
              value={
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  {code.whitelist.assigned_role}
                </span>
              }
            />
            {code.whitelist.supervisor_nombre && (
              <InfoRow
                icon={User}
                label="Supervisor"
                value={code.whitelist.supervisor_nombre}
              />
            )}
          </div>
        </div>

        {/* Code Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Code Information</h3>
          <div className="space-y-0">
            <InfoRow
              icon={Calendar}
              label="Created At"
              value={formatDate(code.created_at)}
            />
            {code.expires_at && (
              <InfoRow
                icon={Clock}
                label="Expires At"
                value={
                  <span
                    className={
                      new Date(code.expires_at) < new Date()
                        ? "text-red-600 dark:text-red-400 font-medium"
                        : ""
                    }
                  >
                    {formatDate(code.expires_at)}
                  </span>
                }
              />
            )}
            {code.used_at && (
              <InfoRow
                icon={Calendar}
                label="Used At"
                value={formatDate(code.used_at)}
              />
            )}
            {code.revoked_at && (
              <InfoRow
                icon={Calendar}
                label="Revoked At"
                value={formatDate(code.revoked_at)}
              />
            )}
            <InfoRow
              icon={Shield}
              label="Attempts"
              value={
                <span>
                  {code.failed_attempts} / {code.max_attempts} failed attempts
                </span>
              }
            />
          </div>
        </div>

        {/* Additional Information */}
        {(code.revoke_reason || code.whitelist.notes) && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Additional Notes</h3>
            <div className="space-y-0">
              {code.revoke_reason && (
                <InfoRow
                  icon={FileText}
                  label="Revoke Reason"
                  value={
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {code.revoke_reason}
                    </p>
                  }
                />
              )}
              {code.whitelist.notes && (
                <InfoRow
                  icon={FileText}
                  label="Notes"
                  value={<p className="text-sm">{code.whitelist.notes}</p>}
                />
              )}
            </div>
          </div>
        )}

        {/* Code Hash (for reference) */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Code Hash (Bcrypt)
          </p>
          <code className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
            {code.code_hash}
          </code>
        </div>
      </div>
    </Modal>
  );
}
