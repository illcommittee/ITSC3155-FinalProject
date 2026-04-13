from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from .order_details import OrderDetail


class PromotionBase(BaseModel):
    promo_code: str
    expiration_date: datetime #BUGSTRING

class PromotionCreate(PromotionBase):
    pass

class PromotionUpdate(BaseModel):
    promo_code: Optional[str] = None
    expiration_date: Optional[datetime] = None


class Promotion(PromotionBase):
    id: int

    class ConfigDict:
        from_attributes = True