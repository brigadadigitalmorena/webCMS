"use client";

import { useEffect, useState } from "react";
import { useActivationCodeStore } from "@/store/activation-code-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivationCodesTable } from "@/components/activation/activation-codes-table";
import { CreateCodeModal } from "@/components/activation/create-code-modal";
import { CodeGeneratedModal } from "@/components/activation/code-generated-modal";
import {
  Plus,
  Search,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { ActivationCodeStatus } from "@/types/activation";

export default function ActivationCodesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const {
    codes,
    stats,
    isLoading,
    error,
    statusFilter,
    searchTerm,
    currentPage,
    totalPages,
    showGeneratedCode,
    generatedCode,
    fetchCodes,
    fetchStats,
    setStatusFilter,
    setSearchTerm,
    setCurrentPage,
    clearGeneratedCode,
    clearError,
  } = useActivationCodeStore();

  useEffect(() => {
    fetchCodes();
    fetchStats();
  }, [fetchCodes, fetchStats]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      if (searchInput !== searchTerm) {
        fetchCodes();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, searchTerm, fetchCodes, setSearchTerm]);

  const handleCreateCode = () => {
    setShowCreateModal(true);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as ActivationCodeStatus | "all");
  };

  const statsCards = [
    {
      title: "Codigos generados",
      value: stats?.codes.total_generated || 0,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Codigos activos",
      value: stats?.codes.active_codes || 0,
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
    {
      title: "Usados hoy",
      value: stats?.codes.used_codes || 0,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      title: "Intentos fallidos (24h)",
      value: stats?.security.failed_attempts_24h || 0,
      icon: AlertTriangle,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white dark:bg-gray-900 p-6 shadow-sm backdrop-blur">
        <div className="absolute -left-10 top-0 h-28 w-28 rounded-full bg-primary-500/10 blur-2xl" />
        <div className="absolute bottom-0 right-0 h-20 w-20 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Seguridad y acceso
            </p>
            <h1 className="font-display text-3xl font-semibold text-gray-900 dark:text-white">
              Codigos de activacion
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Crea codigos temporales para usuarios preautorizados y monitorea
              intentos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCreateCode} className="gap-2">
              <Plus className="w-4 h-4" />
              Generar codigo
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-600"
            >
              Cerrar
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      {isLoading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email o identificador..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              options={[
                { value: "all", label: "Todos" },
                { value: "active", label: "Activos" },
                { value: "used", label: "Usados" },
                { value: "expired", label: "Expirados" },
                { value: "revoked", label: "Revocados" },
                { value: "locked", label: "Bloqueados" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <ActivationCodesTable
          codes={codes}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Modals */}
      <CreateCodeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <CodeGeneratedModal
        isOpen={showGeneratedCode}
        code={generatedCode || ""}
        onClose={clearGeneratedCode}
      />
    </div>
  );
}
