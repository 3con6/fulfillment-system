# fulfillment-system
<p align="center">
<img src="https://raw.githubusercontent.com/amerhukic/OrderManagementSystem/main/Logo.png" width="420" max-width="80%" alt="Logo" />
</p>

<p align="center">
    <img src="https://img.shields.io/badge/Swift-5-orange.svg" />
    <a href="">
        <img src="https://img.shields.io/badge/Licence-MIT-green.svg" alt="License">
    </a>
</p>


## Introduction
Fulfillment System is a platform designed to assist employees in a laser printing workshop in managing orders from various stores, tracking order processing, and monitoring delivery status. The system optimizes workflow and minimizes errors during operations.

## Key Features
- Manage orders from multiple stores.
- Track order status from receipt to successful delivery.
- Monitor fulfillment progress within the laser printing workshop.
- Support API integration for data synchronization with other systems.

## System Requirements
- Docker
- Docker Compose
- Python 3.8+
- Starlette
- MongoDB

## Installation and Running Guide

### Running the System with Docker
```sh
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Running the System Locally
```sh
docker-compose -f docker-compose.yml up
```

### Running Tests
```sh
docker-compose -f test-docker-compose.yml up
```

### Accessing the Container for Inspection
```sh
docker exec -it nb_kho_test /bin/bash
```

## Contribution
If you wish to contribute to this project, please fork the repository, create a new branch, make your changes, and submit a pull request.

## License
This project is released under the MIT License.
