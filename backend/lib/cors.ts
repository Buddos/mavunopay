import { NextApiRequest, NextApiResponse } from 'next';

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:8081',
];

const ALLOW_HEADERS =
  'X-CSRF-Token, X-Forwarded-Host, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization';

function getAllowedOrigins(): string[] {
  const env = process.env.CORS_ORIGINS?.trim();
  if (!env) return DEFAULT_ORIGINS;
  return env.split(',').map((origin) => origin.trim()).filter(Boolean);
}

function isLocalDevOrigin(origin: string): boolean {
  if (process.env.NODE_ENV === 'production') return false;

  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function applyCorsHeaders(req: NextApiRequest, res: NextApiResponse): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;

  const allowed = getAllowedOrigins();
  if (!allowed.includes(origin) && !isLocalDevOrigin(origin)) return false;

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  return true;
}

export function withCors(
  handler: (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const originAllowed = applyCorsHeaders(req, res);

    res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', ALLOW_HEADERS);

    if (req.method === 'OPTIONS') {
      res.status(originAllowed ? 204 : 403).end();
      return;
    }

    if (req.headers.origin && !originAllowed) {
      res.status(403).json({ error: 'CORS origin not allowed' });
      return;
    }

    return handler(req, res);
  };
}
