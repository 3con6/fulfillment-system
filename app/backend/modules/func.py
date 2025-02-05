from aiolimiter import AsyncLimiter
import asyncio
import aiohttp
import time
import random
import traceback
from user_agent import generate_user_agent
from typing import List, Dict
from datetime import datetime
from ..settings import DB, list_status,token_printify,api_key_merchize,gearment_api_key,gearment_api_signature
from resources.db import convert_to_mongodb_time, convert_to_time
import urllib.parse
from ..settings import telegram_head, bot_token
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from collections import defaultdict
import base64
import base64
import json
from pypdf import PdfReader

#
# Async request
#
class async_rq:
    '''
    Class request gộp chung khởi tạo session, rate limit, timeout
    async_request_session(): hàm này chạy chung các request trên 1 session, về lý thuyết là nhẹ hơn và nhanh hơn
    async_request_all(): hàm này chạy riêng các request trên các session khác nhau, trong trường hợp request tới search engine thì có thể dùng chung session sẽ bị detect cookies hoặc gì đó nên đã dùng riêng session và thấy ok nên cứ dùng
    '''
    # Khởi tạo rate limit và session
    def __init__ (self, rqs=50, second=1, time_out=30, max_rq_tasks=17, rate_limit=True):
        # class rate limit, sử dụng với function rate_limit, đảm bảo giới hạn trong 1 khoảng thời gian chỉ có 1 số lượng request nhất định. Vd shopify giới hạn 2rq/s.
        self.rate_limit = rate_limit
        self.rate_limit_ = AsyncLimiter(rqs, second)
        self.time_out = time_out
        self.max_rq_tasks = max_rq_tasks
        self.rq_limit = asyncio.Semaphore(max_rq_tasks)
        self.session = self.session_init()
    # Session
    def session_init(self):
        timeout = aiohttp.ClientTimeout(total=self.time_out)
        connector = aiohttp.TCPConnector(limit=self.max_rq_tasks, verify_ssl=False)
        session = aiohttp.ClientSession(timeout=timeout, connector=connector)
        return session
    async def session_close(self):
        await self.session.close()
    # Header
    def set_headers(self, headers):
        ua = generate_user_agent()
        if headers == None: headers = {
            'user-agent': ua,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 
            'Accept-Language': 'en-US,en;q=0.5', 
            'Accept-Encoding': 'gzip, deflate'
        }
        else: headers.update({
            'user-agent': ua
        })
        return headers
    # Request dùng chung sesion
    async def async_request_session(self, url, method="GET", type="html", payload=None, proxy=None, headers=None):
        # k cần dùng self.rq_limit vì đã có limit bên trong session
        return await self.handle_rq(self.session, url, method, type, payload, proxy, headers)
       
    # Reqeust dùng session riêng biệt
    async def async_request_all(self, url, method="GET", type="html", payload=None, proxy=None, headers=None):
        async with self.rq_limit:
            async with self.session_init() as session:
                return await self.handle_rq(session, url, method, type, payload, proxy, headers)
            
    # Handle request
    async def handle_rq(self, session, url, method, type, payload, proxy, headers):
        try:
            if self.rate_limit == True:
                await self.rate_limit_.acquire()
            t0 = time.time()
            # Config
            headers = self.set_headers(headers)
            http_proxy = "http://" + proxy if proxy != None else None
            
            # Request
            if method == "GET":
                async with session.get(url, headers=headers, proxy=http_proxy) as response:
                    if type == "JSON": html = await response.json()
                    elif type == "IMAGE": 
                        html = await response.content
                    else: html = await response.text()
            elif method == "POST": 
                if type == "JSON":
                    async with session.post(url, headers=headers, json=payload, proxy=http_proxy) as response:
                        html = await response.json()
                else: 
                    async with session.post(url, headers=headers, data=payload, proxy=http_proxy) as response:
                        html = await response.text()
            elif method == "PUT":
                async with session.put(url, headers=headers, json=payload) as response:
                    if type == "JSON": html = await response.json()
                    else: html = await response.text()
            elif method == "DELETE":
                async with session.delete(url, headers=headers) as response:
                    if type == "JSON": html = await response.json()
                    else: html = await response.text()
            
            status = response.status
            headers = response.headers
            request_info = response.request_info

        except aiohttp.ClientResponseError as ex:
            status = ex.status
            headers = request_info = html = ''
        except aiohttp.ClientConnectionError as ex:
            status = f'ErrConn'
            html = f'ErrConn - ex: {ex}'
            headers = request_info = ''
        except asyncio.TimeoutError:
            status = 'asyncio.TimeoutError'
            html = 'asyncio.TimeoutError'
            headers = request_info = ''
        except:
            status = str(traceback.format_exc())
            headers = request_info = html = ''

        return {
            'url': url,
            'status': status,
            "headers": headers,
            "request_info": request_info,
            "html": html,
            "proxy": proxy,
            "request_time": f"{time.time() - t0:.2f}"
        }

async def cache_img():
    async_r = async_rq(rqs=7, second=1, time_out=90, max_rq_tasks=77, rate_limit=True)

    img_api = random.choice(['b550dbad36598027765514c6f225ea51', 'd15554fd58b117a0508c47f5d533b21d'])

    url = 'https://api.imgbb.com/1/upload?key=' + img_api
    payload = { 
        'image': 'https://i.imgur.com/1QJZ9Zm.jpg',
    }

def format_data(data: List[Dict]) -> Dict[str, Dict[List[datetime], List[int]]]:
    result = {}
    for item in data:
        name = item['name']
        date = item['date']
        quantity = item['quantity']

        if name not in result:
            result[name] = {'date': [], 'quantity': []}

        date_str = date.strftime("%Y-%m-%d")
        insert_index = 0
        for i in range(len(result[name]['date'])):
            if result[name]['date'][i] < date_str:
                insert_index = i + 1
            else:
                break
        result[name]['date'].insert(insert_index, date_str)
        result[name]['quantity'].insert(insert_index, quantity)

    return result

async def check_feilds(db_client, order):
    if order.get('buyer_name', '') == '':
        message = f"Không có tên khách hàng: {order['order_id']}"
    elif order.get('address_1', '') == '':
        message = f"Không có địa chỉ khách hàng: {order['order_id']}"
    elif order.get('city', '') == '':
        message = f"Không có thành phố khách hàng: {order['order_id']}"
    elif order.get('state', '') == '':
        message = f"Không có tỉnh thành khách hàng: {order['order_id']}"
    elif order.get('zip', '') == '':
        message = f"Không có mã bưu điện khách hàng: {order['order_id']}"
    elif order.get('country', '') == '':
        message = f"Không có quốc gia khách hàng: {order['order_id']}"
    elif str(order['order_id']) == '':
        message = f"Không có mã đơn hàng: {order['order_id']}"
    elif order.get('size', '') == '':
        message = f"Không có size sản phẩm: {order['order_id']}"
    elif order.get('product_type', '') == '':
        message = f"Không có type sản phẩm: {order['order_id']}"
    else:
        message = None

    product = await db_client.find_one({'product_type': order['product_type']}, DB['COL_PRODUCTS'])
    if product == None:
        message = f"Sai loại sản phẩm: {order['order_id']}"

    return message

async def format_etsy_order(db_client, order, user, team):    
    now = convert_to_mongodb_time(time.time())
    try:
        if 'i' in order['sku'].split('-')[2].lower():
            seller = order['sku'].split('-')[2].lower()
        else:
            seller = order['seller']
    except:
        seller = order['seller']

    if '.' in str(order['order_id']):
        order['order_id'] = str(order['order_id']).split('.')[0]

    # Tìm trong db xem đã có đơn hàng này chưa
    query = {
        '_original_data.order_id': str(order['order_id']),
    }
    ff_order = await db_client.find_one(query, DB['COL_FULFILLMENTS'], {'_id': 1, '_original_data': 1})

    # Nếu chưa có tạo line item mới
    if ff_order == None:
        fullfillment = {
            "_platform" : "etsy",
            "_team" : team,
            "archive": False,
            "_original_data" : {
                "delivery_info": {
                    "name": order.get('buyer_name', ''),
                    "address1": order.get('address_1', ''),
                    "address2": order.get('address_2', ''),
                    "city":  order.get('city', ''),
                    "state":  order.get('state', ''),
                    "zip": order.get('zip', ''),
                    "country":  order.get('country', ''),
                    "note": order.get('note', '')
                },
                "line_items" : [
                    {
                        "product_id" : f"{order['order_id']}.1",
                        "order_date" : order.get('order_date', ''),
                        "is_archived": False,
                        "fulfillment_order_id":  str(order['order_id']),
                        "line_item_id" :  f"{order['order_id']}.1",
                        "quantity" : order.get('quantity', 1),
                        "thumbnail" : order.get('thumbnail', ''),
                        "base_cost" : 0,
                        "product_type" : order.get('product_type', ''),
                        "fulfillment_status" : "",
                        "factory" : "",
                        "seller" : seller,
                        "size" : order.get('size', ''),
                        "note": order.get('note', ''),
                        "thumbnail" : order.get('thumbnail', ''),
                        "link_des": order.get('link_des', ''),
                        "color" : order.get('color', ''),
                        "material" :  order.get('material', ''),
                        "other_options" : order.get('style', ''),
                        "personalization" : order.get('personalized', ''),
                        'num_color_kit':  int(order.get('num_color_kit', 0)),
                        'num_holder': int(order.get('num_holder', 0)),
                        'sku': order.get('sku', ''),
                        "tracking_number" : "",
                        "tracking_company" : "",
                        "ioss_number" : "",
                        "package_size" : "",
                        "weight" : "",
                        "price" : "",
                        "user_logs" : [f"{user['username']} import item from etsy at {now}"]
                    }
                ],
                "order_id" :  str(order['order_id']),
                "seller_id" : seller,
                "shop_id" : order['shop_name'],
                "status" : ""
            },
            "_update_time" : now,
            "create_at" : order.get('order_date', '')
        }
        message = await check_feilds(db_client, order)
        if message != None:
            return str(order['order_id'])+ ' ' + message       
        else:
            await db_client.insert_one(fullfillment, DB['COL_FULFILLMENTS'])
            return True
    # Nếu có thì update line item
    else:
        ff_order['_update_time'] = now
        len_items = len(ff_order['_original_data']['line_items'])
        product_id = f"{order['order_id']}.{len_items + 1}"
        ff_order['_original_data']['line_items'].append({       
            "product_id" : product_id,
            "is_archived": False,
            "fulfillment_order_id" : str(order['order_id']),
            "line_item_id" : product_id,
            "quantity" : order.get('quantity', 1),
            "thumbnail" : order.get('thumbnail', ''),
            "base_cost" : 0,
            "product_type" : order.get('product_type', ''),
            "fulfillment_status" : "",
            "note": order.get('note', ''),
            "factory" : "",
            "seller" : seller,
            "size" : order.get('size', ''),
            "thumbnail" : order.get('thumbnail', ''),
            "link_des": order.get('link_des', ''),
            "color" : order.get('color', ''),
            "material" :  order.get('material', ''),
            "personalization" : order.get('personalized', ''),
            'num_color_kit':  int(order.get('num_color_kit', 0)),
            'num_holder': int(order.get('num_holder', 0)),
            'sku': order.get('sku', ''),
            "tracking_number" : "",
            "tracking_company" : "",
            "ioss_number" : "",
            "package_size" : "",
            "weight" : "",
            "price" : "",
            "user_logs" : [f"{user['username']} import item from etsy at {now}"]
        })
        message = await check_feilds(db_client, order)
        if message != None:
            return message       
        else:
            await db_client.update_one(ff_order['_id'], ff_order, DB['COL_FULFILLMENTS'])
            return True

async def format_show_orders(orders):
    formatted_json = []    
    for order in orders:
        data = order["_original_data"]
        line_items = data["line_items"]
       
        for item in line_items:
            create_at = convert_to_time(order["create_at"]).strftime("%m/%d/%Y")
            try:
                shipping_day = item["shipping_day"].strftime("%m/%d/%Y")
            except:
                shipping_day = ""
            try:
                dispatch_day = item["dispatch_day"].strftime("%m/%d/%Y")
            except:
                dispatch_day = ""
            try:
                ff_provider_date = item["ff_provider_date"].strftime("%m/%d/%Y")
            except:
                ff_provider_date = ""
                
            if len(line_items) == 1:
                external_id = data["order_id"]
                class_ = 'single'
            else:
                external_id = item["line_item_id"].split('.')[0]
                class_ = 'table-info'
            if len(line_items) == 1:
                single = True
            else:
                single = False

            tracking_number = order["_original_data"]["shipping"]["tracking_number"] if "shipping" in order["_original_data"] else ""
            tracking_company = order["_original_data"]["shipping"]["carrier"] if "shipping" in order["_original_data"] else ""

            formatted_item = {
                "external_id": external_id,
                "delivery_info": data["delivery_info"],
                "team": order["_team"],
                "sales_account_id": order["_original_data"]["shop_id"],
                "seller_id": data["seller_id"],
                "product_id": item["product_id"],
                "thumbnail": item.get("thumbnail", ""),
                "fulfillment_order_id": item["fulfillment_order_id"],
                "line_item_id": item["line_item_id"],
                "single": single,
                "shipping_day": shipping_day,
                "dispatch_day": dispatch_day,
                "quantity": item["quantity"],
                "base_cost": item["base_cost"],
                "fulfillment_status": item["fulfillment_status"],
                "factory": item["factory"],
                "tracking_number": tracking_number,
                "tracking_company": tracking_company,
                "ioss_number": item["ioss_number"],
                "package_size": item["package_size"],
                "link_des": item["link_des"],
                "weight": item["weight"],
                "price": item["price"],
                "sku": item.get("sku", ""),
                "title": item.get("title", ""),
                "size": item.get("size", ""),
                "color": item.get("color", ""),
                "num_color_kit": item.get("num_color_kit", ""),
                "num_holder": item.get("num_holder", ""),               
                "material": item.get("material", ""),
                "other_option": item.get("other_option", ""),
                "personalization": item.get("personalization", ""),
                "product_type": item.get("product_type", ""),
                "base_cost": item.get("base_cost", ""),
                "seller": order["_original_data"]["seller_id"],
                "assign_designer": item.get("assign_designer", ""),
                "create_at": create_at,
                "class": class_,
                "name": data["delivery_info"]["name"],
                "note": item.get("note", "").replace('"',"'"),
                "length": item.get("length", ""),
                "width": item.get("width", ""),
                "height": item.get("height", ""),
                "weight": item.get("weight", ""),
                "design_note": item.get("design_note", ""),
                "shipping_unit": item.get("shipping_unit", ""),
                "provider": item.get("provider", ""),
                "ff_provider_status": item.get("ff_provider_status", ""),
                "ff_provider_date": ff_provider_date,
                "shipping_cost": item.get("ship_cost", 0),
                'note_images': item.get('note_images', []),
                "design_type" : item.get('design_type', ''),
                "design_qty" : item.get('design_qty', ''),
                "design_noted" : item.get('design_noted', ''),
            }
            formatted_json.append(formatted_item)
    return formatted_json

async def get_order_template(db_client, sku, size, cl_material):
    query = {
        "sku": sku,
        "product_size": size,
        "produ": cl_material
    }

async def import_col_order(db_client, order, seller, team, size, now):
    query = {
        '_original_data.external_id': order['order_id']
    }
    order_exist = await db_client.find_one(query, DB['COL_ORDERS'], {'_id': 1, '_original_data': 1})
    try:
        order_size = order['size'].strip().replace('inch', '').replace('in', '').replace(' ', '').replace(',', '.').lower()
    except:
        order_size = order['size']
    query = {
            'size': order_size,
            'sku': order['sku'],
        }

    filter_ = {
        'product_type': 1, 
        'base_cost': 1,
        '_id': 0
    }
    ff_product = await db_client.find_one(query, DB['COL_PRODUCTS'], filter_)
    product_type = ff_product['product_type'] if ff_product != None else ''
    base_cost = float(ff_product['base_cost']) if ff_product != None else 0

    if order['size'] == '':
        size = order['style']
    else:
        size = order['size']

    if order_exist != None:
        product_id = f"{order['order_id']}.{len(order_exist['_original_data']['products']) + 1}"
    else:
        product_id = f"{order['order_id']}"
    product = {
        "id" : product_id,
        "title" : order['title'],
        "quantity" : order['quantity'],
        "sku" : order["sku"],
        "attributes" : [],
        "personalized" : [],
        "purchase_detail" : {
            "supplier_id" : "",
            "store_id" : "",
            "purchase_id" : ""
        },
        "size" : size,
        "color" : order.get('color', ''),
        "material" :  order.get('material', ''),
        "personalized" : [order.get('personalized', '')],
        'num_color_kit':  order.get('num_color_kit', 0),
        'num_holder':order.get('num_holder', 0),
        "product_type" : product_type,
        "base_cost" : base_cost,
        "seller" : seller      
    }

    if order_exist == None:
        products = [product]
    else:
        order_exist['_original_data']['products'].append(product)
        products = order_exist['_original_data']['products']
    order_db = {
        "_platform": "etsy",
        "_team": team,
        "archive": False,
        "_original_data": {
            "external_id": order['order_id'],
            "delivery_info": {
                "name": order.get('buyer_name', ''),
                "phone": order.get('buyer_phone', ''),
                "line": [order.get('address_1', ''), order.get('address_2', '')],
                "city": order.get('city', ''),
                "state": order.get('state', ''),
                "zip": order.get('zip', ''),
                "country": order.get('country', ''),
                "note": order.get('note', ''),
            },
            "sales_account_id": order.get('shop_name', ''),
            "seller_id": order.get('seller', ''),
            "create_at": order.get('order_date', ''),
            "products": products
        },
        "_update_time" : now,
    }
    if order_exist == None:
        await db_client.insert_one(order_db, collection_name=DB['COL_ORDERS'])
    else:
        await db_client.update_one(order_exist['_id'], order_db, DB['COL_ORDERS'])    

async def telegram_bot_sendtext(bot_chatID, bot_message, silent=False):
    bot_message = urllib.parse.quote_plus(f"{telegram_head} \n---------------- \n{bot_message}")
    send_text = 'https://api.telegram.org/bot' + bot_token + '/sendMessage?chat_id=' + bot_chatID + '&text=' + bot_message + "&disable_web_page_preview=True"
    async_rq = async_rq(rqs=7, second=1, time_out=90, max_rq_tasks=77, rate_limit=True)
    if silent == True:
        send_text += "&disable_notification=True"
    response = await async_rq.async_request_all(send_text, "GET", "JSON", None, None, None, None)



async def get_image_size(session, link, dpi=96):
    try:
        link = link.replace('"', '').replace("'", '').replace(' ', '%20')
        async with session.get(link) as response:
            if response.status == 200:
                image_data = await response.read()
                if '.pdf' in link:
                    reader = PdfReader(BytesIO(image_data))
                    box = reader.pages[0].mediabox
                    
                    width = int(box.width)
                    height = int(box.height)
                    dpi = 72
                else:    
                    img = Image.open(BytesIO(image_data))
                    try:
                        dpi = img.info.get("dpi")[0]  # Chỉ lấy DPI theo chiều ngang
                    except:
                        dpi = 96

                    width, height = img.size
                
                # Chuyển đổi pixel sang milimet và inch
                width_mm = round((width / dpi) * 25.4, 2)
                height_mm = round((height / dpi) * 25.4, 2)
                width_inch = round(width / dpi, 2)
                height_inch = round(height / dpi, 2)
                
                return {
                    'link': link,
                    'width': width,
                    'height': height,
                    'width_mm': width_mm,
                    'height_mm': height_mm,
                    'width_inch': width_inch,
                    'height_inch': height_inch
                }
            else:
                return {
                    'link': link,
                    'width': 'NaN',
                    'height': 'NaN',
                    'width_mm': 'NaN',
                    'height_mm': 'NaN',
                    'width_inch': 'NaN',
                    'height_inch': 'NaN'
                }
    except:
        print(f'Error get image size: {link}')
        return {
            'link': link,
            'width': 'NaN',
            'height': 'NaN',
            'width_mm': 'NaN',
            'height_mm': 'NaN',
            'width_inch': 'NaN',
            'height_inch': 'NaN'
        }



async def post_merchize_ff_ngoai(data):
    url = 'https://bo-itlpggl.merchize.com/bo-api/order/external/orders'
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': api_key_merchize,
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers,json=data) as response:
            data = await response.json()
            return data



def find_gearment_variant_id(product_id, size, color):
    with open('./backend/resources/products.json') as json_file:
        data = json.load(json_file)
    product = next(product for product in data['result'] if product['product_id'] == product_id)
    variant = next(variant for variant in product['variants'] if variant['size'] == size and variant['color'] == color)
    return variant['variant_id'] if variant else None

def process_item(item):
    product_id = item['gearment_product_id']
    variant_id = find_gearment_variant_id(product_id, item['size'], item['color'])
    return {
        'variant_id': variant_id,
        'product_name': item['product_name'],
        'product_style': '',
        'product_sku': item['sku'],
        'quantity': item['quantity'],
        'design_link': item['design_link'],
        'design_link_back': item['design_link_back'],
    }

async def post_fulfill_gearment(order):
    line_items = [process_item(item) for item in order['_original_data']['line_items']]
    json_data = {
        'api_key': gearment_api_key,
        'api_signature': gearment_api_signature,
        'order_id': order['_original_data']['order_id'],
        'external_id': order['_original_data']['order_id'],
        'shipping_email': '',
        'shipping_name': order['_original_data']['delivery_info']['name'],
        'shipping_phone': order['_original_data']['delivery_info']['phone'],
        'shipping_company_name': '',
        'shipping_address1': order['_original_data']['delivery_info']['address1'],
        'shipping_address2': order['_original_data']['delivery_info']['address2'],
        'shipping_city': order['_original_data']['delivery_info']['city'],
        'shipping_province_code': order['_original_data']['delivery_info']['state'],
        'shipping_zipcode': order['_original_data']['delivery_info']['zip'],
        'shipping_country_code': order['_original_data']['delivery_info']['country'],
        'shipping_method': 0,
        'line_items': line_items,
    }
    async with aiohttp.ClientSession() as session:
        async with session.post('https://api.gearment.com/v2/?act=order_create',json=json_data) as response:
            data = await response.json()
            return data




async def eidt_image_fulfill(url, x, y, result_width, result_height, flipping):
    # Load the image from the URL
    url = url.replace('"', '').replace("'", '')
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                image_data = await response.read()
                img = Image.open(BytesIO(image_data))
                # If flipping is True, flip the image horizontally
                img = img.resize((int(result_width), int(result_height)), Image.Resampling.LANCZOS)
                if flipping:
                    img = img.transpose(Image.FLIP_LEFT_RIGHT)
                # Crop the image based on the specified coordinates (x, y)
                
                img = img.crop((-x, -y,  result_width-x, result_height-y))
                im_file = BytesIO()
                img.save(im_file, format="PNG", dpi = (300,300))
                im_bytes = im_file.getvalue()  # im_bytes: image in binary format.
                im_b64 = base64.b64encode(im_bytes)
                im_b64 = im_b64.decode('utf-8')
                return im_b64
            else:
                print(f'Error: {response.status} - {await response.text()}')
                return None
async def get_images_size(image_links):
    images = []
    async with aiohttp.ClientSession() as session:
        tasks = [get_image_size(session, link) for link in image_links]
        results = await asyncio.gather(*tasks)
        images.extend(results)
    return images




async def insert_order_db(order, user, db_client,team):
    lower_case_order ={}
    for k, v in order.items():
        if v != None:
            lower_case_order[k.lower().replace(' ','_')] = v
        else: 
            lower_case_order[k.lower().replace(' ','_')] = ''

    # create new order
    # check format date if not correct then convert to correct format
    date_string = str(lower_case_order['order_date']).strip()
    
    # check if date time then convert to mongodb time
    if date_string.isdigit():
        date_string = convert_to_time(int(date_string)).strftime("%Y/%m/%d")
    
    spliters = ['/', '-', '.']
    order_date = ''

    for spliter in spliters:
        if spliter in date_string:
            date_element_list = date_string.split(spliter)
            if len(date_element_list[-1]) == 4:
                date_element_list.reverse()
            order_date = '/'.join(date_element_list)
    try:
        time_now = convert_to_time(order_date)
    except:
        return f"{order['Order id']}: Sai format Order Date: chỉ nhận 2 định dạng YYYY/M/D và D/M/YYYY"
    
    lower_case_order['seller'] = user['username']
    lower_case_order['order_date'] = time_now
    if lower_case_order['num_color_kit'] == '':
        lower_case_order['num_color_kit'] = 0
    if lower_case_order['num_holder'] == '':
        lower_case_order['num_holder'] = 0    
    
    try:
        message = await format_etsy_order(db_client, lower_case_order, user, team)
    except:
        message = f"{order['Order id']}: Lỗi format order"
    return message


async def convert_vnd_to_usd(db_client, vnd):
    query = {
        'currency': 'VND'
    }
    filter_ = {
        'rate': 1,
        '_id': 0
    }
    vnd_rate = await db_client.find_one(query, DB['COL_RATE'], filter_)
    return round(float(vnd) / vnd_rate['rate'], 2)

def format_tracking(trackings):
    output_data = {}
    for entry in trackings:
        order_id = str(entry['Order id'])
        shipping_price = float(entry['Shipping price'])

        if order_id in output_data:
            output_data[order_id]['Shipping price'] += shipping_price
        else:
            output_data[order_id] = {
                'Order id': str(order_id),
                'Tracking number': str(entry['Tracking number']),
                'Carrier': str(entry['Carrier']),
                'Shipping price': shipping_price,
                'Currency': entry['Currency']
            }
    result = list(output_data.values())
    return result

async def insert_tracking(order, user, db_client):
    lower_case_order ={}
    for k, v in order.items():
        if v != None:
            lower_case_order[k.lower().replace(' ','_')] = v
        else: 
            lower_case_order[k.lower().replace(' ','_')] = ''

    if lower_case_order['currency'].lower() == 'vnd':
        shipping_price = await convert_vnd_to_usd(db_client, lower_case_order['shipping_price'])
    else:
        shipping_price = float(lower_case_order['shipping_price'])

    # check if order is exist
    query = {"_original_data.order_id": lower_case_order['order_id']}
    db_order = await db_client.find_one(query, collection_name=DB['COL_FULFILLMENTS'])
    if db_order:
        if 'shipping' not in db_order['_original_data']:
            db_order['_original_data']['shipping'] = {
                'tracking_number': lower_case_order['tracking_number'].replace('"', '').replace("'", ''),
                'carrier': lower_case_order['carrier'],
                'shipping_price': shipping_price,
                'synced': False
            }
            await db_client.update_one(db_order['_id'], db_order, DB['COL_FULFILLMENTS'])
        else:
            shipping_price_db = db_order['_original_data']['shipping']['shipping_price']
            for item in db_order['_original_data']['line_items']:
                if item['fulfillment_order_id'] == lower_case_order['order_id']:
                    note = item.get('reason', '').lower()

                    if 'seller' in note:
                        db_order['_original_data']['shipping']['shipping_price'] = round(shipping_price_db + shipping_price, 2)
                    elif 'xuong' in note:
                        db_order['_original_data']['shipping']['shipping_price_replace'] = shipping_price
                    else:
                        db_order['_original_data']['shipping']['shipping_price'] = round(shipping_price_db + shipping_price, 2)
                    db_order['_original_data']['shipping']['tracking_number'] = lower_case_order['tracking_number'].replace('"', '').replace("'", '')
                    break
            
            await db_client.update_one(db_order['_id'], db_order, DB['COL_FULFILLMENTS'])


async def process_date_range(request):
    try:
        date = request.query_params.get('date')
        date_split = date.split(' - ')
        start_date = date_split[0]
        end_date = date_split[1]
        return [start_date, end_date]
    except:
        return [None, None]

async def retrieve_orders(db_client, query, page_number, limit_, skip_):
    if page_number == 1:
        skip_ = 0
    else:
        skip_ = (page_number - 1) * limit_
    return await db_client.find_many_combo(query, collection_name=DB['COL_FULFILLMENTS'], filter_=None, limit_=limit_, sort_="_id", skip_=skip_)

async def extract_filter_options(formatted_orders):
    teams = list(set(order['team'] for order in formatted_orders))
    shops = list(set(order['sales_account_id'] for order in formatted_orders))
    return teams, shops


def convert_date_range(start_date, end_date):
    start_date = convert_to_mongodb_time(start_date, is_date='start')
    end_date = convert_to_mongodb_time(end_date, is_date='end')
    return start_date, end_date

async def process_filter_params(request):
    user = request.state.user_data
    groups = user['groups']

    filter_team = request.query_params.get('team', [])
    if user['team'] != 'nb_team':
        if filter_team != None and filter_team != 'all' and filter_team != '':
            filter_team = user['team']
    
    
    date = request.query_params.get('date')
    if date != "" and date != None:
        date_split = date.split(' - ')
        start_date = convert_to_mongodb_time(date_split[0], is_date='start')
        end_date = convert_to_mongodb_time(date_split[1], is_date='end')
    else:
        start_date = None
        end_date = None
    shop = request.query_params.get('shop', [])
    product_type = request.query_params.get('type', [])
    status = request.query_params.get('status', [])
    factory = request.query_params.get('factory', [])
    designer = request.query_params.get('designer', [])
    seller = request.query_params.get('seller', [])
    search = request.query_params.get('order_id', None)
    shipping_day = request.query_params.get('shipping_day', None)
    ff_provider_status = request.query_params.get('ff_provider_status', None)
    have_tracking = request.query_params.get('have_tracking', '')
    tracking_synced = request.query_params.get('tracking_synced', '')

    if filter_team != []:
        filter_team = filter_team.split(',')
    if shop != []:
        shop = shop.split(',')
    if product_type != []:
        product_type = product_type.split(',')
    if status != []:
        status = status.split(',')
    if factory != []:
        factory = factory.split(',')
    if designer != []:
        designer = designer.split(',')
    if seller != []:
        seller = seller.split(',')

    if filter_team == ['']:
        filter_team = []
    
    if  factory == ['None']:
        factory = ['', None]
    
    if  status == ['None']:
        status = ['', None]
    
    params = {
        'user': user,
        'groups': groups,
        'start_date': start_date,
        'end_date': end_date,
        'filter_team': filter_team,
        'shop': shop,
        'product_type': product_type,
        'status': status,
        'factory': factory,
        'designer': designer,
        'seller': seller,
        'search': search,
        'shipping_day': shipping_day,
        'ff_provider_status': ff_provider_status,
        'have_tracking': have_tracking,
        'tracking_synced': tracking_synced,
    }
    
    return params

def build_query_filter_orders(params, ff_ngoai=None, is_api=False):   
    if params['filter_team'] in ['xuong_bn', 'xuong_thao', 'xuong_bach'] or params['filter_team'] == 'all':
        query = {
            "_platform": "etsy",
            "_original_data.line_items.is_archived": False,
        }
    else:
        query = {
            "_team": params['filter_team'],
            "_platform": "etsy",
            "_original_data.line_items.is_archived": False,
        }
    # format query
    if params['start_date'] and params['end_date']:
        query['create_at'] = {"$gte": params['start_date'], "$lte": params['end_date']}
    if params['status'] != [] and params['status'] != None and params['status'] != [''] and params['status'] != ['None']:
        query['_original_data.line_items.fulfillment_status'] = {"$in": params['status']}
    if params['factory'] != [] and params['factory'] != None and params['factory'] != [''] and params['factory'] != ['None']:
        query['_original_data.line_items.factory'] = {"$in": params['factory']}
    if params['designer'] != [] and params['designer'] != None and params['designer'] != ['']:
        query['_original_data.line_items.assign_designer.designer'] = {"$in": params['designer']}
    if params['shop'] != [] and params['shop'] != None and params['shop'] != ['']:
        query['_original_data.shop_id'] = {"$in": params['shop']}
    if params['filter_team'] != [] and params['filter_team'] != None and params['filter_team'] != ['']:
        query['_team'] = {"$in": params['filter_team']}
    if params['product_type'] != [] and params['product_type'] != None and params['product_type'] != ['']:
        query['_original_data.line_items.product_type'] = {"$in": params['product_type']}
    if params['seller'] != [] and params['seller'] != None and params['seller'] != ['']:
        query['_original_data.seller_id'] = {"$in": params['seller']}
    if params['search'] != '' and params['search'] != None:
        query['_original_data.line_items.fulfillment_order_id'] = {"$regex": params['search']}
    if params['shipping_day'] != '' and params['shipping_day'] != None:
        start_shipping_day, end_shipping_day = convert_date_range(params['shipping_day'], params['shipping_day'])
        query['_original_data.line_items.shipping_day'] = {"$gte": start_shipping_day, "$lte": end_shipping_day}  
    if 'ff_provider_status' in params and params['ff_provider_status'] not in [[], None, [''], '']:
        if params['ff_provider_status'] == ['']:
            query['_original_data.line_items.ff_provider_status'] = {"$exists": False}
        else:
            query['_original_data.line_items.ff_provider_status'] = 'Fulfilled'
    if 'tracking_synced' in params:
        if params['tracking_synced'] != '':
            query['_original_data.shipping'] = {"$exists": True}
            if params['tracking_synced'] == 'False':
                query['_original_data.shipping.synced'] = False
            else:
                query['_original_data.shipping.synced'] = True
    if 'have_tracking' in params:
        if params['have_tracking'] != '':
            if params['have_tracking'] == 'False':
                query['_original_data.shipping.tracking_number'] = {"$exists": False}
            else:
                query['_original_data.shipping'] = {"$exists": True}
                query['_original_data.shipping.tracking_number'] = {"$exists": True}

 
    if params['filter_team'] == 'xuong_bn': 
        query['_original_data.line_items.factory'] = {"$in": ['Thủy']}
    if params['filter_team'] == 'xuong_thao':
        query['_original_data.line_items.factory'] = {"$in": ['Thảo']}
    if params['filter_team'] == 'xuong_bach':
        query['_original_data.line_items.factory'] = {"$in": ['Bách']}
    
    query['_original_data.line_items.is_archived'] = False
    
    fulfillment_status_query = "_original_data.line_items.fulfillment_status"
    if ff_ngoai == None and params['status'] != ['FF Ngoai']:
        # if have fulfillment status in query then update query to get order not ff ngoai
        if fulfillment_status_query in query:
            query[fulfillment_status_query].update({"$ne": 'FF Ngoai'})
        else:
            query[fulfillment_status_query] = {"$ne": 'FF Ngoai'}
    else:
        query[fulfillment_status_query] = 'FF Ngoai'

    # Remove team filter for admin, dev, mod, factory, designer
    if (params['filter_team'] == ['all'] or params['filter_team'] == ['xuong_bn'] or params['filter_team'] == ['xuong_thao'] or params['filter_team'] == ['xuong_bach']) and any(group in ['admin', 'dev', 'mod', 'factory', 'leader designer', 'designer', 'fulfillment'] for group in params['groups']):
        query.pop('_team', None)
    elif params['filter_team'] == ['all'] and any(group in ['admin', 'dev', 'mod', 'factory', 'leader designer', 'designer', 'fulfillment'] for group in params['groups']) == False:
        query['_team'] = params['user']['team']
    

    if '_team' in query and query['_team'] == []:
        query.pop('_team', None)

    # Xuong BN 
    if 'factory' in params['groups'] and 'xuong_bn' in params['user']['team']:
        query['_original_data.line_items.factory'] = {"$in": ['Thủy']}
    # Xuong Thao
    if 'factory' in params['groups'] and 'xuong_thao' in params['user']['team']:
        query['_original_data.line_items.factory'] = {"$in": ['Thảo']}
    # Xuong Bach
    if 'factory' in params['groups'] and 'xuong_bach' in params['user']['team']:
        query['_original_data.line_items.factory'] = {"$in": ['Bách']}
    
    return query

async def list_print_provider():
    url = 'https://api.printify.com/v1/catalog/print_providers.json'
    headers = {'Authorization': 'Bearer ' + token_printify}
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                return data
            
def format_analytics_data(orders):
    # Tạo từ điển để lưu thông tin cho mỗi ngày và product_type
    date_data = defaultdict(lambda: {'orders': 0, 'items': 0})
    product_type_data = defaultdict(int)

    # Lặp qua danh sách các đơn hàng
    for order in orders:
        # Trích xuất ngày từ trường 'create_at' của đơn hàng
        order_date = order['create_at'].date()

        # Định dạng lại ngày thành 'd/m/y'
        formatted_date = order_date.strftime('%Y/%m/%d')

        # Tăng số lượng đơn hàng và số lượng items tương ứng cho ngày đó
        date_data[formatted_date]['orders'] += 1
        date_data[formatted_date]['items'] += len(order['_original_data']['line_items'])

        # Trích xuất product_type từ đơn hàng
        product_type = order['_original_data']['line_items'][0]['product_type']
        product_type_data[product_type] += 1

    # Chuyển dữ liệu vào danh sách để trả về
    result = []
    for date, data in date_data.items():
        result.append({
            'date': date,
            'orders': data['orders'],
            'items': data['items'],
        })
    sorted_result = sorted(result, key=lambda x: x['date'])
    
    dates = [entry['date'] for entry in sorted_result]
    order_counts = [entry['orders'] for entry in sorted_result]
    item_counts = [entry['items'] for entry in sorted_result]

    # Tạo danh sách product_type và danh sách tổng số
    product_types = list(product_type_data.keys())
    total_counts = [product_type_data[ptype] for ptype in product_types]

    # # Sắp xếp product_type theo thứ tự alphabet
    # product_types.sort()

    # Thay thế các giá trị rỗng hoặc khoảng trắng bằng 'None'
    for i, product_type in enumerate(product_types):
        if product_type.strip() == '':
            product_types[i] = 'Unknown'

    # Tạo danh sách kết quả
    result_list = [product_types, total_counts]

    data = {
        'date': dates,
        'orders': order_counts,
        'order_items': item_counts,
        'product_type': result_list
    }
    return data

def format_analytics_designer(orders, start_date, end_date):
    # Sử dụng defaultdict để tạo một cấu trúc dữ liệu phức tạp
    result = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    # Lặp qua danh sách đơn hàng
    for order in orders:
        line_items = order["_original_data"]["line_items"]      
        for line_item in line_items:
            if 'assign_designer' in line_item and 'updated_at' in line_item['assign_designer'] and line_item['assign_designer']['updated_at'] != '' and line_item['assign_designer']['updated_at'] >= start_date and line_item['assign_designer']['updated_at'] <= end_date:
                updated_at = line_item["assign_designer"]["updated_at"].strftime("%Y/%m/%d")
                designer = line_item["assign_designer"]["designer"]
                product_type = line_item["product_type"]
                
                # Đếm số lượng đơn hàng cho từng designer, product_type và ngày
                result[updated_at][designer][product_type] += 1

    # Chuyển dữ liệu vào danh sách bản ghi
    records = []
    for date, designers in result.items():
        for designer, product_types in designers.items():
            record = {
                "Ngày": date,
                "Designer": designer,
                "Số lượng": sum(product_types.values()),
                "Product Types": ", ".join([f"{key}:{value}" for key, value in sorted(product_types.items(), key=lambda x: x[1], reverse=True)])
            }
            records.append(record)
        records.append({
            "Ngày": date,
            "Designer": "Tổng",
            "Số lượng": sum([sum(product_types.values()) for product_types in designers.values()]),
            "Product Types": ""
        })
    
    # reverse records by date
    records.reverse()

    return records

def format_analytics_design_checked(orders, start_date, end_date):
    # Sử dụng defaultdict để tạo một cấu trúc dữ liệu phức tạp
    result = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))

    # Lặp qua danh sách đơn hàng
    for order in orders:
        line_items = order["_original_data"]["line_items"]      
        for line_item in line_items:
            if 'assign_designer' in line_item and 'finished_at' in line_item['assign_designer'] and line_item['assign_designer']['finished_at'] != '' and line_item['assign_designer']['finished_at'] >= start_date and line_item['assign_designer']['finished_at'] <= end_date:
                
                finished_at = line_item["assign_designer"]["finished_at"].strftime("%Y/%m/%d")
                seller = line_item['seller']
                product_type = line_item["product_type"]
                
                # Đếm số lượng đơn hàng cho từng designer, product_type và ngày
                result[finished_at][seller][product_type] += 1
    # Chuyển dữ liệu vào danh sách bản ghi
    records = []
    for date, sellers in result.items():
        for seller, product_types in sellers.items():
            record = {
                "Ngày": date,
                "Seller": seller,
                "Số lượng": sum(product_types.values()),
                "Product Types": ", ".join([f"{key}:{value}" for key, value in product_types.items()])
            }
            records.append(record)

    return records

async def get_count_sales(db_client, orders):
    shop = await db_client.find_many_combo({}, collection_name=DB['COL_SHOP'], filter_={'_id': 0, 'team': 1, 'shop': 1, 'seller_name': 1})

    team_tung = [item['shop'].lower() for item in shop if item['team'] == 'Tùng']
    team_vi = [item['shop'].lower() for item in shop if item['team'] == 'Vi']
    team_thuan = [item['shop'].lower() for item in shop if item['team'] == 'Thuận']
    team_trung = [item['shop'].lower() for item in shop if item['team'] == 'Trung']

    # count sales for each team
    count_sales = {
        'tung': 0,
        'vi': 0,
        'thuan': 0,
        'trung': 0
    }

    count_items = {
        'tung': 0,
        'vi': 0,
        'thuan': 0,
        'trung': 0
    }

    # Create a dictionary to store sales for each shop
    shop_sales = {}

    # Create a dictionary to store sales for each seller
    seller_sales = {}

    for order in orders:

        shop_id = order.get('_original_data',{'shop_id':''}).get('shop_id','')
        if type(shop_id) == int:
            shop_id = str(shop_id)
        shop_id = shop_id.lower()    

        # Find the seller_name for the shop
        shop_info = next((item for item in shop if item['shop'].lower() == shop_id), None)
        if shop_info:
            seller_name = shop_info.get('seller_name', None)
        else:
            seller_name = None

        if shop_id in team_tung:
            team = 'tung'
        elif shop_id in team_vi:
            team = 'vi'
        elif shop_id in team_thuan:
            team = 'thuan'
        elif shop_id in team_trung:
            team = 'trung'
        else:
            team = None

        if team:
            count_sales[team] += 1
            for order_item in order['_original_data']['line_items']:
                if 're' not in order_item['fulfillment_order_id'].lower():
                    count_items[team] += 1

            # Increment the sales for the specific shop
        if order['_original_data']['shop_id'] in shop_sales:
            shop_sales[order['_original_data']['shop_id']] += 1
        else:
            shop_sales[order['_original_data']['shop_id']] = 1

        # Increment the sales for the specific seller
        if seller_name:
            if seller_name in seller_sales:
                seller_sales[seller_name] += 1
            else:
                seller_sales[seller_name] = 1

    return count_sales, count_items, shop_sales, seller_sales
   

# get print provider printify
async def get_print_provider(id):
    url = 'https://api.printify.com/v1/catalog/print_providers/' + str(id) + '.json'
    headers = {'Authorization': 'Bearer ' + token_printify}
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                return data

async def get_variants(blueprint_id,print_provider_id):
    url = f'https://api.printify.com//v1/catalog/blueprints/{blueprint_id}/print_providers/{print_provider_id}/variants.json'
    headers = {'Authorization': 'Bearer ' + token_printify}
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                return data      

async def create_product_with_order(label,address,items,shipping_method,shop_id='7665997'):
    url = f"https://api.printify.com/v1/shops/{shop_id}/orders.json"
    payload = {
        "label": label,
        "line_items": items,
        "shipping_method": shipping_method,
        "send_shipping_notification": False,
        "address_to": address
    }
    headers = {'Authorization': 'Bearer ' + token_printify}
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers,json=payload) as response:
            data = await response.json()
            return data
           

async def update_order_ff_ngoai(order,platform_ff):
    for line_item in order['_original_data']['line_items']:
        line_item['fulfillment_status'] = 'FF Ngoai'
        line_item['platform_ff'] = platform_ff
    return order

async def send_order_to_production(order_id,shop_id='5256163'):
    url = f'https://api.printify.com/v1/shops/{shop_id}/orders/{order_id}/send_to_production.json'
    
    headers = {'Authorization': 'Bearer ' + token_printify}
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                return data

def get_pack_in_item(other_option):
    pack = 1
    if 'pack' in other_option and 'digital' not in other_option:
        for number in range(1, 21):
            pack_str = f'pack {number}'
            str_pack = f'{number} pack'
            if pack_str in other_option or str_pack in other_option and(f'pack {number}0' not in other_option and f'{number}0 pack'  not in other_option):
                pack = number
                break   
    elif 'digital' in other_option:
        pack = 0
    else:
        pack = 1
    return pack