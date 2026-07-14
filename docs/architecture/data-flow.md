# Data Flow

Data flow diagrams describing how data moves through Stellar Viaduct, from external sources to the user interface.

## Primary Data Flows

### 1. Price Data Collection

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  External Sources │     │  Price Workers   │     │    Data Store    │
│                   │     │                   │     │                  │
│ Stellar DEX ─────►│────►│ priceAggregator  │────►│ prices           │
│ Circle API  ─────►│     │   .worker.ts     │     │ (hypertable)     │
│ Coinbase    ─────►│     │                   │     │                  │
│ Exchanges   ─────►│     │ priceCollection  │     │ Redis cache      │
│                   │     │   .job.ts         │     │ (30s TTL)        │
└──────────────────┘     └────────┬──────────┘     └──────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  WebSocket Push  │
                         │  Price updates   │
                         │  to all clients  │
                         └──────────────────┘
```

**Flow:**
1. `priceAggregator.worker.ts` polls external sources (Stellar DEX, Circle, Coinbase)
2. Prices are normalized and aggregated into a weighted average
3. Results are stored in the `prices` hypertable and Redis cache (30s TTL)
4. Price deviation checks trigger `DeviationAlert` events if thresholds are exceeded
5. Connected WebSocket clients receive real-time price update events

### 2. Health Score Calculation

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Input Data      │     │  Health Worker   │     │    Output        │
│                   │     │                   │     │                  │
│ Liquidity data ──►│────►│ healthCalculation│────►│ health_scores    │
│ Price data    ───►│     │   .job.ts        │     │ (hypertable)     │
│ Bridge status ───►│     │                   │     │                  │
│ Reserve data  ───►│     │ Weights:         │     │ WebSocket push   │
│ Volume data   ───►│     │  Liq: 25%        │     │ Alert evaluation │
│                   │     │  Price: 25%       │     │                  │
│                   │     │  Bridge: 20%      │     │                  │
│                   │     │  Reserve: 20%     │     │                  │
│                   │     │  Volume: 10%      │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

**Flow:**
1. `healthCalculation.job.ts` runs periodically for each monitored asset
2. Gathers latest liquidity, price, bridge, reserve, and volume data
3. Computes composite health score (0–100) using weighted factors
4. Stores the score in the `health_scores` hypertable
5. Triggers alert evaluation if score crosses configured thresholds

### 3. Bridge Monitoring

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Blockchain Data │     │  Bridge Workers  │     │    Actions       │
│                   │     │                   │     │                  │
│ Stellar Horizon ─►│────►│ bridgeMonitor    │────►│ Bridge status    │
│ Soroban RPC    ──►│     │   .worker.ts     │     │ update           │
│ Ethereum RPC   ──►│     │                   │     │                  │
│                   │     │ reserveVerify    │────►│ Circuit breaker  │
│                   │     │   .worker.ts     │     │ trigger          │
│                   │     │                   │     │                  │
│                   │     │ verification     │────►│ Alert event      │
│                   │     │   .job.ts        │     │ creation         │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

**Flow:**
1. `bridgeMonitor.worker.ts` polls Stellar Horizon and Ethereum RPC for bridge activity
2. Tracks mint/burn events, supply changes, and operator status
3. `reserveVerification.worker.ts` verifies reserves against circulating supply
4. If reserves are insufficient, the circuit breaker may trigger a pause
5. Alert events are created for significant bridge status changes

### 4. Alert Pipeline

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Trigger Sources │     │  Alert Engine    │     │    Delivery      │
│                   │     │                   │     │                  │
│ Health score   ──►│────►│ alertEvaluation  │────►│ WebSocket push   │
│ Price deviation ─►│     │   .worker.ts     │     │ (real-time)      │
│ Bridge event   ──►│     │                   │     │                  │
│ Reserve issue  ──►│     │ Evaluates rules  │────►│ alert_events     │
│ Circuit breaker ─►│     │ from alert_rules │     │ (hypertable)     │
│                   │     │ table            │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

**Flow:**
1. Events from health scoring, price monitoring, and bridge workers trigger alert evaluation
2. `alertEvaluation.worker.ts` loads user-defined rules from `alert_rules` table
3. Rules are evaluated against current data (threshold checks)
4. Matching alerts are stored in `alert_events` hypertable
5. Connected clients receive alert notifications via WebSocket

### 5. API Request Flow

```
Client Request
      │
      ▼
┌─────────────┐
│  Nginx      │ (Frontend container — production only)
│  /api/* ────┼──► proxy to backend:3001
└─────────────┘
      │
      ▼
┌─────────────────────────────────────────────────┐
│  Backend Middleware Chain                         │
│                                                   │
│  Request → Tracing → Rate Limit → Auth → Validation → Route Handler
│                                                   │
│  Route Handler → Service Layer → Data Access      │
│                                                   │
│  Response ← Serialization ← Service Result        │
└─────────────────────────────────────────────────┘
```

**Middleware execution order:**
1. **Request tracing** — Assigns `X-Request-Id` correlation ID
2. **Rate limiting** — Sliding-window check per IP/API key
3. **Authentication** — API key validation (for protected endpoints)
4. **Validation** — Request schema validation
5. **Route handler** — Calls service layer
6. **Response** — JSON serialization with Fastify's fast serializer

## Data Lifecycle

```
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│   Collection   │───►│   Processing   │───►│    Storage     │
│                │    │                │    │                │
│ External APIs  │    │ Normalization  │    │ PostgreSQL     │
│ Blockchain     │    │ Aggregation    │    │ (hypertables)  │
│ Smart contracts│    │ Scoring        │    │                │
└────────────────┘    └────────────────┘    └───────┬────────┘
                                                    │
                                           ┌────────▼────────┐
                                           │    Caching      │
                                           │                 │
                                           │ Redis (30s TTL) │
                                           └────────┬────────┘
                                                    │
                    ┌───────────────────────────────┼─────────────────┐
                    │                               │                 │
           ┌────────▼────────┐             ┌────────▼────────┐       │
           │    REST API     │             │   WebSocket     │       │
           │  (on-demand)    │             │  (real-time)    │       │
           └────────┬────────┘             └────────┬────────┘       │
                    │                               │                │
                    ▼                               ▼                │
              ┌──────────┐                   ┌──────────┐    ┌───────▼──────┐
              │ Frontend │                   │ Frontend │    │  Retention   │
              │ (query)  │                   │ (push)   │    │  90-day auto │
              └──────────┘                   └──────────┘    │  cleanup     │
                                                             └──────────────┘
```

**Data retention:**
- Time-series data (prices, health scores, liquidity, alerts, verification results) is automatically pruned after 90 days by TimescaleDB retention policies
- Configuration data (assets, bridges, rules) is retained indefinitely
- Redis cache entries expire based on configured TTL (default: 30 seconds for prices)

## Real-Time Update Flow

```
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│   Worker    │  publish  │    Redis    │ subscribe │  WebSocket  │
│ (new data)  │─────────►│   Pub/Sub   │──────────►│   Server    │
│             │          │             │          │  :3002      │
└─────────────┘          └─────────────┘          └──────┬──────┘
                                                         │ push
                                                         ▼
                                                  ┌─────────────┐
                                                  │  Connected  │
                                                  │  Clients    │
                                                  └─────────────┘
```

Workers publish events to Redis Pub/Sub channels when new data is processed. The WebSocket server subscribes to these channels and broadcasts updates to connected clients in real-time.
