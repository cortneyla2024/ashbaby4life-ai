# =============================================================================
# CareConnect v5.0 Dockerfile
# =============================================================================

# Use multi-stage build for optimization
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY frontend/ ./

# Build frontend application
RUN npm run build

# =============================================================================
# Backend Builder Stage
# =============================================================================

FROM node:18-alpine AS backend-builder

# Set working directory
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Build backend application
RUN npm run build

# =============================================================================
# AI Engine Builder Stage
# =============================================================================

FROM python:3.9-slim AS ai-builder

# Set working directory
WORKDIR /app/ai-core

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy AI requirements
COPY ai-core/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy AI source code
COPY ai-core/ ./

# Download or create default model
RUN python -c "import torch; import os; model = torch.nn.Linear(100, 100); os.makedirs('checkpoints', exist_ok=True); torch.save(model.state_dict(), 'checkpoints/steward-v5.pt'); print('Default model created successfully!')"

# =============================================================================
# Production Stage
# =============================================================================

FROM python:3.9-slim AS production

# Set environment variables
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Create non-root user
RUN groupadd -r careconnect && useradd -r -g careconnect careconnect

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Create necessary directories
RUN mkdir -p \
    data \
    logs \
    uploads \
    backups \
    temp \
    cache \
    analytics \
    ai-core/checkpoints \
    frontend \
    backend \
    integration \
    orchestration

# Copy built applications
COPY --from=frontend-builder /app/frontend/build ./frontend/build
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=ai-builder /app/ai-core ./ai-core

# Install production dependencies
WORKDIR /app/frontend
RUN npm ci --only=production

WORKDIR /app/backend
RUN npm ci --only=production

WORKDIR /app/ai-core
RUN pip install --no-cache-dir -r requirements.txt

# Copy configuration files
WORKDIR /app
COPY config.yaml ./
COPY telemetry.json ./
COPY .env ./

# Copy integration and orchestration files
COPY integration/ ./integration/
COPY orchestration/ ./orchestration/

# Copy scripts
COPY run.sh ./
COPY install.sh ./
RUN chmod +x run.sh install.sh

# Set ownership
RUN chown -R careconnect:careconnect /app

# Switch to non-root user
USER careconnect

# Expose ports
EXPOSE 3000 3001 3002 9090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Default command
ENTRYPOINT ["dumb-init", "--"]
CMD ["./run.sh"]

# =============================================================================
# Development Stage (Optional)
# =============================================================================

FROM python:3.9-slim AS development

# Set environment variables
ENV NODE_ENV=development
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Create necessary directories
RUN mkdir -p \
    data \
    logs \
    uploads \
    backups \
    temp \
    cache \
    analytics \
    ai-core/checkpoints \
    frontend \
    backend \
    integration \
    orchestration

# Copy source code
COPY . .

# Install development dependencies
WORKDIR /app/frontend
RUN npm install

WORKDIR /app/backend
RUN npm install

WORKDIR /app/ai-core
RUN pip install -r requirements.txt

# Set ownership
RUN chown -R 1000:1000 /app

# Expose ports
EXPOSE 3000 3001 3002 9090 9229

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Default command
ENTRYPOINT ["dumb-init", "--"]
CMD ["./run.sh"]

# =============================================================================
# Testing Stage (Optional)
# =============================================================================

FROM python:3.9-slim AS testing

# Set environment variables
ENV NODE_ENV=test
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Install test dependencies
WORKDIR /app/frontend
RUN npm install
RUN npm install --save-dev jest @testing-library/react @testing-library/jest-dom

WORKDIR /app/backend
RUN npm install
RUN npm install --save-dev jest supertest

WORKDIR /app/ai-core
RUN pip install -r requirements.txt
RUN pip install pytest pytest-cov

# Run tests
WORKDIR /app
RUN npm test

# Default command
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "test"]
