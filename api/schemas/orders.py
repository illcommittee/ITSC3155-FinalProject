from datetime import datetime
from typing import Optional
from pydantic import BaseModel



class OrderBase(BaseModel):
    customer_name: str
    customer_id: Optional[int] = None
    order_type: str = "takeout"
    dish_names: Optional[str] = None
    order_status: bool = False
    total_price: float

class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_id: Optional[int] = None
    tracking_num: Optional[str] = None
    order_status: Optional[bool] = None
    order_type: Optional[str] = None
    total_price: Optional[float] = None


class Order(OrderBase):
    id: int
    order_num: int
    tracking_num: str
    order_date: datetime

    class ConfigDict:
        from_attributes = True
