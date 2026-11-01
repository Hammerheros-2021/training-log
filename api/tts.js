// Calm spoken guidance for Recover sessions. Turns a short line of text into speech with OpenAI.
const SB = () => (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
async function signedIn(token) {
  if (!token) return false;
  const r = await fetch(`${SB()}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY } });
  return r.ok;
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.OPENAI_API_KEY) return res.status(501).json({ error: 'Voice not set up' });
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!(await signedIn(token))) return res.status(401).json({ error: 'Please sign in again' });
  const text = String((req.body && req.body.text) || '').slice(0, 900).trim();
  if (!text) return res.status(400).json({ error: 'No text' });
  try {
    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.TTS_MODEL || 'gpt-4o-mini-tts',
        voice: process.env.TTS_VOICE || 'sage',
        input: text,
        instructions: 'You are a calm, warm meditation and recovery guide. Speak slowly and softly, with gentle pauses between sentences. Relaxed, reassuring and unhurried.',
        response_format: 'mp3',
      }),
    });
    if (!r.ok) { const t = await r.text(); return res.status(502).json({ error: t.slice(0, 200) }); }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('content-type', 'audio/mpeg');
    res.setHeader('cache-control', 'private, max-age=31536000');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach the voice service' });
  }
}
