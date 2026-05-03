from . import customer, orders, payment_info, promotions, resources, review, users

from ..dependencies.database import engine, Base


def index():
    Base.metadata.create_all(engine)
