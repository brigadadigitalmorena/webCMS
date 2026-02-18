"use client";

import { useState, useEffect } from "react";
import { Question, QuestionType, AnswerOption } from "@/types";
import {
  X,
  Plus,
  GripVertical,
  Trash2,
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  SlidersHorizontal,
  BarChart3,
  Star,
  CheckSquare,
  CircleDot,
  ToggleLeft,
  Calendar,
  Clock,
  CalendarClock,
  MapPin,
  Camera,
  FileUp,
  PenTool,
  ScanLine,
} from "lucide-react";

interface CreateSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    questions: Omit<Question, "id" | "version_id">[];
  }) => void;
  initialData?: {
    title: string;
    description?: string;
    questions?: Question[];
  };
  isLoading?: boolean;
}

const questionTypeIcons: Record<QuestionType, any> = {
  // Text
  text: Type,
  textarea: AlignLeft,
  email: Mail,
  phone: Phone,
  // Numeric
  number: Hash,
  slider: SlidersHorizontal,
  scale: BarChart3,
  rating: Star,
  // Choice
  single_choice: CircleDot,
  multiple_choice: CheckSquare,
  yes_no: ToggleLeft,
  // Date/Time
  date: Calendar,
  time: Clock,
  datetime: CalendarClock,
  // Media & special
  photo: Camera,
  file: FileUp,
  signature: PenTool,
  location: MapPin,
  ine_ocr: ScanLine,
};

const questionTypeLabels: Record<QuestionType, string> = {
  // Text
  text: "Texto corto",
  textarea: "Texto largo",
  email: "Correo electrónico",
  phone: "Teléfono",
  // Numeric
  number: "Número",
  slider: "Rango deslizable",
  scale: "Escala numérica",
  rating: "Calificación (estrellas)",
  // Choice
  single_choice: "Selección única",
  multiple_choice: "Selección múltiple",
  yes_no: "Sí / No",
  // Date/Time
  date: "Fecha",
  time: "Hora",
  datetime: "Fecha y hora",
  // Media & special
  photo: "Fotografía",
  file: "Archivo / Documento",
  signature: "Firma digital",
  location: "Ubicación GPS",
  ine_ocr: "Captura INE (OCR)",
};

const questionTypeGroups: { label: string; types: QuestionType[] }[] = [
  { label: "Texto", types: ["text", "textarea", "email", "phone"] },
  { label: "Numérico", types: ["number", "slider", "scale", "rating"] },
  { label: "Selección", types: ["single_choice", "multiple_choice", "yes_no"] },
  { label: "Fecha / Hora", types: ["date", "time", "datetime"] },
  {
    label: "Multimedia y especial",
    types: ["photo", "file", "signature", "location", "ine_ocr"],
  },
];

export default function CreateSurveyModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: CreateSurveyModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<
    Omit<Question, "id" | "version_id">[]
  >([]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setQuestions(
        initialData.questions?.map((q) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          order: q.order,
          is_required: q.is_required,
          validation_rules: q.validation_rules,
          options: q.options,
        })) || [],
      );
    } else {
      setTitle("");
      setDescription("");
      setQuestions([]);
    }
  }, [initialData, isOpen]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "text",
        order: questions.length + 1,
        is_required: false,
        options: [],
      },
    ]);
  };

  const updateQuestion = (
    index: number,
    field: keyof Omit<Question, "id" | "version_id">,
    value: any,
  ) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    // Reorder remaining questions
    updated.forEach((q, i) => {
      q.order = i + 1;
    });
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    const options = updated[questionIndex].options || [];
    updated[questionIndex].options = [
      ...options,
      {
        id: Date.now(), // temporary ID
        option_text: "",
        order: options.length + 1,
      },
    ];
    setQuestions(updated);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    const updated = [...questions];
    const options = updated[questionIndex].options || [];
    options[optionIndex].option_text = value;
    setQuestions(updated);
  };

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    const options = (updated[questionIndex].options || []).filter(
      (_, i) => i !== optionIndex,
    );
    // Reorder remaining options
    options.forEach((opt, i) => {
      opt.order = i + 1;
    });
    updated[questionIndex].options = options;
    setQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.length === 0) {
      alert("Debes agregar un título y al menos una pregunta");
      return;
    }
    onSubmit({ title, description, questions });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? "Editar Encuesta" : "Nueva Encuesta"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Encuesta *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ej: Encuesta de Satisfacción"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Descripción opcional de la encuesta"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Preguntas</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Pregunta
              </button>
            </div>

            {questions.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">
                  No hay preguntas. Haz clic en "Agregar Pregunta" para
                  comenzar.
                </p>
              </div>
            )}

            {questions.map((question, qIndex) => {
              const Icon = questionTypeIcons[question.question_type];
              const needsOptions =
                question.question_type === "single_choice" ||
                question.question_type === "multiple_choice";
              const needsRangeConfig =
                question.question_type === "slider" ||
                question.question_type === "scale" ||
                question.question_type === "rating";

              return (
                <div
                  key={qIndex}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <GripVertical className="h-5 w-5 text-gray-400 mt-2 flex-shrink-0" />

                    <div className="flex-1 space-y-3">
                      {/* Question text */}
                      <div>
                        <input
                          type="text"
                          value={question.question_text}
                          onChange={(e) =>
                            updateQuestion(
                              qIndex,
                              "question_text",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                          placeholder={`Pregunta ${qIndex + 1}`}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      {/* Question type and required */}
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <select
                            value={question.question_type}
                            onChange={(e) =>
                              updateQuestion(
                                qIndex,
                                "question_type",
                                e.target.value as QuestionType,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            disabled={isLoading}
                          >
                            {questionTypeGroups.map((group) => (
                              <optgroup key={group.label} label={group.label}>
                                {group.types.map((type) => (
                                  <option key={type} value={type}>
                                    {questionTypeLabels[type]}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>

                        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={question.is_required}
                            onChange={(e) =>
                              updateQuestion(
                                qIndex,
                                "is_required",
                                e.target.checked,
                              )
                            }
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            disabled={isLoading}
                          />
                          <span className="text-sm text-gray-700">
                            Requerida
                          </span>
                        </label>
                      </div>

                      {/* Range config for slider / scale / rating */}
                      {needsRangeConfig && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {question.question_type !== "rating" && (
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1 block">
                                Mínimo
                              </label>
                              <input
                                type="number"
                                value={
                                  question.validation_rules?.min ??
                                  (question.question_type === "scale" ? 1 : 0)
                                }
                                onChange={(e) =>
                                  updateQuestion(qIndex, "validation_rules", {
                                    ...question.validation_rules,
                                    min: Number(e.target.value),
                                  })
                                }
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
                                disabled={isLoading}
                              />
                            </div>
                          )}
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              {question.question_type === "rating"
                                ? "Estrellas"
                                : "Máximo"}
                            </label>
                            <input
                              type="number"
                              value={
                                question.validation_rules?.max ??
                                (question.question_type === "rating"
                                  ? 5
                                  : question.question_type === "scale"
                                    ? 10
                                    : 100)
                              }
                              onChange={(e) =>
                                updateQuestion(qIndex, "validation_rules", {
                                  ...question.validation_rules,
                                  max: Number(e.target.value),
                                })
                              }
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
                              disabled={isLoading}
                            />
                          </div>
                          {question.question_type === "slider" && (
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1 block">
                                Paso
                              </label>
                              <input
                                type="number"
                                value={question.validation_rules?.step ?? 1}
                                onChange={(e) =>
                                  updateQuestion(qIndex, "validation_rules", {
                                    ...question.validation_rules,
                                    step: Number(e.target.value),
                                  })
                                }
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
                                disabled={isLoading}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Options for choice questions */}
                      {needsOptions && (
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">
                              Opciones
                            </label>
                            <button
                              type="button"
                              onClick={() => addOption(qIndex)}
                              className="text-xs text-primary-600 hover:text-primary-700"
                              disabled={isLoading}
                            >
                              + Agregar Opción
                            </button>
                          </div>

                          {question.options?.map((option, oIndex) => (
                            <div key={oIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={option.option_text}
                                onChange={(e) =>
                                  updateOption(qIndex, oIndex, e.target.value)
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                                placeholder={`Opción ${oIndex + 1}`}
                                required
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => deleteOption(qIndex, oIndex)}
                                className="text-red-500 hover:text-red-700 p-2"
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}

                          {(!question.options ||
                            question.options.length === 0) && (
                            <p className="text-xs text-gray-500 italic">
                              Agrega al menos una opción
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700 p-2 mt-1 flex-shrink-0"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isLoading || !title.trim() || questions.length === 0}
          >
            {isLoading
              ? "Guardando..."
              : initialData
                ? "Guardar Cambios"
                : "Crear Encuesta"}
          </button>
        </div>
      </div>
    </div>
  );
}
