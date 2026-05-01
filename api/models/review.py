from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..dependencies.database import Base

# The review SQL table. 
# This is for the online application for customers to review dishes that they previously bought.
# The customer ID and resource they are reviewing are referenced in the table, followed by the unique score and
# description that is provided by the customer.
class Review(Base):
    __tablename__ = "review"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customer.id"), nullable=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=True)
    review_txt = Column(String(500), nullable=False)
    score = Column(Integer, nullable=False)

    customer = relationship("Customer", back_populates="reviews")
    resource = relationship("Resource", back_populates="reviews")