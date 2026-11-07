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
  let av='avail';if(pain>=5||sev==='bad')av='out';else if(pain>=3||sick||(s!=null&&s<55))av='mod';
  const st=s==null?'none':s>=75?'good':s>=55?'caution':'alert';
  return {d,ci,s,st,pain,nig,sick:sick?{k:sick.k,sev}:null,av,sleep:ci?sleepHours(d):null}})());
}
const ST={good:['var(--good)','Ready'],caution:['var(--caution)','Cap the effort'],alert:['var(--alert)','Back off'],none:['var(--faint)','No check-in']};
const AV={avail:['var(--good)','Available','check'],mod:['var(--caution)','Modify','niggle'],out:['var(--alert)','Unavailable','sick']};
const lastCheckin=(p,k)=>{for(let i=0;i<60;i++){const kk=addK(k,-i);if(checkedIn(p.D[kk]))return kk}return null};
function flagsFor(p,k){
  const i=dayInfo(p,k),E=p.E,out=[];
  if(i.sick)out.push({w:9,ic:'sick',col:'var(--alert)',t:`Unwell${i.sick.sev?` (${i.sick.sev})`:''}`,s:i.sick.k===k?'Logged this morning':'Logged '+fmtK(i.sick.k,{weekday:'long'})});
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
let sb=null,SESSION=null,TEAMS=[],TEAM=null,SQUAD=[],LOADING=false,ERR='';
const S={k:todayK(),sort:'status',filter:'all',metric:'bal',days:28,nums:false};
const DEMO_ID='demo';
const players=()=>SQUAD.filter(p=>p.role==='member');
const sharing=()=>players().filter(p=>p.share);
function mkPlayer(o){const p=Object.assign({D:{},L:{},_di:{}},o);p.E=engine(p.D,p.L);return p}

// ================= demo squad (made up, never stored) =================
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
function buildDemo(){
  const R=rng(20261107);const rnd=(a,b)=>a+(b-a)*R();const ri=(a,b)=>Math.round(rnd(a,b));const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  const names=['Cian Gallagher','Oisín McGovern','Darragh Flynn','Ronan Clancy','Eoin McSharry','Seán Rooney','Pádraig Keaney','Conor Gilmartin','Niall Dolan','Ciarán Mulvey','Fiachra Feeney','Tadhg Ward','Rory McTernan','Shane Meehan','Aidan Rooney','Liam Kelly','Kevin Moran','Dylan Fowley','Jack Gaffney','Ultan Brennan','Mark Harte','Diarmuid Leonard','Colm Travers','Brian McHugh'];
  const POS=['Goalkeeper','Corner-back','Full-back','Corner-back','Wing-back','Centre-back','Wing-back','Midfield','Midfield','Wing-forward','Centre-forward','Wing-forward','Corner-forward','Full-forward','Corner-forward','Goalkeeper','Back','Back','Midfield','Forward','Forward','Back','Forward','Midfield'];
  const T=todayK(),N=70;const out=[];
  names.forEach((nm,ix)=>{const p={id:'demo'+ix,name:nm,pos:POS[ix],role:'member',share:true,about:{name:nm,sport:['GAA football']}};const D={},L={};
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
      if(extras.length)d.extras=extras;if(farm&&dow<5){d.farm=ri(1,3);d.farmHrs=ri(3,7)}
      if(i>0&&((gym&&dow===0)||(run&&dow===2))){const miss=R()<.12;L[k]={date:k,type:gym&&dow===0?'S':'E',status:miss?'missed':'done',dur:gym&&dow===0?ri(45,60):ri(30,45),rpe:gym&&dow===0?ri(6,8):ri(3,5)}}
      if(i>0&&(extras.length||L[k])&&!skip&&R()<.75){let f=cl(Math.round(2.3+(d.energy||3)*.45+rnd(-.8,.8)),1,5);if(ix===12&&i<=6)f=ri(1,2);d.sfb={feel:f,energy:f>=4?'full':f<=2?'low':'steady',effort:f<=2?'harder':'right',trend:'unsure'}}
      if(Object.keys(d).length>1)D[k]=d}
    out.push(mkPlayer(Object.assign(p,{D,L})))});
  return out}

// ================= data =================
async function loadTeams(){const {data,error}=await sb.rpc('keel_my_teams');if(error){ERR=/keel_my_teams|function/i.test(error.message||'')?'setup':error.message;return []}ERR='';return (data||[]).filter(t=>t.role==='coach')}
async function loadSquad(t){
  if(t.team_id===DEMO_ID){SQUAD=buildDemo();return}
  const from=addK(todayK(),-80),to=todayK();
  const {data:sq,error:e1}=await sb.rpc('keel_team_squad',{t:t.team_id});if(e1)throw e1;
  const rows=[];for(let off=0;off<50000;off+=1000){const {data,error}=await sb.rpc('keel_team_data',{t:t.team_id,from_day:from,to_day:to}).range(off,off+999);if(error)throw error;rows.push(...(data||[]));if(!data||data.length<1000)break}
  const by={};(sq||[]).forEach(m=>{by[m.user_id]=mkPlayer({id:m.user_id,name:m.display_name||(m.about&&m.about.name)||'Player',pos:m.pos||'',role:m.role,share:m.share,joined:m.joined_at,about:m.about||{}})});
  rows.forEach(r=>{const p=by[r.user_id];if(!p)return;(r.kind==='day'?p.D:p.L)[r.key]=Object.assign({date:r.key},r.data)});
  SQUAD=Object.values(by).sort((a,b)=>a.name.localeCompare(b.name))}
async function selectTeam(id){TEAM=TEAMS.find(t=>t.team_id===id)||TEAMS[0];try{localStorage.setItem('keelCoachTeam',TEAM.team_id)}catch(e){}LOADING=true;render();
  try{await loadSquad(TEAM)}catch(e){toast('Could not load the squad: '+(e.message||e),5000);SQUAD=[]}LOADING=false;render()}

// ================= views =================
const VIEWS=[['today','Today','today'],['trends','Squad trends','trends'],['load','Training load','load'],['wellness','Wellness','wellness'],['avail','Availability','avail'],['setup','Team','setup']];
function route(){const h=location.hash.slice(1).split('/');return {v:VIEWS.some(v=>v[0]===h[0])||h[0]==='player'?h[0]:'today',id:decodeURIComponent(h[1]||'')}}
const isDemo=()=>TEAM&&TEAM.team_id===DEMO_ID;

function shell(body,title){const rt=route();const cur=rt.v==='player'?'':rt.v;
  const nav=VIEWS.map(([v,l,ic])=>`<a href="#${v}" ${cur===v?'aria-current="page"':''}>${ico(ic)}<span>${l}</span></a>`).join('');
  const teamSel=`<select class="sel" id="teamSel" aria-label="Team">${TEAMS.map(t=>`<option value="${esc(t.team_id)}" ${TEAM&&t.team_id===TEAM.team_id?'selected':''}>${esc(t.name)}</option>`).join('')}</select>`;
  const canFwd=S.k<todayK();
  return `<div class="shell"><aside class="side"><div class="logo"><img src="/keel-wordmark.svg" alt="keel"><span>Coach</span></div><nav class="nav">${nav}</nav>
    <div class="foot"><span>${esc(SESSION&&SESSION.user.email||'')}</span><button id="signOut">Sign out</button></div></aside>
  <div class="main"><div class="top"><img class="mlogo" src="/keel-wordmark.svg" alt="keel"><h1>${esc(title)}</h1><span class="sp"></span>${teamSel}
    <div class="datenav"><button id="dPrev" aria-label="Day before">‹</button><b>${S.k===todayK()?'Today':esc(fmtK(S.k))}</b><button id="dNext" aria-label="Day after" ${canFwd?'':'disabled'}>›</button></div>
    <button class="btn ghost sm" id="reload" aria-label="Refresh" title="Refresh">${ico('refresh','width:16px;height:16px')}</button></div>
  <main class="page">${isDemo()?`<div class="demo-note">${ico('zap','width:16px;height:16px;flex:none')}<span><b>Demo squad.</b> Made-up players to show what the dashboard does. Pick your own team at the top once players have joined.</span></div>`:''}${body}</main></div>
  <nav class="tabs">${VIEWS.map(([v,l,ic])=>`<a href="#${v}" ${cur===v?'aria-current="page"':''}>${ico(ic)}<span>${{trends:'Trends',load:'Load'}[v]||l}</span></a>`).join('')}</nav></div>`}

function needTeam(){return `<div class="card"><div class="empty"><h2 style="margin-bottom:8px">No players sharing yet</h2><p>Hand out your team's player code on the <a href="#setup">Team</a> page. Players appear here as soon as they join.</p></div></div>`}

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
function viewLoad(){const ps=sharing();if(!ps.length)return needTeam();const k=S.k;
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
  return `<div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="kpi"><div class="ic" style="color:var(--blue)">${ico('load')}</div><div><div class="v">${Math.round(avg(rows.map(r=>r.w)))}</div><div class="l">Average load, last 7 days</div></div></div>
    <div class="kpi"><div class="ic" style="color:var(--good)">${ico('check')}</div><div><div class="v">${steady}<small>/ ${rows.length}</small></div><div class="l">In the steady zone (80–130% of usual)</div></div></div>
    <div class="kpi"><div class="ic" style="color:var(--alert)">${ico('spike')}</div><div><div class="v">${spikes}</div><div class="l">Spiking (over 150% of usual)</div></div></div></div>
   <div class="grid g2"><section class="card"><header><div><h2>Squad load by week</h2><p>Average per player: minutes × effort, from sessions, club training, matches and heavy work days</p></div></header>${barChart(weeks,{label:'Weekly load',tip:p=>`Average ${Math.round(p.y)} per player`})}</section>
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
  const why=i=>i.sick?`Unwell${i.sick.sev?' · '+i.sick.sev:''}`:i.pain>=3?`${i.nig.d.niggles[0].area} ${i.pain}/10`:i.s!=null&&i.s<55?`Balance ${i.s}`:i.ci?`Balance ${i.s??'–'}`:'No check-in';
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

function viewPlayer(id){const p=SQUAD.find(x=>x.id===id);if(!p)return `<div class="card"><div class="empty">Player not found. <a href="#today">Back to today</a></div></div>`;
  if(!p.share)return `<a class="back" href="#today">${ico('back','width:15px;height:15px')}Squad</a><div class="card"><div class="empty"><h2>${esc(p.name)}</h2><p style="margin-top:6px">${esc(first(p.name))} has paused sharing, so there's nothing to show.</p></div></div>`;
  const k=S.k,i=dayInfo(p,k),E=p.E;const keys=[];for(let j=27;j>=0;j--)keys.push(addK(k,-j));
  const bs=keys.map(kk=>({k:kk,y:dayInfo(p,kk).s}));const b7=bs.slice(-7).map(x=>x.y).filter(v=>v!=null);const sl7=keys.slice(-7).map(kk=>E.sleep(kk)).filter(v=>v!=null);
  const fl=flagsFor(p,k);const a=E.acwr(k);const [c,l]=ST[i.st];const age=p.about&&p.about.age;
  const kpi=(v,lab,sub)=>`<div class="kpi" style="flex-direction:column;align-items:flex-start;gap:0"><div class="v">${v}</div><div class="l">${lab}</div>${sub?`<div class="d">${sub}</div>`:''}</div>`;
  const sess=[];for(let j=0;j<28;j++){const kk=addK(k,-j),lg=p.L[kk],d=p.D[kk];const fb=d&&d.sfb;const FE=['','Awful','Tough','OK','Good','Brilliant'];
    if(lg)sess.push({k:kk,what:{S:'Strength',E:'Easy run',H:'Hyrox class',T:'Threshold',X:'Speed + long run',O:'Other training',R:'Rest'}[lg.type]||'Session',dur:lg.dur,rpe:lg.rpe,st:lg.status,fb:fb&&FE[fb.feel]});
    (d&&d.extras||[]).forEach(x=>sess.push({k:kk,what:x.kind||'Extra',dur:x.dur,rpe:x.rpe,st:'done',fb:fb&&FE[fb.feel]}))}
  const nigs=[];for(let j=0;j<28;j++){const kk=addK(k,-j),d=p.D[kk];(d&&d.niggles||[]).forEach(n=>nigs.push({k:kk,...n}))}
  return `<a class="back" href="#today">${ico('back','width:15px;height:15px')}Squad</a>
   <div class="phead">${ring(i.s,92,i.st)}<div class="who"><h1>${esc(p.name)}</h1><div class="muted">${esc([p.pos,age?age+' years':null].filter(Boolean).join(' · '))}</div><div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><span class="chip" style="color:${c}">${i.ci?esc(l):'No check-in '+(k===todayK()?'today':'that day')}</span><span class="chip ${i.av==='out'?'alert':i.av==='mod'?'caution':'good'}">${AV[i.av][1]}</span></div></div></div>
   <div class="kpis" style="grid-template-columns:repeat(4,minmax(0,1fr))">${kpi(b7.length?Math.round(avg(b7)):'–','Balance, 7-day average',E.usualBal(k)!=null?`Usual ${Math.round(E.usualBal(k))}`:'')}${kpi(sl7.length?r1(avg(sl7))+'<small>h</small>':'–','Sleep, 7-day average',E.debt(k)!=null?`${E.debt(k)} h short over the week`:'')}${kpi(Math.round(E.load7(k)),'Load, last 7 days',E.chronicWeek(k)!=null?`Usual ${Math.round(E.chronicWeek(k))}`:'')}<div class="kpi" style="flex-direction:column;align-items:flex-start;gap:6px"><div>${acwrChip(a)}</div><div class="l">This week against usual</div></div></div>
   ${fl.length?`<section class="card"><header><div><h2>Worth knowing</h2></div></header><div class="flags">${fl.map(f=>`<div class="flag"><span class="ic" style="background:color-mix(in srgb,${f.col} 15%,transparent);color:${f.col}">${ico(f.ic)}</span><span class="who"><b>${esc(f.t)}</b><span>${esc(f.s)}</span></span></div>`).join('')}</div></section>`:''}
   <div class="grid g2"><section class="card"><header><div><h2>Balance</h2><p>Last 4 weeks, from their own check-ins</p></div></header>${lineChart(bs,{min:0,max:100,ticks:[0,55,75,100],fmt:Math.round,bands:[[75,100,'var(--good)'],[55,75,'var(--caution)'],[0,55,'var(--alert)']],dotColor:v=>v>=75?'var(--good)':v>=55?'var(--caution)':'var(--alert)',color:'var(--text-body)',label:'Balance'})}</section>
    <section class="card"><header><div><h2>Sleep</h2><p>Hours each night against what they need</p></div></header>${barChart(keys.map(kk=>({k:kk,y:E.sleep(kk)})),{max:10,fmt:v=>r1(v),ref:E.need(k),refLabel:`Needs about ${E.need(k)} h`,tip:p=>p.y?p.y+' h':'No entry',label:'Sleep'})}</section>
    <section class="card"><header><div><h2>Training load</h2><p>Minutes × effort each day</p></div></header>${barChart(keys.map(kk=>({k:kk,y:E.load(kk)})),{tip:p=>`Load ${Math.round(p.y||0)}`,label:'Load'})}</section>
    <section class="card"><header><div><h2>How they feel</h2><p>Energy, 1 to 5</p></div></header>${lineChart(keys.map(kk=>({k:kk,y:p.D[kk]&&isNum(p.D[kk].energy)?+p.D[kk].energy:null})),{min:1,max:5,ticks:[1,3,5],label:'Energy'})}</section></div>
   <div class="grid g2"><section class="card"><header><div><h2>Sessions</h2><p>Last 4 weeks</p></div></header>${sess.length?`<table class="list"><tr><th>Day</th><th>What</th><th>Min</th><th>Effort</th><th>Felt</th></tr>${sess.slice(0,14).map(s=>`<tr><td>${esc(fmtK(s.k))}</td><td>${esc(s.what)}${s.st==='missed'?' <span class="chip alert">Missed</span>':''}</td><td class="num">${s.dur||'–'}</td><td class="num">${s.rpe||'–'}</td><td>${esc(s.fb||'–')}</td></tr>`).join('')}</table>`:'<div class="empty">No sessions logged.</div>'}</section>
    <section class="card"><header><div><h2>Niggles</h2><p>Last 4 weeks</p></div></header>${nigs.length?`<table class="list"><tr><th>Day</th><th>Where</th><th>Side</th><th>Pain</th></tr>${nigs.slice(0,14).map(n=>`<tr><td>${esc(fmtK(n.k))}</td><td>${esc(n.area)}</td><td>${esc(n.side||'')}</td><td><span class="chip ${n.pain>=5?'alert':n.pain>=3?'caution':''}">${n.pain}/10</span></td></tr>`).join('')}</table>`:'<div class="empty">None logged. Good.</div>'}</section></div>
   <p class="tiny muted">Food, drinks, notes and cycle tracking are private to ${esc(first(p.name))} and never shown here.</p>`}

let SETUP={busy:false};
function viewSetup(){const real=TEAMS.filter(t=>t.team_id!==DEMO_ID);
  const create=`<section class="card"><header><div><h2>${real.length?'Add another team':'Create your team'}</h2><p>You'll get a code to hand out to players.</p></div></header>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><input class="in" id="tName" placeholder="e.g. Glencar/Manorhamilton Seniors" style="flex:1;min-width:220px"><button class="btn" id="tCreate" ${SETUP.busy?'disabled':''}>${SETUP.busy?'Creating…':'Create team'}</button></div></section>`;
  if(ERR==='setup')return `<section class="card"><header><div><h2>One-off database step</h2><p>Teams aren't switched on in the database yet.</p></div></header><ol class="steps"><li>Open Supabase › SQL Editor › New query.</li><li>Paste in everything from <b>supabase/teams.sql</b> in the GitHub repo and click Run.</li><li>Come back here and refresh.</li></ol></section>`;
  if(!TEAM||isDemo())return create+(real.length?'':`<p class="small muted">Until then, the demo squad shows what you'll see.</p>`);
  const ms=SQUAD.slice().sort((a,b)=>(a.role===b.role?0:a.role==='coach'?-1:1)||a.name.localeCompare(b.name));
  return `<div class="grid g2"><section class="card"><header><div><h2>Player code</h2><p>Players type this in the Keel app</p></div><button class="btn ghost sm" data-newcode="player">New code</button></header>
     <div style="display:flex;align-items:center;gap:14px"><span class="code">${esc(TEAM.code||'')}</span><button class="btn ghost sm" data-copy="${esc(TEAM.code||'')}">${ico('copy','width:15px;height:15px')}Copy</button></div>
     <ol class="steps" style="margin-top:18px"><li>Open Keel at training-log-lac-iota.vercel.app/p2/ and sign in.</li><li>Tap your profile (top right), then <b>Your team</b>.</li><li>Type the code, read what's shared, tap <b>Join and share</b>.</li></ol></section>
   <section class="card"><header><div><h2>Coach code</h2><p>For other coaches, the physio or S&amp;C. Don't give this to players.</p></div><button class="btn ghost sm" data-newcode="coach">New code</button></header>
     <div style="display:flex;align-items:center;gap:14px"><span class="code">${esc(TEAM.coach_code||'')}</span><button class="btn ghost sm" data-copy="${esc(TEAM.coach_code||'')}">${ico('copy','width:15px;height:15px')}Copy</button></div>
     <p class="small muted" style="margin-top:18px">They join the same way in the app, then open this dashboard at /coach/.</p></section></div>
   <section class="card"><header><div><h2>${esc(TEAM.name)}</h2><p>${players().length} players · ${sharing().length} sharing</p></div></header>
    ${ms.length?`<table class="list"><tr><th>Name</th><th>Position</th><th>Status</th><th></th></tr>${ms.map(m=>`<tr><td><b style="color:var(--text)">${esc(m.name)}</b></td>
      <td>${m.role==='coach'?'<span class="muted">Coach</span>':`<input class="in" data-pos="${esc(m.id)}" value="${esc(m.pos||'')}" placeholder="Add position" style="max-width:200px;padding:7px 10px">`}</td>
      <td>${m.role==='coach'?'':m.share?`<span class="chip good">Sharing</span>`:'<span class="chip">Paused</span>'}${m.role!=='coach'&&m.share&&!lastCheckin(m,todayK())?' <span class="chip">No check-ins yet</span>':''}</td>
      <td style="text-align:right">${m.id!==(SESSION&&SESSION.user.id)?`<button class="btn danger sm" data-remove="${esc(m.id)}">Remove</button>`:''}</td></tr>`).join('')}</table>`:'<div class="empty">No one yet.</div>'}</section>${create}`}

function render(){TIPS={};tipN=0;const rt=route();const root=$('#root');
  if(!SESSION){root.innerHTML=gateHTML();return}
  const title=rt.v==='player'?'Player':(VIEWS.find(v=>v[0]===rt.v)||VIEWS[0])[1];
  let body;if(LOADING)body='<div class="spin"></div>';else if(rt.v==='setup')body=viewSetup();else if(rt.v==='player')body=viewPlayer(rt.id);else if(rt.v==='trends')body=viewTrends();else if(rt.v==='load')body=viewLoad();else if(rt.v==='wellness')body=viewWellness();else if(rt.v==='avail')body=viewAvail();else body=viewToday();
  const sy=scrollY;root.innerHTML=shell(body,title);if(render._v===location.hash)scrollTo(0,sy);else scrollTo(0,0);render._v=location.hash}
function gateHTML(){return `<div class="gate"><form class="gcard" id="login"><img src="/keel-wordmark.svg" alt="keel"><div><h1>Coach dashboard</h1><p class="muted small" style="margin-top:4px">Sign in with your Keel account.</p></div>
  <div class="field"><label for="em">Email</label><input class="in" id="em" type="email" autocomplete="email" required></div>
  <div class="field"><label for="pw">Password</label><input class="in" id="pw" type="password" autocomplete="current-password" required></div>
  <button class="btn" type="submit">Sign in</button><a class="small muted" href="/p2/">Forgot your password, or no account yet? Use the Keel app.</a></form></div>`}

// ================= events =================
window.addEventListener('hashchange',render);
document.addEventListener('click',async e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
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
});
document.addEventListener('change',async e=>{const t=e.target;
  if(t.id==='teamSel'){await selectTeam(t.value);return}
  if(t.dataset.pos){const {error}=await sb.from('team_members').update({pos:t.value.trim()||null}).eq('team_id',TEAM.team_id).eq('user_id',t.dataset.pos);if(error){toast(error.message);return}const p=SQUAD.find(x=>x.id===t.dataset.pos);if(p)p.pos=t.value.trim();toast('Saved')}});
document.addEventListener('submit',async e=>{if(e.target.id!=='login')return;e.preventDefault();const {error}=await sb.auth.signInWithPassword({email:$('#em').value.trim(),password:$('#pw').value});if(error){toast(error.message,4000);return}location.reload()});
const demoTeam=()=>({team_id:DEMO_ID,name:'Demo squad',role:'coach'});

// ================= start =================
(async()=>{
  try{const cfg=await fetch('/api/config').then(r=>r.json());if(!cfg.url||!cfg.anonKey)throw 0;sb=window.supabase.createClient(cfg.url,cfg.anonKey)}
  catch(e){if(/[?&]preview\b/.test(location.search)){SESSION={user:{email:'preview',id:'x'}};TEAMS=[demoTeam()];TEAM=TEAMS[0];SQUAD=buildDemo();render();return}
    $('#root').innerHTML='<div class="gate"><div class="gcard"><h1>Not set up yet</h1><p class="muted">The dashboard can\'t reach the database settings.</p></div></div>';return}
  const {data:{session}}=await sb.auth.getSession();SESSION=session;if(!session){render();return}
  TEAMS=await loadTeams();TEAMS.push(demoTeam());let want=null;try{want=localStorage.getItem('keelCoachTeam')}catch(e){}
  if(!TEAMS.some(t=>t.team_id===want))want=TEAMS[0].team_id;if(ERR==='setup')location.hash='setup';
  await selectTeam(want);
})();
})();
