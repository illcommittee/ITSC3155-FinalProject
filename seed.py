# To populate sql with data run: python seed.py

"""
Seed script for populating the database with mock data.
Usage: python seed.py
"""

from datetime import datetime
from api.models.users import User
from api.models.orders import Order
from api.models.customer import Customer
from api.models.payment_info import PaymentInfo
from api.models.review import Review
from api.dependencies.database import SessionLocal


def seed_database():
    """Populate the database with mock data for testing and demonstration."""
    db = SessionLocal()

    try:
        # Clear existing data
        db.query(Review).delete()
        db.query(PaymentInfo).delete()
        db.query(Order).delete()
        db.query(Customer).delete()
        db.query(User).delete()
        db.commit()

        # Seed Users
        users = [
            User(username="alice_johnson", password="password123"),
            User(username="brian_lee", password="password123"),
            User(username="carmen_ortiz", password="password123"),
            User(username="admin", password="admin123"),
        ]
        db.add_all(users)
        db.flush()

        # Seed Customers (required for foreign key)
        customers = [
            Customer(
                customer_name="Alice Johnson",
                email="alice.johnson@email.com",
                phone_num=1234567890,
                address="123 Main St",
                order_num=2
            ),
            Customer(
                customer_name="Brian Lee",
                email="brian.lee@email.com",
                phone_num=2345678901,
                address="456 Oak Ave",
                order_num=2
            ),
            Customer(
                customer_name="Carmen Ortiz",
                email="carmen.ortiz@email.com",
                phone_num=3456789012,
                address="789 Pine Rd",
                order_num=1
            ),
        ]
        db.add_all(customers)
        db.flush()

        # Seed Orders (5 orders)
        orders = [
            Order(
                order_num=1001,
                customer_id=1,
                customer_name="Alice Johnson",
                order_date=datetime.fromisoformat("2026-04-29T10:15:00"),
                tracking_num="TRACK1001",
                order_status=True,
                total_price=29.95
            ),
            Order(
                order_num=1002,
                customer_id=2,
                customer_name="Brian Lee",
                order_date=datetime.fromisoformat("2026-04-29T11:20:00"),
                tracking_num="TRACK1002",
                order_status=False,
                total_price=15.50
            ),
            Order(
                order_num=1003,
                customer_id=1,
                customer_name="Alice Johnson",
                order_date=datetime.fromisoformat("2026-04-29T12:30:00"),
                tracking_num="TRACK1003",
                order_status=True,
                total_price=42.10
            ),
            Order(
                order_num=1004,
                customer_id=3,
                customer_name="Carmen Ortiz",
                order_date=datetime.fromisoformat("2026-04-29T13:45:00"),
                tracking_num="TRACK1004",
                order_status=True,
                total_price=60.00
            ),
            Order(
                order_num=1005,
                customer_id=2,
                customer_name="Brian Lee",
                order_date=datetime.fromisoformat("2026-04-29T14:55:00"),
                tracking_num="TRACK1005",
                order_status=False,
                total_price=22.75
            ),
        ]
        db.add_all(orders)
        db.flush()

        # Seed Payment Information
        payment_infos = [
            PaymentInfo(
                order_id=1,
                total_price=29.95,
                card_info="**** **** **** 1234",
                transaction_status="Completed",
                payment_type="Credit Card"
            ),
            PaymentInfo(
                order_id=2,
                total_price=15.50,
                card_info="**** **** **** 5678",
                transaction_status="Pending",
                payment_type="Debit Card"
            ),
            PaymentInfo(
                order_id=3,
                total_price=42.10,
                card_info="**** **** **** 1234",
                transaction_status="Completed",
                payment_type="Credit Card",
                promo_code="SAVE10"
            ),
            PaymentInfo(
                order_id=4,
                total_price=60.00,
                card_info="**** **** **** 9012",
                transaction_status="Completed",
                payment_type="PayPal"
            ),
            PaymentInfo(
                order_id=5,
                total_price=22.75,
                card_info="**** **** **** 5678",
                transaction_status="Failed",
                payment_type="Debit Card"
            ),
        ]
        db.add_all(payment_infos)
        db.flush()

        # Seed Reviews
        reviews = [
            Review(
                customer_id=1,
                review_txt="Great product! Fast delivery and excellent quality. Highly recommend.",
                score=5
            ),
            Review(
                customer_id=1,
                review_txt="Good purchase, but packaging could be better.",
                score=4
            ),
            Review(
                customer_id=2,
                review_txt="Product arrived damaged. Customer service was helpful though.",
                score=3
            ),
            Review(
                customer_id=3,
                review_txt="Perfect! Exactly what I was looking for. Will buy again!",
                score=5
            ),
            Review(
                customer_id=2,
                review_txt="Decent product for the price.",
                score=4
            ),
        ]
        db.add_all(reviews)
        db.commit()

        print("✓ Database seeded successfully!")
        print(f"  • Created {len(users)} users")
        print(f"  • Created {len(customers)} customers")
        print(f"  • Created {len(orders)} orders")
        print(f"  • Created {len(payment_infos)} payment records")
        print(f"  • Created {len(reviews)} reviews")

    except Exception as e:
        db.rollback()
        print(f"✗ Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
