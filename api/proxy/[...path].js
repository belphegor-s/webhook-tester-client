import crypto from 'crypto';

const UPSTREAM = 'https://hooks.pixly.sh/api';

function verifyToken(token) {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = crypto
    .createHmac('sha256', process.env.TOKEN_SECRET)
    .update(payload)
    .digest('hex');

  // timingSafeEqual requires equal-length buffers; hex digests are always 64 chars
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

  const segments = Array.isArray(req.query.path)
    ? req.query.path
    : [req.query.path].filter(Boolean);

  const upstreamUrl = new URL(`${UPSTREAM}/${segments.join('/')}`);
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== 'path') upstreamUrl.searchParams.set(k, v);
  }

  const fetchOptions = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.API_KEY,
    },
  };

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    fetchOptions.body = JSON.stringify(req.body);
  }

  const upstream = await fetch(upstreamUrl.toString(), fetchOptions);
  const data = await upstream.json();
  res.status(upstream.status).json(data);
}
