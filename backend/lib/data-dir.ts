import fs from 'fs';
import path from 'path';

/** Resolve JSON data directory for local dev and serverless fallbacks. */
export function getDataDir(): string {
  if (process.env.MAVUNOPAY_DATA_DIR) {
    fs.mkdirSync(process.env.MAVUNOPAY_DATA_DIR, { recursive: true });
    return process.env.MAVUNOPAY_DATA_DIR;
  }

  const candidates = [
    path.join(process.cwd(), 'backend', 'data'),
    path.join(process.cwd(), 'data'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Monorepo: create backend/data when backend folder exists.
  const backendRoot = path.join(process.cwd(), 'backend');
  if (fs.existsSync(backendRoot)) {
    const backendData = path.join(backendRoot, 'data');
    fs.mkdirSync(backendData, { recursive: true });
    return backendData;
  }

  // Vercel serverless without Postgres: ephemeral storage for demos.
  if (process.env.VERCEL && !process.env.DATABASE_URL) {
    const tmpDir = '/tmp/mavunopay-data';
    fs.mkdirSync(tmpDir, { recursive: true });
    return tmpDir;
  }

  const localData = path.join(process.cwd(), 'data');
  fs.mkdirSync(localData, { recursive: true });
  return localData;
}
