"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Users,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Clock,
  AlertCircle,
  Activity,
  RefreshCw,
} from "lucide-react";
import { statsService, type AdminStats } from "@/lib/api/stats.service";

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

  const fetchStats = async () => {
    try {
      setError(null);
      const data = await statsService.getAdminStats();
      setStats({
        ...data,
        lastUpdated: new Date().toLocaleTimeString(),
      });
    } catch {
      setError("No se pudieron cargar las estadísticas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60_000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: "Total de Usuarios",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      lightColor: "from-blue-50 to-blue-100",
      darkColor: "dark:from-blue-900/20",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Encuestas Activas",
      value: stats.activeSurveys,
      icon: ClipboardList,
      color: "from-purple-500 to-purple-600",
      lightColor: "from-purple-50 to-purple-100",
      darkColor: "dark:from-purple-900/20",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Asignaciones Completadas",
      value: stats.completedAssignments,
      icon: CheckCircle2,
      color: "from-emerald-500 to-emerald-600",
      lightColor: "from-emerald-50 to-emerald-100",
      darkColor: "dark:from-emerald-900/20",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Respuestas Totales",
      value: stats.totalResponses,
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      lightColor: "from-orange-50 to-orange-100",
      darkColor: "dark:from-orange-900/20",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const detailCards = [
    {
      title: "Asignaciones Pendientes",
      value: stats.pendingAssignments,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Brigadistas Activos",
      value: stats.activeBrigadistas,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Tasa de Respuesta",
      value: `${stats.responseRate}%`,
      icon: BarChart3,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden rounded-2xl border border-primary-200/60 bg-gradient-to-br from-primary-50 to-primary-100/50 p-8 shadow-sm">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary-200/20 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-32 w-32 rounded-full bg-primary-100/20 blur-2xl" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary-900 mb-2">
              Dashboard
            </h1>
            <p className="text-primary-700 text-lg">
              Bienvenido a tu panel de control de Brigada
            </p>
            <p className="text-primary-600 text-sm mt-2">
              Actualizado: {stats.lastUpdated}
            </p>
          </div>
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-900 hover:bg-white text-primary-700 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Actualizar
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Grid - Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-xl border border-white/60 bg-white dark:bg-gray-900 backdrop-blur shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.lightColor} transition-opacity`}
              />

              <div className="relative p-6">
                {/* Icon Container */}
                <div
                  className={`inline-flex p-3 rounded-lg ${card.bgColor} mb-4`}
                >
                  <Icon className={`h-6 w-6 ${card.textColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {card.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    card.value
                  )}
                </p>

                {/* Accent Bar */}
                <div
                  className={`h-1 w-12 rounded-full bg-gradient-to-r ${card.color} mt-4`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {detailCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className="border-white/60 shadow-sm hover:shadow-md transition-all"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </h3>
                  <div className={`inline-flex p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>

                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions / Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <Card className="border-white/60">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              Resumen Rápido
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Encuestas en Progreso
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.activeSurveys}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Tasa de Respuesta
                </span>
                <span className="font-semibold text-emerald-600">
                  {stats.responseRate}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Promedio Completado
                </span>
                <span className="font-semibold text-primary-600">
                  {stats.completedAssignments > 0
                    ? (
                        stats.totalResponses / stats.completedAssignments
                      ).toFixed(1)
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* System Status */}
        <Card className="border-white/60">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              Estado del Sistema
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  API Backend
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">
                    Activo
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Base de Datos
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">
                    Conectado
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Infraestructura
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">
                    Óptimo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
