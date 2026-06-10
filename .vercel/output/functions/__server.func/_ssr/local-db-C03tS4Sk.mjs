import fs from "fs";
import path from "path";
import { g as getDataDir } from "./db-C9kVyrmy.mjs";
function getDbPath() {
  return path.join(getDataDir(), "db.json");
}
function ensureLocalDbShape(data) {
  return {
    farmers: Array.isArray(data.farmers) ? data.farmers : [],
    goals: Array.isArray(data.goals) ? data.goals : [],
    transactions: Array.isArray(data.transactions) ? data.transactions : [],
    cooperatives: Array.isArray(data.cooperatives) ? data.cooperatives : [],
    withdrawalRequests: Array.isArray(data.withdrawalRequests) ? data.withdrawalRequests : [],
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    loans: Array.isArray(data.loans) ? data.loans : [],
    ussdSessions: Array.isArray(data.ussdSessions) ? data.ussdSessions : [],
    ...data
  };
}
function readLocalDb() {
  const dbPath = getDbPath();
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(ensureLocalDbShape({}), null, 2));
  }
  const raw = fs.readFileSync(dbPath, "utf-8");
  return ensureLocalDbShape(JSON.parse(raw || "{}"));
}
function writeLocalDb(data) {
  fs.writeFileSync(getDbPath(), JSON.stringify(ensureLocalDbShape(data), null, 2));
}
export {
  readLocalDb as r,
  writeLocalDb as w
};
