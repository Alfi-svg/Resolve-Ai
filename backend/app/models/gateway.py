from sqlalchemy import Column, String, Integer, Float
from app.db.session import Base


class Gateway(Base):
    __tablename__ = "gateways"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="OPERATIONAL", nullable=False)  # OPERATIONAL, DEGRADED, OUTAGE
    latency = Column(Integer, default=120, nullable=False)  # in milliseconds
    health_score = Column(Float, default=99.0, nullable=False)  # 0 to 100
