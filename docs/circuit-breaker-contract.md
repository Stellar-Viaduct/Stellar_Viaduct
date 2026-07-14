# Circuit Breaker Contract

The Circuit Breaker is a critical safety mechanism for stellar-viaduct that provides emergency pause capabilities across the protocol. It automatically halts operations when anomalies are detected, with governance-controlled recovery procedures.

## Overview

The Circuit Breaker implements multi-level pause mechanisms:

- **Global Pause**: Affects all protocol operations
- **Bridge-Level Pause**: Pauses specific bridge operations
- **Asset-Level Pause**: Pauses operations for specific assets
- **Graduated Levels**: Warning (notifications), Partial (reduced limits), Full (complete halt)

## Architecture

### Smart Contract (`circuit_breaker.rs`)

The core contract provides:

- **Pause Operations**: Manual and automatic triggering
- **Guardian System**: Multi-signature emergency controls
- **Recovery Mechanisms**: Time-delayed unpause with governance approval
- **Whitelist System**: Emergency operations during pauses
- **Event Emissions**: Comprehensive logging for all actions

### Backend Integration

- **Circuit Breaker Service**: TypeScript service for contract interaction
- **Worker**: Automatic trigger processing from alerts
- **API Routes**: Status queries and management endpoints
- **Database**: Audit trail and configuration storage

## Key Features

### 1. Automated Anomaly Detection

Triggers pauses based on configurable conditions:

- Health score drops below threshold
- Price deviation exceeds limits
- Supply mismatch detected
- Bridge downtime alerts
- Volume anomalies
- Reserve ratio breaches

### 2. Guardian Role System

Three guardian roles with different permissions:

- **Standard Guardian**: Can approve standard pauses
- **Emergency Guardian**: Can trigger emergency pauses
- **Admin Guardian**: Can manage guardians and configuration

### 3. Time-Delayed Recovery

- Configurable recovery delays per pause level
- Guardian approval required for early recovery
- Automatic unpause after delay expiration

### 4. Whitelist Mechanisms

- **Address Whitelist**: Authorized addresses bypass restrictions
- **Asset/Bridge Whitelist**: Immune assets/bridges from automatic pauses
- **Emergency Operations**: Critical functions remain operational

## Configuration

### Environment Variables

```bash
CIRCUIT_BREAKER_CONTRACT_ID=<soroban_contract_id>
```

### Trigger Configuration

Set trigger conditions via contract calls:

```typescript
await circuitBreaker.setTriggerConfig(
  AlertType.HealthScore,
  50, // threshold
  PauseLevel.Partial,
  300 // cooldown (seconds)
);
```

### Guardian Setup

```typescript
await circuitBreaker.addGuardian(admin, guardianAddress, GuardianRole.EmergencyGuardian);
```

## API Endpoints

### Check Pause Status

```http
GET /api/v1/circuit-breaker/status?scope=bridge&identifier=test-bridge
```

Response:
```json
{
  "paused": true,
  "scope": "bridge",
  "identifier": "test-bridge"
}
```

### Check Whitelist

```http
GET /api/v1/circuit-breaker/whitelist?type=address&address=GC...
```

### Trigger Pause (Guardian Only)

```http
POST /api/v1/circuit-breaker/pause
Content-Type: application/json

{
  "scope": "global",
  "reason": "Emergency: critical vulnerability detected"
}
```

## Integration Points

### Alert System

Circuit breaker automatically triggers on alert events:

```typescript
// In alert.service.ts
await this.triggerCircuitBreaker(event, rule);
```

### Reserve Verification

Checks pause status before committing reserves:

```typescript
const isPaused = await circuitBreaker.isPaused(PauseScope.Bridge, bridgeId);
if (isPaused) {
  throw new Error(`Bridge ${bridgeId} is paused`);
}
```

### Frontend Dashboard

Real-time pause status display and recovery progress.

## Security Considerations

### Access Control

- Multi-signature requirements for critical operations
- Role-based permissions with clear separation
- Guardian key rotation and backup procedures

### Audit Trail

- All pause/unpause actions logged on-chain
- Database audit trail for off-chain events
- Event emissions for monitoring and alerting

### Emergency Procedures

- Designated emergency guardians for rapid response
- Clear escalation procedures
- Post-incident review and improvement processes

## Testing

### Unit Tests

```bash
cd contracts/soroban
cargo test circuit_breaker
```

### Integration Tests

```bash
cd backend
npm test -- circuitBreaker
```

### Coverage Requirements

- 95%+ code coverage for all circuit breaker components
- Security-focused test scenarios
- Edge case and failure mode testing

## Deployment

### Contract Deployment

```bash
# Deploy to testnet
stellar contract deploy \
  --wasm contracts/soroban/target/wasm32-unknown-unknown/release/STELLAR_VIADUCT_contracts.wasm \
  --source <deployer_secret> \
  --network testnet
```

### Backend Configuration

1. Set `CIRCUIT_BREAKER_CONTRACT_ID` in environment
2. Run database migrations
3. Configure guardians and triggers
4. Start workers

### Monitoring

- Circuit breaker status monitoring
- Alert trigger effectiveness
- Recovery time metrics
- False positive analysis

## Recovery Procedures

### Automatic Recovery

1. Wait for recovery delay to expire
2. System automatically unpauses
3. Event emission for monitoring

### Manual Recovery

1. Guardian requests early recovery
2. Other guardians approve
3. Execute recovery transaction
4. Monitor system stability

### Emergency Recovery

1. Admin guardian forces recovery
2. Immediate unpause execution
3. Post-recovery audit required

## Future Enhancements

- **Decentralized Guardians**: Community-elected guardians
- **Insurance Integration**: Automatic payout triggers
- **Cross-Chain Coordination**: Multi-chain pause synchronization
- **AI Anomaly Detection**: Machine learning-based triggers
- **Governance Proposals**: On-chain parameter updates
