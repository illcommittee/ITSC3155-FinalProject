from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..dependencies.database import Base

# The payment information SQL table. This tracks the payment of the orders themselves.
# The primary key ID is present for easy reference, along with the status and type of payment
# and any promotional codes added for discount.
class PaymentInfo(Base):
    __tablename__ = "payment_info"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    total_price = Column(Float, nullable=False)
    card_info = Column(String(50), nullable=False)
    transaction_status = Column(String(50), nullable=False)
    payment_type = Column(String(50), nullable=False)
    promo_code = Column(String(50), nullable=True)

    order = relationship("Order", back_populates="payment_info")