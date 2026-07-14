# Kubernetes Deployment Guide

This guide covers deploying Stellar Viaduct to a Kubernetes cluster with production-grade configuration.

## Prerequisites

- Kubernetes cluster (1.28+)
- `kubectl` configured with cluster access
- Container registry for images (Docker Hub, GHCR, ECR, etc.)
- `helm` (optional, for dependency charts)

## Namespace Setup

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: stellar-viaduct
  labels:
    app: stellar-viaduct
    environment: production
```

```bash
kubectl apply -f k8s/namespace.yaml
```

## Secrets and ConfigMaps

### Secrets

```bash
# Create secrets from command line
kubectl create secret generic stellar-viaduct-secrets \
  --namespace stellar-viaduct \
  --from-literal=postgres-host=stellar-viaduct-postgres.stellar-viaduct.svc.cluster.local \
  --from-literal=postgres-password=$(openssl rand -base64 32) \
  --from-literal=redis-password=$(openssl rand -base64 32) \
  --from-literal=circle-api-key=<your-circle-api-key>
```

```yaml
# k8s/secrets.yaml (base64-encoded values)
apiVersion: v1
kind: Secret
metadata:
  name: stellar-viaduct-secrets
  namespace: stellar-viaduct
type: Opaque
data:
  postgres-host: <base64-encoded>
  postgres-password: <base64-encoded>
  redis-password: <base64-encoded>
  circle-api-key: <base64-encoded>
```

### ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: stellar-viaduct-config
  namespace: stellar-viaduct
data:
  NODE_ENV: "production"
  PORT: "3001"
  WS_PORT: "3002"
  POSTGRES_PORT: "5432"
  POSTGRES_DB: "STELLAR_VIADUCT"
  POSTGRES_USER: "STELLAR_VIADUCT"
  REDIS_HOST: "stellar-viaduct-redis.stellar-viaduct.svc.cluster.local"
  REDIS_PORT: "6379"
  RATE_LIMIT_MAX: "200"
  HEALTH_CHECK_TIMEOUT_MS: "5000"
  HEALTH_CHECK_MEMORY_THRESHOLD: "85"
  LOG_LEVEL: "warn"
```

```bash
kubectl apply -f k8s/configmap.yaml
```

## Backend Deployment

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stellar-viaduct-backend
  namespace: stellar-viaduct
  labels:
    app: stellar-viaduct
    component: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: stellar-viaduct
      component: backend
  template:
    metadata:
      labels:
        app: stellar-viaduct
        component: backend
    spec:
      containers:
      - name: backend
        image: <your-registry>/stellar-viaduct-backend:latest
        ports:
        - containerPort: 3001
          name: http
        - containerPort: 3002
          name: websocket
        envFrom:
        - configMapRef:
            name: stellar-viaduct-config
        env:
        - name: POSTGRES_HOST
          valueFrom:
            secretKeyRef:
              name: stellar-viaduct-secrets
              key: postgres-host
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: stellar-viaduct-secrets
              key: postgres-password
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: stellar-viaduct-secrets
              key: redis-password

        livenessProbe:
          httpGet:
            path: /health/live
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3

        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3

        startupProbe:
          httpGet:
            path: /health/live
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 30  # Allow up to 150s for startup

        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: stellar-viaduct-backend
  namespace: stellar-viaduct
spec:
  selector:
    app: stellar-viaduct
    component: backend
  ports:
  - name: http
    port: 3001
    targetPort: 3001
  - name: websocket
    port: 3002
    targetPort: 3002
  type: ClusterIP
```

## Frontend Deployment

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stellar-viaduct-frontend
  namespace: stellar-viaduct
  labels:
    app: stellar-viaduct
    component: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: stellar-viaduct
      component: frontend
  template:
    metadata:
      labels:
        app: stellar-viaduct
        component: frontend
    spec:
      containers:
      - name: frontend
        image: <your-registry>/stellar-viaduct-frontend:latest
        ports:
        - containerPort: 80
          name: http

        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10

        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5

        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: stellar-viaduct-frontend
  namespace: stellar-viaduct
spec:
  selector:
    app: stellar-viaduct
    component: frontend
  ports:
  - name: http
    port: 80
    targetPort: 80
  type: ClusterIP
```

## PostgreSQL Deployment

For production, consider using a managed database service (AWS RDS, GCP Cloud SQL, Azure Database). For self-managed deployments:

```yaml
# k8s/postgres-deployment.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: stellar-viaduct-postgres
  namespace: stellar-viaduct
spec:
  serviceName: stellar-viaduct-postgres
  replicas: 1
  selector:
    matchLabels:
      app: stellar-viaduct
      component: postgres
  template:
    metadata:
      labels:
        app: stellar-viaduct
        component: postgres
    spec:
      containers:
      - name: postgres
        image: timescale/timescaledb:latest-pg15
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: "STELLAR_VIADUCT"
        - name: POSTGRES_USER
          value: "STELLAR_VIADUCT"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: stellar-viaduct-secrets
              key: postgres-password
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data

        livenessProbe:
          exec:
            command: ["pg_isready", "-U", "STELLAR_VIADUCT"]
          initialDelaySeconds: 30
          periodSeconds: 10

        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"

  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 50Gi
---
apiVersion: v1
kind: Service
metadata:
  name: stellar-viaduct-postgres
  namespace: stellar-viaduct
spec:
  selector:
    app: stellar-viaduct
    component: postgres
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
```

## Redis Deployment

```yaml
# k8s/redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stellar-viaduct-redis
  namespace: stellar-viaduct
spec:
  replicas: 1
  selector:
    matchLabels:
      app: stellar-viaduct
      component: redis
  template:
    metadata:
      labels:
        app: stellar-viaduct
        component: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        command: ["redis-server", "--requirepass", "$(REDIS_PASSWORD)"]
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: stellar-viaduct-secrets
              key: redis-password

        livenessProbe:
          exec:
            command: ["redis-cli", "ping"]
          initialDelaySeconds: 10
          periodSeconds: 10

        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: stellar-viaduct-redis
  namespace: stellar-viaduct
spec:
  selector:
    app: stellar-viaduct
    component: redis
  ports:
  - port: 6379
    targetPort: 6379
  type: ClusterIP
```

## Ingress Configuration

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: stellar-viaduct-ingress
  namespace: stellar-viaduct
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/websocket-services: "stellar-viaduct-backend"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - StellarViaduct.dev
    - api.StellarViaduct.dev
    secretName: stellar-viaduct-tls
  rules:
  - host: StellarViaduct.dev
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: stellar-viaduct-frontend
            port:
              number: 80
  - host: api.StellarViaduct.dev
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: stellar-viaduct-backend
            port:
              number: 3001
      - path: /api/v1/ws
        pathType: Prefix
        backend:
          service:
            name: stellar-viaduct-backend
            port:
              number: 3002
```

## Autoscaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: stellar-viaduct-backend-hpa
  namespace: stellar-viaduct
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: stellar-viaduct-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Pod Disruption Budget

```yaml
# k8s/pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: stellar-viaduct-pdb
  namespace: stellar-viaduct
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: stellar-viaduct
      component: backend
```

## Network Policies

```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: stellar-viaduct-backend-policy
  namespace: stellar-viaduct
spec:
  podSelector:
    matchLabels:
      app: stellar-viaduct
      component: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: stellar-viaduct
          component: frontend
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - port: 3001
    - port: 3002
  egress:
  - to:
    - podSelector:
        matchLabels:
          component: postgres
    ports:
    - port: 5432
  - to:
    - podSelector:
        matchLabels:
          component: redis
    ports:
    - port: 6379
  - to:  # Allow external API access
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
        - 10.0.0.0/8
        - 172.16.0.0/12
        - 192.168.0.0/16
    ports:
    - port: 443
```

## Monitoring with ServiceMonitor

```yaml
# k8s/service-monitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: stellar-viaduct-monitor
  namespace: stellar-viaduct
  labels:
    app: stellar-viaduct
spec:
  selector:
    matchLabels:
      app: stellar-viaduct
      component: backend
  endpoints:
  - port: http
    path: /health/metrics
    interval: 30s
    scrapeTimeout: 10s
```

## Deployment Steps

### 1. Build and Push Images

```bash
# Build images
docker compose build

# Tag images
docker tag stellar-viaduct-backend:latest <registry>/stellar-viaduct-backend:v1.0.0
docker tag stellar-viaduct-frontend:latest <registry>/stellar-viaduct-frontend:v1.0.0

# Push images
docker push <registry>/stellar-viaduct-backend:v1.0.0
docker push <registry>/stellar-viaduct-frontend:v1.0.0
```

### 2. Apply Kubernetes Resources

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets and config
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml

# Deploy data stores
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml

# Wait for data stores to be ready
kubectl wait --for=condition=ready pod -l component=postgres -n stellar-viaduct --timeout=120s
kubectl wait --for=condition=ready pod -l component=redis -n stellar-viaduct --timeout=60s

# Deploy application
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Run migrations (one-time)
kubectl exec -it deploy/stellar-viaduct-backend -n stellar-viaduct -- npm run migrate

# Apply ingress and policies
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/pdb.yaml
kubectl apply -f k8s/network-policy.yaml
```

### 3. Verify Deployment

```bash
# Check pod status
kubectl get pods -n stellar-viaduct

# Check services
kubectl get svc -n stellar-viaduct

# Check ingress
kubectl get ingress -n stellar-viaduct

# Test health endpoint
kubectl exec -it deploy/stellar-viaduct-backend -n stellar-viaduct -- \
  wget -qO- http://localhost:3001/health/detailed

# View logs
kubectl logs -l component=backend -n stellar-viaduct --tail=50
```

## Rolling Updates

```bash
# Update backend image
kubectl set image deployment/stellar-viaduct-backend \
  backend=<registry>/stellar-viaduct-backend:v1.1.0 \
  -n stellar-viaduct

# Monitor rollout
kubectl rollout status deployment/stellar-viaduct-backend -n stellar-viaduct

# Rollback if needed
kubectl rollout undo deployment/stellar-viaduct-backend -n stellar-viaduct
```
