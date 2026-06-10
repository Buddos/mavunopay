import { NextApiRequest, NextApiResponse } from 'next';
import { withCors } from '../../lib/cors';
import { getDataDir } from '../../lib/data-dir';
import { pingDatabase, useSupabase } from '../../lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const storage = useSupabase() ? 'postgres' : 'local-file';
  let database: 'connected' | 'unreachable' | 'not_configured' = 'not_configured';

  if (useSupabase()) {
    try {
      await pingDatabase();
      database = 'connected';
    } catch {
      database = 'unreachable';
    }
  }

  const ok = database !== 'unreachable';

  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    service: 'mavunopay-backend',
    environment: process.env.NODE_ENV || 'development',
    storage,
    database,
    dataDir: storage === 'local-file' ? getDataDir() : undefined,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}

export default withCors(handler);
