from sqlalchemy import Column, Integer, BigInteger, String
from sqlalchemy.orm import relationship
from ..dependencies.database import Base

# The customer table parameters.
# Each customer account in our SQL table will have their email, name, password, and other
# important information for identification.
class Customer(Base):
    __tablename__ = "customer"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    phone_num = Column(String(20), nullable=False)
    address = Column(String(200), nullable=False)
    order_num = Column(Integer, nullable=False)
    password_hash = Column(String(255), nullable=False, default="")

    orders = relationship("Order", back_populates="customer")
    reviews = relationship("Review", back_populates="customer")