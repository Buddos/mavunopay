import StellarSdk from "stellar-sdk";
import EventSource from "eventsource";
import axios from "axios";
import { invokeSorobanAllocation } from "./stellar";
import { getSorobanConfig } from "./soroban-config";

const NETWORK = process.env.STELLAR_NETWORK || "TESTNET";
const HORIZON_URL = NETWORK === "PUBLIC" ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org";
const server = new StellarSdk.Server(HORIZON_URL);

if (typeof global.EventSource === "undefined") {
  (global as any).EventSource = EventSource;
}

type HorizonPaymentPayload = {
  type: string;
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  from: string;
  to: string;
  amount: string;
  transaction_hash: string;
  created_at: string;
};

export type PaymentClassification = "ussd" | "dealer" | "coop" | "credit" | "mobile_money" | "other";

export function classifyPaymentSource(memo?: string): PaymentClassification {
  if (!memo) return "other";
  const normalized = memo.toLowerCase();
  if (normalized.includes("ussd") || normalized.includes("paybill") || normalized.includes("mpesa")) return "ussd";
  if (normalized.includes("dealer") || normalized.includes("agro") || normalized.includes("input")) return "dealer";
  if (normalized.includes("coop") || normalized.includes("group")) return "coop";
  if (normalized.includes("credit") || normalized.includes("loan")) return "credit";
  if (normalized.includes("mobile") || normalized.includes("momo")) return "mobile_money";
  return "other";
}

export async function validateTransactionConfirmation(txHash: string) {
  const tx = await server.transactions().transaction(txHash).call();
  if (!tx || (tx as any).successful === false) {
    throw new Error(`Transaction ${txHash} is not confirmed or failed`);
  }
  return tx;
}

export async function fetchTransactionMemo(txHash: string): Promise<string | null> {
  try {
    const tx = await server.transactions().transaction(txHash).call();
    return (tx as any).memo || null;
  } catch (err) {
    console.warn(`Unable to fetch memo for ${txHash}: ${err}`);
    return null;
  }
}

export async function startPaymentStream(
  publicKey: string,
  onPayment: (event: {
    publicKey: string;
    amount: number;
    assetCode?: string;
    assetIssuer?: string;
    transactionHash: string;
    memo?: string | null;
    classification: PaymentClassification;
  }) => Promise<void>
) {
  const stream = server
    .payments()
    .forAccount(publicKey)
    .cursor("now")
    .stream({
      onmessage: async (message: HorizonPaymentPayload) => {
        if (message.type !== "payment") return;
        const amount = Number(message.amount);
        const memo = await fetchTransactionMemo(message.transaction_hash);
        const classification = classifyPaymentSource(memo || undefined);

        await onPayment({
          publicKey,
          amount,
          assetCode: message.asset_code,
          assetIssuer: message.asset_issuer,
          transactionHash: message.transaction_hash,
          memo,
          classification,
        });
      },
      onerror: (err: unknown) => {
        console.error(`Horizon payment stream error for ${publicKey}:`, err);
      },
    });

  return stream;
}

export async function dispatchPaymentEvent(
  publicKey: string,
  txHash: string,
  onPayment: (payload: {
    publicKey: string;
    amount: number;
    assetCode?: string;
    assetIssuer?: string;
    transactionHash: string;
    memo?: string | null;
    classification: PaymentClassification;
  }) => Promise<void>
) {
  try {
    await validateTransactionConfirmation(txHash);
    const memo = await fetchTransactionMemo(txHash);
    const classification = classifyPaymentSource(memo || undefined);
    // Horizon payment streaming should normally provide the payload; this is fallback path.
    await onPayment({
      publicKey,
      amount: 0,
      assetCode: undefined,
      assetIssuer: undefined,
      transactionHash: txHash,
      memo,
      classification,
    });
  } catch (err) {
    console.error(`Failed to dispatch payment event for ${txHash}:`, err);
  }
}
