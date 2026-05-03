from sqlalchemy import Column, Integer, String, DATETIME, Float
from datetime import datetime
from ..dependencies.database import Base

# The resources SQL table for the restaurant.
# All dishes are identified with their respective primary key, ID, and image provided, and have
# their nutrition information, ingredients and other infor are printed for their section of the table.
# Including their descriptions, the amount of the resource is tracked along with the order date.
class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dishes = Column(String(100), nullable=False)
    ingredients = Column(String(200), nullable=False)
    resource_amount = Column(Integer, nullable=False, default=100)
    menu_price = Column(Float, nullable=False)
    calories = Column(Integer, nullable=False)
    allergens = Column(String(200), nullable=True)
    category = Column(String(100), nullable=False)
    order_date = Column(DATETIME, default=datetime.now, nullable=False)

    reviews = relationship("Review", back_populates="resource")
