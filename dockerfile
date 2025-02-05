FROM tiangolo/uvicorn-gunicorn-starlette:python3.11-slim

WORKDIR /app

COPY ./app/requirements.txt .

RUN pip install --upgrade pip

RUN apt-get update && \
    apt-get install -y libzbar0 && \
    rm -rf /var/lib/apt/lists/*


RUN pip install -r requirements.txt

