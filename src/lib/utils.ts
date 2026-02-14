import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRoleName(role: string): string {
  const roleMap: Record<string, string> = {
    admin: "Administrador",
    encargado: "Encargado",
    brigadista: "Brigadista",
  };
  return roleMap[role] || role;
}

export function formatStatusName(status: string): string {
  const statusMap: Record<string, string> = {
    pendiente: "Pendiente",
    asignado: "Asignado",
    en_progreso: "En Progreso",
    completado: "Completado",
    rechazado: "Rechazado",
    borrador: "Borrador",
    enviado: "Enviado",
  };
  return statusMap[status] || status;
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pendiente: "bg-yellow-100 text-yellow-800",
    asignado: "bg-blue-100 text-blue-800",
    en_progreso: "bg-purple-100 text-purple-800",
    completado: "bg-green-100 text-green-800",
    rechazado: "bg-red-100 text-red-800",
    borrador: "bg-gray-100 text-gray-800",
    enviado: "bg-green-100 text-green-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
