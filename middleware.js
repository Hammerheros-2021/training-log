// Gate for the presentation pages under /deck/.
// A deck page is only sent to someone with a valid access code (deck-access.js).
// The code can be typed on the gate page or included in the link as ?c=CODE;
// once accepted it is remembered in a cookie for 90 days. Each unlock and view
// is written to the Vercel logs with the code's name, so you can see who opened what.
import { next } from '@vercel/functions';
import { SALT, CODES } from './deck-access.js';

export const config = { matcher: ['/deck/:path*'] };

const DECKS = {
  app: { file: '/deck/app.html', title: 'Keel: the member app', desc: 'What the Keel app does for you: check in, follow your plan, eat well, recover and see your progress.' },
  coaches: { file: '/deck/coaches.html', title: 'Keel: for coaches, professionals and clubs', desc: 'How Keel supports the member, the team coach, the physio, the personal trainer, the nutritionist and the club.' },
};
const PUBLIC = /^\/deck\/(preview-[a-z]+\.png|[a-z]+\.webmanifest)$/;
const COOKIE = 'keel_deck';

async function lookup(raw) {
  const code = String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!code || code.length > 40) return null;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SALT + code));
  const h = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  const hit = CODES.find((c) => c.h === h);
  return hit ? { ...hit, code } : null;
}

function cookieValue(req) {
  const m = (req.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : '';
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function gate(deck, url, error) {
  const d = DECKS[deck];
  const host = url.origin;
  const html = `<!doctype html><html lang="en-IE"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#0B0C10">
<title>${esc(d.title)}</title><meta name="description" content="${esc(d.desc)}">
<meta property="og:title" content="${esc(d.title)}"><meta property="og:description" content="${esc(d.desc)}">
<meta property="og:site_name" content="Keel"><meta property="og:type" content="website">
<meta property="og:url" content="${host}${d.file}"><meta property="og:image" content="${host}/deck/preview-${deck}.png?v=2">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/icon.svg?v=2" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap">
<style>
*{box-sizing:border-box;margin:0}html,body{height:100%;background:#0B0C10;color:#F4F5F8;font-family:Inter,Arial,sans-serif;-webkit-font-smoothing:antialiased}
main{min-height:100%;display:flex;flex-direction:column;justify-content:center;gap:22px;max-width:440px;margin:0 auto;padding:40px 24px}
img{width:132px;height:auto}h1{font:600 30px/1.15 'Inter Tight',Arial,sans-serif;letter-spacing:-.5px}
p{color:#9095A3;font-size:16px;line-height:1.5}form{display:flex;flex-direction:column;gap:12px}
label{font:500 12px 'JetBrains Mono',monospace;letter-spacing:2px;color:#9095A3}
input{background:#15171E;border:2px solid #262935;border-radius:12px;color:#F4F5F8;font:500 20px 'JetBrains Mono',monospace;letter-spacing:2px;padding:14px 16px;text-transform:uppercase;outline:none}
input:focus{border-color:#9095A3}button{appearance:none;border:0;border-radius:12px;background:#F4F5F8;color:#0B0C10;font:600 17px Inter,Arial,sans-serif;padding:15px}
.err{color:#FF6B6B;font-size:15px}
</style></head><body><main>
<img src="/keel-wordmark.svg" alt="keel">
<h1>${esc(d.title.replace(/^Keel: /, '').replace(/^./, (c) => c.toUpperCase()))}</h1>
<p>This presentation is private. Enter the access code you were sent.</p>
<form method="post" action="${d.file}"><label for="c">ACCESS CODE</label>
<input id="c" name="c" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="KEEL-XXXXX" required>
${error ? '<span class="err">That code didn’t work. Check it and try again.</span>' : ''}
<button type="submit">Open</button></form>
<p>No code? Ask the person who sent you the link.</p>
</main></body></html>`;
  return new Response(html, {
    status: 401,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
  });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (PUBLIC.test(path)) return next({ headers: { 'x-robots-tag': 'noindex' } });

  const deck = Object.keys(DECKS).find((k) => DECKS[k].file === path || DECKS[k].file === path + '.html');
  if (!deck) return new Response('Not found', { status: 404, headers: { 'x-robots-tag': 'noindex' } });

  let typed = url.searchParams.get('c');
  const viaForm = request.method === 'POST';
  if (viaForm) {
    try { typed = String((await request.formData()).get('c') || ''); } catch (e) { typed = ''; }
  }
  if (typed !== null) {
    const hit = await lookup(typed);
    if (hit && hit.typedOnly && !viaForm && hit.decks.includes(deck)) {
      console.log(JSON.stringify({ deck_access: 'link_refused_typed_only', who: hit.name, deck, at: new Date().toISOString() }));
      return gate(deck, url, false);
    }
    if (!hit || !hit.decks.includes(deck)) {
      console.log(JSON.stringify({ deck_access: 'refused', deck, at: new Date().toISOString() }));
      return gate(deck, url, true);
    }
    console.log(JSON.stringify({ deck_access: 'unlocked', who: hit.name, deck, at: new Date().toISOString() }));
    return new Response(null, {
      status: 303,
      headers: {
        location: DECKS[deck].file + url.hash,
        'set-cookie': `${COOKIE}=${encodeURIComponent(hit.code)}; Path=/deck; Max-Age=7776000; HttpOnly; Secure; SameSite=Lax`,
        'cache-control': 'no-store',
      },
    });
  }

  const hit = await lookup(cookieValue(request));
  if (!hit || !hit.decks.includes(deck)) return gate(deck, url, false);
  console.log(JSON.stringify({ deck_access: 'viewed', who: hit.name, deck, at: new Date().toISOString() }));
  return next({ headers: { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow' } });
}
