import apiClient from "./client";
import { Survey, SurveyQuestion, PaginatedResponse } from "@/types";

interface CreateSurveyData {
  titulo: string;
  descripcion?: string;
  activo?: boolean;
}

interface UpdateSurveyData {
  titulo?: string;
  descripcion?: string;
  activo?: boolean;
}

interface CreateQuestionData {
  pregunta: string;
  tipo_pregunta: string;
  requerido?: boolean;
  orden: number;
  opciones?: string[];
  validacion?: Record<string, any>;
  logica_condicional?: Record<string, any>;
}

interface GetSurveysParams {
  page?: number;
  size?: number;
  activo?: boolean;
  search?: string;
}

export const surveyService = {
  /**
   * Get paginated list of surveys
   */
  async getSurveys(
    params?: GetSurveysParams,
  ): Promise<PaginatedResponse<Survey>> {
    const response = await apiClient.get<PaginatedResponse<Survey>>(
      "/admin/surveys",
      {
        params,
      },
    );
    return response.data;
  },

  /**
   * Get survey by ID
   */
  async getSurvey(id: number): Promise<Survey> {
    const response = await apiClient.get<Survey>(`/admin/surveys/${id}`);
    return response.data;
  },

  /**
   * Create new survey
   */
  async createSurvey(data: CreateSurveyData): Promise<Survey> {
    const response = await apiClient.post<Survey>("/admin/surveys", data);
    return response.data;
  },

  /**
   * Update existing survey
   */
  async updateSurvey(id: number, data: UpdateSurveyData): Promise<Survey> {
    const response = await apiClient.put<Survey>(`/admin/surveys/${id}`, data);
    return response.data;
  },

  /**
   * Delete survey
   */
  async deleteSurvey(id: number): Promise<void> {
    await apiClient.delete(`/admin/surveys/${id}`);
  },

  /**
   * Activate/deactivate survey
   */
  async toggleSurveyStatus(id: number, activo: boolean): Promise<Survey> {
    const response = await apiClient.patch<Survey>(
      `/admin/surveys/${id}/status`,
      { activo },
    );
    return response.data;
  },

  /**
   * Clone survey to create new version
   */
  async cloneSurvey(id: number): Promise<Survey> {
    const response = await apiClient.post<Survey>(`/admin/surveys/${id}/clone`);
    return response.data;
  },

  /**
   * Get survey questions
   */
  async getSurveyQuestions(surveyId: number): Promise<SurveyQuestion[]> {
    const response = await apiClient.get<SurveyQuestion[]>(
      `/admin/surveys/${surveyId}/questions`,
    );
    return response.data;
  },

  /**
   * Create question for survey
   */
  async createQuestion(
    surveyId: number,
    data: CreateQuestionData,
  ): Promise<SurveyQuestion> {
    const response = await apiClient.post<SurveyQuestion>(
      `/admin/surveys/${surveyId}/questions`,
      data,
    );
    return response.data;
  },

  /**
   * Update question
   */
  async updateQuestion(
    surveyId: number,
    questionId: number,
    data: Partial<CreateQuestionData>,
  ): Promise<SurveyQuestion> {
    const response = await apiClient.put<SurveyQuestion>(
      `/admin/surveys/${surveyId}/questions/${questionId}`,
      data,
    );
    return response.data;
  },

  /**
   * Delete question
   */
  async deleteQuestion(surveyId: number, questionId: number): Promise<void> {
    await apiClient.delete(
      `/admin/surveys/${surveyId}/questions/${questionId}`,
    );
  },

  /**
   * Reorder questions
   */
  async reorderQuestions(
    surveyId: number,
    questionIds: number[],
  ): Promise<SurveyQuestion[]> {
    const response = await apiClient.post<SurveyQuestion[]>(
      `/admin/surveys/${surveyId}/questions/reorder`,
      { question_ids: questionIds },
    );
    return response.data;
  },
};
