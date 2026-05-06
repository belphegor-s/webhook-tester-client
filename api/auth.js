/* eslint-disable no-undef */
import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body ?? {};
  if (!password || password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');

  const sig = crypto.createHmac('sha256', process.env.TOKEN_SECRET).update(payload).digest('hex');

  res.status(200).json({ token: `${payload}.${sig}` });
}
