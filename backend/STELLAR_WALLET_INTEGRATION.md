# Stellar Wallet Integration

This backend module implements secure wallet management for MavunoPay using Stellar.

## Goals
- generate a unique Stellar keypair for each farmer
- store the private key in a vault-backed secret store
- fund new wallets on testnet via Friendbot
- fund new wallets on public Stellar using an operational account
- create USDC trustlines for farmer wallets
- create dedicated goal sub-accounts with lockup/claimable balance enforcement
- configure cooperative multisig for group-controlled accounts

## Environment Variables
- `STELLAR_NETWORK` - `TESTNET` or `PUBLIC`
- `OPERATIONAL_ACCOUNT_SECRET` - secret key used by the backend to fund new public Stellar accounts
- `KEY_VAULT_PROVIDER` - `local`, `aws`, or `hashicorp`
- `KEY_VAULT_ENDPOINT` - vault endpoint URL
- `KEY_VAULT_TOKEN` - vault auth token
- `AWS_REGION` - AWS region when using AWS Secrets Manager
- `USDC_CODE` - asset code for USDC trustline creation
- `USDC_ISSUER` - Stellar issuer public key for USDC
- `MINIMUM_BALANCE_THRESHOLD_XLM` - numeric threshold for low balance monitoring

## Implementation Details
### Wallet creation
- `generateKeypair()` generates a new Stellar keypair
- `fundAccountIfNeeded()` stores the secret and creates the account
  - on `TESTNET`: uses Friendbot
  - on `PUBLIC`: uses `OPERATIONAL_ACCOUNT_SECRET` to create the account

### Trustline setup
- `createTrustline()` builds and submits a Stellar transaction to add the USDC trustline

### Goal account support
- `createGoalSubAccount()` creates a sponsored sub-account for a savings goal
- also creates a claimable balance that remains locked until the goal unlock time
- the new goal account key is stored in the vault under `farmerId-goal-goalId`

### Cooperative multisig
- `configureCooperativeMultisig()` configures a 2-of-3 cooperative signer policy
- requires the cooperative account secret and the member signer public keys

### Balance monitoring
- `monitorMinimumBalance()` checks native XLM balance against a configured threshold
- low-balance conditions are returned in the registration response and logged

## Notes
- `backend/pages/api/register.ts` now returns `balanceStatus` after funding and trustline creation.
- Local key storage is only intended for development. Production deployments should use a managed vault.
