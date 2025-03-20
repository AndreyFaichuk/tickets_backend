# Project Setup

## Folder Structure Example

```
project/
  tickets_backend/
  tickets_frontend/
  docker-compose.yml
  start-dev.sh
```

## Scripts

start-dev.sh

```
docker-compose up -d --build tickets_frontend_dev tickets_backend_dev
```

## Services Included

This setup includes the following services:

- **Frontend**: React application running with Vite.
- **Backend**: Node.js application using NestJS.
- **Database Dev**: Local instance of MongoDB.
- **Database Prod**: Cloud instance of MongoDB Atlas.

## CI/CD Process

### Continuous Integration (CI)

- On every Pull Request to `main`, the following checks are executed:
  - Linting
  - Type checking
  - Unit tests (if configured)
- If all checks pass, the PR can be merged into `main`.

### Continuous Deployment (CD)

Deployment is **triggered manually** by creating a new tag in the format `v*`.

1. **GitHub Actions** builds a Docker image and pushes it to **GitHub Container Registry (GHCR)**.
2. The workflow **connects to the AWS VPS via SSH**.
3. It **pulls the latest image**, updates the container, and restarts the service.

**Technologies used**: GitHub Actions, Docker, GHCR, SSH, AWS EC2.

## Production

1. Works with SSL certificate and SSL certificate key over a secure **https** protocol for **tickets-platform.duckdns.org** domen (Configured through the Dockerfile and Nginx server configuration for the production environment)
2. The platform is available at the following link in the production environment (When cloud instance runs) - **Tickets Platform** - (https://tickets-platform.duckdns.org/app/workspaces)

## Docker Compose Configuration

```yaml
services:
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
