from sqlalchemy import Column, ForeignKey, Integer, String, DATETIME, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..dependencies.database import Base

# These are the parameters of our orders SQL table. The primary key, id is our general
# identifier as it propagates to our other tables.
# Other information provided is the customer information, including order information and the
# tracking identifier for the employees at the restaurant.
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customer.id"), nullable=True)
    order_num = Column(Integer)
    customer_name = Column(String(100))
    order_date = Column(DATETIME, default=datetime.now, nullable=False)
    tracking_num = Column(String(50), nullable=False, unique=True)
    order_status = Column(Boolean, nullable=False, default=False)
    order_type = Column(String(20), nullable=False, default="takeout")
    dish_names = Column(String(1000), nullable=True)
    total_price = Column(Float, nullable=False)
    order_details = Column(String(500), nullable=True)
    order_type = Column(String(50), nullable=False)
    customer = relationship("Customer", back_populates="orders")
    payment_info = relationship("PaymentInfo", back_populates="order", uselist=False)