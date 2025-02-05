from pydantic import BaseModel, validator, root_validator
from bson.objectid import ObjectId
from datetime import date, datetime, time, timedelta
from ..settings import DB, list_status
from bson import ObjectId

class UserLog:
    def __init__(self, db_client, collection_name, _id, username):
        self.db_client = db_client
        self.collection_name = collection_name
        self._id = _id
        self.username = username
        self.logs = []
        
    def add_log(self, log):
        timestamp = datetime.now()
        log_str = f"{self.username} - {timestamp.strftime('%Y-%m-%d %H:%M:%S.%f')} - {log}"
        self.logs.append(log_str)
        
    async def save_to_db(self):
        logs_collection = self.db_client
        log_document = {'_id': ObjectId(), 'product_id': self._id, 'username': self.username, 'logs': self.logs}
        result = await logs_collection.insert_one(self.collection_name, log_document)
        return result

        
class Products(BaseModel):
    name: str
    sku: str
    img: str
    description: str
    base_cost: float | str | None
    thuy_cost: float | str | None
    us_shipping_1st: float | str | None
    us_shipping_additional: float | str | None
    ww_shipping_1st: float | str | None
    ww_shipping_additional: float | str | None
    quantity: int
    xuong: str
    product_template_width: str
    product_template_height: str
    box_size: str
    product_size: str
    product_type: str
    created_at: datetime
    updated_at: datetime
    user_logs: list[str] | None

    class Config:
        json_encoders = {ObjectId: str}

    @validator('img')
    def img_fix(cls, v):
        v = v.replace("-jpg", ".jpg")
        v = v.replace("-webp", ".webp")
        v = v.replace("-png", ".png")
        return v
    
    @validator('quantity')
    def price_fix(cls, v):
        if v == "None" or v == None:
            v = 0
        return v
    
class Design(BaseModel):
    name: str
    description: str
    price: str
    user_logs: list[str] | None

    class Config:
        json_encoders = {ObjectId: str}

    
    @validator('price')
    def price_fix(cls, v):
        if v == "None" or v == None:
            v = 0
        return v


class DataDate(BaseModel):
    date: datetime
    quantity: int  
    
class Warehouse(BaseModel):
    category: str
    name: str
    sku: str
    img: str
    quantity: int
    material: str
    color: str
    min: int
    data_date: list[DataDate]
    description: str
    updated_at: datetime
    user_logs: list[str] | None

    class Config:
        json_encoders = {ObjectId: str}

    @validator('img')
    def img_fix(cls, v):
        v = v.replace("-jpg", ".jpg")
        v = v.replace("-webp", ".webp")
        v = v.replace("-png", ".png")
        return v

class Teams(BaseModel):
    name: str
    users: list[str]
    balance: float