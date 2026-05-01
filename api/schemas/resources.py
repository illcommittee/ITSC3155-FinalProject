from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ResourceBase(BaseModel):
    dishes: str
    ingredients: str
    resource_amount: int = 100 # It's arbitrary so we chose 100
    menu_price: float
    calories: int
    allergens: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None

class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    dishes: Optional[str] = None
    ingredients: Optional[str] = None
    resource_amount: Optional[int] = None
    menu_price: Optional[float] = None
    calories: Optional[int] = None
    allergens: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None


class Resource(ResourceBase):
    id: int
    order_date: datetime

    class ConfigDict:
        from_attributes = True