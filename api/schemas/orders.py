from datetime import datetime
from typing import Optional
from pydantic import BaseModel



class OrderBase(BaseModel):
    order_num: int
    customer_name: str
    customer_id: int
    order_date: datetime
    tracking_num: str
    order_status: bool
    total_price: float

class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_id: Optional[int] = None
    tracking_num: Optional[str] = None
    order_status: Optional[bool] = None
    total_price: Optional[float] = None


class Order(OrderBase):
    id: int
    order_date: datetime

    class ConfigDict:
        from_attributes = True
