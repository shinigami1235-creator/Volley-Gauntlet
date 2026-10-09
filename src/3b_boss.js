
/* ================= bosses & mini-bosses ================= */
const T=v=>v*D.tele;
function ring(x,y,n,spd,off,dmg=14,o={}){for(let i=0;i<n;i++){const a=off+i*TAU/n;const b=Object.assign({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,r:8,dmg},o);if(o.pinkEvery)b.pink=i%o.pinkEvery===0;ebul.push(b)}}
function aimed(x,y,n,spread,spd,dmg=14,o={}){const base=Math.atan2(P.y-y,P.x-x);for(let i=0;i<n;i++){const a=base+(i-(n-1)/2)*spread;const b=Object.assign({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,r:8,dmg},o);if(o.pinkMid)b.pink=i===Math.floor(n/2);ebul.push(b)}}
function tele(e,x,y){e.gone=true;smoke(e.x,e.y,6,16);spark(e.x,e.y,'#c28bff',14,200,.4,3);later(.3,()=>{if(!e.alive)return;e.x=x;e.y=y;e.gone=false;smoke(x,y,6,16);spark(x,y,'#c28bff',14,200,.4,3)})}
function mkBoneWall(y){const gx=rnd(L+70,R-70);for(let x=L+14;x<R-8;x+=26){if(Math.abs(x-gx)<58)continue;ebul.push({x,y,vx:0,vy:185,r:9,dmg:16,bone:true})}sfx.zap()}
function rockRain(n,r,dmg,col='255,120,60'){for(let i=0;i<n;i++){const x=i===0?P.x:clamp(P.x+rnd(-150,150),L+30,R-30),y=i===0?P.y:clamp(P.y+rnd(-140,110),ZTOP-40,ZBOT);zone({k:'c',x,y,r,warn:.9+i*.1,dur:.05,dmg,col,rock:true,boss:true,onFire:z=>{shards(z.x,z.y,'#8d8577',10);smoke(z.x,z.y,3,12);addShake(4);sfx.boom()}})}}
function podDrop(near){const x=near?clamp(P.x+rnd(-70,70),L+40,R-40):rnd(L+40,R-40),y=near?clamp(P.y+rnd(-90,50),ZTOP-60,ZBOT):rnd(ZTOP-140,ZBOT);
  zone({k:'c',x,y,r:34,warn:1.2,dur:.05,dmg:18,col:'255,140,60',pod:true,onFire:z=>{smoke(z.x,z.y,5,14);shards(z.x,z.y,'#8b90a0',8);addShake(5);sfx.boom();const t=pick(stage>=2?['grunt','shield','shooter','bomber','runner','charger']:['grunt','shooter','bomber','runner']);for(let j=0;j<2;j++)spawnEnemy(t,z.x+rnd(-14,14),z.y+rnd(-14,14))}})}
function bombRow(y){const xs=[];for(let x=L+32;x<R-10;x+=64)xs.push(x);const g=ri(0,xs.length-2),fwd=Math.random()<.5;
  xs.forEach((x,j)=>{if(j===g||j===g+1)return;const k=fwd?j:xs.length-1-j;zone({k:'c',x,y,r:34,warn:1.0+k*.07,dur:.05,dmg:20,col:'255,100,60',onFire:z=>{spark(z.x,z.y,'#ff9a5a',10,240,.4,3);ringFx(z.x,z.y,'255,140,60',34,.3,4);smoke(z.x,z.y,2,10);sfx.boom();addShake(2)}})})}
function spawnDrones(){const n=ri(5,7)+(D.extra?2:0),side=pick([-1,1]),y0=rnd(ZTOP-190,ZTOP-40);
  for(let i=0;i<n;i++)later(i*.22,()=>{const e=spawnEnemy('drone',W/2,y0,{noChamp:true});e.x=side<0?L-30:R+30;e.x0=e.x;e.y0=y0+(i%2)*40;e.dirn=-side;e.t=0;e.shootT=rnd(.5,1.5)})}

function spawnMini(){
  endSet();const k=BIOMES[BIOME].mini,base={ogre:450,witch:400,golem:430}[k];
  const e=spawnEnemy(k,W/2,-70,{noChamp:true});e.hp=e.max=bossHp(12+1.5*(stage-1),base*2.5);e.mode='enter';e.atkT=1.4;miniE=e;
  $('#bossbox').hidden=false;$('#bossbox').classList.add('mini');$('#bossName').textContent=ED[k].name;$('#bossSegs').innerHTML='';sfx.boss();addShake(8);
}
const BOSSES=['warden','colossus','hydra','lich','carrier','slime','knight','wyrm'];
const BHINT={warden:'Dash into pink shots to parry them.',colossus:'It has more than one fight in it.',hydra:'Watch the heads.',lich:'Frost fields slow you down.',carrier:'Watch the floor for drop pods.',slime:'It hops after you. Stay out of the puddles.',knight:'Read the blue lines before they cut.',wyrm:'It burrows. Watch the orange rings.'};
const PHINT={warden:['The gates are down. Find the gap in the bars.','He broke loose. Keep moving.'],colossus:['Break both hands to crack the skull.','The skull comes down to bite.'],hydra:['Each head fights on its own. Kill all three.','The floor is live. Read the tiles.'],lich:['Break the three crystals to drop his shield.','The lights are out and two of them are fakes.'],carrier:['Drones and missiles incoming.','The core is open.'],slime:['It splits. Clear the little ones fast.','It jumps on you. Move when the ring shows.'],knight:['Ice pillars fall. Find the open lane.','Blades spin out of it. Keep circling.'],wyrm:['It breathes fire in a sweep.','It bursts up under you. Keep moving.']};
function spawnBoss(){
  endSet();const k=run.mode==='rush'?RUSHB[run.rushI%RUSHB.length]:(run.nextBoss&&BIOMES[BIOME].bosses.includes(run.nextBoss)?run.nextBoss:pickBoss(BIOME)),base={warden:1000,colossus:1150,hydra:1100,lich:1050,carrier:1250,slime:1050,knight:1100,wyrm:1150}[k],tier=run.mode==='rush'?Math.floor(run.rushI/RUSHB.length):run.loop;run.nextBoss=null;run.bstat={t0:runT,hits:0,parries:0};
  const e=spawnEnemy(k,W/2,-110,{noChamp:true});e.hp=e.max=bossHp(26+3*Math.min(stage-1,4),base)*(1+tier*.5);e.mode='enter';e.bt0=runT;e.atkT=1.6;e.phase=1;e.phases=D.phases;e.inv=false;e.objInv=false;e.trans=0;e.parts=[];bossE=e;
  e.hands=[{x:W/2-150,y:230,tx:W/2-150,ty:230},{x:W/2+150,y:230,tx:W/2+150,ty:230}];
  $('#bossbox').hidden=false;$('#bossbox').classList.remove('mini');e.tw=rollTwists();e.twT={};$('#bossName').textContent=ED[k].name+(tier?' '+['II','III','IV','V','VI'][Math.min(4,tier-1)]:'')+(e.tw.length?' · '+e.tw.map(t=>TWISTS[t].n).join(', '):'');
  let sg='';for(let i=1;i<e.phases;i++)sg+=`<span style="left:${100*i/e.phases}%"></span>`;$('#bossSegs').innerHTML=sg;
  banner(`${ED[k].name}<small>${BHINT[k]}${e.tw.length?' '+e.tw.map(t=>TWISTS[t].n+': '+TWISTS[t].d).join(' '):''}</small>`,'#ff6b85');sfx.boss();addShake(12);
}
function bossPhase(e){
  e.phase++;e.trans=1.5;e.inv=true;e.atkT=2;e.atkI=0;e.jump=null;e.bite=null;e.lunge=null;
  zones=zones.filter(z=>!z.boss);ebul.length=0;walls.length=0;bossScrollStop=false;
  flashA=.6;flashCol='255,255,255';addShake(18);sfx.boss();tTarget=.3;tHold=.5;
  const K=e.phase===2?'A':'B';
  banner(`Phase ${e.phase}<small>${PHINT[e.type][K==='A'?0:1]}</small>`,'#ffd166');
  switch(e.type){
    case'warden':if(K==='A'){bossScrollStop=true;e.barT=1.5}else e.leaps=0;break;
    case'colossus':if(K==='A'){e.objInv=true;e.hands.forEach((h,i)=>{const p=spawnEnemy('hand',h.x,h.y,{noChamp:true});p.hp=p.max=e.max*.13;p.owner=e;p.idx=i;p.atkT=1.3+i*1.3;e.parts.push(p)})}else{e.objInv=false;e.handsGone=true}break;
    case'hydra':if(K==='A'){e.objInv=true;for(let i=0;i<3;i++){const p=spawnEnemy('head',e.x,e.y,{noChamp:true});p.hp=p.max=e.max*.09;p.owner=e;p.idx=i;p.atkT=1+i*.9;e.parts.push(p)}}else{e.objInv=false;e.headsGone=true;flood=true}break;
    case'lich':if(K==='A'){e.objInv=true;[[L+70,300],[W/2,390],[R-70,300]].forEach(([x,y])=>{const p=spawnEnemy('crystal',x,y,{noChamp:true});p.hp=p.max=e.max*.06;p.owner=e;p.shootT=rnd(1,3);e.parts.push(p)})}
      else{e.objInv=false;darkBoss=true;e.parts=[];for(let i=0;i<2;i++){const p=spawnEnemy('clone',e.x,e.y,{noChamp:true});p.hp=p.max=1;p.owner=e;p.shootT=rnd(1,2.5);e.parts.push(p)}}break;
  }
}
function partsDead(b){
  if(!b.alive)return;b.objInv=false;if(b.trans<=0)b.inv=false;
  if(b.phase<b.phases){b.hp=Math.min(b.hp,b.max*(b.phases-b.phase)/b.phases);bossPhase(b)}
  else{banner('Shield down<small>Finish it.</small>','#ffd166');if(b.type==='lich')b.stun=3;if(b.type==='colossus')b.handsGone=true;if(b.type==='hydra')b.headsGone=true}
}
function miniDown(e){
  miniE=null;miniDone=true;$('#bossbox').hidden=true;tTarget=.3;tHold=.7;flashA=.5;flashCol='255,230,160';addShake(16);
  for(let i=0;i<20;i++)addGem({x:e.x+rnd(-30,30),y:e.y+rnd(-30,30),v:2,vx:rnd(-220,220),vy:rnd(-160,220),big:1});
  run.minis++;addScore(800*stage*P.scoreM,'minis');banner('Relic<small>'+ED[e.type].name+' dropped a relic.</small>','#ffd166');
  zones=zones.filter(z=>!z.boss);
  later(1.1,()=>{if(run.mode!=='rush')resumeFn=merchant;if(state==='play')openRelic();else pendingRelic=true});
}
let pendingRelic=false;
function bossDown(e){
  bossE=null;musSting('ko');$('#bossbox').hidden=true;tTarget=.2;tHold=1.3;flashA=.8;flashCol='255,240,210';addShake(26);zones=zones.filter(z=>!z.boss);ebul.length=0;walls.length=0;
  darkBoss=false;flood=false;bossScrollStop=false;for(const p of e.parts||[])if(p.alive){p.alive=false;spark(p.x,p.y,p.d.col,12,260,.5,3)}
  for(let i=0;i<6;i++)later(i*.11,()=>explode(e.x+rnd(-50,50),e.y+rnd(-40,40),90,1e9,{col:'255,90,60',quiet:true}));
  for(let i=0;i<40;i++)addGem({x:e.x+rnd(-40,40),y:e.y+rnd(-40,40),v:3,vx:rnd(-260,260),vy:rnd(-200,260),big:1});
  dropPickup(e.x-30,e.y,'heart');dropPickup(e.x+30,e.y);
  addScore(3000*stage*P.scoreM,'bosses');P.rerolls++;
  stage++;stageT=0;bossWarn=false;miniWarn=false;miniDone=false;dir.next=3;dir.seq=[];
  heal(P.maxHp*.35);sfx.ko();
  const g=run.bstat?gradeOf(run.bstat):'';
  banner(`Knockout!<small>Grade ${g}. +1 reroll.</small>`,'#ffc93c');
  afterBoss(e);
}
function updateBoss(e,dt,frozen){
  e.t+=dt;if(e.gone)return;
  if(e.mode==='enter'){e.y+=90*dt;const ty={colossus:150,ogre:230,carrier:145}[e.type]||190;if(e.y>=ty){e.y=ty;e.mode='fight'}return}
  if(e.d.mini){miniAI(e,dt,frozen);return}
  if(e.trans>0){e.trans-=dt;if(e.trans<=0)e.inv=e.objInv;return}
  if(frozen)return;
  if(e.stun>0){e.stun-=dt;e.dmgM=1.5;if(Math.random()<.3)spark(e.x+rnd(-20,20),e.y-e.r,'#ffe066',1,60,.4,3);if(e.stun<=0)e.dmgM=1;return}
  const K=e.phase===1?1:e.phase===2?'A':'B',cd=1.4*D.bcd;
  const Z=o=>zone(Object.assign({boss:true},o));
  if(e.tw&&e.tw.length){twistTick(e,dt);if(e.tw.includes('enraged'))dt*=1.25}
  switch(e.type){case'slime':slimeAI(e,dt,K,cd,Z);break;case'knight':knightAI(e,dt,K,cd,Z);break;case'wyrm':wyrmAI(e,dt,K,cd,Z);break;case'warden':wardenAI(e,dt,K,cd,Z);break;case'colossus':colossusAI(e,dt,K,cd,Z);break;case'hydra':hydraAI(e,dt,K,cd,Z);break;case'lich':lichAI(e,dt,K,cd,Z);break;case'carrier':carrierAI(e,dt,K,cd,Z);break}
}
function doJump(e,dt){const j=e.jump;j.t+=dt;const p=clamp(j.t/j.T,0,1);e.x=j.sx+(j.tx-j.sx)*p;e.y=j.sy+(j.ty-j.sy)*p;if(p>=1){e.jump=null;if(j.land)j.land()}}
function wardenAI(e,dt,K,cd,Z){
  if(e.jump){doJump(e,dt);return}
  if(K===1){e.x=W/2+Math.sin(e.t*.7)*(R-L)*.3;e.y=190+Math.sin(e.t*1.3)*14}
  else if(K==='A'){e.x=W/2+Math.sin(e.t*.5)*(R-L)*.25;e.y+=(170-e.y)*Math.min(1,dt*2);e.barT-=dt;
    if(e.barT<=0){e.barT=2*D.bcd;const gw=D.dmg<1?150:112;walls.push({y:e.y+50,gx:rnd(L+gw/2+10,R-gw/2-10),gw,spd:140});if(D.extra)later(1,()=>{if(e.alive&&e.phase===2)walls.push({y:e.y+50,gx:rnd(L+gw/2+10,R-gw/2-10),gw,spd:140})})}}
  e.atkT-=dt;if(e.atkT>0)return;
  if(K===1){const a=['ring','aim','hammer','ring','summon','aim','hammer'][e.atkI++%7];e.atkT=cd;
    if(a==='ring'){const n=D.extra?18:14,off=rnd(0,TAU);ring(e.x,e.y,n,170,off,14,{pinkEvery:7});ringFx(e.x,e.y,'194,139,255',80,.3,5);sfx.zap()}
    if(a==='aim'){aimed(e.x,e.y+30,5,.16,300,14,{pinkMid:true});later(.25,()=>{if(e.alive)aimed(e.x,e.y+30,5,.16,300)})}
    if(a==='hammer'){for(let i=0;i<(D.extra?3:2);i++)later(i*.4,()=>{if(!e.alive)return;const x=clamp(P.x+P.lastDx*60*i,L+40,R-40),y=clamp(P.y+P.lastDy*60*i,ZTOP-40,ZBOT);Z({k:'c',x,y,r:70,warn:.9,dur:.05,dmg:22,onFire:z=>{explode(z.x,z.y,70,0,{col:'255,90,70',quiet:true});addShake(6)}})});e.atkT+=.6}
    if(a==='summon'){for(let i=0;i<5;i++)spawnEnemy('grunt',e.x+rnd(-90,90),e.y+rnd(30,60),{noChamp:true});smoke(e.x,e.y+40,6,16)}}
  else if(K==='A'){const a=['keys','ring','keys','aim'][e.atkI++%4];e.atkT=cd+.7;
    if(a==='keys'){for(let i=0;i<3;i++)later(i*.22,()=>{if(e.alive)aimed(e.x,e.y+30,1,0,230,14,{pink:true,key:true,r:10})})}
    if(a==='ring')ring(e.x,e.y,12,150,rnd(0,TAU),14,{pinkEvery:6});
    if(a==='aim')aimed(e.x,e.y+30,5,.18,280,14,{pinkMid:true})}
  else{e.leaps=(e.leaps||0)+1;
    if(e.leaps%4===0){const w=T(.7);e.jump={sx:e.x,sy:e.y,tx:W/2,ty:190,t:0,T:w,land:()=>{ring(e.x,e.y,D.extra?22:16,190,rnd(0,TAU),14,{pinkEvery:8});addShake(8)}};e.atkT=cd+1.4;return}
    const tx=clamp(P.x,L+e.r,R-e.r),ty=clamp(P.y,ZTOP,ZBOT-20),w=T(.95);
    Z({k:'c',x:tx,y:ty,r:e.r+26,warn:w,dur:.05,dmg:30,fixed:true});
    e.jump={sx:e.x,sy:e.y,tx,ty,t:0,T:w,land:()=>{addShake(14);sfx.boom();smoke(tx,ty+e.r,8,18);Z({k:'wave',x:tx,y:ty,rr:e.r,warn:0,dur:1.8,spd:300,dmg:20,col:'255,170,80',fixed:true});
      for(let i=0;i<3;i++){const a=rnd(0,TAU);Z({k:'c',x:clamp(tx+Math.cos(a)*e.r*1.4,L+20,R-20),y:ty+Math.sin(a)*e.r*1.4,r:28,warn:0,dur:3,dmg:8,cont:true,col:'255,120,40',fire:true,fixed:true})}}};
    e.atkT=w+cd*.6}
}
function colossusAI(e,dt,K,cd,Z){
  for(const h of e.hands){h.x+=(h.tx-h.x)*Math.min(1,dt*6);h.y+=(h.ty-h.y)*Math.min(1,dt*6)}
  if(e.bite){const b=e.bite;b.t+=dt;const lo=ZBOT-40;if(b.t<.3)e.y=b.sy+(lo-b.sy)*(b.t/.3);else if(b.t<1.2)e.y=lo-(lo-b.sy)*((b.t-.3)/.9);else{e.y=b.sy;e.bite=null}return}
  if(K===1)e.x=W/2+Math.sin(e.t*.4)*40;else if(K==='A')e.x=W/2+Math.sin(e.t*.3)*30;else{e.x=W/2+Math.sin(e.t*.6)*(R-L)*.25;if(e.y<260)e.y=Math.min(260,e.y+60*dt)}
  e.atkT-=dt;if(e.atkT>0)return;
  if(K===1){const a=['lanes','wall','beam','lanes','summon','wall','beam'][e.atkI++%7];e.atkT=cd+.5;
    if(a==='lanes'){const n=D.extra?3:2,xs=[clamp(P.x,L+50,R-50)];for(let i=1;i<n;i++){let x,tr=0;do{x=rnd(L+50,R-50);tr++}while(xs.some(q=>Math.abs(q-x)<110)&&tr<20);xs.push(x)}
      xs.forEach((x,i)=>{if(i<2){e.hands[i].tx=x;e.hands[i].ty=260}Z({k:'r',x:x-50,y:240,w:100,h:H-240,warn:1.0,dur:.2,dmg:28,onFire:z=>{addShake(10);sfx.boom();for(let k=0;k<8;k++)shards(z.x+50+rnd(-40,40),rnd(260,H),'#e6dcc6',2);if(i<2)e.hands[i].ty=z.y+rnd(200,400)}})});
      later(1.6,()=>{if(e.alive&&e.phase===1){e.hands[0].tx=W/2-150;e.hands[0].ty=230;e.hands[1].tx=W/2+150;e.hands[1].ty=230}})}
    if(a==='wall'){mkBoneWall(250);if(D.extra)later(.9,()=>{if(e.alive)mkBoneWall(250)})}
    if(a==='beam'){const offs=D.extra?[-.28,0,.28]:[0];const base=Math.atan2(P.y-(e.y+20),P.x-e.x);offs.forEach(o=>{const an=base+o;Z({k:'l',x1:e.x,y1:e.y+20,x2:e.x+Math.cos(an)*1200,y2:e.y+20+Math.sin(an)*1200,w:26,warn:.85,dur:.5,dmg:20,cont:true,col:'255,50,50',beam:true,onFire:()=>{sfx.laser();addShake(4)}})})}
    if(a==='summon'){for(let i=0;i<4;i++){spawnEnemy('shield',L+60+i*110,-20,{noChamp:true});spawnEnemy('grunt',L+60+i*110,-60,{noChamp:true})}}}
  else if(K==='A'){e.atkT=cd*2.2;if(e.atkI++%2)mkBoneWall(e.y+80);else{const an=Math.atan2(P.y-(e.y+20),P.x-e.x);Z({k:'l',x1:e.x,y1:e.y+20,x2:e.x+Math.cos(an)*1200,y2:e.y+20+Math.sin(an)*1200,w:24,warn:1,dur:.5,dmg:20,cont:true,col:'255,50,50',beam:true,onFire:()=>sfx.laser()})}}
  else{const a=['spray','bite','rain','spray','wall'][e.atkI++%5];e.atkT=cd+.5;
    if(a==='spray')aimed(e.x,e.y+40,D.extra?9:7,.16,250,15,{bone:true,r:9,pinkMid:true});
    if(a==='bite'){const w=T(.9);Z({k:'r',x:e.x-e.r,y:e.y,w:e.r*2,h:ZBOT-e.y+40,warn:w,dur:.05,dmg:0,fixed:true});later(w,()=>{if(e.alive&&e.phase===3){e.bite={t:0,sy:e.y};sfx.boom();addShake(10)}});e.atkT+=1.2}
    if(a==='rain')rockRain(D.extra?10:8,36,20,'230,220,200');
    if(a==='wall'){mkBoneWall(e.y+80);later(.8,()=>{if(e.alive)mkBoneWall(e.y+80)})}}
}
function floodTiles(Z){
  const cw=(R-L)/4,y0=ZTOP-60,rows=Math.max(3,Math.round((ZBOT+40-y0)/110)),ch=(ZBOT+40-y0)/rows;
  const pat=pick(['check','check2','rows','cols','spot']);const pc=clamp(Math.floor((P.x-L)/cw),0,3),pr=clamp(Math.floor((P.y-y0)/ch),0,rows-1),sr=ri(0,rows-1),sc=ri(0,2);
  for(let r=0;r<rows;r++)for(let c=0;c<4;c++){let on;switch(pat){case'check':on=(r+c)%2===0;break;case'check2':on=(r+c)%2===1;break;case'rows':on=r%2===pr%2;break;case'cols':on=c%2===pc%2;break;default:on=!(r===sr&&(c===sc||c===sc+1))}
    if(on)Z({k:'r',x:L+c*cw+2,y:y0+r*ch+2,w:cw-4,h:ch-4,warn:1.0,dur:.3,dmg:22,col:'120,200,255',tile:true,onFire:z=>{if(Math.random()<.6)boltFx(z.x+rnd(0,z.w),z.y+4,z.x+rnd(0,z.w),z.y+z.h-4,'#9fe8ff',2)}})}
  sfx.zap();
}
function hydraAI(e,dt,K,cd,Z){
  if(e.lunge){const l=e.lunge;l.t+=dt;if(l.t<.35){const p=l.t/.35;e.x=l.sx+(l.tx-l.sx)*p;e.y=l.sy+(l.ty-l.sy)*p}else if(l.t<1.3){const p=(l.t-.35)/.95;e.x=l.tx+(l.sx-l.tx)*p;e.y=l.ty+(l.sy-l.ty)*p}else e.lunge=null;return}
  e.x=W/2+Math.sin(e.t*.5)*60;e.y=170+Math.sin(e.t)*8;
  e.atkT-=dt;if(e.atkT>0)return;
  if(K===1){const a=['cascade','waves','breath','summon','cascade','breath','waves'][e.atkI++%7];e.atkT=cd+.4;
    if(a==='cascade'){const n=D.extra?9:6;for(let i=0;i<n;i++){const x=i===0?P.x:clamp(P.x+rnd(-150,150),L+30,R-30),y=i===0?P.y:clamp(P.y+rnd(-150,120),ZTOP-60,ZBOT);Z({k:'c',x,y,r:44,warn:.75+i*.12,dur:.05,dmg:20,col:'195,168,255',onFire:z=>{boltFx(z.x+rnd(-30,30),-10,z.x,z.y,'#c3a8ff',5);spark(z.x,z.y,'#c3a8ff',12,260,.4,3);ringFx(z.x,z.y,'195,168,255',44,.3,4);sfx.zap()}})}e.atkT+=.4}
    if(a==='waves'){[-70,0,70].forEach((hx,j)=>{for(let i=0;i<(D.extra?10:7);i++)later(i*.16+j*.05,()=>{if(!e.alive)return;ebul.push({x:e.x+hx,y:e.y+40,vx:0,vy:200,r:8,dmg:14,wave:true,x0:e.x+hx,wt:i*.4,amp:44,pink:i%4===2})})});e.atkT+=.6}
    if(a==='breath'){const dirn=pick([-1,1]),a0=Math.PI/2+.95*dirn,a1=Math.PI/2-.95*dirn,len=620;
      Z({k:'l',x1:e.x,y1:e.y+40,x2:e.x,y2:e.y+40,w:34,warn:.8,dur:1.6,dmg:16,cont:true,col:'255,140,50',beam:true,flame:true,follow:z=>{const p=clamp((z.t-z.warn)/z.dur,0,1),an=a0+(a1-a0)*p;z.x1=e.x;z.y1=e.y+40;z.x2=z.x1+Math.cos(an)*len;z.y2=z.y1+Math.sin(an)*len;if(z.fired&&Math.random()<.8){const q=rnd(.2,1);spark(z.x1+(z.x2-z.x1)*q,z.y1+(z.y2-z.y1)*q,pick(['#ff8a3d','#ffd166']),1,90,.4,5)}}});e.atkT+=1}
    if(a==='summon'){spawnBats();spawnBats()}}
  else if(K==='A'){e.atkT=cd*3.2;spawnBats()}
  else{const a=['tiles','lunge','tiles','cascade'][e.atkI++%4];e.atkT=cd+.6;
    if(a==='tiles'){floodTiles(Z);if(D.extra)later(1.4,()=>{if(e.alive)floodTiles(Z)})}
    if(a==='lunge'){const tx=clamp(P.x,L+e.r,R-e.r),ty=clamp(P.y,ZTOP,ZBOT),w=T(.85);Z({k:'l',x1:e.x,y1:e.y,x2:tx,y2:ty,w:e.r*1.6,warn:w,dur:0,dmg:0,fixed:true});later(w,()=>{if(e.alive&&e.phase===3){e.lunge={t:0,sx:e.x,sy:e.y,tx,ty};sfx.boom()}});e.atkT+=1.4}
    if(a==='cascade'){for(let i=0;i<5;i++){const x=i===0?P.x:clamp(P.x+rnd(-150,150),L+30,R-30),y=i===0?P.y:clamp(P.y+rnd(-150,120),ZTOP-60,ZBOT);Z({k:'c',x,y,r:44,warn:.8+i*.12,dur:.05,dmg:20,col:'195,168,255',onFire:z=>{boltFx(z.x,-10,z.x,z.y,'#c3a8ff',5);sfx.zap()}})}}}
}
function lichCast(e,a,Z){
  if(a==='skulls'){const n=D.extra?6:4;for(let i=0;i<n;i++){const an=Math.PI/2+(i-(n-1)/2)*.45;ebul.push({x:e.x,y:e.y+20,vx:Math.cos(an)*150,vy:Math.sin(an)*150,r:11,dmg:16,skull:true,hp:baseDmg()*5,hom:1.3,life:7,pink:i===0})}}
  if(a==='frost'){const n=D.extra?3:2;for(let i=0;i<n;i++){const cx=i===0?P.x:clamp(P.x+rnd(-180,180),L+85,R-85),cy=i===0?P.y:clamp(P.y+rnd(-120,120),ZTOP,ZBOT);Z({k:'r',x:cx-85,y:cy-65,w:170,h:130,warn:1.0,dur:2.6,dmg:8,cont:true,slow:true,col:'120,200,255',frost:true})}}
  if(a==='spiral'){let an=rnd(0,TAU);for(let i=0;i<(D.extra?28:20);i++)later(i*.08,()=>{if(!e.alive)return;an+=.32;for(const o of[0,Math.PI])ebul.push({x:e.x,y:e.y,vx:Math.cos(an+o)*185,vy:Math.sin(an+o)*185,r:7,dmg:12,pink:i%9===4&&o===0})});e.atkT+=1.2}
  if(a==='ghosts'){const gx=ri(1,6);for(let i=0;i<8;i++){if(i===gx||i===gx+1)continue;spawnEnemy('ghost',L+28+i*56,-20,{noChamp:true})}}
}
function lichAI(e,dt,K,cd,Z){
  e.atkT-=dt;if(e.atkT>0)return;
  if(K===1){const a=['skulls','frost','spiral','ghosts','skulls','spiral','frost'][e.atkI++%7];e.atkT=cd+.5;if(Math.random()<.5){tele(e,pick([W/2-140,W/2,W/2+140]),rnd(160,220));e.atkT+=.35;e.atkI--;return}lichCast(e,a,Z)}
  else if(K==='A'){const a=['spiral','skulls'][e.atkI++%2];e.atkT=cd+1;lichCast(e,a,Z)}
  else{const a=['swap','frost','skulls','ghosts','swap','spiral'][e.atkI++%6];e.atkT=cd+.5;
    if(a==='swap'){const spots=shuffle([[W/2-150,170],[W/2,215],[W/2+150,170]]);[e,...e.parts.filter(p=>p.alive)].forEach((o,i)=>tele(o,spots[i][0],spots[i][1]));e.atkT+=.4}
    else lichCast(e,a,Z)}
}
function carrierAI(e,dt,K,cd,Z){
  const ty=K==='B'?185:145;e.y+=(ty-e.y)*Math.min(1,dt*1.5);e.x=W/2+Math.sin(e.t*.35)*30;e.dmgM=K==='B'?1.3:1;
  e.atkT-=dt;if(e.atkT>0)return;
  const seq=K===1?['turrets','drop','bombs','turrets','drop']:K==='A'?['drones','missiles','drop','bombs','turrets']:['lasers','missiles','bombs','drones'];
  const a=seq[e.atkI++%seq.length];e.atkT=cd+.6;
  switch(a){
    case'turrets':for(let i=0;i<3;i++)for(const s of[-1,1])later(i*.28+(s>0?.14:0),()=>{if(e.alive)aimed(e.x+s*150,e.y+34,3,.14,300,13,{pinkMid:i===1})});e.atkT+=.6;break;
    case'drop':{const n=ri(4,6)+(D.extra?2:0);for(let i=0;i<n;i++)later(i*.3,()=>{if(e.alive)podDrop(i%2===0)});e.atkT+=1;break}
    case'bombs':bombRow(clamp(P.y,ZTOP,ZBOT));if(D.extra)later(.7,()=>bombRow(clamp(P.y+rnd(-90,90),ZTOP,ZBOT)));break;
    case'drones':spawnDrones();break;
    case'missiles':{const n=D.extra?6:4;for(let i=0;i<n;i++)later(i*.2,()=>{if(!e.alive)return;const an=Math.PI/2+rnd(-1,1);ebul.push({x:e.x+rnd(-40,40),y:e.y+40,vx:Math.cos(an)*170,vy:Math.sin(an)*170,r:9,dmg:18,hom:1.7,life:6,missile:true,pink:i===0})});break}
    case'lasers':{const w=T(.9),a0=rnd(0,TAU),sp=(D.extra?1.0:.75)*pick([-1,1]),len=1300;
      Z({k:'l',x1:e.x,y1:e.y,x2:e.x,y2:e.y,w:26,warn:w,dur:3.2,dmg:20,cont:true,col:'255,90,60',beam:true,fixed:true,follow:z=>{const an=a0+Math.max(0,z.t-z.warn)*sp,cx=e.x,cy=e.y+24;z.x1=cx-Math.cos(an)*len;z.y1=cy-Math.sin(an)*len;z.x2=cx+Math.cos(an)*len;z.y2=cy+Math.sin(an)*len}});e.atkT+=3;break}
  }
}
function updatePart(e,dt,frozen){
  const o=e.owner;if(!o||!o.alive){e.alive=false;return}
  if(e.type==='hand'){const h=o.hands[e.idx];e.x=h.x;e.y=h.y;if(frozen||o.trans>0)return;const other=o.parts.some(p=>p.alive&&p!==e);e.atkT-=dt*(other?1:1.6);if(e.atkT>0)return;e.atkT=2.4*D.bcd;
    const home=()=>{h.tx=e.idx?W/2+150:W/2-150;h.ty=230};
    if(Math.random()<.55){const x=clamp(P.x+rnd(-30,30),L+50,R-50),w=T(1.0);h.tx=x;h.ty=250;
      zone({k:'r',x:x-50,y:240,w:100,h:H-240,warn:w,dur:.2,dmg:28,boss:true,fixed:true,onFire:z=>{addShake(10);sfx.boom();h.ty=clamp(P.y,300,ZBOT);for(let k=0;k<6;k++)shards(z.x+50+rnd(-40,40),rnd(260,H),'#e6dcc6',2)}});later(w+.9,home)}
    else{const y=clamp(P.y,ZTOP,ZBOT),w=T(1.1),fromL=e.idx===0;h.tx=fromL?L+10:R-10;h.ty=y;
      zone({k:'r',x:L,y:y-34,w:R-L,h:68,warn:w,dur:.55,dmg:24,cont:true,boss:true,fixed:true,onFire:()=>{h.tx=fromL?R-10:L+10;sfx.boom();addShake(6)}});later(w+1.2,home)}
    return}
  if(e.type==='head'){const hx=[-70,0,70][e.idx],hy=[40,62,40][e.idx];e.x=o.x+hx+Math.sin(e.t*2+e.idx)*6;e.y=o.y+hy+Math.cos(e.t*2.3+e.idx)*5;if(frozen||o.trans>0)return;
    const dead=3-o.parts.filter(p=>p.alive).length;e.atkT-=dt*(1+dead*.5);if(e.atkT>0)return;e.atkT=2.8*D.bcd;
    if(e.idx===0){for(let i=0;i<3;i++){const x=i===0?P.x:clamp(P.x+rnd(-120,120),L+30,R-30),y=i===0?P.y:clamp(P.y+rnd(-110,90),ZTOP-40,ZBOT);zone({k:'c',x,y,r:42,warn:.8+i*.14,dur:.05,dmg:20,col:'195,168,255',boss:true,onFire:z=>{boltFx(z.x,-10,z.x,z.y,'#c3a8ff',5);spark(z.x,z.y,'#c3a8ff',10,240,.4,3);sfx.zap()}})}}
    else if(e.idx===1){const dirn=pick([-1,1]),a0=Math.PI/2+.8*dirn,a1=Math.PI/2-.8*dirn,len=560;zone({k:'l',x1:e.x,y1:e.y,x2:e.x,y2:e.y,w:30,warn:.8,dur:1.2,dmg:16,cont:true,col:'255,140,50',beam:true,flame:true,boss:true,follow:z=>{const p=clamp((z.t-z.warn)/z.dur,0,1),an=a0+(a1-a0)*p;z.x1=e.x;z.y1=e.y+10;z.x2=z.x1+Math.cos(an)*len;z.y2=z.y1+Math.sin(an)*len}});e.atkT+=1}
    else{for(let i=0;i<7;i++)later(i*.15,()=>{if(e.alive)ebul.push({x:e.x,y:e.y+14,vx:0,vy:200,r:8,dmg:14,wave:true,x0:e.x,wt:i*.4,amp:44,pink:i%3===1})})}
    return}
  if(e.type==='crystal'){if(frozen)return;e.shootT-=dt;if(e.shootT<=0){e.shootT=3*D.bcd;ring(e.x,e.y,6,140,rnd(0,TAU),12,{pinkEvery:6})}return}
  if(e.type==='clone'){if(frozen||e.gone)return;e.shootT-=dt;if(e.shootT<=0){e.shootT=2.8*D.bcd;ring(e.x,e.y,8,130,rnd(0,TAU),12,{pinkEvery:4})}return}
}
function miniAI(e,dt,frozen){
  if(e.type==='golem'){e.vent-=dt;e.dmgM=e.vent>0?2.5:.2}
  if(e.type==='ogre'&&e.mode==='charge'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.hold-=dt;if(e.hold<=0||e.y>ZBOT||e.x<L+e.r||e.x>R-e.r){e.mode='ret';addShake(6);smoke(e.x,e.y+e.r,5,14)}return}
  if(e.type==='ogre'&&e.mode==='ret'){e.x=clamp(e.x,L+e.r,R-e.r);e.y-=170*dt;if(e.y<=230){e.y=230;e.mode='fight'}return}
  if(frozen)return;
  if(e.type==='ogre')e.x+=clamp(P.x-e.x,-50*dt,50*dt);
  if(e.type==='golem')e.x+=clamp(P.x-e.x,-30*dt,30*dt);
  e.atkT-=dt;if(e.atkT>0)return;
  const p2=e.hp<e.max*.5,cd=(p2?1.0:1.45)*D.bcd,Z=o=>zone(Object.assign({boss:true},o));
  switch(e.type){
    case'ogre':{const a=['charge','slam','rocks','charge','rocks','slam'][e.atkI++%6];e.atkT=cd+.3;
      if(a==='charge'){const an=Math.atan2(P.y-e.y,P.x-e.x),w=T(.8);Z({k:'l',x1:e.x,y1:e.y,x2:e.x+Math.cos(an)*900,y2:e.y+Math.sin(an)*900,w:e.r*2,warn:w,dur:0,dmg:0,fixed:true});
        later(w,()=>{if(!e.alive||e.mode!=='fight')return;e.mode='charge';e.vx=Math.cos(an)*640;e.vy=Math.sin(an)*640;e.hold=.8;sfx.boom()});e.atkT+=1.8}
      if(a==='slam'){const w=T(.6);Z({k:'c',x:e.x,y:e.y,r:e.r+20,warn:w,dur:0,dmg:0,fixed:true});for(let i=0;i<(p2?3:2);i++)Z({k:'wave',x:e.x,y:e.y,rr:-1,warn:w+i*.4,dur:2,spd:270,dmg:22,col:'255,170,80',fixed:true,onFire:z=>{z.rr=e.r;addShake(8);sfx.boom();smoke(z.x,z.y+e.r,6,16)}});e.atkT+=1}
      if(a==='rocks')rockRain(p2?6:4,48,20);break}
    case'witch':{const a=['spiral','curse','aim','summon','curse','spiral'][e.atkI++%6];e.atkT=cd+.3;tele(e,rnd(L+80,R-80),rnd(150,240));
      later(.4,()=>{if(!e.alive)return;
        if(a==='spiral'){let an=rnd(0,TAU);for(let i=0;i<(p2?22:16);i++)later(i*.09,()=>{if(!e.alive)return;an+=.4;for(let k=0;k<3;k++){const q=an+k*TAU/3;ebul.push({x:e.x,y:e.y,vx:Math.cos(q)*175,vy:Math.sin(q)*175,r:7,dmg:12,col:'#7dff8a',pink:k===0&&i%6===3})}})}
        if(a==='curse'){for(let i=0;i<(p2?3:2);i++){const x=i===0?P.x:clamp(P.x+rnd(-150,150),L+40,R-40),y=i===0?P.y:clamp(P.y+rnd(-140,110),ZTOP-40,ZBOT);Z({k:'c',x,y,r:55,warn:1.1,dur:.05,dmg:18,col:'170,90,255',onFire:z=>{spark(z.x,z.y,'#c28bff',16,260,.5,3);ringFx(z.x,z.y,'194,139,255',55,.3,5)}})}}
        if(a==='aim'){aimed(e.x,e.y,3,.2,320,14,{pinkMid:true});later(.25,()=>{if(e.alive)aimed(e.x,e.y,3,.2,320)})}
        if(a==='summon'){for(let i=0;i<3;i++)spawnEnemy('ghost',e.x+rnd(-80,80),e.y+30,{noChamp:true})}});e.atkT+=.8;break}
    case'golem':{if(e.vent>0){e.atkT=e.vent+.3;break}const a=['lanes','rocks','sweep','rocks'][e.atkI++%4];e.atkT=cd+.3;const open=()=>{if(e.alive){e.vent=2.8;pop('Core open',e.x,e.y+e.r+20,'#ffb020',24)}};
      if(a==='lanes'){const xs=[clamp(P.x,L+20,R-20),clamp(P.x+pick([-1,1])*rnd(100,160),L+20,R-20),rnd(L+20,R-20)];if(p2)xs.push(rnd(L+20,R-20));const w=T(1);xs.forEach(x=>Z({k:'l',x1:x,y1:e.y+30,x2:x,y2:H+20,w:30,warn:w,dur:.6,dmg:22,cont:true,col:'255,176,32',beam:true,fixed:true,onFire:()=>{sfx.laser();addShake(3)}}));later(w+.7,open);e.atkT+=1.8}
      if(a==='sweep'){const d=pick([-1,1]),a0=Math.PI/2+1.0*d,a1=Math.PI/2-1.0*d,len=800,w=T(.8);Z({k:'l',x1:e.x,y1:e.y,x2:e.x,y2:e.y,w:24,warn:w,dur:1.5,dmg:20,cont:true,col:'255,176,32',beam:true,fixed:true,follow:z=>{const p=clamp((z.t-z.warn)/z.dur,0,1),an=a0+(a1-a0)*p;z.x1=e.x;z.y1=e.y-e.r*.5;z.x2=z.x1+Math.cos(an)*len;z.y2=z.y1+Math.sin(an)*len}});later(w+1.6,open);e.atkT+=2.4}
      if(a==='rocks')rockRain(p2?7:5,40,20);break}
  }
}

/* ================= boss twists ================= */
const TWISTS={enraged:{n:'Enraged',d:'It moves and attacks 25% faster.'},armored:{n:'Armored',d:'Takes 35% less damage until it drops below 60% HP.'},summoner:{n:'Summoner',d:'Calls in help every 7 seconds.'},volatile:{n:'Volatile',d:'Sets the floor near you on fire every 5 seconds.'},barrage:{n:'Barrage',d:'Fires an extra ring of shots every 6 seconds.'},regen:{n:'Regenerating',d:'Heals if you stop hitting it for 3 seconds.'}};
function rollTwists(){if(diff==='story')return[];const n=run.mode==='rush'?(run.rushI>=RUSHB.length?2:run.rushI>=3?1:0):run.loop>0?2:diff==='nightmare'?(stage>=4?2:1):diff==='hard'?(stage>=2&&Math.random()<.6?1:0):(stage>=3&&Math.random()<.4?1:0);const ks=Object.keys(TWISTS),out=[];while(out.length<n){const k=pick(ks);if(!out.includes(k))out.push(k)}return out}
function twistTick(e,dt){const t=e.twT;
  if(e.tw.includes('summoner')){t.s=(t.s??7)-dt;if(t.s<=0){t.s=7;const ty=pick(['grunt','runner','shooter','bomber']);for(let i=0;i<4;i++)spawnEnemy(ty,e.x+rnd(-100,100),e.y+rnd(20,60),{noChamp:true});smoke(e.x,e.y+40,5,16)}}
  if(e.tw.includes('volatile')){t.v=(t.v??5)-dt;if(t.v<=0){t.v=5;for(let i=0;i<3;i++){const x=clamp(P.x+rnd(-110,110),L+30,R-30),y=clamp(P.y+rnd(-90,70),ZTOP,ZBOT);zone({k:'c',x,y,r:34,warn:.9,dur:2.2,dmg:6,cont:true,fire:true,boss:true,col:'255,120,40'})}}}
  if(e.tw.includes('barrage')){t.b=(t.b??6)-dt;if(t.b<=0){t.b=6;ring(e.x,e.y,D.extra?20:16,160,rnd(0,TAU),14,{pinkEvery:8});ringFx(e.x,e.y,'255,80,80',70,.3,4)}}
  if(e.tw.includes('regen')&&runT-(e.lastHit||0)>3){const cap=e.max*(e.phases-e.phase+1)/e.phases;e.hp=Math.min(cap,e.hp+e.max*.015*dt);if(Math.random()<.1)spark(e.x+rnd(-30,30),e.y,'#ff9a5a',1,40,.5,3)}
}

/* ================= new bosses ================= */
function slimeAI(e,dt,K,cd,Z){
  if(e.jump){doJump(e,dt);return}
  if(e.slam){const s=e.slam;s.t+=dt;const p=clamp(s.t/s.T,0,1);
    if(s.ph===0){e.x=s.sx+(s.tx-s.sx)*p;e.y=s.sy+(s.ty-s.sy)*p-Math.sin(p*Math.PI)*120;if(p>=1){s.ph=1;s.t=0;s.T=.7;ring(e.x,e.y,D.extra?20:14,190,rnd(0,TAU),16,{pinkEvery:7});Z({k:'wave',x:e.x,y:e.y,rr:e.r,warn:0,dur:1.4,spd:320,dmg:18,col:'160,230,90',fixed:true});addShake(10);sfx.boom();smoke(e.x,e.y+30,6,20)}}
    else if(s.ph===1){if(p>=1){s.ph=2;s.t=0;s.T=.8;s.sx=e.x;s.sy=e.y}}
    else{e.x=s.sx+(W/2-s.sx)*p;e.y=s.sy+(190-s.sy)*p-Math.sin(p*Math.PI)*100;if(p>=1)e.slam=null}return}
  e.y+=(190+Math.sin(e.t*2)*8-e.y)*Math.min(1,dt*3);
  e.atkT-=dt;if(e.atkT>0)return;
  const seq=K===1?['hop','spit','hop','puddle']:K==='A'?['hop','split','spit','hop','puddle']:['bigslam','spit','hop','split','puddle'];
  const a=seq[e.atkI++%seq.length];e.atkT=cd*(K==='B'?.85:1);
  if(a==='hop'){const tx=clamp(P.x+rnd(-60,60),L+e.r,R-e.r);e.jump={sx:e.x,sy:e.y,tx,ty:180+rnd(-10,20),t:0,T:T(.55),land:()=>{ring(e.x,e.y,D.extra?16:12,170,rnd(0,TAU),14,{pinkEvery:6});addShake(6);sfx.boom();smoke(e.x,e.y+30,4,16)}}}
  if(a==='spit')for(let i=0;i<3;i++)later(i*.25,()=>{if(e.alive)aimed(e.x,e.y+30,3,.25,260,14)});
  if(a==='puddle')for(let i=0;i<(D.extra?3:2);i++){const x=clamp(P.x+rnd(-120,120),L+40,R-40),y=clamp(P.y+rnd(-100,60),ZTOP,ZBOT);Z({k:'c',x,y,r:48,warn:.9,dur:3,dmg:5,cont:true,slow:true,col:'160,230,90'})}
  if(a==='split'){for(let i=0;i<(D.extra?4:3);i++)spawnEnemy('splitter',e.x+rnd(-60,60),e.y+40,{noChamp:true});ring(e.x,e.y,10,140,rnd(0,TAU),14)}
  if(a==='bigslam'){const tx=clamp(P.x,L+e.r,R-e.r),ty=clamp(P.y,ZTOP,ZBOT-20),w=T(1.1);Z({k:'c',x:tx,y:ty,r:e.r+30,warn:w,dur:.05,dmg:0,fixed:true,col:'160,230,90'});e.slam={ph:0,t:0,T:w,sx:e.x,sy:e.y,tx,ty};e.atkT+=1.2}
}
function knightAI(e,dt,K,cd,Z){
  if(e.dash){const d=e.dash;d.t+=dt;const p=clamp(d.t/d.T,0,1);
    if(d.ph===0){e.x=d.sx+(d.tx-d.sx)*p*p;e.y=d.sy+(d.ty-d.sy)*p*p;if(p>=1){d.ph=1;d.t=0;d.T=.9;d.sx=e.x;d.sy=e.y;ring(e.x,e.y,10,160,rnd(0,TAU),14,{pinkEvery:5});addShake(8);sfx.boom()}}
    else{e.x=d.sx+(W/2-d.sx)*p;e.y=d.sy+(185-d.sy)*p;if(p>=1)e.dash=null}return}
  if(e.spin>0){e.spin-=dt;e.spinT-=dt;if(e.spinT<=0){e.spinT=.16;e.spinA=(e.spinA||0)+.35;ring(e.x,e.y,D.extra?6:4,200,e.spinA,14,{pinkEvery:4})}}
  else{e.x=W/2+Math.sin(e.t*.8)*(R-L)*.3;e.y+=(185-e.y)*Math.min(1,dt*2)}
  e.atkT-=dt;if(e.atkT>0)return;
  const seq=K===1?['slash','triple','slash','sweep']:K==='A'?['pillars','slash','charge','triple']:['spin','slash','charge','sweep','pillars'];
  const a=seq[e.atkI++%seq.length];e.atkT=cd+.3;
  if(a==='slash'){const n=K===1?1:3,base=Math.atan2(P.y-e.y,P.x-e.x);for(let i=0;i<n;i++){const an=base+(i-(n-1)/2)*.32;Z({k:'l',x1:e.x,y1:e.y,x2:e.x+Math.cos(an)*1400,y2:e.y+Math.sin(an)*1400,w:30,warn:.8,dur:.12,dmg:22,beam:true,col:'140,200,255'})}sfx.zap()}
  if(a==='triple')for(let i=0;i<3;i++)later(i*.28,()=>{if(e.alive)aimed(e.x,e.y+30,3,.2,300,14,{pinkMid:i===2})});
  if(a==='sweep'){const gw=D.dmg<1?170:120,gx=rnd(L+gw/2+10,R-gw/2-10),y=clamp(P.y-28,ZTOP,ZBOT-40);Z({k:'r',x:L,y,w:gx-gw/2-L,h:56,warn:1,dur:.15,dmg:22,col:'140,200,255'});Z({k:'r',x:gx+gw/2,y,w:R-(gx+gw/2),h:56,warn:1,dur:.15,dmg:22,col:'140,200,255'})}
  if(a==='pillars'){const cols=7,cw=(R-L)/cols,safe=Math.floor(rnd(0,cols));for(let i=0;i<cols;i++){if(i===safe||(D.dmg<2.5&&Math.abs(i-safe)===1)||Math.random()<.35)continue;Z({k:'r',x:L+i*cw+4,y:ZTOP-60,w:cw-8,h:ZBOT-ZTOP+100,warn:1.1,dur:.5,dmg:20,frost:true,col:'160,220,255'})}}
  if(a==='charge'){const tx=clamp(P.x,L+e.r,R-e.r),ty=clamp(P.y,ZTOP,ZBOT-20),w=T(.85);Z({k:'l',x1:e.x,y1:e.y,x2:tx,y2:ty,w:e.r*1.6,warn:w,dur:0,dmg:0,fixed:true,col:'140,200,255'});later(w,()=>{if(e.alive&&!e.dash)e.dash={ph:0,t:0,T:.3,sx:e.x,sy:e.y,tx,ty}});e.atkT+=1.2}
  if(a==='spin'){e.spin=2.2;e.spinT=0;e.atkT+=1.4}
}
function wyrmAI(e,dt,K,cd,Z){
  if(e.erupt){e.erupt.t+=dt;if(e.erupt.t>=e.erupt.T){e.erupt=null;tele(e,W/2,190)}return}
  e.x=W/2+Math.sin(e.t*.9)*(R-L)*.28;e.y+=(185+Math.sin(e.t*2.2)*10-e.y)*Math.min(1,dt*2);
  e.atkT-=dt;if(e.atkT>0)return;
  const seq=K===1?['burrow','spit','rocks','spit']:K==='A'?['breath','pools','burrow','spit']:['erupt','breath','rocks','erupt','spit'];
  const a=seq[e.atkI++%seq.length];e.atkT=cd+.2;
  if(a==='spit'){aimed(e.x,e.y+30,D.extra?7:5,.22,280,14,{pinkMid:true});later(.35,()=>{if(e.alive&&!e.gone)aimed(e.x,e.y+30,4,.3,240,14)})}
  if(a==='rocks')rockRain(D.extra?6:4,42,20,'255,120,40');
  if(a==='burrow'){e.gone=true;smoke(e.x,e.y+20,6,18);const x=rnd(L+80,R-80),y=rnd(170,230),w=T(1);Z({k:'c',x,y,r:e.r,warn:w,dur:.05,dmg:0,fixed:true,col:'255,140,60'});later(w,()=>{if(!e.alive)return;e.x=x;e.y=y;e.gone=false;ring(e.x,e.y,D.extra?18:14,180,rnd(0,TAU),14,{pinkEvery:7});smoke(e.x,e.y+20,6,18);addShake(6);sfx.boom()});e.atkT+=1}
  if(a==='breath'){const base=Math.atan2(P.y-e.y,P.x-e.x),dir=Math.random()<.5?1:-1;for(let i=0;i<4;i++){const an=base+(i-1.5)*.28*dir;later(i*.3,()=>{if(!e.alive||e.gone)return;Z({k:'l',x1:e.x,y1:e.y+20,x2:e.x+Math.cos(an)*1300,y2:e.y+20+Math.sin(an)*1300,w:34,warn:.7,dur:.35,dmg:20,beam:true,flame:true,col:'255,120,40'})})}e.atkT+=1}
  if(a==='pools')for(let i=0;i<(D.extra?5:4);i++){const x=clamp(P.x+rnd(-140,140),L+30,R-30),y=clamp(P.y+rnd(-120,80),ZTOP,ZBOT);Z({k:'c',x,y,r:38,warn:.9,dur:2.5,dmg:6,cont:true,fire:true,col:'255,120,40'})}
  if(a==='erupt'){const tx=clamp(P.x,L+e.r,R-e.r),ty=clamp(P.y,ZTOP,ZBOT-20),w=T(1.2);e.gone=true;smoke(e.x,e.y+20,6,18);Z({k:'c',x:tx,y:ty,r:e.r+26,warn:w,dur:.05,dmg:26,fixed:true,col:'255,90,40'});later(w,()=>{if(!e.alive)return;e.x=tx;e.y=ty;e.gone=false;ring(tx,ty,D.extra?20:16,200,rnd(0,TAU),14,{pinkEvery:8});addShake(10);sfx.boom();e.erupt={t:0,T:1.1}});e.atkT+=1.6}
}
