from sqlalchemy import Column, ForeignKey, Integer, String, DECIMAL, DATETIME, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..dependencies.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customer.id"), nullable=False)
    order_num = Column(Integer)
    customer_name = Column(String(100))
    order_date = Column(DATETIME, default=datetime.now, nullable=False)
    tracking_num = Column(String(50), nullable=False, unique=True)
    order_status = Column(Boolean, nullable=False)
    total_price = Column(Float, nullable=False)


    customer = relationship("Customer", back_populates="orders")
    payment_info = relationship("PaymentInfo", back_populates="order", uselist=False)