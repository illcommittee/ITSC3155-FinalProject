from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class PromotionBase(BaseModel):
    promo_code: str
    discount_percent: float = 10.0 # We decided discounts will be 10% by default
    expiration_date: datetime

class PromotionCreate(PromotionBase):
    pass

class PromotionUpdate(BaseModel):
    promo_code: Optional[str] = None
    discount_percent: Optional[float] = None
    expiration_date: Optional[datetime] = None


class Promotion(PromotionBase):
    id: int

    class ConfigDict:
        from_attributes = True