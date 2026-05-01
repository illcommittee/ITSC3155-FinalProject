from sqlalchemy import Column, Integer, String, Float, DATETIME
from ..dependencies.database import Base

# This is the SQL table for promotional codes, including their primary ID key for order,
# the code name, percentage of discount and their expiration date.
class Promotion(Base):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    promo_code = Column(String(50), nullable=False, unique=True)
    discount_percent = Column(Float, nullable=False, default=10.0)
    expiration_date = Column(DATETIME, nullable=False)