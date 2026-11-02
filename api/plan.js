// Builds a meal plan on the server, so it carries on even if the person closes the app.
// The browser sends the prompts (one per day) and gets an answer straight away; the plan is
// written to the person's own data in Supabase when Claude finishes, and the app picks it up.
import { waitUntil } from '@vercel/functions';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const SB = () => (process.env.SUPABASE_URL || '').replace(/\/+$/, '');

async function signedInUser(token) {
  if (!token) return null;
  const r = await fetch(`${SB()}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY } });
  return r.ok ? r.json() : null;
}

function looseJSON(t) {
  try { return JSON.parse(t); } catch (e) {}
  const f = t.match(/```(?:json)?\s*([\s\S]*?)```/); if (f) { try { return JSON.parse(f[1]); } catch (e) {} }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (e) {} }
  throw new Error('The reply was not readable');
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
// One day's plan. Retries when Claude is busy or the account's per-minute limit is hit (429 / 529 / overloaded),
// waiting as long as Anthropic asks, so a busy minute doesn't fail the whole plan.
async function ask(prompt, deadline) {
  let last = '';
  for (let attempt = 0; attempt < 6; attempt++) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 8000, messages: [{ role: 'user', content: prompt + '\n\nReply with the JSON only, no other text.' }] }),
    });
    let j = {}; try { j = await r.json(); } catch (e) {}
    if (r.ok) {
      if (j.stop_reason === 'max_tokens') { last = 'The reply was cut short'; continue; }
      try { return looseJSON((j.content || []).filter(b => b.type === 'text').map(b => b.text).join('')); } catch (e) { last = e.message; continue; }
    }
    last = (j.error && j.error.message) || `Claude request failed (${r.status})`;
    if (![429, 500, 502, 503, 529].includes(r.status)) break;
    const wait = Math.min(60, Math.max(4, +(r.headers.get('retry-after') || 0) || 5 * (attempt + 1))) * 1000;
    if (Date.now() + wait > deadline) break;
    await sleep(wait);
  }
  throw new Error(last || 'Claude request failed');
}

async function save(token, uid, key, data) {
  const r = await fetch(`${SB()}/rest/v1/entries`, {
    method: 'POST',
    headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'content-type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: uid, kind: 'meta', key, data, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error(`Could not save (${r.status})`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const user = await signedInUser(token);
  if (!user) return res.status(401).json({ error: 'Please sign in again' });
  const { prompts, req: request = '', jobAt } = req.body || {};
  if (!Array.isArray(prompts) || !prompts.length || prompts.length > 5 || prompts.some(p => typeof p !== 'string' || p.length > 120000) || typeof jobAt !== 'string')
    return res.status(400).json({ error: 'Bad request' });

  const work = (async () => {
    try {
      // Days start a few seconds apart (not all at once) to stay inside per-minute limits, retry when busy,
      // and stop retrying in time to save a clear error before the 5-minute cap.
      const deadline = Date.now() + 240000;
      const outs = await Promise.all(prompts.map((p, i) => sleep(i * 8000).then(() => ask(p, deadline)).catch(e => ({ __err: String(e.message || e) }))));
      const ok = outs.filter(o => o && !o.__err);
      if (!ok.length) { await save(token, user.id, 'planJob', { at: jobAt, error: outs[0].__err }); return; }
      const seen = new Set();
      const out = {
        days: ok.flatMap(o => (Array.isArray(o.days) ? o.days : [])).sort((x, y) => String(x.date).localeCompare(String(y.date))),
        shopping: ok.flatMap(o => (Array.isArray(o.shopping) ? o.shopping : [])).filter(x => { const k = String((x && x.name) || '').toLowerCase(); if (!k || seen.has(k)) return false; seen.add(k); return true; }),
      };
      await save(token, user.id, 'planRaw', { out, req: String(request).slice(0, 800), jobAt, createdAt: new Date().toISOString() });
    } catch (e) {
      try { await save(token, user.id, 'planJob', { at: jobAt, error: String(e.message || e) }); } catch (e2) {}
    }
  })();
  waitUntil(work);
  return res.status(202).json({ ok: true });
}
