// Spoken guidance for Recover and mobility sessions. Turns a short line of text into speech.
// Prefers real Irish neural voices (Azure: en-IE Emily / Connor) when AZURE_SPEECH_KEY and AZURE_SPEECH_REGION are set.
// Otherwise uses OpenAI speech with a soft Irish accent.
const SB = () => (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
async function signedIn(token) {
  if (!token) return false;
  const r = await fetch(`${SB()}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY } });
  return r.ok;
}
const xml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function azure(text, male) {
  const region = process.env.AZURE_SPEECH_REGION, key = process.env.AZURE_SPEECH_KEY;
  const name = male ? (process.env.AZURE_VOICE_MALE || 'en-IE-ConnorNeural') : (process.env.AZURE_VOICE_FEMALE || 'en-IE-EmilyNeural');
  // Slightly slower and lower than default, with short pauses after sentences, so it sounds unhurried rather than read out.
  const body = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IE"><voice name="${name}"><prosody rate="-12%" pitch="-2%">${xml(text).replace(/([.?!])\s+/g, '$1<break time="450ms"/> ')}</prosody></voice></speak>`;
  const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3', 'User-Agent': 'keel' },
    body,
  });
  if (!r.ok) throw new Error('Azure voice ' + r.status + ': ' + (await r.text()).slice(0, 150));
  return Buffer.from(await r.arrayBuffer());
}

const STYLE = 'Speak with a soft, natural Irish accent, like a calm friend from the west of Ireland. Warm, low and relaxed. Conversational, never theatrical or sing-song. Unhurried, with natural pauses between sentences. Do not sound like an announcer or a robot.';
async function openai(text, male) {
  const tries = male ? [process.env.TTS_VOICE_MALE || 'cedar', 'ash'] : [process.env.TTS_VOICE_FEMALE || 'marin', 'coral'];
  let last = '';
  for (const voice of tries) {
    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.TTS_MODEL || 'gpt-4o-mini-tts', voice, input: text, instructions: STYLE, response_format: 'mp3' }),
    });
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    last = (await r.text()).slice(0, 200);
  }
  throw new Error(last || 'voice failed');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const useAzure = !!(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
  if (!useAzure && !process.env.OPENAI_API_KEY) return res.status(501).json({ error: 'Voice not set up' });
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!(await signedIn(token))) return res.status(401).json({ error: 'Please sign in again' });
  const text = String((req.body && req.body.text) || '').slice(0, 900).trim();
  const male = String((req.body && req.body.voice) || '') === 'male';
  if (!text) return res.status(400).json({ error: 'No text' });
  try {
    let buf;
    if (useAzure) { try { buf = await azure(text, male) } catch (e) { if (!process.env.OPENAI_API_KEY) throw e; buf = await openai(text, male) } }
    else buf = await openai(text, male);
    res.setHeader('content-type', 'audio/mpeg');
    res.setHeader('x-voice-source', useAzure ? 'azure' : 'openai');
    res.setHeader('cache-control', 'private, max-age=31536000');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(502).json({ error: String(e.message || 'Could not reach the voice service').slice(0, 200) });
  }
}
