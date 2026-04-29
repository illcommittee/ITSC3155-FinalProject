from .database import SessionLocal
from . import models

def seed_db():
    db = SessionLocal()
    if db.query(models.Customer).first() is None:
        customers = [
            
        ]