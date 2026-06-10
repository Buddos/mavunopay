import { v4 as uuidv4 } from 'uuid';
import { readLocalDb, writeLocalDb } from './local-db';
import { createNotificationSms } from './sms';

export async function createNotification(farmerId: string, type: string, title: string, message: string) {
  const db = readLocalDb();
  db.notifications.push({
    id: uuidv4(),
    farmerId,
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });
  writeLocalDb(db);

  try {
    await createNotificationSms(farmerId, title, message);
  } catch (err) {
    console.warn('Notification SMS failed', err);
  }
}
