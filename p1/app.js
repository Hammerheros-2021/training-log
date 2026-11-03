
(function(){
// ================= plan data =================
let START=new Date(2026,10,9), FIRST=new Date(2026,10,13), END=new Date(2027,1,28); const DAY=864e5;
let TYPES=['S','E','H','R','T','R','X']; const DOW=['MON','TUE','WED','THU','FRI','SAT','SUN'];
const TNAME={S:'Strength',E:'Easy run',H:'Hyrox class',T:'Threshold',X:'Speed + long',R:'Rest',O:'Other training'};
const TVAR={S:'--s',E:'--e',H:'--h',T:'--t',X:'--x',R:'--r',O:'--o'};
let PHN=['Foundation','Build','Specific','Pitch-ready']; const PHC=['#3C8DAD','#2E8B57','#D4952B','#B23A48'];
let THR=["5 km time trial","4×5' / 90s jog","4×6' / 90s jog","3×6' / 90s jog","3×8' / 2' jog","3×10' / 2' jog","3×6' / 90s jog","4×8' / 90s jog","3×12' / 2' jog","4×10' / 90s jog","2×20' / 3' jog","5 km re-test","3×12' / 2' jog","2×15' / 3' jog","3×10' / 2' jog","2×12' / 2' jog"];
let THRMIN=[0,20,24,18,24,30,18,32,36,40,40,0,36,30,30,24];
let EASY=[35,35,40,30,40,45,30,45,45,45,45,35,40,40,40,35];
let LONG=[45,50,55,40,55,60,40,60,60,65,65,45,50,50,45,45];
let DELOAD={4:'Deload',7:'Christmas deload',12:'Test + deload'};
const WARMUP=[["Easy jog or bike","5'"],["Leg swings, forward / sideways","10 each"],["Walking lunge + twist","8 / leg"],["A-skips","2 × 15 m"],["B-skips","2 × 15 m"],["High knees / butt kicks","2 × 15 m"],["Carioca","2 × 15 m each way"],["Build-up runs","60 / 70 / 80%"]];
const CORE=[["Push-ups","12"],["Dumbbell or band row","12"],["Dead bug","8 / side"],["Side plank","30 s / side"],["Glute bridge march","10 / side"],["Plank shoulder taps","20"]];
const MOBILITY=[["Couch stretch (hip flexor)","60 s / side"],["90/90 hip switches","10"],["Adductor rock-backs","10 / side"],["Calf wall stretch","45 s / side"],["Thoracic open books","8 / side"],["Deep squat hold","60 s"],["Hamstring floss (lying)","10 / side"]];
let STRENGTH=[
 {tag:'0',nm:'Accelerations',cue:'Lit footpath, flat road or gym floor. Walk back = recovery.',d:['4 × 20 m @ 80%','5 × 20 m @ 85-90%','6 × 20 m @ 90%','4 × 20 m @ 95%']},
 {tag:'A1',nm:'Trap-bar deadlift',cue:'Push the floor away, flat back. Rest 2-3 min.',d:['3 × 8 · RPE 6-7','4 × 6 · RPE 7-8','4 × 4 · RPE 8','3 × 3 · RPE 8']},
 {tag:'A2',nm:['Pogo hops','Hurdle hops','Lateral bounds','Bound into 10 m sprint'],cue:'Superset with A1. Quick, springy contacts.',d:['3 × 15','3 × 6','3 × 5 / side','3 × 3']},
 {tag:'B1',nm:'Rear-foot elevated split squat',cue:'Back foot on bench, upright, knee over toes.',d:['3 × 8 / leg · light','3 × 8 / leg · heavier','3 × 6 / leg · heavy','2 × 6 / leg · heavy']},
 {tag:'B2',nm:'Nordic hamstring curl',cue:'Anchor the ankles. Fight it all the way down.',d:['2 × 4','3 × 5','3 × 6','2 × 5']},
 {tag:'C1',nm:'Copenhagen plank',cue:'Hips high, body straight.',d:['3 × 20 s / side · knee','3 × 20 s / side · foot','3 × 30 s / side · foot','2 × 30 s / side · foot']},
 {tag:'C2',nm:'Single-leg calf raise',cue:'Straight + bent knee. 3 s down, pause top.',d:['3 × 12 each','3 × 15 each','3 × 12 · holding DB','2 × 12 · holding DB']},
 {tag:'D',nm:'Pallof press',cue:'Resist the twist, ribs down.',d:['3 × 10 / side','3 × 10 / side','3 × 12 / side','2 × 12 / side']}];
let SPEED=[
 {tag:'1',nm:'Sprints',cue:'Tall, relaxed, fast arms. Walk back to recover.',d:['Build-ups 4 × 40 m @ 75-85%','5 × 30 m @ 90%','Flying 20s × 4 @ 95%','4 × 30 m @ 95-100%']},
 {tag:'2',nm:'5-0-5 turns',cue:'Sprint 15 m, plant, turn 180°, sprint 5 m back. Alternate feet.',d:['4 reps @ 70%','6 reps @ 85%','6 reps @ max','4 reps @ max']},
 {tag:'3',nm:'Curved runs',cue:'Arc around a cone, lean in, both directions.',d:['3 × 30 m @ 80%','4 × 40 m @ 85%','4 × 40 m @ 90%','2 each way @ 90%']},
 {tag:'4',nm:'Decel to stop',cue:'Accelerate, stop dead in 3 steps, low hips.',d:['4 × 15 m','4 × 20 m','4 × 20 m + 45° cut','3 × 20 m + 45° cut']}];
const AREAS=['Hamstring','Groin / adductor','Quad','Calf / Achilles','Knee','Ankle','Foot','Hip / glute','Lower back','Shoulder','Neck / upper back','Other'];
const SIDES=['Left','Right','Both'];
const FARM=['None','Light','Moderate','Heavy','Very heavy'];
const HABITS=['Saw sunrise','Read','Learned something','Breathwork / meditation','Walk','Mobility / stretch','Yoga / pilates','Easy cycle','Swim / sea swim','Ice bath / cold water','Hot tub / sauna','Foam roll / massage','Nap'];
const DAYTAGS=['Work day','Day off','Relaxed day','Holiday','Travelling','Sick / run down'];
const FLAGS=['Sick / run down'];
let EXTRA_KINDS=['Club training','Match','Extra class','Gym','Run','Other'];
const FASTED=()=>!PROFILE||!PROFILE.plan||PROFILE.plan.fasted!==false;
let ABOUT='',WORK='Manual labour',KEYLIFTS=['Trap-bar deadlift','Split squat'],CLASSNOTE='Your fixed morning class',PORTION='an 82 kg active man',APPROACH='lower-carb, not strict keto';
const HCATS=['Run','Ski erg','Row','Bike','Sled push','Sled pull','Burpee broad jumps','Wall balls','Lunges','Farmers carry','Kettlebell','Strength','Plyometrics','Core','Other'];
const REGIONS=['Quads','Hamstrings','Glutes','Calves','Hips / groin','Lower back','Core','Shoulders','Upper back','Chest','Grip / forearms'];

// ================= helpers =================
const $=s=>document.querySelector(s);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const addD=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtD=(d,o)=>d.toLocaleDateString('en-IE',o||{weekday:'short',day:'numeric',month:'short'});
const short=d=>fmtD(d,{day:'numeric',month:'short'});
const todayDate=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate())};
function planFor(d){const wk=Math.floor((d-START)/DAY/7)+1, di=(d.getDay()+6)%7;if(wk<1||wk>16)return null;const p=Math.floor((wk-1)/4);const k=iso(d);const base=weekFor(k)[di];const a=adjFor(k);const type=a&&TNAME[a.type]?a.type:base;return {wk,p,di,type,base,adj:a,pre:d<FIRST}}
const toSec=s=>{if(!s)return null;const m=String(s).trim().match(/^(\d+):(\d{1,2})$/);return m?(+m[1])*60+(+m[2]):null};
const fromSec=t=>Math.floor(t/60)+':'+pad(Math.round(t%60));
const clampDate=d=>d<FIRST?FIRST:(d>END?END:d);
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const isNum=v=>v!==null&&v!==undefined&&v!==''&&!isNaN(+v);
const clone=o=>JSON.parse(JSON.stringify(o));

// ================= time + readiness =================
const tmin=s=>{if(!s)return null;const m=String(s).match(/^(\d{1,2}):(\d{2})/);return m?(+m[1])*60+(+m[2]):null};
const fmtT=m=>{if(m==null)return '-';m=((Math.round(m)%1440)+1440)%1440;return pad(Math.floor(m/60))+':'+pad(m%60)};
function sleepHours(d){if(!d)return null;if(d.latency!=null||d.awakeMin!=null){const p=p1SleepCalc(d);if(p!=null)return p}const b=tmin(d.bed),w=tmin(d.wake);if(b!=null&&w!=null){let x=w-b;if(x<=0)x+=1440;return Math.round(x/6)/10}return isNum(d.sleepH)?+d.sleepH:null}
function screenGap(d){if(!d)return null;const b=tmin(d.bed),s=tmin(d.screenOff);if(b==null||s==null)return null;let x=b-s;if(x<-720)x+=1440;if(x>720)x-=1440;return x}
const has=(d,tag)=>!!(d&&((d.habits||[]).includes(tag)||(d.flags||[]).includes(tag)));
function baseline(map,dIso,field){const v=[];for(let i=1;i<=14;i++){const x=map[iso(addD(parse(dIso),-i))];if(x&&isNum(x[field]))v.push(+x[field])}return v.length>=4?avg(v):null}
const maxPain=d=>d&&d.niggles&&d.niggles.length?Math.max(...d.niggles.map(n=>+n.pain||0)):0;
function readiness(d,map){
  if(!d)return null;map=map||D();const parts=[];const sh=sleepHours(d);
  if(sh!=null)parts.push([.2,Math.max(0,Math.min(1,(sh-5)/3))]);
  if(isNum(d.sleepQ))parts.push([.15,(d.sleepQ-1)/4]);
  if(isNum(d.energy))parts.push([.15,(d.energy-1)/4]);
  if(isNum(d.mood))parts.push([.1,(d.mood-1)/4]);
  if(isNum(d.stress))parts.push([.1,(5-d.stress)/4]);
  if(isNum(d.sore))parts.push([.1,(5-d.sore)/4]);
  const bh=isNum(d.hrv)?baseline(map,d.date,'hrv'):null;if(bh)parts.push([.1,Math.max(0,Math.min(1,.5+(d.hrv/bh-1)*2.5))]);
  const br=isNum(d.rhr)?baseline(map,d.date,'rhr'):null;if(br)parts.push([.05,Math.max(0,Math.min(1,.5-(d.rhr-br)/10))]);
  if(parts.length<3)return null;
  const mp=maxPain(d);parts.push([.1,1-mp/10]);
  const w=parts.reduce((a,p)=>a+p[0],0);let s=Math.round(100*parts.reduce((a,p)=>a+p[0]*p[1],0)/w);
  if(mp>=5)s=Math.min(s,40);else if(mp>=3)s=Math.min(s,60);
  if(has(d,'Sick / run down'))s=Math.min(s,50);
  return s;
}
const rColor=s=>s==null?'transparent':s>=75?'var(--ok)':s>=55?'var(--warn)':'var(--bad)';
function rVerdict(s,d){
  const mp=maxPain(d);
  if(mp>=5)return ['var(--bad)','Stop and get it checked.','Pain of 5/10 or more. No sprints or heavy lifting until it has been looked at.'];
  if(mp>=3)return ['var(--warn)','Modify today.','A niggle at 3-4/10: drop sprints, go lighter, easy running only.'];
  if(has(d,'Sick / run down'))return ['var(--bad)','Rest or go very easy.','Feeling run down. Above the neck only and mild: easy 20-30 min at most. Anything more: rest.'];
  if(s==null)return ['var(--muted)','Not enough to score yet.','Add sleep and how you feel to get a balance score.'];
  if(s>=75)return ['var(--ok)','Train as planned.','Recovery looks good.'];
  if(s>=55)return ['var(--warn)','Train, but cap the effort.','Do the session, hold effort a notch below target, skip any extras.'];
  return ['var(--bad)','Back off today.','Swap for an easy run or the mobility routine and get to bed early.'];
}

// strain (0-21) and sleep need, in the spirit of Whoop / Oura but from your own logs
function dayLoadAll(k){const d=D()[k];const farm=d&&isNum(d.farmHrs)&&isNum(d.farm)?(+d.farmHrs)*[0,.5,1,1.5,2][+d.farm]*60:0;return sRPE(L()[k])+extrasLoad(d)+farm}
function strain(k){const d=D()[k];if(!d&&!L()[k])return null;const ld=dayLoadAll(k);if(!ld)return null;return Math.round(210*(1-Math.exp(-ld/1500)))/10}
function sleepNeed(k){const s=strain(iso(addD(parse(k),-1)));return Math.round((8+Math.max(0,(s||0)-10)*.1)*10)/10}
function sleepDebt(k){let debt=0,n=0;for(let i=0;i<7;i++){const kk=iso(addD(parse(k),-i)),sh=sleepHours(D()[kk]);if(sh!=null){debt+=Math.max(0,sleepNeed(kk)-sh);n++}}return n?Math.round(debt*10)/10:0}

// ================= state =================
let logs={}, days={}, meta={};
let logsCol=null, daysCol=null, metaCol=null, assets=null, sample=null, canImg=false;
let sampleMode=false;
let sel=todayDate();
let sDraft=null, dDraft=null, sDirty=false, dDirty=false, dEdit=false, confirmDel=false;
let scanState=null;
let aiState={busy:false,text:'',err:''};
function toast(m,ms){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(t._h);t._h=setTimeout(()=>t.hidden=true,ms||2200)}
const L=()=>sampleMode?SAMPLE.logs:logs;
const D=()=>sampleMode?SAMPLE.days:days;

// ================= session content =================
function exRow(tag,nm,cue,dose){return `<div class="ex"><span class="tag">${esc(tag)}</span>${nm&&!HOWTO_SKIP.test(nm)&&nm!==TNAME.H?`<button type="button" class="nm howto" data-howto="${esc(nm)}">${esc(nm)} <i>How to</i></button>`:`<span class="nm">${esc(nm)}</span>`}<span class="dose">${esc(dose)}</span>${cue?`<span class="cue">${esc(cue)}</span>`:''}</div>`}
const listRows=(list)=>list.map((r,i)=>exRow(String(i+1),r[0],'',r[1])).join('');
const warmupBlock=()=>`<details class="wu"><summary>15-minute warm-up</summary>${listRows(WARMUP)}</details>`;
function latest5k(before){let b=null;Object.values(L()).forEach(l=>{if(toSec(l.fivek)&&(!before||l.date<=before)&&(!b||l.date>b.date))b=l});return b}
function sessionHTML(d,pl){
  const k=pl.type,wi=pl.wk-1,p=pl.p,dl=DELOAD[pl.wk];let title=TNAME[k],sub='',body='',extra='';
  if(k==='S'){sub="Gym legs + accelerations · about 60'";
    body=STRENGTH.map(e=>exRow(e.tag,Array.isArray(e.nm)?e.nm[p]:e.nm,e.cue,e.d[p])).join('');
    if(dl)extra+=`<div class="note"><b>${dl} week.</b> 2 sets of everything at the same weight.</div>`;
    if(p===3)extra+=`<div class="note"><b>February.</b> If club S&amp;C is on, it replaces A1 and B1. Keep Nordics, Copenhagens and calves.</div>`;
    extra+=warmupBlock();}
  else if(k==='E'){sub=`${EASY[wi]}' conversational, then 15' core &amp; upper`;
    body=exRow('','Easy run','RPE 3-4. Full sentences. Should feel too slow.',EASY[wi]+"'")+`<div class="label" style="margin-top:12px">Core &amp; upper · 3 rounds</div>`+listRows(CORE);}
  else if(k==='H'){sub=CLASSNOTE;body=exRow('',TNAME.H,'Hard session: RPE 7-9. Scale it if legs are heavy from earlier in the week.',"45-60'");}
  else if(k==='T'){const test=!THRMIN[wi];
    if(test){title=pl.wk===1?'5 km baseline':'5 km re-test';sub='Flat route, all out after the warm-up';body=exRow('','5 km time trial','Even pacing. Log your time: it sets your threshold pace.','5 km');}
    else{sub=`${THR[wi]} · about 50' total`;const t5=latest5k(iso(d));let pace='5 km pace + 15-20 s/km';
      if(t5){const s=toSec(t5.fivek)/5;pace=fromSec(s+15)+'-'+fromSec(s+20)+' /km';}
      body=exRow('W','Warm-up','Include 3 strides.',"15'")+exRow('1','Threshold reps','RPE 7, comfortably hard.',THR[wi].split(' /')[0])+exRow('','Recovery jog','',THR[wi].split('/ ')[1]||'')+exRow('C','Cool-down','Easy jog.',"10'")+
        `<div class="note"><b>Your threshold pace:</b> ${esc(pace)}${t5?` <span style="color:var(--muted)">(from 5 km of ${esc(t5.fivek)})</span>`:''}</div>`;}
    extra+=warmupBlock();}
  else if(k==='X'){title='Speed + long run';sub=`After sunrise on grass · 20' block then ${LONG[wi]}' easy`;
    body=SPEED.map(e=>exRow(e.tag,e.nm,e.cue,e.d[p])).join('');
    if(pl.wk===10||pl.wk===11)body+=exRow('5','Repeated sprints','One 30 m sprint every 30 s.','2 × 6 × 30 m');
    body+=exRow('R','Long easy run',"RPE 3-4. Last 5': 4 × 15 s strides.",LONG[wi]+"'");
    extra+=`<div class="note"><b>Hamstring tight?</b> Skip the sprints, turns at 60%, easy part only.</div>`+warmupBlock();}
  else{if(pl.di===3){title='Rest + mobility';sub="Rest day. 10' mobility only.";body=listRows(MOBILITY)+`<a class="ghost vidlink" href="#mobility">Do a follow-along session in Mobility ›</a>`;}
    else{title='Rest';sub='Full rest. Recovery is where you get fitter.';body=`<div class="note">Walk, family and GAA coaching are all fine.</div>`;}}
  const chips=[`Week ${pl.wk}`,PHN[p]];if(dl)chips.push(dl);
  return `<article class="card" style="--c:var(${TVAR[k]})"><div class="shead"><div class="meta">${chips.map(c=>`<span class="chip">${esc(c)}</span>`).join('')}</div><h2>${title}</h2><div class="sub">${sub}</div></div>
    <div class="sbody">${body}${extra}</div>${k!=='R'?sessionForm(d,pl):''}</article>`;
}

// ================= binding helpers =================
function seg(form,field,vals,cur,labels,cls){return `<div class="seg ${cls||''}">${vals.map((v,i)=>`<button type="button" data-form="${form}" data-seg="${field}" data-v="${v}" aria-pressed="${cur!=null&&String(cur)===String(v)}">${labels?labels[i]:v}</button>`).join('')}</div>`}
function getPath(o,path){return path.split('.').reduce((a,k)=>a==null?a:a[k],o)}
function setPath(o,path,v){const ks=path.split('.');let a=o;for(let i=0;i<ks.length-1;i++){a=a[ks[i]]}a[ks[ks.length-1]]=v}
function readAll(){
  document.querySelectorAll('[data-bind]').forEach(el=>{
    const [form,...rest]=el.dataset.bind.split('.');const path=rest.join('.');const tgt=form==='s'?sDraft:form==='y'?yDraft:dDraft;if(!tgt)return;
    let v;if(el.type==='checkbox')v=el.checked;else if(el.type==='number'||el.type==='range')v=el.value===''?null:Number(el.value);else v=el.value;
    try{setPath(tgt,path,v)}catch(e){}
  });
}

// ================= daily check-in =================
const CHECKIN_KEYS=['bed','wake','screenOff','sleepQ','energy','mood','stress','sore','niggles','rhr','weight','flags','notes','trainIntent','trainTime'];
const FOOD_KEYS=['food','diary','water','lastCaffeine','firstMeal','lastMeal','dayType','trainTime'];
function blankDay(dIso){const x=D()[dIso];const b={date:dIso,niggles:[],habits:[],flags:[],extras:[],food:[]};return x?Object.assign(b,clone(x)):b}
const pick=(o,keys)=>{const r={};keys.forEach(k=>{if(o[k]!==undefined)r[k]=o[k]});return r};
function gauge(s){const r=26,c=2*Math.PI*r,v=s==null?0:s/100;return `<div class="gauge"><svg viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="${r}" style="fill:none;stroke:var(--line);stroke-width:7"/><circle cx="32" cy="32" r="${r}" transform="rotate(-90 32 32)" style="fill:none;stroke:${rColor(s)};stroke-width:7;stroke-linecap:round" stroke-dasharray="${(c*v).toFixed(1)} ${c.toFixed(1)}"/></svg><b>${s??'-'}</b></div>`}
function dayFilled(d){return d&&(isNum(d.farm)||isNum(d.deskHrs)||isNum(d.carHrs)||isNum(d.familyHrs)||(d.habits||[]).length)}
const Y_KEYS=['farm','farmHrs','deskHrs','carHrs','familyHrs','steps','habits','extras'];
let yDraft=null,ciState={text:'',busy:false,msg:'',hide:false};
const prevKey=k=>iso(addD(parse(k),-1));
function workPrefs(){const w=meta.work;if(w&&typeof w==='object')return Object.assign({manual:true,desk:true,car:true,family:true},w);
  let j='';try{j=(typeof PROFILE!=='undefined'&&PROFILE&&PROFILE.answers&&PROFILE.answers.job)||''}catch(e){}
  if(!j)return {manual:true,desk:true,car:true,family:true};
  return {manual:/Physical|Mixed|Shift/.test(j),desk:/Desk|Mixed/.test(j),car:false,family:true}}
const WORK_PARTS=[['manual','Manual labour'],['desk','Desk / office'],['car','Driving'],['family','Family time']];
function checkinSummary(saved){
  const s=readiness(saved);const [vc,vh,vt]=rVerdict(s,saved);const sh=sleepHours(saved),sg=screenGap(saved);
  const y=D()[prevKey(saved.date)]||{};const wp=workPrefs();
  const m=[],dd=[];
  if(sh!=null)m.push(`Sleep <b>${sh} h</b>${saved.bed?` · ${esc(saved.bed)}-${esc(saved.wake||'?')}`:''}`);
  if(isNum(saved.sleepQ))m.push(`Quality <b>${saved.sleepQ}/5</b>`);
  if(sg!=null)m.push(`Screens off <b>${sg} min</b> before bed`);
  if(isNum(saved.energy))m.push(`Energy <b>${saved.energy}/5</b>`);
  if(isNum(saved.mood))m.push(`Mood <b>${saved.mood}/5</b>`);
  if(isNum(saved.stress))m.push(`Stress <b>${saved.stress}/5</b>`);
  if(isNum(saved.sore))m.push(`Soreness <b>${saved.sore}/5</b>`);
  if(isNum(saved.rhr))m.push(`Pulse <b>${saved.rhr}</b>`);
  const need=sleepNeed(saved.date),debt=sleepDebt(saved.date);if(need)m.push(`Sleep need <b>${need} h</b>${debt>0.2?` · debt <b style="color:${debt>=3?'var(--bad)':'var(--warn)'}">${debt} h</b> this week`:''}`);
  (saved.niggles||[]).forEach(n=>m.push(`<span style="color:${+n.pain>=5?'var(--bad)':+n.pain>=3?'var(--warn)':'inherit'}">${esc(n.side&&n.side!=='Both'?n.side+' ':'')}${esc(n.area)} <b>${n.pain}/10</b></span>`));
  (saved.flags||[]).forEach(f=>m.push(`<span style="color:var(--bad)">${esc(f)}</span>`));if(intentChip(saved))m.push(`<b>${intentChip(saved)}</b>`);
  const stn=strain(prevKey(saved.date));if(stn!=null)dd.push(`Strain <b>${stn}</b> / 21`);
  if(wp.manual&&isNum(y.farm))dd.push(`Manual labour <b>${FARM[y.farm]}</b>${isNum(y.farmHrs)?` · ${y.farmHrs} h`:''}`);
  if(wp.desk&&isNum(y.deskHrs))dd.push(`Desk <b>${y.deskHrs} h</b>`);
  if(wp.car&&isNum(y.carHrs))dd.push(`Driving <b>${y.carHrs} h</b>`);
  if(wp.family&&isNum(y.familyHrs))dd.push(`Family time <b>${y.familyHrs} h</b>`);
  if(isNum(y.steps))dd.push(`Steps <b>${(+y.steps).toLocaleString('en-IE')}</b>`);
  (y.habits||[]).forEach(h=>dd.push(esc(h)));
  (y.extras||[]).forEach(x=>dd.push(`${esc(x.kind)} <b>${x.dur||'?'}'</b>`));
  return `<article class="card"><div class="chead">${gauge(s)}<div style="flex:1;min-width:0"><h2>Check-in done</h2><div class="sub">Balance ${s??'-'} / 100</div></div><button type="button" class="editbtn" id="dEditBtn">✎ Edit</button></div>
    <div class="verdict" style="--vc:${vc};margin-top:12px"><b>${vh}</b> ${vt}</div>
    <div class="label" style="padding:0 16px">Last night &amp; this morning</div><div class="chips">${m.map(c=>`<span>${c}</span>`).join('')||'<span>Not filled in</span>'}</div>
    <div class="label" style="padding:0 16px">Yesterday, ${fmtD(parse(prevKey(saved.date)),{weekday:'long'})}</div><div class="chips">${dd.map(c=>`<span>${c}</span>`).join('')||'<span>Not filled in</span>'}</div>
    <div style="padding:0 16px 16px"><button type="button" class="editwide" id="dEditBtn2">✎ Edit or add to this check-in</button></div></article>`;
}
function ciDictbar(){
  if(!sample)return '';
  if(ciState.hide)return `<button type="button" class="dictmini" id="ciShow">${MIC}<span>Say it instead of tapping</span></button>`;
  return `<div class="dictbar"><div class="dbh">${MIC}<div style="flex:1;min-width:0"><b>Say it instead of tapping</b><small>Talk through the questions below as you scroll. Ratings are 1 to 5.</small></div><button type="button" class="linkbtn" id="ciHide" style="padding:0">Hide</button></div>
    <textarea id="ci-say" rows="2" placeholder="e.g. Bed half eleven, up at seven, slept well, 4. Energy 4, mood 4, stress 2, soreness 3. Yesterday 6 hours of heavy work, an hour driving, an hour with the kids.">${esc(ciState.text)}</textarea>
    <div class="actions">${speakBtn('ci-say')}<button type="button" class="primary" id="ciFill" ${ciState.busy?'disabled':''}>${ciState.busy?'Filling in…':'Fill in the form'}</button></div>
    ${ciState.msg?`<div class="hsum" role="status">${ciState.msg}</div>`:''}</div>`;
}
function checkinHTML(dIso){
  const saved=D()[dIso];
  if(saved&&!dEdit&&(saved.bed||isNum(saved.energy)||isNum(saved.sleepQ)))return checkinSummary(saved);
  const f=dDraft,y=yDraft,pv=maxPain(f),sh=sleepHours(f),sg=screenGap(f),wp=workPrefs();const yk=prevKey(dIso);
  const nig=(f.niggles||[]).map((n,i)=>`<div class="nig">
      <select data-bind="d.niggles.${i}.area" aria-label="Body area">${AREAS.map(a=>`<option ${a===n.area?'selected':''}>${a}</option>`).join('')}</select>
      <select data-bind="d.niggles.${i}.side" aria-label="Side">${SIDES.map(a=>`<option ${a===n.side?'selected':''}>${a}</option>`).join('')}</select>
      <button type="button" class="x" data-del-nig="${i}" aria-label="Remove">×</button>
      <div class="pr full"><input type="range" min="0" max="10" step="1" value="${+n.pain||0}" data-bind="d.niggles.${i}.pain" data-live="nig${i}" aria-label="Pain 0-10"><output id="nig${i}">${+n.pain||0}/10</output></div>
      <input class="full" type="text" placeholder="What brought it on? e.g. sprints, lifting, a long shift" value="${esc(n.note||'')}" data-bind="d.niggles.${i}.note">
      <div class="full kinjf"><label class="label">Is it stopping you?</label><select data-bind="d.niggles.${i}.kind" data-live="k${i}"><option value="Niggle" ${n.kind!=='Injury'?'selected':''}>Niggle: I can carry on</option><option value="Injury" ${n.kind==='Injury'?'selected':''}>Injury: it changes what I can do</option></select>
      ${n.kind==='Injury'?`<div class="row2"><div class="field"><label class="label">Expected to last (weeks)</label><input type="number" inputmode="decimal" step="0.5" min="0" value="${n.weeks??''}" data-bind="d.niggles.${i}.weeks"></div><div class="field"><label class="label">Training allowed</label><select data-bind="d.niggles.${i}.load" data-live="l${i}"><option value="100" ${n.load==='100'?'selected':''}>Full, with care</option><option value="50" ${n.load==='50'||!n.load?'selected':''}>About half</option><option value="0" ${n.load==='0'?'selected':''}>None</option></select></div></div>
      ${n.load==='0'?`<div class="row2"><div class="field"><label class="label">No training until</label><input type="date" value="${esc(n.offUntil||'')}" data-bind="d.niggles.${i}.offUntil"></div><div class="field"><label class="label">Rehab starts</label><input type="date" value="${esc(n.rehabFrom||'')}" data-bind="d.niggles.${i}.rehabFrom"></div></div>`:''}`:''}</div></div>`).join('');
  const ext=(y.extras||[]).map((x,i)=>`<div class="extra">
      <select data-bind="y.extras.${i}.kind" aria-label="Activity">${EXTRA_KINDS.map(a=>`<option ${a===x.kind?'selected':''}>${a}</option>`).join('')}</select>
      <input type="number" inputmode="numeric" placeholder="min" value="${x.dur??''}" data-bind="y.extras.${i}.dur" aria-label="Minutes">
      <input type="number" inputmode="numeric" placeholder="RPE" min="1" max="10" value="${x.rpe??''}" data-bind="y.extras.${i}.rpe" aria-label="Effort 1-10">
      <button type="button" class="x" data-del-ext="${i}" aria-label="Remove">×</button></div>`).join('');
  const sc=(lo,hi)=>`<div class="scale"><span>1 = ${lo}</span><span>5 = ${hi}</span></div>`;
  const num=(id,lab,bind,step,val,mode)=>`<div class="field"><label class="label" for="${id}">${lab}</label><input id="${id}" type="number" inputmode="${mode||'decimal'}" step="${step}" value="${val??''}" data-bind="${bind}"></div>`;
  const tm=(id,lab,bind,val)=>`<div class="field"><label class="label" for="${id}">${lab}</label><input id="${id}" type="time" value="${esc(val||'')}" data-bind="${bind}" data-recalc="1"></div>`;
  const miss=f.date===iso(todayDate())?[!f.bed&&'bed time',!f.wake&&'wake time',!isNum(f.sleepQ)&&'sleep quality',!isNum(f.energy)&&'energy',!isNum(f.mood)&&'mood',!isNum(f.stress)&&'stress',!isNum(f.sore)&&'soreness'].filter(Boolean):[];
  const workRows=[wp.manual?`<div class="field"><span class="label">Manual labour</span>${seg('y','farm',[0,1,2,3,4],y.farm,FARM,'small')}</div>`:'',
    `<div class="row2">${wp.manual?num('y-fh','Manual labour (h)','y.farmHrs',0.5,y.farmHrs):''}${wp.desk?num('y-desk','Desk / office (h)','y.deskHrs',0.5,y.deskHrs):''}${wp.car?num('y-car','Driving (h)','y.carHrs',0.5,y.carHrs):''}${wp.family?num('y-fam','Quality time with family (h)','y.familyHrs',0.5,y.familyHrs):''}${num('y-steps','Steps','y.steps',100,y.steps,'numeric')}</div>`].join('');
  return `${ciActions()}${dIso===iso(todayDate())?intentHTML(dIso,f):''}<article class="card"><div class="chead"><div style="flex:1"><h2>Morning check-in</h2><div class="sub">About last night, this morning, and yesterday's day. Ratings are 1 to 5.</div></div></div>
  <form class="form" id="dayForm" autocomplete="off">
    ${miss.length&&miss.length<7?`<div class="alert amber">Still to answer: ${miss.join(', ')}.</div>`:''}
    <div class="group"><h4><span class="qn">1</span>Last night</h4>
      <div class="row3">${tm('d-bed','To bed','d.bed',f.bed)}${tm('d-wake','Up','d.wake',f.wake)}${tm('d-scr','Screens off','d.screenOff',f.screenOff)}</div>
      <div class="hint" id="sleepCalc" style="font-size:13px;color:var(--muted)">${sh!=null?`<b style="color:var(--fg)">${sh} h</b> in bed`:'Enter bed and wake times'}${sg!=null?` · screens off <b style="color:${sg>=60?'var(--ok)':'var(--warn)'}">${sg} min</b> before bed`:''}</div>
      <div class="field"><span class="label">Sleep quality (1-5)</span>${seg('d','sleepQ',[1,2,3,4,5],f.sleepQ)}${sc('broken','deep')}</div></div>
    <div class="group"><h4><span class="qn">2</span>How you feel this morning</h4>
      <div class="field"><span class="label">Energy (1-5)</span>${seg('d','energy',[1,2,3,4,5],f.energy)}${sc('flat','flying')}</div>
      <div class="field"><span class="label">Mood (1-5)</span>${seg('d','mood',[1,2,3,4,5],f.mood)}${sc('low','great')}</div>
      <div class="field"><span class="label">Stress (1-5)</span>${seg('d','stress',[1,2,3,4,5],f.stress)}${sc('calm','very stressed')}</div>
      <div class="field"><span class="label">Muscle soreness (1-5)</span>${seg('d','sore',[1,2,3,4,5],f.sore)}${sc('fresh','very sore')}</div>
      <div class="tags">${FLAGS.map(r=>`<button type="button" data-flag="${r}" aria-pressed="${(f.flags||[]).includes(r)}">${r}</button>`).join('')}</div></div>
    <div class="group"><h4><span class="qn">3</span>Niggles &amp; injuries <small>pain 0-10</small></h4>${nig||'<div style="font-size:13px;color:var(--muted)">Nothing flagged. Add anything that hurts, even a little.</div>'}
      ${pv>=5?'<div class="alert red"><b>Stop.</b> Rest and get it looked at. Sharp or worsening pain is always red.</div>':pv>=3?'<div class="alert amber"><b>Modify.</b> Drop sprints, go lighter, easy running only until it settles.</div>':''}
      <button type="button" class="add" id="addNig">+ Add a niggle or injury</button></div>
    <div class="group"><h4><span class="qn">4</span>Body <small>optional</small></h4><div class="row2">${num('d-rhr','Morning pulse (bpm)','d.rhr',1,f.rhr,'numeric')}${num('d-kg','Weight (kg)','d.weight',0.1,f.weight)}</div>
      <div style="font-size:12px;color:var(--muted)">Count your pulse for 60 seconds before getting up. A rise of 5+ above your usual often means you are run down.</div></div>
    <div class="group"><h4><span class="qn">5</span>Yesterday, ${fmtD(parse(yk),{weekday:'long',day:'numeric',month:'short'})}</h4>
      <div class="field"><span class="label">What did your day involve yesterday?</span><div class="tags">${DAYTAGS.map(t=>`<button type="button" data-yday="${t}" aria-pressed="${(y.dayTags||[]).includes(t)}">${t}</button>`).join('')}</div></div>
      <div class="field"><span class="label">Track hours for <small style="text-transform:none;letter-spacing:0">(tap to show or hide)</small></span><div class="tags">${WORK_PARTS.map(([k,l])=>`<button type="button" data-wp="${k}" aria-pressed="${!!wp[k]}">${l}</button>`).join('')}</div></div>
      ${workRows}
      <div class="field"><span class="label">Habits and recovery yesterday</span><div class="tags">${HABITS.map(r=>`<button type="button" data-habit="${r}" aria-pressed="${(y.habits||[]).includes(r)}">${r}</button>`).join('')}</div></div>
      <div class="field"><span class="label">Anything else active yesterday?</span><div style="font-size:12px;color:var(--muted)">Club sessions, matches, classes, a long walk. It counts towards your effort.</div>${ext}<button type="button" class="add" id="addExt">+ Add a session</button></div></div>
    <div class="group"><div class="field"><label class="label" for="d-n">Notes</label><textarea id="d-n" placeholder="Late night, travel, feeling run down" data-bind="d.notes">${esc(f.notes||'')}</textarea></div></div>
    <div class="actions"><button class="primary" type="submit">Save check-in</button>${saved?'<button type="button" class="ghost" id="dCancel">Cancel</button>':''}</div>
  </form></article>`;
}
function checkinFields(c,curD,curY){
  const d={},y={};if(!c||typeof c!=='object')return {d,y};
  ['bed','wake','screenOff'].forEach(x=>{if(tmin(c[x])!=null)d[x]=fmtT(tmin(c[x]))});
  const sc=(o,x,lo,hi)=>{if(isNum(c[x]))o[x]=Math.max(lo,Math.min(hi,Math.round(+c[x])))};['sleepQ','energy','mood','stress','sore'].forEach(x=>sc(d,x,1,5));sc(y,'farm',0,4);
  if(['yes','no','extra'].includes(c.trainIntent))d.trainIntent=c.trainIntent;if(tmin(c.trainTime)!=null)d.trainTime=fmtT(tmin(c.trainTime));
  ['rhr','weight'].forEach(x=>{if(isNum(c[x])&&+c[x]>0)d[x]=+c[x]});
  ['farmHrs','deskHrs','carHrs','familyHrs','steps'].forEach(x=>{if(isNum(c[x])&&+c[x]>=0)y[x]=+c[x]});
  if(Array.isArray(c.habits)&&c.habits.length)y.habits=[...new Set((curY.habits||[]).concat(c.habits.filter(h=>HABITS.includes(h))))];
  if(Array.isArray(c.flags)&&c.flags.length)d.flags=[...new Set((curD.flags||[]).concat(c.flags.filter(h=>FLAGS.includes(h))))];
  if(Array.isArray(c.niggles)&&c.niggles.length){const nn=(curD.niggles||[]).slice();c.niggles.forEach(n=>{if(!n)return;const o={area:AREAS.includes(n.area)?n.area:'Other',side:SIDES.includes(n.side)?n.side:'Both',pain:Math.max(0,Math.min(10,Math.round(+n.pain||0))),note:String(n.note||'').slice(0,120)};const i=nn.findIndex(x=>x.area===o.area&&x.side===o.side);if(i>=0)nn[i]=o;else nn.push(o)});d.niggles=nn}
  if(Array.isArray(c.extras)&&c.extras.length){const ex=c.extras.filter(x=>x&&EXTRA_KINDS.includes(x.kind)).map(x=>({kind:x.kind,dur:isNum(x.dur)?+x.dur:null,rpe:isNum(x.rpe)?+x.rpe:null}));if(ex.length)y.extras=(curY.extras||[]).concat(ex)}
  if(c.notes)d.notes=((curD.notes?curD.notes+' ':'')+String(c.notes)).slice(0,600);
  return {d,y};
}
async function ciFill(){
  const t=$('#ci-say');const text=(t&&t.value||'').trim();ciState.text=text;if(!text){toast('Say or type something first');return}
  readAll();ciState.busy=true;ciState.msg='';render();
  try{const out=await sample.json(voicePrompt(text,true));
    const {d,y}=checkinFields(out.checkin,dDraft,yDraft);Object.assign(dDraft,d);Object.assign(yDraft,y);dDirty=true;
    const extra=Object.assign({},out,{checkin:null});const done=await applyVoice(extra);
    const n=Object.keys(d).length+Object.keys(y).length;
    ciState={text:'',busy:false,hide:false,msg:`Filled in ${n} answer${n===1?'':'s'}${done.length?` and saved ${done.join(', ')}`:''}. Check the form, fill any gaps, then tap <b>Save check-in</b>.`};
    if(!(meta.flags&&meta.flags.voice))persistMeta('flags',Object.assign({},meta.flags||{},{voice:true}));
    if(n){ciState.msg='';render();await saveDay();toast('Filled in and saved. Tap Edit to change anything.',4500);return}
  }catch(e){ciState.busy=false;ciState.msg=esc(foodErr(e))}
  render();
}

// ================= food: targets from Darren's Low-Carb Food & Nutrition Guide (Oct 2026, 82 kg) =================
const MEALS=['Breakfast','Lunch','Dinner','Snack'];
const MEAL_T={Breakfast:'08:00',Lunch:'13:00',Dinner:'19:00',Snack:'16:00'};
let DAYT={
  rest:{label:'Rest day',kcal:2700,protein:175,carbs:100,fat:175},
  training:{label:'Training day',kcal:3150,protein:180,carbs:150,fat:200},
  match:{label:'Match day',kcal:3150,protein:180,carbs:250,fat:160}};
const NUTS=[
 {k:'kcal',l:'Calories',u:'kcal',macro:1},{k:'protein',l:'Protein',u:'g',macro:1},{k:'carbs',l:'Net carbs',u:'g',macro:1},{k:'fat',l:'Fat',u:'g',macro:1},{k:'fibre',l:'Fibre',u:'g',macro:1,lo:30,hi:40},
 {k:'sodium',l:'Sodium',u:'mg',lo:3000,hi:4000},{k:'potassium',l:'Potassium',u:'mg',lo:3500,hi:4500},{k:'magnesium',l:'Magnesium',u:'mg',lo:400,hi:500},
 {k:'calcium',l:'Calcium',u:'mg',lo:1000},{k:'iron',l:'Iron',u:'mg',lo:8},{k:'zinc',l:'Zinc',u:'mg',lo:11},{k:'selenium',l:'Selenium',u:'µg',lo:55},{k:'iodine',l:'Iodine',u:'µg',lo:150},
 {k:'vitA',l:'Vitamin A',u:'µg',lo:900},{k:'vitC',l:'Vitamin C',u:'mg',lo:90,hi:200},{k:'vitD',l:'Vitamin D',u:'µg',lo:15},{k:'vitK',l:'Vitamin K',u:'µg',lo:120},
 {k:'b12',l:'Vitamin B12',u:'µg',lo:4},{k:'folate',l:'Folate',u:'µg',lo:400},{k:'choline',l:'Choline',u:'mg',lo:550},{k:'omega3',l:'Omega-3 (EPA+DHA)',u:'g',lo:1,hi:2},
 {k:'caffeine',l:'Caffeine',u:'mg',hi:400}];
const NK=NUTS.map(n=>n.k), MICRO=NUTS.filter(n=>!n.macro).map(n=>n.k);
const PLANTS_WEEK=30, WATER=[3,4];
let RULES=`- Training is always in the morning and done FASTED: water, black coffee and a SIS electrolyte tablet beforehand, nothing else.
- Break the fast with a post-training breakfast; most of the day's net carbs go in the first meals after training.
- Starch (oats, potatoes, rice, sweet potato, lentils, banana, mango) only on training and match days. Rest days stay low carb.
- 35-50 g protein per meal (150-200 g cooked meat or fish, or 3 eggs plus a shake).
- Oily fish (salmon, mackerel) 2-3 times a week; liver once a week at most.
- Fibre 30-40 g a day from vegetables, seeds and berries; aim for 30 different plants a week.
- Dairy 2-3 servings a day, plain full-fat with live cultures. Kefir starts at 100 ml.
- Usual drinks: 2 almond-milk cappuccinos and 2 teas a day (about 88 kcal, 8 g net carbs). Tea between meals, not with them. Caffeine under 400 mg, stop by mid-afternoon if sleep suffers.
- Water 3-4 L a day. Vitamin D supplement worth considering October-March.
- Match days (midday throw-in): pre-game breakfast 4 h before (oats, banana, eggs), carb top-up 90 min before, last solid food 45 min before, recovery plate within 1 h after, then post-game dinner. Avoid fry-ups, lots of raw veg, beans or lentils in the last 3 hours. No new foods on match day.
- He does not drink alcohol.`;
// meal library from the Sample Meals guide: [name, use, kcal, protein, fat, netCarbs, fibre, ingredients]
let LIB=[
 ['Farm Fry Plate','rest',593,47,41,5.7,6.8,'3 eggs, 3 back rashers, 100 g mushrooms, half an avocado, 50 g spinach, 10 g butter'],
 ['Berry Seed Yogurt Bowl','any',598,34,40,18,14,'250 g Greek yogurt, 80 g raspberries, 1 tbsp chia, 15 g pumpkin seeds, 20 g walnuts, 5 g ground flax'],
 ['Post-Training Porridge','post',851,55,37,65,15,'70 g oats, 25 g walnuts, 10 g flax, 80 g blueberries, half a banana, 1 scoop whey, 2 boiled eggs'],
 ['Tropical Recovery Bowl','post',611,39,35,31,10,'200 g Greek yogurt, 120 g papaya, 1 small guava, 20 g fresh coconut, 15 g pumpkin seeds, 2 boiled eggs'],
 ['Salmon Tray Bake','rest',711,48,38,34,12,'180 g salmon, 150 g broccoli, 1 red pepper, half a red onion, 120 g sweet potato, 15 g olive oil, 40 g sauerkraut'],
 ['Chicken Thigh Salad Bowl','training',872,57,53,34,9.6,'200 g chicken thigh, 50 g rocket, 1 tomato, third of a cucumber, half an avocado, 150 g cooled potatoes, 15 g olive oil'],
 ['Egg Muffins and Kimchi','rest',700,55,49,4.9,7.7,'4 eggs, 50 g rashers, 40 g cheddar, 100 g spinach, 50 g kimchi, half an avocado'],
 ['Mackerel and Lentil Plate','training',655,49,38,20,12,'150 g mackerel, 100 g cooked lentils, 80 g kale, 1 garlic clove, 10 g olive oil, 1 small tomato'],
 ['Ribeye, Garlic Mushrooms and Asparagus','rest',932,72,67,6.9,4.7,'250 g ribeye, 150 g asparagus, 100 g mushrooms, 1 garlic clove, 20 g butter, 30 g kimchi'],
 ['Lamb Steak, Rice and Greens','training',873,60,51,40,4.2,'200 g lamb steak, 120 g cooked rice, 100 g kale, 1 garlic clove, 10 g olive oil, 10 g butter'],
 ['Thai-Style Chicken Stir-Fry','training',795,58,43,38,5.5,'200 g chicken thigh, 100 g cabbage, 1 red pepper, 80 g mushrooms, 1 garlic clove, 15 g oil, 100 g rice (skip on rest days)'],
 ['Cauliflower Cheese, Rashers and Greens','rest',757,58,52,11,6.9,'250 g cauliflower, 60 g cheddar, 80 g rashers, 80 g spinach, 15 g butter, 2 poached eggs, 1 garlic clove'],
 ['Almond Raspberry Yogurt','snack',345,20,23,11,7,'150 g Greek yogurt, 30 g almonds, 50 g raspberries'],
 ['Kefir, Strawberries and Seeds','snack',237,12,15,14,2.5,'200 ml kefir, 80 g strawberries, 15 g pumpkin seeds'],
 ['Raspberry Walnut Brownies x2','treat',368,11,34,5.4,7,'2 squares of the almond-flour brownies'],
 ['Dragon Fruit and Coconut Cup','snack',347,16,23,17,6.6,'100 g dragon fruit, 30 g fresh coconut, 100 g Greek yogurt, 15 g pumpkin seeds'],
 ['Pre-Game Breakfast','match',686,30,29,69,14,'70 g oats, 1 banana, 15 g walnuts, 10 g flax, 2 eggs, 2 tsp honey'],
 ['Pre-Game Top-Up','match',207,3,1,46,3.5,'1 large banana, 2 rice cakes, 2 tsp honey'],
 ['Post-Game Recovery Plate','match',577,50,18,47,4.3,'3 eggs, 2 slices toast, 1 scoop whey shake, 100 g blueberries'],
 ['Post-Game Dinner','match',788,53,37,52,9.4,'200 g salmon, 250 g potatoes, 150 g broccoli, 15 g butter'],
 ['2 cappuccinos and 2 teas (almond milk)','drinks',88,2,5,8.1,1.6,'2 cafe almond cappuccinos, 2 teas with almond milk']];
const DEF_LIB=LIB, DEF_RULES=RULES, DEF_DAYT=JSON.parse(JSON.stringify(DAYT));
const DEF_PLAN={start:'2026-11-09',firstDay:'2026-11-13',week:TYPES.slice(),labels:{S:'Strength',E:'Easy run',H:'Hyrox class',T:'Threshold',X:'Speed + long',R:'Rest'},phases:PHN.slice(),threshold:THR.slice(),thresholdMin:THRMIN.slice(),easy:EASY.slice(),long:LONG.slice(),deload:Object.assign({},DELOAD),strength:STRENGTH,speed:SPEED,keyLifts:KEYLIFTS.slice(),classNote:CLASSNOTE,trainTime:'06:30',fasted:true,goalLine:'Pitch-ready for senior football in February without breaking down on sprints and turns, faster at road running and threshold, and keeping a weekly Hyrox class.'};
let fState={busy:false,msg:'',meal:null,text:null,manual:false};
let fView='today', pState={busy:false,msg:'',req:''}, kState={busy:false,msg:'',text:''};

// ---------- targets ----------
function dayTypeFor(k){return dayTypeAuto(k)}
function trainTimeFor(k){const d=D()[k];return (d&&d.trainTime)||(meta.settings&&meta.settings.trainTime)||(PROFILE&&PROFILE.plan&&PROFILE.plan.trainTime)||'06:30'}
function nutTarget(k,dt){const T=DAYT[dt];const n=NUTS.find(x=>x.k===k);
  if(k==='kcal')return {lo:Math.round(T.kcal*.95),hi:Math.round(T.kcal*1.05),t:T.kcal,txt:`${T.kcal}`};
  if(k==='protein')return {lo:Math.round(T.protein*.94),t:T.protein,txt:`${T.protein} g`};
  if(k==='carbs')return {hi:T.carbs,t:T.carbs,txt:`up to ${T.carbs} g`};
  if(k==='fat')return {lo:Math.round(T.fat*.9),hi:Math.round(T.fat*1.1),t:T.fat,txt:`${T.fat} g`};
  return {lo:n.lo,hi:n.hi,t:n.lo||n.hi,txt:n.lo&&n.hi?`${n.lo}-${n.hi} ${n.u}`:n.lo?`${n.lo} ${n.u}`:`max ${n.hi} ${n.u}`};
}
function status(v,tg){if(tg.lo!=null&&v<tg.lo)return v>=tg.lo*.8?'low':'bad';if(tg.hi!=null&&v>tg.hi)return v<=tg.hi*1.15?'low':'bad';return 'ok'}
const SC={ok:'var(--ok)',low:'var(--warn)',bad:'var(--bad)',na:'var(--muted)'};
function targets(){return {fastH:(meta.settings&&meta.settings.fastH)||14}}

// ---------- totals ----------
const kcalOf=i=>isNum(i.kcal)?+i.kcal:Math.round(4*(+i.carbs||0)+4*(+i.protein||0)+9*(+i.fat||0));
const breaksFast=i=>kcalOf(i)>=20;
function foodTotals(d){const t={n:0,microN:0};NK.forEach(k=>t[k]=0);(d&&d.food||[]).forEach(i=>{NK.forEach(k=>{t[k]+=k==='kcal'?kcalOf(i):(+i[k]||0)});t.n++;if(i.micros!==false)t.microN++});suppItems(d).forEach(i=>NK.forEach(k=>{if(k!=='kcal')t[k]+=(+i[k]||0);else t.kcal+=(+i.kcal||0)}));return t}
function mealWindow(d){if(!d)return null;let ts=(d.food||[]).filter(breaksFast).map(i=>tmin(i.at)).filter(x=>x!=null);const f=tmin(d.firstMeal),l=tmin(d.lastMeal);if(f!=null)ts.push(f);if(l!=null)ts.push(l);if(!ts.length)return null;return {first:f!=null?f:Math.min(...ts),last:l!=null?l:Math.max(...ts)}}
function fastHours(map,k){const d=map[k],p=map[iso(addD(parse(k),-1))];const w=mealWindow(d),pw=mealWindow(p);if(!w||!pw)return null;return Math.round(((w.first+1440)-pw.last)/6)/10}
function lastCaffeineOf(d){if(!d)return null;if(d.lastCaffeine)return tmin(d.lastCaffeine);const ts=(d.food||[]).filter(i=>(+i.caffeine||0)>0).map(i=>tmin(i.at)).filter(x=>x!=null);return ts.length?Math.max(...ts):null}
function plantsOn(d){const s=new Set();(d&&d.food||[]).forEach(i=>(i.plants||[]).forEach(p=>s.add(String(p).toLowerCase().trim())));return s}
function plantsWeek(k){const dt=parse(k);const s=new Set();for(let i=0;i<7;i++){plantsOn(D()[iso(addD(dt,-i))]).forEach(p=>s.add(p))}return s}
function guessMeal(){const h=new Date().getHours();return h<11?'Breakfast':h<15?'Lunch':h<17?'Snack':'Dinner'}
function frequentFoods(){return learnedFoods()}
const fmtN=(v,u)=>u==='µg'||(u==='g'&&v<10)?(Math.round(v*10)/10):Math.round(v);
function nutBar(n,val,tg){const ref=tg.hi&&!tg.lo?tg.hi:(tg.t||tg.lo||tg.hi||1);const pct=Math.min(100,val/ref*100);const st=status(val,tg);
  return `<div class="mac"><div class="mh"><span>${n.l}</span><span class="num"><b>${fmtN(val,n.u)}</b>${n.u==='kcal'?'':' '+n.u} · ${tg.txt}</span></div><div class="tr"><div class="fl" style="width:${pct}%;background:${SC[st]}"></div></div></div>`}

// ---------- plan helpers ----------
const plan=()=>sampleMode?null:meta.plan||null;
const kitchen=()=>(meta.kitchen&&meta.kitchen.items)||[];
function planDay(k){const p=plan();return p&&(p.days||[]).find(x=>x.date===k)||null}
function planDue(){const p=plan();const t=todayDate();if(!p||!p.days||!p.days.length)return 'none';const last=p.days[p.days.length-1].date;const age=(t-new Date(p.createdAt))/DAY;if(last<=iso(t))return 'due';return null}
const slotMeal=s=>/break|post-train|fasted/i.test(s)?'Breakfast':/lunch|top-up|pre-game|recovery/i.test(s)?(/pre-game breakfast/i.test(s)?'Breakfast':/lunch/i.test(s)?'Lunch':'Snack'):/dinner/i.test(s)?'Dinner':'Snack';
function planLogged(k,idx){const d=days[k];return !!(d&&(d.food||[]).some(i=>i.planRef===k+':'+idx))}
function planMealsHTML(k,compact){
  const pd=planDay(k);if(!pd)return '';const canLog=k<=iso(todayDate());
  return `<div class="pmeals">${(pd.meals||[]).map((m,ix)=>{const logged=planLogged(k,ix);const fasted=/fasted/i.test(m.slot||'');const drink=/drink/i.test(m.slot||'');
    const canRecipe=typeof recipeSheet==='function'&&!fasted&&!drink&&!(m.where&&m.where!=='Home'&&!(m.method||[]).length);const when=m.time||m.when||'';
    const its=(m.items||[]).length,ops=(m.options||[]).length;const key='p'+k+':'+ix;
    const ate=fasted?'':canLog?(logged?'<span class="pl" aria-label="Eaten">✓</span>':`<button type="button" class="pate" data-ate="${k}:${ix}">Ate</button>`):'';
    return `<details class="pm ${logged?'done':''} ${fasted||drink?'minor':''}" data-ms="${key}" ${msOpen.has(key)?'open':''}><summary><span class="pmsum"><span class="pslot">${esc(m.slot||'')}${when?` · ${esc(when)}`:''}${m.where&&m.where!=='Home'?` · ${esc(m.where)}`:''}</span><span class="pmn">${esc(m.name)}</span></span>${fasted?'':`<span class="pkc num">${kcalOf(m)}<small>kcal</small></span>`}${ate}</summary>
      <div class="pmbody">${fasted?'':`<div class="pmm"><span>${Math.round(+m.protein||0)} g protein</span><span>${Math.round(+m.carbs||0)} g carbs</span><span>${Math.round(+m.fat||0)} g fat</span></div>`}${its?`<div class="pi">${esc(m.items.map(x=>x.qty?`${x.qty} ${x.name}`:x.name).join(', '))}</div>`:''}${ops?optsHTML(k,ix,m):''}${canRecipe?`<div class="pma"><button type="button" class="ghost" data-recipe="${k}:${ix}">Recipe</button></div>`:''}</div></details>`}).join('')}</div>`;
}

// ---------- views ----------
function foodSub(){return `<div class="subtabs">${[['today','Food log'],['plan','Plan'],['kitchen','Your food']].map(([v,l])=>`<button type="button" data-fview="${v}" aria-pressed="${fView===v}">${l}${v==='plan'&&planDue()&&kitchen().length?' <i class="due"></i>':''}${v==='kitchen'&&!kitchen().length?' <i class="due"></i>':''}</button>`).join('')}</div>`}
function foodHTML(dIso){return foodSub()+(fView==='plan'?planHTML():fView==='kitchen'?kitchenHTML():foodTodayHTML(dIso))}
function foodTodayHTML(dIso){
  const DD=D(),d=DD[dIso]||{date:dIso,food:[]};const t=foodTotals(d),dt=dayTypeFor(dIso),win=mealWindow(d),fh=fastHours(DD,dIso);
  const meal=fState.meal||(dIso===iso(todayDate())?guessMeal():'Dinner');const diaryText=fState.text!=null?fState.text:(d.diary||'');
  const micros=NUTS.filter(n=>!n.macro);const microOk=micros.filter(n=>status(t[n.k],nutTarget(n.k,dt))==='ok').length;
  const pw=plantsWeek(dIso),pt=plantsOn(d);const pl=planFor(parse(dIso));const pd=planDay(dIso);
  const groups=MEALS.map(m=>{const items=(d.food||[]).map((i,ix)=>({...i,ix})).filter(i=>i.meal===m);if(!items.length)return '';
    return `<div class="mgrp"><div class="mgh"><b>${m}</b><span class="num">${items.reduce((a,i)=>a+kcalOf(i),0)} kcal</span></div>${items.map(i=>`<div class="fitem"><div style="min-width:0"><div class="fn">${esc(i.name)}${i.src==='plan'?' <span class="est">plan</span>':i.est?' <span class="est">est.</span>':''}</div><div class="fq">${esc(i.qty||'')}${i.at?' · '+esc(i.at):''}</div></div><div class="fm num">${kcalOf(i)} kcal<br><span>${(+i.protein||0).toFixed(0)}p · ${(+i.carbs||0).toFixed(0)}c · ${(+i.fat||0).toFixed(0)}f</span></div><button type="button" class="x" data-del-food="${i.ix}" aria-label="Remove ${esc(i.name)}">×</button></div>`).join('')}</div>`}).join('');
  const lib=LIB.filter(x=>x[1]==='any'||x[1]==='snack'||x[1]==='drinks'||x[1]==='treat'||(dt==='rest'&&x[1]==='rest')||(dt!=='rest'&&(x[1]==='training'||x[1]==='post'))||(dt==='match'&&x[1]==='match'));
  const freq=frequentFoods();const ai=!!sample;const due=planDue();
  const kEmpty=!kitchen().length&&!sampleMode;
  return `${kEmpty?`<button type="button" class="bigcta" data-fview="kitchen"><b>Start here: what food can you get?</b><span>Tap what you have at home, or say where you'll be eating. Your meal plans are built from it, so this comes first.</span><em>Add my food ›</em></button>`:''}${!kEmpty&&due&&dIso===iso(todayDate())?`<button type="button" class="rpill" data-fview="plan" style="--vc:var(--warn);width:100%;text-align:left"><b>!</b><span><b>${due==='none'?'Plan your next 3 days':'Your meal plan ends today'}</b><br><small>Update your food, then let Keel plan the next 3 days.</small></span><span aria-hidden="true">›</span></button>`:''}
  <article class="card kmac"><div class="chead"><div style="flex:1;min-width:0"><h2>${DAYT[dt].label} <span class="dtwhy">· ${esc(dayTypeWhy(dIso))}</span></h2>${(D()[dIso]||{}).trainIntent==='extra'&&!((D()[dIso]||{}).extras||[]).length&&!sampleMode?'<button type="button" class="linkbtn" data-intentclear style="min-height:32px;padding:0">Didn\'t train? Switch back to a rest day</button>':''}<div class="sub">${dt!=='rest'&&pl&&pl.type!=='R'?`${TNAME[pl.type]} at ${esc(trainTimeFor(dIso))}${FASTED()?', fasted':''}`:'No session'}${win?` · ate ${fmtT(win.first)}-${fmtT(win.last)}`:''}</div></div>${fh!=null?`<span class="kpill" style="--vc:${fh>=targets().fastH?'var(--ok)':'var(--warn)'}">Fasted ${fh} h</span>`:''}</div>
    
    ${macroRings(t,dt)}${waterHTML(dIso)}
    ${microsHTML(t,dt,dIso)}
    <div class="plantrow"><b class="num">${pw.size}</b><span>of ${PLANTS_WEEK} plants in the last 7 days${pt.size?` · today: ${esc([...pt].slice(0,8).join(', '))}${pt.size>8?'…':''}`:''}</span></div>
  </article>
  ${foodActionsHTML(dIso)}
  ${drinksHTML(dIso)}${planMismatch(dIso)}${planVsHTML(dIso)}${pd?`<article class="card"><div class="chead"><div style="flex:1"><h2>${dIso===iso(todayDate())?'Your plan for today':'Your plan for this day'}</h2><div class="sub">${esc(pd.note||'Tap Ate this as you go. Changes go in the diary.')}</div></div></div>${planMealsHTML(dIso)}</article>`:''}
  ${eatenHTML(d)}<article class="card"><div class="form"><h3>Fasting</h3>
      <div class="row2"><div class="field"><label class="label" for="ffm">First food</label><input id="ffm" type="time" value="${esc(d.firstMeal||(win?fmtT(win.first):''))}" data-food="firstMeal"></div>
      <div class="field"><label class="label" for="flm">Last food</label><input id="flm" type="time" value="${esc(d.lastMeal||(win?fmtT(win.last):''))}" data-food="lastMeal"></div></div>
      <div class="hint" style="font-size:12px;color:var(--muted)">${fh!=null?`Overnight fast into today: <b style="color:var(--fg)">${fh} h</b> (target ${targets().fastH} h).`:'Fasting hours appear once yesterday and today both have food times.'} Black coffee, tea and the SIS tablet don't break the fast.</div></div></article>`;
}
function planHTML(){
  const p=plan();const k=kitchen();const due=planDue();
  const set=meta.settings||{};
  const head=`<article class="card" id="replanCard" ${p?'style="order:50"':''}><div class="chead"><div style="flex:1"><h2>${p?'Change how you eat, or re-plan':'Plan ahead'}</h2><div class="sub">${p?`Made ${fmtD(new Date(p.createdAt),{weekday:'short',day:'numeric',month:'short'})} · covers ${short(parse(p.days[0].date))}-${short(parse(p.days[p.days.length-1].date))}`:'No plan yet'}</div></div>${due?'<span class="kpill" style="--vc:var(--warn)">Due</span>':''}</div>
    <div class="form">
      ${!k.length?`<button type="button" class="bigcta" data-fview="kitchen"><b>Add your food first</b><span>The plan uses what you can actually get: food at home, or where you'll be eating. Without it, it guesses.</span><em>Add my food ›</em></button>`:''}
      <div class="hint" style="font-size:13px;color:var(--muted)">Builds the next 3 days from your food available (${k.length} item${k.length===1?'':'s'}), your meal guide and each day's targets, timed around ${esc(set.trainTime||trainTimeFor(iso(todayDate())))} ${FASTED()?'fasted ':''}training.${k.length?'':' Add your food available first for a better plan.'}</div>
      ${eatSetHTML()}
      <div class="row2"><div class="field"><label class="label" for="s-tt">Usual training time</label><input id="s-tt" type="time" value="${esc(set.trainTime||'06:30')}" data-setting="trainTime"></div><div class="field"><label class="label" for="s-fh">Overnight fast target (h)</label><input id="s-fh" type="number" step="0.5" value="${set.fastH||14}" data-setting="fastH"></div></div>
      ${sample?`<button type="button" class="primary" id="pBuild" ${pState.busy?'disabled':''}>${pState.busy?'Planning… up to 2 minutes':p?'Re-plan the next 3 days':'Plan the next 3 days'}</button>`:'<div class="hint">Planning is not available in this view.</div>'}
      ${pState.msg?`<div class="hsum" role="status">${esc(pState.msg)}</div>`:''}
    </div></article>`;
  if(!p)return head;
  const daysH=(p.days||[]).map(pd=>{const dt=DAYT[pd.dayType]?pd.dayType:dayTypeFor(pd.date);const tot={kcal:0,protein:0,carbs:0,fat:0,fibre:0};(pd.meals||[]).forEach(m=>{tot.kcal+=kcalOf(m);['protein','carbs','fat','fibre'].forEach(x=>tot[x]+=+m[x]||0)});
    const chip=(lab,v,k)=>{const tg=nutTarget(k,dt);return `<span style="color:${SC[status(v,tg)]}">${lab} <b class="num">${Math.round(v)}</b></span>`};
    return `<article class="card"><div class="chead"><div style="flex:1;min-width:0"><h2>${fmtD(parse(pd.date),{weekday:'long',day:'numeric',month:'short'})}</h2><div class="sub">${DAYT[dt].label}${pd.session?` · ${esc(pd.session)}`:''}</div></div>${pd.date===iso(todayDate())?'<span class="kpill" style="--vc:var(--accent)">Today</span>':''}</div>
      <div class="ptot">${chip('kcal',tot.kcal,'kcal')}${chip('Protein',tot.protein,'protein')}${chip('Net carbs',tot.carbs,'carbs')}${chip('Fat',tot.fat,'fat')}${chip('Fibre',tot.fibre,'fibre')}</div>
      ${pd.note?`<div class="note" style="margin:0 16px 8px">${esc(pd.note)}</div>`:''}${planMealsHTML(pd.date)}</article>`}).join('');
  const shop=(p.shopping||[]);
  return (p?planTopHTML(p):'')+head+daysH+(shop.length?`<article class="card"><div class="chead"><div style="flex:1"><h2>Shopping list</h2><div class="sub">Not on your food list yet</div></div></div><div class="shop">${shop.map((s,i)=>`<label class="toggle"><input type="checkbox" data-shop="${i}" ${s.got?'checked':''}> <span style="flex:1"><b>${esc(s.name)}</b>${s.qty?` · ${esc(s.qty)}`:''}${s.why?`<br><small style="color:var(--muted)">${esc(s.why)}</small>`:''}</span></label>`).join('')}</div></article>`:'');
}
function kitchenHTML(){
  const items=kitchen();const where=KWHERE;
  const grouped=where.map(w=>{const its=items.map((x,i)=>({...x,i})).filter(x=>(where.includes(x.where)?x.where:'Other')===w);if(!its.length)return '';
    return `<div class="kgrp"><div class="kgh">${w} <span>${its.length}</span></div><div class="kchips">${its.map(x=>`<span class="kchip">${esc(x.name)}${x.qty?` <small>${esc(x.qty)}</small>`:''}<button type="button" data-del-kit="${x.i}" aria-label="Remove ${esc(x.name)}">×</button></span>`).join('')}</div></div>`}).join('');
  const st=typeof staplesHTML==='function'?staplesHTML(new Set(items.map(x=>x.name.toLowerCase()))):'';
  return `<article class="card"><div class="chead"><div style="flex:1"><h2>Food available</h2><div class="sub">${items.length?`${items.length} items${meta.kitchen&&meta.kitchen.updatedAt?` · updated ${fmtD(new Date(meta.kitchen.updatedAt))}`:''}`:'What you have at home, or where you\'ll be eating'}</div></div></div>
    <div class="form" style="gap:12px"><textarea id="k-say" aria-label="What food you have, or where you'll eat" placeholder="Say what you bought or ran out of, or where you'll eat, e.g. on holidays: hotel buffet breakfast, Thai food in the evening." style="min-height:72px">${esc(kState.text)}</textarea>
      ${sample?`<div class="actions">${speakBtn('k-say')}<button type="button" class="primary" id="kUpdate" ${kState.busy?'disabled':''}>${kState.busy?'Updating…':'Update'}</button></div>`:''}
      ${kState.msg?`<div class="hsum" role="status">${esc(kState.msg)}</div>`:''}
      ${st?`<details class="wu"><summary>Tap common staples</summary>${st}</details>`:''}
      ${items.length?`<button type="button" class="ghost" data-fview="plan" style="color:var(--fg)">Plan my next 3 days from this ›</button>`:''}</div>
    ${grouped?`<div class="kwrap">${grouped}</div>`:''}</article>`;
}
// ---------- Claude calls ----------
const NUT_JSON=`"kcal","protein","carbs" (NET carbs = total minus fibre),"fat","fibre" in g; "sodium","potassium","magnesium","calcium","iron","zinc","choline","vitC","caffeine" in mg; "selenium","iodine","vitA","vitD","vitK","b12","folate" in micrograms; "omega3" g EPA+DHA; "plants": array of distinct plant foods in it (vegetables, fruit, nuts, seeds, legumes, grains, herbs, coffee and tea count)`;
const foodRules=()=>`Estimate realistic portions for ${PORTION} unless amounts are given. Use cooked weights for meat and fish.
For any alcoholic drink, add "sd": the number of Irish standard drinks (10 g alcohol each; a 175 ml glass of wine is about 1.7, a pint of beer 2, a pub measure of spirits 1).
For each item give ${NUT_JSON}.
Coffees and teas ARE items (an almond cappuccino is about 44 kcal, 4 g net carbs, 125 mg caffeine; tea with almond milk about 45 mg caffeine). Plain water and the SIS electrolyte tablet (about 0 kcal, 500 mg sodium) can be items too if mentioned. Supplements count as items.
"meal" is one of "Breakfast","Lunch","Dinner","Snack". "dish" is the dish or plate the item belongs to (e.g. "Chicken stir-fry"): items eaten together on one plate share the same dish name; a stand-alone item such as a coffee has "dish":"". "at" is the time eaten as "HH:MM" (24 h) when stated or clearly implied, else null.
Reply with ONLY JSON: {"items":[{"name":"short name","qty":"amount","meal":"Lunch","at":"13:00","kcal":0,"protein":0,"carbs":0,"fat":0,"fibre":0,"sodium":0,"potassium":0,"magnesium":0,"calcium":0,"iron":0,"zinc":0,"selenium":0,"iodine":0,"vitA":0,"vitC":0,"vitD":0,"vitK":0,"b12":0,"folate":0,"choline":0,"omega3":0,"caffeine":0,"plants":["spinach"]}],"water":litres of plain water mentioned or null}`;
function cleanItems(arr,meal,est,src){const nowT=iso(sel)===iso(todayDate())?fmtT(new Date().getHours()*60+new Date().getMinutes()):null;
  return (Array.isArray(arr)?arr:[]).filter(x=>x&&x.name).map(x=>{const m=MEALS.includes(x.meal)?x.meal:meal;const o={name:String(x.name).slice(0,70),dish:String(x.dish||'').slice(0,50),qty:String(x.qty||'').slice(0,60),meal:m,at:tmin(x.at)!=null?fmtT(tmin(x.at)):(nowT&&src!=='diary'?nowT:MEAL_T[m]),est:!!est,src:src||'manual'};
    NK.forEach(k=>{o[k]=k==='kcal'?(isNum(x.kcal)?Math.round(+x.kcal):null):Math.max(0,+x[k]||0)});o.plants=Array.isArray(x.plants)?x.plants.map(p=>String(p).toLowerCase().slice(0,30)).slice(0,15):[];if(x.micros===false)o.micros=false;return o})}
async function persistDay(k,fields){
  const cur=days[k]||{date:k};const doc={...cur,...fields,date:k,savedAt:new Date().toISOString()};days[k]=doc;
  if(daysCol){try{await daysCol.doc(k).set(doc)}catch(e){toast('Could not save. Try again.');return false}}
  return true;
}
async function persistMeta(id,doc){meta[id]=doc;if(metaCol){try{await metaCol.doc(id).set(doc);return true}catch(e){window.__lastSaveErr=e&&(e.message||e.code);toast('Could not save. Try again.');return false}}return true}
async function addFood(items,k){k=k||iso(sel);const cur=(days[k]&&days[k].food)||[];await persistDay(k,{food:cur.concat(items)})}
function foodErr(e){const m={not_granted:'This needs your permission to use the AI coach.',rate_limited:'Too many requests just now. Try again in a few minutes.',image_rejected:'That photo could not be read. Try another.',invalid_json:'Could not work that out. Try again.'};return m[e&&e.code]||(e&&e.message?'That did not work: '+String(e.message).slice(0,160):'That did not work. Try again.')}
async function parseDiary(){
  const ta=$('#f-say');const text=(ta&&ta.value||'').trim();fState.text=text;if(!text){toast('Add what you ate first');return}
  fState.busy=true;fState.msg='Working out your day… this can take up to a minute.';render();
  try{const out=await sample.json(`Here is a person's spoken or typed diary of what they ate and drank today, possibly dictated, rambling and out of order. Turn it into individual items with nutrition estimates. If a meal matches one of these known recipes, use its figures: ${LIB.map(x=>`${x[0]} (${x[7]}): ${x[2]} kcal, ${x[3]} g protein, ${x[4]} g fat, ${x[5]} g net carbs, ${x[6]} g fibre`).join('; ')}.\nDiary: """${text.slice(0,6000)}"""\n${foodRules()}`);
    const items=cleanItems(out&&out.items,'Snack',true,'diary');
    if(!items.length){fState={...fState,busy:false,msg:'Could not pick out any foods. Name the foods with rough amounts and try again.'};render();return}
    const k=iso(sel);const keep=((days[k]&&days[k].food)||[]).filter(i=>i.src!=='diary');const extra={food:keep.concat(items),diary:text};
    if(out&&isNum(out.water)&&+out.water>0)extra.water=+out.water;
    await persistDay(k,extra);fState={...fState,busy:false,text:null,msg:`Logged ${items.length} items, about ${items.reduce((a,i)=>a+kcalOf(i),0)} kcal. Fix anything that's wrong; tap again after adding more.`};toast('Day logged');
  }catch(e){fState={...fState,busy:false,msg:foodErr(e)};toast(foodErr(e))}
  render();
}
async function parseFoodPhoto(file){
  const meal=fState.meal||(iso(sel)===iso(todayDate())?guessMeal():'Dinner');
  fState.busy=true;fState.msg='Looking at your plate… this can take up to a minute.';render();
  try{const out=await sample.json(`This is a photo of a meal (${meal}). Identify each food and estimate its portion and nutrition.\n${foodRules()}\nAlso add a "seen" field to the JSON: one plain sentence describing what you can see on the plate. If it is not food, reply {"items":[],"seen":"what it is instead"}.`,{images:file});
    const items=cleanItems(out&&out.items,meal,true,'photo').map(i=>({...i,meal}));
    if(!items.length){fState={...fState,busy:false,msg:'No food recognised. Try a closer photo from above, or describe it in the diary.'};render();return}
    PR={seen:out&&out.seen?String(out.seen).slice(0,200):'',meal,items:items.map(x=>({...x,pct:100,orig:x.name}))};fState={...fState,busy:false,msg:''};render();showPR();
  }catch(e){fState={...fState,busy:false,msg:foodErr(e)};toast(foodErr(e))}
  render();
}
async function updateKitchen(){
  const ta=$('#k-say');const text=(ta&&ta.value||'').trim();kState.text=text;if(!text){toast('Say what food you have, or where you will be eating');return}
  kState.busy=true;kState.msg='Updating your food list…';render();
  try{const out=await sample.json(kitchenPrompt(kitchen(),text));const r=await applyKitchenOut(out);
    kState={busy:false,text:r.items.length?'':text,msg:r.msg};toast(r.items.length?'Food list updated':'Nothing added');if(r.items.length)stepDone();
  }catch(e){kState={...kState,busy:false,msg:foodErr(e)}}
  render();
}
async function buildPlan(reqArg){
  const req=(typeof reqArg==='string'?reqArg:($('#p-req')&&$('#p-req').value||'')).trim();pState.req=req;if(typeof reqArg!=='string')await saveEatNote();
  const now=new Date(),t=todayDate();const start=now.getHours()>=12||(days[iso(t)]&&(days[iso(t)].food||[]).length)?addD(t,1):t;
  const tt=(meta.settings&&meta.settings.trainTime)||'06:30';
  const dlist=[0,1,2].map(i=>{const d=addD(start,i),k=iso(d),pl=planFor(d),dt=dayTypeFor(k);const T=DAYT[dt];
    return {date:k,weekday:fmtD(d,{weekday:'long'}),dayType:dt,session:pl&&pl.type!=='R'&&dt!=='rest'?`${TNAME[pl.type]} at ${trainTimeFor(k)}${FASTED()?', fasted':''}`:(dt==='match'?'Match day':'Rest'),targets:{kcal:T.kcal,protein_g:T.protein,net_carbs_max_g:T.carbs,fat_g:T.fat,fibre_g:'30-40'}}});
  const recent=[];for(let i=1;i<=7;i++){const d=D()[iso(addD(t,-i))];(d&&d.food||[]).forEach(x=>{if(kcalOf(x)>150)recent.push(x.name)})}
  pState.busy=true;pState.msg='Planning your next 3 days around your food and targets. This can take up to 2 minutes.';render();
  const mk=dl=>`You are planning meals for ${ABOUT}. Nutrition approach: ${APPROACH}. Plan this day (the other days are planned separately, so vary the meals):
${JSON.stringify(dl)}
Their rules:
${RULES}
Their meal guide (use these first, adapt portions to hit targets, swap ingredients for what is in stock): ${LIB.map(x=>`${x[0]} [${x[1]}] ${x[2]} kcal ${x[3]}p ${x[4]}f ${x[5]}c ${x[6]}fibre: ${x[7]}`).join(' | ')}
Kitchen stock right now: ${kitchen().length?kitchen().map(x=>`${x.name}${x.qty?` (${x.qty})`:''} [${x.where}]`).join(', '):'unknown, assume a normal Irish kitchen and put key items on the shopping list'}.
Meals eaten in the last week (vary from these): ${[...new Set(recent)].slice(0,25).join(', ')||'none logged'}.
Plants eaten so far this week: ${plantsWeek(iso(t)).size} of 30, so favour new plants.
${req&&req!==String((meta.settings||{}).eatNote||'').trim()?`He asked: "${req.slice(0,300)}"`:''}
Daily micronutrient targets: sodium 3000-4000 mg, potassium 3500-4500 mg, magnesium 400-500 mg, calcium 1000 mg, iron 8 mg, zinc 11 mg, selenium 55 µg, iodine 150 µg, vitamin A 900 µg, vitamin C 90-200 mg, vitamin D 15 µg, vitamin K 120 µg, B12 4 µg, folate 400 µg, choline 550 mg, omega-3 1-2 g, caffeine under 400 mg.
For each day list the meals in time order. ${FASTED()?`On training days start with a "Fasted training" entry at the session time (water, black coffee, electrolytes; zero nutrition), then "Post-training breakfast" about 60-90 minutes after the session ends.`:`On training days time a pre-training meal or snack 1.5-3 hours before the session and a recovery meal within about an hour after it.`} Include the usual drinks as one entry. Use what is in stock; anything missing goes on the shopping list once. Give every meal except drinks a short method a non-cook can follow (3-6 steps), the prep time in minutes and the servings. Day totals should land within about 5% of calories, at or above protein, under the net-carb cap, with fibre 30-40 g.
For each meal give ${NUT_JSON}.
${eatRules()}
Reply with ONLY JSON: {"days":[{"date":"YYYY-MM-DD","dayType":"training","session":"short","note":"one short practical line, e.g. defrost the salmon tonight","meals":[{"slot":"Post-training breakfast","time":"08:00","when":"after training","where":"Home","name":"meal name","items":[{"name":"oats","qty":"70 g"}],"prep":10,"servings":1,"method":["step"],"kcal":0,"protein":0,"carbs":0,"fat":0,"fibre":0,"sodium":0,"potassium":0,"magnesium":0,"calcium":0,"iron":0,"zinc":0,"selenium":0,"iodine":0,"vitA":0,"vitC":0,"vitD":0,"vitK":0,"b12":0,"folate":0,"choline":0,"omega3":0,"caffeine":0,"plants":["oats"],"options":[{"name":"","where":"Shop","get":"what to pick up or order","kcal":0,"protein":0,"carbs":0,"fat":0}]}]}],"shopping":[{"name":"","qty":"","why":"which meal"}]}`;
  if(SERVER_PLAN){await serverPlan(dlist.map(d=>mk([d])),req);return}
  try{const outs=await Promise.all(dlist.map(d=>sample.json(mk([d]),{maxTokens:12000}).catch(e=>({__err:e}))));const ok=outs.filter(o=>o&&!o.__err);if(!ok.length)throw outs[0].__err;
    const seen=new Set();const out={days:ok.flatMap(o=>Array.isArray(o.days)?o.days:[]).sort((x,y)=>String(x.date).localeCompare(String(y.date))),shopping:ok.flatMap(o=>Array.isArray(o.shopping)?o.shopping:[]).filter(x=>{const k=String(x&&x.name||'').toLowerCase();if(!k||seen.has(k))return false;seen.add(k);return true})};
    await finishPlan(out,req);
  }catch(e){pState={...pState,busy:false,msg:e&&e.code==='invalid_json'?'The plan came back garbled. Try again.':foodErr(e)}}
  render();
}

// ---------- meal plans built on the server (keeps going if the app is closed) ----------
let SERVER_PLAN=false,planTimer=null;
async function serverPlan(prompts,req){
  const jobAt=new Date().toISOString();
  try{await persistMeta('planJob',{at:jobAt});
    const {data:{session}}=await sb.auth.getSession();if(!session)throw {code:'session_expired',message:'Signed out'};
    const r=await fetch('/api/plan',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+session.access_token},body:JSON.stringify({prompts,req,jobAt})});
    const j=await r.json().catch(()=>({}));if(!r.ok)throw {code:'upstream_error',message:j.error||('HTTP '+r.status)};
    pState={busy:true,req,msg:'Planning your next 3 days. It takes a minute or two, and carries on even if you close the app.'};render();watchPlanJob();
  }catch(e){await persistMeta('planJob',{at:jobAt,error:'not started'});pState={...pState,busy:false,msg:foodErr(e)};render()}
}
async function checkPlanJob(){
  if(!sb||!UID)return 'idle';
  const {data,error}=await sb.from('entries').select('key,data').eq('user_id',UID).eq('kind','meta').in('key',['planRaw','planJob','plan']);
  if(error)return 'wait';const m={};(data||[]).forEach(r=>m[r.key]=r.data);
  const job=m.planJob,raw=m.planRaw,plan=m.plan;if(m.plan)meta.plan=m.plan;
  if(raw&&job&&raw.jobAt===job.at&&!(plan&&plan.createdAt>raw.createdAt)){meta.planRaw=raw;await finishPlan(raw.out,raw.req);render();return 'done'}
  if(job&&job.error){if(!job.seen){await persistMeta('planJob',Object.assign({},job,{seen:true}));pState={...pState,busy:false,msg:/rate|limit|overload|busy|529|429/i.test(job.error)?'The AI was too busy just then. Wait a minute, then tap Plan again.':/cut short|readable/i.test(job.error)?'The plan came back incomplete. Tap Plan to try again.':'The plan could not be made ('+job.error+'). Tap Plan to try again.'};render()}return 'failed'}
  if(job&&!(plan&&plan.createdAt>job.at)&&Date.now()-new Date(job.at)<7*60000){if(!pState.busy){pState={...pState,busy:true,msg:'Still planning your next 3 days. It carries on even if you close the app.'};render()}return 'wait'}
  if(job&&!(plan&&plan.createdAt>job.at)&&pState.busy){pState={...pState,busy:false,msg:'Planning took too long. Tap Plan to try again.'};render()}
  return 'idle';
}
function watchPlanJob(){clearTimeout(planTimer);const tick=async()=>{let st='wait';try{st=await checkPlanJob()}catch(e){}if(st==='wait')planTimer=setTimeout(tick,6000)};planTimer=setTimeout(tick,6000)}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&SERVER_PLAN&&UID)checkPlanJob().then(st=>{if(st==='wait')watchPlanJob()})});
async function finishPlan(out,req){
    const ds=(Array.isArray(out&&out.days)?out.days:[]).filter(d=>d&&d.date&&Array.isArray(d.meals)).map(d=>({date:String(d.date).slice(0,10),dayType:DAYT[d.dayType]?d.dayType:dayTypeFor(String(d.date).slice(0,10)),session:String(d.session||'').slice(0,60),note:String(d.note||'').slice(0,160),
      meals:d.meals.filter(m=>m&&m.name).map(m=>{const o={slot:String(m.slot||'').slice(0,40),time:tmin(m.time)!=null?fmtT(tmin(m.time)):'',name:String(m.name).slice(0,70),items:(Array.isArray(m.items)?m.items:[]).slice(0,12).map(x=>({name:String(x.name||'').slice(0,40),qty:String(x.qty||'').slice(0,20)})),plants:Array.isArray(m.plants)?m.plants.map(p=>String(p).toLowerCase().slice(0,30)).slice(0,15):[],method:Array.isArray(m.method)?m.method.map(String).slice(0,8):[],prep:+m.prep||null,servings:+m.servings||1};NK.forEach(k=>o[k]=Math.max(0,+m[k]||0));Object.assign(o,mealExtras(m));return o})}));
    if(!ds.length){pState={...pState,busy:false,msg:'The plan came back empty. Try again.'};render();return}
    const shopping=(Array.isArray(out&&out.shopping)?out.shopping:[]).filter(s=>s&&s.name).slice(0,30).map(s=>({name:String(s.name).slice(0,50),qty:String(s.qty||'').slice(0,30),why:String(s.why||'').slice(0,60),got:false}));
    const savedOK=await persistMeta('plan',{createdAt:new Date().toISOString(),days:ds,shopping,req});
    if(!savedOK){pState={busy:false,req,msg:'Your plan was made but could not be saved ('+(window.__lastSaveErr||'unknown error')+'). Try again, and send a screenshot if it keeps happening.'};render();return}
    savePlanHist(ds);stepDone();
    pState={busy:false,req:'',msg:`Planned ${ds.length} days${shopping.length?` with ${shopping.length} things to buy`:''}.`};toast('Plan ready');
}
async function ateThis(ref){
  const [k,ix]=[ref.slice(0,10),+ref.slice(11)];const pd=planDay(k);const m=pd&&pd.meals[ix];if(!m)return;
  const it={name:m.name,qty:(m.items||[]).map(x=>x.qty?`${x.qty} ${x.name}`:x.name).join(', ').slice(0,120),meal:slotMeal(m.slot),at:m.time||MEAL_T[slotMeal(m.slot)],est:true,src:'plan',planRef:ref,plants:m.plants||[]};NK.forEach(x=>it[x]=+m[x]||0);
  await addFood([it],k);toast(`Logged ${m.name}`);render();
}
// ================= session form =================
function blankLog(dIso){const x=L()[dIso];return x?clone(x):{date:dIso,status:null,dur:null,rpe:null,notes:'',swap:false,tb:null,ss:null,pace:'',fivek:'',hyrox:null}}
function hyroxScanHTML(){
  const h=sDraft.hyrox||{items:[]};
  const items=(h.items||[]).map((it,i)=>`<div class="hitem"><input type="text" value="${esc(it.name)}" data-bind="s.hyrox.items.${i}.name" aria-label="Exercise"><input type="text" value="${esc(it.dose||'')}" data-bind="s.hyrox.items.${i}.dose" aria-label="Amount"><button type="button" class="x" data-del-h="${i}" aria-label="Remove">×</button></div>`).join('');
  const st=scanState;
  return `<div class="scan"><div class="hdr"><b>Class workout</b>${canImg?`<label class="filebtn">${h.photo?'Rescan board':'Scan the board'}<input type="file" id="scanFile" accept="image/*"></label>`:''}</div>
    ${h.photo?`<img class="thumb" src="/_blob/${esc(h.photo)}" alt="Photo of the class board">`:''}
    ${st&&st.msg?`<div class="hsum" role="status">${esc(st.msg)}</div>`:''}
    ${h.summary?`<div class="hsum">${esc(h.summary)}${h.runM?` · about ${(h.runM/1000).toFixed(1)} km running`:''}</div>`:''}
    ${items}
    ${!canImg&&!items?'<div class="hsum">Photo scanning is not available in this view. Add the exercises by hand.</div>':''}
    <button type="button" class="add" id="addH">+ Add exercise</button></div>`;
}
function sessionForm(d,pl){
  const f=sDraft,k=pl.type,wi=pl.wk-1,test=k==='T'&&!THRMIN[wi],has=!!L()[iso(d)],future=d>todayDate();
  if(has&&!sDirty&&sOpenK!==iso(d)&&L()[iso(d)].status)return loggedHTML(d);
  const isH=k==='H'||(k==='T'&&f.swap);
  let spec='';
  if(k==='S')spec=`<div class="row2"><div class="field"><label class="label" for="f-tb">${esc(KEYLIFTS[0]||'Main lift')} top set (kg)</label><input id="f-tb" type="number" inputmode="decimal" step="2.5" value="${f.tb??''}" data-bind="s.tb"></div>
    <div class="field"><label class="label" for="f-ss">${esc(KEYLIFTS[1]||'Second lift')} (kg)</label><input id="f-ss" type="number" inputmode="decimal" step="1" value="${f.ss??''}" data-bind="s.ss"></div></div>`;
  if(k==='T'&&!test)spec=`<label class="toggle"><input id="f-swap" type="checkbox" ${f.swap?'checked':''} data-bind="s.swap"> Did a ${esc(TNAME.H)} instead</label>`+(f.swap?'':`<div class="field"><label class="label" for="f-pace">Average rep pace (min:sec per km)</label><input id="f-pace" type="text" inputmode="numeric" placeholder="4:35" value="${esc(f.pace||'')}" data-bind="s.pace"></div>`);
  if(test)spec=`<div class="field"><label class="label" for="f-5k">5 km time (min:sec)</label><input id="f-5k" type="text" inputmode="numeric" placeholder="21:30" value="${esc(f.fivek||'')}" data-bind="s.fivek"></div>`;
  if(!isH&&!test&&k!=='R')spec+=`<label class="toggle"><input id="f-cls" type="checkbox" ${f.isClass?'checked':''} data-bind="s.isClass"> It was a class: snap the board</label>`;
  if(isH||f.isClass)spec+=hyroxScanHTML();
  return `<form class="form" id="logForm" autocomplete="off" style="border-top:1px solid var(--line)">
    <div style="display:flex;justify-content:space-between;align-items:baseline"><h3>Log session</h3>${has?'<span class="label" style="color:var(--ok)">Saved</span>':future?'<span class="label">Upcoming</span>':''}</div>
    <div class="field"><span class="label">How did it go?</span>${seg('s','status',['done','partial','missed'],f.status,['Done','Partial','Missed'],'status')}</div>
    <div class="field" style="max-width:50%"><label class="label" for="f-dur">Duration (min)</label><input id="f-dur" type="number" inputmode="numeric" value="${f.dur??''}" data-bind="s.dur"></div>
    <div class="field"><span class="label">Effort (1 to 10)</span>${seg('s','rpe',[1,2,3,4,5,6,7,8,9,10],f.rpe,null,'small')}</div>
    ${spec}
    <div class="field"><label class="label" for="f-notes">Notes</label><textarea id="f-notes" placeholder="How it felt, what you changed" data-bind="s.notes">${esc(f.notes||'')}</textarea></div>
    <div class="actions"><button class="primary" type="submit">${has?'Update log':'Save log'}</button>
    ${has?(confirmDel?`<button type="button" class="ghost danger" id="delYes">Delete</button><button type="button" class="ghost" id="delNo">Keep</button>`:`<button type="button" class="ghost" id="delAsk">Delete</button>`):''}</div></form>`;
}

// ================= hyrox scan =================
async function scanBoard(file){
  if(!sample){toast('Photo scanning is not available here');return}
  scanState={busy:true,msg:'Reading the board… this can take up to a minute.'};render();
  let photo=sDraft.hyrox&&sDraft.hyrox.photo||null;
  if(assets){try{const up=await assets.upload(file);photo=up.id}catch(e){/* keep going without storing the photo */}}
  const prompt=`This is a photo of a Hyrox / functional fitness class workout written on a whiteboard or screen. Read it and list every exercise.
Reply with ONLY a JSON object of this shape:
{"summary":"one short line describing the format, e.g. 4 rounds for time, 40 min EMOM","runM":number of metres of running in total (0 if none),"items":[{"name":"exercise name","dose":"reps / distance / time as written, including rounds","category":one of ${JSON.stringify(HCATS)},"regions":array of the main body regions it loads, from ${JSON.stringify(REGIONS)}}]}
If the photo is not a workout, reply {"summary":"Not a workout board","runM":0,"items":[]}.`;
  try{
    const out=await sample.json(prompt,{images:file});
    const items=Array.isArray(out&&out.items)?out.items.filter(x=>x&&x.name).map(x=>({name:String(x.name).slice(0,60),dose:String(x.dose||'').slice(0,40),category:HCATS.includes(x.category)?x.category:'Other',regions:Array.isArray(x.regions)?x.regions.filter(r=>REGIONS.includes(r)):[]})):[];
    readAll();
    sDraft.hyrox={photo,summary:String(out&&out.summary||'').slice(0,120),runM:+(out&&out.runM)||0,items};sDirty=true;
    scanState={busy:false,msg:items.length?`Found ${items.length} exercises. Check them, then save the log.`:'No exercises found. Try a straighter, closer photo or add them by hand.'};
  }catch(e){
    readAll();if(photo){sDraft.hyrox=Object.assign({items:[]},sDraft.hyrox,{photo});sDirty=true}
    const m={not_granted:'Scanning needs your permission to use the AI coach. Add the exercises by hand instead.',rate_limited:'Too many scans just now. Try again in a few minutes.',image_rejected:'That photo could not be read. Try a different one.',invalid_json:'Could not read the board clearly. Try again or add by hand.',refused:'Could not read that photo. Add the exercises by hand.'};
    scanState={busy:false,msg:m[e&&e.code]||'Scan failed. Try again or add the exercises by hand.'};
  }
  render();
}

// ================= saving =================
async function saveLog(pl){
  readAll();const f=sDraft;
  if(!f.status){toast('Pick Done, Partial or Missed');return}
  if(f.pace&&!toSec(f.pace)){toast('Pace format is min:sec, e.g. 4:35');return}
  if(f.fivek&&!toSec(f.fivek)){toast('5 km time format is min:sec, e.g. 21:30');return}
  const isH=pl.type==='H'||(pl.type==='T'&&f.swap);
  const doc={...f,wk:pl.wk,slot:pl.type,type:pl.type==='T'&&f.swap?'H':pl.type,savedAt:new Date().toISOString()};
  if(!isH)doc.hyrox=null;
  if(doc.hyrox)doc.hyrox.items=(doc.hyrox.items||[]).filter(i=>i.name&&i.name.trim());
  logs[doc.date]=doc;sDirty=false;
  if(logsCol){try{await logsCol.doc(doc.date).set(doc);toast('Session saved');sOpenK=null;stepDone()}catch(e){toast(e&&e.code==='quota_exceeded'?'Storage is full':'Could not save. Try again.')}}else toast('Saved on this screen only');
  render();
}
async function saveDay(){
  readAll();const f=dDraft,y=yDraft;
  f.niggles=(f.niggles||[]).filter(n=>n.area);y.extras=(y.extras||[]).filter(x=>x.kind&&(x.dur||x.rpe));
  const ok=await persistDay(f.date,pick(f,CHECKIN_KEYS));
  const yv=pick(y,Y_KEYS);if(Object.values(yv).some(v=>Array.isArray(v)?v.length:v!=null&&v!==''))await persistDay(y.date,yv);
  dDirty=false;dEdit=false;ciState.msg='';yDraft=null;
  if(ok)toast(daysCol?'Check-in saved':'Saved on this screen only');
  if(tab()==='checkin'&&iso(sel)===iso(todayDate()))location.hash='dashboard';else{render();window.scrollTo({top:0,behavior:'smooth'})}
}
async function delLog(){
  const k=iso(sel);delete logs[k];confirmDel=false;sDraft=null;sDirty=false;
  if(logsCol){try{await logsCol.doc(k).delete();toast('Log deleted')}catch(e){toast('Could not delete. Try again.')}}
  render();
}

// ================= views =================
function dotClass(d,pl){if(!pl||pl.type==='R')return 'rest';if(pl.pre)return 'pre';const l=L()[iso(d)];return !l?'':l.status==='done'?'done':l.status==='partial'?'part':'miss'}
let stripOpen=false;
function dayHeader(){
  const key=iso(sel),pl=planFor(sel);const mon=addD(sel,-((sel.getDay()+6)%7));let strip='';
  for(let i=0;i<7;i++){const d=addD(mon,i),p=planFor(d),t=p?p.type:'R',lt=L()[iso(d)],col=lt&&lt.type==='H'&&t==='T'?'H':t;const rs=readiness(D()[iso(d)]);
    strip+=`<button type="button" data-goto="${iso(d)}" class="${iso(d)===key?'sel':''}" style="--c:var(${TVAR[col]});--rc:${rColor(rs)}" aria-label="${fmtD(d,{weekday:'long',day:'numeric',month:'long'})}"><span class="d">${DOW[i]}</span><span class="n">${d.getDate()}</span><span class="dot ${dotClass(d,p)}"></span><span class="rd"></span></button>`}
  const isToday=key===iso(todayDate());
  return `<div class="dbar kswipe"><button type="button" id="prevD" aria-label="Previous week">‹</button><button type="button" class="dmid" id="stripTog" aria-expanded="${stripOpen}"><b>${isToday?'Today':fmtD(sel,{weekday:'short'})} · ${fmtD(sel,{day:'numeric',month:'short'})}</b><small>${pl&&!pl.pre?`Week ${pl.wk} of 16`:`Week of ${fmtD(mon,{day:'numeric',month:'short'})}`} ${stripOpen?'▴':'▾'}</small></button>${isToday?'':'<button type="button" class="dtoday" id="goToday">Today</button>'}<button type="button" id="nextD" aria-label="Next week">›</button></div>${stripOpen?`<div class="strip kswipe" title="Swipe to change week">${strip}</div>`:''}`;
}
function ensureDrafts(){const key=iso(sel);
  if(!sDraft||sDraft.date!==key){sDraft=blankLog(key);sDirty=false;scanState=null}
  if(!dDraft||dDraft.date!==key||!yDraft){dDraft=blankDay(key);yDraft=blankDay(prevKey(key));dDirty=false}}
function viewTraining(){
  ensureDrafts();const pl=planFor(sel),key=iso(sel);const dd=D()[key];const s=readiness(dd);
  let pill;
  if(dd&&s!=null){const [vc,vh]=rVerdict(s,dd);pill=`<a class="rpill" href="#checkin" style="--vc:${vc}"><b class="num">${s}</b><span><b>${vh}</b><br><small>Balance from today's check-in</small></span><span aria-hidden="true">›</span></a>`}
  else pill=`<a class="rpill" href="#checkin" style="--vc:var(--muted)"><b>–</b><span><b>Do your morning check-in</b><br><small>Sleep, how you feel, niggles. 30 seconds.</small></span><span aria-hidden="true">›</span></a>`;
  let pre='';
  if(todayDate()<FIRST&&key===iso(FIRST))pre=`<div class="banner"><b style="color:var(--fg)">Day one is ${fmtD(FIRST,{weekday:'long',day:'numeric',month:'long'})}.</b></div>`;
  if(pl&&pl.pre)pre=`<div class="banner">Your plan starts ${fmtD(FIRST)}, so this session is for reference only.</div>`;
  const due=key===iso(todayDate())&&planDue();const pd=planDay(key);
  const food=pd?`<a class="rpill" href="#food" style="--vc:var(--accent)"><b>${(pd.meals||[]).filter((m,ix)=>!/fasted/i.test(m.slot)&&planLogged(key,ix)).length}/${(pd.meals||[]).filter(m=>!/fasted/i.test(m.slot)).length}</b><span><b>Today's meals</b><br><small>${esc((pd.meals||[]).filter(m=>!/fasted/i.test(m.slot)).map(m=>m.name).slice(0,3).join(' · '))}</small></span><span aria-hidden="true">›</span></a>`:'';
  const nudge=due?`<button type="button" class="rpill" data-fview="plan" style="--vc:var(--warn);width:100%;text-align:left"><b>!</b><span><b>${due==='none'?'Plan your next 3 days of food':'Your meal plan ends today'}</b><br><small>Update your food and tap Plan.</small></span><span aria-hidden="true">›</span></button>`:'';
  const none=!pl?`<article class="card"><div class="chead"><div style="flex:1"><h2>${sel<FIRST?`Plan starts ${fmtD(FIRST)}`:'Plan complete'}</h2><div class="sub">${sel<FIRST?`${Math.max(0,Math.round((FIRST-todayDate())/DAY))} days to go.`:'The 16 weeks ran to 28 February.'}</div></div></div>${sel<FIRST?`<div class="form"><button type="button" class="primary" data-goto="${iso(FIRST)}">See day one</button></div>`:''}</article>`:'';
  return pre+(key===iso(todayDate())?injuryBanner():'')+adjBanner(pl)+intentNudge(key)+moveHTML(pl)+(pl?sessionHTML(sel,pl):none)+restExtraHTML(key,pl)+extrasCardHTML(key)+patternHTML()+pill;
}
function trainSub(cur){return `<div class="subtabs" style="grid-template-columns:1fr 1fr">${[['today','Day'],['plan','Overview']].map(([v,l])=>`<button type="button" data-tview="${v}" aria-pressed="${cur===v}">${l}</button>`).join('')}</div>`}
function viewTrainingTab(){if(tView==='route')return planNav(tView)+routeHTML();return planNav(tView)+(tView==='today'?dayHeader()+sessChip(iso(sel)):'')+(tView==='plan'?planBtn()+fullPlanTip()+viewPlan():viewTraining())}
function viewCheckin(){ensureDrafts();return dayHeader()+ciChip(iso(sel))+checkinHTML(iso(sel))}
function viewFood(){return dayHeader()+foodHTML(iso(sel))}
function viewPlan(){
  const LL=L(),DD=D(),td=iso(todayDate());
  let h=`<div class="legend">${['S','E','H','T','X'].map(k=>`<span style="--c:var(${TVAR[k]})"><i></i>${TNAME[k]}</span>`).join('')}<span>Solid = done · half = partial · red ring = missed · bar = balance</span></div><div class="pgrid"><span></span>${DOW.map(d=>`<span class="h">${d}</span>`).join('')}`;
  for(let w=1;w<=16;w++){const p=Math.floor((w-1)/4),mon=addD(START,(w-1)*7);
    h+=`<div class="wkl" style="--pc:${PHC[p]}"><b>W${w}</b><small>${short(mon)}</small>${DELOAD[w]?`<span class="dl">${w===12?'TEST':'DELOAD'}</span>`:''}</div>`;
    for(let i=0;i<7;i++){const d=addD(mon,i),pl=planFor(d),k=pl.type,l=LL[iso(d)],col=l&&l.type==='H'&&k==='T'?'H':k;
      let lab={S:'Str',E:'Easy',H:'Class',T:THRMIN[w-1]?'Thr':'Test',X:'Spd',R:''}[k],v='';
      if(k==='E')v=EASY[w-1]+"'";if(k==='T')v=THRMIN[w-1]?THR[w-1].split(' /')[0]:'5 km';if(k==='X')v=LONG[w-1]+"'";
      if(col==='H'&&k==='T'){lab='Class';v='swap'}
      let cls='pc';if(k==='R')cls+=' rest';else if(pl.pre)cls+=' pre';else if(l)cls+=l.status==='done'?' done':l.status==='partial'?' part':' miss';
      if(iso(d)===td)cls+=' today';const rs=readiness(DD[iso(d)]);
      h+=`<button type="button" class="${cls}" style="--c:var(${TVAR[col]});--rc:${rColor(rs)}" data-goto="${iso(d)}" aria-label="${fmtD(d)} ${TNAME[col]}"><span class="k">${lab}</span>${v?`<span class="v">${esc(v)}</span>`:''}${rs!=null?'<span class="rb"></span>':''}</button>`}}
  return h+`</div><div class="banner">Tap any day to open its training.</div>`;
}
// ================= dashboard =================
function ring(val,max,size,stroke,color,label,sub){const r=(size-stroke)/2,c=2*Math.PI*r,v=val==null?0:Math.max(0,Math.min(1,val/max));const fid='kf'+Math.random().toString(36).slice(2,7);const fd=color==='fade'?`<defs><linearGradient id="${fid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E23D9E"/><stop offset=".5" stop-color="#5B6CFF"/><stop offset="1" stop-color="#34E3A0"/></linearGradient></defs>`:'';if(color==='fade')color=`url(#${fid})`;
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">${fd}<circle cx="${size/2}" cy="${size/2}" r="${r}" style="fill:none;stroke:var(--line);stroke-width:${stroke}"/><circle cx="${size/2}" cy="${size/2}" r="${r}" transform="rotate(-90 ${size/2} ${size/2})" style="fill:none;stroke:${color};stroke-width:${stroke};stroke-linecap:round" stroke-dasharray="${(c*v).toFixed(1)} ${c.toFixed(1)}" ${v?'':'opacity="0"'}/></svg><div class="rl"><b class="num">${label}</b>${sub?`<small>${sub}</small>`:''}</div></div>`}
function miniBar(lab,v,max,color,txt){const p=max?Math.max(0,Math.min(100,v/max*100)):0;return `<div class="mb"><div class="mbh"><span>${lab}</span><span class="num">${txt}</span></div><div class="tr"><div class="fl" style="width:${p}%;background:${color}"></div></div></div>`}
function spark(vals,lo,hi){const W=300,H=56,n=vals.length;const X=i=>6+i/(n-1)*(W-12),Y=v=>H-6-(v-lo)/(hi-lo)*(H-12);const pts=vals.map((v,i)=>v==null?null:[X(i),Y(v),v]);
  let path='',started=false;pts.forEach(p=>{if(!p){started=false;return}path+=(started?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1);started=true});
  const last=[...pts].reverse().find(Boolean);
  const bands=`<rect x="0" y="${Y(100)}" width="${W}" height="${Y(75)-Y(100)}" style="fill:var(--ok);opacity:.07"/><rect x="0" y="${Y(55)}" width="${W}" height="${Y(0)-Y(55)}" style="fill:var(--bad);opacity:.06"/>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Balance trend">${bands}<path d="${path}" style="fill:none;stroke:var(--k-green);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round"/>${pts.filter(Boolean).map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="2.5" style="fill:var(--k-green)"/>`).join('')}${last?`<circle cx="${last[0]}" cy="${last[1]}" r="5" style="fill:var(--surface);stroke:var(--k-green);stroke-width:2.5"/>`:''}</svg>`}
function viewDashboard(){
  const now=sampleMode?SAMPLE.now:todayDate(),k=iso(now),DD=D(),LL=L(),d=DD[k],pl=planFor(now),yk=iso(addD(now,-1));
  const toggle=`<div class="dtop"><div class="kgreet"><h1>${greet()}</h1><small>${fmtD(now,{weekday:'short',day:'numeric',month:'short'})} · ${sampleMode?'Example data, not yours':now<FIRST?`Plan starts in ${Math.round((FIRST-now)/DAY)} days`:pl?`Week ${pl.wk} of 16 · ${PHN[pl.p]}`:'Plan complete'}</small></div><div style="display:flex;gap:8px;align-items:center"><button type="button" class="ghost" id="sampleBtn" style="padding:8px 12px">${sampleMode?'My data':'Example'}</button></div></div>
    <div class="prog" aria-hidden="true"><i style="width:${Math.max(0,Math.min(100,(now-FIRST)/(END-FIRST)*100))}%"></i>${[1,2,3].map(i=>`<span style="left:${i*25}%"></span>`).join('')}</div>`;
  // hero
  const s=readiness(d);let hero;
  if(d&&s!=null){const [vc,vh,vt]=rVerdict(s,d);const sh=sleepHours(d),need=sleepNeed(k);
    const feel=avg([d.energy!=null?(d.energy-1)/4:null,d.mood!=null?(d.mood-1)/4:null,d.stress!=null?(5-d.stress)/4:null].filter(x=>x!=null));
    const body=avg([d.sore!=null?(5-d.sore)/4:null,1-maxPain(d)/10].filter(x=>x!=null));
    const sl=sh!=null?Math.min(1,sh/need):null;const pc=v=>v==null?'-':Math.round(v*100)+'%';const cl=v=>v==null?'var(--muted)':v>=.75?'var(--ok)':v>=.55?'var(--warn)':'var(--bad)';
    hero=`<section class="hero" style="--vc:${vc}">${ring(s,100,112,11,'fade',s,'Balance')}<div class="hv"><h2>${vh}</h2><p>${vt}</p>
      ${miniBar('Sleep',sl??0,1,cl(sl),pc(sl))}${miniBar('Feel',feel??0,1,cl(feel),pc(feel))}${miniBar('Body',body??0,1,cl(body),pc(body))}</div></section>`}
  else hero=`<a class="hero empty" href="#checkin">${ring(null,100,112,11,'fade','–','Balance')}<div class="hv"><h2>Check in to see your balance</h2><p>Last night's sleep, how you feel and any niggles. Or tap Dictate and just say it.</p><span class="go">Open check-in ›</span></div></a>`;
  // tiles
  const sh=sleepHours(d),need=sleepNeed(k),debt=sleepDebt(k);
  const tSleep=`<a class="dt" href="#checkin" data-dtab><span class="dl">Sleep</span>${sh!=null?`<b class="big num">${sh}<small>h</small></b><span class="ds">${esc(d.bed||'')}${d.wake?`–${esc(d.wake)}`:''}</span><span class="dots">${[1,2,3,4,5].map(i=>`<i class="${d.sleepQ>=i?'on':''}"></i>`).join('')}</span><span class="ds">Need ${need} h${debt>0.2?` · <b style="color:${debt>=3?'var(--bad)':'var(--warn)'}">${debt} h debt</b>`:''}</span>`:'<b class="big">–</b><span class="ds">Not logged</span>'}</a>`;
  let tSess;
  if(pl&&pl.type!=='R'&&!pl.pre){const lg=LL[k];const name=pl.type==='T'&&!THRMIN[pl.wk-1]?'5 km test':TNAME[pl.type];const st=lg?lg.status:null;
    tSess=`<a class="dt" href="#training" data-dtab style="--c:var(${TVAR[lg&&lg.type==='H'&&pl.type==='T'?'H':pl.type]})"><span class="dl">Today's session</span><b class="mid">${esc(name)}</b><span class="ds">${esc(trainTimeFor(k))}${FASTED()?' · fasted':''}</span><span class="chipx ${st||'todo'}">${st==='done'?'✓ Done':st==='partial'?'◐ Partly done':st==='missed'?'Missed':d&&d.trainIntent==='no'?'Skipping':'Not logged yet'}</span></a>`}
  else{const next=(()=>{for(let i=1;i<=20;i++){const dd=addD(now,i),p=planFor(dd);if(p&&p.type!=='R'&&!p.pre)return {dd,p}}return null})();
    const ix=(d&&d.extras)||[];tSess=`<a class="dt" href="#training" data-dtab><span class="dl">Today's session</span><b class="mid">${ix.length?'Extra session':d&&d.trainIntent==='extra'?'Training planned':pl&&!pl.pre?'Rest day':'No session'}</b>${ix.length?`<span class="chipx done">✓ Logged</span>`:d&&d.trainIntent==='extra'?'<span class="chipx todo">Not logged yet</span>':''}${next?`<span class="ds">Next: ${TNAME[next.p.type]}<br>${fmtD(next.dd)}</span>`:''}</a>`}
  const dt=dayTypeFor(k),ft=foodTotals(d),kt=nutTarget('kcal',dt),pt=nutTarget('protein',dt),ct=nutTarget('carbs',dt);
  const tFuel=`<a class="dt" href="#food" data-dtab><span class="dl">Fuel · ${DAYT[dt].label}</span><div class="fnum"><b class="num">${Math.round(ft.kcal)}</b><small>of ${kt.t} kcal</small></div>${miniBar('Protein',ft.protein,pt.t,SC[status(ft.protein,pt)],`${Math.round(ft.protein)} / ${pt.t} g`)}${miniBar('Carbs',ft.carbs,ct.t,ft.carbs>ct.hi?'var(--bad)':'var(--e)',`${Math.round(ft.carbs)} / ${ct.hi} g`)}</a>`;
  // fasting
  let fastTxt='–',fastSub='Log food times',fastCol='var(--fg)';const T=targets();
  const fh=fastHours(DD,k);
  if(fh!=null){fastTxt=fh;fastSub=`Overnight fast · target ${T.fastH} h`;fastCol=fh>=T.fastH?'var(--ok)':'var(--warn)'}
  else if(!sampleMode){const pw=mealWindow(DD[yk]);const w=mealWindow(d);if(pw&&!w){const n=new Date();const h=Math.round(((n.getHours()*60+n.getMinutes()+1440)-pw.last)/6)/10;if(h>0&&h<36){fastTxt=h;fastSub=`Fasting now · since ${fmtT(pw.last)}`;fastCol=h>=T.fastH?'var(--ok)':'var(--accent)'}}}
  const tFast=`<a class="dt" href="#food" data-dtab><span class="dl">Fasting</span><b class="big num" style="color:${fastCol}">${fastTxt}${fastTxt!=='–'?'<small>h</small>':''}</b><span class="ds">${fastSub}</span></a>`;
  const ys=strain(yk);const wl=w=>{let t=0;for(let i=0;i<7;i++)t+=dayLoadAll(iso(addD(now,-i-w*7)));return t};const l0=wl(0),l1=wl(1);const ch=l1?Math.round((l0/l1-1)*100):null;
  const tStrain=`<a class="dt" href="#reports" data-dtab><span class="dl">Effort yesterday</span><div class="fuel">${ring(ys,21,72,8,'var(--accent)',ys!=null?ys:'–','/ 21')}<span class="ds" style="flex:1">${ch!=null?`<b class="num" style="color:${ch>25?'var(--bad)':ch<-25?'var(--s)':'var(--fg)'}">${ch>0?'+':''}${ch}%</b> load vs last week`:'7-day load'}</span></div></a>`;
  const nig=(d&&d.niggles||[]).filter(n=>+n.pain>0);
  const tBody=`<a class="dt" href="#checkin" data-dtab><span class="dl">Body</span>${nig.length?nig.slice(0,3).map(n=>`<span class="nigx" style="--nc:${+n.pain>=5?'var(--bad)':+n.pain>=3?'var(--warn)':'var(--muted)'}"><b class="num">${n.pain}</b>${esc(n.side&&n.side!=='Both'?n.side[0]+' ':'')}${esc(n.area)}</span>`).join(''):`<b class="mid" style="color:var(--ok)">No niggles</b>`}${d&&isNum(d.sore)?`<span class="ds">Soreness ${d.sore}/5</span>`:''}</a>`;
  const pw=plantsWeek(k).size;
  const tPlants=`<a class="dt" href="#food" data-dtab><span class="dl">Plants, last 7 days</span><b class="big num">${pw}<small>/ ${PLANTS_WEEK}</small></b>${miniBar('',pw,PLANTS_WEEK,pw>=PLANTS_WEEK?'var(--ok)':'var(--e)','')}</a>`;
  const hab=[['Saw sunrise','Sunrise'],['Read','Read'],['Learned something','Learn'],['Mobility / stretch','Mobility']];
  const scr=(()=>{let n=0,t=0;for(let i=0;i<7;i++){const x=DD[iso(addD(now,-i))];const g=screenGap(x);if(g!=null){t++;if(g>=60)n++}}return t?`${n}/${t}`:'–'})();
  const tHab=`<a class="dt" href="#checkin" data-dtab><span class="dl">Habits · last 7 days</span><div class="habs">${hab.map(([h,l])=>{let n=0;for(let i=0;i<7;i++)if(has(DD[iso(addD(now,-i))],h))n++;return `<span><b class="num">${n}</b>${l}</span>`}).join('')}<span><b class="num">${scr}</b>Screens off 1 h</span></div></a>`;
  // week strip
  const mon=addD(now,-((now.getDay()+6)%7));let wk='',dn=0,pn=0;
  for(let i=0;i<7;i++){const dd=addD(mon,i),kk=iso(dd),p=planFor(dd),lg=LL[kk],r=readiness(DD[kk]);const t=p&&!p.pre?p.type:'R';const col=lg&&lg.type==='H'&&t==='T'?'H':t;
    if(t!=='R'&&dd<=now){pn++;if(lg&&lg.status!=='missed')dn++}
    wk+=`<div class="wd ${kk===k?'today':''}" style="--c:var(${TVAR[col]})"><span class="d">${DOW[i][0]}</span><span class="sq ${t==='R'?'rest':lg?(lg.status==='done'?'done':lg.status==='partial'?'part':'miss'):''}"></span><span class="rb2" style="height:${r!=null?Math.max(4,r*.3):3}px;background:${r!=null?rColor(r):'var(--line)'}"></span></div>`}
  const rs=[];for(let i=13;i>=0;i--)rs.push(readiness(DD[iso(addD(now,-i))]));
  const rv=rs.filter(x=>x!=null);
  // day balance (yesterday)
  const yd=DD[yk];const bal=[['farmHrs','var(--farm)',WORK],['deskHrs','var(--s)','Desk'],['carHrs','var(--o)','Car'],['familyHrs','var(--e)','Family']];
  const balTot=yd?bal.reduce((a,[f])=>a+(+yd[f]||0),0):0;
  const balance=balTot?`<div class="stack">${bal.map(([f,c,l])=>+yd[f]?`<i style="flex:${+yd[f]};background:${c}" title="${l}"></i>`:'').join('')}</div><div class="legend">${bal.map(([f,c,l])=>`<span style="--c:${c}"><i></i>${l} ${+yd[f]||0} h</span>`).join('')}</div>`:'<div class="ds">Comes from the morning check-in, under Yesterday.</div>';
  const ov=!sampleMode&&meta.overview?String(meta.overview.text).split('\n').filter(x=>x.trim().startsWith('-')).slice(0,2).map(x=>x.replace(/^-\s*/,'').split(' :: ')[0]):[];
  const due=!sampleMode&&planDue();
  const su=setupChecklistHTML();return toggle+(su?`<details class="kmore p1setup"><summary>Getting started</summary>${su}</details>`:'')+injuryBanner()+hero+`${p1TodayLine(k)}${sampleMode?'':p1Tiles()}${todayFoodHTML(k)}<details class="kmore"><summary>More about today</summary><div class="dgrid">${tSleep}${tSess}${tFast}${tStrain}${tBody}${tPlants}${tHab}</div>
   <section class="panel"><div class="ph"><h3>This week</h3><span class="ds">${pn?`${dn} of ${pn} sessions done`:'No sessions yet'}</span></div><div class="wstrip">${wk}</div></section>
   <section class="panel"><div class="ph"><h3>Balance, 14 days</h3><span class="ds">${rv.length?`avg <b class="num">${Math.round(avg(rv))}</b>`:''}</span></div>${rv.length>1?spark(rs,0,100):'<div class="ds">Builds up as you check in each morning.</div>'}</section>
   <section class="panel"><div class="ph"><h3>Yesterday's hours</h3></div>${balance}</section></details>
   ${due?`<button type="button" class="rpill" data-fview="plan" style="--vc:var(--accent);width:100%;text-align:left"><b>!</b><span><b>${due==='none'?'Plan your next 3 days of food':'Your meal plan ends today'}</b><br><small>Update your food and tap Plan.</small></span><span aria-hidden="true">›</span></button>`:''}
   ${ov.length?`<a class="panel" href="#reports" style="text-decoration:none;color:inherit"><div class="ph"><h3>Coach's notes</h3><span class="ds">${fmtD(new Date(meta.overview.at))}</span></div>${ov.map(x=>`<p class="ovl">${esc(x)}</p>`).join('')}</a>`:''}`;
}
// ================= dictate anything =================
const MIC='<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V22h2v-3.08A7 7 0 0 0 19 12h-2Z" fill="currentColor"/></svg>';
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let vState={open:false,busy:false,listening:false,blocked:false};let rec=null;
function openVoice(){
  if(!sample){toast('Dictation is not available in this view');return}
  vState.open=true;updateFab();const v=$('#voice');const k=sel;
  v.innerHTML=`<div class="vsheet" role="dialog" aria-label="Dictate"><div class="vh"><b>${vTab().head}</b><span>${fmtD(k,{weekday:'long',day:'numeric',month:'short'})}</span><button type="button" class="x" id="vClose" aria-label="Close">×</button></div>
    <textarea id="v-text" placeholder="${esc(vTab().ph)}"></textarea>
    <div class="vi" id="v-interim"></div>
    <div class="vhint" id="v-hint">${canRecord()?'Hold the button and talk, or tap it once to start and again to stop.':SR&&!vState.blocked?'Tap Speak and talk, or use the microphone on your keyboard.':'Tap in the box and use the microphone on your keyboard to talk.'} ${vTab().line}</div>
    <details class="wu" open><summary>${vTab().title}</summary><ul class="cover">${vTab().cover}</ul></details>
    <div class="actions">${canRecord()?speakBtn('v-text'):SR&&!vState.blocked?`<button type="button" class="ghost vspeak" id="vSpeak">${MIC}<span>Speak</span></button>`:''}<button type="button" class="primary" id="vGo">Fill it in</button></div>
    <div class="hsum" id="v-msg" role="status"></div></div>`;
  v.hidden=false;setTimeout(()=>{const t=$('#v-text');if(t&&!(SR&&!vState.blocked))t.focus()},50);
}
function closeVoice(){vForce=null;stopListen();vState.open=false;const v=$('#voice');v.hidden=true;v.innerHTML='';updateFab()}
function stopListen(){if(rec){try{rec.stop()}catch(e){}}vState.listening=false;const b=$('#vSpeak');if(b){b.classList.remove('on');b.querySelector('span').textContent='Speak'}}
function toggleListen(){
  if(vState.listening){stopListen();return}
  try{rec=new SR();rec.lang='en-IE';rec.continuous=true;rec.interimResults=true}catch(e){speechBlocked();return}
  rec.onresult=ev=>{let fin='',int='';for(let i=ev.resultIndex;i<ev.results.length;i++){const r=ev.results[i];if(r.isFinal)fin+=r[0].transcript;else int+=r[0].transcript}
    const t=$('#v-text');if(t&&fin)t.value=(t.value?t.value.replace(/\s*$/,' '):'')+fin.trim();const it=$('#v-interim');if(it)it.textContent=int};
  rec.onerror=ev=>{if(['not-allowed','service-not-allowed','audio-capture'].includes(ev.error))speechBlocked();else stopListen()};
  rec.onend=()=>{if(vState.listening)stopListen();const it=$('#v-interim');if(it)it.textContent=''};
  try{rec.start();vState.listening=true;const b=$('#vSpeak');if(b){b.classList.add('on');b.querySelector('span').textContent='Stop'}}catch(e){speechBlocked()}
}
function speechBlocked(){vState.blocked=true;stopListen();const b=$('#vSpeak');if(b)b.remove();const h=$('#v-hint');if(h)h.textContent="The microphone can't be used directly here. Tap in the box and use the microphone on your keyboard instead; it works the same.";const t=$('#v-text');if(t)t.focus()}
function voicePrompt(text,ci){
  const k=iso(sel),pl=planFor(sel),n=new Date();
  return `Turn this spoken update from ${ABOUT} into structured log entries for ${k} (${fmtD(sel,{weekday:'long'})}). It is now ${fmtT(n.getHours()*60+n.getMinutes())} on ${iso(todayDate())}. Only include what they actually say or clearly imply; leave everything else out.${ci?' This is their morning check-in: sleep is last night, how they feel is this morning, and work, family time, habits and other training are yesterday.':''}
Planned training session that day: ${pl&&pl.type!=='R'&&!pl.pre?(pl.type==='T'&&!THRMIN[pl.wk-1]?'5 km time trial':TNAME[pl.type]):'none'}.
Kitchen stock now: ${kitchen().map(x=>x.name+(x.qty?` (${x.qty})`:'')).join(', ')||'empty'}.
Fields:
"checkin": {"bed":"HH:MM","wake":"HH:MM","screenOff":"HH:MM" (when he stopped looking at screens before bed),"sleepQ":1-5,"energy":1-5,"mood":1-5,"stress":1-5 (5 = very stressed),"sore":1-5 (5 = very sore),"rhr":morning pulse bpm,"weight":kg,"farm":0-4 (0 none, 1 light, 2 moderate, 3 heavy, 4 very heavy ${WORK.toLowerCase()}),"farmHrs":h,"deskHrs":h office/desk,"carHrs":h driving,"familyHrs":h quality time with wife and kids,"steps":n,"habits":subset of ${JSON.stringify(HABITS)},"flags":subset of ${JSON.stringify(FLAGS)},"niggles":[{"area":one of ${JSON.stringify(AREAS)},"side":"Left"|"Right"|"Both","pain":0-10,"note":"cause if said"}],"extras":[{"kind":one of ${JSON.stringify(EXTRA_KINDS)},"dur":min,"rpe":1-10}] for training other than the planned session,"trainIntent":"yes" if they say they will do today's planned session, "no" if they won't train today, "extra" if no session is planned but they will train anyway,"trainTime":"HH:MM" roughly when they will train today,"notes":"anything else worth keeping, short","workDay":"yesterday" or "today": which day the work hours, family time, steps, habits and other training refer to (in a morning check-in they are almost always yesterday)}
Map plain words to scales: "slept badly" sleepQ 2, "wrecked" energy 1, "flying" energy 5, "half eleven" 23:30.
"session": only if he talks about the planned session: {"status":"done"|"partial"|"missed","dur":min,"rpe":1-10,"tb":${KEYLIFTS[0]||'main lift'} top set kg,"ss":${KEYLIFTS[1]||'second lift'} kg,"pace":"m:ss" average threshold rep pace per km,"fivek":"mm:ss","swap":true if he did a Hyrox class instead of the Friday threshold run,"notes":"short"}
"food": only if he mentions eating or drinking: {"items":[{"name","qty","meal":"Breakfast"|"Lunch"|"Dinner"|"Snack","at":"HH:MM" or null, ${NUT_JSON}}]}. Irish portions for him unless stated; cooked weights; NET carbs. Coffees and teas are items (almond cappuccino about 44 kcal, 4 g net carbs, 125 mg caffeine; tea about 45 mg caffeine). If a meal matches one of the guide recipes use its figures: ${LIB.map(x=>`${x[0]}: ${x[2]} kcal ${x[3]}p ${x[4]}f ${x[5]}c ${x[6]} fibre`).join('; ')}.
"water": litres of water if said, else null.
"kitchen": only if he mentions buying, having or running out of food, or describes where he will be eating (hotel buffet, restaurants, shop, work): {"items":[the full updated list, each {"name","qty","where":"Fridge"|"Freezer"|"Cupboard"|"Hotel / buffet"|"Restaurant"|"Shop"|"Work"|"Other"}]}, adding the foods realistically available at any place he describes; else null.
"eating": if they describe how they will eat over the coming days (where they will be, how many times a day, what they can get): {"style":"home"|"mixed"|"away","meals":2|3|4 or null,"note":"their description in a sentence or two"}, else null.
"plan": if he asks for his meals to be planned, a short line of anything to work around (or ""), else null.
"summary": one short line of what you filled in.
Reply with ONLY JSON: {"checkin":{},"session":null,"food":null,"water":null,"kitchen":null,"plan":null,"eating":null,"summary":""}
Spoken update: """${text.slice(0,8000)}"""`;
}
async function runVoice(){
  const t=$('#v-text');const text=(t&&t.value||'').trim();if(!text){toast('Say or type something first');return}
  stopListen();vState.busy=true;const go=$('#vGo'),msg=$('#v-msg');if(go){go.disabled=true;go.textContent='Working… up to a minute'}if(msg)msg.textContent='';
  const prompt=voicePrompt(text);
  try{const out=await sample.json(prompt);const done=await applyVoice(out||{});
    vState.busy=false;closeVoice();dDraft=null;sDraft=null;dEdit=false;if(!(meta.flags&&meta.flags.voice))persistMeta('flags',Object.assign({},meta.flags||{},{voice:true}));
    toast((out&&out.summary?String(out.summary).slice(0,140):done.length?'Filled in '+done.join(', '):'Nothing to fill in'),4500);
    if(out&&out.plan!=null&&typeof out.plan==='string'){fView='plan';location.hash='food';buildPlan(out.plan);return}
    if(tab()==='checkin'&&done.includes('check-in'))location.hash='dashboard';else render();
  }catch(e){vState.busy=false;const m=$('#v-msg');if(m)m.textContent=foodErr(e);const g=$('#vGo');if(g){g.disabled=false;g.textContent='Fill it in'}}
}
async function applyVoice(out){
  const k=iso(sel);const done=[];
  const c=out.checkin;if(c&&typeof c==='object'){const yk=c.workDay==='today'?k:prevKey(k);const {d,y}=checkinFields(c,days[k]||{},days[yk]||{});
    if(Object.keys(d).length)await persistDay(k,d);if(Object.keys(y).length)await persistDay(yk,y);if(Object.keys(d).length||Object.keys(y).length)done.push('check-in')}
  const s=out.session,pl=planFor(sel);
  if(s&&typeof s==='object'&&pl&&pl.type!=='R'){const cur=logs[k]?clone(logs[k]):{date:k,status:null,notes:''};
    const st=['done','partial','missed'].includes(s.status)?s.status:(isNum(s.dur)||isNum(s.rpe)?'done':cur.status);
    if(st){cur.status=st;['dur','rpe','tb','ss'].forEach(x=>{if(isNum(s[x]))cur[x]=+s[x]});if(toSec(s.pace))cur.pace=String(s.pace);if(toSec(s.fivek))cur.fivek=String(s.fivek);if(s.swap===true&&pl.type==='T')cur.swap=true;if(s.notes)cur.notes=((cur.notes?cur.notes+' ':'')+String(s.notes)).slice(0,400);
      const doc={...cur,date:k,wk:pl.wk,slot:pl.type,type:pl.type==='T'&&cur.swap?'H':pl.type,savedAt:new Date().toISOString()};logs[k]=doc;
      if(logsCol){try{await logsCol.doc(k).set(doc)}catch(e){toast('Could not save the session')}}done.push('session')}}
  const fi=out.food&&Array.isArray(out.food.items)?cleanItems(out.food.items,guessMeal(),true,'voice'):[];
  if(fi.length){await addFood(fi,k);done.push(`${fi.length} food item${fi.length>1?'s':''}`)}
  if(isNum(out.water)&&+out.water>0){await persistDay(k,{water:+out.water});done.push('water')}
  if(out.kitchen&&Array.isArray(out.kitchen.items)){const items=out.kitchen.items.filter(x=>x&&x.name).map(x=>({name:String(x.name).slice(0,50),qty:String(x.qty||'').slice(0,30),where:kwOf(x.where)}));await persistMeta('kitchen',{items,updatedAt:new Date().toISOString()});done.push('kitchen')}
  const ea=out.eating;if(ea&&typeof ea==='object'){const st=Object.assign({},meta.settings||{});if(['home','mixed','away'].includes(ea.style))st.eatStyle=ea.style;if([2,3,4].includes(+ea.meals))st.meals=String(+ea.meals);if(ea.note)st.eatNote=String(ea.note).slice(0,800);await persistMeta('settings',st);done.push('how you eat')}
  return done;
}
// ================= flexible training + real-life food =================
let xState={open:false,text:'',busy:false,msg:'',last:null,moveOpen:false,sug:null,sBusy:false,sMsg:''};
const XABOUT=()=>typeof ABOUT!=='undefined'&&ABOUT?ABOUT:'Darren, 82 kg sheep and cattle farmer and senior Gaelic footballer also training for Hyrox';
const HARDC=['S','H','T','X'];
const DAYLONG=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
function ADJ(){try{return (!sampleMode&&meta.adjust&&meta.adjust.days)||{}}catch(e){return {}}}
function adjFor(k){const a=ADJ()[k];return a||null}
function weekFor(k){let t=TYPES;try{((meta.weekChanges&&meta.weekChanges.list)||[]).forEach(w=>{if(k>=w.from&&Array.isArray(w.week)&&w.week.length===7)t=w.week})}catch(e){}return t}
const planCodes=()=>Object.keys(TNAME).filter(c=>c!=='O');
function sessionBrief(d,p){const wi=p.wk-1,t=p.type;if(t==='T')return THRMIN[wi]?`${TNAME.T}: ${THR[wi]}`:'5 km time trial';if(t==='E')return `${TNAME.E}: ${EASY[wi]} min easy`;if(t==='X')return `${TNAME.X}: speed block then ${LONG[wi]} min long easy run`;return TNAME[t]}
function loadHistory(k){const out=[];for(let i=6;i>=0;i--){const kk=iso(addD(parse(k),-i)),p=planFor(parse(kk)),l=L()[kk],dd=D()[kk];
  out.push({date:kk,weekday:fmtD(parse(kk),{weekday:'short'}),planned:p?sessionBrief(parse(kk),p):'no plan yet',done:l&&l.status?`${l.status}${l.dur?`, ${l.dur} min`:''}${l.rpe?`, effort ${l.rpe}/10`:''}`:'',extra:(dd&&dd.extras||[]).map(x=>`${x.desc||x.kind}${x.dur?` ${x.dur} min`:''}${x.rpe?` effort ${x.rpe}`:''}`).join('; ')})}return out}
function cleanExtra(x){const kind=EXTRA_KINDS.includes(x.kind)?x.kind:(/run|jog/i.test(x.kind||x.desc||'')?'Run':/gym|weights|lift/i.test(x.kind||x.desc||'')?'Gym':'Other');
  return {kind,dur:Math.max(0,Math.round(+x.dur||0))||null,rpe:isNum(x.rpe)?Math.min(10,Math.max(1,Math.round(+x.rpe))):null,desc:String(x.desc||'').slice(0,80),via:'training'}}
function extraPrompt(k,text){
  const d=parse(k);const today=planFor(d);const range=[];for(let i=0;i<=3;i++){const dd=addD(d,i),kk=iso(dd),p=planFor(dd);if(!p||kk<iso(todayDate())||L()[kk])continue;if(i===0&&!p)continue;range.push({date:kk,weekday:fmtD(dd,{weekday:'long'}),code:p.type,session:sessionBrief(dd,p)})}
  const r=readiness(D()[k]);
  return `${XABOUT()} did training outside their plan on ${k} (${fmtD(d,{weekday:'long'})}). Turn what they said into session entries, then decide whether the next few days of their plan need a small change so they don't overload or double up.
What they said: """${text.slice(0,3000)}"""
Planned session that day: ${today?sessionBrief(d,today)+(L()[k]&&L()[k].status?` (already logged as ${L()[k].status})`:''):'none (their plan has not started yet)'}.
Last 7 days: ${JSON.stringify(loadHistory(k))}
Balance that morning: ${r==null?'not checked in':r+'/100'}.
Days you may change (only these): ${range.length?JSON.stringify(range):'none'}.
Session codes: ${planCodes().map(c=>`${c} = ${TNAME[c]}`).join(', ')}.
Rules: keep the plan's structure and change as little as possible. Only change a day when it is clearly needed: a hard session the day after a hard extra one, the same muscles hit hard two days running, or the extra session already covered that day's planned work (then that day can become R). Prefer making a day easier or a rest day over moving sessions around. Fixed classes or club sessions stay put. If no change is needed, return an empty list. Each change gets a short practical note, e.g. "Easy 30 minutes instead: your legs had a hard run yesterday".
Reply with ONLY JSON: {"extras":[{"kind":one of ${JSON.stringify(EXTRA_KINDS)},"desc":"short, e.g. 5 km easy beach run","dur":minutes,"rpe":1-10 effort (estimate from how they describe it)}],"adjust":[{"date":"YYYY-MM-DD","type":"code","note":"one short line"}],"summary":"one short line, e.g. Logged a 30-minute easy run; Tuesday's strength stays as planned."}`;
}
async function applyAdjust(list,src){
  const codes=planCodes();const cur=Object.assign({},ADJ());const applied=[];const now=new Date().toISOString();
  (Array.isArray(list)?list:[]).forEach(a=>{if(!a||!a.date)return;const k=String(a.date).slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||k<iso(todayDate())||L()[k])return;const p=planFor(parse(k));if(!p)return;
    const type=codes.includes(a.type)?a.type:p.type;const note=String(a.note||'').slice(0,160);if(type===p.type&&!note)return;
    cur[k]={type,note,src,at:now,was:p.type,prev:cur[k]||null};applied.push({date:k,from:p.type,to:type,note})});
  if(applied.length)await persistMeta('adjust',{days:cur});return applied;
}
async function undoAdjust(k){const cur=Object.assign({},ADJ());const a=cur[k];if(!a)return;
  if(a.group){Object.keys(cur).forEach(x=>{const b=cur[x];if(b&&b.group===a.group){if(b.prev)cur[x]=b.prev;else delete cur[x]}});await persistMeta('adjust',{days:cur});toast('Back to the original plan');render();return}if(a.prev)cur[k]=a.prev;else delete cur[k];
  if(a.src==='move'&&a.pair){const b=cur[a.pair];if(b&&b.src==='move'&&b.pair===k){if(b.prev)cur[a.pair]=b.prev;else delete cur[a.pair]}}
  await persistMeta('adjust',{days:cur});if(xState.last)xState.last.applied=(xState.last.applied||[]).filter(x=>x.date!==k&&x.date!==a.pair);toast('Back to the original plan');render()}
async function addExtra(){
  const k=iso(sel);const ta=$('#x-say');const text=(ta&&ta.value||'').trim();xState.text=text;
  const mm=$('#x-min'),mk=$('#x-kind'),mr=$('#x-rpe');let items=[],adjust=[],summary='';
  if(!(text&&sample)){const dur=+(mm&&mm.value)||0;if(!dur&&!text){xState.msg='Say what you did, or fill in the minutes below.';render();return}
    items=[cleanExtra({kind:mk&&mk.value,dur,rpe:mr&&mr.value,desc:text.slice(0,80)})];}
  xState.busy=true;xState.msg=items.length?'':'Logging it and checking the next few days… up to a minute.';render();
  try{
    if(!items.length){const out=await sample.json(extraPrompt(k,text));items=(Array.isArray(out&&out.extras)?out.extras:[]).filter(Boolean).map(cleanExtra).filter(x=>x.dur||x.desc);adjust=out&&out.adjust;summary=String(out&&out.summary||'').slice(0,200)}
    if(!items.length){xState={...xState,busy:false,msg:"Couldn't pick out a session. Say what you did and for roughly how long."};render();return}
    const cur=(days[k]&&days[k].extras)||[];await persistDay(k,{extras:cur.concat(items)});
    const applied=await applyAdjust(adjust,'extra');
    if(k===iso(todayDate())&&!(days[k]&&days[k].dayType))toast('Session added. Food targets now count today as a training day.',3500);
    xState={...xState,open:false,text:'',busy:false,msg:'',last:{date:k,summary:summary||`Logged ${items.map(x=>x.desc||x.kind).join(', ')}.`,applied}};dDraft=null;if(!(k===iso(todayDate())&&!(days[k]&&days[k].dayType)))toast('Session added');
  }catch(e){xState={...xState,busy:false,msg:foodErr(e)}}
  render();
}
async function delExtra(i){const k=iso(sel);const cur=((days[k]&&days[k].extras)||[]).slice();cur.splice(i,1);const back=!cur.length&&days[k]&&days[k].trainIntent==='extra';await persistDay(k,back?{extras:cur,trainIntent:null}:{extras:cur});dDraft=null;toast(back?'Removed. Today is back to a rest day and your food targets are updated.':'Session removed');render()}
document.addEventListener('click',async e=>{if(!(e.target.closest&&e.target.closest('[data-intentclear]')))return;const k=iso(sel);await persistDay(k,{trainIntent:null});dDraft=null;toast('Okay, today is back to a rest day. Food targets updated.',3500);render()});
async function moveSession(a,b){
  const pa=planFor(parse(a)),pb=planFor(parse(b));if(!pa||!pb)return;const cur=Object.assign({},ADJ());const now=new Date().toISOString();
  const dn=k=>fmtD(parse(k),{weekday:'long'});
  cur[a]={type:pb.type,note:pb.type==='R'?`${TNAME[pa.type]} moved to ${dn(b)}`:`Swapped with ${dn(b)}`,src:'move',pair:b,at:now,was:pa.type,prev:cur[a]||null};
  cur[b]={type:pa.type,note:`Moved from ${dn(a)}`,src:'move',pair:a,at:now,was:pb.type,prev:cur[b]||null};
  await persistMeta('adjust',{days:cur});
  const mv=((meta.moves&&meta.moves.list)||[]).concat([{at:now,from:a,to:b,code:pa.type,fromDow:pa.di,toDow:pb.di}]).slice(-80);await persistMeta('moves',{list:mv});
  xState.moveOpen=false;
  const nb=[iso(addD(parse(b),-1)),iso(addD(parse(b),1))].filter(x=>x!==a).map(x=>{const p=planFor(parse(x));return p&&HARDC.includes(p.type)});
  toast(HARDC.includes(pa.type)&&nb.some(Boolean)?`Moved to ${dn(b)}. Heads up: that puts two hard days back to back.`:`Moved to ${dn(b)}`,3800);
  sel=parse(b);sDraft=null;dDraft=null;render();balanceWeek(a<b?a:b);
}
function adjBanner(pl){if(!pl||!pl.adj)return '';const a=pl.adj;const k=iso(sel);
  return `<div class="adjb"><div><b>${a.src==='move'?'Moved':'Adjusted'}${a.was&&a.was!==pl.type?`: was ${esc(TNAME[a.was]||'')}`:''}</b>${a.note?`<br><span>${esc(a.note)}</span>`:''}</div>${k>=iso(todayDate())&&!L()[k]?`<button type="button" class="ghost" data-xundo="${k}">Undo</button>`:''}</div>`}
function moveHTML(pl){const k=iso(sel);if(!pl||pl.type==='R'||L()[k]||k<iso(todayDate()))return '';
  const isToday=k===iso(todayDate());const skip=isToday&&!((D()[k]||{}).trainIntent==='no');
  if(!xState.moveOpen)return `<div class="movebar"><button type="button" class="ghost" id="mvPost">⏭ Postpone</button><button type="button" class="ghost" id="mvOpen">⇄ Move</button>${skip?`<button type="button" class="ghost" id="mvSkip">Skip today</button>`:''}</div>`;
  const opts=[];for(let i=-3;i<=7;i++){const d=addD(sel,i),kk=iso(d),p=planFor(d);if(kk===k||kk<iso(todayDate())||!p||L()[kk])continue;opts.push(`<button type="button" data-mvto="${kk}" style="--c:var(${TVAR[p.type]})"><b>${fmtD(d,{weekday:'short'})} ${d.getDate()}</b><span>${esc(TNAME[p.type])}</span></button>`)}
  return `<article class="card"><div class="chead"><div style="flex:1"><h2>Move ${esc(TNAME[pl.type])} to…</h2><div class="sub">The two days swap. Then the app checks the rest of your week and eases anything that ends up too close together.</div></div><button type="button" class="x" id="mvClose" aria-label="Close">×</button></div><div class="mvgrid">${opts.join('')||'<div class="hint">No free days in the next week.</div>'}</div></article>`}
function extrasCardHTML(k){
  const d=D()[k]||{};const ex=d.extras||[];const future=k>iso(todayDate());if(future&&!ex.length)return '';
  const list=ex.map((x,i)=>`<div class="fitem"><div style="min-width:0"><div class="fn">${esc(x.desc||x.kind)}</div><div class="fq">${esc(x.kind)}${x.dur?` · ${x.dur} min`:''}${x.rpe?` · effort ${x.rpe}/10`:''}</div></div><span></span>${sampleMode?'':`<button type="button" class="x" data-xdel="${i}" aria-label="Remove">×</button>`}</div>`).join('');
  const last=xState.last&&xState.last.date===k?xState.last:null;
  const lastH=last?`<div class="form" style="padding-top:0"><div class="hsum" role="status">${esc(last.summary)}</div>${(last.applied||[]).map(a=>`<div class="adjb"><div><b>${fmtD(parse(a.date),{weekday:'long'})}: ${a.from!==a.to?`${esc(TNAME[a.from])} → ${esc(TNAME[a.to])}`:esc(TNAME[a.to])}</b>${a.note?`<br><span>${esc(a.note)}</span>`:''}</div><button type="button" class="ghost" data-xundo="${a.date}">Undo</button></div>`).join('')}</div>`:'';
  const form=xState.open?`<div class="form"><div class="subtabs" style="grid-template-columns:1fr 1fr">${[['solo','On my own'],['class','A class']].map(([v,l])=>`<button type="button" data-xmode="${v}" aria-pressed="${(xState.mode||'solo')===v}">${l}</button>`).join('')}</div>${xState.mode==='class'&&canImg?`<label class="filebtn xboard">${ico('camera')} Snap the class board<input type="file" id="xBoard" accept="image/*"></label><div class="hint" style="font-size:12px;color:var(--muted)">Keel reads the workout from the photo. You can also say it or type it below.</div>`:''}<div class="field"><label class="label" for="x-say">What did you do?</label><textarea id="x-say" placeholder="e.g. 5 km easy run along the beach, about 30 minutes, felt easy. Or: hotel gym, upper body and core, 45 minutes, a 6 out of 10." style="min-height:96px">${esc(xState.text)}</textarea>
      <div class="hint" style="font-size:12px;color:var(--muted)">Say what it was, how long and how hard it felt. ${sample?'The next couple of days adjust if needed so you don\'t overdo it; the rest of your plan stays the same.':''}</div></div>
      ${sample?'':`<div class="row3"><div class="field"><label class="label" for="x-kind">Type</label><select id="x-kind">${EXTRA_KINDS.map(x=>`<option>${esc(x)}</option>`).join('')}</select></div><div class="field"><label class="label" for="x-min">Minutes</label><input id="x-min" type="number" inputmode="numeric"></div><div class="field"><label class="label" for="x-rpe">Effort 1-10</label><input id="x-rpe" type="number" inputmode="numeric" min="1" max="10"></div></div>`}
      <div class="actions">${sample?speakBtn('x-say'):''}<button type="button" class="primary" id="xGo" ${xState.busy?'disabled':''}>${xState.busy?'Working…':'Add it'}</button></div>
      ${xState.msg?`<div class="hsum" role="status">${esc(xState.msg)}</div>`:''}<button type="button" class="ghost" id="xCancel" style="color:var(--muted)">Cancel</button></div>`:'';
  return `<article class="card"><div class="chead"><div style="flex:1"><h2>${ex.length?'Extra training':'Did something else today?'}</h2><div class="sub">${ex.length?`Logged for ${k===iso(todayDate())?'today':fmtD(parse(k))}`:'A walk, a swim, a game or a class. Log it here.'}</div></div></div>
    ${list?`<div class="meals">${list}</div>`:''}${lastH}${form||(future||sampleMode?'':`<div class="form" style="padding-top:${list?'8px':'0'}"><button type="button" class="primary" id="xOpen">+ Add a session${k===iso(todayDate())?' today':''}</button></div>`)}</article>`;
}
// ---- spotting patterns ----
function patternFound(){
  if(sampleMode)return null;const t=todayDate();const since=iso(addD(t,-28));
  const wc=(meta.weekChanges&&meta.weekChanges.list)||[];const lastWc=wc.length?wc[wc.length-1].at.slice(0,10):'';
  const snooze=meta.flags&&meta.flags.patternSnooze;if(snooze&&snooze>iso(t))return null;
  const wcAt=wc.length?wc[wc.length-1].at:'';
  const mv=((meta.moves&&meta.moves.list)||[]).filter(m=>m.at.slice(0,10)>=since&&m.at>wcAt);
  const cnt={};mv.forEach(m=>{const q=m.code+':'+m.fromDow+':'+m.toDow;cnt[q]=(cnt[q]||0)+1});const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
  let ex=0;const kinds={};for(let i=0;i<14;i++){const kk=iso(addD(t,-i));if((lastWc&&kk<=lastWc)||kk<iso(FIRST))continue;(D()[kk]&&D()[kk].extras||[]).forEach(x=>{ex++;kinds[x.kind]=(kinds[x.kind]||0)+1})}
  if(top&&top[1]>=3){const [c,f,to]=top[0].split(':');return {kind:'move',code:c,from:+f,to:+to,text:`You've moved ${TNAME[c]} from ${DAYLONG[f]} to ${DAYLONG[to]} ${top[1]} times lately.`,mv,ex}}
  if(mv.length>=4)return {kind:'moves',text:`You've moved ${mv.length} sessions in the last few weeks.`,mv,ex};
  if(ex>=4){const k1=Object.entries(kinds).sort((a,b)=>b[1]-a[1])[0][0];return {kind:'extras',text:`You've added ${ex} extra sessions in the last 2 weeks, mostly ${k1.toLowerCase()}.`,mv,ex}}
  return null;
}
function nextMonday(){const t=todayDate();return addD(t,7-((t.getDay()+6)%7))}
function heuristicWeek(p){const w=weekFor(iso(nextMonday())).slice();if(p.kind==='move'){const a=w[p.from];w[p.from]=w[p.to];w[p.to]=a}return w}
async function suggestWeek(){
  const p=patternFound();if(!p)return;const cur=weekFor(iso(nextMonday()));
  if(!sample){xState.sug={week:heuristicWeek(p),why:p.text,changes:[]};render();return}
  xState.sBusy=true;xState.sMsg='Looking at how you actually train…';render();
  const extras=[];for(let i=0;i<21;i++){const kk=iso(addD(todayDate(),-i));(D()[kk]&&D()[kk].extras||[]).forEach(x=>extras.push({weekday:fmtD(parse(kk),{weekday:'long'}),what:x.desc||x.kind,dur:x.dur,rpe:x.rpe}))}
  const prompt=`${XABOUT()} follows a weekly training template but keeps changing it. Suggest a better weekly template that fits how they actually train, keeping the same overall training (same sessions, same amount of hard work).
Current week, Monday to Sunday: ${JSON.stringify(cur.map((c,i)=>`${DAYLONG[i]}: ${c} (${TNAME[c]})`))}
Sessions they moved recently: ${JSON.stringify(p.mv.map(m=>`${TNAME[m.code]}: ${DAYLONG[m.fromDow]} → ${DAYLONG[m.toDow]}`))}
Extra sessions they added in the last 3 weeks: ${JSON.stringify(extras)}
Session codes: ${planCodes().map(c=>`${c} = ${TNAME[c]}`).join(', ')}.
Rules: avoid two hard sessions (${HARDC.filter(c=>TNAME[c]).map(c=>TNAME[c]).join(', ')}) on back-to-back days where possible; keep at least one full rest day; fixed classes or club sessions stay on their day unless they moved them. If they keep adding the same extra session, you may swap a rest day for an easy session (E) to make it official.
Reply with ONLY JSON: {"week":["7 codes, Monday first"],"changes":["short line per change, e.g. Strength moves to Tuesday"],"why":"one or two short sentences"}`;
  try{const out=await sample.json(prompt);const codes=planCodes();let w=Array.isArray(out&&out.week)?out.week.map(String):[];if(w.length!==7||!w.every(c=>codes.includes(c)))w=heuristicWeek(p);
    xState.sug={week:w,why:String(out&&out.why||p.text).slice(0,240),changes:(Array.isArray(out&&out.changes)?out.changes:[]).map(String).slice(0,6)};xState.sBusy=false;xState.sMsg=''}
  catch(e){xState.sBusy=false;xState.sMsg=foodErr(e)}
  render();
}
async function useWeek(){const s=xState.sug;if(!s)return;const from=iso(nextMonday());
  const list=((meta.weekChanges&&meta.weekChanges.list)||[]).concat([{from,week:s.week,at:new Date().toISOString()}]);await persistMeta('weekChanges',{list});
  const cur=Object.assign({},ADJ());Object.keys(cur).forEach(k=>{if(k>=from&&cur[k].src==='move')delete cur[k]});await persistMeta('adjust',{days:cur});
  xState.sug=null;toast(`New week starts ${fmtD(parse(from),{weekday:'long',day:'numeric',month:'short'})}`,3500);render()}
async function snoozePattern(){await persistMeta('flags',Object.assign({},meta.flags||{},{patternSnooze:iso(addD(todayDate(),14))}));xState.sug=null;render()}
function patternHTML(){const p=patternFound();if(!p)return '';const s=xState.sug;
  const wk=w=>`<div class="wkchips">${w.map((c,i)=>`<span style="--c:var(${TVAR[c]})"><b>${DOW[i].slice(0,2)}</b>${esc(TNAME[c])}</span>`).join('')}</div>`;
  return `<article class="card"><div class="chead"><div style="flex:1"><h2>Your week could fit you better</h2><div class="sub">${esc(p.text)}</div></div></div><div class="form">
    ${s?`<div class="label">Suggested week, from ${fmtD(nextMonday(),{weekday:'short',day:'numeric',month:'short'})}</div>${wk(s.week)}${s.changes.length?`<ul class="cover">${s.changes.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`:''}<div class="hint" style="font-size:12px;color:var(--muted)">${esc(s.why)}</div>
      <div class="actions"><button type="button" class="ghost" id="sgKeep">Keep my week</button><button type="button" class="primary" id="sgUse">Use this week</button></div>`
    :`<div class="label">Your week now</div>${wk(weekFor(iso(nextMonday())))}<div class="actions"><button type="button" class="ghost" id="sgKeep">Not now</button><button type="button" class="primary" id="sgGo" ${xState.sBusy?'disabled':''}>${xState.sBusy?'Thinking…':'Suggest a better week'}</button></div>`}
    ${xState.sMsg?`<div class="hsum" role="status">${esc(xState.sMsg)}</div>`:''}</div></article>`}
// ---- dictation hints per tab ----
function vTab(){const t=vForce||tab();
  if(t==='training')return {head:'Your training',ph:"e.g. Did the strength session, 55 minutes, felt like a 7, top set 110. Hamstring a bit tight after. Also went for an easy 20-minute jog this evening.",title:'What to cover for training',cover:'<li><b>The planned session:</b> done, partly done or missed</li><li><b>How it went:</b> minutes, effort 1-10, weights or paces</li><li><b>Anything extra:</b> a run, the gym, a game, a class</li><li><b>Niggles:</b> where it hurts and how much, 0-10</li>',line:'Talk about this day\'s training. It logs the session and anything extra you did.'};
  if(t==='food')return {head:'Food',ph:"e.g. Two coffees this morning. Chicken wrap and a yogurt from the shop at 1. Steak, chips and salad out for dinner around 8. About 2 litres of water.",title:'What to cover for food',cover:'<li><b>What you ate and drank,</b> roughly when</li><li><b>Where:</b> home, the shop, a restaurant, and rough portions</li><li><b>Water</b> for the day</li><li><b>Shopping:</b> what you bought or ran out of (updates your food available)</li><li><b>The next few days:</b> where you\'ll be and how many times you\'ll eat (shapes your meal plan)</li>',line:'Talk about food and drink. It logs it for this day and updates your food available.'};
  if(t==='mobility')return {head:'Mobility',ph:"e.g. Did the 15-minute hips routine this morning. Left hip still tight, about 3 out of 10. Calves sore from yesterday's run.",title:'What to cover',cover:'<li><b>What you did</b> and for how long</li><li><b>Where feels tight or sore,</b> and how much, 0-10</li>',line:'Talk about stretching and anything tight or sore.'};
  return {head:t==='checkin'||t==='dashboard'?'Morning check-in':'Say it',ph:"e.g. Bed at half eleven, up at six. Slept well. Energy 4, mood good, a bit stressed. Left hamstring tight, about 3 out of 10. Yesterday: heavy day of manual labour, about 7 hours. An hour in the car, an hour with the kids in the evening. Saw the sunrise.",title:'What to cover',cover:'<li><b>Last night:</b> bed time, wake time, when screens went off, sleep quality 1-5</li><li><b>This morning:</b> energy, mood, stress and soreness, each 1-5; any niggles with pain 0-10</li><li><b>Yesterday:</b> hours of manual labour and how heavy, desk, driving, family time; steps; habits</li><li><b>Training:</b> done, partial or missed; minutes; effort 1-10</li><li><b>Food:</b> what you ate and roughly when</li>',line:'Say how you slept, how you feel and what yesterday looked like. It fills in the check-in.'};
}
// ---- real-life meal plans ----
const WHERE=['Home','Work','Shop','Café','Restaurant','Hotel','On the go'];
function eatRules(){const s=meta.settings||{};const st=s.eatStyle||'home',n=String(s.meals||'auto');const note=String(s.eatNote||'').trim();
  return `HOW THEY ACTUALLY EAT (this overrides anything above when it conflicts):
${st==='home'?'Mostly at home, so cooking from the kitchen is realistic, but keep weekday lunches quick or packable.':st==='mixed'?'A mix of home, work and out. Meals away from home must be things they can pack the night before or buy at a normal local shop, deli counter, garage, café or supermarket nearby. Work lunches are short breaks.':'Mostly away from home (travelling, on holiday or on the go). Do not plan cooking. Plan around what is realistically available where they are: hotel breakfast buffets, restaurants, street food, cafés, convenience shops and supermarkets. Give ordering guidance (what to pick from a menu, buffet or shop shelf) instead of recipes.'}
${n==='auto'?'Choose a sensible number of meals.':`They eat ${n==='4'?'3 meals and 1 snack':n+' times'} a day. Plan exactly that many eating occasions per day (the drinks entry does not count). Do not add other snacks or separate pre- or post-training meals; fold that nutrition into those meals, or offer it as an option.`}
${note?`In their words: """${note.slice(0,800)}""". Follow it exactly: their timing, where they will be and what they can get beat every default rule above.`:''}
Be realistic, not perfect. Set "time" only when they gave a time or one is fixed (like a lunch break); otherwise "time" is "" and "when" is a rough window ("late morning", "lunch break", "evening"). Set "where" for every meal to one of ${JSON.stringify(WHERE)}. Use kitchen stock only for meals at Home or packed from home, and only put things on the shopping list they will be able to use. Never suggest something they couldn't get or eat where they'll be (nothing needing a fridge or a kitchen when they're out all day). Give every meal 1-2 "options": practical alternatives for when the plan can't happen, such as what to grab in a shop or order instead, each with rough nutrition. Protein matters most: with fewer meals, make them bigger rather than adding meals; it is fine to land a little under calories. Only meals cooked at home get a "method"; for other meals "method" is [] and "items" say what to order or pick.`;
}
function mealExtras(m){return {where:WHERE.includes(m.where)?m.where:'',when:String(m.when||'').slice(0,30),
  options:(Array.isArray(m.options)?m.options:[]).filter(x=>x&&x.name).slice(0,3).map(x=>({name:String(x.name).slice(0,70),where:WHERE.includes(x.where)?x.where:'',get:String(x.get||'').slice(0,120),kcal:Math.max(0,+x.kcal||0),protein:Math.max(0,+x.protein||0),carbs:Math.max(0,+x.carbs||0),fat:Math.max(0,+x.fat||0)}))}}
function optsHTML(k,ix,m){const o=m.options||[];if(!o.length)return '';const can=k<=iso(todayDate());const logged=planLogged(k,ix);
  return `<div class="popts"><span>Or, if that's not doable</span>${o.map((x,j)=>`<div class="popt"><div><b>${esc(x.name)}</b>${x.where?` <em>${esc(x.where)}</em>`:''}${x.get?`<br><small>${esc(x.get)}</small>`:''}<br><small class="num">about ${Math.round(x.kcal)} kcal · ${Math.round(x.protein)}p</small></div>${can&&!logged?`<button type="button" class="ghost ate" data-ateopt="${k}:${ix}:${j}">Had this</button>`:''}</div>`).join('')}</div>`}
async function ateOpt(ref){const [k,ix,j]=[ref.slice(0,10),+ref.split(':')[1],+ref.split(':')[2]];const pd=planDay(k);const m=pd&&pd.meals[ix];const x=m&&m.options&&m.options[j];if(!x)return;
  const it={name:x.name,qty:x.get||'',meal:slotMeal(m.slot),at:m.time||MEAL_T[slotMeal(m.slot)],est:true,src:'plan',planRef:k+':'+ix,plants:[],micros:false};NK.forEach(q=>it[q]=0);['kcal','protein','carbs','fat'].forEach(q=>it[q]=+x[q]||0);
  await addFood([it],k);toast(`Logged ${x.name}`);render()}
function eatSetHTML(){const s=meta.settings||{};const st=s.eatStyle||'home',n=String(s.meals||'auto');
  const sg=(key,vals,labels,cur)=>`<div class="seg small">${vals.map((v,i)=>`<button type="button" data-eset="${key}" data-v="${v}" aria-pressed="${cur===v}">${labels[i]}</button>`).join('')}</div>`;
  return `<div class="field"><span class="label">Where will you eat?</span>${sg('eatStyle',['home','mixed','away'],['Mostly home','Home, work, shop','Away / on the go'],st)}</div>
    <div class="field"><span class="label">Times a day</span>${sg('meals',['2','3','4','auto'],['2','3','3 + snack','Any'],n)}</div>
    <div class="field"><label class="label" for="p-req">What will these days look like?</label><textarea id="p-req" placeholder="e.g. On holidays: breakfast at the hotel buffet around 9, then one big meal out in the evening. Just 7-Eleven type shops nearby. Or: at work 8 to 5, half-hour lunch at 1, a Centra beside the yard, home by 6." style="min-height:92px">${esc(pState.req!=null&&pState.req!==''?pState.req:(s.eatNote||''))}</textarea>
      <div class="hint" style="font-size:12px;color:var(--muted)">Say where you'll be, when you'll eat and what you can get. The plan follows it, with shop or menu options when things don't go to plan.</div></div>
    ${sample?`<div class="actions" style="justify-content:flex-start">${speakBtn('p-req')}</div>`:''}`;
}
async function saveEatNote(){const t=$('#p-req');if(!t)return;const v=t.value.trim();if(v!==((meta.settings||{}).eatNote||''))await persistMeta('settings',Object.assign({},meta.settings||{},{eatNote:v}))}
document.addEventListener('click',e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(c('#xOpen')){xState.open=true;xState.msg='';render();setTimeout(()=>{const t=$('#x-say');if(t)t.focus()},60);return}
  if(c('#xCancel')){xState.open=false;xState.msg='';render();return}
  if(c('#xGo')){if(!xState.busy)addExtra();return}
  if(x=c('[data-xdel]')){delExtra(+x.dataset.xdel);return}
  if(x=c('[data-xundo]')){undoAdjust(x.dataset.xundo);return}
  if(c('#mvOpen')){xState.moveOpen=true;render();return}
  if(c('#mvClose')){xState.moveOpen=false;render();return}
  if(x=c('[data-mvto]')){moveSession(iso(sel),x.dataset.mvto);return}
  if(c('#sgGo')){if(!xState.sBusy)suggestWeek();return}
  if(c('#sgUse')){useWeek();return}
  if(c('#sgKeep')){snoozePattern();return}
  if(x=c('[data-ateopt]')){ateOpt(x.dataset.ateopt);return}
  if(x=c('[data-eset]')){const t=$('#p-req');if(t)pState.req=t.value;persistMeta('settings',Object.assign({},meta.settings||{},{[x.dataset.eset]:x.dataset.v})).then(()=>render());return}
});
document.addEventListener('input',e=>{if(e.target.id==='x-say')xState.text=e.target.value;if(e.target.id==='p-req')pState.req=e.target.value});
// ---- food available: home stock or where they'll be eating ----
const KWHERE=['Fridge','Freezer','Cupboard','Hotel / buffet','Restaurant','Shop','Work','Other'];
const kwOf=w=>KWHERE.includes(w)?w:/buffet|hotel/i.test(w||'')?'Hotel / buffet':/restaurant|café|cafe|out/i.test(w||'')?'Restaurant':/shop|store|market/i.test(w||'')?'Shop':/work|canteen/i.test(w||'')?'Work':'Other';
function kitchenPrompt(cur,text){return `A meal-planning app keeps a list of the food a person can get. Here is the current list as JSON: ${JSON.stringify(cur.map(x=>({name:x.name,qty:x.qty,where:x.where})))}
The person just said, in their own words: """${text.slice(0,4000)}"""
They may be listing food at home (bought, used up, run out), OR describing where they will be eating instead (on holiday, a hotel breakfast buffet, eating out, a work canteen, a shop near work, travelling). Handle both:
- Home food: add what was bought, reduce or remove what was used or has run out, and keep everything else. "where" is "Fridge", "Freezer" or "Cupboard".
- Eating away: add the foods realistically available there, using your general knowledge, as items with "where" set to "Hotel / buffet", "Restaurant", "Shop" or "Work". For example, a good hotel breakfast buffet usually has eggs cooked to order, omelettes, bacon, sausages, smoked salmon, cold meats, cheese, Greek yogurt, fresh fruit, oats or muesli, nuts and seeds, breads, pastries and fresh juice. Thai restaurants usually have grilled chicken or pork, fish, stir-fries, curries, jasmine or sticky rice, som tam (papaya salad), tom yum soup, fresh fruit and coconut water. Give 8-15 items for each place they describe; qty is "".
- When they describe eating away, remove nothing from the home list unless they say it's gone.
Also capture how they will eat if they say it: "eating": {"style":"home"|"mixed"|"away","meals":2|3|4 or null,"note":"one or two sentences in plain words: where and when they eat, and any long gaps"}, else null.
Keep names short and generic. Reply with ONLY JSON: {"items":[{"name":"","qty":"","where":"Fridge"}],"eating":null,"summary":"one short line of what changed"}`}
async function applyKitchenOut(out,prevN){
  const items=(Array.isArray(out&&out.items)?out.items:[]).filter(x=>x&&x.name).map(x=>({name:String(x.name).slice(0,50),qty:String(x.qty||'').slice(0,30),where:kwOf(x.where)}));
  const ea=out&&out.eating;let eat=false;
  if(ea&&typeof ea==='object'){const st=Object.assign({},meta.settings||{});if(['home','mixed','away'].includes(ea.style))st.eatStyle=ea.style;if([2,3,4].includes(+ea.meals))st.meals=String(+ea.meals);if(ea.note)st.eatNote=String(ea.note).slice(0,800);await persistMeta('settings',st);eat=true}
  if(items.length)await persistMeta('kitchen',{items,updatedAt:new Date().toISOString()});
  return {items,eat,msg:(out&&out.summary?String(out.summary).slice(0,180)+'. ':'')+(items.length?`${items.length} items on your list.`:'Nothing was added. Try naming the foods, or say where you will be eating.')+(eat?' Your meal plan settings were updated too.':'')};
}

// ================= daily to-do, plan vs eaten, tidier ordering =================
let returnTo=null,sOpenK=null;
function stepDone(){if(returnTo){returnTo=null;setTimeout(()=>{location.hash='dashboard';window.scrollTo({top:0})},700)}}
const ciDone=d=>!!(d&&(d.bed||isNum(d.energy)||isNum(d.sleepQ)));
function dayTodo(){
  if(sampleMode)return null;const t=todayDate(),k=iso(t),d=D()[k]||{},pl=planFor(t),pd=planDay(k),due=planDue(),lg=L()[k];
  const pm=pd?(pd.meals||[]).map((m,ix)=>({m,ix})).filter(x=>!/fasted|drink/i.test(x.m.slot||'')):[];const ticked=pm.filter(x=>planLogged(k,x.ix)).length;
  const items=[['Morning check-in',ciDone(d),'How you slept, how you feel, yesterday\'s work','href="#checkin" data-dtab']];
  if(pl&&pl.type!=='R'&&!pl.pre)items.push([`Log today's session: ${TNAME[pl.type]}`,!!(lg&&lg.status)||d.trainIntent==='no','Done, partly done or missed. Anything extra goes in Movement too.','href="#training" data-dtab']);
  if(!kitchen().length)items.push(['Add your food available',false,'What you have at home, or where you\'ll be eating','data-fview="kitchen"']);
  else if(due)items.push(['Plan your next 3 days of meals',false,'Check your food available is up to date first','data-fview="plan"']);
  items.push(['Log today\'s food',!!d.foodDone,pm.length?`${ticked} of ${pm.length} planned meals ticked off. Sign off at the end of the day.`:'Log what you eat, then sign off at the end of the day.','data-fview="today"']);
  return items;
}
let todoOpen=false;
function todoHTML(){
  const items=dayTodo();if(!items)return '';const done=items.filter(x=>x[1]).length,all=done===items.length;
  if(all)return `<section class="todo alldone"><span class="sn">✓</span><div><b>Today is complete</b><small>${items.length} of ${items.length} done. Nice work.</small></div></section>`;
  const pend=items.filter(x=>!x[1]);const nx=pend[0];const onlyFood=pend.length===1&&/today's food/i.test(nx[0]);
  const tag=nx[3].startsWith('href')?'a':'button';
  const list=todoOpen?`<div class="todolist">${items.map(([t,ok,dsc,attr],i)=>{const tg=attr.startsWith('href')?'a':'button';return `<${tg} ${tg==='button'?'type="button"':''} class="step ${ok?'ok':''}" ${attr} data-todo><span class="sn">${ok?'✓':i+1}</span><span class="st"><b>${esc(t)}</b><small>${esc(dsc)}</small></span><span aria-hidden="true">›</span></${tg}>`}).join('')}</div>`:'';
  return `<section class="todobar "><${tag} ${tag==='button'?'type="button"':''} class="tnext" ${nx[3]} data-todo><span class="tdots" aria-hidden="true">${items.map(x=>`<i class="${x[1]?'on':''}"></i>`).join('')}</span><span class="tt"><small>${onlyFood?'Later today':'Next'} · ${done} of ${items.length} done</small><b>${esc(nx[0])}</b></span><span aria-hidden="true">›</span></${tag}><button type="button" class="ttog" id="todoTog" aria-label="${todoOpen?'Hide':'Show'} today's to-do list" aria-expanded="${todoOpen}">${todoOpen?'▴':'▾'}</button>${list}</section>`;
}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#todoTog')){todoOpen=!todoOpen;render()}});

// ---- plan vs what was eaten ----
const planMealsOf=pd=>(pd&&pd.meals||[]).map((m,ix)=>({m,ix})).filter(x=>!/fasted/i.test(x.m.slot||''));
function planTotals(pd){const t={kcal:0,protein:0,meals:0};planMealsOf(pd).forEach(({m})=>{t.kcal+=kcalOf(m);t.protein+=+m.protein||0;if(!/drink/i.test(m.slot||''))t.meals++});return t}
function planVsHTML(k){
  const pd=planDay(k);if(!pd)return '';const d=D()[k]||{};const pt=planTotals(pd);const food=d.food||[];
  const ate={kcal:food.reduce((a,i)=>a+kcalOf(i),0),protein:food.reduce((a,i)=>a+(+i.protein||0),0)};
  const ticked=new Set(food.filter(i=>i.planRef&&i.planRef.slice(0,10)===k).map(i=>i.planRef)).size;
  const bar=(lab,a,p,u)=>{const pc=p?Math.round(a/p*100):0;const col=pc>=90&&pc<=110?'var(--ok)':pc>=75&&pc<=125?'var(--warn)':'var(--muted)';return `<div class="mac"><div class="mh"><span>${lab}</span><span><b class="num">${Math.round(a)}</b> of ${Math.round(p)}${u} planned · ${pc}%</span></div><div class="tr"><div class="fl" style="width:${Math.min(100,pc)}%;background:${col}"></div></div></div>`};
  return `<article class="card"><div class="chead"><div style="flex:1"><h2>Plan vs eaten</h2><div class="sub">${ticked} of ${pt.meals} planned meals ticked off${food.length&&!ticked?' · logged your own way':''}</div></div></div><div class="macs">${bar('Calories',ate.kcal,pt.kcal,'')}${bar('Protein',ate.protein,pt.protein,' g')}</div></article>`;
}
async function savePlanHist(ds){const h=Object.assign({},meta.planHist||{});ds.forEach(pd=>{const t=planTotals(pd);h[pd.date]={meals:t.meals,kcal:Math.round(t.kcal),protein:Math.round(t.protein)}});
  const keys=Object.keys(h).sort();keys.slice(0,Math.max(0,keys.length-90)).forEach(x=>delete h[x]);await persistMeta('planHist',h)}
function planStickHTML(){
  const h=meta.planHist||{};const t=todayDate();const rows=[];
  for(let i=13;i>=0;i--){const k=iso(addD(t,-i));const p=h[k];if(!p||k>iso(t))continue;const d=D()[k]||{};const food=d.food||[];
    const ticked=new Set(food.filter(x=>x.planRef&&x.planRef.slice(0,10)===k).map(x=>x.planRef)).size;const ate=food.reduce((a,x)=>a+kcalOf(x),0);rows.push({k,p,ticked,ate})}
  if(!rows.length)return '';
  const mealPct=Math.round(100*rows.reduce((a,r)=>a+Math.min(r.ticked,r.p.meals),0)/Math.max(1,rows.reduce((a,r)=>a+r.p.meals,0)));
  return `<section class="panel"><h3>Sticking to the meal plan</h3><div class="hint">Last ${rows.length} planned day${rows.length>1?'s':''}: <b style="color:var(--fg)">${mealPct}%</b> of planned meals eaten. Calories eaten against the plan, day by day:</div>
    <div class="bars">${rows.map(r=>{const pc=r.p.kcal?Math.round(r.ate/r.p.kcal*100):0;return `<div class="bar" style="--c:${pc>=90&&pc<=110?'var(--ok)':pc>=75&&pc<=125?'var(--warn)':'var(--bad)'}"><span>${fmtD(parse(r.k),{weekday:'short',day:'numeric'})} · ${r.ticked}/${r.p.meals}</span><div class="tr"><div class="fl" style="width:${Math.min(100,pc)}%"></div></div><span class="pct num">${pc}%</span></div>`}).join('')}</div></section>`;
}
// ---- plan tab: plan first, settings at the bottom ----
function planTopHTML(p){const d0=p.days[0].date,d1=p.days[p.days.length-1].date;
  return `<div class="plantop"><div><b>Your plan · ${short(parse(d0))}-${short(parse(d1))}</b><small>${pState.busy?'Re-planning now…':pState.msg?esc(pState.msg):`Made ${fmtD(new Date(p.createdAt),{weekday:'short',day:'numeric',month:'short'})}`}</small></div><button type="button" class="ghost" id="toReplan">Change &amp; re-plan ↓</button></div>`}
// ---- training: a logged session collapses to one line ----
function loggedHTML(d){const l=L()[iso(d)];const st=l.status;
  const bits=[l.dur?`${l.dur} min`:'',l.rpe?`effort ${l.rpe}/10`:'',l.tb?`${l.tb} kg`:'',l.pace?`${l.pace}/km`:'',l.fivek?`5 km ${l.fivek}`:''].filter(Boolean).join(' · ');
  return `<div class="form logged"><div class="lgrow"><span class="chipx ${st}">${st==='done'?'✓ Done':st==='partial'?'Partly done':'Missed'}</span><span class="ds">${esc(bits)}</span><button type="button" class="editbtn" id="sEdit">✎ Edit</button></div>${l.notes?`<div class="hint" style="font-size:12px;color:var(--muted)">${esc(l.notes)}</div>`:''}</div>`}
document.addEventListener('click',e=>{const c=q=>e.target.closest&&e.target.closest(q);
  if(c('[data-todo]'))returnTo='dashboard';else if(c('.tabs a'))returnTo=null;
  if(c('#toReplan')){const el=$('#replanCard');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(c('#sEdit')){sOpenK=iso(sel);render();return}
  if(c('#foodDoneBtn')){const k=iso(sel);persistDay(k,{foodDone:true}).then(()=>{toast('Food logged for the day');render();stepDone()});return}
  if(c('#foodUndone')){persistDay(iso(sel),{foodDone:false}).then(()=>render());return}
});

// ================= today's training intent → food targets follow what you actually do =================
function dayTypeAuto(k){const d=D()[k]||{},l=L()[k],p=planFor(parse(k));const planned=!!(p&&p.type!=='R'&&!p.pre);
  const ex=(d.extras||[]).filter(x=>x&&(x.dur||x.rpe||x.desc));
  
  if(l&&(l.status==='done'||l.status==='partial'))return 'training';
  if(ex.length)return 'training';
  if(d.trainIntent==='no'||(l&&l.status==='missed'))return 'rest';
  if(d.trainIntent==='yes'||d.trainIntent==='extra')return 'training';
  return planned?'training':'rest'}
function dayTypeWhy(k){const d=D()[k]||{},l=L()[k],p=planFor(parse(k));
  if((d.extras||[]).length)return 'you logged extra training';if(l&&l.status)return l.status==='missed'?'session marked missed':'session logged';
  if(d.trainIntent==='no')return 'not training today';if(d.trainIntent==='extra')return 'you said you\'d train today';return p&&p.type!=='R'&&!p.pre?'from your plan':'no session planned'}
function intentHTML(k,f){
  const p=planFor(parse(k));const planned=!!(p&&p.type!=='R'&&!p.pre);const cur=f.trainIntent||null;
  const opts=planned?[['yes',`Yes, as planned`],['no','Not today']]:[['no','No, rest day'],['extra','Yes, something']];
  return `<article class="card"><div class="form"><div class="group" style="padding-top:0"><h4>Training today${planned?`: ${esc(TNAME[p.type])}`:''}</h4>
    <div class="hint" style="font-size:12px;color:var(--muted)">${planned?'Are you doing it today? Your food targets follow your answer.':'No session planned. Are you training anyway? Your food targets follow your answer.'}</div>
    <div class="seg">${opts.map(([v,l])=>`<button type="button" data-form="d" data-seg="trainIntent" data-v="${v}" aria-pressed="${cur===v}">${l}</button>`).join('')}</div>
    ${cur&&cur!=='no'?`<div class="field" style="max-width:200px"><label class="label" for="ci-tt">Roughly when?</label><input id="ci-tt" type="time" value="${esc(f.trainTime||trainTimeFor(k))}" data-bind="d.trainTime"></div>`:''}
    ${cur==='no'&&planned?`<div class="hint" style="font-size:12px;color:var(--muted)">Want to do it another day instead? Use <b>Move</b> in Movement.</div>`:''}</div></div></article>`}
function intentChip(d){const k=d.date,p=planFor(parse(k));const planned=!!(p&&p.type!=='R'&&!p.pre);const t=d.trainIntent;
  if(!t)return '';return t==='no'?(planned?'Skipping today\'s session':'Rest day'):`Training today${d.trainTime?` · ${esc(d.trainTime)}`:''}`}
async function setIntent(v){const k=iso(sel);await persistDay(k,{trainIntent:v});dDraft=null;toast(v==='no'?'Got it. Food targets switched to a rest day.':'Got it. Food targets switched to a training day.',3500);render()}
function intentNudge(k){if(k!==iso(todayDate())||sampleMode)return '';const d=D()[k]||{},l=L()[k],p=planFor(parse(k));if(!p||p.type==='R'||p.pre||l||d.trainIntent==='no')return '';
  const t=tmin(d.trainTime||trainTimeFor(k)),now=new Date().getHours()*60+new Date().getMinutes();if(t==null||now<t+120)return '';
  return `<div class="adjb"><div><b>Did today's session happen?</b><br><span>Log it below, or tell the app you're skipping it so your food targets drop to a rest day.</span></div><button type="button" class="ghost" data-intent="no">Skipping it</button></div>`}
function planMismatch(k){const pd=planDay(k);if(!pd)return '';const now=dayTypeFor(k);if(!DAYT[pd.dayType]||pd.dayType===now)return '';
  return `<div class="adjb"><div><b>Today changed to a ${esc(DAYT[now].label.toLowerCase())}</b><br><span>Your targets above have switched (${esc(dayTypeWhy(k))}). The meal plan was made for a ${esc(DAYT[pd.dayType].label.toLowerCase())}; follow it loosely or re-plan.</span></div><button type="button" class="ghost" data-fview="plan">Re-plan</button></div>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-intent]');if(b){setIntent(b.dataset.intent)}});

// ================= food log v2: rings, nutrient gaps, water, alcohol, supplements =================
const NUT_FOODS={fibre:'oats, beans and lentils, berries, wholegrain bread, vegetables, chia seeds',sodium:'a pinch of salt on food, stock, cheese; more on heavy sweat days',potassium:'potatoes, bananas, beans, spinach, avocado, yogurt, salmon',
  magnesium:'pumpkin seeds, almonds, cashews, spinach, black beans, oats, dark chocolate (70%+)',calcium:'milk, Greek yogurt, cheese, tinned sardines or salmon with the bones, calcium-set tofu, kale',
  iron:'red meat, mussels, lentils, chickpeas, spinach (with a vitamin C food to absorb it)',zinc:'beef, lamb, oysters, pumpkin seeds, chickpeas, cheese',selenium:'Brazil nuts (1-2 a day is plenty), tuna, sardines, eggs, chicken',
  iodine:'milk, yogurt, white fish like cod and haddock, eggs',vitA:'carrots, sweet potato, spinach, eggs, liver, butter',vitC:'peppers, kiwi, oranges, strawberries, broccoli, tomatoes',
  vitD:'oily fish (salmon, mackerel, sardines), eggs, fortified milk. Hard to get enough from food from October to March in Ireland',vitK:'kale, spinach, broccoli, Brussels sprouts, cabbage',
  b12:'meat, fish, eggs, milk and yogurt',folate:'lentils, chickpeas, spinach, asparagus, broccoli, avocado',choline:'eggs (the yolk), beef, chicken, salmon, soya beans',
  omega3:'salmon, mackerel, sardines, herring, trout, twice a week. Walnuts, flax and chia help but give a different, weaker form'};
const SUPP_INFO=[['Creatine monohydrate','3-5 g a day, any time, with water or food; no loading needed. One of the best-studied supplements for strength and power. Meat and fish contain some, but not enough for the full effect.'],
  ['Vitamin D','Hard to get enough from food or sunlight in an Irish winter, so many people take it from October to March. Ask a pharmacist about the right dose for you.'],
  ['Omega-3 (fish or algae oil)','Worth it if you eat oily fish less than twice a week.'],
  ['Magnesium','Food first: seeds, nuts, greens, beans. If you do take one, keep to the label dose.'],
  ['Protein powder','Just food in a handy form. Useful when you can\'t reach your protein target from meals.'],
  ['Electrolytes','On long or very sweaty days. Otherwise salt on your food covers it.']];
const ALC=[['Pint of lager',2,215,18],['Pint of stout',2,210,17],['Pint of cider',2,220,25],['Bottle of beer',1.5,140,11],['Glass of wine',1.7,160,4],['Gin and tonic',1,130,14],['Vodka and coke',1,150,20],['Spirit, neat',1,70,0],['Alcohol-free beer',0,60,12]];
function alcOn(){const s=(meta.settings||{}).alcohol;if(s)return s==='on';return typeof PROFILE!=='undefined'}
function alcLimit(){let sx='';try{sx=(PROFILE&&PROFILE.answers&&PROFILE.answers.sex)||''}catch(e){}return /female|woman/i.test(sx)?11:17}
function alcWeek(k){let n=0;const t=parse(k),mon=addD(t,-((t.getDay()+6)%7));for(let i=0;i<7;i++){const d=D()[iso(addD(mon,i))];(d&&d.food||[]).forEach(x=>n+=stdDrinks(x))}return Math.round(n*10)/10}
let fx={alc:false,supAdd:false,supBusy:false,supMsg:'',gap:null};
const supps=()=>(meta.supps&&meta.supps.list)||[];
function suppItems(d){if(!d||!d.date)return [];return supps().filter(s=>d.date>=(s.since||'0')&&d.date<=iso(todayDate())&&!(d.suppMissed||[]).includes(s.id)).map(s=>Object.assign({name:s.name},s.nut||{}))}
function ringSVG(v,tg,col,size){const r=size/2-6,c=2*Math.PI*r,p=Math.max(0,Math.min(1,tg?v/tg:0));return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><circle cx="${size/2}" cy="${size/2}" r="${r}" style="fill:none;stroke:var(--line);stroke-width:7"/><circle cx="${size/2}" cy="${size/2}" r="${r}" transform="rotate(-90 ${size/2} ${size/2})" style="fill:none;stroke:${col};stroke-width:7;stroke-linecap:round" stroke-dasharray="${(c*p).toFixed(1)} ${c.toFixed(1)}" ${p?'':'opacity="0"'}/></svg>`}
function macroRings(t,dt){
  const one=(k,lab,col)=>{const n=NUTS.find(x=>x.k===k),tg=nutTarget(k,dt);const ref=tg.hi&&!tg.lo?tg.hi:(tg.t||tg.lo||tg.hi||1);const st=status(t[k],tg);
    return `<div class="mring">${ringSVG(t[k],ref,st==='bad'&&t[k]>ref?'var(--bad)':col,74)}<div class="mrv"><b class="num">${Math.round(t[k])}</b></div><span>${lab}</span><small class="mof">of ${Math.round(ref)}${n.u==='kcal'?'':' '+n.u}</small></div>`};
  return `<div class="mrings">${one('kcal','Calories','var(--o)')}${one('protein','Protein','var(--s)')}${one('carbs','Net carbs','var(--e)')}${one('fat','Fat','var(--x)')}</div>`;
}
function microsHTML(t,dt,k){
  const micros=NUTS.filter(n=>!n.macro&&n.lo);const d=D()[k]||{};const late=d.foodDone||k<iso(todayDate())||new Date().getHours()>=18;
  const gaps=t.microN>=2?micros.map(n=>{const tg=nutTarget(n.k,dt);return {n,pct:tg.lo?t[n.k]/tg.lo:1}}).filter(x=>x.pct<.6).sort((a,b)=>a.pct-b.pct).slice(0,4):[];
  const fib=NUTS.find(x=>x.k==='fibre');const ftg=nutTarget('fibre',dt);if(t.microN>=2&&ftg.lo&&t.fibre<ftg.lo*.6&&gaps.length<4)gaps.push({n:fib,pct:t.fibre/ftg.lo});
  const all=NUTS.filter(n=>!n.macro);const ok=all.filter(n=>status(t[n.k],nutTarget(n.k,dt))==='ok').length;
  return `${gaps.length?`<button type="button" class="gapbar" id="gapTog" aria-expanded="${gapOpen}"><span aria-hidden="true" style="flex:none;color:var(--s)">ⓘ</span><b>${late?'Worth topping up':'Low so far'}: ${gaps.length}</b><span>${esc(gaps.map(g=>g.n.l).join(', '))}</span>${gapOpen?'▴':'▾'}</button>`:''}${gaps.length&&gapOpen?`<div class="gapbox"><div class="gh"><b>${late?'Worth topping up':'Running low so far today'}</b><small>Tap one to see which foods have it</small></div><div class="gchips">${gaps.map(g=>`<button type="button" class="gchip ${fx.gap===g.n.k?'on':''}" data-gap="${g.n.k}">${esc(g.n.l)} <i>${Math.round(g.pct*100)}%</i></button>`).join('')}</div>${fx.gap&&NUT_FOODS[fx.gap]&&gaps.some(g=>g.n.k===fx.gap)?`<div class="gfood"><b>Good sources of ${esc(NUTS.find(x=>x.k===fx.gap).l.toLowerCase())}:</b> ${esc(NUT_FOODS[fx.gap])}.</div>`:''}</div>`:''}
  <details class="wu" style="margin:0 16px 12px"><summary>All vitamins &amp; minerals · ${t.n?`${ok} of ${all.length} on target`:'none logged'}</summary><div class="macs" style="padding:4px 0 12px">${all.map(n=>nutBar(n,t[n.k],nutTarget(n.k,dt))).join('')}${t.n&&t.microN<t.n?`<div class="hint" style="font-size:12px;color:var(--muted)">${t.n-t.microN} item${t.n-t.microN>1?'s have':' has'} calories and macros only, so these may read low.</div>`:''}</div></details>`;
}
function drinksHTML(k){
  const d=D()[k]||{};const w=+d.water||0;const tgt=WATER[1]||3;const pct=Math.min(100,w/tgt*100);const today=k===iso(todayDate());const can=!sampleMode&&k<=iso(todayDate());
  const wk=alcWeek(k),lim=alcLimit();const alcToday=(d.food||[]).filter(x=>stdDrinks(x)>0);
  const water=`<div class="wrow"><span class="wico" aria-hidden="true">💧</span><div class="wbar"><div class="wh"><b>Water</b><span class="num">${Math.round(w*100)/100} of ${WATER[0]}-${WATER[1]} L</span></div><div class="tr"><div class="fl" style="width:${pct}%;background:var(--h)"></div></div></div></div>
    ${can?`<div class="wbtns">${[[.25,'+ Glass'],[.5,'+ 500 ml'],[.75,'+ Bottle']].map(([v,l])=>`<button type="button" class="ghost" data-water="${v}">${l}</button>`).join('')}${w>0?`<button type="button" class="ghost" data-water="-0.25" aria-label="Take off a glass">−</button>`:''}</div>`:''}`;
  const alc=alcOn()?`<div class="arow"><button type="button" class="alink" id="alcTog"><span aria-hidden="true">🍺</span> Alcohol: <b>${wk} standard drink${wk===1?'':'s'}</b> this week${alcToday.length?` · ${alcToday.length} today`:''} <i>${fx.alc?'▴':'▾'}</i></button>
    ${fx.alc?`<div class="apick">${can?ALC.map((a,i)=>`<button type="button" class="ghost" data-alc="${i}">${a[0]}</button>`).join(''):''}</div><div class="hint" style="font-size:12px;color:var(--muted)">Irish low-risk guide: up to ${lim} standard drinks a week, spread out, with 2-3 alcohol-free days. A pint is 2, a pub measure 1. Drinks count toward your calories.${alcToday.length?' Remove one from the food list below.':''} <button type="button" class="linkbtn" id="alcOff" style="padding:0">I don't drink: hide this</button></div>`:''}</div>`
    :`<button type="button" class="linkbtn" id="alcOn" style="font-size:12px;padding:0 16px 12px;color:var(--muted)">+ Track alcohol</button>`;
  return `<article class="card drinks">${alc}${suppHTML(k)}</article>`;
}
function suppHTML(k){
  const d=D()[k]||{};const list=supps();const can=!sampleMode&&k<=iso(todayDate());const miss=d.suppMissed||[];
  const rows=list.map(s=>{const took=!miss.includes(s.id)&&k>=(s.since||'0');return `<button type="button" class="schip ${took?'on':''}" data-supp="${s.id}" ${can?'':'disabled'}>${took?'✓':'✕'} ${esc(s.name)}${s.dose?` <small>${esc(s.dose)}</small>`:''}</button>`}).join('');
  const add=fx.supAdd?`<div class="form" style="padding-top:4px;gap:12px"><div class="field"><label class="label" for="sp-name">Supplement and dose</label><input id="sp-name" type="text" placeholder="e.g. Creatine 5 g, Magnesium glycinate 2 capsules"></div>
      <div class="actions"><button type="button" class="primary" id="spSave" ${fx.supBusy?'disabled':''}>${fx.supBusy?'Reading…':'Add'}</button>${canImg?`<label class="filebtn camlite">📷 Photo of the label<input type="file" id="spPhoto" accept="image/*" capture="environment"></label>`:''}</div>
      ${fx.supMsg?`<div class="hsum" role="status">${esc(fx.supMsg)}</div>`:''}</div>`:'';
  return `<div class="srow"><div class="sh"><b>Supplements</b><span>${list.length?'Ticked = taken today. Tap if you missed one.':'Food first. Add any you take so they count.'}</span></div>${rows?`<div class="schips">${rows}</div>`:''}
    <div class="sbtns">${can?`<button type="button" class="linkbtn" id="spAdd">${fx.supAdd?'Cancel':'+ Add a supplement'}</button>`:''}<details class="sinfo"><summary>Which ones are worth it?</summary><ul class="cover">${SUPP_INFO.map(([n,t])=>`<li><b>${n}:</b> ${t}</li>`).join('')}<li>Check with a pharmacist or GP before starting any supplement, especially if you take medication.</li></ul></details></div>${add}</div>`;
}
function closeDayNudge(k){const d=D()[k]||{};if(sampleMode||k!==iso(todayDate())||d.foodDone||!(d.food||[]).length||new Date().getHours()<19)return '';
  return `<div class="adjb"><div><b>Finished eating for today?</b><br><span>Close the day so your totals and reports count it as complete.</span></div><button type="button" class="ghost" id="foodDoneBtn">✓ Sign off</button></div>`}
async function addSupp(nameText,photo){
  fx.supBusy=true;fx.supMsg=photo?'Reading the label…':'';render();
  let s={id:'s'+Date.now().toString(36),name:String(nameText||'').slice(0,50),dose:'',nut:{},since:iso(sel)<iso(todayDate())?iso(sel):iso(todayDate())};
  try{if(sample&&(photo||nameText)){const out=await sample.json(`${photo?'This is a photo of a supplement label.':`A person takes this supplement: "${String(nameText).slice(0,200)}".`} Give its short name, the daily dose they take (one serving unless they said otherwise), and the nutrients in that dose using these keys and units: ${MICRO.filter(x=>x!=='caffeine').join(', ')} (sodium, potassium, magnesium, calcium, iron, zinc, choline, vitC in mg; selenium, iodine, vitA, vitD, vitK, b12, folate in µg; omega3 in g), plus "protein" in g and "kcal" if it has any. Leave out anything not in it. For creatine or other non-nutrients, nutrients is {}.
Reply with ONLY JSON: {"name":"","dose":"","nut":{}}`,photo?{images:photo}:{modelTier:'quick'});
    if(out&&out.name)s.name=String(out.name).slice(0,50);if(out&&out.dose)s.dose=String(out.dose).slice(0,40);
    if(out&&out.nut&&typeof out.nut==='object')Object.keys(out.nut).forEach(k=>{if(NK.includes(k)&&isNum(out.nut[k])&&+out.nut[k]>0)s.nut[k]=+out.nut[k]})}}
  catch(e){if(!s.name){fx={...fx,supBusy:false,supMsg:foodErr(e)};render();return}}
  if(!s.name){fx={...fx,supBusy:false,supMsg:'Type the name, or try a clearer photo.'};render();return}
  await persistMeta('supps',{list:supps().concat([s])});fx={...fx,supAdd:false,supBusy:false,supMsg:''};toast(`Added ${s.name}. It counts as taken each day unless you untick it.`,4000);render();
}
async function toggleSupp(id){const k=iso(sel);const d=D()[k]||{};const m=(d.suppMissed||[]).slice();const i=m.indexOf(id);if(i>=0)m.splice(i,1);else m.push(id);persistDay(k,{suppMissed:m});render()}
async function addWater(v){const k=iso(sel);const d=D()[k]||{};const w=Math.max(0,Math.round(((+d.water||0)+v)*100)/100);persistDay(k,{water:w});render()}
async function addAlc(i){const a=ALC[i];const k=iso(sel);const now=new Date();const it={name:a[0],qty:'1',meal:'Snack',at:k===iso(todayDate())?fmtT(now.getHours()*60+now.getMinutes()):'21:00',est:true,src:'alcohol',sd:a[1],micros:false,plants:[]};NK.forEach(x=>it[x]=0);it.kcal=a[2];it.carbs=a[3];
  await addFood([it],k);toast(`${a[0]} logged (${a[1]} standard drink${a[1]===1?'':'s'})`);render()}
// ---- coach's overview as short points that open up ----
function ovPointsHTML(text){const pts=String(text||'').split('\n').map(x=>x.trim()).filter(x=>x.startsWith('-')).map(x=>x.replace(/^-\s*/,''));
  if(!pts.length)return `<div class="ai">${esc(text)}</div>`;
  return `<div class="ovpts">${pts.map((p,i)=>{const [h,...rest]=p.split(' :: ');const det=rest.join(' :: ').trim();return det?`<details class="ovp"><summary><span class="ovn">${i+1}</span><span class="ovh">${esc(h)}</span><span class="ovc" aria-hidden="true">${ico('chevron-right')}</span></summary><p>${esc(det)}</p></details>`:`<div class="ovp"><span class="ovn">${i+1}</span><span class="ovh">${esc(h)}</span></div>`}).join('')}</div>`}
// ---- training: postpone pushes the week back to the next rest day ----
async function postponeSession(a){
  const pa=planFor(parse(a));if(!pa||pa.type==='R')return;const chain=[a];let rest=false;
  for(let i=1;i<=6;i++){const kk=iso(addD(parse(a),i)),p=planFor(parse(kk));if(!p||L()[kk])break;chain.push(kk);if(p.type==='R'){rest=true;break}}
  if(chain.length<2){toast("Can't postpone: there's no free day after it");return}
  if(!rest)return moveSession(a,chain[1]);
  const types=chain.map(k=>planFor(parse(k)).type);const cur=Object.assign({},ADJ());const now=new Date().toISOString();const dn=k=>fmtD(parse(k),{weekday:'long'});
  chain.forEach((k,i)=>{const nt=i===0?'R':types[i-1];if(nt===types[i])return;cur[k]={type:nt,note:i===0?`${TNAME[types[0]]} postponed to ${dn(chain[1])}, so today is a rest day`:`${TNAME[types[i-1]]}, moved back a day from ${dn(chain[i-1])}`,src:'move',group:now,at:now,was:types[i],prev:cur[k]||null}});
  await persistMeta('adjust',{days:cur});
  const mv=((meta.moves&&meta.moves.list)||[]).concat([{at:now,from:a,to:chain[1],code:pa.type,fromDow:pa.di,toDow:(pa.di+1)%7}]).slice(-80);await persistMeta('moves',{list:mv});
  xState.moveOpen=false;toast(`Postponed to ${dn(chain[1])}. ${chain.length>2?`The next ${chain.length-2>1?chain.length-2+' sessions shift':'session shifts'} back a day; your rest day moves to ${dn(chain[chain.length-1])}.`:''}`,4500);
  sel=parse(chain[1]);sDraft=null;dDraft=null;render();balanceWeek(chain[0]);
}
async function balanceWeek(from){
  if(!sample||sampleMode)return;const d0=parse(from);const days7=[];for(let i=0;i<7;i++){const dd=addD(d0,i),kk=iso(dd),p=planFor(dd);if(p&&kk>=iso(todayDate())&&!L()[kk])days7.push({date:kk,weekday:fmtD(dd,{weekday:'long'}),code:p.type,session:sessionBrief(dd,p),moved:!!(p.adj)})}
  if(days7.length<2)return;
  try{const out=await sample.json(`${XABOUT()} has just rearranged their training week. Check the next days still make sense for recovery and suggest only the small changes needed.
Last 7 days: ${JSON.stringify(loadHistory(iso(addD(d0,-1))))}
Coming days (you may change only these): ${JSON.stringify(days7)}
Session codes: ${planCodes().map(c=>`${c} = ${TNAME[c]}`).join(', ')}.
Rules: avoid hard sessions (${HARDC.filter(c=>TNAME[c]).map(c=>TNAME[c]).join(', ')}) on back-to-back days where possible, by making one easier (a note) or swapping it with an easy or rest day nearby. Keep at least one rest day in any 7. Fixed classes or club sessions stay put. If it's fine as it is, return an empty list.
Reply with ONLY JSON: {"adjust":[{"date":"YYYY-MM-DD","type":"code","note":"one short practical line"}],"summary":"one short line"}`,{modelTier:'quick'});
    const applied=await applyAdjust(out&&out.adjust,'balance');if(applied.length){toast(`Week checked: ${String(out.summary||`${applied.length} day${applied.length>1?'s':''} adjusted`).slice(0,140)}`,5000);render()}}catch(e){}
}
document.addEventListener('click',e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(x=c('[data-gap]')){fx.gap=fx.gap===x.dataset.gap?null:x.dataset.gap;render();return}
  if(x=c('[data-water]')){addWater(+x.dataset.water);return}
  if(c('#alcTog')){fx.alc=!fx.alc;render();return}
  if(x=c('[data-alc]')){addAlc(+x.dataset.alc);return}
  if(c('#alcOff')){fx.alc=false;persistMeta('settings',Object.assign({},meta.settings||{},{alcohol:'off'})).then(()=>render());return}
  if(c('#alcOn')){fx.alc=true;persistMeta('settings',Object.assign({},meta.settings||{},{alcohol:'on'})).then(()=>render());return}
  if(x=c('[data-supp]')){toggleSupp(x.dataset.supp);return}
  if(c('#spAdd')){fx.supAdd=!fx.supAdd;fx.supMsg='';render();return}
  if(c('#spSave')){const v=($('#sp-name')&&$('#sp-name').value||'').trim();if(!v){toast('Type the supplement, or snap the label');return}addSupp(v,null);return}
  if(c('#mvPost')){postponeSession(iso(sel));return}
  if(c('#mvSkip')){setIntent('no');return}
});
document.addEventListener('change',e=>{if(e.target&&e.target.id==='spPhoto'&&e.target.files&&e.target.files[0])addSupp('',e.target.files[0])});

function waterHTML(k){const d=D()[k]||{};const w=+d.water||0;const tgt=WATER[1]||3;const pct=Math.min(100,w/tgt*100);const can=!sampleMode&&k<=iso(todayDate());
  return `<div class="wline"><span class="wico" aria-hidden="true">💧</span><div class="wbar"><div class="wh"><b>Water</b><span class="num">${Math.round(w*100)/100} of ${WATER[0]}-${WATER[1]} L</span></div><div class="tr"><div class="fl" style="width:${pct}%;background:var(--h)"></div></div></div>${can?`<div class="wbtns">${[[.25,'Glass'],[.5,'500 ml'],[.75,'Bottle']].map(([v,l])=>`<button type="button" data-water="${v}">+ ${l}</button>`).join('')}${w>0?`<button type="button" data-water="-0.25" aria-label="Take off a glass">−</button>`:''}</div>`:''}</div>`}
let gapOpen=false;
document.addEventListener('click',e=>{const c=q=>e.target.closest&&e.target.closest(q);if(c('#stripTog')){stripOpen=!stripOpen;render();return}if(c('#gapTog')){gapOpen=!gapOpen;render();return}});

// ================= polish: eaten list by meal and dish, recovery, sign-off =================
const MICO={Breakfast:'🍳',Lunch:'🥗',Dinner:'🍽️',Snack:'🍎'};
function itemRow(i){return `<div class="fitem"><div style="min-width:0"><div class="fn">${esc(i.name)}${i.src==='plan'?' <span class="est">plan</span>':i.src==='alcohol'?' <span class="est">drink</span>':i.est?' <span class="est">est.</span>':''}</div><div class="fq">${esc(i.qty||'')}${i.at?' · '+esc(i.at):''}</div></div><div class="fm num">${kcalOf(i)} kcal<br><span>${(+i.protein||0).toFixed(0)}p · ${(+i.carbs||0).toFixed(0)}c · ${(+i.fat||0).toFixed(0)}f</span></div>${sampleMode?'<span></span>':`<button type="button" class="x" data-del-food="${i.ix}" aria-label="Remove ${esc(i.name)}">×</button>`}</div>`}
function eatenHTML(d){
  const food=(d.food||[]).map((i,ix)=>({...i,ix}));if(!food.length)return '';const tot=Math.round(food.reduce((a,i)=>a+kcalOf(i),0));
  const secs=MEALS.map(m=>{const its=food.filter(i=>i.meal===m);if(!its.length)return '';
    const gs=[];its.forEach(i=>{const key=i.dish?String(i.dish).toLowerCase()+'|'+(i.at||''):null;const g=key&&gs.find(x=>x.key===key);if(g)g.items.push(i);else gs.push({key,dish:i.dish,items:[i]})});
    const rows=gs.map(g=>{if(g.items.length<2||!g.dish)return itemRow(g.items[0]);const kc=Math.round(g.items.reduce((a,i)=>a+kcalOf(i),0)),p=g.items.reduce((a,i)=>a+(+i.protein||0),0);const est=g.items.some(i=>i.est);
      return `<details class="dish"><summary><div style="min-width:0"><div class="fn">${esc(g.dish)}${est?' <span class="est">est.</span>':''}</div><div class="fq">${g.items.length} items${g.items[0].at?' · '+esc(g.items[0].at):''} · tap to see</div></div><div class="fm num">${kc} kcal<br><span>${Math.round(p)}p</span></div>${sampleMode?'':`<button type="button" class="x" data-del-dish="${g.items.map(i=>i.ix).join(',')}" aria-label="Remove ${esc(g.dish)}">×</button>`}</summary><div class="dishin">${g.items.map(itemRow).join('')}</div></details>`}).join('');
    const kc=Math.round(its.reduce((a,i)=>a+kcalOf(i),0)),p=its.reduce((a,i)=>a+(+i.protein||0),0);
    return `<details class="msec" data-ms="e${m}" ${msOpen.has('e'+m)?'open':''}><summary class="msh"><span class="mico" aria-hidden="true">${MICO[m]}</span><b>${m}</b><span class="num">${kc} kcal · ${Math.round(p)} g protein</span></summary>${rows}</details>`}).join('');
  return `<article class="card"><div class="chead"><div style="flex:1"><h2>Eaten</h2><div class="sub">${food.length} item${food.length>1?'s':''} · ${tot} kcal</div></div></div><div class="msecs">${secs}</div></article>`;
}
// ---- recovery ----
const RECOV=[['Walk','🚶','Walk'],['Easy cycle','🚴','Easy cycle'],['Swim','🏊','Swim / sea swim'],['Sea swim','🌊','Swim / sea swim'],['Ice bath','🧊','Ice bath / cold water'],['Sauna','🔥','Hot tub / sauna'],['Hot tub','♨️','Hot tub / sauna'],['Loosen-out','🤸','Mobility / stretch'],['Stretch / yoga','🧘','Yoga / pilates'],['Foam roll','🌀','Foam roll / massage'],['Massage','💆','Foam roll / massage'],['Nap','😴','Nap']];
let recS={pick:null};
function recoveryHTML(k){
  const d=D()[k]||{};const list=d.recovery||[];const can=!sampleMode&&k<=iso(todayDate());
  const done=list.map((r,i)=>{const R=RECOV.find(x=>x[0]===r.kind)||['', '•'];return `<span class="kchip">${R[1]} ${esc(r.kind)} <small>${r.min} min</small>${can?`<button type="button" data-rdel="${i}" aria-label="Remove">×</button>`:''}</span>`}).join('');
  const mins=recS.pick?`<div class="rmins"><span>${esc(recS.pick)}: how long?</span>${[5,10,15,20,30,45,60,90].map(m=>`<button type="button" data-rmin="${m}">${m}</button>`).join('')}</div>`:'';
  const wk=(()=>{let n=0;for(let i=0;i<7;i++){const x=D()[iso(addD(parse(k),-i))];(x&&x.recovery||[]).forEach(()=>n++)}return n})();
  return `<article class="card"><div class="chead"><div style="flex:1"><h2>Recovery</h2><div class="sub">${list.length?`${list.length} logged ${k===iso(todayDate())?'today':'this day'} · ${wk} this week`:'Walks, swims, sauna, ice baths and anything that helps you recover. Tap to log.'}</div></div></div>
    ${done?`<div class="kchips" style="padding:12px 16px 0">${done}</div>`:''}
    ${can?`<div class="rqgrid">${RECOV.map(([n,ic])=>`<button type="button" data-rpick="${esc(n)}" class="${recS.pick===n?'on':''}" style="--rc:${RQC[n]||'var(--k-blue)'}"><span aria-hidden="true">${ic}</span>${esc(n)}</button>`).join('')}</div>${mins}`:''}</article>`;
}
async function logRecovery(min){const k=iso(sel)>iso(todayDate())?iso(todayDate()):iso(sel);const kind=recS.pick;if(!kind)return;const d=D()[k]||{};const R=RECOV.find(x=>x[0]===kind);
  const now=new Date();const list=(d.recovery||[]).concat([{kind,min,at:k===iso(todayDate())?fmtT(now.getHours()*60+now.getMinutes()):''}]);
  const fields={recovery:list};if(R&&R[2]){fields.habits=[...new Set((d.habits||[]).concat([R[2]]))]}
  recS.pick=null;persistDay(k,fields);dDraft=null;toast(`${kind} logged, ${min} min`);render()}
async function delRecovery(i){const k=iso(sel);const d=D()[k]||{};const list=(d.recovery||[]).slice();list.splice(i,1);persistDay(k,{recovery:list});render()}
// ---- sign off the day ----
function foodDoneHTML(k){if(sampleMode||k>iso(todayDate()))return '';const d=D()[k]||{};const tday=k===iso(todayDate());
  return d.foodDone?`<div class="signed"><span class="tick" aria-hidden="true">✓</span><div><b>${tday?'Today':'This day'} is signed off</b><small>Food and day complete. Reports count it as a full day.</small></div><button type="button" class="linkbtn" id="foodUndone">Undo</button></div>`
    :`<button type="button" class="donebig" id="foodDoneBtn"><span class="tick" aria-hidden="true">✓</span><span><b>Sign off ${tday?'today':'this day'}</b><small>Tap when you've finished eating and logging</small></span></button>`}
document.addEventListener('click',e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(x=c('[data-del-dish]')){const set=new Set(x.dataset.delDish.split(',').map(Number));const k=iso(sel);const cur=((days[k]&&days[k].food)||[]).filter((_,i)=>!set.has(i));persistDay(k,{food:cur});e.preventDefault();render();return}
  if(x=c('[data-rpick]')){recS.pick=recS.pick===x.dataset.rpick?null:x.dataset.rpick;render();return}
  if(x=c('[data-rmin]')){logRecovery(+x.dataset.rmin);return}
  if(x=c('[data-rdel]')){delRecovery(+x.dataset.rdel);return}
});

// ================= status ticks, sign-off check, Recover tab with guided programmes, Learn =================
function statusRow(state,title,sub,action){return `<div class="stline ${state}"><span class="stk" aria-hidden="true">${state==='done'?'✓':state==='part'?'◐':state==='rest'?'–':''}</span><div class="stx"><b>${title}</b>${sub?`<small>${sub}</small>`:''}</div>${action||''}</div>`}
function signChip(k){if(sampleMode||k>iso(todayDate()))return '';const d=D()[k]||{};const tday=k===iso(todayDate());
  if(d.foodDone)return statusRow('done',`${tday?'Today':'This day'} signed off`,'Food and day complete','<button type="button" class="linkbtn" id="foodUndone">Undo</button>');
  const late=tday&&new Date().getHours()>=19;
  return statusRow(late?'todo late':'todo','Not signed off yet',late?'Finished eating? Check over the day and sign off':'Sign off when you\'ve finished eating','<button type="button" class="stbtn" id="signOpen">Sign off</button>')}
function ciChip(k){if(sampleMode)return '';const d=D()[k]||{};if(k>iso(todayDate()))return '';
  if(ciDone(d)){const s=readiness(d);return statusRow('done','Checked in',s!=null?`Balance ${s} / 100`:'Saved','')}
  return statusRow('todo','Not checked in yet',k===iso(todayDate())?'Takes 30 seconds: say it or tap below':'','')}
function sessChip(k){if(sampleMode||tView!=='today')return '';const p=planFor(parse(k)),l=L()[k],d=D()[k]||{};
  if((!p||p.type==='R'||p.pre)&&d.trainIntent==='extra'&&!(d.extras||[]).length)return statusRow('todo','Training planned, not logged yet',k>iso(todayDate())?'Coming up':'Log it below once it\'s done','<button type="button" class="stbtn kghost" data-intentclear>It didn\'t happen</button>');
  if(!p||p.type==='R'||p.pre)return statusRow((d.extras||[]).length?'done':'rest',(d.extras||[]).length?'Extra session logged':p&&p.type==='R'?'Rest day':'No session planned',(d.extras||[]).length?`${d.extras.length} extra session${d.extras.length>1?'s':''} logged`:'Log anything you did below','');
  if(l&&l.status==='done')return statusRow('done','Session done',[l.dur?`${l.dur} min`:'',l.rpe?`effort ${l.rpe}/10`:''].filter(Boolean).join(' · ')||'Logged','');
  if(l&&l.status==='partial')return statusRow('part','Partly done',l.dur?`${l.dur} min`:'','');
  if(l&&l.status==='missed')return statusRow('rest','Missed','That happens. The plan carries on.','');
  if(d.trainIntent==='no')return statusRow('rest','Skipping today','Food targets set to a rest day','');
  return statusRow('todo','Not logged yet',k>iso(todayDate())?'Coming up':'Log it below when it\'s done','')}
// ---- sign-off: check over the day first ----
let signOpen=false;
function signSheetHTML(){const k=iso(sel),d=D()[k]||{};const food=d.food||[];const t=foodTotals(d);const dt=dayTypeFor(k);const kt=nutTarget('kcal',dt),pt=nutTarget('protein',dt);
  const meals=MEALS.map(m=>{const its=food.filter(i=>i.meal===m);return its.length?`<li><b>${m}</b> ${its.length} item${its.length>1?'s':''} · ${its.reduce((a,i)=>a+kcalOf(i),0)} kcal</li>`:`<li class="miss"><b>${m}</b> nothing logged</li>`}).join('');
  const w=+d.water||0;const sup=supps().filter(s=>!(d.suppMissed||[]).includes(s.id)).length;
  const flags=[];if(!food.length)flags.push('No food logged yet.');if(w<WATER[0])flags.push(`Water is ${w} L, under ${WATER[0]} L.`);if(!ciDone(d))flags.push('No check-in today.');
  return `<div class="cfwrap" id="signWrap"><div class="cfsheet" role="dialog" aria-label="Sign off the day"><h2>Sign off ${k===iso(todayDate())?'today':fmtD(parse(k))}?</h2><p class="ds">Check it over. You can still change things after.</p>
    <ul class="cfl">${meals}<li><b>Total</b> ${Math.round(t.kcal)} of ${Math.round(kt.t||kt.lo||0)} kcal · ${Math.round(t.protein)} of ${Math.round(pt.t||pt.lo||0)} g protein</li><li><b>Water</b> ${w} L</li>${supps().length?`<li><b>Supplements</b> ${sup} of ${supps().length} taken</li>`:''}</ul>
    ${flags.length?`<div class="cfflag">${flags.map(esc).join(' ')}</div>`:''}
    <div class="actions"><button type="button" class="ghost" id="signNo" style="flex:1;color:var(--fg)">Not yet</button><button type="button" class="donebtn" id="signYes">✓ Sign off</button></div></div></div>`}
function showSign(){signOpen=true;let el=$('#signHost');if(!el){el=document.createElement('div');el.id='signHost';document.body.appendChild(el)}el.innerHTML=signSheetHTML()}
function hideSign(){signOpen=false;const el=$('#signHost');if(el)el.innerHTML=''}
// ---- Recover: guided programmes ----
const BRS=(sec,pat)=>{const per=pat.reduce((a,p)=>a+p[1],0);const n=Math.max(2,Math.round(sec/per));const out=[];for(let i=0;i<n;i++)pat.forEach(([k,s,t])=>out.push({k,s,t,round:i+1,of:n}));return out};
const EVEN=(list,total)=>{const s=Math.max(20,Math.round(total/list.length));return list.map(([t,c])=>({k:'move',s,t,c}))};
const PROGS=[
 {id:'box',ic:'🫁',name:'Box breathing',cat:'Breathe',mind:'Calms stress, sharpens focus',body:'Slows your heart rate',
  lens:[['3 min',3],['5 min',5],['10 min',10]],def:1,
  prep:['Sit upright or lie down somewhere quiet.','Headphones make it easier to relax.','Breathe through your nose if you can.'],
  intro:'Welcome to box breathing. You\'ll breathe in for a count of four, hold for four, breathe out for four, and hold again for four, like tracing the sides of a box. I\'ll count you through the first few rounds, then soft tones will keep the rhythm, so you can close your eyes. If you feel light-headed at any point, just breathe normally. Let\'s begin.',
  steps:v=>BRS(v*60,[['in',4,'Breathe in'],['hold',4,'Hold'],['out',4,'Breathe out'],['hold',4,'Hold']])},
 {id:'sigh',ic:'😮‍💨',name:'Calming sighs',cat:'Breathe',mind:'The quickest way to settle nerves',body:'Resets your breathing',
  lens:[['2 min',2],['5 min',5],['10 min',10]],def:1,
  prep:['Sit comfortably. Shoulders relaxed.','Good before bed, before a match, or after a stressful moment.'],
  intro:'Welcome to calming sighs. Each breath has three parts. Breathe in through your nose, then take one more short sniff on top to fill your lungs. Then let it all go in a long, slow breath out through your mouth. The long breath out is what calms you. I\'ll guide the first few, then tones will keep the pace. Let\'s begin.',
  steps:v=>BRS(v*60,[['in',2,'Breathe in'],['in',1,'One more sniff'],['out',6,'Long breath out']])},
 {id:'478',ic:'🌙',name:'4-7-8 wind-down',cat:'Breathe',mind:'Quietens a busy head before bed',body:'Helps you fall asleep',
  lens:[['2 min',2],['4 min',4],['6 min',6]],def:1,
  prep:['Best done in bed with the lights off.','Rest the tip of your tongue just behind your top teeth.'],
  intro:'Welcome to the four, seven, eight wind-down. Breathe in quietly through your nose for four, hold for seven, then breathe out slowly through your mouth for eight. The long breath out tells your body it\'s time to rest. If the hold feels too long, just shorten it. Let\'s begin.',
  steps:v=>BRS(v*60,[['in',4,'Breathe in'],['hold',7,'Hold'],['out',8,'Breathe out slowly']])},
 {id:'scan',ic:'🧠',name:'Body scan',cat:'Mind',mind:'Switches off the to-do list',body:'Lets tight muscles let go',
  lens:[['5 min',5],['8 min',8],['12 min',12]],def:1,
  prep:['Lie on your back or sit back in a chair.','Somewhere you won\'t be disturbed.','A blanket helps: you\'ll cool down as you relax.'],
  intro:'Welcome to the body scan. We\'ll move slowly through your body, from your feet to your head, noticing each part and letting it soften. There\'s nothing to get right. If your mind wanders, that\'s normal, just come back to my voice. Close your eyes when you\'re ready.',
  steps:v=>EVEN([['Feet and calves','Bring your attention to your feet and calves. Notice how they feel. Let them go heavy.'],['Knees and thighs','Move up to your knees and thighs. Let the big muscles soften and sink.'],['Hips and lower back','Notice your hips and lower back. Let them sink into the floor or chair.'],['Belly and chest','Feel your breath rising and falling in your belly and chest. No need to change it.'],['Hands and arms','Let your hands go loose. Feel your arms grow heavy.'],['Shoulders and neck','Let your shoulders drop away from your ears. Soften your neck.'],['Jaw and face','Unclench your jaw. Soften your eyes, your cheeks and your forehead.'],['Whole body','Now feel your whole body at once, heavy, warm and still. Stay here a while. When you\'re ready, open your eyes slowly.']],v*60)},
 {id:'nap',ic:'😴',name:'Power nap',cat:'Mind',mind:'Sharper and more patient for the rest of the day',body:'Tops up recovery after a short night',
  lens:[['10 min',10],['20 min',20],['30 min',30]],def:1,
  prep:['Lie down somewhere dark and quiet.','Before 3pm, so it doesn\'t affect tonight\'s sleep.','Twenty minutes is the sweet spot: longer can leave you groggy.'],
  intro:'Time for a power nap. Lie down, close your eyes and let your breathing slow. Even if you don\'t fall asleep, resting quietly still helps. I\'ll stay quiet now and wake you gently at the end.',
  steps:v=>[{k:'move',s:v*60,t:'Rest',c:'Eyes closed. Let everything go.',quiet:true}]},
 {id:'loosen',ic:'🤸',name:'Loosen-out',cat:'Move',mind:'A gentle reset after a long day',body:'Eases stiffness from work and training',
  lens:[['8 min',8],['12 min',12],['16 min',16]],def:1,
  prep:['A mat or a bit of floor space, and a wall or sofa nearby.','Loose clothes.','Move gently: this is about feeling better, not stretching hard.'],
  intro:'Welcome to the loosen-out. We\'ll work from your neck down to your hips and legs, with easy movements to shake out stiffness from work and training. I\'ll tell you each move and when to switch sides. Move slowly and keep breathing. Let\'s start standing up.',
  steps:v=>EVEN([['Neck rolls','Slow circles with your head, one way, then the other.'],['Shoulder rolls','Big slow circles back, then forward.'],['Cat-cow','On hands and knees, round your back up, then let it sink.'],['Thread the needle','On hands and knees, reach one arm under your body and twist. Switch halfway.'],['Hip circles','Hands on hips, big slow circles both ways.'],['Leg swings','Hold a wall. Swing one leg front to back. Switch legs halfway.'],['Couch stretch','Back knee down, foot up against a wall or sofa. Switch halfway.'],['Ninety ninety switches','Sit with both knees bent to one side, then slowly switch to the other.'],['Deep squat hold','Heels down, chest up, elbows gently pushing your knees out.'],['Calf stretch','Hands on a wall, back heel down. Switch halfway.'],['Child\'s pose','Knees wide, arms long, breathe into your back.'],['Lie and breathe','On your back, slow breaths, let everything go heavy.']],v*60)},
 {id:'stretch',ic:'🧘',name:'Stretch',cat:'Move',mind:'Slows you down after a busy day',body:'Restores range in hips, legs and back',
  lens:[['6 min',6],['8 min',8],['12 min',12]],def:1,
  prep:['A mat or soft floor and a towel.','Warm is better: after a walk or shower is ideal.','Ease in: mild tension, never pain.'],
  intro:'Welcome to your stretch. We\'ll hold eight stretches for your legs, hips, back and chest. Ease into each one until you feel mild tension, then breathe slowly and let it relax a little more each breath out. I\'ll tell you when to switch sides.',
  steps:v=>EVEN([['Hamstrings','Lying down, one leg up with a towel around your foot. Switch halfway.'],['Quads','Lying on your side or standing, heel towards your bum. Switch halfway.'],['Hip flexors','Half-kneeling lunge, squeeze the glute of the back leg. Switch halfway.'],['Glutes','Lying down, ankle over the other knee, pull gently towards you. Switch halfway.'],['Groin','Sitting, soles of your feet together, let your knees drop.'],['Lower back','Lying down, knees to one side, then the other.'],['Chest','Forearm on a door frame, turn gently away. Switch halfway.'],['Calves','Against a wall, straight knee then bent knee. Switch halfway.']],v*60)},
 {id:'yoga',ic:'🕉️',name:'Yoga flow',cat:'Move',mind:'Moving meditation: breath and body together',body:'Mobility, balance and core',
  lens:[['10 min',10],['15 min',15],['20 min',20]],def:1,
  prep:['A mat and a bit of space.','Bare feet if you can.','Breathe through your nose and move slowly.'],
  intro:'Welcome to your yoga flow. We\'ll move through fourteen simple poses, linking each one to slow, steady breathing. Hold each pose gently and don\'t force anything. Balance poses may wobble, that\'s fine. Let\'s begin standing tall.',
  steps:v=>EVEN([['Mountain','Stand tall, feet hip-width, breathe slowly.'],['Forward fold','Soft knees, let your head and arms hang.'],['Low lunge, right','Right foot forward, back knee down, hips forward.'],['Downward dog','Hips high, heels reaching towards the floor.'],['Low lunge, left','Left foot forward, back knee down, hips forward.'],['Cobra','Lying on your belly, gently lift your chest.'],['Child\'s pose','Knees wide, arms long, forehead down.'],['Warrior two, right','Wide stance, arms out, look over your right hand.'],['Warrior two, left','Same on the other side.'],['Tree, right','Right foot on your left calf or thigh, hands together.'],['Tree, left','Same on the other side.'],['Bridge','Lying down, lift your hips and squeeze your glutes.'],['Supine twist','Knees to one side, then the other.'],['Rest','Lie still, eyes closed, slow breaths.']],v*60)},
 {id:'walk',ic:'🚶',name:'Recovery walk',cat:'Move',mind:'Clears your head; daylight lifts mood and helps sleep',body:'Flushes tired legs',
  lens:[['10 min',10],['20 min',20],['30 min',30]],def:1,
  prep:['Headphones in, phone in your pocket.','Outdoors if you can, ideally somewhere green or by water.'],
  intro:'Welcome to your recovery walk. Keep it easy, a pace where you could chat. I\'ll check in a few times with something to notice. Breathe through your nose and enjoy being outside.',
  steps:v=>[{k:'move',s:Math.round(v*60*.25),t:'Easy start',c:'Gentle pace. Breathe through your nose.'},{k:'move',s:Math.round(v*60*.5),t:'Look up',c:'Lift your eyes to the horizon. Notice five things you can hear.'},{k:'move',s:Math.round(v*60*.25),t:'Slow finish',c:'Ease the pace right down. Long breaths out.'}]},
 {id:'contrast',ic:'🔥',name:'Contrast therapy',cat:'Hot & cold',mind:'A big mood and energy lift',body:'Can ease soreness after hard days',
  lens:[['2 rounds · 25 min',[2,10]],['3 rounds · 40 min',[3,10]],['3 rounds · 50 min',[3,13]]],def:1,
  prep:['Sauna or hot tub, plus a cold plunge, the sea or a cold shower.','Towel, water bottle and warm clothes ready.','Never alone in cold water.'],
  safety:'Not after alcohol. Skip if you have a heart condition or high blood pressure unless your GP says it\'s fine. Get out if you feel dizzy.',
  intro:'Welcome to contrast therapy. You\'ll swap between heat and cold. In the heat, sit back and slow your breathing. In the cold, focus on long slow breaths out, the first thirty seconds are the hardest. I\'ll tell you when to switch. Have your towel and water ready.',
  steps:([r,h])=>{const s=[];for(let i=1;i<=r;i++){s.push({k:'hot',s:h*60,t:`Heat, round ${i} of ${r}`,c:'Sauna or hot tub. Sit back, slow breaths, relax your shoulders.'},{k:'cold',s:120,t:`Cold, round ${i} of ${r}`,c:'Cold plunge, sea or shower. Long, slow breaths out. Up to two minutes.'});if(i<r)s.push({k:'move',s:90,t:'Rest',c:'Sit, let your body warm up naturally, sip some water.'})}return s}},
 {id:'ice',ic:'🧊',name:'Ice bath',cat:'Hot & cold',mind:'Builds calm under pressure',body:'Eases muscle soreness',
  lens:[['2 min',2],['3 min',3],['5 min',5],['10 min',10]],def:1,
  prep:['Water temperature: colder means shorter. At 10-15°C you can stay up to 10 minutes; at 3-10°C, 1-5 minutes is plenty. A cheap pool thermometer helps.','Towel and warm clothes beside you.','Someone nearby, every time.','Go in on a slow breath out.'],
  safety:'Never alone. Not after alcohol. Skip if you have a heart condition unless your GP says it\'s fine. Get out if you shiver hard or feel unwell.',
  intro:'Welcome to your ice bath. First, a minute of slow breathing to get ready. When I say, lower yourself in on a long breath out. The gasp in the first thirty seconds is normal and it passes. Stay still and keep your breaths slow and long. I\'ll tell you when it\'s time to get out.',
  steps:v=>[{k:'move',s:60,t:'Get ready',c:'Slow breaths. In through the nose, long breath out through the mouth.'},{k:'cold',s:v*60,t:'In the cold',c:'Breathe out slowly. Stay still. You\'re doing well.'},{k:'move',s:90,t:'Warm up',c:'Out you get. Dry off, layer up and move around to rewarm.'}]},
 {id:'sauna',ic:'♨️',name:'Sauna',cat:'Hot & cold',mind:'Deep relaxation, better sleep',body:'Loosens muscles, good for your heart',
  lens:[['10 min',10],['15 min',15],['20 min',20]],def:1,
  prep:['Drink a glass of water first.','Towel to sit on.','Leave any time you need to.'],
  safety:'Drink water before and after. Not after alcohol. Get out if you feel dizzy.',
  intro:'Welcome to your sauna session. Sit or lie back, let your shoulders drop and breathe slowly. I\'ll check in halfway and let you know when to cool down. Leave early if you need to, there\'s no prize for staying longer.',
  steps:v=>[{k:'hot',s:v*60,t:'Sauna',c:'Sit back. Slow breaths. Let the heat loosen you.'},{k:'move',s:300,t:'Cool down',c:'Cool shower, sit down, drink some water.'}]}];
let PL=null,rpTimer=null,rpWake=null;
function rpGo(i){if(!PL)return;if(i>=PL.steps.length){rpFinish();return}PL.i=i;PL.stepEnd=Date.now()+PL.steps[i].s*1000;PL.paused=false;rpRender(true);audStepSay(PL.steps[i],i,PL.pr);clearInterval(rpTimer);rpTimer=setInterval(rpTick,250)}
function rpTick(){if(!PL||PL.paused||PL.end)return;const left=Math.max(0,Math.ceil((PL.stepEnd-Date.now())/1000));const el=$('#plCount');if(el)el.textContent=left>=60?fromSec(left):left;rpCues(left);rpProg();if(left<=0)rpGo(PL.i+1)}
function rpFinish(){clearInterval(rpTimer);PL.end=true;chime('end');say('Well done. Take a moment before you get up.');setTimeout(audBedStop,3000);keepAwake(false);PL.mins=Math.max(1,Math.round((Date.now()-PL.started)/60000));try{rpWake&&rpWake.release()}catch(e){}rpRender()}
function rpClose(){clearInterval(rpTimer);PL=null;audBedStop();sayStop();keepAwake(false);try{rpWake&&rpWake.release()}catch(e){}const h=$('#plHost');if(h)h.innerHTML=''}
async function rpLog(feel){const pr=PL.pr,mins=PL.mins;const k=iso(todayDate());const d=D()[k]||{};const now=new Date();
  const habit={box:'Breathwork / meditation',sigh:'Breathwork / meditation','478':'Breathwork / meditation',scan:'Breathwork / meditation',loosen:'Mobility / stretch',stretch:'Mobility / stretch',yoga:'Yoga / pilates',sauna:'Hot tub / sauna',contrast:'Hot tub / sauna',walk:'Walk',nap:'Nap'}[pr.id];
  const fields={recovery:(d.recovery||[]).concat([{kind:pr.name,min:mins,at:fmtT(now.getHours()*60+now.getMinutes()),feel:feel||null,prog:pr.id}])};if(habit&&HABITS.includes(habit))fields.habits=[...new Set((d.habits||[]).concat([habit]))];
  if(!sampleMode)persistDay(k,fields);rpClose();toast(`${pr.name} logged: ${mins} min`);render()}
function viewRecover(){const k=iso(todayDate());let n=0,mins=0,feel=[];for(let i=0;i<7;i++){const x=D()[iso(addD(todayDate(),-i))];(x&&x.recovery||[]).forEach(r=>{n++;mins+=+r.min||0;if(r.feel)feel.push(+r.feel)})}
  const cats=['Breathe','Mind','Move','Hot & cold'];
  return `<section class="rhero"><div><h2>Recover</h2><p>Recovery is where your body adapts and your head clears. A few calm minutes lower stress, improve sleep and leave you more patient with the people around you.</p></div>
    <div class="rstats"><span><b class="num">${n}</b>sessions this week</span><span><b class="num">${mins}</b>minutes</span><span><b class="num">${feel.length?avg(feel).toFixed(1):'–'}</b>feel after, out of 5</span></div></section>
  ${typeof viewMobility==='function'?`<a class="rprog" href="#mobility" style="--rc:var(--k-green)"><span class="ric" aria-hidden="true">🧘</span><span class="rt"><b>Mobility follow-along</b><small>Made for today from your training and niggles</small></span><span class="rgo" aria-hidden="true">▶</span></a>`:''}
  ${cats.map(c=>`<div class="rcat" style="--rc:${RCC[c]||'var(--k-blue)'}"><h3>${c}</h3><div class="rprogs">${PROGS.filter(p=>p.cat===c).map(p=>`<button type="button" class="rprog" data-prog="${p.id}"><span class="ric" aria-hidden="true">${p.ic}</span><span class="rt"><b>${esc(p.name)}</b><small>${esc(p.lens[p.def||0][0])} · ${esc(p.mind)}</small></span><span class="rgo" aria-hidden="true">▶</span></button>`).join('')}</div></div>`).join('')}
  ${recoveryHTML(k).replace('<h2>Recovery</h2>','<h2>Already did something?</h2>')}
  <button type="button" class="ghost learnlink" data-learn-cat="Recovery">📘 Learn: ice baths, sauna, breathing and more ›</button>`}
// ---- Learn ----
const LEARN=[
 {id:'myplan',ic:'📋',cat:'Food',t:'Your food plan, explained',get s(){const R=DAYT.rest,T=DAYT.training;const ap=(typeof APPROACH!=='undefined'&&APPROACH)?APPROACH:'higher protein and lower carb, built on whole foods';const fh=(typeof targets==='function'&&targets().fastH)||14;return [
  ['The idea',`Your plan is ${ap}. Plenty of protein to build and protect muscle, carbs matched to how active you are, lots of plants for fibre and your gut, and mostly real, unprocessed food.`],
  ['Your daily targets',`Rest days: about ${R.kcal} kcal, ${R.protein} g protein and up to ${R.carbs} g net carbs. Training days: about ${T.kcal} kcal, ${T.protein} g protein and up to ${T.carbs} g net carbs. The app switches between them automatically, based on what you actually do.`],
  ['Protein first',`Build every meal around a protein: eggs, Greek yogurt, meat, fish, beans or tofu. Spread across 3-4 meals, that is roughly ${Math.round(T.protein/4)} g a meal.`],
  ['Carbs where they count','Most of your carbs come from vegetables, fruit, dairy and beans. Starchier carbs such as potatoes, rice and oats go around your training, when your muscles use them best.'],
  ['Fat for flavour and fullness','Olive oil, avocado, nuts, seeds, oily fish, eggs, butter and cheese. Fat keeps you full and carries vitamins A, D, E and K.'],
  ['The overnight fast',`A gap of about ${fh} hours between your last food at night and your first the next day gives your gut a rest and helps blood sugar control. Black coffee, tea and water don't break it.`],
  ['Plants and fibre','Aim for 30 different plants a week and 30-40 g of fibre a day. Half your plate as non-starchy vegetables does most of the work.'],
  ['Why it works','High protein keeps you full and protects muscle. Fewer refined carbs means steadier energy and fewer cravings. Whole foods bring the vitamins, minerals and fibre that processed food strips out.']]},q:['On a hard training day, your plan…',['Adds starchy carbs around the session','Cuts protein','Skips meals'],0]},
 {id:'carbs',ic:'🥦',cat:'Food',t:'Carbs are more than bread and pasta',s:[
  ['What carbs are','Carbohydrates are sugars, starches and fibre. They are in far more foods than bread, pasta and rice.'],
  ['Natural carbs are everywhere','Vegetables, fruit, beans, lentils, milk, yogurt, nuts and seeds all contain carbs, packed with fibre, water, vitamins and minerals.'],
  ['Non-starchy vegetables','Broccoli, spinach, peppers, courgettes, cabbage, cauliflower, mushrooms, tomatoes, leeks, green beans, kale and salad leaves. Very low in net carbs and calories, high in fibre and nutrients. Fill half your plate with them.'],
  ['Starchy carbs','Potatoes, rice, pasta, bread, oats, parsnips and beans are denser fuel. Useful around hard training; portion them to how active you are that day.'],
  ['Fruit and dairy','Fruit brings natural sugar with fibre and vitamin C. Berries are lowest in sugar. Milk and yogurt bring lactose with protein and calcium.'],
  ['Net carbs','Net carbs are total carbs minus fibre. Fibre is not absorbed as sugar, so vegetable-heavy meals count for much less than they look. The app tracks net carbs.'],
  ['Refined carbs','Sweets, fizzy drinks, white bread, pastries and most cereals are carbs stripped of their fibre. They digest fast and are easy to overeat.'],
  ['Try this week','Make half your plate non-starchy vegetables at two meals a day, and swap one refined carb for a whole one, such as white bread for oats or potatoes.']],q:['Which is a non-starchy vegetable?',['Potato','Broccoli','Parsnip'],1]},
 {id:'glucose',ic:'🩸',cat:'Food',t:'Blood sugar: the carb connection',s:[
  ['From carbs to glucose','Your body breaks starches and sugars down into glucose, which passes into your blood. That is your blood sugar.'],
  ['Insulin\'s job','When blood sugar rises, your pancreas releases insulin, which moves glucose into your muscles, liver and fat cells. That is normal and healthy.'],
  ['Spikes and crashes','A big hit of fast carbs on their own, such as sweets, juice or white bread, can send blood sugar up quickly and then down again, leaving you hungry, tired and craving more.'],
  ['What slows it down','Fibre, protein and fat slow the rise. Whole foods beat refined ones. Eating vegetables and protein before the starchy part of a meal flattens the curve.'],
  ['Muscles are a sponge','Working muscles soak up glucose even with little insulin. That is why active people handle carbs better, and why a 10-15 minute walk after a meal helps.'],
  ['Sleep and stress count','A bad night or a stressful day makes your body handle the same meal worse. Sleep is part of blood sugar control.'],
  ['Try this week','For your most carb-heavy meal each day, eat the vegetables and protein first, and take a 10-minute walk afterwards.']],q:['What slows the rise in blood sugar?',['Eating protein and fibre with your carbs','Drinking juice first','Eating carbs on their own'],0]},
 {id:'upf',ic:'🏭',cat:'Food',t:'Ultra-processed foods',s:[
  ['What they are','Ultra-processed foods (UPFs) are industrial products made mostly from substances taken out of food, such as oils, sugars, starches and protein isolates, plus additives like emulsifiers, flavourings, sweeteners and colours. Most of the ingredients are things you would never find in a home kitchen.'],
  ['The official definition','Scientists use the NOVA system, which groups foods by how processed they are: 1 unprocessed or minimally processed, 2 cooking ingredients, 3 processed foods, 4 ultra-processed. Group 4 is the one to limit.'],
  ['Common examples','Fizzy drinks, packaged biscuits, sweets and crisps, mass-produced sliced bread, most breakfast cereals, chicken nuggets and hot dogs, instant noodles, many ready meals and flavoured yogurts.'],
  ['Not all processing is bad','Tinned beans, frozen vegetables, plain yogurt, cheese, oats and tinned fish are processed but not ultra-processed. They are great everyday foods.'],
  ['How bad are they?','In a 2019 US National Institutes of Health study, people eating an ultra-processed diet ate about 500 kcal more a day than on a minimally processed diet with the same nutrients available, and gained weight. Large long-term studies link high UPF intake with higher rates of obesity, type 2 diabetes, heart disease and depression.'],
  ['Why we overeat them','They are soft, quick to eat and engineered to taste great, while being low in fibre and protein. You eat faster than your fullness signals can keep up.'],
  ['How to spot them','A long ingredients list, ingredients you do not recognise, and health claims on the front of the pack.'],
  ['Try this week','Swap one ultra-processed food a day: crisps for nuts, cereal for oats, a cereal bar for fruit and yogurt, a ready meal for a batch-cooked dinner.']],q:['Which of these is ultra-processed?',['Tinned chickpeas','Plain porridge oats','Chicken nuggets'],2]},
 {id:'insulin',ic:'⚖️',cat:'Food',t:'Insulin resistance and belly fat',s:[
  ['What it is','Insulin resistance is when your cells stop responding well to insulin. Your pancreas makes more and more to keep blood sugar normal. It can go on quietly for years.'],
  ['Where it leads','If it carries on, blood sugar starts to rise: first prediabetes, then type 2 diabetes. It is also linked with heart disease, fatty liver and high blood pressure.'],
  ['Visceral fat','Fat stored deep around your organs, the hard belly, is far more harmful than fat under the skin and closely linked with insulin resistance. You can be a normal weight and still carry it.'],
  ['Warning signs','A growing waist (more than half your height is a common red flag), energy slumps after meals, high triglycerides and blood pressure. Only a blood test, such as HbA1c, can confirm it.'],
  ['What helps most','Strength training and daily movement, 7-9 hours of sleep, losing some belly fat, cutting sugary drinks and ultra-processed food, more fibre and protein, and keeping alcohol and stress in check.'],
  ['Good news','Exercise improves insulin sensitivity fast: a single session helps for a day or two, and regular training changes it for good. Muscle is your best defence.'],
  ['Try this week','Measure your waist at belly-button level. If it is more than half your height, or diabetes runs in your family, ask your GP about an HbA1c test.']],q:['Which fat is most closely linked with insulin resistance?',['Visceral fat around your organs','Fat on your arms','Fat on your thighs'],0]},
 {id:'stretchlearn',ic:'🧘',cat:'Recovery',t:'Stretching and yoga',s:[
  ['What stretching does','Regular stretching improves your range of motion over a few weeks. It mostly works by your nervous system getting used to the stretch.'],
  ['Before and after','Before training, use moving stretches like leg swings and lunges. Save long holds for after training or the evening.'],
  ['How to hold','30-60 seconds, mild tension and never pain. Breathe slowly and let it ease a little more on each breath out. No bouncing.'],
  ['Yoga adds more','Yoga combines stretching with balance, strength and breathing. Studies show it can reduce stress and help with lower back pain.'],
  ['The mental side','Slow holds and breathing switch your body into rest mode, which is why a stretch before bed helps many people sleep.'],
  ['Try this week','Do the Stretch or Yoga flow session in Recover on two evenings this week.']],q:['When are long stretch holds best?',['Right before sprinting','After training or in the evening','Never'],1]},
 {id:'mindlearn',ic:'🧠',cat:'Recovery',t:'Meditation and body scans',s:[
  ['What it is','Meditation is training your attention: noticing your breath, body or thoughts without getting swept away. A body scan moves your attention slowly through your body.'],
  ['The evidence','Regular practice modestly lowers stress and anxiety and can improve sleep. Ten minutes a day is enough to notice.'],
  ['A wandering mind is normal','Noticing you have drifted and coming back is the exercise itself, not a failure.'],
  ['For athletes','Many teams use it for focus, staying calm under pressure and switching off after games.'],
  ['Try this week','Do the Body scan in Recover at bedtime on three nights and note your sleep quality in the check-in.']],q:['Your mind wanders during a body scan. That means…',['You are doing it wrong','You are doing the exercise: notice and come back','You should stop'],1]},
 {id:'naplearn',ic:'😴',cat:'Recovery',t:'Napping',s:[
  ['Short is sweet','A 10-20 minute nap boosts alertness and mood without leaving you groggy.'],
  ['Avoid the middle','30-60 minutes can drop you into deep sleep and leave you foggy when you wake. If you need longer, a full 90-minute cycle is better.'],
  ['Timing','Nap before about 3pm so it doesn\'t steal from your night\'s sleep.'],
  ['The coffee nap','Drink a coffee and nap straight away for 20 minutes. The caffeine kicks in just as you wake.'],
  ['Try this week','After a short night, take a 20-minute Power nap from Recover instead of reaching for sugar.']],q:['The best length for a quick nap is…',['10-20 minutes','45 minutes','2 hours'],0]},
 {id:'rolling',ic:'🌀',cat:'Recovery',t:'Foam rolling and massage',s:[
  ['What it does','Foam rolling and massage reduce how sore you feel and give a short-term boost to how freely you move.'],
  ['Not breaking up knots','It doesn\'t physically break up knots or fascia. It works through your nervous system, telling tight muscles they can relax.'],
  ['How to roll','30-60 seconds per area, slow, with moderate pressure. Stay off bones, joints and the lower back.'],
  ['Massage','A good massage relaxes you and lifts your mood as much as it helps your muscles. Worth it after a big block of training.'],
  ['Try this week','Roll your calves, quads and glutes for 5 minutes after your hardest session, then log it in Recover.']],q:['Foam rolling mainly works by…',['Breaking up knots','Calming your nervous system','Removing lactic acid'],1]},
 {id:'sea',ic:'🌊',cat:'Recovery',t:'Sea swimming',s:[
  ['Why people love it','Cold sea swims bring a strong lift in mood and alertness, and the people you swim with are half the benefit.'],
  ['Cold shock','The first minute in cold water makes you gasp and breathe fast. Enter slowly, breathe out long, and never jump straight in.'],
  ['How long','In Irish winter water, a few minutes is plenty to start with. Get out before you start shivering hard.'],
  ['Stay safe','Swim with others at known spots. Check tides and weather, wear a bright hat, and know your way out. Rewarm with dry layers and a warm drink.'],
  ['Try this week','Find a local sea swimming group and go along with them for your first swims.']],q:['The safest way to start a cold sea swim is…',['Dive straight in','Walk in slowly and breathe out long','Hold your breath'],1]},
 {id:'protein',ic:'🥩',cat:'Food',t:'Protein: how much, how often',s:[
  ['Why it matters','Protein is the raw material for muscle, tendons, skin, hormones and immune cells. Training causes small amounts of muscle damage, and protein is what you rebuild with. It also keeps you fuller for longer than carbs or fat.'],
  ['How much','Most active adults do well on about 1.6 g per kg of body weight a day. Going up to 2.2 g/kg can help when you are losing body fat or training very hard. For an 80 kg person that is roughly 130-175 g a day.'],
  ['Spread it out','Muscle repair responds best to 25-40 g at a time. Four meals of 30-40 g work better than a small breakfast and a huge dinner, even if the daily total is the same.'],
  ['Not all protein is equal','Meat, fish, eggs, dairy and soy have all the essential amino acids, including leucine, the switch for muscle repair. Plant eaters can match it by mixing beans, lentils, grains, nuts and soy across the day.'],
  ['As you get older','From your 40s, muscle responds less to small doses. Aim for the top of the range, get 30-40 g per meal, and keep up strength training to hold on to muscle.'],
  ['Easy wins','Greek yogurt, about 15-20 g a bowl. 3 eggs, 18 g. A tin of tuna, 25 g. A chicken breast, 35 g. A glass of milk, 8 g. 200 g cooked lentils, 18 g. A scoop of whey, 20-25 g.'],
  ['Try this week','Check your breakfast. If it has under 25 g of protein, add yogurt, eggs, milk or a scoop of protein. Breakfast is where most people fall short.']],q:['Which works best for most people?',['One big protein dinner','Protein spread across 3-4 meals','Protein only after training'],1]},
 {id:'gut',ic:'🦠',cat:'Food',t:'Your gut microbiome',s:[
  ['A garden inside you','Trillions of microbes live in your gut. Together they weigh about as much as a bag of sugar and carry far more genes than you do.'],
  ['What they do','They turn fibre into short-chain fatty acids that feed your gut lining and help calm inflammation. They train your immune system, and your gut and brain send signals to each other all day long.'],
  ['Feed them fibre','Gut microbes live mostly on fibre from plants. Most people in Ireland eat well under the 25-30 g a day recommended.'],
  ['30 plants a week','Variety matters as much as amount. In the American Gut Project, people eating 30 or more different plants a week had more varied gut bacteria than those eating 10 or fewer. Vegetables, fruit, nuts, seeds, beans, wholegrains, herbs, spices and coffee all count.'],
  ['Fermented foods','Live yogurt, kefir, sauerkraut, kimchi and kombucha bring helpful bacteria. In a 2021 Stanford study, people eating more fermented foods for 10 weeks had more varied gut bacteria and lower markers of inflammation.'],
  ['What knocks it back','Very low fibre, lots of ultra-processed food, heavy drinking, poor sleep and constant stress all reduce variety. Antibiotics are sometimes essential, but they hit the good bacteria too, so eat plenty of plants afterwards.'],
  ['Try this week','Keep a jar of mixed seeds and a bag of mixed frozen veg in. Add a different fruit each day and a spoon of live yogurt or kefir. Watch your plant count climb on the Food log.']],q:['Which of these counts toward 30 plants a week?',['A spoon of mixed seeds','A glass of milk','A chicken breast'],0]},
 {id:'water',ic:'💧',cat:'Food',t:'Hydration',s:[
  ['How much','Most adults need around 2-3 litres of drinks a day, more when it is hot or you are training or doing physical work. Food provides another litre or so.'],
  ['Check the colour','Pale straw-coloured urine is the easiest sign you are drinking enough. Dark yellow means drink more. Completely clear all day can mean you are overdoing it.'],
  ['Performance and focus','Losing 2% of your body weight in sweat, about 1.6 kg for an 80 kg person, can make exercise feel harder and dull your concentration.'],
  ['Know your sweat rate','Weigh yourself before and after an hour of training. Each kilo lost is about a litre of sweat. Drink about 1.5 times that afterwards.'],
  ['Salt counts too','On long or very sweaty days you lose salt as well as water. A salty meal or an electrolyte tablet helps you hold on to what you drink.'],
  ['Do not overdo it','Drinking huge amounts of plain water during very long events, without salt, can dangerously dilute your blood. Drink to thirst and a little more.'],
  ['Try this week','A glass on waking, one with every meal, and a bottle you can see on your desk or in the jeep. Use the water buttons on the Food log as you go.']],q:['What is the easiest everyday check?',['How thirsty you feel at night','The colour of your urine','Your weight'],1]},
 {id:'vitd',ic:'☀️',cat:'Food',t:'Vitamin D in Ireland',s:[
  ['Why it matters','Vitamin D helps you absorb calcium for strong bones, and supports your muscles and immune system.'],
  ['Ireland is far north','From about October to March the sun is too low for your skin to make vitamin D, even on a bright day.'],
  ['Hard to get from food','Oily fish such as salmon, mackerel and sardines, eggs and fortified milk or cereals help, but it is hard to get enough from food alone in winter.'],
  ['Who should think about it','Health advice in Ireland is that many people may benefit from a vitamin D supplement over the winter months. A pharmacist can advise on the right dose for you.'],
  ['Try this week','Have oily fish twice this week. If you are considering a supplement, ask your pharmacist next time you are in.']],q:['When is your skin unable to make vitamin D in Ireland?',['May to August','About October to March','Never'],1]},
 {id:'creatine',ic:'💊',cat:'Food',t:'Creatine',s:[
  ['What it is','A natural compound stored in muscle that powers short, hard efforts such as sprints, jumps and heavy lifts. Meat and fish contain some.'],
  ['The evidence','It is one of the most studied supplements, with strong evidence for more strength, power and repeated sprint ability. It is considered safe for healthy adults.'],
  ['How to take it','3-5 g of creatine monohydrate a day, any time, with water or food. No loading needed: it builds up in your muscles over 3-4 weeks.'],
  ['Good to know','You may gain a kilo or so of water inside your muscles. That is normal and is not fat.'],
  ['Brain benefits?','Early research suggests it may help memory and tiredness, especially when short on sleep. Promising, but not settled.'],
  ['Check first','Talk to your GP if you have kidney problems. If you play competitive sport, choose a batch-tested product (for example with the Informed Sport mark).'],
  ['Try this week','If you decide to take it, pick a time you will not forget, such as with breakfast, and log it as a supplement so it shows on your Food log.']],q:['A typical daily dose is…',['3-5 g','30-50 g','Only on training days'],0]},
 {id:'sleep',ic:'🛏️',cat:'Lifestyle',t:'Sleep: the best recovery tool',s:[
  ['How much','Adults need 7-9 hours. Hard training, physical work or a stressful spell push you towards the top of that range.'],
  ['What happens while you sleep','Deep sleep is when your body releases most growth hormone and repairs muscle. Dream (REM) sleep files away learning and steadies your mood.'],
  ['Keep it regular','Going to bed and getting up at similar times each day, weekends too, matters nearly as much as total hours.'],
  ['Light sets your clock','Daylight in the first hour after waking sets your body clock and helps you feel sleepy at the right time that night. Bright screens late at night push it back.'],
  ['Caffeine','Caffeine takes around 5-6 hours to halve in your body, so a 3pm coffee is still working at 10pm. Try to have your last one before 2pm.'],
  ['Set the scene','A cool, dark, quiet room (about 16-19°C), no big meal in the last 2-3 hours, and the phone out of reach.'],
  ['Try this week','Pick a wake-up time and keep it for 7 days, with daylight within 30 minutes of getting up. Watch your sleep quality in the check-in.']],q:['A coffee at 3pm is…',['Gone by 6pm','Still partly in your system at bedtime','Good for sleep'],1]},
 {id:'stress',ic:'🧠',cat:'Lifestyle',t:'Stress and recovery',s:[
  ['One bucket','Work, family, money, travel, poor sleep and training all fill the same stress bucket. Your body cannot tell them apart.'],
  ['Signs it is full','Poor sleep, a higher morning pulse, irritability, low motivation, picking up niggles and feeling flat in sessions.'],
  ['Your readiness score','The app combines sleep, how you feel and your pulse into a rough guide. Several low days in a row are a signal to ease off.'],
  ['What empties it','Sleep, walks outdoors, time with people you like, slow breathing, laughing, and easy movement such as a swim or loosen-out.'],
  ['Train around it','On high-stress days, swap a hard session for an easy one or a recovery session. You will get more from the hard days when you are fresh.'],
  ['Try this week','On your most stressful day, do 5 minutes of calming sighs in Recover and a 20-minute walk. Note your mood in the next morning\'s check-in.']],q:['On a very stressful day, the best training choice is usually…',['The hardest session of the week','An easy session or recovery','Two sessions'],1]},
 {id:'alcohol',ic:'🍺',cat:'Lifestyle',t:'Alcohol and recovery',s:[
  ['Sleep','Alcohol may help you nod off, but it breaks up deep and dream sleep in the second half of the night, so you wake less rested.'],
  ['Recovery','It dehydrates you, and a big session soon after training can slow muscle repair.'],
  ['Hidden calories','A pint is about 200 kcal. Four pints is roughly a full dinner, before the chipper on the way home.'],
  ['Mood the next day','Alcohol lifts mood short term, then often brings a rebound of low mood and anxiety the next day.'],
  ['The Irish guide','Low-risk drinking is up to 11 standard drinks a week for women and 17 for men, spread out, with 2-3 alcohol-free days. A pint is 2 standard drinks and a pub measure of spirits is 1.'],
  ['Simple swaps','Alternate with water, try alcohol-free beers, keep drinks away from the night before a big session, and eat before you go out.'],
  ['Try this week','Track your standard drinks with the alcohol line on the Food log, and plan at least two alcohol-free days.']],q:['How many standard drinks are in a pint of beer?',['1','2','3'],1]},
 {id:'ice',ic:'🧊',cat:'Recovery',t:'Ice baths and cold water',s:[
  ['What it does','Sitting in cold water up to your chest can reduce how sore you feel after hard training or a match. Most research uses water at 10-15°C for up to 10-15 minutes.'],
  ['The mental side','Many people feel alert and in good form for hours afterwards. Staying calm in the cold is practice for staying calm under pressure.'],
  ['Timing matters','Cold straight after a strength session may blunt muscle gains. If building muscle is your goal, leave at least a few hours, or use cold on other days.'],
  ['Cold showers count','Finishing a shower with 30-90 seconds of cold gives some of the same lift with less fuss.'],
  ['Temperature and time','Colder means shorter. At 10-15°C, 5-10 minutes is enough. Many home ice baths are 3-10°C: there, 1-5 minutes is plenty. Below about 3°C, keep it to a minute or two and only once you are used to cold.'],['How to do it','Breathe out slowly as you go in. The gasp in the first 30 seconds is normal and passes. Keep still, and get out before you start shivering hard.'],
  ['Stay safe','Never alone and never after alcohol. Check with your GP first if you have a heart condition or high blood pressure. Rewarm gradually by moving, not with a hot shower straight away.'],
  ['Try this week','End three showers with 30 seconds of cold, breathing out slowly, or try the guided Ice bath in Recover.']],q:['If you want to build muscle, when is cold water best avoided?',['Straight after a strength session','On a rest day','In the morning'],0]},
 {id:'sauna',ic:'♨️',cat:'Recovery',t:'Sauna',s:[
  ['The basics','10-20 minutes at around 80-100°C, once or a few times a week. Drink water before and after.'],
  ['Heart health','Long-term Finnish studies link regular sauna use with lower rates of heart disease. These show a link rather than proof, but the signs are good.'],
  ['For your body','Heat increases blood flow and loosens stiff muscles. Some research suggests regular heat can help endurance fitness too.'],
  ['Mind and sleep','Heat helps your body switch into rest mode. Many people sleep better on sauna evenings.'],
  ['How to do a session','2-3 rounds of 10-15 minutes with a cool shower and a few minutes sitting out between. Leave whenever you feel you need to.'],
  ['Stay safe','Not after alcohol. Leave if you feel dizzy or sick. Check with your GP if you have heart or blood pressure problems.'],
  ['Try this week','Use the guided Sauna or Contrast therapy session in Recover and note how you sleep that night.']],q:['A sensible sauna session is about…',['5 minutes at 40°C','10-20 minutes at 80-100°C','An hour'],1]},
 {id:'contrast',ic:'🔥',cat:'Recovery',t:'Contrast therapy',s:[
  ['What it is','Swapping between heat (sauna or hot tub) and cold (plunge, sea or cold shower), usually for 3 rounds.'],
  ['Why people love it','It is a big mental reset. Most people come out energised, calm and in good form.'],
  ['For your body','It may ease soreness after hard days, though research shows only modest effects. How you feel the next day is a fair guide.'],
  ['A simple session','10-15 minutes of heat, 1-2 minutes of cold, a minute or two of rest. Repeat 3 times.'],
  ['Finish on','End on cold for a lift during the day, or on heat to wind down before bed.'],
  ['Stay safe','Not after alcohol, never alone in cold water, and check with your GP if you have heart or blood pressure problems.'],
  ['Try this week','Do one guided Contrast therapy session in Recover after your hardest day.']],q:['To wind down before bed, finish on…',['Cold','Heat','It makes no difference'],1]},
 {id:'breath',ic:'🫁',cat:'Recovery',t:'Breathwork',s:[
  ['Your remote control','Breathing is the one part of your stress response you can control directly. Slow breathing tells your body it is safe.'],
  ['Slow it down','Around 6 breaths a minute, about 5 seconds in and 5 out, tends to steady your heart rate and calm your mind.'],
  ['Long breaths out','Breathing out for longer than you breathe in slows your heart. That is the idea behind 4-7-8 and calming sighs.'],
  ['Calming sighs','In a 2023 Stanford study, 5 minutes a day of sighs (two breaths in through the nose, one long breath out) improved mood and lowered anxiety more than mindfulness meditation alone.'],
  ['Box breathing','In 4, hold 4, out 4, hold 4. Used by soldiers and first responders to stay steady under pressure. Good before a match or a hard conversation.'],
  ['Stay safe','Never do forceful or fast breathing in water, while driving, or standing where you could fall. Stop if you feel dizzy.'],
  ['Try this week','5 minutes of calming sighs each day for a week, with your eyes closed and the voice guide on. Note your mood each morning.']],q:['Which slows your heart rate?',['Short, quick breaths','A breath out longer than the breath in','Holding your breath as long as possible'],1]},
 {id:'walking',ic:'🚶',cat:'Movement',t:'Walking and daily movement',s:[
  ['The movement you forget','Everything you do outside of exercise, such as walking, working and standing, can burn hundreds of calories a day. It adds up to more than most gym sessions.'],
  ['Steps and health','Studies following thousands of people show health benefits rising up to about 7,000-10,000 steps a day.'],
  ['After meals','A 10-15 minute walk after eating lowers the spike in blood sugar.'],
  ['For your head','Walking outdoors, especially in green spaces or by water, lifts mood and eases stress. Daylight early in the day helps you sleep.'],
  ['For recovery','An easy walk the day after a hard session gets blood moving and eases sore legs better than lying still.'],
  ['Try this week','Add a 10-minute walk after your biggest meal each day, and log it in Recover.']],q:['A short walk after meals mainly helps…',['Blood sugar','Grip strength','Flexibility'],0]},
 {id:'pilates',ic:'🤸',cat:'Movement',t:'Pilates and your core',s:[
  ['What it is','Slow, controlled exercises for your deep core, hips and posture muscles, done with careful breathing.'],
  ['Why it helps','A strong, controlled core protects your back and helps you run, turn, kick and lift better.'],
  ['For field sports and runners','Better control around your hips and pelvis may take some strain off your hamstrings and groin, two of the most common problem areas in GAA and running.'],
  ['How often','Two short sessions of 15-20 minutes a week is enough to notice a difference within a month or two.'],
  ['Moves to start with','Dead bugs, side planks, glute bridges, bird dogs and clams. Slow and controlled, breathing out on the effort.'],
  ['Quality over quantity','Five perfect reps beat twenty sloppy ones. Stop if anything hurts, as opposed to just working hard.'],
  ['Try this week','Do the Loosen-out or Stretch session in Recover, then add 3 rounds of dead bugs and side planks.']],q:['Pilates mainly trains…',['Your deep core and control','Maximum strength','Sprint speed'],0]}];
let lv={topic:null,i:0,ans:null};
function viewLearn(){const done=(meta.learned&&meta.learned.ids)||{};
  if(lv.topic){const T=LEARN.find(x=>x.id===lv.topic);const n=T.s.length;const quiz=lv.i===n;
    const body=quiz?`<div class="lslide"><div class="lic">❓</div><h2>Quick check</h2><p>${esc(T.q[0])}</p><div class="lq">${T.q[1].map((o,i)=>`<button type="button" data-lans="${i}" class="${lv.ans==null?'':i===T.q[2]?'right':i===lv.ans?'wrong':''}" ${lv.ans!=null?'disabled':''}>${esc(o)}</button>`).join('')}</div>${lv.ans!=null?`<p class="lres">${lv.ans===T.q[2]?'✓ Spot on.':'Not quite: the right answer is highlighted.'}</p>`:''}</div>`
      :`<div class="lslide"><div class="lic">${T.ic}</div><small class="ds">${lv.i+1} of ${n}</small><h2>${esc(T.s[lv.i][0])}</h2><p>${esc(T.s[lv.i][1])}</p></div>`;
    return `<article class="card lcard"><div class="lhead"><button type="button" class="linkbtn" id="lBack">‹ All topics</button><span class="ds">${esc(T.t)}</span></div>${body}
      <div class="ldots">${Array.from({length:n+1},(_,i)=>`<i class="${i===lv.i?'on':''}"></i>`).join('')}</div>
      <div class="actions" style="padding:0 16px 16px"><button type="button" class="ghost" id="lPrev" ${lv.i?'':'disabled'} style="color:var(--fg)">‹ Back</button>${quiz?`<button type="button" class="primary" id="lDone" ${lv.ans==null?'disabled':''}>Finish</button>`:`<button type="button" class="primary" id="lNext">Next ›</button>`}</div></article>`}
  const cats=[...new Set(LEARN.map(x=>x.cat))];const nd=LEARN.filter(x=>done[x.id]).length;
  return `<section class="rhero"><div><h2>Learn</h2><p>Two-minute reads on food, sleep, recovery and movement. Tap through, then answer one quick question.</p></div><div class="rstats"><span><b class="num">${nd}</b>of ${LEARN.length} done</span></div></section>
    ${cats.map(c=>`<div class="rcat" style="--rc:${RCC[c]||'var(--k-blue)'}"><h3>${c}</h3><div class="rprogs">${LEARN.filter(x=>x.cat===c).map(x=>`<button type="button" class="rprog ${done[x.id]?'read':''}" data-topic="${x.id}"><span class="ric" aria-hidden="true">${x.ic}</span><span class="rt"><b>${esc(x.t)}</b><small>${x.s.length} cards · 2 min${done[x.id]?' · ✓ read':''}</small></span><span class="rgo" aria-hidden="true">›</span></button>`).join('')}</div></div>`).join('')}`}
let pView='me';
function progSub(){return `<div class="subtabs" style="grid-template-columns:1fr 1fr"><button type="button" data-pview="me" aria-pressed="${pView==='me'}">My progress</button><button type="button" data-pview="learn" aria-pressed="${pView==='learn'}">Learn</button></div>`}
document.addEventListener('click',e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(c('#signOpen')){showSign();return}if(c('#signNo')||(e.target.id==='signWrap')){hideSign();return}
  if(c('#signYes')){const k=iso(sel);hideSign();persistDay(k,{foodDone:true});toast('Day signed off ✓');render();stepDone();return}
  if(x=c('[data-prog]')){const pr=PROGS.find(p=>p.id===x.dataset.prog);if(pr){RI={pr,li:pr.def||0};showRI()}return}
  if(c('#rpX')){if(PL&&!PL.end&&Date.now()-PL.started>60000){rpFinish()}else rpClose();return}
  if(c('#rpPause')){if(!PL)return;if(PL.paused){PL.stepEnd=Date.now()+PL.pausedLeft;PL.paused=false}else{PL.pausedLeft=PL.stepEnd-Date.now();PL.paused=true}rpRender();const o=$('.plorb');if(o)o.style.animationPlayState=PL.paused?'paused':'running';return}
  if(c('#rpSkip')){rpGo(PL.i+1);return}if(c('#rpBack')){rpGo(Math.max(0,PL.i-1));return}
  if(x=c('[data-plfeel]')){rpLog(+x.dataset.plfeel);return}
  if(x=c('[data-pview]')){pView=x.dataset.pview;lv={topic:null,i:0,ans:null};render();window.scrollTo({top:0});return}
  if(x=c('[data-learn-cat]')){pView='learn';lv={topic:null,i:0,ans:null};location.hash='reports';return}
  if(x=c('[data-topic]')){lv={topic:x.dataset.topic,i:0,ans:null};render();window.scrollTo({top:0});return}
  if(c('#lBack')){lv={topic:null,i:0,ans:null};render();return}
  if(c('#lNext')){lv.i++;render();return}if(c('#lPrev')){lv.i=Math.max(0,lv.i-1);lv.ans=null;render();return}
  if(x=c('[data-lans]')){lv.ans=+x.dataset.lans;render();return}
  if(c('#lDone')){const ids=Object.assign({},(meta.learned&&meta.learned.ids)||{},{[lv.topic]:iso(todayDate())});if(!sampleMode)persistMeta('learned',{ids});lv={topic:null,i:0,ans:null};toast('Nice one. Topic done ✓');render();return}
});

// ================= v5: audio-guided sessions, photo review, compact meals, smarter quick add =================
// ---- calm audio: soft voice, ocean/rain bed, gentle chimes; screen kept awake ----
const AUD={ctx:null,src:null,g:null,lfo:null,vid:null,snd:'ocean',voice:true,who:'female'};
try{const s=JSON.parse(localStorage.getItem('rpAudio')||'{}');if(s.snd)AUD.snd=s.snd;if(s.voice===false)AUD.voice=false;if(s.who)AUD.who=s.who}catch(e){}
function audSave(){try{localStorage.setItem('rpAudio',JSON.stringify({snd:AUD.snd,voice:AUD.voice,who:AUD.who}))}catch(e){}}
function audCtx(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;if(!AUD.ctx)AUD.ctx=new C();if(AUD.ctx.state==='suspended')AUD.ctx.resume();return AUD.ctx}catch(e){return null}}
function audBed(){audBedStop();if(AUD.snd==='off')return;const c=audCtx();if(!c)return;
  const len=c.sampleRate*6,buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);let last=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;last=(last+0.02*w)/1.02;d[i]=last*3.2}
  const src=c.createBufferSource();src.buffer=buf;src.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=AUD.snd==='rain'?2400:520;
  const g=c.createGain();g.gain.value=0;g.gain.linearRampToValueAtTime(AUD.snd==='rain'?0.10:0.16,c.currentTime+3);src.connect(f);f.connect(g);g.connect(c.destination);
  if(AUD.snd==='ocean'){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=0.09;lg.gain.value=0.09;l.connect(lg);lg.connect(g.gain);l.start();AUD.lfo=l}
  src.start();AUD.src=src;AUD.g=g}
function audBedStop(){try{if(AUD.g&&AUD.ctx){AUD.g.gain.cancelScheduledValues(AUD.ctx.currentTime);AUD.g.gain.setTargetAtTime(0,AUD.ctx.currentTime,0.4)}const s=AUD.src,l=AUD.lfo;setTimeout(()=>{try{s&&s.stop();l&&l.stop()}catch(e){}},1500)}catch(e){}AUD.src=null;AUD.lfo=null;AUD.g=null}
function chime(kind){const c=audCtx();if(!c)return;const now=c.currentTime;const tones=kind==='in'?[396,528]:kind==='out'?[528,396]:kind==='end'?[528,660,792]:[528];
  tones.forEach((fq,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=fq;const t0=now+i*(kind==='in'||kind==='out'?0.35:0.25);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(0.07,t0+0.03);g.gain.exponentialRampToValueAtTime(0.0008,t0+2.6);o.connect(g);g.connect(c.destination);o.start(t0);o.stop(t0+2.7)})}
let VOICE=null,VOICE_WHO='';function pickVoice(){if(!window.speechSynthesis)return null;if(VOICE&&VOICE_WHO===AUD.who)return VOICE;const vs=speechSynthesis.getVoices();VOICE_WHO=AUD.who;
  const pref=AUD.who==='male'?['Daniel','Google UK English Male','Arthur','Oliver','Malcolm','Aaron','Fred']:['Moira','Fiona','Serena','Kate','Martha','Google UK English Female','Samantha','Karen','Tessa'];
  const ie=vs.filter(v=>/en[-_]IE/i.test(v.lang));const g=v=>AUD.who==='male'?/male|man|connor|daniel|arthur|oliver/i.test(v.name)&&!/female/i.test(v.name):!/\bmale\b|daniel|arthur|oliver/i.test(v.name);
  VOICE=ie.find(g)||pref.map(p=>vs.find(v=>v.name.includes(p))).find(Boolean)||vs.find(v=>/en-(IE|GB)/i.test(v.lang)&&g(v))||vs.find(v=>/^en/i.test(v.lang))||null;return VOICE}
try{window.speechSynthesis&&speechSynthesis.addEventListener&&speechSynthesis.addEventListener('voiceschanged',()=>{VOICE=null;pickVoice()})}catch(e){}
const TINY_MP4='data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAXEbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAB9AAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAl10cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAB9AAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAABAAAAAQAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAfQAAAAAAABAAAAAAHVbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAABAAAAAgABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABgG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAUBzdGJsAAAAvHN0c2QAAAAAAAAAAQAAAKxhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAABAAEABIAAAASAAAAAAAAAABFUxhdmM2MC4zMS4xMDIgbGlieDI2NAAAAAAAAAAAAAAAGP//AAAAMmF2Y0MBZAAK/+EAF2dkAAqs2V7ARAAAAwAEAAADAAg8SJZYAQAEaO+Py/34+AAAAAAQcGFzcAAAAAEAAAABAAAAFGJ0cnQAAAAAAAALSAAAC0gAAAAYc3R0cwAAAAAAAAABAAAAAgAAQAAAAAAUc3RzcwAAAAAAAAABAAAAAQAAABxzdHNjAAAAAAAAAAEAAAABAAAAAQAAAAEAAAAcc3RzegAAAAAAAAAAAAAAAgAAAsYAAAAMAAAAGHN0Y28AAAAAAAAAAgAABgkAAAjvAAACkXRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAIAAAAAAAAH0AAAAAAAAAAAAAAAAQEAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAB9AAAAQAAAEAAAAAAgltZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAB9AAABCgFXEAAAAAAAtaGRscgAAAAAAAAAAc291bgAAAAAAAAAAAAAAAFNvdW5kSGFuZGxlcgAAAAG0bWluZgAAABBzbWhkAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAF4c3RibAAAAH5zdHNkAAAAAAAAAAEAAABubXA0YQAAAAAAAAABAAAAAAAAAAAAAQAQAAAAAB9AAAAAAAA2ZXNkcwAAAAADgICAJQACAASAgIAXQBUAAAAAAB9AAAABPwWAgIAFFYhW5QAGgICAAQIAAAAUYnRydAAAAAAAAB9AAAABPwAAACBzdHRzAAAAAAAAAAIAAAAQAAAEAAAAAAEAAAKAAAAAKHN0c2MAAAAAAAAAAgAAAAEAAAABAAAAAQAAAAIAAAAIAAAAAQAAAFhzdHN6AAAAAAAAAAAAAAARAAAAFQAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAcc3RjbwAAAAAAAAADAAAF9AAACM8AAAj7AAAAGnNncGQBAAAAcm9sbAAAAAIAAAAB//8AAAAcc2JncAAAAAByb2xsAAAAAQAAABEAAAABAAAAYnVkdGEAAABabWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAtaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY2MC4xNi4xMDAAAAAIZnJlZQAAAy9tZGF03gIATGF2YzYwLjMxLjEwMgACMEAOAAACrAYF//+o3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzEwOCAzMWUxOWY5IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTEgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9MiBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0wIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MCA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0wIHRocmVhZHM9MSBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTMgYl9weXJhbWlkPTIgYl9hZGFwdD0xIGJfYmlhcz0wIGRpcmVjdD0xIHdlaWdodGI9MSBvcGVuX2dvcD0wIHdlaWdodHA9MSBrZXlpbnQ9MjUwIGtleWludF9taW49MSBzY2VuZWN1dD00MCBpbnRyYV9yZWZyZXNoPTAgcmNfbG9va2FoZWFkPTEwIHJjPWNyZiBtYnRyZWU9MSBjcmY9MjMuMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0xOjEuMDAAgAAAABJliIQAFv/sf8JVf9ECkR5tf/EBGCAHARggBwEYIAcBGCAHARggBwEYIAcBGCAHARggBwAAAAhBmiEYgr/+8AEYIAcBGCAHARggBwEYIAcBGCAHARggBwEYIAcBGCAH';
let rpWake2=null;
async function keepAwake(on){
  try{if(on){if(navigator.wakeLock)rpWake2=await navigator.wakeLock.request('screen')}else{rpWake2&&rpWake2.release();rpWake2=null}}catch(e){}
  try{if(on){if(!AUD.vid){const v=document.createElement('video');v.setAttribute('playsinline','');v.setAttribute('muted','');v.muted=true;v.loop=true;v.src=TINY_MP4;v.style.cssText='position:fixed;width:1px;height:1px;opacity:0.01;pointer-events:none;bottom:0;left:0';document.body.appendChild(v);AUD.vid=v}AUD.vid.play().catch(()=>{})}else if(AUD.vid){AUD.vid.pause();AUD.vid.remove();AUD.vid=null}}catch(e){}
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&typeof PL!=='undefined'&&PL&&!PL.end)keepAwake(true)});
function audControls(){return `<div class="audbar"><div class="segmini">${[['ocean','🌊 Ocean'],['rain','🌧 Rain'],['off','🔇 Quiet']].map(([v,l])=>`<button type="button" data-asnd="${v}" aria-pressed="${AUD.snd===v}">${l}</button>`).join('')}</div><button type="button" class="vtog" data-avoice aria-pressed="${AUD.voice}">${AUD.voice?'🗣 Voice on':'🗣 Voice off'}</button></div>`}
// ---- photo review before logging ----
let PR=null;
function photoReviewHTML(){if(!PR)return '';
  return `<div class="cfwrap" id="prWrap"><div class="cfsheet prsheet" role="dialog" aria-label="Check your plate"><h2>Here's what I see</h2>${PR.seen?`<p class="prseen">${esc(PR.seen)}</p>`:''}<p class="ds" style="margin:0">An estimate from a photo, so it can be 20-30% out. Fix anything that's wrong.</p>
    <div class="prall"><span>How much did you eat?</span><div class="segmini">${[25,50,75,100].map(p=>`<button type="button" data-prall="${p}" aria-pressed="${PR.items.every(x=>x.pct===p)}">${p===100?'All':p+'%'}</button>`).join('')}</div></div>
    <div class="pritems">${PR.items.map((x,i)=>`<div class="pritem ${x.off?'off':''}"><div class="prtop"><input type="text" value="${esc(x.name)}" data-prname="${i}" aria-label="Food name"><span class="num">${Math.round(kcalOf(x)*x.pct/100)} kcal</span><button type="button" class="x" data-proff="${i}" aria-label="${x.off?'Add back':'Didn\'t eat this'}">${x.off?'+':'×'}</button></div>
      ${x.off?'':`<div class="segmini">${[25,50,75,100].map(p=>`<button type="button" data-prpct="${i}:${p}" aria-pressed="${x.pct===p}">${p===100?'All':p+'%'}</button>`).join('')}</div>`}</div>`).join('')}</div>
    <div class="actions"><button type="button" class="ghost" id="prNo" style="flex:1;color:var(--fg)">Cancel</button><button type="button" class="donebtn" id="prYes" ${PR.busy?'disabled':''}>${PR.busy?'Working…':'Log it'}</button></div></div></div>`}
function showPR(){let h=$('#prHost');if(!h){h=document.createElement('div');h.id='prHost';document.body.appendChild(h)}h.innerHTML=photoReviewHTML()}
async function prLog(){if(!PR)return;PR.busy=true;showPR();const k=iso(sel);
  try{const changed=PR.items.filter(x=>!x.off&&x.name.trim()&&x.name.trim()!==x.orig);
    if(changed.length&&sample){const out=await sample.json(`Estimate nutrition for these foods from one plate (${PR.meal}), keeping the same portion sizes as described.\n${changed.map(x=>`- ${x.name} (${x.qty||'normal portion'})`).join('\n')}\n${typeof foodRules==='function'?foodRules():FOOD_RULES}`);
      const fresh=cleanItems(out&&out.items,PR.meal,true,'photo');changed.forEach((x,i)=>{const f=fresh[i];if(f){NK.forEach(q=>x[q]=f[q]);x.plants=f.plants}})}
    const items=PR.items.filter(x=>!x.off).map(x=>{const o={...x};delete o.pct;delete o.off;delete o.orig;o.name=x.name.trim()||x.orig;const f=x.pct/100;NK.forEach(q=>{if(isNum(o[q]))o[q]=q==='kcal'?Math.round(+o[q]*f):Math.round(+o[q]*f*10)/10});if(x.pct<100)o.qty=`${x.pct}% of ${o.qty||'a portion'}`;o.meal=PR.meal;return o});
    if(items.length)await addFood(items,k);PR=null;showPR();toast(items.length?`Logged ${items.length} item${items.length>1?'s':''}`:'Nothing logged');render()}
  catch(e){PR.busy=false;showPR();toast(foodErr(e))}}
// ---- quick add that learns what you eat, and when ----
function learnedFoods(){const meal=fState.meal||(iso(sel)===iso(todayDate())?guessMeal():'Dinner');const t=todayDate();const m={};
  for(let i=0;i<45;i++){const k=iso(addD(t,-i));const d=D()[k];(d&&d.food||[]).forEach(it=>{if(it.src==='plan'||it.src==='alcohol'||!it.name)return;const key=String(it.name).toLowerCase().trim();if(!m[key])m[key]={...it,count:0,meals:{},score:0};const o=m[key];o.count++;o.meals[it.meal]=(o.meals[it.meal]||0)+1;o.score+=i<7?2:1})}
  return Object.values(m).filter(o=>o.count>=2).map(o=>({...o,rank:o.score+3*(o.meals[meal]||0)})).sort((a,b)=>b.rank-a.rank).slice(0,12)}
function foodActionsHTML(dIso){if(sampleMode||dIso>iso(todayDate()))return '';
  const meal=fState.meal||(dIso===iso(todayDate())?guessMeal():'Dinner');const fr=learnedFoods();const dt=dayTypeFor(dIso);
  const lib=LIB.filter(x=>x[1]==='any'||x[1]==='snack'||x[1]==='drinks'||x[1]==='treat'||(dt==='rest'&&x[1]==='rest')||(dt!=='rest'&&(x[1]==='training'||x[1]==='post')));
  const chip=(i,ix)=>`<button type="button" data-quick="${ix}">${esc(i.name)}</button>`;
  return `<article class="card factions"><div class="frow">${canImg?`<label class="fbtn"><span aria-hidden="true">📷</span><b>Snap plate</b><input type="file" id="mealFile" accept="image/*" capture="environment" aria-label="Take a photo of your meal"></label>`:''}<button type="button" class="fbtn" id="fSay"><span aria-hidden="true">🎤</span><b>Say it</b></button><button type="button" class="fbtn" id="fType"><span aria-hidden="true">⌨️</span><b>Type it</b></button></div>${canImg?`<label class="galbtn">Or choose a photo from your gallery<input type="file" id="mealFile2" accept="image/*" style="position:absolute;opacity:0;width:1px;height:1px;overflow:hidden"></label>`:''}
    <div class="mealpick">${seg('f','meal',MEALS,meal,null,'small')}</div><div class="qline"><span class="label">Quick add · ${esc(meal)}</span>${fr.length?`<div class="tags">${fr.slice(0,5).map(chip).join('')}</div>`:`<div class="hint" style="font-size:12px;color:var(--muted)">Things you eat often will appear here.</div>`}
    ${fr.length>5||lib.length?`<details class="qmore"><summary>More</summary>${fr.length>5?`<div class="tags">${fr.slice(5).map((x,i)=>chip(x,i+5)).join('')}</div>`:''}${lib.length?`<div class="label" style="margin-top:8px">From your meal guide</div><div class="tags">${lib.map(x=>`<button type="button" data-lib="${LIB.indexOf(x)}">${esc(x[0])}</button>`).join('')}</div>`:''}</details>`:''}</div>
    ${fState.busy||fState.msg?`<div class="hsum" role="status">${esc(fState.busy?'Working…':fState.msg)}</div>`:''}</article>`}
// ---- compact meals ----
const msOpen=new Set();
document.addEventListener('toggle',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.ms){if(t.open)msOpen.add(t.dataset.ms);else msOpen.delete(t.dataset.ms)}},true);
document.addEventListener('click',e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(x=c('[data-asnd]')){AUD.snd=x.dataset.asnd;audSave();audBed();document.querySelectorAll('[data-asnd]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.asnd===AUD.snd));return}
  if(c('[data-avoice]')){AUD.voice=!AUD.voice;audSave();if(!AUD.voice)try{speechSynthesis.cancel()}catch(e){}const b=c('[data-avoice]');b.setAttribute('aria-pressed',AUD.voice);b.textContent=AUD.voice?'🗣 Voice on':'🗣 Voice off';return}
  if(x=c('[data-prall]')){PR.items.forEach(i=>i.pct=+x.dataset.prall);showPR();return}
  if(x=c('[data-prpct]')){const [i,p]=x.dataset.prpct.split(':').map(Number);PR.items[i].pct=p;showPR();return}
  if(x=c('[data-proff]')){const i=+x.dataset.proff;PR.items[i].off=!PR.items[i].off;showPR();return}
  if(c('#prNo')){PR=null;showPR();return}if(c('#prYes')){prLog();return}
  if(c('#fSay')){if(typeof openVoice==='function')openVoice();return}
  if(c('#fType')){if(typeof openVoice==='function'){openVoice();setTimeout(()=>{const t=$('#v-text');if(t)t.focus()},120)}return}
});
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.prname!=null&&PR){PR.items[+t.dataset.prname].name=t.value}});

// ================= v6: real voice, session intros with length choice =================
let TTS_ON=false;const ttsBuf=new Map(),ttsPend=new Map();let ttsSrc=null;
let RI=null;
function showRI(){let h=$('#riHost');if(!h){h=document.createElement('div');h.id='riHost';document.body.appendChild(h)}h.innerHTML=riHTML()}
function rpStart(id,v){const pr=PROGS.find(p=>p.id===id);if(!pr)return;if(v==null)v=pr.lens[pr.def||0][1];
  const settle=Math.min(50,Math.max(18,Math.round(pr.intro.split(/\s+/).length/2.1)+5));
  const steps=[{k:'move',s:settle,t:'Settle in',c:'Listen, get comfortable, and close your eyes when you\'re ready.',intro:true}].concat(pr.steps(v));
  PL={pr,steps,i:0,paused:false,end:false,started:Date.now(),cues:{}};
  audCtx();audBed();keepAwake(true);
  if(TTS_ON&&AUD.voice){[pr.intro,'Breathe in','Hold','Breathe out','Long breath out','One more sniff','Breathe out slowly','Halfway. Keep breathing slowly.','Ten seconds.','Well done. Take a moment before you get up.'].concat(steps.filter(s=>!['in','hold','out'].includes(s.k)&&!s.intro&&!s.quiet).map(s=>s.t+'. '+(s.c||''))).forEach(t=>ttsGet(t))}
  rpGo(0)}
function audStepSay(st,i,pr){if(st.intro){chime('step');say(pr.intro);return}const breath=['in','hold','out'].includes(st.k);
  if(breath){chime(st.k==='in'?'in':st.k==='out'?'out':'hold');if((st.round||1)<=3)say(st.t);return}
  chime('step');if(!st.quiet)say(st.t+'. '+(st.c||''))}
function rpCues(left){if(!PL)return;const st=PL.steps[PL.i];if(!st||st.quiet||st.intro)return;const k=PL.i;
  if(st.s>=90&&left===Math.round(st.s/2)&&!PL.cues[k+'h']){PL.cues[k+'h']=1;say('Halfway. Keep breathing slowly.')}
  if((st.k==='hot'||st.k==='cold')&&left===10&&!PL.cues[k+'t']){PL.cues[k+'t']=1;say('Ten seconds.')}}
function updateFab(){const f=$('#fab');let t='';try{t=tab()}catch(e){}if(f)f.hidden=!sample||vState.open||sampleMode||t!=='training'||tView==='route'}
window.addEventListener('hashchange',()=>{try{updateFab()}catch(e){}});
document.addEventListener('click',e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(x=c('[data-rilen]')){RI.li=+x.dataset.rilen;showRI();return}
  if(c('#riX')||e.target.id==='riWrap'){RI=null;showRI();return}
  if(c('#riGo')){const {pr,li}=RI;RI=null;showRI();primeAudio();rpStart(pr.id,pr.lens[li][1]);return}
},true);

// ================= v7: voice through an audio element, sleeker session pages =================
const SILENT_MP3='data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//NwwAAAAAAAAAAAAEluZm8AAAAPAAAADgAABm0ALCwsLCwsLDw8PDw8PDxNTU1NTU1NXV1dXV1dXW1tbW1tbW19fX19fX19jo6Ojo6Ojp6enp6enp6erq6urq6urr6+vr6+vr7Pz8/Pz8/P39/f39/f3+/v7+/v7+//////////AAAAAExhdmM2MC4zMQAAAAAAAAAAAAAAACQDaQAAAAAAAAZtL+ircQAAAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
const VST={state:'',msg:''};
function vstatText(){if(!AUD.voice)return 'Voice off';if(TTS_ON)return VST.state==='err'?`Voice problem: ${esc(VST.msg)}. Using your phone's voice instead.`:VST.state==='loading'?'Preparing the voice…':`Irish voice, ${AUD.who}`;const v=pickVoice();return v?`Phone voice: ${esc(v.name)}`:'Using your phone\'s built-in voice'}
function vstatSet(s,m){VST.state=s;VST.msg=m||'';const e=$('#vStat');if(e)e.innerHTML=vstatText()}
const ttsUrl=new Map(),ttsP=new Map();
function ttsGet(text){const tk=AUD.who+'|'+text;if(ttsUrl.has(tk))return Promise.resolve(ttsUrl.get(tk));if(ttsP.has(tk))return ttsP.get(tk);
  const p=(async()=>{try{let blob=null,cache=null,key=null;try{cache=window.caches?await caches.open('tts-v3'):null;key=new Request(location.origin+'/tts-cache/'+AUD.who+'/'+encodeURIComponent(text));const hit=cache&&await cache.match(key);if(hit)blob=await hit.blob()}catch(e){}
      if(!blob){const {data:{session}}=await sb.auth.getSession();if(!session){vstatSet('err','signed out');return null}
        const r=await fetch('/api/tts',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+session.access_token},body:JSON.stringify({text,voice:AUD.who})});
        if(!r.ok){let m='error '+r.status;try{const j=await r.json();m=j.error||m}catch(e){}vstatSet('err',String(m).slice(0,140));ttsP.delete(tk);return null}
        blob=await r.blob();try{cache&&cache.put(key,new Response(blob,{headers:{'content-type':'audio/mpeg'}}))}catch(e){}}
      const u=URL.createObjectURL(blob);ttsUrl.set(tk,u);if(VST.state==='loading')vstatSet('ok');return u}
    catch(e){vstatSet('err',String(e&&e.message||e).slice(0,100));ttsP.delete(tk);return null}})();
  ttsP.set(tk,p);return p}
let vEl=null;function voiceEl(){if(!vEl){vEl=document.createElement('audio');vEl.setAttribute('playsinline','');vEl.preload='auto';vEl.style.display='none';document.body.appendChild(vEl)}return vEl}
function phoneSay(t){if(!window.speechSynthesis)return;try{if(speechSynthesis.speaking||speechSynthesis.pending)speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.82;u.pitch=.95;u.volume=1;const v=pickVoice();if(v)u.voice=v;setTimeout(()=>{try{speechSynthesis.speak(u)}catch(e){}},80)}catch(e){}}
async function say(t){if(!AUD.voice||!t)return;const tok={};say.tok=tok;
  if(TTS_ON&&VST.state!=='err'){const u=await ttsGet(t);if(say.tok!==tok)return;if(u){try{const a=voiceEl();a.pause();a.src=u;a.volume=1;await a.play();return}catch(e){vstatSet('err','the phone blocked playback ('+(e&&e.name||'')+')')}}}
  phoneSay(t)}
function sayStop(){say.tok=null;try{vEl&&vEl.pause()}catch(e){}try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}}
function primeAudio(){try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}audCtx();
  try{const a=voiceEl();a.src=SILENT_MP3;const p=a.play();p&&p.catch(()=>{})}catch(e){}
  try{if(window.speechSynthesis){const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}}catch(e){}
  if(TTS_ON&&AUD.voice&&VST.state!=='ok')vstatSet('loading')}
function riHTML(){if(!RI)return '';const pr=RI.pr;const v=pr.lens[RI.li][1];const steps=pr.steps(v);const breath=steps.some(s=>s.k==='in');
  const tot=steps.reduce((a,x)=>a+x.s,0)+Math.min(50,Math.max(18,Math.round(pr.intro.split(/\s+/).length/2.1)+5));
  const coming=breath?`<div class="rptl">${steps.filter(s=>s.round===1).map(s=>`<span class="k-${s.k}">${esc(s.t)} <b>${s.s}s</b></span>`).join('')}</div><small class="ds">Repeat ${steps[0].of} times. The voice guides the first few rounds, then soft tones keep the rhythm.</small>`
    :`<ol class="rilist">${[...new Set(steps.map(s=>s.t))].slice(0,12).map(t=>`<li>${esc(t)}</li>`).join('')}</ol>`;
  return `<div class="rpage" id="riPage" role="dialog" aria-label="${esc(pr.name)}"><div class="rpscroll">
    <div class="rptop"><button type="button" class="pli" id="riX" aria-label="Close">✕</button></div>
    <div class="rphero"><div class="rpic" aria-hidden="true">${pr.ic}</div><h1>${esc(pr.name)}</h1><div class="rpchips"><span>🧠 ${esc(pr.mind)}</span><span>💪 ${esc(pr.body)}</span></div></div>
    <div class="rpsec"><div class="label">Length</div><div class="subtabs" style="grid-template-columns:repeat(${pr.lens.length},1fr)">${pr.lens.map(([l],i)=>`<button type="button" data-rilen="${i}" aria-pressed="${RI.li===i}">${esc(l)}</button>`).join('')}</div></div>
    <div class="rpsec"><div class="label">What's coming</div>${coming}</div>
    <details class="wu rpprep"><summary>Before you start</summary><ul class="cover" style="margin-top:4px">${pr.prep.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></details>
    ${pr.safety?`<div class="plsafe" style="max-width:none">${esc(pr.safety)}</div>`:''}
    <div class="rpsec"><div class="label">Sound</div><div class="subtabs">${[['ocean','🌊 Ocean'],['rain','🌧 Rain'],['off','🔇 Quiet']].map(([k,l])=>`<button type="button" data-asnd="${k}" aria-pressed="${AUD.snd===k}">${l}</button>`).join('')}</div></div>
    <div class="rpsec"><div class="label">Voice guide</div>${voiceTabs()}<small class="ds">${TTS_ON?'A calm Irish voice talks you through it.':'Uses your phone\'s voice. An Irish one is used if your phone has it.'}</small></div></div>
    <div class="rpgo"><button type="button" class="donebtn" id="riGo">▶ Start · ${fromSec(tot)}</button><small class="ds">Turn your volume up${TTS_ON?'':' and check the silent switch'}. The screen stays on.</small></div></div>`}
function rpRender(fresh){let h=$('#plHost');if(!h){h=document.createElement('div');h.id='plHost';document.body.appendChild(h)}if(!PL){h.innerHTML='';return}
  const pr=PL.pr;
  if(PL.end){h.innerHTML=`<div class="plwrap2"><div class="plbox"><div class="plic">${pr.ic}</div><h2>${esc(pr.name)} done</h2><p class="ds">${PL.mins} minute${PL.mins>1?'s':''} · ${esc(pr.mind)}</p><p style="margin:20px 0 12px;font-weight:600">How do you feel now?</p>
    <div class="plfeel">${[['😣',1],['😐',2],['🙂',3],['😌',4],['😁',5]].map(([e,v])=>`<button type="button" data-plfeel="${v}" aria-label="${v} out of 5">${e}</button>`).join('')}</div><button type="button" class="linkbtn" data-plfeel="0" style="margin-top:12px">Skip</button></div></div>`;return}
  const st=PL.steps[PL.i];const nx=PL.steps[PL.i+1];const breath=['in','hold','out'].includes(st.k);const pv=PL.steps[PL.i-1];const bcls=st.k==='hold'?(pv&&pv.k==='in'?'hbig':'hsmall'):st.k;
  PL.tot=PL.steps.reduce((a,x)=>a+x.s,0);
  h.innerHTML=`<div class="plwrap2 ${st.k}"><div class="plhead"><button type="button" class="pli" id="rpX" aria-label="Stop">✕</button><span class="pln">${pr.ic} ${esc(pr.name)}</span><span class="plic2"><button type="button" class="pli" id="plSnd" aria-label="Sound">${{ocean:'🌊',rain:'🌧',off:'🔇'}[AUD.snd]}</button><button type="button" class="pli ${AUD.voice?'':'off'}" id="plVc" aria-label="Voice ${AUD.voice?'on':'off'}">🗣</button></span></div>
    <div class="plprog"><i id="plBar"></i></div><div class="pltime" id="rpTime"></div>
    <div class="plmain"><div class="plorb ${breath?bcls:'still'}" style="--d:${st.s}s"><span id="plCount">${st.s>=60?fromSec(st.s):st.s}</span></div><h2>${esc(st.t)}</h2>${st.c?`<p>${esc(st.c)}</p>`:''}${st.round?`<small class="ds">Round ${st.round} of ${st.of}</small>`:''}${pr.safety&&PL.i===1?`<div class="plsafe">${esc(pr.safety)}</div>`:''}</div>
    <div class="plnext">${nx?`Next · ${esc(nx.t)}`:'Last step'}</div>
    <div class="plctl"><button type="button" class="pcb" id="rpBack" ${PL.i?'':'disabled'} aria-label="Back">⏮</button><button type="button" class="pcb main" id="rpPause" aria-label="${PL.paused?'Resume':'Pause'}">${PL.paused?'▶':'❚❚'}</button><button type="button" class="pcb" id="rpSkip" aria-label="Skip">⏭</button></div>
    <div class="vstat" id="vStat">${vstatText()}</div></div>`;
  rpProg();if(fresh&&breath){const o=h.querySelector('.plorb');if(o){o.classList.remove(bcls);void o.offsetWidth;o.classList.add(bcls)}}}
function rpProg(){if(!PL||PL.end||!PL.tot)return;const st=PL.steps[PL.i];const left=PL.paused?Math.ceil((PL.pausedLeft||0)/1000):Math.max(0,Math.ceil((PL.stepEnd-Date.now())/1000));let done=0;for(let j=0;j<PL.i;j++)done+=PL.steps[j].s;done+=st.s-left;
  const b=$('#plBar');if(b)b.style.width=Math.min(100,done/PL.tot*100)+'%';const t=$('#rpTime');if(t)t.textContent=`${fromSec(done)} / ${fromSec(PL.tot)}`}
function ciActions(){if(!sample||sampleMode)return '';return `<article class="card factions"><div class="frow" style="grid-template-columns:1fr 1fr"><button type="button" class="fbtn" id="ciSay"><span aria-hidden="true">🎤</span><b>Say it</b></button><button type="button" class="fbtn" id="ciType"><span aria-hidden="true">⌨️</span><b>Type it</b></button></div><small class="ds" style="text-align:center">Or tap through the questions below</small></article>`}
document.addEventListener('click',e=>{const c=q=>e.target.closest&&e.target.closest(q);
  if(c('#plSnd')){AUD.snd=AUD.snd==='ocean'?'rain':AUD.snd==='rain'?'off':'ocean';audSave();audBed();const b=c('#plSnd');b.textContent={ocean:'🌊',rain:'🌧',off:'🔇'}[AUD.snd];return}
  if(c('#plVc')){setWho(!AUD.voice?'female':AUD.who==='female'?'male':'off');const b=c('#plVc');b.classList.toggle('off',!AUD.voice);b.setAttribute('aria-label','Voice: '+(AUD.voice?AUD.who:'off'));return}
  if(c('#ciSay')){if(typeof openVoice==='function')openVoice();return}
  if(c('#ciType')){if(typeof openVoice==='function'){openVoice();setTimeout(()=>{const t=$('#v-text');if(t)t.focus()},120)}return}
});
function voiceTabs(){const cur=AUD.voice?AUD.who:'off';return `<div class="subtabs">${[['female','Female'],['male','Male'],['off','Off']].map(([k,l])=>`<button type="button" data-avwho="${k}" aria-pressed="${cur===k}">${l}</button>`).join('')}</div>`}
function setWho(k){if(k==='off'){AUD.voice=false;sayStop()}else{AUD.voice=true;AUD.who=k;VOICE=null}audSave();VST.state='';document.querySelectorAll('[data-avwho]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.avwho===(AUD.voice?AUD.who:'off')));const e=$('#vStat');if(e)e.innerHTML=vstatText()}
document.addEventListener('click',e=>{const x=e.target.closest&&e.target.closest('[data-avwho]');if(x){primeAudio();setWho(x.dataset.avwho);if(AUD.voice)say(AUD.who==='male'?'Hello. This is the voice that will guide you.':'Hello. This is the voice that will guide you.')}});

// ================= Keel icons: Lucide outline set (ISC licence), replaces emoji in the UI =================
const ICO={"accessibility": "<circle cx=\"16\" cy=\"4\" r=\"1\"/> <path d=\"m18 19 1-7-6 1\"/> <path d=\"m5 8 3-3 5.5 3-2.36 3.5\"/> <path d=\"M4.24 14.5a5 5 0 0 0 6.88 6\"/> <path d=\"M13.76 17.5a5 5 0 0 0-6.88-6\"/>", "activity": "<path d=\"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2\"/>", "alarm-clock": "<circle cx=\"12\" cy=\"13\" r=\"8\"/> <path d=\"M12 9v4l2 2\"/> <path d=\"M5 3 2 6\"/> <path d=\"m22 6-3-3\"/> <path d=\"M6.38 18.7 4 21\"/> <path d=\"M17.64 18.67 20 21\"/>", "apple": "<path d=\"M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z\"/> <path d=\"M10 2c1 .5 2 2 2 5\"/>", "arrow-left-right": "<path d=\"M8 3 4 7l4 4\"/> <path d=\"M4 7h16\"/> <path d=\"m16 21 4-4-4-4\"/> <path d=\"M20 17H4\"/>", "audio-lines": "<path d=\"M2 10v3\"/> <path d=\"M6 6v11\"/> <path d=\"M10 3v18\"/> <path d=\"M14 8v7\"/> <path d=\"M18 5v13\"/> <path d=\"M22 10v3\"/>", "banana": "<path d=\"M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5\"/> <path d=\"M5.15 17.89c5.52-1.52 8.65-6.89 7-12C11.55 4 11.5 2 13 2c3.22 0 5 5.5 5 8 0 6.5-4.2 12-10.49 12C5.11 22 2 22 2 20c0-1.5 1.14-1.55 3.15-2.11Z\"/>", "bean": "<path d=\"M10.165 6.598C9.954 7.478 9.64 8.36 9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22c7.732 0 14-6.268 14-14a6 6 0 0 0-11.835-1.402Z\"/> <path d=\"M5.341 10.62a4 4 0 1 0 5.279-5.28\"/>", "bed": "<path d=\"M2 4v16\"/> <path d=\"M2 8h18a2 2 0 0 1 2 2v10\"/> <path d=\"M2 17h20\"/> <path d=\"M6 8v9\"/>", "beef": "<circle cx=\"12.5\" cy=\"8.5\" r=\"2.5\"/> <path d=\"M12.5 2a6.5 6.5 0 0 0-6.22 4.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3A6.5 6.5 0 0 0 12.5 2Z\"/> <path d=\"m18.5 6 2.19 4.5a6.48 6.48 0 0 1 .31 2 6.49 6.49 0 0 1-2.6 5.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5\"/>", "beer": "<path d=\"M17 11h1a3 3 0 0 1 0 6h-1\"/> <path d=\"M9 12v6\"/> <path d=\"M13 12v6\"/> <path d=\"M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 2 11 2s2 1.5 3 1.5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z\"/> <path d=\"M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8\"/>", "bike": "<circle cx=\"18.5\" cy=\"17.5\" r=\"3.5\"/> <circle cx=\"5.5\" cy=\"17.5\" r=\"3.5\"/> <circle cx=\"15\" cy=\"5\" r=\"1\"/> <path d=\"M12 17.5V14l-3-3 4-3 2 3h2\"/>", "book-open": "<path d=\"M12 7v14\"/> <path d=\"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z\"/>", "brain": "<path d=\"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z\"/> <path d=\"M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z\"/> <path d=\"M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4\"/> <path d=\"M17.599 6.5a3 3 0 0 0 .399-1.375\"/> <path d=\"M6.003 5.125A3 3 0 0 0 6.401 6.5\"/> <path d=\"M3.477 10.896a4 4 0 0 1 .585-.396\"/> <path d=\"M19.938 10.5a4 4 0 0 1 .585.396\"/> <path d=\"M6 18a4 4 0 0 1-1.967-.516\"/> <path d=\"M19.967 17.484A4 4 0 0 1 18 18\"/>", "calendar": "<path d=\"M8 2v4\"/> <path d=\"M16 2v4\"/> <rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\"/> <path d=\"M3 10h18\"/>", "camera": "<path d=\"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z\"/> <circle cx=\"12\" cy=\"13\" r=\"3\"/>", "candy": "<path d=\"m9.5 7.5-2 2a4.95 4.95 0 1 0 7 7l2-2a4.95 4.95 0 1 0-7-7Z\"/> <path d=\"M14 6.5v10\"/> <path d=\"M10 7.5v10\"/> <path d=\"m16 7 1-5 1.37.68A3 3 0 0 0 19.7 3H21v1.3c0 .46.1.92.32 1.33L22 7l-5 1\"/> <path d=\"m8 17-1 5-1.37-.68A3 3 0 0 0 4.3 21H3v-1.3a3 3 0 0 0-.32-1.33L2 17l5-1\"/>", "carrot": "<path d=\"M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46\"/> <path d=\"M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z\"/> <path d=\"M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z\"/>", "check": "<path d=\"M20 6 9 17l-5-5\"/>", "chevron-right": "<path d=\"m9 18 6-6-6-6\"/>", "circle": "<circle cx=\"12\" cy=\"12\" r=\"10\"/>", "circle-alert": "<circle cx=\"12\" cy=\"12\" r=\"10\"/> <line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\"/> <line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\"/>", "circle-dashed": "<path d=\"M10.1 2.182a10 10 0 0 1 3.8 0\"/> <path d=\"M13.9 21.818a10 10 0 0 1-3.8 0\"/> <path d=\"M17.609 3.721a10 10 0 0 1 2.69 2.7\"/> <path d=\"M2.182 13.9a10 10 0 0 1 0-3.8\"/> <path d=\"M20.279 17.609a10 10 0 0 1-2.7 2.69\"/> <path d=\"M21.818 10.1a10 10 0 0 1 0 3.8\"/> <path d=\"M3.721 6.391a10 10 0 0 1 2.7-2.69\"/> <path d=\"M6.391 20.279a10 10 0 0 1-2.69-2.7\"/>", "circle-help": "<circle cx=\"12\" cy=\"12\" r=\"10\"/> <path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"/> <path d=\"M12 17h.01\"/>", "clipboard-list": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\"/> <path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/> <path d=\"M12 11h4\"/> <path d=\"M12 16h4\"/> <path d=\"M8 11h.01\"/> <path d=\"M8 16h.01\"/>", "cloud-rain": "<path d=\"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242\"/> <path d=\"M16 14v6\"/> <path d=\"M8 14v6\"/> <path d=\"M12 16v6\"/>", "coffee": "<path d=\"M10 2v2\"/> <path d=\"M14 2v2\"/> <path d=\"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1\"/> <path d=\"M6 2v2\"/>", "cup-soda": "<path d=\"m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8\"/> <path d=\"M5 8h14\"/> <path d=\"M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0\"/> <path d=\"m12 8 1-6h2\"/>", "dna": "<path d=\"m10 16 1.5 1.5\"/> <path d=\"m14 8-1.5-1.5\"/> <path d=\"M15 2c-1.798 1.998-2.518 3.995-2.807 5.993\"/> <path d=\"m16.5 10.5 1 1\"/> <path d=\"m17 6-2.891-2.891\"/> <path d=\"M2 15c6.667-6 13.333 0 20-6\"/> <path d=\"m20 9 .891.891\"/> <path d=\"M3.109 14.109 4 15\"/> <path d=\"m6.5 12.5 1 1\"/> <path d=\"m7 18 2.891 2.891\"/> <path d=\"M9 22c1.798-1.998 2.518-3.995 2.807-5.993\"/>", "droplet": "<path d=\"M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z\"/>", "droplets": "<path d=\"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z\"/> <path d=\"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97\"/>", "drumstick": "<path d=\"M15.4 15.63a7.875 6 135 1 1 6.23-6.23 4.5 3.43 135 0 0-6.23 6.23\"/> <path d=\"m8.29 12.71-2.6 2.6a2.5 2.5 0 1 0-1.65 4.65A2.5 2.5 0 1 0 8.7 18.3l2.59-2.59\"/>", "dumbbell": "<path d=\"M14.4 14.4 9.6 9.6\"/> <path d=\"M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z\"/> <path d=\"m21.5 21.5-1.4-1.4\"/> <path d=\"M3.9 3.9 2.5 2.5\"/> <path d=\"M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z\"/>", "egg": "<path d=\"M12 22c6.23-.05 7.87-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10-3.55.04-7.14 5.66-7.5 10-.37 4.43 1.27 9.95 7.5 10z\"/>", "egg-fried": "<circle cx=\"11.5\" cy=\"12.5\" r=\"3.5\"/> <path d=\"M3 8c0-3.5 2.5-6 6.5-6 5 0 4.83 3 7.5 5s5 2 5 6c0 4.5-2.5 6.5-7 6.5-2.5 0-2.5 2.5-6 2.5s-7-2-7-5.5c0-3 1.5-3 1.5-5C3.5 10 3 9 3 8Z\"/>", "factory": "<path d=\"M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\"/> <path d=\"M17 18h1\"/> <path d=\"M12 18h1\"/> <path d=\"M7 18h1\"/>", "fish": "<path d=\"M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z\"/> <path d=\"M18 12v.5\"/> <path d=\"M16 17.93a9.77 9.77 0 0 1 0-11.86\"/> <path d=\"M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33\"/> <path d=\"M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4\"/> <path d=\"m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98\"/>", "flame": "<path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\"/>", "flask-conical": "<path d=\"M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2\"/> <path d=\"M8.5 2h7\"/> <path d=\"M7 16h10\"/>", "flower-2": "<path d=\"M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1\"/> <circle cx=\"12\" cy=\"8\" r=\"2\"/> <path d=\"M12 10v12\"/> <path d=\"M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z\"/> <path d=\"M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z\"/>", "footprints": "<path d=\"M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z\"/> <path d=\"M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z\"/> <path d=\"M16 17h4\"/> <path d=\"M4 13h4\"/>", "frown": "<circle cx=\"12\" cy=\"12\" r=\"10\"/> <path d=\"M16 16s-1.5-2-4-2-4 2-4 2\"/> <line x1=\"9\" x2=\"9.01\" y1=\"9\" y2=\"9\"/> <line x1=\"15\" x2=\"15.01\" y1=\"9\" y2=\"9\"/>", "glass-water": "<path d=\"M15.2 22H8.8a2 2 0 0 1-2-1.79L5 3h14l-1.81 17.21A2 2 0 0 1 15.2 22Z\"/> <path d=\"M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0\"/>", "hand-heart": "<path d=\"M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16\"/> <path d=\"m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9\"/> <path d=\"m2 15 6 6\"/> <path d=\"M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z\"/>", "heart-pulse": "<path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/> <path d=\"M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27\"/>", "heater": "<path d=\"M11 8c2-3-2-3 0-6\"/> <path d=\"M15.5 8c2-3-2-3 0-6\"/> <path d=\"M6 10h.01\"/> <path d=\"M6 14h.01\"/> <path d=\"M10 16v-4\"/> <path d=\"M14 16v-4\"/> <path d=\"M18 16v-4\"/> <path d=\"M20 6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3\"/> <path d=\"M5 20v2\"/> <path d=\"M19 20v2\"/>", "keyboard": "<path d=\"M10 8h.01\"/> <path d=\"M12 12h.01\"/> <path d=\"M14 8h.01\"/> <path d=\"M16 12h.01\"/> <path d=\"M18 8h.01\"/> <path d=\"M6 8h.01\"/> <path d=\"M7 16h10\"/> <path d=\"M8 12h.01\"/> <rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\"/>", "laugh": "<circle cx=\"12\" cy=\"12\" r=\"10\"/> <path d=\"M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z\"/> <line x1=\"9\" x2=\"9.01\" y1=\"9\" y2=\"9\"/> <line x1=\"15\" x2=\"15.01\" y1=\"9\" y2=\"9\"/>", "leaf": "<path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z\"/> <path d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12\"/>", "leafy-green": "<path d=\"M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22\"/> <path d=\"M2 22 17 7\"/>", "lightbulb": "<path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\"/> <path d=\"M9 18h6\"/> <path d=\"M10 22h4\"/>", "meh": "<circle cx=\"12\" cy=\"12\" r=\"10\"/> <line x1=\"8\" x2=\"16\" y1=\"15\" y2=\"15\"/> <line x1=\"9\" x2=\"9.01\" y1=\"9\" y2=\"9\"/> <line x1=\"15\" x2=\"15.01\" y1=\"9\" y2=\"9\"/>", "mic": "<path d=\"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z\"/> <path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"/> <line x1=\"12\" x2=\"12\" y1=\"19\" y2=\"22\"/>", "microscope": "<path d=\"M6 18h8\"/> <path d=\"M3 22h18\"/> <path d=\"M14 22a7 7 0 1 0 0-14h-1\"/> <path d=\"M9 14h2\"/> <path d=\"M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z\"/> <path d=\"M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3\"/>", "milk": "<path d=\"M8 2h8\"/> <path d=\"M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2\"/> <path d=\"M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0\"/>", "moon": "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/>", "nut": "<path d=\"M12 4V2\"/> <path d=\"M5 10v4a7.004 7.004 0 0 0 5.277 6.787c.412.104.802.292 1.102.592L12 22l.621-.621c.3-.3.69-.488 1.102-.592A7.003 7.003 0 0 0 19 14v-4\"/> <path d=\"M12 4C8 4 4.5 6 4 8c-.243.97-.919 1.952-2 3 1.31-.082 1.972-.29 3-1 .54.92.982 1.356 2 2 1.452-.647 1.954-1.098 2.5-2 .595.995 1.151 1.427 2.5 2 1.31-.621 1.862-1.058 2.5-2 .629.977 1.162 1.423 2.5 2 1.209-.548 1.68-.967 2-2 1.032.916 1.683 1.157 3 1-1.297-1.036-1.758-2.03-2-3-.5-2-4-4-8-4Z\"/>", "pause": "<rect x=\"14\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/> <rect x=\"6\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/>", "pencil": "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/> <path d=\"m15 5 4 4\"/>", "person-standing": "<circle cx=\"12\" cy=\"5\" r=\"1\"/> <path d=\"m9 20 3-6 3 6\"/> <path d=\"m6 8 6 2 6-2\"/> <path d=\"M12 10v4\"/>", "pill": "<path d=\"m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z\"/> <path d=\"m8.5 8.5 7 7\"/>", "play": "<polygon points=\"6 3 20 12 6 21 6 3\"/>", "plus": "<path d=\"M5 12h14\"/> <path d=\"M12 5v14\"/>", "repeat": "<path d=\"m17 2 4 4-4 4\"/> <path d=\"M3 11v-1a4 4 0 0 1 4-4h14\"/> <path d=\"m7 22-4-4 4-4\"/> <path d=\"M21 13v1a4 4 0 0 1-4 4H3\"/>", "rotate-cw": "<path d=\"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8\"/> <path d=\"M21 3v5h-5\"/>", "salad": "<path d=\"M7 21h10\"/> <path d=\"M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z\"/> <path d=\"M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1\"/> <path d=\"m13 12 4-4\"/> <path d=\"M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2\"/>", "scale": "<path d=\"m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z\"/> <path d=\"m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z\"/> <path d=\"M7 21h10\"/> <path d=\"M12 3v18\"/> <path d=\"M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2\"/>", "skip-back": "<polygon points=\"19 20 9 12 19 4 19 20\"/> <line x1=\"5\" x2=\"5\" y1=\"19\" y2=\"5\"/>", "skip-forward": "<polygon points=\"5 4 15 12 5 20 5 4\"/> <line x1=\"19\" x2=\"19\" y1=\"5\" y2=\"19\"/>", "smile": "<circle cx=\"12\" cy=\"12\" r=\"10\"/> <path d=\"M8 14s1.5 2 4 2 4-2 4-2\"/> <line x1=\"9\" x2=\"9.01\" y1=\"9\" y2=\"9\"/> <line x1=\"15\" x2=\"15.01\" y1=\"9\" y2=\"9\"/>", "smile-plus": "<path d=\"M22 11v1a10 10 0 1 1-9-10\"/> <path d=\"M8 14s1.5 2 4 2 4-2 4-2\"/> <line x1=\"9\" x2=\"9.01\" y1=\"9\" y2=\"9\"/> <line x1=\"15\" x2=\"15.01\" y1=\"9\" y2=\"9\"/> <path d=\"M16 5h6\"/> <path d=\"M19 2v6\"/>", "snowflake": "<line x1=\"2\" x2=\"22\" y1=\"12\" y2=\"12\"/> <line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"22\"/> <path d=\"m20 16-4-4 4-4\"/> <path d=\"m4 8 4 4-4 4\"/> <path d=\"m16 4-4 4-4-4\"/> <path d=\"m8 20 4-4 4 4\"/>", "sparkles": "<path d=\"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z\"/> <path d=\"M20 3v4\"/> <path d=\"M22 5h-4\"/> <path d=\"M4 17v2\"/> <path d=\"M5 18H3\"/>", "star": "<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\"/>", "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"/> <path d=\"M12 2v2\"/> <path d=\"M12 20v2\"/> <path d=\"m4.93 4.93 1.41 1.41\"/> <path d=\"m17.66 17.66 1.41 1.41\"/> <path d=\"M2 12h2\"/> <path d=\"M20 12h2\"/> <path d=\"m6.34 17.66-1.41 1.41\"/> <path d=\"m19.07 4.93-1.41 1.41\"/>", "target": "<circle cx=\"12\" cy=\"12\" r=\"10\"/> <circle cx=\"12\" cy=\"12\" r=\"6\"/> <circle cx=\"12\" cy=\"12\" r=\"2\"/>", "timer": "<line x1=\"10\" x2=\"14\" y1=\"2\" y2=\"2\"/> <line x1=\"12\" x2=\"15\" y1=\"14\" y2=\"11\"/> <circle cx=\"12\" cy=\"14\" r=\"8\"/>", "trending-down": "<polyline points=\"22 17 13.5 8.5 8.5 13.5 2 7\"/> <polyline points=\"16 17 22 17 22 11\"/>", "trending-up": "<polyline points=\"22 7 13.5 15.5 8.5 10.5 2 17\"/> <polyline points=\"16 7 22 7 22 13\"/>", "triangle-alert": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"/> <path d=\"M12 9v4\"/> <path d=\"M12 17h.01\"/>", "user": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/> <circle cx=\"12\" cy=\"7\" r=\"4\"/>", "utensils": "<path d=\"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2\"/> <path d=\"M7 2v20\"/> <path d=\"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7\"/>", "volume-2": "<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\"/> <path d=\"M16 9a5 5 0 0 1 0 6\"/> <path d=\"M19.364 18.364a9 9 0 0 0 0-12.728\"/>", "volume-x": "<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\"/> <line x1=\"22\" x2=\"16\" y1=\"9\" y2=\"15\"/> <line x1=\"16\" x2=\"22\" y1=\"9\" y2=\"15\"/>", "waves": "<path d=\"M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\"/> <path d=\"M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\"/> <path d=\"M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\"/>", "wheat": "<path d=\"M2 22 16 8\"/> <path d=\"M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z\"/> <path d=\"M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z\"/> <path d=\"M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z\"/> <path d=\"M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z\"/> <path d=\"M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z\"/> <path d=\"M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z\"/> <path d=\"M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z\"/>", "wind": "<path d=\"M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2\"/> <path d=\"M9.6 4.6A2 2 0 1 1 11 8H2\"/> <path d=\"M12.6 19.4A2 2 0 1 0 14 16H2\"/>", "wine": "<path d=\"M8 22h8\"/> <path d=\"M7 10h10\"/> <path d=\"M12 15v7\"/> <path d=\"M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z\"/>", "x": "<path d=\"M18 6 6 18\"/> <path d=\"m6 6 12 12\"/>"};
const EMI={"✓": "check", "✔": "check", "🌊": "waves", "🗣": "audio-lines", "🧘": "person-standing", "🧠": "brain", "🌧": "cloud-rain", "🔇": "volume-x", "✎": "pencil", "💧": "droplet", "✕": "x", "🚶": "footprints", "🧊": "snowflake", "🔥": "flame", "♨": "heater", "🤸": "accessibility", "⏭": "skip-forward", "🍺": "beer", "📷": "camera", "🌀": "rotate-cw", "🫁": "wind", "🎤": "mic", "❚❚": "pause", "⇄": "arrow-left-right", "🍳": "egg-fried", "🥗": "salad", "🍽": "utensils", "🍎": "apple", "🚴": "bike", "🏊": "waves", "💆": "hand-heart", "😮": "wind", "💨": "wind", "🌙": "moon", "🕉": "flower-2", "📘": "book-open", "📋": "clipboard-list", "🥦": "leafy-green", "🩸": "droplets", "🏭": "factory", "⚖": "scale", "🥩": "beef", "🦠": "microscope", "☀": "sun", "💊": "pill", "🛏": "bed", "❓": "circle-help", "💪": "heart-pulse", "😣": "frown", "😐": "meh", "🙂": "smile", "😌": "smile-plus", "😁": "laugh", "⏮": "skip-back", "▶": "play", "⌨": "keyboard", "😴": "bed", "⏸": "pause", "◐": "circle-dashed", "🔊": "volume-2", "🏃": "footprints", "🏋": "dumbbell", "⚽": "activity", "🥚": "egg", "🐟": "fish", "🍗": "drumstick", "🥛": "milk", "☕": "coffee", "🍷": "wine", "🥃": "glass-water", "🍫": "candy", "🧂": "sparkles", "🥜": "nut", "🍌": "banana", "🥑": "leaf", "🫘": "bean", "🥕": "carrot", "🍞": "wheat", "🌾": "wheat", "⭐": "star", "✨": "sparkles", "⚠": "triangle-alert", "❗": "circle-alert", "💡": "lightbulb", "🎯": "target", "📈": "trending-up", "📉": "trending-down", "🗓": "calendar", "📅": "calendar", "⏱": "timer", "⏰": "alarm-clock", "🔁": "repeat", "➕": "plus", "🧪": "flask-conical", "🧬": "dna", "🍬": "candy", "🧃": "cup-soda", "🥤": "cup-soda", "🫖": "coffee"};
function ico(n,cls){const p=ICO[n]||ICO.circle;return `<span class="ki${cls?' '+cls:''}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg></span>`}
const EMRX=new RegExp('('+"😮‍💨|❚❚|✓|✔|🌊|🗣|🧘|🧠|🌧|🔇|✎|💧|✕|🚶|🧊|🔥|♨|🤸|⏭|🍺|📷|🌀|🫁|🎤|⇄|🍳|🥗|🍽|🍎|🚴|🏊|💆|😮|💨|🌙|🕉|📘|📋|🥦|🩸|🏭|⚖|🥩|🦠|☀|💊|🛏|❓|💪|😣|😐|🙂|😌|😁|⏮|▶|⌨|😴|⏸|◐|🔊|🏃|🏋|⚽|🥚|🐟|🍗|🥛|☕|🍷|🥃|🍫|🧂|🥜|🍌|🥑|🫘|🥕|🍞|🌾|⭐|✨|⚠|❗|💡|🎯|📈|📉|🗓|📅|⏱|⏰|🔁|➕|🧪|🧬|🍬|🧃|🥤|🫖"+')\\uFE0F?','gu');
const EMSKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,TITLE:1,OPTION:1,SELECT:1,INPUT:1};
function deEmojiNode(root){if(!root)return;if(root.nodeType===3){fixText(root);return}if(root.nodeType!==1||EMSKIP[root.tagName])return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{let p=n.parentNode;if(!p||EMSKIP[p.tagName])return 2;EMRX.lastIndex=0;return EMRX.test(n.nodeValue)?1:2}});const list=[];let n;while(n=w.nextNode())list.push(n);list.forEach(fixText)}
function fixText(t){const v=t.nodeValue;EMRX.lastIndex=0;if(!EMRX.test(v))return;const p=t.parentNode;if(!p||EMSKIP[p.tagName])return;EMRX.lastIndex=0;
  const span=document.createElement('span');span.style.display='contents';span.innerHTML=v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(EMRX,(m,e)=>ico(EMI[e]||EMI[e.split('\u200d')[0]]));p.replaceChild(span,t)}
try{const mo=new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')fixText(m.target);else m.addedNodes.forEach(deEmojiNode)}});
  const go=()=>{deEmojiNode(document.body);mo.observe(document.body,{childList:true,subtree:true,characterData:true})};if(document.body)go();else document.addEventListener('DOMContentLoaded',go)}catch(e){}

// ================= Keel: greeting, plan summary, Plan tab navigation =================
function greet(){const h=new Date().getHours();const n=userName().split(/\s+/)[0]||'';const nm=n?', '+esc(n):'';if(h>=23||h<5)return 'Alright, night owl'+nm;return (h<12?'Good morning':h<18?'Good afternoon':'Good evening')+nm}
const capF=t=>t?String(t).charAt(0).toUpperCase()+String(t).slice(1):'';
function planInfo(){let P=null;try{P=PROFILE||null}catch(e){}const a=(P&&P.answers)||{};const now=todayDate();
  const wk=Math.max(1,Math.min(16,Math.floor((now-START)/DAY/7)+1));
  const goal=a.target||a.mainGoal||(P&&P.plan&&P.plan.goalLine)||'Fit and well for February';
  const days=TYPES.map((t,i)=>t==='R'?null:DOW[i]).filter(Boolean);let fh=null;try{fh=targets().fastH}catch(e){}
  const when=now<FIRST?`STARTS ${fmtD(FIRST,{day:'numeric',month:'short'}).toUpperCase()}`:now>END?'PLAN FINISHED':`WEEK ${wk} OF 16`;
  return {P,a,goal,days,fh,line:`${when} · ENDS ${fmtD(END,{day:'numeric',month:'short'}).toUpperCase()}`}}
function planSum(full){const I=planInfo(),a=I.a,canEdit=!!(I.P&&I.P.answers);
  const rows=[[0,'You',[userName()||'Add your name',a.age&&a.age+' years',a.weight&&a.weight+' kg'].filter(Boolean).join(' · ')],[1,'Goal',[I.goal,a.targetWeight&&`target ${a.targetWeight} kg`,a.success].filter(Boolean).join(' · ')],
    [2,'Moving',`${I.days.length} days a week · ${I.days.join(', ')}${a.fixed?' · '+a.fixed:''}`],
    [3,'Your day',[a.job,a.jobDesc,a.start&&'started '+fmtD(parse(a.start))].filter(Boolean).join(' · ')||'Not set yet'],
    [4,'Food',`${capF(typeof APPROACH!=='undefined'?APPROACH:'Higher protein, lower carb')} · about ${DAYT.training.kcal} kcal on active days and ${DAYT.rest.kcal} on rest days${I.fh?` · ${I.fh} h overnight fast`:''}`]];
  if(!full)return `<article class="card kplan"><span class="label">Your plan</span><div class="khead"><span class="heading">${esc(I.goal)}</span><span class="data">${I.line}</span></div>
    <p class="kbody">${esc(rows[1][2])}. ${esc(rows[3][2].split(' · ').slice(0,2).join(', '))}.</p><button type="button" class="ghost kfull" data-pnav="plan">See or change your plan</button></article>`;
  return `<article class="card kplan"><span class="label">Your plan</span><div class="khead"><span class="heading">${esc(I.goal)}</span><span class="data">${I.line}</span></div>
    <div class="kprog" aria-hidden="true"><i style="width:${Math.max(2,Math.min(100,(todayDate()-START)/(END-START)*100))}%"></i></div>
    <div class="krows">${rows.map(([s,l,t])=>canEdit&&s===0?`<div class="krow kname"><span class="label">Your name</span><span class="kt"><input id="kNameIn" type="text" autocomplete="name" value="${esc(userName())}" placeholder="First and last name"></span><button type="button" class="ked kedb" id="kNameSave">Save</button></div>`:canEdit?`<button type="button" class="krow" data-planedit="${s}"><span class="label">${l}</span><span class="kt">${esc(t)}</span><span class="ked">Change</span></button>`:`<div class="krow"><span class="label">${l}</span><span class="kt">${esc(t)}</span></div>`).join('')}</div>
    <small class="ds">${canEdit?'Changing anything rebuilds the plan from today. Everything you have logged stays.':'Your plan runs for 16 weeks. Ask to change it in a chat and it can be rebuilt.'}</small></article>`}
function planNav(cur){return `<div class="subtabs pnav" style="grid-template-columns:repeat(3,minmax(0,1fr))">${[['today','Day'],['plan','Overview'],['route','Routes']].map(([v,l])=>`<button type="button" data-pnav="${v}" aria-pressed="${cur===v}">${l}</button>`).join('')}</div>`}
document.addEventListener('click',e=>{const x=e.target.closest&&e.target.closest('[data-pnav]');if(x){const v=x.dataset.pnav;if(v==='recover'){location.hash='recover';return}tView=v;if(tab()!=='training')location.hash='training';else render();window.scrollTo({top:0});return}
  const pe=e.target.closest&&e.target.closest('[data-planedit]');if(pe&&typeof obRender==='function'){ob={step:+pe.dataset.planedit,a:Object.assign({},PROFILE.answers||{}),ret:true,fromApp:true};obSave();obRender();return}
  if(e.target.closest&&e.target.closest('#obCancel')){ob={step:-1,a:{}};obSave();showApp();render();return}});
function kAvatarSet(){const a=document.getElementById('kAvatar');if(!a)return;const w=userName().split(/\s+/).filter(Boolean);a.textContent=w.length?(w[0][0]+(w.length>1?w[w.length-1][0]:'')).toUpperCase():'Me'}

// ================= Keel v3: plan sheet, area colours =================
function planBtn(){const I=planInfo();return `<button type="button" class="kpbtn" data-plansheet><span class="kpic">${ico('calendar')}</span><span class="kpt"><b>Your goals</b><small>${esc(I.goal)} · ${esc(I.line.toLowerCase().replace(/^\w/,c=>c.toUpperCase()))}</small></span><span class="kpgo" aria-hidden="true">›</span></button>`}
function planSheet(open){let h=document.getElementById('psHost');if(!h){h=document.createElement('div');h.id='psHost';document.body.appendChild(h)}
  if(!open){h.innerHTML='';document.body.classList.remove('sheet-open');return}
  h.innerHTML=`<div class="kshwrap" id="psWrap"><div class="ksheet" role="dialog" aria-modal="true" aria-label="Your goals"><div class="kshead"><h2>Your goals</h2><button type="button" class="x" id="psX" aria-label="Close">${ico('x')}</button></div>${planSum(true)}</div></div>`;document.body.classList.add('sheet-open')}
document.addEventListener('click',e=>{const c=q=>e.target.closest&&e.target.closest(q);
  if(c('[data-plansheet]')){planSheet(true);return}
  if(c('#psX')||e.target.id==='psWrap'){planSheet(false);return}
  if(c('[data-planedit]'))planSheet(false)},true);
const AREA={dashboard:'today',checkin:'today',training:'plan',recover:'recover',mobility:'recover',food:'food',reports:'progress',profile:'today'};
function setArea(){let t='dashboard';try{t=tab()}catch(e){}document.body.dataset.area=AREA[t]||'today'}
window.addEventListener('hashchange',setArea);

// ================= Keel v4: food on Today =================
function todayFoodHTML(k){const d=D()[k]||{date:k,food:[]};const t=foodTotals(d),dt=dayTypeFor(k);
  return `<article class="card kfood"><div class="chead"><div style="flex:1;min-width:0"><h2>Food today</h2><div class="sub">${esc(DAYT[dt].label)} targets${t.n?` · ${t.n} item${t.n>1?'s':''} logged`:' · nothing logged yet'}</div></div><a class="linkbtn" href="#food" data-dtab>Log food ›</a></div>${macroRings(t,dt)}${microsHTML(t,dt,k)}</article>`}

// ================= Keel v5: rest days, class boards for extra sessions =================
function restExtraHTML(key,pl){if(pl&&pl.type!=='R')return '';const bal=readiness(D()[key]);
  const dn=Math.floor(parse(key)/DAY);const pk=a=>a[dn%a.length];const ids=[pk(['box','sigh','478']),pk(['walk','loosen','stretch','yoga','scan']),pk(bal!=null&&bal<55?['nap','scan','sigh']:['stretch','yoga','walk','loosen','sauna'].slice(1).concat(['walk']))].filter((v,i,a)=>a.indexOf(v)===i);const picks=ids.map(id=>PROGS.find(p=>p.id===id)).filter(Boolean);
  const nx=[];for(let i=1;i<=14&&nx.length<4;i++){const dd=addD(parse(key),i),p=planFor(dd);if(p&&p.type!=='R'&&!p.pre)nx.push({dd,p})}
  return `<article class="card krest"><div class="chead"><div style="flex:1"><h2>${pl?'Make the most of a rest day':'Keep ticking over'}</h2><div class="sub">${pl?'Easy movement and a bit of recovery help you come back stronger.':'Nothing planned today. A walk or a few minutes of recovery still count.'}</div></div></div>
    <div class="krlist">${picks.map(p=>`<button type="button" class="rprog" data-prog="${p.id}" style="--rc:${RCC[p.cat]||'var(--k-blue)'}"><span class="ric" aria-hidden="true">${p.ic}</span><span class="rt"><b>${esc(p.name)}</b><small>${esc(p.lens[p.def||0][0])} · ${esc(p.mind)}</small></span><span class="rgo" aria-hidden="true">▶</span></button>`).join('')}</div></article>
  ${nx.length?`<article class="card"><div class="chead"><div style="flex:1"><h2>Coming up</h2><div class="sub">Tap one to see it, or say "move" to Dictate</div></div></div><div class="kup">${nx.map(({dd,p})=>`<button type="button" class="kupi" data-goto="${iso(dd)}" style="--c:var(${TVAR[p.type]})"><span class="kud">${fmtD(dd,{weekday:'short'})}<b>${dd.getDate()}</b></span><span class="kun">${esc(TNAME[p.type])}</span></button>`).join('')}</div></article>`:''}`}
function fullPlanTip(){return `<div class="ktip">${ico('mic')}<span><b>Need to move things around?</b> Tap Dictate and say it, for example "move Thursday's run to Saturday" or "I'm away next weekend". The rest of the plan adjusts around it.</span></div>`}
async function xBoardScan(file){if(!sample){toast('Photo scanning is not available here');return}
  xState.busy=true;xState.msg='Reading the board… up to a minute.';render();
  try{const out=await sample.json(`This is a photo of a gym, Hyrox, CrossFit, strength and conditioning or fitness class workout written on a whiteboard or screen. Read it.
Reply with ONLY JSON: {"title":"short name of the class or format","minutes":estimated total minutes,"effort":estimated effort 1-10 for an average member,"text":"one or two plain sentences listing the work, e.g. 4 rounds: 500 m row, 20 wall balls, 15 burpees"}
If it is not a workout, reply {"title":"","minutes":0,"effort":0,"text":""}.`,{images:file});
    if(!out||!out.text){xState={...xState,busy:false,msg:'Could not read a workout from that photo. Try a straighter, closer photo of the board.'};render();return}
    xState={...xState,busy:false,mode:'class',text:`${out.title?out.title+' class':'Class'}${out.minutes?`, about ${out.minutes} minutes`:''}${out.effort?`, effort about ${out.effort} out of 10`:''}. ${out.text}`.slice(0,600),msg:'Read the board. Check it, change anything, then tap Add it.'};render()}
  catch(e){xState={...xState,busy:false,msg:foodErr(e)};render()}}
document.addEventListener('click',e=>{const x=e.target.closest&&e.target.closest('[data-xmode]');if(x){const t=$('#x-say');if(t)xState.text=t.value;xState.mode=x.dataset.xmode;render()}});
document.addEventListener('change',e=>{const el=e.target;if(el&&el.id==='xBoard'&&el.files&&el.files[0]){const t=$('#x-say');if(t)xState.text=t.value;xBoardScan(el.files[0])}});

// swipe the week strip left or right to move a week, like a calendar
(function(){let x0=null,y0=null;document.addEventListener('touchstart',e=>{const st=e.target.closest&&e.target.closest('.kswipe');if(!st){x0=null;return}x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  document.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5){go(iso(addD(sel,dx<0?7:-7)))}},{passive:true})})();
// ================= Keel v6: header sign-off, coach accordion, section bands =================
let coachOpen=false;
function kSignSet(){const h=document.getElementById('kSign');if(!h)return;let t='';try{t=tab()}catch(e){}
  if(t==='dashboard'&&!sampleMode){h.innerHTML=kTodoChip();return}
  if(t!=='food'||sampleMode){h.innerHTML='';return}const k=iso(sel);if(k>iso(todayDate())){h.innerHTML='';return}const d=D()[k]||{};
  h.innerHTML=d.foodDone?`<button type="button" class="kschip kdone" id="foodUndone" aria-label="Signed off. Tap to undo">${ico('check')}Signed off</button>`
    :`<button type="button" class="kschip${k===iso(todayDate())&&new Date().getHours()>=19?' kdue':''}" id="signOpen">${ico('circle')}Sign off</button>`}
function kBands(){CMPI=0;let t='';try{t=tab()}catch(e){}if(t!=='reports')return;const app=document.getElementById('app');if(!app||app.querySelector('.ksec'))return;
  const kids=[...app.children];let cur=null,n=0;kids.forEach(el=>{if(el.classList&&el.classList.contains('sect')){cur=document.createElement('details');cur.className='ksec p1fold'+(n%2?' alt':'');if(n===0)cur.open=true;n++;const sm=document.createElement('summary');sm.className='sect';sm.textContent=el.textContent;cur.appendChild(sm);app.insertBefore(cur,el);el.remove();return}if(cur)cur.appendChild(el)})}
document.addEventListener('toggle',e=>{if(e.target&&e.target.id==='coachAcc')coachOpen=e.target.open},true);
function coachHTML(aiText,savedAI){const pts=String(aiText||'').split('\n').map(x=>x.trim()).filter(x=>x.startsWith('-')).length;
  return `<details class="kcoach" id="coachAcc" ${coachOpen||aiState.busy?'open':''}><summary><span class="kpic">${ico('sparkles')}</span><span class="kct"><b>Coach's overview</b><small>${aiState.busy?'Reading your last 4 weeks…':aiText?`${pts||'A few'} things worth knowing${savedAI&&!aiState.text?` · ${fmtD(new Date(savedAI.at))}`:''}`:'Your last 4 weeks, read for you'}</small></span><span class="kchev" aria-hidden="true">${ico('chevron-right')}</span></summary>
    <div class="kcbody">${aiState.busy?`<div class="ai" id="aiOut" aria-live="polite">${esc(aiText)||'Thinking…'}</div>`:aiText?ovPointsHTML(aiText):''}${aiState.err?`<div class="alert amber">${esc(aiState.err)}</div>`:''}
    ${sample&&!aiState.busy?`<button type="button" class="kchbtn" id="aiBtn">${aiText?'Refresh overview':'Get my overview'}</button>`:''}</div></details>`}

// ================= Keel v7: to-do in the header, injuries, recover colours =================
function userName(){let n='';try{n=(PROFILE&&PROFILE.answers&&PROFILE.answers.name)||''}catch(e){}if(!n&&typeof OWNER_NAME!=='undefined')n=OWNER_NAME;if(!n){try{if(IS_OWNER)n='Darren'}catch(e){}}if(!n){try{const m=SESSION&&SESSION.user&&SESSION.user.user_metadata;n=(m&&(m.full_name||m.name))||''}catch(e){}}return String(n).trim()}
function todoSheet(open){let h=document.getElementById('tdHost');if(!h){h=document.createElement('div');h.id='tdHost';document.body.appendChild(h)}
  if(!open){h.innerHTML='';document.body.classList.remove('sheet-open');return}const items=dayTodo()||[];
  h.innerHTML=`<div class="kshwrap" id="tdWrap"><div class="ksheet" role="dialog" aria-modal="true" aria-label="To do today"><div class="kshead"><h2>To do today</h2><button type="button" class="x" id="tdX" aria-label="Close">${ico('x')}</button></div>
    ${items.length?`<div class="todolist">${items.map(([t,ok,dsc,attr],i)=>{const tg=attr.startsWith('href')?'a':'button';return `<${tg} ${tg==='button'?'type="button"':''} class="step ${ok?'ok':''}" ${attr} data-todo data-tdclose><span class="sn">${ok?'✓':i+1}</span><span class="st"><b>${esc(t)}</b><small>${esc(dsc)}</small></span><span aria-hidden="true">›</span></${tg}>`}).join('')}</div>`:'<p>Nothing to do right now.</p>'}</div></div>`;document.body.classList.add('sheet-open')}
function kTodoChip(){const items=(typeof dayTodo==='function'&&dayTodo())||[];const left=items.filter(x=>!x[1]).length;
  return `<button type="button" class="kschip ${left?'':'kdone'}" id="tdOpen" aria-label="To do today, ${left} left">${ico(left?'clipboard-list':'check')}${left?`<span class="kbadge">${left}</span>`:''}</button>`}
document.addEventListener('click',e=>{const c=q=>e.target.closest&&e.target.closest(q);
  if(c('#tdOpen')){todoSheet(true);return}if(c('#tdX')||e.target.id==='tdWrap'){todoSheet(false);return}if(c('[data-tdclose]'))todoSheet(false)},true);
// injuries: a niggle doesn't stop you; an injury changes what you can do for a while
function activeInjury(){const t=todayDate(),DD=D();let best=null;
  for(let i=0;i<70;i++){const k=iso(addD(t,-i)),d=DD[k];(d&&d.niggles||[]).forEach(n=>{if(n.kind!=='Injury')return;
    const end=n.offUntil?parse(n.offUntil):addD(parse(k),Math.round((+n.weeks||2)*7));if(end<t)return;if(!best||k>best.since)best={...n,since:k,end}})}return best}
function injuryBanner(){const j=activeInjury();if(!j)return '';const ld=j.load==='0'?'No training':j.load==='50'?'Training at about half':'Training as normal, with care';
  const rehab=j.rehabFrom?` Rehab starts ${fmtD(parse(j.rehabFrom),{weekday:'short',day:'numeric',month:'short'})}.`:'';
  return `<div class="kinj"><span class="kpic">${ico('heart-pulse')}</span><div><b>Injury: ${esc(j.area)}${j.side&&j.side!=='Both'&&j.side!=='-'?' ('+esc(j.side.toLowerCase())+')':''}</b><small>${ld} until ${fmtD(j.end,{weekday:'short',day:'numeric',month:'short'})}.${rehab} ${j.load==='0'?'Swap sessions for walks, mobility and rehab.':j.load==='50'?'Keep sessions shorter and easier: roughly half the time and effort.':''}</small></div></div>`}
// colours for recovery types
const RCC={'Breathe':'var(--k-sky)','Mind':'var(--k-violet)','Move':'var(--k-green)','Hot & cold':'var(--k-amber)','Food':'var(--k-green)','Recovery':'var(--k-pink)','Lifestyle':'var(--k-amber)','Movement':'var(--k-sky)','Sleep':'var(--k-violet)'};
const RQC={'Walk':'var(--k-green)','Easy cycle':'var(--k-green)','Swim':'var(--k-sky)','Sea swim':'var(--k-sky)','Ice bath':'var(--k-sky)','Sauna':'var(--k-amber)','Hot tub':'var(--k-amber)','Loosen-out':'var(--k-green)','Stretch / yoga':'var(--k-violet)','Foam roll':'var(--k-pink)','Massage':'var(--k-pink)','Nap':'var(--k-violet)'};
let CMPI=0;const CMPC=['var(--k-blue)','var(--k-green)','var(--k-pink)','var(--k-amber)','var(--k-violet)','var(--k-sky)','var(--k-clay)'];

document.addEventListener('click',async e=>{if(!(e.target.closest&&e.target.closest('#kNameSave')))return;const v=($('#kNameIn').value||'').trim().slice(0,60);if(!v){toast('Add your name first');return}
  PROFILE.answers=PROFILE.answers||{};PROFILE.answers.name=v;try{await sb.from('profiles').upsert({id:UID,data:PROFILE,updated_at:new Date().toISOString()});toast('Name saved')}catch(err){toast('Could not save. Try again.')}planSheet(false);render()});
const KWM_AUTH='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-338 -1011 2347 1292" role="img" aria-label="keel" class="kwm"><defs><linearGradient id="kauf" gradientUnits="userSpaceOnUse" x1="-298" y1="0" x2="1968" y2="0"><stop offset="0" stop-color="#E23D9E"/><stop offset="0.5" stop-color="#5B6CFF"/><stop offset="1" stop-color="#34E3A0"/></linearGradient></defs><path d="M743.9 -731.0 A569.4 569.4 0 1 0 307.7 204.4 L1932.0 204.4" fill="none" stroke="url(#kauf)" stroke-width="73.0" stroke-linecap="round" class="kl" pathLength="1"/><path d="M459 0 277 -254H196L427 -543H572L359 -276L362 -346L616 0ZM79 0V-730H218V0Z M889.0 19Q819.0 19 766.5 -5.0Q714.0 -29 679.5 -69.5Q645.0 -110 627.5 -160.0Q610.0 -210 610.0 -262V-281Q610.0 -335 627.5 -385.5Q645.0 -436 679.5 -475.5Q714.0 -515 765.0 -538.5Q816.0 -562 883.0 -562Q971.0 -562 1030.5 -523.5Q1090.0 -485 1120.0 -422.5Q1150.0 -360 1150.0 -288V-238H669.0V-323H1063.0L1020.0 -281Q1020.0 -333 1005.0 -370.0Q990.0 -407 959.5 -427.0Q929.0 -447 883.0 -447Q837.0 -447 805.0 -426.0Q773.0 -405 756.5 -365.5Q740.0 -326 740.0 -271Q740.0 -220 756.0 -180.5Q772.0 -141 805.0 -118.5Q838.0 -96 889.0 -96Q940.0 -96 972.0 -116.5Q1004.0 -137 1013.0 -167H1141.0Q1129.0 -111 1095.0 -69.0Q1061.0 -27 1008.5 -4.0Q956.0 19 889.0 19Z M1459.0 19Q1389.0 19 1336.5 -5.0Q1284.0 -29 1249.5 -69.5Q1215.0 -110 1197.5 -160.0Q1180.0 -210 1180.0 -262V-281Q1180.0 -335 1197.5 -385.5Q1215.0 -436 1249.5 -475.5Q1284.0 -515 1335.0 -538.5Q1386.0 -562 1453.0 -562Q1541.0 -562 1600.5 -523.5Q1660.0 -485 1690.0 -422.5Q1720.0 -360 1720.0 -288V-238H1239.0V-323H1633.0L1590.0 -281Q1590.0 -333 1575.0 -370.0Q1560.0 -407 1529.5 -427.0Q1499.0 -447 1453.0 -447Q1407.0 -447 1375.0 -426.0Q1343.0 -405 1326.5 -365.5Q1310.0 -326 1310.0 -271Q1310.0 -220 1326.0 -180.5Q1342.0 -141 1375.0 -118.5Q1408.0 -96 1459.0 -96Q1510.0 -96 1542.0 -116.5Q1574.0 -137 1583.0 -167H1711.0Q1699.0 -111 1665.0 -69.0Q1631.0 -27 1578.5 -4.0Q1526.0 19 1459.0 19Z M1793.0 0V-730H1932.0V0ZM1725.0 -626V-730H1932.0V-626Z" fill="#F4F5F8"/></svg>';
// ================= Keel v8: alcohol from any logged drink; wording for people who don't train =================
const ALC_RX=/\b(wine|prosecco|champagne|cava|beer|lager|ale|stout|guinness|cider|pint|ipa|spirit|vodka|gin|whiske?y|rum|tequila|brandy|baileys|liqueur|cocktail|margarita|mojito|spritz|aperol|sake|soju|shandy|hard seltzer)\b/i;
const ALC_NOT=/\b(alcohol[- ]free|non[- ]alcoholic|0\.0|zero alcohol|0%|ginger beer|root beer|wine gums?|vinegar|cooked in wine|wine sauce|red wine jus)\b/i;
function stdDrinks(x){if(!x)return 0;if(isNum(x.sd)&&+x.sd>0)return +x.sd;const n=String((x.name||'')+' '+(x.qty||''));if(!ALC_RX.test(n)||ALC_NOT.test(n))return 0;
  const q=String(x.qty||'').toLowerCase();const m=q.match(/(\d+(?:\.\d+)?)/);let k=m?+m[1]:1;if(/ml|cl|litre|l\b/.test(q))k=1; // volumes: treat as one serving unless counted
  const nm=n.toLowerCase();let per=/pint/.test(nm)?2:/(beer|lager|ale|stout|guinness|cider|ipa|seltzer|shandy)/.test(nm)?(/can|bottle/.test(nm)?1.4:2):/(prosecco|champagne|cava)/.test(nm)?1.2:/wine/.test(nm)?(/bottle/.test(nm)?7:1.7):/(cocktail|margarita|mojito|spritz|aperol)/.test(nm)?1.8:1;
  if(/bottle/.test(nm)&&/wine/.test(nm))k=1;return Math.round(Math.min(20,k*per)*10)/10}
// Does this person train, or do physical work? Drives wording for everyone else.
function KTRAINS(ans){let a=ans||{};if(!ans){try{a=(PROFILE&&PROFILE.answers)||{}}catch(e){return true}}if(!a||!Object.keys(a).length)return true;
  const sp=[].concat(a.sport||[]);const sporty=sp.some(x=>!/^(Walking|Nothing much yet|Cycling|Other)$/i.test(x));
  const goal=/sport|run faster|hyrox|stronger|muscle/i.test(a.mainGoal||'');return sporty||goal}
function KMANUAL(){let a={};try{a=(PROFILE&&PROFILE.answers)||{}}catch(e){return true}if(!a||!a.job)return true;return /physical|mixed/i.test(a.job)}
const KWORDS=[[/Training load vs manual labour/g,'Activity through the weeks'],[/Training load this week/g,'Activity this week'],[/Training load/g,'Activity'],[/training load/g,'activity'],
  [/Train as planned\./g,'Good day for it.'],[/Train, but cap the effort\./g,'Take it steady today.'],[/Do the session, hold effort a notch below target, skip any extras\./g,'Keep things gentle: an easy walk is plenty, and get to bed on time.'],
  [/Swap for an easy run or the mobility routine and get to bed early\./g,'Go easy: a short walk or a stretch, and an early night.'],[/Recovery looks good\./g,'You\'re well rested.'],
  [/Training day/g,'Active day'],[/training day/g,'active day'],[/Training today/g,'Moving today'],[/training today/g,'moving today'],[/Today's session/g,'Today\'s movement'],
  [/Extra training/g,'Extra activity'],[/Log session/g,'Log it'],[/Your training so far/g,'So far'],[/Other training/g,'Other activity'],[/your training/g,'your activity'],[/Your training/g,'Your activity'],
  [/ and training\b/g,' and activity'],[/^Strain$/g,'Daily effort'],[/Daily strain, 0-21, from training load plus farm work, in the style of Whoop\./g,'Daily effort, 0-21, from everything active you logged.'],[/\btraining\b(?= and sleep)/g,'activity']];
function kWording(root){if(KTRAINS())return;const w=document.createTreeWalker(root||document.getElementById('app'),NodeFilter.SHOW_TEXT);const list=[];let n;while(n=w.nextNode())list.push(n);
  list.forEach(t=>{let v=t.nodeValue,o=v;KWORDS.forEach(([a,b])=>v=v.replace(a,b));if(v!==o)t.nodeValue=v})}
function kHideIrrelevant(){if(KTRAINS())return;const app=document.getElementById('app');if(!app)return;
  app.querySelectorAll('.panel').forEach(p=>{const h=p.querySelector('h3');if(!h)return;const t=h.textContent;
    if(/^(Activity through the weeks|Hyrox classes|5 km tests|Threshold pace|Strength|Plan completion)$/.test(t)&&!(t==='Activity through the weeks'&&KMANUAL()))p.remove()})}

// ================= PROTOTYPE 1 =================
// Home tiles, quick check-in, My day, weather, route planner. Everything here writes the same data
// the frozen Prototype reads, plus a few new fields it simply ignores.
let vForce=null;
const P1={ci:null,day:null};

// ---------- sleep: bed, fell asleep, night wakings, final wake ----------
function p1SleepCalc(d){if(!d)return null;const b=tmin(d.bed),w=tmin(d.wake);if(b==null||w==null)return null;
  const a=b+(+d.latency||0);let x=w-a;if(x<=0)x+=1440;x-=(+d.awakeMin||0);return Math.max(0,Math.round(x/6)/10)}

// ---------- weather from the free Open-Meteo service, by rough location ----------
async function p1Loc(ask){const m=meta.loc;if(m&&isNum(m.lat))return m;if(!ask||!navigator.geolocation)return null;
  return new Promise(res=>navigator.geolocation.getCurrentPosition(async p=>{const loc={lat:Math.round(p.coords.latitude*100)/100,lon:Math.round(p.coords.longitude*100)/100,at:new Date().toISOString()};try{await persistMeta('loc',loc)}catch(e){}res(loc)},()=>res(null),{timeout:12000,maximumAge:3600000}))}
async function p1Weather(k,ask){try{const loc=await p1Loc(ask);if(!loc)return null;
    const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunshine_duration,daylight_duration,wind_speed_10m_max,weather_code&timezone=auto&past_days=3&forecast_days=2`);
    const j=await r.json();const i=(j.daily&&j.daily.time||[]).indexOf(k);if(i<0)return null;const D_=j.daily;
    const w={tmax:Math.round(D_.temperature_2m_max[i]),tmin:Math.round(D_.temperature_2m_min[i]),rain:Math.round(D_.precipitation_sum[i]*10)/10,sunH:Math.round(D_.sunshine_duration[i]/360)/10,dayH:Math.round(D_.daylight_duration[i]/360)/10,wind:Math.round(D_.wind_speed_10m_max[i]),code:D_.weather_code[i]};
    await persistDay(k,{weather:w});return w}catch(e){return null}}
function p1WxWord(w){if(!w)return '';const c=+w.code;const sky=c>=95?'Thunder':c>=71&&c<=86?'Snow':c>=51?'Rain':c>=45?'Fog':c>=3?'Cloudy':c>=1?'Bright spells':'Sunny';
  return `${sky} · ${w.tmin}° to ${w.tmax}°${w.rain>=0.5?` · ${w.rain} mm rain`:''} · ${w.dayH} h daylight`}

// ---------- pop-up sheet host ----------
function p1Sheet(html){let h=document.getElementById('p1Host');if(!h){h=document.createElement('div');h.id='p1Host';document.body.appendChild(h)}
  if(!html){h.innerHTML='';document.body.classList.remove('sheet-open');return}
  h.innerHTML=`<div class="kshwrap" id="p1Wrap"><div class="ksheet p1sheet" role="dialog" aria-modal="true">${html}</div></div>`;document.body.classList.add('sheet-open')}

// ---------- check-in pop-up ----------
const P1SL=[['sleepQ','Sleep quality',['Broken','Restless','Okay','Good','Deep']],['energy','Energy',['Flat','Low','Steady','Good','Buzzing']],['mood','Mood',['Low','Flat','Fine','Good','Great']],
  ['stress','Stress',['Calm','Settled','Busy','Stretched','Overloaded']],['sore','Body',['Fresh','Loose','A bit stiff','Sore','Very sore']]];
const P1LAT=[[0,'Straight away'],[15,'About 15 min'],[30,'About 30 min'],[60,'An hour or more']];
const P1WAKES=[[0,'No'],[1,'Once'],[2,'2 or 3 times'],[4,'On and off all night']];
const P1AWAKE=[[0,'Hardly'],[15,'Under 15 min'],[40,'About 30-45 min'],[90,'1-2 hours'],[180,'Over 2 hours']];
function p1CiOpen(){const k=iso(todayDate()),d=D()[k]||{};const prev=Object.values(D()).filter(x=>x&&x.bed&&x.wake).sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]||{};
  P1.ci={k,bed:d.bed||prev.bed||'23:00',wake:d.wake||prev.wake||'07:00',latency:d.latency??0,wakes:d.wakes??0,awakeMin:d.awakeMin??0,
    sleepQ:d.sleepQ??3,energy:d.energy??3,mood:d.mood??3,stress:d.stress??2,sore:d.sore??2,trainIntent:d.trainIntent||null,busy:false};p1CiDraw()}
function p1Seg(name,opts,cur){return `<div class="seg p1seg">${opts.map(([v,l])=>`<button type="button" data-p1="${name}" data-v="${v}" aria-pressed="${String(cur)===String(v)}">${l}</button>`).join('')}</div>`}
function p1CiDraw(){const c=P1.ci;if(!c)return;const h=p1SleepCalc(c);const p=planFor(parse(c.k));const planned=!!(p&&p.type!=='R'&&!p.pre);
  p1Sheet(`<div class="kshead"><div><h2>Morning check-in</h2><small class="ds">${fmtD(parse(c.k),{weekday:'long',day:'numeric',month:'short'})}</small></div><button type="button" class="x" id="p1X" aria-label="Close">${ico('x')}</button></div>
    <button type="button" class="p1say" id="p1CiSay">${ico('mic')}<span><b>Say it instead</b><small>"Bed at 11, took ages to drop off, up twice, feeling flat, legs sore"</small></span></button>
    <section class="p1blk"><h3>Last night</h3>
      <div class="row2"><div class="field"><label class="label" for="p1bed">Into bed</label><input id="p1bed" type="time" value="${esc(c.bed)}" data-p1in="bed"></div><div class="field"><label class="label" for="p1wake">Woke for good</label><input id="p1wake" type="time" value="${esc(c.wake)}" data-p1in="wake"></div></div>
      <div class="field"><span class="label">Fell asleep</span>${p1Seg('latency',P1LAT,c.latency)}</div>
      <div class="field"><span class="label">Woke in the night</span>${p1Seg('wakes',P1WAKES,c.wakes)}</div>
      ${+c.wakes?`<div class="field"><span class="label">Awake in the night, in total</span>${p1Seg('awakeMin',P1AWAKE,c.awakeMin)}</div>`:''}
      <div class="p1sleep"><b class="num">${h!=null?h:'–'} h</b><span>actual sleep, roughly</span></div></section>
    <section class="p1blk"><h3>How you feel</h3>${P1SL.map(([key,lab,words])=>`<div class="p1sl"><div class="p1slh"><span>${lab}</span><b id="p1w-${key}">${words[(+c[key]||3)-1]}</b></div><input type="range" min="1" max="5" step="1" value="${+c[key]||3}" data-p1sl="${key}" aria-label="${lab}"><div class="p1ends"><span>${words[0]}</span><span>${words[4]}</span></div></div>`).join('')}</section>
    ${planned?`<section class="p1blk"><h3>Today: ${esc(TNAME[p.type])}</h3>${p1Seg('trainIntent',[['yes','Yes, doing it'],['no','Not today']],c.trainIntent)}</section>`:''}
    <a class="p1hurt" href="#checkin" id="p1Hurt">${ico('heart-pulse')} Something hurting? Add a niggle or injury ›</a>
    <button type="button" class="primary p1save" id="p1CiSave" ${c.busy?'disabled':''}>${c.busy?'Saving…':'Save check-in'}</button>
    <small class="ds p1note">Keel also adds yesterday's and today's weather from your rough location, if you allow it.</small>`)}
async function p1CiSave(){const c=P1.ci;c.busy=true;p1CiDraw();const fields={bed:c.bed,wake:c.wake,latency:+c.latency,wakes:+c.wakes,awakeMin:+c.wakes?+c.awakeMin:0,sleepQ:+c.sleepQ,energy:+c.energy,mood:+c.mood,stress:+c.stress,sore:+c.sore,sleepH:p1SleepCalc(c),savedAt:new Date().toISOString()};
  if(c.trainIntent)fields.trainIntent=c.trainIntent;const ok=await persistDay(c.k,fields);P1.ci=null;p1Sheet(null);dDraft=null;render();if(ok!==false)toast('Checked in. Balance updated.');
  p1Weather(c.k,true).then(()=>p1Weather(iso(addD(parse(c.k),-1)),false)).then(()=>render())}

// ---------- My day pop-up ----------
const P1TYPES=['Desk / office','Driving','Farm','Construction / trade','On your feet (shop, care, teaching)','Childcare / family','Housework / garden','Studying','Rest / downtime'];
const P1WHERE=['Indoors, warm','Indoors, cold','Outdoors'];
function p1DayOpen(which){const k=which||(new Date().getHours()<14?iso(addD(todayDate(),-1)):iso(todayDate()));const d=D()[k]||{};
  P1.day={k,tags:(d.dayTags||[]).slice(),blocks:(d.blocks||[]).map(b=>({...b})),text:'',busy:false,msg:''};if(!P1.day.blocks.length)P1.day.blocks=p1UsualBlocks(k);p1DayDraw()}
function p1UsualBlocks(k){const dow=parse(k).getDay();for(let i=7;i<=28;i+=7){const d=D()[iso(addD(parse(k),-i))];if(d&&d.blocks&&d.blocks.length)return d.blocks.map(b=>({...b}))}return []}
function p1DayDraw(){const s=P1.day;if(!s)return;const today=s.k===iso(todayDate());
  const row=(b,i)=>`<div class="p1bk"><div class="p1bkt"><input type="time" value="${esc(b.from||'')}" data-p1b="${i}" data-f="from" aria-label="From"><span>to</span><input type="time" value="${esc(b.to||'')}" data-p1b="${i}" data-f="to" aria-label="To"><button type="button" class="x" data-p1bdel="${i}" aria-label="Remove">${ico('x')}</button></div>
    <select data-p1b="${i}" data-f="type" aria-label="What">${P1TYPES.map(t=>`<option ${t===b.type?'selected':''}>${t}</option>`).join('')}</select>
    <div class="p1bkr"><span class="label">Body</span>${p1Seg('bphys'+i,[['easy','Easy'],['steady','Steady'],['hard','Hard']],b.phys||'easy')}</div>
    <div class="p1bkr"><span class="label">Head</span>${p1Seg('bmind'+i,[['easy','Easy'],['steady','Steady'],['tough','Tough']],b.mind||'easy')}</div>
    <select data-p1b="${i}" data-f="where" aria-label="Where">${P1WHERE.map(t=>`<option ${t===b.where?'selected':''}>${t}</option>`).join('')}</select></div>`;
  p1Sheet(`<div class="kshead"><div><h2>My day</h2><small class="ds">${today?'Today':'Yesterday'}, ${fmtD(parse(s.k),{weekday:'long',day:'numeric',month:'short'})}</small></div><button type="button" class="x" id="p1X" aria-label="Close">${ico('x')}</button></div>
    ${p1Seg('dayWhich',[[iso(addD(todayDate(),-1)),'Yesterday'],[iso(todayDate()),'Today']],s.k)}
    <section class="p1blk"><h3>What kind of day</h3><div class="tags">${DAYTAGS.map(t=>`<button type="button" data-p1tag="${t}" aria-pressed="${s.tags.includes(t)}">${t}</button>`).join('')}</div></section>
    <section class="p1blk"><h3>Say how it went</h3><textarea id="p1-say" placeholder="e.g. 9 to 1 in the car, 2 to 5 at the desk, a tough afternoon, 7 to 9 out on the farm feeding cattle in the rain">${esc(s.text)}</textarea>
      <div class="actions">${typeof speakBtn==='function'?speakBtn('p1-say'):''}<button type="button" class="ghost" id="p1DayFill" ${s.busy?'disabled':''}>${s.busy?'Working…':'Fill in the blocks'}</button></div>${s.msg?`<div class="hsum">${esc(s.msg)}</div>`:''}</section>
    <section class="p1blk"><h3>Your day in blocks</h3><small class="ds">Body is how physical it was; Head is how mentally demanding.</small>${s.blocks.map(row).join('')}<button type="button" class="add" id="p1BAdd">+ Add a block</button></section>
    <button type="button" class="primary p1save" id="p1DaySave">Save my day</button>`)}
function p1Hrs(b){const a=tmin(b.from),z=tmin(b.to);if(a==null||z==null)return 0;let x=z-a;if(x<0)x+=1440;return x/60}
async function p1DaySave(){const s=P1.day;p1ReadBlocks();const blocks=s.blocks.filter(b=>b.from&&b.to);let desk=0,car=0,manual=0,fam=0,hard=0,mind=0;
  blocks.forEach(b=>{const h=p1Hrs(b);if(/Desk|Studying/.test(b.type))desk+=h;else if(/Driving/.test(b.type))car+=h;else if(/Childcare/.test(b.type))fam+=h;else if(/Farm|Construction|On your feet|Housework/.test(b.type))manual+=h;
    if(b.phys==='hard')hard+=h;else if(b.phys==='steady')hard+=h/2;if(b.mind==='tough')mind+=h;else if(b.mind==='steady')mind+=h/2});
  const r=x=>Math.round(x*2)/2;const farm=hard<=0?0:hard<2?1:hard<4?2:hard<7?3:4;
  const fields={dayTags:s.tags,blocks,deskHrs:r(desk),carHrs:r(car),farmHrs:r(manual),familyHrs:r(fam),farm,mindHrs:r(mind)};
  await persistDay(s.k,fields);P1.day=null;p1Sheet(null);render();toast('Day saved');p1Weather(s.k,true).then(()=>render())}
function p1ReadBlocks(){const s=P1.day;if(!s)return;document.querySelectorAll('[data-p1b]').forEach(el=>{const b=s.blocks[+el.dataset.p1b];if(b)b[el.dataset.f]=el.value});const t=$('#p1-say');if(t)s.text=t.value}
async function p1DayFill(){const s=P1.day;p1ReadBlocks();if(!s.text.trim()){toast('Say or type your day first');return}if(!sample){toast('Not available here');return}
  s.busy=true;s.msg='';p1DayDraw();
  try{const out=await sample.json(`Turn this description of someone's day into time blocks. Types must be one of: ${P1TYPES.join('; ')}. "phys" is how physical: easy, steady or hard. "mind" is how mentally demanding: easy, steady or tough (a stressful meeting, a hard deadline or a difficult client is tough). "where": ${P1WHERE.join('; ')}. Use 24-hour HH:MM. Also pick any day kinds that fit from: ${DAYTAGS.join('; ')}.
Description: """${s.text.slice(0,3000)}"""
Reply with JSON: {"tags":[],"blocks":[{"from":"HH:MM","to":"HH:MM","type":"","phys":"","mind":"","where":""}]}`);
    const bl=(out&&Array.isArray(out.blocks)?out.blocks:[]).filter(b=>b&&b.from&&b.to).map(b=>({from:fmtT(tmin(b.from)),to:fmtT(tmin(b.to)),type:P1TYPES.includes(b.type)?b.type:'Desk / office',phys:['easy','steady','hard'].includes(b.phys)?b.phys:'easy',mind:['easy','steady','tough'].includes(b.mind)?b.mind:'easy',where:P1WHERE.includes(b.where)?b.where:P1WHERE[0]}));
    if(bl.length)s.blocks=bl;(out&&out.tags||[]).forEach(t=>{if(DAYTAGS.includes(t)&&!s.tags.includes(t))s.tags.push(t)});s.busy=false;s.msg=bl.length?'Filled in. Check the blocks, then Save.':'Could not pick out times. Try "9 to 1 in the car" style.';p1DayDraw()}
  catch(e){s.busy=false;s.msg=foodErr(e);p1DayDraw()}}

// ---------- Log a session chooser ----------
function p1MoveOpen(){const k=iso(todayDate()),p=planFor(todayDate());const planned=!!(p&&p.type!=='R'&&!p.pre);
  p1Sheet(`<div class="kshead"><h2>Log a session</h2><button type="button" class="x" id="p1X" aria-label="Close">${ico('x')}</button></div>
    <div class="p1opts">${planned?`<button type="button" class="p1opt" data-p1go="planned">${ico('calendar')}<span><b>Today's plan: ${esc(TNAME[p.type])}</b><small>Done, partly done or missed</small></span></button>`:''}
    <button type="button" class="p1opt" data-p1go="extra">${ico('footprints')}<span><b>A walk, run, cycle or class</b><small>Say it, type it, or snap a class board</small></span></button>
    <button type="button" class="p1opt" data-p1go="trace">${ico('waves')}<span><b>Trace the route I did</b><small>Distance and climb worked out from a map</small></span></button>
    <button type="button" class="p1opt" data-p1go="loop">${ico('target')}<span><b>Plan a route</b><small>Get a loop of the distance you want</small></span></button></div>`)}

// ---------- home tiles ----------
function p1TodayLine(k){const p=planFor(parse(k)),d=D()[k]||{},l=L()[k];const ex=(d.extras||[]).length;
  const what=l&&l.status==='done'?`${TNAME[p.type]} done`:ex?`${ex} session${ex>1?'s':''} logged`:p&&p.type!=='R'&&!p.pre?`${TNAME[p.type]}, ${trainTimeFor(k)}`:'Rest day: a walk or a stretch still counts';
  return `<a class="card p1line" href="#training" data-dtab>${ico('calendar')}<span><small class="label">Today</small><b>${esc(what)}</b></span><span aria-hidden="true">›</span></a>${d.weather?`<div class="p1wx">${ico('sun')}<span>${esc(p1WxWord(d.weather))}</span></div>`:''}`}
function p1Tiles(){const k=iso(todayDate()),d=D()[k]||{};const ci=!!(d.sleepQ||d.energy||d.bed);const yd=D()[iso(addD(todayDate(),-1))]||{};const dayDone=!!((yd.blocks||[]).length||(d.blocks||[]).length);
  const t=(id,icon,name,sub,done)=>`<button type="button" class="p1tile${done?' done':''}" data-p1tile="${id}"><span class="p1ti">${ico(done?'check':icon)}</span><b>${name}</b><small>${sub}</small></button>`;
  return `<section class="p1tiles"><h3 class="p1th">Add something</h3><div class="p1grid">
    ${t('ci','sun','Check in',ci?'Done today':'Sleep and how you feel',ci)}${t('food','utensils','Log food','Snap, say or type',false)}
    ${t('day','clipboard-list','My day',dayDone?'Saved':'Work, driving, family',dayDone)}${t('move','footprints','Log a session','Walk, run, class, route',false)}
    ${t('rec','wind','Recover','Breathe or stretch',false)}${t('say','mic','Say anything','Keel sorts it out',false)}</div></section>`}

// ---------- route planner ----------
const RT={mode:'loop',start:null,km:5,kind:'run',hills:'any',loops:[],pick:0,busy:false,msg:'',trace:[],tgeo:null,tkm:0,tclimb:0,tmin:'',map:null,layer:null};
let p1Leaflet=null;
function p1LoadLeaflet(){if(window.L&&window.L.map)return Promise.resolve(window.L);if(p1Leaflet)return p1Leaflet;
  p1Leaflet=new Promise((res,rej)=>{const c=document.createElement('link');c.rel='stylesheet';c.href='/p1/leaflet/leaflet.css';document.head.appendChild(c);
    const s=document.createElement('script');s.src='/p1/leaflet/leaflet.js';s.onload=()=>res(window.L);s.onerror=()=>rej(new Error('map did not load'));document.head.appendChild(s)});return p1Leaflet}
const R_EARTH=6371000;
function p1Dest([lat,lon],brg,m){const d=m/R_EARTH,b=brg*Math.PI/180,f1=lat*Math.PI/180,l1=lon*Math.PI/180;const f2=Math.asin(Math.sin(f1)*Math.cos(d)+Math.cos(f1)*Math.sin(d)*Math.cos(b));
  const l2=l1+Math.atan2(Math.sin(b)*Math.sin(d)*Math.cos(f1),Math.cos(d)-Math.sin(f1)*Math.sin(f2));return [f2*180/Math.PI,l2*180/Math.PI]}
function p1Dist(a,b){const r=Math.PI/180,dl=(b[0]-a[0])*r,dn=(b[1]-a[1])*r;const x=Math.sin(dl/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dn/2)**2;return 2*R_EARTH*Math.asin(Math.sqrt(x))}
async function p1Route(pts,kind){const prof=kind==='cycle'?'routed-bike':'routed-foot';
  const url=`https://routing.openstreetmap.de/${prof}/route/v1/driving/${pts.map(p=>`${p[1].toFixed(5)},${p[0].toFixed(5)}`).join(';')}?overview=full&geometries=geojson`;
  const r=await fetch(url);const j=await r.json();if(!j.routes||!j.routes.length)throw new Error('No route found there');const rt=j.routes[0];
  return {coords:rt.geometry.coordinates.map(c=>[c[1],c[0]]),m:rt.distance}}
function p1Sample(coords,every){const out=[coords[0]];let acc=0;for(let i=1;i<coords.length;i++){acc+=p1Dist(coords[i-1],coords[i]);if(acc>=every){out.push(coords[i]);acc=0}}out.push(coords.at(-1));return out.slice(0,100)}
async function p1Climb(coords){const s=p1Sample(coords,Math.max(60,p1Len(coords)/90));
  const r=await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${s.map(p=>p[0].toFixed(4)).join(',')}&longitude=${s.map(p=>p[1].toFixed(4)).join(',')}`);const j=await r.json();const e=j.elevation||[];
  let up=0;for(let i=1;i<e.length;i++){const d=e[i]-e[i-1];if(d>1)up+=d}return {climb:Math.round(up),lo:Math.round(Math.min(...e)),hi:Math.round(Math.max(...e))}}
function p1Len(c){let m=0;for(let i=1;i<c.length;i++)m+=p1Dist(c[i-1],c[i]);return m}
function p1Repeat(c){const seen=new Map();let rep=0,n=0;const s=p1Sample(c,40);s.forEach((p,i)=>{const key=Math.round(p[0]*2500)+':'+Math.round(p[1]*2500);if(seen.has(key)&&i-seen.get(key)>3)rep++;else seen.set(key,i);n++});return n?rep/n:0}
function p1Effort(km,climb,kind){const eq=km+climb/(kind==='cycle'?250:100);const per=kind==='walk'?0.6:kind==='cycle'?3:1;const x=eq/per;
  const word=x<4?'Easy':x<8?'Moderate':x<14?'Hard':'Very hard';const mins=Math.round(eq*(kind==='walk'?12:kind==='cycle'?2.6:6.2));return {eq:Math.round(eq*10)/10,word,mins}}
async function p1FindLoops(){if(!RT.start){RT.msg='Set a start point first: use your location or tap the map.';p1RouteDraw();return}
  RT.busy=true;RT.msg='Finding loops near you…';RT.loops=[];p1RouteDraw();const target=RT.km*1000;const out=[];
  for(const base of [20,140,260]){try{let r=target/3.3,best=null;
      for(let tries=0;tries<3;tries++){const a=p1Dest(RT.start,base,r),b=p1Dest(RT.start,base+75,r);const rt=await p1Route([RT.start,a,b,RT.start],RT.kind);
        if(!best||Math.abs(rt.m-target)<Math.abs(best.m-target))best=rt;if(Math.abs(rt.m-target)/target<0.08)break;r*=target/rt.m}
      best.rep=p1Repeat(best.coords);try{Object.assign(best,await p1Climb(best.coords))}catch(e){best.climb=null}out.push(best);RT.loops=out.slice();RT.msg=`Found ${out.length} so far…`;p1RouteDraw()}catch(e){}}
  out.sort((x,y)=>(x.rep-y.rep)*2+(RT.hills==='flat'?(x.climb||0)-(y.climb||0):RT.hills==='hilly'?(y.climb||0)-(x.climb||0):0)/100);
  RT.loops=out.filter(x=>x.rep<0.5);if(!RT.loops.length)RT.loops=out;RT.pick=0;RT.busy=false;RT.msg=RT.loops.length?'':'Couldn\'t find a loop from there. Try another start point or distance.';p1RouteDraw()}
async function p1TraceAdd(ll){RT.trace.push(ll);if(RT.trace.length<2){p1RouteDraw();return}RT.busy=true;RT.msg='Measuring…';p1RouteDraw();
  try{const rt=await p1Route(RT.trace,RT.kind);RT.tgeo=rt.coords;RT.tkm=Math.round(rt.m/100)/10;try{const c=await p1Climb(rt.coords);RT.tclimb=c.climb}catch(e){RT.tclimb=null}RT.msg=''}catch(e){RT.msg='Could not follow paths there. Tap a bit closer to a road or track.'}RT.busy=false;p1RouteDraw()}
function routeHTML(){const L0=RT.loops[RT.pick];const eff=L0?p1Effort(L0.m/1000,L0.climb||0,RT.kind):null;const te=RT.tgeo?p1Effort(RT.tkm,RT.tclimb||0,RT.kind):null;
  return `<article class="card p1route"><div class="chead"><div style="flex:1"><h2>Routes</h2><div class="sub">${RT.mode==='loop'?'Pick a distance and Keel suggests loops that start and finish where you are.':'Tap along the route you did. Keel follows the paths and works out the distance and climb.'}</div></div></div>
    <div class="form" style="padding-top:0">${p1Seg('rtmode',[['loop','Suggest a loop'],['trace','Trace my route']],RT.mode)}
    ${p1Seg('rtkind',[['walk','Walk'],['run','Run'],['cycle','Cycle']],RT.kind)}
    ${RT.mode==='loop'?`<div class="row2"><div class="field"><label class="label" for="rtkm">Distance (km)</label><input id="rtkm" type="number" inputmode="decimal" step="0.5" min="1" max="${RT.kind==='cycle'?120:42}" value="${RT.km}"></div><div class="field"><span class="label">Hills</span>${p1Seg('rthills',[['flat','Flat'],['any','Any'],['hilly','Hilly']],RT.hills)}</div></div>`:''}
    <div class="actions"><button type="button" class="ghost" id="rtLoc">${ico('target')} ${RT.start?'Start: your spot':'Use my location'}</button>${RT.mode==='loop'?`<button type="button" class="primary" id="rtGo" ${RT.busy?'disabled':''}>${RT.busy?'Finding…':'Find loops'}</button>`:`<button type="button" class="ghost" id="rtUndo" ${RT.trace.length?'':'disabled'}>Undo last point</button>`}</div>
    <div class="hint" style="font-size:12px;color:var(--muted)">${RT.mode==='loop'?'Or tap the map to set the start, for example where you\'d park.':'Tap your start, then tap along the way. Keel snaps to paths and roads.'}</div>
    ${RT.msg?`<div class="hsum">${esc(RT.msg)}</div>`:''}</div>
    <div id="p1map" class="p1map" aria-label="Map"></div>
    ${RT.mode==='loop'&&RT.loops.length?`<div class="p1loops">${RT.loops.map((x,i)=>{const e=p1Effort(x.m/1000,x.climb||0,RT.kind);return `<button type="button" class="p1loop" data-rtpick="${i}" aria-pressed="${RT.pick===i}"><b>Loop ${i+1}</b><span class="num">${(x.m/1000).toFixed(1)} km</span><span>${x.climb!=null?x.climb+' m climb':'climb unknown'}</span><span>${e.word}, ~${e.mins} min</span></button>`}).join('')}</div>
      ${eff?`<div class="form"><div class="hsum">Effort: <b>${eff.word}</b>, about the same as ${eff.eq} km on the flat. ${L0.climb!=null?`Lowest point ${L0.lo} m, highest ${L0.hi} m.`:''}</div><button type="button" class="primary" id="rtSave">Plan this for today</button></div>`:''}`:''}
    ${RT.mode==='trace'&&RT.tgeo?`<div class="form"><div class="hsum"><b>${RT.tkm} km</b>${RT.tclimb!=null?`, ${RT.tclimb} m climb`:''}. Effort: <b>${te.word}</b>, like ${te.eq} km on the flat.</div><div class="row2"><div class="field"><label class="label" for="rtmin">How long did it take (min)?</label><input id="rtmin" type="number" inputmode="numeric" value="${esc(RT.tmin)}"></div><div class="field"><label class="label" for="rtrpe">How hard (1-10)?</label><input id="rtrpe" type="number" inputmode="numeric" min="1" max="10"></div></div><button type="button" class="primary" id="rtLog">Log this ${RT.kind}</button></div>`:''}
    <div class="ds p1attr">Maps &copy; OpenStreetMap contributors. Routes by OSRM (FOSSGIS). Heights from Open-Meteo.</div></article>`}
function p1RouteDraw(){if(tab()==='training'&&tView==='route'){const keep=window.scrollY;render();window.scrollTo(0,keep)}}
let p1MapTok=0;async function p1MapAfter(){const tok=++p1MapTok;const el=document.getElementById('p1map');if(!el)return;let L;try{L=await p1LoadLeaflet()}catch(e){el.innerHTML='<div class="ds" style="padding:16px">The map could not load. Check your connection.</div>';return}
  if(tok!==p1MapTok||!document.body.contains(el))return;if(RT.map){try{RT.map.remove()}catch(e){}}
  const c=RT.start||(meta.loc?[meta.loc.lat,meta.loc.lon]:[54.3,-8.2]);const m=L.map(el,{zoomControl:true,attributionControl:false}).setView(c,RT.start?14:11,{animate:false});RT.map=m;
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(m);
  if(RT.start)L.circleMarker(RT.start,{radius:7,color:'#F4F5F8',weight:3,fillColor:'#34E3A0',fillOpacity:1}).addTo(m);
  let bb=null;const L0=RT.mode==='loop'?RT.loops[RT.pick]:null;if(L0){const pl=L.polyline(L0.coords,{color:'#5B6CFF',weight:5,opacity:.9}).addTo(m);bb=pl.getBounds()}
  if(RT.mode==='trace'){RT.trace.forEach(p=>L.circleMarker(p,{radius:5,color:'#E23D9E',weight:2,fillOpacity:.8}).addTo(m));if(RT.tgeo){const pl=L.polyline(RT.tgeo,{color:'#E23D9E',weight:5}).addTo(m);bb=pl.getBounds()}}
  setTimeout(()=>{if(tok!==p1MapTok||RT.map!==m)return;try{m.invalidateSize();if(bb)m.fitBounds(bb,{padding:[24,24],animate:false})}catch(e){}},60);
  m.on('click',ev=>{const ll=[ev.latlng.lat,ev.latlng.lng];if(RT.mode==='loop'){RT.start=ll;RT.loops=[];RT.msg='';p1RouteDraw()}else p1TraceAdd(ll)})}

// ---------- events ----------
document.addEventListener('click',async e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(c('#p1X')||e.target.id==='p1Wrap'){P1.ci=null;P1.day=null;p1Sheet(null);return}
  if(x=c('[data-p1tile]')){const id=x.dataset.p1tile;
    if(id==='ci')p1CiOpen();else if(id==='day')p1DayOpen();else if(id==='move')p1MoveOpen();
    else if(id==='food'){sel=todayDate();fView='today';location.hash='food'}else if(id==='rec')location.hash='recover';
    else if(id==='say'){vForce=null;openVoice()}return}
  if(x=c('[data-p1go]')){const g=x.dataset.p1go;p1Sheet(null);sel=todayDate();
    if(g==='planned'){tView='today';location.hash='training';render()}else if(g==='extra'){tView='today';xState.open=true;location.hash='training';render();setTimeout(()=>{const f=$('#x-say');if(f)f.scrollIntoView({block:'center'})},200)}
    else{tView='route';RT.mode=g==='trace'?'trace':'loop';location.hash='training';render()}return}
  if(c('#p1CiSay')){P1.ci=null;p1Sheet(null);vForce='checkin';openVoice();return}
  if(c('#p1CiSave')){p1CiSave();return}
  if(c('#p1Hurt')){p1Sheet(null);return}
  if(c('#p1DaySave')){p1DaySave();return}if(c('#p1DayFill')){p1DayFill();return}
  if(c('#p1BAdd')){p1ReadBlocks();const s=P1.day,last=s.blocks.at(-1);s.blocks.push({from:last?last.to:'09:00',to:'',type:'Desk / office',phys:'easy',mind:'easy',where:P1WHERE[0]});p1DayDraw();return}
  if(x=c('[data-p1bdel]')){p1ReadBlocks();P1.day.blocks.splice(+x.dataset.p1bdel,1);p1DayDraw();return}
  if(x=c('[data-p1tag]')){p1ReadBlocks();toggleIn(P1.day.tags,x.dataset.p1tag);p1DayDraw();return}
  if(x=c('[data-p1]')){const n=x.dataset.p1,v=x.dataset.v;
    if(P1.ci&&['latency','wakes','awakeMin','trainIntent'].includes(n)){P1.ci[n]=n==='trainIntent'?v:+v;p1CiDraw();return}
    if(P1.day&&n==='dayWhich'){p1ReadBlocks();const t=P1.day.text;p1DayOpen(v);P1.day.text=t;p1DayDraw();return}
    if(P1.day&&/^b(phys|mind)\d+$/.test(n)){p1ReadBlocks();const i=+n.replace(/\D/g,''),f=n.startsWith('bphys')?'phys':'mind';P1.day.blocks[i][f]=v;p1DayDraw();return}
    if(n==='rtmode'){RT.mode=v;RT.msg='';p1RouteDraw();return}if(n==='rtkind'){RT.kind=v;RT.loops=[];if(RT.trace.length>1)p1TraceAdd(RT.trace.pop());else p1RouteDraw();return}
    if(n==='rthills'){RT.hills=v;p1RouteDraw();return}}
  if(c('#rtLoc')){if(!navigator.geolocation){RT.msg='Location is not available on this device. Tap the map instead.';p1RouteDraw();return}RT.msg='Finding you…';p1RouteDraw();
    navigator.geolocation.getCurrentPosition(p=>{RT.start=[p.coords.latitude,p.coords.longitude];if(RT.mode==='trace'&&!RT.trace.length)RT.trace=[RT.start];RT.msg='';p1RouteDraw()},()=>{RT.msg='Couldn\'t get your location. Tap the map to set the start.';p1RouteDraw()},{timeout:12000});return}
  if(c('#rtGo')){const k=$('#rtkm');RT.km=Math.max(1,+(k&&k.value)||5);p1FindLoops();return}
  if(x=c('[data-rtpick]')){RT.pick=+x.dataset.rtpick;p1RouteDraw();return}
  if(c('#rtUndo')){RT.trace.pop();RT.tgeo=null;if(RT.trace.length>1)p1TraceAdd(RT.trace.pop());else p1RouteDraw();return}
  if(c('#rtSave')){const L0=RT.loops[RT.pick];const k=iso(todayDate());await persistDay(k,{route:{km:Math.round(L0.m/100)/10,climb:L0.climb,kind:RT.kind,coords:p1Sample(L0.coords,80)}});toast('Route saved for today. Log it when you\'re back.');return}
  if(c('#rtLog')){const mn=+($('#rtmin')||{}).value||0,rpe=+($('#rtrpe')||{}).value||null;RT.tmin=mn;const k=iso(todayDate());const cur=((D()[k]||{}).extras||[]).slice();
    const kindW={walk:'Walk',run:'Run',cycle:'Cycle'}[RT.kind];cur.push(cleanExtra({kind:kindW,dur:mn,rpe,desc:`${kindW} ${RT.tkm} km${RT.tclimb!=null?`, ${RT.tclimb} m climb`:''}`}));
    await persistDay(k,{extras:cur});toast(`${kindW} logged: ${RT.tkm} km${RT.tclimb!=null?`, ${RT.tclimb} m climb`:''}`);RT.trace=[];RT.tgeo=null;tView='today';render();return}
},true);
document.addEventListener('input',e=>{const el=e.target;if(!el)return;
  if(el.dataset&&el.dataset.p1sl&&P1.ci){const k=el.dataset.p1sl,v=+el.value;P1.ci[k]=v;const words=P1SL.find(s=>s[0]===k)[2];const w=document.getElementById('p1w-'+k);if(w)w.textContent=words[v-1];return}
  if(el.dataset&&el.dataset.p1in&&P1.ci){P1.ci[el.dataset.p1in]=el.value;const h=p1SleepCalc(P1.ci);const b=document.querySelector('.p1sleep b');if(b)b.textContent=(h!=null?h:'–')+' h'}});

// ================= P1 v2: food clean-up, hydration, tile menus, better routes =================
Object.assign(ICO,{
  map:'<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
  navigation:'<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  locate:'<line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  mountain:'<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  minus:'<path d="M5 12h14"/>'
});

// ---------- animated bars: each bar grows from where it was last time ----------
const P1W={};
function p1Bar(id,pct,col){const from=P1W[id]!=null?P1W[id]:0;return `<div class="p1tr"><i data-bid="${id}" data-w="${Math.max(0,Math.min(100,pct)).toFixed(1)}" style="width:${from}%;background:${col}"></i></div>`}
function p1Anim(){const els=[...document.querySelectorAll('[data-bid]')];if(!els.length)return;
  requestAnimationFrame(()=>requestAnimationFrame(()=>els.forEach(el=>{el.style.width=el.dataset.w+'%';P1W[el.dataset.bid]=+el.dataset.w})))}
const P1MAC=[['kcal','Calories','var(--o)'],['protein','Protein','var(--s)'],['carbs','Net carbs','var(--e)'],['fat','Fat','var(--x)']];
function p1Ref(k,dt){const tg=nutTarget(k,dt);return tg.hi&&!tg.lo?tg.hi:(tg.t||tg.lo||tg.hi||1)}
function p1FoodBars(t,dt,prefix){
  return `<div class="p1mbs">${P1MAC.map(([k,lab,col])=>{const ref=p1Ref(k,dt),v=t[k]||0,n=NUTS.find(x=>x.k===k);const over=k!=='protein'&&v>ref*1.1;
    return `<div class="p1mb"><div class="p1mbh"><span>${lab}</span><span class="num"><b>${Math.round(v)}</b> of ${Math.round(ref)}${n.u==='kcal'?'':' '+n.u}</span></div>${p1Bar(prefix+k,v/ref*100,over?'var(--bad)':col)}</div>`}).join('')}</div>`}

// ---------- tile menus for Food and Plan ----------
function p1Nav(attr,cur,items){return `<nav class="p1nav">${items.map(([v,ic,l,sub,col])=>`<button type="button" ${attr}="${v}" aria-pressed="${cur===v}" style="--nc:${col}"><span class="p1ni">${ico(ic)}</span><b>${l}</b><small>${sub}</small></button>`).join('')}</nav>`}
function foodSub(){const due=planDue();const k=kitchen().length;
  return p1Nav('data-fview',fView,[['today','utensils','Log','What you ate','var(--k-green)'],['plan','calendar','Meal plan',due==='none'?'Not made yet':due?'Ends today':'Next 3 days','var(--k-amber)'],['kitchen','carrot','My food',k?`${k} item${k===1?'':'s'}`:'Add first','var(--k-pink)']])}
function planNav(cur){return p1Nav('data-pnav',cur,[['today','footprints','Day','Today\'s session','var(--k-blue)'],['plan','calendar','Overview','Your weeks','var(--k-violet)'],['route','map','Routes','Plan a loop','var(--k-green)']])}

// ---------- Food: today ----------
function p1FoodRow(i){const pc=i.pct||100;const tag=i.src==='plan'?' <span class="est">plan</span>':i.src==='alcohol'?' <span class="est">drink</span>':i.est?' <span class="est">est.</span>':'';
  return `<div class="p1fi"><div class="p1fit"><div class="fn">${esc(i.name)}${tag}</div><b class="num">${kcalOf(i)} kcal</b>${sampleMode?'':`<button type="button" class="x" data-del-food="${i.ix}" aria-label="Remove ${esc(i.name)}">${ico('x')}</button>`}</div>
    <div class="p1fib"><span class="fq num">${esc(i.qty||'')}${i.at?' · '+esc(i.at):''}<br>${Math.round(+i.protein||0)}p · ${Math.round(+i.carbs||0)}c · ${Math.round(+i.fat||0)}f</span>${sampleMode?'':`<div class="p1por" role="group" aria-label="Portion"><button type="button" data-fpct="${i.ix}:-25" aria-label="Less">${ico('minus')}</button><span class="num">${pc}%</span><button type="button" data-fpct="${i.ix}:25" aria-label="More">${ico('plus')}</button></div>`}</div></div>`}
function p1MealHTML(m,its){const mt={};['kcal','protein','carbs','fat'].forEach(k=>mt[k]=its.reduce((a,i)=>a+(k==='kcal'?kcalOf(i):(+i[k]||0)),0));const e=(mt.protein*4+mt.carbs*4+mt.fat*9)||1;
  return `<section class="p1meal"><div class="p1mh"><span class="mico" aria-hidden="true">${MICO[m]}</span><b>${m}</b><span class="num">${Math.round(mt.kcal)} kcal</span></div>
    <div class="p1split" aria-hidden="true"><i style="width:${mt.protein*400/e}%;background:var(--s)"></i><i style="width:${mt.carbs*400/e}%;background:var(--e)"></i><i style="width:${mt.fat*900/e}%;background:var(--x)"></i></div>
    <div class="p1mm num"><span style="--c:var(--s)">${Math.round(mt.protein)} g protein</span><span style="--c:var(--e)">${Math.round(mt.carbs)} g carbs</span><span style="--c:var(--x)">${Math.round(mt.fat)} g fat</span></div>
    ${its.map(p1FoodRow).join('')}</section>`}
function foodTodayHTML(dIso){
  const DD=D(),d=DD[dIso]||{date:dIso,food:[]};const t=foodTotals(d),dt=dayTypeFor(dIso),win=mealWindow(d),fh=fastHours(DD,dIso);const pd=planDay(dIso);const due=planDue();const isToday=dIso===iso(todayDate());
  const kEmpty=!kitchen().length&&!sampleMode;const pw=plantsWeek(dIso),pt=plantsOn(d);
  const food=(d.food||[]).map((i,ix)=>({...i,ix}));
  const meals=MEALS.map(m=>{const its=food.filter(i=>i.meal===m);return its.length?p1MealHTML(m,its):''}).join('');
  const pm=pd?(pd.meals||[]).filter(m=>!/fasted/i.test(m.slot||'')):[];const pmDone=pd?(pd.meals||[]).filter((m,ix)=>!/fasted/i.test(m.slot||'')&&planLogged(dIso,ix)).length:0;
  return `${kEmpty?`<button type="button" class="bigcta" data-fview="kitchen"><b>Start here: what food can you get?</b><span>Tap what you have at home, or say where you'll be eating. Meal plans are built from it.</span><em>Add my food ›</em></button>`:''}
  <article class="card p1ftot"><div class="chead"><div style="flex:1;min-width:0"><h2>${isToday?'Today so far':'This day'}</h2><div class="sub">${DAYT[dt].label} targets · ${t.n?`${t.n} item${t.n>1?'s':''}`:'nothing logged yet'}</div></div>${fh!=null?`<span class="kpill" style="--vc:${fh>=targets().fastH?'var(--ok)':'var(--warn)'}">Fasted ${fh} h</span>`:''}</div>
    ${p1FoodBars(t,dt,'d')}${microsHTML(t,dt,dIso)}</article>
  ${foodActionsHTML(dIso)}
  ${meals?`<article class="card p1meals">${meals}</article>`:''}
  ${pd?`<details class="kmore p1pm" ${pmDone<pm.length?'open':''}><summary>From your meal plan · ${pmDone} of ${pm.length} eaten</summary>${planMealsHTML(dIso)}</details>`:''}
  ${isToday&&due&&!kEmpty?`<button type="button" class="rpill" data-fview="plan" style="--vc:var(--warn);width:100%;text-align:left"><b>!</b><span><b>${due==='none'?'Make a meal plan':'Your meal plan ends today'}</b><br><small>Tap to plan the next 3 days.</small></span><span aria-hidden="true">›</span></button>`:''}
  <details class="kmore p1fx"><summary>Drinks, plants and fasting</summary>
    ${drinksHTML(dIso)}${planMismatch(dIso)}${planVsHTML(dIso)}
    <div class="plantrow"><b class="num">${pw.size}</b><span>of ${PLANTS_WEEK} plants in the last 7 days${pt.size?` · today: ${esc([...pt].slice(0,8).join(', '))}${pt.size>8?'…':''}`:''}</span></div>
    <div class="form"><h3>Fasting</h3><div class="row2"><div class="field"><label class="label" for="ffm">First food</label><input id="ffm" type="time" value="${esc(d.firstMeal||(win?fmtT(win.first):''))}" data-food="firstMeal"></div>
      <div class="field"><label class="label" for="flm">Last food</label><input id="flm" type="time" value="${esc(d.lastMeal||(win?fmtT(win.last):''))}" data-food="lastMeal"></div></div>
      <div class="hint" style="font-size:12px;color:var(--muted)">${fh!=null?`Overnight fast into today: <b style="color:var(--fg)">${fh} h</b>.`:'Fasting hours appear once yesterday and today both have food times.'}</div></div>
  </details>`}
// portion up or down on a logged item: the bars move straight away, saving happens in the background
let p1PT=null;
document.addEventListener('click',e=>{const x=e.target.closest&&e.target.closest('[data-fpct]');if(!x)return;e.stopPropagation();e.preventDefault();
  const [ix,dl]=x.dataset.fpct.split(':').map(Number);const k=iso(sel);const cur=clone(days[k]||{food:[]});const it=(cur.food||[])[ix];if(!it)return;
  if(!it.base){it.base={};NK.forEach(q=>{if(isNum(it[q]))it.base[q]=+it[q]});it.base.kcal=kcalOf(it);it.pct=100}
  const np=Math.max(25,Math.min(300,(it.pct||100)+dl));if(np===it.pct)return;it.pct=np;
  NK.forEach(q=>{if(it.base[q]!=null)it[q]=q==='kcal'?Math.round(it.base[q]*np/100):Math.round(it.base[q]*np/10)/10});
  days[k]=cur;const y=window.scrollY;render();window.scrollTo(0,y);clearTimeout(p1PT);p1PT=setTimeout(()=>persistDay(k,{food:days[k].food}),700)},true);

// ---------- photo check: live bars and a slider per item ----------
function p1PRTotals(){const t={};P1MAC.forEach(([k])=>t[k]=0);(PR?PR.items:[]).forEach(x=>{if(x.off)return;const f=x.pct/100;P1MAC.forEach(([k])=>t[k]+=(k==='kcal'?kcalOf(x):(+x[k]||0))*f)});return t}
function p1PRBars(){const k=iso(sel),dt=dayTypeFor(k),so=foodTotals(D()[k]||{}),pl=p1PRTotals();
  return `<div class="p1mbs">${P1MAC.map(([q,lab,col])=>{const ref=p1Ref(q,dt);const a=Math.min(100,(so[q]||0)/ref*100),b=Math.min(100-a,pl[q]/ref*100);
    return `<div class="p1mb"><div class="p1mbh"><span>${lab}</span><span class="num"><b id="prv-${q}">+${Math.round(pl[q])}</b> · day <span id="prd-${q}">${Math.round((so[q]||0)+pl[q])}</span> of ${Math.round(ref)}</span></div><div class="p1tr p1stack"><i class="p1so" style="width:${a}%;background:${col}"></i><i id="prb-${q}" style="width:${b}%;background:${col}"></i></div></div>`}).join('')}</div>`}
function photoReviewHTML(){if(!PR)return '';
  return `<div class="cfwrap" id="prWrap"><div class="cfsheet prsheet" role="dialog" aria-label="Check your plate"><h2>Here's what I see</h2>${PR.seen?`<p class="prseen">${esc(PR.seen)}</p>`:''}
    <div class="p1prtot"><small class="label">This plate, on top of today so far</small>${p1PRBars()}</div>
    <div class="prall"><span>Ate all of it?</span><div class="segmini">${[50,75,100].map(p=>`<button type="button" data-prall="${p}" aria-pressed="${PR.items.every(x=>x.pct===p)}">${p===100?'All':p+'%'}</button>`).join('')}</div></div>
    <div class="pritems">${PR.items.map((x,i)=>`<div class="pritem ${x.off?'off':''}"><div class="prtop"><input type="text" value="${esc(x.name)}" data-prname="${i}" aria-label="Food name"><span class="num" id="prk-${i}">${Math.round(kcalOf(x)*x.pct/100)} kcal</span><button type="button" class="x" data-proff="${i}" aria-label="${x.off?'Add back':'Didn\'t eat this'}">${x.off?'+':'×'}</button></div>
      ${x.off?'':`<div class="p1prsl"><input type="range" min="0" max="150" step="5" value="${x.pct}" data-prsl="${i}" aria-label="How much of ${esc(x.name)}"><b class="num" id="prp-${i}">${x.pct}%</b></div>`}</div>`).join('')}</div>
    <p class="ds" style="margin:0;font-size:12px">A photo estimate can be 20-30% out. Slide each one to what you actually ate.</p>
    <div class="actions"><button type="button" class="ghost" id="prNo" style="flex:1;color:var(--fg)">Cancel</button><button type="button" class="donebtn" id="prYes" ${PR.busy?'disabled':''}>${PR.busy?'Working…':'Log it'}</button></div></div></div>`}
function p1PRLive(){if(!PR)return;const k=iso(sel),dt=dayTypeFor(k),so=foodTotals(D()[k]||{}),pl=p1PRTotals();
  PR.items.forEach((x,i)=>{const a=document.getElementById('prk-'+i),b=document.getElementById('prp-'+i);if(a)a.textContent=Math.round(kcalOf(x)*x.pct/100)+' kcal';if(b)b.textContent=x.pct+'%'});
  P1MAC.forEach(([q])=>{const ref=p1Ref(q,dt);const a=Math.min(100,(so[q]||0)/ref*100);const v=document.getElementById('prv-'+q),dd=document.getElementById('prd-'+q),bb=document.getElementById('prb-'+q);
    if(v)v.textContent='+'+Math.round(pl[q]);if(dd)dd.textContent=Math.round((so[q]||0)+pl[q]);if(bb)bb.style.width=Math.min(100-a,pl[q]/ref*100)+'%'})}
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.prsl!=null&&PR){PR.items[+t.dataset.prsl].pct=+t.value;p1PRLive()}});

// ---------- hydration ----------
function p1WaterTarget(){const k=iso(todayDate()),d=D()[k]||{};let lo=WATER[0];const why=[];
  if(d.weather&&d.weather.tmax>=20){lo+=.5;why.push('a warm day')}
  if((d.blocks||[]).some(b=>b.phys==='hard')){lo+=.5;why.push('hard physical work')}
  const p=planFor(parse(k));if((p&&p.type!=='R'&&!p.pre)||(d.extras||[]).length){lo+=.5;why.push('training')}
  return {lo:Math.min(lo,5),why}}
function p1WaterOpen(){const k=iso(todayDate());const d=D()[k]||{};const w=+d.water||0;const tg=p1WaterTarget();
  p1Sheet(`<div class="kshead"><div><h2>Hydration</h2><small class="ds">Today</small></div><button type="button" class="x" id="p1X" aria-label="Close">${ico('x')}</button></div>
    <div class="p1wbig"><b class="num">${Math.round(w*100)/100}</b><span>of about ${tg.lo} L</span></div>${p1Bar('hyd',w/tg.lo*100,'var(--k-sky)')}
    <div class="p1wbtns">${[[.25,'Glass','glass-water'],[.5,'500 ml','cup-soda'],[.75,'Bottle','milk'],[1,'1 litre','droplets']].map(([v,l,ic])=>`<button type="button" data-p1w="${v}">${ico(ic)}<b>+ ${l}</b></button>`).join('')}</div>
    ${w>0?`<button type="button" class="ghost" data-p1w="-0.25" style="width:100%">Take off a glass</button>`:''}
    <p class="ds" style="font-size:13px;margin:0">${tg.why.length?`A bit more today because of ${tg.why.join(' and ')}. `:''}Tea, coffee and milk count too.</p>`);p1Anim()}
document.addEventListener('click',async e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(x=c('[data-p1tile="water"]')){p1WaterOpen();return}
  if(x=c('[data-p1w]')){const k=iso(todayDate());const d=D()[k]||{};const w=Math.max(0,Math.round(((+d.water||0)+(+x.dataset.p1w))*100)/100);days[k]={...(days[k]||{date:k}),water:w};p1WaterOpen();render();persistDay(k,{water:w});return}
},true);
function p1Tiles(){const k=iso(todayDate()),d=D()[k]||{};const ci=!!(d.sleepQ||d.energy||d.bed);const yd=D()[iso(addD(todayDate(),-1))]||{};const dayDone=!!((yd.blocks||[]).length||(d.blocks||[]).length);
  const w=+d.water||0,tg=p1WaterTarget();const fd=(d.food||[]).length;
  const t=(id,icon,name,sub,done)=>`<button type="button" class="p1tile${done?' done':''}" data-p1tile="${id}"><span class="p1ti">${ico(done?'check':icon)}</span><b>${name}</b><small>${sub}</small></button>`;
  return `<section class="p1tiles"><h3 class="p1th">Add something</h3><div class="p1grid">
    ${t('ci','sun','Check in',ci?'Done today':'Sleep and how you feel',ci)}${t('food','utensils','Log food',fd?`${fd} item${fd>1?'s':''} so far`:'Snap, say or type',false)}
    ${t('day','clipboard-list','My day',dayDone?'Saved':'Work, driving, family',dayDone)}${t('move','footprints','Log a session','Walk, run, class, route',false)}
    ${t('water','droplet','Hydration',w?`${Math.round(w*100)/100} of ${tg.lo} L`:'Tap a glass as you go',w>=tg.lo)}${t('rec','wind','Recover','Breathe or stretch',false)}</div></section>`}

// ---------- routes ----------
Object.assign(RT,{base:'map',q:'',sig:'',mapEl:null,grp:null,tiles:null,tprof:null});
const P1BASE={map:['https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png','abcd',20],hills:['https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png','abc',17]};
const LOOPC=['#5B6CFF','#14B87A','#E8913A'];
async function p1Climb(coords){const s=p1Sample(coords,Math.max(50,p1Len(coords)/95));
  const r=await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${s.map(p=>p[0].toFixed(4)).join(',')}&longitude=${s.map(p=>p[1].toFixed(4)).join(',')}`);const j=await r.json();const e=j.elevation||[];if(!e.length)throw new Error('no heights');
  let up=0,acc=0;const prof=[{d:0,e:e[0]}];for(let i=1;i<e.length;i++){const dd=e[i]-e[i-1];if(dd>1)up+=dd;acc+=p1Dist(s[i-1],s[i]);prof.push({d:acc,e:e[i]})}
  return {climb:Math.round(up),lo:Math.round(Math.min(...e)),hi:Math.round(Math.max(...e)),prof}}
// Cut out dead-end detours: where the path comes back to a point it passed a short while ago, drop the bit in between.
function p1Despur(c){let a=c.slice();for(let pass=0;pass<3;pass++){const tot=p1Len(a);const cum=[0];for(let i=1;i<a.length;i++)cum.push(cum[i-1]+p1Dist(a[i-1],a[i]));
    const out=[];let i=0,changed=false;while(i<a.length){out.push(a[i]);let jump=-1;
      for(let j=a.length-2;j>i+2;j--){const gap=cum[j]-cum[i];if(gap>tot*0.3)continue;if(gap<50)break;if(p1Dist(a[i],a[j])<15){jump=j;break}}
      if(jump>0){i=jump+1;changed=true}else i++}
    a=out;if(!changed)break}return a}
function p1Circle(start,base,r,n){const ctr=p1Dest(start,base,r);const pts=[start];for(let i=1;i<n;i++)pts.push(p1Dest(ctr,(base+180+i*360/n)%360,r));pts.push(start);return pts}
function p1Cells(c){return new Set(p1Sample(c,60).map(p=>Math.round(p[0]*1500)+':'+Math.round(p[1]*1500)))}
async function p1OneLoop(base,target){let r=target/(2*Math.PI*1.25),best=null;
  for(let tries=0;tries<3;tries++){const raw=await p1Route(p1Circle(RT.start,base,r,4),RT.kind);const coords=p1Despur(raw.coords);const m=p1Len(coords);const cand={coords,m};
    if(!best||Math.abs(m-target)<Math.abs(best.m-target))best=cand;if(Math.abs(m-target)/target<0.07)break;r*=Math.min(1.8,Math.max(.55,target/m))}
  best.rep=p1Repeat(best.coords);return best}
async function p1FindLoops(){if(!RT.start){RT.msg='Set a start first: use your location, search a place, or tap the map.';p1RouteDraw();return}
  RT.busy=true;RT.msg='Finding loops near you…';RT.loops=[];RT.pick=0;p1RouteDraw();const target=RT.km*1000;const all=[];const off=Math.random()*60;
  const bases=[0,60,120,180,240,300].map(b=>(b+off)%360);
  for(let i=0;i<bases.length;i+=3){const got=await Promise.all(bases.slice(i,i+3).map(b=>p1OneLoop(b,target).catch(()=>null)));got.forEach(g=>{if(g)all.push(g)});RT.msg=`Checked ${Math.min(i+3,bases.length)} of ${bases.length} directions…`;p1RouteDraw()}
  const ok=all.filter(x=>Math.abs(x.m-target)/target<0.25);const pool=(ok.length?ok:all);
  await Promise.all(pool.map(async x=>{try{Object.assign(x,await p1Climb(x.coords))}catch(e){x.climb=null}}));
  const score=x=>Math.abs(x.m-target)/target*2+x.rep*3+(x.climb==null?0:RT.hills==='flat'?x.climb/(x.m/1000)/15:RT.hills==='hilly'?-x.climb/(x.m/1000)/15:0);
  pool.sort((a,b)=>score(a)-score(b));const pick=[];
  for(const x of pool){x.cells=p1Cells(x.coords);if(pick.every(y=>{let s=0;x.cells.forEach(c=>{if(y.cells.has(c))s++});return s/Math.min(x.cells.size,y.cells.size)<0.6}))pick.push(x);if(pick.length===3)break}
  RT.loops=pick;RT.busy=false;RT.sig='';setTimeout(()=>{const w=document.querySelector('.p1mapwrap');if(w)w.scrollIntoView({behavior:'smooth',block:'start'})},120);RT.msg=pick.length?'':'Couldn\'t find a loop from there. Try a start on a road or track, or another distance.';p1RouteDraw()}
async function p1TraceAdd(ll){RT.trace.push(ll);if(RT.trace.length<2){p1RouteDraw();return}RT.busy=true;RT.msg='Measuring…';p1RouteDraw();
  try{const rt=await p1Route(RT.trace,RT.kind);RT.tgeo=rt.coords;RT.tkm=Math.round(rt.m/100)/10;try{const c=await p1Climb(rt.coords);RT.tclimb=c.climb;RT.tprof=c.prof}catch(e){RT.tclimb=null;RT.tprof=null}RT.msg=''}catch(e){RT.msg='Could not follow paths there. Tap a bit closer to a road or track.'}RT.busy=false;p1RouteDraw()}
function p1Profile(prof,col){if(!prof||prof.length<3)return '';const W=320,H=72;const tot=prof.at(-1).d||1;const es=prof.map(p=>p.e);const lo=Math.min(...es),hi=Math.max(...es);const rng=Math.max(25,hi-lo);
  const x=v=>(v/tot*W).toFixed(1),y=v=>(H-4-(v-lo)/rng*(H-14)).toFixed(1);const line=prof.map((p,i)=>`${i?'L':'M'}${x(p.d)},${y(p.e)}`).join('');
  return `<div class="p1prof"><div class="p1profh"><span>Height along the way</span><span class="num">${Math.round(lo)}-${Math.round(hi)} m</span></div><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="100%" height="${H}" aria-hidden="true"><path d="${line}L${W},${H}L0,${H}Z" fill="${col}" fill-opacity=".2"/><path d="${line}" fill="none" stroke="${col}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg><div class="p1profx num"><span>Start</span><span>${(tot/1000).toFixed(1)} km</span></div></div>`}
function p1GLink(c,kind){const s=p1Sample(c,Math.max(150,p1Len(c)/9));const wp=s.slice(1,-1).slice(0,8);const f=p=>p[0].toFixed(5)+','+p[1].toFixed(5);
  return `https://www.google.com/maps/dir/?api=1&origin=${f(c[0])}&destination=${f(c.at(-1))}&waypoints=${wp.map(f).join('%7C')}&travelmode=${kind==='cycle'?'bicycling':'walking'}`}
function p1Gpx(c,name){const pts=c.map(p=>`<trkpt lat="${p[0].toFixed(6)}" lon="${p[1].toFixed(6)}"></trkpt>`).join('');
  const x=`<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="Keel" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>${name}</name><trkseg>${pts}</trkseg></trk></gpx>`;
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([x],{type:'application/gpx+xml'}));a.download=name.replace(/\W+/g,'-')+'.gpx';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}
function routeHTML(){const L0=RT.loops[RT.pick];const eff=L0?p1Effort(L0.m/1000,L0.climb||0,RT.kind):null;const te=RT.tgeo?p1Effort(RT.tkm,RT.tclimb||0,RT.kind):null;
  const chips=RT.kind==='cycle'?[10,20,30,50]:RT.kind==='walk'?[2,3,5,8]:[3,5,8,10];const lc=LOOPC[RT.pick%3];
  return `<article class="card p1route"><div class="chead"><div style="flex:1"><h2>${RT.mode==='loop'?'Plan a loop':'Trace a route you did'}</h2><div class="sub">${RT.mode==='loop'?'Keel suggests loops that start and finish at the same spot.':'Tap along the way you went. Keel follows the roads and tracks.'}</div></div></div>
    <div class="form" style="padding-top:0">${p1Seg('rtmode',[['loop','Suggest a loop'],['trace','Trace my route']],RT.mode)}
    <div class="field"><span class="label">Start from</span><div class="p1start"><button type="button" class="ghost" id="rtLoc">${ico('locate')} Here</button><input id="rtq" type="search" placeholder="A place, e.g. Glencar Lake" value="${esc(RT.q)}" enterkeyhint="search"><button type="button" class="ghost" id="rtFind" aria-label="Search">${ico('search')}</button></div>
      <div class="hint" style="font-size:12px;color:var(--muted)">${RT.start?'Start set. Tap the map to move it.':'Or tap the map, for example where you\'d park.'}</div></div>
    </div>
    <div class="p1mapwrap"><div id="p1map" class="p1map" aria-label="Map"></div><div class="p1mapctl"><div class="segmini">${[['map','Map'],['hills','Hills']].map(([v,l])=>`<button type="button" data-rtbase="${v}" aria-pressed="${RT.base===v}">${l}</button>`).join('')}</div></div></div>
    <div class="form">    ${p1Seg('rtkind',[['walk','Walk'],['run','Run'],['cycle','Cycle']],RT.kind)}
    ${RT.mode==='loop'?`<div class="field"><span class="label">Distance</span><div class="p1kms">${chips.map(v=>`<button type="button" data-rtkm="${v}" aria-pressed="${+RT.km===v}">${v} km</button>`).join('')}<input id="rtkm" type="number" inputmode="decimal" step="0.5" min="1" max="${RT.kind==='cycle'?120:42}" value="${RT.km}" aria-label="Distance in km"></div></div>
      <div class="field"><span class="label">Hills</span>${p1Seg('rthills',[['flat','Keep it flat'],['any','Don\'t mind'],['hilly','Hills please']],RT.hills)}</div>`:''}
    ${RT.mode==='loop'?`<button type="button" class="primary" id="rtGo" ${RT.busy?'disabled':''}>${RT.busy?'Finding loops…':RT.loops.length?'Find different loops':'Find loops'}</button>`:`<button type="button" class="ghost" id="rtUndo" ${RT.trace.length?'':'disabled'}>Undo last point</button>`}
    ${RT.msg?`<div class="hsum" role="status">${esc(RT.msg)}</div>`:''}</div>
    ${RT.mode==='loop'&&RT.loops.length?`<div class="p1loops">${RT.loops.map((x,i)=>{const e=p1Effort(x.m/1000,x.climb||0,RT.kind);return `<button type="button" class="p1loop" data-rtpick="${i}" aria-pressed="${RT.pick===i}" style="--lc:${LOOPC[i]}"><b>Loop ${i+1}</b><span class="num">${(x.m/1000).toFixed(1)} km</span><span>${x.climb!=null?`${x.climb} m up`:'climb unknown'}</span><span>${e.word}</span></button>`}).join('')}</div>
      ${eff?`<div class="form"><div class="p1rstat"><div><b class="num">${(L0.m/1000).toFixed(1)}</b><small>km</small></div><div><b class="num">${L0.climb!=null?L0.climb:'–'}</b><small>m climb</small></div><div><b class="num">~${eff.mins}</b><small>min</small></div><div><b>${eff.word}</b><small>effort</small></div></div>
        <div class="hint" style="font-size:12px;color:var(--muted)">Effort counts every 100 m of climb as an extra ${RT.kind==='cycle'?'2 km':'1 km'} on the flat, so this is like ${eff.eq} km flat.</div>
        ${p1Profile(L0.prof,lc)}
        <button type="button" class="primary" id="rtSave">Plan this for today</button>
        <div class="row2"><a class="ghost p1btn" href="${p1GLink(L0.coords,RT.kind)}" target="_blank" rel="noopener">${ico('navigation')} Google Maps</a><button type="button" class="ghost p1btn" id="rtGpx">${ico('download')} GPX for a watch</button></div></div>`:''}`:''}
    ${RT.mode==='trace'&&RT.tgeo?`<div class="form"><div class="p1rstat"><div><b class="num">${RT.tkm}</b><small>km</small></div><div><b class="num">${RT.tclimb!=null?RT.tclimb:'–'}</b><small>m climb</small></div><div><b>${te.word}</b><small>effort</small></div></div>${p1Profile(RT.tprof,'#E23D9E')}
      <div class="row2"><div class="field"><label class="label" for="rtmin">Minutes it took</label><input id="rtmin" type="number" inputmode="numeric" value="${esc(RT.tmin)}"></div><div class="field"><label class="label" for="rtrpe">How hard (1-10)</label><input id="rtrpe" type="number" inputmode="numeric" min="1" max="10"></div></div><button type="button" class="primary" id="rtLog">Log this ${RT.kind}</button></div>`:''}
    <div class="ds p1attr">Maps &copy; OpenStreetMap contributors, CARTO, OpenTopoMap. Routes by OSRM. Heights by Open-Meteo. Places by Nominatim.</div></article>`}
function p1SetBase(L){const b=P1BASE[RT.base]||P1BASE.map;if(RT.tiles)RT.map.removeLayer(RT.tiles);RT.tiles=L.tileLayer(b[0],{subdomains:b[1],maxZoom:b[2],detectRetina:true}).addTo(RT.map)}
function p1Pin(L,ll,html,cls){return L.marker(ll,{icon:L.divIcon({className:'p1di',html:`<span class="${cls}">${html}</span>`,iconSize:null}),keyboard:false})}
function p1Along(c,every){const out=[];let acc=0,next=every;for(let i=1;i<c.length;i++){const d=p1Dist(c[i-1],c[i]);while(acc+d>=next){const f=(next-acc)/d;out.push({p:[c[i-1][0]+(c[i][0]-c[i-1][0])*f,c[i-1][1]+(c[i][1]-c[i-1][1])*f],b:p1Brg(c[i-1],c[i]),at:next});next+=every}acc+=d}return out}
function p1Brg(a,b){const r=Math.PI/180;const y=Math.sin((b[1]-a[1])*r)*Math.cos(b[0]*r),x=Math.cos(a[0]*r)*Math.sin(b[0]*r)-Math.sin(a[0]*r)*Math.cos(b[0]*r)*Math.cos((b[1]-a[1])*r);return (Math.atan2(y,x)/r+360)%360}
function p1DrawLayers(L){const m=RT.map,g=RT.grp;g.clearLayers();let bb=null;
  if(RT.mode==='loop'){RT.loops.forEach((x,i)=>{if(i===RT.pick)return;const pl=L.polyline(x.coords,{color:LOOPC[i],weight:4,opacity:.45,dashArray:'6 8'}).addTo(g);pl.on('click',ev=>{L.DomEvent.stopPropagation(ev);RT.pick=i;p1RouteDraw()})});
    const x=RT.loops[RT.pick];if(x){L.polyline(x.coords,{color:'#fff',weight:9,opacity:.95}).addTo(g);const pl=L.polyline(x.coords,{color:LOOPC[RT.pick],weight:5}).addTo(g);bb=pl.getBounds();
      const len=x.m;const step=RT.kind==='cycle'?(len>30000?10000:5000):1000;p1Along(x.coords,step).forEach(k=>{if(len-k.at>step*.4)p1Pin(L,k.p,Math.round(k.at/1000),'p1km').addTo(g)});
      p1Along(x.coords,step/2).filter((a,i)=>i%2===0&&len-a.at>step*.3).slice(0,12).forEach(a=>p1Pin(L,a.p,'<i style="transform:rotate('+Math.round(a.b)+'deg)">▲</i>','p1arr').addTo(g))}}
  if(RT.mode==='trace'){RT.trace.forEach((p,i)=>L.circleMarker(p,{radius:i?5:7,color:'#fff',weight:2,fillColor:'#E23D9E',fillOpacity:1}).addTo(g));if(RT.tgeo){L.polyline(RT.tgeo,{color:'#fff',weight:9,opacity:.95}).addTo(g);const pl=L.polyline(RT.tgeo,{color:'#E23D9E',weight:5}).addTo(g);bb=pl.getBounds()}}
  if(RT.start&&RT.mode==='loop')p1Pin(L,RT.start,'Start','p1pin').addTo(g);
  const sig=[RT.mode,RT.pick,RT.loops.length,RT.loops.map(x=>Math.round(x.m)).join(','),RT.tgeo?RT.tgeo.length:0,RT.start?RT.start.join(','):''].join('|');
  if(sig!==RT.sig){RT.sig=sig;setTimeout(()=>{try{m.invalidateSize();if(bb)m.fitBounds(bb,{padding:[28,28],animate:false});else if(RT.start)m.setView(RT.start,Math.max(m.getZoom(),14),{animate:false})}catch(e){}},40)}
  else setTimeout(()=>{try{m.invalidateSize()}catch(e){}},40)}
function p1MapAfter(){const ph=document.getElementById('p1map');if(!ph)return;
  p1LoadLeaflet().then(L=>{const now=document.getElementById('p1map');if(!now)return;
    if(!RT.mapEl){RT.mapEl=document.createElement('div');RT.mapEl.className='p1map';RT.mapEl.id='p1map';RT.mapEl.setAttribute('aria-label','Map')}
    if(now!==RT.mapEl)now.replaceWith(RT.mapEl);
    if(!RT.map){const c=RT.start||(meta.loc?[meta.loc.lat,meta.loc.lon]:[54.3,-8.2]);const m=L.map(RT.mapEl,{zoomControl:false,attributionControl:false}).setView(c,RT.start?14:11,{animate:false});RT.map=m;
      L.control.zoom({position:'bottomright'}).addTo(m);RT.grp=L.layerGroup().addTo(m);p1SetBase(L);
      m.on('click',ev=>{const ll=[ev.latlng.lat,ev.latlng.lng];if(RT.mode==='loop'){RT.start=ll;RT.loops=[];RT.msg='';p1RouteDraw()}else p1TraceAdd(ll)})}
    p1DrawLayers(L)}).catch(()=>{ph.innerHTML='<div class="ds" style="padding:16px">The map could not load. Check your connection.</div>'})}
async function p1Geo(q){const c=RT.start||(meta.loc?[meta.loc.lat,meta.loc.lon]:null);const vb=c?`&viewbox=${c[1]-1},${c[0]+1},${c[1]+1},${c[0]-1}`:'';
  const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1${vb}&q=${encodeURIComponent(q)}`);const j=await r.json();if(!j.length)throw new Error('none');return [+j[0].lat,+j[0].lon,j[0].display_name]}
document.addEventListener('click',async e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(x=c('[data-rtkm]')){RT.km=+x.dataset.rtkm;p1RouteDraw();return}
  if(x=c('[data-rtbase]')){RT.base=x.dataset.rtbase;if(RT.map&&window.L)p1SetBase(window.L);document.querySelectorAll('[data-rtbase]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.rtbase===RT.base));return}
  if(c('#rtFind')){const q=(($('#rtq')||{}).value||'').trim();RT.q=q;if(!q)return;RT.msg='Looking that up…';p1RouteDraw();
    try{const g=await p1Geo(q);RT.start=[g[0],g[1]];RT.loops=[];RT.msg='Start set: '+String(g[2]).split(',').slice(0,2).join(',');if(RT.mode==='trace'){RT.trace=[RT.start];RT.tgeo=null}}catch(err){RT.msg='Couldn\'t find that place. Try a nearby town, or tap the map.'}p1RouteDraw();return}
  if(c('#rtGpx')){const L0=RT.loops[RT.pick];if(L0)p1Gpx(L0.coords,`Keel ${RT.kind} ${(L0.m/1000).toFixed(1)} km`);return}
},true);
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='rtq'){e.preventDefault();const b=$('#rtFind');if(b)b.click()}});
document.addEventListener('change',e=>{if(e.target&&e.target.id==='rtkm'){RT.km=Math.max(1,+e.target.value||5)}});
// Effort: every 100 m of climb counts as 1 km extra on foot, 2 km extra on a bike.
function p1Effort(km,climb,kind){const eq=km+climb/(kind==='cycle'?50:100);const per=kind==='walk'?0.6:kind==='cycle'?3:1;const x=eq/per;
  const word=x<4?'Easy':x<8?'Moderate':x<14?'Hard':'Very hard';const mins=Math.round(eq*(kind==='walk'?12:kind==='cycle'?2.6:6.2));return {eq:Math.round(eq*10)/10,word,mins}}

// ================= analytics =================
function sRPE(l){return l&&l.status!=='missed'&&l.dur&&l.rpe?l.dur*l.rpe:0}
function extrasLoad(d){return (d&&d.extras||[]).reduce((a,x)=>a+((+x.dur||0)*(+x.rpe||0)),0)}
function dayLoad(dIso){return sRPE(L()[dIso])+extrasLoad(D()[dIso])}
function lineChart(points,{h=150,fmtY=v=>v,invert=false,color='var(--hi)',yMin=null,yMax=null,pad=0}={}){
  if(points.length<2)return '<div class="hint">Needs at least two entries.</div>';
  const W=380,H=h,l=40,r=12,t=14,b=22;const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
  let x0=Math.min(...xs),x1=Math.max(...xs);if(x0===x1){x0-=1;x1+=1}
  let y0=yMin??Math.min(...ys)-pad,y1=yMax??Math.max(...ys)+pad;if(y0===y1){y0-=1;y1+=1}
  const X=x=>l+(x-x0)/(x1-x0)*(W-l-r),Y=y=>invert?t+(y-y0)/(y1-y0)*(H-t-b):H-b-(y-y0)/(y1-y0)*(H-t-b);
  let g='';for(let i=0;i<=3;i++){const yv=y0+(y1-y0)*i/3;g+=`<line class="grid" x1="${l}" x2="${W-r}" y1="${Y(yv)}" y2="${Y(yv)}"/><text class="ax" x="${l-6}" y="${Y(yv)+3}" text-anchor="end">${fmtY(yv)}</text>`}
  const path=points.map((p,i)=>(i?'L':'M')+X(p.x).toFixed(1)+','+Y(p.y).toFixed(1)).join('');
  const base=invert?t:H-b;const area=path+`L${X(xs[xs.length-1]).toFixed(1)},${base}L${X(xs[0]).toFixed(1)},${base}Z`;const last=points[points.length-1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${g}${invert?'':`<path d="${area}" style="fill:${color};opacity:.12"/>`}<path d="${path}" style="fill:none;stroke:${color};stroke-width:2.5;stroke-linejoin:round"/>${points.length<40?points.map(p=>`<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="2.6" style="fill:${color}"/>`).join(''):''}<circle cx="${X(last.x)}" cy="${Y(last.y)}" r="5.5" style="fill:var(--surface);stroke:${color};stroke-width:2.5"/><text class="ax" x="${Math.min(X(last.x),W-r-6)}" y="${Math.max(Y(last.y)-10,10)}" text-anchor="end" style="fill:var(--fg);font-weight:600;font-size:12px">${fmtY(last.y)}</text><text class="ax" x="${l}" y="${H-5}">${points[0].lab||''}</text><text class="ax" x="${W-r}" y="${H-5}" text-anchor="end">${last.lab||''}</text></svg>`;
}
function weeklyChart(wkNow){
  const LL=L(),DD=D();const W=380,H=210,l=36,r=36,t=14,b=26,bw=(W-l-r)/16;const data=[];let mx=0,mxF=0;
  for(let w=1;w<=16;w++){const seg={};let tot=0,farm=0,farmN=0;const mon=addD(START,(w-1)*7);
    for(let i=0;i<7;i++){const k=iso(addD(mon,i));const lg=LL[k];const v=sRPE(lg);if(v){seg[lg.type]=(seg[lg.type]||0)+v;tot+=v}const e=extrasLoad(DD[k]);if(e){seg.O=(seg.O||0)+e;tot+=e}const dd=DD[k];if(dd&&isNum(dd.farmHrs)){farm+=+dd.farmHrs;farmN++}}
    data.push({seg,tot,farm,farmN});mx=Math.max(mx,tot);mxF=Math.max(mxF,farm)}
  const top=Math.ceil(Math.max(mx,1000)/500)*500,topF=Math.max(10,Math.ceil(mxF/10)*10);
  const Y=v=>H-b-v/top*(H-t-b),YF=v=>H-b-v/topF*(H-t-b);
  let g='';for(let i=0;i<=4;i++){const v=top*i/4;g+=`<line class="grid" x1="${l}" x2="${W-r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${l-5}" y="${Y(v)+3}" text-anchor="end">${v>=1000?(v/1000)+'k':v}</text><text class="ax" x="${W-r+5}" y="${Y(v)+3}" style="fill:var(--farm)">${Math.round(topF*i/4)}h</text>`}
  let bars='',fpts=[];
  data.forEach((d,i)=>{const x=l+i*bw+3,w=i+1;let acc=0;['S','E','H','T','X','O'].forEach(k=>{const v=d.seg[k];if(!v)return;const y1=Y(acc),y2=Y(acc+v);bars+=`<rect x="${x}" y="${y2}" width="${bw-6}" height="${Math.max(0,y1-y2)}" style="fill:var(${TVAR[k]})"/>`;acc+=v});
    bars+=`<text class="ax" x="${x+(bw-6)/2}" y="${H-12}" text-anchor="middle" style="${w===wkNow?'fill:var(--fg);font-weight:700':''}">${w}</text>`;
    if(DELOAD[w])bars+=`<text class="ax" x="${x+(bw-6)/2}" y="${H-2}" text-anchor="middle" style="font-size:12px">${w===12?'T':'D'}</text>`;
    if(d.farmN)fpts.push([x+(bw-6)/2,YF(d.farm)])});
  const fl=fpts.length>1?`<path d="${fpts.map((p,i)=>(i?'L':'M')+p[0]+','+p[1]).join('')}" style="fill:none;stroke:var(--farm);stroke-width:2;stroke-dasharray:5 3"/>`:'';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Weekly training load and farm hours">${g}${bars}${fl}${fpts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3" style="fill:var(--farm)"/>`).join('')}</svg>`;
}
function compareRow(q,aLab,a,bLab,b,unit,goodHigh,fmt){
  fmt=fmt||(v=>v.toFixed(1));
  if(a.length<3||b.length<3)return `<div class="cmp"><span class="q">${q}</span><span class="v">Needs at least 3 days of each (${a.length} and ${b.length} so far).</span></div>`;
  const A=avg(a),B=avg(b),mx=Math.max(A,B)||1;const diff=A-B;const better=goodHigh?diff>0:diff<0;
  const bar=(lab,v,n,c)=>`<div class="bar" style="--c:${c}"><span>${lab}</span><div class="tr"><div class="fl" style="width:${(v/mx*100).toFixed(0)}%"></div></div><span class="pct num">${fmt(v)}${unit}</span></div>`;
  const rel=Math.abs(diff)/(Math.max(Math.abs(B),.01));
  const verdict=rel<.05?'Little difference so far.':`${aLab} ${better?'better':'worse'} by ${fmt(Math.abs(diff))}${unit}.`;
  return `<div class="cmp"><span class="q">${q}</span>${(()=>{const cc=CMPC[CMPI++%CMPC.length];return bar(aLab,A,a.length,cc)+bar(bLab,B,b.length,`color-mix(in srgb,${cc} 40%,var(--surface))`)})()}<span class="v"><b>${verdict}</b> Based on ${a.length} and ${b.length} days.</span></div>`;
}
function hyroxAnalysis(){
  const cats={},regs={};let classes=0,runM=0;
  Object.values(L()).forEach(l=>{if(l.hyrox&&l.hyrox.items&&l.hyrox.items.length&&l.status!=='missed'){classes++;runM+=+l.hyrox.runM||0;l.hyrox.items.forEach(i=>{cats[i.category||'Other']=(cats[i.category||'Other']||0)+1;(i.regions||[]).forEach(r=>regs[r]=(regs[r]||0)+1)})}});
  if(!classes)return '<div class="hint">Scan the board at your next Hyrox class and this shows which movements and body regions the classes load most.</div>';
  const top=(o,n)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n);const mc=Math.max(...Object.values(cats)),mr=Math.max(...Object.values(regs),1);
  return `<div class="hint">${classes} class${classes>1?'es':''} scanned · about ${(runM/1000).toFixed(1)} km of running in them.</div>
   <div class="label">Most frequent movements</div><div class="bars">${top(cats,6).map(([k,v])=>`<div class="bar" style="--c:var(--h)"><span>${esc(k)}</span><div class="tr"><div class="fl" style="width:${v/mc*100}%"></div></div><span class="pct num">${v}×</span></div>`).join('')}</div>
   <div class="label" style="margin-top:8px">Body regions loaded</div><div class="bars">${top(regs,8).map(([k,v])=>`<div class="bar" style="--c:var(--o)"><span>${esc(k)}</span><div class="tr"><div class="fl" style="width:${v/mr*100}%"></div></div><span class="pct num">${v}</span></div>`).join('')}</div>`;
}
function nextDay(map,k){return map[iso(addD(parse(k),1))]}
function correlations(){
  const DD=D(),LL=L(),T=targets();const keys=Object.keys(DD).sort();
  const g=()=>[[],[]];const c={sleep:g(),screen:g(),sun:g(),caf:g(),meal:g(),prot:g(),fast:g(),farm:g(),sit:g(),fam:g(),ready:g()};
  keys.forEach(k=>{const d=DD[k],n=nextDay(DD,k);const sh=sleepHours(d),sg=screenGap(d);
    if(sh!=null&&isNum(d.energy))c.sleep[sh>=7?0:1].push(+d.energy);
    if(sg!=null&&isNum(d.sleepQ))c.screen[sg>=60?0:1].push(+d.sleepQ);
    if(n&&isNum(n.sleepQ)){
      if(Array.isArray(d.habits)&&dayFilled(d))c.sun[has(d,'Saw sunrise')?0:1].push(+n.sleepQ);
      const lc=lastCaffeineOf(d);if(lc!=null||(d.food||[]).length)c.caf[lc!=null&&lc>=14*60?1:0].push(+n.sleepQ);
      const w=mealWindow(d),bed=tmin(n.bed);if(w&&bed!=null){let gap=bed-w.last;if(gap<-600)gap+=1440;c.meal[gap<120?1:0].push(+n.sleepQ)}}
    if(n&&isNum(n.energy)&&(d.food||[]).length)c.prot[foodTotals(d).protein>=nutTarget('protein',dayTypeFor(k)).lo?0:1].push(+n.energy);
    {const fh=fastHours(DD,k);if(fh!=null&&isNum(d.energy))c.fast[fh>=T.fastH?0:1].push(+d.energy)}
    if(n&&isNum(d.farm)&&isNum(n.sore)){if(d.farm>=3)c.farm[0].push(+n.sore);else if(d.farm<=1)c.farm[1].push(+n.sore)}
    if(n&&(isNum(d.deskHrs)||isNum(d.carHrs))){const r=readiness(n);if(r!=null)c.sit[(+d.deskHrs||0)+(+d.carHrs||0)>=4?1:0].push(r)}
    if(n&&isNum(d.familyHrs)&&isNum(n.mood))c.fam[d.familyHrs>=1?0:1].push(+n.mood);
    const r=readiness(d),l=LL[k];if(r!=null&&l)c.ready[r>=75?0:1].push(l.status==='done'?100:l.status==='partial'?50:0);
  });
  const i0=v=>v.toFixed(0);
  return compareRow('Energy after 7 h+ in bed vs less','7 h+',c.sleep[0],'Under 7 h',c.sleep[1],'/5',true)+
   compareRow('Sleep quality when screens go off 60+ min before bed','60+ min',c.screen[0],'Less',c.screen[1],'/5',true)+
   compareRow('Sleep quality the night after seeing the sunrise','Saw sunrise',c.sun[0],'Didn\'t',c.sun[1],'/5',true)+
   compareRow('Sleep quality after caffeine past 2 pm','Before 2 pm / none',c.caf[0],'After 2 pm',c.caf[1],'/5',true)+
   compareRow('Sleep quality after eating within 2 h of bed','2 h+ gap',c.meal[0],'Late meal',c.meal[1],'/5',true)+
   compareRow('Next-day energy after hitting your protein target','Hit',c.prot[0],'Missed',c.prot[1],'/5',true)+
   compareRow('Energy after reaching your overnight fast target','Target met',c.fast[0],'Shorter',c.fast[1],'/5',true)+
   compareRow('Next-day soreness after heavy farm days','Heavy days',c.farm[0],'Light / rest',c.farm[1],'/5',false)+
   compareRow('Next-day balance after 4 h+ sitting (desk + car)','Under 4 h',c.sit[0],'4 h+',c.sit[1],'',true,i0)+
   compareRow('Next-morning mood after 1 h+ quality family time','1 h+',c.fam[0],'Less',c.fam[1],'/5',true)+
   compareRow('Sessions done when balance is 75+','Balance 75+',c.ready[0],'Under 75',c.ready[1],'%',true,i0);
}
function injuryAnalysis(){
  const DD=D(),keys=Object.keys(DD).sort();const by={};const onsets=[];
  keys.forEach(k=>{(DD[k].niggles||[]).forEach(n=>{const a=n.area;by[a]=by[a]||{days:0,max:0,last:k,sides:{}};by[a].days++;by[a].max=Math.max(by[a].max,+n.pain||0);by[a].last=k;by[a].sides[n.side]=1;
    const prev=DD[iso(addD(parse(k),-1))];const had=prev&&(prev.niggles||[]).some(p=>p.area===a);if(!had&&(+n.pain||0)>=2)onsets.push({k,a,p:+n.pain||0,note:n.note})})});
  const areas=Object.entries(by).sort((a,b)=>b[1].days-a[1].days);
  if(!areas.length)return {table:'<div class="hint">No niggles logged. Keep flagging anything that hurts, even at 1-2/10, so patterns show early.</div>',lead:''};
  const table=`<div class="scroll"><table class="tbl"><thead><tr><th>Area</th><th class="r">Days</th><th class="r">Worst</th><th class="r">Last</th></tr></thead><tbody>${areas.map(([a,v])=>`<tr><td>${esc(a)} <span style="color:var(--muted);font-size:11px">${Object.keys(v.sides).join('/')}</span></td><td class="r num">${v.days}</td><td class="r num" style="color:${v.max>=5?'var(--bad)':v.max>=3?'var(--warn)':'inherit'};font-weight:600">${v.max}/10</td><td class="r">${short(parse(v.last))}</td></tr>`).join('')}</tbody></table></div>`;
  const win=k=>{const o={load:0,sleep:[],farm:[],sit:[],read:[]};for(let i=1;i<=3;i++){const kk=iso(addD(parse(k),-i)),d=DD[kk];o.load+=dayLoad(kk);if(d){const sh=sleepHours(d);if(sh!=null)o.sleep.push(sh);if(isNum(d.farm))o.farm.push(+d.farm);if(isNum(d.deskHrs)||isNum(d.carHrs))o.sit.push((+d.deskHrs||0)+(+d.carHrs||0));const r=readiness(d);if(r!=null)o.read.push(r)}}return o};
  const agg=list=>({load:avg(list.map(w=>w.load)),sleep:avg(list.flatMap(w=>w.sleep)),farm:avg(list.flatMap(w=>w.farm)),sit:avg(list.flatMap(w=>w.sit)),read:avg(list.flatMap(w=>w.read))});
  const pre=agg(onsets.map(o=>win(o.k))),all=agg(keys.slice(3).map(k=>win(k)));
  const f=(v,d)=>v==null?'-':v.toFixed(d);const flag=(a,b,hi)=>a!=null&&b!=null&&(hi?a>b*1.1:a<b*0.95)?' style="color:var(--warn);font-weight:700"':'';
  const row=(lab,a,b,d,hi)=>`<tr><td>${lab}</td><td class="r num"${flag(a,b,hi)}>${f(a,d)}</td><td class="r num">${f(b,d)}</td></tr>`;
  const lead=onsets.length?`<div class="scroll"><table class="tbl"><thead><tr><th>3 days before</th><th class="r">A niggle</th><th class="r">Typical</th></tr></thead><tbody>
    ${row('Training load',pre.load,all.load,0,true)}${row('Sleep (h / night)',pre.sleep,all.sleep,1,false)}${row(`${WORK} workload (0-4)`,pre.farm,all.farm,1,true)}${row('Sitting, desk + car (h / day)',pre.sit,all.sit,1,true)}${row('Balance',pre.read,all.read,0,false)}</tbody></table></div>
    <div class="hint">Based on ${onsets.length} new niggle${onsets.length>1?'s':''}. Orange marks where the lead-up was clearly worse than usual.</div>
    <div class="flags">${onsets.slice(-5).reverse().map(o=>`<div><span class="pv num" style="color:${o.p>=5?'var(--bad)':o.p>=3?'var(--warn)':'var(--muted)'}">${o.p}/10</span><span><b>${short(parse(o.k))}</b> · ${esc(o.a)}${o.note?' · '+esc(o.note):''}</span></div>`).join('')}</div>`:'';
  return {table,lead};
}
function sleepTimingChart(now){
  const DD=D();const W=380,H=200,l=40,r=8,t=10,b=22,N=28,bw=(W-l-r)/N;const y0=20*60,y1=33*60; // 20:00 to 09:00 next day
  const Y=m=>t+(m-y0)/(y1-y0)*(H-t-b);const norm=m=>m<12*60?m+1440:m;
  let g='';for(let h=20;h<=33;h+=2){const m=h*60;g+=`<line class="grid" x1="${l}" x2="${W-r}" y1="${Y(m)}" y2="${Y(m)}"/><text class="ax" x="${l-6}" y="${Y(m)+3}" text-anchor="end">${pad(h%24)}:00</text>`}
  let bars='',beds=[],wakes=[];
  for(let i=N-1;i>=0;i--){const d=addD(now,-i),dd=DD[iso(d)],x=l+(N-1-i)*bw;const b0=tmin(dd&&dd.bed),w0=tmin(dd&&dd.wake);
    if(b0!=null&&w0!=null){const bb=norm(b0),ww=norm(w0)<=bb?norm(w0)+1440:norm(w0);const q=isNum(dd.sleepQ)?dd.sleepQ:3;
      bars+=`<rect x="${x+1.5}" y="${Y(Math.max(bb,y0))}" width="${bw-3}" height="${Math.max(2,Y(Math.min(ww,y1))-Y(Math.max(bb,y0)))}" rx="2" style="fill:var(--s);opacity:${.35+q*.13}"/>`;beds.push(bb);wakes.push(ww);
      const sg=screenGap(dd);if(sg!=null){const so=bb-sg;bars+=`<line x1="${x+2}" x2="${x+bw-2}" y1="${Y(Math.max(so,y0))}" y2="${Y(Math.max(so,y0))}" style="stroke:var(--warn);stroke-width:2"/>`}}
    if(i%7===0)bars+=`<text class="ax" x="${x+bw/2}" y="${H-6}" text-anchor="middle">${short(d)}</text>`}
  const sd=a=>{if(a.length<3)return null;const m=avg(a);return Math.sqrt(avg(a.map(v=>(v-m)**2)))};
  const sb=sd(beds.slice(-14)),sw=sd(wakes.slice(-14));
  return {svg:`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Bed and wake times">${g}${bars}</svg>`,
    stats:beds.length?`<div class="tests"><div><b class="num">${fmtT(avg(beds.slice(-7)))}</b><small>Avg bedtime, 7 days</small></div><div><b class="num">${fmtT(avg(wakes.slice(-7)))}</b><small>Avg wake, 7 days</small></div><div><b class="num" style="color:${sb!=null&&sb<=30?'var(--ok)':'var(--warn)'}">${sb!=null?'±'+Math.round(sb):'-'}</b><small>Bedtime spread (min)</small></div></div>`:''};
}
function timeUseChart(now){
  const DD=D(),LL=L();const W=380,H=200,l=30,r=6,t=10,b=22,N=8,bw=(W-l-r)/N;
  const keys=[['sleep','var(--x)','Sleep',(d,k)=>sleepHours(d)||0],['train','var(--h)','Training',(d,k)=>{const lg=LL[k];return ((lg&&lg.status!=='missed'&&+lg.dur)||0)/60+(d.extras||[]).reduce((a,x)=>a+(+x.dur||0),0)/60}],['farmHrs','var(--farm)',typeof WORK!=='undefined'?WORK:'Manual labour',d=>+d.farmHrs||0],['deskHrs','var(--s)','Desk',d=>+d.deskHrs||0],['carHrs','var(--o)','Car',d=>+d.carHrs||0],['familyHrs','var(--e)','Family',d=>+d.familyHrs||0]];
  const weeks=[];for(let i=N-1;i>=0;i--){const end=addD(now,-i*7);const sums={};let n=0;for(let j=0;j<7;j++){const k=iso(addD(end,-j)),d=DD[k];if(d&&(dayFilled(d)||sleepHours(d)!=null)){n++;keys.forEach(([key,,,f])=>sums[key]=(sums[key]||0)+f(d,k))}}weeks.push({end,n,avg:Object.fromEntries(keys.map(([key])=>[key,n?(sums[key]||0)/n:0]))})}
  const mx=Math.max(12,...weeks.map(w=>keys.reduce((a,[key])=>a+w.avg[key],0)));const top=Math.ceil(mx/6)*6;const Y=v=>H-b-v/top*(H-t-b);
  let g='';for(let i=0;i<=top/6;i++){const v=i*6;g+=`<line class="grid" x1="${l}" x2="${W-r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${l-5}" y="${Y(v)+3}" text-anchor="end">${v}h</text>`}
  let bars='';weeks.forEach((w,i)=>{const x=l+i*bw+4;let acc=0;if(w.n)keys.forEach(([key,c])=>{const v=w.avg[key];if(!v)return;bars+=`<rect x="${x}" y="${Y(acc+v)}" width="${bw-8}" height="${Y(acc)-Y(acc+v)}" style="fill:${c}"/>`;acc+=v});bars+=`<text class="ax" x="${x+(bw-8)/2}" y="${H-6}" text-anchor="middle">${short(addD(w.end,-6))}</text>`});
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Average hours per day">${g}${bars}</svg><div class="legend">${keys.map(([,c,lab])=>`<span style="--c:${c}"><i></i>${lab}</span>`).join('')}</div>`;
}
function habitGrid(now){
  const DD=D();const rows=[['Saw sunrise',d=>has(d,'Saw sunrise')],['Read',d=>has(d,'Read')],['Learned something',d=>has(d,'Learned something')],['Breathwork',d=>has(d,'Breathwork / meditation')],['Screens off 60+ min',d=>{const s=screenGap(d);return s!=null&&s>=60}],['Family time 1 h+',d=>isNum(d.familyHrs)&&d.familyHrs>=1],['Mobility / stretch',d=>has(d,'Mobility / stretch')]];
  const N=14;let h=`<div class="hgrid2">`;
  const HCOL=['var(--k-amber)','var(--k-sky)','var(--k-violet)','var(--k-pink)','var(--k-blue)','var(--k-green)','var(--k-clay)'];rows.forEach(([lab,fn],ri)=>{let cells='',n=0,tot=0;for(let i=N-1;i>=0;i--){const d=DD[iso(addD(now,-i))];const ok=d?!!fn(d):false;if(d){tot++;if(ok)n++}cells+=`<i class="${d?(ok?'on':'off'):''}"></i>`}
    h+=`<div class="hrow" style="--hcc:${HCOL[ri%HCOL.length]}"><div class="hh"><span class="hl">${lab}</span><span class="hp">${tot?`<b>${n}</b> of ${tot} days`:'Not logged yet'}</span></div><span class="hc">${cells}</span></div>`});
  return h+`</div><div class="hint">The last 14 days, oldest on the left. A coloured square means you did it that day; an empty one means you didn't; a dotted one means no check-in.</div>`;
}
function nutritionPanels(now){
  const DD=D(),T=targets();const N=28;const vals=[];
  for(let i=N-1;i>=0;i--){const k=iso(addD(now,-i)),d=DD[k];vals.push(d&&(d.food||[]).length?{...foodTotals(d),dt:dayTypeFor(k),k}:null)}
  const logged=vals.filter(Boolean);if(!logged.length)return '<div class="hint">Log your food on the Food tab and this shows calories and protein against each day\'s target, net carbs against the cap, vitamin and mineral gaps, plants per week and fasting hours.</div>';
  const W=380,H=160,l=40,r=8,t=10,b=22,bw=(W-l-r)/N;
  const mx=Math.max(3500,...logged.map(v=>v.kcal));const top=Math.ceil(mx/500)*500;const Y=v=>H-b-v/top*(H-t-b);
  let g='';for(let i=0;i<=4;i++){const v=top*i/4;g+=`<line class="grid" x1="${l}" x2="${W-r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${l-5}" y="${Y(v)+3}" text-anchor="end">${v}</text>`}
  let bars='';vals.forEach((v,i)=>{const x=l+i*bw;if(v){const tg=nutTarget('kcal',v.dt);bars+=`<rect x="${x+1.5}" y="${Y(v.kcal)}" width="${bw-3}" height="${H-b-Y(v.kcal)}" rx="2" style="fill:var(--o);opacity:${status(v.kcal,tg)==='ok'?1:.55}"/><line x1="${x+1}" x2="${x+bw-1}" y1="${Y(tg.t)}" y2="${Y(tg.t)}" style="stroke:var(--fg);stroke-width:2"/>`}if(i%7===0)bars+=`<text class="ax" x="${x+bw/2}" y="${H-6}" text-anchor="middle">${short(addD(now,-(N-1-i)))}</text>`});
  const hit=key=>logged.filter(v=>status(v[key],nutTarget(key,v.dt))==='ok').length;
  const prot=[],fasts=[];for(let i=41;i>=0;i--){const d=addD(now,-i),dd=DD[iso(d)];if(dd&&(dd.food||[]).length)prot.push({x:d/DAY,y:foodTotals(dd).protein,lab:short(d)});const fh=fastHours(DD,iso(d));if(fh!=null)fasts.push({x:d/DAY,y:fh,lab:short(d)})}
  const withMic=logged.filter(v=>v.microN>0);
  const gaps=NUTS.filter(n=>!n.macro).map(n=>{const a=avg(withMic.map(v=>v[n.k]))||0;const tg=nutTarget(n.k,'rest');const ref=tg.lo||tg.hi;const pct=ref?a/ref*100:0;const st=status(a,tg);const sc=tg.lo?pct:(pct<=100?200:200-(pct-100));return {n,pct,st,sc}}).sort((x,y)=>x.sc-y.sc);
  const wk=[];for(let w=5;w>=0;w--){const sun=addD(now,-((now.getDay()+6)%7)+6-w*7);const k=iso(sun>now?now:sun);wk.push({lab:short(addD(sun,-6)),n:plantsWeek(k).size})}
  const f7=fasts.slice(-7).map(p=>p.y),win=[];for(let i=0;i<14;i++){const w=mealWindow(DD[iso(addD(now,-i))]);if(w)win.push(w.last-w.first)}
  const dtc={rest:0,training:0,match:0};logged.forEach(v=>dtc[v.dt]++);
  return `<div class="tests"><div><b class="num">${Math.round(hit('protein')/logged.length*100)}%</b><small>Days protein on target</small></div><div><b class="num">${Math.round(hit('carbs')/logged.length*100)}%</b><small>Days under the net-carb cap</small></div><div><b class="num" style="color:${f7.length&&avg(f7)>=T.fastH?'var(--ok)':'var(--warn)'}">${f7.length?avg(f7).toFixed(1)+'h':'-'}</b><small>Avg overnight fast, 7 days</small></div></div>
   <div class="label">Calories per day vs that day's target (white tick; paler = off target) · ${dtc.training} training, ${dtc.rest} rest${dtc.match?`, ${dtc.match} match`:''} days</div><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Calories per day">${g}${bars}</svg>
   <div class="label">Days on target, last 28 days</div><div class="bars">${NUTS.filter(n=>n.macro).map(n=>{const p=Math.round(hit(n.k)/logged.length*100);return `<div class="bar" style="--c:${({kcal:'var(--o)',protein:'var(--s)',carbs:'var(--e)',fat:'var(--x)',fibre:'var(--farm)'})[n.k]||'var(--k-blue)'}"><span>${n.l}</span><div class="tr"><div class="fl" style="width:${p}%"></div></div><span class="pct num">${p}%</span></div>`}).join('')}</div>
   <div class="label">Protein per day (g) · 175-180 target</div>${lineChart(prot,{pad:10,fmtY:v=>Math.round(v),color:'var(--s)',h:120})}
   <div class="label">Vitamins &amp; minerals, average vs target · biggest gaps first</div>${withMic.length?`<div class="bars">${gaps.map(x=>`<div class="bar" style="--c:${SC[x.st]}"><span>${x.n.l}</span><div class="tr"><div class="fl" style="width:${Math.min(100,x.pct)}%"></div></div><span class="pct num">${Math.round(x.pct)}%</span></div>`).join('')}</div>`:'<div class="hint">Use the diary or photos to get vitamin and mineral estimates.</div>'}
   <div class="label">Different plants per week · target ${PLANTS_WEEK}</div><div class="bars">${wk.map(w=>`<div class="bar" style="--c:${w.n>=PLANTS_WEEK?'var(--ok)':w.n>=20?'var(--warn)':'var(--bad)'}"><span>wk of ${w.lab}</span><div class="tr"><div class="fl" style="width:${Math.min(100,w.n/PLANTS_WEEK*100)}%"></div></div><span class="pct num">${w.n}</span></div>`).join('')}</div>
   <div class="label">Overnight fast (hours) · target ${T.fastH} h</div>${lineChart(fasts,{pad:1,fmtY:v=>v.toFixed(1),color:'var(--x)',h:120})}
   ${win.length?`<div class="hint">Average eating window over the last 2 weeks: <b style="color:var(--fg)">${(avg(win)/60).toFixed(1)} h</b> from first to last food.</div>`:''}`;
}
function buildSummary(now){
  const DD=D(),LL=L(),T=targets();const lines=[];
  for(let i=27;i>=0;i--){const d=addD(now,-i),k=iso(d),dd=DD[k],l=LL[k],pl=planFor(d);if(!dd&&!l)continue;
    const p=[`${k} (${DOW[(d.getDay()+6)%7]}, wk ${pl?pl.wk:'-'}, planned ${pl?TNAME[pl.type]:'-'})`];
    if(l)p.push(`session ${TNAME[l.type]} ${l.status}${l.dur?` ${l.dur}min`:''}${l.rpe?` RPE${l.rpe}`:''}${l.tb?` trapbar ${l.tb}kg`:''}${l.pace?` pace ${l.pace}/km`:''}${l.fivek?` 5k ${l.fivek}`:''}${l.hyrox&&l.hyrox.items?` hyrox: ${l.hyrox.items.map(x=>x.name).join(', ')}`:''}${l.notes?` note "${l.notes.slice(0,80)}"`:''}`);
    if(dd){const ft=foodTotals(dd),sh=sleepHours(dd),sg=screenGap(dd);
      p.push(`readiness ${readiness(dd)??'-'}; bed ${dd.bed||'-'} up ${dd.wake||'-'} (${sh??'-'}h) screens off ${sg??'-'}min before bed, sleep quality ${dd.sleepQ??'-'}; energy ${dd.energy??'-'} mood ${dd.mood??'-'} stress ${dd.stress??'-'} sore ${dd.sore??'-'}${isNum(dd.rhr)?`; morning pulse ${dd.rhr}`:''}; strain ${strain(k)??'-'}; sleep need ${sleepNeed(k)}h${(dd.flags||[]).length?'; '+dd.flags.join(', '):''}; farm ${isNum(dd.farm)?FARM[dd.farm]:'-'} ${dd.farmHrs??''}h, desk ${dd.deskHrs??'-'}h, car ${dd.carHrs??'-'}h, family time ${dd.familyHrs??'-'}h; habits ${(dd.habits||[]).join('/')||'none'}${ft.n?`; food ${ft.kcal}kcal protein ${Math.round(ft.protein)}g carbs ${Math.round(ft.carbs)}g fat ${Math.round(ft.fat)}g fibre ${Math.round(ft.fibre)}g; day type ${dayTypeFor(k)}; micros off target: ${NUTS.filter(n=>!n.macro&&status(ft[n.k],nutTarget(n.k,dayTypeFor(k)))!=='ok').map(n=>n.l).join(', ')||'none'}; plants ${plantsOn(dd).size}`:''}${fastHours(DD,k)!=null?`; overnight fast ${fastHours(DD,k)}h`:''}${dd.lastCaffeine?` last caffeine ${dd.lastCaffeine}`:''}${(dd.niggles||[]).length?'; niggles '+dd.niggles.map(n=>`${n.side} ${n.area} ${n.pain}/10${n.note?' ('+n.note+')':''}`).join(', '):''}${(dd.extras||[]).length?'; extra '+dd.extras.map(x=>`${x.kind} ${x.dur}min RPE${x.rpe}`).join(', '):''}${dd.notes?`; note "${dd.notes.slice(0,80)}"`:''}`)}
    lines.push(p.join(' | '))}
  return lines.join('\n');
}
async function runAI(){
  if(!sample||aiState.busy)return;
  const now=sampleMode?SAMPLE.now:todayDate();const pl=planFor(now);const T=targets();
  const prompt=`You are a strength and conditioning coach reviewing the daily log of ${ABOUT}. Their goal: ${(PROFILE&&PROFILE.plan&&PROFILE.plan.goalLine)||''} Nutrition: ${APPROACH}; rest days ${DAYT.rest.kcal} kcal, ${DAYT.rest.protein} g protein, net carbs up to ${DAYT.rest.carbs} g, ${DAYT.rest.fat} g fat; training days ${DAYT.training.kcal} kcal, ${DAYT.training.protein} g protein, net carbs up to ${DAYT.training.carbs} g, ${DAYT.training.fat} g fat; overnight fast target ${T.fastH} h. They are on a 16-week plan (${PHN.map((p,i)=>`${p} wk${i*4+1}-${i*4+4}`).join(', ')}) starting ${iso(FIRST)}. Today is ${iso(now)}${pl?`, week ${pl.wk} (${PHN[pl.p]})`:''}.
Each day's sleep fields describe the night before that date. Strain is 0-21 combining training and ${WORK.toLowerCase()}. No wearable; all values are self-logged. Readiness 0-100; scores out of 5; RPE out of 10.
${buildSummary(now)}

Write a short review in plain text, no headings, no bold. Use 6-10 bullet points. Each bullet is ONE line in this exact form: "- " then a short headline of 4-9 words, then " :: ", then 2-4 sentences of detail tied to the numbers and ending with one practical thing to do. Cover, where the data allows: training load and readiness trends; sleep timing and consistency, screens-off time, caffeine timing; how farm work, desk and car time relate to soreness, niggles and readiness; family time and mood; nutrition adherence, protein, vitamin and mineral gaps, fasting hours and how they relate to energy; niggle patterns and likely triggers; progress in strength, threshold pace and 5 km. Then one final line starting "Next week:" with the single most useful change. Under 220 words. No medical diagnoses; if pain is 5/10 or more, say to get it checked by a physio.`;
  aiState={busy:true,text:'',err:''};render();
  try{const {text}=await sample(prompt,{onText:({text})=>{aiState.text=text;const el=$('#aiOut');if(el)el.textContent=text},cache:false});
    aiState={busy:false,text,err:''};
    if(!sampleMode&&metaCol){try{meta.overview={text,at:new Date().toISOString()};await metaCol.doc('overview').set(meta.overview)}catch(e){}}
  }catch(e){const m={not_granted:'The overview needs your permission to use the AI coach.',rate_limited:'Too many requests just now. Try again in a few minutes.'};aiState={busy:false,text:e.text||'',err:m[e&&e.code]||'Could not finish the overview. Try again.'}}
  render();
}
function viewReports(){
  const LL=L(),DD=D();const now=sampleMode?SAMPLE.now:todayDate();
  const toggle=`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">${sampleMode?`<span class="sample">Example data as of ${fmtD(now)}, not yours</span>`:'<span class="label">So far</span>'}<button type="button" class="ghost" id="sampleBtn" style="padding:8px 12px">${sampleMode?'Show my data':'See an example'}</button></div>`;
  const entries=Object.values(LL);
  if(!entries.length&&!Object.keys(DD).length)return toggle+`<div class="panel empty"><h3>Reports fill in as you log</h3>Do your first check-in and log your food and sessions. This page then fills in: balance, training load against your work, sleep timing, how you spend your days, habits, nutrition and fasting, what affects how you feel, niggle patterns, Hyrox movements, and strength and running progress.</div>`;
  const planned=[];for(let d=new Date(FIRST);d<=now&&d<=END;d=addD(d,1)){const p=planFor(d);if(p&&p.type!=='R')planned.push({d,p})}
  const st=x=>{const l=LL[iso(x.d)];return l?l.status:null};
  const done=planned.filter(x=>st(x)==='done').length,part=planned.filter(x=>st(x)==='partial').length;
  const comp=planned.length?Math.round((done+part*.5)/planned.length*100):0;
  const wkNow=Math.max(1,Math.min(16,Math.floor((now-START)/DAY/7)+1));
  const r7=[],r14=[],sl7=[];for(let i=0;i<14;i++){const d=DD[iso(addD(now,-i))];const r=readiness(d);if(r!=null)(i<7?r7:r14).push(r);if(i<7){const s=sleepHours(d);if(s!=null)sl7.push(s)}}
  const rNow=avg(r7),rPrev=avg(r14),debt=sleepDebt(iso(now));
  const tiles=`<div class="tiles">
    <div class="tile"><div class="big num" style="color:${rColor(rNow)}">${rNow!=null?Math.round(rNow):'-'}</div><div class="cap">Balance, 7-day average${rNow!=null&&rPrev!=null?` (${rNow>=rPrev?'+':''}${Math.round(rNow-rPrev)} vs prior week)`:''}</div></div>
    <div class="tile"><div class="big num">${comp}<small>%</small></div><div class="cap">Plan completed (${done} of ${planned.length})</div></div>
    <div class="tile"><div class="big num">${sl7.length?avg(sl7).toFixed(1):'-'}<small>h</small></div><div class="cap">In bed per night, 7 days${debt>0.2?` · ${debt} h sleep debt`:''}</div></div>
    <div class="tile"><div class="big num">${(()=>{let s=0;const mon=addD(START,(wkNow-1)*7);for(let i=0;i<7;i++)s+=dayLoad(iso(addD(mon,i)));return (s/1000).toFixed(1)})()}<small>k</small></div><div class="cap">Training load this week (wk ${wkNow})</div></div></div>`;
  const byType={S:[0,0],E:[0,0],H:[0,0],T:[0,0],X:[0,0]};planned.forEach(x=>{const k=x.p.type;byType[k][1]++;const l=LL[iso(x.d)];if(l&&l.status!=='missed')byType[k][0]+=l.status==='done'?1:.5});
  const swaps=entries.filter(e=>e.slot==='T'&&e.type==='H'&&e.status!=='missed').length;
  const cbars=Object.entries(byType).map(([k,[a,b]])=>{const pc=b?Math.round(a/b*100):0;return `<div class="bar" style="--c:var(${TVAR[k]})"><span>${TNAME[k]}</span><div class="tr"><div class="fl" style="width:${pc}%"></div></div><span class="pct num">${b?pc+'%':'-'}</span></div>`}).join('');
  const series=f=>{const out=[];for(let i=41;i>=0;i--){const d=addD(now,-i),dd=DD[iso(d)];if(!dd)continue;const v=typeof f==='function'?f(dd):dd[f];if(isNum(v))out.push({x:d/DAY,y:+v,lab:short(d)})}return out};
  const sortD=(a,b)=>a.date<b.date?-1:1,pt=(arr,f)=>arr.map(e=>({x:parse(e.date)/DAY,y:f(e),lab:short(parse(e.date))}));
  const tb=pt(entries.filter(e=>e.tb).sort(sortD),e=>e.tb),ss=pt(entries.filter(e=>e.ss).sort(sortD),e=>e.ss);
  const pace=pt(entries.filter(e=>toSec(e.pace)&&e.type==='T').sort(sortD),e=>toSec(e.pace));
  const base=entries.find(e=>e.wk===1&&toSec(e.fivek)),re=entries.find(e=>e.wk===12&&toSec(e.fivek));
  let diff='-';if(base&&re){const dd=toSec(base.fivek)-toSec(re.fivek);diff=(dd>=0?'-':'+')+fromSec(Math.abs(dd))}
  const inj=injuryAnalysis(),slp=sleepTimingChart(now);
  const rhr=series('rhr'),strn=[];for(let i=41;i>=0;i--){const d=addD(now,-i),s=strain(iso(d));if(s!=null)strn.push({x:d/DAY,y:s,lab:short(d)})}
  const savedAI=!sampleMode&&meta.overview;const aiText=aiState.text||(savedAI?savedAI.text:'');
  const aiPanel=coachHTML(aiText,savedAI);
  const W=(title,hint,body)=>`<section class="panel"><h3>${title}</h3>${hint?`<div class="hint">${hint}</div>`:''}${body}</section>`;
  return toggle+tiles+aiPanel+planStickHTML()+
   `<div class="sect">Load</div>`+
   W(`Training load vs ${WORK.toLowerCase()}`,`Bars: minutes × effort per week, by session type (club and extra sessions in teal). Dashed line: hours of ${WORK.toLowerCase()}.`,weeklyChart(wkNow)+`<div class="legend">${['S','E','H','T','X','O'].map(k=>`<span style="--c:var(${TVAR[k]})"><i></i>${TNAME[k]}</span>`).join('')}<span style="--c:var(--farm)"><i></i>${WORK} hours</span></div>`)+
   W('How you spend your days','Average hours per day, by week, including sleep and training.',timeUseChart(now))+
   W('Plan completion','',cbars+(swaps?`<div class="hint">${swaps} Friday threshold run${swaps>1?'s':''} swapped for a class.</div>`:''))+
   `<div class="sect">Sleep &amp; recovery</div>`+
   W('Balance','Daily score from sleep, how you feel, niggles and, when logged, your morning pulse against your own 2-week baseline.',lineChart(series(d=>readiness(d)),{yMin:0,yMax:100,fmtY:v=>Math.round(v),color:'var(--k-green)'}))+
   W('Sleep timing','Each bar runs from bed to wake, last 28 nights. Darker = better quality. Orange tick = screens off.',slp.svg+slp.stats)+
   W('Strain','Daily strain, 0-21, from training load plus farm work, in the style of Whoop. Higher strain raises the next night\'s sleep need.',lineChart(strn,{yMin:0,yMax:21,fmtY:v=>v.toFixed(1),color:'var(--h)',h:130}))+
   (rhr.length>1?W('Morning pulse','Counted by hand before getting up. A rise of 5+ bpm above your usual is an early sign of being run down.',lineChart(rhr,{pad:2,fmtY:v=>Math.round(v),color:'var(--t)',h:110})):'')+
   W('Energy and mood','Energy, 1 flat to 5 flying.',lineChart(series('energy'),{yMin:1,yMax:5,fmtY:v=>v.toFixed(0),color:'var(--e)',h:110})+'<div class="hint">Mood, 1 low to 5 great.</div>'+lineChart(series('mood'),{yMin:1,yMax:5,fmtY:v=>v.toFixed(0),color:'var(--x)',h:110}))+
   W('Stress and soreness','Stress, 1 calm to 5 very stressed.',lineChart(series('stress'),{yMin:1,yMax:5,fmtY:v=>v.toFixed(0),color:'var(--warn)',h:110})+'<div class="hint">Soreness, 1 fresh to 5 very sore.</div>'+lineChart(series('sore'),{yMin:1,yMax:5,fmtY:v=>v.toFixed(0),color:'var(--s)',h:110}))+
   W('Habits','',habitGrid(now))+
   `<div class="sect">Nutrition</div>`+W('Nutrition','',nutritionPanels(now))+
   `<div class="sect">Patterns</div>`+
   W('What affects how you feel','Your own data compared side by side. Patterns firm up after a few weeks of logging.',correlations())+
   `<div class="sect">Injury watch</div>`+
   W('Niggles by area','Every day an area was flagged, with the worst pain logged.',inj.table)+
   (inj.lead?W('What came before a niggle','The 3 days before each new niggle compared with your usual 3 days.',inj.lead):'')+
   W('Hyrox classes','From the boards you scanned.',hyroxAnalysis())+
   `<div class="sect">Performance</div>`+
   W('5 km tests','',`<div class="tests"><div><b class="num">${base?esc(base.fivek):'-'}</b><small>Week 1 baseline</small></div><div><b class="num">${re?esc(re.fivek):'-'}</b><small>Week 12 re-test</small></div><div><b class="num" style="color:${base&&re&&toSec(re.fivek)<toSec(base.fivek)?'var(--ok)':'var(--fg)'}">${diff}</b><small>Change</small></div></div>`)+
   W('Threshold pace','Average rep pace per km. Higher on the chart is faster.',lineChart(pace,{fmtY:v=>fromSec(v),invert:true,color:'var(--t)',pad:5}))+
   W('Strength','Trap-bar deadlift top set (kg).',lineChart(tb,{fmtY:v=>Math.round(v),color:'var(--s)',pad:5,h:130})+'<div class="hint">Split squat dumbbells (kg each hand).</div>'+lineChart(ss,{fmtY:v=>Math.round(v),color:'var(--s)',pad:2,h:110}))+
   W('Body weight','Morning weight (kg), when logged.',lineChart(series('weight'),{pad:1,fmtY:v=>v.toFixed(1),color:'var(--o)',h:110}));
}
// ================= example data (preview only, never stored) =================
let SAMPLE=null;
function buildSample(){
  const LIB=DEF_LIB;
  const now=addD(FIRST,63);const logs={},days={};let tb=80,ss=12,pace=290;let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  const classes=[
    {summary:'4 rounds for time',runM:4000,items:[['Run','1 km','Run',['Quads','Calves','Hamstrings']],['Wall balls','25','Wall balls',['Quads','Glutes','Shoulders']],['Sled push','2 × 25 m','Sled push',['Quads','Glutes','Calves']],['Burpee broad jumps','15','Burpee broad jumps',['Quads','Chest','Core']]]},
    {summary:'40 min EMOM',runM:2400,items:[['Ski erg','300 m','Ski erg',['Upper back','Core','Shoulders']],['Walking lunges','20','Lunges',['Quads','Glutes','Hips / groin']],['Run','400 m','Run',['Quads','Calves']],['Farmers carry','50 m','Farmers carry',['Grip / forearms','Core','Upper back']],['Kettlebell swings','20','Kettlebell',['Hamstrings','Glutes','Lower back']]]},
    {summary:'Partner chipper',runM:3000,items:[['Row','1000 m','Row',['Upper back','Hamstrings']],['Sled pull','4 × 20 m','Sled pull',['Upper back','Hamstrings','Grip / forearms']],['Sandbag lunges','40 m','Lunges',['Quads','Glutes','Hips / groin']],['Run','3 × 1 km','Run',['Quads','Calves','Hamstrings']]]}];
  const mkH=c=>({summary:c.summary,runM:c.runM,items:c.items.map(([name,dose,category,regions])=>({name,dose,category,regions}))});
  const MICF={sodium:[3500,.85],potassium:[4000,.8],magnesium:[450,.7],calcium:[1000,.95],iron:[8,1.6],zinc:[11,1.3],selenium:[55,1.5],iodine:[150,.6],vitA:[900,.9],vitC:[120,1.1],vitD:[15,.55],vitK:[120,1.8],b12:[4,2.2],folate:[400,.85],choline:[550,.9],omega3:[1.5,.8]};
  const PL={'Farm Fry Plate':['mushrooms','avocado','spinach'],'Berry Seed Yogurt Bowl':['raspberries','chia','pumpkin seeds','walnuts','flax'],'Post-Training Porridge':['oats','walnuts','flax','blueberries','banana'],'Tropical Recovery Bowl':['papaya','guava','coconut','pumpkin seeds'],'Salmon Tray Bake':['broccoli','red pepper','red onion','sweet potato','cabbage'],'Chicken Thigh Salad Bowl':['rocket','tomato','cucumber','avocado','potato'],'Egg Muffins and Kimchi':['spinach','cabbage','avocado'],'Mackerel and Lentil Plate':['lentils','kale','garlic','tomato'],'Ribeye, Garlic Mushrooms and Asparagus':['asparagus','mushrooms','garlic','cabbage'],'Lamb Steak, Rice and Greens':['rice','kale','garlic'],'Thai-Style Chicken Stir-Fry':['cabbage','red pepper','mushrooms','garlic','rice'],'Cauliflower Cheese, Rashers and Greens':['cauliflower','spinach','garlic'],'Almond Raspberry Yogurt':['almonds','raspberries'],'Kefir, Strawberries and Seeds':['strawberries','pumpkin seeds'],'Raspberry Walnut Brownies x2':['almonds','raspberries','walnuts','cocoa'],'Dragon Fruit and Coconut Cup':['dragon fruit','coconut','pumpkin seeds'],'2 cappuccinos and 2 teas (almond milk)':['coffee','tea','almonds']};
  const mkL=(name,meal,at)=>{const x=LIB.find(r=>r[0]===name);const share=x[2]/2900;const o={name:x[0],qty:x[7],kcal:x[2],protein:x[3],fat:x[4],carbs:x[5],fibre:x[6],meal,at,est:true,src:'diary',plants:PL[x[0]]||[]};
    Object.entries(MICF).forEach(([k,[t,f]])=>o[k]=Math.round(t*f*share*(.7+rnd()*.6)*10)/10);o.caffeine=x[1]==='drinks'?340:0;return o};
  let nigDays=0;
  for(let d=new Date(FIRST);d<=now;d=addD(d,1)){
    const k=iso(d),p=planFor(d),di=(d.getDay()+6)%7,xmas=p.wk===7;const prev=days[iso(addD(d,-1))];
    // yesterday's behaviours drive last night's sleep
    const pSun=prev&&has(prev,'Saw sunrise'),pLateCaf=prev&&lastCaffeineOf(prev)>=14*60,pLateMeal=prev&&prev._late,pSit=prev?(prev.deskHrs+prev.carHrs):0,pFam=prev?prev.familyHrs:1;
    const bedM=22*60+30+Math.round(rnd()*70)+(xmas?30:0);const screenGapM=Math.round(10+rnd()*90);
    const wakeM=6*60+Math.round(rnd()*50)+(xmas?40:0);const sh=(wakeM+1440-bedM)/60;
    const sleepQ=cl(Math.round(2.2+(sh-7)*.8+(screenGapM>=60?.8:0)+(pSun?.5:0)-(pLateCaf?.9:0)-(pLateMeal?.7:0)+rnd()*.8),1,5);
    const farm=xmas?(rnd()<.6?0:1):cl(Math.floor(rnd()*3)+(di===3||di===5?1:0)+(rnd()<.15?1:0),0,4);
    const sore=cl(Math.round(1.5+(prev&&prev.farm>=3?1.2:0)+(di===0||di===3?.8:0)+rnd()*.8),1,5);
        const energy=cl(Math.round(1.4+(sh-6)*.6+(sleepQ-3)*.4+(prev&&(prev.food||[]).reduce((a,f)=>a+f.protein,0)>=165?.4:-.2)+rnd()*.8-(sore>=4?.6:0)-(pSit>=4?.4:0)),1,5);
    const mood=cl(Math.round(2.4+(energy-3)*.5+(pFam>=1?.7:-.3)+rnd()*1),1,5);
    const stress=cl(Math.round(2+(farm>=3?1:0)+rnd()*1.3-(xmas?1:0)),1,5);
    const niggles=[];
    if((prev&&prev.farm>=3&&di===0&&rnd()<.7)||nigDays>0){niggles.push({area:'Hamstring',side:'Left',pain:nigDays>1?2:3,note:nigDays?'Settling':'Tight after Sunday sprints and a heavy day dosing ewes'});nigDays=nigDays>0?nigDays-1:2}
    if(p.wk===9&&di===3)niggles.push({area:'Lower back',side:'Both',pain:2,note:'Long drive to the mart then lifting feed bags'});
    const habits=[];if(rnd()<(xmas?.3:.55))habits.push('Saw sunrise');if(rnd()<.5)habits.push('Read');if(rnd()<.35)habits.push('Learned something');if(rnd()<.25)habits.push('Breathwork / meditation');if(di===3||rnd()<.25)habits.push('Mobility / stretch');if(rnd()<.2)habits.push('Hot tub / sauna');
    const desk=xmas?0:Math.round(rnd()*4*2)/2,car=Math.round((.5+rnd()*2)*2)/2,fam=Math.round((xmas?2.5:.5+rnd()*2.5)*2)/2;
    const rhr=Math.round(52-(sleepQ-3)*1.5+(prev&&prev.farm>=3?2:0)+rnd()*2);
    // food from the meal guide, by day type
    const food=[];const train=p.type!=='R';const pick=a=>a[Math.floor(rnd()*a.length)];
    const late=rnd()<.25;const dinT=late?'21:40':fmtT(18*60+30+Math.round(rnd()*60));
    const bT=train?'08:15':fmtT(8*60+Math.round(rnd()*120));
    food.push(mkL(train?pick(['Post-Training Porridge','Tropical Recovery Bowl','Berry Seed Yogurt Bowl']):pick(['Farm Fry Plate','Berry Seed Yogurt Bowl']),'Breakfast',bT));
    food.push(mkL(train?pick(['Chicken Thigh Salad Bowl','Mackerel and Lentil Plate']):pick(['Salmon Tray Bake','Egg Muffins and Kimchi']),'Lunch',fmtT(12*60+30+Math.round(rnd()*60))));
    food.push(mkL(train?pick(['Lamb Steak, Rice and Greens','Thai-Style Chicken Stir-Fry','Ribeye, Garlic Mushrooms and Asparagus']):pick(['Ribeye, Garlic Mushrooms and Asparagus','Cauliflower Cheese, Rashers and Greens']),'Dinner',dinT));
    if(rnd()<.6)food.push(mkL(pick(['Almond Raspberry Yogurt','Kefir, Strawberries and Seeds','Dragon Fruit and Coconut Cup']),'Snack','16:00'));
    if(rnd()<.35)food.push(mkL('Raspberry Walnut Brownies x2','Snack',late?'21:50':'20:30'));
    food.push(mkL('2 cappuccinos and 2 teas (almond milk)','Snack',rnd()<.3?'15:30':'11:00'));
    if(rnd()<.5){const v=mkL('2 cappuccinos and 2 teas (almond milk)','Breakfast','08:00');Object.assign(v,{name:'Vitamin D3',qty:'25 µg',kcal:0,protein:0,fat:0,carbs:0,fibre:0,vitD:25,plants:[],caffeine:0});MICRO.forEach(k=>{if(k!=='vitD')v[k]=0});food.push(v)}
    const lastCaf=null;
    const extras=p.wk>=9&&di===5&&rnd()<.4?[{kind:'Club training',dur:75,rpe:6}]:[];
    days[k]={date:k,bed:fmtT(bedM),wake:fmtT(wakeM),screenOff:fmtT(bedM-screenGapM),sleepQ,energy,mood,stress,sore,niggles,flags:xmas&&rnd()<.15?['Sick / run down']:[],rhr,weight:Math.round((82.5-p.wk*.15+rnd()*.6)*10)/10,
      farm,farmHrs:[0,3,6,8,10][farm],deskHrs:desk,carHrs:car,familyHrs:fam,steps:Math.round((6000+farm*2500+rnd()*3000)/100)*100,habits,extras,notes:'',
      food,water:Math.round((2.5+rnd()*1.5)*4)/4,_late:late,_over:false};
    if(p.type==='R')continue;
    const r=readiness(days[k],days);const typ=p.type;
    const status=r<45&&rnd()<.6?'missed':r<58&&rnd()<.5?'partial':(xmas&&rnd()<.3?'missed':'done');
    const durs={S:60,E:50,H:55,T:50,X:80},rp={S:7,E:4,H:8,T:7,X:6};
    const l={date:k,wk:p.wk,slot:typ,type:typ,status,dur:Math.round(durs[typ]*(DELOAD[p.wk]?.65:1)*(status==='partial'?.6:1)),rpe:rp[typ]+(r<60?1:0),notes:''};
    if(typ==='S'&&status!=='missed'){l.tb=tb;l.ss=ss;if(!DELOAD[p.wk]&&status==='done'){tb+=5;ss+=1}}
    if(typ==='T'){if(p.wk===1)l.fivek='22:40';else if(rnd()<.2){l.type='H';l.hyrox=mkH(classes[Math.floor(rnd()*3)])}else if(status!=='missed'){l.pace=fromSec(pace);pace-=3}}
    if(typ==='H')l.hyrox=mkH(classes[Math.floor(rnd()*3)]);
    logs[k]=l;}
  return {now,logs,days};
}
// ================= render + events =================
const TABS=['checkin','dashboard','training','mobility','recover','food','reports'];
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-tomob]')){location.hash='mobility';return}if(e.target.closest&&e.target.closest('[data-tview]')&&tab()==='mobility'){tView=e.target.closest('[data-tview]').dataset.tview;location.hash='training'}});
let tView='today';
function tab(){const h=location.hash.slice(1);if(h==='profile')return 'profile';if(h==='plan'){tView='plan';return 'training'}return TABS.includes(h)?h:'dashboard'}
function render(){
  const t=tab();document.querySelectorAll('.tabs a').forEach(a=>a.setAttribute('aria-current',a.dataset.tab===({checkin:'dashboard',recover:'dashboard',mobility:'dashboard',profile:'dashboard'}[t]||t)?'page':'false'));
  if(t!=='reports'&&t!=='dashboard'&&sampleMode){sampleMode=false;sDraft=null;dDraft=null}
  if(!PROFILE)return;
  $('#app').innerHTML=t==='profile'?viewProfile():t==='training'?viewTrainingTab():t==='checkin'?viewCheckin():t==='mobility'?'<a class="linkbtn backlink" href="#recover">‹ Back to Recover</a>'+viewMobility():t==='recover'?viewRecover():t==='food'?viewFood():t==='dashboard'?viewDashboard():progSub()+(pView==='learn'?viewLearn():viewReports());
  updateFab();kAvatarSet();setArea();kSignSet();kBands();setTimeout(()=>document.body.classList.remove('kloading'),900);kWording();kHideIrrelevant();if(tab()==='training'&&tView==='route')p1MapAfter();p1Anim();
}
function go(dIso){sel=parse(dIso);sDraft=null;dDraft=null;dEdit=false;confirmDel=false;scanState=null;fState={busy:false,msg:'',meal:null,text:null,manual:false};
  if(['training','checkin','food'].includes(tab())){if(tab()==='training')tView='today';render();window.scrollTo({top:0})}else{tView='today';location.hash='training'}}
function toggleIn(arr,v){const i=arr.indexOf(v);if(i>=0)arr.splice(i,1);else arr.push(v)}
function sleepCalcText(){readAll();const el=$('#sleepCalc');if(!el)return;const sh=sleepHours(dDraft),sg=screenGap(dDraft);
  el.innerHTML=(sh!=null?`<b style="color:var(--fg)">${sh} h</b> in bed`:'Enter bed and wake times')+(sg!=null?` · screens off <b style="color:${sg>=60?'var(--ok)':'var(--warn)'}">${sg} min</b> before bed`:'')}
let saveTimer=null;
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-goto]');if(g){go(g.dataset.goto);return}
  const dtb=e.target.closest('[data-dtab]');if(dtb){if(!sampleMode&&iso(sel)!==iso(todayDate())){sel=todayDate();sDraft=null;dDraft=null;dEdit=false}tView='today';if(dtb.getAttribute('href')==='#food')fView='today';if(sampleMode){e.preventDefault();return}return}
  const tvb=e.target.closest('[data-tview]');if(tvb){tView=tvb.dataset.tview;render();window.scrollTo({top:0});return}
  if(e.target.closest('#fab')){openVoice();return}
  if(e.target.closest('#vClose')){closeVoice();return}
  if(e.target.closest('#vSpeak')){toggleListen();return}
  if(e.target.closest('#vGo')){if(!vState.busy)runVoice();return}
  const s=e.target.closest('[data-seg]');if(s){
    if(s.dataset.form==='dt'){const t=$('#f-say');if(t)fState.text=t.value;persistDay(iso(sel),{dayType:s.dataset.v});render();return}
    if(s.dataset.form==='f'){const t=$('#f-say');if(t)fState.text=t.value;fState.meal=s.dataset.v;render();return}
    readAll();const tgt=s.dataset.form==='s'?sDraft:s.dataset.form==='y'?yDraft:dDraft;const v=s.dataset.v;const val=isNaN(+v)?v:Number(v);tgt[s.dataset.seg]=String(tgt[s.dataset.seg])===String(val)&&s.dataset.seg!=='status'?null:val;if(s.dataset.form==='s')sDirty=true;else dDirty=true;render();return}
  const yd=e.target.closest('[data-yday]');if(yd){readAll();toggleIn(yDraft.dayTags=yDraft.dayTags||[],yd.dataset.yday);dDirty=true;render();return}
  const hb=e.target.closest('[data-habit]');if(hb){readAll();toggleIn(yDraft.habits=yDraft.habits||[],hb.dataset.habit);dDirty=true;render();return}
  const fl=e.target.closest('[data-flag]');if(fl){readAll();toggleIn(dDraft.flags=dDraft.flags||[],fl.dataset.flag);dDirty=true;render();return}
  const dn=e.target.closest('[data-del-nig]');if(dn){readAll();dDraft.niggles.splice(+dn.dataset.delNig,1);dDirty=true;render();return}
  const de=e.target.closest('[data-del-ext]');if(de){readAll();yDraft.extras.splice(+de.dataset.delExt,1);dDirty=true;render();return}
  const dh=e.target.closest('[data-del-h]');if(dh){readAll();sDraft.hyrox.items.splice(+dh.dataset.delH,1);sDirty=true;render();return}
  const df=e.target.closest('[data-del-food]');if(df){const k=iso(sel);const cur=clone(days[k]||{food:[]});const it=cur.food.splice(+df.dataset.delFood,1)[0];persistDay(k,{food:cur.food}).then(()=>{toast('Removed '+(it?it.name:'item'));render()});return}
  const q=e.target.closest('[data-quick]');if(q){const f=frequentFoods()[+q.dataset.quick];if(!f)return;const meal=fState.meal||(iso(sel)===iso(todayDate())?guessMeal():'Dinner');const [it]=cleanItems([f],meal,f.est);it.est=!!f.est;addFood([it]).then(()=>{toast(`Added ${it.name}`);render()});return}
  const fv=e.target.closest('[data-fview]');if(fv){fView=fv.dataset.fview;if(tab()!=='food')location.hash='food';else{render();window.scrollTo({top:0})}return}
  const at=e.target.closest('[data-ate]');if(at){at.disabled=true;ateThis(at.dataset.ate);return}
  const lb=e.target.closest('[data-lib]');if(lb){const x=LIB[+lb.dataset.lib];const meal=fState.meal||(iso(sel)===iso(todayDate())?guessMeal():'Dinner');const t=$('#f-say');if(t)fState.text=t.value;
    const [it]=cleanItems([{name:x[0],qty:x[7],kcal:x[2],protein:x[3],fat:x[4],carbs:x[5],fibre:x[6],micros:false}],x[1]==='drinks'?'Snack':meal,false,'guide');addFood([it]).then(()=>{toast(`Added ${it.name}`);render()});return}
  const dk=e.target.closest('[data-del-kit]');if(dk){const items=kitchen().slice();items.splice(+dk.dataset.delKit,1);persistMeta('kitchen',{items,updatedAt:new Date().toISOString()}).then(()=>render());return}
  const id=((e.target.closest&&e.target.closest('button[id],a[id],input[id]'))||e.target).id||'';
  if(id==='pBuild'){buildPlan();return}
  if(id==='kUpdate'){updateKitchen();return}
  if(id==='addNig'){readAll();(dDraft.niggles=dDraft.niggles||[]).push({area:'Hamstring',side:'Left',pain:2,note:''});dDirty=true;render();return}
  if(id==='addExt'){readAll();(yDraft.extras=yDraft.extras||[]).push({kind:'Club training',dur:null,rpe:null});dDirty=true;render();return}
  if(id==='addH'){readAll();sDraft.hyrox=sDraft.hyrox||{items:[]};sDraft.hyrox.items=sDraft.hyrox.items||[];sDraft.hyrox.items.push({name:'',dose:'',category:'Other',regions:[]});sDirty=true;render();return}
  if(id==='dEditBtn'||id==='dEditBtn2'){dEdit=true;dDraft=blankDay(iso(sel));yDraft=blankDay(prevKey(iso(sel)));render();window.scrollTo({top:0});return}
  if(id==='dCancel'){dEdit=false;dDraft=null;dDirty=false;render();return}
  if(id==='prevD'||id==='nextD'){go(iso(addD(sel,id==='prevD'?-7:7)));return}
  if(id==='goToday'){go(iso(todayDate()));return}
  if(id==='delAsk'){readAll();confirmDel=true;render();return}
  if(id==='delNo'){readAll();confirmDel=false;render();return}
  if(id==='delYes'){delLog();return}
  if(id==='sampleBtn'){if(!SAMPLE)SAMPLE=buildSample();sampleMode=!sampleMode;aiState={busy:false,text:'',err:''};render();return}
  if(id==='aiBtn'){runAI();return}
  if(id==='fParse'){parseDiary();return}
  if(id==='mAdd'){const v=x=>{const el=document.getElementById(x);return el?el.value:''};const name=v('m-name').trim();if(!name){toast('Name the food first');return}
    const meal=fState.meal||(iso(sel)===iso(todayDate())?guessMeal():'Dinner');const [it]=cleanItems([{name,qty:v('m-qty'),carbs:v('m-c'),protein:v('m-p'),fat:v('m-f'),kcal:v('m-k')===''?null:v('m-k'),at:v('m-t')||null}],meal,false,'manual');
    fState.manual=true;const t=$('#f-say');if(t)fState.text=t.value;addFood([it]).then(()=>{toast(`Added ${it.name}`);render()});return}
});
document.addEventListener('input',e=>{
  const el=e.target;if(el.dataset&&el.dataset.live){const o=document.getElementById(el.dataset.live);if(o)o.textContent=el.value+'/10'}
  if(el.dataset&&el.dataset.bind){if(el.dataset.bind[0]==='s')sDirty=true;else dDirty=true}
  if(el.id==='f-say')fState.text=el.value;
  if(el.id==='p-req')pState.req=el.value;
  if(el.id==='k-say')kState.text=el.value;
});
document.addEventListener('change',e=>{
  const el=e.target;
  if(el.id==='scanFile'&&el.files&&el.files[0]){scanBoard(el.files[0]);return}
  if((el.id==='mealFile'||el.id==='mealFile2')&&el.files&&el.files[0]){const fl=el.files[0];toast('Photo received, reading it…');parseFoodPhoto(fl).finally(()=>{try{el.value=''}catch(e){}});return}
  if(el.dataset&&el.dataset.recalc){sleepCalcText();return}
  if(el.dataset&&el.dataset.food){const t=$('#f-say');if(t)fState.text=t.value;const k=iso(sel);const val=el.type==='time'?el.value:(el.value===''?null:Number(el.value));persistDay(k,{[el.dataset.food]:val}).then(ok=>{if(ok)toast('Saved')});return}
  if(el.dataset&&el.dataset.setting){const v=el.type==='time'?el.value:Number(el.value);if(!v)return;const st=Object.assign({},meta.settings||{},{[el.dataset.setting]:v});persistMeta('settings',st).then(ok=>{if(ok)toast('Saved')});render();return}
  if(el.dataset&&el.dataset.shop!=null){const p=clone(meta.plan);p.shopping[+el.dataset.shop].got=el.checked;persistMeta('plan',p);return}
  if(el.id==='f-swap'||el.id==='f-cls'||(el.dataset&&el.dataset.live)){readAll();render()}
});
document.addEventListener('submit',e=>{e.preventDefault();if(e.target.id==='logForm')saveLog(planFor(sel));if(e.target.id==='dayForm')saveDay()});
window.addEventListener('hashchange',()=>{confirmDel=false;render();window.scrollTo({top:0})});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&vState.open)closeVoice()});
// ================= accounts, sign-up, storage (Supabase) and AI (via /api/claude) =================
let sb=null,UID=null,PROFILE=null,IS_ADMIN=false,IS_OWNER=false,SESSION=null,PROFILE_ROW=null;
const gate=()=>$('#gate');
function showGate(html){if(!/gload/.test(html))document.body.classList.remove('kloading');$('#appwrap').hidden=true;$('#fab').hidden=true;const g=gate();g.hidden=false;g.innerHTML=html;window.scrollTo({top:0})}
function showApp(){gate().hidden=true;gate().innerHTML='';$('#appwrap').hidden=false;updateFab()}

// ---------- AI shim with the same shape the app already uses ----------
async function shrink(file){
  try{const bmp=await createImageBitmap(file);const s=Math.min(1,1568/Math.max(bmp.width,bmp.height));const c=document.createElement('canvas');c.width=Math.round(bmp.width*s);c.height=Math.round(bmp.height*s);c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);
    const url=c.toDataURL('image/jpeg',.85);return {media_type:'image/jpeg',data:url.split(',')[1]}}
  catch(e){throw {code:'image_rejected',message:'Could not read that image'}}
}
async function callClaude(prompt,opts){
  opts=opts||{};const imgs=[];if(opts.images){const list=opts.images instanceof Blob?[opts.images]:Array.from(opts.images);for(const f of list.slice(0,4))imgs.push(await shrink(f))}
  const {data:{session}}=await sb.auth.getSession();if(!session)throw {code:'session_expired',message:'Signed out'};
  let r;try{r=await fetch('/api/claude',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+session.access_token},body:JSON.stringify({prompt:typeof prompt==='string'?prompt:prompt.map(m=>m.content).join('\n\n'),images:imgs,maxTokens:opts.maxTokens||8000})})}
  catch(e){throw {code:'upstream_error',message:'Network error'}}
  let j={};try{j=await r.json()}catch(e){}
  if(!r.ok)throw {code:r.status===429?'rate_limited':r.status===401?'session_expired':'upstream_error',message:j.error||('HTTP '+r.status)};
  return j;
}
function looseJSON(t){
  try{return JSON.parse(t)}catch(e){}
  const f=t.match(/```(?:json)?\s*([\s\S]*?)```/);if(f){try{return JSON.parse(f[1])}catch(e){}}
  const a=Math.min(...['{','['].map(c=>{const i=t.indexOf(c);return i<0?1e9:i})),b=Math.max(t.lastIndexOf('}'),t.lastIndexOf(']'));
  if(a<1e9&&b>a){try{return JSON.parse(t.slice(a,b+1))}catch(e){}}
  throw {code:'invalid_json',message:'Reply was not JSON',text:t};
}
function makeSample(){
  const fn=async(input,opts)=>{const j=await callClaude(input,opts);opts&&opts.onText&&opts.onText({text:j.text,delta:j.text});return {text:j.text,truncated:!!j.truncated}};
  fn.json=async(input,opts)=>{const j=await callClaude((typeof input==='string'?input:input.map(m=>m.content).join('\n\n'))+'\n\nReply with the JSON only, no other text.',Object.assign({maxTokens:12000},opts||{}));if(j.truncated)throw {code:'invalid_json',message:'Reply cut short',text:j.text};return looseJSON(j.text)};
  fn.limits=async()=>({images:{maxCount:4,mediaTypes:['image/jpeg','image/png','image/webp','image/gif']}});
  return fn;
}
function col(kind){return {doc(key){return {
  async set(data){const {error}=await sb.from('entries').upsert({user_id:UID,kind,key,data,updated_at:new Date().toISOString()});if(error)throw {code:'unavailable',message:error.message}},
  async delete(){const {error}=await sb.from('entries').delete().match({user_id:UID,kind,key});if(error)throw {code:'unavailable',message:error.message}}}}}}

// ---------- profile → app ----------
const okArr=(a,n)=>Array.isArray(a)&&a.length===n;
function sanitizePlan(p){
  const D=DEF_PLAN,o=Object.assign({},p||{});
  const mon=d=>addD(d,-((d.getDay()+6)%7));
  let st=/^\d{4}-\d{2}-\d{2}$/.test(o.start||'')?parse(o.start):mon(addD(todayDate(),7));st=mon(st);o.start=iso(st);
  o.firstDay=/^\d{4}-\d{2}-\d{2}$/.test(o.firstDay||'')&&parse(o.firstDay)>=st&&parse(o.firstDay)<addD(st,7)?o.firstDay:o.start;
  o.week=okArr(o.week,7)&&o.week.every(x=>'SEHTXR'.includes(x))?o.week:D.week;
  o.labels=Object.assign({},D.labels,o.labels||{});o.phases=okArr(o.phases,4)?o.phases.map(String):D.phases;
  o.threshold=okArr(o.threshold,16)?o.threshold.map(String):D.threshold;o.thresholdMin=okArr(o.thresholdMin,16)?o.thresholdMin.map(x=>+x||0):D.thresholdMin;
  o.easy=okArr(o.easy,16)?o.easy.map(x=>+x||30):D.easy;o.long=okArr(o.long,16)?o.long.map(x=>+x||45):D.long;
  o.deload=o.deload&&typeof o.deload==='object'?o.deload:{};
  const blk=a=>Array.isArray(a)&&a.length?a.filter(x=>x&&x.nm&&okArr(x.d,4)).map(x=>({tag:String(x.tag||''),nm:Array.isArray(x.nm)&&x.nm.length===4?x.nm.map(String):String(x.nm),cue:String(x.cue||''),d:x.d.map(String)})):null;
  o.strength=blk(o.strength)||D.strength;o.speed=blk(o.speed)||D.speed;
  o.keyLifts=okArr(o.keyLifts,2)?o.keyLifts.map(String):D.keyLifts;o.trainTime=/^\d{1,2}:\d{2}$/.test(o.trainTime||'')?o.trainTime:'07:00';
  return o;
}
function applyProfile(p){
  const pl=sanitizePlan(p.plan);p.plan=pl;
  START=parse(pl.start);FIRST=parse(pl.firstDay);END=addD(START,16*7-1);
  TYPES=pl.week;Object.assign(TNAME,pl.labels);PHN=pl.phases;THR=pl.threshold;THRMIN=pl.thresholdMin;EASY=pl.easy;LONG=pl.long;DELOAD=pl.deload;STRENGTH=pl.strength;SPEED=pl.speed;KEYLIFTS=pl.keyLifts;CLASSNOTE=pl.classNote||`Your ${TNAME.H.toLowerCase()}`;
  const n=p.nutrition||{};DAYT=JSON.parse(JSON.stringify(DEF_DAYT));['rest','training','match'].forEach(k=>{if(n[k])['kcal','protein','carbs','fat'].forEach(x=>{if(isNum(n[k][x]))DAYT[k][x]=Math.round(+n[k][x])})});
  if(n.micros&&typeof n.micros==='object')NUTS.forEach(x=>{const m=n.micros[x.k];if(m&&typeof m==='object'){if(isNum(m.lo))x.lo=+m.lo;if(isNum(m.hi))x.hi=+m.hi}});
  LIB=p.useGuide?DEF_LIB:[];RULES=p.useGuide?DEF_RULES:(p.rules||'');
  ABOUT=p.about||'the user';PORTION=p.portionWho||'this person';WORK='Manual labour';APPROACH=p.approach||'balanced';
  EXTRA_KINDS=['Club training','Match',`Extra ${TNAME.H.toLowerCase()}`,'Gym','Run','Other'];
}

// ---------- sign in / sign up ----------
function authHTML(mode,msg){
  const form=`<form id="authForm" class="form" style="padding:0" autocomplete="on">
      <div class="field"><label class="label" for="a-email">Email</label><input id="a-email" type="email" autocomplete="email" required></div>
      <div class="field"><label class="label" for="a-pass">Password${mode==='up'?' (8+ characters)':''}</label><input id="a-pass" type="password" autocomplete="${mode==='up'?'new-password':'current-password'}" minlength="8" required></div>
      <button class="primary" type="submit" id="authGo">${mode==='up'?'Create my account':'Sign in'}</button>
      ${msg?`<div class="hsum" role="status">${esc(msg)}</div>`:''}
    </form>`;
  if(mode==='in')return `<div class="gcard"><div class="gmark">${KWM_AUTH}<span class="kproto">Prototype</span></div><h1>Welcome back</h1>${form}
    <button type="button" class="linkbtn" data-auth="up">New here? See what it does and create an account</button><button type="button" class="linkbtn" id="forgot">Forgot password</button></div>`;
  return `<div class="gcard"><div class="gmark">${KWM_AUTH}<span class="kproto">Prototype</span></div><h1>Feel better day to day</h1><p class="gsub" style="margin:0">Find your balance.</p>
    <p class="gsub">A coach, a food planner and a training diary in one app. Here's what it does:</p>${featuresHTML()}
    <div class="gstep"><span class="num">1</span>Create your account</div>${form}
    <div class="gnext"><span class="num">2</span>Tell it about you, in your own words if you like</div><div class="gnext"><span class="num">3</span>Get your plan, then add the food you can get</div>
    <button type="button" class="linkbtn" data-auth="in">Already have an account? Sign in</button></div>`;
}
let authMode='up';
async function doAuth(){
  const email=$('#a-email').value.trim(),password=$('#a-pass').value;const b=$('#authGo');b.disabled=true;b.textContent='Please wait…';
  try{
    if(authMode==='up'){const {data,error}=await sb.auth.signUp({email,password});if(error)throw error;if(!data.session){showGate(authHTML('in','Check your email for a confirmation link, then sign in here.'));return}}
    else{const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error}
    const {data:{session}}=await sb.auth.getSession();SESSION=session;await startUser();
  }catch(e){showGate(authHTML(authMode,e.message||'That did not work. Try again.'))}
}

// ---------- sign-up questionnaire ----------
const OB_STEPS=['You','Goals','Moving','Life','Food','Build'];
let ob={step:-1,a:{}};
function obLoad(){try{const s=localStorage.getItem('ob_'+UID);if(s)ob=JSON.parse(s)}catch(e){}}
function obSave(){try{localStorage.setItem('ob_'+UID,JSON.stringify(ob))}catch(e){}}
const obTags=(key,opts)=>`<div class="tags">${opts.map(o=>`<button type="button" data-obtag="${key}" data-v="${esc(o)}" aria-pressed="${(ob.a[key]||[]).includes(o)}">${esc(o)}</button>`).join('')}</div>`;
const obSeg=(key,opts)=>`<div class="seg small">${opts.map(o=>`<button type="button" data-obseg="${key}" data-v="${esc(o)}" aria-pressed="${ob.a[key]===o}">${esc(o)}</button>`).join('')}</div>`;
const obIn=(key,lab,type,ph,extra)=>`<div class="field"><label class="label" for="ob-${key}">${lab}</label><input id="ob-${key}" data-ob="${key}" type="${type||'text'}" ${extra||''} placeholder="${esc(ph||'')}" value="${esc(ob.a[key]??'')}"></div>`;
const obTa=(key,lab,ph)=>`<div class="field"><label class="label" for="ob-${key}">${lab}</label><textarea id="ob-${key}" data-ob="${key}" placeholder="${esc(ph||'')}">${esc(ob.a[key]||'')}</textarea></div>`;
function obHTML(){
  const s=ob.step;let body='';
  if(s===-1)return `<div class="gcard wide">${obStartHTML()}<button type="button" class="linkbtn" id="signOut">Sign out</button></div>`;
  if(s===-2)return `<div class="gcard wide">${obTalkHTML()}<button type="button" class="linkbtn" id="obHome">Back</button></div>`;
  if(s===0)body=`<h2>About you</h2>${obIn('name','Your name (first and last)','text','')}<div class="row3">${obIn('age','Age','number','','inputmode="numeric" min="16" max="90"')}${obIn('weight','Weight (kg)','number','','inputmode="decimal" step="0.5"')}${obIn('height','Height (cm)','number','','inputmode="numeric"')}</div>
    <div class="field"><span class="label">Sex</span>${obSeg('sex',['Male','Female','Prefer not to say'])}</div>`;
  if(s===1)body=`<h2>Your goals</h2><div class="field"><span class="label">Main goal</span>${obSeg('mainGoal',['Feel better day to day','Sleep better','More energy','Lose weight','Build muscle / bulk up','Get lean and toned','Get stronger','Get fit for my sport','Run faster','Hyrox / fitness race','General health'])}</div>
    <div class="field"><span class="label">Anything else? (pick any)</span>${obTags('goals',['Lose body fat','Put on mass','Tone up','Get stronger','Improve endurance','Stay injury-free','More energy','Better sleep','Eat better','Improve flexibility'])}</div>
    <div class="row2">${obIn('target','Target date or event (optional)','text','e.g. season starts February')}${obIn('targetWeight','Target weight, kg (optional)','number','','inputmode="decimal" step="0.5"')}</div>${obTa('success','What would a great result look like?','e.g. play the full 60 minutes without my hamstring going')}`;
  if(s===2)body=`<h2>Moving</h2><div class="field"><span class="label">What do you enjoy, or want to do more of?</span>${obTags('sport',['Walking','Nothing much yet','GAA football','Hurling / camogie','Soccer','Rugby','Running','Hyrox','Gym','Cycling','Swimming','Other'])}</div>
    <div class="field"><span class="label">Days a week you could be active</span>${obSeg('perWeek',['2','3','4','5','6'])}</div>
    <div class="field"><span class="label">Days that suit you</span>${obTags('days',['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])}</div>
    <div class="row2">${obIn('time','Usual time to be active','time','','')}<div class="field"><span class="label">Fasted in the morning?</span>${obSeg('fasted',['Yes','No'])}</div></div>
    <div class="field"><span class="label">Experience</span>${obSeg('level',['Beginner','Some','Experienced'])}</div>
    <div class="field"><span class="label">Equipment</span>${obTags('equip',['Full gym','Home weights','Pitch / track','Roads','Classes'])}</div>
    ${obTa('fixed','Fixed sessions you already do (optional)','e.g. Hyrox class Wednesday 6:30am, club training Tue and Thu evenings')}${obTa('injuries','Injuries or problem areas (optional)','e.g. hamstring tears in the past, dodgy left knee')}`;
  if(s===3)body=`<h2>Your day</h2><div class="field"><span class="label">Work</span>${obSeg('job',['Physical','Desk','Mixed','Shift work'])}</div>
    ${obIn('jobDesc','What do you do? (optional)','text','e.g. farmer, nurse, electrician, office')}${obIn('start','When do you want to start?','date','')}`;
  if(s===4)body=`<h2>Food</h2><div class="field"><span class="label">Approach</span>${obSeg('approach',['Balanced','High protein','Lower carb','Keto','Plant-based','No preference'])}</div>
    <div class="field"><span class="label">Dietary needs</span>${obTags('diet',['Vegetarian','Vegan','No fish','Dairy-free','Gluten-free','Nut allergy'])}</div>
    <div class="field"><span class="label">Overnight fast target</span>${obSeg('fastH',['None','12 h','14 h','16 h'])}</div>
    <div class="field"><span class="label">Alcohol</span>${obSeg('alcohol',['None','Occasionally','Most weeks'])}</div>${obTa('foodNotes','Anything else about food? (optional)','e.g. hate mushrooms, cook for the family, eat at work canteen')}`;
  if(s===5){const pr=ob.result;
    body=pr?`<h2>Your plan is ready</h2><div class="note" style="margin:0">${esc(pr.summary||'')}</div>
      <div class="obsum"><div><b class="num">${pr.nutrition.training.kcal}</b><small>kcal training day</small></div><div><b class="num">${pr.nutrition.rest.kcal}</b><small>kcal rest day</small></div><div><b class="num">${pr.nutrition.training.protein} g</b><small>protein</small></div></div>
      <div class="label">Your week</div><div class="obweek">${pr.plan.week.map((t,i)=>`<span style="--c:var(${TVAR[t]})"><b>${DOW[i]}</b>${esc(t==='R'?'Rest':(pr.plan.labels[t]||t))}</span>`).join('')}</div>
      <div class="label">16 weeks in 4 phases</div><div class="obweek" style="grid-template-columns:repeat(4,minmax(0,1fr))">${pr.plan.phases.map((ph,i)=>`<span style="--c:${PHC[i]}"><b>Wk ${i*4+1}-${i*4+4}</b>${esc(ph)}</span>`).join('')}</div>
      ${pr.plan.week.includes('S')?`<details class="wu"><summary>${esc(pr.plan.labels.S||'Strength')}, week 1</summary>${pr.plan.strength.map(e=>exRow(e.tag,Array.isArray(e.nm)?e.nm[0]:e.nm,e.cue,e.d[0])).join('')}</details>`:''}
      ${pr.plan.week.includes('X')?`<details class="wu"><summary>${esc(pr.plan.labels.X||'Speed')} block, week 1</summary>${pr.plan.speed.map(e=>exRow(e.tag,Array.isArray(e.nm)?e.nm[0]:e.nm,e.cue,e.d[0])).join('')}</details>`:''}
      ${pr.plan.week.includes('T')?`<details class="wu"><summary>${esc(pr.plan.labels.T||'Quality')} sessions, week by week</summary>${pr.plan.threshold.map((t,i)=>exRow(String(i+1),t,'',pr.plan.thresholdMin[i]?pr.plan.thresholdMin[i]+"'":'test')).join('')}</details>`:''}
      <div class="label">Daily nutrition targets</div><div class="scroll"><table class="tbl"><thead><tr><th></th><th class="r">kcal</th><th class="r">Protein</th><th class="r">Net carbs</th><th class="r">Fat</th></tr></thead><tbody>${(KTRAINS(ob.a)?['training','rest','match']:['training','rest']).filter(k=>k!=='match'||/GAA|Hurling|Soccer|Rugby/i.test([].concat(ob.a.sport||[]).join(' '))).map(k=>{const n=pr.nutrition[k];return `<tr><td>${KTRAINS(ob.a)?k[0].toUpperCase()+k.slice(1):k==='training'?'Active':'Rest'} day</td><td class="r num">${n.kcal}</td><td class="r num">${n.protein} g</td><td class="r num">${n.carbs} g</td><td class="r num">${n.fat} g</td></tr>`}).join('')}</tbody></table></div>
      ${pr.rules?`<details class="wu"><summary>Food planning rules</summary><div style="white-space:pre-wrap;font-size:13px;padding-bottom:12px">${esc(pr.rules)}</div></details>`:''}
      <div class="hint" style="font-size:13px;color:var(--muted)">Starts ${fmtD(parse(pr.plan.firstDay))}. You can rebuild it any time from your profile.</div>
      <button type="button" class="primary" id="obStart">${kitchen().length?'Start':'Next: your food ›'}</button><button type="button" class="ghost" id="obBuild">Build it again</button>`
    :`<h2>Build your plan</h2>${ob.msg&&!ob.busy?`<div class="note" style="margin:0">${esc(ob.msg)}</div>`:''}<p class="gsub" style="margin:0">Check your answers. Tap any section to change it. Then the app builds your 16-week training plan, your food targets for training and rest days, and the rules your meal planning follows. It takes about a minute.</p>${obReview()}
      <button type="button" class="primary" id="obBuild" ${ob.busy?'disabled':''}>${ob.busy?'Building your plan… up to 2 minutes':'Build my plan'}</button>${ob.err?`<div class="alert amber">${esc(ob.err)}</div>`:''}
      ${IS_OWNER?`<div class="note" style="margin-top:8px"><b>Owner shortcut.</b> Skip the build and load the original Road to February plan and nutrition guide.<div class="field" style="margin-top:8px"><label class="label" for="ob-about">Describe yourself in a line (used by the coach and food estimates)</label><textarea id="ob-about" data-ob="about" placeholder="e.g. 82 kg sheep and cattle farmer, senior Gaelic footballer, father of two, no alcohol">${esc(ob.a.about||'')}</textarea></div><button type="button" class="ghost" id="obOwner" style="margin-top:8px;color:var(--fg)">Load my original plan</button></div>`:''}`}
  return `<div class="gcard wide"><div class="obprog">${OB_STEPS.map((x,i)=>`<span class="${i<s?'done':i===s?'cur':''}">${x}</span>`).join('')}</div>${body}
    <div class="actions" style="margin-top:8px">${!(s===5)&&!ob.ret?'<button type="button" class="ghost" id="obBack">Back</button>':''}${s<5?(ob.ret?'<button type="button" class="primary" id="obDone">Done</button>':'<button type="button" class="primary" id="obNext">Next</button>'):''}</div>
    ${ob.fromApp?'<button type="button" class="linkbtn" id="obCancel">Keep my current plan</button>':'<button type="button" class="linkbtn" id="signOut">Sign out</button>'}</div>`;
}
function obRead(){document.querySelectorAll('[data-ob]').forEach(el=>{ob.a[el.dataset.ob]=el.value});obSave()}
function obRender(){showGate(obHTML());try{if(!KTRAINS(ob.a))kWording(document.getElementById('gate'))}catch(e){}}
async function obBuild(){
  obRead();ob.busy=true;ob.err='';ob.msg='';ob.result=null;obRender();
  const a=ob.a;const today=iso(todayDate());
  const ex=JSON.stringify({start:DEF_PLAN.start,firstDay:DEF_PLAN.firstDay,week:DEF_PLAN.week,labels:DEF_PLAN.labels,phases:DEF_PLAN.phases,threshold:DEF_PLAN.threshold,thresholdMin:DEF_PLAN.thresholdMin,easy:DEF_PLAN.easy,long:DEF_PLAN.long,deload:DEF_PLAN.deload,strength:DEF_PLAN.strength.slice(0,3),speed:DEF_PLAN.speed.slice(0,2),keyLifts:DEF_PLAN.keyLifts,classNote:DEF_PLAN.classNote,trainTime:DEF_PLAN.trainTime,fasted:true,goalLine:DEF_PLAN.goalLine});
  const prompt=`You are an experienced strength and conditioning coach and sports nutritionist. Build a personal 16-week plan for this person from their sign-up answers. Today is ${today}.
Answers: ${JSON.stringify(a)}
${KTRAINS(a)?'':`THIS PERSON DOES NOT TRAIN OR PLAY SPORT. Build a gentle everyday-movement plan, not a training plan. Follow these rules over everything else below:
- Respect what they said. If they said no gym, use no gym and no equipment at all. Their main movement is walking and easy cycling.
- Use only slots E (easy walk or cycle), X (a longer walk or cycle) and R. Use S only as "Home moves", at most once a week, never in weeks 1-2, and only if they chose 3 or more days a week. Do not use H or T unless they named a class they already go to.
- Labels in plain words: E "Easy walk" or "Walk or easy cycle", X "Longer walk", S "Home moves". No jargon anywhere: no threshold, RPE, zones, intervals, deload, sets of heavy lifting.
- "strength": 4 simple equipment-free moves anyone can do at home or at a desk (e.g. sit-to-stand from a chair, wall press-ups, standing calf raises, gentle bridge), beginner amounts like "2 x 8, easy". "speed": 3 gentle mobility or balance moves (e.g. ankle circles, hip swings, standing on one leg). "keyLifts": [].
- "easy" 16 durations starting around 15-20 min and building slowly to 30-40; "long" starting around 30 and building to 60. "threshold"/"thresholdMin": fill with easy walk descriptions and minutes.
- The example plan further down is for a competitive athlete: copy only its JSON shape, never its exercises or tone.
- "summary": warm and practical, about feeling better, not performance.`}

The app has fixed session slots. Map their training onto them; rename the labels to fit them:
S = strength / gym session; E = easy aerobic session (easy run, bike, swim); H = a class, club or team session they already do; T = quality session (threshold or intervals, or a time-trial test when thresholdMin is 0); X = speed and skills block followed by a longer easy session; R = rest.
"week" is 7 slot codes Monday to Sunday. Use exactly their number of sessions per week on the days they can train, put their fixed sessions in the right slots, never put hard slots (S, H, T, X) on three days in a row, and give them at least one R day.
16 weeks in 4 phases of 4 weeks. Week 4, 8 and 12 are lighter; mark lighter weeks in "deload" as {"4":"Deload"}. If the slot T is used, weeks 1 and 12 should be tests (thresholdMin 0) with a test description in "threshold".
"threshold": 16 short session descriptions for the T slot; "thresholdMin": minutes of hard work in each; "easy": 16 durations (min) for E; "long": 16 durations (min) for the long part of X. Fill all 16 even for slots they don't use.
"strength": 5-8 exercises, each {"tag":"A1","nm":"name" or 4 names one per phase,"cue":"short coaching cue","d":[4 prescriptions, one per phase]}. Include injury prevention for their sport and any problem areas they mentioned. "speed": 3-5 drills in the same shape, suited to their sport (skills drills for non-runners).
"keyLifts": the 2 lifts worth tracking. "trainTime": their usual time as HH:MM. "fasted": true only if they said they train fasted. "start": the Monday on or before their start date (if none, next Monday); "firstDay": their first session date within that week.
Nutrition from their weight, height, age, sex, goal, approach and activity (job counts): "rest","training","match" each {"kcal","protein","carbs" (net carbs g),"fat"}; protein 1.6-2.2 g/kg; for weight or fat loss use a moderate deficit of about 300-500 kcal, for building muscle or putting on mass a small surplus of about 200-400 kcal, and use their target weight if given; match day only if they play a sport with matches, else copy training. Call the active-day targets "training" in the JSON regardless. "micros": only where their needs differ from adult-male defaults (e.g. women: iron {"lo":18}). "fastH": hours from their answer, 0 for none.
"rules": 5-9 short lines for their food planning (meal timing around their training time, starch on training days if lower carb, protein per meal, diet needs, alcohol), each starting "- ".
"about": one line describing them for a coach, e.g. "Aoife, 31, 64 kg nurse on shift work, training for Hyrox, vegetarian". "portionWho": e.g. "a 64 kg active woman". "workLabel": "Physical work" if physical or mixed job, else "Active work". "approach": short phrase. "goalLine": one sentence of their goal. "summary": 2-3 friendly sentences explaining the plan.
Here is a finished example plan from another user, to match the shape and level of detail: ${ex}
Reply with ONLY JSON: {"plan":{"start":"","firstDay":"","week":[],"labels":{"S":"","E":"","H":"","T":"","X":"","R":"Rest"},"phases":[4 names],"threshold":[],"thresholdMin":[],"easy":[],"long":[],"deload":{},"strength":[],"speed":[],"keyLifts":[],"classNote":"","trainTime":"","fasted":false,"goalLine":""},"nutrition":{"rest":{},"training":{},"match":{},"micros":{},"fastH":0},"rules":"","about":"","portionWho":"","workLabel":"","approach":"","summary":""}`;
  try{const out=await sample.json(prompt,{maxTokens:16000});
    if(!out||!out.plan||!out.nutrition)throw {code:'invalid_json'};
    out.plan=sanitizePlan(out.plan);
    if(!KTRAINS(a)){const pw=+a.perWeek||2,P=out.plan;const gym=/goblet|barbell|dumbbell|kettlebell|deadlift|bench|press(?!-up)|chest[- ]supported|row\b|cable|machine|squat rack|trap[- ]bar|lunge.*weight|weighted/i;
      let sN=0;P.week=(P.week||[]).map(c=>c==='T'||(c==='H'&&!a.fixed)?'E':c==='S'?(pw>=3&&!sN++?'S':'E'):c);
      P.labels=Object.assign({},P.labels,{E:/walk|cycle/i.test((P.labels||{}).E||'')?P.labels.E:'Walk or easy cycle',X:/walk|cycle/i.test((P.labels||{}).X||'')?P.labels.X:'Longer walk',S:'Home moves',R:'Rest'});
      if(!Array.isArray(P.strength)||P.strength.some(e=>gym.test([].concat(e&&e.nm||'').join(' '))))P.strength=[{tag:'1',nm:'Sit-to-stand from a chair',cue:'Slow and steady, use your hands if you need to',d:['2 x 6','2 x 8','2 x 10','3 x 10']},{tag:'2',nm:'Wall press-ups',cue:'Hands on the wall at shoulder height',d:['2 x 6','2 x 8','2 x 10','3 x 10']},{tag:'3',nm:'Standing calf raises',cue:'Hold a chair or counter for balance',d:['2 x 10','2 x 12','2 x 15','3 x 15']},{tag:'4',nm:'Gentle bridge',cue:'Lie on your back, knees bent, lift your hips a little',d:['2 x 6','2 x 8','2 x 10','3 x 10']}];
      P.keyLifts=[]}['rest','training','match'].forEach(k=>{out.nutrition[k]=Object.assign({},DEF_DAYT[k],out.nutrition[k]||{})});
    ob.result=out;ob.busy=false;obSave();
  }catch(e){ob.busy=false;ob.err=e&&e.code==='rate_limited'?'Too many requests just now. Try again in a minute.':'The build did not finish. Tap Build my plan to try again.'}
  obRender();
}
async function saveProfile(p){
  const {error}=await sb.from('profiles').upsert({id:UID,data:p,updated_at:new Date().toISOString()});if(error){toast('Could not save your profile: '+error.message,5000);return false}
  PROFILE=p;return true;
}
async function obStart(owner){
  let p;
  if(owner){obRead();p={about:ob.a.about||'the owner',portionWho:'an 82 kg active man',workLabel:'Farm',approach:'lower-carb, not strict keto',useGuide:true,plan:JSON.parse(JSON.stringify(DEF_PLAN)),nutrition:{rest:DEF_DAYT.rest,training:DEF_DAYT.training,match:DEF_DAYT.match},answers:ob.a,createdAt:new Date().toISOString()}}
  else{const r=ob.result;p={about:r.about,portionWho:r.portionWho,workLabel:r.workLabel,approach:r.approach,rules:r.rules,useGuide:false,plan:r.plan,nutrition:r.nutrition,answers:ob.a,createdAt:new Date().toISOString()};if(isNum(r.nutrition.fastH))meta.settings=Object.assign({},meta.settings||{},{fastH:+r.nutrition.fastH||14,trainTime:r.plan.trainTime})}
  if(!await saveProfile(p))return;
  if(meta.settings)try{await metaCol.doc('settings').set(meta.settings)}catch(e){}
  try{localStorage.removeItem('ob_'+UID)}catch(e){}
  if(kitchen().length)enterApp();else{kSetup={sel:[],text:'',busy:false,msg:''};showGate(kitchenSetupHTML())}
}

// ================= mobility, exercise how-to and recipes =================
// ---------- body map ----------
const BODY_FRONT={neck:[60,44,7,5],shoulders:[[36,58,9,7],[84,58,9,7]],chest:[60,72,16,9],core:[60,100,13,13],hipflexors:[[50,126,7,7],[70,126,7,7]],groin:[60,138,6,6],quads:[[49,160,8,15],[71,160,8,15]],knees:[[49,186,6,6],[71,186,6,6]],ankles:[[49,240,6,5],[71,240,6,5]]};
const BODY_BACK={neck:[60,44,7,5],upperback:[60,74,17,11],lowerback:[60,106,12,9],glutes:[[51,128,9,8],[69,128,9,8]],hamstrings:[[49,163,8,15],[71,163,8,15]],calves:[[49,210,7,14],[71,210,7,14]]};
const REG_LABEL={neck:'Neck',shoulders:'Shoulders',chest:'Chest',upperback:'Upper back',lowerback:'Lower back',core:'Core',hipflexors:'Hip flexors',glutes:'Glutes',groin:'Groin',quads:'Quads',hamstrings:'Hamstrings',knees:'Knees',calves:'Calves',ankles:'Ankles & feet'};
function bodySVG(regs,size){
  const on=new Set(regs||[]);const sil=`<circle cx="60" cy="22" r="13"/><rect x="54" y="34" width="12" height="10" rx="3"/><rect x="36" y="46" width="48" height="76" rx="18"/><rect x="22" y="50" width="12" height="70" rx="6"/><rect x="86" y="50" width="12" height="70" rx="6"/><rect x="40" y="114" width="40" height="30" rx="10"/><rect x="41" y="138" width="16" height="112" rx="8"/><rect x="63" y="138" width="16" height="112" rx="8"/>`;
  const dots=map=>Object.entries(map).map(([k,v])=>(Array.isArray(v[0])?v:[v]).map(([x,y,rx,ry])=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:${on.has(k)?'var(--accent)':'transparent'};opacity:.95"/>`).join('')).join('');
  const fig=(map,lab,dx)=>`<g transform="translate(${dx},0)"><g style="fill:var(--line)">${sil}</g>${dots(map)}<text x="60" y="270" text-anchor="middle" class="ax">${lab}</text></g>`;
  return `<svg viewBox="0 0 250 278" width="${size||170}" class="body" role="img" aria-label="Areas worked: ${[...on].map(r=>REG_LABEL[r]).join(', ')||'none'}">${fig(BODY_FRONT,'Front',0)}${fig(BODY_BACK,'Back',130)}</svg>`;
}
// ---------- pose library ----------
// id, name, regions, hold seconds, per side, cues, common mistake, easier option
const POSES=[
 ['catcow','Cat-cow',['upperback','lowerback'],45,false,['On hands and knees, hands under shoulders.','Breathe in: drop the belly, lift the chest. Breathe out: round the back, tuck the chin.','Move slowly through the whole spine.'],'Rushing it. One slow breath each way.','Smaller range, or seated on a chair.'],
 ['child','Child\'s pose',['lowerback','upperback','shoulders'],60,false,['Kneel, big toes together, knees wide.','Sit hips back to heels, reach arms long in front.','Let the forehead rest and breathe into the back.'],'Hips floating high. Let them sink.','Put a pillow under the hips or chest.'],
 ['needle','Thread the needle',['upperback','shoulders'],40,true,['On hands and knees.','Slide one arm under the other, palm up, shoulder and ear to the floor.','Keep hips stacked over knees.'],'Hips drifting sideways.','Stop when the shoulder is halfway down.'],
 ['openbook','Open book',['upperback','chest'],40,true,['Lie on your side, knees bent to 90°, arms straight in front.','Open the top arm like a book, following the hand with your eyes.','Keep the knees together on the floor.'],'Knees lifting as you rotate.','Put a pillow between the knees.'],
 ['couch','Couch stretch',['hipflexors','quads'],60,true,['Back knee against a wall or sofa, shin up it; front foot flat.','Squeeze the glute of the back leg and tuck the pelvis.','Lift the chest tall only as far as it stays comfortable.'],'Arching the lower back instead of tucking the pelvis.','Move the knee further from the wall, hands on the front knee.'],
 ['hipflexor','Half-kneeling hip flexor stretch',['hipflexors'],45,true,['Kneel on one knee, other foot in front.','Tuck the pelvis, squeeze the back glute, shift forward a little.','Reach the arm on the kneeling side overhead.'],'Leaning forward from the back instead of tucking.','Pad under the knee, smaller lunge.'],
 ['ninety','90/90 hip switches',['glutes','hipflexors'],60,false,['Sit with both knees bent to 90°, one in front, one to the side.','Rotate both knees to the other side, keeping feet on the floor.','Sit tall, hands behind you if needed.'],'Slumping. Lead with the chest.','Lean back on your hands.'],
 ['pigeon','Pigeon',['glutes'],60,true,['Front shin across the body, back leg long behind.','Square the hips to the floor.','Fold forward over the front leg, breathing slowly.'],'Hip collapsing to one side.','Lie on your back and do the figure-4 instead.'],
 ['fig4','Figure-4 stretch',['glutes','lowerback'],45,true,['Lie on your back, cross one ankle over the other knee.','Pull the bottom thigh towards your chest.','Keep the head and shoulders relaxed on the floor.'],'Lifting the head and straining the neck.','Keep the bottom foot on the floor.'],
 ['frog','Frog stretch',['groin'],60,false,['On hands and knees, slide the knees wide, ankles in line with knees.','Rock the hips back gently.','Rest on the forearms.'],'Forcing range. Ease in.','Knees less wide.'],
 ['adductor','Adductor rock-back',['groin','hamstrings'],45,true,['Kneel on one knee, other leg straight out to the side.','Rock the hips back and forward slowly.','Keep the back flat.'],'Rounding the back.','Shorter range of rocking.'],
 ['butterfly','Butterfly',['groin','hipflexors'],45,false,['Sit, soles of feet together, knees out.','Sit tall and let the knees drop.','Hinge forward slightly from the hips.'],'Pushing knees down with the hands.','Sit on a cushion.'],
 ['hamstrap','Lying hamstring stretch',['hamstrings'],45,true,['Lie on your back, strap or towel around one foot.','Raise the straight leg until you feel a stretch.','Keep the other leg long on the floor.'],'Bending the knee of the raised leg.','Bend the bottom knee, foot flat.'],
 ['fold','Seated forward fold',['hamstrings','lowerback'],60,false,['Sit with legs straight.','Hinge from the hips, reaching for the shins or feet.','Keep a long spine; breathe out to go a little further.'],'Rounding hard through the back.','Bend the knees slightly.'],
 ['quad','Standing quad stretch',['quads','hipflexors'],30,true,['Stand tall, hold a wall for balance.','Pull one heel to the glute.','Knees together, pelvis tucked.'],'Knee drifting forward or out.','Use a strap around the ankle.'],
 ['calf','Calf wall stretch',['calves'],40,true,['Hands on a wall, one leg back, heel down, knee straight.','Lean the hips forward.','Back foot points straight ahead.'],'Heel lifting off the floor.','Shorter stance.'],
 ['soleus','Bent-knee calf stretch',['calves','ankles'],40,true,['Same as the calf stretch, but bend the back knee.','Keep the heel down.','Feel it low in the calf, near the Achilles.'],'Heel lifting.','Smaller knee bend.'],
 ['kneewall','Knee-to-wall rocks',['ankles','calves'],40,true,['Foot a hand-width from a wall.','Drive the knee forward to touch the wall, heel down.','Rock in and out slowly.'],'Heel lifting.','Move the foot closer to the wall.'],
 ['dog','Downward dog, pedalling',['calves','hamstrings','shoulders'],45,false,['Hands and feet on the floor, hips high.','Bend one knee, press the other heel down, then switch.','Push the floor away with the hands.'],'Rounded back. Bend the knees to keep it long.','Hands on a chair seat.'],
 ['wgs','World\'s greatest stretch',['hipflexors','hamstrings','upperback'],40,true,['Step into a long lunge, hand inside the front foot.','Rotate the same-side arm up to the ceiling.','Return and straighten the front leg to feel the hamstring.'],'Back knee bent and slack.','Drop the back knee to the floor.'],
 ['squat','Deep squat hold',['ankles','groin','hipflexors'],60,false,['Feet shoulder-width, toes slightly out.','Sit down as low as you can, heels down.','Elbows push the knees out, chest up.'],'Heels lifting.','Hold a door frame, or heels on a book.'],
 ['doorway','Doorway chest stretch',['chest','shoulders'],40,true,['Forearm on a door frame, elbow at shoulder height.','Step through gently until you feel the chest open.','Keep the shoulder down, away from the ear.'],'Shrugging up.','Lower the elbow a little.'],
 ['crossbody','Cross-body shoulder stretch',['shoulders','upperback'],30,true,['Bring one arm across the chest.','Hold above the elbow with the other hand.','Keep the shoulder down.'],'Twisting the trunk.','Lighter pull.'],
 ['neckside','Neck side stretch',['neck'],30,true,['Sit tall.','Tilt the ear towards the shoulder.','Let the opposite shoulder sink down.'],'Pulling hard on the head.','Smaller tilt, no hand.'],
 ['chintuck','Chin tucks',['neck','upperback'],30,false,['Sit or stand tall.','Glide the chin straight back, making a double chin.','Hold 3 seconds, release, repeat.'],'Tipping the head down instead of back.','Do it lying down.'],
 ['twist','Lying twist',['lowerback','glutes'],45,true,['Lie on your back, pull one knee across the body.','Arms out wide, look the other way.','Let the shoulders stay down.'],'Forcing the knee to the floor.','Knee on a pillow.'],
 ['sphinx','Sphinx',['lowerback','core'],40,false,['Lie face down, forearms under the shoulders.','Lift the chest, keep the hips down.','Relax the glutes and breathe.'],'Shrugging the shoulders up.','Lower the chest a little.'],
 ['rockback','Quadruped rock-back',['hipflexors','lowerback','glutes'],40,false,['On hands and knees.','Rock the hips back towards the heels, keeping the back flat.','Return slowly.'],'Rounding the back at the bottom.','Shorter range.'],
 ['shin','Kneeling shin stretch',['ankles','quads'],30,false,['Kneel with the tops of the feet flat.','Sit back towards the heels.','Lean back on the hands for more.'],'Forcing it if the ankles complain.','Towel under the ankles.'],
 ['bridge','Glute bridge hold',['glutes','core','hamstrings'],30,false,['Lie on your back, knees bent, feet flat.','Push through the heels, lift the hips.','Squeeze the glutes, ribs down.'],'Arching the lower back.','Lower lift.'],
 ['breath','Box breathing',['core'],60,false,['Lie on your back, one hand on the belly.','Breathe in for 4, hold 4, out for 4, hold 4.','Let the belly rise, not the shoulders.'],'Breathing into the chest.','In for 3, out for 5.']
].map(([id,name,regs,hold,sides,cues,mistake,easier])=>({id,name,regs,hold,sides,cues,mistake,easier}));
const P=id=>POSES.find(p=>p.id===id);
const ROUTINES=[
 ['wake','Morning wake-up','Spine, hips and calves before the day.',['catcow','wgs','dog','openbook','squat','chintuck']],
 ['postrun','After a run','Calves, quads, hamstrings and hips.',['calf','soleus','quad','hamstrap','fig4','hipflexor']],
 ['hips','Hips and hamstrings','The full lower-body unlock.',['ninety','pigeon','frog','couch','hamstrap','fold','adductor']],
 ['desk','Desk and driving reset','Undo hours of sitting.',['chintuck','neckside','doorway','needle','hipflexor','sphinx']],
 ['bed','Before bed','Slow, quiet and calming.',['child','twist','fig4','butterfly','breath']],
 ['recovery','Full-body recovery','A longer session for rest days.',['catcow','child','needle','ninety','pigeon','couch','hamstrap','calf','doorway','twist','breath']]
].map(([id,name,desc,ids])=>({id,name,desc,poses:ids}));
const AREA_REGS={'Hamstring':['hamstrings'],'Groin / adductor':['groin'],'Quad':['quads'],'Calf / Achilles':['calves','ankles'],'Knee':['quads','hamstrings','calves'],'Ankle':['ankles','calves'],'Foot':['ankles','calves'],'Hip / glute':['glutes','hipflexors'],'Lower back':['lowerback','hipflexors','glutes'],'Shoulder':['shoulders','chest','upperback'],'Neck / upper back':['neck','upperback'],'Other':[]};
const TYPE_REGS={S:['glutes','hamstrings','hipflexors','upperback'],E:['calves','hamstrings','hipflexors'],T:['calves','hamstrings','quads','hipflexors'],X:['hamstrings','groin','hipflexors','calves'],H:['hipflexors','upperback','quads','calves'],R:['lowerback','hipflexors','upperback']};
const stepSecs=p=>p.hold*(p.sides?2:1)+8;
function routineMins(ids){return Math.round(ids.map(P).reduce((a,p)=>a+stepSecs(p),0)/60)}
let mState={mins:15,area:null};
function todayFocus(){
  const k=iso(todayDate()),d=D()[k]||{},y=D()[iso(addD(todayDate(),-1))]||{};const w={};const why=[];const avoid=new Set();
  const add=(rs,n)=>rs.forEach(r=>w[r]=(w[r]||0)+n);
  (d.niggles||[]).forEach(n=>{const rs=AREA_REGS[n.area]||[];if(+n.pain>=5){rs.forEach(r=>avoid.add(r));why.push(`${n.side&&n.side!=='Both'?n.side+' ':''}${n.area.toLowerCase()} ${n.pain}/10: kept off it`)}else{add(rs,3);why.push(`${n.side&&n.side!=='Both'?n.side+' ':''}${n.area.toLowerCase()} ${n.pain}/10`)}});
  const yp=planFor(addD(todayDate(),-1)),tp=planFor(todayDate());const ylg=L()[iso(addD(todayDate(),-1))];
  if(ylg&&ylg.status!=='missed'&&yp){add(TYPE_REGS[ylg.type]||[],2);why.push(`${TNAME[ylg.type]} yesterday`)}
  if(tp&&tp.type!=='R'&&!tp.pre){add(TYPE_REGS[tp.type]||[],1);why.push(`${TNAME[tp.type]} today`)}
  const sit=(+y.deskHrs||0)+(+y.carHrs||0);if(sit>=3){add(['hipflexors','chest','neck','upperback'],2);why.push(`${sit} h sitting yesterday`)}
  if(isNum(d.sore)&&d.sore>=4){add(['lowerback','glutes','hamstrings','quads'],1);why.push('feeling sore')}
  if(!Object.keys(w).length){add(['hipflexors','hamstrings','upperback','calves','glutes'],1);why.push('general full-body')}
  return {w,why,avoid};
}
function buildRoutine(w,avoid,mins){
  const scored=POSES.filter(p=>p.id!=='breath'&&!p.regs.some(r=>avoid.has(r))).map(p=>({p,s:p.regs.reduce((a,r)=>a+(w[r]||0),0)+Math.random()*.3})).filter(x=>x.s>0.3).sort((a,b)=>b.s-a.s);
  const out=[],cover={};let t=0;const cap=mins*60;
  for(const {p} of scored){if(t+stepSecs(p)>cap+20)continue;if(p.regs.every(r=>(cover[r]||0)>=2))continue;out.push(p.id);p.regs.forEach(r=>cover[r]=(cover[r]||0)+1);t+=stepSecs(p)}
  const order=['catcow','child','chintuck','needle','openbook','dog','wgs','squat','ninety','pigeon','fig4','frog','adductor','butterfly','couch','hipflexor','quad','hamstrap','fold','calf','soleus','kneewall','shin','doorway','crossbody','neckside','rockback','bridge','sphinx','twist'];
  out.sort((a,b)=>order.indexOf(a)-order.indexOf(b));
  if(t+68<=cap+30)out.push('breath');
  return out;
}
function mobilityDone(k){return (D()[k]&&D()[k].mobility)||[]}
function poseRow(p){return `<button type="button" class="pose" data-pose="${p.id}"><span class="pt2">${esc(p.name)}</span><span class="ps2">${p.hold}s${p.sides?' each side':''}</span><span class="pr2">${p.regs.map(r=>REG_LABEL[r]).join(' · ')}</span></button>`}
function viewMobility(){
  const k=iso(todayDate());const f=todayFocus();const ids=buildRoutineCached(f,mState.mins);const regs=[...new Set(ids.flatMap(id=>P(id).regs))];
  mState.today=ids;
  const wk=[];let wmins=0;for(let i=6;i>=0;i--){const dd=addD(todayDate(),-i),m=mobilityDone(iso(dd));const mins=m.reduce((a,x)=>a+(+x.min||0),0);wmins+=mins;wk.push({d:dd,mins})}
  const area=mState.area;const lib=area?POSES.filter(p=>p.regs.includes(area)):[];
  return `<section class="mobhero"><div class="mh1"><div style="min-width:0"><span class="dl">Made for today</span><h2>${routineMins(ids)} minute loosen-out</h2><div class="whychips">${f.why.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>${bodySVG(regs,150)}</div>
    <div class="field"><span class="label">Length</span><div class="seg small">${[10,15,20].map(m=>`<button type="button" data-mmins="${m}" aria-pressed="${mState.mins===m}">${m} min</button>`).join('')}</div></div>
    <button type="button" class="primary" data-mstart="today">Start follow-along</button>
    <details class="wu"><summary>${ids.length} stretches in this session</summary>${ids.map(id=>poseRow(P(id))).join('')}</details>
    ${f.avoid.size?`<div class="alert amber">Anything at 5/10 pain or more is left out. Get it checked by a physio.</div>`:''}</section>
   <section class="panel"><div class="ph"><h3>This week</h3><span class="ds">${wmins} min</span></div><div class="mweek">${wk.map(x=>`<div><i style="height:${Math.min(44,x.mins*2)}px;${x.mins?'':'background:var(--line)'}"></i><span>${DOW[(x.d.getDay()+6)%7][0]}</span></div>`).join('')}</div></section>
   <div class="sect">Routines</div>
   <div class="rgrid">${ROUTINES.map(r=>{const rg=[...new Set(r.poses.flatMap(id=>P(id).regs))];return `<button type="button" class="rcard" data-mstart="${r.id}"><span class="rm num">${routineMins(r.poses)}<small>min</small></span><b>${esc(r.name)}</b><span>${esc(r.desc)}</span><em>${rg.slice(0,4).map(x=>REG_LABEL[x]).join(' · ')}</em></button>`}).join('')}</div>
   <div class="sect">Stretch library</div>
   <section class="panel"><div class="tags">${Object.entries(REG_LABEL).map(([r,l])=>`<button type="button" data-marea="${r}" aria-pressed="${area===r}">${l}</button>`).join('')}</div>
    ${area?lib.map(poseRow).join(''):'<div class="ds">Pick an area to see stretches for it. Tap any stretch for how to do it.</div>'}</section>`;
}
let _rc={key:'',ids:[]};
function buildRoutineCached(f,mins){const key=iso(todayDate())+JSON.stringify(f.w)+[...f.avoid].join()+mins;if(_rc.key!==key)_rc={key,ids:buildRoutine(f.w,f.avoid,mins)};return _rc.ids}
// ---------- follow-along player ----------
let pl=null,plTimer=null,audioCtx=null,wakeLock=null;
function beep(f,ms){try{if(!audioCtx)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=f;g.gain.value=.08;o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+ms/1000)}catch(e){}}
function startPlayer(src){
  const ids=src==='today'?mState.today:(ROUTINES.find(r=>r.id===src)||{}).poses;if(!ids||!ids.length)return;
  const name=src==='today'?'Made for today':ROUTINES.find(r=>r.id===src).name;
  const steps=[];ids.forEach(id=>{const p=P(id);if(p.sides){steps.push({p,side:'Left'});steps.push({p,side:'Right'})}else steps.push({p,side:''})});
  pl={name,steps,i:0,phase:'ready',left:5,paused:false,startedAt:Date.now(),done:0,regs:[...new Set(ids.flatMap(id=>P(id).regs))]};
  try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)()}catch(e){}
  try{navigator.wakeLock&&navigator.wakeLock.request('screen').then(w=>wakeLock=w).catch(()=>{})}catch(e){}
  primeAudio();keepAwake(true);if(TTS_ON&&AUD.voice){ttsGet('Hold, and breathe slowly.');steps.forEach((x,i)=>ttsGet(mobLine(i,'ready')))}
  $('#player').hidden=false;$('#fab').hidden=true;drawPlayer();setTimeout(()=>say(mobLine(0,'ready')),300);clearInterval(plTimer);let last=Date.now();
  plTimer=setInterval(()=>{const now=Date.now(),dt=(now-last)/1000;last=now;if(!pl||pl.paused)return;pl.left-=dt;if(pl.left<=3.05&&pl.left>2.95-dt&&pl.phase==='hold')beep(660,120);if(pl.left<=0)nextPhase();else drawPlayerTime()},200);
}
function mobLine(i,ph){const st=pl.steps[i];if(!st)return '';if(ph==='hold')return 'Hold, and breathe slowly.';const sw=i&&pl.steps[i-1].p===st.p;return sw?`Switch sides. ${st.side} side.`:`${st.p.name}${st.side?', '+st.side+' side':''}. ${st.p.cues[0]||''}`}
function nextPhase(){
  if(pl.phase==='ready'){pl.phase='hold';pl.left=pl.steps[pl.i].p.hold;beep(880,200);say(mobLine(pl.i,'hold'))}
  else{pl.done+=pl.steps[pl.i].p.hold;pl.i++;if(pl.i>=pl.steps.length){finishPlayer(true);return}const sw=pl.steps[pl.i].p===pl.steps[pl.i-1].p;pl.phase='ready';pl.left=sw?4:7;beep(520,180);say(mobLine(pl.i,'ready'))}
  drawPlayer();
}
function drawPlayerTime(){const t=$('#plTime');if(t)t.textContent=Math.ceil(pl.left);const r=$('#plRing');if(r){const s=pl.steps[pl.i];const tot=pl.phase==='ready'?7:s.p.hold;r.setAttribute('stroke-dasharray',`${(2*Math.PI*96*Math.max(0,pl.left)/tot).toFixed(1)} 999`)}}
function drawPlayer(){
  const s=pl.steps[pl.i],nx=pl.steps[pl.i+1];const prog=pl.i/pl.steps.length*100;const ready=pl.phase==='ready';
  $('#player').innerHTML=`<div class="plwrap"><div class="plhead"><span>${esc(pl.name)}</span><span class="num">${pl.i+1} / ${pl.steps.length}</span><button type="button" class="pli ${AUD.voice?'':'off'}" id="plVc" aria-label="Voice: ${AUD.voice?AUD.who:'off'}">🗣</button><button type="button" class="x" id="plClose" aria-label="End session">×</button></div>
    <div class="prog"><i style="width:${prog}%"></i></div>
    <div class="plmain"><span class="dl" style="color:${ready?'var(--warn)':'var(--accent)'}">${ready?(pl.i&&pl.steps[pl.i-1].p===s.p?'Switch sides':'Get into position'):'Hold and breathe'}</span>
      <h2>${esc(s.p.name)}${s.side?` <small>${s.side}</small>`:''}</h2>
      <div class="plring"><svg viewBox="0 0 220 220" width="220" height="220"><circle cx="110" cy="110" r="96" style="fill:none;stroke:var(--line);stroke-width:12"/><circle id="plRing" cx="110" cy="110" r="96" transform="rotate(-90 110 110)" style="fill:none;stroke:${ready?'var(--warn)':'var(--accent)'};stroke-width:12;stroke-linecap:round" stroke-dasharray="603 999"/></svg><b id="plTime" class="num">${Math.ceil(pl.left)}</b></div>
      <div class="plbody">${bodySVG(s.p.regs,140)}<ol>${s.p.cues.map(c=>`<li>${esc(c)}</li>`).join('')}</ol></div>
      ${nx?`<div class="plnext">Next: <b>${esc(nx.p.name)}${nx.side?' · '+nx.side:''}</b></div>`:'<div class="plnext">Last one</div>'}</div>
    <div class="plctl"><button type="button" class="ghost" id="plPrev" aria-label="Previous">‹ Back</button><button type="button" class="primary" id="plPause">${pl.paused?'Resume':'Pause'}</button><button type="button" class="ghost" id="plSkip" aria-label="Skip">Skip ›</button></div></div>`;
  drawPlayerTime();
}
async function finishPlayer(complete){
  clearInterval(plTimer);try{wakeLock&&wakeLock.release()}catch(e){}wakeLock=null;
  const mins=Math.max(1,Math.round((complete?pl.steps.reduce((a,s)=>a+s.p.hold,0):pl.done)/60));const name=pl.name,regs=pl.regs;pl=null;
  const k=iso(todayDate());const cur=(days[k]&&days[k].mobility)||[];
  if(mins>=1&&!sampleMode){const habits=[...new Set(((days[k]&&days[k].habits)||[]).concat(['Mobility / stretch']))];await persistDay(k,{mobility:cur.concat([{name,min:mins,regs,at:fmtT(new Date().getHours()*60+new Date().getMinutes())}]),habits})}
  $('#player').innerHTML=`<div class="plwrap"><div class="plmain" style="justify-content:center"><span class="dl" style="color:var(--ok)">${complete?'Session complete':'Session ended'}</span><h2>${mins} minute${mins===1?'':'s'}: ${esc(name.toLowerCase())}</h2>${bodySVG(regs,200)}<p class="ds">Logged to today's check-in as mobility.</p><button type="button" class="primary" id="plDone" style="flex:none;min-width:200px">Done</button></div></div>`;
}
function closePlayer(){clearInterval(plTimer);sayStop();keepAwake(false);pl=null;$('#player').hidden=true;$('#player').innerHTML='';updateFab();render()}
// ---------- how-to sheets ----------
const HOWTO_SKIP=/\b(run|runs|jog|warm-up|cool-down|time trial|re-test|class|reps|test|drinks)\b|×|'|^\d/i;
const ytLink=n=>`https://www.youtube.com/results?search_query=${encodeURIComponent(n+' exercise technique')}`;
function openSheet(html){const s=$('#sheet');s.innerHTML=`<div class="vsheet" role="dialog">${html}</div>`;s.hidden=false;$('#fab').hidden=true}
function closeSheet(){const s=$('#sheet');s.hidden=true;s.innerHTML='';updateFab()}
function poseSheet(p){
  openSheet(`<div class="vh"><b>${esc(p.name)}</b><span>${p.hold} s${p.sides?' each side':''}</span><button type="button" class="x" data-sclose aria-label="Close">×</button></div>
    <div class="howgrid">${bodySVG(p.regs,150)}<div><span class="label">Works</span><div class="ds">${p.regs.map(r=>REG_LABEL[r]).join(', ')}</div></div></div>
    <span class="label">How to do it</span><ol class="howl">${p.cues.map(c=>`<li>${esc(c)}</li>`).join('')}</ol>
    <div class="note" style="margin:0"><b style="color:var(--warn)">Watch for:</b> ${esc(p.mistake)}</div><div class="note" style="margin:0"><b style="color:var(--ok)">Easier:</b> ${esc(p.easier)}</div>
    <a class="ghost vidlink" href="${ytLink(p.name+' stretch')}" target="_blank" rel="noopener">▶ Watch video demos</a>`);
}
let howBusy=false;
async function howtoSheet(name){
  const g=meta.guides&&meta.guides[name.toLowerCase()];
  const head=`<div class="vh"><b>${esc(name)}</b><span>How to</span><button type="button" class="x" data-sclose aria-label="Close">×</button></div>`;
  if(g){openSheet(head+`<div class="howgrid">${bodySVG(g.areas,150)}<div><span class="label">Works</span><div class="ds">${(g.areas||[]).map(r=>REG_LABEL[r]).join(', ')}</div>${g.why?`<div class="ds" style="margin-top:8px">${esc(g.why)}</div>`:''}</div></div>
    ${g.setup&&g.setup.length?`<span class="label">Set up</span><ol class="howl">${g.setup.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:''}
    <span class="label">The movement</span><ol class="howl">${(g.steps||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ol>
    ${g.breathing?`<div class="ds"><b style="color:var(--fg)">Breathing:</b> ${esc(g.breathing)}</div>`:''}
    ${(g.mistakes||[]).length?`<div class="note" style="margin:0"><b style="color:var(--warn)">Common mistakes:</b><ul class="howm">${g.mistakes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}
    <div class="row2"><div class="note" style="margin:0"><b style="color:var(--ok)">Easier:</b> ${esc(g.easier||'')}</div><div class="note" style="margin:0"><b style="color:var(--s)">Harder:</b> ${esc(g.harder||'')}</div></div>
    <a class="ghost vidlink" href="${ytLink(name)}" target="_blank" rel="noopener">▶ Watch video demos</a>`);return}
  const pose=POSES.find(p=>p.name.toLowerCase()===name.toLowerCase());if(pose){poseSheet(pose);return}
  openSheet(head+`<div class="ds" role="status">${sample?'Writing the guide… a few seconds.':'Guides are not available here.'}</div><a class="ghost vidlink" href="${ytLink(name)}" target="_blank" rel="noopener">▶ Watch video demos</a>`);
  if(!sample||howBusy)return;howBusy=true;
  try{const out=await sample.json(`Write a short, clear technique guide for the exercise "${name}" for ${ABOUT||'an adult who trains'}. Plain words, no jargon.
"areas": the main areas worked, using only these keys: ${JSON.stringify(Object.keys(REG_LABEL))}.
Reply with ONLY JSON: {"areas":[],"why":"one line on why it's in their plan","setup":["2-3 short lines"],"steps":["3-5 short lines"],"breathing":"one line","mistakes":["2-3 common mistakes"],"easier":"one easier version","harder":"one harder version"}`,{modelTier:'quick'});
    const gd={areas:(out.areas||[]).filter(r=>REG_LABEL[r]),why:String(out.why||'').slice(0,200),setup:(out.setup||[]).map(String).slice(0,4),steps:(out.steps||[]).map(String).slice(0,6),breathing:String(out.breathing||'').slice(0,200),mistakes:(out.mistakes||[]).map(String).slice(0,4),easier:String(out.easier||'').slice(0,200),harder:String(out.harder||'').slice(0,200)};
    const all=Object.assign({},meta.guides||{},{[name.toLowerCase()]:gd});await persistMeta('guides',all);howBusy=false;
    if(!$('#sheet').hidden)howtoSheet(name);
  }catch(e){howBusy=false;const s=$('#sheet .ds');if(s)s.textContent='Could not write the guide. Try again in a minute.'}
}
// ---------- recipes ----------
let recBusy=false;
async function recipeSheet(ref,fetchIt){
  const [k,ix]=[ref.slice(0,10),+ref.slice(11)];const pd=planDay(k);const m=pd&&pd.meals[ix];if(!m)return;
  const logged=planLogged(k,ix);const canAte=!/fasted/i.test(m.slot||'')&&k<=iso(todayDate());
  openSheet(`<div class="vh"><b>${esc(m.name)}</b><span>${esc(m.slot||'')}${m.time?' · '+esc(m.time):''}</span><button type="button" class="x" data-sclose aria-label="Close">×</button></div>
    <div class="recmeta">${m.prep?`<span><b class="num">${m.prep}</b> min</span>`:''}${m.servings?`<span><b class="num">${m.servings}</b> serving${m.servings>1?'s':''}</span>`:''}<span><b class="num">${kcalOf(m)}</b> kcal</span><span><b class="num">${Math.round(+m.protein||0)}</b>g protein</span><span><b class="num">${Math.round(+m.carbs||0)}</b>g carbs</span><span><b class="num">${Math.round(+m.fat||0)}</b>g fat</span></div>
    <span class="label">Ingredients</span><ul class="ingr">${(m.items||[]).map(x=>`<li><b>${esc(x.qty||'')}</b> ${esc(x.name)}</li>`).join('')}</ul>
    <span class="label">Method</span>${m.method&&m.method.length?`<ol class="howl">${m.method.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${m.tip?`<div class="note" style="margin:0"><b>Tip:</b> ${esc(m.tip)}</div>`:''}`:`<div class="ds" id="recStatus">${recBusy?'Writing the recipe…':'No method yet for this meal.'}</div>${sample?`<button type="button" class="ghost" data-recget="${ref}" style="color:var(--fg)" ${recBusy?'disabled':''}>Get the recipe</button>`:''}`}
    ${canAte?(logged?'<div class="pl" style="grid-row:auto">Logged</div>':`<button type="button" class="primary" data-ate="${ref}" data-sclose style="flex:none">Ate this</button>`):''}`);
  if(fetchIt&&!(m.method&&m.method.length)&&sample&&!recBusy){recBusy=true;recipeSheet(ref);
    try{const out=await sample.json(`Write a simple home recipe for "${m.name}" using these ingredients: ${(m.items||[]).map(x=>`${x.qty} ${x.name}`).join(', ')}. For ${ABOUT||'one active adult'}. 3-6 short steps a non-cook can follow.
Reply with ONLY JSON: {"prep":minutes,"servings":1,"method":["step"],"tip":"one practical tip, e.g. batch-cook or swap"}`,{modelTier:'quick'});
      const p=clone(meta.plan);const mm=p.days.find(d=>d.date===k).meals[ix];mm.method=(out.method||[]).map(String).slice(0,8);mm.prep=+out.prep||null;mm.servings=+out.servings||1;mm.tip=String(out.tip||'').slice(0,200);
      await persistMeta('plan',p);recBusy=false;if(!$('#sheet').hidden)recipeSheet(ref);
    }catch(e){recBusy=false;const st=$('#recStatus');if(st)st.textContent='Could not get the recipe. Try again.'}}
}

document.addEventListener('click',e=>{
  const c=sel=>e.target.closest&&e.target.closest(sel);let x;
  if(c('[data-sclose]')&&!c('[data-ate]')){closeSheet();return}
  if(c('[data-ate]')&&c('#sheet')){setTimeout(closeSheet,50)}
  if(x=c('[data-mmins]')){mState.mins=+x.dataset.mmins;render();return}
  if(x=c('[data-mstart]')){startPlayer(x.dataset.mstart);return}
  if(x=c('[data-marea]')){mState.area=mState.area===x.dataset.marea?null:x.dataset.marea;render();return}
  if(x=c('[data-pose]')){poseSheet(P(x.dataset.pose));return}
  if(x=c('[data-howto]')){howtoSheet(x.dataset.howto);return}
  if(x=c('[data-recget]')){recipeSheet(x.dataset.recget,true);return}
  if(x=c('[data-recipe]')){recipeSheet(x.dataset.recipe,false);return}
  if(c('#plPause')&&pl){pl.paused=!pl.paused;drawPlayer();return}
  if(c('#plSkip')&&pl){pl.left=0;nextPhase();return}
  if(c('#plPrev')&&pl){if(pl.phase==='hold'&&pl.left<pl.steps[pl.i].p.hold-2){pl.phase='ready';pl.left=5}else if(pl.i>0){pl.i--;pl.phase='ready';pl.left=5}drawPlayer();return}
  if(c('#plClose')&&pl){finishPlayer(false);return}
  if(c('#plDone')){closePlayer();return}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#sheet').hidden)closeSheet()});

document.addEventListener('click',e=>{const c=q=>e.target.closest&&e.target.closest(q);let x;
  if(x=c('[data-wp]')){readAll();const w=workPrefs();w[x.dataset.wp]=!w[x.dataset.wp];persistMeta('work',w).then(()=>render());return}
  if(c('#ciFill')){if(!ciState.busy)ciFill();return}
  if(c('#ciHide')){const t=$('#ci-say');if(t)ciState.text=t.value;ciState.hide=true;render();return}
  if(c('#ciShow')){ciState.hide=false;render();return}
  
});
document.addEventListener('input',e=>{if(e.target.id==='ci-say')ciState.text=e.target.value});
// ================= first-run experience: feature tour, talk-through sign-up, kitchen setup, setup checklist =================
const DEMO_EXAMPLE=null;
const FEATURES=[
 ['Talk, don\'t type','Tap Dictate and say how you slept, how you feel, what you ate and how training went. It fills everything in for you.','var(--accent)'],
 ['A plan built around you','Tell it your sport, goals and week. It builds a 16-week plan and daily food targets to match.','var(--s)'],
 ['Meals from food you can get','Tap or say what you have in. It plans the next 3 days of meals to hit your targets and writes the shopping list.','var(--e)'],
 ['Your status at a glance','Each morning a balance score from sleep, energy and niggles tells you whether to push on or back off.','var(--h)'],
 ['It spots the patterns','Reports link sleep, work, food and training load to how you feel, and flag what came before a niggle.','var(--x)']];
const featuresHTML=()=>`<div class="feats">${FEATURES.map((f,i)=>`<div class="feat" style="--fc:${f[2]}"><span class="fnum num">${i+1}</span><div><b>${f[0]}</b><p>${f[1]}</p></div></div>`).join('')}</div>`;
let VOICE_SERVER=false;
const canRecord=()=>!!(VOICE_SERVER&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
const speakBtn=id=>canRecord()?`<button type="button" class="talkbtn" data-speak="${id}" aria-label="Hold to talk, or tap to start and stop">${MIC}<span>Hold to talk</span></button>`:`<button type="button" class="ghost vspeak" data-speak="${id}">${MIC}<span>Speak</span></button>`;
// ---------- hold-to-talk recorder (records audio, server turns it into text) ----------
let rc={state:'idle',mr:null,chunks:[],stream:null,t0:0,btn:null,id:null,timer:null,down:0,released:false,mode:'hold'};
const fmtSec=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
function rcLabel(t){if(rc.btn&&rc.btn.isConnected)rc.btn.lastChild.textContent=t}
async function rcStart(id,btn){
  rc={state:'starting',mr:null,chunks:[],stream:null,t0:0,btn,id,timer:null,down:Date.now(),released:false,mode:'hold'};
  btn.classList.add('on');rcLabel('Starting…');
  try{rc.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}})}
  catch(e){btn.classList.remove('on');rcLabel('Hold to talk');rc.state='idle';toast('Allow the microphone for this site in your browser settings, then try again.',4500);return}
  const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm','audio/aac'].find(m=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m))||'';
  try{rc.mr=mime?new MediaRecorder(rc.stream,{mimeType:mime}):new MediaRecorder(rc.stream)}catch(e){rc.mr=new MediaRecorder(rc.stream)}
  rc.mr.ondataavailable=ev=>{if(ev.data&&ev.data.size)rc.chunks.push(ev.data)};
  rc.mr.onstop=rcSend;rc.mr.start(1000);rc.t0=Date.now();rc.state='rec';
  if(rc.released)rc.mode='tap';
  try{navigator.vibrate&&navigator.vibrate(30)}catch(e){}
  rc.timer=setInterval(()=>{const s=(Date.now()-rc.t0)/1000;rcLabel(`${fmtSec(s)} · ${rc.mode==='tap'?'tap to stop':'release to stop'}`);if(s>=180)rcStop()},250);
}
function rcStop(){if(rc.state!=='rec')return;rc.state='sending';clearInterval(rc.timer);try{rc.mr.stop()}catch(e){}try{rc.stream.getTracks().forEach(t=>t.stop())}catch(e){}rcLabel('Writing it down…')}
async function rcSend(){
  const btn=rc.btn,id=rc.id;const blob=new Blob(rc.chunks,{type:(rc.mr&&rc.mr.mimeType)||'audio/webm'});
  const done=()=>{rc.state='idle';if(btn&&btn.isConnected){btn.classList.remove('on');btn.lastChild.textContent='Hold to talk'}};
  if((Date.now()-rc.t0)<800||blob.size<2000){done();toast('Hold the button while you talk, or tap once to start and again to stop.',3500);return}
  try{
    const b64=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]);r.onerror=no;r.readAsDataURL(blob)});
    const {data:{session}}=await sb.auth.getSession();
    const r=await fetch('/api/transcribe',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+(session&&session.access_token)},body:JSON.stringify({audio:b64,mime:blob.type})});
    const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'failed');
    const el=document.getElementById(id);const t=(j.text||'').trim();
    if(el&&t){el.value=(el.value?el.value.replace(/\s*$/,' '):'')+t;el.dispatchEvent(new Event('input',{bubbles:true}))}
    if(!t)toast("Didn't catch anything. Try again a bit closer to the phone.",3500);
  }catch(e){toast('Could not turn that into text. Try again, or type it.',4000)}
  done();
}
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('[data-speak]');if(!b||!canRecord())return;e.preventDefault();
  if(rc.state==='rec'){rc.mode='tap';rc.stopOnUp=true;return}
  if(rc.state==='idle')rcStart(b.dataset.speak,b)},{passive:false});
document.addEventListener('pointerup',()=>{if(!canRecord())return;
  if(rc.stopOnUp){rc.stopOnUp=false;rcStop();return}
  if(rc.state==='starting'){rc.released=true;return}
  if(rc.state==='rec'&&rc.mode==='hold'){if(Date.now()-rc.down<450){rc.mode='tap'}else rcStop()}});
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('.talkbtn'))e.preventDefault()});
let gRec=null;
function speakInto(id,btn){
  if(canRecord())return;
  const reset=()=>{gRec=null;if(btn&&btn.isConnected){btn.classList.remove('on');btn.lastChild.textContent='Speak'}};
  if(gRec){try{gRec.stop()}catch(e){}reset();return}
  const ta=document.getElementById(id);
  if(!SR){if(ta)ta.focus();toast('Use the microphone on your keyboard to talk',3500);return}
  try{const r=new SR();r.lang='en-IE';r.continuous=true;r.interimResults=false;
    r.onresult=ev=>{let t='';for(let i=ev.resultIndex;i<ev.results.length;i++)if(ev.results[i].isFinal)t+=ev.results[i][0].transcript;const el=document.getElementById(id);if(el&&t){el.value=(el.value?el.value.replace(/\s*$/,' '):'')+t.trim();el.dispatchEvent(new Event('input',{bubbles:true}))}};
    r.onerror=ev=>{reset();if(['not-allowed','service-not-allowed','audio-capture'].includes(ev.error)){toast("The microphone isn't available here. Use the one on your keyboard.",4000);const el=document.getElementById(id);if(el)el.focus()}};
    r.onend=reset;r.start();gRec=r;btn.classList.add('on');btn.lastChild.textContent='Stop';
  }catch(e){reset();toast('Use the microphone on your keyboard to talk',3500);if(ta)ta.focus()}
}

// ---------- sign-up by talking ----------
const OB_OPTS={sex:['Male','Female','Prefer not to say'],mainGoal:['Lose weight','Build muscle / bulk up','Get lean and toned','Get stronger','Get fit for my sport','Run faster','Hyrox / fitness race','General health'],
  goals:['Lose body fat','Put on mass','Tone up','Get stronger','Improve endurance','Stay injury-free','More energy','Better sleep','Eat better','Improve flexibility'],
  sport:['GAA football','Hurling / camogie','Soccer','Rugby','Running','Hyrox','Gym','Cycling','Swimming','Other'],perWeek:['3','4','5','6'],
  days:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],fasted:['Yes','No'],level:['Beginner','Some','Experienced'],equip:['Full gym','Home weights','Pitch / track','Roads','Classes'],
  job:['Physical','Desk','Mixed','Shift work'],approach:['Balanced','High protein','Lower carb','Keto','Plant-based','No preference'],
  diet:['Vegetarian','Vegan','No fish','Dairy-free','Gluten-free','Nut allergy'],fastH:['None','12 h','14 h','16 h'],alcohol:['None','Occasionally','Most weeks']};
const OB_MULTI=['goals','sport','days','equip','diet'];
const OB_FREE=['targetWeight','name','age','weight','height','target','success','time','fixed','injuries','jobDesc','start','foodNotes'];
function obStartHTML(){
  return `<div class="gbrand">Welcome${ob.a.name?', '+esc(ob.a.name):''}</div><h1>Let's build your plan</h1>
    <p class="gsub">Your plan and food targets come from a few things about you: what you enjoy, your goals, the days that suit you, your work and how you like to eat.</p>
    <button type="button" class="choice" id="obTalk"><em>Fastest · about a minute</em><b>Tell us in your own words</b><span>Talk or type a few sentences. We fill in the form, you check it.</span></button>
    <button type="button" class="choice" id="obSteps"><b>Answer step by step</b><span>Six short screens, mostly taps.</span></button>
    ${DEMO_EXAMPLE?`<button type="button" class="choice" id="obExample"><b>Try an example person</b><span>Load ${esc(DEMO_EXAMPLE.name)}'s answers and go straight to building the plan.</span></button>`:''}`;
}
function obTalkHTML(){
  return `<div class="gbrand">Tell us in your own words</div><h1>Talk us through it</h1>
    <p class="gsub">Just talk naturally. Cover as much of this as you like:</p>
    <div class="talkhints">${['Name, age, weight, height','Your goal: lose weight, build muscle, get lean, get stronger, sport, a race','Target weight, if you have one','Your sport','Any event or date you\'re aiming for','Days and time you can train','Classes or club nights you already do','Injuries or problem areas','Your job','How you like to eat, any dietary needs'].map(x=>`<span>${x}</span>`).join('')}</div>
    <textarea id="ob-talk" style="min-height:170px;font-size:16px" placeholder="e.g. I'm Ciara, 29, about 63 kilos and 5 foot 6. I'm a physio, doing shifts. I want to do Hyrox Dublin in March in under an hour thirty. I can train Monday to Thursday and Saturday, usually after work around half six, and I do a Hyrox class on Wednesdays. My right knee gets sore on long runs. I'm vegetarian and I want plenty of protein.">${esc(ob.talk||'')}</textarea>
    <div class="actions">${speakBtn('ob-talk')}<button type="button" class="primary" id="obParse" ${ob.busy?'disabled':''}>${ob.busy?'Filling in your answers…':'Fill in my answers'}</button></div>
    ${ob.msg?`<div class="hsum" role="status">${esc(ob.msg)}</div>`:''}
    <button type="button" class="linkbtn" id="obSteps">Answer step by step instead</button>`;
}
async function obParse(){
  const el=$('#ob-talk');const t=(el&&el.value||ob.talk||'').trim();ob.talk=t;
  if(!t){toast('Say or type a few sentences first');return}
  if(!sample){ob.msg='Talking it through is not available here. Answer step by step instead.';obRender();return}
  ob.busy=true;ob.msg='';obRender();
  try{const out=await sample.json(`Fill in a fitness app's sign-up form from what this person said. Today is ${iso(todayDate())}. Only include what they said or clearly implied; leave every other key out.
Free-text keys: "name"; "age" (number); "weight" (kg as a number, convert stone and pounds); "height" (cm as a number, convert feet and inches); "target" (event or date they're aiming for); "success" (what a great result looks like); "time" (usual training time as "HH:MM", 24 h); "fixed" (sessions they already do, with days and times); "injuries"; "jobDesc"; "start" (start date as "YYYY-MM-DD"); "foodNotes".
Choice keys, use only these exact values: ${Object.entries(OB_OPTS).map(([k,v])=>`"${k}"${OB_MULTI.includes(k)?' (array)':''} from ${JSON.stringify(v)}`).join('; ')}.
What they said: """${t.slice(0,6000)}"""
Reply with ONLY a JSON object holding the keys you could fill.`);
    const got={};
    Object.entries(out||{}).forEach(([k,v])=>{
      if(OB_OPTS[k]){if(OB_MULTI.includes(k)){const arr=(Array.isArray(v)?v:[v]).map(String).filter(x=>OB_OPTS[k].includes(x));if(arr.length)got[k]=arr}else if(OB_OPTS[k].includes(String(v)))got[k]=String(v)}
      else if(OB_FREE.includes(k)&&v!=null&&v!=='')got[k]=String(v).slice(0,300)});
    Object.assign(ob.a,got);ob.busy=false;ob.step=5;ob.ret=false;
    ob.msg=`Filled in ${Object.keys(got).length} answers from what you said. Check them, fill any gaps, then build your plan.`;obSave();obRender();
  }catch(e){ob.busy=false;ob.msg='Could not read that. Try again, or answer step by step.';obRender()}
}
function obReview(){
  const a=ob.a,v=x=>Array.isArray(x)?x.join(', '):x;
  const rows=[[0,'You',[a.name,a.age&&a.age+' yrs',a.weight&&a.weight+' kg',a.height&&a.height+' cm',a.sex]],[1,'Goals',[a.mainGoal,v(a.goals),a.targetWeight&&'Target '+a.targetWeight+' kg',a.target,a.success]],
    [2,'Moving',[v(a.sport),a.perWeek&&a.perWeek+' sessions a week',v(a.days),a.time&&'around '+a.time,a.fasted==='Yes'&&'fasted',a.level,a.fixed,a.injuries&&'Injuries: '+a.injuries]],
    [3,'Your day',[a.job,a.jobDesc,a.start&&'Start '+fmtD(parse(a.start))]],[4,'Food',[a.approach,v(a.diet),a.fastH&&a.fastH!=='None'&&a.fastH+' overnight fast',a.alcohol&&'Alcohol: '+a.alcohol.toLowerCase(),a.foodNotes]]];
  const missing=[!a.name&&'your name',!a.weight&&'weight',!a.mainGoal&&'main goal',!a.perWeek&&'days a week',!(a.days&&a.days.length)&&'days that suit you'].filter(Boolean);
  return `<div class="review">${rows.map(([s,l,vals])=>{const t=vals.filter(Boolean).join(' · ');return `<button type="button" class="rv" data-obgo="${s}"><span class="label">${l}</span><span class="rvt">${t?esc(t):'<i>Nothing yet</i>'}</span><span class="ed">Edit</span></button>`}).join('')}</div>
    ${missing.length?`<div class="alert amber">Still needed: ${missing.join(', ')}. Tap a section to add it.</div>`:''}`;
}

// ---------- kitchen: one-tap staples ----------
const STAPLES={Protein:['Eggs','Chicken breasts','Chicken thighs','Beef mince','Steak','Salmon','Tinned tuna','Rashers','Ham','Tofu','Lentils','Chickpeas'],
  'Dairy':['Milk','Greek yogurt','Cheddar','Cottage cheese','Butter','Kefir'],
  'Veg':['Broccoli','Spinach','Peppers','Onions','Carrots','Mushrooms','Tomatoes','Cauliflower','Salad leaves','Frozen veg'],
  'Fruit':['Bananas','Berries','Apples','Oranges','Avocados'],
  'Carbs':['Oats','Rice','Potatoes','Sweet potatoes','Pasta','Wholemeal bread','Wraps'],
  'Cupboard':['Olive oil','Nuts','Peanut butter','Seeds','Protein powder','Tinned tomatoes','Stock cubes']};
const STAPLE_WHERE={Protein:'Fridge',Dairy:'Fridge',Veg:'Fridge',Fruit:'Other',Carbs:'Cupboard',Cupboard:'Cupboard'};
const whereOf=n=>{for(const [g,l] of Object.entries(STAPLES))if(l.includes(n))return STAPLE_WHERE[g];return 'Other'};
const staplesHTML=have=>`<div class="staples">${Object.entries(STAPLES).map(([g,list])=>`<div class="field"><span class="label">${g}</span><div class="tags">${list.map(n=>`<button type="button" data-staple="${esc(n)}" aria-pressed="${have.has(n.toLowerCase())}">${esc(n)}</button>`).join('')}</div></div>`).join('')}</div>`;
async function toggleStaple(n){
  const items=kitchen().slice();const i=items.findIndex(x=>x.name.toLowerCase()===n.toLowerCase());
  if(i>=0)items.splice(i,1);else items.push({name:n,qty:'',where:whereOf(n)});
  await persistMeta('kitchen',{items,updatedAt:new Date().toISOString()});render();
}
let kSetup={sel:[],text:'',busy:false,msg:''};
function kitchenSetupHTML(){
  return `<div class="gcard wide"><div class="obprog">${OB_STEPS.concat(['Food']).map((x,i)=>`<span class="${i<6?'done':'cur'}">${x}</span>`).join('')}</div>
    <div class="gbrand">Last step</div><h1>What food can you get?</h1>
    <p class="gsub">Your meal plans are built from food you actually have. Tap what's in now, and add anything else by voice or typing. Update it after each shop.</p>
    ${staplesHTML(new Set(kSetup.sel.map(x=>x.toLowerCase())))}
    <div class="field"><label class="label" for="ks-say">Anything else?</label><textarea id="ks-say" placeholder="e.g. 2 packs of chicken, frozen peas, feta, rice, a dozen eggs. Or if you don't cook much: lunch from the Centra beside work, dinner at home.">${esc(kSetup.text)}</textarea></div>
    <div class="actions">${speakBtn('ks-say')}</div>
    <button type="button" class="primary" id="ksDone" ${kSetup.busy?'disabled':''}>${kSetup.busy?'Saving…':`Save and plan my first 3 days${kSetup.sel.length?` (${kSetup.sel.length} items)`:''}`}</button>
    ${kSetup.msg?`<div class="hsum" role="status">${esc(kSetup.msg)}</div>`:''}
    <button type="button" class="linkbtn" id="ksSkip">Skip for now, I'll do it later</button></div>`;
}
async function kitchenSetupDone(){
  const el=$('#ks-say');kSetup.text=(el&&el.value||'').trim();
  if(!kSetup.sel.length&&!kSetup.text){toast('Tap a few things you have in, or say them');return}
  kSetup.busy=true;showGate(kitchenSetupHTML());
  let items=kSetup.sel.map(n=>({name:n,qty:'',where:whereOf(n)}));
  if(kSetup.text&&sample){try{const out=await sample.json(kitchenPrompt(items,kSetup.text));const r=await applyKitchenOut(out);if(r.items.length)items=r.items}catch(e){}}
  await persistMeta('kitchen',{items,updatedAt:new Date().toISOString()});
  kSetup={sel:[],text:'',busy:false,msg:''};
  await enterApp();fView='plan';location.hash='food';render();if(sample)buildPlan('');
}

// ---------- dashboard: get set up ----------
function setupChecklistHTML(){
  if(sampleMode||!PROFILE)return '';const fl=meta.flags||{};if(fl.hideSetup)return '';
  const DV=Object.values(days);
  const items=[
    ['Add your food available',kitchen().length>0,'Tap what you have in, or say where you eat. Meal plans are built from it.','data-fview="kitchen" data-todo'],
    ['Plan your next 3 days of meals',!!meta.plan,'Built from your food available and your daily targets.','data-fview="plan" data-todo'],
    ['Do your first check-in',DV.some(d=>d.bed||isNum(d.energy)),'Sleep, how you feel and any niggles. Gives you a balance score.','href="#checkin" data-todo'],
    ['Log something by voice',!!fl.voice,'Tap Dictate and just talk.','data-open-voice'],
    ['Log what you ate',DV.some(d=>(d.food||[]).length),'Tick off a planned meal, say it, or snap a photo.','href="#food" data-dtab']];
  const done=items.filter(x=>x[1]).length;if(done===items.length)return '';
  const next=items.findIndex(x=>!x[1]);
  return `<section class="setup"><div class="ph"><h3>Get set up</h3><span class="ds">${done} of ${items.length} done</span></div><div class="prog"><i style="width:${done/items.length*100}%"></i></div>
    ${items.map(([t,ok,d,attr],i)=>{const tag=attr.startsWith('href')?'a':'button';return `<${tag} ${tag==='button'?'type="button"':''} class="step ${ok?'ok':''} ${i===next?'next':''}" ${attr}><span class="sn">${ok?'✓':i+1}</span><span class="st"><b>${t}</b><small>${d}</small></span><span aria-hidden="true">›</span></${tag}>`}).join('')}
    <button type="button" class="linkbtn" id="hideSetup">Hide this list</button></section>`;
}

// ---------- profile, feedback, admin ----------
let fbState={busy:false,list:null};
function viewProfile(){
  const p=PROFILE,a=p.answers||{};
  return `<div class="dtop"><div><b>${esc(a.name||'Your profile')}</b><small>${esc(SESSION&&SESSION.user.email||'')}</small></div><a class="ghost" href="#dashboard" style="padding:8px 12px;text-decoration:none">Back</a></div>
  <section class="panel"><h3>Your plan</h3><div class="ds">${esc(p.plan.goalLine||'')}</div>
    <div class="obweek">${TYPES.map((t,i)=>`<span style="--c:var(${TVAR[t]})"><b>${DOW[i]}</b>${esc(t==='R'?'Rest':TNAME[t])}</span>`).join('')}</div>
    <div class="ds">16 weeks from ${fmtD(START)} · training ${DAYT.training.kcal} kcal, rest ${DAYT.rest.kcal} kcal, protein ${DAYT.training.protein} g</div>
    <button type="button" class="ghost" id="rebuild" style="color:var(--fg)">Change answers and rebuild my plan</button></section>
  <section class="panel"><h3>Send feedback</h3><div class="ds">What works, what's confusing, what's missing. It goes straight to whoever invited you.</div>
    <textarea id="fb-text" placeholder="e.g. Dictation is great but I'd like to log a match as well"></textarea>
    <button type="button" class="primary" id="fbSend" ${fbState.busy?'disabled':''} style="flex:none">${fbState.busy?'Sending…':'Send feedback'}</button></section>
  ${IS_ADMIN?`<section class="panel"><h3>Feedback from testers</h3>${fbState.list?fbState.list.length?fbState.list.map(f=>`<div class="cmp"><span class="q">${esc(f.name||'Someone')} <span class="ds">· ${fmtD(new Date(f.created_at))} · ${esc(f.tab||'')}</span></span><span>${esc(f.text)}</span></div>`).join(''):'<div class="ds">No feedback yet.</div>':'<button type="button" class="ghost" id="fbLoad" style="color:var(--fg)">Show feedback</button>'}</section>`:''}
  <section class="panel"><h3>Account</h3><div class="ds">Your data is stored in this app's database and is only shown to you in the app. The person running the trial can see the database as its administrator.</div><button type="button" class="ghost danger" id="signOut">Sign out</button></section>`;
}
async function sendFeedback(){
  const t=$('#fb-text');const text=(t&&t.value||'').trim();if(!text){toast('Write something first');return}
  fbState.busy=true;render();
  const {error}=await sb.from('feedback').insert({user_id:UID,name:(PROFILE.answers&&PROFILE.answers.name)||null,tab:'trial',text:text.slice(0,4000)});
  fbState.busy=false;render();toast(error?'Could not send. Try again.':'Thanks, feedback sent');
}
async function loadFeedback(){const {data,error}=await sb.from('feedback').select('*').order('created_at',{ascending:false}).limit(200);fbState.list=error?[]:data;render()}

// ---------- start ----------
async function startUser(){
  UID=SESSION.user.id;logsCol=col('log');daysCol=col('day');metaCol=col('meta');sample=makeSample();canImg=true;
  const [{data:prof},{data:adm},own]=await Promise.all([
    sb.from('profiles').select('*').eq('id',UID).maybeSingle(),
    sb.from('admins').select('user_id').eq('user_id',UID).maybeSingle(),
    fetch('/api/owner',{headers:{authorization:'Bearer '+SESSION.access_token}}).then(r=>r.ok?r.json():{}).catch(()=>({}))]);
  IS_ADMIN=!!adm;IS_OWNER=!!(own&&own.owner);PROFILE_ROW=prof;
  if(!prof||!prof.data||!prof.data.plan){obLoad();obRender();return}
  PROFILE=prof.data;enterApp();
}
async function enterApp(){
  applyProfile(PROFILE);
  const {data:rows,error}=await sb.from('entries').select('kind,key,data').eq('user_id',UID).range(0,9999);
  if(error)toast('Could not load your data. Pull down to refresh.',5000);
  logs={};days={};const keepMeta=meta;meta={};(rows||[]).forEach(r=>{if(r.kind==='day')days[r.key]=r.data;else if(r.kind==='log')logs[r.key]=r.data;else meta[r.key]=r.data});
  if(keepMeta.settings&&!meta.settings)meta.settings=keepMeta.settings;
  SAMPLE=null;sampleMode=false;sel=todayDate();sDraft=null;dDraft=null;
  showApp();if(!location.hash)location.hash='dashboard';render();
  if(SERVER_PLAN)checkPlanJob().then(st=>{if(st==='wait')watchPlanJob()}).catch(()=>{});
}
document.addEventListener('input',e=>{if(e.target.id==='ob-talk'){ob.talk=e.target.value;obSave()}if(e.target.id==='ks-say')kSetup.text=e.target.value});
document.addEventListener('submit',e=>{if(e.target.id==='authForm'){e.preventDefault();doAuth()}},true);
document.addEventListener('click',async e=>{
  const am=e.target.closest('[data-auth]');if(am){authMode=am.dataset.auth;showGate(authHTML(authMode));return}
  if(e.target.id==='forgot'){const em=($('#a-email')&&$('#a-email').value||'').trim();if(!em){toast('Type your email first');return}const {error}=await sb.auth.resetPasswordForEmail(em,{redirectTo:location.origin});toast(error?error.message:'Password reset email sent',4000);return}
  const ot=e.target.closest('[data-obtag]');if(ot){obRead();const k=ot.dataset.obtag;const arr=ob.a[k]=ob.a[k]||[];const i=arr.indexOf(ot.dataset.v);if(i>=0)arr.splice(i,1);else arr.push(ot.dataset.v);obSave();obRender();return}
  const og=e.target.closest('[data-obgo]');if(og){obRead();ob.step=+og.dataset.obgo;ob.ret=true;obSave();obRender();window.scrollTo({top:0});return}
  const sp=e.target.closest('[data-speak]');if(sp){speakInto(sp.dataset.speak,sp);return}
  const stp=e.target.closest('[data-staple]');if(stp){const n=stp.dataset.staple;if(!gate().hidden){const t=$('#ks-say');if(t)kSetup.text=t.value;const i=kSetup.sel.indexOf(n);if(i>=0)kSetup.sel.splice(i,1);else kSetup.sel.push(n);showGate(kitchenSetupHTML())}else toggleStaple(n);return}
  if(e.target.closest('[data-open-voice]')){openVoice();return}
  const os=e.target.closest('[data-obseg]');if(os){obRead();ob.a[os.dataset.obseg]=os.dataset.v;obSave();obRender();return}
  const id=((e.target.closest&&e.target.closest('button[id],a[id],input[id]'))||e.target).id||'';
  if(id==='obNext'){obRead();if(ob.step===0&&(!ob.a.name||!ob.a.weight)){toast('Add your name and weight');return}if(ob.step===2&&!ob.a.perWeek){toast('Pick how many sessions a week');return}ob.step=Math.min(5,ob.step+1);obSave();obRender();return}
  if(id==='obBack'){obRead();ob.step=ob.step===0?-1:Math.max(0,ob.step-1);obSave();obRender();return}
  if(id==='obTalk'){ob.step=-2;ob.msg='';obSave();obRender();return}
  if(id==='obSteps'){ob.step=0;ob.msg='';ob.ret=false;obSave();obRender();return}
  if(id==='obHome'){const t=$('#ob-talk');if(t)ob.talk=t.value;ob.step=-1;obSave();obRender();return}
  if(id==='obParse'){obParse();return}
  if(id==='obDone'){obRead();ob.step=5;ob.ret=false;ob.msg='';obSave();obRender();return}
  if(id==='obExample'&&DEMO_EXAMPLE){ob={step:5,a:Object.assign({},DEMO_EXAMPLE,{start:iso(addD(todayDate(),3))}),msg:'Example answers loaded. Change anything you like, then build the plan.'};obSave();obRender();return}
  if(id==='ksDone'){kitchenSetupDone();return}
  if(id==='ksSkip'){kSetup={sel:[],text:'',busy:false,msg:''};enterApp();return}
  if(id==='hideSetup'){persistMeta('flags',Object.assign({},meta.flags||{},{hideSetup:true})).then(()=>render());return}
  if(id==='obBuild'){obBuild();return}
  if(id==='obStart'){obStart(false);return}
  if(id==='obOwner'){obStart(true);return}
  if(id==='signOut'){await sb.auth.signOut();location.hash='';location.reload();return}
  if(id==='rebuild'){ob={step:5,a:Object.assign({},PROFILE.answers||{})};obSave();obRender();return}
  if(id==='fbSend'){sendFeedback();return}
  if(id==='fbLoad'){loadFeedback();return}
});
(async()=>{
  try{const cfg=await fetch('/api/config').then(r=>r.json());if(!cfg.url||!cfg.anonKey)throw 0;VOICE_SERVER=!!cfg.voice;TTS_ON=!!(cfg.tts??cfg.voice);SERVER_PLAN=!!cfg.plan;sb=window.supabase.createClient(cfg.url,cfg.anonKey)}
  catch(e){showGate('<div class="gcard"><h1>Not set up yet</h1><p class="gsub">The app is missing its database settings. Add SUPABASE_URL and SUPABASE_ANON_KEY in the hosting settings, then redeploy.</p></div>');return}
  sb.auth.onAuthStateChange((ev,s)=>{SESSION=s;if(ev==='PASSWORD_RECOVERY'){showGate(`<div class="gcard"><h1>Set a new password</h1><form id="pwForm" class="form" style="padding:0"><div class="field"><label class="label" for="np">New password</label><input id="np" type="password" minlength="8" required></div><button class="primary" type="submit">Save password</button></form></div>`)}});
  document.addEventListener('submit',async e=>{if(e.target.id==='pwForm'){e.preventDefault();const {error}=await sb.auth.updateUser({password:$('#np').value});if(error)toast(error.message,4000);else{toast('Password saved');location.hash='';location.reload()}}},true);
  const {data:{session}}=await sb.auth.getSession();SESSION=session;
  if(!session){showGate(authHTML(authMode));return}
  await startUser();
})();

})();
