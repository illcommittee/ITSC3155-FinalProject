from fastapi.testclient import TestClient
from ..controllers import orders as controller
from ..main import app
import pytest
from ..models import orders as model
from datetime import datetime

# Create a test client for the app
client = TestClient(app)


@pytest.fixture
def db_session(mocker):
    return mocker.Mock()


def test_create_order(db_session):
    # Create a sample order
    order_data = {
        "customer_id": 1,
        "order_num": 1001,
        "customer_name": "John Doe",
        "order_status": True,
        "order_type": "dine-in",
        "dish_names": "Grilled Salmon, Caesar Salad",
        "total_price": 45.99
    }

    # Handles desyncs between models/controllers
    from types import SimpleNamespace
    order_object = SimpleNamespace(**order_data)

    # Call the create function
    created_order = controller.create(db_session, order_object)

    # Assertions
    assert created_order is not None
    assert created_order.customer_id == 1
    assert created_order.order_num == 1001
    assert created_order.customer_name == "John Doe"
    assert created_order.order_date == datetime(2026, 5, 3, 12, 0, 0)
    assert created_order.tracking_num is not None
    assert created_order.order_status == True
    assert created_order.total_price == 45.99