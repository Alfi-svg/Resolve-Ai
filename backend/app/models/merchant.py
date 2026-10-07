from sqlalchemy import Column, String
from app.db.session import Base


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # RESTAURANT, SUPERSTORE, ELECTRONICS, RETAIL, UTILITY
    location = Column(String, nullable=False)
    status = Column(String, default="ACTIVE", nullable=False)  # ACTIVE, SUSPENDED
