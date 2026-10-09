
/* ================= set pieces ================= */
let setp=null,walls=[],squeeze=0,darkT=0,darkBoss=false,flood=false,bossScrollStop=false,shrineHold=false,scrollM=1;
function setPool(){const p={airdrop:1.2,bombrun:1.2,lava:1,shrine:.8,lock:.8,squeeze:.8,dark:.6};const bs=BIOMES[BIOME].set;for(const k in bs)p[k]=(p[k]??.5)*bs[k];if(dm('dark'))p.dark=8;if(stage===1&&stageT<30&&BIOME==='dungeon'){delete p.dark;delete p.squeeze;delete p.lock}return p}
function endSet(){if(!setp)return;if(setp.k==='lock')lockReward();setp=null;darkT=0}
function lockReward(){for(let i=0;i<14;i++)addGem({x:P.x+rnd(-60,60),y:ZTOP-40+rnd(-30,30),v:2,vx:rnd(-150,150),vy:rnd(-60,160),big:1});dropPickup(W/2,ZTOP-40);P.rerolls++;banner('Gates open<small>+1 reroll.</small>','#8ff0b5');sfx.level()}
function spawnSet(k){
  k=k||wpick(setPool());
  switch(k){
    case'airdrop':{setp={k,t:0,dur:6};banner('Air drop<small>Pods land where the red circles are.</small>','#ff9a5a');const n=ri(5,7)+Math.floor(stage/2)+(D.extra?2:0);for(let i=0;i<n;i++)later(1.2+i*.42,()=>{if(state!=='dying')podDrop(i%2===0)});break}
    case'bombrun':{setp={k,t:0,dur:4.8,planes:[0,1,2].map(i=>({x:-120-i*140,y:48+i*34}))};banner('Bombing run<small>Find the gap in each row.</small>','#ff9a5a');
      const offs=[-130,0,110];offs.forEach((o,i)=>later(.6+i*.95,()=>bombRow(clamp(P.y+o*(i===1?0:1),ZTOP-20,ZBOT))));if(D.extra)later(3.4,()=>bombRow(clamp(P.y,ZTOP,ZBOT)));break}
    case'lava':{const logs=[];for(let i=0;i<3;i++)logs.push({x:L+20+i*140,w:rnd(80,96),vx:pick([-1,1])*rnd(80,130)*(D.espd)});hazards.push({k:'lava',y:-240,h:210,logs});setp={k,t:0,dur:10};banner('Lava river<small>Ride the logs across.</small>','#ff7a3d');break}
    case'lock':setp={k,t:0,dur:16*(D.set>1?1.2:1),spT:1};banner('Ambush<small>Survive until the gates open.</small>','#ff6b85');sfx.boss();break;
    case'shrine':hazards.push({k:'shrine',x:rnd(L+90,R-90),y:-80,r:62,prog:0,spT:0});setp={k,t:0,dur:13};banner('Shrine<small>Stand in the circle to earn a free skill.</small>','#8fe3ff');break;
    case'dark':setp={k,t:0,dur:14};darkT=14;banner('Lights out<small>Your light is all you get.</small>','#c8c2ff');for(let i=0;i<4;i++)later(1+i*2.5,()=>{spawnStalkers();for(let j=0;j<3;j++)spawnEnemy('ghost',rnd(L+30,R-30),-20)});break;
    case'popups':{setp={k,t:0,dur:9};banner('Pop-up ads<small>Shoot them closed before they cover the screen.</small>','#ff4fa3');const n=ri(3,4)+(D.extra?1:0);for(let i=0;i<n;i++)later(.5+i*1.3,()=>{if(state!=='dying')spawnPopup(rnd(L+80,R-80),rnd(-70,ZTOP-120))});break}
    case'squeeze':setp={k,t:0,dur:10};banner('The walls are closing<small>Stay off the spikes.</small>','#ff6b85');later(1,()=>spawnScatter());later(4,()=>spawnHazard(pick(['rocks','saw','mines'])));break;
  }
}
function updateSet(dt){
  const sq=setp&&setp.k==='squeeze'&&setp.t<setp.dur-1.6?(R-L)*.21:0;squeeze+=(sq-squeeze)*Math.min(1,dt*2);if(squeeze<.5)squeeze=0;
  if(darkT>0)darkT-=dt;
  if(!setp)return;setp.t+=dt;
  if(setp.k==='bombrun')for(const p of setp.planes)p.x+=260*dt;
  if(setp.k==='lock'){setp.spT-=dt;if(setp.spT<=0){setp.spT=2.6/D.dens;const w=pick(['bats','stalkers','scatter','chargers','shooters','moles']);
      if(w==='bats')spawnBats();else if(w==='stalkers')spawnStalkers();else if(w==='scatter')spawnScatter();else if(w==='chargers')spawnChargers();else if(w==='moles')spawnMoles();else for(let i=0;i<3;i++)spawnEnemy('shooter',rnd(L+40,R-40),-20-i*40)}}
  if(setp.t>=setp.dur)endSet();
}
function updateWalls(dt){
  for(const w of walls){w.y+=w.spd*D.bspd*dt;if(Math.abs(P.y-w.y)<14+P.r*.4&&Math.abs(P.x-w.gx)>w.gw/2-P.r*.5)damagePlayer(22);if(w.y>H+30)w.dead=true}
  walls=walls.filter(w=>!w.dead);
  if(squeeze>4){const lo=L+squeeze,hi=R-squeeze;if(P.x-P.r<lo+3||P.x+P.r>hi-3)damagePlayer(14);P.x=clamp(P.x,lo+P.r,hi-P.r);
    const hs=hpScale();for(const e of enemies)if(e.alive&&!e.d.boss&&!e.d.mini&&!e.d.part&&(e.x-e.r<lo||e.x+e.r>hi))hurt(e,120*hs*dt,{num:false})}
}
function objText(){
  if(setp&&setp.k==='lock')return`Survive ${Math.ceil(setp.dur-setp.t)}`;
  const sh=hazards.find(h=>h.k==='shrine'&&h.prog>0);if(sh)return`Shrine ${Math.round(sh.prog*100)}%`;
  if(hazards.some(h=>h.k==='lava'&&h.y+h.h>ZTOP-40&&h.y<ZBOT))return'Stay on the logs';
  if(bossE&&bossE.phase>1&&bossE.parts&&bossE.parts.some(p=>p.alive&&p.type!=='clone')){const n=bossE.parts.filter(p=>p.alive).length;return({hand:'Hands',head:'Heads',crystal:'Crystals'}[bossE.parts[0].type]||'Targets')+` left: ${n}`}
  return'';
}
