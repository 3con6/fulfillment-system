# Import required dependencies
import fitz
import io
import os
from PIL import Image
from pyzbar.pyzbar import decode
import re
from google.cloud import storage
import traceback
from ..settings import DB


def get_product_images_public_links(bucket_name, tracking_number):
    links = []
    image_path = f'labels/{tracking_number}.png'
    link = f"https://storage.googleapis.com/{bucket_name}/{image_path}"
    links.append(link)
    return links

def get_blob_path(tracking_number):
    return f'labels/{tracking_number}.png'

def remove_files_in_product_folder(storage_client, bucket_name, tracking_number):
    prefix = f'labels/{tracking_number}/'
    blobs = storage_client.list_blobs(bucket_name, prefix=prefix)
    for blob in blobs:
        blob.delete()

def upload_to_bucket(file_path, tracking_number):
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './backend/resources/ServiceKey_GoogleCloud.json'

    storage_client = storage.Client()

    bucket_name = 'nambe-fulfillments'
    filename = f'{tracking_number}.png'

    # Remove existing files in the product_id folder
    remove_files_in_product_folder(storage_client, bucket_name, tracking_number)

    blob_path = get_blob_path(tracking_number)
    blob = storage_client.bucket(bucket_name).blob(blob_path)
    content_type = 'image/png'

    # Upload image to google storage from file
    with open(file_path, 'rb') as file:
        blob.upload_from_file(file, content_type=content_type)

    # Tạo và trả về Signed URL cho thư mục
    path = get_product_images_public_links(bucket_name, tracking_number)

    return path


async def read_pdf(file_content, db_client):
    try:
        # Open PDF file from bytes
        pdf_bytes = io.BytesIO(file_content)
        # save pdf to temp file
        with open('./temp/temp.pdf', 'wb') as f:
            f.write(file_content)

        pdf_file = fitz.open('./temp/temp.pdf')

        # Get the number of pages in PDF file
        page_nums = len(pdf_file)

        # Extract all images information from each page
        for page_num in range(page_nums):
            page_content = pdf_file[page_num]
            images_list = page_content.get_images()

            # Raise error if PDF has no images
            if len(images_list) == 0:
                raise ValueError(f'No images found in PDF')

            # Save all the extracted images
            for i, img in enumerate(images_list, start=1):
                # Extract the image object number
                xref = img[0]
                # Extract image
                base_image = pdf_file.extract_image(xref)
                # Store image bytes
                image_bytes = base_image["image"]

                # get barcode in image
                image = Image.open(io.BytesIO(image_bytes))

                # cut image to get barcode
                image_croped = image.crop((50, 800, 850, 1100))

                # decode barcode
                barcode = decode(image_croped)


                if barcode:
                    # convert barcode to string
                    barcode = barcode[0][0].decode('utf-8')
                    cleaned_barcode = re.sub(r'[^\x20-\x7E]', '', barcode)
                    
                    # save image to local
                    local_file_path = f'./temp_labels/{cleaned_barcode}.png'
                    image.save(local_file_path)

                    # upload image to google storage
                    label_link = upload_to_bucket(local_file_path, cleaned_barcode)

                    # remove image from local
                    os.remove(local_file_path)

                    # find order_id from barcode
                    query = {
                        '_original_data.shipping.tracking_number': cleaned_barcode
                    }
                    filter_ = {
                        '_original_data': 1
                    }
                    order = await db_client.find_one(query, DB['COL_FULFILLMENTS'], filter_)
                    if order:
                        order['_original_data']['shipping']['tracking_label'] = label_link[0]
                        await db_client.update_one(order['_id'], order, DB['COL_FULFILLMENTS'])
        
        # remove temp file
        os.remove('./temp/temp.pdf')
        return True

    except:
        raise ValueError(f'Error while reading PDF, {traceback.format_exc()}')
