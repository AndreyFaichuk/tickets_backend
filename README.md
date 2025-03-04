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

## Production

1. Works with SSL certificate and SSL certificate key over a secure **https** protocol (Configured through the appropriate Nginx server configuration)
2. The platform is available at the following link in the production environment (When cloud instance runs) - **Tickets Platform** - [Tickets Platform](https://tickets-platform.duckdns.org/app/workspaces)

## Docker Compose Configuration

```yaml
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
    env_file:
      - ./tickets_frontend/.env.dev
    command: npm run dev
    depends_on:
      - tickets_backend_dev

  # Prod (Nginx)
  tickets_frontend_prod:
    build:
      context: ./tickets_frontend
      dockerfile: Dockerfile.prod
    ports:
      - '8080:80'
      - '443:443'
    env_file:
      - ./tickets_frontend/.env.prod
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
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
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro

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
