# Game Leaderboard API

A NestJS-based game leaderboard system.

## Installation

```bash
# Install dependencies
npm install

# Create env file
cp .env.example.test .env
```

## Environment Configuration

```env


# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=panteon
DB_PASSWORD=panteon
DB_NAME=panteon
DB_DATABASE=panteon

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=panteon

# Docker Postgres Configuration
POSTGRES_USER= panteon
POSTGRES_PASSWORD= panteon   
```

## Docker Setup

```yaml
version: '3.7'
services:
  api:
    build: .
    container_name: api
    ports:
      - "3001:3001"
    depends_on:
      - redis
      - postgres
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - POSTGRES_HOST=postgres
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    networks:
      - redis
      - postgres
    restart: unless-stopped

  redis:
    image: redis
    container_name: redis
    ports:
      - "6379:6379"
    networks: 
      - redis
    volumes:
      - redis:/data/redis
    restart: unless-stopped

  postgres:
    container_name: postgres
    image: postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      PGDATA: /data/postgres
    volumes:
       - postgres:/data/postgres
    ports:
      - "5432:5432"
    networks:
      - postgres
    restart: unless-stopped

networks:
  redis:
  postgres:

volumes:
  postgres:
  redis:
```

Start Docker containers:
```bash
docker-compose up -d
```

## Running the Application

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## API Documentation

```
http://localhost:{port}/api
```

## Modules

- Users: User management
- Players: Player profiles
- Leaderboard: Ranking system
- Reward Service: Weekly reward distribution

## Current Features

- Redis implementation
- Weekly reward distribution (CRON job)
- JWT authentication

## Test Status

✅ Players (Controller & Service)  
✅ Users (Controller & Service)  
❌ Reward Service  
❌ Leaderboard  

## Upcoming Features

- Elasticsearch
- RabbitMQ (microservice)

## Testing

```bash
npm run test
```
