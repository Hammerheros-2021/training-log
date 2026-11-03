// Round-trip route suggestions from OpenRouteService. Only used when ORS_KEY is set in Vercel.
// Without the key the app falls back to the free public router, so nothing breaks.
const SB = () => (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
async function signedIn(token) {
  if (!token) return false;
  const r = await fetch(`${SB()}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY } });
  return r.ok;
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.ORS_KEY) return res.status(501).json({ error: 'Route service not set up' });
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!(await signedIn(token))) return res.status(401).json({ error: 'Please sign in again' });
  const b = req.body || {};
  const start = Array.isArray(b.start) ? b.start.map(Number) : null;
  const m = Math.max(1000, Math.min(150000, +b.m || 5000));
  if (!start || start.length < 2 || start.some(x => !isFinite(x))) return res.status(400).json({ error: 'Bad start' });
  const profile = b.kind === 'cycle' ? 'cycling-regular' : 'foot-walking';
  const body = { coordinates: [[start[1], start[0]]], elevation: true, options: { round_trip: { length: m, points: 5, seed: Math.abs(+b.seed || 1) % 1000 } } };
  try {
    const r = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}/geojson`, {
      method: 'POST', headers: { Authorization: process.env.ORS_KEY, 'content-type': 'application/json', accept: 'application/geo+json' }, body: JSON.stringify(body),
    });
    if (!r.ok) return res.status(502).json({ error: 'Route service ' + r.status });
    const j = await r.json();
    const f = j.features && j.features[0];
    if (!f) return res.status(404).json({ error: 'No route' });
    const coords = f.geometry.coordinates.map(c => [Math.round(c[1] * 1e6) / 1e6, Math.round(c[0] * 1e6) / 1e6, c[2] != null ? Math.round(c[2]) : null]);
    const s = (f.properties && f.properties.summary) || {};
    res.setHeader('cache-control', 'no-store');
    return res.status(200).json({ coords, m: s.distance || 0, ascent: f.properties && f.properties.ascent != null ? f.properties.ascent : null });
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach the route service' });
  }
}
