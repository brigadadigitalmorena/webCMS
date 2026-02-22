export interface SurveySummary {
  survey_id: number;
  survey_title: string;
  is_active: boolean;
  total_responses: number;
  last_response_at: string | null;
}

export interface ExportRow {
  survey_id: number;
  survey_title: string;
  response_id: number;
  user_id: number;
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
