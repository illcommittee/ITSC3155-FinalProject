from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from ..dependencies.database import Base

class Customer(Base):
    __tablename__ = "customer"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    phone_num = Column(String(20), nullable=False)
    address = Column(String(200), nullable=False)
    order_num = Column(Integer, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_staff = Column(Boolean, nullable=False, default=False)

    orders = relationship("Order", back_populates="customer")
    reviews = relationship("Review", back_populates="customer")