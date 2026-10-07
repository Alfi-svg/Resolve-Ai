export interface User {
  id: string;
  name: string;
  phone_masked: string;
  account_status: string;
  wallet_balance: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  created_at: string;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
}

export interface Gateway {
  id: string;
  name: string;
  status: "OPERATIONAL" | "DEGRADED" | "OUTAGE";
  latency: number;
  health_score: number;
}

export interface TransactionEvent {
  id: string;
  transaction_id: string;
  event_type: string;
  source: string;
  timestamp: string;
  status: "SUCCESS" | "FAILED" | "TIMEOUT" | "PENDING";
  metadata?: Record<string, any>;
}

export interface SyntheticTransaction {
  id: string;
  user_id: string;
  merchant_id?: string;
  type: string;
  amount: number;
  currency: string;
  status: "SUCCESS" | "PARTIAL_FAILURE" | "FAILED" | "PENDING" | "REVERSED";
  channel: string;
  device_id: string;
  location: string;
  created_at: string;
  failure_code?: string;
  gateway_id?: string;
  meta_info?: Record<string, any>;
}

export interface TransactionTimeline {
  transaction_id: string;
  status: string;
  amount: number;
  currency: string;
  events: TransactionEvent[];
  root_cause?: string;
  confidence?: number;
  risk_level?: string;
}

export interface Evidence {
  id: string;
  investigation_id: string;
  source: string;
  event: string;
  timestamp: string;
  importance: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  details: string;
}

export interface AIInvestigation {
  id: string;
  case_id: string;
  intent: string;
  transaction_id: string;
  root_cause: string;
  confidence: number;
  risk_score: number;
  recommendation: string;
  status: string;
  evidences?: Evidence[];
}

export interface SupportCase {
  id: string;
  user_id: string;
  transaction_id: string;
  complaint: string;
  status: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  risk_score: number;
  assigned_admin?: string;
  created_at: string;
  investigation?: AIInvestigation;
}

export interface Policy {
  id: string;
  title: string;
  category: string;
  rule: string;
  resolution_action: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  admin_id?: string;
  case_id?: string;
  target_type: string;
  target_id: string;
  details: string;
  reason?: string;
  previous_status?: string;
  new_status?: string;
  log_metadata?: Record<string, any>;
  timestamp: string;
}

export interface IncidentTimelineEntry {
  timestamp: string;
  event: string;
  description?: string;
  details?: string;
  time_offset?: string;
  failures_count?: number;
  severity?: string;
}

export interface IncidentMerchantCategory {
  category?: string;
  sector?: string;
  affected_count?: number;
  count?: number;
  sample_merchants?: string[];
  examples?: string;
}

export interface IncidentGroupingCriteria {
  gateway: string;
  failure_type?: string;
  error_failure_type?: string;
  time_window: string;
  channel: string;
  merchant_threshold?: number;
  merchant_count?: number;
}

export interface IncidentSummary {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: string;
  affected_gateway: string;
  primary_failure: string;
  affected_transactions: number;
  affected_merchants: number;
  time_window: string;
  channel: string;
  detected_at?: string;
  created_at?: string;
  is_synthetic: boolean;
}

export interface IncidentDetail extends IncidentSummary {
  potential_root_cause: string;
  ai_summary: string;
  recommended_action: string;
  timeline: IncidentTimelineEntry[];
  merchant_breakdown: IncidentMerchantCategory[];
  grouping_criteria: IncidentGroupingCriteria;
  sample_transactions?: Array<{ id: string; amount: number; channel?: string; merchant?: string }>;
  fallback_gateway?: string;
  is_rerouted?: boolean;
  bulk_reconciled?: boolean;
  switch_latency_ms?: number;
  normalized_latency_ms?: number;
}

export interface DemoLoginResponse {
  success: boolean;
  token: string;
  role: string;
  user: User;
  permissions: string[];
  session_expires_at: string;
}

export interface AdminOverviewResponse {
  active_cases: number;
  ai_investigations_count: number;
  pending_approvals_count: number;
  high_risk_transactions_count: number;
  open_incidents_count: number;
  resolution_rate_percent: number;
  avg_resolution_time_seconds: number;
  total_volume_bdt: number;
  system_health_status: string;
}

export interface DailyTrendPoint {
  date: string;
  cases_opened: number;
  auto_resolved: number;
  human_approved: number;
  volume_bdt: number;
}

export interface AnalyticsOverviewResponse {
  resolution_rate: number;
  avg_resolution_seconds: number;
  total_cases_analyzed: number;
  auto_resolved_count: number;
  human_approved_count: number;
  rejected_count: number;
  escalated_count: number;
  total_refunded_bdt: number;
  channel_distribution: Record<string, number>;
  intent_distribution: Record<string, number>;
  daily_trends: DailyTrendPoint[];
}

export interface ApprovalResultResponse {
  success: boolean;
  case_id: string;
  action: string;
  previous_status: string;
  new_status: string;
  reason: string;
  audit_id: string;
  timestamp: string;
  details: string;
}
