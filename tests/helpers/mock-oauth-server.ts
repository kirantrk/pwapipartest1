import http from 'http';

export function createMockOAuth(port = 4010, ttlSeconds = 3) {
  const tokens = new Map<string, number>();
  let issued = 0;

  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');

      if (req.method === 'POST' && req.url === '/oauth/token') {
        const p = new URLSearchParams(raw);
        if (p.get('grant_type') !== 'client_credentials') {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'unsupported_grant_type' }));
        }
        if (p.get('client_id') !== 'my-client' || p.get('client_secret') !== 'my-secret') {
          res.statusCode = 401;
          return res.end(JSON.stringify({ error: 'invalid_client' }));
        }
        const token = `token-${++issued}`;
        tokens.set(token, Date.now() + ttlSeconds * 1000);
        return res.end(JSON.stringify({ access_token: token, token_type: 'Bearer', expires_in: ttlSeconds }));
      }

      if (req.method === 'GET' && req.url === '/api/data') {
        const token = (req.headers.authorization ?? '').replace('Bearer ', '');
        const expiry = tokens.get(token);
        if (!expiry || expiry < Date.now()) {
          res.statusCode = 401;
          return res.end(JSON.stringify({ error: 'invalid_token' }));
        }
        return res.end(JSON.stringify({ data: 'secret' }));
      }

      res.statusCode = 404;
      res.end('{}');
    });
  });

  return {
    start: () => new Promise<void>((resolve) => server.listen(port, resolve)),
    stop: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections?.();
        server.close(() => resolve());
      }),
    tokensIssued: () => issued,
    url: `http://localhost:${port}`,
  };
}