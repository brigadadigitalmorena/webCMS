// User roles
export type UserRole = "admin" | "encargado" | "brigadista";

// Notification types
export type NotificationType =
  | "survey_created"
  | "survey_deleted"
  | "version_published"
  | "assignment_created"
  | "user_registered";

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  action_url?: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
}

export interface UnreadCountResponse {
  count: number;
}

// User types
export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
  telefono?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  activo: boolean;
}

// Survey types (matching backend schema)
export interface Survey {
  id: number;
  title: string;
  description?: string;
  is_active: boolean;
  created_by: number;
  starts_at?: string | null;
  ends_at?: string | null;
  estimated_duration_minutes?: number | null;
  max_responses?: number | null;
  allow_anonymous: boolean;
  created_at: string;
  updated_at?: string;
  versions?: SurveyVersion[];
}

export interface SurveyVersion {
  id: number;
  survey_id: number;
  version_number: number;
  is_published: boolean;
  change_summary?: string;
  created_at: string;
  questions: Question[];
}

export interface Question {
  id: number;
  version_id: number;
  question_text: string;
  question_type: QuestionType;
  order: number;
  is_required: boolean;
  validation_rules?: Record<string, any>;
  options?: AnswerOption[];
}

export interface AnswerOption {
  id: number;
  question_id?: number;
  option_text: string;
  order: number;
}

export type QuestionType =
  // Text inputs
  | "text"
  | "textarea"
  | "email"
  | "phone"
  // Numeric
  | "number"
  | "slider"
  | "scale"
  | "rating"
  // Choice
  | "single_choice"
  | "multiple_choice"
  | "yes_no"
  // Date/Time
  | "date"
  | "time"
  | "datetime"
  // Media & special
  | "photo"
  | "file"
  | "signature"
  | "location"
  | "ine_ocr";

// Legacy types (for backward compatibility)\n// SurveyQuestion extends Question with Spanish-named fields — unused in CMS.

// Assignment types
export interface Assignment {
  id: number;
  user_id: number;
  survey_id: number;
  assigned_by?: number;
  status: AssignmentStatus;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  // Populated in list view (AssignmentDetailResponse)
  user?: {
    id: number;
    full_name: string;
    email: string;
    role: string;
  };
  survey?: {
    id: number;
    title: string;
  };
  assigned_by_user?: {
    id: number;
    full_name: string;
    email: string;
    role: string;
  };
  response_count?: number;
}

export type AssignmentStatus = "active" | "inactive";

// Response types (used by mobile app / future CMS features)
// SurveyResponse and QuestionResponse are kept for backend schema parity
// but are currently unused in the CMS — the reports page uses ExportRow instead.

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
