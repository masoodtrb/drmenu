# Docker Deployment Guide for DrMenu

This guide provides instructions for deploying the DrMenu application using Docker with a multi-stage build for minimal production images.

## 🏗️ Architecture

The application uses a multi-stage Docker build process:

1. **Base Stage**: Node.js 20 Alpine with pnpm
2. **Dependencies Stage**: Install all dependencies
3. **Builder Stage**: Build the Next.js application and generate Prisma client
4. **Production Dependencies Stage**: Install only production dependencies
5. **Runner Stage**: Minimal production image with only necessary files

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB RAM
- At least 10GB disk space

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

- `POSTGRES_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret
- `REDIS_PASSWORD`: Redis password
- `EMAIL_*`: SMTP configuration
- `NEXTAUTH_SECRET`: NextAuth secret

### 3. Deploy Application

```bash
# Make deployment script executable
chmod +x docker/deploy.sh

# Run deployment
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
```

### Production Environment

```bash
# Deploy production stack
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## 📊 Service Management

### Using the Deployment Script

```bash
# Full deployment
./docker/deploy.sh deploy

# Create backup only
./docker/deploy.sh backup

# Show status
./docker/deploy.sh status

# View logs
./docker/deploy.sh logs

# Stop services
./docker/deploy.sh stop

# Restart services
./docker/deploy.sh restart

# Cleanup old images
./docker/deploy.sh cleanup
```

### Manual Docker Commands

```bash
# Build application image
docker-compose build app

# Run database migrations
docker exec drmenu_app npx prisma migrate deploy

# Generate Prisma client
docker exec drmenu_app npx prisma generate

# Access application shell
docker exec -it drmenu_app sh

# View container logs
docker logs drmenu_app -f
```

## 🔧 Configuration

### Nginx Configuration

The production setup includes Nginx as a reverse proxy with:

- Gzip compression
- Rate limiting
- Static file caching
- SSL termination (configure SSL certificates)

### Database Configuration

PostgreSQL is configured with:

- Health checks
- Persistent volumes
- Automatic backups via deployment script

### Redis Configuration

Redis is configured for:

- Session storage
- Queue management
- Caching

## 📁 File Structure

```
drmenu/
├── Dockerfile                 # Multi-stage Docker build
├── .dockerignore             # Docker ignore file
├── docker-compose.prod.yml   # Production compose file
├── docker/
│   ├── compose.yml           # Development compose file
│   ├── nginx.conf            # Nginx configuration
│   └── deploy.sh             # Deployment script
├── env.example               # Environment template
└── DOCKER_DEPLOYMENT.md      # This file
```

## 🔍 Health Checks

The application includes health checks for:

- Application: `GET /api/health`
- Database: PostgreSQL connection test
- Redis: Ping test

## 📈 Monitoring

### Container Status

```bash
# View all containers
docker ps

# View resource usage
docker stats

# View container logs
docker logs <container_name> -f
```

### Application Health

```bash
# Check application health
curl http://localhost:3000/api/health

# Check database connection
docker exec drmenu_postgres pg_isready -U postgres

# Check Redis connection
docker exec drmenu_redis redis-cli ping
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Passwords**: Use strong, unique passwords
3. **JWT Secrets**: Generate cryptographically secure secrets
4. **Network Security**: Use Docker networks for service isolation
5. **SSL/TLS**: Configure SSL certificates for production
6. **Firewall**: Restrict access to necessary ports only

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**

   ```bash
   # Check port usage
   netstat -tulpn | grep :3000

   # Change ports in docker-compose.yml
   ```

2. **Database Connection Issues**

   ```bash
   # Check database logs
   docker logs drmenu_postgres

   # Test connection
   docker exec drmenu_postgres pg_isready -U postgres
   ```

3. **Memory Issues**

   ```bash
   # Check memory usage
   docker stats

   # Increase memory limits in docker-compose.yml
   ```

4. **Build Failures**

   ```bash
   # Clean build
   docker-compose build --no-cache app

   # Check build logs
   docker-compose build app
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
```

## 📦 Backup and Restore

### Automated Backups

The deployment script creates automatic backups including:

- Database dump
- Uploaded files
- Environment configuration

### Manual Backup

```bash
# Database backup
docker exec drmenu_postgres pg_dump -U postgres drmenu > backup.sql

# File backup
docker cp drmenu_app:/app/uploads ./backup-uploads/

# Restore database
docker exec -i drmenu_postgres psql -U postgres drmenu < backup.sql
```

## 🔄 Updates and Maintenance

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
./docker/deploy.sh deploy
```

### Database Migrations

```bash
# Run migrations
docker exec drmenu_app npx prisma migrate deploy

# Reset database (development only)
docker exec drmenu_app npx prisma migrate reset
```

### System Maintenance

```bash
# Clean up unused images
docker image prune -f

# Clean up unused volumes (be careful!)
docker volume prune -f

# System cleanup
docker system prune -f
```

## 📞 Support

For issues and questions:

1. Check the logs first
2. Review this documentation
3. Check the application logs
4. Verify environment configuration

## 🎯 Performance Optimization

### Production Optimizations

1. **Image Size**: Multi-stage build reduces final image size
2. **Caching**: Nginx caching for static assets
3. **Compression**: Gzip compression enabled
4. **Resource Limits**: CPU and memory limits configured
5. **Health Checks**: Automatic health monitoring

### Scaling Considerations

- Use Docker Swarm or Kubernetes for multi-instance deployment
- Implement load balancing
- Use external database and Redis for high availability
- Consider CDN for static assets
