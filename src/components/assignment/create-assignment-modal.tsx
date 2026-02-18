"use client";

import { useState, useEffect } from "react";
import { User, Survey } from "@/types";
import { userService } from "@/lib/api/user.service";
import { surveyService } from "@/lib/api/survey.service";
import {
  X,
  User as UserIcon,
  ClipboardList,
  MapPin,
  ChevronDown,
} from "lucide-react";

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    user_id: number;
    survey_id: number;
    location?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateAssignmentModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateAssignmentModalProps) {
  const [brigadistas, setBrigadistas] = useState<User[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [userId, setUserId] = useState<number | "">("");
  const [surveyId, setSurveyId] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setUserId("");
    setSurveyId("");
    setLocation("");
    setError("");

    const load = async () => {
      setLoadingData(true);
      try {
        const [users, surveyList] = await Promise.all([
          userService.getUsers({ rol: "brigadista", activo: true }),
          surveyService.getSurveys({ limit: 200 }),
        ]);
        setBrigadistas(users);
        setSurveys(surveyList.filter((s) => s.is_active));
      } catch {
        setError("Error al cargar datos. Intenta de nuevo.");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !surveyId) {
      setError("Selecciona un brigadista y una encuesta.");
      return;
    }
    setError("");
    try {
      await onSubmit({
        user_id: Number(userId),
        survey_id: Number(surveyId),
        location: location.trim() || undefined,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "Error al crear asignación.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Nueva Asignación</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loadingData ? (
            <div className="py-8 text-center text-gray-500">
              <div className="animate-spin h-7 w-7 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
              Cargando brigadistas y encuestas...
            </div>
          ) : (
            <>
              {/* Brigadista */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  Brigadista *
                </label>
                <div className="relative">
                  <select
                    value={userId}
                    onChange={(e) =>
                      setUserId(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white appearance-none"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar brigadista...</option>
                    {brigadistas.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} {u.apellido} — {u.email}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {brigadistas.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No hay brigadistas activos disponibles.
                  </p>
                )}
              </div>

              {/* Encuesta */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                  <ClipboardList className="h-4 w-4 text-gray-400" />
                  Encuesta *
                </label>
                <div className="relative">
                  <select
                    value={surveyId}
                    onChange={(e) =>
                      setSurveyId(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white appearance-none"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar encuesta...</option>
                    {surveys.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {surveys.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No hay encuestas activas disponibles.
                  </p>
                )}
              </div>

              {/* Zona / Ubicación */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  Zona / Ubicación
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Colonia Centro, Cuadra 3"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isLoading}
                />
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={isLoading || loadingData || !userId || !surveyId}
          >
            {isLoading ? "Creando..." : "Crear Asignación"}
          </button>
        </div>
      </div>
    </div>
  );
}
