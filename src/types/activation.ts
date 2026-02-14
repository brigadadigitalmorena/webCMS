import { UserRole } from "./index";

// Re-export UserRole for convenience
export type { UserRole } from "./index";

// ================================================
// Whitelist Types
// ================================================

export type IdentifierType = "email" | "phone" | "national_id";

export interface WhitelistEntry {
  id: number;
  identifier: string;
  identifier_type: IdentifierType;
  full_name: string;
  phone?: string;
  assigned_role: UserRole;
  assigned_supervisor_id?: number;
  assigned_supervisor_name?: string;
  is_activated: boolean;
  activated_user_id?: number;
  activated_user_name?: string;
  activated_at?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

// ================================================
// Activation Code Types
// ================================================

export type ActivationCodeStatus =
  | "active"
  | "used"
  | "expired"
  | "revoked"
  | "locked";

export interface ActivationCode {
  id: number;
  code_hash: string; // Never the plain code
  whitelist_id: number;
  whitelist: {
    id: number;
    identifier: string;
    identifier_type: IdentifierType;
    nombre: string;
    apellido: string;
    assigned_role: UserRole;
    supervisor_nombre?: string;
    notes?: string;
  };
  expires_at: string | null;
  status: ActivationCodeStatus; // Computed on backend
  used_at: string | null;
  revoked_at: string | null;
  revoke_reason: string | null;
  failed_attempts: number;
  max_attempts: number;
  created_at: string;
  updated_at: string;
}

// ================================================
// Activation Audit Log Types
// ================================================

export type AuditEventType =
  | "code_generated"
  | "code_validation_attempt"
  | "code_validation_success"
  | "activation_attempt"
  | "activation_success"
  | "activation_failed"
  | "code_expired"
  | "code_locked"
  | "code_revoked"
  | "rate_limit_exceeded";

export interface ActivationAuditLog {
  id: number;
  event_type: AuditEventType;
  activation_code_id?: number;
  whitelist_id?: number;
  whitelist_entry?: {
    identifier: string;
    full_name: string;
  };
  identifier_attempted?: string;
  ip_address: string;
  user_agent?: string;
  device_id?: string;
  success: boolean;
  failure_reason?: string;
  created_user_id?: number;
  created_user_name?: string;
  request_metadata?: Record<string, any>;
  created_at: string;
}

// ================================================
// API Request/Response Types
// ================================================

// Create Whitelist Entry
export interface CreateWhitelistRequest {
  identifier: string;
  identifier_type: IdentifierType;
  full_name: string;
  assigned_role: UserRole;
  assigned_supervisor_id?: number;
  phone?: string;
  notes?: string;
}

export interface CreateWhitelistResponse {
  id: number;
  identifier: string;
  identifier_type: IdentifierType;
  full_name: string;
  assigned_role: UserRole;
  assigned_supervisor: {
    id: number;
    name: string;
  } | null;
  phone?: string;
  is_activated: boolean;
  created_by: {
    id: number;
    name: string;
  };
  created_at: string;
  notes?: string;
}

// Generate Activation Code
export interface GenerateCodeRequest {
  whitelist_id: number;
  expires_in_hours?: number;
  send_email?: boolean;
  email_template?: "default" | "reminder";
  custom_message?: string;
}

export interface GenerateCodeResponse {
  code: string; // Plain code - ONLY TIME IT'S VISIBLE
  code_id: number;
  whitelist_entry: {
    id: number;
    identifier: string;
    full_name: string;
    assigned_role: UserRole;
  };
  expires_at: string;
  expires_in_hours: number;
  email_sent: boolean;
  email_status?: string;
}

// List Whitelist Entries
export interface ListWhitelistParams {
  page?: number;
  limit?: number;
  status?: "all" | "pending" | "activated";
  role?: UserRole;
  search?: string;
  supervisor_id?: number;
  sort_by?: "created_at" | "full_name" | "identifier";
  sort_order?: "asc" | "desc";
}

export interface ListWhitelistResponse {
  items: (WhitelistEntry & {
    has_active_code: boolean;
    code_expires_at?: string;
  })[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters_applied: {
    status?: string;
    role?: string;
    search?: string;
  };
}

// List Activation Codes
export interface ListActivationCodesParams {
  page?: number;
  limit?: number;
  status?: ActivationCodeStatus | "all";
  whitelist_id?: number;
  expiring_soon?: boolean;
}

export interface ListActivationCodesResponse {
  items: ActivationCode[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
  summary: {
    active_codes: number;
    expired_codes: number;
    used_codes: number;
    expiring_in_24h: number;
  };
}

// Revoke Code
export interface RevokeCodeRequest {
  reason: string;
}

export interface RevokeCodeResponse {
  success: boolean;
  code_id: number;
  revoked_at: string;
  new_code_required: boolean;
}

// Activation Audit
export interface ListAuditLogsParams {
  page?: number;
  limit?: number;
  from_date?: string;
  to_date?: string;
  event_type?: AuditEventType | "all";
  ip_address?: string;
  success?: boolean;
}

export interface ListAuditLogsResponse {
  items: ActivationAuditLog[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
  };
  summary: {
    total_events: number;
    successful_events: number;
    failed_events: number;
    unique_ips: number;
    date_range: {
      from: string;
      to: string;
    };
  };
}

// Activation Stats
export interface ActivationStatsResponse {
  overview: {
    total_whitelisted: number;
    total_activated: number;
    pending_activation: number;
    activation_rate_pct: number;
  };
  codes: {
    total_generated: number;
    active_codes: number;
    expired_codes: number;
    used_codes: number;
    average_attempts_per_code: number;
  };
  time_metrics: {
    avg_activation_time_hours: number;
    median_activation_time_hours: number;
    fastest_activation_minutes: number;
    slowest_activation_days: number;
  };
  security: {
    failed_attempts_24h: number;
    blocked_ips: number;
    locked_codes: number;
    rate_limit_violations_24h: number;
  };
  trends: {
    activations_by_day: Array<{
      date: string;
      count: number;
    }>;
  };
}
