from fastapi.testclient import TestClient
from ..controllers import review as controller
from ..main import app
import pytest
from ..models import review as model

# Create a test client for the app
client = TestClient(app)


@pytest.fixture
def db_session(mocker):
    return mocker.Mock()


def test_create_review(db_session):
    # Create a sample review
    review_data = {
        "customer_id": 1,
        "resource_id": 1,
        "review_txt": "Great food, but my server was kinda rude... will come back on a better day.",
        "score": 4
    }

    # Handles desyncs between models/controllers
    from types import SimpleNamespace
    review_object = SimpleNamespace(**review_data)

    # Call the create function
    created_review = controller.create(db_session, review_object)

    # Assertions
    assert created_review is not None
    assert created_review.customer_id == 1
    assert created_review.review_txt == "Great food, but my server was kinda rude... will come back on a better day."
    assert created_review.score == 4