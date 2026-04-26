from typing import Optional
from pydantic import BaseModel

class PaymentInfoBase(BaseModel):
    order_id: int
    total_price: float
    card_info: str
    transaction_status: str
    payment_type: str
    promo_code: Optional[str] = None

class PaymentInfoCreate(PaymentInfoBase):
    pass

class PaymentInfoUpdate(BaseModel):
    total_price: Optional[float] = None
    card_info: Optional[str] = None
    transaction_status: Optional[str] = None
    promo_code: Optional[str] = None
    payment_type: Optional[str] = None

class PaymentInfo(PaymentInfoBase):
    id: int

    class ConfigDict:
        from_attributes = True