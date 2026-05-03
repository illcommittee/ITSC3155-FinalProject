from fastapi.testclient import TestClient
from ..controllers import promotions as controller
from ..main import app
import pytest
from ..models import promotions as model
from datetime import datetime

# Create a test client for the app
client = TestClient(app)


@pytest.fixture
def db_session(mocker):
    return mocker.Mock()


def test_create_promotion(db_session):
    # Create a sample promotion
    promotion_data = {
        "promo_code": "SUMMER26",
        "discount_percent": 15.0,
        "expiration_date": datetime(2026, 12, 31, 23, 59, 59)
    }

    # Handles desyncs between models/controllers
    from types import SimpleNamespace
    promotion_object = SimpleNamespace(**promotion_data)

    # Call the create function
    created_promotion = controller.create(db_session, promotion_object)

    # Assertions
    assert created_promotion is not None
    assert created_promotion.promo_code == "SUMMER26"
    assert created_promotion.expiration_date == datetime(2026, 12, 31, 23, 59, 59)
