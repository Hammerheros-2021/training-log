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
  const rs=activeRestr(p,k);let av='avail';if(pain>=5||sev==='bad')av='out';else if(pain>=3||sick||rs.length||(s!=null&&s<55))av='mod';
  const st=s==null?'none':s>=75?'good':s>=55?'caution':'alert';
  return {d,ci,s,st,pain,nig,sick:sick?{k:sick.k,sev}:null,av,rs,sleep:ci?sleepHours(d):null}})());
}
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
const players=()=>SQUAD.filter(p=>p.role==='member');
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
      const skip=(ix===19&&i<=3)||(ix===23&&i===0)||(ix===10&&i===0)||R()>ci;
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
  if(t.team_id===DEMO_ID){const d=buildDemo();SQUAD=d.squad;NOTES=d.notes;attachNotes();return}
  const from=addK(todayK(),-80),to=todayK();
  const {data:sq,error:e1}=await sb.rpc('keel_team_squad',{t:t.team_id});if(e1)throw e1;
  const rows=[];for(let off=0;off<50000;off+=1000){const {data,error}=await sb.rpc('keel_team_data',{t:t.team_id,from_day:from,to_day:to}).range(off,off+999);if(error)throw error;rows.push(...(data||[]));if(!data||data.length<1000)break}
  const by={};(sq||[]).forEach(m=>{by[m.user_id]=mkPlayer({id:m.user_id,name:m.display_name||(m.about&&m.about.name)||'Player',pos:m.pos||'',role:m.role,staff:m.staff,share:m.share,food:!!m.share_food,joined:m.joined_at,about:m.about||{}})});
  rows.forEach(r=>{const p=by[r.user_id];if(!p)return;(r.kind==='day'?p.D:p.L)[r.key]=Object.assign({date:r.key},r.data)});
  SQUAD=Object.values(by).sort((a,b)=>a.name.localeCompare(b.name));
  const {data:nt}=await sb.from('team_notes').select('*').eq('team_id',t.team_id).order('created_at',{ascending:false}).limit(1000);NOTES=nt||[];attachNotes()}
function attachNotes(){SQUAD.forEach(p=>{p.notes=NOTES.filter(n=>n.player_id===p.id);p._di={}})}
async function selectTeam(id){TEAM=TEAMS.find(t=>t.team_id===id)||TEAMS[0];try{localStorage.setItem('keelCoachTeam',TEAM.team_id)}catch(e){}LOADING=true;render();
  try{await loadSquad(TEAM)}catch(e){toast('Could not load the squad: '+(e.message||e),5000);SQUAD=[];NOTES=[]}LOADING=false;render()}

// ================= views =================
const VIEWS=[['today','Overview','today','Squad'],['sc','S&C','load','Backroom'],['physio','Physio','avail','Backroom'],['nutrition','Nutrition','food','Backroom'],['mindset','Mindset','mind','Backroom'],['trends','Squad trends','trends','Tools'],['setup','Team','setup','Tools']];
function route(){const h=location.hash.slice(1).split('/');const v=h[0];return {v:VIEWS.some(x=>x[0]===v)||v==='player'?v:(v?'today':homeView()),id:decodeURIComponent(h[1]||'')}}
const isDemo=()=>TEAM&&TEAM.team_id===DEMO_ID;
function shell(body,title){const rt=route();const cur=rt.v==='player'?'':rt.v;const mine=homeView();
  let grp='';const nav=VIEWS.map(([v,l,ic,g])=>{const h=g!==grp?`<div class="navh">${g}</div>`:'';grp=g;return h+`<a href="#${v}" ${cur===v?'aria-current="page"':''}>${ico(ic)}<span>${l}</span>${v===mine?'<em>You</em>':''}</a>`}).join('');
  const teamSel=`<select class="sel" id="teamSel" aria-label="Team">${TEAMS.map(t=>`<option value="${esc(t.team_id)}" ${TEAM&&t.team_id===TEAM.team_id?'selected':''}>${esc(t.name)}</option>`).join('')}</select>`;
  const canFwd=S.k<todayK();const ms=myStaff();
  const demo=isDemo()?`<div class="demo-note">${ico('zap','width:16px;height:16px;flex:none')}<span style="flex:1"><b>Demo squad.</b> Made-up players to show what each member of the backroom team sees.</span>
    <label class="small" style="display:flex;align-items:center;gap:8px;white-space:nowrap">Viewing as <select class="sel" id="demoAs" style="padding:5px 8px">${Object.keys(STAFF_LONG).filter(s=>s!=='coach').map(s=>`<option value="${s}" ${S.demoAs===s?'selected':''}>${esc(STAFF_LONG[s])}</option>`).join('')}</select></label></div>`:'';
  const ask=!isDemo()&&TEAM&&!ms&&ERR!=='upgrade'?`<div class="demo-note"><span style="flex:1"><b>What's your role on the team?</b> It decides which page you land on. Everyone on the staff can see every page.</span>${roleSelect('myRole','')}</div>`:'';
  const upg=ERR==='upgrade'?`<div class="demo-note" style="border-color:var(--caution)"><span><b>One more database step.</b> Run the updated <b>supabase/teams.sql</b> in Supabase once (same as before) to switch on staff roles, food sharing and notes.</span></div>`:'';
  return `<div class="shell"><aside class="side"><div class="logo"><img src="/keel-wordmark.svg" alt="keel"><span>Staff</span></div><nav class="nav">${nav}</nav>
    <div class="foot">${ms?`<span class="chip" style="align-self:flex-start">${esc(STAFF_LONG[ms]||'Staff')}</span>`:''}<span>${esc(SESSION&&SESSION.user.email||'')}</span><button id="signOut">Sign out</button></div></aside>
  <div class="main"><div class="top"><img class="mlogo" src="/keel-wordmark.svg" alt="keel"><h1>${esc(title)}</h1><span class="sp"></span>${teamSel}
    <div class="datenav"><button id="dPrev" aria-label="Day before">‹</button><b>${S.k===todayK()?'Today':esc(fmtK(S.k))}</b><button id="dNext" aria-label="Day after" ${canFwd?'':'disabled'}>›</button></div>
    <button class="btn ghost sm" id="reload" aria-label="Refresh" title="Refresh">${ico('refresh','width:16px;height:16px')}</button></div>
  <main class="page">${upg}${demo}${ask}${body}</main></div>
  <nav class="tabs">${VIEWS.filter(v=>v[0]!=='trends').map(([v,l,ic])=>`<a href="#${v}" ${cur===v?'aria-current="page"':''}>${ico(ic)}<span>${l}</span></a>`).join('')}</nav></div>`}
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
  t=Math.max(.08,Math.min(1,t));const base=m==='stress'||m==='sore'?'#F2B84B':'#8C98FF';return `color-mix(in srgb,${base} ${Math.round(12+t*78)}%,var(--surface))`}
function viewTrends(){const ps=sharing();if(!ps.length)return needTeam();const n=S.days,keys=[];for(let i=n-1;i>=0;i--)keys.push(addK(S.k,-i));const [lab,get,fmt]=METRICS[S.metric];
  const head=`<tr><th></th>${keys.map(k=>`<th class="${DOW1(k)==='M'?'wk':''}">${n<=14?esc(fmtK(k,{weekday:'narrow'}))+'<br>':''}${parse(k).getDate()}</th>`).join('')}</tr>`;
  const row=p=>`<tr><td class="n"><button data-player="${esc(p.id)}"><b>${esc(p.name)}</b><small>${esc(p.pos||'')}</small></button></td>${keys.map(k=>{const v=get(p,k);const txt=v==null?'':fmt(v);
    return `<td class="c ${v==null?'x':''} ${k===S.k?'today':''}" style="background:${cellColour(S.metric,v)}" ${tipAttr(`<b>${esc(p.name)} · ${esc(fmtK(k))}</b>${esc(lab)}: ${v==null?'no entry':esc(txt)}`)}>${S.nums&&v!=null?esc(txt):''}</td>`}).join('')}</tr>`;
  const avgRow=`<tr class="avg"><td class="n"><b>Squad average</b></td>${keys.map(k=>{const vs=ps.map(p=>get(p,k)).filter(v=>v!=null);const v=vs.length?avg(vs):null;return `<td class="c ${v==null?'x':''}" style="background:${cellColour(S.metric,v)}" ${tipAttr(`<b>Squad · ${esc(fmtK(k))}</b>${esc(lab)}: ${v==null?'no entries':esc(fmt(Math.round(v*10)/10))} (${vs.length} players)`)}>${S.nums&&v!=null?esc(fmt(S.metric==='sleep'?r1(v):Math.round(v))):''}</td>`}).join('')}</tr>`;
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
  const why=i=>i.rs&&i.rs.length&&i.av!=='out'?'Restriction: '+i.rs[0].body:i.sick?`Unwell${i.sick.sev?' · '+i.sick.sev:''}`:i.pain>=3?`${i.nig.d.niggles[0].area} ${i.pain}/10`:i.s!=null&&i.s<55?`Balance ${i.s}`:i.ci?`Balance ${i.s??'–'}`:'No check-in';
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
  if(lg)out.push({k,what:TYPE_NAMES[lg.type]||'Session',dur:+lg.dur||0,rpe:+lg.rpe||0,st:lg.status||'done',fb});
  (d&&d.extras||[]).forEach(x=>out.push({k,what:x.kind||'Extra',dur:+x.dur||0,rpe:+x.rpe||0,st:'done',fb}));return out}
function spark(vals,o){o=o||{};const W=o.w||110,H=o.h||26,mx=o.max!=null?o.max:Math.max(1,...vals.filter(v=>v!=null)),mn=o.min||0;let d='',pen=false;
  vals.forEach((v,i)=>{if(v==null){pen=false;return}const x=2+(W-4)*i/Math.max(1,vals.length-1),y=H-2-(H-4)*(v-mn)/Math.max(1e-6,mx-mn);d+=(pen?'L':'M')+x.toFixed(1)+' '+y.toFixed(1);pen=true});
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${d}" fill="none" stroke="${o.col||'var(--blue)'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
const trendArrow=(now,before,goodUp)=>{if(now==null||before==null)return '<span class="muted">–</span>';const d=now-before;if(Math.abs(d)<.3)return '<span class="muted">steady</span>';
  const good=goodUp?d>0:d<0;return `<span style="color:${good?'var(--good)':'var(--caution)'}">${d>0?'▲':'▼'} ${r1(Math.abs(d))}</span>`};

// ---------- S&C ----------
function sessionCall(p,k){const i=dayInfo(p,k),a=p.E.acwr(k),rs=activeRestr(p,k);
  if(i.av==='out')return ['hold','Unavailable'];
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
     <div class="av" style="grid-template-columns:repeat(4,minmax(0,1fr))">${col('push','Push on','var(--good)','Fresh and load is steady')}${col('normal','As planned','var(--blue)','Nothing stands out')}${col('hold','Hold back','var(--caution)','Lighter, modified or off')}${col('none','Not checked in','var(--faint)','Ask before training')}</div></section>`
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
   <div class="phead">${ring(i.s,92,i.st)}<div class="who"><h1>${esc(p.name)}</h1><div class="muted">${esc([p.pos,age?age+' years':null].filter(Boolean).join(' · '))}</div>
    <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><span class="chip" style="color:${c}">${i.ci?esc(l):'No check-in '+(k===todayK()?'today':'that day')}</span><span class="chip ${i.av==='out'?'alert':i.av==='mod'?'caution':'good'}">${AV[i.av][1]}</span>${rs.map(n=>`<span class="chip caution">${ico('clock')}${esc(n.body.length>40?n.body.slice(0,40)+'…':n.body)}</span>`).join('')}</div></div></div>
   ${kpiRow([kpi(b7.length?Math.round(avg(b7)):'–','Balance, 7-day average',E.usualBal(k)!=null?`Usual ${Math.round(E.usualBal(k))}`:''),kpi(sl7.length?r1(avg(sl7))+'<small>h</small>':'–','Sleep, 7-day average',E.debt(k)!=null?`${E.debt(k)} h short over the week`:''),kpi(Math.round(E.load7(k)),'Load, last 7 days',E.chronicWeek(k)!=null?`Usual ${Math.round(E.chronicWeek(k))}`:''),`<div class="kpi" style="flex-direction:column;align-items:flex-start;gap:6px"><div>${acwrChip(a)}</div><div class="l">This week against usual</div></div>`])}
   <div class="toolbar">${seg('ptab',[['overview','Overview'],['sc','S&C'],['physio','Physio'],['nutrition','Nutrition'],['mindset','Mindset']])}</div>`;
  const bal=`<section class="card"><header><div><h2>Balance</h2><p>Last 4 weeks, from their own check-ins</p></div></header>${lineChart(keys.map(kk=>({k:kk,y:dayInfo(p,kk).s})),{min:0,max:100,ticks:[0,55,75,100],fmt:Math.round,bands:[[75,100,'var(--good)'],[55,75,'var(--caution)'],[0,55,'var(--alert)']],dotColor:v=>v>=75?'var(--good)':v>=55?'var(--caution)':'var(--alert)',color:'var(--text-body)',label:'Balance'})}</section>`;
  const sleep=`<section class="card"><header><div><h2>Sleep</h2><p>Hours each night against what they need</p></div></header>${barChart(keys.map(kk=>({k:kk,y:E.sleep(kk)})),{max:10,fmt:v=>r1(v),ref:E.need(k),refLabel:`Needs about ${E.need(k)} h`,tip:p=>p.y?p.y+' h':'No entry',label:'Sleep'})}</section>`;
  const load=`<section class="card"><header><div><h2>Training load</h2><p>Minutes × effort each day</p></div></header>${barChart(keys.map(kk=>({k:kk,y:E.load(kk)})),{tip:p=>`Load ${Math.round(p.y||0)}`,label:'Load'})}</section>`;
  const line=(f,t,sub,col)=>`<section class="card"><header><div><h2>${t}</h2><p>${sub}</p></div></header>${lineChart(keys.map(kk=>({k:kk,y:p.D[kk]&&isNum(p.D[kk][f])?+p.D[kk][f]:null})),{min:1,max:5,ticks:[1,3,5],color:col,label:t})}</section>`;
  const sess=[];keys.slice().reverse().forEach(kk=>sess.push(...sessionsOn(p,kk)));
  const sessT=`<section class="card"><header><div><h2>Sessions</h2><p>Last 4 weeks</p></div></header>${sess.length?`<table class="list"><tr><th>Day</th><th>What</th><th>Min</th><th>Effort</th><th>Felt</th></tr>${sess.slice(0,16).map(s=>`<tr><td>${esc(fmtK(s.k))}</td><td>${esc(s.what)}${s.st==='missed'?' <span class="chip alert">Missed</span>':''}</td><td class="num">${s.dur||'–'}</td><td class="num">${s.rpe||'–'}</td><td>${esc(s.fb&&isNum(s.fb.feel)?FEEL[s.fb.feel]:'–')}${s.fb&&s.fb.effort==='harder'?' <span class="chip caution">Harder than planned</span>':''}</td></tr>`).join('')}</table>`:'<div class="empty">No sessions logged.</div>'}</section>`;
  const nigs=[];keys.slice().reverse().forEach(kk=>{const d=p.D[kk];(d&&d.niggles||[]).forEach(n=>nigs.push({k:kk,...n}))});
  const nigT=`<section class="card"><header><div><h2>Niggles</h2><p>Last 4 weeks</p></div></header>${nigs.length?`<table class="list"><tr><th>Day</th><th>Where</th><th>Side</th><th>Pain</th></tr>${nigs.slice(0,16).map(n=>`<tr><td>${esc(fmtK(n.k))}</td><td>${esc(n.area)}</td><td>${esc(n.side||'')}</td><td>${painChip(+n.pain||0)}</td></tr>`).join('')}</table>`:'<div class="empty">None logged. Good.</div>'}</section>`;
  const pain=(()=>{const areas=[...new Set(nigs.map(n=>n.area))];if(!areas.length)return '';return `<section class="card"><header><div><h2>Pain over time</h2><p>${areas.map(esc).join(', ')}</p></div></header>${lineChart(keys.map(kk=>{const d=p.D[kk];return {k:kk,y:d?(d.niggles&&d.niggles.length?maxPain(d):(checkedIn(d)?0:null)):null}}),{min:0,max:10,ticks:[0,3,5,10],color:'var(--caution)',label:'Pain',tip:p=>`Worst pain ${p.y}/10`})}</section>`})();
  let foodBody;if(!p.food)foodBody=`<section class="card"><div class="empty">${esc(first(p.name))} hasn't turned on food sharing.</div></section>`;
  else{const fk=keys.map(kk=>({k:kk,f:foodOn(p,kk)}));const lg=fk.filter(x=>x.f);
    foodBody=kpiRow([kpi(lg.filter(x=>keys.slice(-7).includes(x.k)).length+'<small>/ 7</small>','Days logged this week'),kpi(fx(avgOf(lg.map(x=>x.f.protein)))+'<small>g</small>','Protein a day'),kpi(plantsWeek(p,k),'Plants this week'),kpi(fx(avgOf(lg.map(x=>x.f.water!=null?+x.f.water:null)),1)+'<small>L</small>','Water a day')])
     +`<div class="grid g2"><section class="card"><header><div><h2>Calories</h2><p>Bars in blue are training days</p></div></header>${barChart(fk.map(x=>({k:x.k,y:x.f?x.f.kcal:0,c:isTrainDay(p,x.k)?'var(--blue)':'var(--line-2)'})),{tip:q=>q.y?`${Math.round(q.y)} kcal${isTrainDay(p,q.k)?' · training day':''}`:'Not logged',label:'Calories'})}</section>
      <section class="card"><header><div><h2>Protein</h2><p>Grams a day</p></div></header>${barChart(fk.map(x=>({k:x.k,y:x.f?x.f.protein:0})),{tip:q=>q.y?`${Math.round(q.y)} g`:'Not logged',label:'Protein'})}</section></div>`}
  const body={overview:(fl.length?`<section class="card"><header><div><h2>Worth knowing</h2></div></header><div class="flags">${fl.map(f=>`<div class="flag"><span class="ic" style="background:color-mix(in srgb,${f.col} 15%,transparent);color:${f.col}">${ico(f.ic)}</span><span class="who"><b>${esc(f.t)}</b><span>${esc(f.s)}</span></span></div>`).join('')}</div></section>`:'')+`<div class="grid g2">${bal}${sleep}${load}${line('energy','How they feel','Energy, 1 to 5')}</div>`,
    sc:`<div class="grid g2">${load}${bal}</div>${sessT}`,
    physio:`<div class="grid g2">${pain||nigT}${line('sore','Body soreness','1 fresh to 5 very sore','var(--caution)')}</div>${pain?nigT:''}`,
    nutrition:foodBody,
    mindset:`<div class="grid g2">${line('mood','Mood','1 low to 5 great')}${line('stress','Stress','1 calm to 5 very stressed','var(--caution)')}${line('energy','Energy','1 drained to 5 full of it')}${sleep}</div>`}[tab];
  return head+body+notesCard(p)+`<p class="tiny muted">${p.food?'Food is shared as daily totals only. ':''}Notes, cycle tracking and${p.food?'':' food,'} drinks with alcohol stay private to ${esc(first(p.name))}.</p>`}

// ---------- team ----------
let SETUP={busy:false};
function viewSetup(){const real=TEAMS.filter(t=>t.team_id!==DEMO_ID);
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
function viewOverview(){const h=viewToday();const i=h.indexOf('<div class="grid g-today">');if(i<0)return h;return h.slice(0,i)+hubStrip()+restrCard()+h.slice(i)}

function render(){TIPS={};tipN=0;const rt=route();const root=$('#root');
  if(!SESSION){root.innerHTML=gateHTML();return}
  const title=rt.v==='player'?'Player':(VIEWS.find(v=>v[0]===rt.v)||VIEWS[0])[1];
  let body;if(LOADING)body='<div class="spin"></div>';else body=({setup:viewSetup,trends:viewTrends,sc:viewSC,physio:viewPhysio,nutrition:viewNutrition,mindset:viewMindset}[rt.v]||(rt.v==='player'?()=>viewPlayer(rt.id):viewOverview))();
  const sy=scrollY;root.innerHTML=shell(body,title);if(render._v===location.hash)scrollTo(0,sy);else scrollTo(0,0);render._v=location.hash}
let GATE={mode:'in',msg:''};
function gateHTML(){if(GATE.mode==='up')return `<div class="gate"><form class="gcard" id="signup"><img src="/keel-wordmark.svg" alt="keel"><div><h1>Join the backroom team</h1><p class="muted small" style="margin-top:4px">For coaches, S&amp;C, physios, nutritionists and mindset coaches. You need the staff code from your team's manager.</p></div>
  <div class="field"><label for="su-name">Your name</label><input class="in" id="su-name" autocomplete="name" required></div>
  <div class="field"><label for="su-role">Your role</label><select class="in" id="su-role" required><option value="">Choose…</option>${Object.entries(STAFF_LONG).filter(([s])=>s!=='manager').map(([s,l])=>`<option value="${s}">${esc(l)}</option>`).join('')}</select></div>
  <div class="field"><label for="su-code">Staff code</label><input class="in" id="su-code" autocomplete="off" required style="text-transform:uppercase;letter-spacing:.12em" placeholder="6 letters"></div>
  <div class="field"><label for="em">Email</label><input class="in" id="em" type="email" autocomplete="email" required></div>
  <div class="field"><label for="pw">Password</label><input class="in" id="pw" type="password" autocomplete="new-password" minlength="6" required></div>
  <button class="btn" type="submit">Create account and join</button><button type="button" class="small muted" data-gate="in" style="text-align:left">Already have a Keel account? Sign in</button></form></div>`;
  return `<div class="gate"><form class="gcard" id="login"><img src="/keel-wordmark.svg" alt="keel"><div><h1>Team dashboard</h1><p class="muted small" style="margin-top:4px">Sign in with your Keel account.</p></div>
  ${GATE.msg?`<div class="demo-note">${esc(GATE.msg)}</div>`:''}
  <div class="field"><label for="em">Email</label><input class="in" id="em" type="email" autocomplete="email" required></div>
  <div class="field"><label for="pw">Password</label><input class="in" id="pw" type="password" autocomplete="current-password" required></div>
  <button class="btn" type="submit">Sign in</button><button type="button" class="btn ghost" data-gate="up">New staff? Join with a staff code</button><a class="small muted" href="/p2/">Forgot your password? Reset it in the Keel app.</a></form></div>`}
async function joinPending(){let pj=null;try{pj=JSON.parse(localStorage.getItem('keelStaffJoin')||'null')}catch(e){}if(!pj)return;
  const {error}=await sb.rpc('keel_join_team',{join_code:pj.code,my_name:pj.name,my_staff:pj.staff});try{localStorage.removeItem('keelStaffJoin')}catch(e){}
  toast(error?error.message:'You\'ve joined the team',4000)}

// ================= events =================
window.addEventListener('hashchange',()=>{if(!location.hash.startsWith('#player'))S.ptab=null;render()});
document.addEventListener('click',async e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(x=c('[data-gate]')){GATE={mode:x.dataset.gate,msg:''};render();return}
  if(x=c('[data-player]')){location.hash='player/'+encodeURIComponent(x.dataset.player);return}
  if(x=c('[data-go]')){location.hash=x.dataset.go;return}
  if(x=c('[data-set]')){const v=x.dataset.val;S[x.dataset.set]=isNaN(+v)?v:+v;render();return}
  if(x=c('[data-toggle]')){S[x.dataset.toggle]=!S[x.dataset.toggle];render();return}
  if(c('#dPrev')){S.k=addK(S.k,-1);render();return}
  if(c('#dNext')){if(S.k<todayK()){S.k=addK(S.k,1);render()}return}
  if(c('#reload')){if(TEAM)await selectTeam(TEAM.team_id);return}
  if(c('#signOut')){await sb.auth.signOut();location.hash='';location.reload();return}
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

// ================= start =================
(async()=>{
  try{const cfg=await fetch('/api/config').then(r=>r.json());if(!cfg.url||!cfg.anonKey)throw 0;sb=window.supabase.createClient(cfg.url,cfg.anonKey)}
  catch(e){if(/[?&]preview\b/.test(location.search)){SESSION={user:{email:'preview',id:'x'}};TEAMS=[demoTeam()];TEAM=TEAMS[0];const as=(location.search.match(/as=(\w+)/)||[])[1];if(as)S.demoAs=as;const d=buildDemo();SQUAD=d.squad;NOTES=d.notes;attachNotes();render();return}
    $('#root').innerHTML='<div class="gate"><div class="gcard"><h1>Not set up yet</h1><p class="muted">The dashboard can\'t reach the database settings.</p></div></div>';return}
  const {data:{session}}=await sb.auth.getSession();SESSION=session;if(!session){render();return}
  await joinPending();
  TEAMS=await loadTeams();TEAMS.push(demoTeam());let want=null;try{want=localStorage.getItem('keelCoachTeam')}catch(e){}
  if(!TEAMS.some(t=>t.team_id===want))want=TEAMS[0].team_id;if(ERR==='setup')location.hash='setup';
  const real=TEAMS.find(t=>t.team_id!==DEMO_ID&&t.staff);if(real)S.demoAs=real.staff;
  await selectTeam(want);
})();
})();
