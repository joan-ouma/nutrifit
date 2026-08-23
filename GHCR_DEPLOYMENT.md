# GHCR Docker Deployment Guide for NutriFit

This repository includes an automated GitHub Actions CI/CD pipeline (`.github/workflows/deploy-ghcr.yml`) that builds and publishes production Docker images for both the **Frontend** and **Backend** to GitHub Container Registry (`ghcr.io`).

---

## 📦 Container Registry Image URIs

Upon pushing to the `main` branch, the following images are automatically built and published:

- **Frontend Image**: `ghcr.io/<owner>/nutrifit-frontend:latest`
- **Backend Image**: `ghcr.io/<owner>/nutrifit-backend:latest`

*(Replace `<owner>` with your GitHub username or organization name, e.g. `joan-ouma`)*

---

## 🚀 How to Run Containers Locally or in Production

### 1. Authenticate with GHCR
```bash
echo $CR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 2. Pull Images
```bash
docker pull ghcr.io/joan-ouma/nutrifit-frontend:latest
docker pull ghcr.io/joan-ouma/nutrifit-backend:latest
```

### 3. Run with Docker Compose

Create a `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6-alpine
    container_name: nutrifit-db
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    image: ghcr.io/joan-ouma/nutrifit-backend:latest
    container_name: nutrifit-backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/nutrifit
      - JWT_SECRET=your_production_jwt_secret
      - CORS_ORIGIN=https://nutrifit-3ue8.onrender.com,http://localhost:3000
      - NODE_ENV=production
    depends_on:
      - mongodb

  frontend:
    image: ghcr.io/joan-ouma/nutrifit-frontend:latest
    container_name: nutrifit-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo_data:
```

Run compose:
```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## 🛠️ GitHub Actions Workflow Triggers
- Automatic push to `main` branch
- Release tagging (`v*.*.*`)
- Manual trigger via **Actions** tab (`workflow_dispatch`)
