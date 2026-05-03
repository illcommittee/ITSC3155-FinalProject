from typing import Optional
from pydantic import BaseModel


class CustomerBase(BaseModel):
    order_num: int
    customer_name: str
    email: str
    phone_num: str
    address: str


class CustomerCreate(CustomerBase):
    password: str


class CustomerUpdate(BaseModel):
    customer_name: Optional[str] = None
    email: Optional[str] = None
    phone_num: Optional[str] = None
    address: Optional[str] = None


class CustomerLogin(BaseModel):
    email: str
    password: str


class Customer(CustomerBase):
    id: int
    is_staff: bool = False

    class Config:
        from_attributes = True