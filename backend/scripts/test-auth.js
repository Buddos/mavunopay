const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const StellarSdk = require('stellar-sdk');
const axios = require('axios');

const DB = path.join(__dirname, '..', 'data', 'db.json');
const NETWORK = process.env.STELLAR_NETWORK || 'TESTNET';
const HORIZON_URL = NETWORK === 'PUBLIC' ? 'https://horizon.stellar.org' : 'https://horizon-testnet.stellar.org';

async function main() {
  if (!fs.existsSync(DB)) {
    console.error('DB file not found:', DB);
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(DB, 'utf-8'));
  const farmerId = uuidv4();
  const pair = StellarSdk.Keypair.random();
  const publicKey = pair.publicKey();
  const secret = pair.secret();

  const farmer = {
    id: farmerId,
    phone: '+254700000001',
    name: 'Test Farmer',
    createdAt: new Date().toISOString(),
    stellarPublicKey: publicKey,
    allocationRules: [
      { key: 'inputs', pct: 20 },
      { key: 'emergency', pct: 10 },
      { key: 'education', pct: 10 },
      { key: 'disposable', pct: 60 },
    ],
  };

  db.farmers.push(farmer);
  fs.writeFileSync(DB, JSON.stringify(db, null, 2));
  console.log('Farmer written to DB with id:', farmerId);

  // Store secret in env (local vault emulation)
  process.env[`STELLAR_SECRET_${farmerId}`] = secret;
  console.log('Secret stored in environment variable STELLAR_SECRET_' + farmerId.slice(0, 8) + '...');

  // Fund via friendbot if testnet
  if (NETWORK === 'TESTNET') {
    try {
      const resp = await axios.get(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
      console.log('Friendbot funded account:', resp.data?.hash ? resp.data.hash : 'ok');
    } catch (err) {
      console.error('Friendbot failed:', err.message || err);
    }
  } else {
    console.log('Not testnet; skipping friendbot funding.');
  }

  // Simulate login by id
  const db2 = JSON.parse(fs.readFileSync(DB, 'utf-8'));
  const foundById = db2.farmers.find((f) => f.id === farmerId);
  const foundByPhone = db2.farmers.find((f) => f.phone === '+254700000001');

  console.log('Login test results:');
  console.log('Found by ID:', !!foundById);
  console.log('Found by phone:', !!foundByPhone);

  // Optionally, attempt to load account from Horizon
  try {
    const server = new StellarSdk.Server(HORIZON_URL);
    const acc = await server.loadAccount(publicKey);
    console.log('Horizon account loaded; sequence:', acc.sequenceNumber());
  } catch (err) {
    console.error('Could not load account on horizon:', err.message || err);
  }

  console.log('Test finished.');
}

main().catch((e) => { console.error(e); process.exit(1); });
