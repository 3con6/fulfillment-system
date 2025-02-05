from starlette.middleware import Middleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from resources.db import MongoAsyncPipeline
from resources.resources import flat_list
from .settings import DB, SESSION_SECRET_KEY, SESSION_MAX_AGE
from .resources import jwt_decode

class DatabaseMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        db_client = MongoAsyncPipeline(DB['DB_HOST'], DB['DB_NAME'])
        request.state.db = db_client

        response = await call_next(request)
        return response

class UserDataMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        try:
            users_colt = DB['COL_USERS']
            groups_colt = DB['COL_GROUPS']
            db_client = request.state.db
            
            # Get user data from session token
            data = jwt_decode(request.session['token'])
            request.state.user_data = data
            
            # Get user data from db
            user = await db_client.find_one({"username": data['user_id']}, users_colt)
            request.state.user_data.update(user)
            
            # Get routes            
            data = await db_client.find_many({"group_name": {"$in": user['groups']}}, groups_colt, filter_=None, limit_=0)
            routes = list(set(flat_list([record['routes'] for record in data])))
            
            request.state.user_data.update({'user_routes': routes})
        except Exception as e:
            # print(f"UserDataMiddleware error: {e}")
            pass
        
        response = await call_next(request)
        return response


middleware = [
    Middleware(SessionMiddleware, secret_key=SESSION_SECRET_KEY, max_age=SESSION_MAX_AGE),
    Middleware(DatabaseMiddleware),
    Middleware(UserDataMiddleware),
    Middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*']),
]