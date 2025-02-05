from starlette.templating import Jinja2Templates
from starlette.requests import Request
from starlette.staticfiles import StaticFiles
import jwt
import bcrypt
from . import settings
from backend import settings as be_settings
from resources.resources import encode_url
import json

#
# Encryption
#
def jwt_encode(data):
    encoded_jwt = jwt.encode(data, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt
def jwt_decode(encoded_jwt):
    try:
        data = jwt.decode(encoded_jwt, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return data
    except jwt.ExpiredSignatureError: # token hết hạn sẽ tự động có exception này
        return False
    except: # có thể cần thêm log cho chuẩn chỉnh
        return False
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
def check_token(token):
    if token == be_settings.TOKEN:
        return True
    else:
        return False


# Page navi
async def get_page_data(request, page=None, limit_=50):
    if page == None:
        query_params = request.query_params
        page_number = query_params.get('page')
        if page_number == None: page_number = 1
        page_number = int(page_number)
    else:
        page_number = page
    skip_ = (page_number - 1) * limit_
    return page_number, limit_, skip_

def make_page_navi(request, count_data, limt_, page_number, route_name):
    current_page = str(request.url.path)
    total_page = int(int(count_data) / limt_) + 1
    if page_number < total_page:
        next_page = page_number + 1
        if page_number == 1:
            prev_page = None
        else:
            prev_page = page_number - 1
    else: # last page
        next_page = None
        prev_page = page_number - 1
        
    if next_page != None:
        next_page = current_page + f"/?page={next_page}"
    if prev_page != None:
        if prev_page == 1:
            prev_page = current_page
            print(f"current_page: {current_page}")
        else:
            prev_page = current_page + f"/?page={prev_page}"
        
    start_page = max(page_number - 2, 1)
    end_page = min(page_number + 2, total_page)

    page_navi = {
        "page_number": page_number,
        "total_page": total_page,
        "next_page": next_page,
        "prev_page": prev_page,
        "current_page": next_page,
        "start_page": start_page,
        "end_page": end_page,
        'route_name': route_name
    }

    return page_navi

#
# Jinja
#
def to_pretty_json(value):
    return json.dumps(value, sort_keys=True,
                      indent=4, separators=(',', ': '))

def jinja_check_route_permission(route, session_data):
    if session_data == False:
        return False
    if 'groups' in session_data and 'dev' in session_data['groups']:
        return True
    user_routes = session_data['user_routes']
    if not str(route) in user_routes:
        return False
    else:
        return True
def jinja_check_group_permission(group_data, session_data):
    group_split = group_data.split(",")
    if session_data == False:
        return False
    if 'groups' in session_data and 'dev' in session_data['groups']:
        return True
    groups = session_data['groups']
    if not any([str(group) in groups for group in group_split]):
        return False
    else:
        return True
    
def jinja_check_not_group_permission(group_data, session_data):
    group_split = group_data.split(",")
    if session_data == False:
        return False
    if 'groups' in session_data and 'dev' in session_data['groups']:
        return True
    groups = session_data['groups']
    if any([str(group) in groups for group in group_split]):
        return False
    else:
        return True

def site_name():
    return settings.SITE_NAME
def jinja_list_routes():
    return [
        {
            'route': "/products",
            "name": "Warehouse"
        },
        {
            'route': "/ff_products",
            "name": "FF Products"
        },
        {
            'route': "/fulfillments",
            "name": "Fulfillments"
        }
    ]

static = StaticFiles(directory=f'./backend/themes/{settings.THEME}/assets')
templates = Jinja2Templates(
    directory=f'./backend/themes/{settings.THEME}/templates',
    autoescape=False, 
    auto_reload=True, 
)
templates.env.globals['encode_url'] = encode_url
templates.env.globals['jwt_decode'] = jwt_decode
templates.env.globals['j2_route_perm'] = jinja_check_route_permission
templates.env.globals['j2_group_perm'] = jinja_check_group_permission
templates.env.globals['j2_not_group_perm'] = jinja_check_not_group_permission
templates.env.globals['site_name'] = site_name
templates.env.globals['jinja_list_routes'] = jinja_list_routes
templates.env.filters['tojson_pretty'] = to_pretty_json

