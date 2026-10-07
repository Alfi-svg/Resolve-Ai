import datetime
from sqlalchemy import Column, String, DateTime, JSON
from app.db.session import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    action = Column(String, index=True, nullable=False)
    actor = Column(String, nullable=False)
    admin_id = Column(String, nullable=True, index=True)
    case_id = Column(String, nullable=True, index=True)
    target_type = Column(String, index=True, nullable=False)
    target_id = Column(String, index=True, nullable=False)
    details = Column(String, nullable=False)
    reason = Column(String, nullable=True)
    previous_status = Column(String, nullable=True)
    new_status = Column(String, nullable=True)
    log_metadata = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
