// Pair a wearable through Terra (one connection for Garmin, WHOOP, Oura, Polar, Fitbit, COROS, Suunto and more).
// Switched on when TERRA_DEV_ID and TERRA_API_KEY are set in Vercel. Untested until those keys exist.
const P = { garmin: 'GARMIN', whoop: 'WHOOP', oura: 'OURA', polar: 'POLAR', fitbit: 'FITBIT', coros: 'COROS', suunto: 'SUUNTO' };
export default async function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  const dev = process.env.TERRA_DEV_ID, key = process.env.TERRA_API_KEY;
  if (!dev || !key) return res.status(200).json({ ready: false });
  const device = String(req.query.device || ''), uid = String(req.query.uid || '');
  const provider = P[device];
  if (!provider || !/^[0-9a-f-]{8,}$/i.test(uid)) return res.status(400).json({ error: 'bad request' });
  const base = `https://${req.headers.host}/p3/`;
  try {
    const r = await fetch('https://api.tryterra.co/v2/auth/generateWidgetSession', {
      method: 'POST',
      headers: { 'dev-id': dev, 'x-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({ reference_id: uid, providers: provider, language: 'en', auth_success_redirect_url: base + '#profile', auth_failure_redirect_url: base + '#profile' })
    });
    const j = await r.json();
    if (!r.ok || !j.url) return res.status(502).json({ error: 'terra', detail: j && j.message });
    return res.status(200).json({ url: j.url });
  } catch (e) { return res.status(502).json({ error: 'terra' }); }
}
