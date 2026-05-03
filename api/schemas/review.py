from typing import Optional
from pydantic import BaseModel
class ReviewBase(BaseModel):
    customer_id: int
    resource_id: int
    review_txt: str
    score: int
class ReviewCreate(ReviewBase):
    pass
class ReviewUpdate(BaseModel):
    customer_id: Optional[int] = None
    resource_id: Optional[int] = None
    review_txt: Optional[str] = None
    score: Optional[int] = None
class Review(ReviewBase):
    id: int
    class Config:
        from_attributes = True