import os
import base64
from google.cloud import storage
from datetime import timedelta, datetime
import traceback


def get_product_images_public_links(bucket_name, seller, shop, date, order_id, product_id, image_filenames):
    links = []

    for filename in image_filenames:
        # Tạo đường dẫn đến từng ảnh trong thư mục
        image_path = f'{seller}/{shop}/{date}/{order_id}/{product_id}/{filename}'
        
        # Tạo và trả về Signed URL cho ảnh
        link = f"https://storage.googleapis.com/{bucket_name}/{image_path}"
        links.append(link)
    
    return links

def get_product_images_public_reuse_links(bucket_name, sku, image_filenames):
    links = []

    for filename in image_filenames:
        # Tạo đường dẫn đến từng ảnh trong thư mục
        image_path = f'reuse_design/{sku}/{filename}'
        
        # Tạo và trả về Signed URL cho ảnh
        link = f"https://storage.googleapis.com/{bucket_name}/{image_path}"
        links.append(link)
    
    return links


def create_directory_if_not_exists(directory_path):
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

def get_blob_path(seller, shop, date, order_id, product_id, filename):
    return f'{seller}/{shop}/{date}/{order_id}/{product_id}/{filename}'

def remove_files_in_product_folder(storage_client, bucket_name, seller, shop, date, order_id, product_id):
    try:
        prefix = f'{seller}/{shop}/{date}/{order_id}/{product_id}/'
        blobs = storage_client.list_blobs(bucket_name, prefix=prefix)
        for blob in blobs:
            blob.delete()
    except:
        print(f"can not delete file: {prefix}")
def remove_files_in_product_folder_reuse(storage_client, bucket_name, seller, shop, date, order_id, product_id):
    try:
        prefix = f'{seller}/{shop}/{date}/{order_id}/{product_id}/'
        blobs = storage_client.list_blobs(bucket_name, prefix=prefix)
        for blob in blobs:
            blob.delete()
    except:
        print(f"can not delete file: {prefix}")





def upload_to_bucket(seller, shop, date, order_id, product_id, files):
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './backend/resources/ServiceKey_GoogleCloud.json'

    storage_client = storage.Client()

    bucket_name = 'nambe-fulfillments'

    '''
    Upload image with base64 content to a bucket
    : seller (str) - Name of the seller
    : shop (str) - Name of the shop
    : date (str) - Date in the format YYYY-MM-DD
    : order_id (str) - Order ID
    : product_id (str) - Product ID
    : files (list) - List of dictionaries containing 'filename' and 'content_base64'
    : bucket_name (str)
    '''

    # change format of date and format dd/mm/yyyy to yyyy-mm-dd
    date = date.split('/')
    date = date[2] + '-' + date[1] + '-' + date[0]

    # Remove existing files in the product_id folder
    remove_files_in_product_folder(storage_client, bucket_name, seller, shop, date, order_id, product_id)

    for file in files:
        filename = file['filename']
        content_base64 = file['content_base64']
        blob_path = get_blob_path(seller, shop, date, order_id, product_id, filename)
        blob = storage_client.bucket(bucket_name).blob(blob_path)
        
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
            content_type = 'image/png'
        elif filename.lower().endswith(('.pdf')):
            content_type = 'application/pdf'
        else:
            content_type = 'application/octet-stream'
        
        blob.upload_from_string(base64.b64decode(content_base64), content_type=content_type)
        print(f'File {filename} - content_type: {content_type} - uploaded to {blob_path}')
    
    # Tạo và trả về Signed URL cho thư mục
    path = get_product_images_public_links(bucket_name, seller, shop, date, order_id, product_id, [file['filename'] for file in files])
    return path


def upload_to_bucket_reuse(sku, files):
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './backend/resources/ServiceKey_GoogleCloud.json'

    storage_client = storage.Client()

    bucket_name = 'nambe-fulfillments'

    '''
    Upload image with base64 content to a bucket
    : seller (str) - Name of the seller
    : shop (str) - Name of the shop
    : date (str) - Date in the format YYYY-MM-DD
    : order_id (str) - Order ID
    : product_id (str) - Product ID
    : files (list) - List of dictionaries containing 'filename' and 'content_base64'
    : bucket_name (str)
    '''

    for file in files:
        filename = file['filename']
        content_base64 = file['content_base64']
        blob_path = f'reuse_design/{sku}/{filename}'
        blob = storage_client.bucket(bucket_name).blob(blob_path)
        
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
            content_type = 'image/png'
        elif filename.lower().endswith(('.pdf')):
            content_type = 'application/pdf'
        else:
            content_type = 'application/octet-stream'
        
        blob.upload_from_string(base64.b64decode(content_base64), content_type=content_type)
        print(f'File {filename} - content_type: {content_type} - uploaded to {blob_path}')
    
    # Tạo và trả về Signed URL cho thư mục
    path = get_product_images_public_reuse_links(bucket_name, sku, [file['filename'] for file in files])
    return path


# =====================================================================================

def upload_to_bucket_no_delete(seller, shop, date, order_id, product_id, files):
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './backend/resources/ServiceKey_GoogleCloud.json'

    storage_client = storage.Client()

    bucket_name = 'nambe-fulfillments'

    '''
    Upload image with base64 content to a bucket
    : seller (str) - Name of the seller
    : shop (str) - Name of the shop
    : date (str) - Date in the format YYYY-MM-DD
    : order_id (str) - Order ID
    : product_id (str) - Product ID
    : files (list) - List of dictionaries containing 'filename' and 'content_base64'
    : bucket_name (str)
    '''

    # change format of date and format dd/mm/yyyy to yyyy-mm-dd
    date = date.split('/')
    date = date[2] + '-' + date[1] + '-' + date[0]

    for file in files:
        filename = file['filename']
        content_base64 = file['content_base64']
        blob_path = get_blob_path(seller, shop, date, order_id, product_id, filename)
        blob = storage_client.bucket(bucket_name).blob(blob_path)
        
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
            content_type = 'image/png'
        elif filename.lower().endswith(('.pdf')):
            content_type = 'application/pdf'
        else:
            content_type = 'application/octet-stream'
        blob.upload_from_string(base64.b64decode(content_base64), content_type=content_type)
        print(f'File {filename} - content_type: {content_type} - uploaded to {blob_path}')
    
    # Tạo và trả về Signed URL cho thư mục
    path = get_product_images_public_links(bucket_name, seller, shop, date, order_id, product_id, [file['filename'] for file in files])
    return path

def get_blob_path_pdf_gen(seller, date, filename):
    return f'{seller}/{date}/{filename}'

def get_gen_images_public_links(bucket_name, seller, date, image_filenames):
    links = []
    for filename in image_filenames:
        # Tạo đường dẫn đến từng ảnh trong thư mục
        image_path = f'{seller}/{date}/{filename}'
        
        # Tạo và trả về Signed URL cho ảnh
        link = f"https://storage.googleapis.com/{bucket_name}/{image_path}"
        links.append(link)
    
    return links



def upload_to_bucket_pdf_layer_gen(seller, date, files):
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './backend/resources/ServiceKey_GoogleCloud.json'

    storage_client = storage.Client()

    bucket_name = 'nambe-fulfillments'

    '''
    Upload image with base64 content to a bucket
    : seller (str) - Name of the seller
    : shop (str) - Name of the shop
    : date (str) - Date in the format YYYY-MM-DD
    : order_id (str) - Order ID
    : product_id (str) - Product ID
    : files (list) - List of dictionaries containing 'filename' and 'content_base64'
    : bucket_name (str)
    '''
   
    for file in files:
        filename = file['filename']
        content_base64 = file['content_base64']
        blob_path = get_blob_path_pdf_gen(seller, date, filename)
        blob = storage_client.bucket(bucket_name).blob(blob_path)
        
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
            content_type = 'image/png'
        elif filename.lower().endswith(('.pdf')):
            content_type = 'application/pdf'
        else:
            content_type = 'application/octet-stream'
        blob.upload_from_string(base64.b64decode(content_base64), content_type=content_type)
        print(f'File {filename} - content_type: {content_type} - uploaded to {blob_path}')
    
    # Tạo và trả về Signed URL cho thư mục
    path = get_gen_images_public_links(bucket_name, seller, date, [file['filename'] for file in files])
    return path



def get_personalize_image_public_link(bucket_name, files):
    links = {}
    for file_ in files:
        file = file_['file'] 
        # Tạo đường dẫn đến từng ảnh trong thư mục
        filename = file['filename']
        path_clipart = file['path']
        image_path = f'{path_clipart}/{filename}'
        # Tạo và trả về Signed URL cho ảnh
        link = f"https://storage.googleapis.com/{bucket_name}/{image_path}"
        if file['type'] not in links.keys():
            links[file['type']] = {}
        links[file['type']][filename] = link
    return links


def upload_to_bucket_personalize(files):
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './backend/resources/ServiceKey_GoogleCloud.json'
    storage_client = storage.Client()
    bucket_name = 'nambe-fulfillments'

    for file_ in files:
        file = file_['file'] 
        filename = file['filename']
        content_base64 = file['content_base64']
        path_clipart = file['path']
        blob = storage_client.bucket(bucket_name).blob(path_clipart+'/'+filename)
        
        if filename.lower().endswith(('.jpg', '.jpeg')):
            content_type = 'image/jpeg'
        elif filename.lower().endswith(('.png')):
            content_type = 'image/png'
        elif filename.lower().endswith(('.otf')):
            content_type = 'font/otf'
        elif filename.lower().endswith(('.ttf')):
            content_type = 'font/ttf'    
        else:
            content_type = 'application/octet-stream'
        
        blob.upload_from_string(base64.b64decode(content_base64), content_type=content_type)
        print(f'File {filename} - content_type: {content_type} - uploaded to {path_clipart}')
        
        # Tạo và trả về Signed URL cho thư mục
    path = get_personalize_image_public_link(bucket_name, [file for file in files])
    return path