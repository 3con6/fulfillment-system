from starlette.requests import Request
import urllib.parse
import time
import arrow
import traceback
import asyncio
import re
import aiohttp
from user_agent import generate_user_agent, generate_navigator  # https://github.com/lorien/user_agent  pip install -U user_agent
from aiolimiter import AsyncLimiter
import os
import logging
from logging.handlers import RotatingFileHandler

# Log ----------------
def b_log(log_name, stream = True):
    def tz_converter(*args):
        return arrow.utcnow().to('+07:00').timetuple()
        return datetime.now(tz).timetuple()
        
    os.makedirs('./logs/') if not os.path.exists('./logs/') else True
    logger = logging.getLogger(log_name)
    if (logger.hasHandlers()):
        # Handle duplicate log
        logger.handlers.clear()
    logging.Formatter.converter = tz_converter

    hnd_all = RotatingFileHandler('./logs/' + log_name + ".log", maxBytes=10000000, backupCount=5, encoding='utf-8')
    # hnd_all.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s ''[in %(pathname)s:%(lineno)d]'))
    hnd_all.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s ''[in %(filename)s:%(lineno)d]', datefmt='%Y%m%d %H:%M:%S'))
    hnd_all.setLevel(logging.INFO)
    logger.addHandler(hnd_all)

    if stream == True:
        hnd_stream = logging.StreamHandler()
        # hnd_stream.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s ''[in %(pathname)s:%(lineno)d]'))
        # hnd_stream.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s ''[in %(filename)s:%(lineno)d]', datefmt='%Y%m%d %H:%M:%S'))
        hnd_stream.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s ''[in %(filename)s:%(lineno)d]', datefmt='%H:%M:%S'))
        hnd_stream.setLevel(logging.INFO)
        logger.addHandler(hnd_stream)

    logger.setLevel(logging.DEBUG)

    return logger




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



#
# Common functions
#
def flat_list(l):
    return [item for sublist in l for item in sublist]
def encode_url(url):
    return urllib.parse.quote_plus(url)
def decode_url(url):
    return urllib.parse.unquote(url)
def make_slug(name):
    remove_special = re.sub('[^A-Za-z0-9. _-]+', '', name).replace(" ", "-").replace(".", "-").replace("_", "-").lower().strip()
    return remove_special

#
# Jinja
#
class CustomURLProcessor:
    def __init__(self):  
        self.path = "" 
        self.request = None

    def url_for(self, request: Request, name: str, **params: str):
        self.path = request.url_for(name, **params)
        self.request = request
        return self
    
    def include_query_params(self, **params: str):
        parsed = list(urllib.parse.urlparse(self.path))
        parsed[4] = urllib.parse.urlencode(params)
        return urllib.parse.urlunparse(parsed)
