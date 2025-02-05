from starlette.applications import Starlette
from starlette.routing import Mount
from backend.app import app as backend_app
from backend.resources import templates
from starlette.exceptions import HTTPException

# handle errors
async def not_found(request):
    return templates.TemplateResponse("404.html", status_code=HTTPException.status_code)
async def server_error(request):
    return templates.TemplateResponse("500.html", status_code=HTTPException.status_code)
async def not_authorized(request):
    return templates.TemplateResponse("401.html", status_code=HTTPException.status_code)

exception_handlers = {
    404: not_found,
    500: server_error,
    401: not_authorized
}

app = Starlette(
    routes=[
        Mount('/', app=backend_app),
    ],
    debug=True,
    exception_handlers=exception_handlers
)