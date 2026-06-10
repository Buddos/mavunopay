import fs from 'fs';
import path from 'path';
import { getDataDir } from './data-dir';

function getDbPath() {
  return path.join(getDataDir(), 'db.json');
}

export function ensureLocalDbShape(data: any) {
  return {
    farmers: Array.isArray(data.farmers) ? data.farmers : [],
    goals: Array.isArray(data.goals) ? data.goals : [],
    transactions: Array.isArray(data.transactions) ? data.transactions : [],
    cooperatives: Array.isArray(data.cooperatives) ? data.cooperatives : [],
    withdrawalRequests: Array.isArray(data.withdrawalRequests) ? data.withdrawalRequests : [],
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    loans: Array.isArray(data.loans) ? data.loans : [],
    ussdSessions: Array.isArray(data.ussdSessions) ? data.ussdSessions : [],
    ...data,
  };
}

export function readLocalDb() {
  const dbPath = getDbPath();
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(ensureLocalDbShape({}), null, 2));
  }
  const raw = fs.readFileSync(dbPath, 'utf-8');
  return ensureLocalDbShape(JSON.parse(raw || '{}'));
}

export function writeLocalDb(data: any) {
  fs.writeFileSync(getDbPath(), JSON.stringify(ensureLocalDbShape(data), null, 2));
}
