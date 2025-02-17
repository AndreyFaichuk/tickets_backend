# Project Setup

## Folder Structure Example

```
project/
  tickets_backend/
  tickets_frontend/
  docker-compose.yml
```

## Docker Compose Configuration

```yaml
services:
  tickets_frontend:
    build: ./tickets_frontend
    ports:
      - '8080:8080'
    volumes:
      - ./tickets_frontend:/app
      - /app/node_modules
    command: npm run dev
    depends_on:
      - tickets_backend

  tickets_backend:
    build: ./tickets_backend
    ports:
      - '3000:3000'
    env_file:
      - ./tickets_backend/.env
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

## Services Included

This setup includes the following services:

- **Frontend**: React application running with Vite.
- **Backend**: Node.js application using NestJS.
- **Database**: Local instance of MongoDB.

## Useful Commands

### Start the services

```sh
docker-compose up -d --build
```

### Stop the services

```sh
docker-compose down
```

### View logs

```sh
docker-compose logs -f
```

### Restart the services

```sh
docker-compose restart
```

### Remove all containers, networks, and volumes

```sh
docker-compose down -v
```

## Repositories

- **tickets_backend** - [GitHub Repository](https://github.com/AndreyFaichuk/tickets_backend)
- **tickets_frontend** - [GitHub Repository](https://github.com/AndreyFaichuk/tickets_frontend)
