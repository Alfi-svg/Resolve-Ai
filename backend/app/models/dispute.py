import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from app.db.session import Base


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(String, primary_key=True, index=True)
    ticket_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    trx_id = Column(String, nullable=True, index=True)
    complaint_text = Column(String, nullable=False)
    
    # AI Pipeline Results
    detected_intent = Column(String, nullable=True)
    identified_trx_id = Column(String, nullable=True)
    ai_confidence = Column(Float, default=0.0)
    root_cause = Column(String, nullable=True)
    policy_matched = Column(String, nullable=True)
    risk_level = Column(String, default="LOW")
    recommendation = Column(String, nullable=True)
    suggested_action = Column(String, nullable=True)  # REFUND, HOLD_FUNDS, ESCALATE_MANUAL, CLOSE
    
    reasoning_steps = Column(JSON, default=list)  # Stored sequence of reasoning steps with status, evidence, confidence, explanation
    evidence_data = Column(JSON, default=dict)
    
    # Dispute Status
    status = Column(String, default="IN_REVIEW", nullable=False)  # IN_REVIEW, APPROVED, REJECTED, AUTO_RESOLVED
    admin_notes = Column(String, nullable=True)
    resolution_feedback = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
