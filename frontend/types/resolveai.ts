export interface IntentResult {
  intent: string;
  amount?: number | null;
  issue: string;
  language: string;
  confidence: number;
  raw_complaint: string;
  extracted_entities?: Record<string, any>;
}

export interface TransactionMatchResult {
  transaction_id: string;
  confidence: number;
  matching_reasons: string[];
  matched_transaction?: Record<string, any>;
}

export interface EvidenceItem {
  source: string;
  timestamp: string;
  event: string;
  status: "SUCCESS" | "FAILED" | "TIMEOUT" | "PENDING";
  importance: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
}

export interface TimelineItem {
  time: string;
  title: string;
  description: string;
  status: "SUCCESS" | "TIMEOUT" | "FAILED" | "PENDING";
  source: string;
}

export interface RootCauseResult {
  root_cause_code: string;
  root_cause: string;
  confidence: number;
  supporting_evidence: string[];
  technical_details?: string;
}

export interface PolicyResult {
  matched_policy_id: string;
  matched_policy: string;
  category: string;
  policy_reason: string;
  allowed_actions: string[];
  sla_minutes: number;
}

export interface RiskResult {
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  fraud_signals: Array<{
    code: string;
    name: string;
    weight: number;
    desc?: string;
    value?: string;
  }>;
  explanation: string;
}

export interface RecommendationResult {
  action: "RECONCILIATION" | "INSTANT_REFUND" | "TEMPORARY_HOLD" | "MANUAL_REVIEW";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requires_human_approval: boolean;
  suggested_refund_amount?: number;
  auto_executable: boolean;
}

export interface PipelineStepStatus {
  step_key: string;
  title: string;
  status: "completed" | "in_progress" | "pending" | "failed";
  evidence?: string;
  confidence: number;
  explanation: string;
  timestamp?: string;
}

export interface FinalInvestigationObject {
  investigation_id: string;
  case_id: string;
  complaint: string;
  intent: IntentResult;
  transaction: TransactionMatchResult;
  evidence: EvidenceItem[];
  timeline: TimelineItem[];
  root_cause: RootCauseResult;
  policy: PolicyResult;
  risk: RiskResult;
  recommendation: RecommendationResult;
  confidence: number;
  approval_required: boolean;
  status: string;
  pipeline_steps: PipelineStepStatus[];
  created_at: string;
}

// Backward-compatibility aliases
export type AIReasoningStep = PipelineStepStatus;
export interface ResolveAIAnalysis extends FinalInvestigationObject {
  ticket_id?: string;
  user_id?: string;
  trx_id?: string;
  detected_intent?: string;
  ai_confidence?: number;
  policy_matched?: string;
  suggested_action?: string;
  refund_amount?: number;
  reasoning_steps?: PipelineStepStatus[];
}

export interface DisputeRecord {
  id: string;
  ticket_id: string;
  user_id: string;
  trx_id?: string;
  complaint_text: string;
  detected_intent?: string;
  identified_trx_id?: string;
  ai_confidence: number;
  root_cause?: string;
  policy_matched?: string;
  risk_level: string;
  recommendation?: string;
  suggested_action?: string;
  reasoning_steps: PipelineStepStatus[];
  evidence_data?: any;
  status: string;
  admin_notes?: string;
  resolution_feedback?: string;
  created_at: string;
  updated_at: string;
}
