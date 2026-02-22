"use client";

import { useState, useEffect } from "react";
import { BarChart3, AlertCircle, Activity, RefreshCw } from "lucide-react";
import { statsService, type AdminStats } from "@/lib/api/stats.service";
import apiClient from "@/lib/api/client";

interface HealthStatus {
  api: "ok" | "error";
  database: "ok" | "error";
}

interface DashboardStats extends AdminStats {
  lastUpdated: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSurveys: 0,
    completedAssignments: 0,
    totalResponses: 0,
    pendingAssignments: 0,
    activeBrigadistas: 0,
    responseRate: 0,
    totalAssignments: 0,
    lastUpdated: new Date().toLocaleTimeString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthStatus>({
    api: "ok",
    database: "ok",
  });

  const fetchHealth = async () => {
    try {
      const { data } = await apiClient.get("/health");
      setHealth({
        api: "ok",
        database: data.database === "connected" ? "ok" : "error",
      });
    } catch (err: any) {
      setHealth({ api: "error", database: "error" });
      if (err?.message === "Session expired") throw err;
    }
  };

  const fetchStats = async () => {
    try {
      setError(null);
      const data = await statsService.getAdminStats();
      setStats({
        ...data,
        lastUpdated: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setError("No se pudieron cargar las estadísticas");
      if (err?.message === "Session expired") throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      try {
        await Promise.all([fetchStats(), fetchHealth()]);
      } catch {
        // If any call fails with a session error, stop polling
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
        return;
      }
    };

    poll();
    interval = setInterval(() => {
      if (alive) poll();
    }, 60_000);

    return () => {
      alive = false;
      if (interval) clearInterval(interval);
    };
  }, []);

  const statCards = [
    {
      title: "Total de Usuarios",
      value: stats.totalUsers,
      textColor: "text-blue-600",
    },
    {
      title: "Encuestas Activas",
      value: stats.activeSurveys,
      textColor: "text-purple-600",
    },
    {
      title: "Asignaciones Completadas",
      value: stats.completedAssignments,
      textColor: "text-emerald-600",
    },
    {
      title: "Respuestas Totales",
      value: stats.totalResponses,
      textColor: "text-orange-600",
    },
  ];

  const detailCards = [
    {
      title: "Asignaciones Pendientes",
      value: stats.pendingAssignments,
      color: "text-amber-600",
    },
    {
      title: "Brigadistas Activos",
      value: stats.activeBrigadistas,
      color: "text-green-600",
    },
    {
      title: "Tasa de Respuesta",
      value: `${stats.responseRate}%`,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Panel de control de Brigada Digital
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-50"
            title="Recargar"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Actualizado: {stats.lastUpdated}
          </span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Main stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {card.title}
            </p>
            <p className={`text-3xl font-bold mt-1 ${card.textColor}`}>
              {isLoading ? (
                <span className="animate-pulse">--</span>
              ) : (
                card.value
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Secondary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {detailCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {card.title}
            </p>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>
              {isLoading ? (
                <span className="animate-pulse">--</span>
              ) : (
                card.value
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen Rápido */}
        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-5 py-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Resumen Rápido
            </h3>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between items-center px-3 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Encuestas en Progreso
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.activeSurveys}
              </span>
            </div>
            <div className="flex justify-between items-center px-3 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tasa de Respuesta
              </span>
              <span className="font-semibold text-emerald-600">
                {stats.responseRate}%
              </span>
            </div>
            <div className="flex justify-between items-center px-3 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Promedio Completado
              </span>
              <span className="font-semibold text-primary-600">
                {stats.completedAssignments > 0
                  ? (stats.totalResponses / stats.completedAssignments).toFixed(
                      1,
                    )
                  : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Estado del Sistema */}
        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-5 py-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Estado del Sistema
            </h3>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                API Backend
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${health.api === "ok" ? "bg-emerald-500" : "bg-red-500"}`}
                />
                <span
                  className={`text-xs font-medium ${health.api === "ok" ? "text-emerald-600" : "text-red-600"}`}
                >
                  {health.api === "ok" ? "Activo" : "Error"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Base de Datos
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${health.database === "ok" ? "bg-emerald-500" : "bg-red-500"}`}
                />
                <span
                  className={`text-xs font-medium ${health.database === "ok" ? "text-emerald-600" : "text-red-600"}`}
                >
                  {health.database === "ok" ? "Conectado" : "Desconectado"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
