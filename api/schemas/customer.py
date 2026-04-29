from typing import Optional
from pydantic import BaseModel


class CustomerBase(BaseModel):
    order_num: int
    customer_name: str
    email: str
    phone_num: int
    address: str

class CustomerCreate(CustomerBase):
    password: str


class CustomerUpdate(BaseModel):
    customer_name: Optional[str] = None
    email: Optional[str] = None
    phone_num: Optional[int] = None
    address: Optional[str] = None


class CustomerLogin(BaseModel):
    email: str


class Customer(CustomerBase):
    id: int

    class Config:
        from_attributes = True