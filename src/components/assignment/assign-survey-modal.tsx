"use client";

import { useState, useEffect } from "react";
import { User, Survey } from "@/types";
import { userService } from "@/lib/api/user.service";
import { surveyService } from "@/lib/api/survey.service";
import {
  X,
  ClipboardList,
  MapPin,
  ChevronDown,
  UserCheck,
  Users,
} from "lucide-react";

interface AssignSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    user_id: number;
    survey_id: number;
    location?: string;
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
  preselectedSurvey?: { id: number; title: string } | null;
}

export default function AssignSurveyModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  preselectedSurvey,
}: AssignSurveyModalProps) {
  const [encargados, setEncargados] = useState<User[]>([]);
  const [brigadistas, setBrigadistas] = useState<User[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [surveyId, setSurveyId] = useState<number | "">("");
  const [userId, setUserId] = useState<number | "">("");
  const [roleTab, setRoleTab] = useState<"encargado" | "brigadista">("encargado");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setUserId("");
    setLocation("");
    setError("");
    setRoleTab("encargado");
    setSurveyId(preselectedSurvey ? preselectedSurvey.id : "");

    const load = async () => {
      setLoadingData(true);
      try {
        const [enc, brig, surveyList] = await Promise.all([
          userService.getUsers({ rol: "encargado", activo: true }),
          userService.getUsers({ rol: "brigadista", activo: true }),
          surveyService.getSurveys({ limit: 200 }),
        ]);
        setEncargados(enc);
        setBrigadistas(brig);
        setSurveys(surveyList.filter((s) => s.is_active));
      } catch {
        setError("Error al cargar datos.");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [isOpen, preselectedSurvey]);

  const activeUsers = roleTab === "encargado" ? encargados : brigadistas;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyId || !userId) {
      setError("Selecciona una encuesta y un usuario.");
      return;
    }
    setError("");
    try {
      await onSubmit({
        survey_id: Number(surveyId),
        user_id: Number(userId),
        location: location.trim() || undefined,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "Error al crear asignacion.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nueva asignacion</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loadingData ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin h-7 w-7 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
              Cargando...
            </div>
          ) : (
            <>
              {/* Step 1 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  Encuesta
                </label>
                {preselectedSurvey ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-primary-50 border border-primary-200 rounded-lg">
                    <ClipboardList className="h-4 w-4 text-primary-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-primary-800">
                      {preselectedSurvey.title}
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={surveyId}
                      onChange={(e) =>
                        setSurveyId(e.target.value ? Number(e.target.value) : "")
                      }
                      className="w-full pl-3 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 appearance-none"
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
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Step 2 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  A quien asignas?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setRoleTab("encargado"); setUserId(""); }}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      roleTab === "encargado"
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    Encargado
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRoleTab("brigadista"); setUserId(""); }}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      roleTab === "brigadista"
                        ? "bg-purple-50 border-purple-300 text-purple-700"
                        : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Brigadista
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                  {roleTab === "encargado"
                    ? "El encargado supervisa y coordina esta encuesta."
                    : "El brigadista la aplica en campo."}
                </p>
              </div>

              {/* Step 3 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  {roleTab === "encargado" ? "Seleccionar encargado" : "Seleccionar brigadista"}
                </label>
                <div className="relative">
                  <select
                    value={userId}
                    onChange={(e) =>
                      setUserId(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full pl-3 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 appearance-none"
                    required
                    disabled={isLoading}
                  >
                    <option value="">
                      {roleTab === "encargado"
                        ? "Seleccionar encargado..."
                        : "Seleccionar brigadista..."}
                    </option>
                    {activeUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} {u.apellido}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
                {activeUsers.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No hay{" "}
                    {roleTab === "encargado" ? "encargados" : "brigadistas"}{" "}
                    activos.
                  </p>
                )}
              </div>

              {/* Zona */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  Zona / Sector
                  <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Colonia Centro, Sector Norte"
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isLoading}
                />
              </div>
            </>
          )}
        </form>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={isLoading || loadingData || !surveyId || !userId}
          >
            {isLoading ? "Asignando..." : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}
