# Stellar Viaduct — Kubernetes Deployment

This directory contains all Kubernetes manifests for deploying Stellar Viaduct to a production cluster.

## Directory layout

```
k8s/
├── namespace.yaml          # stellar-viaduct namespace
├── rbac.yaml               # ServiceAccount, Role, RoleBinding
├── configmap.yaml          # Non-secret environment config
├── secret.yaml             # Secret template (populate before applying)
├── ingress.yaml            # Nginx Ingress with TLS
├── network-policy.yaml     # Pod-level network isolation
├── pdb.yaml                # PodDisruptionBudgets
├── backend/
│   ├── deployment.yaml     # Backend Fastify API
│   ├── service.yaml        # ClusterIP service
│   └── hpa.yaml            # HorizontalPodAutoscaler (2–8 replicas)
├── frontend/
│   ├── deployment.yaml     # React frontend
│   └── service.yaml        # ClusterIP service
├── postgres/
│   ├── pvc.yaml            # 20Gi PersistentVolumeClaim
│   └── deployment.yaml     # TimescaleDB (postgres:15)
└── redis/
    ├── pvc.yaml            # 5Gi PersistentVolumeClaim
    └── deployment.yaml     # Redis 7 with persistence
```

## Prerequisites

- Kubernetes 1.25+
- `kubectl` configured against your cluster
- Nginx Ingress Controller installed
- `cert-manager` installed (for TLS — optional, remove cert-manager annotation if not used)

## Quick start

### 1. Populate secrets

Copy `secret.yaml`, fill in base64-encoded values, and keep it out of version control:

```bash
cp k8s/secret.yaml k8s/secret.local.yaml
# Edit k8s/secret.local.yaml with real values
echo "k8s/secret.local.yaml" >> .gitignore
```

Encode a value:
```bash
echo -n "my-password" | base64
```

### 2. Update placeholder values

In `ingress.yaml` and `frontend/deployment.yaml`, replace `stellar-viaduct.example.com` with your actual domain.

Update the container image tags in `backend/deployment.yaml` and `frontend/deployment.yaml` to the version you want to deploy.

### 3. Apply manifests

```bash
# Namespace first
kubectl apply -f k8s/namespace.yaml

# Infrastructure
kubectl apply -f k8s/rbac.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.local.yaml   # your local copy with real secrets

# Storage
kubectl apply -f k8s/postgres/pvc.yaml
kubectl apply -f k8s/redis/pvc.yaml

# Datastores
kubectl apply -f k8s/postgres/deployment.yaml
kubectl apply -f k8s/redis/deployment.yaml

# Wait for datastores to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n stellar-viaduct --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis   -n stellar-viaduct --timeout=60s

# Application
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml
kubectl apply -f k8s/backend/hpa.yaml
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml

# Networking
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/network-policy.yaml
kubectl apply -f k8s/pdb.yaml
```

Or apply the whole directory at once (after secrets are ready):
```bash
kubectl apply -f k8s/
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/redis/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
```

### 4. Run database migrations

```bash
kubectl exec -n stellar-viaduct deploy/stellar-viaduct-backend -- npm run migrate
```

### 5. Verify deployment

```bash
kubectl get pods -n stellar-viaduct
kubectl get ingress -n stellar-viaduct
kubectl logs -n stellar-viaduct deploy/stellar-viaduct-backend --tail=50
```

## Health endpoints

| Path | Purpose |
|------|---------|
| `/health/live` | Liveness probe — process is running |
| `/health/ready` | Readiness probe — DB and Redis connected |
| `/metrics` | Prometheus metrics |

## Scaling

Backend scales automatically between 2–8 replicas via HPA based on CPU (70%) and memory (80%) utilisation. To scale manually:

```bash
kubectl scale deployment stellar-viaduct-backend -n stellar-viaduct --replicas=4
```

## Updating images

```bash
kubectl set image deployment/stellar-viaduct-backend \
  backend=ghcr.io/stellar_viaduct/stellar-viaduct-backend:<new-tag> \
  -n stellar-viaduct

kubectl set image deployment/stellar-viaduct-frontend \
  frontend=ghcr.io/stellar_viaduct/stellar-viaduct-frontend:<new-tag> \
  -n stellar-viaduct
```
