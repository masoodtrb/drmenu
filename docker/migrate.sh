#!/bin/bash

# Database Migration and Seeding Script
# This script can be run manually for database operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if container is running
if ! docker ps | grep -q drmenu_app_prod; then
    error "Application container is not running. Please start it first with: docker-compose -f docker-compose.prod.yml up -d"
fi

# Handle script arguments
case "${1:-help}" in
    "migrate")
        log "Running database migrations..."
        docker exec drmenu_app_prod npx prisma migrate deploy
        success "Database migrations completed"
        ;;
    "seed")
        log "Running database seeding..."
        docker exec drmenu_app_prod npx prisma db seed
        success "Database seeding completed"
        ;;
    "reset")
        warning "This will reset the database and lose all data!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log "Resetting database..."
            docker exec drmenu_app_prod npx prisma migrate reset --force
            success "Database reset completed"
        else
            log "Database reset cancelled"
        fi
        ;;
    "status")
        log "Checking migration status..."
        docker exec drmenu_app_prod npx prisma migrate status
        ;;
    "studio")
        log "Opening Prisma Studio..."
        docker exec -it drmenu_app_prod npx prisma studio
        ;;
    "generate")
        log "Generating Prisma client..."
        docker exec drmenu_app_prod npx prisma generate
        success "Prisma client generated"
        ;;
    "help"|*)
        echo "Usage: $0 {migrate|seed|reset|status|studio|generate}"
        echo ""
        echo "Commands:"
        echo "  migrate  - Run pending database migrations"
        echo "  seed     - Run database seeding"
        echo "  reset    - Reset database (WARNING: loses all data)"
        echo "  status   - Check migration status"
        echo "  studio   - Open Prisma Studio"
        echo "  generate - Generate Prisma client"
        echo "  help     - Show this help message"
        ;;
esac
