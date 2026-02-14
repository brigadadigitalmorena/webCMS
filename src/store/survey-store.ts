import { create } from "zustand";
import { Survey, SurveyQuestion, PaginatedResponse } from "@/types";

interface SurveyState {
  surveys: Survey[];
  selectedSurvey: Survey | null;
  surveyQuestions: SurveyQuestion[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };

  // Actions
  setSurveys: (response: PaginatedResponse<Survey>) => void;
  setSelectedSurvey: (survey: Survey | null) => void;
  setSurveyQuestions: (questions: SurveyQuestion[]) => void;
  addSurvey: (survey: Survey) => void;
  updateSurvey: (id: number, survey: Partial<Survey>) => void;
  deleteSurvey: (id: number) => void;
  addQuestion: (question: SurveyQuestion) => void;
  updateQuestion: (id: number, question: Partial<SurveyQuestion>) => void;
  deleteQuestion: (id: number) => void;
  reorderQuestions: (questions: SurveyQuestion[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
}

export const useSurveyStore = create<SurveyState>((set) => ({
  surveys: [],
  selectedSurvey: null,
  surveyQuestions: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    size: 10,
    total: 0,
    pages: 0,
  },

  setSurveys: (response) =>
    set({
      surveys: response.items,
      pagination: {
        page: response.page,
        size: response.size,
        total: response.total,
        pages: response.pages,
      },
    }),

  setSelectedSurvey: (survey) => set({ selectedSurvey: survey }),

  setSurveyQuestions: (questions) => set({ surveyQuestions: questions }),

  addSurvey: (survey) =>
    set((state) => ({
      surveys: [...state.surveys, survey],
    })),

  updateSurvey: (id, updatedSurvey) =>
    set((state) => ({
      surveys: state.surveys.map((survey) =>
        survey.id === id ? { ...survey, ...updatedSurvey } : survey,
      ),
      selectedSurvey:
        state.selectedSurvey?.id === id
          ? { ...state.selectedSurvey, ...updatedSurvey }
          : state.selectedSurvey,
    })),

  deleteSurvey: (id) =>
    set((state) => ({
      surveys: state.surveys.filter((survey) => survey.id !== id),
      selectedSurvey:
        state.selectedSurvey?.id === id ? null : state.selectedSurvey,
    })),

  addQuestion: (question) =>
    set((state) => ({
      surveyQuestions: [...state.surveyQuestions, question],
    })),

  updateQuestion: (id, updatedQuestion) =>
    set((state) => ({
      surveyQuestions: state.surveyQuestions.map((q) =>
        q.id === id ? { ...q, ...updatedQuestion } : q,
      ),
    })),

  deleteQuestion: (id) =>
    set((state) => ({
      surveyQuestions: state.surveyQuestions.filter((q) => q.id !== id),
    })),

  reorderQuestions: (questions) => set({ surveyQuestions: questions }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPage: (page) =>
    set((state) => ({
      pagination: { ...state.pagination, page },
    })),
}));
