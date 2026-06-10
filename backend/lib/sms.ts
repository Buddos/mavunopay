import { readLocalDb } from './local-db';

export async function createNotificationSms(farmerId: string, title: string, message: string) {
  const db = readLocalDb();
  const farmer = db.farmers.find((f: any) => f.id === farmerId);
  const phone = farmer?.phone;
  if (!phone) return null;

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    const body = new URLSearchParams({
      To: phone,
      From: process.env.TWILIO_FROM_NUMBER,
      Body: `${title}: ${message}`,
    });

    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    return { provider: 'twilio' };
  }

  console.info(`Notification to ${phone}: ${title} - ${message}`);
  return { provider: 'console' };
}
