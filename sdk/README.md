# Stellar Viaduct Contract Integration SDK

TypeScript SDK for integrating external apps with Stellar Viaduct Soroban contracts.

## Features

- Contract method wrappers
- Connection management
- Transaction build/simulate/send flow
- Query helpers
- Event subscription polling
- Strong TypeScript type definitions
- Structured SDK errors
- Testing utilities
- NPM publication-ready package metadata

## Install

```bash
npm install @stellar-viaduct/contract-sdk
```

## Quick start

```ts
import { Networks, xdr } from "@stellar/stellar-sdk";
import { StellarViaductContractSdk } from "@stellar-viaduct/contract-sdk";

const sdk = new StellarViaductContractSdk({
  rpcUrl: "https://soroban-testnet.stellar.org",
  contractId: "CCONTRACTID",
  networkPassphrase: Networks.TESTNET,
});

await sdk.connect();

const result = await sdk.queryMethod({
  method: "get_health",
  args: [xdr.ScVal.scvString("USDC")],
});
```

## API surface

- `StellarViaductContractSdk`
  - `connect()`
  - `disconnect()`
  - `getHealth()`
  - `buildInvokeTransaction()`
  - `simulateTransaction()`
  - `sendTransaction()`
  - `invokeAndSend()`
  - `queryMethod()`
  - `subscribeToEvents()`

## Errors

- `StellarViaductSdkError`
- `StellarViaductConnectionError`
- `StellarViaductTransactionError`
- `StellarViaductQueryError`

## Testing utilities

- `createMockScValString()`
- `createMockScValU64()`
- `createMockEvent()`
- `createMockWatchSubscription()`

## Example

See `sdk/examples/basic-usage.ts`.
