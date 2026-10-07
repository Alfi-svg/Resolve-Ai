import { HealthData } from "@/types/api";
import { 
  User, 
  Merchant, 
  Gateway, 
  SyntheticTransaction, 
  TransactionTimeline, 
  SupportCase, 
  Policy,
  AuditLog,
  IncidentSummary,
  IncidentDetail,
  DemoLoginResponse,
  AdminOverviewResponse,
  AnalyticsOverviewResponse,
  ApprovalResultResponse
} from "@/types/synthetic";
import { FinalInvestigationObject, ResolveAIAnalysis, DisputeRecord } from "@/types/resolveai";
import { 
  RiskCase, 
  RiskEvaluation, 
  RiskOverviewStats, 
  MonitoredTransaction,
  ScamAnalysisResult,
  FraudPattern,
  AccountTakeoverEvaluation
} from "@/types/risk-guard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Check if endpoint already includes /v1 or /api or is relative
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_BASE}${cleanEndpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error(`API Error on ${url}:`, error);
      throw error;
    }
  }

  // Health
  async getHealth(): Promise<HealthData> {
    return this.request<HealthData>("/health");
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users");
  }

  // Transactions
  async getTransactions(params?: {
    userId?: string;
    status?: string;
    gatewayId?: string;
    merchantId?: string;
    limit?: number;
    offset?: number;
  }): Promise<SyntheticTransaction[]> {
    const query = new URLSearchParams();
    if (params?.userId) query.append("user_id", params.userId);
    if (params?.status) query.append("status", params.status);
    if (params?.gatewayId) query.append("gateway_id", params.gatewayId);
    if (params?.merchantId) query.append("merchant_id", params.merchantId);
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());
    
    const qs = query.toString() ? `?${query.toString()}` : "";
    return this.request<SyntheticTransaction[]>(`/transactions${qs}`);
  }

  async getTransaction(id: string): Promise<SyntheticTransaction> {
    return this.request<SyntheticTransaction>(`/transactions/${encodeURIComponent(id)}`);
  }

  async getTransactionTimeline(id: string): Promise<TransactionTimeline> {
    return this.request<TransactionTimeline>(`/transactions/${encodeURIComponent(id)}/timeline`);
  }

  // Support Cases & Investigations
  async getCases(params?: {
    status?: string;
    priority?: string;
    userId?: string;
  }): Promise<SupportCase[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.priority) query.append("priority", params.priority);
    if (params?.userId) query.append("user_id", params.userId);
    
    const qs = query.toString() ? `?${query.toString()}` : "";
    return this.request<SupportCase[]>(`/cases${qs}`);
  }

  async getCaseDetail(id: string): Promise<SupportCase> {
    return this.request<SupportCase>(`/cases/${encodeURIComponent(id)}`);
  }

  // Gateways
  async getGateways(): Promise<Gateway[]> {
    return this.request<Gateway[]>("/gateways");
  }

  // Merchants
  async getMerchants(): Promise<Merchant[]> {
    return this.request<Merchant[]>("/merchants");
  }

  // Policies
  async getPolicies(): Promise<Policy[]> {
    return this.request<Policy[]>("/policies");
  }

  // Reset synthetic engine
  async resetSeedData(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>("/seed/reset", {
      method: "POST",
    });
  }

  // ResolveAI Core Pipeline
  async investigate(userId: string, complaintText: string, trxId?: string): Promise<FinalInvestigationObject> {
    return this.request<FinalInvestigationObject>("/resolveai/analyze", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        complaint_text: complaintText,
        trx_id: trxId,
      }),
    });
  }

  async approveCase(
    caseId: string,
    action: "APPROVE" | "REJECT" | "ESCALATE" | "REQUEST_EVIDENCE" = "APPROVE",
    notesOrPayload?: string | { reason?: string; admin_notes?: string; admin_id?: string; override_amount?: number; evidence_verified?: boolean }
  ): Promise<any> {
    let bodyPayload: any = { action, admin_id: "ADM-OPS-ALFI" };
    if (typeof notesOrPayload === "string") {
      bodyPayload.admin_notes = notesOrPayload;
      bodyPayload.reason = notesOrPayload;
    } else if (notesOrPayload && typeof notesOrPayload === "object") {
      bodyPayload = { ...bodyPayload, ...notesOrPayload, action };
      if (!bodyPayload.reason && bodyPayload.admin_notes) {
        bodyPayload.reason = bodyPayload.admin_notes;
      }
    }
    let targetRoute = `/resolveai/approve/${encodeURIComponent(caseId)}`;
    if (action === "APPROVE") targetRoute = `/cases/${encodeURIComponent(caseId)}/approve`;
    else if (action === "REJECT") targetRoute = `/cases/${encodeURIComponent(caseId)}/reject`;
    else if (action === "ESCALATE") targetRoute = `/cases/${encodeURIComponent(caseId)}/escalate`;

    return this.request(targetRoute, {
      method: "POST",
      body: JSON.stringify(bodyPayload),
    });
  }

  async getDisputes(userId?: string): Promise<DisputeRecord[]> {
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return this.request<DisputeRecord[]>(`/v1/resolveai/disputes${query}`);
  }

  async actOnDispute(ticketId: string, action: string, adminNotes?: string): Promise<any> {
    return this.request(`/v1/resolveai/disputes/${ticketId}/action`, {
      method: "POST",
      body: JSON.stringify({
        action,
        admin_notes: adminNotes,
      }),
    });
  }

  async getRiskCases(): Promise<RiskCase[]> {
    return this.request<RiskCase[]>("/risk-guard/cases");
  }

  async getRiskOverview(): Promise<RiskOverviewStats> {
    return this.request<RiskOverviewStats>("/risk/overview");
  }

  async getRiskTransactions(limit: number = 25): Promise<MonitoredTransaction[]> {
    return this.request<MonitoredTransaction[]>(`/risk/transactions?limit=${limit}`);
  }

  async analyzeScamSignals(complaintText: string, metadata?: Record<string, any>): Promise<ScamAnalysisResult> {
    return this.request<ScamAnalysisResult>("/risk-guard/scam-signals/analyze", {
      method: "POST",
      body: JSON.stringify({
        complaint_text: complaintText,
        metadata,
      }),
    });
  }

  async getFraudPatterns(transactionId?: string): Promise<FraudPattern[]> {
    const qs = transactionId ? `?transaction_id=${encodeURIComponent(transactionId)}` : "";
    return this.request<FraudPattern[]>(`/risk-guard/fraud-patterns${qs}`);
  }

  async getAccountTakeoverEvaluation(transactionId: string): Promise<AccountTakeoverEvaluation> {
    return this.request<AccountTakeoverEvaluation>(`/risk-guard/ato-evaluation/${encodeURIComponent(transactionId)}`);
  }

  async evaluateTransactionRisk(trxId: string): Promise<RiskEvaluation> {
    return this.request<RiskEvaluation>(`/risk/transactions/${encodeURIComponent(trxId)}`);
  }

  async recordRiskDecision(action: string, trxId: string, adminNotes?: string): Promise<any> {
    return this.request("/risk-guard/decision", {
      method: "POST",
      body: JSON.stringify({
        action,
        trx_id: trxId,
        admin_notes: adminNotes,
      }),
    });
  }

  async takeRiskAction(caseId: string, action: string, notes?: string): Promise<any> {
    return this.request(`/risk-guard/cases/${encodeURIComponent(caseId)}/action`, {
      method: "POST",
      body: JSON.stringify({
        action,
        notes,
      }),
    });
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return this.request<AuditLog[]>("/audit-logs");
  }

  async getIncidents(): Promise<IncidentSummary[]> {
    return this.request<IncidentSummary[]>("/incidents");
  }

  async getIncident(incidentId: string): Promise<IncidentDetail> {
    return this.request<IncidentDetail>(`/incidents/${encodeURIComponent(incidentId)}`);
  }

  async rerouteIncidentGateway(incidentId: string): Promise<any> {
    return this.request(`/incidents/${encodeURIComponent(incidentId)}/reroute`, {
      method: "POST",
    });
  }

  async bulkReconcileIncident(incidentId: string): Promise<any> {
    return this.request(`/incidents/${encodeURIComponent(incidentId)}/bulk-reconcile`, {
      method: "POST",
    });
  }

  // -------------------------------------------------------------------------
  // CONNECTED EXACT APIS (Matching FastAPI routes)
  // -------------------------------------------------------------------------

  // AUTH DEMO
  async demoLogin(role: "USER" | "ADMIN" = "USER", userId?: string): Promise<DemoLoginResponse> {
    return this.request<DemoLoginResponse>("/auth/demo-login", {
      method: "POST",
      body: JSON.stringify({ role, user_id: userId }),
    });
  }

  // USER
  async getUserProfile(userId?: string): Promise<User> {
    const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return this.request<User>(`/user/profile${qs}`);
  }

  async getUserTransactions(userId?: string, limit: number = 50): Promise<SyntheticTransaction[]> {
    const query = new URLSearchParams();
    if (userId) query.append("user_id", userId);
    query.append("limit", limit.toString());
    return this.request<SyntheticTransaction[]>(`/user/transactions?${query.toString()}`);
  }

  async getUserCases(userId?: string): Promise<SupportCase[]> {
    const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return this.request<SupportCase[]>(`/user/cases${qs}`);
  }

  // RESOLVEAI
  async analyzeComplaint(complaintText: string, userId: string = "USR-001", trxId?: string): Promise<FinalInvestigationObject> {
    return this.request<FinalInvestigationObject>("/resolveai/analyze", {
      method: "POST",
      body: JSON.stringify({
        complaint_text: complaintText,
        user_id: userId,
        trx_id: trxId,
      }),
    });
  }

  async getResolveAICases(status?: string, priority?: string): Promise<SupportCase[]> {
    const query = new URLSearchParams();
    if (status) query.append("status", status);
    if (priority) query.append("priority", priority);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return this.request<SupportCase[]>(`/resolveai/cases${qs}`);
  }

  async getResolveAICase(caseId: string): Promise<SupportCase> {
    return this.request<SupportCase>(`/resolveai/cases/${encodeURIComponent(caseId)}`);
  }

  async getResolveAIInvestigation(id: string): Promise<any> {
    return this.request(`/resolveai/investigations/${encodeURIComponent(id)}`);
  }

  // EVIDENCE
  async getInvestigationEvidence(id: string): Promise<any[]> {
    return this.request<any[]>(`/investigations/${encodeURIComponent(id)}/evidence`);
  }

  // RISK
  async getRiskOverviewData(): Promise<RiskOverviewStats> {
    return this.request<RiskOverviewStats>("/risk/overview");
  }

  async getRiskMonitoredTransactions(limit: number = 25): Promise<any[]> {
    return this.request<any[]>(`/risk/transactions?limit=${limit}`);
  }

  async getRiskTransactionDetail(trxId: string): Promise<any> {
    return this.request(`/risk/transactions/${encodeURIComponent(trxId)}`);
  }

  async analyzeRiskOnDemand(transactionId: string): Promise<any> {
    return this.request("/risk/analyze", {
      method: "POST",
      body: JSON.stringify({ transaction_id: transactionId }),
    });
  }

  // ADMIN
  async getAdminOverview(): Promise<AdminOverviewResponse> {
    return this.request<AdminOverviewResponse>("/admin/overview");
  }

  async getAdminCases(status?: string, priority?: string): Promise<SupportCase[]> {
    const query = new URLSearchParams();
    if (status) query.append("status", status);
    if (priority) query.append("priority", priority);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return this.request<SupportCase[]>(`/admin/cases${qs}`);
  }

  async getAdminPendingApprovals(): Promise<SupportCase[]> {
    return this.request<SupportCase[]>("/admin/pending-approvals");
  }

  // APPROVAL
  async approveCaseResolution(caseId: string, reason?: string, refundAmount?: number): Promise<ApprovalResultResponse> {
    return this.request<ApprovalResultResponse>(`/cases/${encodeURIComponent(caseId)}/approve`, {
      method: "POST",
      body: JSON.stringify({
        admin_id: "ADM-OPS-ALFI",
        reason: reason || "Approved based on verified root cause and policy POL-QR-001.",
        refund_amount: refundAmount,
      }),
    });
  }

  async rejectCaseResolution(caseId: string, reason: string): Promise<ApprovalResultResponse> {
    return this.request<ApprovalResultResponse>(`/cases/${encodeURIComponent(caseId)}/reject`, {
      method: "POST",
      body: JSON.stringify({
        admin_id: "ADM-OPS-ALFI",
        reason,
      }),
    });
  }

  async escalateCaseResolution(caseId: string, reason?: string): Promise<ApprovalResultResponse> {
    return this.request<ApprovalResultResponse>(`/cases/${encodeURIComponent(caseId)}/escalate`, {
      method: "POST",
      body: JSON.stringify({
        admin_id: "ADM-OPS-ALFI",
        reason: reason || "Escalated to Tier 2 Forensic Audit Team for manual investigation.",
      }),
    });
  }

  // ANALYTICS
  async getAnalyticsOverview(): Promise<AnalyticsOverviewResponse> {
    return this.request<AnalyticsOverviewResponse>("/analytics/overview");
  }

  // AUTONOMOUS AGENT
  async investigateWithAgent(transactionId: string = "TXN-8F31A2", trigger: string = "transaction_anomaly"): Promise<any> {
    return this.request<any>("/agent/investigate", {
      method: "POST",
      body: JSON.stringify({ transaction_id: transactionId, trigger }),
    });
  }

  async getDetectedCases(): Promise<any> {
    return this.request<any>("/agent/detected-cases");
  }

  // NOTIFICATIONS
  async getUserNotifications(userId: string = "USR-001"): Promise<{ notifications: any[]; unread_count: number }> {
    return this.request<{ notifications: any[]; unread_count: number }>(`/user/notifications?user_id=${encodeURIComponent(userId)}`);
  }

  async markAllNotificationsRead(userId: string = "USR-001"): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/user/notifications/read-all?user_id=${encodeURIComponent(userId)}`, {
      method: "POST",
    });
  }

  // TWO-MINUTE TRANSFER UNDO
  async undoTransaction(transactionId: string, reason: string = "Sent to wrong recipient accidentally"): Promise<any> {
    return this.request<any>(`/transactions/${encodeURIComponent(transactionId)}/undo`, {
      method: "POST",
      body: JSON.stringify({ transaction_id: transactionId, reason }),
    });
  }

  // STUDENT BENEFITS & ASSISTANCE
  async getStudentBenefits(): Promise<any> {
    return this.request<any>("/student/benefits");
  }

  async applyStudentDiscount(amount: number, merchantName: string): Promise<any> {
    return this.request<any>("/student/apply-discount", {
      method: "POST",
      body: JSON.stringify({ amount, merchant_name: merchantName }),
    });
  }

  // PARENTAL CONTROL
  async getParentalControlSettings(): Promise<any> {
    return this.request<any>("/parental-control/settings");
  }

  async updateParentalControl(settings: any): Promise<any> {
    return this.request<any>("/parental-control/update", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  }

  // MULTILINGUAL NLP INTENT
  async testNlpIntent(query: string): Promise<any> {
    return this.request<any>("/agent/nlp-intent", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  }
}

export const apiClient = new ApiClient();
