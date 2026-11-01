// Sends a prompt (and optional photos) to Claude for a signed-in user.
// The Anthropic key stays on the server; the browser never sees it.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

async function signedInUser(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY },
  });
  return r.ok ? r.json() : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const user = await signedInUser(req);
  if (!user) return res.status(401).json({ error: 'Please sign in again' });

  const { prompt, images = [], maxTokens = 8000 } = req.body || {};
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 250000)
    return res.status(400).json({ error: 'Bad request' });

  const content = [
    ...images.slice(0, 4).filter(i => i && i.data && /^image\/(jpeg|png|webp|gif)$/.test(i.media_type))
      .map(i => ({ type: 'image', source: { type: 'base64', media_type: i.media_type, data: i.data } })),
    { type: 'text', text: prompt },
  ];

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: Math.min(16000, Math.max(256, +maxTokens || 8000)),
        messages: [{ role: 'user', content }],
      }),
    });
    const j = await r.json();
    if (!r.ok) {
      const status = r.status === 429 || r.status === 529 ? 429 : 502;
      return res.status(status).json({ error: (j.error && j.error.message) || 'Claude request failed' });
    }
    const text = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    return res.status(200).json({ text, truncated: j.stop_reason === 'max_tokens' });
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach Claude' });
  }
}
