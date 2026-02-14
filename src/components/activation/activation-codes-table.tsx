"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivationStatusBadge } from "./activation-status-badge";
import { CodeDetailModal } from "./code-detail-modal";
import { RevokeCodeModal } from "./revoke-code-modal";
import { ExtendCodeModal } from "./extend-code-modal";
import { AttemptsModal } from "./attempts-modal";
import { useActivationCodeStore } from "@/store/activation-code-store";
import { ActivationCode } from "@/types/activation";
import {
  Eye,
  Clock,
  Ban,
  Mail,
  Shield,
  MoreVertical,
  Copy,
} from "lucide-react";
import { formatDistance } from "date-fns";

interface ActivationCodesTableProps {
  codes: ActivationCode[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ActivationCodesTable({
  codes,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: ActivationCodesTableProps) {
  const [selectedCode, setSelectedCode] = useState<ActivationCode | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showAttemptsModal, setShowAttemptsModal] = useState(false);

  const { resendEmail } = useActivationCodeStore();

  const handleViewDetails = (code: ActivationCode) => {
    setSelectedCode(code);
    setShowDetailModal(true);
  };

  const handleRevoke = (code: ActivationCode) => {
    setSelectedCode(code);
    setShowRevokeModal(true);
  };

  const handleExtend = (code: ActivationCode) => {
    setSelectedCode(code);
    setShowExtendModal(true);
  };

  const handleViewAttempts = (code: ActivationCode) => {
    setSelectedCode(code);
    setShowAttemptsModal(true);
  };

  const handleResendEmail = async (code: ActivationCode) => {
    try {
      await resendEmail(code.id);
      // Success feedback could be added here
    } catch (error) {
      // Error is handled in the store
    }
  };

  const maskIdentifier = (identifier: string, type: string): string => {
    if (type === "email") {
      const [local, domain] = identifier.split("@");
      return `${local.slice(0, 2)}***@${domain}`;
    }
    if (type === "phone") {
      return `***${identifier.slice(-4)}`;
    }
    return `***${identifier.slice(-4)}`;
  };

  const canExtend = (code: ActivationCode) => {
    return code.status === "active" && !code.used_at;
  };

  const canRevoke = (code: ActivationCode) => {
    return code.status !== "revoked" && code.status !== "used";
  };

  const canResendEmail = (code: ActivationCode) => {
    return code.status === "active" && !code.used_at;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mb-4 flex items-center gap-4">
            <Skeleton className="h-12 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (codes.length === 0) {
    return (
      <Table>
        <TableBody>
          <TableEmpty
            message="No activation codes found"
            description="Generate a new activation code to get started"
          />
        </TableBody>
      </Table>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Identifier</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {codes.map((code) => (
            <TableRow key={code.id}>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {code.whitelist.nombre} {code.whitelist.apellido}
                  </p>
                  {code.whitelist.supervisor_nombre && (
                    <p className="text-xs text-muted-foreground">
                      Supervisor: {code.whitelist.supervisor_nombre}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {maskIdentifier(
                      code.whitelist.identifier,
                      code.whitelist.identifier_type,
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase">
                    {code.whitelist.identifier_type}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  {code.whitelist.assigned_role}
                </span>
              </TableCell>
              <TableCell>
                <ActivationStatusBadge status={code.status} />
              </TableCell>
              <TableCell>
                {code.expires_at ? (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span
                      className={
                        new Date(code.expires_at) < new Date()
                          ? "text-red-600 dark:text-red-400"
                          : ""
                      }
                    >
                      {formatDistance(new Date(code.expires_at), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No expiry</span>
                )}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => handleViewAttempts(code)}
                  className="text-sm font-medium hover:underline"
                >
                  {code.failed_attempts} / {code.max_attempts}
                </button>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(code)}
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  {canExtend(code) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExtend(code)}
                      title="Extend Expiration"
                    >
                      <Clock className="w-4 h-4" />
                    </Button>
                  )}

                  {canResendEmail(code) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResendEmail(code)}
                      title="Resend Email"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  )}

                  {canRevoke(code) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(code)}
                      title="Revoke Code"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewAttempts(code)}
                    title="View Attempts"
                  >
                    <Shield className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {/* Modals */}
      {selectedCode && (
        <>
          <CodeDetailModal
            isOpen={showDetailModal}
            code={selectedCode}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedCode(null);
            }}
          />

          <RevokeCodeModal
            isOpen={showRevokeModal}
            code={selectedCode}
            onClose={() => {
              setShowRevokeModal(false);
              setSelectedCode(null);
            }}
          />

          <ExtendCodeModal
            isOpen={showExtendModal}
            code={selectedCode}
            onClose={() => {
              setShowExtendModal(false);
              setSelectedCode(null);
            }}
          />

          <AttemptsModal
            isOpen={showAttemptsModal}
            code={selectedCode}
            onClose={() => {
              setShowAttemptsModal(false);
              setSelectedCode(null);
            }}
          />
        </>
      )}
    </div>
  );
}
