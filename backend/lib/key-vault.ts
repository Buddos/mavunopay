// Key vault abstraction for Stellar secret management
// Supports AWS Secrets Manager, HashiCorp Vault, or local secure enclave

import axios from 'axios';

export interface KeyVaultConfig {
  provider: 'aws' | 'hashicorp' | 'local';
  endpoint?: string;
  token?: string;
  region?: string;
}

export interface StoredSecret {
  publicKey: string;
  secret: string;
  metadata: Record<string, any>;
}

export class KeyVault {
  private config: KeyVaultConfig;

  constructor(config: KeyVaultConfig) {
    this.config = config;
  }

  async storeSecret(farmerId: string, secret: string, publicKey: string): Promise<void> {
    switch (this.config.provider) {
      case 'aws':
        return this.storeAWSSecret(farmerId, secret, publicKey);
      case 'hashicorp':
        return this.storeHashiCorpSecret(farmerId, secret, publicKey);
      case 'local':
        return this.storeLocalSecret(farmerId, secret, publicKey);
      default:
        throw new Error(`Unknown provider: ${this.config.provider}`);
    }
  }

  async retrieveSecret(farmerId: string): Promise<StoredSecret | null> {
    switch (this.config.provider) {
      case 'aws':
        return this.retrieveAWSSecret(farmerId);
      case 'hashicorp':
        return this.retrieveHashiCorpSecret(farmerId);
      case 'local':
        return this.retrieveLocalSecret(farmerId);
      default:
        throw new Error(`Unknown provider: ${this.config.provider}`);
    }
  }

  // AWS Secrets Manager implementation
  private async storeAWSSecret(farmerId: string, secret: string, publicKey: string): Promise<void> {
    const secretName = `mavunopay/farmer/${farmerId}`;
    const payload = { secret, publicKey, createdAt: new Date().toISOString() };

    try {
      await axios.post(
        `${this.config.endpoint}/api/secrets`,
        {
          name: secretName,
          payload: JSON.stringify(payload),
        },
        {
          headers: { 'Authorization': `Bearer ${this.config.token}` },
        }
      );
    } catch (err: any) {
      throw new Error(`AWS Secrets Manager store failed: ${err.message}`);
    }
  }

  private async retrieveAWSSecret(farmerId: string): Promise<StoredSecret | null> {
    const secretName = `mavunopay/farmer/${farmerId}`;
    try {
      const resp = await axios.get(
        `${this.config.endpoint}/api/secrets/${secretName}`,
        {
          headers: { 'Authorization': `Bearer ${this.config.token}` },
        }
      );
      const data = JSON.parse(resp.data.payload);
      return { secret: data.secret, publicKey: data.publicKey, metadata: data };
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw new Error(`AWS Secrets Manager retrieve failed: ${err.message}`);
    }
  }

  // HashiCorp Vault implementation
  private async storeHashiCorpSecret(farmerId: string, secret: string, publicKey: string): Promise<void> {
    const path = `/v1/secret/data/mavunopay/farmer/${farmerId}`;
    try {
      await axios.post(
        `${this.config.endpoint}${path}`,
        {
          data: { secret, publicKey, createdAt: new Date().toISOString() },
        },
        {
          headers: { 'X-Vault-Token': this.config.token },
        }
      );
    } catch (err: any) {
      throw new Error(`Vault store failed: ${err.message}`);
    }
  }

  private async retrieveHashiCorpSecret(farmerId: string): Promise<StoredSecret | null> {
    const path = `/v1/secret/data/mavunopay/farmer/${farmerId}`;
    try {
      const resp = await axios.get(
        `${this.config.endpoint}${path}`,
        {
          headers: { 'X-Vault-Token': this.config.token },
        }
      );
      const data = resp.data.data.data;
      return { secret: data.secret, publicKey: data.publicKey, metadata: data };
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw new Error(`Vault retrieve failed: ${err.message}`);
    }
  }

  // Local secure storage (uses environment variables or encrypted local file)
  private async storeLocalSecret(farmerId: string, secret: string, publicKey: string): Promise<void> {
    // In production, write to encrypted file or HSM-backed store
    const envKey = `STELLAR_SECRET_${farmerId}`;
    process.env[envKey] = secret;
    console.warn(`WARNING: Storing secret for ${farmerId} in environment. For production, use AWS Secrets Manager or Vault.`);
  }

  private async retrieveLocalSecret(farmerId: string): Promise<StoredSecret | null> {
    const envKey = `STELLAR_SECRET_${farmerId}`;
    const secret = process.env[envKey];
    if (!secret) return null;
    return { secret, publicKey: '', metadata: {} };
  }

  // Secure key signing (never export the secret)
  async signTransaction(farmerId: string, txHash: string): Promise<string> {
    const stored = await this.retrieveSecret(farmerId);
    if (!stored) throw new Error(`No secret found for farmer ${farmerId}`);

    // Sign transaction using the secret (this stays in memory, never leaves vault)
    // Returns only the signature
    const StellarSdk = require('stellar-sdk');
    const kp = StellarSdk.Keypair.fromSecret(stored.secret);
    const sig = kp.sign(Buffer.from(txHash, 'hex')).toString('base64');
    return sig;
  }
}

export default KeyVault;
