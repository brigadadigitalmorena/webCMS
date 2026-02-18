"use client";

import { useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, Info, AlertTriangle, AlertCircle, Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store/notification-store";
import { cn } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/use-auth";

const typeConfig: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  info: { icon: Info, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  warning: { icon: AlertTriangle, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  error: { icon: AlertCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
  announcement: { icon: Megaphone, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
};

export default function NotificationsPage() {
  const { isChecking } = useRequireAuth();
  const { notifications, unreadCount, isLoading, fetchNotifications, markRead, markAllRead, deleteOne } =
    useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (isChecking) return null;

  const hasUnread = unreadCount > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notificaciones</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {hasUnread ? `${unreadCount} sin leer` : "Todo al día"}
            </p>
          </div>
        </div>
        {hasUnread && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead()}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todo como leído
          </Button>
        )}
      </div>

      {/* Notifications list */}
      <Card className="divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Bell className="h-12 w-12 opacity-30" />
            <p className="text-sm">Sin notificaciones</p>
          </div>
        )}

        {!isLoading &&
          notifications.map((n) => {
            const cfg = typeConfig[n.type] ?? typeConfig.info;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-4 px-5 py-4 transition-colors",
                  !n.read
                    ? "bg-blue-50/60 dark:bg-blue-900/10"
                    : "bg-white dark:bg-gray-900"
                )}
              >
                {/* Icon */}
                <div className={cn("mt-0.5 flex-shrink-0 rounded-full p-2", cfg.bg)}>
                  <Icon className={cn("h-4 w-4", cfg.color)} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm",
                      !n.read
                        ? "font-semibold text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {n.title}
                  </p>
                  {n.message && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {n.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {new Date(n.created_at).toLocaleString("es-MX", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.read && (
                    <button
                      title="Marcar como leído"
                      onClick={() => markRead(n.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    title="Eliminar"
                    onClick={() => deleteOne(n.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
      </Card>
    </div>
  );
}
