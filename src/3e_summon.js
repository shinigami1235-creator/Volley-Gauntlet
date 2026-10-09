
/* ================= summoner minions ================= */
// The Summoner's attack raises minions instead of firing shots. Multishot raises the minion cap, attack speed
// makes them raise and hit faster, and damage, crit, elements and pierce all carry over to their hits.
let allies=[];
const MIN={skel:{r:13,spd:150,life:10,col:'#e8e0cc'},wolf:{r:14,spd:300,life:14,col:'#9aa3b4'},golem:{r:22,spd:80,life:1e9,col:'#7d8a7a'},spirit:{r:7,spd:0,life:1e9,col:'#9dffcf'}};
const MKIND={bone:'skel',wolf:'wolf',golem:'golem',lantern:'spirit'};
function isSummoner(){return!!MKIND[P.C.w]}
function minionCap(){const C=P.C,n=Math.min(P.projN,C.cap);switch(C.w){case'bone':return n+(P.evo?6:0);case'wolf':return n;case'golem':return 1+Math.floor((n-1)/4);case'lantern':return n*(P.evo?2:1)}return 0}
function minionMult(){const C=P.C;return Math.pow(P.projN/Math.max(1,Math.min(P.projN,C.cap)),.85)}
function rateF(){return P.C.iv/fireInterval()}
function raiseMinion(k,near){
  const M=MIN[k],a=rnd(0,TAU),d=near?rnd(20,50):rnd(30,70);
  const m={k,x:clamp(P.x+Math.cos(a)*d,L+14,R-14),y:clamp(P.y+Math.sin(a)*d*.6+10,ZTOP-40,ZBOT),t:0,rise:.35,life:M.life,atk:rnd(0,.3),tg:null,tgT:0,face:1,lunge:0,vx:0,vy:0,rev:false,id:Math.random()};
  if(k==='golem')m.r=M.r*(P.evo?1.35:1)*(1+.12*P.giantL);else m.r=M.r*(1+.1*P.giantL);
  allies.push(m);smoke(m.x,m.y+6,2,8);spark(m.x,m.y,'#9dffcf',5,120,.35,3);return m}
function summonVolley(dmg,shots){
  const k=MKIND[P.C.w],cap=minionCap(),have=allies.filter(a=>a.k===k).length;
  if(k==='spirit'){for(let i=have;i<cap;i++)raiseMinion('spirit',true);
    const sp=allies.filter(a=>a.k==='spirit');let n=0;
    for(const s of sp){if(s.rise>0)continue;const e=nearest(s.x,s.y,460,null,o=>o.y<P.y+60);const an=e?Math.atan2(e.y-s.y,e.x-s.x):-Math.PI/2+rnd(-.3,.3);
      newProj('wbolt',s.x,s.y,an,dmg,{hom:3,pierce:P.evo?2:0,col:'#9dffcf',wb:0,sp:640,big:.85});n++}
    if(n)spark(P.x,P.y-20,'#9dffcf',2,80,.25,2);return}
  const per={skel:2,wolf:1,golem:1}[k];for(let i=0;i<per&&have+i<cap;i++)raiseMinion(k)}
function minionHit(m,e,mul){
  const f={k:'minion',x:e.x,y:e.y,vx:0,vy:-1,dmg:baseDmg()*minionMult()*mul,pierce:0,ric:0,col:'#d8ffe8',last:-1};procHit(f,e);
  if(P.pierceN>0){let n=P.pierceN;forNear(e.x,e.y,60,o=>{if(n<=0||o===e||!hittable(o))return;if((o.x-e.x)**2+(o.y-e.y)**2<(40+o.r)**2){n--;procHit({k:'minion',x:o.x,y:o.y,vx:0,vy:-1,dmg:f.dmg*.6,pierce:0,ric:0,col:'#d8ffe8',last:-1},o)}})}}
function wolfBite(m,e,rf){m.atk=.55/rf;minionHit(m,e,1.9*(P.evo?1.6:1));if(P.evo&&e.alive){e.poisSt=Math.min((e.poisSt||0)+1,8);e.poisT=4;e.poisDps=Math.max(e.poisDps||0,baseDmg()*.12)}}
function updateAllies(dt){
  if(!allies.length)return;const rf=rateF();
  const sp=allies.filter(a=>a.k==='spirit');sp.forEach((s,i)=>{const an=runT*1.6+i*TAU/sp.length,rr=46+(sp.length>8?14:0)+(i%2)*10;s.x+=(P.x+Math.cos(an)*rr-s.x)*Math.min(1,dt*10);s.y+=(P.y-6+Math.sin(an)*rr*.7-s.y)*Math.min(1,dt*10)});
  let idx=0;
  for(const m of allies){m.t+=dt;if(m.rise>0){m.rise-=dt;continue}if(m.k==='spirit')continue;
    m.life-=dt;if(m.life<=0){if(m.k==='skel'&&P.evo&&!m.rev){m.rev=true;m.life=6;m.rise=.4;spark(m.x,m.y,'#9dffcf',8,140,.35,3);continue}m.dead=true;smoke(m.x,m.y,2,8);shards(m.x,m.y,m.k==='skel'?'#e8e0cc':'#9aa3b4',4);continue}
    m.tgT-=dt;if(m.tgT<=0||!m.tg||!hittable(m.tg)){m.tgT=.25;m.tg=nearest(m.x,m.y,420,null,o=>o.y>-20&&o.y<H)}
    const e=m.tg,M=MIN[m.k];m.atk-=dt;
    if(m.k==='golem')for(const b of ebul)if(!b.dead&&!b.skull&&(b.x-m.x)**2+(b.y-m.y)**2<(m.r+b.r)**2){b.dead=true;spark(b.x,b.y,'#c8d6c0',3,120,.2,2.5)}
    if(e){const dx=e.x-m.x,dy=e.y-m.y,d=Math.hypot(dx,dy)||1,reach=e.r+m.r+(m.k==='golem'?24:6);
      if(Math.abs(dx)>2)m.face=dx>0?1:-1;
      if(m.k==='wolf'&&m.lunge>0){m.lunge-=dt;m.x+=m.vx*dt;m.y+=m.vy*dt;if(d<reach&&m.atk<=0){wolfBite(m,e,rf);m.lunge=0}}
      else if(d>reach){const v=M.spd*(m.k==='wolf'&&d<150&&m.atk<=0?0:1)*Math.min(1.5,.7+.3*rf);
        if(m.k==='wolf'&&d<150&&m.atk<=0){m.lunge=.2;m.vx=dx/d*680;m.vy=dy/d*680}else{m.x+=dx/d*v*dt;m.y+=dy/d*v*dt}}
      else if(m.atk<=0){
        if(m.k==='skel'){m.atk=.5/rf;minionHit(m,e,1)}
        else if(m.k==='golem'){m.atk=1.3/rf;const rad=60*(P.evo?1.5:1)*(1+.15*P.giantL),cx=m.x+dx/d*m.r*.6,cy=m.y+dy/d*m.r*.6;
          forNear(cx,cy,rad+50,o=>{if(!hittable(o))return;if((o.x-cx)**2+(o.y-cy)**2<(rad+o.r)**2){minionHit(m,o,2.2);if(o.alive&&pushable(o)){knock(o,cx,cy,260);if(P.evo)o.stunT=Math.max(o.stunT||0,.6)}}});
          ringFx(cx,cy,'200,214,192',rad,.3,5);shards(cx,cy,'#8d8577',6);addShake(2);sfx.boom()}
        else if(m.k==='wolf')wolfBite(m,e,rf)}}
    else{const i=idx++,an=Math.PI/2+(i%2?1:-1)*(.5+Math.floor(i/2)*.35),rr=42+Math.floor(i/2)*10,tx=P.x+Math.cos(an)*rr,ty=P.y+16+Math.sin(an)*rr*.5,dx=tx-m.x,dy=ty-m.y,d=Math.hypot(dx,dy);
      if(d>6){const v=Math.min(d*4,M.spd*1.2);m.x+=dx/d*v*dt;m.y+=dy/d*v*dt;if(Math.abs(dx)>2)m.face=dx>0?1:-1}}
    m.x=clamp(m.x,L+m.r,R-m.r);m.y=clamp(m.y,-20,H+10)}
  allies=allies.filter(m=>!m.dead);
}
// Feast: every minion bursts in a green blast and heals you a little. With no minions it raises three.
function feast(pw){
  const n=allies.length;
  if(!n){const k=MKIND[P.C.w];for(let i=0;i<3;i++)raiseMinion(k,true);pop('Rise',P.x,P.y-70,'#9dffcf',30);return}
  const rad=70+8*pw,dmg=baseDmg()*minionMult()*4*(1+.25*pw);const list=allies;allies=[];
  list.forEach((m,i)=>later(i*.03,()=>{explode(m.x,m.y,rad*(m.k==='golem'?1.5:1),dmg*(m.k==='golem'?2.5:1),{col:'125,255,176',small:i>5,quiet:i>2});spark(m.x,m.y,'#c8ffe0',8,220,.4,3)}));
  heal(1.5*n);pop('Feast',P.x,P.y-70,'#9dffcf',30);flashA=.25;flashCol='125,255,176';addShake(6);
  if(run){run.sacr=(run.sacr||0)+n;if(run.sacr>=40&&run.mode!=='daily')ach('wsummoner2')}
}
function drawAllies(){if(!allies.length)return;ctx.save();
  for(const m of allies){const rise=m.rise>0?1-m.rise/.4:1,fade=m.k!=='golem'&&m.k!=='spirit'&&m.life<1.5?(Math.floor(m.t*10)%2?.45:1):1;
    ctx.globalAlpha=fade;ctx.save();ctx.translate(m.x,m.y);ctx.scale(m.face*rise,rise);const r=m.r,bob=Math.sin(m.t*12)*1.2;
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,r*.9,r*.9,r*.3,0,0,TAU);ctx.fill();
    if(m.k!=='spirit'){ctx.strokeStyle='rgba(125,255,176,.75)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,r*.9,r*1.05,r*.38,0,0,TAU);ctx.stroke()}
    if(m.k==='skel'){ctx.strokeStyle='#cfc6b0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-3,r*.3);ctx.lineTo(-4,r*.9+bob);ctx.moveTo(3,r*.3);ctx.lineTo(4,r*.9-bob);ctx.stroke();
      ctx.fillStyle='#e8e0cc';ctx.beginPath();ctx.ellipse(0,r*.15,r*.45,r*.5,0,0,TAU);ctx.fill();ctx.strokeStyle='#8f8670';ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<3;i++){ctx.moveTo(-r*.35,i*3);ctx.lineTo(r*.35,i*3)}ctx.stroke();
      ctx.fillStyle='#efe8d6';ctx.beginPath();ctx.arc(0,-r*.55,r*.55,0,TAU);ctx.fill();ctx.fillStyle='#1a1410';ctx.beginPath();ctx.arc(-r*.2,-r*.58,r*.14,0,TAU);ctx.arc(r*.2,-r*.58,r*.14,0,TAU);ctx.fill();
      ctx.fillStyle='#7dffb0';ctx.beginPath();ctx.arc(-r*.2,-r*.58,r*.06,0,TAU);ctx.arc(r*.2,-r*.58,r*.06,0,TAU);ctx.fill();
      ctx.strokeStyle='#bfc6cf';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(r*.45,r*.1);ctx.lineTo(r*1.05,-r*.55+(m.atk>.4?-2:4));ctx.stroke()}
    else if(m.k==='wolf'){const st=m.lunge>0?0:Math.sin(m.t*16)*2;ctx.strokeStyle='#5d6575';ctx.lineWidth=2.6;ctx.lineCap='round';ctx.beginPath();for(const lx of[-r*.55,-r*.2,r*.25,r*.6]){ctx.moveTo(lx,r*.2);ctx.lineTo(lx+(lx>0?st:-st),r*.75)}ctx.stroke();
      ctx.fillStyle='#b8c0cf';ctx.beginPath();ctx.ellipse(0,0,r*.95,r*.48,0,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(-r*.85,-r*.1);ctx.quadraticCurveTo(-r*1.5,-r*.6,-r*1.35,-r*.05);ctx.fill();
      ctx.beginPath();ctx.arc(r*.85,-r*.3,r*.42,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(r*1.05,-r*.25);ctx.lineTo(r*1.5,-r*.12);ctx.lineTo(r*1.05,0);ctx.fill();
      ctx.fillStyle='#6b7385';ctx.beginPath();ctx.moveTo(r*.65,-r*.6);ctx.lineTo(r*.72,-r*1.0);ctx.lineTo(r*.88,-r*.66);ctx.moveTo(r*.9,-r*.62);ctx.lineTo(r*1.0,-r*1.0);ctx.lineTo(r*1.1,-r*.58);ctx.fill();
      ctx.fillStyle=P.evo?'#ff6b7f':'#7dffb0';ctx.beginPath();ctx.arc(r*.98,-r*.36,r*.09,0,TAU);ctx.fill()}
    else if(m.k==='golem'){ctx.fillStyle='#5f6b5c';ctx.beginPath();ctx.roundRect(-r*.95,-r*.2,r*.5,r*.9,4);ctx.roundRect(r*.45,-r*.2,r*.5,r*.9,4);ctx.fill();
      ctx.fillStyle='#7d8a7a';ctx.beginPath();ctx.roundRect(-r*.7,-r*.75,r*1.4,r*1.35,r*.3);ctx.fill();ctx.fillStyle='#93a08f';ctx.beginPath();ctx.roundRect(-r*.45,-r*1.15,r*.9,r*.55,r*.2);ctx.fill();
      ctx.fillStyle='rgba(80,140,70,.6)';ctx.beginPath();ctx.ellipse(-r*.3,-r*.7,r*.25,r*.1,0,0,TAU);ctx.fill();
      const pulse=.6+.4*Math.sin(m.t*5);ctx.fillStyle=`rgba(125,255,176,${pulse})`;ctx.beginPath();ctx.arc(0,-r*.1,r*.2,0,TAU);ctx.fill();ctx.fillStyle='#7dffb0';ctx.fillRect(-r*.3,-r*.95,r*.18,r*.1);ctx.fillRect(r*.12,-r*.95,r*.18,r*.1)}
    else{ctx.globalCompositeOperation='lighter';const G=glowPx('#7dffb0',r*5);ctx.drawImage(G,-r*2.5,-r*2.5,r*5,r*5);ctx.globalCompositeOperation='source-over';ctx.fillStyle='#e8fff2';ctx.beginPath();ctx.arc(0,0,r*.65,0,TAU);ctx.fill();ctx.fillStyle='#1d5a40';ctx.beginPath();ctx.arc(-r*.25,-r*.1,r*.12,0,TAU);ctx.arc(r*.25,-r*.1,r*.12,0,TAU);ctx.fill()}
    ctx.restore()}
  ctx.restore()}
