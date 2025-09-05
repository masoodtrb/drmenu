#!/bin/bash

# DrMenu Deployment Script
# This script helps deploy the application to a target server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker/compose.yml"
ENV_FILE=".env"
BACKUP_DIR="backups"
LOG_FILE="deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        warning "Running as root. Consider using a non-root user for security."
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if .env file exists
    if [ ! -f "$ENV_FILE" ]; then
        error "Environment file $ENV_FILE not found. Please copy env.example to $ENV_FILE and configure it."
    fi
    
    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
    fi
    
    BACKUP_NAME="backup_$(date +'%Y%m%d_%H%M%S')"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup database
    if docker ps | grep -q drmenu_postgres; then
        log "Backing up database..."
        docker exec drmenu_postgres pg_dump -U postgres drmenu > "$BACKUP_PATH/database.sql"
        success "Database backup created: $BACKUP_PATH/database.sql"
    fi
    
    # Backup uploads
    if docker ps | grep -q drmenu_app; then
        log "Backing up uploads..."
        docker cp drmenu_app:/app/uploads "$BACKUP_PATH/" 2>/dev/null || warning "No uploads to backup"
    fi
    
    # Backup environment file
    cp "$ENV_FILE" "$BACKUP_PATH/"
    
    success "Backup created: $BACKUP_PATH"
}

# Pull latest changes
pull_changes() {
    log "Pulling latest changes..."
    
    if [ -d ".git" ]; then
        git pull origin main || warning "Failed to pull changes from git"
    else
        warning "Not a git repository, skipping git pull"
    fi
}

# Build and deploy
deploy() {
    log "Building and deploying application..."
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" down || warning "Failed to stop containers"
    
    # Build and start services
    log "Building application image..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache app
    
    log "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check if services are running
    if docker ps | grep -q drmenu_app; then
        success "Application is running"
    else
        error "Application failed to start"
    fi
    
    if docker ps | grep -q drmenu_postgres; then
        success "Database is running"
    else
        error "Database failed to start"
    fi
    
    if docker ps | grep -q drmenu_redis; then
        success "Redis is running"
    else
        error "Redis failed to start"
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run Prisma migrations
    docker exec drmenu_app npx prisma migrate deploy || error "Database migration failed"
    
    # Generate Prisma client
    docker exec drmenu_app npx prisma generate || error "Prisma client generation failed"
    
    success "Database migrations completed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check application health
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        success "Application health check passed"
    else
        error "Application health check failed"
    fi
    
    # Check database connection
    if docker exec drmenu_postgres pg_isready -U postgres > /dev/null 2>&1; then
        success "Database health check passed"
    else
        error "Database health check failed"
    fi
    
    # Check Redis connection
    if docker exec drmenu_redis redis-cli ping > /dev/null 2>&1; then
        success "Redis health check passed"
    else
        error "Redis health check failed"
    fi
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful with this)
    # docker volume prune -f
    
    success "Cleanup completed"
}

# Show status
show_status() {
    log "Application Status:"
    echo ""
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    
    log "Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Main deployment function
main() {
    log "Starting DrMenu deployment..."
    
    check_root
    check_prerequisites
    create_backup
    pull_changes
    deploy
    run_migrations
    health_check
    cleanup
    
    success "Deployment completed successfully!"
    show_status
    
    log "Application is available at: http://localhost:3000"
    log "pgAdmin is available at: http://localhost:8080 (if enabled)"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "backup")
        check_prerequisites
        create_backup
        ;;
    "status")
        show_status
        ;;
    "logs")
        docker-compose -f "$COMPOSE_FILE" logs -f
        ;;
    "stop")
        docker-compose -f "$COMPOSE_FILE" down
        ;;
    "restart")
        docker-compose -f "$COMPOSE_FILE" restart
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|backup|status|logs|stop|restart|cleanup}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  backup   - Create backup only"
        echo "  status   - Show application status"
        echo "  logs     - Show application logs"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  cleanup  - Clean up old Docker images"
        exit 1
        ;;
esac
