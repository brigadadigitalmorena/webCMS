"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  quotaService,
  QuotaResponse,
  QuotaInfo,
} from "@/lib/api/quota.service";

export function QuotaDisplay() {
  const [quotas, setQuotas] = useState<QuotaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuotas = async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const data = await quotaService.getAllQuotas();
      setQuotas(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar las quotas",
      );
    } finally {
      if (isRefresh) setIsRefreshing(false);
      else setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotas();
    // Refrescar cada 5 minutos
    const interval = setInterval(() => loadQuotas(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const renderQuotaCard = (
    icon: React.ComponentType<{ className?: string }>,
    title: string,
    info: QuotaInfo | undefined,
  ) => {
    const Icon = icon;

    if (!info) {
      return (
        <Card key={title} className="p-6">
          <div className="flex items-start gap-4">
            <Icon className="w-6 h-6 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </Card>
      );
    }

    const isSuccess = info.status === "success";
    const StatusIcon = isSuccess ? CheckCircle2 : AlertCircle;
    const statusColor = isSuccess
      ? "text-green-600"
      : "text-red-600";

    return (
      <Card key={title} className="p-6">
        <div className="flex items-start gap-4">
          <Icon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <StatusIcon className={`w-4 h-4 ${statusColor}`} />
            </div>

            {isSuccess ? (
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {title === "Render" && info.data && (
                  <>
                    <p>
                      <strong>Servicios activos:</strong>{" "}
                      {info.data.activeServices}/{info.data.totalServices}
                    </p>
                    <p>
                      <strong>CPU asignado:</strong> {info.data.totalCpus} cores
                    </p>
                    <p>
                      <strong>Memoria:</strong> {info.data.totalMemory}MB
                    </p>
                  </>
                )}

                {title === "Neon DB" && info.data && (
                  <>
                    <p>
                      <strong>Proyecto:</strong> {info.data.projectName}
                    </p>
                    <p>
                      <strong>Branches:</strong> {info.data.branches}
                    </p>
                    <p>
                      <strong>Región:</strong> {info.data.region}
                    </p>
                    {info.lastUpdated && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Actualizado:{" "}
                        {new Date(info.lastUpdated).toLocaleTimeString()}
                      </p>
                    )}
                  </>
                )}

                {title === "Cloudinary" && info.data && (
                  <>
                    <p>
                      <strong>Almacenamiento:</strong>{" "}
                      {info.data.storageUsed.gb}
                      GB
                    </p>
                    <p>
                      <strong>Transferencia:</strong>{" "}
                      {info.data.requests.bandwidth.gb}GB
                    </p>
                    <p>
                      <strong>Assets:</strong> {info.data.mediaAssets}
                    </p>
                    {info.lastUpdated && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Actualizado:{" "}
                        {new Date(info.lastUpdated).toLocaleTimeString()}
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-600">
                {info.error || "Error desconocido"}
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Estado de Servicios Externos
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Estado de Servicios Externos
        </h2>
        <Button
          onClick={() => loadQuotas(true)}
          disabled={isRefreshing}
          size="sm"
          variant="outline"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderQuotaCard(BarChart3, "Render", quotas?.render)}
        {renderQuotaCard(Database, "Neon DB", quotas?.neon)}
        {renderQuotaCard(Cloud, "Cloudinary", quotas?.cloudinary)}
      </div>

      {quotas && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
          Última actualización: {new Date(quotas.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  );
}
