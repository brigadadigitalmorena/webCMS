import { FileQuestion, Database, UserX, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateType = "no-data" | "no-results" | "no-access" | "error";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

const defaultConfig: Record<
  EmptyStateType,
  { icon: React.ComponentType<{ className?: string }>; title: string; description: string }
> = {
  "no-data": {
    icon: Database,
    title: "No hay datos disponibles",
    description: "Aún no se han creado registros. Comienza creando uno nuevo.",
  },
  "no-results": {
    icon: Search,
    title: "No se encontraron resultados",
    description: "Intenta ajustar tus filtros o criterios de búsqueda.",
  },
  "no-access": {
    icon: UserX,
    title: "Acceso denegado",
    description: "No tienes permisos para ver este contenido.",
  },
  error: {
    icon: FileQuestion,
    title: "Error al cargar los datos",
    description: "Ocurrió un error al intentar cargar la información.",
  },
};

export function EmptyState({
  type = "no-data",
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  const config = defaultConfig[type];
  const Icon = icon ? () => icon : config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || config.title}
      </h3>

      <p className="text-sm text-gray-500 max-w-md mb-6">
        {description || config.description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
