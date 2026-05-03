from fastapi.testclient import TestClient
from ..controllers import customer as controller
from ..main import app
import pytest
from ..models import customer as model

# Create a test client for the app
client = TestClient(app)


@pytest.fixture
def db_session(mocker):
    return mocker.Mock()


def test_create_customer(db_session):
    # Create a sample customer
    customer_data = {
        "customer_name": "John Doe",
        "email": "jdoe@gmail.com",
        "phone_num": "1234567890",
        "address": "123 Main St",
        "password": "password"

    }

    from types import SimpleNamespace # Alternative to SQLAlchemy (which led to errors in previous implementations)
    customer_object = SimpleNamespace(**customer_data)

    # Call the create function
    created_customer = controller.create(db_session, customer_object)

    # Assertions
    assert created_customer is not None
    assert created_customer.customer_name == "John Doe"
    assert created_customer.email == "jdoe@gmail.com"
    assert created_customer.phone_num == "1234567890"
    assert created_customer.address == "123 Main St"
