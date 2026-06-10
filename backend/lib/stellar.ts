import StellarSdk from "stellar-sdk";
import axios from "axios";
import KeyVault from "./key-vault";
import { fetchSorobanTransactionEvents } from "./soroban-events";

const NETWORK = process.env.STELLAR_NETWORK || "TESTNET";
const NETWORK_PASSPHRASE = NETWORK === "PUBLIC" ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET;
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

export async function getNativeBalance(publicKey: string) {
  const account = await server.loadAccount(publicKey);
  const balance = account.balances.find((b: any) => b.asset_type === "native");
  return balance ? Number(balance.balance) : 0;
}

export async function fundAccountIfNeeded(publicKey: string, farmerId: string, secret: string) {
  try {
    const existingAccount = await server.loadAccount(publicKey).catch(() => null);
    if (existingAccount) {
      await vault.storeSecret(farmerId, secret, publicKey);
      return { funded: true, publicKey };
    }

    await vault.storeSecret(farmerId, secret, publicKey);

    if (NETWORK === "TESTNET") {
      const resp = await axios.get(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
      return { funded: true, publicKey, fundedBy: "friendbot", response: resp.data };
    }

    const operationalSecret = process.env.OPERATIONAL_ACCOUNT_SECRET || process.env.MAVUNO_OP_SECRET;
    if (!operationalSecret) {
      throw new Error("Operational account funding secret is not configured for PUBLIC network");
    }

    const operationalKeypair = StellarSdk.Keypair.fromSecret(operationalSecret);
    const operationalAccount = await server.loadAccount(operationalKeypair.publicKey());
    const fee = await server.fetchBaseFee();
    const tx = new StellarSdk.TransactionBuilder(operationalAccount, {
      fee,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.createAccount({
          destination: publicKey,
          startingBalance: "1",
        })
      )
      .setTimeout(30)
      .build();

    tx.sign(operationalKeypair);
    const result = await server.submitTransaction(tx);
    return { funded: true, publicKey, fundedBy: "operational_account", result };
  } catch (err) {
    return { funded: false, publicKey, error: String(err) };
  }
}

export async function monitorMinimumBalance(publicKey: string, thresholdXLM = 1.5) {
  try {
    const balance = await getNativeBalance(publicKey);
    if (balance < thresholdXLM) {
      console.warn(`Stellar wallet ${publicKey} has low balance ${balance} XLM, threshold ${thresholdXLM} XLM`);
      return { alert: true, balance, thresholdXLM };
    }
    return { alert: false, balance, thresholdXLM };
  } catch (err) {
    return { alert: false, error: String(err) };
  }
}

export async function createTrustline(farmerId: string, assetCode: string, issuer: string) {
  try {
    const stored = await vault.retrieveSecret(farmerId);
    if (!stored) throw new Error(`Secret not found for farmer ${farmerId}`);

    const kp = StellarSdk.Keypair.fromSecret(stored.secret);
    const account = await server.loadAccount(kp.publicKey());
    const fee = await server.fetchBaseFee();
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
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

export async function createGoalSubAccount(
  farmerId: string,
  goalId: string,
  lockUntilIso: string,
  lockedAmount = "1",
  reserveAmount = "1"
) {
  try {
    const stored = await vault.retrieveSecret(farmerId);
    if (!stored) throw new Error(`Secret not found for farmer ${farmerId}`);

    const kp = StellarSdk.Keypair.fromSecret(stored.secret);
    const sponsorAccount = await server.loadAccount(kp.publicKey());
    const fee = await server.fetchBaseFee();
    const goalKeypair = StellarSdk.Keypair.random();

    const lockUntil = Math.floor(new Date(lockUntilIso).getTime() / 1000);
    const claimant = new StellarSdk.Claimant(goalKeypair.publicKey(), StellarSdk.Claimant.predicateNotBefore(lockUntil));

    const tx = new StellarSdk.TransactionBuilder(sponsorAccount, {
      fee,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.beginSponsoringFutureReserves({ sponsoredId: goalKeypair.publicKey() })
      )
      .addOperation(
        StellarSdk.Operation.createAccount({
          destination: goalKeypair.publicKey(),
          startingBalance: reserveAmount,
        })
      )
      .addOperation(StellarSdk.Operation.endSponsoringFutureReserves({ sponsoredId: goalKeypair.publicKey() }))
      .addOperation(
        StellarSdk.Operation.createClaimableBalance({
          asset: StellarSdk.Asset.native(),
          amount: lockedAmount,
          claimants: [claimant],
        })
      )
      .setTimeout(30)
      .build();

    tx.sign(kp);
    const result = await server.submitTransaction(tx);

    await vault.storeSecret(`${farmerId}-goal-${goalId}`, goalKeypair.secret(), goalKeypair.publicKey());

    return {
      created: true,
      goalPublicKey: goalKeypair.publicKey(),
      lockUntilIso,
      lockedAmount,
      reserveAmount,
      result,
    };
  } catch (err) {
    return { created: false, error: String(err) };
  }
}

export async function configureCooperativeMultisig(
  coopAccountSecret: string,
  adminSignerPublicKeys: string[],
  threshold = 2
) {
  try {
    if (adminSignerPublicKeys.length < 3) {
      throw new Error("At least 3 administrator signers are required for cooperative multisig");
    }

    const coopKeypair = StellarSdk.Keypair.fromSecret(coopAccountSecret);
    const coopAccount = await server.loadAccount(coopKeypair.publicKey());
    const fee = await server.fetchBaseFee();
    const txBuilder = new StellarSdk.TransactionBuilder(coopAccount, {
      fee,
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    txBuilder.addOperation(
      StellarSdk.Operation.setOptions({
        masterWeight: 1,
        lowThreshold: 1,
        medThreshold: threshold,
        highThreshold: threshold,
      })
    );

    adminSignerPublicKeys.slice(0, 3).forEach((signer) => {
      txBuilder.addOperation(
        StellarSdk.Operation.setOptions({
          signer: {
            ed25519PublicKey: signer,
            weight: 1,
          },
        })
      );
    });

    const tx = txBuilder.setTimeout(30).build();
    tx.sign(coopKeypair);
    const result = await server.submitTransaction(tx);
    return { configured: true, result };
  } catch (err) {
    return { configured: false, error: String(err) };
  }
}

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

    const args = [
      StellarSdk.nativeToScVal(contractId),
      StellarSdk.nativeToScVal("allocate_payment"),
      StellarSdk.nativeToScVal([kp.publicKey(), amount]),
    ];

    const innerTx = new StellarSdk.TransactionBuilder(account, {
      fee,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.invokeHostFunction({
          functions: [StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(args)],
        })
      )
      .setTimeout(30)
      .build();

    innerTx.sign(kp);

    const sponsorSecret = process.env.FEE_BUMP_SPONSOR_SECRET || process.env.OPERATIONAL_ACCOUNT_SECRET;
    if (!sponsorSecret) {
      throw new Error("Fee-bump sponsor secret is not configured");
    }

    const sponsorKeypair = StellarSdk.Keypair.fromSecret(sponsorSecret);
    const feeBumpTx = StellarSdk.FeeBumpTransactionBuilder({
      feeSource: sponsorKeypair.publicKey(),
      baseFee: fee,
      innerTransaction: innerTx,
    }, NETWORK_PASSPHRASE)
      .setTimeout(30)
      .build();

    feeBumpTx.sign(sponsorKeypair);
    const result = await server.submitTransaction(feeBumpTx);
    const txHash = (result as any).hash;
    // Best-effort: fetch soroban events emitted by this transaction (may require soroban-rpc availability)
    let events: any[] = [];
    try {
      // small delay to allow RPC indexing
      await new Promise((r) => setTimeout(r, 800));
      events = await fetchSorobanTransactionEvents(txHash);
    } catch (e) {
      console.warn('Unable to fetch soroban events for', txHash, e);
    }

    return { contractInvoked: true, result, txHash, events };
  } catch (err) {
    return { contractInvoked: false, error: String(err) };
  }
}
