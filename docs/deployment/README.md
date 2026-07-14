# Deployment Documentation

Comprehensive deployment guide for Stellar Viaduct covering all environments and deployment scenarios.

## Table of Contents

| Document | Description |
|----------|-------------|
| [Prerequisites](./prerequisites.md) | Required tools, accounts, and system requirements |
| [Environment Setup](./environment-setup.md) | Environment variables and configuration management |
| [Docker Deployment](./docker-deployment.md) | Docker and Docker Compose deployment guide |
| [Kubernetes Deployment](./kubernetes-deployment.md) | Kubernetes deployment with Helm charts and manifests |
| [Database Setup](./database-setup.md) | PostgreSQL + TimescaleDB setup and migrations |
| [SSL/TLS Setup](./ssl-tls-setup.md) | Certificate management and HTTPS configuration |
| [Load Balancer Configuration](./load-balancer.md) | Load balancer and reverse proxy setup |
| [Monitoring Setup](./monitoring-setup.md) | Prometheus, Grafana, and alerting configuration |
| [Backup Procedures](./backup-procedures.md) | Database and system backup strategies |
| [Troubleshooting](./troubleshooting.md) | Common issues, debugging steps, and runbooks |

## Quick Reference

### Development

```bash
# Start the full dev environment with hot reload
make dev

# Stop development services
make dev-down
```

### Production (Docker Compose)

```bash
# Build production images
make build

# Start production services
make up

# Run database migrations
make migrate

# Verify deployment
curl http://localhost:3001/health/detailed
```

### Production (Kubernetes)

```bash
# Apply namespace and secrets
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy all components
kubectl apply -f k8s/

# Verify pods are running
kubectl get pods -n stellar-viaduct
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Load Balancer                       │
│                  (Nginx / Cloud LB)                     │
│                   SSL Termination                       │
└──────────┬────────────────────┬─────────────────────────┘
           │                    │
     ┌─────▼──────┐     ┌──────▼──────┐
     │  Frontend   │     │   Backend   │
     │  (Nginx)    │     │  (Fastify)  │
     │  Port 80    │     │ Port 3001   │
     └─────────────┘     │ WS: 3002   │
                         └──────┬──────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
             ┌──────▼──┐  ┌────▼───┐  ┌────▼──────┐
             │PostgreSQL│  │ Redis  │  │  BullMQ   │
             │TimescaleDB│ │ Cache  │  │  Workers  │
             │Port 5432 │  │Port 6379│  └───────────┘
             └──────────┘  └────────┘
```

## Deployment Environments

| Environment | Purpose | Configuration |
|-------------|---------|---------------|
| Development | Local dev with hot reload | `docker-compose.dev.yml` |
| Staging | Pre-production testing | `docker-compose.yml` + staging `.env` |
| Production | Live system | `docker-compose.yml` or Kubernetes |
