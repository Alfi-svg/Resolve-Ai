import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from app.db.session import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)  # e.g., TXN-8F31A2
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    merchant_id = Column(String, ForeignKey("merchants.id"), index=True, nullable=True)
    type = Column(String, nullable=False)  # QR_PAYMENT, SEND_MONEY, CASH_OUT, MOBILE_RECHARGE
    amount = Column(Float, nullable=False)
    currency = Column(String, default="BDT", nullable=False)
    status = Column(String, default="SUCCESS", nullable=False)  # SUCCESS, PARTIAL_FAILURE, FAILED, PENDING, REVERSED
    channel = Column(String, default="APP", nullable=False)  # QR, APP, USSD, AGENT_POS
    device_id = Column(String, nullable=False)
    location = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    failure_code = Column(String, nullable=True)
    gateway_id = Column(String, ForeignKey("gateways.id"), nullable=True, index=True)

    # Optional metadata helper
    meta_info = Column(JSON, default=dict)
