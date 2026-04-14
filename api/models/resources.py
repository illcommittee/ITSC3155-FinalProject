from sqlalchemy import Column, ForeignKey, Integer, String, DECIMAL, DATETIME, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from ..dependencies.database import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dishes = Column(String(100), nullable=False)
    ingredients = Column(String(200), nullable=False)
    resource_amount = Column(String(50), nullable=False)
    menu_price = Column(Float, nullable=False)
    calories = Column(Integer, nullable=False)
    allergens = Column(String(200), nullable=True)
    order_date = Column(DATETIME, default=datetime.now, nullable=False)
