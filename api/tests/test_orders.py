from fastapi.testclient import TestClient
from ..controllers import orders as controller
from ..main import app
import pytest
from ..models import orders as model

# Create a test client for the app
client = TestClient(app)


@pytest.fixture
def db_session(mocker):
    return mocker.Mock()


def test_create_multiple_orders(db_session):
    # List of dummy orders
    orders_data = [
        {
            "customer_name": "John Doe",
            "description": "Test Order 1",
            "tracking_number": "1"
        },
        {
            "customer_name": "Jane Smith",
            "description": "Test Order 2",
            "tracking_number": "2"
        },
        {
            "customer_name": "Alice Johnson",
            "description": "Test Order 3",
            "tracking_number": "3"
        }
    ]

    created_orders = []

    # Create orders
    for order_data in orders_data:
        order_object = model.Order(**order_data)
        created = controller.create(db_session, order_object)
        created_orders.append(created)

    # Assertions
    assert len(created_orders) == len(orders_data)

    for i, created_order in enumerate(created_orders):
        assert created_order is not None
        assert created_order.customer_name == orders_data[i]["customer_name"]
        assert created_order.description == orders_data[i]["description"]
        assert created_order.tracking_number == orders_data[i]["tracking_number"]
