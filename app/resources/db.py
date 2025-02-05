from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import BulkWriteError
from pymongo import MongoClient, UpdateOne
from bson import ObjectId
import arrow
import time
import traceback
import pytz
from .resources import b_log


class MongoAsyncPipeline:
    def __init__(self, MONGO_URI, MONGODB_DB, MONGODB_COLLECTION=None, auto_update_time=False):
        self.client = AsyncIOMotorClient(MONGO_URI, retryWrites=False)
        self.db = self.client[MONGODB_DB]
        self.logger = b_log('b_db')
        self.auto_update_time = auto_update_time
        self.collection = MONGODB_COLLECTION
        
    def select_db(self, db_name): # change database
        self.db = self.client[db_name]
        
    async def check_connect(self):
        try:
            await self.client.server_info()
            self.logger.info(f'Db connected')
        except Exception as e:
            self.logger.exception("connect error")
            
    async def create_index(self, index_data, index_name, collection_name=None, unique=False, background=True):
        # index_data = [("product_data.id", 1), ("product_data.id", 1)]
        # index_name = "_original_data.created_at"
        if collection_name == None: collection_name = self.collection
        collection_client = self.db[collection_name]
        await collection_client.create_index(index_data, unique=unique, background=background, name=index_name)

    async def get_all_collections(self):
        # await db.list_collection_names(filter=filter)
        list_collections = await self.db.list_collection_names()
        return list_collections

    # Auto update time
    def convert_to_mongodb_time(self, time_):
        utc = arrow.get(time_).datetime.replace(tzinfo=None)
        return utc
    
    def _auto_update_time(self, documents):
        if self.auto_update_time == True:
            time_ = self.convert_to_mongodb_time(time.time())
            if type(documents) == list:
                new_documents = [document.update({"_update_time": time_}) for document in documents]
                return new_documents
            else:
                documents.update({"_update_time": time_})
                return documents
        else:
            return documents
            
            
    # Insert
    async def insert_one(self, document, collection_name=None):
        if collection_name == None: collection_name = self.collection
        collection_client = self.db[collection_name]
        document = self._auto_update_time(document)
        try:
            result = await collection_client.insert_one(document)
            self.logger.debug(msg=f'inserted data: {result.inserted_id}')
            return result.inserted_id
        except BulkWriteError as e:
            dup_keys = len([x for x in e.details['writeErrors'] if 'E11000 duplicate key error collection' in x['errmsg']])
            return 'Dupkey'
        except Exception as e:
            if 'E11000 duplicate key error collection' in str(e):
                return 'Dupkey'
            else:
                self.logger.exception(f"insert error - document: {document}")
                return f"error - {str(traceback.format_exc())}"
    async def insert_many(self, documents, collection_name=None):
        if collection_name == None: collection_name = self.collection
        collection_client = self.db[collection_name]
        try:
            result = await collection_client.insert_many(documents, ordered=False)
            return "ok", len(result.inserted_ids)
        except BulkWriteError as e:
            dup_keys = len([x for x in e.details['writeErrors'] if 'duplicate key error' in x['errmsg']])
            return 'Dupkey', dup_keys
        except Exception as e:
            if 'E11000 duplicate key error collection' in str(e):
                return 'Dupkey', e
            else:
                return "error", str(traceback.format_exc())
    
    
    # Find
    async def count_(self, query, collection_name=None):
        if collection_name == None: collection_name = self.collection
        collection_client = self.db[collection_name]
        return await collection_client.count_documents(query)
    async def find_one(self, query, collection_name=None, filter_=None):
        if collection_name == None: collection_name = self.collection
        collection_client = self.db[collection_name]
        return await collection_client.find_one(query, filter_)
    async def find_one_sort_lasted(self, query, collection_name=None, filter_=None):
        if collection_name == None: collection_name = self.collection
        collection_client = self.db[collection_name]
        return await collection_client.find_one(query, filter_, sort=[('_id', -1)])
    # find_in_list 
    # query = {find_item: {"$in": find_list}}
    async def find_many(self, query, collection_name=None, filter_=None, limit_=0):
        if collection_name == None: collection_name = self.collection
        collection_client = self.db[collection_name]
        all_ = []
        db = collection_client.find(query, filter_).limit(limit_)
        async for document in db:
            all_.append(document)
        return all_
    async def find_many_sort_(self, query, collection_name=None, filter_=None, limit_=0, sort_="_id"):
        if collection_name == None: collection_name = self.collection
        collection_client = self.db[collection_name]
        all_ = []
        db = collection_client.find(query, filter_).limit(limit_).sort(sort_, -1)
        async for document in db:
            all_.append(document)
        return all_
    async def find_many_combo(self, query, collection_name=None, filter_=None, limit_=0, sort_="_id", skip_=0):
        if collection_name == None: collection_name = self.collection
        collection_client = self.db[collection_name]
        all_ = []
        db = collection_client.find(query, filter_).skip(skip_).limit(limit_).sort(sort_, -1)
        async for document in db:
            all_.append(document)
        return all_
    async def find_many_combo_sort_lasted(self, query, collection_name=None, filter_=None, limit_=0, sort_="_id", skip_=0):
        if collection_name == None: collection_name = self.collection
        collection_client = self.db[collection_name]
        all_ = []
        db = collection_client.find(query, filter_).skip(skip_).limit(limit_).sort(sort_, 1)
        async for document in db:
            all_.append(document)
        return all_
    async def find_text_search(self, query, collection_name=None, filter_=None, limit_=0):
        if collection_name == None: collection_name = self.collection
        collection_client = self.db[collection_name]
        sort_clause = {'score': {'$meta': 'textScore'}}
        # results = await collection_client.find(query).sort(sort_clause).to_list(length=None)
        results = await collection_client.find(query, filter_).limit(limit_).to_list(length=None)
        return results
    
    # Delete
    async def delete(self, query, collection_name=None):
        if collection_name == None: collection_name = self.collection
        collection_client = self.db[collection_name]
        result = await collection_client.delete_many(query)
        return result.deleted_count    
    

    # Update
    async def update_one(self, _id, update_, collection_name=None):
        if collection_name == None: collection_name = self.collection
        update_ = self._auto_update_time(update_)
        if '_id' in update_:
            del update_['_id']
        collection_client = self.db[collection_name]
        update_ = await collection_client.update_one({'_id': ObjectId(_id)}, {'$set': update_}, upsert=True)
        return update_.modified_count
    async def update_remove_one(self, _id, update_, collection_name=None):
        if collection_name == None: collection_name = self.collection
        update_ = self._auto_update_time(update_)
        collection_client = self.db[collection_name]
        update_ = await collection_client.update_one({'_id': ObjectId(_id)}, {'$unset': update_}, upsert=True)
        return update_.modified_count
    async def do_bulk_write_update_many(self, collection_name, documents_):
        # documents_ = [{'_id': '63a4c070de3272998701d3d9', 'update': {'data': 'dict data to update'}}]
        # auto make ObjectId
        # documents_ = [
        #     {'_id': ObjectId(record['_id'])}, {'$set': record['update']})
        #     for record in documents_ if type(record['_id']) != ObjectId
        # ]
        # documents_ = self._auto_update_time(documents_)
        collection_client = self.db[collection_name]
        requests = [
            UpdateOne({'_id': record['_id']}, {'$set': record['update']})
            for record in documents_
        ]
        try:
            result = await collection_client.bulk_write(requests, ordered=False)
            return "ok", result.bulk_api_result
        except BulkWriteError as bwe:
            self.logger.exception(f"error: {bwe.details}")
    async def query_aggregate(self, query, collection_name):
        collection_client = self.db[collection_name]
        return await collection_client.aggregate(query).to_list(length=None)


def convert_to_mongodb_time(time_, is_date=None):
    timezone = pytz.timezone('America/New_York')
    local_time = arrow.get(time_).to(timezone)
    if is_date == 'start':
        local_time_yesterday = local_time.shift(days=+1)
        local_time = local_time_yesterday.floor('day')
    elif is_date == 'end':
        local_time_yesterday = local_time.shift(days=+1)
        local_time = local_time_yesterday.ceil('day').replace(hour=23, minute=59, second=59)
    
    return local_time.datetime.replace(tzinfo=None)

def convert_to_time(time_, is_date=None):
    timezone = pytz.timezone('Asia/Ho_Chi_Minh')
    local_time = arrow.get(time_).to(timezone)
    if is_date == 'start':
        local_time_yesterday = local_time.shift(days=+1)
        local_time = local_time_yesterday.floor('day')
    elif is_date == 'end':
        local_time_yesterday = local_time.shift(days=+1)
        local_time = local_time_yesterday.ceil('day').replace(hour=23, minute=59, second=59)
    
    return local_time.datetime.replace(tzinfo=None)

def convert_date_range(start_date, end_date):
    start_date = convert_to_mongodb_time(start_date, is_date='start')
    end_date = convert_to_mongodb_time(end_date, is_date='end')
    return start_date, end_date


# Old example
def db_find_random(db_connect, db_user, db_pass, db_name, db_collection, size):
    t = time.time()
    with MongoClient('mongodb://' + db_connect) as client:
        client.admin.authenticate(db_user, db_pass, mechanism='SCRAM-SHA-1')
        c_db = client[db_name]
        c_collection = c_db[db_collection]
        contents = c_collection.aggregate([{"$sample": {"size": size}}])
        return contents, time.time() - t
def db_find_random_with_filter(db_connect, db_user, db_pass, db_name, db_collection, filter, size):
    t = time.time()
    with MongoClient('mongodb://' + db_connect) as client:
        client.admin.authenticate(db_user, db_pass, mechanism='SCRAM-SHA-1')
        c_db = client[db_name]
        c_collection = c_db[db_collection]
        contents = c_collection.aggregate([{"$match": filter}, {"$sample": {"size": size}}])
        return contents, time.time() - t
