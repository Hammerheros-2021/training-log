// Keel coach dashboard. Desktop first; works on iPad and phone.
// Reads only what players chose to share, through keel_team_squad() and keel_team_data() (supabase/teams.sql).
// Balance is worked out here with the same maths as the Keel app (Prototype 2 personal balance),
// per player, from their own history.
(function(){
'use strict';
// ================= helpers =================
const $=s=>document.querySelector(s);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const addD=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const addK=(k,n)=>iso(addD(parse(k),n));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const isNum=v=>v!==null&&v!==undefined&&v!==''&&!isNaN(+v);
const clamp01=x=>Math.max(0,Math.min(1,x));
const r1=x=>x==null?null:Math.round(x*10)/10;
const todayK=()=>iso(new Date());
const fmtK=(k,o)=>parse(k).toLocaleDateString('en-IE',o||{weekday:'short',day:'numeric',month:'short'});
const DOW1=k=>'MTWTFSS'[(parse(k).getDay()+6)%7];
const tmin=s=>{if(!s)return null;const m=String(s).match(/^(\d{1,2}):(\d{2})/);return m?(+m[1])*60+(+m[2]):null};
const first=n=>String(n||'').split(' ')[0];
function toast(m,ms){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=m;t.hidden=false;clearTimeout(t._h);t._h=setTimeout(()=>t.hidden=true,ms||2400)}

// Lucide outline icons (ISC licence)
const IC={
 today:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
 trends:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
 load:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
 wellness:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
 avail:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
 setup:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
 sick:'<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
 niggle:'<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M10 10.01h.01M10 14.01h.01M14 10.01h.01M14 14.01h.01M18 6v12M6 6v12"/>',
 down:'<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
 spike:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
 clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 check:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
 frown:'<circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2M9 9h.01M15 9h.01"/>',
 zap:'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
 back:'<path d="m15 18-6-6 6-6"/>',
 copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
 refresh:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5"/>',
 food:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
 mind:'<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M12 5v13"/>',
 note:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/>',
 balance:'<path d="M12 3v18M5 8h14M5 8l-3 7a4 4 0 0 0 6 0L5 8ZM19 8l-3 7a4 4 0 0 0 6 0l-3-7Z"/>',
};
const ico=(n,st)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${st?` style="${st}"`:''}>${IC[n]||''}</svg>`;

// ================= balance: the Keel P2 maths, per player =================
const W0={sleep:18,sleepQ:13,energy:13,mood:9,stress:9,sore:9,pain:10,load:7,debt:5,rhr:5,hrv:10};
const FB_TARGET=[null,25,45,62,80,92];
const FARM=[0,.5,1,1.5,2];
function sleepHours(d){if(!d)return null;const b=tmin(d.bed),w=tmin(d.wake);
  if((d.latency!=null||d.awakeMin!=null)&&b!=null&&w!=null){const a=b+(+d.latency||0);let x=w-a;if(x<=0)x+=1440;x-=(+d.awakeMin||0);return Math.max(0,Math.round(x/6)/10)}
  if(b!=null&&w!=null){let x=w-b;if(x<=0)x+=1440;return Math.round(x/6)/10}return isNum(d.sleepH)?+d.sleepH:null}
const has=(d,t)=>!!(d&&((d.habits||[]).includes(t)||(d.flags||[]).includes(t)));
const maxPain=d=>d&&d.niggles&&d.niggles.length?Math.max(...d.niggles.map(n=>+n.pain||0)):0;
const sRPE=l=>l&&l.status!=='missed'&&l.dur&&l.rpe?l.dur*l.rpe:0;
const extrasLoad=d=>(d&&d.extras||[]).reduce((a,x)=>a+((+x.dur||0)*(+x.rpe||0)),0);
const checkedIn=d=>!!(d&&(d.bed||d.wake||isNum(d.sleepH)||isNum(d.energy)||isNum(d.mood)||isNum(d.sleepQ)));
function corr(a,b){const n=a.length;if(n<3)return null;const ma=avg(a),mb=avg(b);let sab=0,saa=0,sbb=0;for(let i=0;i<n;i++){sab+=(a[i]-ma)*(b[i]-mb);saa+=(a[i]-ma)**2;sbb+=(b[i]-mb)**2}return saa>1e-9&&sbb>1e-9?sab/Math.sqrt(saa*sbb):null}
const band=s=>s==null?null:s>=75?2:s>=55?1:0;
function engine(D,L){
  const M={};const memo=(n,k,f)=>{const key=n+'|'+k;if(key in M)return M[key];return M[key]=f()};
  const load=k=>{const d=D[k];const farm=d&&isNum(d.farmHrs)&&isNum(d.farm)?(+d.farmHrs)*FARM[+d.farm]*60:0;return sRPE(L[k])+extrasLoad(d)+farm};
  const strain=k=>{if(!D[k]&&!L[k])return null;const ld=load(k);if(!ld)return null;return Math.round(210*(1-Math.exp(-ld/1500)))/10};
  const needBase=k=>memo('need',k,()=>{const good=[];for(let i=1;i<=42;i++){const d=D[addK(k,-i)];if(d&&isNum(d.energy)&&+d.energy>=4){const sh=sleepHours(d);if(sh!=null)good.push(sh)}}
    if(good.length<8)return 8;good.sort((a,b)=>a-b);return Math.round(Math.max(6.5,Math.min(9,good[Math.floor(good.length/2)]))*4)/4});
  const need=k=>{const s=strain(addK(k,-1));const raw=Math.round((8+Math.max(0,(s||0)-10)*.1)*10)/10;return Math.round((raw-8+needBase(k))*10)/10};
  const usual=(k,f)=>{const v=[];for(let i=1;i<=14;i++){const x=D[addK(k,-i)];if(x&&isNum(x[f]))v.push(+x[f])}return v.length>=7?avg(v):null};
  const base=(k,f)=>{const v=[];for(let i=1;i<=14;i++){const x=D[addK(k,-i)];if(x&&isNum(x[f]))v.push(+x[f])}return v.length>=4?avg(v):null};
  function parts(d){const k=d.date;const P={};const sh=sleepHours(d);if(sh!=null){P.sleep=clamp01((sh-(need(k)-3))/3)}
    const sl=(f,rev)=>{if(!isNum(d[f]))return;const v=+d[f];const ab=rev?(5-v)/4:(v-1)/4;const u=usual(k,f);if(u==null){P[f]=ab;return}P[f]=.5*ab+.5*clamp01(.75+(rev?(u-v):(v-u))*.25)};
    sl('sleepQ');sl('energy');sl('mood');sl('stress',1);sl('sore',1);
    if(Object.keys(P).length<3)return null;P.pain=1-maxPain(d)/10;
    const ac=.65*load(addK(k,-1))+.35*load(addK(k,-2));let ch=0,cn=0;for(let i=1;i<=28;i++){const kk=addK(k,-i);if(D[kk]||L[kk]){ch+=load(kk);cn++}}
    if(cn>=10&&ch>0)P.load=clamp01(1-(ac/(ch/cn)-1.2)*.5);
    let debt=0,dn=0;for(let i=1;i<=6;i++){const kk=addK(k,-i),s2=sleepHours(D[kk]);if(s2!=null){debt+=Math.max(0,need(kk)-s2);dn++}}if(dn>=3)P.debt=clamp01(1-debt/5);
    const br=isNum(d.rhr)?base(k,'rhr'):null;if(br)P.rhr=clamp01(1-(d.rhr-br)/5);
    const bh=isNum(d.hrv)?base(k,'hrv'):null;if(bh)P.hrv=clamp01(1+(d.hrv/bh-1)*5);return P}
  function cap(d){let c=100;const mp=maxPain(d);if(mp>=5)c=40;else if(mp>=3)c=60;if(has(d,'Sick / run down'))c=Math.min(c,50);
    const sk=d.sick;if(sk&&(sk.on||(sk.types&&sk.types.length)))c=Math.min(c,sk.sev==='bad'?25:sk.sev==='moderate'?40:50);return c}
  function target(d){const f=d&&d.sfb;if(!f||!isNum(f.feel))return null;let t=FB_TARGET[Math.max(1,Math.min(5,Math.round(+f.feel)))];if(f.energy==='low')t-=6;else if(f.energy==='full')t+=6;return Math.max(0,Math.min(100,t))}
  function score(d,raw){const P=parts(d);if(!P)return {s:null};const Ln=raw?null:learn();let tw=0,tv=0;
    Object.keys(P).forEach(f=>{const w=W0[f]*((Ln&&Ln.m[f])||1);tw+=w;tv+=w*P[f]});let s=100*tv/tw;if(Ln&&Ln.off)s+=Ln.off;s=Math.round(Math.max(0,Math.min(100,s)));return {s:Math.min(s,cap(d)),P}}
  function learn(){return memo('learn','',()=>{const rows=[];Object.keys(D).sort().forEach(k=>{const d=D[k];const t=target(d);if(t==null||cap(d)<100)return;const r=score(d,true);if(r.s==null)return;rows.push({t,P:r.P})});
    const n=rows.length;const out={n,m:{},off:0};if(n<6)return out;const trust=n/(n+12);const cs={};
    Object.keys(W0).forEach(f=>{const pr=rows.filter(r=>r.P[f]!=null);if(pr.length<6)return;const c=corr(pr.map(r=>r.P[f]),pr.map(r=>r.t));if(c!=null)cs[f]=c});
    const cbar=Object.values(cs).length?avg(Object.values(cs)):0;Object.keys(cs).forEach(f=>{out.m[f]=Math.round(Math.max(f==='pain'?1:.5,Math.min(1.6,1+(cs[f]-cbar)*2*trust))*100)/100});
    const sc=rows.map(r=>{let tw=0,tv=0;Object.keys(r.P).forEach(f=>{const w=W0[f]*(out.m[f]||1);tw+=w;tv+=w*r.P[f]});return 100*tv/tw});
    out.off=Math.round(Math.max(-12,Math.min(12,avg(rows.map((r,i)=>r.t-sc[i]))*trust)));return out})}
  const bal=k=>memo('b',k,()=>{const d=D[k];if(!checkedIn(d))return null;if(!d.date)d.date=k;return score(d).s});
  const sum=(k,n)=>{let s=0;for(let i=0;i<n;i++)s+=load(addK(k,-i));return s};
  const days=(k,n)=>{let c=0;for(let i=0;i<n;i++){const kk=addK(k,-i);if(D[kk]||L[kk])c++}return c};
  const acwr=k=>memo('acwr',k,()=>{if(days(k,28)<14)return null;const ch=sum(k,28)/4;return ch>0?sum(k,7)/ch:null});
  const debt=k=>{let t=0,n=0;for(let i=0;i<7;i++){const kk=addK(k,-i),s=sleepHours(D[kk]);if(s!=null){t+=Math.max(0,need(kk)-s);n++}}return n?r1(t):null};
  const usualBal=k=>{const v=[];for(let i=1;i<=14;i++){const b=bal(addK(k,-i));if(b!=null)v.push(b)}return v.length>=5?avg(v):null};
  return {bal,load,load7:k=>sum(k,7),chronicWeek:k=>days(k,28)>=14?sum(k,28)/4:null,acwr,need,debt,usualBal,learn,sleep:k=>sleepHours(D[k])};
}

// ================= a player's day =================
function latest(p,k,within,test){for(let i=0;i<=within;i++){const kk=addK(k,-i),d=p.D[kk];if(d&&test(d))return {k:kk,d}}return null}
function dayInfo(p,k){
  return p._di[k]||(p._di[k]=(()=>{
  const d=p.D[k];const ci=checkedIn(d);const s=ci?p.E.bal(k):null;
  const nig=latest(p,k,3,x=>x.niggles&&x.niggles.length);const sick=latest(p,k,2,x=>(x.sick&&x.sick.on)||has(x,'Sick / run down'));
  const pain=nig?maxPain(nig.d):0;const sev=sick?(sick.d.sick&&sick.d.sick.sev)||'mild':null;
  const rs=activeRestr(p,k);const rh=typeof rehabOf==='function'?rehabOf(p.id):null;let av='avail';if(pain>=5||sev==='bad'||(rh&&rh.stage<Math.max(1,rh.stages.length-2)))av='out';else if(pain>=3||sick||rs.length||rh||(s!=null&&s<55))av='mod';
  const st=s==null?'none':s>=75?'good':s>=55?'caution':'alert';
  return {d,ci,s,st,pain,nig,sick:sick?{k:sick.k,sev}:null,av,rs,rh,sleep:ci?sleepHours(d):null}})());
}
// ---------- looks: the same seven as the app (Prototype 3) ----------
const KWM_SRC='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-338 -1011 2347 1292" role="img" aria-label="keel" class="kwm"><defs><linearGradient id="KWMID" gradientUnits="userSpaceOnUse" x1="-298" y1="0" x2="1968" y2="0"><stop offset="0" style="stop-color:var(--logo-a,#E23D9E)"/><stop offset="0.5" style="stop-color:var(--logo-b,#5B6CFF)"/><stop offset="1" style="stop-color:var(--logo-c,#34E3A0)"/></linearGradient></defs><path d="M743.9 -731.0 A569.4 569.4 0 1 0 307.7 204.4 L1932.0 204.4" fill="none" stroke="url(#KWMID)" stroke-width="73.0" stroke-linecap="round" class="kl" pathLength="1"/><path d="M459 0 277 -254H196L427 -543H572L359 -276L362 -346L616 0ZM79 0V-730H218V0Z M889.0 19Q819.0 19 766.5 -5.0Q714.0 -29 679.5 -69.5Q645.0 -110 627.5 -160.0Q610.0 -210 610.0 -262V-281Q610.0 -335 627.5 -385.5Q645.0 -436 679.5 -475.5Q714.0 -515 765.0 -538.5Q816.0 -562 883.0 -562Q971.0 -562 1030.5 -523.5Q1090.0 -485 1120.0 -422.5Q1150.0 -360 1150.0 -288V-238H669.0V-323H1063.0L1020.0 -281Q1020.0 -333 1005.0 -370.0Q990.0 -407 959.5 -427.0Q929.0 -447 883.0 -447Q837.0 -447 805.0 -426.0Q773.0 -405 756.5 -365.5Q740.0 -326 740.0 -271Q740.0 -220 756.0 -180.5Q772.0 -141 805.0 -118.5Q838.0 -96 889.0 -96Q940.0 -96 972.0 -116.5Q1004.0 -137 1013.0 -167H1141.0Q1129.0 -111 1095.0 -69.0Q1061.0 -27 1008.5 -4.0Q956.0 19 889.0 19Z M1459.0 19Q1389.0 19 1336.5 -5.0Q1284.0 -29 1249.5 -69.5Q1215.0 -110 1197.5 -160.0Q1180.0 -210 1180.0 -262V-281Q1180.0 -335 1197.5 -385.5Q1215.0 -436 1249.5 -475.5Q1284.0 -515 1335.0 -538.5Q1386.0 -562 1453.0 -562Q1541.0 -562 1600.5 -523.5Q1660.0 -485 1690.0 -422.5Q1720.0 -360 1720.0 -288V-238H1239.0V-323H1633.0L1590.0 -281Q1590.0 -333 1575.0 -370.0Q1560.0 -407 1529.5 -427.0Q1499.0 -447 1453.0 -447Q1407.0 -447 1375.0 -426.0Q1343.0 -405 1326.5 -365.5Q1310.0 -326 1310.0 -271Q1310.0 -220 1326.0 -180.5Q1342.0 -141 1375.0 -118.5Q1408.0 -96 1459.0 -96Q1510.0 -96 1542.0 -116.5Q1574.0 -137 1583.0 -167H1711.0Q1699.0 -111 1665.0 -69.0Q1631.0 -27 1578.5 -4.0Q1526.0 19 1459.0 19Z M1793.0 0V-730H1932.0V0ZM1725.0 -626V-730H1932.0V-626Z"/></svg>';
let kwmN=0;const kwm=cls=>KWM_SRC.replace(/KWMID/g,'kwm'+(++kwmN)).replace('class="kwm"','class="kwm '+(cls||'')+'"');
const LOOKS=[['bone','Bone','Light paper, forest green'],['forest','Forest','Dark green, emerald fade'],['midnight','Midnight','Dark blue, ice fade'],['dusk','Dusk','Graphite, plum to peach'],['keel','Keel fade','Black, the logo colours'],['platinum','Platinum','Graphite to silver'],['auto','Auto','Bone by day, Forest after dark']];
const SUN=[[8.6,16.6],[8,17.5],[7,18.5],[6.5,20.3],[5.5,21.2],[5,22],[5.2,21.8],[6,20.8],[7,19.6],[7.8,18.4],[8,16.6],[8.6,16.2]];
function lookPref(){let v='auto';try{v=localStorage.getItem('keelLook')||'auto'}catch(e){}return LOOKS.some(x=>x[0]===v)?v:'auto'}
function lookNow(){const v=lookPref();if(v!=='auto')return v;const n=new Date(),h=n.getHours()+n.getMinutes()/60,[r,st]=SUN[n.getMonth()];return h>=r&&h<st?'bone':'forest'}
function applyLook(){const e=lookNow();if(document.documentElement.dataset.look!==e)document.documentElement.dataset.look=e;const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#0B0C10'}
applyLook();setInterval(()=>{const b=document.documentElement.dataset.look;applyLook();if(b!==document.documentElement.dataset.look&&typeof render==='function')render()},5*60000);
const lookCard=()=>{const v=lookPref();return `<section class="card"><header><div><h2>Appearance</h2><p>The same looks as the Keel app. Saved on this device.</p></div></header><div class="looks">${LOOKS.map(([id,n,d])=>`<button type="button" data-look="${id}" aria-pressed="${v===id}"><span class="sw sw-${id}" aria-hidden="true"></span><span><b>${n}</b><small>${d}</small></span></button>`).join('')}</div></section>`};
const sideLooks=()=>{const v=lookPref();return `<div class="sideLooks" role="group" aria-label="Look">${LOOKS.map(([id,n])=>`<button type="button" data-look="${id}" aria-pressed="${v===id}" title="${n}" aria-label="${n}"><span class="sw sw-${id}"></span></button>`).join('')}</div>`};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button[data-look]');if(!b)return;try{localStorage.setItem('keelLook',b.dataset.look)}catch(x){}applyLook();render()});
const ST={good:['var(--good)','Ready'],caution:['var(--caution)','Cap the effort'],alert:['var(--alert)','Back off'],none:['var(--faint)','No check-in']};
const AV={avail:['var(--good)','Available','check'],mod:['var(--caution)','Modify','niggle'],out:['var(--alert)','Unavailable','sick']};
const lastCheckin=(p,k)=>{for(let i=0;i<60;i++){const kk=addK(k,-i);if(checkedIn(p.D[kk]))return kk}return null};
function flagsFor(p,k){
  const i=dayInfo(p,k),E=p.E,out=[];
  if(i.sick)out.push({w:9,ic:'sick',col:'var(--alert)',t:`Unwell${i.sick.sev?` (${i.sick.sev})`:''}`,s:i.sick.k===k?'Logged this morning':'Logged '+fmtK(i.sick.k,{weekday:'long'})});
  i.rs.forEach(n=>out.push({w:8,ic:'clock',col:'var(--caution)',t:'Restriction: '+n.body,s:`${staffLabel(n.author_staff)} · ${n.until_day?'until '+fmtK(n.until_day,{weekday:'short',day:'numeric',month:'short'}):'until further notice'}`}));
  if(i.pain>=3){const area=i.nig.d.niggles.reduce((a,n)=>(+n.pain||0)>(+a.pain||0)?n:a);const prev=latest(p,addK(i.nig.k,-1),5,x=>x.niggles&&x.niggles.some(n=>n.area===area.area));
    const rising=prev&&maxPain(prev.d)<i.pain;out.push({w:i.pain>=5?10:7,ic:'niggle',col:i.pain>=5?'var(--alert)':'var(--caution)',t:`${area.area}${area.side&&area.side!=='Both'?' ('+area.side.toLowerCase()+')':''} ${i.pain}/10`,s:prev?(rising?'Getting worse over the last few days':'Ongoing'):'New niggle'})}
  if(i.s!=null&&i.s<55&&!i.sick&&i.pain<3)out.push({w:6,ic:'balance',col:'var(--alert)',t:`Balance ${i.s}`,s:'Low today. Worth a quick word before training'});
  const ub=E.usualBal(k);if(i.s!=null&&ub!=null&&i.s<=ub-15&&i.s>=55)out.push({w:5,ic:'down',col:'var(--caution)',t:`Balance down ${Math.round(ub-i.s)}`,s:`${i.s} today against a usual ${Math.round(ub)}`});
  if(i.sleep!=null&&i.sleep<6)out.push({w:5,ic:'moon',col:'var(--caution)',t:`${i.sleep} h sleep`,s:(E.debt(k)||0)>=5?`About ${Math.round(E.debt(k))} h short over the week`:'Short night'});
  const a=E.acwr(k);if(a!=null&&a>1.5)out.push({w:6,ic:'spike',col:'var(--alert)',t:'Load spike',s:`This week is ${Math.round(a*100)}% of their usual week`});
  let hs=0;for(let j=0;j<3;j++){const d=p.D[addK(k,-j)];if(d&&+d.stress>=4)hs++}if(hs===3)out.push({w:4,ic:'zap',col:'var(--caution)',t:'Stressed 3 days running',s:'Lighter session or a chat may help'});
  const fb=[];for(let j=0;j<10&&fb.length<3;j++){const d=p.D[addK(k,-j)];if(d&&d.sfb&&isNum(d.sfb.feel))fb.push(+d.sfb.feel)}if(fb.length>=2&&fb.slice(0,2).every(f=>f<=2))out.push({w:4,ic:'frown',col:'var(--caution)',t:'Sessions feeling tough',s:'Last two sessions rated tough or awful'});
  if(!i.ci){const lc=lastCheckin(p,k);const gap=lc?Math.round((parse(k)-parse(lc))/864e5):null;if(gap==null||gap>=3)out.push({w:2,ic:'clock',col:'var(--muted)',t:gap==null?'Never checked in':`No check-in for ${gap} days`,s:lc?'Last on '+fmtK(lc):'Hasn\'t used the app yet'})}
  return out.sort((a,b)=>b.w-a.w)}

// ================= charts (hand-built SVG, with hover) =================
let TIPS={};let tipN=0;
function tipAttr(html){const id='t'+(++tipN);TIPS[id]=html;return `data-tip="${id}"`}
document.addEventListener('mousemove',e=>{const el=e.target.closest&&e.target.closest('[data-tip]');let t=$('.tip');
  if(!el||!TIPS[el.dataset.tip]){if(t)t.hidden=true;return}if(!t){t=document.createElement('div');t.className='tip';document.body.appendChild(t)}
  t.innerHTML=TIPS[el.dataset.tip];t.hidden=false;const w=t.offsetWidth,h=t.offsetHeight;let x=e.clientX+14,y=e.clientY+14;if(x+w>innerWidth-8)x=e.clientX-w-14;if(y+h>innerHeight-8)y=e.clientY-h-14;t.style.left=x+'px';t.style.top=y+'px'});
document.addEventListener('scroll',()=>{const t=$('.tip');if(t)t.hidden=true},true);
function ring(s,size,st){size=size||56;const r=size/2-5,c=2*Math.PI*r,col=ST[st||(s==null?'none':s>=75?'good':s>=55?'caution':'alert')][0];const f=s==null?0:Math.max(.02,s/100);
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Balance ${s??'none'}"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="5"/>
  <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${c*f} ${c}" transform="rotate(-90 ${size/2} ${size/2})"/>
  <text x="50%" y="50%" dy=".35em" text-anchor="middle" font-size="${size*.32}" fill="${s==null?'var(--faint)':'var(--text)'}">${s==null?'–':s}</text></svg>`}
// line chart over dated points; bands = [[from,to,colour]] behind the line
function lineChart(pts,o){o=o||{};const W=o.w||560,H=o.h||170,l=34,r=10,t=10,b=22;const vals=pts.filter(p=>p.y!=null);
  if(vals.length<2)return `<div class="empty">Not enough check-ins yet.</div>`;
  let mn=o.min!=null?o.min:Math.min(...vals.map(p=>p.y)),mx=o.max!=null?o.max:Math.max(...vals.map(p=>p.y));if(mx-mn<1e-6){mx+=1;mn-=1}
  const X=i=>l+(W-l-r)*i/Math.max(1,pts.length-1),Y=v=>t+(H-t-b)*(1-(v-mn)/(mx-mn));
  const ticks=o.ticks||[mn,(mn+mx)/2,mx];let g='';
  (o.bands||[]).forEach(([a,z,c])=>{g+=`<rect x="${l}" y="${Y(Math.min(z,mx))}" width="${W-l-r}" height="${Math.max(0,Y(Math.max(a,mn))-Y(Math.min(z,mx)))}" fill="${c}" opacity=".07"/>`});
  ticks.forEach(v=>{g+=`<line class="gl" x1="${l}" x2="${W-r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${l-6}" y="${Y(v)}" dy=".32em" text-anchor="end">${(o.fmt||Math.round)(v)}</text>`});
  const step=Math.ceil(pts.length/7);pts.forEach((p,i)=>{if((pts.length-1-i)%step===0)g+=`<text class="ax" x="${X(i)}" y="${H-4}" text-anchor="middle">${esc(fmtK(p.k,{day:'numeric',month:'short'}))}</text>`});
  if(o.ref!=null)g+=`<line x1="${l}" x2="${W-r}" y1="${Y(o.ref)}" y2="${Y(o.ref)}" stroke="var(--muted)" stroke-width="1"/><text class="ax" x="${W-r}" y="${Y(o.ref)-5}" text-anchor="end">${esc(o.refLabel||'')}</text>`;
  let d='',pen=false;pts.forEach((p,i)=>{if(p.y==null){pen=false;return}d+=(pen?'L':'M')+X(i).toFixed(1)+' '+Y(p.y).toFixed(1);pen=true});
  const col=o.color||'var(--blue)';g+=`<path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  const lastI=pts.map(p=>p.y!=null).lastIndexOf(true);
  pts.forEach((p,i)=>{if(p.y==null)return;const dc=o.dotColor?o.dotColor(p.y):col;g+=`<circle cx="${X(i)}" cy="${Y(p.y)}" r="${i===lastI?4.5:2.6}" fill="${dc}" stroke="var(--surface)" stroke-width="2"/>`});
  const cw=(W-l-r)/Math.max(1,pts.length-1);pts.forEach((p,i)=>{g+=`<rect x="${X(i)-cw/2}" y="${t}" width="${cw}" height="${H-t-b}" fill="transparent" ${tipAttr(`<b>${esc(fmtK(p.k))}</b>${p.y==null?'No entry':esc(o.tip?o.tip(p):(o.fmt||(v=>r1(v)))(p.y))}`)}/>`});
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label||'Chart')}">${g}</svg></div>`}
function barChart(pts,o){o=o||{};const W=o.w||560,H=o.h||150,l=34,r=10,t=10,b=22;const mx=Math.max(o.max||0,...pts.map(p=>p.y||0),1);
  const n=pts.length,cw=(W-l-r)/n,bw=Math.max(3,Math.min(26,cw-4)),Y=v=>t+(H-t-b)*(1-v/mx);let g='';
  [0,mx/2,mx].forEach(v=>{g+=`<line class="gl" x1="${l}" x2="${W-r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${l-6}" y="${Y(v)}" dy=".32em" text-anchor="end">${(o.fmt||Math.round)(v)}</text>`});
  const step=Math.ceil(n/7);pts.forEach((p,i)=>{const x=l+cw*i+cw/2;if((n-1-i)%step===0)g+=`<text class="ax" x="${x}" y="${H-4}" text-anchor="middle">${esc(p.lab||fmtK(p.k,{day:'numeric',month:'short'}))}</text>`;
    if(p.y>0){const y=Y(p.y),h=H-b-y;g+=`<path d="M${x-bw/2} ${H-b}V${y+Math.min(4,h)}q0 -4 4 -4h${bw-8}q4 0 4 4V${H-b}Z" fill="${p.c||o.color||'var(--blue)'}"/>`}
    g+=`<rect x="${l+cw*i}" y="${t}" width="${cw}" height="${H-t-b}" fill="transparent" ${tipAttr(`<b>${esc(p.lab||fmtK(p.k))}</b>${esc(o.tip?o.tip(p):Math.round(p.y||0))}`)}/>`});
  if(o.ref!=null)g+=`<line x1="${l}" x2="${W-r}" y1="${Y(o.ref)}" y2="${Y(o.ref)}" stroke="var(--text)" stroke-width="1.5"/><text class="ax" x="${W-r}" y="${Y(o.ref)-5}" text-anchor="end" style="fill:var(--text-body)">${esc(o.refLabel||'')}</text>`;
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label||'Chart')}">${g}</svg></div>`}

// ================= state =================
let sb=null,SESSION=null,TEAMS=[],TEAM=null,SQUAD=[],NOTES=[],LOADING=false,ERR='';
const S={k:todayK(),sort:'status',filter:'all',metric:'bal',days:28,nums:false,ptab:null,demoAs:'manager',noteKind:'note'};
const DEMO_ID='demo';
const players=()=>SQUAD.filter(p=>p.role==='member'&&inGrp(p));
function allPlayers(){return SQUAD.filter(p=>p.role==='member')}
const sharing=()=>players().filter(p=>p.share);
const staffList=()=>SQUAD.filter(p=>p.role==='coach');
function mkPlayer(o){const p=Object.assign({D:{},L:{},_di:{},notes:[]},o);p.E=engine(p.D,p.L);return p}
// backroom roles
const STAFF={manager:['Manager','today'],coach:['Coach','today'],sc:['S&C','sc'],physio:['Physio','physio'],nutrition:['Nutrition','nutrition'],mindset:['Mindset','mindset']};
const STAFF_LONG={manager:'Manager',coach:'Coach / selector',sc:'Strength & conditioning',physio:'Physio',nutrition:'Nutritionist',mindset:'Mindset coach'};
const myStaff=()=>isDemo()?S.demoAs:(TEAM&&TEAM.staff)||null;
const isManager=()=>myStaff()==='manager';
const homeView=()=>(STAFF[myStaff()]||STAFF.manager)[1];
const staffLabel=s=>(STAFF[s]||['Staff'])[0];
function activeRestr(p,k){return (p.notes||[]).filter(n=>n.kind==='restriction'&&n.created_at.slice(0,10)<=k&&(!n.until_day||n.until_day>=k))}
function myName(){const me=SQUAD.find(x=>x.id===(SESSION&&SESSION.user.id));return (me&&me.name)||((SESSION&&SESSION.user.email)||'').split('@')[0]||'Staff'}

// ================= demo squad (made up, never stored) =================
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
function buildDemo(){
  const R=rng(20261107);const rnd=(a,b)=>a+(b-a)*R();const ri=(a,b)=>Math.round(rnd(a,b));const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  const names=['Cian Gallagher','Oisín McGovern','Darragh Flynn','Ronan Clancy','Eoin McSharry','Seán Rooney','Pádraig Keaney','Conor Gilmartin','Niall Dolan','Ciarán Mulvey','Fiachra Feeney','Tadhg Ward','Rory McTernan','Shane Meehan','Aidan Rooney','Liam Kelly','Kevin Moran','Dylan Fowley','Jack Gaffney','Ultan Brennan','Mark Harte','Diarmuid Leonard','Colm Travers','Brian McHugh'];
  const POS=['Goalkeeper','Corner-back','Full-back','Corner-back','Wing-back','Centre-back','Wing-back','Midfield','Midfield','Wing-forward','Centre-forward','Wing-forward','Corner-forward','Full-forward','Corner-forward','Goalkeeper','Back','Back','Midfield','Forward','Forward','Back','Forward','Midfield'];
  const T=todayK(),N=70;const out=[];
  names.forEach((nm,ix)=>{const p={id:'demo'+ix,name:nm,pos:POS[ix],role:'member',share:true,food:ix%4!==3,about:{name:nm,sport:['GAA football']}};const flog=rnd(.45,.95),pro=ix===5?rnd(85,100):rnd(120,185),kc=rnd(2300,3000);const D={},L={};
    const sb0=rnd(6.7,8.1),eb=rnd(3.1,4),stb=rnd(1.8,2.8),ci=ix===21?.35:rnd(.72,.97),farm=ix%5===0,gym=ix%3===0,run=ix%4===1,bedB=rnd(22.4,23.6);
    for(let i=N;i>=0;i--){const k=addK(T,-i),dow=(parse(k).getDay()+6)%7;const yd=(parse(addK(k,-1)).getDay()+6)%7;
      const post=yd===6?1:yd===5||yd===1||yd===3?.4:0;let sl=cl(sb0+rnd(-.9,.7)-(dow===5?.3:0),4.5,9.5),e=eb-post*.6+rnd(-.8,.8),m=3.4+rnd(-.9,.9),st=stb+rnd(-.8,1),so=1.4+post*1.4+rnd(-.5,.7);
      let nig=null,sick=null,sev=null;
      if(ix===2&&i<=3){nig={area:'Hamstring',side:'Left',pain:[5,4,3,2][i]};so+=1}
      if(ix===8&&i<=1)nig={area:'Calf / Achilles',side:'Right',pain:3};
      if(ix===16&&i>=20&&i<=26)nig={area:'Ankle',side:'Left',pain:[2,3,4,4,3,2,2][i-20]};
      if(ix===6&&i<=1){sick=true;sev=i===0?'bad':'moderate';e-=1.6;m-=1}
      if(ix===14&&i<=5){sl=rnd(4.8,5.8);e-=1.2;m-=.4}
      if(ix===4&&i<=2){st=5;m=2;sl-=.6}
      if(ix===12&&i<=6){e-=.8}
      if(ix===18&&i===0)sl=5.6;
      const skip0=R()>ci;const skip=(ix===19&&i<=3)||(ix===23&&i===0)||(ix===10&&i===0)||(skip0&&!(i<=1&&[2,4,6,8,12,14,16,18].includes(ix)));
      const extras=[];
      if(dow===1||dow===3)extras.push({kind:'Club training',dur:ri(70,85),rpe:ri(6,8)});
      if(dow===5&&i>0)extras.push({kind:'Club training',dur:ri(50,60),rpe:ri(4,5)});
      if(dow===6&&i>0&&!(ix===2&&i<3))extras.push({kind:'Match',dur:ix<15?ri(55,70):ri(10,35),rpe:ri(8,9)});
      if(ix===10&&i<=6&&i>0)extras.push({kind:'Gym',dur:ri(80,95),rpe:ri(8,9)});
      if(i===0)extras.length=0;
      const d={date:k};
      if(!skip){const bm=Math.round((bedB+rnd(-.5,.6))*60),wm=bm+Math.round(sl*60);d.bed=pad(Math.floor(bm/60)%24)+':'+pad(bm%60);d.wake=pad(Math.floor(wm/60)%24)+':'+pad(wm%60);
        d.sleepQ=cl(Math.round(2.6+(sl-6.5)*.8+rnd(-.6,.6)),1,5);d.energy=cl(Math.round(e+(sl-7)*.4),1,5);d.mood=cl(Math.round(m),1,5);d.stress=cl(Math.round(st),1,5);d.sore=cl(Math.round(so),1,5);
        if(nig)d.niggles=[nig];if(sick)d.sick={on:true,sev};if(R()<.25&&ix%2===0)d.rhr=ri(50,58)+(sick?7:0)}
      if(!skip&&p.food&&R()<flog){const tr=extras.length||(i>0&&((gym&&dow===0)||(run&&dow===2)));const pool=['oats','spinach','broccoli','carrot','onion','garlic','tomato','pepper','apple','banana','blueberries','lentils','chickpeas','potato','sweet potato','kale','rice','peas','beans','mushroom','avocado','walnuts','almonds','cabbage','leek','orange','berries','quinoa','pumpkin seeds','beetroot'];const np=ix===5?ri(2,4):ri(3,9),pl=[];for(let j=0;j<np;j++)pl.push(pool[Math.floor(R()*pool.length)]);
        d.food={n:ri(3,7),kcal:Math.round(kc+(tr&&ix!==9?rnd(250,600):0)+rnd(-300,300)),protein:Math.round(pro+rnd(-25,20)),carbs:Math.round(rnd(180,340)+(tr?60:0)),fat:Math.round(rnd(70,120)),fibre:Math.round(rnd(14,40)),iron:r1(rnd(7,16)),calcium:Math.round(rnd(550,1300)),vitD:r1(rnd(2,16)),omega3:Math.round(rnd(.1,2.4)*100)/100,plants:[...new Set(pl)],water:r1(rnd(1.2,3.2))}}
      if(!skip&&ix%7!==3&&R()<(ix%3===0?.45:.2)){const kinds=['Foam roll','Stretching','Walk','Massage gun','Yoga'];d.recovery=[{kind:kinds[Math.floor(R()*kinds.length)],min:ri(10,30)}]}
      if(!skip&&dow===0&&R()<.4)d.hc=[{type:R()<.5?'Cold plunge or ice bath':'Sea or lake swim',min:ri(3,10)}];
      if(!skip&&R()<.12)d.mobility=[{name:'Hips and hamstrings',min:ri(8,15)}];
      if(extras.length)d.extras=extras;if(farm&&dow<5){d.farm=ri(1,3);d.farmHrs=ri(3,7)}
      if(i>0&&((gym&&dow===0)||(run&&dow===2))){const miss=R()<.12;L[k]={date:k,type:gym&&dow===0?'S':'E',status:miss?'missed':'done',dur:gym&&dow===0?ri(45,60):ri(30,45),rpe:gym&&dow===0?ri(6,8):ri(3,5)}}
      if(i>0&&(extras.length||L[k])&&!skip&&R()<.75){let f=cl(Math.round(2.3+(d.energy||3)*.45+rnd(-.8,.8)),1,5);if(ix===12&&i<=6)f=ri(1,2);d.sfb={feel:f,energy:f>=4?'full':f<=2?'low':'steady',effort:f<=2?'harder':'right',trend:'unsure'}}
      if(Object.keys(d).length>1)D[k]=d}
    out.push(mkPlayer(Object.assign(p,{D,L})))});
  const ago=n=>new Date(Date.now()-n*864e5).toISOString();let nid=0;const NT=(pi,who,st,kind,body,days,until)=>({id:'dn'+(++nid),team_id:DEMO_ID,player_id:'demo'+pi,author_id:'staff-'+st,author_name:who,author_staff:st,kind,body,until_day:until==null?null:addK(T,until),created_at:ago(days)});
  const notes=[NT(2,'Aoife (physio)','physio','restriction','No sprinting, kicking or contact. Bike and upper body only.',0,7),NT(2,'Mark (S&C)','sc','note','Swapped his pitch session for bike intervals and upper body.',0),
    NT(6,'Darren','manager','note','Off with a flu. Told him to stay home until he\'s 24 hours clear.',0),NT(14,'Niamh (mindset)','mindset','note','New baby at home. Keep sessions short this fortnight and check in after training.',3),
    NT(10,'Mark (S&C)','sc','note','Doing extra gym on his own most days. Talk to him about the load before Sunday.',1),NT(16,'Aoife (physio)','physio','restriction','Ankle: no cutting drills.',22,-14),NT(8,'Aoife (physio)','physio','restriction','Calf: limit sprints to 80%.',0,3)];
  return {squad:out,notes}}

// ================= data =================
async function loadTeams(){const {data,error}=await sb.rpc('keel_my_teams');if(error){ERR=/keel_my_teams|function|schema/i.test(error.message||'')?'setup':error.message;return []}
  ERR='';const all=data||[];if(all.length&&!('staff' in all[0]))ERR='upgrade';return all.filter(t=>t.role==='coach')}
async function loadSquad(t){
  if(t.team_id===DEMO_ID){const d=buildDemo();SQUAD=d.squad;NOTES=d.notes;attachNotes();await loadSC(t);await loadNut(t);await loadRehab(t);await loadHub(t);SQUAD.forEach(p=>p._di={});return}
  const from=addK(todayK(),-80),to=todayK();
  const {data:sq,error:e1}=await sb.rpc('keel_team_squad',{t:t.team_id});if(e1)throw e1;
  const rows=[];for(let off=0;off<50000;off+=1000){const {data,error}=await sb.rpc('keel_team_data',{t:t.team_id,from_day:from,to_day:to}).range(off,off+999);if(error)throw error;rows.push(...(data||[]));if(!data||data.length<1000)break}
  const by={};(sq||[]).forEach(m=>{by[m.user_id]=mkPlayer({id:m.user_id,name:m.display_name||(m.about&&m.about.name)||'Player',pos:m.pos||'',role:m.role,staff:m.staff,share:m.share,food:!!m.share_food,meals:!!m.share_meals,joined:m.joined_at,about:m.about||{}})});
  rows.forEach(r=>{const p=by[r.user_id];if(!p)return;if(r.kind==='meta'){p.TP=r.data;return}(r.kind==='day'?p.D:p.L)[r.key]=Object.assign({date:r.key},r.data)});
  SQUAD=Object.values(by).sort((a,b)=>a.name.localeCompare(b.name));
  const {data:nt}=await sb.from('team_notes').select('*').eq('team_id',t.team_id).order('created_at',{ascending:false}).limit(1000);NOTES=nt||[];attachNotes();await loadSC(t);await loadNut(t);await loadRehab(t);try{await loadHub(t)}catch(e){HUB.missing=true}SQUAD.forEach(p=>p._di={})}
function attachNotes(){SQUAD.forEach(p=>{p.notes=NOTES.filter(n=>n.player_id===p.id);p._di={}})}
async function selectTeam(id){TEAM=TEAMS.find(t=>t.team_id===id)||TEAMS[0];S.grp='';S.calGrp=null;try{localStorage.setItem('keelCoachTeam',TEAM.team_id)}catch(e){}LOADING=true;render();
  try{await loadSquad(TEAM)}catch(e){toast('Could not load the squad: '+(e.message||e),5000);SQUAD=[];NOTES=[]}LOADING=false;render()}

// ================= views =================
const VIEWS=[['today','Overview','today','Squad'],['calendar','Calendar','cal','Squad'],['messages','Messages','msg','Squad'],['sc','S&C','load','Backroom'],['physio','Physio','avail','Backroom'],['nutrition','Nutrition','food','Backroom'],['mindset','Mindset','mind','Backroom'],['recovery','Recovery','moon','Backroom'],['trends','Squad trends','trends','Tools'],['setup','Team','setup','Tools']];
function route(){const h=location.hash.slice(1).split('/');const v=h[0];return {v:VIEWS.some(x=>x[0]===v)||v==='player'?v:(v?'today':homeView()),id:decodeURIComponent(h[1]||'')}}
const isDemo=()=>TEAM&&TEAM.team_id===DEMO_ID;
function shell(body,title){const rt=route();const cur=rt.v==='player'?'':rt.v;const mine=homeView();
  let grp='';const nav=VIEWS.map(([v,l,ic,g])=>{const h=g!==grp?`<div class="navh">${g}</div>`:'';grp=g;const ub=v==='messages'?unreadTotal():0;return h+`<a href="#${v}" ${cur===v?'aria-current="page"':''}>${ico(ic)}<span>${l}</span>${ub?`<em class="ubn">${ub}</em>`:v===mine?'<em>You</em>':''}</a>`}).join('');
  const teamSel=`<select class="sel" id="teamSel" aria-label="Team">${TEAMS.map(t=>`<option value="${esc(t.team_id)}" ${TEAM&&t.team_id===TEAM.team_id?'selected':''}>${esc(t.name)}</option>`).join('')}</select>`;
  const canFwd=S.k<todayK();const ms=myStaff();
  const demo=isDemo()?`<div class="demo-note">${ico('zap','width:16px;height:16px;flex:none')}<span style="flex:1"><b>Demo squad.</b> Made-up players to show what each member of the backroom team sees.</span>
    <label class="small" style="display:flex;align-items:center;gap:8px;white-space:nowrap">Viewing as <select class="sel" id="demoAs" style="padding:5px 8px">${Object.keys(STAFF_LONG).filter(s=>s!=='coach').map(s=>`<option value="${s}" ${S.demoAs===s?'selected':''}>${esc(STAFF_LONG[s])}</option>`).join('')}</select></label></div>`:'';
  const ask=!isDemo()&&TEAM&&!ms&&ERR!=='upgrade'?`<div class="demo-note"><span style="flex:1"><b>What's your role on the team?</b> It decides which page you land on. Everyone on the staff can see every page.</span>${roleSelect('myRole','')}</div>`:'';
  const upg=ERR==='upgrade'?`<div class="demo-note" style="border-color:var(--caution)"><span><b>One more database step.</b> Run the updated <b>supabase/teams.sql</b> in Supabase once (same as before) to switch on staff roles, food sharing and notes.</span></div>`:'';
  return `<div class="shell"><aside class="side"><div class="logo">${kwm()}<span>Staff</span></div><nav class="nav">${nav}</nav>
    <div class="foot">${sideLooks()}${ms?`<span class="chip" style="align-self:flex-start">${esc(STAFF_LONG[ms]||'Staff')}</span>`:''}<span>${esc(SESSION&&SESSION.user.email||'')}</span><button id="signOut">Sign out</button></div></aside>
  <div class="main"><div class="top">${kwm('mlogo')}<h1>${esc(title)}</h1><span class="sp"></span>${groupFilter()}${teamSel}
    <div class="datenav"><button id="dPrev" aria-label="Day before">‹</button><b>${S.k===todayK()?'Today':esc(fmtK(S.k))}</b><button id="dNext" aria-label="Day after" ${canFwd?'':'disabled'}>›</button></div>
    <button class="btn ghost sm" id="reload" aria-label="Refresh" title="Refresh">${ico('refresh','width:16px;height:16px')}</button></div>
  <main class="page">${upg}${demo}${ask}${body}</main></div>
  <nav class="tabs">${VIEWS.filter(v=>v[0]!=='trends').map(([v,l,ic])=>{const ub=v==='messages'?unreadTotal():0;return `<a href="#${v}" ${cur===v?'aria-current="page"':''}>${ico(ic)}<span>${l}</span>${ub?`<em class="ubt">${ub}</em>`:''}</a>`}).join('')}</nav></div>`}
const roleSelect=(id,cur)=>`<select class="sel" id="${id}">${cur?'':'<option value="">Choose…</option>'}${Object.entries(STAFF_LONG).filter(([s])=>s!=='manager'||cur==='manager'||isManager()).map(([s,l])=>`<option value="${s}" ${cur===s?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
function needTeam(){return `<div class="card"><div class="empty"><h2 style="margin-bottom:8px">No players sharing yet</h2><p>Hand out your team's player code on the <a href="#setup">Team</a> page. Players appear here as soon as they join.</p></div></div>`}
const seg=(key,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button data-set="${key}" data-val="${v}" aria-pressed="${String(S[key])===String(v)}">${l}</button>`).join('')}</div>`;
const kpiTile=(v,l,o)=>{o=o||{};return `<div class="kpi">${o.ic?`<div class="ic" style="color:${o.col||'var(--blue)'}">${ico(o.ic)}</div>`:''}<div style="min-width:0"><div class="v">${v}</div><div class="l">${l}</div>${o.d?`<div class="d">${o.d}</div>`:''}</div></div>`};
const kpiRow=(tiles)=>`<div class="kpis" style="--n:${tiles.length}">${tiles.join('')}</div>`;
const painChip=v=>`<span class="chip ${v>=5?'alert':v>=3?'caution':''}">${v}/10</span>`;
const sevChip=(v,good,warn,txt)=>`<span class="chip ${v==null?'':v>=good?'good':v>=warn?'caution':'alert'}">${txt}</span>`;

function viewToday(){const k=S.k,ps=sharing();if(!ps.length)return needTeam();
  const inf=ps.map(p=>({p,i:dayInfo(p,k)}));const cin=inf.filter(x=>x.i.ci);const sc=cin.map(x=>x.i.s).filter(s=>s!=null);
  const cnt={good:0,caution:0,alert:0,none:0};inf.forEach(x=>cnt[x.i.st]++);
  const av={avail:0,mod:0,out:0};inf.forEach(x=>av[x.i.av]++);
  const yk=addK(k,-7);const ysc=ps.map(p=>dayInfo(p,yk).s).filter(s=>s!=null);const sAvg=sc.length?Math.round(avg(sc)):null,yAvg=ysc.length?Math.round(avg(ysc)):null;
  const sl=cin.map(x=>x.i.sleep).filter(v=>v!=null);
  const split=(parts)=>`<div class="split">${parts.filter(p=>p[0]).map(([n,c])=>`<i style="flex:${n};background:${c}"></i>`).join('')}</div>`;
  const kpis=`<div class="kpis">
   <div class="kpi" style="flex-direction:column;align-items:stretch;gap:0"><div class="v">${cin.length}<small>/ ${ps.length}</small></div><div class="l">Checked in ${k===todayK()?'today':''}</div>${split([[cin.length,'var(--blue)'],[ps.length-cin.length,'var(--none)']])}</div>
   <div class="kpi">${ring(sAvg,58)}<div><div class="v" style="font-size:18px">Squad balance</div><div class="d">${yAvg!=null&&sAvg!=null?`${sAvg>=yAvg?'+':''}${sAvg-yAvg} on this day last week`:'Average of today\'s check-ins'}</div></div></div>
   <div class="kpi" style="flex-direction:column;align-items:stretch;gap:0"><div class="v">${cnt.good}<small> ready</small></div><div class="l">${cnt.caution} cap the effort · ${cnt.alert} back off</div>${split([[cnt.good,'var(--good)'],[cnt.caution,'var(--caution)'],[cnt.alert,'var(--alert)'],[cnt.none,'var(--none)']])}</div>
   <button class="kpi" data-go="avail" style="flex-direction:column;align-items:stretch;gap:0"><div class="v">${av.mod+av.out}<small> limited</small></div><div class="l">${av.mod} modify · ${av.out} unavailable</div>${split([[av.avail,'var(--good)'],[av.mod,'var(--caution)'],[av.out,'var(--alert)']])}</button>
   <div class="kpi"><div class="ic" style="color:var(--blue)">${ico('moon')}</div><div><div class="v">${sl.length?r1(avg(sl)):'–'}<small>h</small></div><div class="l">Average sleep last night</div></div></div></div>`;
  const fl=[];ps.forEach(p=>flagsFor(p,k).forEach((f,j)=>fl.push({p,f,j})));
  const top={};fl.forEach(x=>{if(!top[x.p.id]||top[x.p.id].f.w<x.f.w)top[x.p.id]=x});
  const flagList=Object.values(top).sort((a,b)=>b.f.w-a.f.w);
  const flags=`<section class="card"><header><div><h2>Needs a word</h2><p>The one thing worth knowing about each player, most important first</p></div></header>
    <div class="flags">${flagList.length?flagList.slice(0,12).map(({p,f})=>{const more=flagsFor(p,k).length-1;return `<button class="flag" data-player="${esc(p.id)}"><span class="ic" style="background:color-mix(in srgb,${f.col} 15%,transparent);color:${f.col}">${ico(f.ic)}</span><span class="who"><b>${esc(p.name)} · ${esc(f.t)}</b><span>${esc(f.s)}${more>0?` · +${more} more`:''}</span></span></button>`}).join(''):`<div class="empty">${ico('check','width:28px;height:28px;color:var(--good)')}<p style="margin-top:8px">Nothing stands out. Everyone looks good to go.</p></div>`}</div></section>`;
  let list=inf.slice();if(S.filter!=='all')list=list.filter(x=>S.filter==='none'?!x.i.ci:x.i.av===S.filter);
  const ord={alert:0,caution:1,good:2,none:3},aord={out:0,mod:1,avail:2};
  list.sort((a,b)=>S.sort==='name'?a.p.name.localeCompare(b.p.name):S.sort==='pos'?(a.p.pos||'zz').localeCompare(b.p.pos||'zz')||a.p.name.localeCompare(b.p.name):(aord[a.i.av]-aord[b.i.av])||(ord[a.i.st]-ord[b.i.st])||((a.i.s??999)-(b.i.s??999)));
  const tile=({p,i})=>{const [c,l]=ST[i.st];const chips=[];
    if(i.av!=='avail'&&(i.pain>=3||i.sick))chips.push(`<span class="chip ${i.av==='out'?'alert':'caution'}">${ico(i.sick?'sick':'niggle')}${i.sick?'Unwell':esc(i.nig.d.niggles[0].area.split(' ')[0])+' '+i.pain}</span>`);
    if(i.rs&&i.rs.length&&!(i.pain>=3||i.sick))chips.push(`<span class="chip caution">${ico('clock')}Restricted</span>`);
    if(i.sleep!=null)chips.push(`<span class="chip">${ico('moon')}${i.sleep} h</span>`);
    if(i.d&&i.d.trainIntent==='no')chips.push(`<span class="chip">${ico('clock')}Not training</span>`);
    const a=p.E.acwr(k);if(a!=null&&a>1.5)chips.push(`<span class="chip alert">${ico('spike')}Load</span>`);
    return `<button class="pt ${i.ci?'':'none'}" data-player="${esc(p.id)}"><span class="bar" style="background:${c}"></span><div class="row">${ring(i.s,52,i.st)}<div style="min-width:0"><div class="nm">${esc(p.name)}</div><div class="ps">${esc(p.pos||'')}</div><div class="ps" style="color:${i.ci?c:'var(--muted)'};font-weight:500;margin-top:2px">${i.av==='out'?'Unavailable':l}</div></div></div><div class="chips">${chips.join('')}</div></button>`};
  const seg=(key,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button data-set="${key}" data-val="${v}" aria-pressed="${S[key]===v}">${l}</button>`).join('')}</div>`;
  const board=`<section class="card"><header><div><h2>Squad</h2><p>Balance from each player's morning check-in. Tap a player for their detail.</p></div></header>
    <div class="toolbar" style="margin-bottom:14px">${seg('filter',[['all','Everyone'],['avail','Available'],['mod','Modify'],['out','Unavailable'],['none','Not checked in']])}<span style="flex:1"></span>${seg('sort',[['status','Most at risk'],['name','Name'],['pos','Position']])}</div>
    ${list.length?`<div class="board">${list.map(tile).join('')}</div>`:'<div class="empty">No one in this group.</div>'}
    <div class="legend" style="margin-top:14px"><span><i style="background:var(--good)"></i>Ready (75+)</span><span><i style="background:var(--caution)"></i>Cap the effort (55–74)</span><span><i style="background:var(--alert)"></i>Back off (under 55)</span><span><i style="background:var(--none)"></i>No check-in</span></div></section>`;
  return kpis+`<div class="grid g-today">${board}${flags}</div>`}

const METRICS={bal:['Balance',(p,k)=>dayInfo(p,k).s,v=>v],sleep:['Sleep (h)',(p,k)=>dayInfo(p,k).sleep,v=>r1(v)],energy:['Energy',(p,k)=>{const d=p.D[k];return d&&isNum(d.energy)?+d.energy:null},v=>v],
  stress:['Stress',(p,k)=>{const d=p.D[k];return d&&isNum(d.stress)?+d.stress:null},v=>v],sore:['Body soreness',(p,k)=>{const d=p.D[k];return d&&isNum(d.sore)?+d.sore:null},v=>v],load:['Load',(p,k)=>{const l=p.E.load(k);return l>0?l:null},v=>Math.round(v)]};
function cellColour(m,v){if(v==null)return '';if(m==='bal')return v>=75?'var(--good)':v>=55?'var(--caution)':'var(--alert)';
  let t;if(m==='sleep')t=(v-5)/4;else if(m==='load')t=v/900;else if(m==='energy')t=(v-1)/4;else t=(v-1)/4;// stress/sore: higher = stronger colour
  t=Math.max(.08,Math.min(1,t));const base=m==='stress'||m==='sore'?'var(--caution)':'var(--blue)';return `color-mix(in srgb,${base} ${Math.round(12+t*78)}%,var(--surface))`}
function viewTrends(){const ps=sharing();if(!ps.length)return needTeam();const n=S.days,keys=[];for(let i=n-1;i>=0;i--)keys.push(addK(S.k,-i));const [lab,get,fmt]=METRICS[S.metric];
  const head=`<tr><th></th>${keys.map(k=>`<th class="${DOW1(k)==='M'?'wk':''}">${n<=14?esc(fmtK(k,{weekday:'narrow'}))+'<br>':''}${parse(k).getDate()}</th>`).join('')}</tr>`;
  const row=p=>`<tr><td class="n"><button data-player="${esc(p.id)}"><b>${esc(p.name)}</b><small>${esc(p.pos||'')}</small></button></td>${keys.map(k=>{const v=get(p,k);const txt=v==null?'':fmt(v);
    return `<td class="c ${v==null?'x':''} ${k===S.k?'today':''}" style="background:${cellColour(S.metric,v)};color:${S.metric==='bal'?'var(--on-tint,var(--on-text))':'var(--text)'}" ${tipAttr(`<b>${esc(p.name)} · ${esc(fmtK(k))}</b>${esc(lab)}: ${v==null?'no entry':esc(txt)}`)}>${S.nums&&v!=null?esc(txt):''}</td>`}).join('')}</tr>`;
  const avgRow=`<tr class="avg"><td class="n"><b>Squad average</b></td>${keys.map(k=>{const vs=ps.map(p=>get(p,k)).filter(v=>v!=null);const v=vs.length?avg(vs):null;return `<td class="c ${v==null?'x':''}" style="background:${cellColour(S.metric,v)};color:${S.metric==='bal'?'var(--on-tint,var(--on-text))':'var(--text)'}" ${tipAttr(`<b>Squad · ${esc(fmtK(k))}</b>${esc(lab)}: ${v==null?'no entries':esc(fmt(Math.round(v*10)/10))} (${vs.length} players)`)}>${S.nums&&v!=null?esc(fmt(S.metric==='sleep'?r1(v):Math.round(v))):''}</td>`}).join('')}</tr>`;
  const seg=(key,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button data-set="${key}" data-val="${v}" aria-pressed="${String(S[key])===String(v)}">${l}</button>`).join('')}</div>`;
  const legend=S.metric==='bal'?`<span><i style="background:var(--good)"></i>Ready</span><span><i style="background:var(--caution)"></i>Cap the effort</span><span><i style="background:var(--alert)"></i>Back off</span>`
    :`<span>Low</span><span style="display:inline-block;width:120px;height:10px;border-radius:4px;background:linear-gradient(90deg,${cellColour(S.metric,S.metric==='load'?60:S.metric==='sleep'?5.2:1.2)},${cellColour(S.metric,S.metric==='load'?900:S.metric==='sleep'?9:5)})"></span><span>High</span>`;
  const sorted=ps.slice().sort((a,b)=>a.name.localeCompare(b.name));
  return `<section class="card"><header><div><h2>${esc(lab)}, day by day</h2><p>Every player across the last ${n} days. Hover a square for the detail, tap a name for the player.</p></div></header>
   <div class="toolbar" style="margin-bottom:14px">${seg('metric',Object.entries(METRICS).map(([k,v])=>[k,v[0].replace(' (h)','')]))}<span style="flex:1"></span>${seg('days',[[14,'2 weeks'],[28,'4 weeks']])}<button class="btn ghost sm" data-toggle="nums">${S.nums?'Hide numbers':'Show numbers'}</button></div>
   <div class="hm-wrap"><table class="hm">${head}${sorted.map(row).join('')}${avgRow}</table></div>
   <div class="legend" style="margin-top:12px">${legend}<span><i style="background:var(--none)"></i>No entry</span></div></section>`}

function acwrChip(a){if(a==null)return '<span class="chip">Building up</span>';const pc=Math.round(a*100);
  if(a>1.5)return `<span class="chip alert">${ico('spike')}${pc}% spike</span>`;if(a>1.3)return `<span class="chip caution">${pc}% rising</span>`;if(a<.8)return `<span class="chip">${pc}% light</span>`;return `<span class="chip good">${pc}% steady</span>`}
function viewLoad(noKpi){const ps=sharing();if(!ps.length)return needTeam();const k=S.k;
  const rows=ps.map(p=>{const w=p.E.load7(k),c=p.E.chronicWeek(k),a=p.E.acwr(k);let done=0,miss=0;for(let i=0;i<7;i++){const kk=addK(k,-i),l=p.L[kk],d=p.D[kk];if(l){l.status==='missed'?miss++:done++}done+=(d&&d.extras||[]).length}
    const fb=[];for(let i=0;i<7;i++){const d=p.D[addK(k,-i)];if(d&&d.sfb&&isNum(d.sfb.feel))fb.push(+d.sfb.feel)}return {p,w,c,a,done,miss,fb:fb.length?avg(fb):null}}).sort((x,y)=>(y.a||0)-(x.a||0));
  const mx=Math.max(1,...rows.map(r=>Math.max(r.w,r.c||0)));
  const FEEL=['','Awful','Tough','OK','Good','Brilliant'];
  const list=rows.map(r=>`<div class="lrow"><button class="nm" data-player="${esc(r.p.id)}"><b>${esc(r.p.name)}</b><small>${esc(r.p.pos||'')}</small></button>
    <div class="lbar" ${tipAttr(`<b>${esc(r.p.name)}</b>Last 7 days: ${Math.round(r.w)}<br>Usual week: ${r.c!=null?Math.round(r.c):'not enough history yet'}`)}><i style="width:${r.w/mx*100}%;background:${r.a>1.5?'var(--alert)':r.a>1.3?'var(--caution)':'var(--blue)'}"></i>${r.c!=null?`<u style="left:${r.c/mx*100}%"></u>`:''}</div>
    <div>${acwrChip(r.a)}</div><div class="small ss">${r.done} done${r.miss?` · ${r.miss} missed`:''}</div><div class="small fl muted">${r.fb!=null?FEEL[Math.round(r.fb)]:'–'}</div></div>`).join('');
  const weeks=[];for(let w=7;w>=0;w--){const end=addK(k,-7*w);const v=ps.map(p=>p.E.load7(end));weeks.push({k:end,lab:fmtK(addK(end,-6),{day:'numeric',month:'short'}),y:avg(v)})}
  const days=[];for(let i=27;i>=0;i--){const kk=addK(k,-i);days.push({k:kk,y:avg(ps.map(p=>p.E.load(kk)))})}
  const spikes=rows.filter(r=>r.a!=null&&r.a>1.5).length,steady=rows.filter(r=>r.a!=null&&r.a>=.8&&r.a<=1.3).length;
  return (noKpi?'':`<div class="kpis" style="--n:3"><div class="kpi"><div class="ic" style="color:var(--blue)">${ico('load')}</div><div><div class="v">${Math.round(avg(rows.map(r=>r.w)))}</div><div class="l">Average load, last 7 days</div></div></div>
    <div class="kpi"><div class="ic" style="color:var(--good)">${ico('check')}</div><div><div class="v">${steady}<small>/ ${rows.length}</small></div><div class="l">In the steady zone (80–130% of usual)</div></div></div>
    <div class="kpi"><div class="ic" style="color:var(--alert)">${ico('spike')}</div><div><div class="v">${spikes}</div><div class="l">Spiking (over 150% of usual)</div></div></div></div>
   `)+`<div class="grid g2"><section class="card"><header><div><h2>Squad load by week</h2><p>Average per player: minutes × effort, from sessions, club training, matches and heavy work days</p></div></header>${barChart(weeks,{label:'Weekly load',tip:p=>`Average ${Math.round(p.y)} per player`})}</section>
    <section class="card"><header><div><h2>Day by day, last 4 weeks</h2><p>Average per player each day</p></div></header>${barChart(days,{label:'Daily load',tip:p=>`Average ${Math.round(p.y)} per player`})}</section></div>
   <section class="card"><header><div><h2>Each player this week</h2><p>Bar: last 7 days. White line: their usual week (4-week average). Big jumps above usual are when injuries tend to happen.</p></div></header>
    <div class="lrow h"><span>Player</span><span>Load</span><span>Against usual</span><span class="ss">Sessions</span><span class="fl">How it felt</span></div>${list}</section>`}

function viewWellness(){const ps=sharing();if(!ps.length)return needTeam();const k=S.k;const keys=[];for(let i=27;i>=0;i--)keys.push(addK(k,-i));
  const series=(get)=>keys.map(kk=>{const v=ps.map(p=>get(p,kk)).filter(x=>x!=null);return {k:kk,y:v.length?avg(v):null,n:v.length}});
  const card=(title,sub,pts,o)=>{const last=pts.filter(p=>p.y!=null).pop();const first=pts.find(p=>p.y!=null);
    return `<section class="card mini"><header><div><h3>${esc(title)}<span class="num">${last?esc((o.fmt||r1)(last.y)):'–'}</span></h3><p>${esc(sub)}${last&&first&&last!==first?(Math.abs(last.y-first.y)<.05?' · level over 4 weeks':` · ${(last.y-first.y)>0?'up':'down'} ${esc((o.fmt||r1)(Math.abs(last.y-first.y)))} over 4 weeks`):''}</p></div></header>${lineChart(pts,Object.assign({w:380,h:170,tip:p=>`${(o.fmt||r1)(p.y)} average from ${p.n} players`},o))}</section>`};
  const sl=v=>(v==null?'–':r1(v)+' h');
  return `<div class="grid g3">
   ${card('Balance','Squad average',series((p,kk)=>dayInfo(p,kk).s),{min:30,max:100,ticks:[40,55,75,100],fmt:Math.round,bands:[[75,100,'var(--good)'],[55,75,'var(--caution)'],[0,55,'var(--alert)']],label:'Squad balance'})}
   ${card('Sleep','Average hours a night',series((p,kk)=>dayInfo(p,kk).sleep),{min:5,max:9,ticks:[5,7,9],fmt:sl,ref:8,refLabel:'8 h',label:'Squad sleep'})}
   ${card('Energy','1 is drained, 5 is full of it',series((p,kk)=>{const d=p.D[kk];return d&&isNum(d.energy)?+d.energy:null}),{min:1,max:5,ticks:[1,3,5],label:'Squad energy'})}
   ${card('Mood','1 is low, 5 is great',series((p,kk)=>{const d=p.D[kk];return d&&isNum(d.mood)?+d.mood:null}),{min:1,max:5,ticks:[1,3,5],label:'Squad mood'})}
   ${card('Stress','1 is calm, 5 is very stressed',series((p,kk)=>{const d=p.D[kk];return d&&isNum(d.stress)?+d.stress:null}),{min:1,max:5,ticks:[1,3,5],color:'var(--caution)',label:'Squad stress'})}
   ${card('Body soreness','1 is fresh, 5 is very sore',series((p,kk)=>{const d=p.D[kk];return d&&isNum(d.sore)?+d.sore:null}),{min:1,max:5,ticks:[1,3,5],color:'var(--caution)',label:'Squad soreness'})}</div>
   <section class="card"><header><div><h2>Check-ins each day</h2><p>How many players filled in the morning check-in. The dashboard is only as good as this number.</p></div></header>${barChart(keys.map(kk=>({k:kk,y:ps.filter(p=>checkedIn(p.D[kk])).length})),{max:ps.length,w:1100,h:190,ref:ps.length,refLabel:`Squad of ${ps.length}`,tip:p=>`${p.y} of ${ps.length} checked in`,label:'Check-ins'})}</section>`}

function viewAvail(){const ps=sharing();if(!ps.length)return needTeam();const k=S.k;const inf=ps.map(p=>({p,i:dayInfo(p,k)}));
  const why=i=>i.rh?`Rehab: ${i.rh.area}, stage ${i.rh.stage+1} of ${i.rh.stages.length}`:i.rs&&i.rs.length&&i.av!=='out'?'Restriction: '+i.rs[0].body:i.sick?`Unwell${i.sick.sev?' · '+i.sick.sev:''}`:i.pain>=3?`${i.nig.d.niggles[0].area} ${i.pain}/10`:i.s!=null&&i.s<55?`Balance ${i.s}`:i.ci?`Balance ${i.s??'–'}`:'No check-in';
  const col=key=>{const [c,l,ic]=AV[key];const xs=inf.filter(x=>x.i.av===key).sort((a,b)=>a.p.name.localeCompare(b.p.name));
    return `<div class="avcol" style="border-top:3px solid ${c}"><h3><span style="color:${c};display:flex">${ico(ic,'width:17px;height:17px')}</span>${l}<span class="num">${xs.length}</span></h3>${xs.length?xs.map(({p,i})=>`<button class="avp" data-player="${esc(p.id)}"><b>${esc(p.name)}</b><small>${esc(why(i))}</small></button>`).join(''):'<div class="small muted">Nobody</div>'}</div>`};
  const areas={};ps.forEach(p=>{for(let i=0;i<28;i++){const kk=addK(k,-i),d=p.D[kk];(d&&d.niggles||[]).forEach(n=>{if(!n.area)return;const a=areas[n.area]||(areas[n.area]={who:{},days:0,max:0});a.days++;a.max=Math.max(a.max,+n.pain||0);const w=a.who[p.id]||(a.who[p.id]={p,max:0,last:kk});w.max=Math.max(w.max,+n.pain||0)})}});
  const al=Object.entries(areas).sort((a,b)=>Object.keys(b[1].who).length-Object.keys(a[1].who).length||b[1].days-a[1].days);
  const mxd=Math.max(1,...al.map(a=>a[1].days));
  const body=al.length?al.map(([nm,a])=>`<div class="bodyrow"><div><b style="color:var(--text)">${esc(nm)}</b><div class="tiny muted">${Object.keys(a.who).length} player${Object.keys(a.who).length>1?'s':''} · ${a.days} day${a.days>1?'s':''} logged</div></div>
     <div style="display:flex;flex-direction:column;gap:8px"><div class="lbar" style="height:8px" ${tipAttr(`<b>${esc(nm)}</b>${a.days} days with this niggle across the squad in 4 weeks`)}><i style="width:${a.days/mxd*100}%;background:var(--caution)"></i></div>
     <div style="display:flex;gap:6px;flex-wrap:wrap">${Object.values(a.who).map(w=>`<button class="chip ${w.max>=5?'alert':w.max>=3?'caution':''}" data-player="${esc(w.p.id)}">${esc(w.p.name)} · worst ${w.max}/10</button>`).join('')}</div></div></div>`).join(''):'<div class="empty">No niggles logged in the last 4 weeks.</div>';
  return `<div class="av">${col('avail')}${col('mod')}${col('out')}</div>
   <div class="legend"><span>Unavailable: pain 5/10 or more, or badly unwell.</span><span>Modify: a niggle of 3–4/10, feeling unwell, or balance under 55.</span><span>Niggles and sickness carry over for 3 days if a player skips the check-in.</span></div>
   <section class="card"><header><div><h2>Niggles by body area</h2><p>Last 4 weeks. Patterns here are worth a word with the physio.</p></div></header>${body}</section>`}

// ================= backroom hubs =================
const FEEL=['','Awful','Tough','OK','Good','Brilliant'];
const TYPE_NAMES={S:'Strength',E:'Easy run',H:'Hyrox class',T:'Threshold',X:'Speed + long run',O:'Other training',R:'Rest'};
const lastN=(k,n)=>{const a=[];for(let i=n-1;i>=0;i--)a.push(addK(k,-i));return a};
const avgOf=(arr)=>{const v=arr.filter(x=>x!=null);return v.length?avg(v):null};
const fx=(v,d)=>v==null?'–':(d?r1(v):Math.round(v));
const fu=(v,u,d)=>v==null?'–':fx(v,d)+' '+u;
function sessionsOn(p,k){const out=[],lg=p.L[k],d=p.D[k];const fb=d&&d.sfb;
  if(lg)out.push({k,what:TYPE_NAMES[lg.type]||'Session',desc:[lg.dist?lg.dist+' km':'',lg.pace?lg.pace+' /km':''].filter(Boolean).join(' · '),dur:+lg.dur||0,rpe:+lg.rpe||0,st:lg.status||'done',fb});
  (d&&d.extras||[]).forEach(x=>out.push({k,what:x.kind||'Extra',desc:x.desc&&x.desc!==x.kind?x.desc+(x.km?' · '+x.km+' km':''):(x.km?x.km+' km':''),dur:+x.dur||0,rpe:+x.rpe||0,st:'done',fb}));return out}
function spark(vals,o){o=o||{};const W=o.w||110,H=o.h||26,mx=o.max!=null?o.max:Math.max(1,...vals.filter(v=>v!=null)),mn=o.min||0;let d='',pen=false;
  vals.forEach((v,i)=>{if(v==null){pen=false;return}const x=2+(W-4)*i/Math.max(1,vals.length-1),y=H-2-(H-4)*(v-mn)/Math.max(1e-6,mx-mn);d+=(pen?'L':'M')+x.toFixed(1)+' '+y.toFixed(1);pen=true});
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${d}" fill="none" stroke="${o.col||'var(--blue)'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
const trendArrow=(now,before,goodUp)=>{if(now==null||before==null)return '<span class="muted">–</span>';const d=now-before;if(Math.abs(d)<.3)return '<span class="muted">steady</span>';
  const good=goodUp?d>0:d<0;return `<span style="color:${good?'var(--good)':'var(--caution)'}">${d>0?'▲':'▼'} ${r1(Math.abs(d))}</span>`};

// ---------- S&C ----------
function sessionCall(p,k){const i=dayInfo(p,k),a=p.E.acwr(k),rs=activeRestr(p,k);
  if(i.rh)return ['hold',`Rehab: stage ${i.rh.stage+1} of ${i.rh.stages.length}`];
  if(i.av==='out')return ['hold','Unavailable'];
  if(i.d&&i.d.trainIntent==='no')return ['skip','Told Keel: not training today'];
  if(rs.length)return ['hold','Restriction: '+rs[0].body];
  if(i.pain>=3)return ['hold',`${i.nig.d.niggles[0].area} ${i.pain}/10`];
  if(i.sick)return ['hold','Unwell'];
  if(a!=null&&a>1.5)return ['hold',`Load spike ${Math.round(a*100)}%`];
  if(!i.ci)return ['none','No check-in'];
  if(i.s<55)return ['hold',`Balance ${i.s}`];
  if(i.s>=80&&(a==null||a<=1.2)&&i.pain<2)return ['push',`Balance ${i.s}${a!=null?` · load ${Math.round(a*100)}%`:''}`];
  return ['normal',`Balance ${i.s}${a!=null?` · load ${Math.round(a*100)}%`:''}`]}
function viewSC(){const ps=sharing();if(!ps.length)return needTeam();const k=S.k;
  const calls=ps.map(p=>({p,c:sessionCall(p,k)}));
  const col=(key,title,colr,sub)=>{const xs=calls.filter(x=>x.c[0]===key).sort((a,b)=>a.p.name.localeCompare(b.p.name));
    return `<div class="avcol" style="border-top:3px solid ${colr}"><h3>${title}<span class="num">${xs.length}</span></h3><div class="tiny muted" style="margin:-6px 0 4px">${sub}</div>${xs.length?xs.map(({p,c})=>`<button class="avp" data-player="${esc(p.id)}"><b>${esc(p.name)}</b><small>${esc(c[1])}</small></button>`).join(''):'<div class="small muted">Nobody</div>'}</div>`};
  const rows=ps.map(p=>{const w=p.E.load7(k),c=p.E.chronicWeek(k),a=p.E.acwr(k);let done=0,miss=0;lastN(k,7).forEach(kk=>sessionsOn(p,kk).forEach(s=>s.st==='missed'?miss++:done++));return {a,w,c,done,miss}});
  const spikes=rows.filter(r=>r.a!=null&&r.a>1.5).length,under=rows.filter(r=>r.a!=null&&r.a<.8).length,steady=rows.filter(r=>r.a!=null&&r.a>=.8&&r.a<=1.3).length;
  const tot=rows.reduce((a,r)=>a+r.done+r.miss,0),done=rows.reduce((a,r)=>a+r.done,0);
  const types={};ps.forEach(p=>lastN(k,14).forEach(kk=>sessionsOn(p,kk).forEach(s=>{if(s.st==='missed')return;const t=types[s.what]||(types[s.what]={n:0,rpe:[],feel:[],hard:0,min:[]});t.n++;if(s.rpe)t.rpe.push(s.rpe);if(s.dur)t.min.push(s.dur);if(s.fb&&isNum(s.fb.feel))t.feel.push(+s.fb.feel);if(s.fb&&s.fb.effort==='harder')t.hard++})));
  const tt=Object.entries(types).sort((a,b)=>b[1].n-a[1].n);
  return kpiRow([kpiTile(Math.round(avg(rows.map(r=>r.w))),'Average load, last 7 days',{ic:'load'}),kpiTile(`${steady}<small>/ ${rows.length}</small>`,'In the steady zone',{ic:'check',col:'var(--good)',d:'80–130% of their usual week'}),
     kpiTile(spikes,'Spiking',{ic:'spike',col:'var(--alert)',d:'Over 150% of usual'}),kpiTile(under,'Under-loaded',{ic:'down',col:'var(--caution)',d:'Under 80% of usual'}),kpiTile(tot?Math.round(done/tot*100)+'<small>%</small>':'–','Sessions done, last 7 days',{ic:'check',d:`${done} done of ${tot}`})])
   +`<section class="card"><header><div><h2>Today's session</h2><p>Who to push, who trains as normal and who to hold back, from this morning's balance, recent load, niggles and staff restrictions</p></div></header>
     <div class="av" style="grid-template-columns:repeat(5,minmax(0,1fr))">${col('push','Push on','var(--good)','Fresh and load is steady')}${col('normal','As planned','var(--blue)','Nothing stands out')}${col('hold','Hold back','var(--caution)','Lighter, modified or off')}${col('skip','Not training','var(--muted)','Told Keel they\'re skipping today')}${col('none','Not checked in','var(--faint)','Ask before training')}</div></section>`
   +viewLoad(true)
   +`<section class="card"><header><div><h2>How sessions are landing</h2><p>Last 2 weeks, by type of session. Effort is what players rated it out of 10.</p></div></header>
     ${tt.length?`<div style="overflow-x:auto"><table class="list"><tr><th>Session</th><th>Done</th><th>Average minutes</th><th>Average effort</th><th>How it felt</th><th>Harder than planned</th></tr>${tt.map(([n,t])=>`<tr><td><b style="color:var(--text)">${esc(n)}</b></td><td class="num">${t.n}</td><td class="num">${fx(avgOf(t.min))}</td><td class="num">${fx(avgOf(t.rpe),1)}</td><td>${t.feel.length?esc(FEEL[Math.round(avg(t.feel))]):'–'}</td><td>${t.hard?`<span class="chip caution">${t.hard}</span>`:'<span class="muted">0</span>'}</td></tr>`).join('')}</table></div>`:'<div class="empty">No sessions logged in the last 2 weeks.</div>'}</section>`}

// ---------- Physio ----------
function viewPhysio(){const ps=sharing();if(!ps.length)return needTeam();const k=S.k;
  const act=[];ps.forEach(p=>{const i=dayInfo(p,k);if(!i.nig)return;i.nig.d.niggles.forEach(n=>{if(!n.area)return;const hist=lastN(k,14).map(kk=>{const d=p.D[kk];const m=d&&(d.niggles||[]).find(x=>x.area===n.area);return m?+m.pain||0:(checkedIn(d)?0:null)});
    let first=null;for(let j=0;j<28;j++){const d=p.D[addK(k,-j)];if(d&&(d.niggles||[]).some(x=>x.area===n.area))first=addK(k,-j);else if(checkedIn(d)&&first)break}
    const b=hist.slice(0,-3).filter(v=>v!=null).pop();act.push({p,n,hist,pain:+n.pain||0,before:b,first,rs:activeRestr(p,k)})})});
  act.sort((a,b)=>b.pain-a.pain);
  const sick=ps.map(p=>({p,i:dayInfo(p,k)})).filter(x=>x.i.sick);
  const rs=[];ps.forEach(p=>activeRestr(p,k).forEach(n=>rs.push({p,n})));
  const inf=ps.map(p=>dayInfo(p,k));
  return kpiRow([kpiTile(inf.filter(i=>i.av==='out').length,'Unavailable',{ic:'sick',col:'var(--alert)'}),kpiTile(inf.filter(i=>i.av==='mod').length,'Modified training',{ic:'niggle',col:'var(--caution)'}),
     kpiTile(act.length,'Active niggles',{ic:'niggle',d:'Logged in the last 3 days'}),kpiTile(rs.length,'Restrictions in place',{ic:'clock'}),kpiTile(sick.length,'Unwell',{ic:'sick',col:'var(--alert)'})])
   +`<section class="card"><header><div><h2>Active niggles</h2><p>Pain out of 10, with the last 2 weeks of each one. Arrows compare with 3 days ago.</p></div></header>
     ${act.length?`<div style="overflow-x:auto"><table class="list"><tr><th>Player</th><th>Where</th><th>Pain now</th><th>Last 2 weeks</th><th>Change</th><th>Since</th><th>Restriction</th></tr>${act.map(a=>`<tr><td><button data-player="${esc(a.p.id)}" style="text-align:left"><b style="color:var(--text)">${esc(a.p.name)}</b><div class="tiny muted">${esc(a.p.pos||'')}</div></button></td>
       <td>${esc(a.n.area)}${a.n.side&&a.n.side!=='Both'?` <span class="muted">(${esc(a.n.side.toLowerCase())})</span>`:''}</td><td>${painChip(a.pain)}</td><td ${tipAttr(`<b>${esc(a.p.name)} · ${esc(a.n.area)}</b>${a.hist.map(v=>v==null?'–':v).join(' · ')}`)}>${spark(a.hist,{max:10,col:a.pain>=5?'var(--alert)':'var(--caution)'})}</td>
       <td>${trendArrow(a.pain,a.before,false)}</td><td class="small">${a.first?esc(fmtK(a.first,{day:'numeric',month:'short'})):'–'}</td><td class="small">${a.rs.length?esc(a.rs[0].body):'<span class="muted">None</span>'}</td></tr>`).join('')}</table></div>`:'<div class="empty">No active niggles.</div>'}</section>`
   +(sick.length?`<section class="card"><header><div><h2>Unwell</h2><p>What it is stays private to the player; you see how bad.</p></div></header><div style="display:flex;gap:8px;flex-wrap:wrap">${sick.map(({p,i})=>`<button class="chip ${i.sick.sev==='bad'?'alert':'caution'}" data-player="${esc(p.id)}">${ico('sick')}${esc(p.name)} · ${esc(i.sick.sev||'mild')}</button>`).join('')}</div></section>`:'')
   +viewAvail()
   +`<section class="card"><header><div><h2>Squad soreness</h2><p>Average body soreness, 1 fresh to 5 very sore. Watch the day after matches.</p></div></header>${lineChart(lastN(k,28).map(kk=>{const v=ps.map(p=>p.D[kk]&&isNum(p.D[kk].sore)?+p.D[kk].sore:null).filter(x=>x!=null);return {k:kk,y:v.length?avg(v):null,n:v.length}}),{w:1100,h:200,min:1,max:5,ticks:[1,3,5],color:'var(--caution)',label:'Squad soreness',tip:p=>`${r1(p.y)} average from ${p.n}`})}</section>`}

// ---------- Nutrition ----------
const NUT_TGT=[['protein','Protein',null,'g'],['fibre','Fibre 30 g+',30,'g'],['iron','Iron 8 mg+',8,'mg'],['calcium','Calcium 1000 mg+',1000,'mg'],['vitD','Vitamin D 15 µg+',15,'µg'],['omega3','Omega-3 1 g+',1,'g']];
const foodOn=(p,k)=>{const d=p.D[k];return d&&d.food&&d.food.n?d.food:null};
const isTrainDay=(p,k)=>sessionsOn(p,k).some(s=>s.st!=='missed');
function plantsWeek(p,k){const s=new Set();lastN(k,7).forEach(kk=>{const f=foodOn(p,kk);(f&&f.plants||[]).forEach(x=>s.add(x))});return s.size}
function viewNutrition(){const ps=sharing();if(!ps.length)return needTeam();const k=S.k;const fs=ps.filter(p=>p.food);
  if(!fs.length)return `<section class="card"><header><div><h2>No one is sharing food yet</h2><p>Food is opt-in, separate from the rest of a player's sharing.</p></div></header>
    <ol class="steps"><li>Players open Keel › profile › <b>Your team</b>.</li><li>They turn on <b>Share food totals with the staff</b>.</li><li>You then see daily totals: calories, protein, carbs, fat, fibre, plants, water and a few key vitamins. Never meals or photos, and drinks with alcohol are left out.</li></ol></section>`;
  const wk=lastN(k,7);
  const rows=fs.map(p=>{const days=wk.map(kk=>({kk,f:foodOn(p,kk),t:isTrainDay(p,kk)}));const lg=days.filter(x=>x.f);const m=f=>avgOf(lg.map(x=>x.f[f]!=null?+x.f[f]:null));
    const tk=avgOf(lg.filter(x=>x.t).map(x=>x.f.kcal)),rk=avgOf(lg.filter(x=>!x.t).map(x=>x.f.kcal));
    return {p,n:lg.length,kcal:m('kcal'),protein:m('protein'),carbs:m('carbs'),fibre:m('fibre'),water:m('water'),plants:plantsWeek(p,k),tk,rk}}).sort((a,b)=>a.p.name.localeCompare(b.p.name));
  const logged=rows.reduce((a,r)=>a+r.n,0);
  const series=f=>lastN(k,28).map(kk=>{const v=fs.map(p=>{const x=foodOn(p,kk);return x&&x[f]!=null?+x[f]:null}).filter(v=>v!=null);return {k:kk,y:v.length?avg(v):null,n:v.length}});
  const hits=NUT_TGT.filter(t=>t[2]!=null).map(([f,l,tg])=>{let n=0,h=0;fs.forEach(p=>wk.forEach(kk=>{const x=foodOn(p,kk);if(x&&x[f]!=null){n++;if(+x[f]>=tg)h++}}));return {l,n,pc:n?h/n:null}});
  const gapP=rows.filter(r=>r.tk!=null&&r.rk!=null&&r.tk<=r.rk);
  return kpiRow([kpiTile(`${fs.length}<small>/ ${ps.length}</small>`,'Sharing food',{ic:'food'}),kpiTile(Math.round(logged/(fs.length*7)*100)+'<small>%</small>','Days logged, last 7',{ic:'check',d:`${logged} days across the group`}),
     kpiTile(fx(avgOf(rows.map(r=>r.protein)))+'<small>g</small>','Average protein a day',{ic:'food'}),kpiTile(fx(avgOf(rows.map(r=>r.plants))),'Plants a week, average',{ic:'food',col:'var(--good)',d:'30 a week is a good target'}),kpiTile(fx(avgOf(rows.map(r=>r.water)),1)+'<small>L</small>','Water a day',{ic:'wellness'})])
   +`<section class="card"><header><div><h2>Each player, last 7 days</h2><p>Daily averages on the days they logged. Fuelling compares calories on training days with rest days.</p></div></header><div style="overflow-x:auto"><table class="list">
     <tr><th>Player</th><th>Days logged</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fibre</th><th>Plants (week)</th><th>Water</th><th>Fuelling</th></tr>
     ${rows.map(r=>`<tr><td><button data-player="${esc(r.p.id)}" style="text-align:left"><b style="color:var(--text)">${esc(r.p.name)}</b></button></td><td>${sevChip(r.n,5,3,r.n+'/7')}</td><td class="num">${fx(r.kcal)}</td><td class="num">${fu(r.protein,'g')}</td><td class="num">${fu(r.carbs,'g')}</td><td class="num">${fu(r.fibre,'g')}</td><td>${sevChip(r.plants,30,15,r.plants)}</td><td class="num">${fu(r.water,'L',1)}</td>
       <td class="small">${r.tk!=null&&r.rk!=null?(r.tk>r.rk?`<span style="color:var(--good)">+${Math.round(r.tk-r.rk)} on training days</span>`:`<span style="color:var(--caution)">No more on training days</span>`):'<span class="muted">Not enough yet</span>'}</td></tr>`).join('')}</table></div>
     ${gapP.length?`<p class="small" style="margin-top:12px;color:var(--caution)">${gapP.length} player${gapP.length>1?"s aren't":" isn't"} eating more on training days than rest days. Worth a chat about fuelling around sessions.</p>`:''}</section>
   <div class="grid g2"><section class="card"><header><div><h2>Protein</h2><p>Group average, grams a day</p></div></header>${lineChart(series('protein'),{min:0,label:'Protein',tip:p=>`${Math.round(p.y)} g average from ${p.n}`,fmt:Math.round})}</section>
    <section class="card"><header><div><h2>Key nutrients</h2><p>Share of logged days hitting each target, last 7 days</p></div></header>
     ${hits.map(h=>`<div class="bodyrow" style="grid-template-columns:150px minmax(0,1fr) 44px"><span class="small">${esc(h.l)}</span><div class="lbar" style="height:10px" ${tipAttr(`<b>${esc(h.l)}</b>${h.pc==null?'No data':Math.round(h.pc*100)+'% of '+h.n+' logged days'}`)}><i style="width:${(h.pc||0)*100}%;background:${h.pc>=.7?'var(--good)':h.pc>=.4?'var(--caution)':'var(--alert)'}"></i></div><span class="num small">${h.pc==null?'–':Math.round(h.pc*100)+'%'}</span></div>`).join('')}</section></div>
   <p class="tiny muted">Totals only, from players who turned food sharing on. Meals, photos and drinks with alcohol are never shared.</p>`}

// ---------- Mindset ----------
function viewMindset(){const ps=sharing();if(!ps.length)return needTeam();const k=S.k;
  const g=(p,kk,f)=>{const d=p.D[kk];return d&&isNum(d[f])?+d[f]:null};
  const rows=ps.map(p=>{const w=lastN(k,7),pw=lastN(addK(k,-7),7);const m=(ks,f)=>avgOf(ks.map(kk=>g(p,kk,f)));
    let hs=0;for(let j=0;j<3;j++)if((g(p,addK(k,-j),'stress')||0)>=4)hs++;
    const today=p.D[k];const why=[];if(today&&isNum(today.mood)&&+today.mood<=2)why.push('Low mood today');if(hs===3)why.push('Stressed 3 days running');
    const mw=m(w,'mood'),mp=m(pw,'mood');if(mw!=null&&mp!=null&&mp-mw>=1)why.push('Mood down on last week');const sl=avgOf(w.map(kk=>sleepHours(p.D[kk])));if(sl!=null&&sl<6.2)why.push('Sleeping under 6¼ h');
    return {p,mood:mw,mp,stress:m(w,'stress'),sp:m(pw,'stress'),energy:m(w,'energy'),sleep:sl,why}}).sort((a,b)=>b.why.length-a.why.length||a.p.name.localeCompare(b.p.name));
  const flagged=rows.filter(r=>r.why.length);
  const ser=f=>lastN(k,28).map(kk=>{const v=ps.map(p=>g(p,kk,f)).filter(x=>x!=null);return {k:kk,y:v.length?avg(v):null,n:v.length}});
  const td=f=>avgOf(ps.map(p=>g(p,k,f)));
  return kpiRow([kpiTile(fx(td('mood'),1),'Average mood today',{ic:'mind',d:'1 low, 5 great'}),kpiTile(fx(td('stress'),1),'Average stress today',{ic:'zap',col:'var(--caution)',d:'1 calm, 5 very stressed'}),
     kpiTile(fx(avgOf(rows.map(r=>r.sleep)),1)+'<small>h</small>','Sleep, 7-day average',{ic:'moon'}),kpiTile(flagged.length,'Worth a quiet word',{ic:'frown',col:'var(--caution)'})])
   +`<div class="grid g-today"><section class="card"><header><div><h2>Mood and stress</h2><p>Squad averages over 4 weeks</p></div></header><div class="grid g2" style="gap:12px">
      <div><h3 class="small muted" style="margin-bottom:6px">Mood</h3>${lineChart(ser('mood'),{w:380,h:170,min:1,max:5,ticks:[1,3,5],label:'Mood',tip:p=>`${r1(p.y)} from ${p.n}`})}</div>
      <div><h3 class="small muted" style="margin-bottom:6px">Stress</h3>${lineChart(ser('stress'),{w:380,h:170,min:1,max:5,ticks:[1,3,5],color:'var(--caution)',label:'Stress',tip:p=>`${r1(p.y)} from ${p.n}`})}</div>
      <div><h3 class="small muted" style="margin-bottom:6px">Energy</h3>${lineChart(ser('energy'),{w:380,h:170,min:1,max:5,ticks:[1,3,5],label:'Energy',tip:p=>`${r1(p.y)} from ${p.n}`})}</div>
      <div><h3 class="small muted" style="margin-bottom:6px">Sleep (hours)</h3>${lineChart(lastN(k,28).map(kk=>{const v=ps.map(p=>sleepHours(p.D[kk])).filter(x=>x!=null);return {k:kk,y:v.length?avg(v):null,n:v.length}}),{w:380,h:170,min:5,max:9,ticks:[5,7,9],fmt:v=>r1(v),label:'Sleep',tip:p=>`${r1(p.y)} h from ${p.n}`})}</div></div></section>
    <section class="card"><header><div><h2>Worth a quiet word</h2><p>Patterns, not a diagnosis. A chat often does more than any change to training.</p></div></header>
     <div class="flags">${flagged.length?flagged.map(r=>`<button class="flag" data-player="${esc(r.p.id)}"><span class="ic" style="background:color-mix(in srgb,var(--caution) 15%,transparent);color:var(--caution)">${ico('mind')}</span><span class="who"><b>${esc(r.p.name)}</b><span>${esc(r.why.join(' · '))}</span></span></button>`).join(''):`<div class="empty">Nobody stands out this week.</div>`}</div>
     <p class="tiny muted" style="margin-top:12px">If someone tells you they're struggling, Samaritans are on 116 123 any time, and text 50808 is free, 24/7.</p></section></div>
   <section class="card"><header><div><h2>Each player, last 7 days</h2><p>Averages, with the change on the week before</p></div></header><div style="overflow-x:auto"><table class="list"><tr><th>Player</th><th>Mood</th><th>vs last week</th><th>Stress</th><th>vs last week</th><th>Energy</th><th>Sleep</th></tr>
     ${rows.map(r=>`<tr><td><button data-player="${esc(r.p.id)}" style="text-align:left"><b style="color:var(--text)">${esc(r.p.name)}</b></button></td><td class="num">${fx(r.mood,1)}</td><td class="small">${trendArrow(r.mood,r.mp,true)}</td><td class="num">${fx(r.stress,1)}</td><td class="small">${trendArrow(r.stress,r.sp,false)}</td><td class="num">${fx(r.energy,1)}</td><td class="num">${r.sleep!=null?r1(r.sleep)+' h':'–'}</td></tr>`).join('')}</table></div></section>`}

// ---------- notes (shared by the staff) ----------
function notesCard(p){const k=todayK();const ns=(p.notes||[]).slice().sort((a,b)=>b.created_at.localeCompare(a.created_at));const me=SESSION&&SESSION.user.id;
  return `<section class="card"><header><div><h2>Staff notes</h2><p>Seen by the whole backroom team, never by ${esc(first(p.name))}</p></div></header>
   <form id="noteForm" data-pid="${esc(p.id)}" style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px">
    <div class="toolbar">${seg('noteKind',[['note','Note'],['restriction','Restriction']])}${S.noteKind==='restriction'?`<label class="small muted" style="display:flex;align-items:center;gap:8px">Until <input class="in" type="date" id="noteUntil" min="${k}" value="${addK(k,7)}" style="width:auto;padding:6px 10px"></label>`:''}</div>
    <textarea class="in" id="noteBody" rows="2" maxlength="1000" placeholder="${S.noteKind==='restriction'?'e.g. No sprinting or contact. Bike and upper body only.':'e.g. Swapped Tuesday for bike intervals. Talked to him about sleep.'}"></textarea>
    <button class="btn sm" type="submit" style="align-self:flex-start">Add ${S.noteKind==='restriction'?'restriction':'note'}</button></form>
   ${ns.length?ns.map(n=>{const live=n.kind==='restriction'&&(!n.until_day||n.until_day>=k);return `<div class="flag" style="align-items:flex-start"><span class="ic" style="background:${n.kind==='restriction'?(live?'color-mix(in srgb,var(--caution) 15%,transparent)':'var(--raised)'):'var(--raised)'};color:${n.kind==='restriction'&&live?'var(--caution)':'var(--muted)'}">${ico(n.kind==='restriction'?'clock':'note')}</span>
     <span class="who"><b style="font-weight:500">${esc(n.body)}</b><span>${esc(n.author_name||'Staff')} · ${esc(staffLabel(n.author_staff))} · ${esc(fmtK(n.created_at.slice(0,10),{day:'numeric',month:'short'}))}${n.kind==='restriction'?(live?` · until ${n.until_day?esc(fmtK(n.until_day,{day:'numeric',month:'short'})):'further notice'}`:' · ended'):''}</span></span>
     ${n.author_id===me||isManager()||isDemo()?`<button class="btn ghost sm" data-delnote="${esc(n.id)}">Delete</button>`:''}</div>`}).join(''):'<div class="small muted">No notes yet.</div>'}</section>`}

// ---------- player page: one page, a tab per discipline ----------
function viewPlayer(id){const p=SQUAD.find(x=>x.id===id);if(!p)return `<div class="card"><div class="empty">Player not found. <a href="#today">Back to the squad</a></div></div>`;
  if(!p.share)return `<a class="back" href="javascript:history.back()">${ico('back','width:15px;height:15px')}Back</a><div class="card"><div class="empty"><h2>${esc(p.name)}</h2><p style="margin-top:6px">${esc(first(p.name))} has paused sharing, so there's nothing to show.</p></div></div>`;
  const k=S.k,i=dayInfo(p,k),E=p.E;const keys=lastN(k,28);const tab=S.ptab=S.ptab||({sc:'sc',physio:'physio',nutrition:'nutrition',mindset:'mindset'}[myStaff()]||'overview');
  const fl=flagsFor(p,k);const a=E.acwr(k);const [c,l]=ST[i.st];const age=p.about&&p.about.age;const rs=activeRestr(p,k);
  const kpi=(v,lab,sub)=>`<div class="kpi" style="flex-direction:column;align-items:flex-start;gap:0"><div class="v">${v}</div><div class="l">${lab}</div>${sub?`<div class="d">${sub}</div>`:''}</div>`;
  const b7=keys.slice(-7).map(kk=>dayInfo(p,kk).s).filter(v=>v!=null),sl7=keys.slice(-7).map(kk=>E.sleep(kk)).filter(v=>v!=null);
  const head=`<a class="back" href="javascript:history.back()">${ico('back','width:15px;height:15px')}Back</a>
   <div class="phead">${ring(i.s,92,i.st)}<div class="who" style="position:relative"><h1>${esc(p.name)}</h1><div class="muted">${esc([p.pos,age?age+' years':null].filter(Boolean).join(' · '))}</div>
    <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><span class="chip" style="color:${c}">${i.ci?esc(l):'No check-in '+(k===todayK()?'today':'that day')}</span><span class="chip ${i.av==='out'?'alert':i.av==='mod'?'caution':'good'}">${AV[i.av][1]}</span>${rs.map(n=>`<span class="chip caution">${ico('clock')}${esc(n.body.length>40?n.body.slice(0,40)+'…':n.body)}</span>`).join('')}${groupsOf(p.id).map(grpChip).join('')}</div></div><button class="btn ghost sm" data-msgplayer="${esc(p.id)}">${ico('msg','width:15px;height:15px')}Message</button></div>
   ${kpiRow([kpi(b7.length?Math.round(avg(b7)):'–','Balance, 7-day average',E.usualBal(k)!=null?`Usual ${Math.round(E.usualBal(k))}`:''),kpi(sl7.length?r1(avg(sl7))+'<small>h</small>':'–','Sleep, 7-day average',E.debt(k)!=null?`${E.debt(k)} h short over the week`:''),kpi(Math.round(E.load7(k)),'Load, last 7 days',E.chronicWeek(k)!=null?`Usual ${Math.round(E.chronicWeek(k))}`:''),`<div class="kpi" style="flex-direction:column;align-items:flex-start;gap:6px"><div>${acwrChip(a)}</div><div class="l">This week against usual</div></div>`])}
   <div class="toolbar">${seg('ptab',[['overview','Overview'],['day','Day by day'],['sc','S&C'],['physio','Physio'],['nutrition','Nutrition'],['mindset','Mindset']])}</div>`;
  const bal=`<section class="card"><header><div><h2>Balance</h2><p>Last 4 weeks, from their own check-ins</p></div></header>${lineChart(keys.map(kk=>({k:kk,y:dayInfo(p,kk).s})),{min:0,max:100,ticks:[0,55,75,100],fmt:Math.round,bands:[[75,100,'var(--good)'],[55,75,'var(--caution)'],[0,55,'var(--alert)']],dotColor:v=>v>=75?'var(--good)':v>=55?'var(--caution)':'var(--alert)',color:'var(--text-body)',label:'Balance'})}</section>`;
  const sleep=`<section class="card"><header><div><h2>Sleep</h2><p>Hours each night against what they need</p></div></header>${barChart(keys.map(kk=>({k:kk,y:E.sleep(kk)})),{max:10,fmt:v=>r1(v),ref:E.need(k),refLabel:`Needs about ${E.need(k)} h`,tip:p=>p.y?p.y+' h':'No entry',label:'Sleep'})}</section>`;
  const load=`<section class="card"><header><div><h2>Training load</h2><p>Minutes × effort each day</p></div></header>${barChart(keys.map(kk=>({k:kk,y:E.load(kk)})),{tip:p=>`Load ${Math.round(p.y||0)}`,label:'Load'})}</section>`;
  const line=(f,t,sub,col)=>`<section class="card"><header><div><h2>${t}</h2><p>${sub}</p></div></header>${lineChart(keys.map(kk=>({k:kk,y:p.D[kk]&&isNum(p.D[kk][f])?+p.D[kk][f]:null})),{min:1,max:5,ticks:[1,3,5],color:col,label:t})}</section>`;
  const sess=[];keys.slice().reverse().forEach(kk=>sess.push(...sessionsOn(p,kk)));
  const sessT=`<section class="card"><header><div><h2>Sessions</h2><p>Last 4 weeks</p></div></header>${sess.length?`<table class="list"><tr><th>Day</th><th>What</th><th>Min</th><th>Effort</th><th>Felt</th></tr>${sess.slice(0,16).map(s=>`<tr><td>${esc(fmtK(s.k))}</td><td>${esc(s.what)}${s.desc?`<span class="tiny muted"> · ${esc(s.desc)}</span>`:''}${s.st==='missed'?' <span class="chip alert">Missed</span>':''}</td><td class="num">${s.dur||'–'}</td><td class="num">${s.rpe||'–'}</td><td>${esc(s.fb&&isNum(s.fb.feel)?FEEL[s.fb.feel]:'–')}${s.fb&&s.fb.effort==='harder'?' <span class="chip caution">Harder than planned</span>':''}</td></tr>`).join('')}</table>`:'<div class="empty">No sessions logged.</div>'}</section>`;
  const nigs=[];keys.slice().reverse().forEach(kk=>{const d=p.D[kk];(d&&d.niggles||[]).forEach(n=>nigs.push({k:kk,...n}))});
  const nigT=`<section class="card"><header><div><h2>Niggles</h2><p>Last 4 weeks</p></div></header>${nigs.length?`<table class="list"><tr><th>Day</th><th>Where</th><th>Side</th><th>Pain</th></tr>${nigs.slice(0,16).map(n=>`<tr><td>${esc(fmtK(n.k))}</td><td>${esc(n.area)}</td><td>${esc(n.side||'')}</td><td>${painChip(+n.pain||0)}</td></tr>`).join('')}</table>`:'<div class="empty">None logged. Good.</div>'}</section>`;
  const pain=(()=>{const areas=[...new Set(nigs.map(n=>n.area))];if(!areas.length)return '';return `<section class="card"><header><div><h2>Pain over time</h2><p>${areas.map(esc).join(', ')}</p></div></header>${lineChart(keys.map(kk=>{const d=p.D[kk];return {k:kk,y:d?(d.niggles&&d.niggles.length?maxPain(d):(checkedIn(d)?0:null)):null}}),{min:0,max:10,ticks:[0,3,5,10],color:'var(--caution)',label:'Pain',tip:p=>`Worst pain ${p.y}/10`})}</section>`})();
  let foodBody;if(!p.food)foodBody=`<section class="card"><div class="empty">${esc(first(p.name))} hasn't turned on food sharing.</div></section>`;
  else{const fk=keys.map(kk=>({k:kk,f:foodOn(p,kk)}));const lg=fk.filter(x=>x.f);
    foodBody=kpiRow([kpi(lg.filter(x=>keys.slice(-7).includes(x.k)).length+'<small>/ 7</small>','Days logged this week'),kpi(fx(avgOf(lg.map(x=>x.f.protein)))+'<small>g</small>','Protein a day'),kpi(plantsWeek(p,k),'Plants this week'),kpi(fx(avgOf(lg.map(x=>x.f.water!=null?+x.f.water:null)),1)+'<small>L</small>','Water a day')])
     +`<div class="grid g2"><section class="card"><header><div><h2>Calories</h2><p>Bars in blue are training days</p></div></header>${barChart(fk.map(x=>({k:x.k,y:x.f?x.f.kcal:0,c:isTrainDay(p,x.k)?'var(--blue)':'var(--line-2)'})),{tip:q=>q.y?`${Math.round(q.y)} kcal${isTrainDay(p,q.k)?' · training day':''}`:'Not logged',label:'Calories'})}</section>
      <section class="card"><header><div><h2>Protein</h2><p>Grams a day</p></div></header>${barChart(fk.map(x=>({k:x.k,y:x.f?x.f.protein:0})),{tip:q=>q.y?`${Math.round(q.y)} g`:'Not logged',label:'Protein'})}</section></div>`}
  const body={day:dayDetail(p),overview:(fl.length?`<section class="card"><header><div><h2>Worth knowing</h2></div></header><div class="flags">${fl.map(f=>`<div class="flag"><span class="ic" style="background:color-mix(in srgb,${f.col} 15%,transparent);color:${f.col}">${ico(f.ic)}</span><span class="who"><b>${esc(f.t)}</b><span>${esc(f.s)}</span></span></div>`).join('')}</div></section>`:'')+`<div class="grid g2">${bal}${sleep}${load}${line('energy','How they feel','Energy, 1 to 5')}</div>`,
    sc:playerSC(p)+`<div class="grid g2">${load}${bal}</div>${sessT}`,
    physio:rehabWorkspace(p)+`<div class="grid g2">${pain||nigT}${line('sore','Body soreness','1 fresh to 5 very sore','var(--caution)')}</div>${pain?nigT:''}`,
    nutrition:foodBody+nutWorkspace(p),
    mindset:`<div class="grid g2">${line('mood','Mood','1 low to 5 great')}${line('stress','Stress','1 calm to 5 very stressed','var(--caution)')}${line('energy','Energy','1 drained to 5 full of it')}${sleep}</div>`}[tab];
  return head+body+notesCard(p)+`<p class="tiny muted">${p.food?(p.meals?'Food is shared with meals. ':'Food is shared as daily totals only. '):''}Notes, cycle tracking and${p.food?'':' food,'} drinks with alcohol stay private to ${esc(first(p.name))}.</p>`}

// ---------- team ----------
let SETUP={busy:false};
function viewSetup(){return viewSetup0()+(TEAM&&ERR!=='setup'?groupsCard():'')+lookCard()}
function viewSetup0(){const real=TEAMS.filter(t=>t.team_id!==DEMO_ID);
  const create=`<section class="card"><header><div><h2>${real.length?'Add another team':'Create your team'}</h2><p>You'll be its manager, with a player code and a staff code to hand out.</p></div></header>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><input class="in" id="tName" placeholder="e.g. Glencar/Manorhamilton Seniors" style="flex:1;min-width:220px"><button class="btn" id="tCreate" ${SETUP.busy?'disabled':''}>${SETUP.busy?'Creating…':'Create team'}</button></div></section>`;
  if(ERR==='setup')return `<section class="card"><header><div><h2>One-off database step</h2><p>Teams aren't switched on in the database yet.</p></div></header><ol class="steps"><li>Open Supabase › SQL Editor › New query.</li><li>Paste in everything from <b>supabase/teams.sql</b> in the GitHub repo and click Run.</li><li>Come back here and refresh.</li></ol></section>`;
  if(!TEAM||isDemo())return create+(real.length?'':`<p class="small muted">Until then, the demo squad shows what each of the staff will see.</p>`);
  const ps=players().sort((a,b)=>a.name.localeCompare(b.name)),st=staffList().sort((a,b)=>a.name.localeCompare(b.name));const me=SESSION&&SESSION.user.id;
  const codeCard=(t,sub,code,which,steps)=>`<section class="card"><header><div><h2>${t}</h2><p>${sub}</p></div>${isManager()?`<button class="btn ghost sm" data-newcode="${which}">New code</button>`:''}</header>
     <div style="display:flex;align-items:center;gap:14px"><span class="code">${esc(code||'')}</span><button class="btn ghost sm" data-copy="${esc(code||'')}">${ico('copy','width:15px;height:15px')}Copy</button></div><ol class="steps" style="margin-top:18px">${steps}</ol></section>`;
  return `<section class="card"><header><div><h2>Your role</h2><p>Decides which page you land on. Everyone on the staff can see every page.</p></div>${roleSelect('myRole',myStaff()||'')}</header></section>
   <div class="grid g2">${codeCard('Player code','For players. They choose what to share.',TEAM.code,'player',`<li>Open Keel at training-log-lac-iota.vercel.app/p2/ and sign in.</li><li>Tap the profile button (top right), then <b>Your team</b>.</li><li>Type the code, read what's shared, tap <b>Join and share</b>. Food sharing is a separate switch.</li>`)}
    ${codeCard('Staff code','For coaches, S&C, physio, nutritionist and mindset coach. Never give this to players.',TEAM.coach_code,'coach',`<li>Open training-log-lac-iota.vercel.app/coach/</li><li>Tap <b>New staff? Join with a staff code</b>.</li><li>Enter their details, the code and their role.</li>`)}</div>
   <section class="card"><header><div><h2>Backroom team</h2><p>${st.length} staff</p></div></header>
    <table class="list"><tr><th>Name</th><th>Role</th><th></th></tr>${st.map(m=>`<tr><td><b style="color:var(--text)">${esc(m.name)}</b>${m.id===me?' <span class="muted small">(you)</span>':''}</td><td>${esc(STAFF_LONG[m.staff]||'Not set')}</td>
      <td style="text-align:right">${isManager()&&m.id!==me?`<button class="btn danger sm" data-remove="${esc(m.id)}">Remove</button>`:''}</td></tr>`).join('')}</table></section>
   <section class="card"><header><div><h2>Players</h2><p>${ps.length} players · ${ps.filter(p=>p.share).length} sharing · ${ps.filter(p=>p.food).length} sharing food</p></div></header>
    ${ps.length?`<div style="overflow-x:auto"><table class="list"><tr><th>Name</th><th>Position</th><th>Sharing</th><th></th></tr>${ps.map(m=>`<tr><td><b style="color:var(--text)">${esc(m.name)}</b></td>
      <td><input class="in" data-pos="${esc(m.id)}" value="${esc(m.pos||'')}" placeholder="Add position" style="max-width:200px;padding:7px 10px"></td>
      <td>${m.share?`<span class="chip good">Sharing</span>`:'<span class="chip">Paused</span>'} ${m.food?'<span class="chip">Food</span>':''}${m.share&&!lastCheckin(m,todayK())?' <span class="chip">No check-ins yet</span>':''}</td>
      <td style="text-align:right">${isManager()?`<button class="btn danger sm" data-remove="${esc(m.id)}">Remove</button>`:''}</td></tr>`).join('')}</table></div>`:'<div class="empty">No players yet. Send them the player code.</div>'}</section>${isManager()?create:''}`}

// ---------- overview: the manager's page ----------
function hubStrip(){const ps=sharing();if(!ps.length)return '';const k=S.k;
  const calls=ps.map(p=>sessionCall(p,k)[0]);const inf=ps.map(p=>dayInfo(p,k));const fs=ps.filter(p=>p.food);
  const nig=inf.filter(i=>i.pain>=1).length,out=inf.filter(i=>i.av==='out').length;
  const mood=ps.filter(p=>{const d=p.D[k];let hs=0;for(let j=0;j<3;j++){const x=p.D[addK(k,-j)];if(x&&+x.stress>=4)hs++}return (d&&+d.mood<=2)||hs===3}).length;
  const flog=fs.filter(p=>lastN(k,7).filter(kk=>foodOn(p,kk)).length>=4).length;
  const t=(v,ic,title,line,col)=>`<a class="kpi hub" href="#${v}"><div class="ic" style="color:${col}">${ico(ic)}</div><div style="min-width:0"><div class="l" style="margin:0;color:var(--text);font-weight:600">${title}</div><div class="d" style="font-size:13px">${line}</div></div></a>`;
  return `<div class="kpis" style="--n:4">${t('sc','load','S&C',`${calls.filter(c=>c==='hold').length} to hold back · ${calls.filter(c=>c==='push').length} to push`,'var(--blue)')}
   ${t('physio','avail','Physio',`${out} unavailable · ${nig} with a niggle`,'var(--caution)')}
   ${t('nutrition','food','Nutrition',fs.length?`${flog} of ${fs.length} logging most days`:'No one sharing food yet','var(--good)')}
   ${t('mindset','mind','Mindset',mood?`${mood} worth a quiet word`:'Nobody stands out','var(--blue)')}</div>`}
function restrCard(){const k=S.k;const rs=[];sharing().forEach(p=>activeRestr(p,k).forEach(n=>rs.push({p,n})));if(!rs.length)return '';
  return `<section class="card"><header><div><h2>Restrictions in place</h2><p>Set by the staff. They count towards availability.</p></div></header><div class="flags">${rs.map(({p,n})=>`<button class="flag" data-player="${esc(p.id)}"><span class="ic" style="background:color-mix(in srgb,var(--caution) 15%,transparent);color:var(--caution)">${ico('clock')}</span><span class="who"><b>${esc(p.name)} · ${esc(n.body)}</b><span>${esc(staffLabel(n.author_staff))} · ${n.until_day?'until '+esc(fmtK(n.until_day,{weekday:'short',day:'numeric',month:'short'})):'until further notice'}</span></span></button>`).join('')}</div></section>`}
function viewOverview(){const h=viewToday();const i=h.indexOf('<div class="grid g-today">');if(i<0)return h;return h.slice(0,i)+hubStrip()+comingUp()+restrCard()+h.slice(i)}

function render(){if(render._busy){setTimeout(render,0);return}render._busy=true;try{render2()}finally{render._busy=false}}
function render2(){TIPS={};tipN=0;const rt=route();const root=$('#root');
  if(!SESSION){root.innerHTML=gateHTML();return}
  const title=rt.v==='player'?'Player':(VIEWS.find(v=>v[0]===rt.v)||VIEWS[0])[1];
  let body;if(LOADING)body='<div class="spin"></div>';else body=({setup:viewSetup,gps:()=>viewGPS(),trends:viewTrends,calendar:viewCalendar,messages:viewMessages,sc:viewSCHub,physio:viewPhysioHub,recovery:viewRecovery,nutrition:viewNutHub,mindset:viewMindset}[rt.v]||(rt.v==='player'?()=>viewPlayer(rt.id):viewOverview))();
  const sy=scrollY;root.innerHTML=shell(body,title);try{enhancePickers();const ms=$('#msgScroll');if(ms)ms.scrollTop=ms.scrollHeight}catch(e){}if(render._v===location.hash)scrollTo(0,sy);else scrollTo(0,0);render._v=location.hash}
let GATE={mode:'in',msg:''};
function gateHTML(){if(GATE.mode==='up')return `<div class="gate"><form class="gcard" id="signup">${kwm()}<div><h1>Join the backroom team</h1><p class="muted small" style="margin-top:4px">For coaches, S&amp;C, physios, nutritionists and mindset coaches. You need the staff code from your team's manager.</p></div>
  <div class="field"><label for="su-name">Your name</label><input class="in" id="su-name" autocomplete="name" required></div>
  <div class="field"><label for="su-role">Your role</label><select class="in" id="su-role" required><option value="">Choose…</option>${Object.entries(STAFF_LONG).filter(([s])=>s!=='manager').map(([s,l])=>`<option value="${s}">${esc(l)}</option>`).join('')}</select></div>
  <div class="field"><label for="su-code">Staff code</label><input class="in" id="su-code" autocomplete="off" required style="text-transform:uppercase;letter-spacing:.12em" placeholder="6 letters"></div>
  <div class="field"><label for="em">Email</label><input class="in" id="em" type="email" autocomplete="email" required></div>
  <div class="field"><label for="pw">Password</label><input class="in" id="pw" type="password" autocomplete="new-password" minlength="6" required></div>
  <button class="btn" type="submit">Create account and join</button><button type="button" class="small muted" data-gate="in" style="text-align:left">Already have a Keel account? Sign in</button></form></div>`;
  return `<div class="gate"><form class="gcard" id="login">${kwm()}<div><h1>Team dashboard</h1><p class="muted small" style="margin-top:4px">Sign in with your Keel account.</p></div>
  ${GATE.msg?`<div class="demo-note">${esc(GATE.msg)}</div>`:''}
  <div class="field"><label for="em">Email</label><input class="in" id="em" type="email" autocomplete="email" required></div>
  <div class="field"><label for="pw">Password</label><input class="in" id="pw" type="password" autocomplete="current-password" required></div>
  <button class="btn" type="submit">Sign in</button><button type="button" class="btn ghost" data-gate="up">New staff? Join with a staff code</button><a class="small muted" href="/p2/">Forgot your password? Reset it in the Keel app.</a></form></div>`}
async function joinPending(){let pj=null;try{pj=JSON.parse(localStorage.getItem('keelStaffJoin')||'null')}catch(e){}if(!pj)return;
  const {error}=await sb.rpc('keel_join_team',{join_code:pj.code,my_name:pj.name,my_staff:pj.staff});try{localStorage.removeItem('keelStaffJoin')}catch(e){}
  toast(error?error.message:'You\'ve joined the team',4000)}

// ================= events =================
window.addEventListener('hashchange',()=>{if(!location.hash.startsWith('#player'))S.ptab=null;if(!location.hash.startsWith('#sc')){S.progEdit=null;S.draft=null;S.exEdit=null}S.nutT=null;S.nutP=null;S.rh=null;render()});
document.addEventListener('click',async e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(x=c('[data-gate]')){GATE={mode:x.dataset.gate,msg:''};render();return}
  if(x=c('[data-player]')){location.hash='player/'+encodeURIComponent(x.dataset.player);return}
  if(x=c('[data-go]')){location.hash=x.dataset.go;return}
  if(x=c('[data-set]')){const v=x.dataset.val;S[x.dataset.set]=isNaN(+v)?v:+v;render();return}
  if(x=c('[data-toggle]')){S[x.dataset.toggle]=!S[x.dataset.toggle];render();return}
  if(c('#dPrev')){S.k=addK(S.k,-1);render();return}
  if(c('#dNext')){if(S.k<todayK()){S.k=addK(S.k,1);render()}return}
  if(c('#reload')){if(TEAM)await selectTeam(TEAM.team_id);return}
  if(c('#signOut')){if(!sb){location.href='/coach/';return}await sb.auth.signOut();location.hash='';location.reload();return}
  if(x=c('[data-copy]')){try{await navigator.clipboard.writeText(x.dataset.copy);toast('Copied')}catch(err){toast(x.dataset.copy)}return}
  if(c('#tCreate')){const nm=($('#tName').value||'').trim();if(!nm){toast('Give the team a name');return}SETUP.busy=true;render();
    const {data,error}=await sb.rpc('keel_create_team',{team_name:nm,my_name:null});SETUP.busy=false;if(error){toast(error.message,5000);render();return}
    TEAMS=await loadTeams();TEAMS.push(demoTeam());toast('Team created');await selectTeam(data.id);location.hash='setup';return}
  if(x=c('[data-newcode]')){if(x.dataset.sure!=='1'){x.dataset.sure='1';x.textContent='Old code stops working. Sure?';return}
    const {data,error}=await sb.rpc('keel_new_code',{t:TEAM.team_id,which:x.dataset.newcode});if(error){toast(error.message);return}if(x.dataset.newcode==='coach')TEAM.coach_code=data;else TEAM.code=data;toast('New code ready');render();return}
  if(x=c('[data-remove]')){if(x.dataset.sure!=='1'){x.dataset.sure='1';x.textContent='Tap again to remove';return}
    const {error}=await sb.from('team_members').delete().eq('team_id',TEAM.team_id).eq('user_id',x.dataset.remove);if(error){toast(error.message);return}toast('Removed');await selectTeam(TEAM.team_id);return}
  if(x=c('[data-delnote]')){if(x.dataset.sure!=='1'){x.dataset.sure='1';x.textContent='Sure?';return}
    if(!isDemo()){const {error}=await sb.from('team_notes').delete().eq('id',x.dataset.delnote);if(error){toast(error.message);return}}
    NOTES=NOTES.filter(n=>n.id!==x.dataset.delnote);attachNotes();render();return}
});
document.addEventListener('change',async e=>{const t=e.target;
  if(t.id==='teamSel'){await selectTeam(t.value);return}
  if(t.id==='demoAs'){S.demoAs=t.value;S.ptab=null;location.hash=homeView();render();return}
  if(t.id==='myRole'&&t.value){if(isDemo()){S.demoAs=t.value;render();return}
    const {error}=await sb.from('team_members').update({staff:t.value}).eq('team_id',TEAM.team_id).eq('user_id',SESSION.user.id);if(error){toast(error.message,4000);return}
    TEAM.staff=t.value;const me=SQUAD.find(x=>x.id===SESSION.user.id);if(me)me.staff=t.value;toast('Saved. This is now your home page.');location.hash=homeView();render();return}
  if(t.dataset.pos){const {error}=await sb.from('team_members').update({pos:t.value.trim()||null}).eq('team_id',TEAM.team_id).eq('user_id',t.dataset.pos);if(error){toast(error.message);return}const p=SQUAD.find(x=>x.id===t.dataset.pos);if(p)p.pos=t.value.trim();toast('Saved')}});
document.addEventListener('submit',async e=>{const f=e.target;
  if(f.id==='login'){e.preventDefault();const {error}=await sb.auth.signInWithPassword({email:$('#em').value.trim(),password:$('#pw').value});if(error){toast(error.message,4000);return}location.reload();return}
  if(f.id==='signup'){e.preventDefault();const pj={name:$('#su-name').value.trim(),staff:$('#su-role').value,code:$('#su-code').value.replace(/\s/g,'').toUpperCase()};
    if(pj.code.length<6){toast('The staff code has 6 letters');return}try{localStorage.setItem('keelStaffJoin',JSON.stringify(pj))}catch(err){}
    const {data,error}=await sb.auth.signUp({email:$('#em').value.trim(),password:$('#pw').value,options:{emailRedirectTo:location.origin+'/coach/',data:{name:pj.name}}});
    if(error){toast(error.message,5000);return}if(!data.session){GATE={mode:'in',msg:'Check your email for a confirmation link, then sign in here. You\'ll join the team straight away.'};render();return}
    location.reload();return}
  if(f.id==='noteForm'){e.preventDefault();const body=($('#noteBody').value||'').trim();if(!body){toast('Write the note first');return}
    const n={team_id:TEAM.team_id,player_id:f.dataset.pid,author_name:myName(),author_staff:myStaff()||'coach',kind:S.noteKind,body,until_day:S.noteKind==='restriction'?(($('#noteUntil')||{}).value||null):null};
    if(isDemo()){NOTES.unshift(Object.assign({id:'n'+Date.now(),author_id:SESSION.user.id,created_at:new Date().toISOString()},n))}
    else{const {data,error}=await sb.from('team_notes').insert(n).select().single();if(error){toast(error.message,4000);return}NOTES.unshift(data)}
    attachNotes();S.noteKind='note';toast('Saved for the staff');render();return}
});
const demoTeam=()=>({team_id:DEMO_ID,name:'Demo squad',role:'coach',staff:null});

// ================= S&C workspace: library, programmes, assigning, Koach load suggestions =================
const SC={ex:[],progs:[],assigns:[],logs:[],missing:false,urls:{}};
const SC_CATS=[['strength','Strength'],['power','Power'],['speed','Speed'],['conditioning','Conditioning'],['core','Core'],['mobility','Mobility'],['prehab','Prehab'],['rehab','Rehab'],['recovery','Recovery']];
const KIND=[['strength','Gym'],['conditioning','Conditioning'],['speed','Speed'],['mobility','Mobility'],['recovery','Recovery']];
const DOWS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const exById=id=>SC.ex.find(e=>e.id===id);
const uid=()=>(crypto.randomUUID?crypto.randomUUID():'x'+Math.random().toString(36).slice(2));
const mondayAfter=k=>{let d=parse(k);const w=(d.getDay()+6)%7;return iso(addD(d,w===0?0:7-w))};
async function loadSC(t){SC.missing=false;SC.urls={};
  if(t.team_id===DEMO_ID){Object.assign(SC,buildDemoSC());return}
  const q=async(tb,f)=>{let r=sb.from(tb).select('*').eq('team_id',t.team_id);if(f)r=f(r);const {data,error}=await r;if(error){if(/relation|does not exist|schema cache/i.test(error.message))SC.missing=true;return []}return data||[]};
  SC.ex=(await q('sc_exercises',r=>r.order('name')));if(SC.missing){SC.progs=SC.assigns=SC.logs=[];return}
  SC.progs=await q('sc_programmes',r=>r.order('updated_at',{ascending:false}));SC.assigns=await q('sc_assignments',r=>r.eq('active',true));
  SC.logs=await q('sc_logs',r=>r.gte('day',addK(todayK(),-70)).order('day',{ascending:false}))}
async function videoUrl(path){if(!path)return null;if(SC.urls[path])return SC.urls[path];if(isDemo())return null;
  const {data,error}=await sb.storage.from('keel-videos').createSignedUrl(path,3600);if(error)return null;return SC.urls[path]=data.signedUrl}
// where a player is in their programme
function progPos(a,k){const p=SC.progs.find(x=>x.id===a.programme_id);if(!p)return null;const wk=Math.floor((parse(k)-parse(a.start_day))/(7*864e5))+1;const weeks=(p.plan&&p.plan.weeks)||[];
  return {p,wk,weeks,started:k>=a.start_day,finished:wk>weeks.length,week:weeks[wk-1]||null}}
function adherence(a,k){const pos=progPos(a,k);if(!pos||!pos.started)return {due:0,done:0};let due=0,done=0;
  for(let i=0;i<7;i++){const kk=addK(k,-i);if(kk<a.start_day)break;const pp=progPos(a,kk);if(!pp.week)continue;const dow=(parse(kk).getDay()+6)%7+1;
    pp.week.days.filter(d=>d.dow===dow).forEach(()=>{due++;if(SC.logs.some(l=>l.assignment_id===a.id&&l.week===pp.wk&&l.dow===dow&&l.done))done++})}
  return {due,done}}
// Koach: suggested load % for each player on a programme, from readiness, load and injuries
function koachLoad(p,k){const i=dayInfo(p,k),a=p.E.acwr(k),rs=activeRestr(p,k);const b=lastN(k,7).map(kk=>dayInfo(p,kk).s).filter(v=>v!=null);const b7=b.length?avg(b):null;const debt=p.E.debt(k);
  if(i.sick&&i.sick.sev==='bad')return [40,'Unwell. Pause the gym until 24 hours clear'];
  const rh=rehabOf(p.id);if(rh){const st=rh.stages[rh.stage]||{};const pct=[50,60,70,85,95][Math.min(4,Math.round(rh.stage/Math.max(1,rh.stages.length-1)*4))];return [pct,`In rehab (${rh.area.toLowerCase()}), stage ${rh.stage+1} of ${rh.stages.length}: ${st.name||''}. Follow the physio's plan for that area`]}
  if(i.pain>=5)return [60,`${i.nig.d.niggles[0].area} ${i.pain}/10. Upper body and rehab only, follow the physio`];
  if(i.sick)return [70,'Unwell. Light work only'];
  if(i.pain>=3||rs.length)return [80,`${rs.length?'Restriction: '+rs[0].body.replace(/\.\s*$/,''):i.nig.d.niggles[0].area+' '+i.pain+'/10'}. Swap out anything that aggravates it`];
  if(a!=null&&a>1.5)return [80,`Load spike: this week is ${Math.round(a*100)}% of usual`];
  if(b7!=null&&b7<55)return [85,`Balance averaging ${Math.round(b7)} this week`];
  if(a!=null&&a>1.3)return [90,`Load rising: ${Math.round(a*100)}% of usual`];
  if(debt!=null&&debt>=5)return [90,`About ${Math.round(debt)} h short on sleep this week`];
  if(a!=null&&a<.8&&b7!=null&&b7>=70)return [110,`Fresh and under-loaded (${Math.round(a*100)}% of usual)`];
  if(!i.ci)return [100,'No check-in today. Ask how they are before the session'];
  return [100,'Readiness and load look steady']}
const playerName=id=>{const p=SQUAD.find(x=>x.id===id);return p?p.name:'Player'};

function viewSCHub(){const t=route().id||'squad';
  const tabs=`<div class="toolbar"><div class="seg">${[['squad','Squad load'],['body','Body map'],['koach','Koach suggestions'],['programmes','Programmes'],['library','Exercise library']].map(([v,l])=>`<a href="#sc/${v}" aria-pressed="${t===v}" class="segl">${l}</a>`).join('')}</div></div>`;
  if(SC.missing&&t!=='squad'&&t!=='body')return tabs+`<section class="card"><header><div><h2>One more database step</h2><p>Programmes and the exercise library need their own tables.</p></div></header><ol class="steps"><li>Open Supabase › SQL Editor › New query.</li><li>Paste in everything from <b>supabase/sc.sql</b> and click Run, then confirm.</li><li>Refresh this page.</li></ol></section>`;
  return tabs+({squad:viewSC,body:()=>viewBodyMap(),koach:viewKoach,programmes:()=>S.progEdit?viewProgEditor():viewProgrammes(),library:()=>bulkCard(S.libCat&&S.libCat!=='all'?S.libCat:'strength','programmes')+viewLibrary()}[t]||viewSC)()}

function viewKoach(){const k=S.k;const rows=SC.assigns.map(a=>{const p=SQUAD.find(x=>x.id===a.player_id);if(!p||!p.share)return null;const [pct,why]=koachLoad(p,k);return {a,p,pct,why}}).filter(Boolean).sort((x,y)=>Math.abs(y.pct-y.a.load_pct)-Math.abs(x.pct-x.a.load_pct));
  if(!rows.length)return `<section class="card"><div class="empty"><h2 style="margin-bottom:6px">No one is on a programme yet</h2><p>Build or draft one under <b>Programmes</b>, then assign it to players. Koach then suggests a load for each of them every day.</p></div></section>`;
  const ch=rows.filter(r=>r.pct!==r.a.load_pct);
  return `<section class="card"><header><div><h2>Koach's load suggestions</h2><p>For ${esc(S.k===todayK()?'today':fmtK(S.k))}, from each player's balance, sleep, load against usual, niggles, sickness and staff restrictions. You decide; nothing changes until you apply it.</p></div>${ch.length?`<button class="btn sm" data-koachall="1">Apply all ${ch.length}</button>`:''}</header>
    <div style="overflow-x:auto"><table class="list"><tr><th>Player</th><th>Programme</th><th>Now</th><th>Koach suggests</th><th>Why</th><th></th></tr>${rows.map(r=>{const pr=SC.progs.find(x=>x.id===r.a.programme_id);const d=r.pct-r.a.load_pct;
      return `<tr><td><button data-player="${esc(r.p.id)}" style="text-align:left"><b style="color:var(--text)">${esc(r.p.name)}</b></button></td><td class="small">${esc(pr?pr.name:'')}</td><td class="num">${r.a.load_pct}%</td>
      <td>${d===0?'<span class="chip good">Keep</span>':`<span class="chip ${d<0?'caution':'good'}">${r.pct}%</span>`}</td><td class="small">${esc(r.why)}</td><td style="text-align:right">${d!==0?`<button class="btn ghost sm" data-koach="${esc(r.a.id)}" data-pct="${r.pct}">Apply</button>`:''}</td></tr>`}).join('')}</table></div>
    <p class="tiny muted" style="margin-top:12px">Load % scales the weights and volume players see in their app: at 80% they're told to go about 20% lighter and drop a set where there are 4 or more.</p></section>`}

function viewProgrammes(){const k=S.k;
  const card=p=>{const as=SC.assigns.filter(a=>a.programme_id===p.id);const weeks=(p.plan&&p.plan.weeks)||[];const spw=weeks.length?Math.round(avg(weeks.map(w=>(w.days||[]).length))*10)/10:0;
    const ad=as.map(a=>adherence(a,k));const due=ad.reduce((x,y)=>x+y.due,0),done=ad.reduce((x,y)=>x+y.done,0);
    return `<section class="card"><header><div><h2>${esc(p.name)}</h2><p>${esc(p.goal||'')}</p></div><button class="btn ghost sm" data-progopen="${esc(p.id)}">Open</button></header>
     <div class="kpis" style="--n:4;gap:10px">${[[weeks.length,'weeks'],[spw,'sessions a week'],[as.length,'players on it'],[due?Math.round(done/due*100)+'%':'–','done this week']].map(([v,l])=>`<div class="kpi" style="padding:12px 14px;flex-direction:column;align-items:flex-start;gap:0"><div class="v" style="font-size:24px">${v}</div><div class="l">${l}</div></div>`).join('')}</div></section>`};
  return `<section class="card"><header><div><h2>Programmes</h2><p>Build one yourself, or let Koach draft it from your exercise library and edit before anyone sees it.</p></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost sm" data-imp="1">${ico('upload','width:15px;height:15px')}Import your own</button><button class="btn ghost sm" data-prognew="1">New programme</button><button class="btn sm" data-koachdraft="1">${ico('zap','width:15px;height:15px')}Draft with Koach</button></div></header>
    ${S.koachForm?`<form id="koachForm" class="grid" style="gap:12px;background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:16px">
      <div class="grid g3" style="gap:12px"><div class="field"><label>What's it for?</label><select class="in" id="kfPhase"><option>In-season (matches most weekends)</option><option>Pre-season build</option><option>Off-season</option><option>Return from injury</option><option>Older or newer players: gentle start</option></select></div>
      <div class="field"><label>Gym sessions a week</label><select class="in" id="kfDays"><option>1</option><option selected>2</option><option>3</option></select></div><div class="field"><label>Weeks</label><select class="in" id="kfWeeks"><option>2</option><option selected>4</option><option>6</option><option>8</option></select></div></div>
      <div class="field"><label>Anything Koach should know</label><input class="in" id="kfNote" placeholder="e.g. Tuesday and Thursday pitch sessions, match Sunday, limited kit: barbell, dumbbells, bands"></div>
      <div style="display:flex;gap:8px"><button class="btn" type="submit" ${S.koachBusy?'disabled':''}>${S.koachBusy?'Koach is drafting…':'Draft it'}</button><button class="btn ghost" type="button" data-koachdraft="0">Cancel</button></div></form>`:''}</section>
   ${importCard()}${SC.progs.length?`<div class="grid g2">${SC.progs.map(card).join('')}</div>`:'<div class="card"><div class="empty">No programmes yet.</div></div>'}`}

function blankProg(){return {id:null,name:'New programme',goal:'',plan:{weeks:[{days:[{dow:1,title:'Lower body',kind:'strength',min:50,rpe:7,items:[]},{dow:4,title:'Upper body',kind:'strength',min:45,rpe:7,items:[]}]}]}}}
function viewProgEditor(){const d=S.draft;if(!d)return '';const W=d.plan.weeks;const wi=Math.min(S.wk||0,W.length-1);const w=W[wi]||{days:[]};
  const as=d.id?SC.assigns.filter(a=>a.programme_id===d.id):[];const ps=players().filter(p=>p.share).sort((a,b)=>a.name.localeCompare(b.name));
  const exOpts=sel=>`<option value="">Choose exercise…</option>${SC_CATS.map(([c,l])=>{const xs=SC.ex.filter(e=>e.category===c);return xs.length?`<optgroup label="${l}">${xs.map(e=>`<option value="${esc(e.id)}" ${sel===e.id?'selected':''}>${esc(e.name)}${e.video_path?' ▶':''}</option>`).join('')}</optgroup>`:''}).join('')}`;
  const item=(it,di,ii)=>`<div class="pitem" data-di="${di}" data-ii="${ii}">
    ${it.ex||!it.name?`<select class="in" data-f="ex">${exOpts(it.ex)}</select>`:`<div class="in" style="display:flex;align-items:center;gap:6px"><span class="chip caution">New</span>${esc(it.name)}</div>`}
    <input class="in" data-f="sets" value="${esc(it.sets??'')}" placeholder="Sets" inputmode="numeric"><input class="in" data-f="reps" value="${esc(it.reps??'')}" placeholder="Reps / time">
    <input class="in" data-f="load" value="${esc(it.load??'')}" placeholder="Load, e.g. RPE 7"><input class="in" data-f="rest" value="${esc(it.rest??'')}" placeholder="Rest">
    <input class="in pnote" data-f="note" value="${esc(it.note??'')}" placeholder="Coaching note"><button type="button" class="btn ghost sm" data-itemdel="1" aria-label="Remove">✕</button></div>`;
  const day=(dd,di)=>`<section class="card pday" data-di="${di}"><header style="flex-wrap:wrap">
     <select class="in" data-d="dow" style="width:auto">${DOWS.map((n,j)=>`<option value="${j+1}" ${dd.dow===j+1?'selected':''}>${n}</option>`).join('')}</select>
     <input class="in" data-d="title" value="${esc(dd.title||'')}" style="flex:1;min-width:160px;font-weight:600">
     <select class="in" data-d="kind" style="width:auto">${KIND.map(([v,l])=>`<option value="${v}" ${dd.kind===v?'selected':''}>${l}</option>`).join('')}</select>
     <label class="small muted" style="display:flex;align-items:center;gap:6px">Min <input class="in" data-d="min" value="${esc(dd.min??'')}" style="width:64px" inputmode="numeric"></label>
     <label class="small muted" style="display:flex;align-items:center;gap:6px">Effort <input class="in" data-d="rpe" value="${esc(dd.rpe??'')}" style="width:56px" inputmode="numeric"></label>
     <button type="button" class="btn ghost sm" data-daydel="${di}">Remove session</button></header>
     ${(dd.items||[]).length?'<div class="pitem phead2"><span>Exercise</span><span>Sets</span><span>Reps / time</span><span>Load</span><span>Rest</span><span>Note</span><span></span></div>':''}<div class="pitems">${(dd.items||[]).map((it,ii)=>item(it,di,ii)).join('')||'<div class="small muted">No exercises yet.</div>'}</div>
     <button type="button" class="btn ghost sm" data-itemadd="${di}" style="margin-top:10px">+ Add exercise</button></section>`;
  const nextMon=mondayAfter(todayK());
  return `<a class="back" href="javascript:void 0" data-progclose="1">${ico('back','width:15px;height:15px')}All programmes</a>
   ${S.draftFromKoach?`<div class="demo-note" style="border-color:var(--blue-2)">${ico('zap','width:16px;height:16px;flex:none')}<span><b>Koach's draft.</b> Check every session, change what you like, then save. Exercises marked <b>New</b> aren't in your library yet and are added when you save.</span></div>`:''}
   <section class="card"><div class="grid g2" style="gap:12px"><div class="field"><label>Name</label><input class="in" id="pName" value="${esc(d.name)}"></div><div class="field"><label>Goal</label><input class="in" id="pGoal" value="${esc(d.goal||'')}" placeholder="e.g. In-season strength, 2 gym days around Tue/Thu training"></div></div>
     <div class="toolbar" style="margin-top:14px">${W.map((x,j)=>`<button class="btn ${j===wi?'':'ghost'} sm" data-wk="${j}">Week ${j+1}</button>`).join('')}<button class="btn ghost sm" data-wkadd="copy">+ Copy week ${wi+1}</button><button class="btn ghost sm" data-wkadd="blank">+ Empty week</button>${W.length>1?`<button class="btn ghost sm" data-wkdel="${wi}">Remove week ${wi+1}</button>`:''}
     <span style="flex:1"></span><button class="btn" data-progsave="1">${d.id?'Save changes':'Save programme'}</button></div></section>
   ${w.days.map(day).join('')}<button class="btn ghost" data-dayadd="1" style="align-self:flex-start">+ Add a session to week ${wi+1}</button>
   ${d.id?`<section class="card"><header><div><h2>Who's on it</h2><p>Players see their session in Keel on the day, with videos, and log it back here.</p></div></header>
     ${as.length?`<table class="list"><tr><th>Player</th><th>Started</th><th>Week</th><th>Load</th><th>This week</th><th></th></tr>${as.map(a=>{const pos=progPos(a,todayK());const ad=adherence(a,todayK());return `<tr><td><button data-player="${esc(a.player_id)}" style="text-align:left"><b style="color:var(--text)">${esc(playerName(a.player_id))}</b></button></td><td class="small">${esc(fmtK(a.start_day,{day:'numeric',month:'short'}))}</td><td class="small">${!pos.started?'Not started':pos.finished?'Finished':'Week '+pos.wk+' of '+pos.weeks.length}</td>
       <td><select class="in" data-assignload="${esc(a.id)}" style="width:auto;padding:5px 8px">${[40,50,60,70,80,85,90,95,100,105,110,120].map(v=>`<option ${v===a.load_pct?'selected':''}>${v}</option>`).join('')}</select></td><td class="small">${ad.due?`${ad.done} of ${ad.due} done`:'–'}</td><td style="text-align:right"><button class="btn danger sm" data-unassign="${esc(a.id)}">Take off</button></td></tr>`}).join('')}</table>`:'<div class="small muted" style="margin-bottom:12px">Nobody yet.</div>'}
     <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--line)"><h3 style="margin-bottom:10px">Add players</h3>
      <div class="toolbar" style="margin-bottom:10px"><button class="btn ghost sm" data-pickall="1">Select everyone</button><button class="btn ghost sm" data-pickall="0">Clear</button>
       <label class="small muted" style="display:flex;align-items:center;gap:6px">Start <input class="in" type="date" id="asStart" value="${nextMon}" style="width:auto;padding:6px 10px"></label>
       <label class="small muted" style="display:flex;align-items:center;gap:6px">Load <select class="in" id="asLoad" style="width:auto;padding:5px 8px">${[70,80,90,100,110].map(v=>`<option ${v===100?'selected':''}>${v}</option>`).join('')}</select>%</label></div>
      <div class="pickgrid">${ps.filter(p=>!as.some(a=>a.player_id===p.id)).map(p=>`<label class="pick"><input type="checkbox" data-pick="${esc(p.id)}"><span>${esc(p.name)}<small>${esc(p.pos||'')}</small></span></label>`).join('')||'<div class="small muted">Everyone sharing is already on it.</div>'}</div>
      <button class="btn" data-assign="1" style="margin-top:12px">Put them on this programme</button></div></section>`:`<p class="small muted">Save the programme, then you can put players on it.</p>`}
   ${d.id?`<button class="btn danger sm" data-progdel="1" style="align-self:flex-start">Delete programme</button>`:''}`}

function viewLibrary(){const f=S.libCat||'all',q=(S.libQ||'').toLowerCase();const xs=SC.ex.filter(e=>(f==='all'||e.category===f)&&(!q||e.name.toLowerCase().includes(q)));
  const withV=SC.ex.filter(e=>e.video_path).length;
  return `<section class="card"><header><div><h2>Exercise library</h2><p>${SC.ex.length} exercises · ${withV} with a video. Players see the video for every exercise in their session.</p></div><button class="btn sm" data-exnew="1">+ Add exercise</button></header>
   ${S.exEdit?exForm(S.exEdit):''}
   <div class="toolbar" style="margin-bottom:14px">${seg('libCat',[['all','All'],...SC_CATS])}<input class="in" id="libQ" value="${esc(S.libQ||'')}" placeholder="Search" style="max-width:220px"></div>
   ${xs.length?`<div class="exgrid">${xs.map(e=>`<div class="excard"><button class="exvid" data-play="${esc(e.id)}" ${e.video_path?'':'disabled'} aria-label="Play ${esc(e.name)}">${e.video_path?`<span class="play">▶</span>`:'<span class="tiny muted">No video yet</span>'}</button>
      <div style="padding:12px 14px;display:flex;flex-direction:column;gap:4px"><b style="color:var(--text)">${esc(e.name)}</b><span class="tiny muted">${esc((SC_CATS.find(c=>c[0]===e.category)||['',''])[1])}${e.equipment?' · '+esc(e.equipment):''}</span>${e.cues?`<span class="small" style="color:var(--text-body)">${esc(e.cues)}</span>`:''}
      <div style="margin-top:6px"><button class="btn ghost sm" data-exedit="${esc(e.id)}">Edit</button></div></div></div>`).join('')}</div>`:'<div class="empty">Nothing here yet. Add your first exercise and its video.</div>'}</section>`}
function exForm(e){return `<form id="exForm" data-id="${esc(e.id||'')}" style="display:flex;flex-direction:column;gap:12px;background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:16px;margin-bottom:16px">
  <div class="grid g3" style="gap:12px"><div class="field"><label>Name</label><input class="in" id="exName" value="${esc(e.name||'')}" required maxlength="80"></div>
   <div class="field"><label>Type</label><select class="in" id="exCat">${SC_CATS.map(([v,l])=>`<option value="${v}" ${e.category===v?'selected':''}>${l}</option>`).join('')}</select></div>
   <div class="field"><label>Equipment</label><input class="in" id="exEq" value="${esc(e.equipment||'')}" placeholder="e.g. Barbell"></div></div>
  <div class="field"><label>Coaching cues</label><input class="in" id="exCues" value="${esc(e.cues||'')}" placeholder="e.g. Chest up, knees out, drive through the whole foot"></div>
  <div class="field"><label>Video ${e.video_path?'(uploading a new one replaces it)':''}</label><input class="in" id="exVid" type="file" accept="video/mp4,video/quicktime,video/webm"><span class="tiny muted">MP4 or MOV, up to 50 MB. Short clips (10–30 seconds, filmed side-on) work best on phones.</span></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="submit" ${S.exBusy?'disabled':''}>${S.exBusy?esc(S.exBusy):'Save exercise'}</button><button class="btn ghost" type="button" data-exnew="0">Cancel</button>${e.id?`<span style="flex:1"></span><button class="btn danger" type="button" data-exdel="${esc(e.id)}">Delete</button>`:''}</div></form>`}

// player page: their S&C programme
function playerSC(p){const as=SC.assigns.filter(a=>a.player_id===p.id);if(!as.length)return `<section class="card"><header><div><h2>Programme</h2><p>Not on a programme. Add them from S&C › Programmes.</p></div></header></section>`;
  return as.map(a=>{const pos=progPos(a,todayK());const ad=adherence(a,todayK());const [pct,why]=koachLoad(p,S.k);const lg=SC.logs.filter(l=>l.assignment_id===a.id).slice(0,8);
    return `<section class="card"><header><div><h2>${esc(pos?pos.p.name:'Programme')}</h2><p>${!pos?'':!pos.started?'Starts '+esc(fmtK(a.start_day)):pos.finished?'Finished':'Week '+pos.wk+' of '+pos.weeks.length} · load ${a.load_pct}% · ${ad.due?ad.done+' of '+ad.due+' done this week':'nothing due this week'}</p></div></header>
     <div class="flag"><span class="ic" style="background:color-mix(in srgb,var(--blue-2) 18%,transparent);color:var(--blue)">${ico('zap')}</span><span class="who"><b>Koach suggests ${pct}%</b><span>${esc(why)}</span></span>${pct!==a.load_pct?`<button class="btn ghost sm" data-koach="${esc(a.id)}" data-pct="${pct}">Apply</button>`:''}</div>
     ${lg.length?`<table class="list" style="margin-top:10px"><tr><th>Day</th><th>Session</th><th>Min</th><th>Effort</th></tr>${lg.map(l=>`<tr><td>${esc(fmtK(l.day))}</td><td>${esc(l.title||'')}${l.done?'':' <span class="chip alert">Missed</span>'}</td><td class="num">${l.dur||'–'}</td><td class="num">${l.rpe||'–'}</td></tr>`).join('')}</table>`:'<div class="small muted" style="margin-top:10px">No sessions logged yet.</div>'}</section>`}).join('')}

// demo content
function buildDemoSC(){const E=(id,name,category,equipment,cues)=>({id,name,category,equipment,cues,video_path:null});
  const ex=[E('e1','Trap bar deadlift','strength','Trap bar','Hips back, chest proud, push the floor away'),E('e2','Back squat','strength','Barbell','Brace, knees out, sit between your hips'),E('e3','Rear-foot elevated split squat','strength','Dumbbells','Tall torso, front knee tracks the toes'),
    E('e4','Bench press','strength','Barbell','Shoulder blades back, bar to lower chest'),E('e5','Chin-up','strength','Bar','Full hang to chin over'),E('e6','Single-arm dumbbell row','strength','Dumbbell','Elbow to hip, no twisting'),
    E('e7','Nordic hamstring curl','prehab','Partner or strap','Slow on the way down, hips straight'),E('e8','Copenhagen plank','prehab','Bench','Top leg on the bench, hips high'),E('e9','Box jump','power','Box','Land soft and quiet, step down'),
    E('e10','Med ball rotational throw','power','Med ball','Load the back hip, throw through the wall'),E('e11','Pallof press','core','Band','Resist the turn, ribs down'),E('e12','Tibialis raise','prehab','Wall','Heels down, toes to shins'),
    E('e13','30-15 shuttles','conditioning','Cones','30 s on, 15 s easy jog back'),E('e14','Hip 90/90 switches','mobility','None','Tall spine, slow switches'),E('e15','Foam roll: quads and calves','recovery','Foam roller','Slow, 60 s each area'),E('e16','Easy spin bike','recovery','Bike','Conversational pace')];
  const it=(ex,sets,reps,load,rest)=>({ex,sets,reps,load,rest,note:''});
  const wk=v=>({days:[{dow:1,title:'Lower body strength',kind:'strength',min:50,rpe:7,items:[it('e1',v+2,'5','RPE 7','2–3 min'),it('e3',3,'6 each side','RPE 7','90 s'),it('e7',3,'4','Bodyweight','2 min'),it('e8',2,'20 s each side','','60 s'),it('e11',2,'10 each side','','45 s')]},
    {dow:3,title:'Recovery and mobility',kind:'recovery',min:25,rpe:3,items:[it('e16',1,'15 min','Easy',''),it('e14',2,'8 each side','',''),it('e15',1,'5 min','','')]},
    {dow:5,title:'Upper body and power',kind:'strength',min:45,rpe:6,items:[it('e9',3,'3','Bodyweight','90 s'),it('e10',3,'4 each side','4 kg','60 s'),it('e4',v+1,'6','RPE 7','2 min'),it('e5',3,'Max -2','','90 s'),it('e6',3,'8 each side','RPE 7','60 s'),it('e12',2,'15','','45 s')]}]});
  const progs=[{id:'p1',name:'In-season: 2 gym days + recovery',goal:'Hold strength and power through the league; matches Sunday, pitch Tue/Thu',plan:{weeks:[wk(1),wk(1),wk(2),wk(0)]},updated_at:new Date().toISOString()}];
  const start=addK(mondayAfter(addK(todayK(),-21)),0);const assigns=[],logs=[];const R=rng(77);
  players().forEach((p,ix)=>{if(ix%6===5)return;const a={id:'a'+ix,team_id:DEMO_ID,programme_id:'p1',player_id:p.id,start_day:start,load_pct:ix===10?100:ix===2?100:[100,100,90,100][ix%4],active:true};assigns.push(a);
    for(let d=0;d<28;d++){const k=addK(start,d);if(k>=todayK())break;const wkn=Math.floor(d/7)+1,dow=(parse(k).getDay()+6)%7+1;const day=progs[0].plan.weeks[wkn-1]&&progs[0].plan.weeks[wkn-1].days.find(x=>x.dow===dow);if(!day)continue;
      const miss=R()<(ix===19||ix===21?.6:.12);logs.push({id:'l'+ix+'-'+d,assignment_id:a.id,team_id:DEMO_ID,player_id:p.id,day:k,week:wkn,dow,title:day.title,done:!miss,dur:miss?null:day.min+Math.round(R()*10-5),rpe:miss?null:Math.max(2,Math.min(10,day.rpe+Math.round(R()*2-1)))})}});
  logs.sort((a,b)=>b.day.localeCompare(a.day));return {ex,progs,assigns,logs,missing:false}}

// ---------- S&C events ----------
async function setLoad(id,pct){const a=SC.assigns.find(x=>x.id===id);if(!a)return false;
  if(!isDemo()){const {error}=await sb.from('sc_assignments').update({load_pct:pct,updated_at:new Date().toISOString()}).eq('id',id);if(error){toast(error.message,4000);return false}}a.load_pct=pct;return true}
function fallbackDraft(nDays,nWeeks,phase){const pick=(cat,n)=>SC.ex.filter(e=>e.category===cat).slice(0,n);const it=(e,sets,reps,load,rest)=>({ex:e.id,sets,reps,load,rest,note:''});
  const A=[...pick('power',1).map(e=>it(e,3,'3','Bodyweight','90 s')),...pick('strength',2).map(e=>it(e,3,'5','RPE 7','2 min')),...pick('prehab',2).map(e=>it(e,2,'6','','60 s')),...pick('core',1).map(e=>it(e,2,'10 each side','','45 s'))];
  const B=[...pick('power',2).slice(1).map(e=>it(e,3,'4','','60 s')),...pick('strength',4).slice(2).map(e=>it(e,3,'8','RPE 7','90 s')),...pick('prehab',3).slice(2).map(e=>it(e,2,'15','','45 s'))];
  const Rc=[...pick('recovery',2).map(e=>it(e,1,'10 min','Easy','')),...pick('mobility',1).map(e=>it(e,2,'8 each side','',''))];
  const days=[{dow:1,title:'Lower body strength',kind:'strength',min:50,rpe:7,items:A},{dow:3,title:'Recovery and mobility',kind:'recovery',min:25,rpe:3,items:Rc},{dow:5,title:'Upper body and power',kind:'strength',min:45,rpe:6,items:B}];
  const use=nDays>=3?[days[0],{...days[0],dow:3,title:'Full body'},days[2],{...days[1],dow:6,title:'Recovery and mobility'}]:nDays===2?[days[0],days[1],days[2]]:[days[0],days[1]];
  return {name:phase.split('(')[0].trim()+': '+nDays+' gym day'+(nDays>1?'s':''),goal:phase,plan:{weeks:Array.from({length:nWeeks},(_,w)=>({days:JSON.parse(JSON.stringify(use))}))}}}
async function koachDraft(){const phase=$('#kfPhase').value,n=+$('#kfDays').value,w=+$('#kfWeeks').value,note=$('#kfNote').value.trim();
  S.koachBusy=true;render();let out=null;
  if(!isDemo()&&SESSION&&SESSION.access_token){const lib=SC.ex.map(e=>`${e.id}|${e.name}|${e.category}`).join('\n');
    const prompt=`You are Koach, the strength and conditioning assistant inside Keel, drafting a programme for a GAA football squad's S&C coach to review and edit.
Programme: ${phase}. ${n} gym session(s) a week for ${w} weeks. ${note?'Coach notes: '+note:''}
Rules: keep gym sessions away from the day before a match (assume matches Sunday and pitch training Tuesday and Thursday unless the notes say otherwise). Add one short recovery or mobility session a week. Include hamstring and groin prehab (e.g. Nordics, Copenhagens) every week. Progress gently week to week; if there are 4 or more weeks, make the last one a lighter deload. Use RPE for load. Keep sessions 30 to 60 minutes.
Use exercises from this library wherever possible, giving their id in "ex" (format id|name|category):
${lib||'(library is empty)'}
If you need an exercise that isn't in the library, leave out "ex" and give "name" and "category" (one of strength, power, speed, conditioning, core, mobility, prehab, recovery).
Reply with JSON only, no prose, in this shape:
{"name":"...","goal":"...","weeks":[{"days":[{"dow":1,"title":"...","kind":"strength|conditioning|speed|mobility|recovery","min":45,"rpe":7,"items":[{"ex":"<id>","sets":3,"reps":"5","load":"RPE 7","rest":"2 min","note":"short coaching note"}]}]}]}
dow is 1 = Monday to 7 = Sunday.`;
    try{const r=await fetch('/api/claude',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+SESSION.access_token},body:JSON.stringify({prompt,maxTokens:12000})});const j=await r.json();
      const m=(j.text||'').match(/\{[\s\S]*\}/);if(m){const o=JSON.parse(m[0]);if(o&&Array.isArray(o.weeks)&&o.weeks.length)out={name:o.name||phase,goal:o.goal||phase,plan:{weeks:o.weeks.map(x=>({days:(x.days||[]).map(d=>({dow:+d.dow||1,title:d.title||'Session',kind:KIND.some(k=>k[0]===d.kind)?d.kind:'strength',min:+d.min||45,rpe:+d.rpe||6,
        items:(d.items||[]).map(i=>{const ok=i.ex&&exById(i.ex);return {ex:ok?i.ex:null,name:ok?null:(i.name||(i.ex&&String(i.ex))||'Exercise'),category:ok?null:(SC_CATS.some(c=>c[0]===i.category)?i.category:'strength'),sets:i.sets??'',reps:i.reps??'',load:i.load??'',rest:i.rest??'',note:i.note??''}})}))}))}}}}
    catch(e){}}
  if(!out){out=fallbackDraft(n,w,phase);if(!isDemo())toast('Koach couldn\'t be reached, so here\'s a starter template from your library',4500)}
  S.koachBusy=false;S.koachForm=false;S.draft=Object.assign({id:null},out);S.draftFromKoach=true;S.wk=0;S.progEdit='new';render()}
async function saveProgramme(){const d=S.draft;d.name=($('#pName')||{}).value||d.name;d.goal=($('#pGoal')||{}).value||'';
  // add any new exercises Koach suggested to the library first
  for(const w of d.plan.weeks)for(const day of w.days)for(const it of day.items){if(it.ex||!it.name)continue;
    let ex=SC.ex.find(e=>e.name.toLowerCase()===it.name.toLowerCase());
    if(!ex){const row={team_id:TEAM.team_id,name:it.name.slice(0,80),category:it.category||'strength'};
      if(isDemo())ex=Object.assign({id:uid(),video_path:null},row);else{const {data,error}=await sb.from('sc_exercises').insert(row).select().single();if(error){toast(error.message,4000);return}ex=data}SC.ex.push(ex)}
    it.ex=ex.id;delete it.name;delete it.category}
  d.plan.weeks.forEach(w=>w.days.forEach(day=>{day.items=day.items.filter(i=>i.ex);day.min=+day.min||null;day.rpe=+day.rpe||null}));
  const row={name:d.name.slice(0,100),goal:d.goal,plan:d.plan,updated_at:new Date().toISOString()};
  if(isDemo()){if(d.id){Object.assign(SC.progs.find(p=>p.id===d.id),row)}else{d.id=uid();SC.progs.unshift(Object.assign({id:d.id,team_id:DEMO_ID},row))}}
  else if(d.id){const {error}=await sb.from('sc_programmes').update(row).eq('id',d.id);if(error){toast(error.message,4000);return}Object.assign(SC.progs.find(p=>p.id===d.id)||{},row)}
  else{const {data,error}=await sb.from('sc_programmes').insert(Object.assign({team_id:TEAM.team_id},row)).select().single();if(error){toast(error.message,4000);return}d.id=data.id;SC.progs.unshift(data)}
  S.draftFromKoach=false;S.progEdit=d.id;toast('Programme saved');render()}
function draftDay(el){const di=+el.closest('[data-di]').dataset.di;return S.draft.plan.weeks[Math.min(S.wk||0,S.draft.plan.weeks.length-1)].days[di]}
document.addEventListener('input',e=>{const t=e.target;if(!S.draft)return;
  if(t.id==='pName')S.draft.name=t.value;else if(t.id==='pGoal')S.draft.goal=t.value;
  else if(t.dataset.f){const di=t.closest('.pitem');const day=draftDay(di);day.items[+di.dataset.ii][t.dataset.f]=t.value}
  else if(t.dataset.d){draftDay(t)[t.dataset.d]=t.dataset.d==='dow'?+t.value:t.value}});
document.addEventListener('change',async e=>{const t=e.target;
  if(t.id==='libQ'){S.libQ=t.value;setTimeout(render,0);return}
  if(t.dataset.assignload){if(await setLoad(t.dataset.assignload,+t.value))toast('Load set to '+t.value+'%');return}});
document.addEventListener('click',async e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(x=c('[data-koach]')){if(await setLoad(x.dataset.koach,+x.dataset.pct)){toast('Load set to '+x.dataset.pct+'%');render()}return}
  if(c('[data-koachall]')){let n=0;for(const a of SC.assigns){const p=SQUAD.find(y=>y.id===a.player_id);if(!p||!p.share)continue;const [pct]=koachLoad(p,S.k);if(pct!==a.load_pct&&await setLoad(a.id,pct))n++}toast(`Updated ${n} players`);render();return}
  if(x=c('[data-koachdraft]')){S.koachForm=x.dataset.koachdraft==='1';render();return}
  if(c('[data-prognew]')){S.draft=blankProg();S.draftFromKoach=false;S.wk=0;S.progEdit='new';render();return}
  if(x=c('[data-progopen]')){const p=SC.progs.find(y=>y.id===x.dataset.progopen);S.draft=JSON.parse(JSON.stringify({id:p.id,name:p.name,goal:p.goal,plan:p.plan&&p.plan.weeks?p.plan:{weeks:[{days:[]}]}}));S.draftFromKoach=false;S.wk=0;S.progEdit=p.id;render();return}
  if(c('[data-progclose]')){S.progEdit=null;S.draft=null;render();return}
  if(c('[data-progsave]')){await saveProgramme();return}
  if(x=c('[data-progdel]')){if(x.dataset.sure!=='1'){x.dataset.sure='1';x.textContent='Players on it lose it too. Sure?';return}
    if(!isDemo()){const {error}=await sb.from('sc_programmes').delete().eq('id',S.draft.id);if(error){toast(error.message);return}}SC.progs=SC.progs.filter(p=>p.id!==S.draft.id);SC.assigns=SC.assigns.filter(a=>a.programme_id!==S.draft.id);S.progEdit=null;S.draft=null;toast('Deleted');render();return}
  if(x=c('[data-wk]')){S.wk=+x.dataset.wk;render();return}
  if(x=c('[data-wkadd]')){const W=S.draft.plan.weeks;W.push(x.dataset.wkadd==='copy'?JSON.parse(JSON.stringify(W[Math.min(S.wk||0,W.length-1)])):{days:[]});S.wk=W.length-1;render();return}
  if(x=c('[data-wkdel]')){S.draft.plan.weeks.splice(+x.dataset.wkdel,1);S.wk=0;render();return}
  if(c('[data-dayadd]')){const W=S.draft.plan.weeks;W[Math.min(S.wk||0,W.length-1)].days.push({dow:2,title:'New session',kind:'strength',min:45,rpe:6,items:[]});render();return}
  if(x=c('[data-daydel]')){const W=S.draft.plan.weeks;W[Math.min(S.wk||0,W.length-1)].days.splice(+x.dataset.daydel,1);render();return}
  if(x=c('[data-itemadd]')){draftDay(x.closest('.pday')).items.push({ex:'',sets:3,reps:'',load:'',rest:'',note:''});render();return}
  if(x=c('[data-itemdel]')){const it=x.closest('.pitem');draftDay(it).items.splice(+it.dataset.ii,1);render();return}
  if(x=c('[data-pickall]')){document.querySelectorAll('[data-pick]').forEach(b=>b.checked=x.dataset.pickall==='1');return}
  if(c('[data-assign]')){const ids=[...document.querySelectorAll('[data-pick]:checked')].map(b=>b.dataset.pick);if(!ids.length){toast('Tick the players first');return}
    const start=$('#asStart').value||mondayAfter(todayK()),load=+$('#asLoad').value||100;const gid=S.pickGroup&&!HUB.missing&&grpMembers(S.pickGroup).every(u=>ids.includes(u)||!allPlayers().some(p=>p.id===u))?S.pickGroup:null;const rows=ids.map(pid=>Object.assign({team_id:TEAM.team_id,programme_id:S.draft.id,player_id:pid,start_day:start,load_pct:load},gid&&grpMembers(gid).includes(pid)?{group_id:gid}:{}));S.pickGroup=null;
    if(isDemo())rows.forEach(r=>SC.assigns.push(Object.assign({id:uid(),active:true},r)));else{const {data,error}=await sb.from('sc_assignments').insert(rows).select();if(error){toast(error.message,4000);return}SC.assigns.push(...data)}
    toast(`${ids.length} player${ids.length>1?'s':''} added. They'll see it in Keel from ${fmtK(start,{weekday:'long',day:'numeric',month:'short'})}`,4500);render();return}
  if(x=c('[data-unassign]')){if(x.dataset.sure!=='1'){x.dataset.sure='1';x.textContent='Sure?';return}
    if(!isDemo()){const {error}=await sb.from('sc_assignments').update({active:false}).eq('id',x.dataset.unassign);if(error){toast(error.message);return}}SC.assigns=SC.assigns.filter(a=>a.id!==x.dataset.unassign);render();return}
  if(x=c('[data-exnew]')){S.exEdit=x.dataset.exnew==='1'?{}:null;render();return}
  if(x=c('[data-exedit]')){S.exEdit=Object.assign({},exById(x.dataset.exedit));render();scrollTo(0,0);return}
  if(x=c('[data-exdel]')){if(x.dataset.sure!=='1'){x.dataset.sure='1';x.textContent='Sure?';return}const ex=exById(x.dataset.exdel);
    if(!isDemo()){const {error}=await sb.from('sc_exercises').delete().eq('id',ex.id);if(error){toast(error.message);return}if(ex.video_path)await sb.storage.from('keel-videos').remove([ex.video_path])}
    SC.ex=SC.ex.filter(y=>y.id!==ex.id);S.exEdit=null;toast('Deleted');render();return}
  if(x=c('[data-play]')){const ex=exById(x.dataset.play);const u=await videoUrl(ex.video_path);if(!u){toast('Could not load the video');return}
    const m=document.createElement('div');m.className='modal';m.innerHTML=`<div class="mbox"><header style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><h2 style="flex:1">${esc(ex.name)}</h2><button class="btn ghost sm" data-modalclose="1">Close</button></header><video src="${esc(u)}" controls autoplay playsinline style="width:100%;border-radius:12px;background:#000;max-height:70vh"></video>${ex.cues?`<p class="small" style="margin-top:10px">${esc(ex.cues)}</p>`:''}</div>`;document.body.appendChild(m);return}
  if(c('[data-modalclose]')||(e.target.classList&&e.target.classList.contains('modal'))){document.querySelectorAll('.modal').forEach(m=>m.remove());return}
});
document.addEventListener('submit',async e=>{const f=e.target;
  if(f.id==='koachForm'){e.preventDefault();await koachDraft();return}
  if(f.id==='exForm'){e.preventDefault();const id=f.dataset.id;const row={name:$('#exName').value.trim().slice(0,80),category:$('#exCat').value,equipment:$('#exEq').value.trim()||null,cues:$('#exCues').value.trim()||null};if(!row.name)return;
    const file=$('#exVid').files[0];const old=id?exById(id):null;
    if(file){if(file.size>52428800){toast('That video is over 50 MB. Trim it or export it smaller.',5000);return}
      const path=`${TEAM.team_id}/${uid()}.${(file.name.split('.').pop()||'mp4').toLowerCase()}`;
      if(isDemo()){SC.urls[path]=URL.createObjectURL(file)}else{S.exBusy='Uploading video…';render();const {error}=await sb.storage.from('keel-videos').upload(path,file,{contentType:file.type||'video/mp4'});if(error){S.exBusy=null;toast('Upload failed: '+error.message,5000);render();return}
        if(old&&old.video_path)sb.storage.from('keel-videos').remove([old.video_path])}
      row.video_path=path}
    S.exBusy='Saving…';render();
    if(isDemo()){if(old)Object.assign(old,row);else SC.ex.push(Object.assign({id:uid(),team_id:DEMO_ID,video_path:null},row))}
    else if(old){const {error}=await sb.from('sc_exercises').update(row).eq('id',id);if(error){S.exBusy=null;toast(error.message,4000);render();return}Object.assign(old,row)}
    else{const {data,error}=await sb.from('sc_exercises').insert(Object.assign({team_id:TEAM.team_id},row)).select().single();if(error){S.exBusy=null;toast(error.message,4000);render();return}SC.ex.push(data)}
    SC.ex.sort((a,b)=>a.name.localeCompare(b.name));S.exBusy=null;S.exEdit=null;toast('Exercise saved');render();return}});

// ================= Nutrition workspace: targets and meal plans sent into players' Food tab =================
const NUT={targets:[],plans:[],own:{},missing:false};
const DT=[['training','Training day'],['match','Match day'],['rest','Rest day']];
const MAC=[['kcal','Calories',''],['protein','Protein','g'],['carbs','Carbs','g'],['fat','Fat','g']];
// starting targets for a squad player (about 80 kg); the nutritionist adjusts per player
const APP_DEF={rest:{kcal:2400,protein:160,carbs:250,fat:80},training:{kcal:2900,protein:170,carbs:360,fat:85},match:{kcal:3250,protein:170,carbs:440,fat:85}};
async function loadNut(t){NUT.missing=false;NUT.own={};
  if(t.team_id===DEMO_ID){Object.assign(NUT,buildDemoNut());return}
  const a=await sb.from('nut_targets').select('*').eq('team_id',t.team_id);if(a.error){if(/relation|does not exist|schema cache/i.test(a.error.message))NUT.missing=true;NUT.targets=NUT.plans=[];return}
  NUT.targets=a.data||[];const b=await sb.from('nut_plans').select('*').eq('team_id',t.team_id).order('created_at',{ascending:false}).limit(300);NUT.plans=b.data||[];
  const c=await sb.rpc('keel_team_nutrition',{t:t.team_id});(c.data||[]).forEach(r=>NUT.own[r.user_id]=r.own)}
const tgtOf=pid=>NUT.targets.find(x=>x.player_id===pid&&x.active);
const ownTargets=pid=>{const o=NUT.own[pid];if(!o)return null;const r={};DT.forEach(([k])=>{r[k]=Object.assign({},APP_DEF[k],o[k]||{})});return r};
const plansOf=pid=>NUT.plans.filter(x=>x.player_id===pid).sort((a,b)=>b.created_at.localeCompare(a.created_at));
// a day's type from what the player has on: match, training or rest
function dayTypeGuess(p,k){const ss=sessionsOn(p,k);if(ss.some(s=>/match/i.test(s.what)))return 'match';
  if(ss.some(s=>s.st!=='missed'))return 'training';const dow=(parse(k).getDay()+6)%7+1;
  if(SC.assigns.some(a=>{if(a.player_id!==p.id)return false;const pp=progPos(a,k);return pp&&pp.week&&pp.week.days.some(d=>d.dow===dow)}))return 'training';
  if(dow===7)return 'match';if(dow===2||dow===4)return 'training';return 'rest'}
// Koach's starting point for targets: the player's own app targets (or Keel's defaults) nudged by what they eat and do
function koachTargets(p){const base=ownTargets(p.id)||JSON.parse(JSON.stringify(APP_DEF));const why=[];const wk=lastN(S.k,14);
  const lg=wk.map(kk=>foodOn(p,kk)).filter(Boolean);const prot=avgOf(lg.map(f=>f.protein));const load=p.E.load7(S.k);
  const out=JSON.parse(JSON.stringify(base));
  if(load>2500){DT.forEach(([k])=>{out[k].carbs=Math.round(out[k].carbs*1.15)});out.training.kcal+=150;out.match.kcal+=200;why.push('Heavy training load: more carbs and energy on training and match days')}
  if(prot!=null&&prot<out.training.protein*.8)why.push(`Eating about ${Math.round(prot)} g protein a day, well under target: spread it over 4 meals`);
  out.match.carbs=Math.max(out.match.carbs,out.training.carbs+60);if(!why.length)why.push('Their current targets suit their load. Fine-tune from here');
  DT.forEach(([k])=>{const o=out[k];o.kcal=Math.round(4*o.carbs+4*o.protein+9*o.fat)});return {t:out,why}}

function viewNutHub(){const t=route().id||'squad';
  const tabs=`<div class="toolbar"><div class="seg">${[['squad','Squad food'],['plans','Players and plans']].map(([v,l])=>`<a href="#nutrition/${v}" aria-pressed="${t===v}" class="segl">${l}</a>`).join('')}</div></div>`;
  if(t==='plans'){if(NUT.missing)return tabs+`<section class="card"><header><div><h2>One more database step</h2><p>Targets and meal plans need their own tables.</p></div></header><ol class="steps"><li>Open Supabase › SQL Editor › New query.</li><li>Paste in everything from <b>supabase/nutrition.sql</b> and click Run, then confirm.</li><li>Refresh this page.</li></ol></section>`;return tabs+viewNutPlans()}
  return tabs+viewNutrition()}
function viewNutPlans(){const ps=players().sort((a,b)=>a.name.localeCompare(b.name));const k=todayK();
  return `<section class="card"><header><div><h2>Players and plans</h2><p>Set each player's targets and send them meal plans. Koach drafts, you check and send. Players see them in their Food tab as "From your team".</p></div></header>
   <div style="overflow-x:auto"><table class="list"><tr><th>Player</th><th>Shares food</th><th>Targets</th><th>Meal plan</th><th>Logged this week</th><th></th></tr>${ps.map(p=>{const tg=tgtOf(p.id);const pl=plansOf(p.id)[0];const lg=p.food?lastN(k,7).filter(kk=>foodOn(p,kk)).length:null;
    return `<tr><td><b style="color:var(--text)">${esc(p.name)}</b><div class="tiny muted">${esc(p.pos||'')}</div></td><td>${p.food?'<span class="chip good">Yes</span>':'<span class="chip">No</span>'}</td>
     <td class="small">${tg?`Set ${esc(fmtK(tg.updated_at.slice(0,10),{day:'numeric',month:'short'}))}${tg.set_by_name?' · '+esc(tg.set_by_name):''}`:'<span class="muted">Their own</span>'}</td>
     <td class="small">${pl?(pl.last_day>=k?`<span style="color:var(--good)">Until ${esc(fmtK(pl.last_day,{weekday:'short',day:'numeric',month:'short'}))}</span>`:`Ended ${esc(fmtK(pl.last_day,{day:'numeric',month:'short'}))}`):'<span class="muted">None</span>'}</td>
     <td>${lg==null?'<span class="muted">–</span>':sevChip(lg,5,3,lg+'/7')}</td><td style="text-align:right"><button class="btn ghost sm" data-nutopen="${esc(p.id)}">Open</button></td></tr>`}).join('')}</table></div></section>`}

// player page: the nutritionist's workspace
function nutWorkspace(p){if(NUT.missing)return `<section class="card"><div class="empty">Run <b>supabase/nutrition.sql</b> in Supabase to set targets and send meal plans.</div></section>`;
  const tg=tgtOf(p.id),own=ownTargets(p.id);const ed=S.nutT&&S.nutT.pid===p.id?S.nutT:null;const cur=ed?ed.t:(tg?tg.targets:(own||APP_DEF));
  const cell=(dt,m)=>ed?`<input class="in num" data-nt="${dt}.${m}" value="${esc(cur[dt]&&cur[dt][m]!=null?cur[dt][m]:'')}" inputmode="numeric" style="padding:6px 8px;width:86px">`:`<span class="num">${cur[dt]&&cur[dt][m]!=null?Math.round(cur[dt][m]):'–'}</span>`;
  const targetsCard=`<section class="card"><header><div><h2>Targets</h2><p>${tg?`Set by ${esc(tg.set_by_name||'the team')} on ${esc(fmtK(tg.updated_at.slice(0,10)))}. The player's Food tab uses these.`:own?'Their own app targets. Set team targets to replace them.':`Keel's starting targets${p.food?'':' (they don\'t share food, so their own targets are private)'}.`}</p></div>
     ${ed?'':`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost sm" data-nutedit="${esc(p.id)}">Edit</button><button class="btn sm" data-nutkoach="${esc(p.id)}">${ico('zap','width:15px;height:15px')}Koach suggests</button></div>`}</header>
    ${ed&&ed.why?`<div class="flag" style="margin-bottom:10px"><span class="ic" style="background:color-mix(in srgb,var(--blue-2) 18%,transparent);color:var(--blue)">${ico('zap')}</span><span class="who"><b>Koach's suggestion</b><span>${esc(ed.why.join(' · '))}</span></span></div>`:''}
    <div style="overflow-x:auto"><table class="list"><tr><th></th>${MAC.map(m=>`<th>${m[1]}${m[2]?' ('+m[2]+')':''}</th>`).join('')}</tr>${DT.map(([dt,l])=>`<tr><td><b style="color:var(--text)">${l}</b></td>${MAC.map(([m])=>`<td>${cell(dt,m)}</td>`).join('')}</tr>`).join('')}</table></div>
    ${ed?`<div class="field" style="margin-top:12px"><label>Note for the player (optional)</label><input class="in" id="ntNote" value="${esc(ed.note||'')}" placeholder="e.g. Bump protein at breakfast; carbs up the day before matches"></div>
     <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" data-nutsave="${esc(p.id)}">Approve and send to ${esc(first(p.name))}</button>${HUB.groups.length?`<select class="sel" id="nutGrp"><option value="">Just ${esc(first(p.name))}</option>${HUB.groups.map(g=>`<option value="${esc(g.id)}">Also everyone in ${esc(g.name)}</option>`).join('')}</select>`:''}<button class="btn ghost" data-nutcancel="1">Cancel</button></div>`:(tg&&tg.note?`<p class="small" style="margin-top:10px">Note: ${esc(tg.note)}</p>`:'')}</section>`;
  const pe=S.nutP&&S.nutP.pid===p.id?S.nutP:null;const sent=plansOf(p.id);
  const tgFor=dt=>((tg?tg.targets:(own||APP_DEF))[dt])||APP_DEF[dt];
  const planEditor=pe?`<div class="demo-note" style="border-color:var(--blue-2)">${ico('zap','width:16px;height:16px;flex:none')}<span>${pe.koach?'<b>Koach\'s draft.</b> ':''}Check each meal, change what you like, then send. Totals compare each day with its targets.</span></div>
    ${pe.days.map((d,di)=>{const tot={kcal:0,protein:0,carbs:0,fat:0};d.meals.forEach(m=>MAC.forEach(([x])=>tot[x]+=+m[x]||0));const T=tgFor(d.dayType);
      return `<section class="card nday" data-di="${di}"><header style="flex-wrap:wrap;align-items:center"><div><h2>${esc(fmtK(d.date,{weekday:'long',day:'numeric',month:'short'}))}</h2></div>
        <select class="in" data-nd="dayType" style="width:auto">${DT.map(([v,l])=>`<option value="${v}" ${d.dayType===v?'selected':''}>${l}</option>`).join('')}</select></header>
        <div class="legend" style="margin-bottom:10px">${MAC.map(([x,l,u])=>{const v=Math.round(tot[x]),t=T[x];const off=t?Math.abs(v-t)/t:0;return `<span style="color:${off<=.08?'var(--good)':off<=.18?'var(--caution)':'var(--alert)'}">${l} ${v}${u?' '+u:''} / ${t}</span>`}).join('')}</div>
        <div class="nmeal phead2"><span>Meal</span><span>Time</span><span>What</span><span>Ingredients</span><span>Calories</span><span>Protein</span><span>Carbs</span><span>Fat</span><span></span></div>
        <div class="pitems">${d.meals.map((m,mi)=>`<div class="nmeal" data-mi="${mi}"><input class="in" data-nm="slot" value="${esc(m.slot||'')}" placeholder="Meal"><input class="in" data-nm="time" value="${esc(m.time||'')}" placeholder="Time"><input class="in" data-nm="name" value="${esc(m.name||'')}" placeholder="What it is">
          <input class="in nitems" data-nm="itemsTxt" value="${esc((m.items||[]).map(i=>i.qty?i.qty+' '+i.name:i.name).join(', '))}" placeholder="Ingredients, e.g. 80 g oats, 250 ml milk">
          ${MAC.map(([x,l])=>`<input class="in num" data-nm="${x}" value="${esc(m[x]??'')}" placeholder="${l}" inputmode="numeric" title="${l}">`).join('')}<button type="button" class="btn ghost sm" data-nmdel="${mi}" aria-label="Remove meal">✕</button></div>`).join('')}</div>
        <button type="button" class="btn ghost sm" data-nmadd="${di}" style="margin-top:10px">+ Add a meal</button></section>`}).join('')}
    <section class="card"><div class="field"><label>Note for the player (optional)</label><input class="in" id="npNote" value="${esc(pe.note||'')}" placeholder="e.g. Batch-cook the chicken on Sunday; swap rice for potatoes if you like"></div>
     <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" data-npsend="${esc(p.id)}">Send to ${esc(first(p.name))}</button><button class="btn ghost" data-npcancel="1">Cancel</button></div></section>`:'';
  const planCard=`<section class="card"><header><div><h2>Meal plans</h2><p>Shows in ${esc(first(p.name))}'s Food tab with a tick to log each meal.</p></div>${pe?'':`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost sm" data-npnew="${esc(p.id)}">Blank 3 days</button><button class="btn sm" data-npkoach="${esc(p.id)}" ${S.npBusy?'disabled':''}>${ico('zap','width:15px;height:15px')}${S.npBusy?'Koach is drafting…':'Draft 3 days with Koach'}</button></div>`}</header>
    ${!pe?`<div class="field" style="margin-bottom:12px"><label>Anything Koach should know for this player</label><input class="in" id="npAsk" value="${esc(S.npAsk||'')}" placeholder="e.g. Doesn't eat fish; works on a building site, packed lunch; likes porridge"></div>`:''}
    ${sent.length?`<table class="list"><tr><th>Dates</th><th>Sent by</th><th>Days</th><th></th></tr>${sent.slice(0,6).map(s=>`<tr><td>${esc(fmtK(s.first_day,{day:'numeric',month:'short'}))} – ${esc(fmtK(s.last_day,{day:'numeric',month:'short'}))}${s.last_day>=todayK()?' <span class="chip good">Live</span>':''}</td><td class="small">${esc(s.sent_by_name||'')}</td><td class="num">${(s.plan.days||[]).length}</td><td style="text-align:right"><button class="btn ghost sm" data-npcopy="${esc(s.id)}">Reuse</button> <button class="btn danger sm" data-npdel="${esc(s.id)}">Withdraw</button></td></tr>`).join('')}</table>`:'<div class="small muted">No plans sent yet.</div>'}</section>`;
  return targetsCard+planCard+planEditor}

function blankDays(p,n){const start=todayK();return Array.from({length:n},(_,i)=>{const k=addK(start,i+1);return {date:k,dayType:dayTypeGuess(p,k),meals:[{slot:'Breakfast',time:'08:00',name:'',items:[]},{slot:'Lunch',time:'13:00',name:'',items:[]},{slot:'Snack',time:'16:00',name:'',items:[]},{slot:'Dinner',time:'19:00',name:'',items:[]}]}})}
function templateDays(p,n){const tg=tgtOf(p.id);const T=dt=>((tg?tg.targets:(ownTargets(p.id)||APP_DEF))[dt])||APP_DEF[dt];
  const M={training:[['Breakfast','08:00','Porridge with berries and Greek yoghurt','80 g oats, 300 ml milk, 100 g berries, 150 g Greek yoghurt, 1 tsp honey',.25],['Lunch','13:00','Chicken, rice and veg bowl','150 g chicken, 200 g cooked rice, mixed veg, olive oil',.3],['Pre-training','17:00','Banana and toast with peanut butter','1 banana, 2 slices toast, 1 tbsp peanut butter',.13],['Dinner','20:00','Salmon, potatoes and greens','180 g salmon, 300 g potatoes, broccoli, butter',.32]],
    match:[['Breakfast','09:00','Eggs on toast and fruit','3 eggs, 2 slices toast, 1 banana, orange juice',.25],['Pre-match','12:00','Pasta with chicken and tomato sauce','120 g dry pasta, 120 g chicken, tomato sauce',.32],['Post-match','17:00','Recovery shake and sandwich','whey shake with milk, chicken sandwich',.18],['Dinner','20:00','Steak, potatoes and veg','200 g steak, 300 g potatoes, veg',.25]],
    rest:[['Breakfast','09:00','Omelette with spinach and toast','3 eggs, spinach, 1 slice toast',.27],['Lunch','13:00','Lentil and vegetable soup with bread','lentils, carrots, onion, bread',.28],['Snack','16:00','Greek yoghurt and nuts','200 g Greek yoghurt, 30 g walnuts',.15],['Dinner','19:00','Chicken stir-fry','150 g chicken, mixed veg, 150 g cooked noodles',.3]]};
  return blankDays(p,n).map(d=>{const t=T(d.dayType);return Object.assign(d,{meals:M[d.dayType].map(([slot,time,name,items,f])=>({slot,time,name,items:items.split(', ').map(x=>({name:x})),kcal:Math.round(t.kcal*f),protein:Math.round(t.protein*f),carbs:Math.round(t.carbs*f),fat:Math.round(t.fat*f)}))})})}
async function koachMealPlan(p){S.npAsk=($('#npAsk')||{}).value||'';S.npBusy=true;render();let days=null;const base=blankDays(p,3);const tg=tgtOf(p.id);const T=(tg?tg.targets:(ownTargets(p.id)||APP_DEF));
  if(!isDemo()&&SESSION&&SESSION.access_token){const lg=lastN(S.k,14).map(kk=>foodOn(p,kk)).filter(Boolean);
    const prompt=`You are Koach, the nutrition assistant in Keel, drafting 3 days of meals for a GAA footballer for the team's nutritionist to review. Food first, simple Irish home cooking and shop-bought staples, no supplements beyond a whey shake.
Days: ${base.map(d=>`${d.date} (${d.dayType} day)`).join(', ')}.
Targets per day type (kcal, protein g, carbs g, fat g): ${DT.map(([k,l])=>`${l}: ${T[k].kcal} kcal, ${T[k].protein} P, ${T[k].carbs} C, ${T[k].fat} F`).join('; ')}.
${lg.length?`Over the last 2 weeks they averaged ${Math.round(avgOf(lg.map(f=>f.kcal))||0)} kcal and ${Math.round(avgOf(lg.map(f=>f.protein))||0)} g protein a day on days they logged.`:''}
${S.npAsk?'Nutritionist notes: '+S.npAsk:''}
Hit each day's targets within about 5%. 4 or 5 meals a day, with carbs before and after training and around matches. Give quantities.
Reply with JSON only: {"days":[{"date":"YYYY-MM-DD","dayType":"training|match|rest","meals":[{"slot":"Breakfast","time":"08:00","name":"...","items":[{"qty":"80 g","name":"oats"}],"kcal":600,"protein":35,"carbs":80,"fat":15}]}]}`;
    try{const r=await fetch('/api/claude',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+SESSION.access_token},body:JSON.stringify({prompt,maxTokens:9000})});const j=await r.json();const m=(j.text||'').match(/\{[\s\S]*\}/);
      if(m){const o=JSON.parse(m[0]);if(Array.isArray(o.days)&&o.days.length)days=o.days.slice(0,7).map((d,i)=>({date:/^\d{4}-\d\d-\d\d$/.test(d.date)?d.date:base[Math.min(i,2)].date,dayType:DT.some(x=>x[0]===d.dayType)?d.dayType:'training',
        meals:(d.meals||[]).map(mm=>({slot:String(mm.slot||''),time:String(mm.time||''),name:String(mm.name||''),items:(mm.items||[]).map(i=>({qty:i.qty?String(i.qty):'',name:String(i.name||'')})),kcal:Math.round(+mm.kcal||0),protein:Math.round(+mm.protein||0),carbs:Math.round(+mm.carbs||0),fat:Math.round(+mm.fat||0)}))}))}}catch(e){}}
  if(!days){days=templateDays(p,3);if(!isDemo())toast('Koach couldn\'t be reached, so here\'s a starter plan scaled to their targets',4500)}
  S.npBusy=false;S.nutP={pid:p.id,days,koach:true,note:''};render()}
const parseItems=t=>String(t||'').split(',').map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/^(\d[\d.,]*\s*(?:g|kg|ml|l|tsp|tbsp|slices?|scoops?|cups?)?)\s+(.+)$/i);return m?{qty:m[1],name:m[2]}:{name:x}});

function buildDemoNut(){const T=[],P=[];const now=new Date().toISOString();
  players().forEach((p,ix)=>{if(ix%3===0)T.push({id:'nt'+ix,team_id:DEMO_ID,player_id:p.id,targets:JSON.parse(JSON.stringify(APP_DEF)),note:ix===0?'Protein at every meal; carbs up the day before matches.':null,set_by_name:'Sinéad (nutrition)',active:true,updated_at:now});
    if(ix%4===0)P.push({id:'np'+ix,team_id:DEMO_ID,player_id:p.id,plan:{days:templateDays(p,3)},first_day:addK(todayK(),1),last_day:addK(todayK(),3),sent_by_name:'Sinéad (nutrition)',created_at:now})});
  const own={};players().forEach(p=>{if(p.food)own[p.id]=JSON.parse(JSON.stringify(APP_DEF))});return {targets:T,plans:P,own,missing:false}}

document.addEventListener('input',e=>{const t=e.target;
  if(t.dataset.nt&&S.nutT){const [dt,m]=t.dataset.nt.split('.');S.nutT.t[dt]=S.nutT.t[dt]||{};S.nutT.t[dt][m]=t.value===''?null:+t.value}
  if(t.id==='ntNote'&&S.nutT)S.nutT.note=t.value;if(t.id==='npNote'&&S.nutP)S.nutP.note=t.value;if(t.id==='npAsk')S.npAsk=t.value;
  if(t.dataset.nm&&S.nutP){const m=S.nutP.days[+t.closest('.nday').dataset.di].meals[+t.closest('.nmeal').dataset.mi];if(t.dataset.nm==='itemsTxt')m.items=parseItems(t.value);else if(MAC.some(x=>x[0]===t.dataset.nm))m[t.dataset.nm]=t.value===''?null:+t.value;else m[t.dataset.nm]=t.value}});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.nd&&S.nutP){S.nutP.days[+t.closest('.nday').dataset.di].dayType=t.value;setTimeout(render,0)}
  if(t.dataset.nm&&S.nutP&&MAC.some(x=>x[0]===t.dataset.nm))setTimeout(render,0)});
document.addEventListener('click',async e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(x=c('[data-nutopen]')){S.ptab='nutrition';location.hash='player/'+encodeURIComponent(x.dataset.nutopen);return}
  if(x=c('[data-nutedit]')){const tg=tgtOf(x.dataset.nutedit);S.nutT={pid:x.dataset.nutedit,t:JSON.parse(JSON.stringify(tg?tg.targets:(ownTargets(x.dataset.nutedit)||APP_DEF))),note:tg&&tg.note||''};render();return}
  if(x=c('[data-nutkoach]')){const p=SQUAD.find(y=>y.id===x.dataset.nutkoach);const k=koachTargets(p);const tg=tgtOf(p.id);S.nutT={pid:p.id,t:k.t,why:k.why,note:tg&&tg.note||''};render();return}
  if(c('[data-nutcancel]')){S.nutT=null;render();return}
  if(x=c('[data-nutsave]')){const pid=x.dataset.nutsave;const t=S.nutT.t;for(const [dt] of DT){for(const [m] of MAC){if(!isNum(t[dt]&&t[dt][m])){toast('Fill in every target first');return}}}
    const row={team_id:TEAM.team_id,player_id:pid,targets:t,note:S.nutT.note||null,set_by_name:myName(),active:true,updated_at:new Date().toISOString()};
    if(isDemo()){NUT.targets=NUT.targets.filter(y=>y.player_id!==pid);NUT.targets.push(Object.assign({id:uid()},row))}
    else{const {data,error}=await sb.from('nut_targets').upsert(row,{onConflict:'team_id,player_id'}).select().single();if(error){toast(error.message,4000);return}NUT.targets=NUT.targets.filter(y=>y.player_id!==pid);NUT.targets.push(data)}
    const ng=($('#nutGrp')||{}).value;let extra=0;if(ng){for(const op of grpMembers(ng).filter(u=>u!==pid&&allPlayers().some(p=>p.id===u))){const r2=Object.assign({},row,{player_id:op});
        if(isDemo()){NUT.targets=NUT.targets.filter(y=>y.player_id!==op);NUT.targets.push(Object.assign({id:uid()},r2));extra++}else{const {data,error}=await sb.from('nut_targets').upsert(r2,{onConflict:'team_id,player_id'}).select().single();if(!error){NUT.targets=NUT.targets.filter(y=>y.player_id!==op);NUT.targets.push(data);extra++}}}}
    S.nutT=null;toast(extra?`Sent to ${first(playerName(pid))} and ${extra} more in ${grpById(ng).name}.`:`Sent. ${first(playerName(pid))}'s Food tab now uses these targets.`,4000);render();return}
  if(x=c('[data-npnew]')){const p=SQUAD.find(y=>y.id===x.dataset.npnew);S.nutP={pid:p.id,days:blankDays(p,3),koach:false,note:''};render();return}
  if(x=c('[data-npkoach]')){await koachMealPlan(SQUAD.find(y=>y.id===x.dataset.npkoach));return}
  if(x=c('[data-npcopy]')){const s=NUT.plans.find(y=>y.id===x.dataset.npcopy);const p=SQUAD.find(y=>y.id===s.player_id);const fresh=blankDays(p,(s.plan.days||[]).length||3);
    S.nutP={pid:p.id,days:(s.plan.days||[]).map((d,i)=>Object.assign(JSON.parse(JSON.stringify(d)),{date:fresh[i].date})),koach:false,note:s.note||''};render();return}
  if(c('[data-npcancel]')){S.nutP=null;render();return}
  if(x=c('[data-nmadd]')){S.nutP.days[+x.dataset.nmadd].meals.push({slot:'Snack',time:'',name:'',items:[]});render();return}
  if(x=c('[data-nmdel]')){S.nutP.days[+x.closest('.nday').dataset.di].meals.splice(+x.dataset.nmdel,1);render();return}
  if(x=c('[data-npsend]')){const pid=x.dataset.npsend;const days=S.nutP.days.map(d=>Object.assign({},d,{meals:d.meals.filter(m=>m.name||(m.items||[]).length).map(m=>Object.assign({},m,{kcal:Math.round(+m.kcal||0),protein:Math.round(+m.protein||0),carbs:Math.round(+m.carbs||0),fat:Math.round(+m.fat||0)}))})).filter(d=>d.meals.length).sort((a,b)=>a.date.localeCompare(b.date));
    if(!days.length){toast('Add at least one meal first');return}
    const row={team_id:TEAM.team_id,player_id:pid,plan:{days},note:S.nutP.note||null,first_day:days[0].date,last_day:days[days.length-1].date,sent_by_name:myName()};
    if(isDemo())NUT.plans.unshift(Object.assign({id:uid(),created_at:new Date().toISOString()},row));else{const {data,error}=await sb.from('nut_plans').insert(row).select().single();if(error){toast(error.message,4000);return}NUT.plans.unshift(data)}
    S.nutP=null;toast(`Sent. ${first(playerName(pid))} will see it in their Food tab.`,4000);render();return}
  if(x=c('[data-npdel]')){if(x.dataset.sure!=='1'){x.dataset.sure='1';x.textContent='Sure?';return}
    if(!isDemo()){const {error}=await sb.from('nut_plans').delete().eq('id',x.dataset.npdel);if(error){toast(error.message);return}}NUT.plans=NUT.plans.filter(y=>y.id!==x.dataset.npdel);toast('Withdrawn');render();return}
});

// ================= Physio: staged rehab plans sent to the player's app =================
const RH={plans:[],logs:[],missing:false};
const RH_AREAS=['Hamstring','Calf / Achilles','Ankle','Groin / adductor','Knee','Quad','Lower back','Shoulder','Other'];
const RH_STAGES=[['Protect and settle','Calm it down and keep moving without pain.','Walking and daily life pain-free; pain 2/10 or less at rest.'],
  ['Rebuild strength','Load the area progressively.','Full range of movement; strength close to the other side.'],
  ['Running','Back on the grass with straight-line running.','Jogging and strides pain-free, building to about 85% speed.'],
  ['Football-specific','Speed, change of direction, kicking and contact drills.','Full speed and full drills with no reaction the next day.'],
  ['Full training to match ready','Back in full training.','Two full sessions with no reaction and the physio signs off.']];
const RH_ITEMS={Hamstring:[[['Isometric bridge hold','4','30 s','Daily'],['Easy spin bike','1','15 min','Daily']],[['Nordic hamstring curl','3','4','3 times a week'],['Single-leg Romanian deadlift','3','8 each side','3 times a week'],['Bridge walkouts','3','6','3 times a week']],[['A-skips','3','20 m','Every second day'],['Run progression','1','6 × 60 m at 60–80%','Every second day']],[['Accelerations','6','20 m','3 times a week'],['Kicking progression','1','15 min','3 times a week']],[['Full training','1','Session','As planned']]],
  'Calf / Achilles':[[['Isometric calf raise hold','5','45 s','Daily'],['Easy spin bike','1','15 min','Daily']],[['Seated calf raise','3','12','Daily'],['Single-leg calf raise','3','10 each side','Every second day']],[['Pogo hops','3','20','Every second day'],['Run progression','1','6 × 60 m at 60–80%','Every second day']],[['Accelerations','6','20 m','3 times a week'],['Hopping and bounding','3','10','3 times a week']],[['Full training','1','Session','As planned']]],
  Ankle:[[['Ankle range of movement','2','1 min each way','Daily'],['Single-leg balance','3','30 s','Daily']],[['Band eversion','3','15','Daily'],['Single-leg calf raise','3','10 each side','Every second day']],[['Hopping in place','3','20','Every second day'],['Run progression','1','6 × 60 m at 60–80%','Every second day']],[['Cutting drills','4','5 each side','3 times a week'],['Lateral bounds','3','8 each side','3 times a week']],[['Full training','1','Session','As planned']]],
  'Groin / adductor':[[['Adductor squeeze hold','5','30 s','Daily'],['Easy spin bike','1','15 min','Daily']],[['Copenhagen plank','3','20 s each side','3 times a week'],['Lateral lunge','3','8 each side','3 times a week']],[['Run progression','1','6 × 60 m at 60–80%','Every second day'],['Side shuffles','3','20 m','Every second day']],[['Kicking progression','1','15 min','3 times a week'],['Cutting drills','4','5 each side','3 times a week']],[['Full training','1','Session','As planned']]],
  Knee:[[['Wall sit hold','5','30 s','Daily'],['Easy spin bike','1','15 min','Daily']],[['Step-up','3','10 each side','3 times a week'],['Split squat','3','8 each side','3 times a week']],[['Run progression','1','6 × 60 m at 60–80%','Every second day'],['Landing drills','3','6','Every second day']],[['Cutting drills','4','5 each side','3 times a week'],['Hopping and bounding','3','10','3 times a week']],[['Full training','1','Session','As planned']]],
  'Lower back':[[['Dead bug','3','8 each side','Daily'],['Bird dog','3','8 each side','Daily']],[['Hip hinge drill','3','10','3 times a week'],['Pallof press','3','10 each side','3 times a week']],[['Run progression','1','6 × 60 m at 60–80%','Every second day']],[['Med ball rotational throw','3','6 each side','3 times a week']],[['Full training','1','Session','As planned']]]};
RH_ITEMS.Quad=RH_ITEMS.Knee;RH_ITEMS.Shoulder=[[['Band external rotation','3','15','Daily'],['Scapular push-up','3','12','Daily']],[['Landmine press','3','10','3 times a week'],['Single-arm dumbbell row','3','10 each side','3 times a week']],[['Tackle bag progression','1','10 min','3 times a week']],[['Contact drills','1','15 min','3 times a week']],[['Full training','1','Session','As planned']]];RH_ITEMS.Other=RH_ITEMS.Knee;
function rhTemplate(area){const it=RH_ITEMS[area]||RH_ITEMS.Other;return RH_STAGES.map(([name,goal,criteria],i)=>({name,goal,criteria,items:(it[i]||[]).map(([n,sets,reps,freq])=>{const ex=SC.ex.find(e=>e.name.toLowerCase()===n.toLowerCase());return {ex:ex?ex.id:null,name:n,sets,reps,freq,note:''}})}))}
async function loadRehab(t){RH.missing=false;if(t.team_id===DEMO_ID){Object.assign(RH,buildDemoRehab());return}
  const a=await sb.from('rehab_plans').select('*').eq('team_id',t.team_id).order('updated_at',{ascending:false});if(a.error){if(/relation|does not exist|schema cache/i.test(a.error.message))RH.missing=true;RH.plans=RH.logs=[];return}
  RH.plans=a.data||[];const b=await sb.from('rehab_logs').select('*').eq('team_id',t.team_id).gte('day',addK(todayK(),-90)).order('day',{ascending:false});RH.logs=b.data||[]}
const rehabOf=pid=>RH.plans.find(r=>r.player_id===pid&&r.status==='active');
const rhLogs=id=>RH.logs.filter(l=>l.plan_id===id);
function rhAdherence(r,k){const ls=rhLogs(r.id);let d=0;for(let i=0;i<7;i++){if(ls.some(l=>l.day===addK(k,-i)&&l.done))d++}return d}
function rhStep(r){const n=(r.stages||[]).length;return `<div class="rhsteps">${(r.stages||[]).map((s,i)=>`<span class="rhstep ${i<r.stage?'done':i===r.stage?'now':''}" title="${esc(s.name)}"></span>`).join('')}</div><div class="tiny muted" style="margin-top:4px">Stage ${r.stage+1} of ${n}: ${esc((r.stages[r.stage]||{}).name||'')}</div>`}
function viewPhysioHub(){const t=route().id||'squad';
  const tabs=`<div class="toolbar"><div class="seg">${[['squad','Squad'],['rehab','Rehab plans'],['library','Rehab library']].map(([v,l])=>`<a href="#physio/${v}" aria-pressed="${t===v}" class="segl">${l}</a>`).join('')}</div></div>`;
  if(t==='library')return tabs+(SC.missing?'<section class="card"><div class="empty">Run <b>supabase/sc.sql</b> in Supabase first: the rehab library shares the exercise library and its videos.</div></section>':viewRehabLib());
  if(t!=='rehab')return tabs+viewPhysio();
  if(RH.missing)return tabs+`<section class="card"><header><div><h2>One more database step</h2><p>Rehab plans need their own tables.</p></div></header><ol class="steps"><li>Open Supabase › SQL Editor › New query.</li><li>Paste in everything from <b>supabase/rehab.sql</b> and click Run, then confirm.</li><li>Refresh this page.</li></ol></section>`;
  const act=RH.plans.filter(r=>r.status==='active');const k=todayK();const cands=sharing().filter(p=>!rehabOf(p.id)&&dayInfo(p,S.k).pain>=3);
  return tabs+`<section class="card"><header><div><h2>Rehab plans</h2><p>Staged return to play. The player sees today's exercises and videos in Keel and logs pain each day; S&amp;C sees the stage in Koach's load suggestions.</p></div></header>
   ${act.length?`<div style="overflow-x:auto"><table class="list"><tr><th>Player</th><th>Injury</th><th>Progress</th><th>Pain (last log)</th><th>Done, last 7 days</th><th>Target return</th><th></th></tr>${act.map(r=>{const lg=rhLogs(r.id).find(l=>l.pain!=null);const ad=rhAdherence(r,k);
     return `<tr><td><b style="color:var(--text)">${esc(playerName(r.player_id))}</b></td><td>${esc(r.area)}${r.side?' <span class="muted">('+esc(r.side.toLowerCase())+')</span>':''}<div class="tiny muted">${r.injured_on?'Since '+esc(fmtK(r.injured_on,{day:'numeric',month:'short'})):''}</div></td><td style="min-width:180px">${rhStep(r)}</td>
     <td>${lg?painChip(lg.pain):'<span class="muted">–</span>'}</td><td>${sevChip(ad,5,3,ad+'/7')}</td><td class="small">${r.target_day?esc(fmtK(r.target_day,{weekday:'short',day:'numeric',month:'short'})):'–'}</td><td style="text-align:right"><button class="btn ghost sm" data-rhopen="${esc(r.player_id)}">Open</button></td></tr>`}).join('')}</table></div>`:'<div class="small muted">Nobody in rehab.</div>'}</section>
   ${cands.length?`<section class="card"><header><div><h2>Might need one</h2><p>Niggles of 3/10 or more without a rehab plan</p></div></header><div style="display:flex;gap:8px;flex-wrap:wrap">${cands.map(p=>{const i=dayInfo(p,S.k);return `<button class="chip ${i.pain>=5?'alert':'caution'}" data-rhopen="${esc(p.id)}">${esc(p.name)} · ${esc(i.nig.d.niggles[0].area)} ${i.pain}/10</button>`}).join('')}</div></section>`:''}`}
// player page physio tab: the rehab workspace
function rehabWorkspace(p){if(RH.missing)return `<section class="card"><div class="empty">Run <b>supabase/rehab.sql</b> in Supabase to build rehab plans.</div></section>`;
  const r=rehabOf(p.id);const ed=S.rh&&S.rh.pid===p.id?S.rh:null;
  if(ed)return rehabEditor(p,ed)+rehabImportBox();
  if(!r){const i=dayInfo(p,S.k);const area=i.nig?i.nig.d.niggles[0].area:'';const guess=RH_AREAS.find(a=>area&&a.toLowerCase().startsWith(area.toLowerCase().split(/[ /]/)[0]))||'';
    return `<section class="card"><header><div><h2>Rehab plan</h2><p>Not in rehab.${area?` Logged niggle: ${esc(area)} ${i.pain}/10.`:''}</p></div><button class="btn sm" data-rhnew="${esc(p.id)}" data-area="${esc(guess)}" data-side="${esc(i.nig?i.nig.d.niggles[0].side||'':'')}">Start a rehab plan</button></header></section>`}
  const ls=rhLogs(r.id);const keys=lastN(S.k,21);const cur=r.stages[r.stage]||{};
  const exName=it=>{const e=it.ex&&exById(it.ex);return e?e.name:it.name};
  return `<section class="card"><header><div><h2>Rehab: ${esc(r.area)}${r.side?' ('+esc(r.side.toLowerCase())+')':''}</h2><p>${r.injured_on?'Injured '+esc(fmtK(r.injured_on))+' · ':''}${r.target_day?'target return '+esc(fmtK(r.target_day)):'no target date'}${r.created_by_name?' · '+esc(r.created_by_name):''}</p></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost sm" data-rhedit="${esc(r.id)}">Edit plan</button>${r.stage<r.stages.length-1?`<button class="btn sm" data-rhstage="${esc(r.id)}" data-to="${r.stage+1}">Move to stage ${r.stage+2}</button>`:`<button class="btn sm" data-rhclear="${esc(r.id)}">Clear to play</button>`}</div></header>
    ${rhStep(r)}
    <div class="grid g2" style="margin-top:14px;gap:14px"><div><h3 style="margin-bottom:6px">${esc(cur.name||'')}</h3><p class="small">${esc(cur.goal||'')}</p><p class="small muted" style="margin-top:6px"><b>To move on:</b> ${esc(cur.criteria||'')}</p>${r.pain_rule?`<p class="small" style="margin-top:6px;color:var(--caution)">${esc(r.pain_rule)}</p>`:''}</div>
     <div>${(cur.items||[]).map(it=>`<div class="flag" style="padding:7px 4px"><span class="who"><b style="font-weight:500">${esc(exName(it))}</b><span>${esc([it.sets&&it.reps?it.sets+' × '+it.reps:it.reps,it.freq].filter(Boolean).join(' · '))}${it.ex&&exById(it.ex)&&exById(it.ex).video_path?' · ▶ video':''}</span></span></div>`).join('')||'<div class="small muted">No exercises in this stage.</div>'}</div></div></section>
   <div class="grid g2"><section class="card"><header><div><h2>Pain during rehab</h2><p>What they logged each day, out of 10</p></div></header>${lineChart(keys.map(kk=>{const l=ls.find(x=>x.day===kk);return {k:kk,y:l&&l.pain!=null?l.pain:null}}),{min:0,max:10,ticks:[0,3,5,10],color:'var(--caution)',label:'Rehab pain',tip:q=>`Pain ${q.y}/10`})}</section>
    <section class="card"><header><div><h2>Done</h2><p>Last 3 weeks</p></div></header><div class="rhcal">${keys.map(kk=>{const l=ls.find(x=>x.day===kk);return `<span class="${l?(l.done?'d':'m'):''}" ${tipAttr(`<b>${esc(fmtK(kk))}</b>${l?(l.done?'Done':'Missed')+(l.pain!=null?' · pain '+l.pain+'/10':''):'Nothing logged'}`)}>${parse(kk).getDate()}</span>`}).join('')}</div>
     <div class="legend" style="margin-top:10px"><span><i style="background:var(--good)"></i>Done</span><span><i style="background:var(--alert)"></i>Missed</span><span><i style="background:var(--none)"></i>Not logged</span></div></section></div>`}
function rehabEditor(p,ed){const d=ed.d;const exOpts=sel=>`<option value="">Not in library (text only)</option>${SC.ex.map(e=>`<option value="${esc(e.id)}" ${sel===e.id?'selected':''}>${esc(e.name)}${e.video_path?' ▶':''}</option>`).join('')}`;
  return `<section class="card"><header><div><h2>${d.id?'Edit rehab plan':'New rehab plan'}</h2><p>Stages and exercises are filled in from a template for the injury. Change anything before sending.</p></div></header>
   <div class="grid g3" style="gap:12px"><div class="field"><label>Injury</label><select class="in" id="rhArea">${RH_AREAS.map(a=>`<option ${d.area===a?'selected':''}>${a}</option>`).join('')}</select></div>
    <div class="field"><label>Side</label><select class="in" id="rhSide">${['','Left','Right','Both'].map(s=>`<option value="${s}" ${d.side===s?'selected':''}>${s||'–'}</option>`).join('')}</select></div>
    <div class="field"><label>Injured on</label><input class="in" type="date" id="rhOn" value="${esc(d.injured_on||'')}"></div>
    <div class="field"><label>Target return</label><input class="in" type="date" id="rhTarget" value="${esc(d.target_day||'')}"></div>
    <div class="field" style="grid-column:span 2"><label>Pain rule the player sees</label><input class="in" id="rhRule" value="${esc(d.pain_rule||'')}"></div></div>
   ${d.id?'':`<button class="btn ghost sm" data-rhtpl="1" style="margin-top:12px">Refill stages for this injury</button>`}</section>
   ${d.stages.map((s,si)=>`<section class="card rhs" data-si="${si}"><header style="flex-wrap:wrap;align-items:center"><span class="chip">Stage ${si+1}</span><input class="in" data-rs="name" value="${esc(s.name)}" style="flex:1;min-width:180px;font-weight:600"><button class="btn ghost sm" data-rsdel="${si}">Remove stage</button></header>
     <div class="grid g2" style="gap:10px"><div class="field"><label>Goal</label><input class="in" data-rs="goal" value="${esc(s.goal||'')}"></div><div class="field"><label>To move on</label><input class="in" data-rs="criteria" value="${esc(s.criteria||'')}"></div></div>
     <div class="pitems" style="margin-top:10px">${(s.items||[]).map((it,ii)=>`<div class="rhitem" data-ii="${ii}"><select class="in" data-ri="ex">${exOpts(it.ex)}</select><input class="in" data-ri="name" value="${esc(it.name||'')}" placeholder="Exercise"><input class="in" data-ri="sets" value="${esc(it.sets||'')}" placeholder="Sets"><input class="in" data-ri="reps" value="${esc(it.reps||'')}" placeholder="Reps / time"><input class="in" data-ri="freq" value="${esc(it.freq||'')}" placeholder="How often"><input class="in" data-ri="note" value="${esc(it.note||'')}" placeholder="Note"><button type="button" class="btn ghost sm" data-ridel="${ii}" aria-label="Remove">✕</button></div>`).join('')}</div>
     <button type="button" class="btn ghost sm" data-riadd="${si}" style="margin-top:8px">+ Add exercise</button></section>`).join('')}
   <section class="card"><div class="field"><label>Note for the player (optional)</label><input class="in" id="rhNote" value="${esc(d.note||'')}" placeholder="e.g. Ice after sessions for the first week; text me if it flares up"></div>
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn" data-rhsave="${esc(p.id)}">${d.id?'Save and update their app':'Send to '+esc(first(p.name))}</button><button class="btn ghost" data-rhcancel="1">Cancel</button>
     ${d.id?'':`<label class="small" style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="rhRestrict" checked> Also add a restriction for the staff until the target date</label>`}</div></section>`}
function syncRh(){const d=S.rh&&S.rh.d;if(!d)return;const v=id=>($(id)||{}).value;if($('#rhArea'))d.area=v('#rhArea');if($('#rhSide'))d.side=v('#rhSide');if($('#rhOn'))d.injured_on=v('#rhOn')||null;if($('#rhTarget'))d.target_day=v('#rhTarget')||null;if($('#rhRule'))d.pain_rule=v('#rhRule');if($('#rhNote'))d.note=v('#rhNote')}
document.addEventListener('input',e=>{const t=e.target;if(!S.rh)return;const d=S.rh.d;
  if(t.dataset.rs){d.stages[+t.closest('.rhs').dataset.si][t.dataset.rs]=t.value}
  else if(t.dataset.ri&&t.dataset.ri!=='ex'){d.stages[+t.closest('.rhs').dataset.si].items[+t.closest('.rhitem').dataset.ii][t.dataset.ri]=t.value}
  else syncRh()});
document.addEventListener('change',e=>{const t=e.target;if(!S.rh)return;if(t.dataset.ri==='ex'){const it=S.rh.d.stages[+t.closest('.rhs').dataset.si].items[+t.closest('.rhitem').dataset.ii];it.ex=t.value||null;const ex=exById(t.value);if(ex)it.name=ex.name;setTimeout(render,0)}else if(t.id){syncRh()}});
async function rhUpdate(id,patch){const r=RH.plans.find(x=>x.id===id);patch.updated_at=new Date().toISOString();if(!isDemo()){const {error}=await sb.from('rehab_plans').update(patch).eq('id',id);if(error){toast(error.message,4000);return false}}Object.assign(r,patch);SQUAD.forEach(p=>p._di={});return true}
document.addEventListener('click',async e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(x=c('[data-rhopen]')){S.ptab='physio';location.hash='player/'+encodeURIComponent(x.dataset.rhopen);return}
  if(x=c('[data-rhnew]')){const area=x.dataset.area||'Hamstring';const i=dayInfo(SQUAD.find(p=>p.id===x.dataset.rhnew),S.k);
    S.rh={pid:x.dataset.rhnew,d:{id:null,area,side:x.dataset.side||'',injured_on:i.nig?i.nig.k:todayK(),target_day:addK(todayK(),21),pain_rule:'Some discomfort is fine. Stop and tell the physio if pain goes above 3/10 or is worse the next morning.',note:'',stage:0,stages:rhTemplate(area)}};render();return}
  if(x=c('[data-rhedit]')){const r=RH.plans.find(y=>y.id===x.dataset.rhedit);S.rh={pid:r.player_id,d:JSON.parse(JSON.stringify(r))};render();return}
  if(c('[data-rhtpl]')){syncRh();S.rh.d.stages=rhTemplate(S.rh.d.area);render();return}
  if(c('[data-rhcancel]')){S.rh=null;render();return}
  if(x=c('[data-rsdel]')){S.rh.d.stages.splice(+x.dataset.rsdel,1);render();return}
  if(x=c('[data-riadd]')){S.rh.d.stages[+x.dataset.riadd].items.push({ex:null,name:'',sets:'',reps:'',freq:'Daily',note:''});render();return}
  if(x=c('[data-ridel]')){S.rh.d.stages[+x.closest('.rhs').dataset.si].items.splice(+x.dataset.ridel,1);render();return}
  if(x=c('[data-rhsave]')){syncRh();const d=S.rh.d;const pid=x.dataset.rhsave;d.stages=d.stages.filter(s=>s.name).map(s=>Object.assign(s,{items:(s.items||[]).filter(i=>i.ex||i.name)}));if(!d.stages.length){toast('Add at least one stage');return}
    d.stage=Math.min(d.stage||0,d.stages.length-1);const row={area:d.area,side:d.side||null,injured_on:d.injured_on||null,target_day:d.target_day||null,stages:d.stages,stage:d.stage,pain_rule:d.pain_rule||null,note:d.note||null,updated_at:new Date().toISOString()};
    const restrict=!d.id&&$('#rhRestrict')&&$('#rhRestrict').checked;
    if(d.id){if(!(await rhUpdate(d.id,row)))return}
    else{Object.assign(row,{team_id:TEAM.team_id,player_id:pid,status:'active',created_by_name:myName()});
      if(isDemo())RH.plans.unshift(Object.assign({id:uid(),created_at:row.updated_at},row));else{const {data,error}=await sb.from('rehab_plans').insert(row).select().single();if(error){toast(error.message,4000);return}RH.plans.unshift(data)}
      if(restrict){const n={team_id:TEAM.team_id,player_id:pid,author_name:myName(),author_staff:myStaff()||'physio',kind:'restriction',body:`In rehab (${d.area.toLowerCase()}): follow the rehab plan, no full training until the physio clears it.`,until_day:d.target_day||null};
        if(isDemo())NOTES.unshift(Object.assign({id:uid(),author_id:SESSION.user.id,created_at:new Date().toISOString()},n));else{const {data}=await sb.from('team_notes').insert(n).select().single();if(data)NOTES.unshift(data)}attachNotes()}}
    SQUAD.forEach(p=>p._di={});S.rh=null;toast(`Sent. ${first(playerName(pid))} will see it in Keel.`,4000);render();return}
  if(x=c('[data-rhstage]')){const r=RH.plans.find(y=>y.id===x.dataset.rhstage);if(await rhUpdate(r.id,{stage:+x.dataset.to})){toast(`Moved to stage ${+x.dataset.to+1}: ${r.stages[+x.dataset.to].name}`);render()}return}
  if(x=c('[data-rhclear]')){if(x.dataset.sure!=='1'){x.dataset.sure='1';x.textContent='Clear them to play?';return}const r=RH.plans.find(y=>y.id===x.dataset.rhclear);
    if(await rhUpdate(r.id,{status:'cleared'})){toast(`${first(playerName(r.player_id))} is cleared. Remember to end any restriction in Staff notes.`,4500);render()}return}
});
function buildDemoRehab(){const now=new Date().toISOString();const plans=[],logs=[];const T=todayK();const R=rng(91);
  const mk=(ix,area,side,since,stage,target)=>{const p=players()[ix];if(!p)return;const r={id:'rh'+ix,team_id:DEMO_ID,player_id:p.id,area,side,injured_on:addK(T,-since),target_day:addK(T,target),stages:rhTemplate(area),stage,pain_rule:'Some discomfort is fine. Stop and tell the physio if pain goes above 3/10 or is worse the next morning.',note:null,status:'active',created_by_name:'Aoife (physio)',created_at:now,updated_at:now};plans.push(r);
    for(let i=since-1;i>=1;i--){if(R()<.15)continue;const k=addK(T,-i);logs.push({id:'rl'+ix+i,plan_id:r.id,team_id:DEMO_ID,player_id:p.id,day:k,stage:Math.min(stage,Math.floor((since-i)/Math.max(1,since/(stage+1)))),done:R()>.1,pain:Math.max(0,Math.round(4-(since-i)*(4/since)+R()*1.5))})}};
  mk(2,'Hamstring','Left',4,0,18);mk(16,'Ankle','Left',25,3,4);mk(8,'Calf / Achilles','Right',2,0,10);
  return {plans,logs:logs.sort((a,b)=>b.day.localeCompare(a.day)),missing:false}}

// ================= Recovery: is the squad recovering as hard as it trains? =================
function recOn(p,k){const d=p.D[k];if(!d)return [];const out=[];(d.recovery||[]).forEach(x=>out.push({what:x.kind||'Recovery',min:+x.min||0}));(d.mobility||[]).forEach(x=>out.push({what:'Mobility'+(x.name?': '+x.name:''),min:+x.min||0}));
  (d.hc||[]).forEach(x=>out.push({what:x.type||'Heat or cold',min:+x.min||0}));
  SC.logs.filter(l=>l.player_id===p.id&&l.day===k&&l.done).forEach(l=>{const a=SC.assigns.find(y=>y.id===l.assignment_id);const pp=a&&progPos(a,k);const day=pp&&pp.week&&pp.week.days.find(x=>x.dow===l.dow);if(day&&(day.kind==='recovery'||day.kind==='mobility'))out.push({what:day.title||'Recovery session',min:+l.dur||0})});return out}
const recMin=(p,k)=>recOn(p,k).reduce((a,x)=>a+x.min,0);
function lastMatch(k){for(let i=0;i<14;i++){const kk=addK(k,-i);if(sharing().some(p=>sessionsOn(p,kk).some(s=>/match/i.test(s.what))))return kk}return null}
function viewRecovery(){const ps=sharing();if(!ps.length)return needTeam();const k=S.k;const wk=lastN(k,7);
  const rows=ps.map(p=>{const items=wk.flatMap(kk=>recOn(p,kk));const sl=avgOf(wk.map(kk=>sleepHours(p.D[kk])));const so=avgOf(wk.map(kk=>p.D[kk]&&isNum(p.D[kk].sore)?+p.D[kk].sore:null));
    const types=[...new Set(items.map(x=>x.what.split(':')[0]))];return {p,n:items.length,min:items.reduce((a,x)=>a+x.min,0),sl,debt:p.E.debt(k),so,types,load:p.E.load7(k)}}).sort((a,b)=>a.p.name.localeCompare(b.p.name));
  const any=rows.filter(r=>r.n>0).length;const lm=lastMatch(k);
  const after=lm&&lm<k?ps.map(p=>{const k1=addK(lm,1),k2=addK(lm,2);const did=[...recOn(p,lm),...recOn(p,k1),...recOn(p,k2)];const so=p.D[k1]&&isNum(p.D[k1].sore)?+p.D[k1].sore:null;const sl=sleepHours(p.D[k1]);
    return {p,did,so,sl,played:sessionsOn(p,lm).some(s=>/match/i.test(s.what))}}).filter(x=>x.played):[];
  const champs=rows.filter(r=>r.n>=2).sort((a,b)=>(b.min+(b.sl||0)*10)-(a.min+(a.sl||0)*10)).slice(0,3);
  const days=lastN(k,28).map(kk=>({k:kk,y:avg(ps.map(p=>recMin(p,kk)))}));
  return kpiRow([kpiTile(`${any}<small>/ ${ps.length}</small>`,'Did some recovery this week',{ic:'check',col:'var(--good)'}),kpiTile(fx(avgOf(rows.map(r=>r.min))),'Recovery minutes each, this week',{ic:'wellness'}),
     kpiTile(fx(avgOf(rows.map(r=>r.sl)),1)+'<small>h</small>','Sleep, 7-day average',{ic:'moon'}),kpiTile(fx(avgOf(rows.map(r=>r.debt)),1)+'<small>h</small>','Average sleep debt this week',{ic:'clock',col:'var(--caution)'})])
   +`<div class="grid g-today"><section class="card"><header><div><h2>After the last match</h2><p>${lm?esc(fmtK(lm,{weekday:'long',day:'numeric',month:'short'}))+'. Recovery logged that day or the next two, soreness and sleep the night after.':'No match in the last 2 weeks.'}</p></div></header>
     ${after.length?`<div style="overflow-x:auto"><table class="list"><tr><th>Player</th><th>Recovery done</th><th>Sore next day</th><th>Sleep that night</th></tr>${after.sort((a,b)=>a.did.length-b.did.length).map(a=>`<tr><td><button data-player="${esc(a.p.id)}" style="text-align:left"><b style="color:var(--text)">${esc(a.p.name)}</b></button></td>
       <td>${a.did.length?`<span class="chip good">${esc([...new Set(a.did.map(x=>x.what.split(':')[0]))].join(', '))}</span>`:'<span class="chip caution">None logged</span>'}</td><td class="num">${a.so!=null?a.so+'/5':'–'}</td><td class="num">${a.sl!=null?a.sl+' h':'–'}</td></tr>`).join('')}</table></div>`:'<div class="small muted">Nothing to show yet.</div>'}</section>
    <section class="card"><header><div><h2>Doing it well</h2><p>Most recovery and best sleep this week. Worth a shout-out at training.</p></div></header><div class="flags">${champs.length?champs.map((r,i)=>`<button class="flag" data-player="${esc(r.p.id)}"><span class="ic" style="background:color-mix(in srgb,var(--good) 15%,transparent);color:var(--good);font:600 15px var(--f-display)">${i+1}</span><span class="who"><b>${esc(r.p.name)}</b><span>${r.n} recovery session${r.n>1?'s':''}, ${r.min} min · sleeping ${fx(r.sl,1)} h</span></span></button>`).join(''):'<div class="small muted">Nobody has logged recovery twice this week yet.</div>'}</div>
     <p class="tiny muted" style="margin-top:12px">Recovery counts sessions from the Recover tab, mobility follow-alongs, sauna, hot tub and cold water, and recovery sessions in an S&amp;C programme.</p></section></div>
   <section class="card"><header><div><h2>Recovery minutes each day</h2><p>Squad average per player, last 4 weeks</p></div></header>${barChart(days,{w:1100,h:180,color:'var(--good)',tip:q=>`${Math.round(q.y)} min average`,label:'Recovery minutes'})}</section>
   <section class="card"><header><div><h2>Each player, this week</h2><p>Training load against recovery and sleep</p></div></header><div style="overflow-x:auto"><table class="list"><tr><th>Player</th><th>Load</th><th>Recovery</th><th>What</th><th>Sleep</th><th>Sleep debt</th><th>Soreness</th></tr>
    ${rows.map(r=>`<tr><td><button data-player="${esc(r.p.id)}" style="text-align:left"><b style="color:var(--text)">${esc(r.p.name)}</b></button></td><td class="num">${Math.round(r.load)}</td><td>${r.n?`<span class="chip ${r.n>=2?'good':''}">${r.n} · ${r.min} min</span>`:`<span class="chip ${r.load>1800?'caution':''}">None</span>`}</td><td class="small">${esc(r.types.join(', ')||'–')}</td>
      <td class="num">${r.sl!=null?r1(r.sl)+' h':'–'}</td><td>${r.debt!=null?sevChip(-r.debt,-2,-5,r.debt+' h'):'–'}</td><td class="num">${fx(r.so,1)}</td></tr>`).join('')}</table></div></section>`}


// ================= Version 7: groups, calendar, message centre, uploads, more from the app =================
// Tables in supabase/teams.sql (version 4). Demo squad gets made-up groups, events and messages.
S.calW=S.calW||3;
const HUB={missing:false,groups:[],gm:[],events:[],msgs:[],reads:{},loaded:false};
const EV_KIND=[['training','Training','var(--k-green,var(--good))'],['match','Match','var(--alert)'],['gym','Gym / S&C','var(--blue)'],['recovery','Recovery','color-mix(in srgb,var(--blue) 55%,var(--alert))'],['meeting','Meeting','var(--caution)'],['other','Other','var(--muted)']];
const evCol=k=>(EV_KIND.find(x=>x[0]===k)||EV_KIND[5])[2];
const evLab=k=>(EV_KIND.find(x=>x[0]===k)||EV_KIND[5])[1];
const GCOL=['#6E8F78','#4F6B8A','#9A7230','#9A5C6E','#6E5E8F','#3F7480','#8A6A48'];
const grpById=id=>HUB.groups.find(g=>g.id===id);
const grpMembers=id=>HUB.gm.filter(m=>m.group_id===id).map(m=>m.user_id);
const groupsOf=pid=>HUB.groups.filter(g=>HUB.gm.some(m=>m.group_id===g.id&&m.user_id===pid));
const grpChip=g=>g?`<span class="chip" style="color:${esc(g.colour||GCOL[0])};background:color-mix(in srgb,${esc(g.colour||GCOL[0])} 14%,transparent)">${esc(g.name)}</span>`:'';
const hhmm=t=>t?String(t).slice(0,5):'';
const HAB_LABEL={checkin:'Check in',water:'Water target',bed:'Bed on time',phone:'Phone away early',veg:'5 veg and fruit',walk:'Walk outside',stretch:'Stretch',steps:'10,000 steps',read:'Read before bed',nodrink:'Alcohol-free day'};
const habName=id=>HAB_LABEL[id]||String(id).replace(/[-_]/g,' ').replace(/^./,c=>c.toUpperCase());
Object.assign(IC,{cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',grp:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c2.8 0 5 2 5 5"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',send:'<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',plus:'<path d="M12 5v14M5 12h14"/>',star:'<path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.1 6.1 20.3l1.3-6.5L2.5 9.3l6.6-.8z"/>'});
// a 5-star fade, like Match ready in the app
function starFade(v,max,w){const W=w||110,st=W/5,sc=st*0.92/24,H=Math.round(24*sc);const id='sf'+Math.random().toString(36).slice(2,7);
  const paths=[0,1,2,3,4].map(i=>`<path transform="translate(${i*st} 0) scale(${sc})" d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.1 6.1 20.3l1.3-6.5L2.5 9.3l6.6-.8z"/>`).join('');const fw=Math.min(W,(v/max)*5*st);
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${v} of ${max}" style="display:block"><defs><linearGradient id="${id}g" x1="0" x2="${W}" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:var(--logo-a,#E23D9E)"/><stop offset=".55" style="stop-color:var(--logo-b,#5B6CFF)"/><stop offset="1" style="stop-color:var(--logo-c,#34E3A0)"/></linearGradient><clipPath id="${id}c">${paths}</clipPath></defs><rect width="${W}" height="${H}" fill="var(--none)" clip-path="url(#${id}c)"/><rect width="${fw.toFixed(1)}" height="${H}" fill="url(#${id}g)" clip-path="url(#${id}c)"/></svg>`}
const INTENSITY=['','Very light','Light','Moderate','Hard','Very hard'];

// ---------- load ----------
async function loadHub(t){HUB.missing=false;HUB.loaded=true;
  if(t.team_id===DEMO_ID){Object.assign(HUB,buildDemoHub());return}
  const from=addK(todayK(),-60),to=addK(todayK(),120);
  const [g,gm,ev,ms,rd]=await Promise.all([sb.from('team_groups').select('*').eq('team_id',t.team_id).order('name'),sb.from('team_group_members').select('*').eq('team_id',t.team_id),
    sb.from('team_events').select('*').eq('team_id',t.team_id).gte('day',from).lte('day',to).order('day').order('start_time'),
    sb.from('team_messages').select('*').eq('team_id',t.team_id).order('created_at',{ascending:false}).limit(1500),sb.from('team_message_reads').select('*').eq('team_id',t.team_id)]);
  if(g.error){HUB.missing=/team_groups|relation|schema/i.test(g.error.message||'');Object.assign(HUB,{groups:[],gm:[],events:[],msgs:[],reads:{}});return}
  HUB.groups=g.data||[];HUB.gm=gm.data||[];HUB.events=ev.data||[];HUB.msgs=(ms.data||[]).reverse();HUB.reads={};(rd.data||[]).filter(r=>r.user_id===SESSION.user.id).forEach(r=>HUB.reads[r.thread]=r.read_at)}
async function refreshMsgs(){if(isDemo()||!TEAM||HUB.missing)return;const last=HUB.msgs.length?HUB.msgs[HUB.msgs.length-1].created_at:'1970-01-01';
  const {data}=await sb.from('team_messages').select('*').eq('team_id',TEAM.team_id).gt('created_at',last).order('created_at');if(data&&data.length){const have=new Set(HUB.msgs.map(m=>m.id));data.forEach(m=>{if(!have.has(m.id))HUB.msgs.push(m)});return true}}
setInterval(async()=>{if(document.hidden||!SESSION||!TEAM)return;const r=route().v;if(await refreshMsgs()&&(r==='messages'||r==='today'))render()},40000);
const missingCard=what=>`<section class="card"><header><div><h2>One more database step</h2><p>${what} need the version 4 tables.</p></div></header><ol class="steps"><li>Open Supabase › SQL Editor › New query.</li><li>Paste in everything from <b>supabase/teams.sql</b> (version 4) and click Run, then confirm.</li><li>Refresh this page.</li></ol></section>`;

// ---------- demo ----------
function buildDemoHub(){const T=todayK();const R=rng(4411);const ago=(d,h)=>new Date(Date.now()-d*864e5-(h||0)*36e5).toISOString();
  const groups=[{id:'g1',name:'Backs',colour:GCOL[1]},{id:'g2',name:'Forwards',colour:GCOL[2]},{id:'g3',name:'Midfield',colour:GCOL[0]},{id:'g4',name:'Rehab group',colour:GCOL[3]}];
  const gm=[];SQUAD.filter(p=>p.role==='member').forEach(p=>{const pos=(p.pos||'').toLowerCase();const g=/back|keeper/.test(pos)?'g1':/forward/.test(pos)?'g2':'g3';gm.push({group_id:g,user_id:p.id})});['demo2','demo8','demo16'].forEach(id=>gm.push({group_id:'g4',user_id:id}));
  const mon=addK(T,-((parse(T).getDay()+6)%7));const events=[];let n=0;const E=(d,kind,title,st,en,loc,intensity,group_id,notes)=>events.push({id:'ev'+(++n),team_id:DEMO_ID,kind,title,day:addK(mon,d),start_time:st,end_time:en,location:loc,intensity,group_id:group_id||null,notes:notes||null});
  for(let w=-1;w<5;w++){const b=w*7;const deload=w===3;
    E(b+1,'training','Squad training','19:30','21:00','Main pitch',deload?2:4,null,w===0?'Bring boots and runners. Conditioning block at the end.':null);
    E(b+0,'gym','Lower body gym','19:00','20:00','Club gym',deload?2:3,'g1');E(b+0,'gym','Lower body gym','20:00','21:00','Club gym',deload?2:3,'g2');
    E(b+3,'training','Squad training','19:30','21:00','Main pitch',deload?2:3,null);
    E(b+5,'training','Light session','11:00','12:00','Main pitch',1,null);
    E(b+6,'match',w%2?'League: away to Kiltyclogher':'League: home to Drumkeerin','14:00','15:30',w%2?'Kiltyclogher':'Glencar Manor',5,null,'Meet at the clubhouse 75 minutes before throw-in.');
    E(b+0,'recovery','Pool recovery','18:00','18:45','Sligo Leisure Centre',1,null);
    E(b+2,'recovery','Rehab session','18:30','19:15','Physio room',2,'g4')}
  E(9,'meeting','Video review','20:00','20:45','Clubhouse',null,null,'Last weekend\'s match. 20 minutes, then team talk.');
  const pl=SQUAD.filter(p=>p.role==='member');const M=[];let mi=0;const msg=(ch,body,who,st,d,h,extra)=>M.push(Object.assign({id:'m'+(++mi),team_id:DEMO_ID,channel:ch,group_id:null,player_id:null,author_id:st?'staff-'+st:'demo-p',author_name:who,author_staff:st,body,created_at:ago(d,h)},extra||{}));
  msg('squad','Lads, training moved to 7:30 on Tuesday. Pitch is booked until 9.','Darren','manager',3,4);
  msg('squad','Hydration this week please: 2.5 L a day minimum, more on training days. It shows in the check-ins.','Sinéad (nutrition)','nutrition',2,8);
  msg('squad','Match Sunday: meet at 12:45, clubhouse. Full squad, bring both jerseys.','Darren','manager',0,5);
  msg('group','Backs: speed work Thursday before the pitch session, 15 minutes early please.','Mark (S&C)','sc',1,6,{group_id:'g1'});
  msg('group','Forwards: gym moved to 8pm Monday so we get the rack to ourselves.','Mark (S&C)','sc',2,3,{group_id:'g2'});
  msg('group','Rehab group: Wednesday 6:30 in the physio room. Bring a towel and your band.','Aoife (physio)','physio',1,2,{group_id:'g4'});
  msg('staff','Darragh\'s hamstring is coming along. Stage 2 this week, not for Sunday.','Aoife (physio)','physio',0,9);
  msg('staff','Fiachra is doing extra gym on his own. I\'ll have a word before Thursday.','Mark (S&C)','sc',1,1);
  msg('staff','Tadhg has had a rough week at home. Light touch please, I\'m checking in with him.','Niamh (mindset)','mindset',2,5);
  const d=(pi,thread)=>thread.forEach(([who,st,body,dd,hh])=>msg('direct',body,who,st,dd,hh,{player_id:'demo'+pi,author_id:st?'staff-'+st:'demo'+pi}));
  d(2,[['Aoife (physio)','physio','How did the bridges feel this morning?',1,10],[first(pl[2].name),null,'Grand, a bit tight on the last set. No pain walking.',1,8],['Aoife (physio)','physio','Good. Stay on stage 2 and we\'ll test it Thursday.',1,7]]);
  d(10,[['Mark (S&C)','sc','Fiachra, you\'ve done 6 gym sessions this week. Let\'s pull it back to 3 before Sunday.',0,6],[first(pl[10].name),null,'Ah sorry, just trying to get the legs stronger. Will do.',0,4]]);
  d(6,[[first(pl[6].name),null,'Still sick, won\'t make Tuesday.',0,3]]);
  d(14,[['Niamh (mindset)','mindset','No pressure this week. Short sessions and get your sleep where you can.',2,6]]);
  M.sort((a,b)=>a.created_at.localeCompare(b.created_at));
  const reads={squad:ago(0,4.5),staff:ago(1,0),'group:g1':ago(0,0),'direct:demo2':ago(0,0)};
  // more from the app: session descriptions, habits and meals for the made-up players
  const DESC={'Club training':['Pitch session','Small-sided games','Kicking and conditioning'],Match:['League match'],Gym:['Upper body','Lower body','Full body']};
  const HB=['checkin','water','bed','walk','stretch','veg','read','phone'];
  const MEALS=[['Breakfast','08:00',[['Porridge with berries','1 bowl',420,16],['Scrambled eggs on toast','3 eggs, 2 slices',520,32],['Greek yoghurt and granola','250 g',380,24]]],['Lunch','13:00',[['Chicken wrap','2 wraps',640,45],['Ham and cheese sandwich','2 slices',520,30],['Tuna pasta salad','1 box',610,38]]],['Snack','16:00',[['Banana','1',105,1],['Protein shake','1 scoop',130,25],['Apple and peanut butter','1 + 1 tbsp',190,4]]],['Dinner','19:00',[['Steak, potatoes and veg','1 plate',780,52],['Salmon, rice and greens','1 plate',690,44],['Chilli con carne with rice','1 plate',820,48]]]];
  SQUAD.forEach((p,ix)=>Object.keys(p.D).forEach(k=>{const dd=p.D[k];(dd.extras||[]).forEach(x=>{const o=DESC[x.kind];if(o&&!x.desc)x.desc=o[Math.floor(R()*o.length)]});
    if(dd.energy&&R()<.8)dd.hab=HB.filter(()=>R()<.45);
    if(p.food&&dd.food&&ix%3!==1){dd.meals=MEALS.map(([meal,at,opts])=>{const [name,qty,kcal,protein]=opts[Math.floor(R()*opts.length)];return {meal,at,name,qty,kcal,protein}})}}));
  SQUAD.forEach(p=>{p.meals=p.food&&SQUAD.indexOf(p)%3!==1});
  if(!SC.ex.some(e=>e.category==='rehab'))[['Isometric bridge hold','Mat','Push through heels, hold 30 seconds, no pain'],['Single-leg balance','None','Soft knee, eyes forward, 30 seconds each side'],['Isometric calf raise','Wall','Rise half way and hold, 45 seconds'],['Ankle band mobility','Band','Knee over toes, slow and controlled']].forEach(([name,equipment,cues])=>SC.ex.push({id:uid(),team_id:DEMO_ID,name,category:'rehab',equipment,cues,video_path:null}));
  return {groups,gm,events,msgs:M,reads,missing:false}}

// ---------- group filter (top bar) ----------
const inGrp=p=>!S.grp||HUB.gm.some(m=>m.group_id===S.grp&&m.user_id===p.id);

// ---------- calendar ----------
function weekStart(k){return addK(k,-((parse(k).getDay()+6)%7))}
function evsOn(k){return HUB.events.filter(e=>e.day===k&&(!S.calGrp||!e.group_id||e.group_id===S.calGrp)).sort((a,b)=>String(a.start_time||'').localeCompare(String(b.start_time||'')))}
function evPill(e,compact){const g=grpById(e.group_id);return `<button class="evp" data-ev="${esc(e.id)}" style="--ec:${evCol(e.kind)}"><span class="evt">${e.start_time?hhmm(e.start_time)+' ':''}${esc(e.title)}</span>${compact?'':`<span class="evm">${[g?esc(g.name):'',e.intensity?INTENSITY[e.intensity]:''].filter(Boolean).join(' · ')}</span>`}</button>`}
function viewCalendar(){if(HUB.missing)return missingCard('The team calendar');
  const nW=S.calW||3,start=addK(weekStart(todayK()),(S.calOff||0)*7),T=todayK();const keys=[];for(let i=0;i<nW*7;i++)keys.push(addK(start,i));
  const can=!isDemo()||true;const grpSel=HUB.groups.length?`<select class="sel" id="calGrp"><option value="">Everyone's events</option>${HUB.groups.map(g=>`<option value="${esc(g.id)}" ${S.calGrp===g.id?'selected':''}>${esc(g.name)} and whole squad</option>`).join('')}</select>`:'';
  const head=`<section class="card"><header style="flex-wrap:wrap;align-items:center"><div><h2>Team calendar</h2><p>Players see the whole-squad events and their own groups' events in Keel. ${fmtK(keys[0],{day:'numeric',month:'short'})} to ${fmtK(keys[keys.length-1],{day:'numeric',month:'short'})}</p></div>
    <div class="toolbar">${seg('calW',[[2,'2 weeks'],[3,'3 weeks'],[4,'4 weeks']])}<div class="datenav"><button id="calPrev" aria-label="Earlier">‹</button><b style="min-width:70px">${S.calOff?'':'Now'}${S.calOff?(S.calOff>0?'+':'')+S.calOff+' wk':''}</b><button id="calNext" aria-label="Later">›</button></div>${grpSel}${can?`<button class="btn sm" data-evnew="${T}">${ico('plus','width:15px;height:15px')}Add</button>`:''}</div></header>
    <div class="legend" style="margin-bottom:12px">${EV_KIND.map(([k,l,c])=>`<span><i style="background:${c}"></i>${l}</span>`).join('')}</div>
    <div class="calgrid"><div class="calh">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<span>${d}</span>`).join('')}</div>
    ${Array.from({length:nW},(_,w)=>`<div class="calw">${keys.slice(w*7,w*7+7).map(k=>{const es=evsOn(k);return `<div class="cald ${k===T?'today':''} ${k<T?'past':''}" data-evday="${k}"><div class="caln">${parse(k).getDate()===1||k===keys[0]?fmtK(k,{day:'numeric',month:'short'}):parse(k).getDate()}</div>${es.map(e=>evPill(e)).join('')}<button class="caladd" data-evnew="${k}" aria-label="Add on ${esc(fmtK(k))}">+</button></div>`}).join('')}</div>`).join('')}</div>
    <div class="calagenda">${keys.filter(k=>k>=T||S.calOff<0).map(k=>{const es=evsOn(k);if(!es.length)return '';return `<div class="agd"><b>${k===T?'Today':esc(fmtK(k,{weekday:'long',day:'numeric',month:'short'}))}</b>${es.map(e=>evPill(e)).join('')}</div>`}).join('')||'<div class="empty">Nothing on yet.</div>'}</div></section>`;
  const wkLoad=Array.from({length:nW},(_,w)=>{const ks=keys.slice(w*7,w*7+7);const es=ks.flatMap(evsOn).filter(e=>e.kind!=='meeting');const hard=es.filter(e=>(e.intensity||0)>=4).length;const sum=es.reduce((a,e)=>a+(e.intensity||0),0);return {w,ks,n:es.length,hard,sum,m:es.filter(e=>e.kind==='match').length}});
  const mx=Math.max(1,...wkLoad.map(x=>x.sum));
  const plan=`<section class="card"><header><div><h2>Planned intensity</h2><p>Each event's intensity (1 to 5) added up per week. Players see it as stars on the event.</p></div></header>
    ${wkLoad.map(x=>`<div class="lrow" style="grid-template-columns:150px minmax(0,1fr) 90px 90px"><div class="nm"><b>Week of ${esc(fmtK(x.ks[0],{day:'numeric',month:'short'}))}</b><small>${x.n} sessions · ${x.m} match${x.m===1?'':'es'}</small></div><div class="lbar"><i style="width:${Math.round(x.sum/mx*100)}%"></i></div><span class="small">${x.sum} total</span><span class="small">${x.hard} hard</span></div>`).join('')}</section>`;
  return head+plan+(S.ev?evModalHTML():'')}
function evModalHTML(){const e=S.ev;const g=HUB.groups;return `<div class="modal" data-evmodal="1"><div class="mbox" style="max-width:620px"><header style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><h2 style="flex:1">${e.id?'Edit event':'New event'}</h2><button class="btn ghost sm" data-evclose="1">Close</button></header>
  <div class="grid" style="gap:12px"><div class="seg" style="flex-wrap:wrap">${EV_KIND.map(([k,l])=>`<button type="button" data-evkind="${k}" aria-pressed="${e.kind===k}">${l}</button>`).join('')}</div>
   <div class="field"><label>Title</label><input class="in" id="evTitle" value="${esc(e.title||'')}" maxlength="80" placeholder="e.g. Squad training"></div>
   <div class="grid g3" style="gap:12px"><div class="field"><label>Day</label><input class="in" type="date" id="evDay" value="${esc(e.day)}"></div><div class="field"><label>Starts</label><input class="in" type="time" id="evStart" value="${esc(hhmm(e.start_time))}"></div><div class="field"><label>Ends</label><input class="in" type="time" id="evEnd" value="${esc(hhmm(e.end_time))}"></div></div>
   <div class="grid g2" style="gap:12px"><div class="field"><label>Where</label><input class="in" id="evLoc" value="${esc(e.location||'')}" maxlength="120" placeholder="e.g. Main pitch"></div>
    <div class="field"><label>Who</label><select class="in" id="evGrp"><option value="">Whole squad</option>${g.map(x=>`<option value="${esc(x.id)}" ${e.group_id===x.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div></div>
   <div class="field"><label>Intensity</label><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><div class="seg">${[0,1,2,3,4,5].map(v=>`<button type="button" data-evint="${v}" aria-pressed="${(e.intensity||0)===v}">${v?v:'–'}</button>`).join('')}</div>${e.intensity?starFade(e.intensity,5,110)+`<span class="small muted">${INTENSITY[e.intensity]}</span>`:'<span class="small muted">Not set</span>'}</div></div>
   <div class="field"><label>Notes for the players</label><textarea class="in" id="evNotes" maxlength="1000" placeholder="e.g. Bring runners, conditioning at the end">${esc(e.notes||'')}</textarea></div>
   ${e.id?'':`<div class="field"><label>Repeat</label><select class="in" id="evRep"><option value="0">Just once</option>${[2,3,4,6,8,12].map(n=>`<option value="${n}">Every week for ${n} weeks</option>`).join('')}</select></div>`}
   <label class="small" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="evTell" ${e.id?'checked':''}> Tell the players in Messages${e.id?' (what changed)':''}</label>
   <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-evsave="1">${e.id?'Save':'Add to the calendar'}</button>${e.id?`<span style="flex:1"></span><button class="btn danger" data-evdel="1">Delete</button>`:''}</div></div></div></div>`}
function readEv(){const e=S.ev;if(!e||!$('#evTitle'))return e;e.title=$('#evTitle').value.trim();e.day=$('#evDay').value||e.day;e.start_time=$('#evStart').value||null;e.end_time=$('#evEnd').value||null;e.location=$('#evLoc').value.trim()||null;e.group_id=$('#evGrp').value||null;e.notes=$('#evNotes').value.trim()||null;return e}
function evLine(e){return `${fmtK(e.day,{weekday:'short',day:'numeric',month:'short'})}${e.start_time?' at '+hhmm(e.start_time):''}: ${e.title}${e.location?' ('+e.location+')':''}`}
async function saveEv(){const e=readEv();if(!e.title){toast('Give it a title');return}const rep=$('#evRep')?+$('#evRep').value:0;const tell=$('#evTell')&&$('#evTell').checked;
  const row={team_id:TEAM.team_id,kind:e.kind,title:e.title.slice(0,80),day:e.day,start_time:e.start_time,end_time:e.end_time,location:e.location,notes:e.notes,intensity:e.intensity||null,group_id:e.group_id};
  const rows=[row];for(let i=1;i<rep;i++)rows.push(Object.assign({},row,{day:addK(e.day,i*7)}));
  if(isDemo()){if(e.id)Object.assign(HUB.events.find(x=>x.id===e.id),row);else rows.forEach(r=>HUB.events.push(Object.assign({id:uid()},r)))}
  else if(e.id){const {error}=await sb.from('team_events').update(Object.assign({updated_at:new Date().toISOString()},row)).eq('id',e.id);if(error){toast(error.message,4000);return}Object.assign(HUB.events.find(x=>x.id===e.id),row)}
  else{const {data,error}=await sb.from('team_events').insert(rows).select();if(error){toast(error.message,4000);return}HUB.events.push(...data)}
  if(tell){const txt=(e.id?'Change to the calendar. ':'New on the calendar. ')+evLine(e)+(rep>1?`, every week for ${rep} weeks`:'')+(e.notes?'. '+e.notes:'');await postMsg(e.group_id?'group':'squad',txt,{group_id:e.group_id||null})}
  S.ev=null;toast(e.id?'Saved':rows.length>1?`Added ${rows.length} events`:'Added');render()}

// ---------- coming up (Overview) ----------
function comingUp(){if(HUB.missing||!HUB.events.length)return '';const T=todayK();const es=HUB.events.filter(e=>e.day>=T&&e.day<=addK(T,6)).sort((a,b)=>(a.day+(a.start_time||'')).localeCompare(b.day+(b.start_time||'')));
  return `<section class="card"><header><div><h2>Next 7 days</h2><p>From the team calendar</p></div><a class="btn ghost sm" href="#calendar">Calendar</a></header>${es.length?`<div class="upnext">${es.slice(0,8).map(e=>{const g=grpById(e.group_id);return `<button class="upi" data-ev="${esc(e.id)}" style="--ec:${evCol(e.kind)}"><span class="upd"><b>${esc(fmtK(e.day,{weekday:'short'}))}</b><small>${parse(e.day).getDate()}</small></span><span class="upt"><b>${esc(e.title)}</b><small>${esc([hhmm(e.start_time),e.location,g&&g.name].filter(Boolean).join(' · '))}</small></span>${e.intensity?starFade(e.intensity,5,70):''}</button>`}).join('')}</div>`:'<div class="empty">Nothing on the calendar this week.</div>'}</section>`}

// ---------- messages ----------
const thKey=m=>m.channel==='group'?'group:'+m.group_id:m.channel==='direct'?'direct:'+m.player_id:m.channel;
function threads(){const pl=players();const out=[{key:'squad',name:'Whole squad',sub:'Every player and the staff',ic:'today'}];
  HUB.groups.forEach(g=>out.push({key:'group:'+g.id,name:g.name,sub:grpMembers(g.id).length+' players',ic:'grp',col:g.colour}));
  out.push({key:'staff',name:'Staff room',sub:'Backroom team only, players never see it',ic:'note'});
  const dm=pl.map(p=>({key:'direct:'+p.id,name:p.name,sub:p.pos||'Player',ic:null,p}));
  out.forEach(t=>t.ms=HUB.msgs.filter(m=>thKey(m)===t.key));dm.forEach(t=>t.ms=HUB.msgs.filter(m=>thKey(m)===t.key));
  dm.sort((a,b)=>{const la=a.ms.length?a.ms[a.ms.length-1].created_at:'',lb=b.ms.length?b.ms[b.ms.length-1].created_at:'';return lb.localeCompare(la)||a.name.localeCompare(b.name)});
  return {top:out,dm}}
const myId=()=>SESSION&&SESSION.user.id;
const unreadIn=t=>t.ms.filter(m=>m.author_id!==myId()&&!String(m.author_id||'').startsWith('staff-')&&(!HUB.reads[t.key]||m.created_at>HUB.reads[t.key])).length+(isDemo()?t.ms.filter(m=>String(m.author_id||'').startsWith('staff-')&&m.author_staff!==S.demoAs&&(!HUB.reads[t.key]||m.created_at>HUB.reads[t.key])).length:0);
function unreadTotal(){if(HUB.missing)return 0;const {top,dm}=threads();return top.concat(dm).reduce((a,t)=>a+unreadIn(t),0)}
function whenTxt(iso_){const d=new Date(iso_);const k=iso(d);return k===todayK()?d.toLocaleTimeString('en-IE',{hour:'2-digit',minute:'2-digit'}):fmtK(k,{weekday:'short',day:'numeric',month:'short'})}
function viewMessages(){if(HUB.missing)return missingCard('Messages');const {top,dm}=threads();const cur=route().id||'';const q=(S.msgQ||'').toLowerCase();
  const item=t=>{const u=unreadIn(t);const last=t.ms[t.ms.length-1];return `<button class="thr ${cur===t.key?'on':''}" data-thread="${esc(t.key)}">${t.p?`<span class="tav">${esc(t.p.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</span>`:`<span class="tav" ${t.col?`style="color:${esc(t.col)}"`:''}>${ico(t.ic)}</span>`}<span class="tn"><b>${esc(t.name)}</b><small>${last?esc((last.author_name?first(last.author_name)+': ':'')+last.body.slice(0,60)):esc(t.sub)}</small></span>${u?`<em class="ub">${u}</em>`:last?`<small class="tw">${esc(whenTxt(last.created_at))}</small>`:''}</button>`};
  const list=`<div class="thlist"><input class="in" id="msgQ" placeholder="Find a player" value="${esc(S.msgQ||'')}" style="margin-bottom:8px">${top.filter(t=>!q||t.name.toLowerCase().includes(q)).map(item).join('')}<div class="navh" style="padding:12px 8px 4px">Players</div>${dm.filter(t=>!q||t.name.toLowerCase().includes(q)).map(item).join('')||'<div class="small muted" style="padding:8px">No players yet.</div>'}</div>`;
  const t=top.concat(dm).find(x=>x.key===cur);
  let pane;if(!t)pane=`<div class="empty" style="padding:60px 10px">${ico('msg','width:28px;height:28px')}<p style="margin-top:8px">Pick a thread. Post to the whole squad or a group, talk privately with a player, or use the staff room.</p></div>`;
  else{markRead(t.key);let lastDay='';
    pane=`<header class="thh"><button class="btn ghost sm thback" data-thread="">‹</button><div style="flex:1;min-width:0"><h2>${esc(t.name)}</h2><p class="small muted">${t.key==='staff'?'Only the backroom team sees this.':t.key==='squad'?'Every player sees this in Keel. Only staff can post here.':t.key.startsWith('group:')?'Players in this group see this in Keel. Only staff can post here.':'Private between '+esc(first(t.name))+' and the staff. Any of the staff can read and reply.'}</p></div>${t.p?`<a class="btn ghost sm" href="#player/${encodeURIComponent(t.p.id)}">Player page</a>`:''}</header>
     <div class="msgs" id="msgScroll">${t.ms.length?t.ms.map(m=>{const day=iso(new Date(m.created_at));const sep=day!==lastDay?`<div class="mday">${day===todayK()?'Today':esc(fmtK(day,{weekday:'long',day:'numeric',month:'short'}))}</div>`:'';lastDay=day;const mine=m.author_id===myId()||(isDemo()&&m.author_staff===S.demoAs);
       return sep+`<div class="mb ${mine?'mine':''} ${m.author_staff?'':'pl'}"><div class="mh"><b>${esc(m.author_name||'')}</b>${m.author_staff?`<span class="chip">${esc(staffLabel(m.author_staff))}</span>`:''}<small>${esc(new Date(m.created_at).toLocaleTimeString('en-IE',{hour:'2-digit',minute:'2-digit'}))}</small>${mine?`<button class="mdel" data-msgdel="${esc(m.id)}" aria-label="Delete">×</button>`:''}</div><div class="mt">${esc(m.body).replace(/\n/g,'<br>')}</div></div>`}).join(''):'<div class="empty">No messages yet.</div>'}</div>
     <form class="compose" id="msgForm" data-thread="${esc(t.key)}"><textarea class="in" id="msgBody" rows="2" maxlength="2000" placeholder="${t.key==='staff'?'Message the staff':'Message '+esc(t.key.startsWith('direct:')?first(t.name):t.name)}"></textarea><button class="btn" type="submit" aria-label="Send">${ico('send','width:16px;height:16px')}</button></form>`}
  return `<section class="card msgwrap ${t?'open':''}">${list}<div class="thpane">${pane}</div></section>`}
async function markRead(key){const now=new Date().toISOString();const prev=HUB.reads[key];HUB.reads[key]=now;if(isDemo()||(prev&&now.slice(0,16)===prev.slice(0,16)))return;
  try{await sb.from('team_message_reads').upsert({team_id:TEAM.team_id,user_id:myId(),thread:key,read_at:now},{onConflict:'team_id,user_id,thread'})}catch(e){}}
async function postMsg(channel,body,extra){extra=extra||{};const row=Object.assign({team_id:TEAM.team_id,channel,body:body.slice(0,2000)},extra);
  if(isDemo()){HUB.msgs.push(Object.assign({id:uid(),author_id:'staff-'+S.demoAs,author_name:{manager:'Darren',sc:'Mark (S&C)',physio:'Aoife (physio)',nutrition:'Sinéad (nutrition)',mindset:'Niamh (mindset)',coach:'Coach'}[S.demoAs]||'You',author_staff:S.demoAs,created_at:new Date().toISOString(),group_id:null,player_id:null},row));return true}
  const {data,error}=await sb.from('team_messages').insert(row).select().single();if(error){toast(error.message,4000);return false}HUB.msgs.push(data);return true}
function threadToChannel(key){if(key==='squad'||key==='staff')return [key,{}];const [k,id]=key.split(':');return k==='group'?['group',{group_id:id}]:['direct',{player_id:id}]}

// ---------- groups (Team page) ----------
function groupsCard(){if(HUB.missing)return missingCard('Groups');const ps=players().sort((a,b)=>a.name.localeCompare(b.name));const ed=S.grpEd;
  const form=ed?`<div style="display:flex;flex-direction:column;gap:12px;background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:16px;margin-bottom:14px">
     <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:end"><div class="field" style="flex:1;min-width:200px"><label>Group name</label><input class="in" id="grpName" value="${esc(ed.name||'')}" maxlength="60" placeholder="e.g. Backs, U20s, Rehab group"></div>
      <div class="field"><label>Colour</label><div style="display:flex;gap:6px">${GCOL.map(c=>`<button type="button" data-grpcol="${c}" aria-pressed="${ed.colour===c}" style="width:26px;height:26px;border-radius:50%;background:${c};outline:${ed.colour===c?'2px solid var(--text)':'none'};outline-offset:2px"></button>`).join('')}</div></div></div>
     <div class="pickgrid">${ps.map(p=>`<label class="pick"><input type="checkbox" data-grppick="${esc(p.id)}" ${ed.members.includes(p.id)?'checked':''}><span>${esc(p.name)}<small>${esc(p.pos||'')}</small></span></label>`).join('')||'<div class="small muted">No players yet.</div>'}</div>
     <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-grpsave="1">Save group</button><button class="btn ghost" data-grpcancel="1">Cancel</button>${ed.id?`<span style="flex:1"></span><button class="btn danger" data-grpdel="${esc(ed.id)}">Delete group</button>`:''}</div></div>`:'';
  return `<section class="card"><header><div><h2>Groups</h2><p>Put players in groups (Backs, Forwards, U20s, a rehab group) to give a whole group a programme, targets, events or a message in one go.</p></div>${ed?'':`<button class="btn sm" data-grpnew="1">${ico('plus','width:15px;height:15px')}New group</button>`}</header>${form}
   ${HUB.groups.length?`<div class="grid g2" style="gap:12px">${HUB.groups.map(g=>{const ms=grpMembers(g.id).map(id=>SQUAD.find(p=>p.id===id)).filter(Boolean);return `<div class="avcol" style="min-height:0"><h3 style="margin:0"><span class="dot" style="background:${esc(g.colour||GCOL[0])}"></span>${esc(g.name)}<span class="num">${ms.length}</span></h3><div class="small muted">${ms.map(p=>esc(p.name)).join(', ')||'Nobody yet'}</div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn ghost sm" data-grpedit="${esc(g.id)}">Edit</button><a class="btn ghost sm" href="#messages/group:${esc(g.id)}" data-thread="group:${esc(g.id)}">Message</a></div></div>`}).join('')}</div>`:'<div class="empty">No groups yet.</div>'}</section>`}
async function saveGroup(){const ed=S.grpEd;ed.name=($('#grpName').value||'').trim();if(!ed.name){toast('Name the group');return}ed.members=[...document.querySelectorAll('[data-grppick]:checked')].map(b=>b.dataset.grppick);
  if(isDemo()){if(!ed.id){ed.id=uid();HUB.groups.push({id:ed.id,name:ed.name,colour:ed.colour})}else Object.assign(grpById(ed.id),{name:ed.name,colour:ed.colour});HUB.gm=HUB.gm.filter(m=>m.group_id!==ed.id).concat(ed.members.map(u=>({group_id:ed.id,user_id:u})))}
  else{let id=ed.id;if(!id){const {data,error}=await sb.from('team_groups').insert({team_id:TEAM.team_id,name:ed.name,colour:ed.colour}).select().single();if(error){toast(error.message,4000);return}id=data.id;HUB.groups.push(data)}
    else{const {error}=await sb.from('team_groups').update({name:ed.name,colour:ed.colour}).eq('id',id);if(error){toast(error.message,4000);return}Object.assign(grpById(id),{name:ed.name,colour:ed.colour})}
    const had=grpMembers(id);const add=ed.members.filter(u=>!had.includes(u)),rem=had.filter(u=>!ed.members.includes(u));
    if(rem.length){const {error}=await sb.from('team_group_members').delete().eq('group_id',id).in('user_id',rem);if(error){toast(error.message,4000);return}}
    if(add.length){const {error}=await sb.from('team_group_members').insert(add.map(u=>({group_id:id,team_id:TEAM.team_id,user_id:u})));if(error){toast(error.message,4000);return}}
    HUB.gm=HUB.gm.filter(m=>m.group_id!==id).concat(ed.members.map(u=>({group_id:id,team_id:TEAM.team_id,user_id:u})))}
  HUB.groups.sort((a,b)=>a.name.localeCompare(b.name));S.grpEd=null;toast('Group saved');render()}
// tick a whole group in any player picker
function enhancePickers(){if(!HUB.groups.length)return;document.querySelectorAll('.pickgrid').forEach(pg=>{if(pg.dataset.grp||!pg.querySelector('[data-pick]'))return;pg.dataset.grp='1';
  const row=document.createElement('div');row.className='grprow';row.innerHTML=`<span class="small muted">Tick a group:</span>${HUB.groups.map(g=>`<button type="button" class="chip" data-pickgroup="${esc(g.id)}" style="color:${esc(g.colour||GCOL[0])}">${esc(g.name)}</button>`).join('')}`;pg.parentNode.insertBefore(row,pg)})}

// ---------- uploads: several videos at once, and importing a programme ----------
const nameFromFile=f=>f.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim().replace(/\b\w/g,c=>c.toUpperCase()).slice(0,80)||'New exercise';
async function bulkVideos(files,cat){files=[...files].filter(f=>/^video\//.test(f.type)||/\.(mp4|mov|webm)$/i.test(f.name));if(!files.length){toast('Pick video files (MP4, MOV or WebM)');return}
  let ok=0;for(const [i,f] of files.entries()){if(f.size>52428800){toast(`${f.name} is over 50 MB, skipped`,3500);continue}
    S.bulkMsg=`Uploading ${i+1} of ${files.length}: ${f.name}`;render();const path=`${TEAM.team_id}/${uid()}.${(f.name.split('.').pop()||'mp4').toLowerCase()}`;
    const name=nameFromFile(f.name);const ex=SC.ex.find(e=>e.name.toLowerCase()===name.toLowerCase());
    if(isDemo()){SC.urls[path]=URL.createObjectURL(f)}else{const {error}=await sb.storage.from('keel-videos').upload(path,f,{contentType:f.type||'video/mp4'});if(error){toast('Upload failed: '+error.message,5000);continue}}
    if(ex){if(!isDemo()){const {error}=await sb.from('sc_exercises').update({video_path:path}).eq('id',ex.id);if(error){toast(error.message,4000);continue}if(ex.video_path)sb.storage.from('keel-videos').remove([ex.video_path])}ex.video_path=path}
    else{const row={name,category:cat,video_path:path};if(isDemo())SC.ex.push(Object.assign({id:uid(),team_id:DEMO_ID,equipment:null,cues:null},row));else{const {data,error}=await sb.from('sc_exercises').insert(Object.assign({team_id:TEAM.team_id},row)).select().single();if(error){toast(error.message,4000);continue}SC.ex.push(data)}}
    ok++}
  S.bulkMsg='';toast(`${ok} video${ok===1?'':'s'} added. Rename any or add cues with Edit.`,4500);render()}
function bulkCard(cat,who){return `<section class="card bulk" data-bulkcat="${cat}"><div class="drop" id="dropZone">${ico('upload','width:26px;height:26px')}<div><b>Add several videos at once</b><p class="small muted">Drop clips here or pick them. Each becomes an exercise named after the file (e.g. <i>nordic-curl.mp4</i> becomes Nordic Curl), ready for ${who}. A clip with the same name as an exercise replaces its video.</p></div><label class="btn sm">${ico('upload','width:15px;height:15px')}Pick videos<input type="file" id="bulkFiles" multiple accept="video/mp4,video/quicktime,video/webm" hidden></label></div>${S.bulkMsg?`<div class="small" style="margin-top:8px">${esc(S.bulkMsg)}</div>`:''}</section>`}
// physio's own library: same exercises and videos, rehab and prehab first
function viewRehabLib(){const keep=S.libCat;if(!S.libCatP)S.libCatP='all';S.libCat=S.libCatP;const h=viewLibrary();S.libCat=keep;return bulkCard(['all','strength','power','speed','conditioning','core'].includes(S.libCatP)?'rehab':S.libCatP,'rehab plans')+h.replace(/data-set="libCat"/g,'data-set="libCatP"').replace('<h2>Exercise library</h2>','<h2>Rehab library</h2>').replace('Players see the video for every exercise in their session.','Shared with S&amp;C. Link any of these to a rehab stage and the player sees the video.')}
function normWeeks(o){return {name:String(o.name||'Imported programme').slice(0,80),goal:String(o.goal||'').slice(0,200),plan:{weeks:(o.weeks||[]).map(x=>({days:(x.days||[]).map(d=>({dow:Math.min(7,Math.max(1,+d.dow||1)),title:String(d.title||'Session').slice(0,60),kind:KIND.some(k=>k[0]===d.kind)?d.kind:'strength',min:+d.min||45,rpe:+d.rpe||6,
  items:(d.items||[]).map(i=>{const byName=!i.ex&&i.name&&SC.ex.find(e=>e.name.toLowerCase()===String(i.name).toLowerCase());const ok=(i.ex&&exById(i.ex))||byName;return {ex:ok?ok.id:null,name:ok?null:String(i.name||'Exercise').slice(0,80),category:ok?null:(SC_CATS.some(c=>c[0]===i.category)?i.category:'strength'),sets:i.sets??'',reps:i.reps??'',load:i.load??'',rest:i.rest??'',note:i.note??''}})}))}))}}}
// plain-text reader for when Koach can't be reached: "Week 1", "Day 1 / Monday: title", then "Exercise 3x8 @ RPE 7"
function parseProgText(txt){const DOWS=['mon','tue','wed','thu','fri','sat','sun'];const weeks=[];let w=null,d=null,dn=0;
  const newW=()=>{w={days:[]};weeks.push(w);dn=0};newW();
  txt.split(/\r?\n/).map(l=>l.replace(/^[\s\-*•\d.)]+(?=[A-Za-z])/,'').trim()).filter(Boolean).forEach(l=>{const low=l.toLowerCase();
    if(/^week\s*\d+/.test(low)){if(w.days.length)newW();return}
    const dm=low.match(/^(day\s*(\d+)|mon|tue|wed|thu|fri|sat|sun)[a-z]*\b[:\-–\s]*(.*)$/);
    if(dm&&(dm[2]||l.length<40||/[:\-–]/.test(l))){dn++;const dow=dm[2]?[1,4,6,2,5,3,7][(+dm[2]-1)%7]:DOWS.indexOf(dm[1].slice(0,3))+1;d={dow,title:(l.split(/[:\-–]/)[1]||'').trim()||('Session '+dn),kind:'strength',min:50,rpe:7,items:[]};w.days.push(d);return}
    if(!d){d={dow:1,title:'Session 1',kind:'strength',min:50,rpe:7,items:[]};w.days.push(d)}
    const sr=l.match(/(\d+)\s*[x×]\s*([\d\-–]+\s*(?:s|sec|m|min|reps?|each)?)/i);const ld=l.match(/(?:\s@|\sat\s)\s*(.+)$/i);
    const name=l.split(/\s+\d+\s*[x×]|\s+[-–:]\s+|\s+@/i)[0].replace(/,$/,'').trim();
    d.items.push({name,sets:sr?+sr[1]:'',reps:sr?sr[2].trim():'',load:ld?ld[1].trim():'',rest:'',note:''})});
  return {name:'Imported programme',goal:'',weeks:weeks.filter(x=>x.days.length)}}
async function importProgramme(){const txt=($('#impText')||{}).value||'';if(txt.trim().length<10){toast('Paste the programme first, or pick a file');return}S.impBusy=true;S.impText=txt;render();let out=null;
  if(!isDemo()&&SESSION&&SESSION.access_token){const lib=SC.ex.map(e=>`${e.id}|${e.name}|${e.category}`).join('\n');
    const prompt=`You are Koach inside Keel. An S&C coach has pasted their own programme (from a spreadsheet, a document or notes). Turn it into Keel's structure exactly as written: keep their exercises, sets, reps, loads, rest and notes. Don't add or change anything. If weeks aren't given, make one week. If days aren't named, spread sessions Mon, Thu, Sat.
Match each exercise to this library where it's clearly the same movement, giving its id in "ex" (format id|name|category):
${lib||'(library is empty)'}
Otherwise leave out "ex" and give "name" and "category" (one of ${SC_CATS.map(c=>c[0]).join(', ')}).
Reply with JSON only: {"name":"...","goal":"...","weeks":[{"days":[{"dow":1,"title":"...","kind":"strength|conditioning|speed|mobility|recovery","min":45,"rpe":7,"items":[{"ex":"<id>","name":"...","sets":3,"reps":"5","load":"...","rest":"...","note":"..."}]}]}]}
dow is 1 = Monday to 7 = Sunday.
The programme:
${txt.slice(0,15000)}`;
    try{const r=await fetch('/api/claude',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+SESSION.access_token},body:JSON.stringify({prompt,maxTokens:12000})});const j=await r.json();const m=(j.text||'').match(/\{[\s\S]*\}/);if(m){const o=JSON.parse(m[0]);if(o&&o.weeks&&o.weeks.length)out=o}}catch(e){}}
  if(!out)out=parseProgText(txt);S.impBusy=false;if(!out.weeks.length){toast('Couldn\'t find any exercises in that. One per line works best.',4500);render();return}
  S.imp=false;S.impText='';S.draft=Object.assign({id:null},normWeeks(out));S.draftFromKoach=true;S.wk=0;S.progEdit='new';toast('Imported. Check it over, then save and assign.',4000);render()}
function importCard(){return S.imp?`<section class="card"><header><div><h2>Import your own programme</h2><p>Paste it from a spreadsheet, Word or notes, or pick a .txt or .csv file. Koach lays it out week by week and matches your library; you check it before anyone sees it.</p></div></header>
  <textarea class="in" id="impText" rows="9" placeholder="Week 1&#10;Monday: Lower body&#10;Trap bar deadlift 4x5 @ RPE 7&#10;RFE split squat 3x8 each&#10;Nordic curl 3x5&#10;Thursday: Upper body&#10;Bench press 4x6&#10;Chin-up 3x8">${esc(S.impText||'')}</textarea>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn" data-impgo="1" ${S.impBusy?'disabled':''}>${S.impBusy?'Koach is reading it…':'Import'}</button><label class="btn ghost">Pick a file<input type="file" id="impFile" accept=".txt,.csv,.tsv,text/plain,text/csv" hidden></label><button class="btn ghost" data-imp="0">Cancel</button></div></section>`:''}
// rehab: paste the physio's own programme into stages
function parseRehabText(txt){const st=[];let cur=null;txt.split(/\r?\n/).map(l=>l.replace(/^[\s\-*•]+/,'').trim()).filter(Boolean).forEach(l=>{const m=l.match(/^(stage|phase|week)\s*\d*\s*[:\-–]?\s*(.*)$/i);
  if(m){cur={name:m[2]||l,goal:'',criteria:'',items:[]};st.push(cur);return}if(!cur){cur={name:'Stage 1',goal:'',criteria:'',items:[]};st.push(cur)}
  if(/^(goal|aim)\s*[:\-–]/i.test(l)){cur.goal=l.split(/[:\-–]/).slice(1).join(':').trim();return}if(/^(to move on|progress when|criteria|exit)\s*[:\-–]/i.test(l)){cur.criteria=l.split(/[:\-–]/).slice(1).join(':').trim();return}
  const sr=l.match(/(\d+)\s*[x×]\s*([\w\s]+?)(?:,|$|\s{2})/i);const name=l.split(/\s+\d+\s*[x×]|\s+[-–]\s+|,/)[0].trim();const lib=SC.ex.find(e=>e.name.toLowerCase()===name.toLowerCase());
  cur.items.push({ex:lib?lib.id:null,name:lib?lib.name:name,sets:sr?sr[1]:'',reps:sr?sr[2].trim():'',freq:(l.match(/(daily|every day|\d+\s*(?:times|x)\s*a\s*week|twice a day)/i)||[''])[0],note:''})});return st}
function rehabImportBox(){return `<section class="card"><header><div><h2>Use your own programme</h2><p>Paste your rehab protocol. Lines starting with Stage or Phase start a new stage; "Goal:" and "To move on:" lines fill those in; every other line is an exercise (e.g. <i>Isometric bridge 4x30s daily</i>). Exercises with the same name as one in the library get its video.</p></div></header>
  <textarea class="in" id="rhImpText" rows="7" placeholder="Stage 1: Protect&#10;Goal: Pain-free walking&#10;Isometric bridge hold 4x30s daily&#10;To move on: No pain at rest&#10;Stage 2: Strength&#10;Nordic hamstring curl 3x4 3 times a week"></textarea>
  <div style="display:flex;gap:8px;margin-top:10px"><button class="btn ghost sm" data-rhimp="1">Replace the stages with this</button></div></section>`}

// ---------- more from the app: day by day on the player page ----------
function dayDetail(p){const days=lastN(S.k,14).slice().reverse();const k=S.pday&&days.includes(S.pday)?S.pday:days[0];const d=p.D[k]||{};const L=p.L[k];
  const pick=`<div class="toolbar" style="margin-bottom:4px"><div class="seg">${days.slice(0,10).map(kk=>`<button data-set="pday" data-val="${kk}" aria-pressed="${kk===k}">${kk===todayK()?'Today':esc(fmtK(kk,{weekday:'short',day:'numeric'}))}</button>`).join('')}</div></div>`;
  const ci=checkedIn(d);const row=(l,v)=>v==null||v===''?'':`<tr><td class="muted">${l}</td><td>${v}</td></tr>`;const sc=v=>isNum(v)?`${v}/5`:null;
  const check=`<section class="card"><header><div><h2>Check-in</h2><p>${ci?'From their morning check-in':'No check-in that day'}</p></div>${ci?ring(dayInfo(p,k).s,52,dayInfo(p,k).st):''}</header>${ci?`<table class="list">${row('Bed and wake',d.bed&&d.wake?esc(d.bed+' to '+d.wake):null)}${row('Sleep',p.E.sleep(k)!=null?r1(p.E.sleep(k))+' h':null)}${row('Took to fall asleep',d.latency!=null?esc(d.latency)+' min':null)}${row('Awake in the night',d.awakeMin!=null?esc(d.awakeMin)+' min':null)}${row('Sleep quality',sc(d.sleepQ))}${row('Energy',sc(d.energy))}${row('Mood',sc(d.mood))}${row('Stress',sc(d.stress))}${row('Body soreness',sc(d.sore))}${row('Resting pulse',d.rhr?esc(d.rhr)+' bpm':null)}${row('Unwell',d.sick?esc(d.sick.sev||'yes'):null)}${row('Niggles',(d.niggles||[]).map(n=>esc(n.area+(n.side?' ('+n.side.toLowerCase()+')':''))+' '+painChip(+n.pain||0)).join(' ')||null)}${row('Farm or work',d.farmHrs?esc(d.farmHrs)+' h physical work':null)}</table>`:''}</section>`;
  const ss=sessionsOn(p,k);const sess=`<section class="card"><header><div><h2>Sessions</h2><p>What they logged in Keel</p></div></header>${ss.length?`<table class="list"><tr><th>What</th><th>Min</th><th>Effort</th><th>How it went</th></tr>${ss.map(s=>`<tr><td><b style="color:var(--text)">${esc(s.what)}</b>${s.desc?`<div class="tiny muted">${esc(s.desc)}</div>`:''}${s.st==='missed'?' <span class="chip alert">Missed</span>':''}</td><td class="num">${s.dur||'–'}</td><td class="num">${s.rpe||'–'}</td><td>${esc(s.fb&&isNum(s.fb.feel)?FEEL[s.fb.feel]:'–')}</td></tr>`).join('')}</table>`:'<div class="empty">No sessions that day.</div>'}</section>`;
  const hab=(d.hab||[]);const rec=[...(d.recovery||[]).map(r=>[r.kind,r.min]),...(d.mobility||[]).map(r=>[r.name,r.min]),...(d.hc||[]).map(r=>[r.type,r.min])];
  const hr=`<section class="card"><header><div><h2>Habits and recovery</h2><p>Ticked in Keel that day</p></div></header>${hab.length?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">${hab.map(h=>`<span class="chip good">${ico('check')}${esc(habName(h))}</span>`).join('')}</div>`:'<p class="small muted" style="margin-bottom:10px">No habits ticked.</p>'}${rec.length?`<table class="list">${rec.map(([n,m])=>`<tr><td>${esc(n||'Recovery')}</td><td class="num">${m?esc(m)+' min':''}</td></tr>`).join('')}</table>`:'<p class="small muted">No recovery logged.</p>'}</section>`;
  const meals=d.meals&&d.meals.length?d.meals:null;const f=foodOn(p,k);
  const food=`<section class="card"><header><div><h2>Food</h2><p>${!p.food?'Not shared':meals?'Meals they logged':'Totals only (meals not shared)'}</p></div>${f?`<span class="chip">${fx(f.kcal)} kcal · ${fx(f.protein)} g protein</span>`:''}</header>${!p.food?`<div class="empty">${esc(first(p.name))} keeps food private.</div>`:meals?`<table class="list"><tr><th>Meal</th><th>Food</th><th>Amount</th><th>kcal</th><th>Protein</th></tr>${meals.map(m=>`<tr><td class="muted">${esc(m.meal||'')}${m.at?' · '+esc(m.at):''}</td><td><b style="color:var(--text)">${esc(m.name)}</b>${m.dish?`<div class="tiny muted">${esc(m.dish)}</div>`:''}</td><td class="small">${esc(m.qty||'')}</td><td class="num">${fx(m.kcal)}</td><td class="num">${m.protein!=null?fx(m.protein)+' g':'–'}</td></tr>`).join('')}</table>`:f?`<p class="small">${fx(f.kcal)} kcal, ${fx(f.protein)} g protein, ${fx(f.carbs)} g carbs, ${fx(f.fat)} g fat${f.water!=null?', '+f.water+' L water':''}.</p>`:'<div class="empty">Nothing logged that day.</div>'}</section>`;
  // habits over two weeks
  const hc={};days.forEach(kk=>((p.D[kk]||{}).hab||[]).forEach(h=>hc[h]=(hc[h]||0)+1));const hs=Object.entries(hc).sort((a,b)=>b[1]-a[1]);
  const hab14=hs.length?`<section class="card"><header><div><h2>Habits, last 14 days</h2><p>Days each one was ticked</p></div></header>${hs.map(([h,n])=>`<div class="lrow" style="grid-template-columns:170px minmax(0,1fr) 60px"><div class="nm"><b>${esc(habName(h))}</b></div><div class="lbar"><i style="width:${Math.round(n/14*100)}%"></i></div><span class="small num">${n}/14</span></div>`).join('')}</section>`:'';
  return pick+`<div class="grid g2">${check}${sess}${food}${hr}</div>`+hab14}

// ---------- shell additions ----------
function groupFilter(){if(!HUB.groups.length)return '';return `<select class="sel" id="grpSel" aria-label="Group"><option value="">All players</option>${HUB.groups.map(g=>`<option value="${esc(g.id)}" ${S.grp===g.id?'selected':''}>${esc(g.name)}</option>`).join('')}</select>`}

// ---------- events ----------
document.addEventListener('click',async e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(x=c('[data-evnew]')){if(e.target.closest('.evp'))return;S.ev={kind:'training',title:'',day:x.dataset.evnew,start_time:'19:30',end_time:'21:00',location:'',group_id:S.calGrp||null,intensity:3,notes:''};render();return}
  if(x=c('[data-ev]')){const ev=HUB.events.find(y=>y.id===x.dataset.ev);if(!ev)return;S.ev=Object.assign({},ev);if(route().v!=='calendar'){location.hash='calendar'}else render();return}
  if(c('[data-evclose]')||(e.target.dataset&&e.target.dataset.evmodal)){S.ev=null;render();return}
  if(x=c('[data-evkind]')){readEv();S.ev.kind=x.dataset.evkind;if(!S.ev.title||EV_KIND.some(k=>k[1]===S.ev.title||S.ev.title==='Squad training'))S.ev.title={training:'Squad training',match:'Match',gym:'Gym session',recovery:'Recovery session',meeting:'Team meeting',other:''}[S.ev.kind];if(S.ev.kind==='match')S.ev.intensity=5;render();return}
  if(x=c('[data-evint]')){readEv();S.ev.intensity=+x.dataset.evint||null;render();return}
  if(c('[data-evsave]')){await saveEv();return}
  if(c('[data-evdel]')){const b=c('[data-evdel]');if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent='Tap again to delete';return}const id=S.ev.id;
    if(!isDemo()){const {error}=await sb.from('team_events').delete().eq('id',id);if(error){toast(error.message);return}}HUB.events=HUB.events.filter(y=>y.id!==id);S.ev=null;toast('Deleted');render();return}
  if(c('#calPrev')){S.calOff=(S.calOff||0)-1;render();return}if(c('#calNext')){S.calOff=(S.calOff||0)+1;render();return}
  if(x=c('[data-thread]')){e.preventDefault();S.thread=x.dataset.thread;const h='messages'+(S.thread?'/'+S.thread:'');if(location.hash!=='#'+h)location.hash=h;else render();return}
  if(x=c('[data-msgdel]')){if(x.dataset.sure!=='1'){x.dataset.sure='1';x.textContent='Delete?';return}if(!isDemo()){const {error}=await sb.from('team_messages').delete().eq('id',x.dataset.msgdel);if(error){toast(error.message);return}}HUB.msgs=HUB.msgs.filter(m=>m.id!==x.dataset.msgdel);render();return}
  if(c('[data-grpnew]')){S.grpEd={id:null,name:'',colour:GCOL[HUB.groups.length%GCOL.length],members:[]};render();return}
  if(x=c('[data-grpedit]')){const g=grpById(x.dataset.grpedit);S.grpEd={id:g.id,name:g.name,colour:g.colour||GCOL[0],members:grpMembers(g.id)};render();scrollTo(0,0);return}
  if(x=c('[data-grpcol]')){S.grpEd.name=($('#grpName')||{}).value||S.grpEd.name;S.grpEd.members=[...document.querySelectorAll('[data-grppick]:checked')].map(b=>b.dataset.grppick);S.grpEd.colour=x.dataset.grpcol;render();return}
  if(c('[data-grpcancel]')){S.grpEd=null;render();return}
  if(c('[data-grpsave]')){await saveGroup();return}
  if(x=c('[data-grpdel]')){if(x.dataset.sure!=='1'){x.dataset.sure='1';x.textContent='Tap again to delete';return}const id=x.dataset.grpdel;if(!isDemo()){const {error}=await sb.from('team_groups').delete().eq('id',id);if(error){toast(error.message);return}}
    HUB.groups=HUB.groups.filter(g=>g.id!==id);HUB.gm=HUB.gm.filter(m=>m.group_id!==id);if(S.grp===id)S.grp='';S.grpEd=null;render();return}
  if(x=c('[data-pickgroup]')){const ids=grpMembers(x.dataset.pickgroup);const pg=x.closest('.grprow').nextElementSibling;const boxes=[...pg.querySelectorAll('[data-pick]')].filter(b=>ids.includes(b.dataset.pick));const all=boxes.every(b=>b.checked);boxes.forEach(b=>b.checked=!all);S.pickGroup=all?null:x.dataset.pickgroup;return}
  if(x=c('[data-imp]')){S.imp=x.dataset.imp==='1';render();return}
  if(c('[data-impgo]')){await importProgramme();return}
  if(c('[data-rhimp]')){const t=($('#rhImpText')||{}).value||'';const st=parseRehabText(t);if(!st.length||!S.rh){toast('Paste the stages first');return}S.rh.d.stages=st;S.rh.d.stage=0;toast(`${st.length} stage${st.length===1?'':'s'} filled in. Check them, then send.`,4000);render();return}
  if(x=c('[data-msgplayer]')){S.thread='direct:'+x.dataset.msgplayer;location.hash='messages/'+S.thread;return}
});
document.addEventListener('change',async e=>{const t=e.target;
  if(t.id==='calGrp'){S.calGrp=t.value||null;setTimeout(render,0);return}
  if(t.id==='grpSel'){S.grp=t.value||'';SQUAD.forEach(p=>p._di={});setTimeout(render,0);return}
  if(t.id==='bulkFiles'){const cat=(t.closest('[data-bulkcat]')||{}).dataset?.bulkcat||'strength';await bulkVideos(t.files,cat==='all'?'strength':cat);return}
  if(t.id==='impFile'){const f=t.files[0];if(!f)return;S.impText=await f.text();render();return}
});
document.addEventListener('input',e=>{if(e.target.id==='msgQ'){S.msgQ=e.target.value;const p=e.target.selectionStart;setTimeout(()=>{render();const i=$('#msgQ');if(i){i.focus();i.setSelectionRange(p,p)}},0)}});
document.addEventListener('submit',async e=>{const f=e.target;if(f.id!=='msgForm')return;e.preventDefault();const body=($('#msgBody').value||'').trim();if(!body)return;const [ch,ex]=threadToChannel(f.dataset.thread);
  const btn=f.querySelector('button');btn.disabled=true;if(await postMsg(ch,body,ex)){HUB.reads[f.dataset.thread]=new Date().toISOString();render();const m=$('#msgScroll');if(m)m.scrollTop=m.scrollHeight;const b=$('#msgBody');if(b)b.focus()}else btn.disabled=false});
document.addEventListener('keydown',e=>{if(e.target.id==='msgBody'&&e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();$('#msgForm').requestSubmit()}});
document.addEventListener('dragover',e=>{const z=e.target.closest&&e.target.closest('#dropZone');if(z){e.preventDefault();z.classList.add('over')}});
document.addEventListener('dragleave',e=>{const z=e.target.closest&&e.target.closest('#dropZone');if(z)z.classList.remove('over')});
document.addEventListener('drop',async e=>{const z=e.target.closest&&e.target.closest('#dropZone');if(!z)return;e.preventDefault();const cat=z.closest('[data-bulkcat]').dataset.bulkcat;await bulkVideos(e.dataTransfer.files,cat==='all'?'strength':cat)});

// ================= Nov 2026 update: everything the app now logs, given a home =================
// Phase 1: skipping, own sessions, mobility, recovery tools, sleep debt and consistency, distance, tidier load list
// Phase 2: squad body map (S&C) and mobility against niggles (Physio)
// Phase 3: heart rate by type, supplements, last coffee, work and driving hours (needs supabase/share2.sql)
// Phase 4: each player's Keel week, plan changes and Koach's line for the day
const BM_M=[
 ['quads','Quads','legs',2],['hams','Hamstrings','legs',2],['calves','Calves','legs',2],['shins','Shins','legs',1],['adductors','Adductors (groin)','legs',1],
 ['glutes','Glutes','hips',2],['gmed','Side glutes (glute med)','hips',1],['hipflex','Hip flexors','hips',1],
 ['abs','Abs','core',2],['obliques','Obliques','core',1.5],['lowback','Lower back','core',1],
 ['lats','Lats','back',1.5],['upback','Upper back','back',2],
 ['delts','Shoulders','shoulders',1.5],['cuff','Rotator cuff','shoulders',1],['chest','Chest','shoulders',1.5],
 ['arms','Arms','arms',1],['grip','Forearms and grip','arms',1]];
const BM_R=[['legs','Legs'],['hips','Hips and glutes'],['core','Core'],['back','Back'],['shoulders','Shoulders and chest'],['arms','Arms and grip']];
const BM_G={
 hyrox:{l:'Hyrox',t:{quads:3,glutes:3,calves:2.5,hams:2,upback:2.5,lats:2,grip:2,delts:2,abs:2,obliques:1.5,arms:1.5}},
 gaa:{l:'GAA football',t:{hams:3,glutes:2.5,quads:2.5,calves:2.5,adductors:2,gmed:2,hipflex:1.5,obliques:1.5,shins:1.5,lowback:1.5}},
 run:{l:'Running event',t:{calves:3,glutes:2.5,hams:2,quads:2,gmed:1.5,shins:1.5,hipflex:1.5,abs:1.5}},
 strong:{l:'Get stronger',t:{quads:2.5,hams:2.5,glutes:2.5,upback:2.5,lats:2,chest:2,delts:2,lowback:1.5,grip:1.5}},
 weight:{l:'Lose weight',t:{quads:2.5,glutes:2.5,hams:2,upback:2,lats:2,chest:2}}};

const BM_PAT=[['squat','Squat'],['hinge','Hinge'],['single','Single leg'],['push','Push'],['pull','Pull'],['carry','Carry'],['rotate','Rotation / anti-rotation'],['lateral','Side to side'],['sprint','Sprint'],['jump','Jump']];
// exercise library: [regex, muscles {key:weight}, patterns]
const BM_LIB=[
 [/row ?erg|rowing|rower|^row$|^row \d|concept ?2/i,{quads:.6,glutes:.5,hams:.4,upback:.8,lats:.7,arms:.4,grip:.3},['pull']],
 [/ski ?erg|ski\b/i,{lats:1,upback:.6,arms:.5,abs:.6,delts:.4},['pull']],
 [/sled push|prowler/i,{quads:1,glutes:.8,calves:.7,delts:.3,chest:.3,arms:.3},['push']],
 [/sled pull|rope pull/i,{upback:.9,lats:.7,arms:.6,grip:.8,hams:.6,glutes:.5},['pull']],
 [/burpee/i,{quads:.8,glutes:.7,chest:.5,delts:.4,calves:.4,abs:.3},['jump','push']],
 [/wall ?ball|thruster/i,{quads:1,glutes:.7,delts:.7,arms:.3,abs:.3},['squat','push']],
 [/farmer|carry|suitcase/i,{grip:1,upback:.8,obliques:.6,abs:.4,glutes:.3,calves:.3},['carry']],
 [/trap.?bar|deadlift|rdl|romanian|good ?morning/i,{hams:.8,glutes:1,quads:.5,lowback:.7,upback:.4,grip:.5},['hinge']],
 [/swing/i,{glutes:1,hams:.8,lowback:.5,grip:.5,abs:.3},['hinge']],
 [/nordic|ham(string)? curl/i,{hams:1},['hinge']],
 [/bridge|hip thrust/i,{glutes:1,hams:.4},['hinge']],
 [/copenhagen/i,{adductors:1,obliques:.6},['lateral']],
 [/lateral bound|skater|side lunge|lateral lunge|cossack/i,{gmed:1,adductors:.6,glutes:.6,quads:.5,calves:.4},['lateral','single','jump']],
 [/bound/i,{glutes:.8,hams:.8,calves:.6,hipflex:.5,quads:.5},['sprint','jump','single']],
 [/split squat|lunge|step.?up|bulgarian|pistol/i,{quads:1,glutes:.9,adductors:.4,gmed:.4,hipflex:.3},['squat','single']],
 [/squat/i,{quads:1,glutes:.8,adductors:.4,lowback:.3,abs:.3},['squat']],
 [/calf raise|calf/i,{calves:1},[]],
 [/tib|toe raise/i,{shins:1},[]],
 [/pogo|skipping|jump rope|a-skip|b-skip/i,{calves:1,shins:.3},['jump']],
 [/hurdle hop|box jump|jump|hop/i,{quads:.8,glutes:.6,calves:.6},['jump']],
 [/5-0-5|decel|cut|change of direction|agility|shuttle/i,{quads:.8,glutes:.6,gmed:.6,adductors:.5,calves:.4},['lateral','sprint']],
 [/curved/i,{gmed:.7,adductors:.6,calves:.6,hams:.5},['sprint','lateral']],
 [/sprint|acceleration|flying|build.?up|strides/i,{hams:1,glutes:.8,hipflex:.7,calves:.7,quads:.5},['sprint']],
 [/pallof|anti.?rotation|woodchop|russian twist|landmine rot/i,{obliques:1,abs:.5},['rotate']],
 [/side plank/i,{obliques:1,gmed:.5},['rotate']],
 [/dead ?bug|hollow|leg raise|sit.?up|crunch|ab wheel|rollout/i,{abs:1,hipflex:.4},[]],
 [/mountain climber/i,{abs:.7,hipflex:.6,delts:.3},[]],
 [/plank/i,{abs:1,delts:.4,obliques:.4},['rotate']],
 [/face pull|pull.?apart|external rotation|ytw|y-t-w|band dislocate/i,{cuff:1,upback:.6,delts:.3},['pull']],
 [/pull.?up|chin.?up|lat pull/i,{lats:1,arms:.6,grip:.5,upback:.4},['pull']],
 [/row/i,{upback:1,lats:.8,arms:.5,grip:.3},['pull']],
 [/push.?up|press.?up|bench|dip/i,{chest:1,delts:.6,arms:.6,abs:.3},['push']],
 [/overhead|shoulder press|military|push press|landmine press/i,{delts:1,arms:.6,upback:.3,abs:.3},['push']],
 [/curl/i,{arms:1,grip:.3},['pull']],
 [/bike|assault|echo|cycle/i,{quads:1,glutes:.4,calves:.3},[]],
 [/run|jog/i,{calves:.6,quads:.5,hams:.4,glutes:.4,hipflex:.4,shins:.3},[]]];
const BM_RUN={calves:1,quads:.6,hams:.5,glutes:.5,hipflex:.5,shins:.4,gmed:.3,abs:.2};
const BM_FIELD={hams:.8,quads:.7,calves:.7,glutes:.6,adductors:.6,gmed:.5,hipflex:.5,shins:.3,obliques:.3};
const BM_FARM={grip:.5,upback:.4,lowback:.4,obliques:.3,quads:.2};
const BM_REG={'Quads':{quads:.8},'Hamstrings':{hams:.8},'Glutes':{glutes:.8},'Calves':{calves:.8},'Hips / groin':{adductors:.6,hipflex:.5},'Lower back':{lowback:.8},'Core':{abs:.7,obliques:.5},'Shoulders':{delts:.8},'Upper back':{upback:.8,lats:.5},'Chest':{chest:.8},'Grip / forearms':{grip:.8}};
const BM_MOB=[[/couch|hip flexor/i,['hipflex','quads']],[/90\/90/i,['glutes','gmed','hipflex']],[/adductor/i,['adductors']],[/calf/i,['calves']],[/thoracic|open book/i,['upback']],[/deep squat/i,['adductors','glutes','calves']],[/hamstring/i,['hams']]];
const BM_MOBALL=['hipflex','quads','glutes','gmed','adductors','calves','upback','hams'];
let bmS={lvl:2,wi:5,sel:null};

function bmTag(name,regions){for(const [re,m,p] of BM_LIB)if(re.test(name))return {m,p};
  if(Array.isArray(regions)&&regions.length){const m={};regions.forEach(r=>{const x=BM_REG[r];if(x)Object.entries(x).forEach(([k,v])=>m[k]=Math.max(m[k]||0,v))});if(Object.keys(m).length)return {m,p:[]}}
  return null}

const BM2_BODY_F='M100,14 C109,14 114,22 114,32 C114,42 110,48 107,51 L108,58 C116,61 128,62 138,66 C146,70 150,78 152,88 L156,118 C158,130 160,142 161,152 L166,196 C167,206 168,214 166,222 C164,228 160,226 159,220 L155,200 C152,186 149,170 147,158 L141,128 L138,150 C136,162 134,172 134,182 C138,196 139,212 138,228 C137,252 133,276 130,298 C131,312 130,330 128,346 C127,362 126,380 127,398 L128,412 C132,418 132,424 127,425 L112,425 C109,422 110,414 112,408 C112,392 112,372 111,352 C110,330 108,306 106,284 L103,232 L100,224 L97,232 L94,284 C92,306 90,330 89,352 C88,372 88,392 88,408 C90,414 91,422 88,425 L73,425 C68,424 68,418 72,412 L73,398 C74,380 73,362 72,346 C70,330 69,312 70,298 C67,276 63,252 62,228 C61,212 62,196 66,182 C66,172 64,162 62,150 L59,128 L53,158 C51,170 48,186 45,200 L41,220 C40,226 36,228 34,222 C32,214 33,206 34,196 L39,152 C40,142 42,130 44,118 L48,88 C50,78 54,70 62,66 C72,62 84,61 92,58 L93,51 C90,48 86,42 86,32 C86,22 91,14 100,14 Z';
const BM2_F=[
 ['delts','<path d="M63,67 C55,70 50,78 49,90 C49,98 51,104 54,108 C58,98 63,88 68,80 C68,74 66,70 63,67 Z"/>'],
 ['chest','<path d="M98,66 C88,64 76,66 69,72 C64,80 62,90 66,98 C74,104 88,104 98,100 Z"/>'],
 ['arms','<path d="M52,110 C48,118 46,128 46,138 C47,146 50,150 53,150 C57,142 60,132 61,122 C61,114 58,108 52,110 Z"/>'],
 ['grip','<path d="M45,156 C42,168 39,182 38,196 C38,204 41,206 44,202 C48,190 52,176 54,162 C53,155 48,152 45,156 Z"/>'],
 ['abs','<path d="M90,106 L98,106 L98,124 L90,124 C89,118 89,112 90,106 Z"/><path d="M90,127 L98,127 L98,145 L90,145 Z"/><path d="M90,148 L98,148 L98,170 C95,172 92,170 90,166 Z"/>'],
 ['obliques','<path d="M86,106 C78,110 72,120 70,134 C69,148 70,160 74,170 C78,166 83,160 86,152 Z"/>'],
 ['hipflex','<path d="M75,176 C78,186 84,196 92,206 C95,200 96,192 96,184 C90,180 82,178 75,176 Z"/>'],
 ['quads','<path d="M68,190 C64,206 64,226 66,246 C68,262 72,280 78,292 C84,296 92,292 94,284 C96,262 96,236 94,214 C88,206 80,198 74,190 Z"/>'],
 ['adductors','<path d="M96,214 C98,226 98,240 97,252 C96,258 95,262 94,262 C94,246 94,228 95,214 Z"/>'],
 ['shins','<path d="M83,318 C80,336 79,356 81,376 C82,388 85,394 87,392 C89,372 90,350 89,330 C88,322 86,316 83,318 Z"/>'],
 ['calves','<path d="M74,316 C71,330 71,346 74,360 C76,366 79,364 79,358 C79,342 79,328 77,318 Z"/>']];
const BM2_B=[
 ['upback','<path d="M98,52 C90,56 80,60 70,66 C74,76 82,90 90,104 C94,110 97,114 98,116 Z"/>'],
 ['delts','<path d="M63,67 C55,70 50,78 49,90 C49,98 51,104 54,108 C58,98 63,88 68,80 C68,74 66,70 63,67 Z"/>'],
 ['cuff','<path d="M70,74 C76,82 82,92 86,102 C80,104 74,100 70,94 C68,88 68,80 70,74 Z"/>'],
 ['lats','<path d="M66,98 C64,112 66,126 70,140 C76,140 86,134 96,126 L96,120 C88,112 78,104 66,98 Z"/>'],
 ['lowback','<path d="M86,138 C90,136 94,134 98,132 L98,172 C94,172 90,170 86,166 Z"/>'],
 ['arms','<path d="M52,110 C48,118 46,128 46,138 C47,146 50,150 53,150 C57,142 60,132 61,122 C61,114 58,108 52,110 Z"/>'],
 ['grip','<path d="M45,156 C42,168 39,182 38,196 C38,204 41,206 44,202 C48,190 52,176 54,162 C53,155 48,152 45,156 Z"/>'],
 ['gmed','<path d="M68,170 C66,178 66,186 68,192 C72,188 77,182 80,176 C76,172 72,170 68,170 Z"/>'],
 ['glutes','<path d="M98,176 C88,174 78,178 70,188 C66,198 66,210 72,220 C80,226 92,226 98,222 Z"/>'],
 ['hams','<path d="M68,228 C66,246 68,266 74,284 C80,292 90,292 94,286 C96,268 97,248 96,230 C88,232 76,232 68,228 Z"/>'],
 ['calves','<path d="M73,312 C69,326 70,342 75,356 C80,364 88,362 90,354 C92,340 91,326 88,314 C83,308 77,308 73,312 Z"/>']];

const TSH={S:'Str',E:'Easy',H:'Class',T:'Thr',X:'Long',R:'Rest',O:'Own',skip:'Skip'};
const TCOL={S:'var(--k-pink,#E23D9E)',E:'var(--k-green,#14B87A)',H:'var(--k-blue,#5B6CFF)',T:'var(--k-amber,#E8913A)',X:'var(--k-violet,#8B5CF6)',R:'var(--line)',O:'var(--k-green,#14B87A)',skip:'var(--line)'};
const TNM={S:'Strength',E:'Easy run',H:'Hyrox class',T:'Threshold',X:'Speed + long',R:'Rest',O:'Own session',skip:'Skipping'};
const tag=t=>t?`<i class="ktag" style="--c:${TCOL[t]||'var(--line)'}">${TSH[t]||t}</i>`:'';
// ---------- demo: give the made-up squad the new data too ----------
buildDemo=(function(old){return function(){const out=old();const R=rng(777);const T=todayK();
  out.squad.forEach((p,ix)=>{const tp={days:{},changes:{},koachDay:T};const pat=[['S','E','R','T','H','X','R'],['E','S','R','H','E','X','R'],['R','S','E','R','T','R','X']][ix%3];
    for(let i=-7;i<=14;i++){const k=addK(T,i);tp.days[k]=pat[(parse(k).getDay()+6)%7]}
    if(ix%6===1){const k=addK(T,2);tp.changes[k]={was:tp.days[k],type:'R',note:'Away for work'};tp.days[k]='R'}
    if(ix%7===2){const k=addK(T,3);tp.changes[k]={was:'T',type:tp.days[k]=='R'?'T':tp.days[k],note:'Moved from Thursday'}}
    lastN(T,14).forEach((k,j)=>{const d=p.D[k];if(!d)return;
      if(R()<.5)d.hr={type:R()<.7?'wake':'sit',bpm:Math.round(50+R()*8+(ix===6&&k>=addK(T,-1)?8:0)+(ix===14&&j>=11?6:0))};
      if(ix%5===0&&R()<.8)d.blocks={work:Math.round(R()*4*2)/2,driving:Math.round(R()*2*2)/2,physical:Math.round((3+R()*5)*2)/2};
      else if(R()<.6)d.blocks={work:Math.round((6+R()*3)*2)/2,driving:Math.round(R()*1.5*2)/2};
      if(ix%3!==2&&R()<.85)d.supps=[{name:'Creatine',n:1}].concat(ix%4===0?[{name:'Vitamin D',n:1}]:[]).concat(ix===9?[{name:'Magnesium',n:2},{name:'Zinc',n:1}]:[]);
      if(d.food&&R()<.8)d.lastCaf=['10:30','13:00','15:30','17:45'][Math.floor(R()*(ix===18||ix===14?4:3))];
      if((ix===2||ix===8)&&R()<.4)d.mobility=[{name:ix===2?'Hamstring floss':'Calf stretch',min:10}];
      if(ix%4===0&&R()<.3)d.mobility=(d.mobility||[]).concat([{name:'Couch stretch and 90/90',min:12}])});
    const d0=p.D[T];if(d0&&(ix===7||ix===13)){d0.trainIntent='no';tp.days[T]='skip'}
    const i0=d0?(d0.trainIntent==='no'?['Skipping today, as you said.','Easy walk if you feel like it, eat well and bed on time.']:['Good to go for your session.','You\'re well recovered. Enjoy it.']):null;if(i0)tp.koach=i0;
    p.TP=tp;p._di={};p.E=engine(p.D,p.L)});
  return out}})(buildDemo);
// ---------- small helpers ----------
function sdBed(p,k,n){const v=lastN(k,n||14).map(kk=>{const d=p.D[kk];const b=d&&tmin(d.bed);return b==null?null:(b<12*60?b+1440:b)}).filter(x=>x!=null);if(v.length<4)return null;const m=avg(v);return Math.round(Math.sqrt(avg(v.map(x=>(x-m)**2))))}
function hrState(p,k){const rs=[];for(let i=0;i<28;i++){const d=p.D[addK(k,-i)];if(d&&d.hr&&isNum(d.hr.bpm))rs.push({i,t:d.hr.type||'wake',b:+d.hr.bpm})}if(!rs.length)return null;
  const last=rs[0];const same=rs.filter(r=>r.t===last.t&&r.i>=2).map(r=>r.b);if(same.length<3)return {last,usual:null,diff:null};const s=same.slice().sort((a,b)=>a-b);const usual=s[Math.floor(s.length/2)];
  const two=rs.filter(r=>r.t===last.t&&r.i<=1);return {last,usual,diff:last.b-usual,run:two.length>=2&&two.every(r=>r.b-usual>=5)}}
const HRTN={wake:'on waking',lie:'lying down',sit:'sitting'};
function kmWeek(p,k){let km=0;lastN(k,7).forEach(kk=>{const d=p.D[kk];(d&&d.extras||[]).forEach(x=>{if(isNum(x.km))km+=+x.km});const l=p.L[kk];if(l&&isNum(l.dist))km+=+l.dist});return Math.round(km*10)/10}
function mobMin(p,k,n){return lastN(k,n||7).reduce((a,kk)=>{const d=p.D[kk];return a+((d&&d.mobility)||[]).reduce((s,x)=>s+(+x.min||0),0)},0)}
function ownSess(p,k,n){let c=0;lastN(k,n||14).forEach(kk=>{const d=p.D[kk];if(d&&d.trainIntent==='no'&&(d.extras||[]).length)c++;const tp=p.TP&&p.TP.days&&p.TP.days[kk];if(tp==='O')c++});return c}
// ---------- Phase 1/3: flags ----------
flagsFor=(function(old){return function(p,k){const out=old(p,k);const d=p.D[k];
  if(d&&d.trainIntent==='no')out.push({w:3,ic:'clock',col:'var(--muted)',t:'Not training today',s:'Told Keel this morning'});
  const h=hrState(p,k);if(h&&h.run)out.push({w:6,ic:'wellness',col:'var(--alert)',t:`Heart rate up ${h.diff}`,s:`Above their normal ${HRTN[h.last.t]||''} two days running`});
  if(p.TP&&p.TP.changes){const ch=Object.entries(p.TP.changes).filter(([kk])=>kk>=k&&kk<=addK(k,7));if(ch.length)out.push({w:2,ic:'clock',col:'var(--muted)',t:'Changed their week',s:ch.map(([kk,c])=>`${fmtK(kk,{weekday:'short'})}: ${TNM[c.was]||c.was} → ${TNM[c.type]||c.type}`).join(', ')})}
  return out.sort((a,b)=>b.w-a.w)}})(flagsFor);
// ---------- Phase 1: tidier "Each player this week" ----------
viewLoad=(function(old){return function(noKpi){const h=old(noKpi);const parts=h.split('<div class="lrow"><button class="nm"');if(parts.length<=9)return h;
  const head=parts[0],rows=parts.slice(1).map(x=>'<div class="lrow"><button class="nm"'+x);const last=rows[rows.length-1];const cut=last.lastIndexOf('</section>');const tail=last.slice(cut);rows[rows.length-1]=last.slice(0,cut);
  return head+rows.slice(0,8).join('')+`<details class="kmore"><summary>Show all ${rows.length} players</summary>${rows.slice(8).join('')}</details>`+tail}})(viewLoad);
// ---------- S&C: own sessions, distance and real-life load ----------
viewSC=(function(old){return function(){const h=old();const ps=sharing();if(!ps.length)return h;const k=S.k;
  const own=ps.reduce((a,p)=>a+ownSess(p,k,14),0);
  const rows=ps.map(p=>{const km=kmWeek(p,k);let wk=0,dr=0,ph=0,n=0;lastN(k,7).forEach(kk=>{const b=p.D[kk]&&p.D[kk].blocks;if(b){n++;wk+=+b.work||0;dr+=+b.driving||0;ph+=+b.physical||0}});return {p,km,wk,dr,ph,n}});
  const anyB=rows.some(r=>r.n);const anyKm=rows.some(r=>r.km>0);
  const tbl=rows.filter(r=>r.n||r.km>0).sort((a,b)=>(b.ph+b.km/5)-(a.ph+a.km/5)).slice(0,12);
  const life=(anyB||anyKm)?`<section class="card"><header><div><h2>Outside the sessions, last 7 days</h2><p>Running and cycling distance players logged, and hours of physical work and driving from players who share their day. A long day on the farm or site is load too.</p></div></header>
    <div style="overflow-x:auto"><table class="list"><tr><th>Player</th><th>Distance</th><th>Physical work</th><th>Driving</th><th>Desk or other work</th></tr>${tbl.map(r=>`<tr><td><button data-player="${esc(r.p.id)}" style="text-align:left"><b style="color:var(--text)">${esc(r.p.name)}</b></button></td><td class="num">${r.km?r.km+' km':'–'}</td><td class="num">${r.n?Math.round(r.ph)+' h':'–'}</td><td class="num">${r.n?Math.round(r.dr)+' h':'–'}</td><td class="num">${r.n?Math.round(r.wk)+' h':'–'}</td></tr>`).join('')}</table></div></section>`:'';
  const note=own?`<div class="small muted" style="margin:-8px 0 14px">${own} own session${own>1?'s':''} in place of the player's Keel plan in the last 2 weeks. These count as done, not missed.</div>`:'';
  return h.replace(/(<section class="card"><header><div><h2>How sessions are landing)/,note+'$1')+life}})(viewSC);
// ---------- Physio: mobility against niggles ----------
viewPhysio=(function(old){return function(){const h=old();const ps=sharing();if(!ps.length)return h;const k=S.k;
  const rows=ps.map(p=>{const i=dayInfo(p,k);const m7=mobMin(p,k,7),m14=mobMin(p,k,14);const area=i.nig&&i.nig.d.niggles[0]?i.nig.d.niggles[0].area:'';const words=String(area).toLowerCase().split(/[\s/]+/).filter(w=>w.length>3);
    let on=0;lastN(k,14).forEach(kk=>{const d=p.D[kk];((d&&d.mobility)||[]).forEach(x=>{const n=String(x.name||'').toLowerCase();if(words.some(w=>n.includes(w.slice(0,5))))on+=+x.min||0})});return {p,area,pain:i.pain,m7,m14,on}});
  const nig=rows.filter(r=>r.area).sort((a,b)=>b.pain-a.pain);const none=rows.filter(r=>!r.area&&r.m14===0).length;
  return h+`<section class="card"><header><div><h2>Mobility against niggles</h2><p>Stretching and mobility players logged in Keel. A niggle with no mobility work on that area is worth a word. The Mobility lens on S&C › Body map shows the whole squad.</p></div></header>
    ${nig.length?`<div style="overflow-x:auto"><table class="list"><tr><th>Player</th><th>Niggle</th><th>Mobility on that area, 2 weeks</th><th>All mobility, last 7 days</th></tr>${nig.map(r=>`<tr><td><button data-player="${esc(r.p.id)}" style="text-align:left"><b style="color:var(--text)">${esc(r.p.name)}</b></button></td><td>${esc(r.area)} ${painChip(r.pain)}</td><td>${r.on?`<span class="chip good">${r.on} min</span>`:'<span class="chip caution">None logged</span>'}</td><td class="num">${r.m7} min</td></tr>`).join('')}</table></div>`:'<div class="small muted">No active niggles.</div>'}
    <div class="small muted" style="margin-top:8px">${none} of ${rows.length} players logged no mobility at all in the last 2 weeks.</div></section>`}})(viewPhysio);
// ---------- Recovery: sleep debt, consistency, late coffee, heart rate, recovery tools ----------
viewRecovery=(function(old){return function(){const h=old();const ps=sharing();if(!ps.length)return h;const k=S.k;
  const rows=ps.map(p=>{const debt=p.E.debt(k);const sd=sdBed(p,k,14);let late=0;lastN(k,7).forEach(kk=>{const c=p.D[kk]&&p.D[kk].lastCaf;if(c&&tmin(c)>=14*60)late++});const hr=hrState(p,k);
    const tools={};lastN(k,14).forEach(kk=>{const d=p.D[kk]||{};(d.recovery||[]).forEach(x=>tools[x.kind]=(tools[x.kind]||0)+1);(d.hc||[]).forEach(x=>tools[x.type]=(tools[x.type]||0)+1)});
    return {p,debt,sd,late,hr,tools}});
  const score=r=>(r.debt||0)+(r.sd||0)/15+r.late*.8+(r.hr&&r.hr.diff>=5?3:0);rows.sort((a,b)=>score(b)-score(a));
  const sdW=v=>v==null?'–':v<=30?`<span class="chip good">Steady · ±${v} min</span>`:v<=60?`<span class="chip caution">±${v} min</span>`:`<span class="chip alert">All over · ±${v} min</span>`;
  const hrW=x=>!x?'<span class="muted">–</span>':x.usual==null?`${x.last.b} <span class="muted small">${HRTN[x.last.t]||''}</span>`:`<span class="chip ${x.diff>=5?'alert':x.diff>=3?'caution':'good'}">${x.last.b} · ${x.diff>0?'+':''}${x.diff}</span> <span class="muted small">${HRTN[x.last.t]||''}</span>`;
  const tw=Object.entries(rows.reduce((a,r)=>{Object.entries(r.tools).forEach(([t,n])=>a[t]=(a[t]||0)+n);return a},{})).sort((a,b)=>b[1]-a[1]);const users=rows.filter(r=>Object.keys(r.tools).length).length;
  return h+`<section class="card"><header><div><h2>Sleep and heart rate, worst first</h2><p>Sleep debt over 7 nights, how steady bed times are over 2 weeks, coffee after 2pm (players sharing food), and the latest heart rate against that player's own normal for the same kind of reading.</p></div></header>
    <div style="overflow-x:auto"><table class="list"><tr><th>Player</th><th>Sleep debt</th><th>Bed time</th><th>Coffee after 2pm</th><th>Heart rate</th></tr>${rows.slice(0,14).map(r=>`<tr><td><button data-player="${esc(r.p.id)}" style="text-align:left"><b style="color:var(--text)">${esc(r.p.name)}</b></button></td><td>${r.debt!=null?`<span class="chip ${r.debt>=5?'alert':r.debt>=2.5?'caution':'good'}">${r.debt} h</span>`:'–'}</td><td>${sdW(r.sd)}</td><td class="num">${r.late?r.late+' of 7 days':'–'}</td><td>${hrW(r.hr)}</td></tr>`).join('')}</table></div>
    ${rows.length>14?`<div class="small muted" style="margin-top:6px">Showing the 14 most worth a look.</div>`:''}</section>
    <section class="card"><header><div><h2>Recovery tools in use, last 2 weeks</h2><p>${users} of ${rows.length} players logged something.</p></div></header>${tw.length?`<div style="display:flex;gap:8px;flex-wrap:wrap">${tw.map(([t,n])=>`<span class="chip">${esc(t)} · ${n}</span>`).join('')}</div>`:'<div class="small muted">Nothing logged yet.</div>'}</section>`}})(viewRecovery);
// ---------- Nutrition: supplements ----------
viewNutrition=(function(old){return function(){const h=old();const ps=sharing();if(!ps.length)return h;const k=S.k;
  const by={};const who=[];ps.forEach(p=>{const t={};lastN(k,7).forEach(kk=>{const d=p.D[kk];((d&&d.supps)||[]).forEach(s=>{t[s.name]=(t[s.name]||0)+(+s.n||1)})});if(Object.keys(t).length)who.push({p,t});Object.entries(t).forEach(([n,c])=>{(by[n]=by[n]||{n:0,players:0}).n+=c;by[n].players++})});
  if(!who.length)return h+`<section class="card"><header><div><h2>Supplements</h2><p>Nobody shares supplements yet. Players turn on <b>Share my supplements</b> under You › Your team in Keel.</p></div></header></section>`;
  const dbl=who.filter(w=>Object.values(w.t).some(c=>c>7)||(w.t['Zinc']&&w.t['Magnesium']));
  return h+`<section class="card"><header><div><h2>Supplements, last 7 days</h2><p>From players who share them. Worth checking anyone doubling up or taking a lot of minerals, and that everything is batch-tested for sport.</p></div></header>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">${Object.entries(by).sort((a,b)=>b[1].players-a[1].players).map(([n,x])=>`<span class="chip">${esc(n)} · ${x.players} player${x.players>1?'s':''}</span>`).join('')}</div>
    <div style="overflow-x:auto"><table class="list"><tr><th>Player</th><th>Taken this week</th></tr>${who.map(w=>`<tr><td><button data-player="${esc(w.p.id)}" style="text-align:left"><b style="color:var(--text)">${esc(w.p.name)}</b></button>${dbl.includes(w)?' <span class="chip caution">Check doses</span>':''}</td><td class="small">${Object.entries(w.t).map(([n,c])=>`${esc(n)} ×${c}`).join(' · ')}</td></tr>`).join('')}</table></div></section>`}})(viewNutrition);
// ---------- Phase 4: each player's Keel week ----------
function keelWeekCard(ps,start,title,sub){const keys=[];for(let i=0;i<7;i++)keys.push(addK(start,i));const has=ps.filter(p=>p.TP&&p.TP.days);
  if(!has.length)return `<section class="card"><header><div><h2>${title}</h2><p>No one's Keel plan is coming through yet. It appears once players open the updated app and the database step (supabase/share2.sql) has been run.</p></div></header></section>`;
  const T=todayK();
  return `<section class="card"><header><div><h2>${title}</h2><p>${sub}</p></div></header><div style="overflow-x:auto"><table class="list kweek"><tr><th>Player</th>${keys.map(k=>`<th class="${k===T?'kt':''}">${fmtK(k,{weekday:'short'})}<br><span class="muted small">${parse(k).getDate()}</span></th>`).join('')}</tr>
    ${has.sort((a,b)=>a.name.localeCompare(b.name)).map(p=>`<tr><td><button data-player="${esc(p.id)}" style="text-align:left"><b style="color:var(--text)">${esc(p.name)}</b></button></td>${keys.map(k=>{const t=p.TP.days[k];const ch=p.TP.changes&&p.TP.changes[k];return `<td class="${k===T?'kt':''}" ${ch?tipAttr(`<b>${esc(p.name)}</b>${esc(TNM[ch.was]||ch.was)} → ${esc(TNM[ch.type]||ch.type)}${ch.note?'<br>'+esc(ch.note):''}`):''}>${tag(t)}${ch?'<sup class="kch">•</sup>':''}</td>`}).join('')}</tr>`).join('')}</table></div>
    <div class="small muted" style="margin-top:6px">${Object.entries(TSH).filter(([t])=>t!=='skip').map(([t,l])=>`${tag(t)} ${TNM[t]}`).join(' &nbsp; ')} &nbsp; • = moved or changed by the player</div></section>`}
viewCalendar=(function(old){return function(){const h=old();if(HUB.missing)return h;return h+keelWeekCard(sharing(),weekStart(addK(todayK(),(S.calOff||0)*7)),'Players\' own Keel training','What each player\'s Keel plan has them doing outside team sessions this week, so the full load is in one place.')}})(viewCalendar);
viewPlayer=(function(old){return function(id){let h=old(id);const p=SQUAD.find(x=>x.id===id);if(!p||!p.share)return h;const k=S.k;
  const kl=p.TP&&p.TP.koach&&p.TP.koachDay===todayK()?`<section class="card kline"><div class="small muted">What Koach told ${esc(first(p.name))} this morning in Keel</div><b>${esc(p.TP.koach[0])}</b><div class="small">${esc(p.TP.koach[1]||'')}</div></section>`:'';
  const wk=p.TP&&p.TP.days?keelWeekCard([p],weekStart(k),'Their Keel week','From the player\'s own plan in Keel, with any days they moved or cancelled.'):'';
  const hr=hrState(p,k);const sup=(()=>{const t={};lastN(k,7).forEach(kk=>{((p.D[kk]&&p.D[kk].supps)||[]).forEach(s=>t[s.name]=(t[s.name]||0)+(+s.n||1))});return Object.keys(t).length?Object.entries(t).map(([n,c])=>`${esc(n)} ×${c}`).join(' · '):''})();
  const extra=`<section class="card"><header><div><h2>Also from Keel</h2></div></header><div class="small" style="display:grid;gap:6px">
    <div><b>Heart rate:</b> ${hr?`${hr.last.b} bpm ${HRTN[hr.last.t]||''}${hr.usual!=null?` (usual ${hr.usual})`:''}`:'<span class="muted">Not logged</span>'}</div>
    <div><b>Bed times:</b> ${(()=>{const v=sdBed(p,k,14);return v==null?'<span class="muted">Not enough nights</span>':v<=30?'Steady':`Vary by about ±${v} min`})()}</div>
    <div><b>Mobility last 7 days:</b> ${mobMin(p,k,7)} min</div><div><b>Distance last 7 days:</b> ${kmWeek(p,k)||0} km</div>
    ${sup?`<div><b>Supplements this week:</b> ${sup}</div>`:''}</div></section>`;
  const bm=bodyMapPlayer(p);
  return h+kl+wk+extra+bm}})(viewPlayer);
// ---------- Phase 2: body map ----------
const BMX={wk:2,lens:'str',sel:null};
const BM_GYM={quads:1,glutes:1,hams:.8,upback:.8,lats:.6,chest:.6,delts:.5,abs:.6,lowback:.4,arms:.3};
function bmPlayer(p,k,wks){const hits={},mob={};BM_M.forEach(([m])=>{hits[m]=0;mob[m]=0});const from=addK(k,-wks*7+1);
  const credit=(sess,m,f)=>Object.entries(m).forEach(([q,v])=>{if(q in hits)sess[q]=(sess[q]||0)+v*f});const flush=s=>Object.entries(s).forEach(([q,v])=>hits[q]+=Math.min(v,1.5));
  for(let kk=from;kk<=k;kk=addK(kk,1)){const l=p.L[kk],d=p.D[kk]||{};
    if(l&&l.status&&l.status!=='missed'){const f=l.status==='partial'?.6:1;const s={};if(l.type==='S')credit(s,BM_GYM,f);else if(l.type==='H')credit(s,BM_G.hyrox.t,.35*f);else credit(s,BM_RUN,f);flush(s)}
    (d.extras||[]).forEach(x=>{const s={};const f=Math.min((+x.dur||60)/75,1.3);
      if(x.sc){const a=(SC.assigns||[]).find(z=>z.id===x.sc);let names=[];if(a){const pos=progPos(a,kk);const dow=(parse(kk).getDay()+6)%7+1;const day=pos&&pos.week&&(pos.week.days||[]).find(z=>z.dow===dow);names=((day&&day.items)||[]).map(it=>((SC.ex||[]).find(e=>e.id===it.ex)||{}).name).filter(Boolean)}
        if(names.length)names.forEach(nm=>{const tg=bmTag(nm);if(tg)credit(s,tg.m,1)});else credit(s,BM_GYM,.8)}
      else if(x.kind==='Club training'||x.kind==='Match')credit(s,BM_FIELD,f);else if(x.kind==='Run')credit(s,BM_RUN,f);else if(x.kind==='Gym')credit(s,BM_GYM,f);else credit(s,BM_GYM,.3);flush(s)});
    if(isNum(d.farm)&&d.farm>=3){const s={};credit(s,BM_FARM,1);flush(s)}
    if(d.blocks&&+d.blocks.physical>=3){const s={};credit(s,BM_FARM,.7);flush(s)}
    (d.mobility||[]).forEach(x=>{let hit=false;BM_MOB.forEach(([re,ms])=>{if(re.test(x.name||'')){hit=true;ms.forEach(m=>mob[m]+=1/ms.length*1.5)}});if(!hit)BM_MOBALL.forEach(m=>mob[m]+=.3)});
    (d.recovery||[]).forEach(x=>{if(/stretch|yoga|foam/i.test(x.kind||''))BM_MOBALL.forEach(m=>mob[m]+=.3)})}
  return BM_M.map(([m,nm,rg,base])=>{const t=Math.max(base,(BM_G.gaa.t[m]||0));const pw=hits[m]/wks,mw=mob[m]/wks;return {m,nm,rg,t,pw,mw,r:pw/t,mr:mw/2}})}
const BMC={neg:'#E5534B',light:'#E8A33D',ok:'#3FB98A'};
const bmSt=r=>r<.4?'neg':r<.8?'light':'ok';
function bmFigC(parts,col,lbl){const sh=parts.map(([k,svg])=>`<g class="bm2m${BMX.sel===k?' on':''}" data-bmx="${k}" style="--mc:${col[k]}">${svg}</g>`).join('');
  return `<figure class="bm2fig"><svg viewBox="28 6 144 426" role="img" aria-label="${lbl} of the body"><path class="bm2body" d="${BM2_BODY_F}"/>${sh}<g transform="translate(200,0) scale(-1,1)">${sh}</g></svg><figcaption>${lbl}</figcaption></figure>`}
function bmHero(rowsByM,col,summary,card){return `<section class="bm2hero"><div class="bm2sum">${summary}</div><div class="bm2figs">${bmFigC(BM2_F,col,'Front')}${bmFigC(BM2_B,col,'Back')}</div>${card}</section>`}
function viewBodyMap(){const ps=sharing();if(!ps.length)return needTeam();const k=S.k;const mobL=BMX.lens==='mob';
  const per=ps.map(p=>({p,rows:bmPlayer(p,k,BMX.wk)}));
  const sq=BM_M.map(([m,nm])=>{const xs=per.map(x=>{const r=x.rows.find(z=>z.m===m);return {p:x.p,r:mobL?r.mr:r.r,pw:mobL?r.mw:r.pw}});const r=avg(xs.map(x=>Math.min(x.r,1.3)));return {m,nm,r,st:bmSt(r),low:xs.slice().sort((a,b)=>a.r-b.r).slice(0,6),cov:xs.filter(x=>x.r>=.8).length,n:xs.length}});
  const col={};sq.forEach(x=>col[x.m]=BMC[x.st]);const cnt=s=>sq.filter(x=>x.st===s).length;
  const L=mobL?['not stretched','a little','covered']:['neglected','light','covered'];
  const summary=`<span style="--c:${BMC.neg}">${cnt('neg')} ${L[0]}</span><span style="--c:${BMC.light}">${cnt('light')} ${L[1]}</span><span style="--c:${BMC.ok}">${cnt('ok')} ${L[2]}</span>`;
  const sel=sq.find(x=>x.m===BMX.sel);
  const card=sel?`<div class="bm2card" style="--c:${BMC[sel.st]}"><div class="bm2ch"><b>${esc(sel.nm)}</b><em>${sel.cov} of ${sel.n} players ${mobL?'stretching it enough':'covering it'}</em><button class="x" data-bmx="" aria-label="Close">×</button></div>
     <div class="bm2meter"><span style="width:${Math.min(100,sel.r*100)}%"></span></div><div class="bm2cs">Least ${mobL?'mobility':'work'} on it:</div><div class="bm2who">${sel.low.map(x=>`<button data-player="${esc(x.p.id)}">${esc(x.p.name)} <small>${x.pw.toFixed(1)}/wk</small></button>`).join('')}</div></div>`
    :`<div class="bm2tap">Tap a muscle to see who's missing it</div>`;
  const ctl=`<div class="toolbar">${['1','2','4','8'].map(w=>`<button class="btn ghost sm" data-bmxwk="${w}" aria-pressed="${BMX.wk==w}">${w==1?'1 week':w==4?'1 month':w==8?'2 months':'2 weeks'}</button>`).join('')}<span style="flex:1"></span><button class="btn ghost sm" data-bmxlens="str" aria-pressed="${!mobL}">Strength</button><button class="btn ghost sm" data-bmxlens="mob" aria-pressed="${mobL}">Mobility</button></div>`;
  const list=sq.slice().sort((a,b)=>a.r-b.r).map(x=>`<button class="bm2row${BMX.sel===x.m?' on':''}" data-bmx="${x.m}"><i style="background:${BMC[x.st]}"></i><b>${esc(x.nm)}</b><span class="bm2bar"><span style="width:${Math.min(100,x.r*100)}%;background:${BMC[x.st]}"></span></span><em>${x.cov}/${x.n}</em></button>`).join('');
  return `<section class="card"><header><div><h2>Squad body map</h2><p>${mobL?'Stretching and mobility each muscle gets across the squad, against 2 or more times a week.':'How much work each muscle gets across the squad, from Keel sessions, club training, matches, your S&C programmes and heavy work days. Judged for GAA football.'} Tap a muscle for the players missing it.</p></div></header>${ctl}
    <div class="bmgrid">${bmHero(sq,col,summary,card)}<div class="bmlist"><div class="small muted" style="margin-bottom:6px">Weakest first · players covering it</div>${list}</div></div></section>`}
function bodyMapPlayer(p){const k=S.k;const rows=bmPlayer(p,k,2);const col={};rows.forEach(r=>col[r.m]=BMC[bmSt(r.r)]);const low=rows.filter(r=>r.r<.4).map(r=>r.nm);
  return `<section class="card"><header><div><h2>Body map, last 2 weeks</h2><p>${low.length?'Neglected: '+esc(low.slice(0,6).join(', ')):'Everything is getting some work.'}</p></div></header><div style="max-width:420px">${bmHero(rows,col,'','')}</div></section>`}
document.addEventListener('click',e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(x=c('[data-bmxwk]')){BMX.wk=+x.dataset.bmxwk;render();return}
  if(x=c('[data-bmxlens]')){BMX.lens=x.dataset.bmxlens;render();return}
  if((x=c('[data-bmx]'))&&!c('[data-player]')){const m=x.dataset.bmx;BMX.sel=m&&BMX.sel!==m?m:null;const y=window.scrollY;render();window.scrollTo(0,y)}});

// ================= GPS (STATSports and other trackers) =================
// Import: STATSports Apex session summary CSV (one row per player), or a raw trace (CSV with lat/lon or x/y, or GPX)
// for one player. Traces are boiled down here: headline numbers, a 5 m heat-map grid and sprint lines. Stored in team_gps.
const GPS={rows:[],missing:false,loaded:false,tab:'sessions',sess:null,pl:null,hm:{scope:'session',who:'all',layer:'all',sess:null,weeks:4},imp:null,ai:null,aiBusy:false};
const PW=145,PH=90,GC=5,GW=Math.ceil(PW/GC),GH=Math.ceil(PH/GC);
const HSR_KMH=19.8,SPR_KMH=25.2;
const GM=[['dist','Distance','m',0],['hsr','High-speed running','m',0],['sprint','Sprint distance','m',0],['acc','Accelerations','',0],['dec','Decelerations','',0],['vmax','Top speed','km/h',1],['mpm','Metres per minute','',0],['dur','Minutes','',0]];
const gnum=v=>v==null||isNaN(v)?null:+v;
async function loadGPS(t){GPS.missing=false;GPS.loaded=true;
  if(t.team_id===DEMO_ID){GPS.rows=buildDemoGPS();return}
  try{const out=[];for(let off=0;off<20000;off+=1000){const {data,error}=await sb.from('team_gps').select('id,player_id,day,session,kind,metrics,heat,sprints,source').eq('team_id',t.team_id).gte('day',addK(todayK(),-400)).order('day',{ascending:false}).range(off,off+999);if(error)throw error;out.push(...(data||[]));if(!data||data.length<1000)break}
    GPS.rows=out.map(r=>({...r,day:String(r.day).slice(0,10),m:r.metrics||{}}))}catch(e){GPS.rows=[];GPS.missing=/team_gps|relation|schema/i.test(String(e&&e.message))}}
loadSquad=(function(old){return async function(t){await old(t);try{await loadGPS(t)}catch(e){GPS.missing=true}}})(loadSquad);
// ---------- maths ----------
function gpsSessions(){const m={};GPS.rows.forEach(r=>{const k=r.day+'|'+r.session;(m[k]=m[k]||{key:k,day:r.day,session:r.session,kind:r.kind,rows:[]}).rows.push(r)});return Object.values(m).sort((a,b)=>b.day.localeCompare(a.day)||a.session.localeCompare(b.session))}
const gRowsOf=pid=>GPS.rows.filter(r=>r.player_id===pid).sort((a,b)=>a.day.localeCompare(b.day));
function gSum(rows,key){return rows.reduce((a,r)=>a+(+r.m[key]||0),0)}
function gWeek(pid,k){const from=addK(k,-6);return GPS.rows.filter(r=>r.player_id===pid&&r.day>=from&&r.day<=k)}
function gAcwr(pid,k,key){const a=gSum(gWeek(pid,k),key);let c=0;for(let w=0;w<4;w++)c+=gSum(gWeek(pid,addK(k,-7*w)),key);c/=4;return c>0?a/c:null}
function gBest(pid,key,uptoK){const v=GPS.rows.filter(r=>r.player_id===pid&&(!uptoK||r.day<=uptoK)).map(r=>+r.m[key]||0);return v.length?Math.max(...v):null}
function gUsual(pid,key,kind,beforeK){const v=GPS.rows.filter(r=>r.player_id===pid&&r.kind===kind&&r.day<beforeK&&r.day>=addK(beforeK,-28)).map(r=>+r.m[key]).filter(x=>isNum(x));return v.length?avg(v):null}
// ---------- turning a raw trace into numbers + heat map ----------
function traceToPitch(pts){// pts: [{t(s),x,y(m) or lat,lon, v(m/s)?}]
  if(pts.length&&pts[0].lat!=null){const la0=avg(pts.map(p=>p.lat)),lo0=avg(pts.map(p=>p.lon));const kx=111320*Math.cos(la0*Math.PI/180),ky=110540;pts.forEach(p=>{p.x=(p.lon-lo0)*kx;p.y=(p.lat-la0)*ky})}
  // line the long axis of the movement up with the pitch, then fit the middle 98% of points to 145 x 90 m
  const mx=avg(pts.map(p=>p.x)),my=avg(pts.map(p=>p.y));let sxx=0,syy=0,sxy=0;pts.forEach(p=>{const dx=p.x-mx,dy=p.y-my;sxx+=dx*dx;syy+=dy*dy;sxy+=dx*dy});const ang=.5*Math.atan2(2*sxy,sxx-syy);const ca=Math.cos(-ang),sa=Math.sin(-ang);
  pts.forEach(p=>{const dx=p.x-mx,dy=p.y-my;p.u=dx*ca-dy*sa;p.w=dx*sa+dy*ca});
  const q=(a,f)=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.max(0,Math.min(s.length-1,Math.floor(f*(s.length-1))))]};
  const u0=q(pts.map(p=>p.u),.01),u1=q(pts.map(p=>p.u),.99),w0=q(pts.map(p=>p.w),.01),w1=q(pts.map(p=>p.w),.99);
  const su=Math.max(u1-u0,1),sw=Math.max(w1-w0,1);const fit=Math.min(PW/su,PH/sw,1.15);// a whole-pitch session fills it; a small drill stays small
  const cu=(u0+u1)/2,cw=(w0+w1)/2;pts.forEach(p=>{p.px=Math.max(0,Math.min(PW,PW/2+(p.u-cu)*fit));p.py=Math.max(0,Math.min(PH,PH/2+(p.w-cw)*fit))});return pts}
function traceMetrics(raw){const pts=raw.filter(p=>isNum(p.t)).sort((a,b)=>a.t-b.t);if(pts.length<20)return null;
  // speed from positions when the file has none
  for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];if(!isNum(b.v)){const dt=b.t-a.t||.1;b.v=Math.hypot((b.x||0)-(a.x||0),(b.y||0)-(a.y||0))/dt}}if(!isNum(pts[0].v))pts[0].v=0;
  // smooth speed a little (GPS noise)
  const sv=pts.map((p,i)=>{let s=0,n=0;for(let j=Math.max(0,i-2);j<=Math.min(pts.length-1,i+2);j++){s+=pts[j].v;n++}return s/n});pts.forEach((p,i)=>p.vs=Math.min(sv[i],11.5));
  let dist=0,hsr=0,spr=0,acc=0,dec=0,vmax=0,hr=[],inA=false,inD=false;const all=new Array(GW*GH).fill(0),hs=new Array(GW*GH).fill(0);const sprints=[];let sp=null;
  for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];const dt=Math.min(b.t-a.t,2);if(dt<=0)continue;const d=b.vs*dt;dist+=d;const kmh=b.vs*3.6;if(kmh>=HSR_KMH)hsr+=d;if(kmh>=SPR_KMH)spr+=d;if(kmh>vmax)vmax=kmh;
    const ac=(b.vs-a.vs)/dt;if(ac>=3&&!inA){acc++;inA=true}else if(ac<1)inA=false;if(ac<=-3&&!inD){dec++;inD=true}else if(ac>-1)inD=false;if(isNum(b.hr))hr.push(+b.hr);
    const gx=Math.min(GW-1,Math.floor(b.px/GC)),gy=Math.min(GH-1,Math.floor(b.py/GC));all[gy*GW+gx]+=dt;if(kmh>=HSR_KMH)hs[gy*GW+gx]+=dt;
    if(kmh>=SPR_KMH){if(!sp){sp=[a.px,a.py,b.px,b.py,kmh];sp.len=d}else{sp[2]=b.px;sp[3]=b.py;sp[4]=Math.max(sp[4],kmh);sp.len+=d}}else if(sp){if(sp.len>=8)sprints.push(sp.slice(0,5).map(x=>Math.round(x*10)/10));sp=null}}
  const dur=(pts[pts.length-1].t-pts[0].t)/60;
  return {m:{dist:Math.round(dist),hsr:Math.round(hsr),sprint:Math.round(spr),acc,dec,vmax:Math.round(vmax*10)/10,dur:Math.round(dur),mpm:dur?Math.round(dist/dur):null,hr:hr.length?Math.round(avg(hr)):null},
    heat:{w:GW,h:GH,all:all.map(v=>Math.round(v)),hsr:hs.map(v=>Math.round(v))},sprints:sprints.slice(0,80)}}
// ---------- file reading ----------
function csvRows(txt){const lines=txt.replace(/\r/g,'').split('\n').filter(l=>l.trim());if(!lines.length)return [];const sep=(lines[0].match(/;/g)||[]).length>(lines[0].match(/,/g)||[]).length?';':(lines[0].includes('\t')?'\t':',');
  const split=l=>{const out=[];let cur='',q=false;for(const ch of l){if(ch==='"'){q=!q;continue}if(ch===sep&&!q){out.push(cur);cur='';continue}cur+=ch}out.push(cur);return out.map(s=>s.trim())};
  // STATSports exports can start with a few lines of title text: find the header row
  let hi=0;for(let i=0;i<Math.min(lines.length,15);i++){const c=split(lines[i]);if(c.length>=4&&c.some(x=>/player|athlete|name|lat|time/i.test(x))){hi=i;break}}
  const head=split(lines[hi]);return lines.slice(hi+1).map(l=>{const c=split(l);const o={};head.forEach((h,i)=>o[h]=c[i]);return o}).filter(o=>Object.values(o).some(v=>v))}
const GCOLS=[['player',/^(player|athlete)( ?name)?$|^name$|player display name/i],['date',/^(session )?date$|^date$|start date/i],['session',/session (title|name)|^session$|drill( title)?|activity/i],
  ['dist',/total distance|^distance( \(m\))?$/i],['hsr',/high speed running(?! .*%| .*per)|^hsr( distance)?( \(m\))?$|hsr \(abs/i],['sprint',/sprint distance|^sprint( \(m\))?$/i],['acc',/^accel(eration)?s?( count)?$|accelerations(?! .*zone)/i],
  ['dec',/^decel(eration)?s?( count)?$|decelerations(?! .*zone)/i],['vmax',/max(imum)? speed|top speed|vmax/i],['dur',/duration|total time|^time$/i],['dsl',/dynamic stress load|^dsl$/i],['hmld',/hml distance|^hmld$/i],['hr',/av(era)?g(e)? (heart rate|hr)|hr avg/i]];
function gTime(v){if(v==null||v==='')return null;const s=String(v);if(/^\d+:\d{2}(:\d{2})?$/.test(s)){const p=s.split(':').map(Number);return p.length===3?p[0]*60+p[1]+p[2]/60:p[0]+p[1]/60}const n=parseFloat(s);return isNaN(n)?null:n}
function gDate(v){if(!v)return null;const s=String(v).trim();let m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return m[1]+'-'+m[2]+'-'+m[3];m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);if(m){const y=m[3].length===2?'20'+m[3]:m[3];return `${y}-${pad(+m[2])}-${pad(+m[1])}`}const d=new Date(s);return isNaN(d)?null:iso(d)}
const nrm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z ]/g,' ').replace(/\s+/g,' ').trim();
function matchPlayer(name){const n=nrm(name);if(!n)return null;const ps=allPlayers();let p=ps.find(x=>nrm(x.name)===n);if(p)return p.id;const parts=n.split(' ');
  p=ps.find(x=>{const q=nrm(x.name).split(' ');return q[q.length-1]===parts[parts.length-1]&&q[0][0]===parts[0][0]});if(p)return p.id;p=ps.filter(x=>nrm(x.name).includes(parts[parts.length-1]));return p.length===1?p[0].id:null}
function parseSummary(txt){const rows=csvRows(txt);if(!rows.length)return {err:'No rows found in that file.'};const head=Object.keys(rows[0]);const map={};GCOLS.forEach(([k,re])=>{const h=head.find(x=>re.test(x));if(h)map[k]=h});
  if(!map.player)return {err:'Could not find a player name column. Export the session summary from STATSports Apex with one row per player.'};if(!map.dist&&!map.hsr)return {err:'Could not find distance columns in that file.'};
  const out=rows.map(r=>{const m={};['dist','hsr','sprint','acc','dec','vmax','dsl','hmld','hr'].forEach(k=>{if(map[k]){const v=parseFloat(String(r[map[k]]).replace(/,/g,''));if(!isNaN(v))m[k]=v}});
    if(map.dur)m.dur=Math.round(gTime(r[map.dur])||0)||null;if(m.vmax!=null&&m.vmax<15)m.vmax=Math.round(m.vmax*3.6*10)/10;if(m.dist&&m.dur)m.mpm=Math.round(m.dist/m.dur);
    return {name:r[map.player],pid:matchPlayer(r[map.player]),day:gDate(map.date&&r[map.date]),session:(map.session&&r[map.session])||'',m}}).filter(x=>x.name);
  return {rows:out,cols:map}}
function parseTrace(txt,fname){let pts=[];if(/<gpx|<trkpt/i.test(txt)){const re=/<trkpt[^>]*lat="([-\d.]+)"[^>]*lon="([-\d.]+)"[^>]*>([\s\S]*?)<\/trkpt>/g;let m,t0=null;while((m=re.exec(txt))){const tm=(m[3].match(/<time>([^<]+)<\/time>/)||[])[1];const t=tm?Date.parse(tm)/1000:null;if(t0==null&&t!=null)t0=t;const hr=(m[3].match(/<(?:gpxtpx:)?hr>(\d+)</)||[])[1];pts.push({lat:+m[1],lon:+m[2],t:t!=null?t-t0:pts.length,hr:hr?+hr:null})}}
  else{const rows=csvRows(txt);if(!rows.length)return {err:'No rows in that file.'};const h=Object.keys(rows[0]);const f=re=>h.find(x=>re.test(x));
    const cLat=f(/^lat(itude)?$/i),cLon=f(/^lon(g(itude)?)?$/i),cX=f(/^x( ?\(m\))?$|pos(ition)? ?x/i),cY=f(/^y( ?\(m\))?$|pos(ition)? ?y/i),cT=f(/^(time|timestamp|seconds|elapsed)/i),cV=f(/speed|velocity/i),cH=f(/heart|^hr$/i);
    if(!((cLat&&cLon)||(cX&&cY)))return {err:'That file has no lat/lon or x/y columns.'};let t0=null;
    rows.forEach((r,i)=>{let t=r[cT];let ts=null;if(t!=null&&t!==''){if(/^\d+(\.\d+)?$/.test(t))ts=+t;else if(/:/.test(t)&&!/T|-/.test(t)){ts=gTime(t)*60}else{const d=Date.parse(t);ts=isNaN(d)?null:d/1000}}if(ts==null)ts=i*.1;if(t0==null)t0=ts;
      const p={t:ts-t0,hr:cH?+r[cH]:null};if(cLat){p.lat=+r[cLat];p.lon=+r[cLon]}else{p.x=+r[cX];p.y=+r[cY]}if(cV){let v=parseFloat(r[cV]);if(!isNaN(v)){if(/km/i.test(cV))v/=3.6;p.v=v}}if((p.lat!=null&&!isNaN(p.lat))||(p.x!=null&&!isNaN(p.x)))pts.push(p)});
    if(pts.length>2&&pts[pts.length-1].t>36000)pts.forEach(p=>p.t/=1000)}// milliseconds
  if(pts.length<20)return {err:'Not enough points in that file.'};
  // 10 Hz is more than needed: keep about 2 points a second
  const step=Math.max(1,Math.round(pts.length/((pts[pts.length-1].t||pts.length)*2)));const thin=pts.filter((_,i)=>i%step===0);traceToPitch(thin);const r=traceMetrics(thin);return r?{...r,name:(fname||'').replace(/\.[a-z]+$/i,'')}:{err:'Could not read the movement in that file.'}}
async function gpsSave(rows){if(isDemo()){rows.forEach(r=>{GPS.rows=GPS.rows.filter(x=>!(x.player_id===r.player_id&&x.day===r.day&&x.session===r.session));GPS.rows.unshift({...r,id:'dg'+Math.random(),m:r.metrics})});return true}
  const body=rows.map(r=>({team_id:TEAM.team_id,player_id:r.player_id,day:r.day,session:r.session,kind:r.kind,metrics:r.metrics,heat:r.heat||null,sprints:r.sprints||null,source:r.source}));
  const {error}=await sb.from('team_gps').upsert(body,{onConflict:'team_id,player_id,day,session'});if(error){toast('Could not save: '+error.message,5000);return false}await loadGPS(TEAM);return true}
// ---------- pitch + heat map drawing ----------
function pitchSVG(inner,o){o=o||{};const W=o.w||580,H=Math.round(W*PH/PW);const s=W/PW;
  const L=(x1,y1,x2,y2)=>`<line x1="${x1*s}" y1="${y1*s}" x2="${x2*s}" y2="${y2*s}"/>`;const mk=[13,20,45].flatMap(d=>[L(d,0,d,PH),L(PW-d,0,PW-d,PH)]).join('')+L(PW/2,PH/2-5,PW/2,PH/2+5);
  const box=(x,dir)=>`<rect x="${(dir>0?x:x-4.5)*s}" y="${(PH/2-3.25)*s}" width="${4.5*s}" height="${6.5*s}"/><rect x="${(dir>0?x:x-13)*s}" y="${(PH/2-9.5)*s}" width="${13*s}" height="${19*s}"/><path d="M${(x+dir*20)*s},${(PH/2-13)*s} A${13*s},${13*s} 0 0 ${dir>0?1:0} ${(x+dir*20)*s},${(PH/2+13)*s}"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="gpitch" role="img" aria-label="${esc(o.label||'Pitch')}"><defs><filter id="gblur${o.id||''}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${7*s}"/></filter></defs>
    <rect class="gturf" x="0" y="0" width="${W}" height="${H}" rx="6"/>${inner}<g class="glines">${mk}${box(0,1)}${box(PW,-1)}<rect x="0" y="0" width="${W}" height="${H}" fill="none" rx="6"/></g>
    ${o.arrow?`<text x="${W-8}" y="${H-8}" text-anchor="end" class="gdir">Attacking →</text>`:''}</svg>`}
function heatLayer(grids,layer,o){o=o||{};const s=(o.w||580)/PW;const sum=new Array(GW*GH).fill(0);grids.forEach(g=>{const a=g&&(layer==='hsr'?g.hsr:g.all);if(a)a.forEach((v,i)=>sum[i]+=v)});const mx=Math.max(1,...sum);
  const col=v=>{const t=Math.sqrt(v/mx);const st=[[0,[40,90,255]],[.35,[40,220,200]],[.6,[250,220,60]],[.85,[255,120,40]],[1,[230,30,60]]];let a=st[0],b=st[st.length-1];for(let i=1;i<st.length;i++)if(t<=st[i][0]){a=st[i-1];b=st[i];break}const f=(t-a[0])/((b[0]-a[0])||1);return `rgb(${a[1].map((c,j)=>Math.round(c+(b[1][j]-c)*f)).join(',')})`};
  let out='';sum.forEach((v,i)=>{if(v<=0)return;const x=i%GW,y=Math.floor(i/GW);out+=`<rect x="${x*GC*s}" y="${y*GC*s}" width="${GC*s+1}" height="${GC*s+1}" fill="${col(v)}" fill-opacity="${Math.min(.92,.25+.7*Math.sqrt(v/mx))}"/>`});
  return `<g filter="url(#gblur${o.id||''})">${out}</g>`}
function sprintLayer(rows,o){const s=(o&&o.w||580)/PW;let out='';rows.forEach(r=>(r.sprints||[]).forEach(([x1,y1,x2,y2,v])=>{out+=`<line class="gspr" x1="${x1*s}" y1="${y1*s}" x2="${x2*s}" y2="${y2*s}" marker-end="url(#garr)"><title>${Math.round(v)} km/h</title></line>`}));
  return `<defs><marker id="garr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#fff"/></marker></defs><g>${out}</g>`}
// ---------- views ----------
const gChip=(v,u)=>{if(v==null)return '<span class="muted">–</span>';const pc=Math.round(v*100);return `<span class="chip ${v>1.3?'alert':v>1.15?'caution':v<.7?'':'good'}">${pc}%</span>`};
const gfx=(v,d)=>v==null||v===''?'–':(d?(+v).toFixed(1):Math.round(+v).toLocaleString('en-IE'));
function gpsTabs(){return `<div class="toolbar"><div class="seg">${[['sessions','Sessions'],['players','Players'],['heat','Heat maps'],['patterns','Patterns and Koach'],['import','Import']].map(([v,l])=>`<a href="#gps/${v}" aria-pressed="${GPS.tab===v}" class="segl">${l}</a>`).join('')}</div></div>`}
function viewGPS(){GPS.tab=route().id||GPS.tab||'sessions';if(GPS.missing)return gpsTabs()+`<section class="card"><header><div><h2>One database step for GPS</h2><p>GPS sessions need their own table.</p></div></header><ol class="steps"><li>Open Supabase › SQL Editor › New query.</li><li>Paste in everything from <b>supabase/gps.sql</b> and click Run.</li><li>Refresh this page.</li></ol></section>`;
  if(!GPS.rows.length&&GPS.tab!=='import')return gpsTabs()+`<section class="card"><div class="empty"><h2>No GPS yet</h2><p style="margin:6px 0 12px">Export a session from STATSports Apex (session summary, one row per player) and drop it in on Import. Raw traces (CSV or GPX) give heat maps and sprint lines too.</p><a class="btn" href="#gps/import">Import GPS</a></div></section>`;
  return gpsTabs()+({sessions:gpsSessionsView,players:gpsPlayersView,heat:gpsHeatView,patterns:gpsPatternsView,import:gpsImportView}[GPS.tab]||gpsSessionsView)()}
function gpsSessionsView(){const ss=gpsSessions();const cur=ss.find(x=>x.key===GPS.sess)||ss[0];GPS.sess=cur.key;const P=id=>SQUAD.find(p=>p.id===id);
  const rows=cur.rows.map(r=>{const p=P(r.player_id);const us=k=>gUsual(r.player_id,k,r.kind,r.day);const best=gBest(r.player_id,'vmax',r.day);return {r,p,hsrVs:us('hsr')?r.m.hsr/us('hsr'):null,distVs:us('dist')?r.m.dist/us('dist'):null,vpc:best&&r.m.vmax?r.m.vmax/best:null}}).sort((a,b)=>(+b.r.m.hsr||0)-(+a.r.m.hsr||0));
  const A=k=>avgOf(cur.rows.map(r=>isNum(r.m[k])?+r.m[k]:null));
  const sel=`<select class="sel" id="gSess">${ss.map(x=>`<option value="${esc(x.key)}" ${x.key===cur.key?'selected':''}>${esc(fmtK(x.day,{weekday:'short',day:'numeric',month:'short'}))} · ${esc(x.session)} (${x.rows.length})</option>`).join('')}</select>`;
  const mx=Math.max(1,...rows.map(x=>+x.r.m.hsr||0));
  return kpiRow([kpiTile(gfx(A('dist')),'Average distance (m)',{ic:'load'}),kpiTile(gfx(A('hsr')),'Average high-speed running (m)',{ic:'spike',d:`Above ${HSR_KMH} km/h`}),kpiTile(gfx(A('sprint')),'Average sprint distance (m)',{ic:'zap',d:`Above ${SPR_KMH} km/h`}),kpiTile(gfx(A('vmax'),1),'Average top speed (km/h)',{ic:'trends'}),kpiTile(rows.filter(x=>x.hsrVs!=null&&x.hsrVs>1.3).length,'Well above their usual HSR',{ic:'spike',col:'var(--alert)',d:'Over 130% of their own 4-week average'})])
   +`<section class="card"><header style="flex-wrap:wrap"><div><h2>${esc(cur.session)}</h2><p>${esc(fmtK(cur.day,{weekday:'long',day:'numeric',month:'long'}))} · ${esc(cur.kind)} · ${cur.rows.length} players. "Vs usual" compares with that player's own average for the same kind of session over the 4 weeks before. Top speed is shown against their best ever.</p></div><div class="toolbar">${sel}</div></header>
   <div style="overflow-x:auto"><table class="list gtable"><tr><th>Player</th><th>Distance</th><th>Vs usual</th><th>HSR</th><th>Vs usual</th><th style="min-width:110px"></th><th>Sprint</th><th>Acc / Dec</th><th>Top speed</th><th>m/min</th><th>Min</th></tr>
   ${rows.map(({r,p,hsrVs,distVs,vpc})=>`<tr><td><button data-player="${esc(r.player_id)}" style="text-align:left"><b style="color:var(--text)">${esc(p?p.name:'Unknown')}</b><br><span class="tiny muted">${esc(p&&p.pos||'')}</span></button></td><td class="num">${gfx(r.m.dist)}</td><td>${gChip(distVs)}</td><td class="num"><b>${gfx(r.m.hsr)}</b></td><td>${gChip(hsrVs)}</td><td><div class="gbar"><i style="width:${(+r.m.hsr||0)/mx*100}%"></i></div></td><td class="num">${gfx(r.m.sprint)}</td><td class="num">${gfx(r.m.acc)} / ${gfx(r.m.dec)}</td><td class="num">${gfx(r.m.vmax,1)} ${vpc!=null?`<span class="tiny ${vpc>=.95?'gok':'muted'}">${Math.round(vpc*100)}%</span>`:''}</td><td class="num">${gfx(r.m.mpm)}</td><td class="num">${gfx(r.m.dur)}</td></tr>`).join('')}</table></div></section>
   ${cur.rows.some(r=>r.heat)?`<section class="card"><header><div><h2>Where the squad played</h2><p>Time spent on each part of the pitch, every player together. Open Heat maps for one player, a line or high-speed running only.</p></div></header><div class="gpwrap">${pitchSVG(heatLayer(cur.rows.map(r=>r.heat),'all',{id:'s'}),{id:'s',arrow:true})}</div></section>`:''}`}
function gpsPlayersView(){const ps=allPlayers().filter(p=>GPS.rows.some(r=>r.player_id===p.id)).sort((a,b)=>a.name.localeCompare(b.name));if(!ps.length)return '';const p=ps.find(x=>x.id===GPS.pl)||ps[0];GPS.pl=p.id;return `<div class="toolbar"><select class="sel" id="gPl">${ps.map(x=>`<option value="${esc(x.id)}" ${x.id===p.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div>`+gpsPlayerBlock(p,true)}
function gpsPlayerBlock(p,full){const k=todayK();const rs=gRowsOf(p.id);if(!rs.length)return '';
  const weeks=[];for(let w=11;w>=0;w--){const end=addK(k,-7*w);const wr=gWeek(p.id,end);weeks.push({k:end,lab:fmtK(addK(end,-6),{day:'numeric',month:'short'}),y:gSum(wr,'hsr'),d:gSum(wr,'dist'),il:p.E?p.E.load7(end):null})}
  const vm=rs.filter(r=>isNum(r.m.vmax)).slice(-20).map(r=>({k:r.day,lab:fmtK(r.day,{day:'numeric',month:'short'}),y:+r.m.vmax}));const a=gAcwr(p.id,k,'hsr'),ad=gAcwr(p.id,k,'dist');const best=gBest(p.id,'vmax');
  const recent=rs.slice(-8).reverse();const last4=rs.filter(r=>r.day>=addK(k,-28)&&r.heat);
  // external (GPS) vs internal (Keel minutes x effort) per week: a rising ratio means the same running is costing them more
  const ratio=weeks.filter(w=>w.d&&w.il).map(w=>({k:w.k,lab:w.lab,y:Math.round(w.il/(w.d/1000))}));
  return kpiRow([kpiTile(gfx(gSum(gWeek(p.id,k),'hsr')),'HSR, last 7 days (m)',{ic:'spike'}),kpiTile(a!=null?Math.round(a*100)+'<small>%</small>':'–','HSR against usual week',{ic:'load',col:a>1.5?'var(--alert)':a>1.3?'var(--caution)':'var(--good)',d:'Over 150% is the injury-risk zone'}),kpiTile(ad!=null?Math.round(ad*100)+'<small>%</small>':'–','Distance against usual',{ic:'load'}),kpiTile(gfx(best,1),'Best top speed (km/h)',{ic:'trends'})])
   +`<div class="grid g2"><section class="card"><header><div><h2>High-speed running by week</h2><p>Metres above ${HSR_KMH} km/h each week, last 12 weeks</p></div></header>${barChart(weeks,{label:'HSR',tip:x=>`${Math.round(x.y)} m HSR · ${Math.round(x.d)} m total`})}</section>
    <section class="card"><header><div><h2>Top speed each session</h2><p>km/h. A slide over a few weeks can mean fatigue or a niggle.</p></div></header>${vm.length>1?lineChart(vm,{label:'Top speed',unit:' km/h'}):'<div class="small muted">Needs two sessions.</div>'}</section></div>
   ${ratio.length>2?`<section class="card"><header><div><h2>How hard the running felt</h2><p>Keel load (minutes × effort the player logged) per km covered on GPS, by week. Going up means the same running is costing them more: tiredness, illness or a niggle.</p></div></header>${lineChart(ratio,{label:'Effort per km'})}</section>`:''}
   ${last4.length?`<section class="card"><header><div><h2>Heat map, last 4 weeks</h2><p>${last4.length} session${last4.length>1?'s':''}. White lines are sprints over ${SPR_KMH} km/h.</p></div></header><div class="gpwrap">${pitchSVG(heatLayer(last4.map(r=>r.heat),'all',{id:'p'+p.id.slice(-4)})+sprintLayer(last4.slice(-3)),{id:'p'+p.id.slice(-4),arrow:true})}</div></section>`:''}
   ${full?`<section class="card"><header><div><h2>Sessions</h2></div></header><div style="overflow-x:auto"><table class="list"><tr><th>Day</th><th>Session</th><th>Distance</th><th>HSR</th><th>Sprint</th><th>Acc / Dec</th><th>Top speed</th><th>Balance that morning</th></tr>${recent.map(r=>{const i=dayInfo(p,r.day);return `<tr><td>${esc(fmtK(r.day,{weekday:'short',day:'numeric',month:'short'}))}</td><td>${esc(r.session)}</td><td class="num">${gfx(r.m.dist)}</td><td class="num">${gfx(r.m.hsr)}</td><td class="num">${gfx(r.m.sprint)}</td><td class="num">${gfx(r.m.acc)} / ${gfx(r.m.dec)}</td><td class="num">${gfx(r.m.vmax,1)}</td><td>${i.s!=null?`<span class="chip ${i.st==='good'?'good':i.st==='caution'?'caution':'alert'}">${i.s}</span>`:'<span class="muted">–</span>'}</td></tr>`}).join('')}</table></div></section>`:''}`}
const GLINES={all:'Whole squad',GK:'Goalkeepers',DEF:'Backs',MID:'Midfield',FWD:'Forwards'};
function posLine(p){const s=String(p&&p.pos||'').toLowerCase();if(/goal/.test(s))return 'GK';if(/back/.test(s))return 'DEF';if(/mid/.test(s))return 'MID';if(/forward/.test(s))return 'FWD';return null}
function gpsHeatView(){const H=GPS.hm;const ss=gpsSessions().filter(x=>x.rows.some(r=>r.heat));if(!ss.length)return `<section class="card"><div class="empty"><h2>No heat maps yet</h2><p style="margin-top:6px">Heat maps need position data: import a raw trace (CSV with lat/lon or x/y, or a GPX) per player. Session summaries alone have no positions.</p></div></section>`;
  if(!H.sess||!ss.some(x=>x.key===H.sess))H.sess=ss[0].key;const k=todayK();
  let rows=H.scope==='session'?ss.find(x=>x.key===H.sess).rows:GPS.rows.filter(r=>r.day>=addK(k,-7*H.weeks)&&r.heat);
  const P=id=>SQUAD.find(p=>p.id===id);if(H.who!=='all'){rows=GLINES[H.who]?rows.filter(r=>posLine(P(r.player_id))===H.who):rows.filter(r=>r.player_id===H.who)}
  const ps=allPlayers().filter(p=>GPS.rows.some(r=>r.player_id===p.id&&r.heat)).sort((a,b)=>a.name.localeCompare(b.name));
  const ctl=`<div class="toolbar" style="flex-wrap:wrap;gap:8px">${seg('gScope',[['session','One session'],['range','Over weeks']])}
    ${H.scope==='session'?`<select class="sel" id="gHSess">${ss.map(x=>`<option value="${esc(x.key)}" ${x.key===H.sess?'selected':''}>${esc(fmtK(x.day,{weekday:'short',day:'numeric',month:'short'}))} · ${esc(x.session)}</option>`).join('')}</select>`:seg('gWeeks',[[2,'2 weeks'],[4,'4 weeks'],[8,'8 weeks'],[12,'12 weeks']])}
    <select class="sel" id="gWho">${Object.entries(GLINES).map(([v,l])=>`<option value="${v}" ${H.who===v?'selected':''}>${l}</option>`).join('')}<optgroup label="Players">${ps.map(p=>`<option value="${esc(p.id)}" ${H.who===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</optgroup></select>
    ${seg('gLayer',[['all','All time on the pitch'],['hsr','High-speed running only'],['spr','Sprint lines']])}</div>`;
  const W=760;const lay=H.layer==='spr'?heatLayer(rows.map(r=>r.heat),'all',{w:W,id:'h'}).replace('<g ','<g opacity=".45" ')+sprintLayer(rows,{w:W}):heatLayer(rows.map(r=>r.heat),H.layer,{w:W,id:'h'});
  const nS=rows.reduce((a,r)=>a+(r.sprints||[]).length,0);const thirds=[0,0,0];rows.forEach(r=>{const a=r.heat&&(H.layer==='hsr'?r.heat.hsr:r.heat.all);if(a)a.forEach((v,i)=>{const x=(i%GW)*GC;thirds[x<PW/3?0:x<2*PW/3?1:2]+=v})});const tt=thirds.reduce((a,b)=>a+b,0)||1;
  return ctl+`<section class="card"><header><div><h2>${esc(GLINES[H.who]||((P(H.who)||{}).name)||'')}${H.scope==='session'?'':' · last '+H.weeks+' weeks'}</h2><p>${rows.length} player-session${rows.length===1?'':'s'} · ${nS} sprints. Redder means more time there${H.layer==='hsr'?' running above '+HSR_KMH+' km/h':''}. Pitch is lined up to the long axis of play; attacking direction can flip between halves.</p></div></header>
    <div class="gpwrap gbig">${pitchSVG(lay,{w:W,id:'h',arrow:true})}</div>
    <div class="gthirds">${['Own third','Middle third','Attacking third'].map((l,i)=>`<div><b>${Math.round(thirds[i]/tt*100)}%</b><small>${l}</small></div>`).join('')}</div>
    <div class="gleg"><span>Less</span><i></i><span>More</span></div></section>`}
// ---------- patterns: worked out here, then Koach can dig deeper ----------
function gpsPatterns(){const out=[];const k=todayK();
  allPlayers().forEach(p=>{const rs=gRowsOf(p.id);if(rs.length<4)return;
    // HSR spikes followed by a niggle
    let spikes=0,hit=0;for(let w=0;w<12;w++){const end=addK(k,-7*w);const a=gAcwr(p.id,end,'hsr');if(a!=null&&a>1.4){spikes++;let n=false;for(let j=1;j<=7;j++){const d=p.D[addK(end,j)];if(d&&(d.niggles||[]).some(x=>+x.pain>=3))n=true}if(n)hit++}}
    if(hit>=1)out.push({p,w:6+hit,t:'Niggles follow high-speed spikes',s:`${hit} of ${spikes} weeks where HSR jumped over 140% of usual were followed by a niggle within 7 days. Build HSR up more gradually for ${first(p.name)}.`});
    // sleep the night before vs top speed / HSR
    const pairs=rs.map(r=>{const sl=sleepHours(p.D[r.day]);const b=dayInfo(p,r.day).s;return {sl,b,v:+r.m.vmax||null,h:+r.m.hsr||null,kind:r.kind}}).filter(x=>x.sl!=null&&x.v);
    if(pairs.length>=6){const c=corr(pairs.map(x=>x.sl),pairs.map(x=>x.v));if(c!=null&&c>=.35){const lo=pairs.filter(x=>x.sl<6.5),hi=pairs.filter(x=>x.sl>=7.5);if(lo.length&&hi.length)out.push({p,w:5,t:'Faster after a good night',s:`Top speed averages ${avg(hi.map(x=>x.v)).toFixed(1)} km/h after 7.5 h+ sleep and ${avg(lo.map(x=>x.v)).toFixed(1)} after under 6.5 h (${pairs.length} sessions).`})}}
    const bp=rs.map(r=>({b:dayInfo(p,r.day).s,h:+r.m.hsr})).filter(x=>x.b!=null&&isNum(x.h));if(bp.length>=6){const lo=bp.filter(x=>x.b<60),hi=bp.filter(x=>x.b>=75);if(lo.length>=2&&hi.length>=2){const d=avg(lo.map(x=>x.h))/avg(hi.map(x=>x.h));if(d<.85)out.push({p,w:4,t:'Low balance mornings, less high-speed running',s:`On mornings with balance under 60, HSR is ${Math.round((1-d)*100)}% lower than on 75+ mornings.`})}}
    // top speed sliding
    const v=rs.filter(r=>isNum(r.m.vmax)).map(r=>+r.m.vmax);if(v.length>=6){const best=Math.max(...v),last3=avg(v.slice(-3));if(last3<best*.9)out.push({p,w:5,t:'Top speed down',s:`Last 3 sessions average ${last3.toFixed(1)} km/h, ${Math.round((1-last3/best)*100)}% off their best of ${best.toFixed(1)}. Check for a niggle or tiredness.`})}
    // under-exposed to top speed
    const s14=rs.filter(r=>r.day>=addK(k,-14));if(s14.length>=3&&v.length){const best=Math.max(...v);if(!s14.some(r=>+r.m.vmax>=best*.9))out.push({p,w:3,t:'Not near top speed for 2 weeks',s:`No session above 90% of their best (${best.toFixed(1)} km/h) in 14 days. A few short max-speed efforts protect hamstrings.`})}
    const a=gAcwr(p.id,k,'hsr');if(a!=null&&a>1.5)out.push({p,w:9,t:'High-speed running spike now',s:`This week's HSR is ${Math.round(a*100)}% of their usual week.`});else if(a!=null&&a<.6&&s14.length)out.push({p,w:3,t:'Light on high-speed running',s:`This week's HSR is only ${Math.round(a*100)}% of usual. Returning from a lighter spell spikes risk later.`})});
  return out.sort((a,b)=>b.w-a.w)}
function gpsPatternsView(){const pt=gpsPatterns();const ai=GPS.ai;
  return `<section class="card"><header><div><h2>Patterns Keel found</h2><p>Worked out from each player's GPS history alongside what they log in Keel: sleep, balance and niggles. These are patterns, not diagnoses. Use them to start a conversation.</p></div></header>
    ${pt.length?`<div class="gpat">${pt.slice(0,30).map(x=>`<div class="gpi"><button data-player="${esc(x.p.id)}"><b>${esc(x.p.name)}</b></button><div><b>${esc(x.t)}</b><div class="small muted">${esc(x.s)}</div></div></div>`).join('')}</div>`:'<div class="small muted">Not enough history yet. Patterns appear once players have about 4 GPS sessions.</div>'}</section>
   <section class="card"><header><div><h2>Ask Koach</h2><p>Koach reads 12 weeks of GPS for the squad with Keel's load, sleep, balance and niggles, and looks for what you might have missed: who is trending towards trouble, what came before past niggles, and what to change this week.</p></div></header>
    <div class="toolbar"><input class="sel" id="gAsk" placeholder="Optional: a question, e.g. why is Fiachra's top speed down?" style="flex:1;min-width:240px" value="${esc(GPS.ask||'')}"><button class="btn" id="gAI" ${GPS.aiBusy?'disabled':''}>${GPS.aiBusy?'Koach is reading…':'Analyse the squad'}</button></div>
    ${ai?`<div class="gai">${ai.summary?`<p><b>${esc(ai.summary)}</b></p>`:''}${(ai.findings||[]).map(f=>`<div class="gpi"><button data-player="${esc((allPlayers().find(p=>nrm(p.name)===nrm(f.player))||{}).id||'')}"><b>${esc(f.player||'Squad')}</b></button><div><b>${esc(f.finding||'')}</b><div class="small muted">${esc(f.evidence||'')}</div>${f.action?`<div class="small"><b>Do:</b> ${esc(f.action)}</div>`:''}</div></div>`).join('')}</div>`:''}</section>`}
async function gpsAI(){GPS.ask=($('#gAsk')||{}).value||'';GPS.aiBusy=true;render();const k=todayK();
  const data=allPlayers().filter(p=>GPS.rows.some(r=>r.player_id===p.id)).map(p=>{const wk=[];for(let w=11;w>=0;w--){const end=addK(k,-7*w);const g=gWeek(p.id,end);const days=lastN(end,7);
      wk.push({wk:addK(end,-6),dist:Math.round(gSum(g,'hsr')?gSum(g,'dist'):0),hsr:Math.round(gSum(g,'hsr')),spr:Math.round(gSum(g,'sprint')),vmax:g.length?Math.max(...g.map(r=>+r.m.vmax||0)):null,keelLoad:p.E?Math.round(p.E.load7(end)):null,
        sleep:avgOf(days.map(kk=>sleepHours(p.D[kk]))),bal:avgOf(days.map(kk=>dayInfo(p,kk).s)),niggles:[...new Set(days.flatMap(kk=>((p.D[kk]||{}).niggles||[]).filter(n=>+n.pain>=3).map(n=>n.area+' '+n.pain)))]})}
    return {name:p.name,pos:p.pos||'',weeks:wk.map(w=>({...w,sleep:w.sleep&&+w.sleep.toFixed(1),bal:w.bal&&Math.round(w.bal)}))}});
  const prompt=`You are Koach, a sports scientist for a ${(TEAM&&TEAM.name)||''} team (GAA football unless the data says otherwise). Below is 12 weeks of weekly data per player: GPS distance, high-speed running (HSR, m above ${HSR_KMH} km/h), sprint distance, top speed (km/h), Keel internal load (minutes x effort), average sleep (h), average balance (0-100 readiness) and niggles (area and pain/10).
Find the patterns a head of S&C would want: HSR spikes or drops against each player's own history (acute:chronic), what came before past niggles, sleep or balance linked to output, top-speed exposure, external vs internal load drifting apart, and anything squad-wide. Be specific with numbers and weeks. Don't diagnose.
${GPS.ask?`The coach also asks: ${GPS.ask}\n`:''}Reply with JSON only: {"summary":"one sentence","findings":[{"player":"name or Squad","finding":"short headline","evidence":"the numbers","action":"what to do this week"}]} with at most 10 findings, most important first.
DATA: ${JSON.stringify(data)}`;
  try{if(isDemo())throw 'demo';const r=await fetch('/api/claude',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+SESSION.access_token},body:JSON.stringify({prompt,maxTokens:4000})});const j=await r.json();const m=(j.text||'').match(/\{[\s\S]*\}/);GPS.ai=m?JSON.parse(m[0]):{summary:'Koach could not read the data this time. Try again.'}}
  catch(e){const pt=gpsPatterns().slice(0,6);GPS.ai={summary:isDemo()?'Demo squad: this is the kind of read Koach gives on a real team.':'Koach could not be reached. Here is what Keel found on its own.',findings:pt.map(x=>({player:x.p.name,finding:x.t,evidence:x.s,action:/spike/i.test(x.t)?'Hold HSR flat this week; no extra running.':/speed down/i.test(x.t)?'Check in with physio before Saturday.':'Mention it at the next one-to-one.'}))}}
  GPS.aiBusy=false;render()}
// ---------- import ----------
function gpsImportView(){const I=GPS.imp;const ps=allPlayers().sort((a,b)=>a.name.localeCompare(b.name));const opts=sel=>`<option value="">Not in the squad, skip</option>${ps.map(p=>`<option value="${esc(p.id)}" ${p.id===sel?'selected':''}>${esc(p.name)}</option>`).join('')}`;
  const pre=I&&I.rows?`<section class="card"><header><div><h2>Check before saving</h2><p>${I.rows.length} rows from ${esc(I.file)}. ${I.rows.filter(r=>r.pid).length} matched to players. Fix any names Keel couldn't match.</p></div></header>
     <div class="toolbar" style="flex-wrap:wrap"><label class="small">Date <input type="date" class="sel" id="gIDay" value="${esc(I.day||todayK())}"></label><label class="small">Session <input class="sel" id="gISess" value="${esc(I.session||'Training')}"></label>${seg('gIKind',[['training','Training'],['match','Match'],['other','Other']])}</div>
     <div style="overflow-x:auto;max-height:420px"><table class="list"><tr><th>Name in file</th><th>Keel player</th><th>Distance</th><th>HSR</th><th>Sprint</th><th>Top speed</th><th>Min</th></tr>${I.rows.map((r,i)=>`<tr><td>${esc(r.name)}</td><td><select class="sel" data-gimap="${i}">${opts(r.pid)}</select></td><td class="num">${gfx(r.m.dist)}</td><td class="num">${gfx(r.m.hsr)}</td><td class="num">${gfx(r.m.sprint)}</td><td class="num">${gfx(r.m.vmax,1)}</td><td class="num">${gfx(r.m.dur)}</td></tr>`).join('')}</table></div>
     <div class="toolbar" style="margin-top:10px"><button class="btn" id="gISave">Save ${I.rows.filter(r=>r.pid).length} players</button><button class="btn ghost" id="gICancel">Cancel</button></div></section>`:'';
  return pre+`<section class="card"><header><div><h2>Import GPS</h2><p>Two kinds of file. Nothing is shared with players.</p></div></header>
    <div class="grid g2"><div class="gimp"><h3>Session summary</h3><p class="small muted">From STATSports Apex: open the session, Export, choose the session summary CSV (one row per player). Other systems (Catapult, PlayerTek, GPEXE) work if the columns are named in a similar way: player, date, total distance, high speed running, sprint distance, accelerations, decelerations, max speed, duration.</p><label class="btn">Choose CSV<input type="file" id="gFileSum" accept=".csv,.txt" hidden></label></div>
    <div class="gimp"><h3>Raw trace, one player</h3><p class="small muted">For heat maps and sprint lines: a 10 Hz export (CSV with time, latitude, longitude and speed) or a GPX from a watch. Keel works out the numbers, lines the session up on a pitch and stores the heat map, not the raw file.</p>
      <div class="toolbar" style="flex-wrap:wrap"><select class="sel" id="gTPl">${opts('')}</select><input type="date" class="sel" id="gTDay" value="${todayK()}"><input class="sel" id="gTSess" placeholder="Session, e.g. Tuesday training" style="min-width:180px"><select class="sel" id="gTKind"><option value="training">Training</option><option value="match">Match</option><option value="other">Other</option></select></div>
      <label class="btn" style="margin-top:8px">Choose CSV or GPX<input type="file" id="gFileTr" accept=".csv,.gpx,.txt" hidden></label></div></div>
    <div class="small muted" style="margin-top:12px">High-speed running is above ${HSR_KMH} km/h and sprinting above ${SPR_KMH} km/h, the STATSports defaults. Saving the same player, day and session again replaces it.</div></section>`}
document.addEventListener('change',async e=>{const t=e.target;if(!t)return;
  if(t.id==='gSess'){GPS.sess=t.value;render();return}
  if(t.id==='gPl'){GPS.pl=t.value;render();return}
  if(t.id==='gHSess'){GPS.hm.sess=t.value;render();return}
  if(t.id==='gWho'){GPS.hm.who=t.value;render();return}
  if(t.dataset&&t.dataset.gimap!=null){GPS.imp.rows[+t.dataset.gimap].pid=t.value||null;return}
  if(t.id==='gFileSum'&&t.files[0]){const f=t.files[0];const txt=await f.text();const r=parseSummary(txt);if(r.err){toast(r.err,5000);return}const d=r.rows.find(x=>x.day);const s=r.rows.find(x=>x.session);
    GPS.imp={file:f.name,rows:r.rows,day:d&&d.day,session:(s&&s.session)||f.name.replace(/\.[a-z]+$/i,''),kind:/match|v\.? |vs /i.test((s&&s.session)||f.name)?'match':'training'};S.gIKind=GPS.imp.kind;render();return}
  if(t.id==='gFileTr'&&t.files[0]){const pid=$('#gTPl').value;if(!pid){toast('Pick the player first');t.value='';return}const f=t.files[0];const txt=await f.text();const r=parseTrace(txt,f.name);if(r.err){toast(r.err,5000);return}
    const row={player_id:pid,day:$('#gTDay').value||todayK(),session:($('#gTSess').value||'').trim()||'Session',kind:$('#gTKind').value,metrics:r.m,heat:r.heat,sprints:r.sprints,source:'trace'};
    const old=GPS.rows.find(x=>x.player_id===pid&&x.day===row.day&&x.session===row.session);if(old&&old.m){row.metrics={...r.m,...Object.fromEntries(Object.entries(old.m).filter(([,v])=>v!=null))}}
    if(await gpsSave([row])){toast(`Saved: ${gfx(r.m.dist)} m, ${gfx(r.m.hsr)} m HSR, top speed ${gfx(r.m.vmax,1)} km/h`,4000);GPS.hm.sess=row.day+'|'+row.session;GPS.hm.scope='session';GPS.hm.who=pid;location.hash='gps/heat';render()}t.value=''}});
document.addEventListener('click',async e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(c('#gAI')){gpsAI();return}
  if(c('#gICancel')){GPS.imp=null;render();return}
  if(c('#gISave')){const I=GPS.imp;const day=$('#gIDay').value||I.day||todayK(),session=($('#gISess').value||'').trim()||'Session',kind=S.gIKind||I.kind||'training';
    const rows=I.rows.filter(r=>r.pid).map(r=>{const old=GPS.rows.find(z=>z.player_id===r.pid&&z.day===(r.day||day)&&z.session===session);return {player_id:r.pid,day:r.day||day,session,kind,metrics:r.m,heat:old&&old.heat||null,sprints:old&&old.sprints||null,source:'statsports-summary'}});
    if(!rows.length){toast('No rows matched to players');return}if(await gpsSave(rows)){toast(`Saved ${rows.length} players`);GPS.imp=null;GPS.sess=rows[0].day+'|'+session;location.hash='gps/sessions';render()}return}
  if(x=c('[data-set="gScope"]')){GPS.hm.scope=x.dataset.val;render();return}
  if(x=c('[data-set="gWeeks"]')){GPS.hm.weeks=+x.dataset.val;render();return}
  if(x=c('[data-set="gLayer"]')){GPS.hm.layer=x.dataset.val;render();return}},true);
// seg() reads S[key] for the pressed state
Object.defineProperty(S,'gScope',{get:()=>GPS.hm.scope,set:v=>GPS.hm.scope=v,configurable:true});Object.defineProperty(S,'gWeeks',{get:()=>GPS.hm.weeks,set:v=>GPS.hm.weeks=+v,configurable:true});Object.defineProperty(S,'gLayer',{get:()=>GPS.hm.layer,set:v=>GPS.hm.layer=v,configurable:true});
// ---------- GPS on the player page, the S&C page and "Needs a word" ----------
viewPlayer=(function(old){return function(id){const h=old(id);const p=SQUAD.find(x=>x.id===id);if(!p||!p.share||!GPS.rows.some(r=>r.player_id===id))return h;return h+`<h2 class="gsec">GPS</h2>`+gpsPlayerBlock(p,true)}})(viewPlayer);
flagsFor=(function(old){return function(p,k){const out=old(p,k);if(!GPS.rows.length)return out;const a=gAcwr(p.id,k,'hsr');if(a!=null&&a>1.5)out.push({w:7,ic:'spike',col:'var(--alert)',t:'High-speed running spike',s:`GPS: ${Math.round(a*100)}% of their usual week`});return out.sort((a,b)=>b.w-a.w)}})(flagsFor);
viewSC=(function(old){return function(){const h=old();if(!GPS.rows.length)return h;const k=todayK();const ps=sharing().map(p=>({p,a:gAcwr(p.id,k,'hsr'),h:gSum(gWeek(p.id,k),'hsr')})).filter(x=>x.a!=null).sort((a,b)=>b.a-a.a);if(!ps.length)return h;
  return h+`<section class="card"><header><div><h2>GPS: high-speed running against usual</h2><p>Last 7 days of HSR against each player's 4-week average. Full detail, heat maps and patterns on the <a href="#gps">GPS</a> page.</p></div></header><div class="gpat">${ps.slice(0,10).map(x=>`<div class="gpi"><button data-player="${esc(x.p.id)}"><b>${esc(x.p.name)}</b></button><div>${gChip(x.a)} <span class="small muted">${gfx(x.h)} m this week</span></div></div>`).join('')}</div></section>`}})(viewSC);
// ---------- demo GPS: two trainings and a match a week, by position ----------
function buildDemoGPS(){const R=rng(9091);const T=todayK();const out=[];const zone={GK:[[2,18],[30,60]],DEF:[[10,70],[8,82]],MID:[[40,105],[10,80]],FWD:[[70,140],[10,80]]};
  for(let i=84;i>=0;i--){const k=addK(T,-i),dow=(parse(k).getDay()+6)%7;const kind=dow===6?'match':(dow===1||dow===3)?'training':null;if(!kind)continue;const session=kind==='match'?'League match':dow===1?'Tuesday training':'Thursday training';
    SQUAD.filter(p=>p.role==='member').forEach((p,ix)=>{if(R()<.08)return;const d=p.D[k];if(d&&d.sick)return;const line=posLine(p)||'MID';const z=zone[line];const n=kind==='match'?(ix<15?240:90):150;
      const lowB=dayInfo(p,k).s;const fat=lowB!=null&&lowB<60?.85:1;const spike=(ix===10&&i<=6)?2.3:1;const slide=(ix===14&&i<=14)?.9:1;
      const pts=[];let x=(z[0][0]+z[0][1])/2,y=(z[1][0]+z[1][1])/2,t=0;for(let j=0;j<n;j++){const tx=z[0][0]+R()*(z[0][1]-z[0][0]),ty=z[1][0]+R()*(z[1][1]-z[1][0]);x+=(tx-x)*.25+(R()-.5)*8;y+=(ty-y)*.25+(R()-.5)*8;x=Math.max(1,Math.min(PW-1,x));y=Math.max(1,Math.min(PH-1,y));
        let v=Math.abs((R()*R())*7.5);if(R()<(kind==='match'?.05:.035)*spike)v=7+R()*2.2*slide;if(line==='GK')v*=.6;t+=kind==='match'?20:20;pts.push({t,px:x,py:y,v,vs:v})}
      const res=(function(){const all=new Array(GW*GH).fill(0),hs=new Array(GW*GH).fill(0);let dist=0,hsr=0,spr=0,vm=0;const sprints=[];pts.forEach((q,j)=>{const g=Math.min(GH-1,Math.floor(q.py/GC))*GW+Math.min(GW-1,Math.floor(q.px/GC));all[g]+=20;const kmh=q.v*3.6;if(kmh>=HSR_KMH)hs[g]+=20;if(kmh>=SPR_KMH&&j){const a=pts[j-1];sprints.push([a.px,a.py,q.px,q.py,kmh].map(z=>Math.round(z*10)/10))}vm=Math.max(vm,kmh)});
        const base=kind==='match'?(ix<15?7800:3200):5400;dist=Math.round(base*(.85+R()*.3)*fat*(line==='GK'?.5:1)*(kind==='training'?spike:1));hsr=Math.round(dist*(line==='GK'?.02:(.08+R()*.05))*fat*spike);spr=Math.round(hsr*(.15+R()*.15)*slide);
        return {m:{dist,hsr,sprint:spr,acc:Math.round(dist/150*(.8+R()*.4)),dec:Math.round(dist/160*(.8+R()*.4)),vmax:Math.round(Math.min(34,(26.5+(ix%5)*1.1+R()*2.5)*slide*(lowB!=null&&lowB<60?.96:1))*10)/10,dur:kind==='match'?(ix<15?72:28):75,mpm:null},heat:{w:GW,h:GH,all,hsr:hs},sprints:sprints.slice(0,40)}})();
      res.m.mpm=Math.round(res.m.dist/res.m.dur);out.push({id:'dg'+out.length,player_id:p.id,day:k,session,kind,m:res.m,heat:i<=28?res.heat:null,sprints:i<=28?res.sprints:null,source:'demo'})})}
  return out}

VIEWS.splice(VIEWS.findIndex(v=>v[0]==='trends'),0,['gps','GPS','trends','Tools']);


// ================= Player review deck: 10 slides, downloaded as PowerPoint =================
async function loadPptx(){if(window.PptxGenJS)return;await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';s.onload=ok;s.onerror=()=>no(new Error('Could not load the slide maker'));document.head.appendChild(s)})}
const ageBand=a=>!isNum(a)?null:a<18?'Under 18':a<21?'18 to 20':a<25?'21 to 24':a<30?'25 to 29':'30 and over';
function deckStats(p,k,n){const ks=lastN(k,n);const dI=kk=>dayInfo(p,kk);
  const bal=avgOf(ks.map(kk=>dI(kk).s)),sl=avgOf(ks.map(kk=>sleepHours(p.D[kk])));const load=avgOf([0,1,2,3].map(w=>p.E.load7(addK(k,-7*w))));
  let done=0,tot=0;ks.forEach(kk=>sessionsOn(p,kk).forEach(s=>{tot++;if(s.st!=='missed')done++}));
  const prot=avgOf(ks.map(kk=>{const f=foodOn(p,kk);return f?f.protein:null}));
  const g=typeof GPS!=='undefined'?GPS.rows.filter(r=>r.player_id===p.id&&r.day>ks[0]&&r.day<=k):[];const hsr=g.length?gSum(g,'hsr')/(n/7):null;const vmax=g.length?Math.max(...g.map(r=>+r.m.vmax||0)):null;
  const rec=ks.reduce((a,kk)=>a+recMin(p,kk),0)/(n/7);const mob=mobMin(p,k,n)/(n/7);
  return {bal,sl,load,done:tot?done/tot:null,prot,hsr,vmax,rec,mob,debt:p.E.debt(k),sd:sdBed(p,k,Math.min(n,28))}}
function deckGroup(ps,k,n){const all=ps.map(p=>deckStats(p,k,n));const o={};['bal','sl','load','done','prot','hsr','vmax','rec','mob'].forEach(f=>o[f]=avgOf(all.map(x=>x[f])));return o}
function deckPatterns(p,k){const out=[];const ks=lastN(k,56);
  const split=(xf,yf,o)=>{const pr=ks.map(kk=>({x:xf(kk),y:yf(kk)})).filter(v=>v.x!=null&&v.y!=null&&!isNaN(v.x)&&!isNaN(v.y));if(pr.length<9)return;pr.sort((a,b)=>a.x-b.x);const n=Math.max(3,Math.floor(pr.length/3));
    const lo=pr.slice(0,n),hi=pr.slice(-n);const xl=avg(lo.map(v=>v.x)),xh=avg(hi.map(v=>v.x));if(xh-xl<(o.minX||0))return;const yl=avg(lo.map(v=>v.y)),yh=avg(hi.map(v=>v.y));const d=yh-yl;if(Math.abs(d)<o.minY)return;
    const helps=(d>0)===o.higherBetter;out.push({good:helps,t:helps?o.good:o.bad,txt:o.txt(xh,xl,yh,yl),nA:hi.length,nB:lo.length,unit:o.unit,w:Math.abs(d)/o.minY})};
  const sl=kk=>sleepHours(p.D[kk]),bal=kk=>dayInfo(p,kk).s,nxt=f=>kk=>f(addK(kk,1)),num=(kk,f)=>{const d=p.D[kk];return d&&isNum(d[f])?+d[f]:null};
  split(sl,bal,{minX:.5,minY:3,higherBetter:true,unit:'balance',good:'More sleep, better mornings',bad:'Longer nights aren\'t helping balance',txt:(xh,xl,yh,yl)=>`Balance ${Math.round(yh)} after ~${xh.toFixed(1)} h nights, ${Math.round(yl)} after ~${xl.toFixed(1)} h`});
  split(kk=>{const f=foodOn(p,kk);return f?f.protein:null},nxt(bal),{minX:15,minY:3,higherBetter:true,unit:'balance',good:'Good protein days set up the next morning',bad:'Protein isn\'t showing in next-day balance',txt:(xh,xl,yh,yl)=>`Next-day balance ${Math.round(yh)} after ~${Math.round(xh)} g protein days, ${Math.round(yl)} after ~${Math.round(xl)} g`});
  split(kk=>{const f=foodOn(p,kk);return f?f.carbs:null},nxt(bal),{minX:40,minY:3,higherBetter:true,unit:'balance',good:'Fuelling with carbs pays off the next day',bad:'Big carb days followed by flatter mornings',txt:(xh,xl,yh,yl)=>`Next-day balance ${Math.round(yh)} after ~${Math.round(xh)} g carbs, ${Math.round(yl)} after ~${Math.round(xl)} g`});
  split(kk=>recMin(p,kk),nxt(kk=>num(kk,'sore')),{minX:8,minY:.3,higherBetter:false,unit:'soreness',good:'Recovery work takes the edge off soreness',bad:'Soreness stays up even after recovery work',txt:(xh,xl,yh,yl)=>`Next-day soreness ${yh.toFixed(1)}/5 after ~${Math.round(xh)} min recovery, ${yl.toFixed(1)}/5 after ~${Math.round(xl)} min`});
  split(kk=>p.E.load7(kk),bal,{minX:150,minY:3,higherBetter:true,unit:'balance',good:'Handles a heavy week well',bad:'Heavy weeks drag balance down',txt:(xh,xl,yh,yl)=>`Balance ${Math.round(yh)} in the heaviest weeks, ${Math.round(yl)} in the lightest`});
  split(kk=>num(kk,'stress'),bal,{minX:1,minY:3,higherBetter:false,unit:'balance',good:'Stress isn\'t knocking balance',bad:'Stressful days cost balance',txt:(xh,xl,yh,yl)=>`Balance ${Math.round(yh)} on high-stress days, ${Math.round(yl)} on calm ones`});
  split(kk=>{const c=p.D[kk]&&p.D[kk].lastCaf;return c?tmin(c)/60:null},nxt(sl),{minX:2,minY:.25,higherBetter:false,unit:'sleep',good:'Coffee timing isn\'t costing sleep',bad:'Late coffee costs sleep',txt:(xh,xl,yh,yl)=>`${yh.toFixed(1)} h sleep after a last coffee ~${Math.round(xh)}:00, ${yl.toFixed(1)} h after ~${Math.round(xl)}:00`});
  if(typeof GPS!=='undefined'){const g=GPS.rows.filter(r=>r.player_id===p.id&&r.day>=ks[0]);const by=f=>kk=>{const r=g.find(x=>x.day===kk);return r&&isNum(r.m[f])?+r.m[f]:null};
    split(sl,by('vmax'),{minX:.5,minY:.4,higherBetter:true,unit:'speed',good:'Faster on the pitch after a good night',bad:'Sleep isn\'t showing in top speed',txt:(xh,xl,yh,yl)=>`Top speed ${yh.toFixed(1)} km/h after ~${xh.toFixed(1)} h sleep, ${yl.toFixed(1)} after ~${xl.toFixed(1)} h`});
    split(bal,by('hsr'),{minX:5,minY:60,higherBetter:true,unit:'hsr',good:'Better balance, more high-speed running',bad:'High balance mornings aren\'t turning into running',txt:(xh,xl,yh,yl)=>`${Math.round(yh)} m HSR on ~${Math.round(xh)} balance days, ${Math.round(yl)} m on ~${Math.round(xl)}`});
    split(kk=>{const f=foodOn(p,addK(kk,-1));return f?f.carbs:null},by('dist'),{minX:40,minY:250,higherBetter:true,unit:'dist',good:'Carbs the day before, more ground covered',bad:'Pre-session carbs not showing in distance',txt:(xh,xl,yh,yl)=>`${Math.round(yh).toLocaleString('en-IE')} m covered after ~${Math.round(xh)} g carbs the day before, ${Math.round(yl).toLocaleString('en-IE')} m after ~${Math.round(xl)} g`})}
  return out.sort((a,b)=>b.w-a.w)}
function deckActions(p,k,me,sq,pats){const a=[];
  if(me.sl!=null&&me.sl<7)a.push(['Sleep',`Aim for 7.5 h: currently ${me.sl.toFixed(1)} h. Same bed time every night${me.sd!=null&&me.sd>45?` (it varies by about ±${me.sd} min now)`:''}.`]);
  if(me.prot!=null){const t=(tgtOf(p.id)?tgtOf(p.id).targets:APP_DEF).training.protein;if(me.prot<t*.85)a.push(['Nutrition',`Protein averaging ${Math.round(me.prot)} g against a ${t} g target. Add a protein snack after training.`])}
  if(me.rec!=null&&sq.rec!=null&&me.rec<sq.rec*.6)a.push(['Recovery',`${Math.round(me.rec)} min of recovery work a week against a squad average of ${Math.round(sq.rec)}. Two 10-minute sessions after hard days.`]);
  if(me.mob!=null&&me.mob<20&&!(sq.mob!=null&&me.mob>sq.mob*1.2))a.push(['Mobility',`Only ${Math.round(me.mob)} min of mobility a week. 10 minutes on hips and hamstrings three times a week.`]);
  const ac=p.E.acwr(addK(k,-1));if(ac!=null&&ac>1.3)a.push(['Load',`This week is ${Math.round(ac*100)}% of their usual. Keep the next week level before building again.`]);
  pats.filter(x=>!x.good).slice(0,2).forEach(b=>{if(a.length<4)a.push(['Watch',`${b.t}. ${b.txt}.`])});const gd=pats.find(x=>x.good);if(gd&&a.length<4)a.push(['Keep doing',`${gd.t}. ${gd.txt}.`]);if(me.sl!=null&&me.sl>=7&&a.length<4)a.push(['Sleep',`Sleep is solid at ${me.sl.toFixed(1)} h. Protect it on match weeks and travel days.`]);
  if(!a.length)a.push(['Keep going','Everything is on track. Keep the routines that are working: sleep, food and recovery.']);return a.slice(0,4)}
async function buildPlayerDeck(id){const p=SQUAD.find(x=>x.id===id);if(!p)return;const btn=$('#deckBtn');if(btn){btn.disabled=true;btn.textContent='Building the slides…'}
  try{await loadPptx();const k=S.k,N=42;const ps=sharing();const line=posLine(p);const band=ageBand(p.about&&p.about.age);
    const me=deckStats(p,k,N),sq=deckGroup(ps,k,N),pos=line?deckGroup(ps.filter(x=>posLine(x)===line),k,N):null,age=band?deckGroup(ps.filter(x=>ageBand(x.about&&x.about.age)===band),k,N):null;
    const pats=deckPatterns(p,k);const acts=deckActions(p,k,me,sq,pats);const keys=lastN(k,N);
    const C={bg:'F7F5F0',ink:'1B1F1C',mut:'6B716C',acc:'1F7A55',acc2:'5B6CFF',bad:'D64541',warn:'D9902F',line:'E2DED5',card:'FFFFFF',dark:'0E1A14'};const F='Arial',FD='Georgia';
    const pp=new PptxGenJS();pp.layout='LAYOUT_WIDE';pp.author='Keel Staff';pp.title=`${p.name} review`;
    const fmt=(v,d,u)=>v==null||isNaN(v)?'–':(d?(+v).toFixed(d):Math.round(+v).toLocaleString('en-IE'))+(u||'');
    const head=(s,title,sub,n)=>{s.background={color:C.bg};s.addText(title,{x:.6,y:.35,w:11.5,h:.7,fontFace:FD,fontSize:28,color:C.ink});if(sub)s.addText(sub,{x:.6,y:1.0,w:11.5,h:.4,fontFace:F,fontSize:13,color:C.mut});
      s.addText(`${p.name} · ${n}/10`,{x:9.2,y:7.0,w:3.6,h:.3,fontFace:F,fontSize:9,color:C.mut,align:'right'});s.addText('keel',{x:.6,y:6.95,w:1.2,h:.35,fontFace:FD,fontSize:14,color:C.acc,bold:true})};
    const card=(s,x,y,w,h,fill)=>s.addShape(pp.ShapeType.roundRect,{x,y,w,h,fill:{color:fill||C.card},line:{color:C.line,width:.75},rectRadius:.12});
    const stat=(s,x,y,w,label,val,cmp)=>{card(s,x,y,w,1.55);s.addText(label,{x:x+.2,y:y+.12,w:w-.4,h:.3,fontFace:F,fontSize:11,color:C.mut});s.addText(val,{x:x+.2,y:y+.42,w:w-.4,h:.6,fontFace:FD,fontSize:28,color:C.ink});if(cmp)s.addText(cmp,{x:x+.2,y:y+1.05,w:w-.4,h:.35,fontFace:F,fontSize:10,color:C.mut})};
    const cmpTxt=(f,d,u,hi)=>{const parts=[['Squad',sq],[line?GLINES[line]:null,pos],[band,age]].filter(x=>x[0]&&x[1]&&x[1][f]!=null).map(([l,o])=>`${l} ${fmt(o[f],d,u)}`);return parts.join(' · ')};
    const lab=keys.map(kk=>fmtK(kk,{day:'numeric',month:'short'}));const every=(arr,n)=>arr.map((v,i)=>i%n===n-1||i===arr.length-1?v:'');
    const line7=arr=>arr.map((_,i)=>{const w=arr.slice(Math.max(0,i-6),i+1).filter(v=>v!=null);return w.length?Math.round(avg(w)*10)/10:null});
    const chartOpts=(extra)=>Object.assign({x:.6,y:1.6,w:8.1,h:4.9,fontFace:F,catAxisLabelFontSize:9,valAxisLabelFontSize:9,catAxisLabelColor:C.mut,valAxisLabelColor:C.mut,valGridLine:{color:C.line,size:.5},catGridLine:{style:'none'},showLegend:true,legendPos:'b',legendFontSize:10,legendColor:C.mut,lineDataSymbol:'none',lineSize:2.5,chartColors:[C.acc,'A9B0AA',C.acc2]},extra||{});
    const side=(s,title,lines)=>{card(s,9.0,1.6,3.7,4.9);s.addText(title,{x:9.2,y:1.75,w:3.3,h:.35,fontFace:F,fontSize:13,bold:true,color:C.ink});s.addText(lines.map(t=>({text:t,options:{bullet:true,breakLine:true}})),{x:9.2,y:2.15,w:3.35,h:4.2,fontFace:F,fontSize:12,color:C.ink,valign:'top',paraSpaceAfter:6})};
    // 1 title
    let s=pp.addSlide();s.background={color:C.dark};s.addText('keel',{x:.7,y:.5,w:3,h:.6,fontFace:FD,fontSize:22,bold:true,color:'7FE0B0'});
    s.addText(p.name,{x:.7,y:2.3,w:11.5,h:1.1,fontFace:FD,fontSize:48,color:'FFFFFF'});s.addText([p.pos,band,(TEAM&&TEAM.name)].filter(Boolean).join(' · '),{x:.7,y:3.4,w:11.5,h:.5,fontFace:F,fontSize:18,color:'B9C7BF'});
    s.addText(`Player review · last 6 weeks to ${fmtK(k,{day:'numeric',month:'long',year:'numeric'})}`,{x:.7,y:4.1,w:11.5,h:.4,fontFace:F,fontSize:14,color:'B9C7BF'});
    s.addText('How looking after yourself through the week shows up in your balance and on the pitch.',{x:.7,y:6.2,w:11,h:.5,fontFace:F,fontSize:13,italic:true,color:'8FA39A'});
    // 2 snapshot
    s=pp.addSlide();head(s,'Six weeks at a glance','Your averages, with the squad'+(line?`, ${GLINES[line].toLowerCase()}`:'')+(band?` and the ${band} group`:'')+' beside them',2);
    const T=[['Balance',fmt(me.bal),cmpTxt('bal')],['Sleep a night',fmt(me.sl,1,' h'),cmpTxt('sl',1,' h')],['Training load a week',fmt(me.load),cmpTxt('load')],['Sessions done',me.done!=null?Math.round(me.done*100)+'%':'–',sq.done!=null?`Squad ${Math.round(sq.done*100)}%`:''],
      ['Protein a day',fmt(me.prot,0,' g'),cmpTxt('prot',0,' g')],['High-speed running a week',fmt(me.hsr,0,' m'),cmpTxt('hsr',0,' m')],['Best top speed',fmt(me.vmax,1,' km/h'),cmpTxt('vmax',1,'')],['Recovery a week',fmt(me.rec,0,' min'),cmpTxt('rec',0,' min')]];
    T.forEach(([l,v,c],i)=>stat(s,.6+(i%4)*3.08,1.65+Math.floor(i/4)*2.0,2.9,l,v,c));
    const ups=[['Balance','bal'],['Sleep','sl'],['Protein','prot'],['High-speed running','hsr'],['Recovery','rec'],['Mobility','mob']].filter(([l,f])=>me[f]!=null&&sq[f]).map(([l,f])=>[l,me[f]/sq[f]-1]);const above=ups.filter(x=>x[1]>=.05).map(x=>x[0].toLowerCase()),below=ups.filter(x=>x[1]<=-.05).map(x=>x[0].toLowerCase());
    s.addText([above.length?{text:'Ahead of the squad: ',options:{bold:true,color:C.acc}}:null,above.length?{text:above.join(', ')+'.   ',options:{}}:null,below.length?{text:'Behind: ',options:{bold:true,color:C.bad}}:null,below.length?{text:below.join(', ')+'.',options:{}}:null].filter(Boolean).concat(above.length||below.length?[]:[{text:'Right in line with the squad across the board.'}]),{x:.6,y:5.85,w:12,h:.4,fontFace:F,fontSize:14,color:C.ink});
    // 3 balance
    const bser=keys.map(kk=>dayInfo(p,kk).s);const sqb=keys.map(kk=>avgOf(ps.map(x=>dayInfo(x,kk).s)));
    s=pp.addSlide();head(s,'Balance: how ready you are each morning','Daily balance from the check-in, 7-day average, against the squad',3);
    s.addChart(pp.charts.LINE,[{name:p.name,labels:every(lab,7),values:line7(bser)},{name:'Squad',labels:every(lab,7),values:line7(sqb)}],chartOpts({valAxisMinVal:30,valAxisMaxVal:100}));
    const best=Math.max(...bser.filter(v=>v!=null)),worst=Math.min(...bser.filter(v=>v!=null));const lowD=keys.filter((kk,i)=>bser[i]!=null&&bser[i]<55).length;
    side(s,'What stands out',[`Best ${isFinite(best)?best:'–'}, lowest ${isFinite(worst)?worst:'–'}`,`${lowD} morning${lowD===1?'':'s'} under 55 (back-off zone)`,`${keys.filter(kk=>checkedIn(p.D[kk])).length} of ${N} days checked in`].concat(pats.filter(x=>x.unit==='balance').slice(0,2).map(x=>x.txt)));
    // 4 sleep
    const sser=keys.map(kk=>sleepHours(p.D[kk]));s=pp.addSlide();head(s,'Sleep','Hours each night, with the 7.5 h most players need',4);
    s.addChart(pp.charts.BAR,[{name:'Hours',labels:every(lab,7),values:sser.map(v=>v==null?0:v)}],chartOpts({chartColors:['7DB89A'],showLegend:false,valAxisMinVal:0,valAxisMaxVal:10,barGapWidthPct:40}));
    s.addShape(pp.ShapeType.line,{x:.95,y:1.6+4.9*(1-7.5/10)-.05,w:7.6,h:0,line:{color:C.bad,width:1.25,dashType:'dash'}});
    side(s,'The numbers',[`Average ${fmt(me.sl,1,' h')} (squad ${fmt(sq.sl,1,' h')})`,`Sleep debt this week ${fmt(me.debt,1,' h')}`,me.sd!=null?`Bed time varies by about ±${me.sd} min`:'Not enough nights for bed-time consistency',`${sser.filter(v=>v!=null&&v<6.5).length} nights under 6.5 h`].concat(pats.filter(x=>/sleep|coffee|night/i.test(x.t)).slice(0,2).map(x=>x.txt)));
    // 5 training load
    const wl=[],wlab=[],sqw=[];for(let w=5;w>=0;w--){const end=addK(k,-7*w);wl.push(Math.round(p.E.load7(end)));sqw.push(Math.round(avgOf(ps.map(x=>x.E.load7(end)))||0));wlab.push(fmtK(addK(end,-6),{day:'numeric',month:'short'}))}
    s=pp.addSlide();head(s,'Training load and S&C','Weekly load (minutes × effort) from Keel sessions, club training, matches and the gym',5);
    s.addChart(pp.charts.BAR,[{name:p.name,labels:wlab,values:wl},{name:'Squad',labels:wlab,values:sqw}],chartOpts({chartColors:[C.acc,'C9CEC8'],barGapWidthPct:60}));
    const ac=p.E.acwr(addK(k,-1));const as=(SC.assigns||[]).filter(a=>a.player_id===p.id);const ad=as.map(a=>adherence(a,k)).reduce((o,x)=>({due:o.due+x.due,done:o.done+x.done}),{due:0,done:0});
    side(s,'Load',[ac!=null?`Last 7 days are ${Math.round(ac*100)}% of the usual week${ac>1.5?' (spike)':ac<.8?' (light)':' (steady)'}`:'Building up history',me.done!=null?`${Math.round(me.done*100)}% of sessions done`:'',as.length?`S&C programme: ${ad.done} of ${ad.due} sessions done`:'No S&C programme assigned'].filter(Boolean));
    // 6 on the pitch
    s=pp.addSlide();head(s,'On the pitch','GPS: high-speed running each week and top speed each session',6);
    const g=typeof GPS!=='undefined'?gRowsOf(p.id).filter(r=>r.day>keys[0]):[];
    if(g.length){const hw=[];for(let w=5;w>=0;w--){const end=addK(k,-7*w);hw.push(Math.round(gSum(gWeek(p.id,end),'hsr')))}
      s.addChart(pp.charts.BAR,[{name:'HSR m a week',labels:wlab,values:hw}],chartOpts({w:5.9,chartColors:[C.warn],showLegend:false,barGapWidthPct:50}));
      const vm=g.filter(r=>isNum(r.m.vmax));s.addChart(pp.charts.LINE,[{name:'Top speed km/h',labels:vm.map(r=>fmtK(r.day,{day:'numeric',month:'short'})),values:vm.map(r=>+r.m.vmax)}],chartOpts({x:6.75,w:5.95,chartColors:[C.acc2],showLegend:false,lineDataSymbol:'circle',lineDataSymbolSize:5}));
      s.addText(`HSR ${fmt(me.hsr,0,' m')} a week (${line?GLINES[line].toLowerCase()+' '+fmt(pos&&pos.hsr,0,' m'):'squad '+fmt(sq.hsr,0,' m')}) · best top speed ${fmt(me.vmax,1,' km/h')} (squad ${fmt(sq.vmax,1)})`,{x:.6,y:6.55,w:12,h:.35,fontFace:F,fontSize:12,color:C.ink})}
    else s.addText('No GPS for this player in the last 6 weeks. Import STATSports sessions on the GPS page.',{x:.6,y:3,w:12,h:.6,fontFace:F,fontSize:16,color:C.mut});
    // 7 patterns
    s=pp.addSlide();head(s,'Your patterns: what helps and what hurts','Found in your own last 8 weeks. Patterns, not proof, but worth knowing',7);
    const good=pats.filter(x=>x.good).slice(0,3),bad=pats.filter(x=>!x.good).slice(0,3);
    const col=(x,title,items,clr)=>{card(s,x,1.6,5.95,4.9);s.addShape(pp.ShapeType.rect,{x,y:1.6,w:.12,h:4.9,fill:{color:clr},line:{color:clr}});s.addText(title,{x:x+.35,y:1.75,w:5.4,h:.4,fontFace:F,fontSize:15,bold:true,color:clr});
      s.addText(items.length?items.flatMap(it=>[{text:it.t,options:{bold:true,breakLine:true,fontSize:13}},{text:it.txt+(it.nA?` (${it.nA} v ${it.nB} days)`:''),options:{breakLine:true,fontSize:11,color:C.mut}},{text:' ',options:{breakLine:true,fontSize:6}}]):[{text:'Nothing clear yet. More days logged will show it.',options:{fontSize:12,color:C.mut}}],{x:x+.35,y:2.2,w:5.4,h:4.1,fontFace:F,color:C.ink,valign:'top'})};
    col(.6,'Working for you',good,C.acc);col(6.75,'Costing you',bad,C.bad);
    // 8 nutrition
    s=pp.addSlide();head(s,'Nutrition','Daily protein against the target for that kind of day',8);
    const pser=keys.map(kk=>{const f=foodOn(p,kk);return f?f.protein:null});const tgs=keys.map(kk=>((tgtOf(p.id)?tgtOf(p.id).targets:APP_DEF)[dayTypeGuess(p,kk)]||APP_DEF.training).protein);
    if(pser.some(v=>v!=null)){s.addChart(pp.charts.BAR,[{name:'Protein g',labels:every(lab,7),values:pser.map(v=>v||0)}],chartOpts({chartColors:['8FBFA6'],showLegend:false,barGapWidthPct:35}));
      const hit=pser.filter((v,i)=>v!=null&&v>=tgs[i]*.9).length,logd=pser.filter(v=>v!=null).length;const sup={};keys.forEach(kk=>((p.D[kk]&&p.D[kk].supps)||[]).forEach(x=>sup[x.name]=(sup[x.name]||0)+(+x.n||1)));
      side(s,'Food',[`Logged food on ${logd} of ${N} days`,`Hit protein on ${hit} of ${logd} logged days`,`Average ${fmt(me.prot,0,' g')} a day (squad ${fmt(sq.prot,0,' g')})`,Object.keys(sup).length?`Supplements: ${Object.keys(sup).join(', ')}`:''].filter(Boolean).concat(pats.filter(x=>/protein/i.test(x.t)).map(x=>x.txt)))}
    else s.addText(p.food?'No food logged in the last 6 weeks.':`${first(p.name)} doesn't share food with the team. They can turn it on in Keel under You › Your team.`,{x:.6,y:3,w:12,h:.6,fontFace:F,fontSize:16,color:C.mut});
    // 9 recovery and body
    s=pp.addSlide();head(s,'Recovery and the body','Recovery work, mobility, niggles and the muscles getting least work',9);
    const nig={};keys.forEach(kk=>((p.D[kk]&&p.D[kk].niggles)||[]).forEach(n=>{if(+n.pain>=2){const a=n.area;nig[a]=nig[a]||{days:0,max:0};nig[a].days++;nig[a].max=Math.max(nig[a].max,+n.pain)}}));
    const bm=bmPlayer(p,k,4).sort((a,b)=>a.r-b.r);const low=bm.filter(x=>x.r<.4).slice(0,5).map(x=>x.nm);const tools={};keys.forEach(kk=>recOn(p,kk).forEach(x=>{const w=x.what.split(':')[0];tools[w]=(tools[w]||0)+1}));
    stat(s,.6,1.6,2.9,'Recovery a week',fmt(me.rec,0,' min'),`Squad ${fmt(sq.rec,0,' min')}`);stat(s,3.68,1.6,2.9,'Mobility a week',fmt(me.mob,0,' min'),`Squad ${fmt(sq.mob,0,' min')}`);
    stat(s,6.76,1.6,2.9,'Niggle days',String(Object.values(nig).reduce((a,x)=>a+x.days,0)),Object.keys(nig).length?Object.keys(nig).join(', '):'None in 6 weeks');stat(s,9.84,1.6,2.9,'Unwell days',String(keys.filter(kk=>p.D[kk]&&p.D[kk].sick).length),'Logged in the check-in');
    card(s,.6,3.4,5.95,3.1);s.addText('Most used',{x:.8,y:3.5,w:5.5,h:.35,fontFace:F,fontSize:13,bold:true,color:C.ink});s.addText((Object.keys(tools).length?Object.entries(tools).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([t,n])=>({text:`${t}: ${n} times`,options:{bullet:true,breakLine:true}})):[{text:'Nothing logged'}]),{x:.8,y:3.9,w:5.5,h:2.5,fontFace:F,fontSize:12,color:C.ink,valign:'top'});
    card(s,6.75,3.4,5.95,3.1);s.addText('Muscles getting least work (last 4 weeks)',{x:6.95,y:3.5,w:5.5,h:.35,fontFace:F,fontSize:13,bold:true,color:C.ink});s.addText(low.length?low.map(t=>({text:t,options:{bullet:true,breakLine:true}})):[{text:'Everything is getting some work.'}],{x:6.95,y:3.9,w:5.5,h:2.5,fontFace:F,fontSize:12,color:C.ink,valign:'top'});
    // 10 focus
    s=pp.addSlide();head(s,'Focus for the next two weeks','Three or four things that would move your balance and your game the most',10);
    acts.forEach(([t,x],i)=>{const y=1.65+i*1.2;card(s,.6,y,12.1,1.05);s.addShape(pp.ShapeType.ellipse,{x:.85,y:y+.25,w:.55,h:.55,fill:{color:C.acc},line:{color:C.acc}});s.addText(String(i+1),{x:.85,y:y+.25,w:.55,h:.55,align:'center',valign:'middle',fontFace:F,fontSize:16,bold:true,color:'FFFFFF'});
      s.addText([{text:t+'  ',options:{bold:true,color:C.acc}},{text:x}],{x:1.65,y:y+.12,w:10.8,h:.8,fontFace:F,fontSize:14,color:C.ink,valign:'middle'})});
    s.addText('Check in each morning so Keel can keep tracking these.',{x:.6,y:6.55,w:12,h:.35,fontFace:F,fontSize:12,italic:true,color:C.mut});
    await pp.writeFile({fileName:`${p.name.replace(/[^\w\s-]/g,'')} review ${k}.pptx`});toast('Slides downloaded')}
  catch(e){toast('Could not build the slides: '+(e.message||e),5000)}
  if(btn){btn.disabled=false;btn.textContent='Download review slides'}}
viewPlayer=(function(old){return function(id){const h=old(id);const p=SQUAD.find(x=>x.id===id);if(!p||!p.share)return h;
  const bar=`<section class="card deckbar"><div><h2>Player review slides</h2><p>Ten slides for a quick call with ${esc(first(p.name))}: balance, sleep, load, GPS, nutrition, recovery and their own patterns, set against the squad${posLine(p)?', their line':''} and age group. Downloads as PowerPoint, opens in Google Slides or Keynote too.</p></div><button class="btn" id="deckBtn" data-deck="${esc(p.id)}">Download review slides</button></section>`;
  const i=h.indexOf('</a>');return i>0&&h.slice(0,i).includes('class="back"')?h.slice(0,i+4)+bar+h.slice(i+4):bar+h}})(viewPlayer);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-deck]');if(b)buildPlayerDeck(b.dataset.deck)});


// ================= Lift progress: every set players log, from team programmes and their own Keel plan =================
const e1rm=(kg,reps)=>+kg>0&&+reps>0?Math.round(+kg*(1+Math.min(12,+reps)/30)*2)/2:0;
function liftData(p){const by={};const exName=id=>{const e=(SC.ex||[]).find(x=>x.id===id);return e?e.name:null};
  const add=(name,day,arr,src)=>{if(!name||!arr||!arr.length)return;const ok=arr.filter(s=>+s.kg>0&&+s.reps>0);if(!ok.length)return;const top=ok.reduce((a,s)=>e1rm(s.kg,s.reps)>e1rm(a.kg,a.reps)?s:a,ok[0]);
    const key=name.toLowerCase();(by[key]=by[key]||{name,pts:[],src:new Set()}).pts.push({day,kg:+top.kg,reps:+top.reps,e1:e1rm(top.kg,top.reps),sets:ok.length,vol:ok.reduce((a,s)=>a+s.kg*s.reps,0)});by[key].src.add(src)};
  (SC.logs||[]).filter(l=>l.player_id===p.id&&l.done&&Array.isArray(l.sets)).forEach(l=>l.sets.forEach(r=>add(r.name||exName(r.ex),l.day,r.done,'Team programme')));
  Object.values(p.L||{}).forEach(l=>{if(l&&Array.isArray(l.sets))l.sets.forEach(r=>add(r.name,l.date,r.done,'Own plan'))});
  return Object.values(by).map(x=>{x.pts.sort((a,b)=>a.day.localeCompare(b.day));return x}).sort((a,b)=>b.pts[b.pts.length-1].day.localeCompare(a.pts[a.pts.length-1].day))}
function liftSpark(pts){if(pts.length<2)return '';const v=pts.map(p=>p.e1);const lo=Math.min(...v),hi=Math.max(...v);const W=120,H=30;const xs=i=>Math.round(i/(pts.length-1)*(W-6))+3,ys=x=>hi===lo?H/2:Math.round(H-3-(x-lo)/(hi-lo)*(H-6));
  return `<svg class="lspark" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><polyline fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="${pts.map((p,i)=>xs(i)+','+ys(p.e1)).join(' ')}"/><circle cx="${xs(pts.length-1)}" cy="${ys(v[v.length-1])}" r="3" fill="currentColor"/></svg>`}
function liftsCard(p,full){const L=liftData(p);if(!L.length)return full?`<section class="card"><header><div><h2>Lifts</h2><p>No weights logged yet. Sets appear here as ${esc(first(p.name))} logs workouts in Keel.</p></div></header></section>`:'';const T=S.k||todayK();
  const rows=L.slice(0,full?20:6).map(x=>{const last=x.pts[x.pts.length-1];const old=x.pts.filter(q=>q.day<=addK(T,-28));const base=old.length?old[old.length-1]:x.pts[0];const ch=last.e1&&base.e1&&base!==last?Math.round((last.e1/base.e1-1)*100):null;
    const best=Math.max(...x.pts.map(q=>q.e1));return `<tr><td><b>${esc(x.name)}</b><div class="muted" style="font-size:12px">${fmtK(last.day,{day:'numeric',month:'short'})} · ${[...x.src].join(', ')}</div></td><td class="num">${last.kg} kg × ${last.reps}</td><td class="num">${last.e1} kg${last.e1>=best&&x.pts.length>2?' <span class="lbest">best</span>':''}</td>
      <td class="num">${ch==null?'–':`<span class="${ch>0?'good-t':ch<0?'bad-t':''}">${ch>0?'+':''}${ch}%</span>`}</td><td class="lsp">${liftSpark(x.pts)}</td></tr>`}).join('');
  return `<section class="card lifts"><header><div><h2>Lifts</h2><p>Top set each session and estimated 1-rep max (Epley), from every set ${esc(first(p.name))} logs in Keel.</p></div></header>
    <table class="list"><thead><tr><th>Exercise</th><th>Last top set</th><th>Est. max</th><th>vs 4 wks</th><th>Trend</th></tr></thead><tbody>${rows}</tbody></table></section>`}
viewPlayer=(function(old){return function(id){const h=old(id);const p=SQUAD.find(x=>x.id===id);if(!p||!p.share)return h;const c=liftsCard(p,false);if(!c)return h;
  const i=h.indexOf('<section class="card gsec');return i>0?h.slice(0,i)+c+h.slice(i):h+c}})(viewPlayer);
// S&C page: a lifts table across the squad (best estimated max per main lift)
viewSC=(function(old){return function(){const h=old.apply(this,arguments);try{const ps=sharing();const main=['Trap bar deadlift','Back squat','Bench press','Rear-foot elevated split squat','Chin-up'];
  const rows=ps.map(p=>{const L=liftData(p);if(!L.length)return null;return {p,v:main.map(m=>{const x=L.find(y=>y.name.toLowerCase()===m.toLowerCase());return x?x.pts[x.pts.length-1]:null})}}).filter(Boolean);if(!rows.length)return h;
  const used=main.filter((m,j)=>rows.some(r=>r.v[j]));const card=`<section class="card lifts"><header><div><h2>Squad lifts</h2><p>Latest estimated max per lift, from logged sets. Tap a player for their trend.</p></div></header>
    <table class="list"><thead><tr><th>Player</th>${used.map(m=>`<th>${esc(m)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td><a href="#player/${esc(r.p.id)}">${esc(r.p.name)}</a></td>${used.map(m=>{const v=r.v[main.indexOf(m)];return `<td class="num">${v?v.e1+' kg':'–'}</td>`}).join('')}</tr>`).join('')}</tbody></table></section>`;
  return h+card}catch(e){return h}}})(viewSC);
// demo: logged sets with steady progress, so the tables have something to show
buildDemoSC=(function(old){return function(){const r=old.apply(this,arguments);const R=rng(55);const base={e1:110,e3:22,e4:70,e6:28,e2:95};
  r.logs.forEach(l=>{if(!l.done)return;const pr=r.progs[0];const day=pr.plan.weeks[l.week-1]&&pr.plan.weeks[l.week-1].days.find(x=>x.dow===l.dow);if(!day)return;const ix=+String(l.player_id).replace(/\D/g,'')||0;
    l.sets=day.items.filter(it=>base[it.ex]).map(it=>{const b=base[it.ex]*(0.8+(ix%7)*0.06);const kg=Math.round((b+l.week*2.5+(R()*5-2.5))/2.5)*2.5;const reps=parseInt(it.reps)||6;const n=+it.sets||3;const e=r.ex.find(x=>x.id===it.ex);
      return {ex:it.ex,name:e?e.name:'',target:{sets:it.sets,reps:it.reps,load:it.load},done:Array.from({length:n},(_,j)=>({kg:j===n-1?kg:Math.max(2.5,kg-2.5*(n-1-j)),reps}))}})});return r}})(buildDemoSC);

// ================= start =================
(async()=>{
  try{if(/[?&]demo\b/.test(location.search))throw 0;const cfg=await fetch('/api/config').then(r=>r.json());if(!cfg.url||!cfg.anonKey)throw 0;sb=window.supabase.createClient(cfg.url,cfg.anonKey)}
  catch(e){if(/[?&](preview|demo)\b/.test(location.search)){SESSION={user:{email:'preview',id:'x'}};TEAMS=[demoTeam()];TEAM=TEAMS[0];const as=(location.search.match(/as=(\w+)/)||[])[1];if(as)S.demoAs=as;const d=buildDemo();SQUAD=d.squad;NOTES=d.notes;attachNotes();Object.assign(SC,buildDemoSC());Object.assign(NUT,buildDemoNut());Object.assign(RH,buildDemoRehab());Object.assign(HUB,buildDemoHub());SQUAD.forEach(p=>p._di={});GPS.rows=buildDemoGPS();GPS.loaded=true;render();return}
    $('#root').innerHTML='<div class="gate"><div class="gcard"><h1>Not set up yet</h1><p class="muted">The dashboard can\'t reach the database settings.</p></div></div>';return}
  const {data:{session}}=await sb.auth.getSession();SESSION=session;if(!session){render();return}
  await joinPending();
  TEAMS=await loadTeams();TEAMS.push(demoTeam());let want=null;try{want=localStorage.getItem('keelCoachTeam')}catch(e){}
  if(!TEAMS.some(t=>t.team_id===want))want=TEAMS[0].team_id;if(ERR==='setup')location.hash='setup';
  const real=TEAMS.find(t=>t.team_id!==DEMO_ID&&t.staff);if(real)S.demoAs=real.staff;
  await selectTeam(want);
})();
})();
