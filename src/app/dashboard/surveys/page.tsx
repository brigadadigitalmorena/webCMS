"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Survey, Question } from "@/types";
import { surveyService } from "@/lib/api/survey.service";
import SurveyList from "@/components/survey/survey-list";
import CreateSurveyModal from "@/components/survey/create-survey-modal";
import SurveyDetailsModal from "@/components/survey/survey-details-modal";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";
import { useAsync } from "@/hooks/use-async";
import { useDisclosure } from "@/hooks/use-disclosure";

export default function SurveysPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | undefined>(
    undefined,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const {
    data: surveys,
    isLoading,
    refetch: loadSurveys,
  } = useAsync(
    () => surveyService.getSurveys({ is_active: filterActive }),
    [filterActive],
  );

  // Edit / create modal — data is undefined for "create" mode, Survey for "edit" mode.
  const editModal = useDisclosure<Survey>();
  // Details modal — data can be refreshed in-place after a publish action.
  const detailsModal = useDisclosure<Survey>();

  const handleCreateSurvey = async (data: {
    title: string;
    description?: string;
    starts_at?: string | null;
    ends_at?: string | null;
    estimated_duration_minutes?: number | null;
    max_responses?: number | null;
    allow_anonymous?: boolean;
    questions: Omit<Question, "id" | "version_id">[];
  }) => {
    try {
      setIsSaving(true);
      await surveyService.createSurvey(data);
      editModal.close();
      await loadSurveys();
    } catch (error: any) {
      console.error("Error creating survey:", error);
      toast.error(error.response?.data?.detail || "Error al crear la encuesta");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSurvey = async (data: {
    title: string;
    description?: string;
    starts_at?: string | null;
    ends_at?: string | null;
    estimated_duration_minutes?: number | null;
    max_responses?: number | null;
    allow_anonymous?: boolean;
    questions: Omit<Question, "id" | "version_id">[];
  }) => {
    if (!editModal.data) return;

    try {
      setIsSaving(true);
      await surveyService.updateSurvey(editModal.data.id, {
        ...data,
        change_summary: "Actualización manual desde CMS",
      });
      editModal.close();
      await loadSurveys();
    } catch (error: any) {
      console.error("Error updating survey:", error);
      toast.error(
        error.response?.data?.detail || "Error al actualizar la encuesta",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSurvey = async (survey: Survey) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar la encuesta "${survey.title}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    try {
      await surveyService.deleteSurvey(survey.id);
      await loadSurveys();
    } catch (error) {
      console.error("Error deleting survey:", error);
      toast.error("Error al eliminar la encuesta");
    }
  };

  const handleToggleStatus = async (survey: Survey) => {
    try {
      await surveyService.updateSurvey(survey.id, {
        is_active: !survey.is_active,
      });
      await loadSurveys();
    } catch (error) {
      console.error("Error toggling survey status:", error);
      toast.error("Error al cambiar el estado de la encuesta");
    }
  };

  const handleView = async (survey: Survey) => {
    try {
      const fullSurvey = await surveyService.getSurvey(survey.id);
      detailsModal.open(fullSurvey);
    } catch (error) {
      console.error("Error loading survey details:", error);
      toast.error("Error al cargar los detalles de la encuesta");
    }
  };

  const handlePublishVersion = async (versionId: number) => {
    if (!detailsModal.data) return;

    if (
      !confirm(
        "¿Estás seguro de publicar esta versión? Las apps móviles comenzarán a usar esta versión de la encuesta.",
      )
    ) {
      return;
    }

    try {
      setIsPublishing(true);
      await surveyService.publishVersion(detailsModal.data.id, versionId);
      // Reload survey details
      const updatedSurvey = await surveyService.getSurvey(detailsModal.data.id);
      detailsModal.setData(updatedSurvey);
      await loadSurveys();
    } catch (error: any) {
      console.error("Error publishing version:", error);
      toast.error(
        error.response?.data?.detail || "Error al publicar la versión",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEdit = async (survey: Survey) => {
    try {
      const fullSurvey = await surveyService.getSurvey(survey.id);
      // Get the latest version's questions
      const latestVersion = fullSurvey.versions?.sort(
        (a, b) => b.version_number - a.version_number,
      )[0];

      editModal.open(
        latestVersion
          ? { ...fullSurvey, versions: [latestVersion] }
          : fullSurvey,
      );
    } catch (error) {
      console.error("Error loading survey for edit:", error);
      toast.error("Error al cargar la encuesta para editar");
    }
  };

  const filteredSurveys = (surveys ?? []).filter((survey) =>
    survey.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Encuestas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las encuestas para recopilar información
          </p>
        </div>
        <button
          onClick={() => editModal.open()}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          disabled={isLoading}
        >
          <Plus className="h-5 w-5" />
          Nueva Encuesta
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar encuestas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          <button
            onClick={() =>
              setFilterActive(filterActive === undefined ? true : undefined)
            }
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              filterActive === true
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <Filter className="h-4 w-4" />
            Activas
          </button>
          <button
            onClick={() =>
              setFilterActive(filterActive === undefined ? false : undefined)
            }
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              filterActive === false
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <Filter className="h-4 w-4" />
            Inactivas
          </button>
          <button
            onClick={loadSurveys}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Survey List */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-12 text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Cargando encuestas...
          </p>
        </div>
      ) : (
        <SurveyList
          surveys={filteredSurveys}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteSurvey}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Create/Edit Modal */}
      <CreateSurveyModal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        onSubmit={editModal.data ? handleEditSurvey : handleCreateSurvey}
        initialData={
          editModal.data
            ? {
                title: editModal.data.title,
                description: editModal.data.description,
                starts_at: editModal.data.starts_at,
                ends_at: editModal.data.ends_at,
                estimated_duration_minutes:
                  editModal.data.estimated_duration_minutes,
                max_responses: editModal.data.max_responses,
                allow_anonymous: editModal.data.allow_anonymous,
                questions: editModal.data.versions?.[0]?.questions || [],
              }
            : undefined
        }
        isLoading={isSaving}
      />

      {/* Details Modal */}
      <SurveyDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.close}
        survey={detailsModal.data ?? null}
        onPublish={handlePublishVersion}
        isPublishing={isPublishing}
      />
    </div>
  );
}
