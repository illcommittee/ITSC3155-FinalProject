from fastapi.testclient import TestClient
from ..controllers import payment_info as controller
from ..main import app
import pytest
from ..models import payment_info as model

# Create a test client for the app
client = TestClient(app)


@pytest.fixture
def db_session(mocker):
    return mocker.Mock()


def test_create_payment_info(db_session):
    # Create a sample payment_info
    payment_info_data = {
        "order_id": 444,
        "total_price": 10.50,
        "card_info": "Billable",
        "transaction_status": "approved",
        "payment_type": "credit",
        "promo_code": "SAVE10"
    }

    payment_info_object = model.PaymentInfo(**payment_info_data)

    # Call the create function
    created_payment_info = controller.create(db_session, payment_info_object)

    # Assertions
    assert created_payment_info is not None
    assert created_payment_info.order_id == 444
    assert created_payment_info.total_price == 10.50
    assert created_payment_info.card_info == "Billable"
    assert created_payment_info.transaction_status == "approved"
    assert created_payment_info.payment_type == "credit"
    assert created_payment_info.promo_code == "SAVE10"
