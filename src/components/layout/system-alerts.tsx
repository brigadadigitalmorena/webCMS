"use client";

import { useState } from "react";
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";

type AlertType = "error" | "warning" | "info" | "success";

interface Alert {
  id: number;
  type: AlertType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

interface SystemAlertsProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data - replace with real data from API/store
const mockAlerts: Alert[] = [
  {
    id: 1,
    type: "error",
    title: "Error en sincronización",
    message: "Falló la sincronización de datos con 3 dispositivos móviles",
    timestamp: new Date().toISOString(),
    read: false,
    actionLabel: "Ver detalles",
    actionUrl: "/dashboard/system-health",
  },
  {
    id: 2,
    type: "warning",
    title: "Límite de almacenamiento",
    message: "El almacenamiento está al 85% de su capacidad",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    actionLabel: "Gestionar",
    actionUrl: "/dashboard/settings",
  },
  {
    id: 3,
    type: "info",
    title: "Nueva encuesta creada",
    message: "Se creó la encuesta 'Censo 2026' exitosamente",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
];

const alertConfig = {
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    borderColor: "border-red-200",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    borderColor: "border-yellow-200",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
  },
};

export function SystemAlerts({ isOpen, onClose }: SystemAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const markAsRead = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })));
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Alerts panel */}
      <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Alertas del Sistema
            </h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">
                {unreadCount} sin leer
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b border-gray-100">
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Marcar todas como leídas
            </button>
          </div>
        )}

        {/* Alerts list */}
        <div className="flex-1 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No hay alertas</p>
              <p className="text-sm text-gray-500 mt-1">
                El sistema está funcionando correctamente
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {alerts.map((alert) => {
                const config = alertConfig[alert.type];
                const Icon = config.icon;

                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                      !alert.read && "bg-primary-50/30",
                    )}
                    onClick={() => markAsRead(alert.id)}
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
                              "text-sm font-medium text-gray-900",
                              !alert.read && "font-semibold",
                            )}
                          >
                            {alert.title}
                          </h4>
                          {!alert.read && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                          {alert.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDateTime(alert.timestamp)}
                          </span>

                          {alert.actionLabel && (
                            <a
                              href={alert.actionUrl}
                              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {alert.actionLabel} →
                            </a>
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
        <div className="p-3 border-t border-gray-200">
          <a
            href="/dashboard/system-health"
            className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-1"
            onClick={onClose}
          >
            Ver todas las alertas
          </a>
        </div>
      </div>
    </>
  );
}
