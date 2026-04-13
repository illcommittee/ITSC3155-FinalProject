from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from .order_details import OrderDetail


class CustomerBase(BaseModel):
    order_num: int
    customer_name: str
    total_price: float
    order_details: str
    card_info: str
    transaction_status: bool
    payment_type: str
    promo_code: str