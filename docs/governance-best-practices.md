# Stellar Viaduct Governance — Best Practices & Economic Model

## Overview

The `GovernanceContract` implements a decentralised, on-chain governance system for the Stellar Viaduct protocol. Token holders propose and vote on parameter changes, operator approvals, and emergency actions. Execution is enforced through a configurable timelock to protect the protocol against governance attacks.

---

## Contract Architecture

```
GovernanceContract
├── Voting power registry     (set_voting_power — token snapshot)
├── Delegation                (delegate_votes / undelegate_votes)
├── Proposal lifecycle        (create → activate → vote → finalize → queue → execute)
├── Guardian multisig         (guardian_approve / guardian_execute)
└── Config management         (update_config)
```

---

## Proposal Lifecycle

```
Pending ──(voting delay elapsed)──► Active
                                       │
                            (end_time passed)
                                       │
                               ┌───────┴───────┐
                            Passed           Failed
                               │
                           queue_proposal
                               │
                            Queued
                               │
                    (timelock_delay elapsed)
                               │
                            Executed
```

A Pending, Active, Passed, or Queued proposal can be **Cancelled** by the proposer or the admin at any time before execution.

Emergency proposals (`EmergencyPause`) can skip the normal vote → queue path via the guardian multisig.

---

## Voting Mechanics

### Token-weighted voting (default)

Each voter's effective votes equal their token balance snapshot:

```
effective_votes = voting_power
```

### Quadratic voting (opt-in)

When `use_quadratic = true`, effective votes are the integer square root of raw power, reducing the outsized influence of large holders:

```
effective_votes = floor(sqrt(voting_power))
```

Example: a holder with 10 000 tokens contributes 100 votes, while 100 holders each with 100 tokens contribute 10 votes each (1 000 total) — reversing dominance.

### Voting power snapshot

Voting power is registered by the admin at the start of each governance epoch, representing a snapshot of token balances. This prevents flash-loan attacks that would otherwise let an attacker borrow tokens, vote, and repay within a single transaction.

---

## Quorum & Pass Threshold

| Parameter | Default | Meaning |
|---|---|---|
| `quorum_bps` | 1 000 (10 %) | Minimum share of total supply that must participate (For + Against + Abstain) |
| `pass_threshold_bps` | 5 100 (51 %) | Minimum share of (For / (For + Against)) required to pass |

Both are expressed in basis points (1 bps = 0.01 %). Values up to 10 000 (100 %) are accepted.

### Design rationale

- **Quorum** prevents a small cabal from passing proposals when most holders are inactive.
- **Pass threshold** (>50 %) ensures majority support. For critical parameter changes, the admin may raise this to 66 % or 75 %.
- **Abstain** votes count towards quorum but not pass threshold, allowing holders to signal engagement without taking a side.

---

## Delegation

Any holder may delegate their entire voting power to another address. Key properties:

- A delegator's own power drops to zero while a delegation is active.
- The delegatee accumulates all received power on top of their own.
- Re-delegating to a new address atomically removes the old delegation.
- Self-delegation is prohibited.
- Undelegating restores the delegator's power immediately.

Delegation is useful for liquid democracy patterns: passive holders can delegate to active community members without transferring token ownership.

---

## Timelock

All non-emergency proposals must sit in the queue for `timelock_delay` seconds before execution. This gives the community time to:

1. Review the final calldata before it executes.
2. Exit the protocol if the change is unacceptable.
3. Organise a counter-proposal or cancel the proposal via admin intervention.

**Recommended minimum**: 48 hours (172 800 seconds) for mainnet parameter changes.

---

## Guardian Multisig

A set of trusted addresses (guardians) provides an emergency execution path for `EmergencyPause` proposals. This bypasses the normal voting and timelock flows when the protocol is under active attack.

- Each guardian calls `guardian_approve(proposal_id)` to signal approval.
- Once approvals reach `guardian_threshold`, any guardian may call `guardian_execute`.
- Non-emergency proposal types cannot be guardian-executed.

**Best practices**:
- Use a 3-of-5 or 4-of-7 threshold for production deployments.
- Guardian keys should be held by independent parties (core team, auditors, community multisig).
- Rotate guardians after every major incident.

---

## Deposit Requirement

Creating a proposal requires the proposer to hold at least `proposal_deposit` voting power. This is a spam-prevention mechanism.

- In the current implementation the deposit is a power check, not a token lock. A full production contract would transfer tokens into escrow on proposal creation and return them on execution or cancellation.
- Slashing the deposit on cancellation by a non-proposer is an optional extension to further deter spam.

---

## Security Considerations

| Risk | Mitigation |
|---|---|
| Flash-loan governance attack | Voting power is a pre-committed snapshot, not a live balance |
| Sybil attack via delegation | Quorum is measured against total supply, not voter count |
| Malicious proposal execution | Timelock gives the community time to react |
| Single-guardian compromise | Multi-signature threshold for emergency execution |
| Admin key compromise | Admin role should be held by a governance-controlled multisig |
| Proposal spam | Deposit requirement proportional to voting power |

---

## Recommended Parameter Profiles

### Testnet / Devnet

| Parameter | Value |
|---|---|
| `voting_delay` | 60 s |
| `voting_period` | 300 s |
| `timelock_delay` | 60 s |
| `quorum_bps` | 500 (5 %) |
| `pass_threshold_bps` | 5 100 (51 %) |
| `guardian_threshold` | 1 |

### Mainnet (conservative)

| Parameter | Value |
|---|---|
| `voting_delay` | 86 400 s (1 day) |
| `voting_period` | 604 800 s (7 days) |
| `timelock_delay` | 172 800 s (2 days) |
| `quorum_bps` | 1 000 (10 %) |
| `pass_threshold_bps` | 5 100 (51 %) |
| `guardian_threshold` | 3 |

---

## Integration with Other Contracts

After `execute_proposal` is called, the contract emits a `(gov, exec)` event containing the `proposal_id`. Off-chain listeners (or a future on-chain dispatcher) read the proposal's `target_contract` and `calldata` fields and relay the instruction to the target contract (e.g., fee distribution ratios, bridge operator registry).

For fully on-chain execution, extend `execute_proposal` to make a cross-contract call using the Soroban SDK's `invoke_contract` once the calldata encoding scheme is finalised.

---

## Test Coverage

The test suite covers 54 cases across:

- Initialisation and duplicate-initialisation guard
- Voting power management and total supply accounting
- Guardian add/remove (idempotency)
- Delegation, re-delegation, and undelegation
- Proposal creation (success, insufficient deposit)
- Proposal activation (timing guards)
- Voting: For / Against / Abstain, double-vote guard, zero-power guard, outside-window guard
- Quadratic voting and `isqrt` correctness
- Finalization: passed, failed-quorum, failed-threshold, too-early guard
- Queueing and timelock
- Execution: success, before-timelock guard, wrong-state guard
- Cancellation: by proposer, by admin, by stranger (unauthorised), on executed proposal
- Guardian approve/execute: success, insufficient approvals, non-emergency type, non-guardian caller, double-approve
- Config update: success, bad quorum, bad threshold
- Multiple proposals in sequence
