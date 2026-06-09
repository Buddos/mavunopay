# MavunoPay Backend Development Guide

## Overview

MavunoPay backend provides a Node.js/Next.js REST API that interfaces with the Stellar blockchain for automatic harvest allocation and goal-based savings for smallholder farmers in Africa.

## Architecture

```
Frontend (React) ←→ Backend API (Next.js) ←→ Stellar Network
                                         ↓
                                   Soroban Contracts
                                   (Smart Allocation)
                                         ↓
                                   Supabase/Postgres
                                   (Persistent Storage)
                                         ↓
                                   Key Vault
                                   (Secure Secret Storage)
```

## Key Components

### 1. **Stellar SDK Integration** (`lib/stellar.ts`)

- **`generateKeypair()`**: Creates a new Ed25519 keypair for farmer
- **`fundAccountIfNeeded()`**: Funds account via Friendbot (testnet) or returns unfunded status (mainnet)
- **`createTrustline()`**: Creates USDC trustline for the farmer's account
- **`invokeSorobanAllocation()`**: Calls the Soroban allocation contract to apply allocation rules on-chain

### 2. **Key Vault Integration** (`lib/key-vault.ts`)

Replaces plaintext secret storage with secure provider backends:

**Supported Providers:**
- **aws**: AWS Secrets Manager
- **hashicorp**: HashiCorp Vault
- **local**: Environment-based (development only)

**Configuration (`.env`):**
```env
KEY_VAULT_PROVIDER=local  # or "aws" or "hashicorp"
KEY_VAULT_ENDPOINT=https://vault.example.com
KEY_VAULT_TOKEN=your-api-token
```

**Usage Flow:**
1. When farmer registers, secret is generated and immediately stored in vault
2. Secret is **NEVER** transmitted to frontend or stored in plaintext DB
3. API endpoints retrieve secrets from vault when needed for signing
4. Signatures are created in-memory and never exposed

### 3. **Soroban Contract** (`soroban/src/lib.rs`)

Smart contract deployed to Stellar testnet for on-chain allocation validation:

**Functions:**
- `set_allocation_rules(farmer, rules)` - Register allocation percentages (must sum to 100%)
- `get_allocation_rules(farmer)` - Retrieve farmer's allocation rules
- `allocate_payment(farmer, amount)` - Apply allocation rules to incoming harvest payment
- `get_allocation_history(farmer)` - Get all past allocations

**Example Usage:**
```rust
// Set rules for farmer
rules = [
  AllocationRule { key: "inputs", pct: 20 },
  AllocationRule { key: "emergency", pct: 10 },
  AllocationRule { key: "education", pct: 10 },
  AllocationRule { key: "disposable", pct: 60 },
]
contract.set_allocation_rules(farmer, rules);

// Allocate incoming 1000 USDC payment
result = contract.allocate_payment(farmer, 1000);
// Returns: { inputs: 200, emergency: 100, education: 100, disposable: 600 }
```

### 4. **API Endpoints**

#### **POST /api/register**
Register a new farmer and generate Stellar keypair

**Request:**
```json
{ "phone": "+254712345678", "name": "John Farmer" }
```

**Response:**
```json
{
  "farmer": {
    "id": "uuid",
    "phone": "+254712345678",
    "name": "John Farmer",
    "stellarPublicKey": "GBUQWP3BOUZX34ULNQG23RQ6F4BVWBRZ4Z5QJSTEVVU5KS7LZLFORMS",
    "allocationRules": [...]
  },
  "funded": { "funded": true, "publicKey": "..." }
}
```

**Security:** Stellar secret is stored in vault, NOT returned or stored in DB

#### **POST /api/webhook**
Simulate incoming harvest payment and allocate to goals

**Request:**
```json
{
  "publicKey": "GBUQWP3BOUZX34ULNQG23RQ6F4BVWBRZ4Z5QJSTEVVU5KS7LZLFORMS",
  "amount": 1000,
  "memo": "harvest-q1-2024",
  "contractId": "CAAAA..." // optional Soroban contract ID
}
```

**Response:**
```json
{
  "status": "allocated",
  "allocations": [
    { "key": "inputs", "pct": 20, "amount": 200 },
    { "key": "emergency", "pct": 10, "amount": 100 },
    ...
  ],
  "contractInvoked": true,
  "txHash": "transaction-hash-here"
}
```

## Deployment Steps

### 1. Build Soroban Contract

```bash
cd backend/soroban
cargo build --release
```

Output: `target/wasm32-unknown-unknown/release/mavunopay_allocation_contract.wasm`

### 2. Deploy to Stellar Testnet

Install `soroban-cli`:
```bash
cargo install soroban-cli
```

Deploy:
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/mavunopay_allocation_contract.wasm \
  --network testnet \
  --source my-ops-account
```

This returns `CONTRACT_ID`. Copy to `.env`:
```env
SOROBAN_CONTRACT_ID=CAAAA...
```

### 3. Configure Key Vault (Production)

**Option A: AWS Secrets Manager**
```bash
# Install AWS CLI
aws secretsmanager create-secret \
  --name mavunopay/farmer/farmer-uuid \
  --secret-string '{"secret":"S...", "publicKey":"G..."}'
```

Update `.env`:
```env
KEY_VAULT_PROVIDER=aws
KEY_VAULT_TOKEN=<aws-access-key>
KEY_VAULT_ENDPOINT=https://secretsmanager.us-east-1.amazonaws.com
AWS_REGION=us-east-1
```

**Option B: HashiCorp Vault**
```bash
vault kv put secret/mavunopay/farmer/farmer-uuid \
  secret="S..." \
  publicKey="G..."
```

Update `.env`:
```env
KEY_VAULT_PROVIDER=hashicorp
KEY_VAULT_ENDPOINT=https://vault.example.com
KEY_VAULT_TOKEN=<vault-token>
```

### 4. Set Up Supabase (Production)

Run schema migration:
```bash
psql -h db.supabase.co -U postgres < db/schema.sql
```

Update `.env`:
```env
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
```

## Development Setup

```bash
cd backend

# Install dependencies
npm install

# Copy .env.example to .env
cp .env.example .env

# Start development server
npm run dev
# Runs on http://localhost:3001
```

## Testing

### Test Stellar SDK Integration
```bash
npm test -- stellar.test.ts
```

### Test Soroban Contract
```bash
cd soroban
cargo test
```

### Manual API Testing

```bash
# Register farmer
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"+254712345678","name":"John"}'

# Simulate harvest payment
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey":"GBUQWP3BOUZX34ULNQG23RQ6F4BVWBRZ4Z5QJSTEVVU5KS7LZLFORMS",
    "amount":1000,
    "contractId":"CAAAA..."
  }'
```

## Security Best Practices

✅ **Implemented:**
- Stellar secrets stored in vault, never in plaintext DB
- Contract invocation requires farmer authentication
- Allocation rules validation (must sum to 100%)
- Vault abstractions support AWS Secrets Manager, Vault, and HSM

⚠️ **Recommended for Production:**
- Enable TLS/HTTPS for all API endpoints
- Implement rate limiting and DDoS protection
- Use environment-specific API keys with expiration
- Enable audit logging for all vault access
- Use AWS IAM roles instead of static access keys
- Implement transaction signing with Hardware Security Module (HSM)
- Regular security audits and penetration testing
- Implement CORS policies properly
- Use encrypted database connections

## Monitoring & Debugging

**Enable Verbose Logging:**
```env
DEBUG=mavunopay:*
LOG_LEVEL=debug
```

**Check Contract Status:**
```bash
soroban contract read --id CAAAA... --network testnet
```

**View Transaction Details:**
```bash
# Get latest transactions from Stellar Testnet
curl https://horizon-testnet.stellar.org/transactions?limit=10
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Contract deploy fails | Ensure `soroban-cli` is latest version, ops account has funds |
| Vault access denied | Check `KEY_VAULT_TOKEN` and permissions |
| Allocation mismatch | Verify rules sum to 100% via contract `get_allocation_rules()` |
| Slow testnet | Use public network for production, implement caching |

## Next Steps

1. ✅ Key vault integration (AWS/Hashicorp/HSM)
2. ✅ Soroban contract deployment
3. ⏳ Supabase migration (replace file-based DB)
4. ⏳ Frontend integration with real API
5. ⏳ Production deployment checklist
6. ⏳ Mobile app for farmers
