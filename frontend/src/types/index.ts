export interface Transaction {
  transaction_id: string;
  customer_id: string;
  customer_name: string;
  merchant_id?: string;
  merchant_name?: string;
  recipient_phone?: string;
  amount: number;
  transaction_type: 'QR Payment' | 'Send Money' | 'Add Money' | 'Cash Out' | 'Bill Payment';
  timestamp: string;
  wallet_status: string;
  gateway_status: string;
  merchant_status: string;
  settlement_status: string;
  notification_status: string;
  failure_code?: string | null;
  status: string;
  needs_investigation: boolean;
  events?: Array<{
    time: string;
    name: string;
    source: string;
    status: string;
    details?: string;
  }>;
}

export interface EvidenceItem {
  id: string;
  title: string;
  status: 'verified' | 'warning' | 'failed' | 'pending';
  timestamp: string;
  source: string;
  explanation: string;
  technical_details?: string;
}

export interface TimelineEvent {
  time: string;
  label: string;
  description: string;
  status: 'completed' | 'warning' | 'failed' | 'info';
  latency_ms?: number;
}

export interface RootCauseAnalysis {
  summary: string;
  confidence: number;
  evidence_points: string[];
  technical_reason: string;
  why_we_think_this: string[];
}

export interface PolicyMatch {
  policy_id: string;
  title: string;
  excerpt: string;
  source: string;
  category: string;
  relevance_score: number;
  sla_turnaround: string;
}

export interface ResolutionRecommendation {
  recommended_action: string;
  secondary_action: string;
  reason: string;
  risk_level: 'Low' | 'Medium' | 'High';
  human_approval_required: boolean;
  suggested_refund_amount?: number;
}

export interface InvestigationResult {
  transaction: Transaction;
  evidence: EvidenceItem[];
  timeline: TimelineEvent[];
  root_cause: RootCauseAnalysis;
  policy: PolicyMatch;
  recommendation: ResolutionRecommendation;
  ai_generated_summary: string;
}

export interface ComplaintAnalysis {
  detected_issue: string;
  amount: number;
  status: string;
  priority: string;
  confidence: number;
  possible_transaction_id: string;
  customer_sentiment: string;
  language_detected: string;
  raw_complaint: string;
}

export interface SupportCase {
  case_id: string;
  customer_id: string;
  customer_name: string;
  issue_type: string;
  amount: number;
  priority: string;
  ai_confidence: number;
  status: 'New' | 'Investigating' | 'Awaiting Approval' | 'Resolved' | 'Escalated';
  assigned_agent: string;
  created_at: string;
  updated_at: string;
  transaction_id: string;
  ai_summary: string;
  resolution_notes?: string;
  resolution_action?: string;
}

export interface IncidentGraphNode {
  id: string;
  label: string;
  type: 'customer' | 'transaction' | 'merchant' | 'gateway' | 'failure';
  count?: number;
  status: string;
}

export interface IncidentGraphEdge {
  source: string;
  target: string;
  label?: string;
}

export interface SystemIncident {
  incident_id: string;
  title: string;
  affected_transactions: number;
  affected_merchants: number;
  gateway_name: string;
  window_minutes: number;
  severity: string;
  status: string;
  pattern_summary: string;
  timestamp: string;
  nodes: IncidentGraphNode[];
  edges: IncidentGraphEdge[];
}

export interface SplitParticipant {
  name: string;
  phone: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Declined';
  avatar_color: string;
}

export interface SplitPayment {
  split_id: string;
  title: string;
  total_amount: number;
  mode: string;
  created_by: string;
  created_at: string;
  status: string;
  participants: SplitParticipant[];
}

export interface AnalyticsData {
  total_cases: number;
  ai_investigated: number;
  human_review: number;
  resolved: number;
  escalated: number;
  cases_by_issue_type: Record<string, number>;
  resolution_status_breakdown: Record<string, number>;
  avg_resolution_minutes: number;
  ai_accuracy_rate: number;
  gateway_health_score: number;
  dataset_label: string;
}
