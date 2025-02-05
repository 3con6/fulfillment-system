from starlette.responses import PlainTextResponse, RedirectResponse
from ..resources import templates, hash_password, jwt_decode
from ..modules.users import authenticate, login, logout, register, get_user_session, get_users, get_user, add_user, edit_user, delete_user, get_groups, get_group, add_group, edit_group, delete_group, add_route, get_routes, get_route, edit_route, delete_route, update_route_to_gorups


@authenticate
async def test_authen_page(request):
    return PlainTextResponse(f"check authen")
async def redirect_main(request):
    return RedirectResponse(url='./manage_users')

#
# Main
#
@authenticate
async def admin_page(request):
    data = {}
    return templates.TemplateResponse('index.html', {'request': request, "data": data})


#
# User
#
async def login_page(request):
    if request.method == "POST":
        data = await request.form()
        username = data['username']
        password = data['password']
        if "remember_me" in data: remember_me = True
        else: remember_me = False
        login_ = await login(request, username, password, request.session, remember_me)
        print(login_)
        print(f'redirect post: {request.url_for("home_page")}')
        return RedirectResponse(url=request.url_for("home_page"), status_code=303)
    else:
        if "token" in request.session:
            encoded_jwt = request.session["token"]
            session_data = jwt_decode(encoded_jwt)
            if session_data == False: # token hết hạn
                return templates.TemplateResponse('login.html', {'request': request, 'data': {"meta_title": "Login Page"}})
            print(f'redirect: {request.url_for("home_page")}')
            return RedirectResponse(url=request.url_for("home_page"), status_code=303)
        return templates.TemplateResponse('login.html', {'request': request, 'data': {"meta_title": "Login Page"}})
async def logout_page(request):
    await logout(request.session)
    return RedirectResponse(url=f"./login", status_code=303)
async def register_page(request):
    if request.method == "POST":
        data = await request.form()
        username = data['username']
        password = data['password']
        register_ = await register(username, password, request.session)
        return RedirectResponse(url=f"./", status_code=303)
    else:
        return templates.TemplateResponse('register.html', {'request': request, 'data': {"meta_title": "Register Page"}})
@authenticate
async def manage_users_page(request):
    users, user_data = await get_users(request)
    data = {
        "users": users,
        "user_data": user_data,
        "meta_title": "Manage Users"
    }
    return templates.TemplateResponse('user/manage_users.html', {'request': request, 'data': data})
@authenticate
async def add_user_page(request):
    if request.method == "POST":
        data = await request.form()
        username = data['username']
        password = data['password']
        special_id = data['special_id']
        groups = data.getlist('groups')
        data = {
            "username": username,
            "password": hash_password(password),
            "groups": groups,
            "special_id": special_id
        }
        add_user_ = await add_user(data)
        if add_user_ != "Dupkey" and add_user_ != "error":
            return RedirectResponse(url=f"./manage_users", status_code=303)
        else:
            return PlainTextResponse(f"add user failed {add_user_}")
    else:
        groups = await get_groups()
        user_data = await get_user_session(request)
        data = {
            "groups": groups,
            "user_groups": user_data['groups'],
            "meta_title": "Add User"
        }
        return templates.TemplateResponse('user/add_user.html', {'request': request, 'data': data})
@authenticate
async def edit_user_page(request):
    if request.method == "POST":
        data = await request.form()
        _id = data['_id']
        username = data['username']
        password = data['password']
        special_id = data['special_id']
        groups = data.getlist('groups')
        if password == "":
            user_data = {
                "username": username,
                "groups": groups,
                "special_id": special_id,
            }
        else:
            user_data = {
                "username": username,
                "password": hash_password(password),
                "groups": groups,
                "special_id": special_id,
            }
        edit_ = await edit_user(user_data, _id)
        if edit_ == 1:
            return RedirectResponse(url=f"./manage_users", status_code=303)
        else:
            return PlainTextResponse(f"edit user failed {edit_}")
    else:
        user_data = await get_user_session(request)
        username = request.query_params['username']
        user_edit = await get_user(username)
        groups = await get_groups()
        data = {
            "user_edit": user_edit,
            "user_groups": user_data['groups'],
            "groups": groups,
            "meta_title": "Edit User"
        }
        # If not dev,admin, mod - can not change other user
        if not any([group in user_data['groups'] for group in ['dev', 'admin', 'mod']]) and username != user_data['user_id']:
            return RedirectResponse(url=f"./", status_code=303)
        return templates.TemplateResponse('user/edit_user.html', {'request': request, 'data': data})
@authenticate
async def delete_user_page(request):
    username = request.query_params['username']
    delete = await delete_user(username)
    if delete == True:
        return RedirectResponse(url=f"./manage_users", status_code=303)
    else:
        return PlainTextResponse(f'delete result: {delete}')


#
# Group
#
@authenticate
async def manage_groups_page(request):
    groups = await get_groups()
    data = {
        "groups": groups,
        "meta_title": "Manage Group"
    }
    return templates.TemplateResponse('user/manage_groups.html', {'request': request, 'data': data})
@authenticate
async def add_group_page(request):
    if request.method == "POST":
        data = await request.form()
        group_name = data['group_name']
        add_group_ = await add_group(group_name)
        return RedirectResponse(url=f"./manage_groups", status_code=303)
    else:
        return templates.TemplateResponse('user/add_group.html', {'request': request, 'data': {"meta_title": "Add Group"}})
@authenticate
async def edit_group_page(request):
    if request.method == "POST":
        data = await request.form()
        _id = data['_id']
        group_name = data['group_name']
        routes = data.getlist('routes')
        group_data = {
            "group_name": group_name,
            "routes": routes,
        }
        edit_ = await edit_group(group_data, _id)
        if edit_ == 1:
            return RedirectResponse(url=f"./manage_groups", status_code=303)
        else:
            return PlainTextResponse(f"edit user failed {edit_}")
    else:
        user_data = await get_user_session(request)
        group_name = request.query_params['group_name']
        group_edit = await get_group(group_name)
        routes = await get_routes()
        data = {
            "routes": routes,
            "group_edit": group_edit,
            "meta_title": "Edit Group"
        }
        return templates.TemplateResponse('user/edit_group.html', {'request': request, 'data': data})
@authenticate
async def delete_group_page(request):
    group_name = request.query_params['group_name']
    delete = await delete_group(group_name)
    if delete == True:
        return RedirectResponse(url=f"./manage_groups", status_code=303)
    else:
        return PlainTextResponse(f'delete result: {delete}')

#
# Routes
#
@authenticate
async def manage_routes_page(request):
    routes = await get_routes()
    data = {
        "routes": routes,
        "meta_title": "Manage Routes"
    }
    return templates.TemplateResponse('user/manage_routes.html', {'request': request, 'data': data})
@authenticate
async def add_route_page(request):
    if request.method == "POST":
        data = await request.form()
        route_data = data['routes'].split('\n')
        routes = [route.strip() for route in route_data]

        add_route_ = await add_route(routes)
        return RedirectResponse(url=f"./manage_routes", status_code=303)
    else:
        return templates.TemplateResponse('user/add_route.html', {'request': request, 'data': {"meta_title": "Add Route"}})
@authenticate
async def edit_route_page(request):
    # cap nhat lai tat ca group & clear session
    if request.method == "POST":
        data = await request.form()
        _id = data['_id']
        old_route = data['old_route']
        new_route = data['new_route']
        route_data = {
            "route": new_route
        }
        edit_ = await edit_route(route_data, _id)
        if edit_ == 1:
            await update_route_to_gorups(old_route, new_route)
            return RedirectResponse(url=f"./manage_routes", status_code=303)
        else:
            return PlainTextResponse(f"edit route failed {edit_}")
    else:
        user_data = await get_user_session(request)
        route = request.query_params['route']
        route_data = await get_route(route)
        data = {
            "route": route,
            "route_data": route_data,
            "meta_title": "Edit Route"
        }
        return templates.TemplateResponse('user/edit_route.html', {'request': request, 'data': data})
    pass
@authenticate
async def delete_route_page(request):
    # cap nhat lai tat ca group & clear session
    route = request.query_params['route']
    delete = await delete_route(route)
    if delete == True:
        await update_route_to_gorups(route, None)
        return RedirectResponse(url=f"./manage_routes", status_code=303)
    else:
        return templates.PlainTextResponse(f'delete result: {delete}')