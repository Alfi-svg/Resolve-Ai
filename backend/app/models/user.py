import datetime
from sqlalchemy import Column, String, Float, DateTime
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone_masked = Column(String, nullable=False, index=True)
    account_status = Column(String, default="ACTIVE", nullable=False)  # ACTIVE, FLAGGED, SUSPENDED
    wallet_balance = Column(Float, default=15000.0, nullable=False)
    risk_level = Column(String, default="LOW", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    role = Column(String, default="USER", nullable=False)  # USER, ADMIN
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
