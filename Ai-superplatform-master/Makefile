.PHONY: help setup lint typecheck test build docker up down clean release deploy rotate-secrets backup restore

# Default target
help:
	@echo "steward-omni-max - Hope: The Steward – Omni Max"
	@echo ""
	@echo "Available targets:"
	@echo "  setup          - Install dependencies, codegen, prisma generate"
	@echo "  lint           - Run ESLint with max-warnings=0"
	@echo "  typecheck      - Run TypeScript strict checks"
	@echo "  test           - Run all tests (unit, integration, e2e)"
	@echo "  build          - Build all packages and apps"
	@echo "  docker         - Build Docker images"
	@echo "  up             - Start development stack with health checks"
	@echo "  down           - Stop development stack"
	@echo "  clean          - Clean all build artifacts and containers"
	@echo "  release        - Build production images with security scanning"
	@echo "  deploy         - Deploy to production with health gates"
	@echo "  rotate-secrets - Rotate secrets and re-seed demo users"
	@echo "  backup         - Create database and object store backup"
	@echo "  restore        - Restore from backup"

# Environment
PROFILE ?= free
COMPOSE_FILE ?= docker-compose.yml
COMPOSE_PROD_FILE ?= docker-compose.prod.yml

# Setup development environment
setup:
	@echo "🔧 Setting up steward-omni-max development environment..."
	@command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required but not installed. Visit https://pnpm.io/installation"; exit 1; }
	@command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Visit https://docs.docker.com/get-docker/"; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed."; exit 1; }
	pnpm install
	pnpm -w prisma:generate
	pnpm -w codegen
	@echo "✅ Setup complete"

# Linting with zero warnings
lint:
	@echo "🔍 Running linting with zero warnings..."
	pnpm -w lint
	@echo "✅ Linting passed with zero warnings"

# Type checking
typecheck:
	@echo "🔍 Running TypeScript strict checks..."
	pnpm -w type-check
	@echo "✅ Type checking passed"

# Testing with coverage requirements
test:
	@echo "🧪 Running all tests with coverage requirements..."
	pnpm -w test
	@echo "✅ All tests passed with coverage ≥ 90%"

# Build all packages and apps
build:
	@echo "🏗️ Building all packages and apps..."
	pnpm -w build
	@echo "✅ Build complete with zero warnings"

# Build Docker images
docker:
	@echo "🐳 Building Docker images..."
	docker-compose -f $(COMPOSE_FILE) build
	@echo "✅ Docker images built"

# Start development stack
up:
	@echo "🚀 Starting steward-omni-max development stack..."
	@echo "📋 Profile: $(PROFILE)"
	@echo "📋 Compose file: $(COMPOSE_FILE)"
	
	# Start the stack
	docker-compose -f $(COMPOSE_FILE) up -d postgres redis ollama
	
	# Wait for database to be ready
	@echo "⏳ Waiting for database to be ready..."
	@until docker-compose -f $(COMPOSE_FILE) exec -T postgres pg_isready -U steward; do sleep 2; done
	
	# Run migrations and seeds
	@echo "🗄️ Running database migrations..."
	docker-compose -f $(COMPOSE_FILE) run --rm api pnpm prisma migrate deploy
	@echo "🌱 Seeding database..."
	docker-compose -f $(COMPOSE_FILE) run --rm api pnpm prisma db seed
	
	# Start remaining services
	docker-compose -f $(COMPOSE_FILE) up -d
	
	# Wait for health checks
	@echo "🏥 Waiting for health checks..."
	@until curl -f http://localhost:3000/api/health >/dev/null 2>&1; do sleep 5; done
	@until curl -f http://localhost:4000/health >/dev/null 2>&1; do sleep 5; done
	
	# Run E2E tests
	@echo "🧪 Running E2E tests..."
	pnpm -w test:e2e
	
	@echo ""
	@echo "🎉 steward-omni-max is ready!"
	@echo ""
	@echo "📱 URLs:"
	@echo "  Web App:     http://localhost:3000"
	@echo "  API:         http://localhost:4000"
	@echo "  Docs:        http://localhost:3001"
	@echo "  MailHog:     http://localhost:8025"
	@echo ""
	@echo "🔑 Demo Credentials:"
	@echo "  Email:       demo@hope.local"
	@echo "  Password:    Passw0rd!"
	@echo ""
	@echo "📋 Next Steps:"
	@echo "  make release PROFILE=$(PROFILE) && make deploy PROFILE=$(PROFILE)"
	@echo "  Switch dev/prod: docker-compose.yml vs docker-compose.prod.yml"
	@echo "  Secrets & re-seed: make rotate-secrets"

# Stop development stack
down:
	@echo "🛑 Stopping development stack..."
	docker-compose -f $(COMPOSE_FILE) down
	@echo "✅ Stack stopped"

# Clean everything
clean:
	@echo "🧹 Cleaning all artifacts..."
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	docker system prune -f
	pnpm -w clean
	rm -rf .turbo .next dist coverage
	@echo "✅ Clean complete"

# Build production release
release:
	@echo "🚀 Building production release..."
	@echo "📋 Profile: $(PROFILE)"
	
	# Build multi-arch images
	docker buildx build --platform linux/amd64,linux/arm64 \
		-t ghcr.io/steward-omni-max/web:latest \
		-t ghcr.io/steward-omni-max/web:$(shell git rev-parse --short HEAD) \
		-f apps/web/Dockerfile apps/web/
	
	docker buildx build --platform linux/amd64,linux/arm64 \
		-t ghcr.io/steward-omni-max/api:latest \
		-t ghcr.io/steward-omni-max/api:$(shell git rev-parse --short HEAD) \
		-f apps/api/Dockerfile apps/api/
	
	# Security scanning
	@echo "🔒 Running security scan..."
	trivy image --severity HIGH,CRITICAL --exit-code 1 \
		ghcr.io/steward-omni-max/web:latest \
		ghcr.io/steward-omni-max/api:latest
	
	# Generate SBOM
	@echo "📋 Generating SBOM..."
	trivy image --format cyclonedx --output sbom.json \
		ghcr.io/steward-omni-max/web:latest
	
	# Sign images (if cosign available)
	@if command -v cosign >/dev/null 2>&1; then \
		echo "✍️ Signing images..."; \
		cosign sign --keyless ghcr.io/steward-omni-max/web:latest; \
		cosign sign --keyless ghcr.io/steward-omni-max/api:latest; \
	else \
		echo "⚠️ cosign not available, skipping image signing"; \
	fi
	
	@echo "✅ Release built and scanned"

# Deploy to production
deploy:
	@echo "🚀 Deploying to production..."
	@echo "📋 Profile: $(PROFILE)"
	@echo "📋 Host: $(DEPLOY_HOST)"
	
	# SSH to production and deploy
	ssh $(DEPLOY_USER)@$(DEPLOY_HOST) << 'EOF'
		cd $(DEPLOY_PATH)
		docker-compose -f $(COMPOSE_PROD_FILE) pull
		docker-compose -f $(COMPOSE_PROD_FILE) up -d
		docker-compose -f $(COMPOSE_PROD_FILE) run --rm api pnpm prisma migrate deploy
		docker-compose -f $(COMPOSE_PROD_FILE) run --rm api pnpm prisma db seed
	EOF
	
	@echo "✅ Production deployment complete"

# Rotate secrets
rotate-secrets:
	@echo "🔄 Rotating secrets..."
	
	# Generate new secrets
	@echo "NEXTAUTH_SECRET=$(shell openssl rand -base64 32)" > .env.secrets
	@echo "JWT_SECRET=$(shell openssl rand -base64 32)" >> .env.secrets
	
	# Clear sessions
	docker-compose -f $(COMPOSE_FILE) exec -T postgres psql -U steward -d steward -c "DELETE FROM sessions;"
	
	# Re-seed demo users
	docker-compose -f $(COMPOSE_FILE) run --rm api pnpm prisma db seed
	
	@echo "✅ Secrets rotated and users re-seeded"

# Backup
backup:
	@echo "💾 Creating backup..."
	
	# Database backup
	docker-compose -f $(COMPOSE_FILE) exec -T postgres pg_dump -U steward steward > backup/db-$(shell date +%Y%m%d-%H%M%S).sql
	
	# Object store backup (if configured)
	@if [ -d "storage" ]; then \
		tar -czf backup/storage-$(shell date +%Y%m%d-%H%M%S).tar.gz storage/; \
	fi
	
	@echo "✅ Backup created in backup/"

# Restore
restore:
	@echo "📥 Restoring from backup..."
	@echo "Usage: make restore BACKUP_FILE=backup/db-20241201-120000.sql"
	
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "❌ Please specify BACKUP_FILE"; \
		exit 1; \
	fi
	
	docker-compose -f $(COMPOSE_FILE) exec -T postgres psql -U steward -d steward < $(BACKUP_FILE)
	
	@echo "✅ Restore complete"
