import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let server = null;

async function getServer() {
  if (!server) {
    const serverModule = await import(path.join(__dirname, '../dist/server/index.mjs'));
    server = serverModule.default;
  }
  return server;
}

export default async function handler(req, res) {
  try {
    const server = await getServer();
    
    const response = await server.fetch(
      new Request(`http://${req.headers.host}${req.url}`, {
        method: req.method,
        headers: req.headers,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
      })
    );
    
    res.statusCode = response.status;
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }
    
    const body = await response.text();
    res.end(body);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
