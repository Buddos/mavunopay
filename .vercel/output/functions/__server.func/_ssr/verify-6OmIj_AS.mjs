import { w as withCors } from "./cors-BIye2o2q.mjs";
import { g as generateKeypair, K as KeyVault, a as getSorobanConfig, v as validateSorobanConfig } from "./stellar-c7apZeDO.mjs";
import "../_libs/lodash.mjs";
import "../_libs/function-bind.mjs";
import "../_libs/debug.mjs";
import "../_commonjsHelpers-CCIqAdii.mjs";
import "tslib";
import "buffer";
import "../_libs/es-errors.mjs";
import "../_libs/hasown.mjs";
import "fs";
import "path";
import "os";
import "crypto";
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
import "../_libs/ms.mjs";
import "tty";
import "../_libs/supports-color.mjs";
import "../_libs/has-flag.mjs";
async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const results = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    checks: {}
  };
  try {
    const kp = generateKeypair();
    results.checks.stellar_sdk = {
      status: "ok",
      message: "Stellar SDK keypair generation working",
      sample: { publicKey: kp.publicKey.substring(0, 10) + "...", secretExists: !!kp.secret }
    };
  } catch (err) {
    results.checks.stellar_sdk = {
      status: "error",
      error: String(err)
    };
  }
  try {
    const vault = new KeyVault({
      provider: process.env.KEY_VAULT_PROVIDER || "local",
      endpoint: process.env.KEY_VAULT_ENDPOINT,
      token: process.env.KEY_VAULT_TOKEN
    });
    const testFarmerId = "test-check-" + Date.now();
    const testSecret = "S" + "X".repeat(55);
    const testPublicKey = "G" + "A".repeat(55);
    await vault.storeSecret(testFarmerId, testSecret, testPublicKey);
    const retrieved = await vault.retrieveSecret(testFarmerId);
    results.checks.key_vault = {
      status: retrieved ? "ok" : "warning",
      provider: process.env.KEY_VAULT_PROVIDER || "local",
      message: retrieved ? "Key Vault working (test secret stored and retrieved)" : "Key Vault is local/non-persistent (development mode)"
    };
  } catch (err) {
    results.checks.key_vault = {
      status: "error",
      error: String(err)
    };
  }
  try {
    const config = getSorobanConfig();
    const validation = validateSorobanConfig(config);
    results.checks.soroban_config = {
      status: validation.valid ? "ok" : "warning",
      network: process.env.STELLAR_NETWORK || "TESTNET",
      contractConfigured: !!config.contractId,
      contractId: config.contractId ? config.contractId.substring(0, 10) + "..." : "NOT CONFIGURED",
      message: validation.error || "Soroban configuration valid"
    };
  } catch (err) {
    results.checks.soroban_config = {
      status: "error",
      error: String(err)
    };
  }
  const envVars = [
    "STELLAR_NETWORK",
    "KEY_VAULT_PROVIDER",
    "SOROBAN_CONTRACT_ID",
    "NODE_ENV",
    "PORT"
  ];
  results.checks.environment = {
    status: "ok",
    variables: Object.fromEntries(
      envVars.map((v) => [
        v,
        process.env[v] ? "✓ set" : "✗ not set"
      ])
    )
  };
  const allChecks = Object.values(results.checks);
  const failureCount = allChecks.filter((c) => c.status === "error").length;
  const warningCount = allChecks.filter((c) => c.status === "warning").length;
  results.summary = {
    totalChecks: allChecks.length,
    passed: allChecks.filter((c) => c.status === "ok").length,
    warnings: warningCount,
    errors: failureCount,
    ready: failureCount === 0
  };
  const statusCode = failureCount > 0 ? 400 : 200;
  return res.status(statusCode).json(results);
}
const verify = withCors(handler);
export {
  verify as default
};
