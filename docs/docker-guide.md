# Hướng dẫn Docker

Hướng dẫn chi tiết về việc sử dụng Docker và Docker Compose để chạy ứng dụng Library Chatbox System.

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Quick Start](#quick-start)
- [Docker Compose Services](#docker-compose-services)
- [Các lệnh Docker thường dùng](#các-lệnh-docker-thường-dùng)
- [Troubleshooting](#troubleshooting)

## Giới thiệu

Dự án sử dụng Docker Compose để orchestrate các services:
- **Flask Backend** - API server chạy trên gunicorn
- **MongoDB** - Database chính
- **Redis** - Cache cho Z39.50 search
- **Redis Commander** (optional) - Web UI để quản lý Redis

## Yêu cầu hệ thống

### Cài đặt Docker

**Windows:**
1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. Install và khởi động Docker Desktop
3. Enable WSL 2 backend (khuyến nghị)

**macOS:**
1. Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
2. Install và khởi động Docker Desktop

**Linux (Ubuntu/Debian):**
\`\`\`bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker
docker --version
\`\`\`

## Quick Start

### 1. Setup môi trường

\`\`\`bash
cd backend
cp .env.example .env
nano .env
\`\`\`

### 2. Start tất cả services

\`\`\`bash
docker-compose up -d
docker-compose logs -f
\`\`\`

### 3. Kiểm tra

\`\`\`bash
docker-compose ps
curl http://localhost:5000/health
curl http://localhost:5000/api/z3950/health
\`\`\`

### 4. Stop services

\`\`\`bash
docker-compose down
\`\`\`

## Docker Compose Services

### Backend (`backend`)
- **Port:** 5000
- **Image:** Custom build từ Dockerfile
- **Command:** gunicorn
- **Depends on:** mongo, redis

### MongoDB (`mongo`)
- **Port:** 27017
- **Image:** mongo:7.0
- **Volume:** mongo-data

### Redis (`redis`)
- **Port:** 6379
- **Image:** redis:7.2-alpine
- **Config:** 256MB max memory, LRU eviction

### Redis Commander (`redis-commander`)
- **Port:** 8081
- **Profile:** tools
- **Start:** docker-compose --profile tools up -d

## Các lệnh Docker thường dùng

### Container Management

\`\`\`bash
# List containers
docker ps

# Logs
docker-compose logs -f backend

# Exec
docker-compose exec backend bash
docker-compose exec mongo mongosh
docker-compose exec redis redis-cli
\`\`\`

### Build & Deploy

\`\`\`bash
docker-compose build
docker-compose build --no-cache
docker-compose up -d
docker-compose down
\`\`\`

### Database

\`\`\`bash
# MongoDB
docker-compose exec mongo mongosh library_chatbox

# Redis
docker-compose exec redis redis-cli
docker-compose exec redis redis-cli KEYS "z3950:*"
docker-compose exec redis redis-cli FLUSHDB
\`\`\`

## Troubleshooting

### Container không start
\`\`\`bash
docker-compose logs backend
docker-compose build --no-cache
\`\`\`

### Port conflict
\`\`\`bash
sudo lsof -i :5000
sudo kill -9 <PID>
\`\`\`

### Clean up
\`\`\`bash
docker system prune -a
docker volume prune
\`\`\`

## Tài liệu tham khảo

- [Z39.50 API Guide](./z3950-api.md)
- [API Reference](./api-reference.md)
