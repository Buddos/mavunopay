import type { NextApiRequest, NextApiResponse } from 'next';
import { withCors } from '../../lib/cors';
import { verifyOtp } from '../../lib/otp';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, otp } = req.body;
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  if (!otp || typeof otp !== 'string' || !otp.trim()) {
    return res.status(400).json({ error: 'OTP is required' });
  }

  const result = await verifyOtp(phone, otp);
  if (!result.valid) {
    return res.status(400).json({ error: result.reason || 'OTP invalid' });
  }

  return res.status(200).json({ success: true });
}

export default withCors(handler);
