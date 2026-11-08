// Owner-only list of testers: who signed up, when they last signed in, how much they've logged, and which version they use.
// Needs SUPABASE_SERVICE_ROLE_KEY in Vercel. Only answers for the OWNER_EMAIL account.
const SB = () => (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
export default async function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !process.env.OWNER_EMAIL) return res.status(403).json({ error: 'Not allowed' });
  const me = await fetch(`${SB()}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY } });
  if (!me.ok) return res.status(401).json({ error: 'Please sign in again' });
  const u = await me.json();
  if ((u.email || '').toLowerCase() !== process.env.OWNER_EMAIL.toLowerCase()) return res.status(403).json({ error: 'Not allowed' });
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return res.status(501).json({ error: 'Add SUPABASE_SERVICE_ROLE_KEY in Vercel to turn this on' });
  const H = { apikey: key, Authorization: `Bearer ${key}` };
  try {
    const [ur, pr, er, sr] = await Promise.all([
      fetch(`${SB()}/auth/v1/admin/users?per_page=500`, { headers: H }),
      fetch(`${SB()}/rest/v1/profiles?select=id,name:data->answers->>name`, { headers: H }),
      fetch(`${SB()}/rest/v1/entries?select=user_id,kind,updated_at&kind=in.(day,log)&order=updated_at.desc&limit=20000`, { headers: H }),
      fetch(`${SB()}/rest/v1/entries?select=user_id,data&kind=eq.meta&key=eq.seen`, { headers: H }),
    ]);
    if (!ur.ok) return res.status(502).json({ error: 'Could not read accounts (' + ur.status + ')' });
    const users = ((await ur.json()).users) || [];
    const profs = pr.ok ? await pr.json() : [];
    const ents = er.ok ? await er.json() : [];
    const seen = sr.ok ? await sr.json() : [];
    const name = Object.fromEntries(profs.map(p => [p.id, p.name || '']));
    const act = {};
    ents.forEach(e => { const a = act[e.user_id] || (act[e.user_id] = { days: 0, logs: 0, last: null }); if (e.kind === 'day') a.days++; else a.logs++; if (!a.last || e.updated_at > a.last) a.last = e.updated_at; });
    const ver = Object.fromEntries(seen.map(s => [s.user_id, s.data || {}]));
    const list = users.map(x => ({
      email: x.email, name: name[x.id] || (x.user_metadata && (x.user_metadata.full_name || x.user_metadata.name)) || '',
      joined: x.created_at, confirmed: !!(x.email_confirmed_at || x.confirmed_at), lastSignIn: x.last_sign_in_at,
      setUp: x.id in name, days: (act[x.id] || {}).days || 0, logs: (act[x.id] || {}).logs || 0, lastActive: (act[x.id] || {}).last || null,
      versions: ver[x.id] || {}, me: x.id === u.id,
    })).sort((a, b) => String(b.lastActive || b.lastSignIn || '').localeCompare(String(a.lastActive || a.lastSignIn || '')));
    return res.status(200).json({ list });
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach the database' });
  }
}
