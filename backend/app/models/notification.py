import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from app.db.session import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="AGENT_ALERT", nullable=False)  # AGENT_ALERT, INVESTIGATION_UPDATE, REFUND_CREDITED, UNDO_SUCCESS, STUDENT_BENEFIT
    related_id = Column(String, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
