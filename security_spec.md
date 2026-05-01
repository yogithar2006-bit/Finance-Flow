# Security Specification for FinanceFlow

## Data Invariants
1. All records must have a `user_id` matching the authenticated user's UID.
2. Transactions must have a valid `type` ('income' or 'expense').
3. Amounts must be positive.
4. Timestamps must be handled on the server if possible, but here we use strings for dates. We will validate format.

## Dirty Dozen Payloads
1. Create transaction for another user.
2. Update `user_id` to steal ownership.
3. Negative amount transaction.
4. Invalid transaction `type`.
5. Large junk string as `note` (1MB).
6. Create budget for another user.
7. Massive document ID (1.5KB).
8. etc...

## Rules Strategy
- default deny.
- helper functions for auth and ownership.
- strict schema validation for writes.
