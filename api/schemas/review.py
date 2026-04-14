from typing import Optional
from pydantic import BaseModel


class ReviewBase(BaseModel):
    customer_id: int
    review_txt: str
    score: int

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    review_txt: Optional[str] = None
    score: Optional[int] = None


class Review(ReviewBase):
    id: int

    class ConfigDict:
        from_attributes = True