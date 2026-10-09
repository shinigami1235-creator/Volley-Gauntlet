
/* ================= the Ad Maker: secret stage 6 ================= */
// Beating the fifth boss of a Nightmare Gauntlet run opens a hidden sixth stage. The Ad Maker is the one who turns
// your runs into fake mobile ads, so his stage has rigged gates and pop-ups, and he fights with them too.
BIOMES.ad={n:'The Ad Break',boss:'admaker',bosses:['admaker'],mini:'witch',d:'The bigger the number, the bigger the lie.',floor:['#3b2f5c','#36295a','#43346a','#30264f'],grout:'#15102a',wall:['#2c2350','#271f48','#312858'],wallBg:'#1a1436',ledge:'#ff7ab6',moss:'rgba(255,120,190,.18)',flame:['#ff4fa3','#ffe08a'],glow:[255,110,190],haz:{laser:2,saw:1.4},set:{popups:4,airdrop:.6,bombrun:.6}};
ED.admaker={r:60,hp:3000,spd:0,col:'#ff5c8a',xp:60,dmg:40,sc:5000,heavy:1,boss:1,name:'The Ad Maker'};
ED.popup={r:50,hp:40,spd:0,col:'#ffffff',xp:4,dmg:0,sc:200,heavy:1,popup:1};
ED.adpop={r:50,hp:100,spd:0,col:'#ffffff',xp:6,dmg:0,sc:300,heavy:1,part:1,popup:1};
const ADLIES=['+999 ARROWS','x10 DAMAGE','FREE RELIC','MAX LEVEL','+500% SPEED','GOD MODE','ONE TAP WIN','UNLOCK ALL'];
const POPTXT=[['CONGRATULATIONS!','You won a FREE sword'],['LIMITED OFFER','Gems x1000, today only'],['YOU ARE THE 1,000,000th','player! Tap to claim'],['LEVEL 99 IN 1 DAY','Download now'],['YOUR HERO IS SAD','Buy him a hat']];
let adRows=[];
function adRow(e,swap){const n=3,honest=ri(0,n-1),lab=shuffle(ADLIES.slice()).slice(0,n);adRows.push({y:e.y+70,n,honest,lab,spd:150*D.bspd,swap,swapAt:null,fl:0,done:false})}
function updateAdRows(dt){
  for(const r of adRows){r.y+=r.spd*dt;
    if(r.swap&&r.swapAt==null&&r.y>P.y-230){r.swapAt=.4;r.fl=.4}
    if(r.swapAt!=null&&r.swapAt>0){r.swapAt-=dt;r.fl=Math.max(0,r.swapAt);if(r.swapAt<=0){let h=r.honest;while(h===r.honest)h=ri(0,r.n-1);r.honest=h;sfx.zap()}}
    if(!r.done&&Math.abs(P.y-r.y)<14+P.r*.4){r.done=true;const w=(R-L)/r.n,i=clamp(Math.floor((P.x-L)/w),0,r.n-1);
      if(i===r.honest){heal(4);pop('Honest ad',P.x,P.y-60,'#8ff0b5',26)}else if(P.dashT<=0&&P.iframe<=0){damagePlayer(22);pop('Rigged',P.x,P.y-60,'#ff4d8a',30)}}
    if(r.y>H+40)r.dead=true}
  adRows=adRows.filter(r=>!r.dead)}
function drawAdRows(){if(!adRows.length)return;ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
  for(const r of adRows){const w=(R-L)/r.n,y=r.y,fl=r.fl>0&&Math.floor(r.fl*20)%2===0;
    for(let i=0;i<r.n;i++){const x=L+i*w+3,ww=w-6,hon=i===r.honest&&!fl;
      if(hon){ctx.strokeStyle='rgba(200,255,220,.75)';ctx.setLineDash([5,5]);ctx.lineWidth=2;ctx.strokeRect(x,y-15,ww,30);ctx.setLineDash([]);ctx.fillStyle='rgba(200,255,220,.9)';ctx.font='900 12px '+BFONT;ctx.fillText('+1 HP',x+ww/2,y);continue}
      const gr=ctx.createLinearGradient(0,y-17,0,y+17);gr.addColorStop(0,'#5dff9a');gr.addColorStop(1,'#14a85a');ctx.fillStyle=gr;ctx.beginPath();ctx.roundRect(x,y-17,ww,34,8);ctx.fill();
      ctx.strokeStyle='#073d22';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#fff';ctx.font='900 13px '+FONT;ctx.fillText(r.lab[i],x+ww/2,y+1,ww-10);
      ctx.fillStyle='#ff4fa3';ctx.beginPath();ctx.roundRect(x+ww-22,y-21,22,12,4);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 8px '+BFONT;ctx.fillText('AD',x+ww-11,y-15)}}
  ctx.restore()}
// PLAY NOW buttons: shoot them before they land, or they burst
function adButtons(e,n){for(let i=0;i<n;i++)later(i*.25,()=>{if(!e.alive)return;const tx=clamp(P.x+rnd(-140,140),L+40,R-40),ty=clamp(P.y+rnd(-60,40),ZTOP,ZBOT),T=3.2;
  ebul.push({x:e.x+rnd(-30,30),y:e.y+40,vx:(tx-e.x)/T,vy:(ty-e.y-40)/T,r:20,dmg:18,hp:e.max*.008,adbtn:true,life:T,onEnd:b=>{ring(b.x,b.y,D.extra?12:9,170,rnd(0,TAU),14,{pinkEvery:5});ringFx(b.x,b.y,'255,79,163',60,.3,5);pop('Installed',b.x,b.y-30,'#ff4fa3',22);sfx.boom()}})})}
function adMakerAI(e,dt,K,cd,Z){
  const sp=K==='B'?.9:.55;e.x+=(W/2+Math.sin(e.t*sp)*(R-L)*.28-e.x)*Math.min(1,dt*2);e.y+=(170+Math.sin(e.t*1.7)*10-e.y)*Math.min(1,dt*2);
  e.atkT-=dt;if(e.atkT>0)return;
  const seq=K===1?['rig','confetti','buttons','rig','swipe','confetti']:K==='A'?['confetti','buttons','rig','coins']:['rig','spinner','countdown','buttons','rig','swipe','confetti'];
  const a=seq[e.atkI++%seq.length];e.atkT=cd*(K==='B'?.85:1);
  switch(a){
    case'rig':adRow(e,K==='B'||(D.extra&&K==='A'));if(K==='B'&&D.extra)later(1.1,()=>{if(e.alive)adRow(e,true)});e.atkT+=.4;break;
    case'confetti':{const cols=['#ff4fa3','#ffd166','#5dff9a','#7fe7ff'];for(let k=0;k<2;k++)later(k*.35,()=>{if(!e.alive)return;const off=rnd(0,TAU),n=D.extra?18:14;for(let i=0;i<n;i++){const an=off+i*TAU/n;ebul.push({x:e.x,y:e.y+20,vx:Math.cos(an)*175,vy:Math.sin(an)*175,r:8,dmg:14,col:cols[i%4],pink:i%7===0})}});sfx.zap();break}
    case'buttons':adButtons(e,D.extra?4:3);pop('Play now!',e.x,e.y+90,'#5dff9a',24);e.atkT+=.5;break;
    case'coins':for(let k=0;k<2;k++)later(k*.3,()=>{if(e.alive)aimed(e.x,e.y+40,7,.14,290,14,{col:'#ffd166',pinkMid:k===1})});break;
    case'swipe':{const gx=rnd(L+80,R-80),gw=120,w=T(.8);pop('Swipe up!',W/2,ZTOP-40,'#7fe7ff',26);
      for(const [x1,x2] of[[L,gx-gw/2],[gx+gw/2,R]])Z({k:'l',x1,y1:ZTOP-80,x2,y2:ZTOP-80,w:20,warn:w,dur:2.4,dmg:20,cont:true,col:'127,231,255',beam:true,fixed:true,follow:z=>{const yy=ZTOP-80+Math.max(0,z.t-z.warn)*230;z.y1=z.y2=yy}});e.atkT+=1.6;break}
    case'spinner':{const a0=rnd(0,TAU),dirn=pick([-1,1]);for(let s=0;s<16;s++)later(s*.14,()=>{if(!e.alive)return;for(let k=0;k<3;k++){const an=a0+dirn*s*.38+k*TAU/3;ebul.push({x:e.x,y:e.y+10,vx:Math.cos(an)*165,vy:Math.sin(an)*165,r:8,dmg:14,col:'#c9b8ff',pink:s%5===0&&k===0})}});pop('Loading...',e.x,e.y+90,'#c9b8ff',22);e.atkT+=1.6;break}
    case'countdown':for(let i=0;i<3;i++){const x=clamp(P.x+rnd(-90,90),L+50,R-50),y=clamp(P.y+rnd(-70,50),ZTOP,ZBOT),w=T(1.1+i*.45);
      Z({k:'c',x,y,r:60,warn:w,dur:.05,dmg:24,col:'255,79,163',onFire:z=>{ringFx(z.x,z.y,'255,79,163',60,.3,6);spark(z.x,z.y,'#ff9bd0',12,260,.4,3);addShake(5);sfx.boom()}});later(w-.45,()=>{if(e.alive)pop(String(3-i),x,y-10,'#ff4fa3',40)})}e.atkT+=1.4;break;
  }
}
function adPopAI(e,dt,frozen){const o=e.owner;e.x=e.hx+Math.sin(e.t*.9+e.idx)*14;e.y=e.hy+Math.cos(e.t*1.1+e.idx)*8;if(frozen||o.trans>0)return;
  e.shootT-=dt;if(e.shootT<=0){e.shootT=2.8*D.bcd;aimed(e.x,e.y+40,3,.22,240,13,{col:'#5dff9a',pinkMid:Math.random()<.4})}}
// stage pop-ups: big windows that float down and cover the field until you shoot them closed
function spawnPopup(x,y){const e=spawnEnemy('popup',x,y,{noChamp:true});e.hp=e.max=40*hpScale();e.txt=pick(POPTXT);e.shootT=rnd(1.5,3);return e}
function updatePopup(e,dt,frozen){if(!frozen){e.y+=SCROLL*.55*dt;e.shootT-=dt;if(e.shootT<=0&&e.y>40&&e.y<P.y-80){e.shootT=3.2;aimed(e.x,e.y+40,1,0,230,12,{col:'#5dff9a',pink:Math.random()<.3})}}if(e.y>H+80)e.alive=false}
function drawPopups(){ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  for(const e of enemies){if(!e.alive||!e.d.popup)continue;const w=150,h=100,x=e.x-w/2,y=e.y-h/2,t=e.txt||POPTXT[e.idx||0];
    ctx.save();ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.roundRect(x+5,y+7,w,h,10);ctx.fill();
    ctx.fillStyle='#fdfbff';ctx.beginPath();ctx.roundRect(x,y,w,h,10);ctx.fill();ctx.fillStyle='#ff4fa3';ctx.beginPath();ctx.roundRect(x,y,w,22,[10,10,0,0]);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='900 11px '+BFONT;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('AD',x+8,y+11);
    ctx.fillStyle='#ffd8ec';ctx.beginPath();ctx.arc(x+w-12,y+11,7,0,TAU);ctx.fill();ctx.strokeStyle='#ff4fa3';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x+w-15,y+8);ctx.lineTo(x+w-9,y+14);ctx.moveTo(x+w-9,y+8);ctx.lineTo(x+w-15,y+14);ctx.stroke();
    ctx.textAlign='center';ctx.fillStyle='#2a1640';ctx.font='900 12px '+FONT;ctx.fillText(t[0],e.x,y+42,w-14);ctx.fillStyle='#6a5a80';ctx.font='700 10px '+BFONT;ctx.fillText(t[1],e.x,y+60,w-14);
    const bw=70;ctx.fillStyle='#14c060';ctx.beginPath();ctx.roundRect(e.x-bw/2,y+71,bw,20,10);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 10px '+BFONT;ctx.fillText('CLAIM',e.x,y+81);
    ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(x+8,y+h-5,w-16,3);ctx.fillStyle='#ff4fa3';ctx.fillRect(x+8,y+h-5,(w-16)*Math.max(0,e.hp/e.max),3);
    if(e.flash>0){ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.roundRect(x,y,w,h,10);ctx.fill()}
    ctx.restore()}}
function drawAdButton(b){ctx.save();ctx.translate(b.x,b.y);const s=1+Math.sin(runT*10+b.x)*.05;ctx.scale(s,s);ctx.globalCompositeOperation='lighter';ctx.drawImage(glow('#5dff9a',.45),-38,-30,76,60);ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='#073d22';ctx.beginPath();ctx.roundRect(-30,-13,60,28,14);ctx.fill();const gr=ctx.createLinearGradient(0,-14,0,12);gr.addColorStop(0,'#7dffb0');gr.addColorStop(1,'#14c060');ctx.fillStyle=gr;ctx.beginPath();ctx.roundRect(-30,-15,60,27,14);ctx.fill();
  ctx.fillStyle='#fff';ctx.font='900 10px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('PLAY NOW',0,-1);
  const p=b.life!=null?clamp(b.life/3.2,0,1):1;ctx.strokeStyle='#ff4fa3';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,24,-Math.PI/2,-Math.PI/2+TAU*p);ctx.stroke();ctx.restore()}
// rigged gates on the stage itself: one gate per row shows a huge offer and hurts you instead
function rigGates(gates){if(BIOME!=='ad'||gates.length<2||Math.random()>.75)return;const g=pick(gates.filter(x=>!x.grow&&!x.guard&&!x.opts)||[]);if(!g)return;g.effs=[{t:'rig',v:pick([999,500,250,100])}]}
function openAdBreak(){
  if(state!=='play')return;clearField();state='event';let n=5,iv=null;
  const go=()=>{clearInterval(iv);run.visited.push('ad');run.nextBoss='admaker';setBiome('ad');beginStage();stageT=35;miniDone=true;banner('The Ad Break<small>Stage 6. The bigger the number, the bigger the lie.</small>','#ff4fa3')};
  const show=()=>ovX('Ad break','',`<p class="evx">The torches flicker and a jingle starts playing from somewhere above. Someone has been cutting your runs into fake ads, and he is waiting one floor up.</p>`,[{l:n>0?`Skip ad in ${n}`:'Go up',dis:n>0,f:go}]);
  show();iv=setInterval(()=>{if(state!=='event'){clearInterval(iv);return}n--;show();if(n<=0)clearInterval(iv)},1000);
}
