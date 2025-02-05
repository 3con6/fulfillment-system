from starlette.applications import Starlette
from .routes import routes
from .middlewares import middleware


app = Starlette(
    routes=routes,
    middleware=middleware,
)
