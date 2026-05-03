from . import orders, resources, customer

def load_routes(app):
    app.include_router(orders.router)
    app.include_router(resources.router)
    app.include_router(customer.router)