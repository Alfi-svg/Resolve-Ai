export interface RiskSignal {
  code: string;
  name: string;
  weight: number;
  weight_display?: string;
  evidence?: string;
  desc?: string;
}

export interface ItemizedRiskSignal {
  code?: string;
  name: string;
  weight: number;
  weight_display: string;
  evidence: string;
}

export interface BehaviorComparison {
  dimension: string;
  baseline: string;
  observed: string;
  status: "NORMAL" | "ANOMALOUS";
}

export interface RiskExplanationData {
  title: string;
  score_display: string;
  score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  itemized_breakdown: ItemizedRiskSignal[];
  ai_explanation: string;
  behavior_comparisons: BehaviorComparison[];
}

export interface HumanDecisionOption {
  id: "REQUIRE_ADDITIONAL_VERIFICATION" | "AUTHORIZE_TEMPORARY_HOLD" | "SEND_TO_MANUAL_REVIEW" | "CLEAR_FALSE_POSITIVE";
  label: string;
  description: string;
  variant: "primary" | "secondary" | "outline" | "danger" | "warning";
}

export interface RiskRecommendationData {
  primary_recommendation: string;
  urgency: "IMMEDIATE" | "STANDARD" | "LOW";
  safeguards: string[];
  recommended_decision_id: string;
  human_decisions: HumanDecisionOption[];
  policy_applied: {
    id: string;
    title: string;
    summary: string;
  };
}

export interface RiskPipelineStep {
  step: number;
  name: string;
  status: "COMPLETED" | "AWAITING" | "PENDING";
  summary: string;
}

export interface FraudPattern {
  pattern_id: string;
  name: string;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  confidence: number;
  description: string;
  evidence: string;
  mitigation: string;
}

export interface ScamAnalysisResult {
  classification: "SCAM_SUSPECTED" | "STANDARD_DISPUTE_OR_INQUIRY";
  is_scam_suspected: boolean;
  confidence: number;
  category_id: string;
  category_title: string;
  matched_categories: string[];
  extracted_indicators: string[];
  cautious_assessment: string;
  safety_advisory: string;
  recommended_action: string;
  input_text: string;
}

export interface ATOSupportingSignal {
  code: string;
  name: string;
  weight: number;
  weight_display: string;
  evidence: string;
}

export interface AccountTakeoverEvaluation {
  title: string;
  status: "POTENTIAL_ACCOUNT_TAKEOVER" | "NORMAL";
  is_ato_suspected: boolean;
  risk_score: number;
  max_score: number;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  badge_color: string;
  supporting_signals: ATOSupportingSignal[];
  supporting_signals_count: number;
  recommended_action: string;
  governance_summary: string;
  ai_disclosure: string;
}

export interface RiskEvaluation {
  transaction_id: string;
  amount?: number;
  risk_score: number;
  raw_score: number;
  max_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  risk_level_label: string;
  badge_color: string;
  signals: RiskSignal[];
  signals_count: number;
  explanation: RiskExplanationData;
  recommendation: RiskRecommendationData;
  behavioral_context: Record<string, any>;
  pipeline_steps: RiskPipelineStep[];
  fraud_patterns?: FraudPattern[];
  fraud_patterns_count?: number;
  account_takeover?: AccountTakeoverEvaluation;
}

export interface MonitoredTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  channel: string;
  device_id: string;
  created_at: string;
  status: string;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  risk_level_label: string;
  badge_color: string;
  signals_count: number;
  primary_signal: string;
  recommended_action: string;
  fraud_patterns_count?: number;
  is_ato_suspected?: boolean;
}

export interface RiskOverviewStats {
  monitored_hourly: number;
  flagged_anomalies: number;
  systemic_incidents: number;
  model_version: string;
  risk_distribution: Record<string, number>;
  pending_review_count: number;
}

export interface RiskCase {
  id: string;
  case_number: string;
  user_id: string;
  trx_id?: string;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  signals: RiskSignal[];
  ai_explanation: string;
  evidence: Record<string, any>;
  status: "FLAGGED" | "UNDER_INVESTIGATION" | "CLEARED" | "BLOCKED" | "HELD" | "CHALLENGED";
  action_taken?: string;
  created_at: string;
}
