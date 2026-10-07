from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class TransactionBase(BaseModel):
    trx_id: str
    user_id: str
    type: str
    amount: float
    fee: float = 0.0
    receiver_phone: str
    receiver_name: Optional[str] = None
    channel: str = "APP"
    status: str = "SUCCESS"
    error_code: Optional[str] = None
    gateway_message: Optional[str] = None
    meta_info: Optional[Dict[str, Any]] = None


class TransactionResponse(TransactionBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
