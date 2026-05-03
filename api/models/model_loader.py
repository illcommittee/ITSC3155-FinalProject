from . import customer, orders, payment_info, promotions, resources, review

from ..dependencies.database import engine


def index():
    customer.Base.metadata.create_all(engine)
    orders.Base.metadata.create_all(engine)
    payment_info.Base.metadata.create_all(engine)
    promotions.Base.metadata.create_all(engine)
    resources.Base.metadata.create_all(engine)
    review.Base.metadata.create_all(engine)
