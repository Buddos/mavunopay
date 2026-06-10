import crypto from 'crypto';

export function hashPin(pin: string) {
  return crypto.createHash('sha256').update(String(pin)).digest('hex');
}
