/* ================= boss art (drawn live every frame) ================= */
const BART={warden:1,slime:1,knight:1,colossus:1,wyrm:1,hydra:1,lich:1,clone:1,ogre:1,witch:1,golem:1};
let BCV=null;
function bGrad(g,col,x,y,rad){const gr=g.createRadialGradient(x-rad*.35,y-rad*.45,rad*.1,x,y,rad*1.15);gr.addColorStop(0,shade(col,.38));gr.addColorStop(.55,col);gr.addColorStop(1,shade(col,-.5));return gr}
function bFill(g,col,x,y,rad,path,lw){g.fillStyle=bGrad(g,col,x,y,rad);g.beginPath();path();g.fill();g.strokeStyle=shade(col,-.72);g.lineWidth=lw||2.4;g.lineJoin='round';g.lineCap='round';g.stroke()}
function bShadow(g,w,h,y){g.fillStyle='rgba(0,0,0,.34)';g.beginPath();g.ellipse(0,y,w,h,0,0,TAU);g.fill()}
function bGlow(g,pts,c,rx,ry,blur=12){g.save();g.fillStyle=c;g.shadowColor=c;g.shadowBlur=blur;g.beginPath();for(const [x,y] of pts)g.ellipse(x,y,rx,ry,0,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.85)';g.shadowBlur=0;g.beginPath();for(const [x,y] of pts)g.ellipse(x-rx*.25,y-ry*.3,rx*.35,ry*.35,0,0,TAU);g.fill();g.restore()}
function bSmooth(g,pts){const n=pts.length;g.moveTo((pts[n-1][0]+pts[0][0])/2,(pts[n-1][1]+pts[0][1])/2);for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];g.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}g.closePath()}
function bSpike(g,x,y,a,len,w,col){g.save();g.translate(x,y);g.rotate(a);g.fillStyle=col;g.strokeStyle=shade(col,-.7);g.lineWidth=1.6;g.beginPath();g.moveTo(-w,0);g.lineTo(0,-len);g.lineTo(w,0);g.closePath();g.fill();g.stroke();g.restore()}
function bWind(e,span=.6){return e.atkT==null?0:clamp(1-e.atkT/span,0,1)}
function bossLive(e){
  const r=e.r,HS=Math.ceil(r*4.6),Z=2,N=HS*2*Z;
  if(!BCV||BCV.width<N){BCV=document.createElement('canvas');BCV.width=BCV.height=N}
  const g=BCV.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,N,N);
  const lx=e._lx??e.x;e._mv=(e._mv||0)*.9+Math.abs(e.x-lx)*6;e._lx=e.x;
  g.setTransform(Z,0,0,Z,HS*Z,HS*Z);BPAINT[e.type==='clone'?'lich':e.type](g,e,r,e.t||0);
  if(e.flash>0){g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(255,255,255,.3)';g.fillRect(0,0,N,N);g.globalCompositeOperation='source-over'}
  ctx.drawImage(BCV,0,0,N,N,-HS,-HS,HS*2,HS*2);
}
function bossStill(type,r){const HS=Math.ceil(r*4.6);return{c:mk(HS*4,HS*4,g=>{g.translate(HS*2,HS*2);g.scale(2,2);BPAINT[type==='clone'?'lich':type](g,{r,t:.4,phase:1,atkT:2,x:0,y:0,d:ED[type]},r,.4)}),s:HS*2}}

const BPAINT={
/* ---- Ogre Chief: a big-bellied ogre with a spiked club on his shoulder ---- */
ogre(g,e,r,t){
  const mv=Math.min(1,(e._mv||0)/25),step=Math.sin(t*8)*mv,wind=bWind(e,.6),charge=e.mode==='charge',col='#6f8f3a';
  bShadow(g,r*1.2,r*.3,r*1.02);
  for(const s of[-1,1]){const lift=Math.max(0,s*step)*r*.14;bFill(g,shade(col,-.15),s*r*.4,r*.8,r*.3,()=>g.roundRect(s*r*.4-r*.22,r*.55-lift,r*.44,r*.4,r*.12));bFill(g,'#5a3a20',s*r*.42,r*.98,r*.3,()=>g.ellipse(s*r*.44,r*.95-lift,r*.3,r*.15,0,0,TAU))}
  const ca=charge?.6:(-.75-wind*.9+Math.sin(t*2)*.06);
  g.save();g.translate(r*.8,-r*.1);g.rotate(ca);
  g.fillStyle='#6b4423';g.strokeStyle='#2a1a0e';g.lineWidth=2;g.beginPath();g.roundRect(-r*.07,-r*1.3,r*.14,r*1.3,r*.06);g.fill();g.stroke();
  bFill(g,'#8a5a30',0,-r*1.45,r*.35,()=>{g.moveTo(-r*.12,-r*1.1);g.quadraticCurveTo(-r*.34,-r*1.5,-r*.2,-r*1.85);g.quadraticCurveTo(0,-r*1.98,r*.2,-r*1.85);g.quadraticCurveTo(r*.34,-r*1.5,r*.12,-r*1.1);g.closePath()});
  for(const [x,y] of[[-.26,-1.45],[.26,-1.5],[-.18,-1.75],[.18,-1.72],[0,-1.95]])bSpike(g,x*r,y*r,Math.atan2(y+1.5,x)+Math.PI/2,r*.14,r*.05,'#d9dde6');
  g.restore();
  bFill(g,col,0,0,r*1.05,()=>{g.moveTo(-r*.5,-r*.85);g.quadraticCurveTo(0,-r*1.05,r*.5,-r*.85);g.quadraticCurveTo(r*1.1,-r*.45,r*1.0,r*.25);g.quadraticCurveTo(r*.9,r*.8,0,r*.78);g.quadraticCurveTo(-r*.9,r*.8,-r*1.0,r*.25);g.quadraticCurveTo(-r*1.1,-r*.45,-r*.5,-r*.85);g.closePath()});
  g.fillStyle='rgba(230,240,190,.35)';g.beginPath();g.ellipse(0,r*.25,r*.58,r*.45,0,0,TAU);g.fill();g.fillStyle='rgba(60,70,30,.5)';g.beginPath();g.arc(0,r*.3,r*.05,0,TAU);g.fill();
  g.fillStyle='#7a4a24';g.strokeStyle='#3a2410';g.lineWidth=2;g.beginPath();g.moveTo(-r*.75,r*.5);g.lineTo(r*.75,r*.5);g.lineTo(r*.45,r*.85);g.lineTo(r*.1,r*.7);g.lineTo(-r*.2,r*.88);g.lineTo(-r*.6,r*.72);g.closePath();g.fill();g.stroke();g.strokeStyle='#c8a878';g.lineWidth=3;g.beginPath();g.moveTo(-r*.78,r*.5);g.lineTo(r*.78,r*.5);g.stroke();
  g.save();g.translate(-r*.9,-r*.1);g.rotate(.35+Math.sin(t*3)*.05);bFill(g,shade(col,-.08),0,r*.35,r*.25,()=>g.roundRect(-r*.16,0,r*.32,r*.6,r*.14));bFill(g,col,0,r*.7,r*.22,()=>g.arc(0,r*.68,r*.2,0,TAU));g.restore();
  bFill(g,col,r*.85,-r*.35,r*.2,()=>g.arc(r*.82,-r*.3,r*.2,0,TAU));
  g.fillStyle='#2a3a14';g.beginPath();g.moveTo(-r*.42,-r*.55);g.quadraticCurveTo(0,-r*.42,r*.42,-r*.55);g.lineTo(r*.42,-r*.47);g.quadraticCurveTo(0,-r*.34,-r*.42,-r*.47);g.closePath();g.fill();
  for(const s of[-1,1]){g.fillStyle='#fff';g.beginPath();g.ellipse(s*r*.2,-r*.35,r*.12,r*.1,0,0,TAU);g.fill();g.fillStyle='#3a0a00';g.beginPath();g.arc(s*r*.2,-r*.33,r*.055,0,TAU);g.fill()}
  bFill(g,shade(col,-.1),0,-r*.2,r*.12,()=>g.ellipse(0,-r*.2,r*.1,r*.08,0,0,TAU),1.5);
  g.fillStyle='#2a1a0e';g.beginPath();g.ellipse(0,-r*.02,r*.3,r*.1,0,0,Math.PI);g.fill();g.fillStyle='#fff6e0';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.24,r*.02);g.lineTo(s*r*.2,-r*.25);g.lineTo(s*r*.12,r*.02);g.closePath();g.fill()}
},
/* ---- Hex Witch: a green-faced witch on a broom ---- */
witch(g,e,r,t){
  const fl=Math.sin(t*2.5)*r*.08,wind=bWind(e,.6);bShadow(g,r*.9,r*.22,r*1.35);g.save();g.translate(0,fl);g.rotate(Math.sin(t*1.3)*.05);
  g.strokeStyle='#6b4423';g.lineWidth=r*.1;g.lineCap='round';g.beginPath();g.moveTo(-r*1.1,r*.62);g.lineTo(r*1.35,r*.5);g.stroke();
  g.fillStyle='#e0b43a';g.strokeStyle='#8a6a1a';g.lineWidth=1.2;g.beginPath();g.moveTo(-r*1.05,r*.55);g.lineTo(-r*1.75,r*.35+Math.sin(t*9)*r*.04);g.lineTo(-r*1.8,r*.65);g.lineTo(-r*1.72,r*.9+Math.sin(t*9+1)*r*.04);g.lineTo(-r*1.05,r*.7);g.closePath();g.fill();g.stroke();
  g.fillStyle='#8a2c10';g.fillRect(-r*1.12,r*.52,r*.1,r*.2);
  g.fillStyle='#2a1640';g.strokeStyle='#120a1e';g.lineWidth=2;g.beginPath();g.moveTo(-r*.4,-r*.25);g.lineTo(r*.4,-r*.25);g.lineTo(r*.85,r*.62);for(let i=0;i<=6;i++)g.lineTo(r*(.85-i*.28),r*(.62+(i%2?.2:0))+Math.sin(t*5+i)*r*.05);g.lineTo(-r*.85,r*.62);g.closePath();g.fill();g.stroke();
  bFill(g,'#7a3fb0',0,r*.1,r*.6,()=>{g.moveTo(-r*.35,-r*.25);g.lineTo(r*.35,-r*.25);g.lineTo(r*.55,r*.58);g.lineTo(-r*.55,r*.58);g.closePath()});
  g.strokeStyle='#ffd166';g.lineWidth=2;g.beginPath();g.moveTo(-r*.42,r*.2);g.lineTo(r*.42,r*.2);g.stroke();
  const px=r*.75,py=-r*.25-wind*r*.35;g.strokeStyle='#5a2a80';g.lineWidth=r*.16;g.beginPath();g.moveTo(r*.3,-r*.1);g.lineTo(px,py);g.stroke();
  g.fillStyle='rgba(200,255,210,.5)';g.strokeStyle='#2a1640';g.lineWidth=1.5;g.beginPath();g.arc(px,py-r*.12,r*.16,0,TAU);g.fill();g.stroke();g.save();g.globalCompositeOperation='lighter';const pg=g.createRadialGradient(px,py-r*.12,0,px,py-r*.12,r*.45);pg.addColorStop(0,'rgba(125,255,138,.9)');pg.addColorStop(1,'rgba(125,255,138,0)');g.fillStyle=pg;g.beginPath();g.arc(px,py-r*.12,r*(.35+wind*.2),0,TAU);g.fill();g.restore();
  g.fillStyle='#1a0e14';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.3,-r*.55);g.quadraticCurveTo(s*r*.6,-r*.2,s*r*.45,r*.05);g.lineTo(s*r*.3,-r*.2);g.closePath();g.fill()}
  bFill(g,'#8fcf6a',0,-r*.42,r*.36,()=>g.arc(0,-r*.42,r*.34,0,TAU),2);
  g.fillStyle='#6fae4a';g.strokeStyle='#2a4a1a';g.lineWidth=1.5;g.beginPath();g.moveTo(-r*.05,-r*.45);g.quadraticCurveTo(r*.1,-r*.25,-r*.02,-r*.1);g.quadraticCurveTo(r*.14,-r*.2,r*.08,-r*.45);g.closePath();g.fill();g.stroke();
  bGlow(g,[[-r*.15,-r*.5],[r*.15,-r*.5]],'#ffe066',r*.07,r*.05,10);
  g.strokeStyle='#2a1a1a';g.lineWidth=2;g.beginPath();g.moveTo(-r*.18,-r*.24);g.quadraticCurveTo(0,-r*.16,r*.18,-r*.26);g.stroke();
  g.fillStyle='#2a1640';g.strokeStyle='#120a1e';g.lineWidth=2;g.beginPath();g.ellipse(0,-r*.7,r*.72,r*.14,0,0,TAU);g.fill();g.stroke();
  g.beginPath();g.moveTo(-r*.38,-r*.74);g.quadraticCurveTo(-r*.25,-r*1.4,r*.2,-r*1.7);g.quadraticCurveTo(r*.55,-r*1.75,r*.62,-r*1.5+Math.sin(t*2)*r*.05);g.quadraticCurveTo(r*.3,-r*1.45,r*.38,-r*.74);g.closePath();g.fill();g.stroke();
  g.fillStyle='#ffd166';g.fillRect(-r*.36,-r*.9,r*.72,r*.1);g.strokeStyle='#8a6a1a';g.lineWidth=1.5;g.strokeRect(-r*.1,-r*.92,r*.2,r*.14);
  g.restore();
},
/* ---- Iron Golem: riveted plates, block fists and a furnace core ---- */
golem(g,e,r,t){
  const vent=e.vent>0,mv=Math.min(1,(e._mv||0)/20),step=Math.sin(t*6)*mv,col='#7d7f8c';
  bShadow(g,r*1.3,r*.3,r*1.12);
  for(const s of[-1,1]){const lift=Math.max(0,s*step)*r*.1;bFill(g,shade(col,-.2),s*r*.42,r*.85,r*.3,()=>g.roundRect(s*r*.42-r*.26,r*.6-lift,r*.52,r*.46,r*.08))}
  for(const s of[-1,1]){const sw=Math.sin(t*2+s)*r*.05;bFill(g,shade(col,-.1),s*r*1.02,-r*.15,r*.3,()=>g.roundRect(s*r*1.02-r*.26,-r*.5,r*.52,r*.5,r*.1));
    bFill(g,col,s*r*1.1,r*.35+sw,r*.4,()=>g.roundRect(s*r*1.1-r*.34,r*.02+sw,r*.68,r*.62,r*.12));
    g.strokeStyle='rgba(20,20,30,.5)';g.lineWidth=2;g.beginPath();for(let i=1;i<4;i++){g.moveTo(s*r*1.1-r*.34+i*r*.17,r*.4+sw);g.lineTo(s*r*1.1-r*.34+i*r*.17,r*.64+sw)}g.stroke()}
  bFill(g,col,0,0,r*.95,()=>g.roundRect(-r*.85,-r*.72,r*1.7,r*1.5,r*.2));
  g.strokeStyle='rgba(20,20,30,.45)';g.lineWidth=2;g.beginPath();g.moveTo(-r*.85,-r*.25);g.lineTo(r*.85,-r*.25);g.moveTo(-r*.85,r*.5);g.lineTo(r*.85,r*.5);g.stroke();
  g.fillStyle='#c9ccd6';for(const [x,y] of[[-.72,-.6],[.72,-.6],[-.72,-.36],[.72,-.36],[-.72,.62],[.72,.62],[-.3,.62],[.3,.62]]){g.beginPath();g.arc(x*r,y*r,r*.045,0,TAU);g.fill()}
  g.fillStyle='rgba(120,70,40,.45)';g.beginPath();g.ellipse(-r*.45,r*.3,r*.16,r*.1,.4,0,TAU);g.ellipse(r*.55,-r*.45,r*.12,r*.07,-.3,0,TAU);g.fill();
  const cr=r*.36,cy=r*.12;g.fillStyle='#16110f';g.beginPath();g.arc(0,cy,cr,0,TAU);g.fill();
  if(vent){g.save();g.globalCompositeOperation='lighter';const vg=g.createRadialGradient(0,cy,0,0,cy,cr*1.3);vg.addColorStop(0,'rgba(255,245,200,1)');vg.addColorStop(.45,'rgba(255,160,40,.9)');vg.addColorStop(1,'rgba(255,90,0,0)');g.fillStyle=vg;g.beginPath();g.arc(0,cy,cr*(1.2+Math.sin(t*14)*.08),0,TAU);g.fill();g.restore()}
  else{const gl=.35+Math.sin(t*3)*.15;g.fillStyle=`rgba(255,140,40,${gl})`;g.beginPath();g.arc(0,cy,cr*.8,0,TAU);g.fill()}
  g.strokeStyle='#4a4c56';g.lineWidth=r*.07;g.beginPath();g.arc(0,cy,cr,0,TAU);g.stroke();
  if(!vent){g.beginPath();for(let i=-1;i<=1;i++){g.moveTo(i*cr*.5,cy-cr*.9);g.lineTo(i*cr*.5,cy+cr*.9)}g.stroke()}
  bFill(g,shade(col,.05),0,-r*.92,r*.4,()=>g.roundRect(-r*.4,-r*1.2,r*.8,r*.5,r*.1));
  g.fillStyle='#14121a';g.fillRect(-r*.3,-r*1.02,r*.6,r*.12);bGlow(g,[[-r*.14,-r*.96],[r*.14,-r*.96]],vent?'#ff5a1e':'#ffb020',r*.08,r*.04,12);
  bFill(g,'#4a4c56',r*.25,-r*1.3,r*.12,()=>g.roundRect(r*.18,-r*1.42,r*.14,r*.24,r*.03),1.5);
  if(vent){g.fillStyle='rgba(200,200,210,.4)';for(let k=0;k<3;k++){const p=(t*1.2+k/3)%1;g.beginPath();g.arc(r*.25+Math.sin(p*6)*r*.08,-r*1.45-p*r*.6,r*(.07+p*.12),0,TAU);g.fill()}}
},

/* ---- The Warden: an armored jailer with a hammer and a ball and chain ---- */
warden(g,e,r,t){
  const rage=(e.phase||1)>=3,mv=Math.min(1,(e._mv||0)/25),step=Math.sin(t*9)*mv,wind=bWind(e,.7);
  bShadow(g,r*1.3,r*.32,r*1.08);
  for(const s of[-1,1]){const lift=Math.max(0,s*step)*r*.12;
    bFill(g,'#3b2a22',s*r*.36,r*.72,r*.3,()=>g.roundRect(s*r*.36-r*.19,r*.5-lift,r*.38,r*.42,r*.1));
    bFill(g,'#5d6270',s*r*.4,r*.98,r*.32,()=>g.roundRect(s*r*.4-r*.28,r*.86-lift,r*.56,r*.24,[r*.14,r*.14,r*.05,r*.05]))}
  // ball and chain (left hand), drawn behind the body when the ball swings back
  const fa=t*2.4,hx=-r*1.35,hy=r*.38,bx=hx+Math.cos(fa)*r*.95,by=hy+r*.25+Math.sin(fa)*r*.42,back=Math.sin(fa)<0;
  const chain=()=>{g.strokeStyle='#8b90a0';g.lineWidth=3;g.setLineDash([5,3]);g.beginPath();g.moveTo(hx,hy);g.quadraticCurveTo((hx+bx)/2,Math.max(hy,by)+r*.25,bx,by);g.stroke();g.setLineDash([]);
    for(let i=0;i<8;i++){const a=i/8*TAU+t;bSpike(g,bx+Math.cos(a)*r*.22,by+Math.sin(a)*r*.22,a+Math.PI/2,r*.14,r*.06,'#9aa0ad')}
    bFill(g,'#4a4f5c',bx,by,r*.25,()=>g.arc(bx,by,r*.25,0,TAU))};
  if(back)chain();
  // cape
  g.fillStyle='#2a1016';g.beginPath();g.moveTo(-r*.9,-r*.3);g.lineTo(r*.9,-r*.3);for(let i=0;i<=6;i++){const x=r*.95-i*r*.317;g.lineTo(x,r*.88+Math.sin(t*3+i)*r*.05+(i%2)*r*.08)}g.closePath();g.fill();
  // torso
  bFill(g,rage?'#7d0c20':'#b3122e',0,r*.1,r,()=>{g.moveTo(-r*.98,-r*.38);g.lineTo(r*.98,-r*.38);g.lineTo(r*.72,r*.7);g.quadraticCurveTo(0,r*.86,-r*.72,r*.7);g.closePath()});
  bFill(g,'#8d93a0',0,-r*.05,r*.62,()=>{g.moveTo(-r*.56,-r*.38);g.lineTo(r*.56,-r*.38);g.lineTo(r*.44,r*.34);g.quadraticCurveTo(0,r*.5,-r*.44,r*.34);g.closePath()});
  g.strokeStyle='rgba(40,40,50,.45)';g.lineWidth=2;g.beginPath();g.moveTo(0,-r*.36);g.lineTo(0,r*.42);g.stroke();
  g.fillStyle='#e8ebf2';for(const [x,y] of[[-.44,-.26],[.44,-.26],[-.36,.24],[.36,.24]]){g.beginPath();g.arc(x*r,y*r,r*.045,0,TAU);g.fill()}
  // belt, buckle and key ring
  g.fillStyle='#3a2418';g.fillRect(-r*.8,r*.44,r*1.6,r*.16);bFill(g,'#ffc93c',0,r*.52,r*.14,()=>g.roundRect(-r*.14,r*.42,r*.28,r*.2,r*.04),2);
  g.save();g.translate(r*.5,r*.6);g.rotate(Math.sin(t*3.2)*.4);g.strokeStyle='#ffc93c';g.lineWidth=3;g.beginPath();g.arc(0,r*.12,r*.11,0,TAU);g.stroke();
  for(const a of[-.5,0,.5]){g.save();g.translate(0,r*.2);g.rotate(a);g.fillStyle='#e0b43a';g.fillRect(-r*.025,0,r*.05,r*.28);g.fillRect(0,r*.2,r*.09,r*.04);g.fillRect(0,r*.12,r*.07,r*.04);g.restore()}g.restore();
  // hammer arm (right)
  const ha=-.45-wind*2.1+Math.sin(t*2)*.08;
  g.save();g.translate(r*.98,-r*.18);g.rotate(ha);
  bFill(g,'#6b7080',0,r*.3,r*.24,()=>g.roundRect(-r*.17,0,r*.34,r*.62,r*.15));
  g.fillStyle='#6b4423';g.strokeStyle='#2a1a0e';g.lineWidth=2;g.beginPath();g.roundRect(-r*.065,r*.45,r*.13,r*1.05,r*.05);g.fill();g.stroke();
  bFill(g,'#5d6270',0,r*1.55,r*.45,()=>g.roundRect(-r*.46,r*1.3,r*.92,r*.52,r*.08));
  g.fillStyle='#ffc93c';g.fillRect(-r*.47,r*1.49,r*.94,r*.09);
  bFill(g,'#8d93a0',0,r*.6,r*.2,()=>g.arc(0,r*.6,r*.17,0,TAU),2);
  g.restore();
  // chain arm (left)
  g.save();g.translate(-r*.98,-r*.18);g.rotate(.55);bFill(g,'#6b7080',0,r*.3,r*.24,()=>g.roundRect(-r*.17,0,r*.34,r*.62,r*.15));bFill(g,'#8d93a0',0,r*.6,r*.2,()=>g.arc(0,r*.62,r*.17,0,TAU),2);g.restore();
  if(!back)chain();
  // shoulder plates
  for(const s of[-1,1]){bFill(g,'#7a808e',s*r*.92,-r*.3,r*.38,()=>g.ellipse(s*r*.92,-r*.28,r*.38,r*.3,0,Math.PI,TAU));g.fillStyle='#6b7080';g.fillRect(s*r*.92-r*.38,-r*.3,r*.76,r*.09);
    bSpike(g,s*r*.8,-r*.5,s*-.3,r*.26,r*.07,'#d9dde6');bSpike(g,s*r*1.1,-r*.42,s*.5,r*.22,r*.06,'#d9dde6')}
  // helmet with horns, crown and a grated face
  for(const s of[-1,1]){g.fillStyle='#efe2c4';g.strokeStyle='#6b5a40';g.lineWidth=2;g.beginPath();g.moveTo(s*r*.36,-r*.95);g.quadraticCurveTo(s*r*.95,-r*1.0,s*r*.9,-r*1.55);g.quadraticCurveTo(s*r*.72,-r*1.12,s*r*.34,-r*.75);g.closePath();g.fill();g.stroke()}
  bFill(g,'#7a808e',0,-r*.78,r*.5,()=>g.roundRect(-r*.43,-r*1.18,r*.86,r*.8,[r*.3,r*.3,r*.12,r*.12]));
  g.fillStyle='#14100f';g.beginPath();g.roundRect(-r*.33,-r*.92,r*.66,r*.18,r*.06);g.fill();
  g.fillStyle='#14100f';g.beginPath();g.roundRect(-r*.26,-r*.66,r*.52,r*.2,r*.05);g.fill();g.strokeStyle='#8d93a0';g.lineWidth=2.5;g.beginPath();for(let i=-2;i<=2;i++){g.moveTo(i*r*.1,-r*.66);g.lineTo(i*r*.1,-r*.46)}g.stroke();
  bGlow(g,[[-r*.15,-r*.83],[r*.15,-r*.83]],rage?'#ff3b30':'#ffd21f',r*.08,r*.05,14);
  bFill(g,'#ffc93c',0,-r*1.25,r*.3,()=>{g.moveTo(-r*.3,-r*1.15);g.lineTo(-r*.34,-r*1.42);g.lineTo(-r*.15,-r*1.28);g.lineTo(0,-r*1.5);g.lineTo(r*.15,-r*1.28);g.lineTo(r*.34,-r*1.42);g.lineTo(r*.3,-r*1.15);g.closePath()},2);
  g.fillStyle='#ff2d55';g.beginPath();g.arc(0,-r*1.27,r*.06,0,TAU);g.fill();
},
/* ---- Slime King: a wobbling jelly with things it swallowed floating inside ---- */
slime(g,e,r,t){
  const sq=1+Math.sin(t*4)*.06,open=.3+bWind(e,.6)*.7;
  bShadow(g,r*1.25,r*.3,r*.86);
  g.fillStyle='rgba(60,170,70,.35)';g.beginPath();g.ellipse(0,r*.84,r*1.3,r*.22,0,0,TAU);g.fill();
  g.save();g.translate(0,r*.8);g.scale(1/sq,sq);g.translate(0,-r*.8);
  const pts=[];for(let i=0;i<30;i++){const a=i/30*TAU,s=Math.sin(a),w=1+.045*Math.sin(t*3+i*1.7)+.03*Math.sin(t*5.3+i*.9);pts.push([Math.cos(a)*r*1.18*w,(s>0?s*r*.78:s*r*1.02*w)])}
  const body=()=>bSmooth(g,pts);
  const gr=g.createRadialGradient(-r*.4,-r*.5,r*.1,0,0,r*1.3);gr.addColorStop(0,'rgba(190,255,170,.97)');gr.addColorStop(.5,'rgba(79,208,106,.94)');gr.addColorStop(1,'rgba(30,110,50,.96)');
  g.fillStyle=gr;g.beginPath();body();g.fill();
  g.save();g.beginPath();body();g.clip();
  g.globalAlpha=.4;g.save();g.translate(-r*.55,r*.3);g.rotate(.6+Math.sin(t)*.1);g.fillStyle='#f3ead2';g.fillRect(-r*.06,-r*.35,r*.12,r*.7);for(const y of[-.35,.35]){g.beginPath();g.arc(-r*.06,y*r,r*.08,0,TAU);g.arc(r*.06,y*r,r*.08,0,TAU);g.fill()}g.restore();
  g.save();g.translate(r*.55,r*.15);g.rotate(-.9+Math.sin(t*.8)*.1);g.fillStyle='#b9c2cf';g.beginPath();g.moveTo(-r*.05,-r*.5);g.lineTo(0,-r*.62);g.lineTo(r*.05,-r*.5);g.lineTo(r*.05,r*.15);g.lineTo(-r*.05,r*.15);g.closePath();g.fill();g.fillStyle='#8a5a30';g.fillRect(-r*.15,r*.15,r*.3,r*.06);g.fillRect(-r*.04,r*.2,r*.08,r*.2);g.restore();
  g.fillStyle='#ffc93c';g.beginPath();g.arc(r*.1,r*.55,r*.07,0,TAU);g.arc(-r*.15,r*.62,r*.06,0,TAU);g.fill();
  g.globalAlpha=.55;g.fillStyle='#d8ffd0';for(let k=0;k<6;k++){const p=(t*.35+k*.19)%1,x=Math.sin(k*2.3+t*.5)*r*.7,y=r*.6-p*r*1.4;g.beginPath();g.arc(x,y,r*(.07-.03*p),0,TAU);g.fill()}
  g.globalAlpha=1;g.restore();
  g.strokeStyle='#1a5a26';g.lineWidth=2.8;g.beginPath();body();g.stroke();
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(-r*.5,-r*.55,r*.3,r*.13,-.5,0,TAU);g.fill();g.beginPath();g.arc(-r*.12,-r*.8,r*.06,0,TAU);g.fill();
  // face
  const lk=clamp(((P?P.x:0)-(e.x||0))/200,-1,1)*r*.06;
  for(const s of[-1,1]){g.fillStyle='#fff';g.strokeStyle='#1a5a26';g.lineWidth=2;g.beginPath();g.ellipse(s*r*.36,-r*.18,r*.2,r*.24,0,0,TAU);g.fill();g.stroke();g.fillStyle='#0e2a12';g.beginPath();g.arc(s*r*.34+lk,-r*.12,r*.1,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(s*r*.31+lk,-r*.16,r*.035,0,TAU);g.fill()
    g.strokeStyle='#0e2a12';g.lineWidth=r*.07;g.beginPath();g.moveTo(s*r*.58,-r*.48);g.lineTo(s*r*.16,-r*.38);g.stroke()}
  g.fillStyle='#0e3a14';g.beginPath();g.ellipse(0,r*.25,r*.4,r*(.08+.18*open),0,0,TAU);g.fill();g.fillStyle='#ff7b9a';g.beginPath();g.ellipse(0,r*(.28+.1*open),r*.2,r*.07*open+1,0,0,TAU);g.fill();
  g.fillStyle='#fff';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.24,r*(.25-.08-.18*open)+2);g.lineTo(s*r*.16,r*(.25-.08-.18*open)+2);g.lineTo(s*r*.2,r*(.2-.08*open)+4);g.fill()}
  const dp=(t*.8)%1;g.fillStyle='rgba(120,230,120,.9)';g.beginPath();g.ellipse(r*.2,r*(.3+.1*open)+dp*r*.35,r*.04,r*.07,0,0,TAU);g.fill();
  // crown
  g.save();g.translate(0,-r*1.0+Math.sin(t*4)*r*.04);g.rotate(Math.sin(t*2)*.14+.08);
  bFill(g,'#ffc93c',0,-r*.2,r*.36,()=>{g.moveTo(-r*.38,0);g.lineTo(-r*.44,-r*.42);g.lineTo(-r*.2,-r*.2);g.lineTo(0,-r*.52);g.lineTo(r*.2,-r*.2);g.lineTo(r*.44,-r*.42);g.lineTo(r*.38,0);g.closePath()},2.2);
  g.fillStyle='#7fe7ff';g.beginPath();g.arc(0,-r*.12,r*.07,0,TAU);g.fill();g.fillStyle='#ff5c8a';g.beginPath();g.arc(-r*.24,-r*.08,r*.045,0,TAU);g.arc(r*.24,-r*.08,r*.045,0,TAU);g.fill();g.restore();
  g.restore();
},
/* ---- Frost Knight: armor, a cape, a shield and a greatsword ---- */
knight(g,e,r,t){
  const spin=e.spin>0,dash=!!e.dash,wind=bWind(e,.6),mv=Math.min(1,(e._mv||0)/25),step=Math.sin(t*9)*mv;
  bShadow(g,r*1.15,r*.3,r*1.1);
  // cape
  const cg=g.createLinearGradient(0,-r*.4,0,r*1.1);cg.addColorStop(0,'#2b4a86');cg.addColorStop(1,'#152648');g.fillStyle=cg;g.strokeStyle='#0c1630';g.lineWidth=2.2;
  g.beginPath();g.moveTo(-r*.8,-r*.4);g.lineTo(r*.8,-r*.4);for(let i=0;i<=5;i++){const x=r*(.95-i*.38),y=r*1.02+Math.sin(t*4+i*1.3)*r*.07;g.quadraticCurveTo(x+r*.19,y+r*.1,x,y)}g.closePath();g.fill();g.stroke();
  // legs
  for(const s of[-1,1]){const lift=Math.max(0,s*step)*r*.12;bFill(g,'#9fb3cf',s*r*.3,r*.8,r*.3,()=>g.roundRect(s*r*.3-r*.17,r*.48-lift,r*.34,r*.5,r*.08));bFill(g,'#7d91ad',s*r*.33,r*1.02,r*.28,()=>g.roundRect(s*r*.33-r*.24,r*.92-lift,r*.48,r*.18,[r*.12,r*.12,r*.04,r*.04]))}
  // torso
  bFill(g,'#b9cbe3',0,0,r*.9,()=>{g.moveTo(-r*.78,-r*.42);g.lineTo(r*.78,-r*.42);g.lineTo(r*.6,r*.52);g.quadraticCurveTo(0,r*.68,-r*.6,r*.52);g.closePath()});
  g.strokeStyle='rgba(40,60,90,.45)';g.lineWidth=2;g.beginPath();g.moveTo(-r*.5,r*.12);g.quadraticCurveTo(0,r*.26,r*.5,r*.12);g.moveTo(-r*.46,r*.34);g.quadraticCurveTo(0,r*.46,r*.46,r*.34);g.stroke();
  g.save();g.translate(0,-r*.1);g.strokeStyle='#4fb6ff';g.lineWidth=2.6;g.shadowColor='#7fe7ff';g.shadowBlur=8;for(let i=0;i<3;i++){g.rotate(Math.PI/3);g.beginPath();g.moveTo(-r*.2,0);g.lineTo(r*.2,0);g.moveTo(r*.12,-r*.05);g.lineTo(r*.16,0);g.lineTo(r*.12,r*.05);g.moveTo(-r*.12,-r*.05);g.lineTo(-r*.16,0);g.lineTo(-r*.12,r*.05);g.stroke()}g.restore();
  // sword
  const sa=spin?t*16:dash?-1.3:(.35-wind*1.5+Math.sin(t*2)*.05);
  g.save();g.translate(r*.82,-r*.05);g.rotate(sa);
  bFill(g,'#9fb3cf',0,r*.28,r*.22,()=>g.roundRect(-r*.14,0,r*.28,r*.5,r*.12));
  g.save();g.shadowColor='#7fe7ff';g.shadowBlur=spin?20:10;const bg=g.createLinearGradient(-r*.1,0,r*.1,0);bg.addColorStop(0,'#e8f7ff');bg.addColorStop(.5,'#a9dcff');bg.addColorStop(1,'#6fa8d8');g.fillStyle=bg;g.strokeStyle='#2c4a6e';g.lineWidth=2;
  g.beginPath();g.moveTo(-r*.1,-r*.1);g.lineTo(-r*.1,-r*1.45);g.lineTo(0,-r*1.7);g.lineTo(r*.1,-r*1.45);g.lineTo(r*.1,-r*.1);g.closePath();g.fill();g.stroke();g.restore();
  g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-r*.15);g.lineTo(0,-r*1.5);g.stroke();
  bFill(g,'#ffc93c',0,-r*.05,r*.3,()=>g.roundRect(-r*.34,-r*.12,r*.68,r*.12,r*.05),2);g.fillStyle='#5a3a20';g.fillRect(-r*.05,0,r*.1,r*.44);bFill(g,'#ffc93c',0,r*.48,r*.1,()=>g.arc(0,r*.5,r*.08,0,TAU),1.5);
  g.restore();
  if(spin){g.save();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(127,231,255,.35)';g.lineWidth=r*.3;g.beginPath();g.arc(0,0,r*1.75,sa-Math.PI*.1,sa+Math.PI*.9);g.stroke();g.restore()}
  // shield arm
  g.save();g.translate(-r*.8,r*.05);g.rotate(Math.sin(t*2)*.05);
  bFill(g,'#4f7fbf',0,r*.2,r*.6,()=>{g.moveTo(-r*.42,-r*.35);g.lineTo(r*.42,-r*.35);g.lineTo(r*.4,r*.2);g.quadraticCurveTo(r*.2,r*.62,0,r*.8);g.quadraticCurveTo(-r*.2,r*.62,-r*.4,r*.2);g.closePath()});
  g.strokeStyle='#dfefff';g.lineWidth=3;g.beginPath();g.moveTo(-r*.34,-r*.28);g.lineTo(r*.34,-r*.28);g.lineTo(r*.32,r*.18);g.quadraticCurveTo(r*.16,r*.52,0,r*.68);g.quadraticCurveTo(-r*.16,r*.52,-r*.32,r*.18);g.closePath();g.stroke();
  g.strokeStyle='#dfefff';g.lineWidth=2.4;g.beginPath();for(let i=0;i<3;i++){const a=i*Math.PI/3;g.moveTo(Math.cos(a)*r*.2,r*.12+Math.sin(a)*r*.2);g.lineTo(-Math.cos(a)*r*.2,r*.12-Math.sin(a)*r*.2)}g.stroke();g.restore();
  // shoulders with icicles
  for(const s of[-1,1]){bFill(g,'#c9d8ec',s*r*.78,-r*.36,r*.34,()=>g.ellipse(s*r*.78,-r*.34,r*.34,r*.26,0,Math.PI,TAU+.01));g.fillStyle='#9fb3cf';g.fillRect(s*r*.78-r*.34,-r*.36,r*.68,r*.08);
    for(let i=0;i<3;i++)bSpike(g,s*(r*.58+i*r*.16),-r*.5-(i===1?r*.08:0),s*(-.25+i*.25),r*(.22+(i===1?.1:0)),r*.05,'#bff0ff')}
  // great helm
  bFill(g,'#c9d8ec',0,-r*.75,r*.5,()=>{g.moveTo(-r*.42,-r*.42);g.lineTo(-r*.44,-r*.92);g.quadraticCurveTo(-r*.42,-r*1.28,0,-r*1.3);g.quadraticCurveTo(r*.42,-r*1.28,r*.44,-r*.92);g.lineTo(r*.42,-r*.42);g.quadraticCurveTo(0,-r*.32,-r*.42,-r*.42);g.closePath()});
  g.fillStyle='#0c1420';g.beginPath();g.roundRect(-r*.36,-r*.94,r*.72,r*.13,r*.04);g.fill();g.fillRect(-r*.06,-r*.86,r*.12,r*.34);
  bGlow(g,[[-r*.18,-r*.875],[r*.18,-r*.875]],'#7fe7ff',r*.08,r*.04,14);
  g.strokeStyle='rgba(40,60,90,.5)';g.lineWidth=1.6;g.beginPath();g.moveTo(0,-r*1.28);g.lineTo(0,-r*.98);g.stroke();
  g.save();g.translate(0,-r*1.26);g.rotate(Math.sin(t*3)*.12-.1);g.fillStyle='#4fb6ff';g.strokeStyle='#1c4f86';g.lineWidth=2;g.beginPath();g.moveTo(-r*.08,0);g.quadraticCurveTo(-r*.25,-r*.45,-r*.72,-r*.55+Math.sin(t*5)*r*.05);g.quadraticCurveTo(-r*.35,-r*.25,r*.1,0);g.closePath();g.fill();g.stroke();g.restore();
},
/* ---- Bone Colossus: a horned skull with a moving jaw ---- */
colossus(g,e,r,t){
  const bite=!!e.bite,wind=bWind(e,.5),open=bite?.9:(.1+wind*.35+Math.sin(t*2)*.04),rage=(e.phase||1)>=3;
  bShadow(g,r*1.2,r*.3,r*1.25);
  // spine and collarbones below the skull
  g.strokeStyle='#9c917a';g.lineWidth=r*.2;g.lineCap='round';g.beginPath();g.moveTo(-r*1.3,r*.95);g.quadraticCurveTo(0,r*.7,r*1.3,r*.95);g.stroke();g.strokeStyle='#e6dcc6';g.lineWidth=r*.13;g.stroke();
  for(let i=0;i<3;i++){bFill(g,'#d8cdb4',0,r*(.95+i*.22),r*.16,()=>g.roundRect(-r*.14,r*(.86+i*.22),r*.28,r*.16,r*.05),2)}
  for(const s of[-1,1])for(let i=0;i<2;i++){g.strokeStyle='#6b6250';g.lineWidth=r*.1;g.beginPath();g.moveTo(0,r*(1.05+i*.2));g.quadraticCurveTo(s*r*.6,r*(.95+i*.2),s*r*.75,r*(1.3+i*.18));g.stroke();g.strokeStyle='#e6dcc6';g.lineWidth=r*.06;g.stroke()}
  // horns
  for(const s of[-1,1]){bFill(g,'#3a3431',s*r*.9,-r*.9,r*.5,()=>{g.moveTo(s*r*.55,-r*.6);g.quadraticCurveTo(s*r*1.45,-r*.75,s*r*1.35,-r*1.6);g.quadraticCurveTo(s*r*1.15,-r*1.0,s*r*.62,-r*.95);g.closePath()});
    g.strokeStyle='#ffb020';g.lineWidth=2;for(let i=1;i<4;i++){const u=i/4;g.beginPath();g.moveTo(s*r*(.6+.8*u),-r*(.65+.3*u*u)-r*.08);g.lineTo(s*r*(.62+.62*u),-r*(.9+.3*u))}g.stroke()}
  // jaw
  const jy=r*(.42+open*.35);
  bFill(g,'#d8cdb4',0,jy,r*.6,()=>{g.moveTo(-r*.62,r*.25);g.quadraticCurveTo(-r*.66,jy+r*.35,0,jy+r*.42);g.quadraticCurveTo(r*.66,jy+r*.35,r*.62,r*.25);g.lineTo(r*.5,jy);g.lineTo(-r*.5,jy);g.closePath()});
  g.fillStyle='#fffaf0';g.strokeStyle='#6b6250';g.lineWidth=1.3;for(let i=0;i<7;i++){const x=-r*.42+i*r*.14;g.beginPath();g.roundRect(x-r*.055,jy-r*.13,r*.11,r*.15,r*.03);g.fill();g.stroke()}
  if(open>.2){g.fillStyle=`rgba(255,120,30,${open*.6})`;g.beginPath();g.ellipse(0,(r*.45+jy)/2,r*.4,(jy-r*.4)*.45+1,0,0,TAU);g.fill()}
  // cranium
  bFill(g,'#ece3cf',0,-r*.2,r*1.05,()=>{g.moveTo(-r*.62,r*.45);g.quadraticCurveTo(-r*1.02,r*.25,-r*.98,-r*.25);g.quadraticCurveTo(-r*.92,-r*1.1,0,-r*1.12);g.quadraticCurveTo(r*.92,-r*1.1,r*.98,-r*.25);g.quadraticCurveTo(r*1.02,r*.25,r*.62,r*.45);g.quadraticCurveTo(0,r*.58,-r*.62,r*.45);g.closePath()});
  g.fillStyle='rgba(120,105,80,.3)';for(const s of[-1,1]){g.beginPath();g.ellipse(s*r*.72,r*.12,r*.16,r*.22,s*.3,0,TAU);g.fill()}
  g.strokeStyle='#8a7d62';g.lineWidth=2;g.beginPath();g.moveTo(-r*.2,-r*1.1);g.lineTo(-r*.12,-r*.8);g.lineTo(-r*.28,-r*.6);g.moveTo(r*.45,-r*.95);g.lineTo(r*.34,-r*.72);g.lineTo(r*.44,-r*.55);g.stroke();
  g.strokeStyle='#6b5a40';g.lineWidth=r*.07;g.beginPath();g.moveTo(-r*.75,-r*.35);g.quadraticCurveTo(-r*.38,-r*.55,-r*.06,-r*.3);g.moveTo(r*.75,-r*.35);g.quadraticCurveTo(r*.38,-r*.55,r*.06,-r*.3);g.stroke();
  g.fillStyle='#160c0a';for(const s of[-1,1]){g.beginPath();g.ellipse(s*r*.4,-r*.08,r*.27,r*.25,s*.25,0,TAU);g.fill()}
  g.beginPath();g.moveTo(0,r*.12);g.lineTo(-r*.12,r*.34);g.lineTo(r*.12,r*.34);g.closePath();g.fill();
  const ec=rage?'#ff3030':'#ff8a3d';bGlow(g,[[-r*.38,-r*.06],[r*.38,-r*.06]],ec,r*.1*(1+wind*.3),r*.08*(1+wind*.3),18);
  g.fillStyle='#fffaf0';g.strokeStyle='#6b6250';g.lineWidth=1.3;for(let i=0;i<6;i++){const x=-r*.35+i*r*.14;g.beginPath();g.roundRect(x-r*.055,r*.36,r*.11,r*.14,r*.03);g.fill();g.stroke()}
  if(rage){g.fillStyle='rgba(255,120,30,.8)';for(let k=0;k<2;k++){const p=(t*.7+k*.5)%1;g.beginPath();g.ellipse((k?1:-1)*r*.38,r*.1+p*r*.5,r*.04,r*.07,0,0,TAU);g.fill()}}
},
/* ---- Magma Wyrm: a dragon head with a long glowing body behind it ---- */
wyrm(g,e,r,t){
  const wind=bWind(e,.6),open=.15+wind*.5+(e.breath?.6:0);
  const segs=[];for(let i=1;i<=8;i++){segs.push([Math.sin(t*2.2-i*.75)*r*.5*Math.min(1,i/3),-r*(.35+i*.46),r*(.66-i*.045)])}
  for(let i=segs.length-1;i>=0;i--){const [x,y,rr]=segs[i];
    bFill(g,'#b8481c',x,y,rr,()=>g.ellipse(x,y,rr*1.05,rr*.8,0,0,TAU));
    g.fillStyle='#f0a060';g.beginPath();g.ellipse(x,y+rr*.25,rr*.55,rr*.35,0,0,Math.PI);g.fill();
    g.save();g.strokeStyle='#ffb020';g.shadowColor='#ff8a1e';g.shadowBlur=8;g.lineWidth=2;g.beginPath();g.moveTo(x-rr*.6,y-rr*.1);g.lineTo(x-rr*.2,y+rr*.05);g.lineTo(x-rr*.3,y+rr*.3);g.moveTo(x+rr*.5,y-rr*.3);g.lineTo(x+rr*.25,y-rr*.05);g.stroke();g.restore();
    bSpike(g,x,y-rr*.7,0,rr*.45,rr*.18,'#3a2a24');
    if(i===0)for(const s of[-1,1]){g.save();g.translate(x+s*rr*.8,y-rr*.1);g.rotate(s*(.5+Math.sin(t*6)*.25));g.fillStyle='#7a2a12';g.strokeStyle='#2a0e06';g.lineWidth=2;g.beginPath();g.moveTo(0,0);g.lineTo(s*r*.95,-r*.35);g.lineTo(s*r*.8,-r*.05);g.lineTo(s*r*.9,r*.2);g.lineTo(s*r*.55,r*.12);g.lineTo(s*r*.5,r*.35);g.closePath();g.fill();g.stroke();g.strokeStyle='#c2551e';g.lineWidth=1.5;g.beginPath();g.moveTo(0,0);g.lineTo(s*r*.8,-r*.05);g.moveTo(0,0);g.lineTo(s*r*.55,r*.12);g.stroke();g.restore()}}
  bShadow(g,r*1.0,r*.25,r*1.0);
  // horns
  for(const s of[-1,1]){bFill(g,'#3a2a24',s*r*.6,-r*.55,r*.4,()=>{g.moveTo(s*r*.35,-r*.45);g.quadraticCurveTo(s*r*.9,-r*.6,s*r*1.05,-r*1.25);g.quadraticCurveTo(s*r*.7,-r*.75,s*r*.5,-r*.2);g.closePath()})}
  // head
  bFill(g,'#d9642b',0,0,r,()=>{g.moveTo(-r*.8,-r*.35);g.quadraticCurveTo(-r*.85,-r*.75,0,-r*.72);g.quadraticCurveTo(r*.85,-r*.75,r*.8,-r*.35);g.quadraticCurveTo(r*.75,r*.2,r*.42,r*.6);g.quadraticCurveTo(0,r*.78,-r*.42,r*.6);g.quadraticCurveTo(-r*.75,r*.2,-r*.8,-r*.35);g.closePath()});
  g.fillStyle='rgba(90,25,8,.35)';for(const [x,y] of[[-.5,-.4],[.45,-.45],[-.1,-.55],[.6,-.1],[-.62,-.05]]){g.beginPath();g.ellipse(x*r,y*r,r*.08,r*.05,0,0,TAU);g.fill()}
  // lower jaw
  const jy=r*(.45+open*.3);
  bFill(g,'#b8481c',0,jy,r*.5,()=>{g.moveTo(-r*.44,r*.3);g.quadraticCurveTo(-r*.38,jy+r*.25,0,jy+r*.32);g.quadraticCurveTo(r*.38,jy+r*.25,r*.44,r*.3);g.closePath()});
  if(open>.25){g.save();g.globalCompositeOperation='lighter';const fg=g.createRadialGradient(0,(r*.5+jy)/2,0,0,(r*.5+jy)/2,r*.5);fg.addColorStop(0,'rgba(255,240,160,.95)');fg.addColorStop(.5,'rgba(255,140,30,.6)');fg.addColorStop(1,'rgba(255,80,0,0)');g.fillStyle=fg;g.beginPath();g.arc(0,(r*.5+jy)/2,r*.5,0,TAU);g.fill();g.restore()}
  g.fillStyle='#fff6e0';for(let i=0;i<5;i++){const x=-r*.3+i*r*.15;g.beginPath();g.moveTo(x-r*.05,r*.46);g.lineTo(x,r*.6);g.lineTo(x+r*.05,r*.46);g.fill();g.beginPath();g.moveTo(x-r*.05,jy+r*.05);g.lineTo(x,jy-r*.08);g.lineTo(x+r*.05,jy+r*.05);g.fill()}
  // snout, nostrils, brow and eyes
  g.fillStyle='#2a0e06';for(const s of[-1,1]){g.beginPath();g.ellipse(s*r*.16,r*.3,r*.06,r*.04,s*.4,0,TAU);g.fill()}
  g.fillStyle='rgba(120,120,120,.35)';for(let k=0;k<2;k++){const p=(t*.9+k*.5)%1;g.beginPath();g.arc((k?1:-1)*r*(.16+p*.1),r*.25-p*r*.6,r*(.05+p*.08),0,TAU);g.fill()}
  g.fillStyle='#8a2c10';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.12,-r*.3);g.lineTo(s*r*.66,-r*.36);g.lineTo(s*r*.58,-r*.18);g.closePath();g.fill()}
  bGlow(g,[[-r*.36,-r*.14],[r*.36,-r*.14]],'#ffe066',r*.12,r*.08,16);
  g.fillStyle='#2a0e06';for(const s of[-1,1]){g.beginPath();g.ellipse(s*r*.36,-r*.14,r*.025,r*.07,0,0,TAU);g.fill()}
  g.save();g.strokeStyle='#ffb020';g.shadowColor='#ff8a1e';g.shadowBlur=8;g.lineWidth=2.2;g.beginPath();g.moveTo(-r*.05,-r*.7);g.lineTo(r*.05,-r*.5);g.lineTo(-r*.02,-r*.38);g.stroke();g.restore();
},
/* ---- Storm Hydra: a clawed body with a spiked back and a tail ---- */
hydra(g,e,r,t){
  const mv=Math.min(1,(e._mv||0)/25),step=Math.sin(t*7)*mv;
  bShadow(g,r*1.4,r*.34,r*.92);
  // tail
  const tw=Math.sin(t*2.4)*.35;g.save();g.lineCap='round';for(const [lw,c] of[[r*.5,'#0e4a42'],[r*.36,'#1f8f80']]){g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.moveTo(r*.6,r*.35);g.bezierCurveTo(r*1.4,r*.7,r*(1.6+tw),r*.1,r*(1.2+tw*.6),-r*.35);g.stroke()}
  bSpike(g,r*(1.2+tw*.6),-r*.35,-.4+tw*.4,r*.35,r*.12,'#ffe066');g.restore();
  // legs
  for(const [s,fy,k] of[[-1,-.25,0],[1,-.25,1],[-1,.5,1],[1,.5,0]]){const lift=(k?step:-step)*r*.06;g.save();g.translate(s*r*.95,fy*r+lift);
    bFill(g,'#17756a',0,r*.1,r*.3,()=>g.ellipse(0,r*.08,r*.28,r*.34,s*.4,0,TAU));
    g.fillStyle='#f3e6d0';for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(s*r*.05+i*r*.12,r*.36);g.lineTo(s*r*.1+i*r*.14,r*.54);g.lineTo(s*r*.15+i*r*.12,r*.36);g.fill()}g.restore()}
  // body
  bFill(g,'#1f8f80',0,0,r*1.1,()=>g.ellipse(0,r*.1,r*1.12,r*.85,0,0,TAU));
  g.fillStyle='#8fe3c8';g.strokeStyle='#2a8a70';g.lineWidth=1.5;for(let i=0;i<4;i++){const y=r*(.12+i*.17),w=r*(.55-i*.07);g.beginPath();g.ellipse(0,y,w,r*.08,0,0,TAU);g.fill();g.stroke()}
  g.fillStyle='rgba(10,60,54,.35)';for(let i=0;i<14;i++){const a=i*2.4,d=.35+.4*((i*37)%10)/10;g.beginPath();g.arc(Math.cos(a)*r*d*1.05,-r*.2+Math.sin(a)*r*d*.5,r*.07,0,Math.PI);g.fill()}
  for(let i=0;i<7;i++){const x=-r*.75+i*r*.25;bSpike(g,x,-r*.62-Math.cos((i-3)/3*1.2)*r*.12,(i-3)*.12,r*(.3+(i%2)*.1),r*.1,'#0e4a42')}
  g.save();g.strokeStyle='#ffe066';g.shadowColor='#ffe066';g.shadowBlur=10;g.lineWidth=2.5;g.globalAlpha=.6+Math.sin(t*6)*.3;g.beginPath();g.moveTo(-r*.8,-r*.1);g.lineTo(-r*.55,r*.05);g.lineTo(-r*.7,r*.2);g.lineTo(-r*.45,r*.35);g.moveTo(r*.85,-r*.15);g.lineTo(r*.6,0);g.lineTo(r*.75,r*.15);g.stroke();g.restore();
},
/* ---- The Lich: a floating robed skeleton with an ice crown and a staff ---- */
lich(g,e,r,t){
  const fl=Math.sin(t*2)*r*.08,wind=bWind(e,.6);
  bShadow(g,r*.8,r*.22,r*1.35);
  g.save();g.translate(0,fl);
  for(let k=0;k<3;k++){const a=t*1.5+k*TAU/3,x=Math.cos(a)*r*1.5,y=Math.sin(a)*r*.5-r*.1;if(Math.sin(a)>0)continue;g.save();g.translate(x,y);g.rotate(a);g.fillStyle='#bff0ff';g.strokeStyle='#4f8fbf';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-r*.2);g.lineTo(r*.09,0);g.lineTo(0,r*.2);g.lineTo(-r*.09,0);g.closePath();g.fill();g.stroke();g.restore()}
  // staff
  g.strokeStyle='#3a2410';g.lineWidth=r*.14;g.lineCap='round';g.beginPath();g.moveTo(r*1.1,r*1.15);g.lineTo(r*1.05,-r*1.2);g.stroke();g.strokeStyle='#6b4a8a';g.lineWidth=r*.08;g.stroke();
  g.strokeStyle='#cfc3a9';g.lineWidth=2.5;for(const s of[-1,1]){g.beginPath();g.moveTo(r*1.05,-r*1.1);g.quadraticCurveTo(r*1.05+s*r*.3,-r*1.35,r*1.05+s*r*.12,-r*1.55);g.stroke()}
  {const og=g.createRadialGradient(r*1.05,-r*1.38,0,r*1.05,-r*1.38,r*.45);og.addColorStop(0,'#fff');og.addColorStop(.3,'#7dffb0');og.addColorStop(1,'rgba(125,255,176,0)');g.fillStyle=og;g.beginPath();g.arc(r*1.05,-r*1.38,r*(.45+wind*.25),0,TAU);g.fill()}
  // robe
  const rg=g.createLinearGradient(0,-r*.6,0,r*1.2);rg.addColorStop(0,'#3a2d55');rg.addColorStop(1,'#1a1228');g.fillStyle=rg;g.strokeStyle='#0c0814';g.lineWidth=2.2;
  g.beginPath();g.moveTo(-r*.55,-r*.55);g.quadraticCurveTo(-r*1.05,r*.1,-r*.95,r*.95);for(let i=0;i<=7;i++){const x=-r*.95+i*r*.27,y=r*(1.0+(i%2?.28:0))+Math.sin(t*4+i)*r*.08;g.lineTo(x,y)}g.quadraticCurveTo(r*1.05,r*.1,r*.55,-r*.55);g.closePath();g.fill();g.stroke();
  g.fillStyle='#4a3a6a';g.beginPath();g.moveTo(-r*.28,-r*.3);g.lineTo(r*.28,-r*.3);g.lineTo(r*.18,r*1.05);g.lineTo(-r*.18,r*1.05);g.closePath();g.fill();
  g.strokeStyle='#ffc93c';g.lineWidth=2.5;g.beginPath();g.moveTo(-r*.62,r*.28);g.quadraticCurveTo(0,r*.4,r*.62,r*.28);g.stroke();
  g.save();g.strokeStyle='#7dffb0';g.shadowColor='#7dffb0';g.shadowBlur=8;g.lineWidth=1.6;g.globalAlpha=.7;g.beginPath();g.moveTo(-r*.12,r*.05);g.lineTo(0,-r*.1);g.lineTo(r*.12,r*.05);g.lineTo(0,r*.2);g.closePath();g.stroke();g.restore();
  // sleeves and bony hands
  for(const s of[-1,1]){g.save();g.translate(s*r*.55,-r*.35);g.rotate(s<0?2.0+wind*.4+Math.sin(t*3)*.08:-.85);
    g.fillStyle='#2a1f40';g.strokeStyle='#0c0814';g.lineWidth=2;g.beginPath();g.moveTo(-r*.18,0);g.lineTo(r*.18,0);g.lineTo(r*.28,r*.62);g.lineTo(-r*.28,r*.62);g.closePath();g.fill();g.stroke();
    g.strokeStyle='#e8e0cc';g.lineWidth=2.4;for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(i*r*.08,r*.62);g.lineTo(i*r*.12,r*.84);g.stroke()}g.restore()}
  {const hx=-r*1.22,hy=-r*.9-wind*r*.15,fg=g.createRadialGradient(hx,hy,0,hx,hy,r*.4);fg.addColorStop(0,'rgba(220,255,230,.95)');fg.addColorStop(.4,'rgba(125,255,176,.6)');fg.addColorStop(1,'rgba(125,255,176,0)');g.fillStyle=fg;g.beginPath();g.arc(hx,hy,r*(.3+wind*.25+Math.sin(t*8)*.04),0,TAU);g.fill()}
  // hood and skull
  g.fillStyle='#1e1630';g.strokeStyle='#0c0814';g.lineWidth=2.2;g.beginPath();g.moveTo(-r*.62,-r*.25);g.quadraticCurveTo(-r*.7,-r*1.05,0,-r*1.12);g.quadraticCurveTo(r*.7,-r*1.05,r*.62,-r*.25);g.quadraticCurveTo(0,-r*.05,-r*.62,-r*.25);g.closePath();g.fill();g.stroke();
  g.fillStyle='#0a0612';g.beginPath();g.ellipse(0,-r*.55,r*.46,r*.44,0,0,TAU);g.fill();
  bFill(g,'#e8e0cc',0,-r*.6,r*.36,()=>{g.arc(0,-r*.62,r*.34,Math.PI*.9,Math.PI*2.1);g.lineTo(r*.2,-r*.3);g.lineTo(-r*.2,-r*.3);g.closePath()},1.8);
  g.fillStyle='#120a18';for(const s of[-1,1]){g.beginPath();g.ellipse(s*r*.14,-r*.62,r*.1,r*.11,0,0,TAU);g.fill()}g.beginPath();g.moveTo(0,-r*.5);g.lineTo(-r*.05,-r*.42);g.lineTo(r*.05,-r*.42);g.fill();
  g.strokeStyle='#8a7f6a';g.lineWidth=1.3;g.beginPath();for(let i=-2;i<=2;i++){g.moveTo(i*r*.06,-r*.38);g.lineTo(i*r*.06,-r*.3)}g.stroke();
  bGlow(g,[[-r*.14,-r*.62],[r*.14,-r*.62]],'#7dffb0',r*.055,r*.055,14);
  for(let i=-2;i<=2;i++)bSpike(g,i*r*.15,-r*.92+Math.abs(i)*r*.04,i*.18,r*(.34-Math.abs(i)*.07),r*.06,'#bff0ff');
  for(let k=0;k<3;k++){const a=t*1.5+k*TAU/3,x=Math.cos(a)*r*1.5,y=Math.sin(a)*r*.5-r*.1;if(Math.sin(a)<=0)continue;g.save();g.translate(x,y);g.rotate(a);g.fillStyle='#e8fbff';g.strokeStyle='#4f8fbf';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-r*.22);g.lineTo(r*.1,0);g.lineTo(0,r*.22);g.lineTo(-r*.1,0);g.closePath();g.fill();g.stroke();g.restore()}
  g.restore();
},
};
