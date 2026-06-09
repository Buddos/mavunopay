# MavunoPay Integration Guide

## Frontend-Backend-Blockchain Architecture

This guide walks through the complete integration of the MavunoPay system, from farmer registration through harvest payment allocation with Soroban contract verification.

## Data Flow

```
1. FARMER REGISTRATION
   Frontend (RegisterWidget)
   ↓
   POST /api/register (phone, name)
   ↓
   Backend generateKeypair() → Stellar SDK
   ↓
   fundAccountIfNeeded() → Key Vault (store secret) + Friendbot (fund testnet)
   ↓
   Response: { farmer: {..., stellarPublicKey}, funded: true }
   ↓
   Frontend localStorage("mavunopay_farmer", {id, phone, name, stellarPublicKey})

2. FARMER SETS ALLOCATION RULES
   Frontend: user inputs "20% seeds, 10% emergency, 10% education, 60% savings"
   ↓
   (Direct: stored in DB as allocationRules array)
   ↓
   Optional: POST /api/soroban/set-rules {farmerId, rules} → Soroban Contract
   ↓
   Contract stores rules in persistent storage, validates sum == 100%

3. HARVEST PAYMENT RECEIVED (WEBHOOK)
   Farmer's account receives USDC payment from Stellar payment processor
   ↓
   External system: POST /api/webhook {publicKey, amount, memo, contractId}
   ↓
   Backend loads farmer + allocation rules from DB
   ↓
   Calculate allocations: { inputs: 200, emergency: 100, education: 100, disposable: 600 }
   ↓
   If contractId provided:
      invokeSorobanAllocation(farmerId, publicKey, amount, contractId)
      ↓ Secret retrieved from Key Vault
      ↓ Transaction signed in-memory, never exposed
      ↓ Soroban contract executes: allocate_payment(farmer_address, amount)
      ↓ Contract returns transaction hash
   ↓
   Update goal balances in DB
   ↓
   Response: { status: "allocated", allocations, contractInvoked, txHash }

4. FARMER VIEWS DASHBOARD
   Frontend fetches /api/goals?farmerId=
   ↓
   Display updated goal balances + allocation history
   ↓
   Optional: Query Supabase v_farmer_savings view for verified state
```

## Step 1: Farmer Registration

**Frontend Component** (`src/components/RegisterWidget.tsx`)
```typescript
const handleRegister = async (phone: string, name: string) => {
  const response = await fetch('http://localhost:3001/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, name }),
  });
  const { farmer, funded } = await response.json();
  
  // Store farmer in localStorage (public key only, NO secret)
  localStorage.setItem('mavunopay_farmer', JSON.stringify({
    id: farmer.id,
    phone: farmer.phone,
    name: farmer.name,
    stellarPublicKey: farmer.stellarPublicKey,
  }));
};
```

**Backend Endpoint** (`backend/pages/api/register.ts`)
```typescript
// 1. Generate keypair
const keys = generateKeypair(); // Returns {publicKey, secret}

// 2. Create farmer record (without secret)
const farmer = {
  id: farmerId,
  phone, name,
  stellarPublicKey: keys.publicKey,
  // NO stellarSecret here!
  allocationRules: [...]
};

// 3. Store secret in vault (never in DB)
await fundAccountIfNeeded(keys.publicKey, farmerId, keys.secret);

// 4. Return farmer (sans secret)
res.json({ farmer, funded });
```

**Key Vault** (`backend/lib/key-vault.ts`)
```typescript
// storeSecret("farmer-123", "SECRET_KEY...", "GBUQWP...")
// ↓
// If AWS:   PUT to AWS Secrets Manager "mavunopay/farmer/farmer-123"
// If Vault: PUT to Vault "secret/data/mavunopay/farmer/farmer-123"
// If Local: Set env var STELLAR_SECRET_farmer-123
```

## Step 2: Contract Configuration (Optional)

Deploy Soroban contract once and configure via environment:

```bash
# 1. Build & test locally
cd backend/soroban
cargo test

# 2. Build release
cargo build --release --target wasm32-unknown-unknown

# 3. Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/mavunopay_allocation_contract.wasm \
  --source YOUR_PUBLIC_KEY \
  --network testnet

# 4. Record CONTRACT_ID in .env
echo "SOROBAN_CONTRACT_ID=CAAAA..." >> backend/.env
```

**Allocation Rules Set by User** (stored in Postgres)
```
Farmer UI → Input: "20% Seeds, 10% Emergency, 10% School, 60% Food"
↓
DB: INSERT INTO allocation_rules (farmer_id, ...) 
    VALUES (farmer-123, {'key': 'seeds', 'pct': 20}, ...)

Frontend localStorage: { allocationRules: [...] } // for display
```

## Step 3: Harvest Payment Webhook

**External system sends payment notification** (e.g., M-Pesa integration):

```bash
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "GBUQWP3BOUZX34ULNQG23RQ6F4BVWBRZ4Z5QJSTEVVU5KS7LZLFORMS",
    "amount": 10000,
    "memo": "harvest-maize-2024",
    "contractId": "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4"
  }'
```

**Backend Processing**:

```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { publicKey, amount, memo, contractId } = req.body;
  
  // 1. Find farmer
  const farmer = db.farmers.find(f => f.stellarPublicKey === publicKey);
  
  // 2. Calculate allocations using rules
  const allocations = farmer.allocationRules.map(r => ({
    key: r.key,
    pct: r.pct,
    amount: Math.round((r.pct / 100) * amount)
  }));
  
  // 3. Update goals
  allocations.forEach(a => {
    const goal = db.goals.find(g => 
      g.farmerId === farmer.id && 
      g.name.toLowerCase().includes(a.key)
    );
    if (goal) goal.balance += a.amount;
  });
  
  // 4. Invoke Soroban contract for on-chain validation
  let contractResult = null;
  if (contractId) {
    contractResult = await invokeSorobanAllocation(
      farmer.id,
      publicKey,
      amount,
      contractId
    );
  }
  
  // 5. Record transaction
  db.transactions.push({
    id: Date.now(),
    farmerId: farmer.id,
    amount,
    allocations,
    memo,
    contractTxHash: contractResult?.txHash,
    createdAt: new Date().toISOString()
  });
  
  // 6. Return response
  res.json({
    status: 'allocated',
    allocations,
    contractInvoked: !!contractResult?.contractInvoked,
    txHash: contractResult?.txHash
  });
}
```

**Soroban Contract Execution**:

```rust
// Contract receives: farmer_address, amount
// 1. Load farmer's rules from persistent storage
// 2. Validate allocation (sum == 100%)
// 3. Calculate split: amount * rule_pct / 100
// 4. Record in allocation history
// 5. Return AllocationResult

pub fn allocate_payment(env: Env, farmer: Address, amount: i128) -> Result<AllocationResult, String> {
    farmer.require_auth();
    let rules = Self::get_allocation_rules(env.clone(), farmer.clone());
    let mut allocations = vec![&env];
    
    for rule in rules.iter() {
        let allocated_amount = (amount * rule.pct as i128) / 100;
        allocations.push_back(AllocationInfo {
            key: rule.key.clone(),
            pct: rule.pct,
            amount: allocated_amount,
        });
    }
    
    // Store in history
    let history_key = (ALLOCATION_HISTORY, farmer.clone());
    let mut history = env.storage().persistent().get(&history_key).unwrap_or_else(|| vec![&env]);
    history.push_back(AllocationResult { farmer: farmer.clone(), amount, allocations: allocations.clone() });
    env.storage().persistent().set(&history_key, &history);
    
    Ok(AllocationResult { farmer, amount, allocations })
}
```

## Step 4: Frontend Dashboard Display

**Dashboard Component** (`src/routes/dashboard.tsx`)

```typescript
export function DashboardPage() {
  const farmer = JSON.parse(localStorage.getItem('mavunopay_farmer') || '{}');
  const [goals, setGoals] = useState([]);
  
  useEffect(() => {
    // Fetch goals + balances
    fetch(`http://localhost:3001/api/goals?farmerId=${farmer.id}`)
      .then(r => r.json())
      .then(data => setGoals(data));
  }, [farmer.id]);
  
  return (
    <div>
      <h1>Welcome, {farmer.name}</h1>
      <p>Public Key: {farmer.stellarPublicKey}</p>
      
      <section>
        <h2>Your Savings Goals</h2>
        {goals.map(goal => (
          <Card key={goal.id}>
            <h3>{goal.name}</h3>
            <ProgressBar value={goal.balance} max={goal.targetAmount} />
            <p>{goal.balance} / {goal.targetAmount}</p>
          </Card>
        ))}
      </section>
      
      <SimulatePaymentWidget farmerId={farmer.id} publicKey={farmer.stellarPublicKey} />
    </div>
  );
}
```

## Step 5: Verify with Database (Production)

Once migrated to Supabase, query the allocation history:

```sql
-- View farmer's total saved by category
SELECT f.name, 
       sum(t.allocations->>'amount')::numeric as total_saved,
       count(*) as num_payments
FROM farmers f
JOIN transactions t ON f.id = t.farmer_id
WHERE f.id = 'farmer-123'
GROUP BY f.name;

-- Check allocation validation
SELECT * FROM soroban_contracts 
WHERE contract_id = 'CAAAA...' 
AND status = 'deployed';

-- Audit transaction allocation
SELECT f.name, t.amount, t.memo, t.contract_tx_hash
FROM transactions t
JOIN farmers f ON t.farmer_id = f.id
ORDER BY t.created_at DESC
LIMIT 10;
```

## Security Checkpoints

| Layer | Check |
|-------|-------|
| **Frontend** | ✅ No secrets stored (only publicKey in localStorage) |
| **API** | ✅ Secrets retrieved from vault, never logged |
| **Stellar** | ✅ Transaction signing happens in-memory only |
| **Contract** | ✅ Allocation validation enforced on-chain |
| **Database** | ✅ Audit log records all changes (Postgres triggers) |

## Testing End-to-End

```bash
# 1. Start backend
cd backend && npm run dev

# 2. In another terminal, start frontend
npm run dev

# 3. Register farmer
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"+254712345678","name":"John"}'

# Response:
# {
#   "farmer": {
#     "id": "550e8400-e29b-41d4-a716-446655440000",
#     "stellarPublicKey": "GBUQWP3BOUZX34ULNQG23RQ6F4BVWBRZ4Z5QJSTEVVU5KS7LZLFORMS"
#   }
# }

# 4. Simulate harvest payment
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "GBUQWP3BOUZX34ULNQG23RQ6F4BVWBRZ4Z5QJSTEVVU5KS7LZLFORMS",
    "amount": 10000,
    "memo": "harvest-2024"
  }'

# Response should show allocations:
# {
#   "status": "allocated",
#   "allocations": [
#     {"key": "inputs", "pct": 20, "amount": 2000},
#     {"key": "emergency", "pct": 10, "amount": 1000},
#     ...
#   ]
# }

# 5. View goals via frontend dashboard
# Navigate to http://localhost:5173/dashboard
```

## Production Deployment Checklist

- [ ] Soroban contract compiled and deployed to mainnet
- [ ] AWS Secrets Manager / Vault configured with appropriate IAM roles
- [ ] Database migrated to Supabase with schema and functions
- [ ] CORS configured for frontend origin
- [ ] Rate limiting enabled (10 req/min per IP for /webhook)
- [ ] HTTPS enforced for all API endpoints
- [ ] Webhook signature verification enabled
- [ ] Monitoring/alerting set up for failed contracts
- [ ] Backup strategy for Supabase data
- [ ] Disaster recovery plan documented
