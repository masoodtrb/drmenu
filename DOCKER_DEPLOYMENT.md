# Docker Deployment Guide for DrMenu

This guide provides comprehensive instructions for deploying the DrMenu application using Docker with a multi-stage build for minimal production images.

## 🏗️ Architecture

The application uses a sophisticated multi-stage Docker build process:

1. **Base Stage**: Node.js 22 Alpine with pnpm package manager
2. **Dependencies Stage**: Install all dependencies (dev + prod)
3. **Builder Stage**: Build the Next.js application and generate Prisma client
4. **Production Dependencies Stage**: Install only production dependencies
5. **Runner Stage**: Minimal production image with only necessary files

### Service Architecture

- **Next.js Application**: Main web application with tRPC API
- **PostgreSQL**: Primary database with health checks
- **Redis**: Caching, session storage, and queue management
- **Nginx**: Reverse proxy with SSL termination (production)
- **pgAdmin**: Database administration (development only)
- **Certbot**: SSL certificate management (production)

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB RAM
- At least 10GB disk space
- Git (for deployment script)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd drmenu
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**

```bash
# Database Configuration
POSTGRES_DB=drmenu
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_PORT=5432

# Redis Configuration
REDIS_PASSWORD=your_redis_password_here
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=your_email@gmail.com

# Application Configuration
NODE_ENV=production
PORT=3000

# SSL Configuration (Production)
DOMAIN_NAME=your-domain.com
SSL_EMAIL=your-email@example.com
```

### 3. Deploy Application

```bash
# Make deployment script executable
chmod +x docker/deploy.sh

# Run full deployment
./docker/deploy.sh deploy

# Or use the simplified command
./docker/deploy.sh
```

## 🐳 Docker Commands

### Development Environment

```bash
# Start with development profile (includes pgAdmin)
docker-compose -f docker/compose.yml --profile development up -d

# View logs
docker-compose -f docker/compose.yml logs -f

# Stop services
docker-compose -f docker/compose.yml down

# Rebuild and restart
docker-compose -f docker/compose.yml up -d --build
```

### Production Environment

```bash
# Deploy production stack
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Rebuild production image
docker-compose -f docker-compose.prod.yml build --no-cache app
```

## 📊 Service Management

### Using the Deployment Script

The deployment script (`docker/deploy.sh`) provides comprehensive management:

```bash
# Full deployment (default)
./docker/deploy.sh deploy

# Create backup only
./docker/deploy.sh backup

# Show status and resource usage
./docker/deploy.sh status

# View real-time logs
./docker/deploy.sh logs

# Stop all services
./docker/deploy.sh stop

# Restart all services
./docker/deploy.sh restart

# Cleanup old images
./docker/deploy.sh cleanup
```

### Manual Docker Commands

```bash
# Build application image
docker-compose -f docker/compose.yml build app

# Run database migrations
docker exec drmenu_app npx prisma migrate deploy

# Generate Prisma client
docker exec drmenu_app npx prisma generate

# Run database seeding
docker exec drmenu_app npx prisma db seed

# Access application shell
docker exec -it drmenu_app sh

# View container logs
docker logs drmenu_app -f

# Check container health
docker inspect drmenu_app --format='{{.State.Health.Status}}'
```

## 🔧 Configuration

### Nginx Configuration

The production setup includes Nginx as a reverse proxy with:

- **Gzip compression**: Reduces bandwidth usage
- **Rate limiting**: Prevents abuse
- **Static file caching**: Improves performance
- **SSL termination**: Secure HTTPS connections
- **Health check endpoints**: Monitoring integration

### Database Configuration

PostgreSQL is configured with:

- **Health checks**: Automatic monitoring
- **Persistent volumes**: Data persistence
- **Automatic backups**: Via deployment script
- **Connection pooling**: Optimized connections
- **Resource limits**: Memory and CPU constraints

### Redis Configuration

Redis is configured for:

- **Session storage**: User sessions
- **Queue management**: Background job processing
- **Caching**: Application data caching
- **Password protection**: Secure access
- **Persistence**: Data durability

### Application Configuration

The Next.js application includes:

- **Multi-stage build**: Optimized production image
- **Health checks**: Application monitoring
- **Non-root user**: Security best practices
- **Automatic migrations**: Database schema updates
- **Seeding**: Initial data setup

## 📁 File Structure

```
drmenu/
├── Dockerfile                 # Multi-stage Docker build
├── .dockerignore             # Docker ignore file
├── docker-compose.prod.yml   # Production compose file
├── docker/
│   ├── compose.yml           # Development compose file
│   ├── nginx.conf            # Nginx configuration
│   ├── deploy.sh             # Deployment script
│   ├── start.sh              # Application startup script
│   ├── migrate.sh            # Database migration script
│   ├── setup-ssl.sh          # SSL certificate setup
│   └── init/                 # Database initialization scripts
├── env.example               # Environment template
├── .env                      # Environment variables (not in git)
└── DOCKER_DEPLOYMENT.md      # This file
```

## 🔍 Health Checks

The application includes comprehensive health checks:

### Application Health

- **Endpoint**: `GET /api/health`
- **Check**: HTTP 200 response
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts

### Database Health

- **Check**: `pg_isready` command
- **User**: postgres
- **Database**: drmenu
- **Interval**: 30 seconds

### Redis Health

- **Check**: `redis-cli ping`
- **Authentication**: Password protected
- **Interval**: 30 seconds

## 📈 Monitoring

### Container Status

```bash
# View all containers
docker ps

# View resource usage
docker stats

# View container logs
docker logs <container_name> -f

# View health status
docker inspect <container_name> --format='{{.State.Health.Status}}'
```

### Application Health

```bash
# Check application health
curl http://localhost:3000/api/health

# Check database connection
docker exec drmenu_postgres pg_isready -U postgres

# Check Redis connection
docker exec drmenu_redis redis-cli -a $REDIS_PASSWORD ping

# Check Nginx status
docker exec drmenu_nginx nginx -t
```

### Resource Monitoring

```bash
# View resource usage
docker stats --no-stream

# View disk usage
docker system df

# View network usage
docker network ls
```

## 🔒 Security Considerations

### Environment Security

1. **Environment Variables**: Never commit `.env` files
2. **Database Passwords**: Use strong, unique passwords (16+ characters)
3. **JWT Secrets**: Generate cryptographically secure secrets (32+ characters)
4. **Redis Passwords**: Use strong passwords for Redis authentication

### Network Security

1. **Docker Networks**: Use isolated networks for service communication
2. **Port Exposure**: Only expose necessary ports
3. **SSL/TLS**: Configure SSL certificates for production
4. **Firewall**: Restrict access to necessary ports only

### Container Security

1. **Non-root User**: Application runs as non-root user
2. **Read-only Filesystem**: Where possible
3. **Resource Limits**: CPU and memory constraints
4. **Health Checks**: Automatic failure detection

### Data Security

1. **Database Encryption**: Use encrypted connections
2. **Backup Encryption**: Encrypt backup files
3. **File Permissions**: Proper file ownership and permissions
4. **Secrets Management**: Use Docker secrets or external secret management

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Conflicts

```bash
# Check port usage
netstat -tulpn | grep :3000
lsof -i :3000

# Change ports in docker-compose.yml
# Update environment variables accordingly
```

#### 2. Database Connection Issues

```bash
# Check database logs
docker logs drmenu_postgres

# Test connection
docker exec drmenu_postgres pg_isready -U postgres

# Check database status
docker exec drmenu_postgres psql -U postgres -c "SELECT version();"

# Reset database (development only)
docker exec drmenu_app npx prisma migrate reset
```

#### 3. Memory Issues

```bash
# Check memory usage
docker stats

# Increase memory limits in docker-compose.yml
# Add resource limits:
deploy:
  resources:
    limits:
      memory: 2G
    reservations:
      memory: 1G
```

#### 4. Build Failures

```bash
# Clean build
docker-compose build --no-cache app

# Check build logs
docker-compose build app

# Remove unused images
docker image prune -f

# Remove all unused resources
docker system prune -f
```

#### 5. SSL Certificate Issues

```bash
# Check certificate status
docker exec drmenu_certbot certbot certificates

# Renew certificates
docker exec drmenu_certbot certbot renew

# Setup SSL for first time
./docker/setup-ssl.sh
```

### Logs and Debugging

```bash
# Application logs
docker logs drmenu_app -f

# Database logs
docker logs drmenu_postgres -f

# Redis logs
docker logs drmenu_redis -f

# Nginx logs
docker logs drmenu_nginx -f

# All services logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f app
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check disk usage
docker system df

# Check network connectivity
docker exec drmenu_app ping postgres
docker exec drmenu_app ping redis

# Check application performance
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/health
```

## 📦 Backup and Restore

### Automated Backups

The deployment script creates automatic backups including:

- **Database dump**: Complete PostgreSQL dump
- **Uploaded files**: User-uploaded content
- **Environment configuration**: Current environment variables
- **Timestamped backups**: Organized by date and time

### Manual Backup

```bash
# Database backup
docker exec drmenu_postgres pg_dump -U postgres drmenu > backup_$(date +%Y%m%d_%H%M%S).sql

# File backup
docker cp drmenu_app:/app/uploads ./backup-uploads-$(date +%Y%m%d_%H%M%S)/

# Environment backup
cp .env ./backup-env-$(date +%Y%m%d_%H%M%S)

# Complete backup
./docker/deploy.sh backup
```

### Restore Procedures

```bash
# Restore database
docker exec -i drmenu_postgres psql -U postgres drmenu < backup.sql

# Restore uploads
docker cp ./backup-uploads/ drmenu_app:/app/uploads

# Restore environment
cp backup-env .env
```

## 🔄 Updates and Maintenance

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
./docker/deploy.sh deploy

# Or manual update
docker-compose -f docker/compose.yml build --no-cache app
docker-compose -f docker/compose.yml up -d
```

### Database Migrations

```bash
# Run migrations
docker exec drmenu_app npx prisma migrate deploy

# Check migration status
docker exec drmenu_app npx prisma migrate status

# Reset database (development only)
docker exec drmenu_app npx prisma migrate reset

# Generate Prisma client
docker exec drmenu_app npx prisma generate
```

### System Maintenance

```bash
# Clean up unused images
docker image prune -f

# Clean up unused volumes (be careful!)
docker volume prune -f

# Clean up unused networks
docker network prune -f

# Complete system cleanup
docker system prune -f

# Remove all unused resources
docker system prune -a -f
```

### SSL Certificate Renewal

```bash
# Check certificate expiry
docker exec drmenu_certbot certbot certificates

# Renew certificates
docker exec drmenu_certbot certbot renew

# Restart Nginx after renewal
docker-compose -f docker-compose.prod.yml restart nginx
```

## 🎯 Performance Optimization

### Production Optimizations

1. **Image Size**: Multi-stage build reduces final image size by ~70%
2. **Caching**: Nginx caching for static assets (1 year TTL)
3. **Compression**: Gzip compression enabled (text/html, text/css, application/javascript)
4. **Resource Limits**: CPU and memory limits configured for stability
5. **Health Checks**: Automatic health monitoring and restart
6. **Connection Pooling**: Optimized database connections

### Scaling Considerations

- **Horizontal Scaling**: Use Docker Swarm or Kubernetes for multi-instance deployment
- **Load Balancing**: Implement load balancer for multiple app instances
- **External Services**: Use managed PostgreSQL and Redis for high availability
- **CDN Integration**: Consider CDN for static assets
- **Database Replication**: Implement read replicas for high traffic

### Monitoring and Alerting

```bash
# Set up monitoring with Prometheus
# Add monitoring labels to services
# Configure alerting rules
# Set up log aggregation with ELK stack
```

## 📞 Support and Documentation

### Additional Resources

- **API Documentation**: `/docs/MENU_API_DOCUMENTATION.md`
- **Admin Login Guide**: `/docs/ADMIN_LOGIN_README.md`
- **Email Setup**: `/docs/EMAIL_SETUP.md`
- **Store Authentication**: `/docs/STORE_AUTH_README.md`
- **Subscription System**: `/docs/SUBSCRIPTION_SYSTEM_DESIGN.md`

### Getting Help

1. **Check Logs**: Always check application logs first
2. **Review Documentation**: Consult relevant documentation files
3. **Health Checks**: Verify all services are healthy
4. **Environment**: Ensure environment variables are correct
5. **Resources**: Check system resources (CPU, memory, disk)

### Common Commands Reference

```bash
# Quick status check
./docker/deploy.sh status

# View logs
./docker/deploy.sh logs

# Restart services
./docker/deploy.sh restart

# Full redeploy
./docker/deploy.sh deploy

# Create backup
./docker/deploy.sh backup

# Cleanup
./docker/deploy.sh cleanup
```

---

**Note**: This deployment guide is designed for both development and production environments. Always test changes in a development environment before applying to production.
