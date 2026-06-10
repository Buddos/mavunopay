import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { generateKeypair, fundAccountIfNeeded, createTrustline } from '../../lib/stellar';
import { hashPin } from '../../lib/auth';
import {
  ensureFarmersSchema,
  ensureGoalsSchema,
  insertAllocationRules,
  query,
  useSupabase,
} from '../../lib/db';
import { readLocalDb, writeLocalDb } from '../../lib/local-db';

const defaultAllocationRules = [
  { key: 'inputs', pct: 20 },
  { key: 'emergency', pct: 10 },
  { key: 'education', pct: 10 },
  { key: 'disposable', pct: 60 },
];

const SESSION_TTL_MS = 5 * 60 * 1000;

type UssdSession = {
  sessionId: string;
  phoneNumber: string;
  step: 'MENU' | 'REGISTER_NAME' | 'REGISTER_PIN' | 'REGISTER_NATIONAL_ID' | 'CREATE_GOAL_NAME' | 'CREATE_GOAL_TARGET';
  action?: 'register' | 'balance' | 'goal';
  name?: string;
  pin?: string;
  nationalId?: string;
  goalName?: string;
  createdAt: string;
  updatedAt: string;
};

function normalizePhone(phone: string) {
  return phone.trim();
}

function loadSession(sessionId: string): UssdSession | null {
  const db = readLocalDb();
  const session = db.ussdSessions.find((s: any) => s.sessionId === sessionId);
  if (!session) return null;
  if (Date.now() - new Date(session.updatedAt).getTime() > SESSION_TTL_MS) {
    return null;
  }
  return session as UssdSession;
}

function saveSession(session: UssdSession) {
  const db = readLocalDb();
  const existing = db.ussdSessions.find((s: any) => s.sessionId === session.sessionId);
  if (existing) {
    Object.assign(existing, session, { updatedAt: new Date().toISOString() });
  } else {
    db.ussdSessions.push({ ...session, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  writeLocalDb(db);
}

function clearSession(sessionId: string) {
  const db = readLocalDb();
  db.ussdSessions = db.ussdSessions.filter((s: any) => s.sessionId !== sessionId);
  writeLocalDb(db);
}

async function findFarmerByPhone(phone: string) {
  const normalized = normalizePhone(phone);
  if (useSupabase()) {
    await ensureFarmersSchema();
    const result = await query(
      `SELECT id, phone, name, national_id AS "nationalId", stellar_public_key AS "stellarPublicKey", pin FROM farmers WHERE phone = $1 LIMIT 1`,
      [normalized]
    );
    return result.rows[0] || null;
  }
  const db = readLocalDb();
  return db.farmers.find((farmer: any) => farmer.phone === normalized) || null;
}

async function createFarmerAccount(phone: string, name: string, nationalId: string | null, pin: string): Promise<{ farmer: any; funded: { funded: boolean; publicKey: string; [key: string]: any }; alreadyExists?: boolean }> {
  const normalized = normalizePhone(phone);
  const existing = await findFarmerByPhone(normalized);
  if (existing) {
    return { farmer: existing, alreadyExists: true, funded: { funded: true, publicKey: existing.stellarPublicKey } };
  }

  const farmerId = uuidv4();
  const keys = generateKeypair();
  const pinHash = hashPin(pin);
  const farmer = {
    id: farmerId,
    phone: normalized,
    name: name || null,
    nationalId: nationalId || null,
    createdAt: new Date().toISOString(),
    stellarPublicKey: keys.publicKey,
    allocationRules: defaultAllocationRules,
    creditScore: 560,
    creditTier: 'Bronze',
    coopId: null,
    coopRole: 'member',
  };

  if (useSupabase()) {
    await ensureFarmersSchema();
    await ensureGoalsSchema();
    await query(
      `INSERT INTO farmers (id, phone, name, national_id, pin, stellar_public_key, created_at, credit_score, credit_tier, coop_id, coop_role)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [farmerId, normalized, name || null, nationalId || null, pinHash, keys.publicKey, farmer.createdAt, 560, 'Bronze', null, 'member']
    );
    await insertAllocationRules(farmerId, defaultAllocationRules);
  } else {
    const db = readLocalDb();
    db.farmers.push({ ...farmer, pin: pinHash });
    writeLocalDb(db);
  }

  const funded = await fundAccountIfNeeded(keys.publicKey, farmerId, keys.secret);

  if (process.env.USDC_ISSUER && process.env.USDC_CODE) {
    await createTrustline(farmerId, process.env.USDC_CODE, process.env.USDC_ISSUER);
  }

  return { farmer, funded };
}

async function getGoalsForFarmer(farmerId: string) {
  if (useSupabase()) {
    const result = await query(
      `SELECT id, name, balance, target_amount AS "targetAmount", currency FROM goals WHERE farmer_id = $1 ORDER BY created_at DESC`,
      [farmerId]
    );
    return result.rows;
  }
  const db = readLocalDb();
  return db.goals.filter((goal: any) => goal.farmerId === farmerId);
}

async function createGoalForFarmer(farmerId: string, name: string, targetAmount: number) {
  if (useSupabase()) {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    await query(
      `INSERT INTO goals (id, farmer_id, name, target_amount, balance, currency, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, farmerId, name, targetAmount, 0, 'KES', createdAt]
    );
    return { id, name, targetAmount, balance: 0, currency: 'KES' };
  }
  const db = readLocalDb();
  const goal = {
    id: uuidv4(),
    farmerId,
    name,
    targetAmount,
    balance: 0,
    currency: 'KES',
    createdAt: new Date().toISOString(),
  };
  db.goals.push(goal);
  writeLocalDb(db);
  return goal;
}

function formatCurrency(value: number) {
  return `KES ${value.toFixed(0)}`;
}

function buildMainMenu() {
  return 'MavunoPay USSD:\n1. Register\n2. Check savings\n3. Create goal';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Support multiple gateway payloads: JSON, Africa's Talking (form), Twilio (form)
  const raw = req.body as any;

  // Detect provider
  const contentType = (req.headers['content-type'] || '').toString();
  let provider: 'json' | 'africastalking' | 'twilio' = 'json';
  if (raw && (raw.serviceCode || raw.sessionId) && raw.phoneNumber) provider = 'africastalking';
  else if (raw && (raw.From || raw.Body)) provider = 'twilio';

  // Map incoming fields to canonical names
  const sessionId = raw.sessionId || raw.SessionId || raw.session || uuidv4();
  const phoneNumber = raw.phoneNumber || raw.PhoneNumber || raw.From || raw.from || '';
  const text = (raw.text || raw.Text || raw.Body || raw.body || '').toString();

  if (!sessionId || !phoneNumber) {
    return res.status(400).json({ error: 'sessionId and phoneNumber are required' });
  }

  const normalizedPhone = normalizePhone(phoneNumber);
  const input = (text || '').trim();
  let session = loadSession(sessionId);
  if (!session) {
    session = {
      sessionId,
      phoneNumber: normalizedPhone,
      step: 'MENU',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  let response = '';
  let endSession = false;

  const farmer = await findFarmerByPhone(normalizedPhone);

  if (session.step === 'MENU') {
    if (!input) {
      response = buildMainMenu();
    } else {
      switch (input) {
        case '1':
          session.step = 'REGISTER_NAME';
          session.action = 'register';
          response = 'Register with MavunoPay. Enter your full name:';
          break;
        case '2':
          if (!farmer) {
            response = 'No account found for this number. Reply 1 to register.';
            endSession = true;
          } else {
            const goals = await getGoalsForFarmer(farmer.id);
            const totalSaved = goals.reduce((sum: number, goal: any) => sum + Number(goal.balance || 0), 0);
            const goalLines = goals.slice(0, 3).map((goal: any) => `${goal.name}: ${formatCurrency(Number(goal.balance || 0))}`).join('\n');
            response = `Savings summary for ${farmer.name || 'farmer'}:\nTotal saved: ${formatCurrency(totalSaved)}`;
            if (goalLines) {
              response += `\n${goalLines}`;
            }
            response += '\nReply 3 to create a new goal next time.';
            endSession = true;
          }
          break;
        case '3':
          if (!farmer) {
            response = 'You need an account first. Reply 1 to register.';
            endSession = true;
          } else {
            session.action = 'goal';
            session.step = 'CREATE_GOAL_NAME';
            response = 'Create a savings goal. Enter the goal name:';
          }
          break;
        default:
          response = 'Invalid option. Reply with 1, 2, or 3.';
          break;
      }
    }
  } else if (session.step === 'REGISTER_NAME') {
    if (!input) {
      response = 'Please enter your full name to continue registration:';
    } else {
      session.name = input;
      session.step = 'REGISTER_PIN';
      response = 'Enter a 4-digit PIN for your MavunoPay account:';
    }
  } else if (session.step === 'REGISTER_PIN') {
    if (!/^[0-9]{4}$/.test(input)) {
      response = 'PIN must be exactly 4 digits. Enter a 4-digit PIN:';
    } else {
      session.pin = input;
      session.step = 'REGISTER_NATIONAL_ID';
      response = 'Enter your National ID or type 0 to skip:';
    }
  } else if (session.step === 'REGISTER_NATIONAL_ID') {
    const nationalId = input === '0' ? null : input;
    const name = session.name || 'Farmer';
    const pin = session.pin || '0000';
    const registration = await createFarmerAccount(normalizedPhone, name, nationalId, pin);
    if (registration.alreadyExists) {
      response = 'This phone number is already registered. Dial again to check savings or create a goal.';
    } else {
      response = `Registration complete. Welcome ${name}! Your account is now ready.`;
      if (!registration.funded.funded) {
        response += ' Funding is pending; please contact your agent.';
      }
    }
    endSession = true;
    clearSession(session.sessionId);
  } else if (session.step === 'CREATE_GOAL_NAME') {
    if (!input) {
      response = 'Please enter the name of your savings goal:';
    } else {
      session.goalName = input;
      session.step = 'CREATE_GOAL_TARGET';
      response = 'Enter target amount in KES for this goal:';
    }
  } else if (session.step === 'CREATE_GOAL_TARGET') {
    const target = Number(input.replace(/[^0-9.]/g, ''));
    if (Number.isNaN(target) || target <= 0) {
      response = 'Amount must be a valid number greater than zero. Enter the target amount in KES:';
    } else if (!farmer) {
      response = 'We could not find your account. Reply 1 to register.';
      endSession = true;
    } else {
      const goal = await createGoalForFarmer(farmer.id, session.goalName || 'New Goal', target);
      response = `Goal created: ${goal.name} with target ${formatCurrency(target)}.`;
      endSession = true;
      clearSession(session.sessionId);
    }
  }

  if (!endSession) {
    session.updatedAt = new Date().toISOString();
    saveSession(session);
  } else {
    clearSession(session.sessionId);
  }

  if (!response) {
    response = buildMainMenu();
  }

  // Format responses for common gateways
  function escapeXml(unsafe: string) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  if ((req.body as any) && ((req.body as any).serviceCode || (req.body as any).sessionId || (req.body as any).phoneNumber)) {
    // Africa's Talking style: plain text with CON/END prefix
    const prefix = endSession ? 'END ' : 'CON ';
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(prefix + response);
  }

  if ((req.body as any) && (((req.body as any).From) || ((req.body as any).Body))) {
    // Twilio SMS/USSD: respond with TwiML
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(response)}</Message></Response>`;
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    return res.status(200).send(xml);
  }

  // Default JSON response (internal/testing)
  return res.status(200).json({ response, endSession });
}
