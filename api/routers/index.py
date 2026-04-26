from . import orders, resources


def load_routes(app):
    app.include_router(orders.router)
    app.include_router(resources.router)