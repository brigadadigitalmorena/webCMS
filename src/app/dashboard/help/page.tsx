"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Mail,
  MessageSquare,
  Bug,
} from "lucide-react";

interface IssueForm {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  email: string;
}

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<"faq" | "report">("faq");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<IssueForm>({
    title: "",
    description: "",
    severity: "medium",
    email: "",
  });

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const response = await fetch("/api/help/submit-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al enviar el reporte");
      }

      setSubmitSuccess(true);
      setFormData({
        title: "",
        description: "",
        severity: "medium",
        email: "",
      });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Error al enviar el reporte. Por favor intenta de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Ayuda y Soporte
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Encuentra respuestas a preguntas comunes, reporta problemas y accede a
          documentación
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("faq")}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "faq"
                ? "border-primary-600 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Preguntas Frecuentes
            </div>
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "report"
                ? "border-primary-600 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Reportar Problema
            </div>
          </button>
        </div>
      </div>

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="space-y-4 max-w-3xl">
          {[
            {
              q: "¿Cómo creo un nuevo usuario?",
              a: "Ve a la sección de Usuarios > Invitaciones. Busca al usuario en la whitelist o crea una nueva invitación. El sistema generará un código de activación que el usuario puede usar para completar su registro.",
            },
            {
              q: "¿Qué hago si un usuario olvida su contraseña?",
              a: "Ve a Usuarios > Usuarios y busca al usuario. Haz clic en el perfil del usuario y selecciona 'Restablecer contraseña'. Se generará una contraseña temporal que puedes compartir con el usuario.",
            },
            {
              q: "¿Cómo interpreto los reportes?",
              a: "Los reportes muestran estadísticas de respuestas de encuestas. Puedes filtrar por período de tiempo, tipo de encuesta y estado. Los gráficos visualizan tendencias y patrones en los datos.",
            },
            {
              q: "¿Cuál es la diferencia entre roles?",
              a: "Admin: Control total del sistema. Encargado: Puede crear encuestas y asignaciones. Brigadista: Solo puede responder encuestas y ver sus asignaciones.",
            },
            {
              q: "¿Cómo restablezco mis cambios no guardados?",
              a: "Si sales de una página sin guardar, los cambios se perderán. Asegúrate de hacer clic en 'Guardar' antes de salir de cualquier formulario.",
            },
          ].map((item, index) => (
            <Card key={index} className="p-6">
              <div className="flex gap-4">
                <HelpCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {item.q}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.a}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Report Issue Tab */}
      {activeTab === "report" && (
        <div className="max-w-3xl">
          {submitSuccess && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-200">
                Tu reporte ha sido enviado exitosamente. Nuestro equipo lo
                revisará pronto.
              </p>
            </div>
          )}

          {submitError && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-200">{submitError}</p>
            </div>
          )}

          <Card className="p-6 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Por favor, describe el problema de manera clara y detallada.
                  Incluye pasos para reproducirlo si es posible.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitIssue} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tu Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="tu@email.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título del problema
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Ej: No puedo crear una nueva encuesta"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severidad
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="low">Baja - Inconveniente menor</option>
                  <option value="medium">Media - Funcionalidad afectada</option>
                  <option value="high">
                    Alta - Característica no funciona
                  </option>
                  <option value="critical">Crítica - Sistema inusable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción del problema
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Describe qué sucedió, qué esperabas que sucediera, y pasos para reproducir el problema..."
                  required
                  disabled={isSubmitting}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {isSubmitting ? "Enviando..." : "Enviar Reporte"}
              </Button>
            </form>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Información de contacto
            </h3>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>brigadadigitalmorena@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>Tiempo de respuesta: 24-48 horas</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
