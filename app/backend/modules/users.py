from starlette.responses import RedirectResponse
from starlette.requests import Request
from functools import wraps
import bcrypt
import time
import asyncio
from resources.resources import flat_list
from .. import settings
from ..resources import jwt_encode, jwt_decode, hash_password

#
# Config
#
db_name = settings.DB['DB_NAME']
users_colt = settings.DB['COL_USERS']
groups_colt = settings.DB['COL_GROUPS']
routes_colt = settings.DB['COL_ROUTES']

user_db = "JSON"    # định viết lưu thẳng data user bằng json nhưng lười chưa viết
user_db = "MONGO"



#
# Authentication
#
def authenticate(f):
    @wraps(f)
    async def wrapper(request: Request, *args, **kwargs):
        global db_client
        db_client = request.state.db
        session = request.session
        # print(session)
        if "token" not in session: # chưa đăng nhập nên token không có trong session hoặc session hết hạn
            return RedirectResponse(url=request.url_for("login"), status_code=303)
        else:
            encoded_jwt = session["token"]
            session_data = jwt_decode(encoded_jwt)
            if session_data == False: # token hết hạn
                return RedirectResponse(url=request.url_for("login"), status_code=303)
            # Check user không tồn tại (hiếm gặp trừ khi bị làm giả token vì token đã được mã hoá)
            # Đoạn này có thể bỏ qua để đỡ tốn query đến db mất thời gian, có token và decode ra không lỗi là được
            # check_user_ = await check_user(data)
            # if check_user_ == False:
            #     return RedirectResponse(url=f"/auth/login_page", status_code=303)

            # Check route permission
            check_route = check_route_permission(request, session_data)
            if check_route == False:
                print(f'redirect check_route fail: {request.url_for("home_page")}')
                return RedirectResponse(url=request.url_for("home_page"), status_code=303)

        return await f(request, *args, **kwargs)
    return wrapper
async def check_user(data):
    username = data['user_id']
    '''
    Ở đây xác định username là unique và token là bảo mật, nên chỉ cần decode token và check username có tồn tại hay không là đủ
    '''
    user_found = await db_get_user(username)
    if user_found:
        return True 
        # Nếu xác định token là đủ bảo mật thì không cần phải check password, token cũng có thời hạn expire
        # nên giảm thiểu được rủi ro, trong trường hợp cần bảo mật hơn thì phải check password
        passwordcheck = email_found['password']
    else:
        return False
async def login(request, username, password, session, remember_me):
    session.clear()
    global db_client
    db_client = request.state.db
    # Get user
    user_found = await get_user(username)
    if user_found != None:
        # Get all routes from user's groups
        user_routes = await update_routes_to_session(user_found['groups'])
        # Check password are the same
        password_found =  user_found['password']
        if bcrypt.checkpw(password.encode('utf-8'), password_found):
            # Make token
            if remember_me == True:
                exp_time = time.time() + settings.JWT_MAX_AGE_REMEMBER_ME
            else:
                exp_time = time.time() + settings.JWT_MAX_AGE
            payload = {
                'user_id': username,
                'groups': user_found['groups'],
                'user_routes': user_routes,
                'exp': exp_time
            }
            token = jwt_encode(payload)
            # Store token in session & cookies
            session["token"] = token
            return True
        else:
            return "Wrong password"
    else:
        return "No user found"
async def logout(session):
    session.clear()
async def register(username, password, session):
    # Check user found
    user_found = await get_user(username)
    if user_found != None:
        return 'There already is a user by that name'
    else:
        hashed_password = hash_password(password)
        user_input = {'username': username, 'password': hashed_password}
        user = await db_add_user(user_input)
        # Make token
        payload = {
            'user_id': username,
            'exp': time.time() + settings.JWT_MAX_AGE
        }
        token = jwt_encode(payload)
        # Store token in session
        session["token"] = token
        return True




#
# Authorization
#
def check_route_permission(request, session_data):
    route = request.scope["root_path"] + request.scope["path"]
    if 'dev' in session_data['groups']:
        return True
    try:
        user_routes = request.state.user_data['user_routes']
    except:
        user_routes = session_data['user_routes']
    if not str(route) in user_routes:
        return False
    else:
        return True
async def update_routes_to_session(groups):
    group_names = [group for group in groups]
    find_ = { 'group_name': { "$in": group_names } }
    data = await db_client.find_many(find_, groups_colt)
    routes = []
    for group in data:
        routes += group['routes']
    return list(set(routes))



#
# Users
#
async def get_users(request):
    session = request.session
    encoded_jwt = session["token"]
    user_data = jwt_decode(encoded_jwt)

    if "admin" in user_data['groups'] or "dev" in user_data['groups']:
        # Get all
        if user_db == "MONGO":
            return await db_get_users(), user_data
    elif "mod" in user_data['groups']:
        # Get all user in all user's group
        groups = user_data['groups']
        if user_db == "MONGO":
            return await db_get_users_by_groups(groups), user_data
async def get_user_session(request):
    session = request.session
    encoded_jwt = session["token"]
    user_data = jwt_decode(encoded_jwt)
    return user_data
async def get_user(username):
    if user_db == "MONGO":
        return await db_get_user(username)
    pass
async def add_user(data):
    if user_db == "MONGO":
        return await db_add_user(data)
async def edit_user(user_data, _id):
    if user_db == "MONGO":
        return await db_edit_user(user_data, _id)
async def delete_user(username):
    if user_db == "MONGO":
        return await db_delete_user(username)
        


#
# Groups
#
async def get_groups():
    if user_db == "MONGO":
        groups = await db_get_groups()
        return [group['group_name'] for group in groups]
async def get_groups_data():
    if user_db == "MONGO":
        return await db_get_groups()
async def get_group(group_name):
    if user_db == "MONGO":
        return await db_get_group(group_name)
async def add_group(group_name):
    if user_db == "MONGO":
        return await db_add_group(group_name)
async def edit_group(group_data, _id):
    if user_db == "MONGO":
        return await db_edit_group(group_data, _id)
async def delete_group(group_name):
    if user_db == "MONGO":
        return await db_delete_group(group_name)
async def update_route_to_gorups(old_route, new_route):
    if user_db == "MONGO":
        async def task_update_group(group_data, _id):
            await db_edit_group(group_data, _id)
        groups = await get_groups_data()
        print(f"groups: {groups}")
        tasks = []
        for group in groups:
            if "routes" in group:
                _id = group['_id']
                routes = group['routes']
                update_routes = [new_route if x==old_route else x for x in routes]
                update_routes = [route for route in update_routes if route != None]
                group_data = {
                    "routes": update_routes
                }
                t = asyncio.create_task(task_update_group(group_data, _id))
                tasks.append(t)

        return await asyncio.gather(*tasks)

#
# Routes
#
async def get_routes():
    if user_db == "MONGO":
        return await db_get_routes()
async def get_route(route):
    if user_db == "MONGO":
        return await db_get_route(route)
async def add_route(routes):
    if user_db == "MONGO":
        return await db_add_routes(routes)
async def edit_route(route_data, _id):
    if user_db == "MONGO":
        return await db_edit_route(route_data, _id)
async def delete_route(route):
    if user_db == "MONGO":
        return await db_delete_route(route)


#
# DB
#
async def db_get_users():
    users = await db_client.find_many({}, users_colt)
    return users
async def db_get_users_by_groups(groups):
    async def task_get_user(find_):
        return await db_client.find_many(find_, users_colt)
    tasks = []
    for group in groups:
        find_ = {"groups": group}
        t = asyncio.create_task(task_get_user(find_))
        tasks.append(t)
    
    data = await asyncio.gather(*tasks)
    users = flat_list(data)
    unique_user_name =  list(set([user['username'] for user in users]))
    r_users = []
    for user in users:
        if user['username'] in unique_user_name:
            r_users.append(user)
            unique_user_name.remove(user['username'])
    return r_users

async def db_get_users_not_in_team():
    find_ = { "$or":[{'team': { '$exists': False }}, {'team': None}] }
    result = await db_client.find_many(find_, users_colt,)
    return result

async def db_get_users_by_ids(ids):
    
    users = await db_client.find_many({"_id": {"$in":ids}}, users_colt,filter_={"username":1,"_id":1})
    return users

async def db_get_user(username):
    return await db_client.find_one({"username": username}, users_colt)
async def db_add_user(data):
    return await db_client.insert_one(data, users_colt)
async def db_edit_user(user_data, _id):
    return await db_client.update_one(_id, user_data, users_colt)
async def db_delete_user(username):
    return await db_client.delete({"username": username}, users_colt)

async def db_get_groups():
    return await db_client.find_many({}, groups_colt)
async def db_get_group(group_name):
    return await db_client.find_one({"group_name": group_name}, groups_colt)
async def db_add_group(group_name):
    return await db_client.insert_one({"group_name": group_name}, groups_colt)
async def db_edit_group(group_data, _id):
    return await db_client.update_one(_id, group_data, groups_colt)
async def db_delete_group(group_name):
    return await db_client.delete({"group_name": group_name}, groups_colt)

async def db_get_routes():
    routes = await db_client.find_many({}, routes_colt)
    return [route['route'] for route in routes]
async def db_get_route(route):
    return await db_client.find_one({"route": route}, routes_colt)
async def db_add_routes(routes):
    documents_ = [{"route": route} for route in routes]
    return await db_client.insert_many(documents_, routes_colt)
async def db_edit_route(route_data, _id):
    return await db_client.update_one(_id, route_data, routes_colt)
async def db_delete_route(route):
    return await db_client.delete({"route": route}, routes_colt)


#
# JSON
#
