import { NextApiRequest, NextApiResponse } from 'next';
import { withCors } from '../../lib/cors';
import { getSorobanConfig, validateSorobanConfig } from '../../lib/soroban-config';
import { generateKeypair } from '../../lib/stellar';
import KeyVault from '../../lib/key-vault';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // 1. Check Stellar SDK
  try {
    const kp = generateKeypair();
    results.checks.stellar_sdk = {
      status: 'ok',
      message: 'Stellar SDK keypair generation working',
      sample: { publicKey: kp.publicKey.substring(0, 10) + '...', secretExists: !!kp.secret },
    };
  } catch (err) {
    results.checks.stellar_sdk = {
      status: 'error',
      error: String(err),
    };
  }

  // 2. Check Key Vault
  try {
    const vault = new KeyVault({
      provider: (process.env.KEY_VAULT_PROVIDER as 'aws' | 'hashicorp' | 'local') || 'local',
      endpoint: process.env.KEY_VAULT_ENDPOINT,
      token: process.env.KEY_VAULT_TOKEN,
    });
    
    // Try to store and retrieve a test secret
    const testFarmerId = 'test-check-' + Date.now();
    const testSecret = 'S' + 'X'.repeat(55); // Fake but valid-looking secret format
    const testPublicKey = 'G' + 'A'.repeat(55);
    
    await vault.storeSecret(testFarmerId, testSecret, testPublicKey);
    const retrieved = await vault.retrieveSecret(testFarmerId);
    
    results.checks.key_vault = {
      status: retrieved ? 'ok' : 'warning',
      provider: process.env.KEY_VAULT_PROVIDER || 'local',
      message: retrieved 
        ? 'Key Vault working (test secret stored and retrieved)'
        : 'Key Vault is local/non-persistent (development mode)',
    };
  } catch (err) {
    results.checks.key_vault = {
      status: 'error',
      error: String(err),
    };
  }

  // 3. Check Soroban Configuration
  try {
    const config = getSorobanConfig();
    const validation = validateSorobanConfig(config);
    
    results.checks.soroban_config = {
      status: validation.valid ? 'ok' : 'warning',
      network: process.env.STELLAR_NETWORK || 'TESTNET',
      contractConfigured: !!config.contractId,
      contractId: config.contractId ? config.contractId.substring(0, 10) + '...' : 'NOT CONFIGURED',
      message: validation.error || 'Soroban configuration valid',
    };
  } catch (err) {
    results.checks.soroban_config = {
      status: 'error',
      error: String(err),
    };
  }

  // 4. Check Environment Variables
  const envVars = [
    'STELLAR_NETWORK',
    'KEY_VAULT_PROVIDER',
    'SOROBAN_CONTRACT_ID',
    'NODE_ENV',
    'PORT',
  ];
  
  results.checks.environment = {
    status: 'ok',
    variables: Object.fromEntries(
      envVars.map(v => [
        v,
        process.env[v] ? '✓ set' : '✗ not set'
      ])
    ),
  };

  // 5. Summary
  const allChecks = Object.values(results.checks) as any[];
  const failureCount = allChecks.filter(c => c.status === 'error').length;
  const warningCount = allChecks.filter(c => c.status === 'warning').length;

  results.summary = {
    totalChecks: allChecks.length,
    passed: allChecks.filter(c => c.status === 'ok').length,
    warnings: warningCount,
    errors: failureCount,
    ready: failureCount === 0,
  };

  const statusCode = failureCount > 0 ? 400 : 200;
  return res.status(statusCode).json(results);
}

export default withCors(handler);
