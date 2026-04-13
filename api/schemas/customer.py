from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from .order_details import OrderDetail


class CustomerBase(BaseModel):
    order_num: int
    customer_name: str
    order_date: datetime # BUGSTRING
    email: str
    phone_num: int
    address: str

# FIX BELOW

class CustomerCreate(CustomerBase):
    pass


class OrderUpdate(BaseModel):
    customer_name: Optional[str] = None
    description: Optional[str] = None


class Order(OrderBase):
    id: int
    order_date: Optional[datetime] = None
    order_details: list[OrderDetail] = None

    class ConfigDict:
        from_attributes = True
