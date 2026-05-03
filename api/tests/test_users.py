from fastapi.testclient import TestClient
from ..controllers import users as controller
from ..main import app
import pytest
from ..models import users as model

# Create a test client for the app
client = TestClient(app)


@pytest.fixture
def db_session(mocker):
    return mocker.Mock()


def test_create_user(db_session):
    # Create a sample user
    user_data = {
        "username": "johndoe",
        "password": "forkbomb"
    }

    user_object = model.User(**user_data)

    # Call the create function
    created_user = controller.create_user(db_session, user_object)

    # Assertions
    assert created_user is not None
    assert created_user.username == "johndoe"
    assert created_user.password == "forkbomb"
