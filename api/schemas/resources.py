from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ResourceBase(BaseModel):
    order_date: datetime # BUGSTRING
    dishes: str
    ingredients: str
    resource_amount: dict
    menu_price: dict
    calories: dict
    allergens: dict

# FIX BELOW

class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    item: Optional[str] = None
    amount: Optional[int] = None


class Resource(ResourceBase):
    id: int

    class ConfigDict:
        from_attributes = True
