// User roles
export type UserRole = "admin" | "encargado" | "brigadista";

// User types
export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
  telefono?: string;
  created_at: string;
  activo: boolean;
}

export interface AuthUser extends User {
  access_token: string;
  refresh_token?: string;
}

// Survey types
export interface Survey {
  id: number;
  titulo: string;
  descripcion?: string;
  version: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
}

export interface SurveyQuestion {
  id: number;
  encuesta_id: number;
  pregunta: string;
  tipo_pregunta: QuestionType;
  requerido: boolean;
  orden: number;
  opciones?: string[];
  validacion?: Record<string, any>;
  logica_condicional?: Record<string, any>;
}

export type QuestionType =
  | "texto"
  | "numero"
  | "seleccion_unica"
  | "seleccion_multiple"
  | "fecha"
  | "hora"
  | "coordenadas"
  | "foto"
  | "firma"
  | "documento";

// Assignment types
export interface Assignment {
  id: number;
  encuesta_id: number;
  encargado_id: number;
  brigadista_id?: number;
  direccion: string;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
  fecha_limite: string;
  estado: AssignmentStatus;
  created_at: string;
}

export type AssignmentStatus =
  | "pendiente"
  | "asignado"
  | "en_progreso"
  | "completado"
  | "rechazado";

// Response types
export interface SurveyResponse {
  id: number;
  asignacion_id: number;
  encuesta_id: number;
  respondido_por: number;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: "borrador" | "enviado" | "rechazado";
  respuestas: QuestionResponse[];
}

export interface QuestionResponse {
  pregunta_id: number;
  valor: any;
  archivos_adjuntos?: string[];
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
