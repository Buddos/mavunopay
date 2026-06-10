import { v as v4 } from "./wrapper-C1_KymC2.mjs";
import { r as requireEventsource, S as StellarSdk, a as getSorobanConfig, i as invokeSorobanAllocation } from "./stellar-c7apZeDO.mjs";
import { w as withCors } from "./cors-BIye2o2q.mjs";
import { u as useSupabase, a as ensureCoreSchema, q as query } from "./db-C9kVyrmy.mjs";
import { r as readLocalDb, w as writeLocalDb } from "./local-db-C03tS4Sk.mjs";
import { c as createNotification } from "./notifications-D27_zi3Y.mjs";
import { g as getDefaultExportFromCjs } from "../_commonjsHelpers-CCIqAdii.mjs";
import "../_libs/lodash.mjs";
import "../_libs/function-bind.mjs";
import "../_libs/debug.mjs";
import "crypto";
import "tslib";
import "buffer";
import "../_libs/es-errors.mjs";
import "../_libs/hasown.mjs";
import "fs";
import "path";
import "os";
import "http";
import "https";
import "url";
import "stream";
import "assert";
import "zlib";
import "events";
import "util";
import "net";
import "tls";
import "http2";
import "node:fs";
import "node:path";
import "node:dns";
import "util/types";
import "dns";
import "string_decoder";
import "../_libs/ms.mjs";
import "tty";
import "../_libs/supports-color.mjs";
import "../_libs/has-flag.mjs";
var eventsourceExports = requireEventsource();
const EventSource = /* @__PURE__ */ getDefaultExportFromCjs(eventsourceExports);
const NETWORK = process.env.STELLAR_NETWORK || "TESTNET";
const HORIZON_URL = NETWORK === "PUBLIC" ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org";
const server = new StellarSdk.Server(HORIZON_URL);
if (typeof global.EventSource === "undefined") {
  global.EventSource = EventSource;
}
function classifyPaymentSource(memo) {
  if (!memo) return "other";
  const normalized = memo.toLowerCase();
  if (normalized.includes("ussd") || normalized.includes("paybill") || normalized.includes("mpesa")) return "ussd";
  if (normalized.includes("dealer") || normalized.includes("agro") || normalized.includes("input")) return "dealer";
  if (normalized.includes("coop") || normalized.includes("group")) return "coop";
  if (normalized.includes("credit") || normalized.includes("loan")) return "credit";
  if (normalized.includes("mobile") || normalized.includes("momo")) return "mobile_money";
  return "other";
}
async function validateTransactionConfirmation(txHash) {
  const tx = await server.transactions().transaction(txHash).call();
  if (!tx || tx.successful === false) {
    throw new Error(`Transaction ${txHash} is not confirmed or failed`);
  }
  return tx;
}
async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { publicKey, amount, memo, contractId, assetCode, assetIssuer, groupPayment, transactionHash } = req.body;
  if (!publicKey || !amount) return res.status(400).json({ error: "publicKey and amount required" });
  let farmer;
  let allocations = [];
  let transaction = null;
  let validationResult = null;
  let sourceClassification = classifyPaymentSource(memo);
  if (transactionHash) {
    try {
      validationResult = await validateTransactionConfirmation(transactionHash);
    } catch (err) {
      console.warn(`Payment confirmation check failed for ${transactionHash}:`, err);
    }
  }
  if (useSupabase()) {
    await ensureCoreSchema();
    const farmerResult = await query(
      `SELECT id, stellar_public_key AS "stellarPublicKey", coop_id AS "coopId" FROM farmers WHERE stellar_public_key = $1 LIMIT 1`,
      [publicKey]
    );
    if (farmerResult.rowCount === 0) return res.status(404).json({ error: "farmer not found" });
    farmer = farmerResult.rows[0];
    const rulesResult = await query(
      `SELECT key, pct FROM allocation_rules WHERE farmer_id = $1 ORDER BY created_at`,
      [farmer.id]
    );
    allocations = rulesResult.rows.map((r) => ({ key: r.key, pct: r.pct, amount: Math.round(r.pct / 100 * amount) }));
    for (const alloc of allocations) {
      const pattern = `%${alloc.key.toLowerCase()}%`;
      await query(
        `UPDATE goals SET balance = balance + $1 WHERE farmer_id = $2 AND lower(name) LIKE $3`,
        [alloc.amount, farmer.id, pattern]
      );
    }
    if (groupPayment && farmer.coopId) {
      await query(`UPDATE cooperatives SET savings_balance = savings_balance + $1 WHERE id = $2`, [amount, farmer.coopId]);
    }
    transaction = {
      id: v4(),
      farmerId: farmer.id,
      amount,
      memo: memo || null,
      assetCode: assetCode || null,
      assetIssuer: assetIssuer || null,
      groupPayment: Boolean(groupPayment),
      allocations,
      transactionHash: transactionHash || null,
      validation: validationResult || null,
      classification: sourceClassification,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  } else {
    const db = readLocalDb();
    farmer = db.farmers.find((f) => f.stellarPublicKey === publicKey);
    if (!farmer) return res.status(404).json({ error: "farmer not found" });
    allocations = farmer.allocationRules.map((r) => ({ key: r.key, pct: r.pct, amount: Math.round(r.pct / 100 * amount) }));
    allocations.forEach((a) => {
      const goal = db.goals.find((g) => g.farmerId === farmer.id && g.name.toLowerCase().includes(a.key));
      if (goal) {
        goal.balance += a.amount;
      }
    });
    if (groupPayment && farmer.coopId) {
      const coop = db.cooperatives.find((c) => c.id === farmer.coopId);
      if (coop) coop.savingsBalance = (coop.savingsBalance || 0) + Number(amount);
    }
    const tx = {
      id: v4(),
      farmerId: farmer.id,
      amount,
      memo: memo || null,
      assetCode: assetCode || null,
      assetIssuer: assetIssuer || null,
      groupPayment: Boolean(groupPayment),
      allocations,
      transactionHash: transactionHash || null,
      validation: validationResult || null,
      classification: sourceClassification,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.transactions.push(tx);
    writeLocalDb(db);
    transaction = tx;
  }
  if (farmer?.id) {
    await createNotification(
      farmer.id,
      "payment",
      "Payment allocated",
      `KES ${Number(amount).toLocaleString()} has been allocated across your goals.`
    );
  }
  let contractResult = null;
  const finalContractId = contractId || process.env.SOROBAN_CONTRACT_ID;
  if (finalContractId) {
    try {
      const sorobanConfig = getSorobanConfig();
      if (sorobanConfig.enabled && sorobanConfig.contractId) {
        contractResult = await invokeSorobanAllocation(farmer.id, publicKey, amount, finalContractId);
        if (!contractResult.contractInvoked) {
          console.error(`Soroban contract invocation failed: ${contractResult.error}`);
        }
      }
    } catch (err) {
      console.error(`Soroban contract error: ${err}`);
    }
  }
  if (useSupabase() && transaction) {
    await query(
      `INSERT INTO transactions (id, farmer_id, amount, memo, asset_code, asset_issuer, group_payment, allocations, stellar_tx_hash, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        transaction.id,
        transaction.farmerId,
        transaction.amount,
        transaction.memo,
        transaction.assetCode,
        transaction.assetIssuer,
        transaction.groupPayment,
        transaction.allocations,
        contractResult?.txHash || null,
        transaction.createdAt
      ]
    );
    if (contractResult?.events && Array.isArray(contractResult.events) && contractResult.events.length > 0) {
      await query(
        `INSERT INTO audit_logs (actor_id, action, subject_type, subject_id, payload) VALUES ($1, $2, $3, $4, $5)`,
        [
          transaction.farmerId,
          "soroban_events",
          "transaction",
          transaction.id,
          contractResult.events
        ]
      );
    }
  } else if (transaction) {
    const db = readLocalDb();
    if (contractResult?.events && Array.isArray(contractResult.events)) {
      const txIdx = db.transactions.findIndex((t) => t.id === transaction.id);
      if (txIdx >= 0) {
        db.transactions[txIdx].sorobanEvents = contractResult.events;
        writeLocalDb(db);
      }
    }
  }
  return res.status(200).json({
    status: "allocated",
    allocations,
    contractInvoked: contractResult?.contractInvoked || false,
    txHash: contractResult?.txHash || null,
    sourceClassification,
    paymentValidated: Boolean(validationResult),
    sorobanEvents: contractResult?.events || []
  });
}
const webhook = withCors(handler);
export {
  webhook as default
};
