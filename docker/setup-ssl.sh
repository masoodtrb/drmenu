#!/bin/bash

# SSL Setup Script for Let's Encrypt
# This script sets up SSL certificates using Let's Encrypt

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

# Check if .env file exists
if [ ! -f ".env" ]; then
    error "Environment file .env not found. Please copy env.example to .env and configure it."
fi

# Load environment variables
source .env

# Check required environment variables
if [ -z "$DOMAIN_NAME" ] || [ -z "$SSL_EMAIL" ]; then
    error "DOMAIN_NAME and SSL_EMAIL must be set in .env file"
fi

log "Setting up SSL for domain: $DOMAIN_NAME"
log "Email: $SSL_EMAIL"

# Update nginx.conf with actual domain name
log "Updating nginx configuration with domain name..."
sed -i "s/your-domain.com/$DOMAIN_NAME/g" docker/nginx.conf

# Start nginx without SSL first
log "Starting nginx without SSL..."
docker-compose -f docker-compose.prod.yml up -d nginx

# Wait for nginx to be ready
log "Waiting for nginx to be ready..."
sleep 10

# Request SSL certificate
log "Requesting SSL certificate from Let's Encrypt..."
docker-compose -f docker-compose.prod.yml --profile ssl-setup run --rm certbot

# Test certificate renewal
log "Testing certificate renewal..."
docker-compose -f docker-compose.prod.yml run --rm certbot renew --dry-run

# Restart nginx with SSL
log "Restarting nginx with SSL..."
docker-compose -f docker-compose.prod.yml restart nginx

# Create renewal script
log "Creating SSL renewal script..."
cat > docker/renew-ssl.sh << 'EOF'
#!/bin/bash
# SSL Certificate Renewal Script

# Renew certificates
docker-compose -f docker-compose.prod.yml run --rm certbot renew

# Reload nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "SSL certificates renewed successfully"
EOF

chmod +x docker/renew-ssl.sh

# Add cron job for automatic renewal
log "Setting up automatic SSL renewal..."
PROJECT_PATH=$(pwd)
echo "0 12 * * * $PROJECT_PATH/docker/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1" | crontab -

success "SSL setup completed successfully!"
log "Your application is now available at: https://$DOMAIN_NAME"
log "SSL certificates will be automatically renewed via cron job"

# Show certificate info
log "Certificate information:"
docker-compose -f docker-compose.prod.yml run --rm certbot certificates
