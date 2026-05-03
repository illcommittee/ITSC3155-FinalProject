from sqlalchemy import Column, Integer, String, Float, DATETIME
from ..dependencies.database import Base

class Promotion(Base):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    promo_code = Column(String(50), nullable=False, unique=True)
    discount_percent = Column(Float, nullable=False)
    expiration_date = Column(DATETIME, nullable=False)