import { NextApiRequest, NextApiResponse } from 'next';

export function withCors(handler: (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Forwarded-Host, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Call the handler
    return handler(req, res);
  };
}
