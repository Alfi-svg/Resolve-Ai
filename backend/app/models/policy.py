from sqlalchemy import Column, String
from app.db.session import Base


class Policy(Base):
    __tablename__ = "policies"

    id = Column(String, primary_key=True, index=True)  # e.g., POL-MFS-001
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)  # GATEWAY_FAILURE, FRAUD_PREVENTION, SETTLEMENT_TIMEOUT, CHARGEBACK
    rule = Column(String, nullable=False)
    resolution_action = Column(String, nullable=False)  # INSTANT_REFUND, TEMPORARY_HOLD, MANUAL_ESCALATION, CHARGEBACK_FREEZE
