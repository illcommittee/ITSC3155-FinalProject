from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from .order_details import OrderDetail


class CustomerBase(BaseModel):
    promo_code: str
    expiration_date: datetime #BUGSTRING