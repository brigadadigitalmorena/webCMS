"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { User } from "@/types";
import { userService } from "@/lib/api/user.service";
import { surveyService } from "@/lib/api/survey.service";
import { assignmentService } from "@/lib/api/assignment.service";
import { useAuthStore } from "@/store/auth-store";
import {
  X,
  ClipboardList,
  ChevronDown,
  UserCheck,
  Users,
  Check,
  Search,
} from "lucide-react";

interface AssignSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { user_ids: number[]; survey_id: number }) => Promise<void>;
  isLoading?: boolean;
  preselectedSurvey?: { id: number; title: string } | null;
}

interface SurveyOption {
  id: number;
  title: string;
}

export default function AssignSurveyModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  preselectedSurvey,
}: AssignSurveyModalProps) {
  const currentUser = useAuthStore((state) => state.user);
  const isEncargadoUser = currentUser?.rol === "encargado";
  const [mounted, setMounted] = useState(false);
  const [encargados, setEncargados] = useState<User[]>([]);
  const [brigadistas, setBrigadistas] = useState<User[]>([]);
  const [surveys, setSurveys] = useState<SurveyOption[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [surveyId, setSurveyId] = useState<number | "">("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [roleTab, setRoleTab] = useState<"encargado" | "brigadista">(
    isEncargadoUser ? "brigadista" : "encargado",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [alreadyAssignedUserIds, setAlreadyAssignedUserIds] = useState<number[]>([]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted || !isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, mounted]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedUserIds([]);
    setAlreadyAssignedUserIds([]);
    setSearchTerm("");
    setError("");
    setRoleTab(isEncargadoUser ? "brigadista" : "encargado");
    setSurveyId(preselectedSurvey ? preselectedSurvey.id : "");

    const load = async () => {
      setLoadingData(true);
      try {
        const [enc, brig] = await Promise.all([
          isEncargadoUser
            ? Promise.resolve([] as User[])
            : userService.getUsers({ rol: "encargado", activo: true }),
          userService.getUsers({ rol: "brigadista", activo: true }),
        ]);

        let surveyOptions: SurveyOption[] = [];
        if (isEncargadoUser && currentUser?.id) {
          const myAssignments = await assignmentService.getUserAssignments(
            currentUser.id,
            {
              status: "active",
              limit: 200,
            },
          );
          const surveyMap = new Map<number, SurveyOption>();

          myAssignments.forEach((assignment) => {
            if (
              assignment.survey
            ) {
              surveyMap.set(assignment.survey_id, {
                id: assignment.survey.id,
                title: assignment.survey.title,
              });
            }
          });

          surveyOptions = Array.from(surveyMap.values()).sort((a, b) =>
            a.title.localeCompare(b.title),
          );
        } else {
          const surveyList = await surveyService.getSurveys({ limit: 200 });
          surveyOptions = surveyList
            .filter((s) => s.is_active)
            .map((s) => ({ id: s.id, title: s.title }));
        }

        setEncargados(enc);
        setBrigadistas(brig);
        setSurveys(surveyOptions);
      } catch {
        setError("Error al cargar datos.");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [isOpen, preselectedSurvey, currentUser?.id, currentUser?.rol, isEncargadoUser]);

  useEffect(() => {
    if (!isOpen || !surveyId) {
      setAlreadyAssignedUserIds([]);
      setSelectedUserIds([]);
      return;
    }

    const loadAssignedUsers = async () => {
      try {
        const assignments = await assignmentService.getSurveyAssignments(
          Number(surveyId),
          {
            status: "active",
            limit: 200,
          },
        );
        setAlreadyAssignedUserIds(assignments.map((a) => a.user_id));
        setSelectedUserIds([]);
      } catch {
        setAlreadyAssignedUserIds([]);
      }
    };

    loadAssignedUsers();
  }, [isOpen, surveyId]);

  const roleUsers = useMemo(
    () => (roleTab === "encargado" ? encargados : brigadistas),
    [roleTab, encargados, brigadistas],
  );

  const roleUserIdSet = useMemo(
    () => new Set(roleUsers.map((u) => u.id)),
    [roleUsers],
  );

  const alreadyAssignedInRole = useMemo(
    () => alreadyAssignedUserIds.filter((id) => roleUserIdSet.has(id)),
    [alreadyAssignedUserIds, roleUserIdSet],
  );

  const activeUsers = roleUsers;

  const filteredUsers = searchTerm
    ? activeUsers.filter((u) =>
        `${u.nombre} ${u.apellido}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      )
    : activeUsers;

  const toggleUser = (userId: number) => {
    if (alreadyAssignedUserIds.includes(userId)) return;
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const selectAll = () => {
    const ids = filteredUsers
      .map((u) => u.id)
      .filter((id) => !alreadyAssignedUserIds.includes(id));

    if (ids.length === 0) return;

    const allSelected = ids.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyId || selectedUserIds.length === 0) {
      setError("Selecciona una encuesta y al menos un usuario.");
      return;
    }
    setError("");
    try {
      await onSubmit({
        survey_id: Number(surveyId),
        user_ids: selectedUserIds,
      });
    } catch (err: any) {
      const msg =
        err?.message ??
        err?.response?.data?.detail ??
        "Error al crear asignación.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-xl max-h-[min(100dvh-2rem,42rem)] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Nueva asignación
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto flex-1"
        >
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
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
              {/* Step 1 — Survey */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  Encuesta
                </label>
                {preselectedSurvey ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                    <ClipboardList className="h-4 w-4 text-primary-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-primary-800 dark:text-primary-300">
                      {preselectedSurvey.title}
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={surveyId}
                      onChange={(e) =>
                        setSurveyId(
                          e.target.value ? Number(e.target.value) : "",
                        )
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

              {/* Step 2 — Role tab */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  ¿A quién asignas?
                </label>
                <div className={`grid gap-2 ${isEncargadoUser ? "grid-cols-1" : "grid-cols-2"}`}>
                  {!isEncargadoUser && (
                    <button
                      type="button"
                      onClick={() => {
                        setRoleTab("encargado");
                        setSelectedUserIds([]);
                        setSearchTerm("");
                      }}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        roleTab === "encargado"
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                          : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <UserCheck className="h-4 w-4" />
                      Encargado
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setRoleTab("brigadista");
                      setSelectedUserIds([]);
                      setSearchTerm("");
                    }}
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
                  {isEncargadoUser
                    ? "Solo puedes asignar brigadistas a las encuestas donde eres encargado."
                    : roleTab === "encargado"
                      ? "El encargado supervisa y coordina esta encuesta."
                      : "El brigadista la aplica en campo."}
                </p>
              </div>

              {/* Step 3 — Multi-select users */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  {roleTab === "encargado"
                    ? "Seleccionar encargados"
                    : "Seleccionar brigadistas"}
                  {selectedUserIds.length > 0 && (
                    <span className="ml-auto text-xs font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">
                      {selectedUserIds.length} seleccionado
                      {selectedUserIds.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </label>
                {alreadyAssignedInRole.length > 0 && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1.5">
                    {alreadyAssignedInRole.length} ya asignado
                    {alreadyAssignedInRole.length !== 1 ? "s" : ""} a esta encuesta.
                  </p>
                )}

                {/* Search */}
                {activeUsers.length > 5 && (
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre..."
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-gray-400"
                    />
                  </div>
                )}

                {/* Select all toggle */}
                {filteredUsers.length > 1 && (
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium mb-1.5"
                  >
                    {filteredUsers.every((u) => selectedUserIds.includes(u.id))
                      ? "Deseleccionar todos"
                      : "Seleccionar todos"}
                  </button>
                )}

                {/* User list */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic p-3 text-center">
                      {searchTerm
                        ? "Sin resultados"
                        : `No hay ${roleTab === "encargado" ? "encargados" : "brigadistas"} activos.`}
                    </p>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelected = selectedUserIds.includes(u.id);
                      const isAlreadyAssigned = alreadyAssignedUserIds.includes(u.id);
                      const isChecked = isSelected || isAlreadyAssigned;
                      return (
                        <label
                          key={u.id}
                          className={`flex items-center gap-3 px-3 py-2.5 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                            isChecked
                              ? "bg-primary-50/50 dark:bg-primary-900/10"
                              : ""
                          } ${
                            isAlreadyAssigned
                              ? "cursor-not-allowed opacity-90"
                              : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isChecked
                                ? "bg-primary-600 border-primary-600"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {isChecked && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleUser(u.id)}
                            disabled={isAlreadyAssigned}
                            className="sr-only"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {u.nombre} {u.apellido}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate flex items-center gap-2">
                              <span>{u.email}</span>
                              {isAlreadyAssigned && (
                                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                  Ya asignado
                                </span>
                              )}
                            </p>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </form>

        <div className="flex justify-end gap-3 px-6 pb-6 flex-shrink-0">
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
            disabled={
              isLoading ||
              loadingData ||
              !surveyId ||
              selectedUserIds.length === 0
            }
          >
            {isLoading
              ? "Asignando..."
              : `Asignar${selectedUserIds.length > 1 ? ` (${selectedUserIds.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
