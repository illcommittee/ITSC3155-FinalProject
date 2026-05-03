from datetime import datetime
from typing import Optional
from pydantic import BaseModel



class OrderBase(BaseModel):
    order_num: int
    customer_id: Optional[int] = None
    customer_name: str
    tracking_num: str
    order_status: bool
    total_price: float
    order_details: Optional[str] = None
    order_type: str

class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    tracking_num: Optional[str] = None
    order_status: Optional[bool] = None
    total_price: Optional[float] = None
    order_details: Optional[str] = None
    order_type: Optional[str] = None


class Order(OrderBase):
    id: int
    order_date: datetime

    class Config:
        from_attributes = True