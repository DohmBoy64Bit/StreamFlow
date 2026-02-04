# Combined Dockerfile for StreamFlow
# Builds both frontend and backend in a single container

# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY streamflow-frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY streamflow-frontend/ ./

# Set API URL to empty (relative paths - same domain)
ENV VITE_API_BASE_URL=""

# Build frontend
RUN npm run build

# ============================================
# Stage 2: Build Backend + Serve Frontend
# ============================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY streamflow-backend/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY streamflow-backend/ ./

# Copy built frontend from stage 1
COPY --from=frontend-build /app/frontend/dist ./frontend-dist

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Run migrations and start server
CMD alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000
