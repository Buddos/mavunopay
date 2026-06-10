import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

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
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(ensureLocalDbShape({}), null, 2));
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return ensureLocalDbShape(JSON.parse(raw || '{}'));
}

export function writeLocalDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(ensureLocalDbShape(data), null, 2));
}
