from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from .order_details import OrderDetail



class OrderBase(BaseModel):
    order_num: int
    customer_name: str
    customer_id: int
    order_date: datetime # BUGSTRING
    tracking_num: int
    order_status: bool
    total_price: float
    order_details: str



# FIX BELOW

class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_id: Optional[int] = None
    tracking_num: Optional[str] = None
    order_status: Optional[str] = None
    total_price: Optional[float] = None
    description: Optional[str] = None


class Order(OrderBase):
    id: int
    order_date: datetime
    order_details: list[OrderDetail] = None

    class ConfigDict:
        from_attributes = True
