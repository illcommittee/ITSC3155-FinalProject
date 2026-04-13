from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ResourceBase(BaseModel):
    order_date: datetime # BUGSTRING
    dishes: str
    ingredients: str
    resource_amount: str
    menu_price: float
    calories: int
    allergens: Optional[str] = None

# FIX BELOW

class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    dishes: Optional[str] = None
    ingredients: Optional[str] = None
    resource_amount: Optional[str] = None
    unit: Optional[str] = None
    menu_price: Optional[float] = None
    calories: Optional[int] = None
    allergens: Optional[str] = None
    item: Optional[str] = None
    amount: Optional[int] = None


class Resource(ResourceBase):
    id: int

    class ConfigDict:
        from_attributes = True
