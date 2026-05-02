from . import customer, orders, payment_info, promotions, resources, review


def load_routes(app):
    app.include_router(customer.router)
    app.include_router(orders.router)
    app.include_router(payment_info.router)
    app.include_router(promotions.router)
    app.include_router(resources.router)
    app.include_router(review.router)