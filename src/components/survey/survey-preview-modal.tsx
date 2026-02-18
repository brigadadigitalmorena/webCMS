"use client";

import { SurveyVersion, Question } from "@/types";
import {
  X,
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

interface SurveyPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: SurveyVersion | null;
  surveyTitle: string;
  surveyDescription?: string;
}

const questionTypeIcons: Record<string, any> = {
  text: Type,
  textarea: AlignLeft,
  email: Mail,
  phone: Phone,
  number: Hash,
  slider: SlidersHorizontal,
  scale: BarChart3,
  rating: Star,
  single_choice: CircleDot,
  multiple_choice: CheckSquare,
  yes_no: ToggleLeft,
  date: Calendar,
  time: Clock,
  datetime: CalendarClock,
  photo: Camera,
  file: FileUp,
  signature: PenTool,
  location: MapPin,
  ine_ocr: ScanLine,
};

export default function SurveyPreviewModal({
  isOpen,
  onClose,
  version,
  surveyTitle,
  surveyDescription,
}: SurveyPreviewModalProps) {
  if (!isOpen || !version) return null;

  const sortedQuestions = [...version.questions].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary-50 to-primary-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {surveyTitle}
              </h2>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-600 text-white">
                v{version.version_number}
              </span>
            </div>
            {surveyDescription && (
              <p className="text-gray-600">{surveyDescription}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Vista previa - Así se verá en la app móvil
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-2xl mx-auto space-y-6">
            {sortedQuestions.map((question, index) => {
              const Icon = questionTypeIcons[question.question_type] || Type;

              return (
                <div
                  key={question.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-5"
                >
                  {/* Question Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {question.question_text}
                          {question.is_required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 ml-7">
                        {getQuestionTypeLabel(question.question_type)}
                      </p>
                    </div>
                  </div>

                  {/* Question Input Preview */}
                  <div className="ml-11">{renderQuestionInput(question)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {version.questions.length}{" "}
            {version.questions.length === 1 ? "pregunta" : "preguntas"} •{" "}
            {version.questions.filter((q) => q.is_required).length} requeridas
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
          >
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
}

function renderQuestionInput(question: Question) {
  switch (question.question_type) {
    case "text":
      return (
        <input
          type="text"
          placeholder="Respuesta de texto..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
          disabled
        />
      );

    case "textarea":
      return (
        <textarea
          placeholder="Respuesta larga..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 resize-none"
          disabled
        />
      );

    case "email":
      return (
        <input
          type="email"
          placeholder="ejemplo@correo.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
          disabled
        />
      );

    case "phone":
      return (
        <input
          type="tel"
          placeholder="+52 55 1234 5678"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
          disabled
        />
      );

    case "number":
      return (
        <input
          type="number"
          placeholder="0"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
          disabled
        />
      );

    case "slider": {
      const min = question.validation_rules?.min ?? 0;
      const max = question.validation_rules?.max ?? 100;
      const step = question.validation_rules?.step ?? 1;
      return (
        <div className="space-y-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            className="w-full accent-primary-600"
            disabled
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      );
    }

    case "scale": {
      const min = question.validation_rules?.min ?? 1;
      const max = question.validation_rules?.max ?? 10;
      const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      return (
        <div className="flex gap-1 flex-wrap">
          {steps.map((n) => (
            <button
              key={n}
              disabled
              className="w-9 h-9 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-primary-50"
            >
              {n}
            </button>
          ))}
        </div>
      );
    }

    case "rating": {
      const stars = question.validation_rules?.max ?? 5;
      return (
        <div className="flex gap-1">
          {Array.from({ length: stars }).map((_, i) => (
            <Star key={i} className="h-8 w-8 text-gray-300" />
          ))}
        </div>
      );
    }

    case "yes_no":
      return (
        <div className="flex gap-3">
          <button
            disabled
            className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-600 bg-gray-50"
          >
            ✅ Sí
          </button>
          <button
            disabled
            className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-600 bg-gray-50"
          >
            ❌ No
          </button>
        </div>
      );

    case "date":
      return (
        <input
          type="date"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
          disabled
        />
      );

    case "time":
      return (
        <input
          type="time"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
          disabled
        />
      );

    case "datetime":
      return (
        <input
          type="datetime-local"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
          disabled
        />
      );

    case "single_choice":
      return (
        <div className="space-y-2">
          {question.options && question.options.length > 0 ? (
            question.options
              .sort((a, b) => a.order - b.order)
              .map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    className="w-4 h-4 text-primary-600"
                    disabled
                  />
                  <span className="text-gray-700">{option.option_text}</span>
                </label>
              ))
          ) : (
            <p className="text-sm text-gray-500 italic">
              No hay opciones definidas
            </p>
          )}
        </div>
      );

    case "multiple_choice":
      return (
        <div className="space-y-2">
          {question.options && question.options.length > 0 ? (
            question.options
              .sort((a, b) => a.order - b.order)
              .map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 rounded"
                    disabled
                  />
                  <span className="text-gray-700">{option.option_text}</span>
                </label>
              ))
          ) : (
            <p className="text-sm text-gray-500 italic">
              No hay opciones definidas
            </p>
          )}
        </div>
      );

    case "location":
      return (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            El usuario capturará su ubicación actual
          </p>
        </div>
      );

    case "photo":
      return (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
          <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            El usuario tomará una foto con la cámara
          </p>
        </div>
      );

    case "file":
      return (
        <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
          <FileUp className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            El usuario adjuntará un archivo o documento
          </p>
        </div>
      );

    case "signature":
      return (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
          <PenTool className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            El usuario firmará con el dedo o stylus
          </p>
        </div>
      );

    case "ine_ocr":
      return (
        <div className="border border-gray-300 rounded-lg p-4 bg-blue-50 text-center">
          <ScanLine className="mx-auto h-12 w-12 text-blue-400 mb-2" />
          <p className="text-sm font-medium text-blue-700">
            Captura de INE con OCR
          </p>
          <p className="text-xs text-blue-500 mt-1">
            La app escaneará la credencial y extraerá datos automáticamente
          </p>
        </div>
      );

    default:
      return (
        <div className="text-sm text-gray-500 italic">
          Tipo de pregunta no soportado: {question.question_type}
        </div>
      );
  }
}

function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    text: "Texto corto",
    textarea: "Texto largo",
    email: "Correo electrónico",
    phone: "Teléfono",
    number: "Número",
    slider: "Rango deslizable",
    scale: "Escala numérica",
    rating: "Calificación (estrellas)",
    single_choice: "Selección única",
    multiple_choice: "Selección múltiple",
    yes_no: "Sí / No",
    date: "Fecha",
    time: "Hora",
    datetime: "Fecha y hora",
    photo: "Fotografía",
    file: "Archivo / Documento",
    signature: "Firma digital",
    location: "Ubicación GPS",
    ine_ocr: "Captura INE (OCR)",
  };
  return labels[type] || type;
}
