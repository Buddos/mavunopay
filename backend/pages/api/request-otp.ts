import type { NextApiRequest, NextApiResponse } from 'next';
import { withCors } from '../../lib/cors';
import { createOtp } from '../../lib/otp';

async function sendOtpSms(phone: string, code: string) {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    const body = new URLSearchParams({
      To: phone,
      From: process.env.TWILIO_FROM_NUMBER,
      Body: `Your MavunoPay verification code is ${code}`,
    });
    try {
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
      return { provider: 'twilio' };
    } catch (err) {
      console.warn('Twilio SMS send failed', err);
    }
  }

  console.info(`OTP for ${phone}: ${code}`);
  return { provider: 'console', preview: code };
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone } = req.body;
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const normalizedPhone = phone.trim();
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await createOtp(normalizedPhone, code, 10);
    const result = await sendOtpSms(normalizedPhone, code);
    return res.status(200).json({ success: true, otpPreview: result.preview, expiresInMinutes: 10 });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to create OTP' });
  }
}

export default withCors(handler);
