"use client";

import { useRouter } from "next/navigation";
import {
  X,
  Info,
  CheckCircle,
  Bell,
  ClipboardList,
  UserPlus,
  BookOpen,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import { useNotificationStore } from "@/store/notification-store";
import { NotificationType } from "@/types";

interface SystemAlertsProps {
  isOpen: boolean;
  onClose: () => void;
}

// Map backend notification type → visual config
const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; bgColor: string; iconColor: string }
> = {
  survey_created: {
    icon: ClipboardList,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600",
  },
  survey_deleted: {
    icon: Trash2,
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
  },
  version_published: {
    icon: BookOpen,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
  },
  assignment_created: {
    icon: Bell,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  user_registered: {
    icon: UserPlus,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
};

const fallbackConfig = {
  icon: Info,
  bgColor: "bg-gray-50 dark:bg-gray-800/40",
  iconColor: "text-gray-500 dark:text-gray-400",
};

export function SystemAlerts({ isOpen, onClose }: SystemAlertsProps) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    deleteOne,
  } = useNotificationStore();

  if (!isOpen) return null;

  const handleClickNotification = (id: number, actionUrl?: string | null) => {
    markRead(id);
    if (actionUrl) {
      onClose();
      router.push(actionUrl);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Notifications panel */}
      <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {unreadCount} sin leer
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Mark all read */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={markAllRead}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Marcar todas como leídas
            </button>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Sin notificaciones
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Todo en orden por ahora
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notif) => {
                const config = typeConfig[notif.type] ?? fallbackConfig;
                const Icon = config.icon;

                return (
                  <div
                    key={notif.id}
                    className={cn(
                      "p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group",
                      !notif.read && "bg-primary-50/30",
                    )}
                    onClick={() =>
                      handleClickNotification(notif.id, notif.action_url)
                    }
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                          config.bgColor,
                        )}
                      >
                        <Icon className={cn("w-5 h-5", config.iconColor)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={cn(
                              "text-sm text-gray-900 dark:text-white",
                              !notif.read ? "font-semibold" : "font-medium",
                            )}
                          >
                            {notif.title}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notif.read && (
                              <div className="w-2 h-2 bg-primary-600 rounded-full" />
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteOne(notif.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-red-600 text-gray-400 dark:text-gray-500"
                              title="Eliminar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDateTime(notif.created_at)}
                          </span>
                          {notif.action_url && (
                            <span className="text-xs text-primary-600 font-medium">
                              Ver →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {notifications.length} notificación
              {notifications.length !== 1 ? "es" : ""}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
