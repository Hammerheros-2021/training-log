// Tells the app whether the signed-in user is the owner (OWNER_EMAIL), without exposing that email.
export default async function handler(req, res) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !process.env.OWNER_EMAIL) return res.status(200).json({ owner: false });
  const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY },
  });
  if (!r.ok) return res.status(200).json({ owner: false });
  const u = await r.json();
  res.status(200).json({ owner: (u.email || '').toLowerCase() === process.env.OWNER_EMAIL.toLowerCase() });
}
