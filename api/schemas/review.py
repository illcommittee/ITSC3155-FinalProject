from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from .order_details import OrderDetail


class Reviewbase(BaseModel):
    customer_name: str
    review_txt: str
    score: int