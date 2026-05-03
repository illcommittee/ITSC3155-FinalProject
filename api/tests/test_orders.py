import api.models.customer
import api.models.review
import api.models.payment_info
import api.models.orders as model

def test_create_order():
    order_data = {
        "order_num": 2001,
        "customer_id": 1,
        "customer_name": "John Doe",
        "tracking_num": "TRACK2001",
        "order_status": False,
        "total_price": 12.99,
        "order_details": "Chicken Sandwich",
        "order_type": "takeout",
    }

    order_object = model.Order(**order_data)

    assert order_object.order_num == 2001
    assert order_object.customer_id == 1
    assert order_object.customer_name == "John Doe"
    assert order_object.tracking_num == "TRACK2001"
    assert order_object.order_status is False
    assert order_object.total_price == 12.99
    assert order_object.order_details == "Chicken Sandwich"
    assert order_object.order_type == "takeout"