from fastapi.testclient import TestClient
from ..controllers import resources as controller
from ..main import app
import pytest
from ..models import resources as model
from datetime import datetime

# Create a test client for the app
client = TestClient(app)


@pytest.fixture
def db_session(mocker):
    return mocker.Mock()


def test_create_resource(db_session):
    # Create a sample resource
    resource_data = {
        "dishes": "Veggie Wrap",
        "ingredients": "Tortilla, lettuce, tomato, cucumber, hummus",
        "resource_amount": "2 lbs",
        "menu_price": 7.49,
        "calories": 430,
        "allergens": "gluten",
        "category": "Seafood",
        "image_url": "https://example.com/grilled-salmon.jpg"
    }

    # Handles desyncs between models/controllers
    from types import SimpleNamespace
    resource_object = SimpleNamespace(**resource_data)

    # Call the create function
    created_resource = controller.create(db_session, resource_object)

    # Assertions
    assert created_resource is not None
    assert created_resource.dishes == "Veggie Wrap"
    assert created_resource.ingredients == "Tortilla, lettuce, tomato, cucumber, hummus"
    assert created_resource.resource_amount == "2 lbs"
    assert created_resource.menu_price == 7.49
    assert created_resource.calories == 430
    assert created_resource.allergens == "gluten"