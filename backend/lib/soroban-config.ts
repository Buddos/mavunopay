// Soroban contract configuration and validation

export interface SorobanConfig {
  contractId?: string;
  networkPassphrase: string;
  rpcUrl: string;
  enabled: boolean;
}

export function getSorobanConfig(): SorobanConfig {
  const contractId = process.env.SOROBAN_CONTRACT_ID;
  const network = process.env.STELLAR_NETWORK || 'TESTNET';
  
  // Determine network settings
  const isPublic = network === 'PUBLIC';
  const networkPassphrase = isPublic 
    ? 'Public Global Stellar Network ; September 2015'
    : 'Test SDF Network ; September 2015';
  
  const defaultRpcUrl = isPublic
    ? 'https://soroban-mainnet.stellar.org:443'
    : 'https://soroban-testnet.stellar.org:443';
  const rpcUrl = process.env.SOROBAN_RPC_URL || defaultRpcUrl;

  return {
    contractId: contractId || undefined,
    networkPassphrase,
    rpcUrl,
    enabled: !!contractId, // Only enable if contract ID is configured
  };
}

export function validateSorobanConfig(config: SorobanConfig): { valid: boolean; error?: string } {
  if (!config.enabled) {
    return { valid: true }; // Soroban is optional
  }

  if (!config.contractId) {
    return { valid: false, error: 'SOROBAN_CONTRACT_ID not configured' };
  }

  if (!config.contractId.startsWith('C')) {
    return { valid: false, error: 'Invalid contract ID format (must start with C)' };
  }

  if (config.contractId.length !== 56) {
    return { valid: false, error: 'Invalid contract ID length (must be 56 characters)' };
  }

  return { valid: true };
}
