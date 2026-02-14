import { ActivationCodeStatus } from "@/types/activation";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  Lock,
  LucideIcon,
} from "lucide-react";

interface ActivationStatusBadgeProps {
  status: ActivationCodeStatus;
  showIcon?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  colorClasses: string;
  icon: LucideIcon;
}

const statusConfig: Record<ActivationCodeStatus, StatusConfig> = {
  active: {
    label: "Active",
    colorClasses:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800",
    icon: CheckCircle2,
  },
  used: {
    label: "Used",
    colorClasses:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    icon: CheckCircle2,
  },
  expired: {
    label: "Expired",
    colorClasses:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    icon: Clock,
  },
  revoked: {
    label: "Revoked",
    colorClasses:
      "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800",
    icon: Ban,
  },
  locked: {
    label: "Locked",
    colorClasses:
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    icon: Lock,
  },
};

export function ActivationStatusBadge({
  status,
  showIcon = true,
  className = "",
}: ActivationStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.colorClasses} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
}
