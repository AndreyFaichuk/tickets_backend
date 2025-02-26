# Project Setup

## Folder Structure Example

```
project/
  tickets_backend/
  tickets_frontend/
  docker-compose.yml
  start-dev.sh
  start-prod.sh
```

## Scripts

start-dev.sh

```
docker-compose up -d --build tickets_frontend_dev tickets_backend_dev
```

start-prod.sh

```
docker-compose up -d --build tickets_frontend_prod tickets_backend_prod
```

## Services Included

This setup includes the following services:

- **Frontend**: React application running with Vite.
- **Backend**: Node.js application using NestJS.
- **Database Dev**: Local instance of MongoDB.
- **Database Prod**: Cloud instance of MongoDB Atlas.

## Flow (CI/CD)

1. **CI Process**: Check PRs before merging into the **main** branch, including linting, and types checks.
2. **CD Process**: The CD process begins manually by new tag v\* to the AWS VPS instance.

## Docker Compose Configuration

```yaml
version: '3.8'

services:
  # Dev (Vite)
  tickets_frontend_dev:
    build:
      context: ./tickets_frontend
      dockerfile: Dockerfile.dev
    ports:
      - '8080:8080'
    volumes:
      - ./tickets_frontend:/app
      - /app/node_modules
    command: npm run dev
    depends_on:
      - tickets_backend_dev

  # Prod (Nginx)
  tickets_frontend_prod:
    build:
      context: ./tickets_frontend
      dockerfile: Dockerfile.prod
    ports:
      - '8080:8080'
    depends_on:
      - tickets_backend_prod

  # Backend Dev
  tickets_backend_dev:
    build:
      context: ./tickets_backend
      dockerfile: Dockerfile.dev
    ports:
      - '3000:3000'
    env_file:
      - ./tickets_backend/.env.dev
    volumes:
      - ./tickets_backend:/app
      - /app/node_modules
    depends_on:
      - mongo

  # Backend Prod
  tickets_backend_prod:
    build:
      context: ./tickets_backend
      dockerfile: Dockerfile.prod
    ports:
      - '3000:3000'
    env_file:
      - ./tickets_backend/.env.prod

  mongo:
    image: mongo
    ports:
      - '28017:27017'
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

## Repositories

- **tickets_backend** - [GitHub Repository](https://github.com/AndreyFaichuk/tickets_backend)
- **tickets_frontend** - [GitHub Repository](https://github.com/AndreyFaichuk/tickets_frontend)
