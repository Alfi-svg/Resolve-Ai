from typing import Dict, Any, List, Optional
from app.services.risk_guard.behavior_analyzer import behavior_analyzer
from app.services.risk_guard.signal_detector import signal_detector
from app.services.risk_guard.risk_scoring import risk_scorer
from app.services.risk_guard.risk_explainer import risk_explainer
from app.services.risk_guard.risk_recommendation import risk_recommendation_engine
from app.services.risk_guard.fraud_pattern_detector import fraud_pattern_detector
from app.services.risk_guard.scam_signal_detector import scam_signal_detector
from app.services.risk_guard.account_takeover_detector import account_takeover_detector


class RiskGuardService:
    """
    Risk Guard Orchestrator: Detect. Analyze. Protect.
    Integrates:
    - Core 8-step Risk Pipeline
    - Synthetic Fraud Pattern Detection (7 patterns)
    - Natural Language Scam Signal Detection (Complaint intelligence)
    - Account Takeover (ATO) Specialized Compound Risk Detection
    """

    @classmethod
    def evaluate_transaction(
        cls, 
        transaction: Dict[str, Any], 
        user_history: Optional[List[Dict[str, Any]]] = None,
        custom_behavior: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes the full Risk Guard AI Pipeline for a given transaction.
        Enriches output with Fraud Patterns and Account Takeover evaluation.
        """
        # Step 1 & 2: Behavioral Signals Extraction
        behavioral_context = behavior_analyzer.analyze(
            transaction=transaction,
            user_history=user_history,
            custom_baseline=custom_behavior
        )

        # Step 3 & 4: Rule Evaluation & Anomaly Detection
        signals = signal_detector.detect_signals(
            transaction=transaction,
            behavioral_context=behavioral_context
        )

        # Step 5: Risk Scoring
        scoring = risk_scorer.score_signals(signals)

        # Step 6: AI Explanation
        explanation = risk_explainer.generate_explanation(
            transaction=transaction,
            scoring_result=scoring,
            behavioral_context=behavioral_context
        )

        # Step 7: Recommended Action
        recommendation = risk_recommendation_engine.evaluate_recommendations(
            scoring_result=scoring,
            transaction=transaction
        )

        # Fraud Pattern Detection (7 synthetic patterns)
        fraud_patterns = fraud_pattern_detector.evaluate_patterns(
            transaction=transaction,
            context=behavioral_context
        )

        # Account Takeover (ATO) Specialized Evaluation (5 core signals)
        ato_evaluation = account_takeover_detector.evaluate(
            transaction=transaction,
            telemetry=behavioral_context
        )

        # Build pipeline milestones for UI visualization
        pipeline_steps = [
            {"step": 1, "name": "Transaction Ingestion", "status": "COMPLETED", "summary": f"{transaction.get('id', 'TXN')} received via {transaction.get('channel', 'APP')}"},
            {"step": 2, "name": "Behavioral Signals", "status": "COMPLETED", "summary": f"Device, velocity, and circadian baselines computed"},
            {"step": 3, "name": "Rule Evaluation", "status": "COMPLETED", "summary": f"Evaluated 7 deterministic risk rules"},
            {"step": 4, "name": "Anomaly Detection", "status": "COMPLETED", "summary": f"{len(signals)} behavioral deviations identified"},
            {"step": 5, "name": "Risk Scoring", "status": "COMPLETED", "summary": f"Composite score: {scoring['score']}/100 ({scoring['risk_level']})"},
            {"step": 6, "name": "AI Explanation", "status": "COMPLETED", "summary": "Analytical non-defamatory rationale synthesized"},
            {"step": 7, "name": "Recommended Action", "status": "COMPLETED", "summary": recommendation['primary_recommendation']},
            {"step": 8, "name": "Human Decision", "status": "AWAITING", "summary": "Ready for admin governance action"}
        ]

        return {
            "transaction_id": transaction.get("id"),
            "amount": transaction.get("amount"),
            "risk_score": scoring["score"],
            "raw_score": scoring["raw_score"],
            "max_score": 100,
            "risk_level": scoring["risk_level"],
            "risk_level_label": scoring["risk_level_label"],
            "badge_color": scoring["badge_color"],
            "signals": signals,
            "signals_count": len(signals),
            "explanation": explanation,
            "recommendation": recommendation,
            "behavioral_context": behavioral_context,
            "pipeline_steps": pipeline_steps,
            "fraud_patterns": fraud_patterns,
            "fraud_patterns_count": len(fraud_patterns),
            "account_takeover": ato_evaluation
        }

    @classmethod
    def detect_fraud_patterns(cls, transaction: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        return fraud_pattern_detector.evaluate_patterns(transaction=transaction, context=context)

    @classmethod
    def analyze_scam_signals(cls, complaint_text: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return scam_signal_detector.analyze_complaint(complaint_text=complaint_text, metadata=metadata)

    @classmethod
    def evaluate_account_takeover(cls, transaction: Dict[str, Any], telemetry: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return account_takeover_detector.evaluate(transaction=transaction, telemetry=telemetry)


risk_guard_service = RiskGuardService()
