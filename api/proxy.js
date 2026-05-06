/* eslint-disable no-undef */
import crypto from 'crypto';

const UPSTREAM = 'https://hooks.pixly.sh/api';

function verifyToken(token) {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = crypto.createHmac('sha256', process.env.TOKEN_SECRET).update(payload).digest('hex');

  const sigBuf = Buffer.from(sig.length === expected.length ? sig : expected, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(expBuf, sigBuf)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return Date.now() < exp;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  const auth = req.headers.authorization ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // apiPath injected by vercel.json rewrite, e.g. "webhooks" or "webhooks/abc123/requests"
  const { apiPath, ...queryParams } = req.query;
  if (!apiPath) return res.status(400).json({ error: 'Bad request' });

  const upstreamUrl = new URL(`${UPSTREAM}/${apiPath}`);
  for (const [k, v] of Object.entries(queryParams)) {
    upstreamUrl.searchParams.set(k, v);
  }

  const fetchOptions = {
    method: req.method,
    headers: {
      'x-api-key': process.env.API_KEY,
      ...(req.method !== 'GET' && req.method !== 'HEAD' ? { 'Content-Type': 'application/json' } : {}),
    },
  };

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    fetchOptions.body = JSON.stringify(req.body);
  }

  const upstream = await fetch(upstreamUrl.toString(), fetchOptions);
  const data = await upstream.json();
  res.status(upstream.status).json(data);
}
