import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from app.db.session import Base


class RiskCase(Base):
    __tablename__ = "risk_cases"

    id = Column(String, primary_key=True, index=True)
    case_number = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    trx_id = Column(String, nullable=True, index=True)
    
    risk_score = Column(Float, nullable=False)  # 0 to 100
    risk_level = Column(String, nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    category = Column(String, nullable=False)  # MULE_ACCOUNT, RAPID_VELOCITY, SOCIAL_ENGINEERING, SUSPICIOUS_CASH_OUT
    
    signals = Column(JSON, default=list)  # Triggered fraud signals
    ai_explanation = Column(String, nullable=False)
    evidence = Column(JSON, default=dict)
    
    status = Column(String, default="FLAGGED", nullable=False)  # FLAGGED, UNDER_INVESTIGATION, CLEARED, BLOCKED
    action_taken = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
