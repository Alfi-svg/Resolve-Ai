from sqlalchemy import Column, String, Float, ForeignKey
from app.db.session import Base


class AIInvestigation(Base):
    __tablename__ = "ai_investigations"

    id = Column(String, primary_key=True, index=True)  # e.g., INV-8F31A2
    case_id = Column(String, ForeignKey("support_cases.id"), index=True, nullable=False)
    intent = Column(String, nullable=False)
    transaction_id = Column(String, ForeignKey("transactions.id"), index=True, nullable=False)
    root_cause = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)  # 0.0 to 1.0
    risk_score = Column(Float, nullable=False)  # 0 to 100
    recommendation = Column(String, nullable=False)
    status = Column(String, default="COMPLETED", nullable=False)  # COMPLETED, NEEDS_APPROVAL, ACTIONED
