from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..dependencies.database import Base

class Review(Base):
    __tablename__ = "review"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customer.id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    review_txt = Column(String(500), nullable=False)
    score = Column(Integer, nullable=False)

    customer = relationship("Customer", back_populates="reviews")
    resource = relationship("Resource", back_populates="reviews")