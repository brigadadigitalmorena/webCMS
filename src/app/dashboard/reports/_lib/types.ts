export interface SurveySummary {
  survey_id: number;
  survey_title: string;
  is_active: boolean;
  total_responses: number;
  last_response_at: string | null;
}

export interface SurveyRiskSummary {
  survey_id: number;
  high_risk_users: number;
  medium_risk_users: number;
  low_risk_users: number;
  at_risk_users: number;
  max_risk_score: number;
}

export interface ExportRow {
  survey_id: number;
  survey_title: string;
  response_id: number;
  user_id: number;
  user_name?: string | null;
  user_email?: string | null;
  client_id: string;
  completed_at: string | null;
  started_at: string | null;
  location: Record<string, unknown> | null;
  question_id: number;
  question_text: string;
  question_type: string;
  question_order: number;
  answer_value: unknown;
  media_url: string | null;
  answered_at: string | null;
}

export interface TimelinePoint {
  date: string;
  count: number;
}

export interface ResponseAnswerDetail {
  id: number;
  question_id: number;
  answer_value: unknown;
  media_url: string | null;
  answered_at: string;
  answer_meta?: Record<string, unknown> | null;
}

export interface ResponseDetail {
  id: number;
  user_id: number;
  version_id: number;
  client_id: string;
  location: Record<string, unknown> | null;
  started_at: string | null;
  completed_at: string;
  synced_at: string;
  device_info?: Record<string, unknown> | null;
  capture_meta?: Record<string, unknown> | null;
  answers: ResponseAnswerDetail[];
}
