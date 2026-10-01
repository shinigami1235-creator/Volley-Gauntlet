
/* ================= state ================= */
let state='title',P=null,G=null;
let enemies=[],projs=[],ebul=[],gems=[],pickups=[],hazards=[],zones=[],clouds=[],nades=[],timers=[],gateRows=[],decor=[],parts=[],nums=[],bolts=[],pops=[],after=[];
let stage,stageT,score,kills,runT,combo,comboT,maxCombo,shake,flashA,flashCol,tScale,tTarget,tHold,scrollY,dir,bossE,miniE,bossWarn,miniWarn,miniDone,freezeAll,nextId,pendingLv,lvDelay,hudT,dyingT,nextDecor,nextTorch,volleyN,novaT,thunderT,wispT,stormAcc,haloT,offerList=[],relicList=[];
const STAGE_LEN=95,MINI_AT=42,BASE_SCROLL=68,PMAX=1400;let SCROLL=BASE_SCROLL;
let diff='normal';try{const d=STORE.get('vg_diff');if(d&&DIFF[d])diff=d}catch(e){}
let D=DIFF[diff];
let best={};try{best=JSON.parse(STORE.get('vg2_best')||'{}')||{}}catch(e){best={}}

function newPlayer(c){const wi=S&&run&&run.mode!=='daily'?weapOf(c):0;const C=Object.assign({},CLASSES[c],WEAPS[c][wi]);const si=S&&run&&run.mode!=='daily'?(S.skin[c]||0):0;return{C,pal:S?skinOf(c,si):null,gold:0,meta:{hp:0,dash:1,gold:1,xp:1,second:false,dmg:1,rate:1,crit:0,mdmg:1},secondUsed:false,onIce:false,ivx:0,ivy:0,poisT:0,cls:c,x:W/2,tx:W/2,y:ZBOT-120,ty:ZBOT-120,r:14,hp:C.hp,maxHp:C.hp,lastDx:0,lastDy:-1,level:1,xp:0,xpNeed:14,cd:.3,iframe:0,pull:0,shieldT:0,rapidT:0,stormT:0,magnetT:0,whirlT:0,whirlTick:0,slowT:0,dashCd:0,dashT:0,ddx:0,ddy:-1,skCd:4,sk:{},fu:new Set(),fused:new Set(),cu:new Set(),re:new Set(),rerolls:1,parryWin:0,parryT:0,orbA:0,walk:0,elem:null,revived:false,killN:0,regenT:0,powS:1,moveAmt:0,echoT:0,hurtT:0}}
function newG(){return{projAdd:0,projMul:1,dmgMul:1,rateMul:1,pierce:0,maxHp:0,enemyHp:1,enemySpd:1,score:1,crit:0,dashCd:1}}
function lv(k){let n=P.sk[k]||0;for(const f of P.fu)n+=FU[f].gives[k]||0;return n}
function recalc(){
  const C=P.C,cu=k=>P.cu.has(k),re=k=>P.re.has(k),s=lv;
  const old=P.maxHp;let mh=C.hp+20*(P.sk.vital||0)+G.maxHp+(re('iron')?50:0)+P.meta.hp;if(cu('glass'))mh*=.65;mh*=D.pHp;P.maxHp=Math.max(20,Math.round(mh));
  if(P.maxHp>old)P.hp+=P.maxHp-old;P.hp=Math.min(P.hp,P.maxHp);
  P.projN=clamp(Math.round((C.proj+s('multi')+(cu('heavy')?4:0)+(cu('blood')?3:0)+(re('quiver')?1:0)+G.projAdd)*G.projMul),1,999);
  P.dmgM=Math.pow(1.25,s('dmg'))*G.dmgMul*(1+.3*s('giant'))*(cu('glass')?1.7:1)*(cu('overdraw')?2:1)*(re('crown')?1.4:1)*(re('whet')?1.15:1)*P.meta.dmg*P.meta.mdmg;
  P.rateM=Math.pow(1.18,s('rate'))*G.rateMul*P.meta.rate*(cu('overdraw')?.65:1)*(cu('frenzy')?1.6:1);
  P.pierceN=s('pierce')+G.pierce;P.ricN=s('ric');P.sideN=s('side');P.backN=s('back');
  P.critC=.05+.1*s('crit')+G.crit+(P.fu.has('exec')?.15:0)+(re('lens')?.12:0)+P.meta.crit;
  P.homN=s('homing');P.fireL=s('fire');P.iceL=s('ice');P.voltL=s('volt');P.poisL=s('poison');P.explL=s('expl');
  P.orbN=s('orbit');P.wispN=s('wisp');P.thunL=s('thunder');P.giantL=s('giant');
  P.armorM=Math.max(.7,Math.pow(.9,s('armor'))*(P.cls==='berserker'?.85:1));P.regenL=s('regen');
  P.spdM=Math.pow(1.1,s('swift'))*(cu('heavy')?.75:1)*(re('iron')?.9:1);
  P.dashMax=2*Math.pow(.85,s('swift'))*(cu('heavy')?1.5:1)*G.dashCd*P.meta.dash*(re('feather')?.65:1);if(P.cu.size>=3)ach('curse3');for(const k of P.cu)if(S)S.codex.curse[k]=1;
  P.skMax=C.cd*Math.pow(.8,s('power'))*(re('plug')?.7:1);
  P.scoreM=D.sc*G.score*(1+.25*P.cu.size)*(cu('hunted')?2:1)*(re('crown')?1.5:1);
  P.healM=(cu('berserk')?.5:1)*D.heal;
  P.basePow=C.dmg*C.proj/C.iv;
}
function baseDmg(){let d=P.C.dmg*P.dmgM*(P.parryT>0?1.3:1);if(P.cu.has('berserk'))d*=1+(1-P.hp/P.maxHp);return d}
function fireInterval(){return P.C.iv/(P.rateM*(P.rapidT>0?2:1)*(P.drumT>0?1.5:1)*(P.C.id==='minigun'?1+.12*(P.sk.wenh||0):1))}
function curPow(){return baseDmg()*P.projN/fireInterval()*(1+.12*(P.fireL+P.iceL+P.voltL+P.poisL+P.explL))*(1+.15*(P.pierceN+P.ricN))*(1+.1*P.sideN)*(1+.1*P.orbN)}
function hpScale(){return Math.pow(1.38,stage-1)*(1+stageT/110)*Math.pow(Math.max(1,P.powS),D.pow)*D.ehp*G.enemyHp*(P.cu.has('greed')?1.3:1)}
function bossHp(sec,base){return sec*1.1*P.basePow*Math.pow(Math.max(1,P.powS),.7)*(base/1100)*(D.ehp/1.25)*G.enemyHp*(P.cu.has('greed')?1.3:1)}
function pushable(e){return e.alive&&!e.d.boss&&!e.d.mini&&!e.d.part&&!e.under&&!e.gone}
function knock(e,px,py,v){const dx=e.x-px,dy=e.y-py,l=Math.hypot(dx,dy)||1,m=e.heavy?.6:1;e.kbx=dx/l*v*m;e.kby=dy/l*v*m}
function whirlBurst(v){forNear(P.x,P.y,200,e=>{if(!pushable(e))return;if((e.x-P.x)**2+(e.y-P.y)**2<(190+e.r)**2){knock(e,P.x,P.y,v);e.stunT=Math.max(e.stunT||0,.8)}});ringFx(P.x,P.y,'255,150,120',190,.35,6);ringFx(P.x,P.y,'255,255,255',120,.25,3);addShake(8);sfx.boom()}
function spdScale(){return(1+(stage-1)*.07)*G.enemySpd*D.espd*(P.cu.has('frenzy')?1.2:1)}
function champC(){return Math.min(.3,.015+.03*(stage-1)+stageT/2500)*(P.cu.has('hunted')?2:1)*(P.re.has('crown')?2:1)*D.champ*(run&&run.elite?2:1)*(dm('champs')?3:1)}
function heal(v,passive){if(v<=0)return;if(passive&&runT-(P.hurtAt??-9)<2)return;P.hp=Math.min(P.maxHp,P.hp+v*P.healM)}
function later(t,fn){timers.push({t,fn})}

function reset(c){
  P=newPlayer(c);G=newG();recalc();P.hp=P.maxHp;
  enemies=[];projs=[];ebul=[];gems=[];pickups=[];hazards=[];zones=[];clouds=[];nades=[];timers=[];gateRows=[];decor=[];parts=[];nums=[];bolts=[];pops=[];after=[];
  stage=1;stageT=0;score=0;kills=0;runT=0;combo=0;comboT=0;maxCombo=0;shake=0;flashA=0;flashCol='255,255,255';tScale=1;tTarget=1;tHold=0;scrollY=0;
  pendingRelic=false;setp=null;walls=[];squeeze=0;darkT=0;darkBoss=false;flood=false;bossScrollStop=false;shrineHold=false;scrollM=1;SCROLL=BASE_SCROLL;dir={next:.4,seq:['crowd','gate','bats','scatter','set','gate','elite'],trick:.8,bossIn:0,miniIn:0};bossE=null;miniE=null;bossWarn=false;miniWarn=false;miniDone=false;freezeAll=0;nextId=1;pendingLv=0;lvDelay=0;hudT=0;dyingT=0;nextDecor=0;nextTorch=0;volleyN=0;novaT=1.8;thunderT=3;wispT=0;stormAcc=0;haloT=0;
  for(let y=H;y>-40;y-=rnd(260,340))decor.push({k:'torch',side:Math.random()<.5?-1:1,y,f:rnd(0,9)});
  $('#bossbox').hidden=true;
}

/* ================= spatial grid ================= */
const CELL=64,grid=new Map();
const gk=(cx,cy)=>(cx+64)*8192+(cy+256);
function buildGrid(){grid.clear();for(const e of enemies){if(!e.alive)continue;const k=gk(Math.floor(e.x/CELL),Math.floor(e.y/CELL));let a=grid.get(k);if(!a){a=[];grid.set(k,a)}a.push(e)}}
function forNear(x,y,rad,fn){const c0=Math.floor((x-rad)/CELL),c1=Math.floor((x+rad)/CELL),r0=Math.floor((y-rad)/CELL),r1=Math.floor((y+rad)/CELL);for(let cx=c0;cx<=c1;cx++)for(let cy=r0;cy<=r1;cy++){const a=grid.get(gk(cx,cy));if(a)for(let i=0;i<a.length;i++)if(fn(a[i])===true)return}}
const hittable=e=>e.alive&&!e.phased&&!e.under&&!e.gone;
function nearest(x,y,rad,skip,pred){let b=null,bd=rad*rad;forNear(x,y,rad,e=>{if(!hittable(e)||e===skip||e.y<-10)return;if(pred&&!pred(e))return;const d=(e.x-x)**2+(e.y-y)**2;if(d<bd){bd=d;b=e}});return b}

/* ================= effects ================= */
function spark(x,y,c,n,spd=220,life=.45,size=3){for(let i=0;i<n&&parts.length<PMAX;i++){const a=rnd(0,TAU),s=rnd(.25,1)*spd;parts.push({k:0,x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:life*rnd(.6,1),m:life,s:size*rnd(.6,1.3),c})}}
function ringFx(x,y,c,r,life=.35,w=4){if(parts.length<PMAX)parts.push({k:1,x,y,l:life,m:life,s:r,c,w})}
function smoke(x,y,n,r=14){for(let i=0;i<n&&parts.length<PMAX;i++){const a=rnd(0,TAU),s=rnd(10,60);parts.push({k:2,x:x+rnd(-8,8),y:y+rnd(-8,8),vx:Math.cos(a)*s,vy:Math.sin(a)*s-10,l:rnd(.5,.9),m:.9,s:r*rnd(.6,1.2),c:'60,52,70'})}}
function shards(x,y,c,n){for(let i=0;i<n&&parts.length<PMAX;i++){const a=rnd(0,TAU),s=rnd(80,260);parts.push({k:3,x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:rnd(.4,.8),m:.8,s:rnd(3,7),c,rot:rnd(0,6),vr:rnd(-12,12)})}}
function addNum(x,y,v,crit,col){if(nums.length>(crit?90:50))return;nums.push({x:x+rnd(-8,8),y,v:typeof v==='number'?fmt(v):v,l:crit?.9:.6,m:crit?.9:.6,c:col||(crit?'#ffd166':'#fff'),s:crit?24:15})}
function pop(t,x,y,c,s=30,sub,subc){pops.push({t,x,y,c,s,l:1.4,m:1.4,sub,subc})}
function boltFx(x1,y1,x2,y2,c='#c3b0ff',w=3){const pts=[[x1,y1]],n=6;for(let i=1;i<n;i++){const t=i/n;pts.push([x1+(x2-x1)*t+rnd(-12,12),y1+(y2-y1)*t+rnd(-12,12)])}pts.push([x2,y2]);bolts.push({pts,l:.18,m:.18,c,w})}
let bannerTO=0;function banner(html,col){const b=$('#banner');b.innerHTML=html;b.style.color=col||'#fff';b.classList.add('on');clearTimeout(bannerTO);bannerTO=setTimeout(()=>b.classList.remove('on'),1800)}
let shakeOn=true,shakeCd=0,shakeT=0;try{shakeOn=STORE.get('vg_shake')!=='off'}catch(e){}
function addShake(v){if(RM||!shakeOn||v<8||shakeCd>0)return;shake=Math.min(8,v*.45);shakeT=0;shakeCd=2}

/* ================= zones (telegraphed attacks) ================= */
function zone(o){const z=Object.assign({t:0,warn:1,dur:.15,dmg:15,col:'255,60,80',fired:false,cont:false,scroll:false},o);if(!z.fixed)z.warn*=D.tele;zones.push(z);return z}
function inZone(z,x,y,pad){switch(z.k){case'c':return(x-z.x)**2+(y-z.y)**2<(z.r+pad)**2;case'r':return x>z.x-pad&&x<z.x+z.w+pad&&y>z.y-pad&&y<z.y+z.h+pad;case'l':return segDist(x,y,z.x1,z.y1,z.x2,z.y2)<z.w/2+pad;case'wave':{const d=Math.hypot(x-z.x,y-z.y);return z.rr>0&&Math.abs(d-z.rr)<12+pad}}return false}
function updateZones(dt){
  const hs=hpScale(),eOk=e=>hittable(e)&&!e.d.boss&&!e.d.mini&&!e.d.part;
  for(const z of zones){
    z.t+=dt;
    if(z.scroll){const s=SCROLL*dt;if(z.k==='l'){z.y1+=s;z.y2+=s}else z.y+=s}
    if(z.follow)z.follow(z,dt);
    if(!z.fired&&z.t>=z.warn){z.fired=true;if(z.onFire)z.onFire(z);
      if(z.dmg&&!z.cont&&z.k!=='wave'&&inZone(z,P.x,P.y,P.r*.4))damagePlayer(z.dmg);
      const ed=z.edmg||(z.dmg&&!z.cont&&z.k!=='wave'&&!z.noE?z.dmg*4*hs:0);if(ed){for(const e of enemies)if(eOk(e)&&inZone(z,e.x,e.y,e.r*.5))hurt(e,ed,{num:false})}}
    if(z.fired&&z.t<z.warn+z.dur){
      if(z.cont&&z.dmg&&inZone(z,P.x,P.y,P.r*.4)){damagePlayer(z.dmg);if(z.slow)P.slowT=.25}
      if(z.k==='wave'){z.rr+=z.spd*dt;if(!z.hitP&&inZone(z,P.x,P.y,P.r*.4)){if(damagePlayer(z.dmg))z.hitP=true}}
      const ce=z.contE||(z.cont&&z.dmg&&!z.noE?z.dmg*3*hs:0);if(ce){for(const e of enemies)if(eOk(e)&&inZone(z,e.x,e.y,e.r*.5))hurt(e,ce*dt,{num:false})}
      if(z.k==='wave'&&z.dmg&&!z.noE){z.hitE=z.hitE||new Set();for(const e of enemies)if(eOk(e)&&!z.hitE.has(e.id)&&inZone(z,e.x,e.y,e.r*.5)){z.hitE.add(e.id);hurt(e,z.dmg*4*hs,{num:false});if(pushable(e))knock(e,z.x,z.y,300)}}
    }
    if(z.t>=z.warn+z.dur)z.dead=true;
  }
  zones=zones.filter(z=>!z.dead);
}

/* ================= player damage ================= */
function damagePlayer(d,o={}){
  if(state!=='play'||P.iframe>0||P.dashT>0)return false;
  if(o.contact&&P.whirlT>0)return false;
  if(P.shieldT>0){P.iframe=.3;ringFx(P.x,P.y,'127,231,255',40,.3,4);return false}
  if(bossE&&run&&run.bstat)run.bstat.hits++;
  d*=P.armorM*D.dmg*(1+.15*(stage-1));P.hp-=d;P.hurtAt=runT;P.iframe=.7*D.iframe;P.hurtT=.25;addShake(10);flashA=.3;flashCol='255,50,80';sfx.hurt();addNum(P.x,P.y-34,'-'+Math.round(d),true,'#ff6b7f');
  if(P.hp<=0)playerDown();
  return true;
}
function dotPlayer(d){if(state!=='play'||P.dashT>0)return;P.hp-=d*P.armorM*D.dmg*(1+.15*(stage-1));if(P.hp<=0)playerDown()}
function playerDown(){
  if(P.meta.second&&!P.secondUsed){P.secondUsed=true;P.hp=1;P.iframe=2;flashA=.7;flashCol='255,255,255';pop('Second wind',P.x,P.y-70,'#fff',32);sfx.fuse();return}
  if(P.re.has('phoenix')&&!P.revived){P.revived=true;P.hp=P.maxHp*.5;P.iframe=2.5;flashA=.9;flashCol='255,170,60';addShake(18);explode(P.x,P.y,180,baseDmg()*10,{col:'255,150,50'});pop('Phoenix Feather',P.x,P.y-70,'#ffb04a',32);sfx.fuse();return}
  P.hp=0;die();
}

/* ================= enemies ================= */
function spawnEnemy(type,x,y,o={}){
  const d=ED[type],m=hpScale()*(o.hpm||1);
  const e={id:nextId++,type,d,x:clamp(x,L+d.r,R-d.r),y,r:d.r,hp:d.hp*m,max:d.hp*m,spd:(d.spd||0)*rnd(.9,1.12)*spdScale(),alive:true,flash:0,slowT:0,frzT:0,burnT:0,burnDps:0,poisT:0,poisSt:0,poisDps:0,shield:(d.shield||0)*m,shieldMax:(d.shield||0)*m,ph:rnd(0,3),phased:false,shootT:rnd(.6,1.4),mode:0,stopY:rnd(140,H*.34),hold:0,orbCd:0,wob:rnd(0,6),heavy:!!d.heavy,t:0,aff:null,vx:0,vy:0,shatCd:0,dmgM:1,under:false,gone:false,atkT:1.5,atkI:0,alpha:1};
  if(!o.noChamp&&!d.mini&&!d.boss&&type!=='mini'&&Math.random()<champC())champify(e);
  enemies.push(e);return e;
}
function champify(e){const a=pick(Object.keys(AFFIX));e.aff=a;e.champ=true;e.hp*=3.2;e.max*=3.2;e.r*=1.25;if(a==='swift')e.spd*=1.7;if(a==='armored')e.dmgM=.5;if(a==='shielded'){e.shield=e.max*.5;e.shieldMax=e.shield}}
function mobN(){let n=0;for(const e of enemies)if(e.alive&&!e.d.boss&&!e.d.mini&&!e.d.part)n++;return n}
const MOBCAP=75;
function spawnCrowd(){
  const room=MOBCAP+15-mobN();if(room<10)return;
  const n=Math.min(room,55,Math.round((14+stage*7+Math.floor(stageT/5))*Math.min(D.dens,1.3)));
  const cols=clamp(Math.round(Math.sqrt(n*1.1)),5,11),rows=Math.ceil(n/cols),sp=31,width=(cols-1)*sp;
  const cx=rnd(L+width/2+16,R-width/2-16);let k=0;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){if(k++>=n)break;let t='grunt';if(stage>=2&&Math.random()<.18)t='runner';if(stage>=2&&r===rows-1&&Math.random()<.4)t='shield';if(stage>=3&&Math.random()<.06)t='bomber';
    spawnEnemy(t,cx-width/2+c*sp+rnd(-5,5)+(r%2?sp/2:0),-40-r*sp+rnd(-4,4))}
}
function spawnScatter(){if(mobN()>MOBCAP)return;const pool=['grunt','grunt','runner','runner','bomber','shooter'];if(stage>=2)pool.push('shield','splitter','ghost','charger');const n=ri(5,8)+stage;for(let i=0;i<n;i++)spawnEnemy(pick(pool),rnd(L+20,R-20),-30-rnd(0,220))}
function spawnElite(){if(mobN()>MOBCAP+10)return;const opts=[['brute','grunt','grunt'],['shooter','shooter','shooter'],['splitter','splitter'],['bomber','bomber','bomber','runner','runner'],['ghost','ghost','ghost'],['shield','shield','shield','shooter'],['charger','charger']];const set=pick(opts);const extra=stage>=3?pick(opts):[];[...set,...extra].forEach((t,i)=>spawnEnemy(t,rnd(L+40,R-40),-40-i*40))}
function spawnBats(){const n=ri(3,4)+Math.min(4,stage);const side=pick([-1,1]);for(let i=0;i<n;i++)later(i*.28,()=>{const sd=stage>=2&&i%2?-side:side;const e=spawnEnemy('bat',sd<0?L+6:R-6,rnd(60,ZTOP-40));e.side=sd})}
function spawnChargers(){const n=1+Math.min(3,Math.floor(stage/2)+(Math.random()<.5?1:0));for(let i=0;i<n;i++)spawnEnemy('charger',rnd(L+40,R-40),-30-i*60)}
function spawnMoles(){const n=ri(2,3)+Math.floor(stage/2);for(let i=0;i<n;i++)later(i*.5,()=>{const e=spawnEnemy('mole',rnd(L+40,R-40),rnd(80,240));e.under=true;e.mode=0;e.t=0})}
function spawnStalkers(){const n=ri(2,3)+Math.floor(stage/2);for(let i=0;i<n;i++){const x=rnd(L+30,R-30);zone({k:'c',x,y:H-20,r:22,warn:.8,dur:0,dmg:0,col:'194,139,255',tag:'up'});later(.8+i*.15,()=>spawnEnemy('stalker',x,H+20))}}

function hurt(e,d,o={}){
  if(!e.alive||d<=0||e.gone)return;
  if(e.inv){if(Math.random()<.25)spark(e.x+rnd(-e.r,e.r)*.5,e.y+e.r*.5,'#9aa0b0',2,120,.2,2);if(o.num!==false&&Math.random()<.04)addNum(e.x,e.y-e.r,'IMMUNE',false,'#9aa0b0');return}
  d*=e.dmgM;if(P.re.has('mark')&&(e.champ||e.d.boss||e.d.mini))d*=1.3;
  if(e.tw){e.lastHit=runT;if(e.tw.includes('armored')&&e.hp>e.max*.6)d*=.65}
  {const b=e.d.boss?e:e.owner;if(b&&b.bt0!=null){const ft=runT-b.bt0;if(ft>30)d*=1+(ft-30)/15}}
  if(e.shield>0&&o.front){const a=Math.min(e.shield,d);e.shield-=a;d-=a;spark(e.x,e.y+e.r*.7,'#9fd4ff',2,160,.25,2.5);if(e.shield<=0){shards(e.x,e.y+e.r,'#9aa1b4',10);sfx.boom()}if(d<=0){e.flash=.05;return}}
  e.hp-=d;e.flash=.07;
  if(o.num!==false)addNum(e.x,e.y-e.r,d,o.crit,o.col);
  if(e.d.boss&&e.phase<e.phases){const th=e.max*(e.phases-e.phase)/e.phases;if(e.hp<=th){e.hp=th;bossPhase(e);return}}
  if(e.hp<=0)kill(e);
}
function kill(e){
  if(!e.alive)return;e.alive=false;kills++;if(S)S.codex.en[e.type]=(S.codex.en[e.type]||0)+1;if(kills>=1000)ach('kills1000');dropGold(e);
  if(BIOME==='forge'&&!e.d.boss&&!e.d.part&&Math.random()<.12)zone({k:'c',x:e.x,y:e.y,r:26,warn:.3,dur:2.2,dmg:6,cont:true,col:'255,120,40',fire:true,fixed:true});
  combo++;comboT=1.6;maxCombo=Math.max(maxCombo,combo);if(run&&run.mode!=='daily'){if(P.cls==='ranger'&&combo>=150)ach('wranger2');if(P.cls==='gunner'&&kills>=1500)ach('wgunner2')}
  if(P.re.has('keg')&&!e.d.boss&&!e.d.part&&Math.random()<.2)later(.05,()=>explode(e.x,e.y,54,baseDmg()*1.6,{col:'255,150,60',small:true,quiet:true}));
  addScore(e.d.sc*(e.champ?4:1)*(1+Math.min(combo,200)/40)*(1+(stage-1)*.5)*P.scoreM,'kills');
  const big=e.heavy||e.champ;
  spark(e.x,e.y,e.d.col,big?22:9,big?320:230,.5,big?4:3);spark(e.x,e.y,'#fff',3,150,.25,2.5);ringFx(e.x,e.y,'255,255,255',e.r*1.4,.25,3);
  if(e.type!=='ghost')shards(e.x,e.y,'#efe2c4',big?8:3);
  sfx.kill();
  let xp=e.d.xp*(e.champ?4:1)*(P.cu.has('greed')?1.5:1);
  if(xp){const n=Math.min(Math.ceil(xp),14),v=xp/n;for(let i=0;i<n;i++)gems.push({x:e.x+rnd(-12,12)*(n>1),y:e.y+rnd(-12,12)*(n>1),v,vx:rnd(-80,80)*(n>1?1:.5),vy:rnd(-80,80)*(n>1?1:.5),big:v>1.5})}
  P.killN++;
  if(P.cls==='berserker'&&P.killN%5===0)heal(1,true);
  if(P.re.has('fang')&&P.killN%6===0)heal(1,true);
  if(P.cu.has('blood'))heal(1,true);
  const dropC=(e.champ?.15:e.heavy?.08:(e.type==='grunt'||e.type==='mini'||e.type==='runner'||e.type==='bat')?.002:.012)*(P.re.has('clover')?1.5:1);
  if(!e.d.boss&&!e.d.mini&&!e.d.part&&runT-(P.dropAt??-99)>8&&pickups.length<2&&Math.random()<dropC){P.dropAt=runT;dropPickup(e.x,e.y)}
  if(e.type==='clone'){ring(e.x,e.y,10,160,rnd(0,TAU),12,{pinkEvery:5});smoke(e.x,e.y,6,16)}
  if(e.owner&&e.type!=='clone'&&e.owner.parts.every(p=>!p.alive))partsDead(e.owner);
  if(e.d.split){for(let i=0;i<3;i++)spawnEnemy('mini',e.x+rnd(-14,14),e.y+rnd(-10,10),{noChamp:true})}
  if(e.d.bomb)explode(e.x,e.y,80,40*hpScale(),{player:16,col:'255,140,50'});
  if(e.aff==='volatile'){const x=e.x,y=e.y;zone({k:'c',x,y,r:85,warn:.55,dur:0,dmg:22,col:'255,140,50',onFire:()=>explode(x,y,85,30*hpScale(),{col:'255,140,50'})})}
  if(e.poisSt>0&&P.fu.has('plague'))clouds.push({x:e.x,y:e.y,r:58,t:2.5,m:2.5,dps:baseDmg()*1.2});
  if(e.d.mini)miniDown(e);
  if(e.d.boss)bossDown(e);
}
function explode(x,y,rad,dmg,o={}){
  forNear(x,y,rad+50,e=>{if(!hittable(e))return;const dx=e.x-x,dy=e.y-y;if(dx*dx+dy*dy<(rad+e.r)**2){hurt(e,e.d.boss&&dmg>1e8?e.max*.02:dmg,{num:!o.quiet,col:'#ffb36b'});if(o.knock&&!e.heavy&&e.alive){const l=Math.hypot(dx,dy)||1;e.x+=dx/l*o.knock;e.y+=dy/l*o.knock}}});
  if(o.player&&(P.x-x)**2+(P.y-y)**2<(rad+P.r)**2)damagePlayer(o.player);
  for(const h of hazards)if((h.k==='barrel'||h.k==='pot'||h.k==='mine')&&!h.dead&&(h.x-x)**2+(h.y-y)**2<(rad+20)**2)h.hp=-1;
  const c=o.col||'255,150,60';
  ringFx(x,y,c,rad,.35,o.small?3:6);if(!o.small)ringFx(x,y,'255,255,255',rad*.6,.2,3);spark(x,y,`rgb(${c})`,o.small?8:18,rad*4,.5,o.small?3:4);if(!o.small){spark(x,y,'#fff3c4',8,rad*2.5,.35,3);smoke(x,y,5,rad*.3)}
  addShake(o.small?1:rad/14);sfx.boom();
  if(o.cluster){for(let i=0;i<3;i++){const a=rnd(0,TAU),r2=rad*rnd(.8,1.3),bx=x+Math.cos(a)*r2,by=y+Math.sin(a)*r2;later(.22+i*.06,()=>explode(bx,by,rad*.6,dmg*.5,{col:c,small:true,quiet:true}))}}
}
function slam(x,y,rad,dmg){forNear(x,y,rad+50,e=>{if(!hittable(e))return;const dx=e.x-x,dy=e.y-y;if(dx*dx+dy*dy<(rad+e.r)**2){const crit=Math.random()<P.critC;hurt(e,dmg*(crit?(P.re.has('whet')?3:2.5):1),{crit});if(e.alive){applyStatus(e);if(!e.heavy&&!e.d.boss){const l=Math.hypot(dx,dy)||1;e.x+=dx/l*14;e.y+=dy/l*14}}}});for(const row of gateRows){if(row.used||Math.abs(row.y+24-y)>rad+24)continue;for(const g of row.gates)if(g.grow&&x>g.x-rad*.5&&x<g.x+g.w+rad*.5)growHit(row,g,clamp(x,g.x+10,g.x+g.w-10),2)}ringFx(x,y,'230,200,150',rad,.3,5);shards(x,y,'#b8a58a',8);smoke(x,y,3,rad*.3);sfx.boom()}
function chain(from,dmg,n,rad=140){let cur=from;const hit=new Set([from.id]);for(let i=0;i<n;i++){const nx=nearest(cur.x,cur.y,rad,null,e=>!hit.has(e.id));if(!nx)break;hit.add(nx.id);boltFx(cur.x,cur.y,nx.x,nx.y);hurt(nx,dmg,{col:'#d6c8ff'});cur=nx}if(n)sfx.zap()}
function frz(e,t){if(!(e.frzT>0)&&run){run.frz=(run.frz||0)+1;if(run.frz>=60&&P.cls==='mage'&&run.mode!=='daily')ach('wmage2')}e.frzT=Math.max(e.frzT||0,t)}
function applyStatus(e,src){
  if(P.fireL){e.burnT=3;e.burnDps=Math.max(e.burnDps,baseDmg()*.4*P.fireL*(src&&src.plasma?3:1))}
  if(P.iceL){e.slowT=2;if(Math.random()<.06*P.iceL*(P.fu.has('crystal')?2:1)&&!e.d.boss&&!e.d.mini)frz(e,1.1)}
  if(P.poisL){e.poisSt=Math.min(e.poisSt+1,4*P.poisL);e.poisT=4;e.poisDps=baseDmg()*.1*(P.fu.has('plague')?2:1)}
}

/* ================= player weapons ================= */
const PSPD={arrow:900,orb:560,bullet:1150,axe:640,lance:1000,wbolt:650,rain:1000,spear:950,rocket:520,disc:720};
const SIDEK={arrow:'arrow',orb:'orb',bullet:'bullet',axe:'axe',zap:'wbolt',shot:'bullet',spear:'spear',sky:'arrow',frost:'wbolt',meteor:'orb',rocket:'bullet',disc:'spear',slam:'spear'};
function newProj(k,x,y,ang,dmg,o={}){
  if(projs.length>1100)return;const sp=o.sp||PSPD[k];
  const col=o.col||(P.elem?ELEMCOL[P.elem]:({arrow:'#ffd166',orb:'#b58bff',bullet:'#ffe066',axe:'#dfe6f2',lance:'#fff',wbolt:'#7fe7ff',rain:'#8fe3ff',spear:'#e8d6b0',rocket:'#ff9a5a',disc:'#dfe6f2'}[k]));
  projs.push({k,x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,dmg,pierce:(k==='lance'||k==='axe')?999:P.pierceN+(o.pierce||0),ric:k==='axe'||k==='lance'?0:P.ricN+(o.ric||0),wb:o.wb??(k==='axe'||k==='lance'?0:1),life:o.life||0,sz:({arrow:4,orb:7,bullet:3,axe:10,lance:8,wbolt:4,rain:4,spear:6,rocket:6,disc:9}[k])*(1+.3*P.giantL)*(o.big||1),last:-1,dead:false,col,hom:o.hom??(k==='axe'?0:P.homN),ht:null,hc:0,t:0,dist:0,ph:0,hits:k==='axe'?new Set():null,hitsLeft:k==='axe'?3+P.pierceN+(P.C.id==='axes'?2*(P.sk.wenh||0):0):0,knock:o.knock||0,plasma:!!o.plasma,chill:!!o.chill,meteor:!!o.meteor,sky:!!o.sky});
}
function volley(echo){
  const C=P.C,n=P.projN,shots0=Math.min(n,C.cap),mult=Math.pow(n/shots0,.85),dmg=baseDmg()*mult,WL=P.sk.wenh||0,WID=C.id||'bow',shots=shots0+(WID==='bow'||WID==='sky'?WL:0);
  if(!echo)volleyN++;
  switch(C.w){
    case'arrow':{const sp=(shots>1?Math.min(1.05,.055*(shots-1)):0)*(C.spreadM||1);for(let i=0;i<shots;i++){const t=shots>1?i/(shots-1):.5;newProj('arrow',P.x+(t-.5)*Math.min(26,shots*1.5),P.y-18,-Math.PI/2-sp/2+sp*t+rnd(-.012,.012),dmg,{big:C.bigM||1,pierce:C.basePierce||0,sp:C.psp,hom:C.homB?P.homN+C.homB:undefined})}break}
    case'zap':{const used=new Set();let hitAny=false;for(let i=0;i<shots;i++){const e=nearest(P.x,P.y-20,470,null,o=>!used.has(o.id));if(!e)break;used.add(e.id);hitAny=true;boltFx(P.x+14,P.y-26,e.x,e.y,'#c3b0ff',3);const f={k:'zap',x:e.x,y:e.y,vx:0,vy:-1,dmg,pierce:0,ric:0,col:'#c3b0ff',last:-1};procHit(f,e);chain(e,dmg*(.6+.1*WL),2+P.pierceN+P.ricN+2*WL,190)}const tg=[...used].map(id=>enemies.find(o=>o.id===id)).filter(o=>o&&o.alive);for(let i=used.size,j=0;i<shots&&tg.length;i++,j++){const e=tg[j%tg.length];boltFx(P.x+14,P.y-26,e.x,e.y,'#c3b0ff',2);procHit({k:'zap',x:e.x,y:e.y,vx:0,vy:-1,dmg:dmg*.75,pierce:0,ric:0,col:'#c3b0ff',last:-1},e)}const gg=growGateNear(P.x,P.y,470,30);if(gg){const [row,g]=gg,gx=clamp(P.x,g.x+10,g.x+g.w-10);boltFx(P.x+14,P.y-26,gx,row.y+24,'#c3b0ff',3);growHit(row,g,gx,Math.min(shots,3));hitAny=true}if(!hitAny)spark(P.x+14,P.y-26,'#c3b0ff',3,80,.2,2);break}
    case'shot':{const n=Math.min(24,5+2*(shots-1)+3*WL),sp=.55;for(let i=0;i<n;i++){const t=i/(n-1);newProj('bullet',P.x,P.y-28,-Math.PI/2-sp/2+sp*t+rnd(-.04,.04),dmg,{life:.3,sp:rnd(850,1000)})}break}
    case'spear':{const sp=shots>1?Math.min(1.1,.2*(shots-1)):0;for(let i=0;i<shots;i++){const t=shots>1?i/(shots-1):.5;newProj('spear',P.x,P.y-16,-Math.PI/2-sp/2+sp*t,dmg,{pierce:4+2*WL})}break}
    case'orb':{const sp=shots>1?Math.min(1.2,.14*(shots-1)):0;for(let i=0;i<shots;i++){const t=shots>1?i/(shots-1):.5;newProj('orb',P.x+12,P.y-26,-Math.PI/2-sp/2+sp*t,dmg)}break}
    case'bullet':{const jit=(C.jit||.035)+(P.moveAmt>60?.17:0);for(let i=0;i<shots;i++)newProj('bullet',P.x+(i-(shots-1)/2)*9,P.y-30,-Math.PI/2+rnd(-jit,jit),dmg,{pierce:WID==='rifle'?WL:0});break}
    case'sky':{const used=new Set(),tg=[];for(let i=0;i<shots;i++){let e=nearest(P.x,P.y-260,620,null,o=>!used.has(o.id)&&o.y<P.y);if(!e&&tg.length)e=tg[i%tg.length];let tx,ty;if(e){if(!used.has(e.id)){used.add(e.id);tg.push(e)}tx=e.x;ty=e.y}else{tx=clamp(P.x+rnd(-160,160),L+20,R-20);ty=P.y-rnd(220,420)}const x0=clamp(tx+rnd(-40,40),L+10,R-10),y0=Math.max(-20,ty-320);newProj('rain',x0,y0,Math.atan2(ty-y0,tx-x0),dmg,{wb:0,hom:e?3:0,sky:true})}const gg=growGateNear(P.x,P.y,620,20);if(gg){const [row,g]=gg;newProj('rain',clamp(P.x,g.x+12,g.x+g.w-12),row.y-260,Math.PI/2,dmg,{wb:0,hom:0,sky:true})}break}
    case'frost':{const sp=shots>1?Math.min(.9,.1*(shots-1)):0;for(let i=0;i<shots;i++){const t=shots>1?i/(shots-1):.5;newProj('wbolt',P.x+10,P.y-26,-Math.PI/2-sp/2+sp*t+rnd(-.02,.02),dmg,{pierce:1,col:'#a8e8ff',chill:true,sp:980})}break}
    case'meteor':{const sp=shots>1?Math.min(1.2,.16*(shots-1)):0;for(let i=0;i<shots;i++){const t=shots>1?i/(shots-1):.5;newProj('orb',P.x+12,P.y-26,-Math.PI/2-sp/2+sp*t,dmg,{big:1.5,col:'#ff8a3d',meteor:true,sp:430})}break}
    case'rocket':{const sp=shots>1?Math.min(1,.18*(shots-1)):0;for(let i=0;i<shots;i++){const t=shots>1?i/(shots-1):.5;newProj('rocket',P.x+(t-.5)*20,P.y-28,-Math.PI/2-sp/2+sp*t,dmg)}break}
    case'disc':{const sp=shots>1?Math.min(1.3,.24*(shots-1)):0;for(let i=0;i<shots;i++){const t=shots>1?i/(shots-1):.5;newProj('disc',P.x,P.y-16,-Math.PI/2-sp/2+sp*t,dmg,{ric:4+2*WL,wb:3})}break}
    case'slam':{for(let i=0;i<shots;i++){const an=-Math.PI/2+(i-(shots-1)/2)*.55,dd=78+8*P.giantL,x=clamp(P.x+Math.cos(an)*dd,L+20,R-20),y=P.y+Math.sin(an)*dd;const rad=64+9*P.giantL+5*P.explL;later(i*.05,()=>slam(x,y,rad,dmg));if(WL)later(i*.05+.28,()=>slam(x,y,rad*1.25,dmg*(.3+.2*WL)))}break}
    case'axe':{const sp=shots>1?Math.min(1.5,.26*(shots-1)):0;for(let i=0;i<shots;i++){const t=shots>1?i/(shots-1):.5;newProj('axe',P.x,P.y-16,-Math.PI/2-sp/2+sp*t,dmg)}break}
  }
  const one=C.w==='bullet'||C.w==='shot'?baseDmg()*2.5:baseDmg();const kind=SIDEK[C.w];
  for(let k=0;k<P.sideN;k++)for(const s of[-1,1])newProj(kind,P.x,P.y-12,-Math.PI/2+s*(.6+.13*k),one,{wb:2});
  for(let k=0;k<P.backN;k++)newProj(kind,P.x,P.y+12,Math.PI/2+(k-(P.backN-1)/2)*.25,one,{wb:1});
  if(!echo&&P.fu.has('plasma')&&volleyN%3===0)newProj('lance',P.x,P.y-20,-Math.PI/2,baseDmg()*3*mult,{col:'#ff9a5a',plasma:true});
  if(!echo&&P.fu.has('ballista')&&volleyN%4===0)newProj('lance',P.x,P.y-20,-Math.PI/2,baseDmg()*6*mult,{col:'#f4efe6',knock:26,big:1.4});
  if(!echo&&P.re.has('echo')&&volleyN%4===0)P.echoT=.09;
  P.pull=1;sfx.shoot();
}
function procHit(a,e){
  let d=a.dmg*(a.k==='axe'&&a.ph?.6:1);const crit=Math.random()<P.critC;if(crit)d*=P.re.has('whet')?3:2.5;const WL=P.sk.wenh||0,WID=P.C.id;if(WL){if(WID==='seeker'&&e.hp<e.max*.5)d*=1+.3*WL;if(WID==='frost'&&e.frzT>0)d*=1+.25*WL}
  if(crit&&P.fu.has('exec')&&!e.d.boss&&!e.d.mini&&(e.hp-d*e.dmgM)<e.max*.35&&e.hp>0){d=(e.hp+1)/e.dmgM;addNum(e.x,e.y-e.r-14,'EXECUTE',true,'#ff6b7f')}
  hurt(e,d,{crit,front:a.vy<0});sfx.hit();spark(a.x,a.y,a.col,2,140,.2,2.5);
  if(e.alive&&!e.heavy&&!e.d.boss){if(a.k==='axe')e.y-=2;if(a.knock)e.y-=a.knock}
  if(e.alive)applyStatus(e,a);
  if(P.voltL){if(P.fu.has('crystal')&&e.slowT>0)chain(e,baseDmg()*.5,4);else if(Math.random()<.45)chain(e,baseDmg()*.45,1+P.voltL)}
  if(a.chill&&e.alive){e.slowT=Math.max(e.slowT,2);if(!e.d.boss&&!e.d.mini&&Math.random()<.1+.1*WL)frz(e,1)}
  if(a.k==='arrow'&&WID==='crossbow'&&WL)explode(a.x,a.y,30+10*WL,a.dmg*.3*WL,{col:'255,200,120',small:true,quiet:true});
  if(a.k==='orb'&&a.meteor){const rad=62+8*P.explL+8*P.giantL+15*WL;explode(a.x,a.y,rad,a.dmg*.6,{col:'255,120,50',cluster:P.fu.has('cluster'),small:true,quiet:true});forNear(a.x,a.y,rad+40,o=>{if(hittable(o)&&(o.x-a.x)**2+(o.y-a.y)**2<(rad+o.r)**2){o.burnT=3+2*WL;o.burnDps=Math.max(o.burnDps,baseDmg()*.35)}})}
  else if(a.k==='orb')explode(a.x,a.y,(38+6*P.explL+6*P.giantL)*(WID==='orb'?1+.3*WL:1),a.dmg*.6*(WID==='orb'?1+.2*WL:1),{col:'181,139,255',cluster:P.fu.has('cluster'),small:true,quiet:true});
  else if(a.k==='rocket')explode(a.x,a.y,52+7*P.explL+6*P.giantL+8*WL,a.dmg*.9,{col:'255,140,60',cluster:P.fu.has('cluster')||WL>0,small:true,quiet:true});
  else if(P.explL&&a.k!=='lance')explode(a.x,a.y,32+7*P.explL,baseDmg()*(.3+.1*P.explL),{col:'255,110,80',cluster:P.fu.has('cluster'),small:true,quiet:true});
  if(P.fu.has('thermal')&&e.alive&&e.burnT>0&&e.slowT>0&&e.shatCd<=0){e.shatCd=1;explode(e.x,e.y,62,baseDmg()*3,{col:'200,235,255'});shards(e.x,e.y,'#bfe8ff',10)}
  if(a.k==='axe'){a.hits.add(e.id);if(--a.hitsLeft<=0){a.dead=true;spark(a.x,a.y,'#dfe6f2',6,160,.3,3)}return}
  a.last=e.id;
  if(a.pierce>0){a.pierce--;return}
  if(a.ric>0){const nx=nearest(a.x,a.y,280,e);if(nx){const an=Math.atan2(nx.y-a.y,nx.x-a.x),sp=Math.hypot(a.vx,a.vy);a.vx=Math.cos(an)*sp;a.vy=Math.sin(an)*sp;a.ric--;return}}
  a.dead=true;
}
function updateProjs(dt){
  for(const a of projs){if(a.dead)continue;a.t+=dt;if(a.life){a.life-=dt;if(a.life<=0){a.dead=true;continue}}
    if(a.k==='rocket'){const sp=Math.hypot(a.vx,a.vy);if(sp<1300){a.vx*=1+dt*1.6;a.vy*=1+dt*1.6}if(Math.random()<.5)spark(a.x-a.vx*.02,a.y-a.vy*.02,'#ffb36b',1,40,.25,3)}
    if(a.k==='axe'){
      if(a.ph===0){a.dist+=Math.hypot(a.vx,a.vy)*dt;if(a.dist>300||a.t>.6){a.ph=1;a.hits.clear()}}
      else{const dx=P.x-a.x,dy=P.y-a.y,d=Math.hypot(dx,dy)||1,sp=760;a.vx+=(dx/d*sp-a.vx)*Math.min(1,dt*7);a.vy+=(dy/d*sp-a.vy)*Math.min(1,dt*7);if(d<22||a.t>3){a.dead=true;continue}}
    }else if(a.hom){a.hc-=dt;if(a.hc<=0||!a.ht||!hittable(a.ht)){a.hc=.2;a.ht=nearest(a.x,a.y,260,null,e=>a.k==='rain'||(a.vy<0?e.y<a.y+10:e.y>a.y-10))}
      if(a.ht&&hittable(a.ht)){const sp=Math.hypot(a.vx,a.vy),cur=Math.atan2(a.vy,a.vx),want=Math.atan2(a.ht.y-a.y,a.ht.x-a.x);let df=want-cur;while(df>Math.PI)df-=TAU;while(df<-Math.PI)df+=TAU;const na=cur+clamp(df,-a.hom*3.2*dt,a.hom*3.2*dt);a.vx=Math.cos(na)*sp;a.vy=Math.sin(na)*sp}}
    a.x+=a.vx*dt;a.y+=a.vy*dt;
    if(a.k!=='axe'){
      if(a.x<L+4){if(a.wb>0){a.wb--;a.x=L+4;a.vx=-a.vx;spark(a.x,a.y,'#fff',2,100,.2,2)}else{a.dead=true;continue}}
      else if(a.x>R-4){if(a.wb>0){a.wb--;a.x=R-4;a.vx=-a.vx;spark(a.x,a.y,'#fff',2,100,.2,2)}else{a.dead=true;continue}}
    }else{a.x=clamp(a.x,L+6,R-6)}
    if(a.y<-60||a.y>H+60){if(a.k==='axe'&&a.ph===0){a.ph=1;a.hits.clear()}else if(a.k!=='axe'){a.dead=true;continue}}
    if(a.k!=='rain'||a.sky)for(const row of gateRows){if(row.used)continue;if(Math.abs(a.y-row.y)<26)for(const g of row.gates){if(g.grow&&a.x>g.x+6&&a.x<g.x+g.w-6){if(a.k==='axe'){if(a.gRow===row)break;a.gRow=row;a.ph=1;growHit(row,g,a.x,3)}else{a.dead=true;g.hits+=a.k==='bullet'?Math.min(1,P.C.iv/.36):1;const need=gateNeed();if(g.hits>=need&&g.effs[0].v<GROWCAP){g.hits=0;g.effs[0].v++;g.bump=.18;sfx.grow()}spark(a.x,row.y+24,'#ffd166',2,120,.2,2.5)}break}}if(a.dead)break}
    if(a.dead)continue;
    for(const h of hazards){if(h.dead||!h.shoot)continue;if(h.k==='boulder'&&h.warn>0)continue;if((a.x-h.x)**2+(a.y-h.y)**2<(h.r+a.sz)**2){h.hp-=a.dmg;h.flash=.06;if(a.k!=='lance'&&a.k!=='axe')a.dead=true;spark(a.x,a.y,'#d8c9a8',3,140,.25,2.5);break}}
    if(a.dead)continue;
    for(const b of ebul){if(!b.hp||b.dead)continue;if((a.x-b.x)**2+(a.y-b.y)**2<(b.r+a.sz)**2){b.hp-=a.dmg;spark(b.x,b.y,'#c8f59a',3,120,.2,2.5);if(b.hp<=0){b.dead=true;shards(b.x,b.y,'#e8e0cc',6);sfx.kill()}if(a.k!=='lance'&&a.k!=='axe')a.dead=true;break}}
    if(a.dead)continue;
    forNear(a.x,a.y,a.sz+50,e=>{if(!hittable(e))return;if(a.k==='axe'?a.hits.has(e.id):e.id===a.last)return;const dx=e.x-a.x,dy=e.y-a.y,rr=e.r+a.sz;if(dx*dx+dy*dy<rr*rr){procHit(a,e);return a.dead||a.k!=='axe'&&a.k!=='lance'?true:undefined}});
  }
  projs=projs.filter(a=>!a.dead);
}

/* ================= actives & dash ================= */
function dash(){
  if(state!=='play'||P.dashCd>0||P.dashT>0)return;
  let dx=P.lastDx,dy=P.lastDy;const l=Math.hypot(dx,dy);if(l<.1){dx=0;dy=-1}else{dx/=l;dy/=l}
  P.ddx=dx;P.ddy=dy;P.dashT=.14;P.parryWin=.24;P.dashCd=P.dashMax;P.iframe=Math.max(P.iframe,.34);sfx.dash();
  if(P.re.has('hourglass')){tTarget=.35;tHold=.9}
  if(P.re.has('drum'))P.drumT=2.5;
  if(P.re.has('boots')){forNear(P.x,P.y,150,e=>{if(hittable(e)&&(e.x-P.x)**2+(e.y-P.y)**2<150*150){boltFx(P.x,P.y,e.x,e.y,'#ffe066',3);hurt(e,baseDmg()*3,{col:'#ffe066'})}});ringFx(P.x,P.y,'255,230,100',150,.3,4);sfx.zap()}
}
function useSkill(){
  if(state!=='play'||P.skCd>0)return;
  const C=CLASSES[P.cls],pw=lv('power');P.skCd=P.skMax;sfx.skill();
  if(C.sk==='rain'){P.stormT=3+.5*pw;pop('Arrow Rain',P.x,P.y-70,'#8fe3ff',30)}
  else if(C.sk==='nova'){const rad=170+20*pw;ringFx(P.x,P.y,'170,230,255',rad,.45,8);ringFx(P.x,P.y,'255,255,255',rad*.7,.3,4);
    forNear(P.x,P.y,rad+40,e=>{if(!hittable(e))return;if((e.x-P.x)**2+(e.y-P.y)**2<(rad+e.r)**2){hurt(e,baseDmg()*5*(1+.25*pw),{col:'#bfe8ff'});if(e.alive){if(e.d.boss||e.d.mini)e.slowT=2.5;else frz(e,2+.3*pw)}}});
    for(const b of ebul)if((b.x-P.x)**2+(b.y-P.y)**2<rad*rad){b.dead=true;spark(b.x,b.y,'#bfe8ff',3,100,.3,2.5)}
    for(let i=0;i<24;i++){const a=i*TAU/24;spark(P.x+Math.cos(a)*rad*.6,P.y+Math.sin(a)*rad*.6,'#dff6ff',1,rad,.4,3)}
    flashA=.25;flashCol='170,230,255';addShake(6)}
  else if(C.sk==='grenade'){let tx=P.x,ty=P.y-300,bestN=-1;const cand=enemies.filter(e=>hittable(e)&&e.y>30&&e.y<P.y+100);for(let i=0;i<Math.min(30,cand.length);i++){const c=pick(cand);let n=0;forNear(c.x,c.y,90,o=>{if(hittable(o)&&(o.x-c.x)**2+(o.y-c.y)**2<90*90)n++});if(c.d.boss||c.d.mini)n+=6;if(n>bestN){bestN=n;tx=c.x;ty=c.y}}
    nades.push({x:P.x,y:P.y-20,sx:P.x,sy:P.y-20,tx,ty:Math.max(40,ty),t:0,T:.45,pw})}
  else if(C.sk==='whirl'){P.whirlT=2+.3*pw;whirlBurst(820);pop('Whirlwind',P.x,P.y-70,'#ff7a6b',30)}
}

/* ================= pickups ================= */
function dropPickup(x,y,k){pickups.push({k:k||pick(PICKS),x,y,t:0,vy:-60})}
function collect(p){
  sfx.pick();pop(PICKNAME[p.k],P.x,P.y-64,PICKCOL[p.k],30);ringFx(p.x,p.y,'255,255,255',40,.3,4);spark(p.x,p.y,PICKCOL[p.k],18,260,.5,3);
  switch(p.k){
    case'heart':heal(P.maxHp*.2);break;
    case'shield':P.shieldT=5;break;
    case'rapid':P.rapidT=6;break;
    case'magnet':P.magnetT=8;break;
    case'freeze':freezeAll=3;flashA=.3;flashCol='140,220,255';break;
    case'nuke':flashA=.9;flashCol='255,250,235';addShake(22);sfx.boom();for(const e of enemies)if(hittable(e)&&e.y>-20&&e.y<H)hurt(e,e.d.boss||e.d.mini?e.max*.06:e.max*.6+baseDmg()*4,{num:true,crit:true});for(const h of hazards)if(h.k==='barrel'||h.k==='pot'||h.k==='mine')h.hp=-1;ebul.length=0;break;
  }
}

/* ================= gates ================= */
function goodEff(big){
  const s=stage,k=wpick({proj:3,projx:big&&P.projN<=6?.5:0,dmg:2,rate:2,pierce:.8,elem:1.2,heal:1,maxhp:.8,crit:.7,dash:.5,score:.4});
  switch(k){
    case'proj':return{t:'proj',v:1+Math.floor(s/3)+(big&&Math.random()<.5?1:0)};
    case'projx':return{t:'projx',v:2};
    case'dmg':return{t:'dmg',v:pick(big?[25,30,35]:[10,15,20])};
    case'rate':return{t:'rate',v:pick(big?[20,25]:[10,15])};
    case'pierce':return{t:'pierce',v:big?2:1};
    case'elem':return{t:'elem',v:pick(['fire','ice','volt','poison'])};
    case'heal':return{t:'heal',v:big?60:30};
    case'maxhp':return{t:'maxhp',v:big?40:20};
    case'crit':return{t:'crit',v:big?15:8};
    case'dash':return{t:'dash',v:big?-30:-15};
    case'score':return{t:'score',v:big?2:1.5};
  }
}
function badEff(big){
  const s=stage,k=wpick({proj:P.projN>2?2.5:0,projx:P.projN>3?.8:0,dmg:2,rate:2,ehp:1.6,espd:1.2,maxhp:1,heal:1});
  switch(k){
    case'proj':return{t:'proj',v:-Math.min(P.projN-1,ri(1,2)+Math.floor(s/2)+(big?2:0))};
    case'projx':return{t:'projx',v:.5};
    case'dmg':return{t:'dmg',v:-(big?35:20)};
    case'rate':return{t:'rate',v:-(big?30:15)};
    case'ehp':return{t:'ehp',v:big?40:20};
    case'espd':return{t:'espd',v:big?25:15};
    case'maxhp':return{t:'maxhp',v:-(big?30:15)};
    case'heal':return{t:'heal',v:-(big?30:15)};
  }
}
const GROWCAP=5;function gateNeed(){return 6+stage*2+Math.floor(P.projN/2)}
function growHit(row,g,x,n=1){for(let i=0;i<n;i++){g.hits++;const need=gateNeed();if(g.hits>=need&&g.effs[0].v<GROWCAP){g.hits=0;g.effs[0].v++;g.bump=.18;sfx.grow()}}spark(x,row.y+24,'#ffd166',3,120,.2,2.5)}
function growGateNear(x,y,range,pad){for(const row of gateRows){if(row.used||row.y>y||row.y<y-range)continue;for(const g of row.gates)if(g.grow&&x>g.x-pad&&x<g.x+g.w+pad)return[row,g]}return null}
function gateClass(g){const effs=g.opts?g.opts[g.oi]:g.effs;if(effs.some(e=>e.t==='curse'))return'curse';const inf=effs.map(effInfo);const gd=inf.some(i=>i.good),bd=inf.some(i=>!i.good);return gd&&bd?'pact':gd?'good':'bad'}
function gateEffs(g){return g.opts?g.opts[g.oi]:g.effs}
function spawnGateRow(){
  const s=stage,k=dm('pacts')?'pact':wpick(s===1?{clean:2,pact:2.2,grow:1.4,guarded:1.2,roulette:1,triple:.8}:{clean:.6,pact:3,grow:1,guarded:1.6,roulette:1.6,triple:1.6});
  let sets,extra={};
  if(k==='clean')sets=Math.random()<.6?[[goodEff(false)],[goodEff(false)]]:[[goodEff(true)],[badEff(false)]];
  else if(k==='pact')sets=[[goodEff(true),badEff(Math.random()<.5)],[goodEff(true),badEff(Math.random()<.5)]];
  else if(k==='grow')sets=[[{t:'proj',v:-ri(3,5+s*2)}],Math.random()<.5?[goodEff(false)]:[goodEff(true),badEff(true)]];
  else if(k==='guarded')sets=[[goodEff(true),goodEff(false)],[goodEff(false)]];
  else if(k==='roulette')sets=[null,null];
  else{const cu=Object.keys(CU).filter(c=>!P.cu.has(c));sets=[[goodEff(false)],[goodEff(true),badEff(true)],cu.length?[{t:'curse',v:pick(cu)}]:[badEff(true)]]}
  const n=sets.length,gap=8,w=(R-L-gap*(n-1))/n;
  const order=shuffle(sets.map((x,i)=>i));
  const gates=order.map((si,i)=>{const g={x:L+i*(w+gap),w,hits:0,bump:0,effs:sets[si]};
    if(k==='grow'&&si===0)g.grow=true;
    if(k==='roulette'){g.opts=[[goodEff(true)],[goodEff(true),badEff(true)],[badEff(true)]];shuffle(g.opts);g.oi=ri(0,2);g.ot=rnd(0,.8);g.effs=null}
    if(k==='guarded'&&si===0)g.guard=true;return g});
  let y0=-60;for(const r of gateRows)if(!r.used)y0=Math.min(y0,r.y-250);
  const row={y:y0,gates,used:false,fade:0,kind:k};gateRows.push(row);
  const gd=gates.find(g=>g.guard);
  if(gd){const cw=(R-L)/8,c0=Math.max(0,Math.floor((gd.x-L)/cw)),c1=Math.min(7,Math.floor((gd.x+gd.w-L-1)/cw));const cols=[];for(let c=c0;c<=c1;c++)cols.push(c);
    if(Math.random()<.6)hazards.push({k:'spikes',y:row.y-26-58,h:56,cols,t:rnd(0,.5),cyc:1.8});
    else hazards.push({k:'saw',x:gd.x+gd.w/2,y:row.y-120,r:24,vx:0,rot:0,vert:true,x0:gd.x+gd.w/2,amp:gd.w/2-26,ph:rnd(0,6),horizLane:[gd.x,gd.x+gd.w]})}
}
function applyEff(e){
  switch(e.t){
    case'proj':G.projAdd+=e.v;break;case'projx':G.projMul*=e.v;break;
    case'dmg':G.dmgMul*=1+e.v/100;break;case'rate':G.rateMul*=1+e.v/100;break;
    case'pierce':G.pierce+=e.v;break;case'elem':P.sk[e.v]=(P.sk[e.v]||0)+(P.fused.has(e.v)?0:1);if(P.fused.has(e.v))G.dmgMul*=1.1;P.elem=e.v;break;
    case'heal':if(e.v>0)heal(P.maxHp*e.v/100);else P.hp=Math.max(1,P.hp+P.maxHp*e.v/100);break;
    case'maxhp':G.maxHp+=e.v;break;case'ehp':G.enemyHp*=1+e.v/100;break;case'espd':G.enemySpd*=1+e.v/100;break;
    case'score':G.score*=e.v;break;case'crit':G.crit+=e.v/100;break;case'dash':G.dashCd*=1+e.v/100;break;
    case'curse':P.cu.add(e.v);sfx.curse();break;
  }
}
function passGate(row,g){
  const effs=gateEffs(g),cls=gateClass(g);
  for(const e of effs)applyEff(e);recalc();
  const i0=effInfo(effs[0]),i1=effs[1]?effInfo(effs[1]):null;
  const col=cls==='bad'?'#ff7088':cls==='curse'?'#ff4d8a':'#6dffb0';
  pop(i0.big,P.x,P.y-80,col,i0.big.length>7?30:40,i0.curse?CU[effs[0].v].up+'. '+CU[effs[0].v].dn:i0.sub+(i1?'  ·  '+i1.big+' '+i1.sub:''),i0.curse||(i1&&!i1.good)?'#ff8aa5':'#fff');
  flashA=.18;flashCol=cls==='bad'?'255,60,90':cls==='curse'?'255,60,140':'80,255,160';sfx.gate(cls!=='bad');addShake(cls==='bad'?7:3);
  spark(P.x,P.y-20,col,26,380,.6,4);
  for(const o of row.gates){for(let i=0;i<10;i++)shards(o.x+rnd(10,o.w-10),row.y,o===g?col:'#8a7d9c',1)}
}

/* ================= hazards ================= */
function hazPool(){const p={spikes:2,saw:1.5,flame:1.5,boulder:1.2,barrels:.8,rocks:1.2};if(stage>1||stageT>22){p.laser=1.3;p.mines=1}if(stage>1||stageT>55){p.crusher=1.2;p.pool=.8}if(stage>=2){p.crusher=1.5;p.laser=1.6}const bh=BIOMES[BIOME].haz;for(const k in bh)p[k]=(p[k]||.5)*bh[k];if(BIOME!=='frozen')delete p.ice;return p}
function spawnHazard(k){
  k=k||wpick(hazPool());const cw=(R-L)/8;
  switch(k){
    case'spikes':{const gl=3,g0=ri(0,8-gl);const cols=[];for(let c=0;c<8;c++)if(c<g0||c>=g0+gl)cols.push(c);hazards.push({k:'spikes',y:-70,h:56,cols,g0,gl,mov:stage>=2||Math.random()<.4,t:rnd(0,.4),cyc:2,cycN:0});break}
    case'saw':{if(Math.random()<.5)hazards.push({k:'saw',x:rnd(L+40,R-40),y:-40,r:24,vx:pick([-1,1])*(230+stage*25),rot:0});else{const x0=rnd(L+80,R-80);hazards.push({k:'saw',x:x0,y:-60,r:24,vx:0,rot:0,vert:true,x0,amp:rnd(60,120),ph:0,spdV:2.4+stage*.2})}break}
    case'flame':{const y=-30,side=pick([-1,1]);hazards.push({k:'flame',side,y,t:0,len:(R-L)*rnd(.55,.66)});hazards.push({k:'flame',side:-side,y:y-110,t:1.05,len:(R-L)*rnd(.55,.66)});break}
    case'boulder':{hazards.push({k:'boulder',x:clamp(P.x,L+40,R-40),y:-60,r:32,warn:.9,hp:260*hpScale(),max:260*hpScale(),rot:0,shoot:true});if(stage>=2)hazards.push({k:'boulder',x:rnd(L+40,R-40),y:-60,r:32,warn:1.3,hp:260*hpScale(),max:260*hpScale(),rot:0,shoot:true});break}
    case'barrels':{const n=ri(2,3);for(let i=0;i<n;i++)hazards.push({k:'barrel',x:rnd(L+30,R-30),y:-40-i*70,hp:18*hpScale(),r:17,shoot:true});break}
    case'rocks':{const n=Math.min(9,5+stage);for(let i=0;i<n;i++){const x=i===0?P.x:clamp(P.x+rnd(-140,140),L+30,R-30),y=i===0?P.y:clamp(P.y+rnd(-160,110),ZTOP-60,ZBOT);zone({k:'c',x,y,r:36,warn:.85+i*.12,dur:.05,dmg:18,edmg:60*hpScale(),col:'255,120,60',rock:true,onFire:z=>{shards(z.x,z.y,'#8d8577',10);smoke(z.x,z.y,3,12);addShake(4);sfx.boom()}})}break}
    case'laser':{hazards.push({k:'laser',side:pick([-1,1]),y:-20,t:0});if(stage>=2)hazards.push({k:'laser',side:pick([-1,1]),y:-150,t:.9});break}
    case'crusher':{const gw=120;hazards.push({k:'crusher',y:-70,h:54,gx:rnd(L+gw/2+30,R-gw/2-30),gw,t:0,cyc:2.6,cycN:0,mov:stage>=3});break}
    case'mines':{const n=ri(3,4)+Math.min(3,stage-1);for(let i=0;i<n;i++)hazards.push({k:'mine',x:rnd(L+30,R-30),y:-30-rnd(0,240),arm:.6,trig:-1,hp:1,r:11,shoot:true});break}
    case'pool':hazards.push({k:'pool',x:rnd(L+90,R-90),y:-60,rx:rnd(70,95),ry:rnd(42,54)});break;
    case'ice':for(let i=0;i<ri(1,2);i++)hazards.push({k:'ice',x:rnd(L+100,R-100),y:-80-i*150,rx:rnd(90,130),ry:rnd(55,75)});break;
  }
  if(Math.random()<.4)for(let i=0;i<ri(1,2);i++)hazards.push({k:'pot',x:pick([rnd(L+14,L+50),rnd(R-50,R-14)]),y:-20-rnd(0,160),hp:1,r:11,shoot:true});
}
function updateHazards(dt){
  const cw=(R-L)/8,hs=hpScale();
  for(const h of hazards){if(h.dead)continue;h.flash=(h.flash||0)-dt;
    switch(h.k){
    case'spikes':{h.y+=SCROLL*dt;h.t+=dt;const c=h.t%h.cyc,n=Math.floor(h.t/h.cyc);
      if(h.mov&&n!==h.cycN){h.cycN=n;const ng0=clamp(h.g0+pick([-1,1]),0,8-h.gl);if(ng0!==h.g0){h.g0=ng0;h.cols=[];for(let q=0;q<8;q++)if(q<h.g0||q>=h.g0+h.gl)h.cols.push(q)}}
      h.state=c<h.cyc*.5?0:c<h.cyc*.7?1:2;
      if(h.state===2){const cy=h.y+h.h/2;for(const q of h.cols){const px=L+q*cw;if(P.x>px-P.r*.4&&P.x<px+cw+P.r*.4&&Math.abs(P.y-cy)<h.h/2+P.r*.4)damagePlayer(18);
        forNear(px+cw/2,cy,70,e=>{if(hittable(e)&&!e.d.boss&&!e.d.mini&&e.x>px&&e.x<px+cw&&Math.abs(e.y-cy)<h.h/2+e.r)hurt(e,70*hs*dt,{num:false})})}}
      if(h.y>H+80)h.dead=true;break}
    case'barrel':case'pot':{h.y+=SCROLL*dt;if(h.hp<=0){h.dead=true;
        if(h.k==='barrel')explode(h.x,h.y,115,70*hs,{player:18,col:'255,120,40'});
        else{shards(h.x,h.y,'#b86b3f',10);smoke(h.x,h.y,2,8);for(let i=0;i<ri(2,4);i++)gems.push({x:h.x,y:h.y,v:1,vx:rnd(-90,90),vy:rnd(-90,90)});if(Math.random()<.12*(P.re.has('clover')?1.5:1))dropPickup(h.x,h.y);sfx.kill()}}
      if(h.y>H+60)h.dead=true;break}
    case'mine':{h.y+=SCROLL*dt;h.arm-=dt;
      if(h.arm<=0&&h.trig<0&&(h.x-P.x)**2+(h.y-P.y)**2<52*52){h.trig=.5;sfx.warn()}
      if(h.trig>=0){h.trig-=dt;if(h.trig<=0)h.hp=-1}
      if(h.hp<=0){h.dead=true;explode(h.x,h.y,80,60*hs,{player:22,col:'255,90,60'})}
      if(h.y>H+60)h.dead=true;break}
    case'saw':{h.rot+=dt*18;
      if(h.vert){h.x0=h.x0;h.y+=SCROLL*dt;h.ph+=dt*(h.spdV||2.4);if(h.horizLane){h.x=h.x0+Math.sin(h.ph)*h.amp}else{h.x=h.x0;h.dy=Math.sin(h.ph)*h.amp}}
      else{h.y+=(SCROLL+25)*dt;h.x+=h.vx*dt;if(h.x<L+h.r){h.x=L+h.r;h.vx*=-1;spark(h.x-h.r,h.y,'#ffd166',6,200,.3,2.5)}if(h.x>R-h.r){h.x=R-h.r;h.vx*=-1;spark(h.x+h.r,h.y,'#ffd166',6,200,.3,2.5)}}
      const sy=h.y+(h.dy||0);
      if((h.x-P.x)**2+(sy-P.y)**2<(h.r+P.r-4)**2)damagePlayer(20);
      forNear(h.x,sy,h.r+34,e=>{if(hittable(e)&&!e.d.boss&&!e.d.mini&&(e.x-h.x)**2+(e.y-sy)**2<(h.r+e.r)**2){hurt(e,260*hs*dt,{num:false});if(Math.random()<.3)spark(h.x,sy,e.d.col,2,220,.3,3)}});
      if(h.y>H+160)h.dead=true;break}
    case'flame':{h.y+=SCROLL*dt;h.t+=dt;const c=h.t%2.1;h.state=c<.9?0:c<1.3?1:2;
      if(h.state===2){const x0=h.side<0?L:R-h.len,x1=h.side<0?L+h.len:R;if(P.x>x0-P.r*.4&&P.x<x1+P.r*.4&&Math.abs(P.y-h.y)<20+P.r*.4)damagePlayer(16);
        forNear((x0+x1)/2,h.y,h.len/2+30,e=>{if(hittable(e)&&!e.d.boss&&!e.d.mini&&e.x>x0&&e.x<x1&&Math.abs(e.y-h.y)<22+e.r){e.burnT=3;e.burnDps=Math.max(e.burnDps,30*hs);hurt(e,60*hs*dt,{num:false})}});
        if(Math.random()<.9){const fx=h.side<0?L+rnd(0,h.len):R-rnd(0,h.len);spark(fx,h.y+rnd(-10,10),pick(['#ff8a3d','#ffd166','#ff4d1f']),1,80,.35,4)}}
      if(h.y>H+60)h.dead=true;break}
    case'boulder':{if(h.warn>0){h.warn-=dt;if(h.warn<=0)sfx.boom();break}h.y+=(SCROLL+300)*dt;h.rot+=dt*6;
      if((h.x-P.x)**2+(h.y-P.y)**2<(h.r+P.r-4)**2)damagePlayer(28);
      forNear(h.x,h.y,h.r+34,e=>{if(hittable(e)&&(e.x-h.x)**2+(e.y-h.y)**2<(h.r+e.r)**2){if(e.heavy)hurt(e,300*hs*dt,{num:false});else{hurt(e,e.max+1,{num:false});spark(e.x,e.y,e.d.col,6,260,.4,3)}}});
      if(h.hp<=0){h.dead=true;shards(h.x,h.y,'#8d8577',24);smoke(h.x,h.y,8,16);addShake(8);sfx.boom();for(let i=0;i<6;i++)gems.push({x:h.x,y:h.y,v:2,vx:rnd(-150,150),vy:rnd(-150,150),big:1})}
      if(Math.random()<.4)smoke(h.x+rnd(-20,20),h.y-h.r,1,8);
      if(h.y>H+80)h.dead=true;break}
    case'laser':{h.y+=SCROLL*dt;h.t+=dt;const c=h.t%2.4;const ps=h.state;h.state=c<1.0?1:c<1.45?2:0;
      if(h.state===2&&ps!==2){sfx.laser();addShake(3)}
      if(h.state===2){if(Math.abs(P.y-h.y)<8+P.r*.6)damagePlayer(24);forNear(W/2,h.y,W/2,e=>{if(hittable(e)&&!e.d.boss&&!e.d.mini&&Math.abs(e.y-h.y)<8+e.r)hurt(e,200*hs*dt,{num:false})})}
      if(h.y>H+40)h.dead=true;break}
    case'crusher':{h.y+=SCROLL*dt;h.t+=dt;const c=h.t%h.cyc,n=Math.floor(h.t/h.cyc);
      if(h.mov&&n!==h.cycN){h.cycN=n;h.gx=clamp(h.gx+rnd(-120,120),L+h.gw/2+30,R-h.gw/2-30)}
      let e;if(c<1.1)e=.06;else if(c<1.6)e=.06+Math.sin(c*60)*.01;else if(c<1.72)e=.06+(c-1.6)/.12*.94;else if(c<2.2)e=1;else e=1-(c-2.2)/.4*.94;
      if(c>=1.72&&c<1.76&&!h.slam){h.slam=true;addShake(8);sfx.boom();spark(h.gx-h.gw/2,h.y+h.h/2,'#ffd166',8,240,.3,3);spark(h.gx+h.gw/2,h.y+h.h/2,'#ffd166',8,240,.3,3)}if(c<1.7)h.slam=false;
      h.e=e;h.warnS=c>=1.1&&c<1.72;
      const le=L+(h.gx-h.gw/2-L)*e,rs=R-(R-(h.gx+h.gw/2))*e;
      if(e>.9){if(Math.abs(P.y-(h.y+h.h/2))<h.h/2+P.r*.3&&(P.x<le+P.r*.3||P.x>rs-P.r*.3))damagePlayer(30);
        forNear(W/2,h.y+h.h/2,W/2,en=>{if(hittable(en)&&!en.d.boss&&!en.d.mini&&Math.abs(en.y-(h.y+h.h/2))<h.h/2+en.r*.5&&(en.x<le||en.x>rs)){if(en.heavy)hurt(en,200*hs*dt,{num:false});else hurt(en,en.max+1,{num:false})}})}
      if(h.y>H+80)h.dead=true;break}
    case'lava':{h.y+=SCROLL*dt;for(const lg of h.logs){lg.x+=lg.vx*dt;if(lg.x<L+4){lg.x=L+4;lg.vx=Math.abs(lg.vx)}if(lg.x+lg.w>R-4){lg.x=R-4-lg.w;lg.vx=-Math.abs(lg.vx)}}
      if(P.y>h.y&&P.y<h.y+h.h&&P.dashT<=0){const lg=h.logs.find(l=>P.x>l.x+3&&P.x<l.x+l.w-3);if(lg){P.x+=lg.vx*dt;P.tx+=lg.vx*dt}else{dotPlayer(45*dt);if(Math.random()<dt*20)spark(P.x+rnd(-10,10),P.y+10,pick(['#ff8a3d','#ffd166']),1,80,.4,4)}}
      for(const e of enemies)if(e.alive&&!e.d.bat&&!e.d.drone&&!e.d.boss&&!e.d.mini&&!e.d.part&&!e.under&&e.y>h.y&&e.y<h.y+h.h)hurt(e,e.heavy?200*hs*dt:e.max+1,{num:false});
      if(h.y>H+20)h.dead=true;break}
    case'shrine':{h.y+=SCROLL*dt;const inside=(P.x-h.x)**2+(P.y-h.y)**2<h.r*h.r;
      if(inside){shrineHold=true;h.prog+=dt/4;h.spT-=dt;if(h.spT<=0){h.spT=1.1/D.dens;for(let i=0;i<2;i++)spawnEnemy(pick(['runner','runner','bat','stalker']),rnd(L+30,R-30),pick([-20,H+20]))}if(Math.random()<dt*20)spark(h.x+rnd(-h.r,h.r)*.7,h.y+rnd(-h.r,h.r)*.7,'#bff4ff',1,40,.6,3)}
      if(h.prog>=1){h.dead=true;ach('shrine');pendingLv++;lvDelay=.3;heal(P.maxHp*.2);pop('Shrine',h.x,h.y-40,'#8fe3ff',34,'free skill');ringFx(h.x,h.y,'143,227,255',h.r*1.6,.5,6);sfx.fuse()}
      if(h.y>H+80)h.dead=true;break}
    case'ice':{h.y+=SCROLL*dt;const ix=(P.x-h.x)/h.rx,iy=(P.y-h.y)/h.ry;if(ix*ix+iy*iy<1)P.onIce=true;if(h.y>H+90)h.dead=true;break}
    case'pool':{h.y+=SCROLL*dt;for(const e of enemies){if(!hittable(e)||e.d.boss||e.d.mini||e.d.part||e.d.bat||e.d.drone)continue;const ex=(e.x-h.x)/h.rx,ey=(e.y-h.y)/h.ry;if(ex*ex+ey*ey<1){hurt(e,40*hs*dt,{num:false});e.slowT=Math.max(e.slowT||0,.2)}}const dx=(P.x-h.x)/h.rx,dy=(P.y-h.y)/h.ry;if(dx*dx+dy*dy<1){dotPlayer(14*dt);P.slowT=.2;if(Math.random()<dt*10)spark(P.x+rnd(-10,10),P.y+8,'#a6e85f',1,40,.4,3)}
      if(Math.random()<dt*3)spark(h.x+rnd(-h.rx,h.rx)*.7,h.y+rnd(-h.ry,h.ry)*.7,'#a6e85f',1,20,.6,4);
      if(h.y>H+80)h.dead=true;break}
    }
  }
  hazards=hazards.filter(h=>!h.dead);
}
function updateDecor(dt){
  nextDecor-=SCROLL*dt;nextTorch-=SCROLL*dt;
  if(nextTorch<=0){nextTorch=rnd(260,360);decor.push({k:'torch',side:Math.random()<.5?-1:1,y:-40,f:rnd(0,9)})}
  if(nextDecor<=0){nextDecor=rnd(120,260);const k=pick(['skull','skull','bones','pot']);if(k==='pot')hazards.push({k:'pot',x:pick([rnd(L+14,L+40),rnd(R-40,R-14)]),y:-20,hp:1,r:11,shoot:true});else decor.push({k,x:pick([rnd(L+12,L+60),rnd(R-60,R-12)]),y:-20,a:rnd(0,TAU)})}
  for(const d of decor)d.y+=SCROLL*dt;decor=decor.filter(d=>d.y<H+60);
}

/* ================= director ================= */
function evPool(){const p={crowd:3,scatter:2,hazard:3,bats:1.2,elite:1.1,chargers:.9,rocks:1};
  if(stage===1&&stageT>25){p.stalkers=.9;p.moles=.8}
  if(stage>=2)Object.assign(p,{stalkers:1.4,moles:1.3,crowd:3.2,hazard:3.4,hazard2:1,bats:1.5});
  if(stage>=3)Object.assign(p,{gauntlet:1.5,hazard2:1.6});p.set=2.4*D.set;if(BIOME==='sky'){p.bats*=2}if(dm('bats'))p.bats=(p.bats||1)*4;return p}
const EVDELAY={gate:2.6,crowd:3.4,scatter:2.2,hazard:2.2,hazard2:2.8,bats:2,elite:3,chargers:2.4,rocks:2.2,stalkers:2.2,moles:2.6,gauntlet:4,set:4.5};
function runEvent(ev){
  switch(ev){
    case'gate':spawnGateRow();break;case'crowd':spawnCrowd();break;case'scatter':spawnScatter();break;
    case'hazard':spawnHazard();break;case'hazard2':spawnHazard();later(.6,()=>spawnHazard());break;
    case'bats':spawnBats();break;case'elite':spawnElite();break;case'chargers':spawnChargers();break;
    case'rocks':spawnHazard('rocks');break;case'stalkers':spawnStalkers();break;case'moles':spawnMoles();break;
    case'gauntlet':spawnHazard();later(.5,()=>spawnHazard());later(1,()=>spawnScatter());break;
    case'set':if(setp){spawnScatter();ev='scatter'}else spawnSet();break;
  }
  return EVDELAY[ev]*Math.max(.6,1-(stage-1)*.08-stageT/700)/D.dens;
}
function director(dt){
  if(run&&run.mode==='rush'&&!bossE){miniDone=true;if(stageT<STAGE_LEN)stageT=STAGE_LEN}
  if(bossE){dir.trick-=dt;if(dir.trick<=0){dir.trick=2.4;spawnEnemy(pick(['grunt','runner']),rnd(L+20,R-20),-30)}return}
  if(miniE){dir.trick-=dt;if(dir.trick<=0){dir.trick=1.8;spawnEnemy(pick(['grunt','runner','bat']),rnd(L+20,R-20),-30)}dir.next-=dt;if(dir.next<=0){dir.next=5;if(Math.random()<.5)spawnHazard()}return}
  if(!miniDone&&stageT>=MINI_AT){if(!miniWarn){miniWarn=true;dir.miniIn=2.4;banner('Mini-boss<small>Beat it for a relic and a visit from the merchant.</small>','#ffb020');sfx.boss()}dir.miniIn-=dt;if(dir.miniIn<=0)spawnMini();return}
  if(stageT>=STAGE_LEN){if(!bossWarn){bossWarn=true;dir.bossIn=2.8;banner('Boss incoming<small>Get out of the red zones or dash through them.</small>','#ff6b85');flashA=.25;flashCol='255,40,80';sfx.boss()}dir.bossIn-=dt;if(dir.bossIn<=0&&!bossE)spawnBoss();return}
  dir.next-=dt;
  if(dir.next<=0){if(!dir.seq.length){const pl=evPool();dir.seq=['gate',wpick(pl),wpick(pl),'gate',wpick(pl),wpick(pl),wpick(pl)]}dir.next=runEvent(dir.seq.shift())}
  dir.trick-=dt;if(dir.trick<=0){dir.trick=Math.max(.3,1.1-stage*.12-stageT/250)/D.dens;if(mobN()<MOBCAP)spawnEnemy(pick(stage>=2?['grunt','grunt','runner','bomber','bat']:['grunt','grunt','runner']),rnd(L+20,R-20),-30)}
}

/* ================= main update ================= */
let keys={};
function update(dt){
  scrollM+=(((setp&&setp.k==='lock')||bossScrollStop||shrineHold?0:1)-scrollM)*Math.min(1,dt*3);shrineHold=false;SCROLL=BASE_SCROLL*scrollM;
  runT+=dt;if(!bossE&&!miniE&&!(setp&&setp.k==='lock'))stageT+=dt;scrollY+=SCROLL*dt;addScore(dt*4*P.scoreM,'time');
  if(freezeAll>0)freezeAll-=dt;
  for(const t of timers){t.t-=dt;if(t.t<=0&&!t.done){t.done=true;t.fn()}}timers=timers.filter(t=>!t.done);
  director(dt);updateSet(dt);updateDecor(dt);buildGrid();

  // player movement
  const spd=440*P.spdM*(P.whirlT>0?1.3:1)*(P.slowT>0?.55:1);
  let kx=(keys.r?1:0)-(keys.l?1:0),ky=(keys.d?1:0)-(keys.u?1:0);if(!kx&&!ky&&(pad.ax||pad.ay)){kx=pad.ax;ky=pad.ay}
  if(kx||ky){const l=Math.hypot(kx,ky),m=Math.min(1,l);P.tx=P.x+kx/l*40*m;P.ty=P.y+ky/l*40*m}
  if(BIOME==='sky'&&!bossE){const w=run.wind;w.t-=dt;if(w.t<=0&&w.left<=0){w.left=3;w.dir=pick([-1,1]);w.t=rnd(7,10);pop(w.dir>0?'Wind →':'← Wind',W/2,ZTOP-40,'#dfe6f2',24)}if(w.left>0){w.left-=dt;P.tx+=w.dir*130*dt;if(Math.random()<.6)parts.push({k:0,x:w.dir>0?L:R,y:rnd(0,H),vx:w.dir*rnd(500,700),vy:0,l:.8,m:.8,s:2,c:'rgba(230,240,255,.8)'})}}
  if(P.poisT>0){P.poisT-=dt;dotPlayer(5*dt);if(Math.random()<dt*8)spark(P.x+rnd(-8,8),P.y,'#a6e85f',1,40,.4,3)}
  P.tx=clamp(P.tx,L+P.r+2+squeeze,R-P.r-2-squeeze);P.ty=clamp(P.ty,ZTOP,ZBOT);
  const ox=P.x,oy=P.y;
  if(P.dashT>0){P.dashT-=dt;P.x=clamp(P.x+P.ddx*880*dt,L+P.r+2,R-P.r-2);P.y=clamp(P.y+P.ddy*880*dt,ZTOP,ZBOT);P.tx=P.x;P.ty=P.y;if(after.length<40)after.push({x:P.x,y:P.y,l:.25})}
  else if(P.onIce){const dx=P.tx-P.x,dy=P.ty-P.y,d=Math.hypot(dx,dy),vs=spd*(kx||ky?1:1.5);const dvx=d>3?dx/d*vs:0,dvy=d>3?dy/d*vs:0;P.ivx+=(dvx-P.ivx)*Math.min(1,dt*1.7);P.ivy+=(dvy-P.ivy)*Math.min(1,dt*1.7);P.x=clamp(P.x+P.ivx*dt,L+P.r+2+squeeze,R-P.r-2-squeeze);P.y=clamp(P.y+P.ivy*dt,ZTOP,ZBOT);if(d>3){P.lastDx=dx/d;P.lastDy=dy/d}}
  else{const dx=P.tx-P.x,dy=P.ty-P.y,d=Math.hypot(dx,dy),mx=spd*(kx||ky?1:1.8)*dt;if(d>mx&&d>0){P.x+=dx/d*mx;P.y+=dy/d*mx}else{P.x=P.tx;P.y=P.ty}if(d>3){P.lastDx=dx/d;P.lastDy=dy/d}P.ivx=(P.x-ox)/Math.max(dt,1e-4);P.ivy=(P.y-oy)/Math.max(dt,1e-4)}
  P.onIce=false;
  const mv=Math.hypot(P.x-ox,P.y-oy)/Math.max(dt,1e-4);P.moveAmt+=(mv-P.moveAmt)*Math.min(1,dt*10);P.walk+=Math.hypot(P.x-ox,P.y-oy)*.08+dt*4;
  P.iframe-=dt;P.parryWin-=dt;P.parryT-=dt;P.pull=Math.max(0,P.pull-dt*8);P.shieldT-=dt;P.rapidT-=dt;P.stormT-=dt;P.magnetT-=dt;P.slowT-=dt;P.hurtT-=dt;P.dashCd-=dt;P.skCd-=dt;
  P.powS+=(curPow()/P.basePow-P.powS)*Math.min(1,dt*.25);
  if(P.regenL){P.regenT+=dt;if(P.regenT>=3/P.regenL){P.regenT=0;heal(1,true)}}
  if(P.re.has('spring')){P.sprT=(P.sprT||0)+dt;if(P.sprT>=2.5){P.sprT=0;heal(1,true)}}
  if(P.re.has('mirror')){P.mirT=(P.mirT||0)+dt;if(P.mirT>=12){P.mirT=0;P.shieldT=Math.max(P.shieldT,1.5);ringFx(P.x,P.y,'127,231,255',40,.3,3)}}
  if(P.drumT>0)P.drumT-=dt;
  if(P.re.has('frost'))forNear(P.x,P.y,170,e=>{if(hittable(e)&&!e.d.boss&&(e.x-P.x)**2+(e.y-P.y)**2<130*130)e.slowT=Math.max(e.slowT||0,.2)});
  if(P.cu.has('blood'))dotPlayer(2*dt);
  if(P.echoT>0){P.echoT-=dt;if(P.echoT<=0)volley(true)}
  P.cd-=dt;if(P.cd<=0){P.cd+=fireInterval();if(P.cd<0)P.cd=0;volley()}
  if(P.stormT>0){stormAcc+=dt*50;while(stormAcc>=1){stormAcc--;newProj('rain',rnd(L+10,R-10),-10,Math.PI/2+rnd(-.05,.05),baseDmg()*1.4*(1+.25*lv('power')),{wb:0,hom:0})}}
  if(P.whirlT>0){forNear(P.x,P.y,160,e=>{if(!pushable(e))return;const dx=e.x-P.x,dy=e.y-P.y,l=Math.hypot(dx,dy)||1,m=95+e.r;if(l<m){e.x=P.x+dx/l*m;e.y=P.y+dy/l*m;if(!e.kbx&&!e.kby)knock(e,P.x,P.y,260)}})}
  if(P.whirlT>0&&P.whirlT-dt<=0)whirlBurst(900);
  if(P.whirlT>0){P.whirlT-=dt;P.whirlTick-=dt;if(P.whirlTick<=0){P.whirlTick=.12;const pw=lv('power');forNear(P.x,P.y,130,e=>{if(hittable(e)&&(e.x-P.x)**2+(e.y-P.y)**2<(95+e.r)**2){hurt(e,baseDmg()*.75*(1+.2*pw),{num:Math.random()<.3,col:'#ff9a8a'});if(e.alive){applyStatus(e);if(pushable(e)){knock(e,P.x,P.y,420);if(e.d.charge&&e.mode===2)e.mode=0}}}});
      for(const b of ebul)if(!b.skull&&(b.x-P.x)**2+(b.y-P.y)**2<70*70){b.dead=true;spark(b.x,b.y,'#ff9a8a',3,120,.25,2.5)}}}
  if(P.wispN){wispT-=dt;if(wispT<=0){const sw=P.fu.has('swarm');wispT=(sw?.28:.55)/Math.max(1,P.wispN*(sw?.34:1));const k=Math.floor(Math.random()*(sw?3:1)),a=runT*2+k*TAU/3;newProj('wbolt',P.x+Math.cos(a)*38,P.y-22+Math.sin(a)*14,-Math.PI/2+rnd(-.3,.3),baseDmg()*.9,{hom:sw?4:3,wb:0,pierce:sw?2:0,big:.8})}}
  if(P.thunL){thunderT-=dt;if(thunderT<=0){thunderT=Math.max(.8,3.2-P.thunL*.4);const vis=enemies.filter(e=>hittable(e)&&e.y>20&&e.y<H-20);for(let i=0;i<Math.min(vis.length,1+Math.floor(P.thunL/2));i++){const t=pick(vis);boltFx(t.x+rnd(-30,30),-10,t.x,t.y,'#ffe066',5);explode(t.x,t.y,50,baseDmg()*5,{col:'255,230,100',small:true})}}}
  if(P.fu.has('nova')){novaT-=dt;if(novaT<=0){novaT=1.8;const k=CLASSES[P.cls].w;for(let i=0;i<16;i++)newProj(k,P.x,P.y,i*TAU/16,baseDmg(),{wb:0});ringFx(P.x,P.y,'255,209,102',40,.3,3)}}
  if(P.orbN){P.orbA+=dt*3.4;const n=P.orbN,rad=64;const halo=P.fu.has('halo');if(halo)haloT-=dt;
    for(let i=0;i<n;i++){const a=P.orbA+i*TAU/n,bx=P.x+Math.cos(a)*rad,by=P.y+Math.sin(a)*rad*.85;
      forNear(bx,by,40,e=>{if(!hittable(e)||e.orbCd>0)return;if((e.x-bx)**2+(e.y-by)**2<(e.r+12)**2){e.orbCd=.3;hurt(e,baseDmg()*1.4,{col:'#dfe6f2'});if(pushable(e))knock(e,P.x,P.y,340);spark(bx,by,'#fff',4,200,.25,2.5)}});
      for(const b of ebul){if(b.dead||b.pink)continue;if((b.x-bx)**2+(b.y-by)**2<(b.r+18)**2){b.dead=true;spark(b.x,b.y,'#dfe6f2',6,180,.25,2.5);ringFx(b.x,b.y,'255,255,255',14,.15,2)}}
      if(halo&&haloT<=0){const t=nearest(bx,by,170);if(t){boltFx(bx,by,t.x,t.y,'#ffe066',2.5);hurt(t,baseDmg()*1.2,{col:'#ffe066'})}}}
    if(halo&&haloT<=0){haloT=.5;sfx.zap()}}
  for(const n of nades){n.t+=dt;const p=Math.min(1,n.t/n.T);n.x=n.sx+(n.tx-n.sx)*p;n.y=n.sy+(n.ty-n.sy)*p-Math.sin(p*Math.PI)*90;if(p>=1){n.dead=true;explode(n.tx,n.ty,140+10*n.pw,baseDmg()*35*(1+.25*n.pw),{col:'255,150,60'});for(let i=0;i<3;i++)clouds.push({x:n.tx+rnd(-40,40),y:n.ty+rnd(-40,40),r:40,t:1.5,m:1.5,dps:baseDmg()*8,fire:true})}}
  nades=nades.filter(n=>!n.dead);

  updateEnemies(dt);
  updateProjs(dt);
  updateWalls(dt);

  // enemy bullets
  const frz=freezeAll>0;
  for(const b of ebul){if(b.dead)continue;
    if(b.pc===undefined){b.pc=1;if(!b.pink&&!b.skull&&!b.missile&&D.pinkX&&Math.random()<D.pinkX)b.pink=true}
    if(b.pink&&P.parryWin>0&&(b.x-P.x)**2+(b.y-P.y)**2<(b.r+P.r+20)**2){b.dead=true;parry(b);continue}
    if(!frz){const bs=D.bspd;if(b.hom){const an=Math.atan2(P.y-b.y,P.x-b.x),cur=Math.atan2(b.vy,b.vx);let df=an-cur;while(df>Math.PI)df-=TAU;while(df<-Math.PI)df+=TAU;const na=cur+clamp(df,-b.hom*dt,b.hom*dt),sp=Math.hypot(b.vx,b.vy);b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp}
      if(b.wave){b.wt+=dt*bs;b.y+=b.vy*dt*bs;b.x=b.x0+Math.sin(b.wt*4.5)*b.amp}else{b.x+=b.vx*dt*bs;b.y+=b.vy*dt*bs}
      if(b.life){b.life-=dt;if(b.life<=0)b.dead=true}}
    if((b.x-P.x)**2+(b.y-P.y)**2<(b.r*.85+7)**2){if(P.dashT>0||P.iframe>0)continue;b.dead=true;if(P.shieldT>0)ringFx(b.x,b.y,'127,231,255',20,.2,3);else damagePlayer(b.dmg);spark(b.x,b.y,'#c28bff',8,160,.3,3)}
    if(b.x<L-30||b.x>R+30||b.y<-120||b.y>H+30)b.dead=true}
  ebul=ebul.filter(b=>!b.dead);

  // gates
  for(const row of gateRows){row.y+=SCROLL*dt*1.25;for(const g of row.gates){g.bump-=dt;if(g.opts&&!row.used){g.ot+=dt;if(g.ot>.85){g.ot=0;g.oi=(g.oi+1)%g.opts.length;g.bump=.12}}}
    if(!row.used&&Math.abs(row.y-P.y)<26+P.r){row.used=true;const g=row.gates.find(g=>P.x>=g.x&&P.x<g.x+g.w+8)||row.gates[P.x<W/2?0:row.gates.length-1];g.taken=true;passGate(row,g)}
    if(row.used)row.fade+=dt*3}
  gateRows=gateRows.filter(r=>r.fade<1&&r.y<H+80);

  updateHazards(dt);updateZones(dt);

  for(const c of clouds){c.t-=dt;if(!frz)c.y+=SCROLL*dt*.5;forNear(c.x,c.y,c.r+30,e=>{if(hittable(e)&&(e.x-c.x)**2+(e.y-c.y)**2<(c.r+e.r)**2)hurt(e,c.dps*dt,{num:false})});if(Math.random()<dt*8)spark(c.x+rnd(-c.r,c.r)*.6,c.y+rnd(-c.r,c.r)*.6,c.fire?'#ff8a3d':'#a6e85f',1,30,.6,5)}
  clouds=clouds.filter(c=>c.t>0);

  // pickups & gems
  for(const p of pickups){p.t+=dt;p.vy=Math.min(SCROLL,p.vy+200*dt);p.y+=p.vy*dt;if((p.x-P.x)**2+(p.y-P.y)**2<(P.r+22)**2){p.dead=true;collect(p)}if(p.y>H+40||p.t>10)p.dead=true}
  pickups=pickups.filter(p=>!p.dead);
  for(const g of gems){g.vx*=Math.exp(-4*dt);g.vy*=Math.exp(-4*dt);g.age=(g.age||0)+dt;const dx=P.x-g.x,dy=P.y-g.y,d2=dx*dx+dy*dy;
    if(P.magnetT>0||d2<(P.re.has('magnet')?300:160)**2||g.pull||g.age>4){g.pull=true;const d=Math.sqrt(d2)||1,s=Math.min(1400,500+40000/d);g.vx+=dx/d*s*dt*6;g.vy+=dy/d*s*dt*6;g.vx*=.9;g.vy*=.9}else g.y+=SCROLL*dt;
    g.x+=g.vx*dt;g.y+=g.vy*dt;if(d2<(P.r+8)**2){g.dead=true;if(g.coin){const gv=Math.max(1,Math.round(g.v*P.meta.gold*(P.re.has('purse')?1.5:1)));P.gold+=gv;if(P.re.has('tooth')){P.toothN=(P.toothN||0)+gv;while(P.toothN>=12){P.toothN-=12;heal(3,true)}}sfx.coin();if(P.gold>=300)ach('gold300')}else{P.xp+=g.v*P.meta.xp;sfx.gem();addScore(2,'pickups')}}if(g.y>H+30)g.dead=true}
  gems=gems.filter(g=>!g.dead);
  while(P.xp>=P.xpNeed){P.xp-=P.xpNeed;P.level++;P.xpNeed=Math.round(10+P.level*14+P.level*P.level*4);pendingLv++;lvDelay=.35}
  if(pendingLv>0&&state==='play'){lvDelay-=dt;if(lvDelay<=0)openLevel()}
  if(pendingRelic&&state==='play'){pendingRelic=false;openRelic()}

  if(comboT>0){comboT-=dt;if(comboT<=0)combo=0}
  for(const a of after)a.l-=dt;after=after.filter(a=>a.l>0);
  updateFx(dt);
  hudT-=dt;if(hudT<=0){hudT=.1;hud()}
}
function updateEnemies(dt){
  const frozenAll=freezeAll>0;
  for(let i=0,n=enemies.length;i<n;i++){const e=enemies[i];if(!e.alive)continue;
    e.flash-=dt;e.orbCd-=dt;e.shatCd-=dt;e.t+=dt;
    if(e.burnT>0){e.burnT-=dt;hurt(e,e.burnDps*dt,{num:false});if(Math.random()<dt*14)spark(e.x+rnd(-e.r,e.r)*.6,e.y-e.r*.3,pick(['#ff8a3d','#ffd166']),1,60,.35,3)}
    if(!e.alive)continue;
    if(e.poisT>0){e.poisT-=dt;hurt(e,e.poisDps*e.poisSt*dt,{num:false});if(e.poisT<=0)e.poisSt=0;if(Math.random()<dt*6)spark(e.x+rnd(-e.r,e.r)*.6,e.y,'#a6e85f',1,40,.4,3)}
    if(!e.alive)continue;
    if(e.aff==='vampiric')e.hp=Math.min(e.max,e.hp+e.max*.03*dt);
    e.slowT-=dt;e.frzT-=dt;if(e.stunT>0)e.stunT-=dt;
    if(e.kbx||e.kby){e.x+=e.kbx*dt;e.y+=e.kby*dt;const f=Math.exp(-7*dt);e.kbx*=f;e.kby*=f;if(Math.abs(e.kbx)+Math.abs(e.kby)<8)e.kbx=e.kby=0;e.x=clamp(e.x,L+e.r,R-e.r)}
    const frozen=e.frzT>0||frozenAll||e.stunT>0;
    let sp=e.spd*(e.slowT>0?.5:1);if(frozen)sp=0;
    const d=e.d;
    if(d.boss||d.mini){updateBoss(e,dt,frozen);contact(e);continue}
    if(d.part){updatePart(e,dt,frozen);contact(e);continue}
    if(d.drone){if(!frozen){e.x=e.x0+e.dirn*e.t*e.spd;e.y=e.y0+Math.sin(e.t*3+e.id)*40;e.shootT-=dt;if(e.shootT<=0&&e.x>L&&e.x<R){e.shootT=1.5;aimed(e.x,e.y+10,1,0,250,12,{pink:Math.random()<.25})}}if(e.t>1&&(e.x<L-70||e.x>R+70))e.alive=false;if(e.alive)contact(e);continue}
    if(d.ghost){e.ph+=dt;e.phased=e.ph%2.4>1.5}
    if(d.bomb){if(e.fuse==null&&e.y>20&&(e.x-P.x)**2+(e.y-P.y)**2<75*75){e.fuse=.85;sfx.zap()}if(e.fuse!=null){sp=0;if(!frozen)e.fuse-=dt;if(e.fuse<=0){kill(e);continue}}}
    if(e.aff==='gunner'&&!frozen){e.shootT-=dt;if(e.shootT<=0&&e.y>0&&e.y<P.y-40){e.shootT=2;aimed(e.x,e.y,1,0,260,12,{pink:Math.random()<.25})}}
    if(d.shoot){
      if(e.mode===0&&e.y>e.stopY){e.mode=1;e.hold=4.2}
      if(e.mode===1){sp=0;if(!frozen){e.hold-=dt;e.shootT-=dt;if(e.shootT<=0){e.shootT=1.3;aimed(e.x,e.y+8,stage>=3?3:1,.2,280,12,{pinkMid:Math.random()<.35});spark(e.x,e.y+10,'#c28bff',6,120,.3,3)}}if(e.hold<=0)e.mode=2}
    }
    if(d.bat){
      if(e.mode===0){e.hold+=dt;const tx=P.x,ty=P.y;if(e.hold>.45){const an=Math.atan2(ty-e.y,tx-e.x);e.vx=Math.cos(an)*sp;e.vy=Math.sin(an)*sp;e.mode=1}else{e.x+=(e.side<0?1:-1)*30*dt}}
      else if(!frozen){e.x+=e.vx*(sp/e.spd||0)*dt;e.y+=e.vy*(sp/e.spd||0)*dt}
      e.wob+=dt*30;
      if(e.mode===1&&(e.x<L-40||e.x>R+40||e.y>H+40||e.y<-60))e.alive=false;
      if(e.alive)contact(e);continue;
    }
    if(d.charge){
      if(e.mode===0){e.y+=sp*dt;e.wob+=dt*8;if(e.y>e.stopY&&e.y>40){e.mode=1;e.hold=.8*D.tele;const an=Math.atan2(P.y-e.y,P.x-e.x);e.cdx=Math.cos(an);e.cdy=Math.sin(an);zone({k:'l',x1:e.x,y1:e.y,x2:e.x+e.cdx*900,y2:e.y+e.cdy*900,w:e.r*2,warn:e.hold,fixed:true,dur:0,dmg:0,col:'255,60,80',owner:e})}}
      else if(e.mode===1){if(!frozen)e.hold-=dt;if(e.hold<=0){e.mode=2;e.hold=.9;sfx.dash()}}
      else if(e.mode===2){if(!frozen){e.x+=e.cdx*560*dt;e.y+=e.cdy*560*dt;e.hold-=dt;if(Math.random()<.5)smoke(e.x,e.y+e.r,1,8)}if(e.hold<=0||e.x<L+e.r||e.x>R-e.r){e.mode=3;e.hold=.8;e.x=clamp(e.x,L+e.r,R-e.r)}}
      else if(e.mode===3){e.hold-=dt;if(e.hold<=0){e.mode=0;e.stopY=e.y+rnd(120,260)}}
      if(e.y>H+60)e.alive=false;if(e.alive)contact(e);continue;
    }
    if(d.mole){
      if(e.mode===0){e.under=true;const dx=P.x-e.x,dy=P.y-e.y,l=Math.hypot(dx,dy)||1;if(!frozen){e.x+=dx/l*sp*dt;e.y+=dy/l*sp*dt}if(Math.random()<dt*14)spark(e.x+rnd(-10,10),e.y+8,'#6b4a30',1,40,.4,4);
        if(l<170||e.t>3.6){e.mode=1;e.hold=1;const ex=e.x,ey=e.y;zone({k:'c',x:ex,y:ey,r:46,warn:1,dur:.05,dmg:16,col:'255,120,60',onFire:()=>{shards(ex,ey,'#6b4a30',10);smoke(ex,ey,4,12)}})}}
      else if(e.mode===1){e.hold-=dt;if(e.hold<=0){e.mode=2;e.under=false;e.hold=2.6;ring(e.x,e.y,6,135,Math.atan2(P.y-e.y,P.x-e.x)+Math.PI/6,12,{pinkEvery:3});sfx.boom()}}
      else if(e.mode===2){e.hold-=dt;if(e.hold<=0){e.mode=0;e.t=0;smoke(e.x,e.y,4,12)}}
      e.x=clamp(e.x,L+e.r,R-e.r);if(!e.under)contact(e);continue;
    }
    if(d.stalk){const dx=P.x-e.x,dy=P.y-e.y,l=Math.hypot(dx,dy)||1;e.x+=dx/l*sp*dt;e.y+=dy/l*sp*dt;e.wob+=dt*8;sep(e);contact(e);if(e.y<-40)e.alive=false;continue}
    e.y+=sp*dt;
    if(sp>0){e.wob+=dt*8;if(e.y>P.y-440&&e.y<P.y+30){const dx=P.x-e.x;e.x+=Math.sign(dx)*Math.min(Math.abs(dx),sp*.8*dt)}else e.x+=Math.sin(e.wob*.4)*dt*10}
    sep(e);e.x=clamp(e.x,L+e.r*.8,R-e.r*.8);contact(e);
    if(e.y>H+60)e.alive=false;
  }
  enemies=enemies.filter(e=>e.alive);
}
function sep(e){forNear(e.x,e.y,e.r+30,o=>{if(o===e||!o.alive||o.d.boss||o.d.mini||o.d.part||o.under)return;const dx=o.x-e.x,dy=o.y-e.y,rr=e.r+o.r-2,dd=dx*dx+dy*dy;if(dd<rr*rr&&dd>.01){const dl=Math.sqrt(dd),push=(rr-dl)*.25,nx=dx/dl,ny=dy/dl;e.x-=nx*push;e.y-=ny*push*.5;o.x+=nx*push;o.y+=ny*push*.5}})}
function contact(e){
  if(e.phased||e.under||e.gone||!e.d.dmg||e.d.bomb||e.frzT>0||freezeAll>0||e.stunT>0)return;const dx=e.x-P.x,dy=e.y-P.y,rr=e.r+P.r-3,dd=dx*dx+dy*dy;if(dd>=rr*rr)return;
  if(P.shieldT>0&&!e.d.boss&&!e.d.mini){hurt(e,e.heavy?e.max*.2:e.max,{col:'#7fe7ff'});e.y-=30;return}
  const l=Math.sqrt(dd)||1;if(!e.d.boss&&!e.d.mini&&!e.heavy){e.x+=dx/l*(rr-l)*.5;e.y+=dy/l*(rr-l)*.5}
  if(damagePlayer(e.d.dmg*(e.champ?1.3:1),{contact:true})){
    if(P.re.has('thorn'))hurt(e,baseDmg()*4,{col:'#b8e070'});
    if(e.aff==='vampiric')e.hp=Math.min(e.max,e.hp+e.max*.2);
    if(BIOME==='frozen'){P.slowT=Math.max(P.slowT,.9)}if(BIOME==='ruins')P.poisT=Math.max(P.poisT,2);
    if(e.d.bat)kill(e);
  }
}
function updateFx(dt){
  const dr=Math.exp(-3.5*dt);
  for(const p of parts){p.l-=dt;if(p.k===0||p.k===3){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=dr;p.vy*=dr;if(p.k===3)p.rot+=p.vr*dt}else if(p.k===2){p.x+=p.vx*dt;p.y+=p.vy*dt;p.s+=dt*16}}
  parts=parts.filter(p=>p.l>0);
  for(const n of nums){n.l-=dt;n.y-=dt*50}nums=nums.filter(n=>n.l>0);
  for(const b of bolts)b.l-=dt;bolts=bolts.filter(b=>b.l>0);
  for(const p of pops){p.l-=dt;p.y-=dt*28}pops=pops.filter(p=>p.l>0);
  shake*=Math.exp(-7*dt);shakeT+=dt;shakeCd-=dt;flashA=Math.max(0,flashA-dt*1.8);
}

function parry(b){if(run){run.parries++;if(run.parries>=10)ach('parry10');if(run.parries>=15&&P.cls==='berserker'&&run.mode!=='daily')ach('wberserker2');if(bossE&&run.bstat)run.bstat.parries++}heal(Math.max(4,Math.round(P.maxHp*.05))/Math.min(1,D.heal));P.dashCd=Math.max(0,P.dashCd-P.dashMax*.6);if(P.re.has('charm')){heal(6);P.dashCd=0}P.skCd=Math.max(0,P.skCd-P.skMax*.4);P.parryT=3;P.iframe=Math.max(P.iframe,.35);tTarget=.15;tHold=.12;pop('Parry!',P.x,P.y-60,'#ff6bd6',32);spark(b.x,b.y,'#ff9be6',18,300,.45,3);ringFx(b.x,b.y,'255,107,214',40,.3,5);sfx.parry()}

/* ================= score & gold ================= */
function addScore(v,part){score+=v;if(run){run.parts[part]=(run.parts[part]||0)+v}}
function dropGold(e){let n=0;if(e.d.boss)n=70;else if(e.d.mini)n=30;else if(e.d.part)n=5;else if(e.champ)n=6;else if(e.heavy)n=3;else if(Math.random()<.08)n=1;if(!n)return;const c=Math.min(n,10),v=n/c;for(let i=0;i<c;i++)gems.push({x:e.x+rnd(-10,10),y:e.y+rnd(-10,10),v,vx:rnd(-120,120),vy:rnd(-120,120),coin:true})}
