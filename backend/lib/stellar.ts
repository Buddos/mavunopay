import StellarSdk from "stellar-sdk";
import axios from "axios";
import KeyVault from "./key-vault";

const NETWORK = process.env.STELLAR_NETWORK || "TESTNET";
const HORIZON_URL = NETWORK === "PUBLIC" ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org";
const server = new StellarSdk.Server(HORIZON_URL);
const vault = new KeyVault({
  provider: (process.env.KEY_VAULT_PROVIDER as "aws" | "hashicorp" | "local") || "local",
  endpoint: process.env.KEY_VAULT_ENDPOINT,
  token: process.env.KEY_VAULT_TOKEN,
  region: process.env.AWS_REGION,
});

export function generateKeypair() {
  const pair = StellarSdk.Keypair.random();
  return { publicKey: pair.publicKey(), secret: pair.secret() };
}

export async function fundAccountIfNeeded(publicKey: string, farmerId: string, secret: string) {
  try {
    const acct = await server.loadAccount(publicKey).catch(() => null);
    if (acct) return { funded: true, publicKey };

    // Store secret in vault instead of plaintext DB
    await vault.storeSecret(farmerId, secret, publicKey);

    if (NETWORK === "TESTNET") {
      // Friendbot for testnet
      const resp = await axios.get(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
      return { funded: true, publicKey, friendbot: resp.data };
    }

    // For PUBLIC, funding must be done by operational account; return not-funded
    return { funded: false, publicKey };
  } catch (err) {
    return { funded: false, publicKey, error: String(err) };
  }
}

export async function createTrustline(farmerId: string, assetCode: string, issuer: string) {
  try {
    // Retrieve secret from vault
    const stored = await vault.retrieveSecret(farmerId);
    if (!stored) throw new Error(`Secret not found for farmer ${farmerId}`);

    const kp = StellarSdk.Keypair.fromSecret(stored.secret);
    const account = await server.loadAccount(kp.publicKey());
    const fee = await server.fetchBaseFee();
    const tx = new StellarSdk.TransactionBuilder(account, { fee, networkPassphrase: NETWORK === "PUBLIC" ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET })
      .addOperation(StellarSdk.Operation.changeTrust({ asset: new StellarSdk.Asset(assetCode, issuer) }))
      .setTimeout(30)
      .build();

    tx.sign(kp);
    const result = await server.submitTransaction(tx);
    return { trustlineCreated: true, result };
  } catch (err) {
    return { trustlineCreated: false, error: String(err) };
  }
}

// Soroban contract interaction for allocation
export async function invokeSorobanAllocation(
  farmerId: string,
  publicKey: string,
  amount: number,
  contractId: string
) {
  try {
    const stored = await vault.retrieveSecret(farmerId);
    if (!stored) throw new Error(`Secret not found for farmer ${farmerId}`);

    const kp = StellarSdk.Keypair.fromSecret(stored.secret);
    const account = await server.loadAccount(kp.publicKey());
    const fee = await server.fetchBaseFee();

    // Build contract invocation for allocate_payment
    const tx = new StellarSdk.TransactionBuilder(account, { fee, networkPassphrase: NETWORK === "PUBLIC" ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET })
      .addOperation(
        StellarSdk.Operation.invokeHostFunction({
          functions: [
            StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract([
              StellarSdk.nativeToScVal(contractId),
              StellarSdk.nativeToScVal("allocate_payment"),
              StellarSdk.nativeToScVal([kp.publicKey(), amount]),
            ]),
          ],
        })
      )
      .setTimeout(30)
      .build();

    tx.sign(kp);
    const result = await server.submitTransaction(tx);
    return { contractInvoked: true, result, txHash: (result as any).hash };
  } catch (err) {
    return { contractInvoked: false, error: String(err) };
  }
}
