"""
Seed script for the final project demo.

This script clears existing demo records and inserts sample menu items,
customers, promotions, orders, payment records, and reviews so the API
has data available for Swagger testing and the frontend demo.
"""

import hashlib
from datetime import datetime
from sqlalchemy import text

from api.dependencies.database import SessionLocal, engine
from api.models.customer import Customer
from api.models.orders import Order
from api.models.payment_info import PaymentInfo
from api.models.promotions import Promotion
from api.models.resources import Resource
from api.models.review import Review


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def migrate_schema():
    """Add any missing columns to existing tables."""
    with engine.connect() as conn:
        try:
            conn.execute(text(
                "ALTER TABLE customer ADD COLUMN is_staff BOOLEAN NOT NULL DEFAULT FALSE"
            ))
            conn.commit()
            print("Added is_staff column to customer table.")
        except Exception:
            pass  # Column already exists


def seed_database():
    """Reset and populate the database with demo data."""
    migrate_schema()
    db = SessionLocal()

    try:
        # Delete child/dependent records first.
        db.query(Review).delete()
        db.query(PaymentInfo).delete()
        db.query(Order).delete()
        db.query(Promotion).delete()
        db.query(Resource).delete()
        db.query(Customer).delete()
        db.commit()

        # Menu/resources
        resources = [
            Resource(
                dishes="Chicken Sandwich",
                ingredients="Chicken, bun, pickles",
                resource_amount="25",
                menu_price=8.99,
                calories=550,
                allergens="gluten",
                category="sandwich",
            ),
            Resource(
                dishes="Veggie Wrap",
                ingredients="Tortilla, lettuce, tomato, cucumber, hummus",
                resource_amount="18",
                menu_price=7.49,
                calories=430,
                allergens="gluten",
                category="vegetarian",
            ),
            Resource(
                dishes="Kids Grilled Cheese",
                ingredients="Bread, cheese, butter",
                resource_amount="12",
                menu_price=5.99,
                calories=390,
                allergens="gluten, dairy",
                category="kids",
            ),
            Resource(
                dishes="Spicy Chicken Bowl",
                ingredients="Chicken, rice, peppers, spicy sauce",
                resource_amount="0",
                menu_price=10.99,
                calories=720,
                allergens=None,
                category="spicy",
            ),
        ]
        db.add_all(resources)
        db.flush()

        # Customers
        customers = [
            Customer(
                order_num=1001,
                customer_name="Alice Johnson",
                email="alice.johnson@email.com",
                phone_num="7045551001",
                address="123 Main St",
                password_hash=hash_password("password123"),
                is_staff=False,
            ),
            Customer(
                order_num=1002,
                customer_name="Brian Lee",
                email="brian.lee@email.com",
                phone_num="7045551002",
                address="Pickup",
                password_hash=hash_password("password123"),
                is_staff=False,
            ),
            Customer(
                order_num=1003,
                customer_name="Carmen Ortiz",
                email="carmen.ortiz@email.com",
                phone_num="7045551003",
                address="789 Pine Rd",
                password_hash=hash_password("password123"),
                is_staff=False,
            ),
            Customer(
                order_num=0,
                customer_name="Staff Manager",
                email="staff@restaurant.com",
                phone_num="7045550000",
                address="Restaurant HQ",
                password_hash=hash_password("staffpass123"),
                is_staff=True,
            ),
        ]
        db.add_all(customers)
        db.flush()

        # Promotions
        promotions = [
            Promotion(
                promo_code="SAVE10",
                discount_percent=10,
                expiration_date=datetime.fromisoformat("2026-12-31T23:59:59"),
            ),
            Promotion(
                promo_code="LUNCH5",
                discount_percent=5,
                expiration_date=datetime.fromisoformat("2026-06-30T23:59:59"),
            ),
        ]
        db.add_all(promotions)
        db.flush()

        # Orders
        orders = [
            Order(
                order_num=1001,
                customer_id=customers[0].id,
                customer_name="Alice Johnson",
                order_date=datetime.fromisoformat("2026-04-29T10:15:00"),
                tracking_num="TRACK1001",
                order_status=True,
                total_price=29.95,
                order_details="Chicken Sandwich, Veggie Wrap",
                order_type="delivery",
            ),
            Order(
                order_num=1002,
                customer_id=customers[1].id,
                customer_name="Brian Lee",
                order_date=datetime.fromisoformat("2026-04-29T11:20:00"),
                tracking_num="TRACK1002",
                order_status=False,
                total_price=15.50,
                order_details="Kids Grilled Cheese",
                order_type="takeout",
            ),
            Order(
                order_num=1003,
                customer_id=customers[2].id,
                customer_name="Carmen Ortiz",
                order_date=datetime.fromisoformat("2026-04-30T13:45:00"),
                tracking_num="TRACK1003",
                order_status=True,
                total_price=10.99,
                order_details="Spicy Chicken Bowl",
                order_type="delivery",
            ),
        ]
        db.add_all(orders)
        db.flush()

        # Payment information
        payments = [
            PaymentInfo(
                order_id=orders[0].id,
                total_price=29.95,
                card_info="**** **** **** 1234",
                transaction_status="Completed",
                payment_type="Credit Card",
                promo_code="SAVE10",
            ),
            PaymentInfo(
                order_id=orders[1].id,
                total_price=15.50,
                card_info="**** **** **** 5678",
                transaction_status="Pending",
                payment_type="Debit Card",
                promo_code=None,
            ),
            PaymentInfo(
                order_id=orders[2].id,
                total_price=10.99,
                card_info="PayPal transaction",
                transaction_status="Completed",
                payment_type="PayPal",
                promo_code="LUNCH5",
            ),
        ]
        db.add_all(payments)
        db.flush()

        # Reviews
        reviews = [
            Review(
                customer_id=customers[0].id,
                resource_id=resources[0].id,
                review_txt="Great sandwich. The chicken was fresh and the order was ready quickly.",
                score=5,
            ),
            Review(
                customer_id=customers[1].id,
                resource_id=resources[2].id,
                review_txt="Good for kids, but the bread was a little too buttery.",
                score=4,
            ),
            Review(
                customer_id=customers[2].id,
                resource_id=resources[3].id,
                review_txt="Too spicy for me and the bowl was missing sauce.",
                score=2,
            ),
            Review(
                customer_id=customers[0].id,
                resource_id=resources[1].id,
                review_txt="Nice vegetarian option. I would order it again.",
                score=5,
            ),
        ]
        db.add_all(reviews)

        db.commit()

        print("Database seeded successfully.")
        print(f"Created {len(resources)} resources/menu items.")
        print(f"Created {len(customers)} customers (including 1 staff account: staff@restaurant.com / staffpass123).")
        print(f"Created {len(promotions)} promotions.")
        print(f"Created {len(orders)} orders.")
        print(f"Created {len(payments)} payment records.")
        print(f"Created {len(reviews)} reviews.")

    except Exception as error:
        db.rollback()
        print(f"Seed failed: {error}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()