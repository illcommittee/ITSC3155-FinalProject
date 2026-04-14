from . import orders


def load_routes(app):
    app.include_router(orders.router)
