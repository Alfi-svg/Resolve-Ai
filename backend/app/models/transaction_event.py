import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from app.db.session import Base


class TransactionEvent(Base):
    __tablename__ = "transaction_events"

    id = Column(String, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.id"), index=True, nullable=False)
    event_type = Column(String, nullable=False)  # WALLET_DEBIT, GATEWAY_REQUEST, GATEWAY_RESPONSE, MERCHANT_NOTIFICATION, SETTLEMENT_REQUEST, SETTLEMENT_RESPONSE, REFUND_REQUEST, REFUND_COMPLETED
    source = Column(String, nullable=False)  # CORE_LEDGER, APP_CLIENT, PAYMENT_GATEWAY, MERCHANT_INTEGRATION_HUB, RECON_ENGINE
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    status = Column(String, nullable=False)  # SUCCESS, FAILED, TIMEOUT, PENDING
    event_metadata = Column("metadata", JSON, default=dict)

    @property
    def metadata(self):
        return self.event_metadata

    @metadata.setter
    def metadata(self, val):
        self.event_metadata = val
