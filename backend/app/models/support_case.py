import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from app.db.session import Base


class SupportCase(Base):
    __tablename__ = "support_cases"

    id = Column(String, primary_key=True, index=True)  # e.g., CASE-1092
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    transaction_id = Column(String, ForeignKey("transactions.id"), index=True, nullable=False)
    complaint = Column(String, nullable=False)
    status = Column(String, default="OPEN", nullable=False)  # OPEN, INVESTIGATING, RESOLVED, ESCALATED
    priority = Column(String, default="HIGH", nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    risk_score = Column(Float, default=25.0, nullable=False)  # 0 to 100
    assigned_admin = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
