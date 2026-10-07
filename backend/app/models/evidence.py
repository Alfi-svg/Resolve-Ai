import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from app.db.session import Base


class Evidence(Base):
    __tablename__ = "evidences"

    id = Column(String, primary_key=True, index=True)
    investigation_id = Column(String, ForeignKey("ai_investigations.id"), index=True, nullable=False)
    source = Column(String, nullable=False)  # CORE_LEDGER, PAYMENT_GATEWAY, MERCHANT_SWITCH, USER_CLIENT
    event = Column(String, nullable=False)  # WALLET_DEBIT_CONFIRMED, GATEWAY_TIMEOUT, etc.
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    importance = Column(String, default="HIGH", nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    details = Column(String, nullable=False)
