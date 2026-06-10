import { v as v4 } from "./wrapper-C1_KymC2.mjs";
import { r as readLocalDb, w as writeLocalDb } from "./local-db-C03tS4Sk.mjs";
async function createNotificationSms(farmerId, title, message) {
  const db = readLocalDb();
  const farmer = db.farmers.find((f) => f.id === farmerId);
  const phone = farmer?.phone;
  if (!phone) return null;
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
    const body = new URLSearchParams({
      To: phone,
      From: process.env.TWILIO_FROM_NUMBER,
      Body: `${title}: ${message}`
    });
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });
    return { provider: "twilio" };
  }
  console.info(`Notification to ${phone}: ${title} - ${message}`);
  return { provider: "console" };
}
async function createNotification(farmerId, type, title, message) {
  const db = readLocalDb();
  db.notifications.push({
    id: v4(),
    farmerId,
    type,
    title,
    message,
    read: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  writeLocalDb(db);
  try {
    await createNotificationSms(farmerId, title, message);
  } catch (err) {
    console.warn("Notification SMS failed", err);
  }
}
export {
  createNotification as c
};
