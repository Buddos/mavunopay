import fs from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(root, "backend", ".env"));
loadEnvFile(path.join(root, "backend", ".env.local"));
const backendHealthUrl = "http://localhost:3002/api/health";

console.log("[dev] Starting MavunoPay (frontend + API backend)...");
console.log("[dev] Frontend proxies /api -> http://localhost:3002");

function run(command, args, label) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`[${label}] stopped (${signal})`);
      return;
    }
    if (code && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
    }
  });

  return child;
}

async function waitForBackend() {
  const maxAttempts = 60;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(backendHealthUrl);
      if (response.ok) {
        console.log("[dev] Backend is ready — starting frontend...");
        return;
      }
    } catch {
      // Backend still starting
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Backend did not become ready within 60 seconds. Check backend logs above.");
}

const backend = run("npm", ["run", "dev", "--prefix", "backend"], "api");

let frontend;
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  if (frontend && !frontend.killed) frontend.kill("SIGTERM");
  if (backend && !backend.killed) backend.kill("SIGTERM");

  setTimeout(() => process.exit(code), 250);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

backend.on("exit", (code) => {
  if (!shuttingDown && frontend && !frontend.killed) {
    shutdown(code ?? 1);
  }
});

try {
  await waitForBackend();
  frontend = run("npm", ["run", "dev:web"], "web");

  frontend.on("exit", (code) => {
    if (!shuttingDown) shutdown(code ?? 0);
  });
} catch (error) {
  console.error(`[dev] ${error.message}`);
  shutdown(1);
}
