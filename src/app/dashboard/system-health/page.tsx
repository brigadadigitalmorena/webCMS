"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminGuard } from "@/components/auth/admin-guard";
import { useRequireAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import {
  Activity,
  Database,
  Server,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Wifi,
} from "lucide-react";
import apiClient from "@/lib/api/client";

interface ServiceStatus {
  name: string;
  status: "healthy" | "degraded" | "down" | "checking";
  latencyMs?: number;
  detail?: string;
  checkedAt?: string;
}

export default function SystemHealthPage() {
  const { isChecking } = useRequireAuth();
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "API Backend", status: "checking" },
    { name: "Base de Datos", status: "checking" },
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>("");

  const checkHealth = useCallback(async () => {
    setIsRefreshing(true);
    const now = new Date().toLocaleTimeString();

    // Check API + DB via /health endpoint
    const apiStart = Date.now();
    try {
      const response = await apiClient.get<{ status: string }>("/health");
      const latency = Date.now() - apiStart;
      const isHealthy = response.data?.status === "healthy";

      setServices([
        {
          name: "API Backend",
          status: isHealthy ? "healthy" : "degraded",
          latencyMs: latency,
          detail: isHealthy ? "Operando normalmente" : "Respuesta inesperada",
          checkedAt: now,
        },
        {
          name: "Base de Datos",
          status: isHealthy ? "healthy" : "degraded",
          detail: isHealthy ? "Conexión activa" : "Estado desconocido",
          checkedAt: now,
        },
      ]);
    } catch {
      const latency = Date.now() - apiStart;
      setServices([
        {
          name: "API Backend",
          status: "down",
          latencyMs: latency,
          detail: "No se pudo conectar",
          checkedAt: now,
        },
        {
          name: "Base de Datos",
          status: "down",
          detail: "Inaccesible (API caída)",
          checkedAt: now,
        },
      ]);
    }

    setLastChecked(now);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30_000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  if (isChecking) return null;

  const allHealthy = services.every((s) => s.status === "healthy");
  const anyDown = services.some((s) => s.status === "down");

  const overallColor = anyDown
    ? "from-red-50 to-red-100/50 dark:from-red-900/30 dark:to-red-800/20 border-red-200/60 dark:border-red-800"
    : allHealthy
      ? "from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/20 border-emerald-200/60 dark:border-emerald-800"
      : "from-amber-50 to-amber-100/50 dark:from-amber-900/30 dark:to-amber-800/20 border-amber-200/60 dark:border-amber-800";

  const overallLabel = anyDown
    ? "Sistema con problemas"
    : allHealthy
      ? "Todos los sistemas operativos"
      : "Algunos sistemas degradados";

  const overallTextColor = anyDown
    ? "text-red-700 dark:text-red-300"
    : allHealthy
      ? "text-emerald-700 dark:text-emerald-300"
      : "text-amber-700 dark:text-amber-300";

  return (
    <AdminGuard>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div
          className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${overallColor} p-8 shadow-sm`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Estado del Sistema
              </h1>
              <p className={`text-lg font-medium ${overallTextColor}`}>
                {overallLabel}
              </p>
              {lastChecked && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Última verificación: {lastChecked}
                </p>
              )}
            </div>
            <button
              onClick={checkHealth}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-gray-700 dark:text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Verificar ahora
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>

        {/* Info section */}
        <Card className="p-6 dark:border-gray-700 dark:bg-gray-900/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            Información del entorno
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <InfoRow
              label="Frontend"
              value={`Next.js ${process.env.NEXT_PUBLIC_APP_VERSION || "14"}`}
            />
            <InfoRow
              label="API Base URL"
              value={process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
            />
            <InfoRow
              label="Entorno"
              value={process.env.NODE_ENV || "development"}
            />
            <InfoRow label="Auto-refresh" value="Cada 30 segundos" />
          </div>
        </Card>
      </div>
    </AdminGuard>
  );
}

function ServiceCard({ service }: { service: ServiceStatus }) {
  const isChecking = service.status === "checking";

  const iconProps = {
    healthy: {
      Icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      badge:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      badgeText: "Activo",
    },
    degraded: {
      Icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      badge:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      badgeText: "Degradado",
    },
    down: {
      Icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
      badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
      badgeText: "Caído",
    },
    checking: {
      Icon: Activity,
      color: "text-gray-400",
      bg: "bg-gray-50 dark:bg-gray-800",
      badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      badgeText: "Verificando...",
    },
  }[service.status];

  const serviceIcon =
    service.name === "Base de Datos" ? (
      <Database className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    ) : (
      <Server className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    );

  const { Icon } = iconProps;

  return (
    <Card className="p-6 dark:border-gray-700 dark:bg-gray-900/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            {serviceIcon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {service.name}
            </h3>
            {service.detail && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {service.detail}
              </p>
            )}
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${iconProps.badge}`}
        >
          {iconProps.badgeText}
        </span>
      </div>

      <div className={`flex items-center gap-3 p-3 rounded-lg ${iconProps.bg}`}>
        <Icon
          className={`w-5 h-5 ${iconProps.color} ${isChecking ? "animate-pulse" : ""}`}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {service.status === "checking"
                ? "Verificando conexión..."
                : `Estado: ${iconProps.badgeText}`}
            </span>
            {service.latencyMs !== undefined && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {service.latencyMs} ms
              </span>
            )}
          </div>
          {service.checkedAt && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Verificado a las {service.checkedAt}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-800 dark:text-gray-200 font-mono text-xs">
        {value}
      </span>
    </div>
  );
}
