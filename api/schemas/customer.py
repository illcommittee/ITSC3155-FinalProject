from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from .order_details import OrderDetail


class CustomerBase(BaseModel):
    order_num: int
    customer_name: str
    email: str
    phone_num: int
    address: str

# FIX BELOW

class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    customer_name: Optional[str] = None
    email: Optional[str] = None
    phone_num: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None


class Customer(CustomerBase):
    id: int

    class configDict:
        from_attributes = True
