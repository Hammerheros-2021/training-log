// Turns a short voice recording from the app into text, for a signed-in user.
// Uses OpenAI's speech-to-text. The key stays on the server.
const MODEL = process.env.TRANSCRIBE_MODEL || 'gpt-transcribe';

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
  if (!process.env.OPENAI_API_KEY) return res.status(501).json({ error: 'Voice recording is not set up' });
  const user = await signedInUser(req);
  if (!user) return res.status(401).json({ error: 'Please sign in again' });

  const { audio, mime } = req.body || {};
  if (typeof audio !== 'string' || !audio) return res.status(400).json({ error: 'No audio' });
  const type = /^audio\/(webm|mp4|mpeg|ogg|wav|x-m4a|aac)/.test(mime || '') ? mime.split(';')[0] : 'audio/webm';
  const ext = { 'audio/webm': 'webm', 'audio/mp4': 'mp4', 'audio/x-m4a': 'm4a', 'audio/aac': 'm4a', 'audio/mpeg': 'mp3', 'audio/ogg': 'ogg', 'audio/wav': 'wav' }[type] || 'webm';
  const bytes = Buffer.from(audio, 'base64');
  if (bytes.length > 4 * 1024 * 1024) return res.status(413).json({ error: 'Recording too long' });

  const form = new FormData();
  form.append('file', new Blob([bytes], { type }), `voice.${ext}`);
  form.append('model', MODEL);
  form.append('prompt', 'A person logging their day in a training app: sleep, bed and wake times, energy, mood, stress and soreness out of 5, niggles out of 10, hours of manual labour, desk, driving and family time, training sessions, RPE, food eaten. Irish or British English.');
  try {
    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: form,
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: (j.error && j.error.message) || 'Transcription failed' });
    return res.status(200).json({ text: j.text || '' });
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach the transcription service' });
  }
}
