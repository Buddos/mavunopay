export default async function handler(req, res) {
  try {
    const { default: handler } = await import('../dist/server/index.mjs');
    
    const response = await handler.fetch(
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
