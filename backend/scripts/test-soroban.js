const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function main() {
  const bindingsPath = path.join(__dirname, '..', 'soroban', 'src', 'contracts', 'src', 'index.ts');
  if (!fs.existsSync(bindingsPath)) {
    console.error('Bindings file not found:', bindingsPath);
    process.exit(1);
  }

  const content = fs.readFileSync(bindingsPath, 'utf-8');
  const m = content.match(/contractId:\s*"([A-Z0-9]+)"/);
  const contractId = m ? m[1] : null;
  console.log('Detected contractId in bindings:', contractId || 'NONE');

  const rpcUrl = 'https://soroban-testnet.stellar.org:443';
  try {
    const resp = await axios.get(rpcUrl, { timeout: 10000 });
    console.log('Soroban RPC reachable (GET):', resp.status);
  } catch (err) {
    console.warn('Soroban RPC GET failed:', err.message || err.toString());
  }

  // Try JSON-RPC status check if available
  try {
    const rpcEndpoint = 'https://soroban-testnet.stellar.org/soroban/rpc';
    const rpcResp = await axios.post(rpcEndpoint, { jsonrpc: '2.0', id: 1, method: 'getHealth' }, { timeout: 10000 });
    console.log('Soroban RPC JSON-RPC response:', rpcResp.data?.result || rpcResp.status);
  } catch (err) {
    console.warn('Soroban JSON-RPC health check failed:', err.message || err.toString());
  }

  if (contractId) {
    console.log('Contract appears in generated bindings; you can invoke using the contract client in /backend/soroban/src/contracts.');
  }

  console.log('Soroban connectivity check complete.');
}

main().catch((e) => { console.error(e); process.exit(1); });
