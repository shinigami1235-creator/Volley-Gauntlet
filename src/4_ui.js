
/* ================= render ================= */
const GLOW={};
function glow(c,a=.95){const k=c+a;if(!GLOW[k])GLOW[k]=mk(64,64,g=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,`rgba(255,255,255,${a})`);gr.addColorStop(.35,c);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)});return GLOW[k]}
let TORCH=null;function torchGlow(){if(!TORCH)TORCH=mk(128,128,g=>{const c=BIOMES[BIOME].glow;const gr=g.createRadialGradient(64,64,2,64,64,64);gr.addColorStop(0,`rgba(${c},1)`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(0,0,128,128)});return TORCH}
function render(){
  ctx.setTransform(VS*DPR,0,0,VS*DPR,0,0);
  ctx.fillStyle='#0d0b11';ctx.fillRect(0,0,W,H);
  ctx.save();
  if(shake>.3)ctx.translate(Math.sin(shakeT*29)*shake*.4,Math.sin(shakeT*38)*shake);
  const off=scrollY%TH;
  for(let y=off-TH;y<H;y+=TH){ctx.drawImage(floorTile,L,y,R-L,TH);ctx.drawImage(wallL,0,y,WALL,TH);ctx.drawImage(wallR,R,y,WALL,TH)}
  let gr=ctx.createLinearGradient(L,0,L+34,0);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gr;ctx.fillRect(L,0,34,H);
  gr=ctx.createLinearGradient(R,0,R-34,0);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gr;ctx.fillRect(R-34,0,34,H);
  drawDecor();
  if(['title','class','forge','codex','save'].includes(state)){drawTorchLight();ctx.restore();drawVignette();return}
  if(flood)drawFlood();
  drawSetUnder();drawHazardsFloor();drawClouds();drawZonesFloor();drawGates();drawGems();drawHazardsTop();drawWalls();drawPickups();drawEnemies();drawAfter();drawPlayer();drawProjs();drawBullets();drawNades();drawZonesTop();drawParts();drawBolts();drawNums();drawTorchLight();drawSqueeze();drawSetOver();
  const dk=darkBoss?1:darkT>0?Math.min(1,darkT,(14-darkT)*2):0;if(dk>0){drawDark(dk);drawZonesFloor();drawZonesTop();drawBullets()}
  ctx.restore();
  drawVignette();
  if(freezeAll>0){ctx.fillStyle=`rgba(140,210,255,${Math.min(.16,freezeAll*.08)})`;ctx.fillRect(0,0,W,H)}
  if(tScale<.6){ctx.fillStyle=`rgba(120,160,255,${(.6-tScale)*.15})`;ctx.fillRect(0,0,W,H)}
  if(flashA>0){ctx.fillStyle=`rgba(${flashCol},${Math.min(.8,flashA)})`;ctx.fillRect(0,0,W,H)}
  if(P.hp<P.maxHp*.3&&state==='play'){const a=.25+Math.sin(runT*8)*.12;const g2=ctx.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.7);g2.addColorStop(0,'rgba(255,0,40,0)');g2.addColorStop(1,`rgba(255,0,40,${a})`);ctx.fillStyle=g2;ctx.fillRect(0,0,W,H)}
  // zone of movement hint: faint line at top of player zone
  ctx.fillStyle='rgba(255,255,255,.035)';ctx.fillRect(L,ZTOP-P.r-2,R-L,2);
  drawPops();
}
function drawVignette(){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(vignette,0,0,cv.width,cv.height);ctx.restore()}
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function fitFont(t,maxW,size,pre=''){if(!/\b[1-9]00\b/.test(pre))pre='900 '+pre;ctx.font=`${pre}${size}px ${FONT}`;let w=ctx.measureText(t).width;while(w>maxW&&size>9){size-=1;ctx.font=`${pre}${size}px ${FONT}`;w=ctx.measureText(t).width}return size}
function drawDecor(){
  for(const d of decor){
    if(d.k==='torch'){const x=d.side<0?L-6:R+6;ctx.fillStyle='#3b2a1c';ctx.fillRect(x-4,d.y-4,8,16);ctx.fillStyle='#5a4028';ctx.fillRect(x-7,d.y-8,14,6);
      const t=performance.now()/1000+d.f,fl=Math.sin(t*13)*1.5+Math.sin(t*7.3)*1.2;
      const fc=BIOMES[BIOME].flame;ctx.fillStyle=fc[0];ctx.beginPath();ctx.ellipse(x,d.y-18,6+fl*.4,12+fl,0,0,TAU);ctx.fill();ctx.fillStyle=fc[1];ctx.beginPath();ctx.ellipse(x,d.y-15,3.4,7+fl*.5,0,0,TAU);ctx.fill()}
    else if(d.k==='skull'){ctx.save();ctx.translate(d.x,d.y);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,7,10,4,0,0,TAU);ctx.fill();skull(ctx,11,'#d9ceb6');ctx.restore()}
    else if(d.k==='bones'){ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.a);ctx.strokeStyle='#cfc3a9';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(10,0);ctx.moveTo(-6,-6);ctx.lineTo(6,6);ctx.stroke();ctx.restore()}
  }
}
function drawTorchLight(){ctx.save();ctx.globalCompositeOperation='lighter';const tg=torchGlow();for(const d of decor){if(d.k!=='torch')continue;const x=d.side<0?L-6:R+6,fl=Math.sin(performance.now()/90+d.f)*.04;ctx.globalAlpha=.3+fl;ctx.drawImage(tg,x-130,d.y-146,260,260)}ctx.restore()}

/* zones */
function drawZonesFloor(){
  for(const z of zones){if(z.k==='l'||z.k==='wave')continue;const p=clamp(z.t/z.warn,0,1),pulse=.5+Math.sin(z.t*18)*.5;
    if(!z.fired){
      if(z.k==='c'){ctx.fillStyle=`rgba(${z.col},${.08+.1*p})`;ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.fill();ctx.fillStyle=`rgba(${z.col},.28)`;ctx.beginPath();ctx.arc(z.x,z.y,z.r*p,0,TAU);ctx.fill();ctx.strokeStyle='rgba(12,4,8,.55)';ctx.lineWidth=6;ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.stroke();ctx.strokeStyle=`rgba(${z.col},${.6+pulse*.4})`;ctx.lineWidth=3;ctx.stroke();
        if(z.tag==='up'){ctx.fillStyle=`rgba(${z.col},.9)`;ctx.beginPath();ctx.moveTo(z.x,z.y-26);ctx.lineTo(z.x-10,z.y-10);ctx.lineTo(z.x+10,z.y-10);ctx.fill()}
        if(z.pod){ctx.strokeStyle=`rgba(255,200,120,${.5+pulse*.4})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(z.x-z.r*.5,z.y);ctx.lineTo(z.x+z.r*.5,z.y);ctx.moveTo(z.x,z.y-z.r*.5);ctx.lineTo(z.x,z.y+z.r*.5);ctx.stroke()}
        if(z.rock){ctx.fillStyle=`rgba(0,0,0,${.25+.3*p})`;ctx.beginPath();ctx.ellipse(z.x,z.y+4,z.r*.7*p,z.r*.35*p,0,0,TAU);ctx.fill()}}
      else if(z.k==='r'&&z.tile){ctx.fillStyle=`rgba(${z.col},${.1+.18*p})`;ctx.fillRect(z.x,z.y,z.w,z.h);ctx.strokeStyle=`rgba(200,240,255,${.4+pulse*.5})`;ctx.lineWidth=2;ctx.strokeRect(z.x+2,z.y+2,z.w-4,z.h-4)}
      else if(z.k==='r'){ctx.fillStyle=`rgba(${z.col},${.07+.08*p})`;ctx.fillRect(z.x,z.y,z.w,z.h);ctx.fillStyle=`rgba(${z.col},.2)`;ctx.fillRect(z.x,z.y,z.w,z.h*p);ctx.strokeStyle='rgba(12,4,8,.55)';ctx.lineWidth=6;ctx.strokeRect(z.x+2,z.y+2,z.w-4,z.h-4);ctx.strokeStyle=`rgba(${z.col},${.6+pulse*.4})`;ctx.lineWidth=3;ctx.strokeRect(z.x+2,z.y+2,z.w-4,z.h-4)}
    }else{
      const q=(z.t-z.warn)/Math.max(.001,z.dur);
      if(z.fire){const fl=.7+Math.sin(runT*20+z.x)*.2;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=fl*Math.min(1,(z.warn+z.dur-z.t)*2);ctx.drawImage(glow('#ff7a2f',.7),z.x-z.r*1.3,z.y-z.r*1.3,z.r*2.6,z.r*2.6);ctx.restore();if(Math.random()<.4)spark(z.x+rnd(-z.r,z.r)*.6,z.y+rnd(-z.r,z.r)*.5,pick(['#ff8a3d','#ffd166']),1,50,.4,4);continue}
      if(z.tile){ctx.fillStyle=`rgba(170,230,255,${.55*(1-q)+.2})`;ctx.fillRect(z.x,z.y,z.w,z.h);continue}
      if(z.k==='r'&&z.frost){ctx.fillStyle='rgba(140,210,255,.26)';ctx.fillRect(z.x,z.y,z.w,z.h);ctx.strokeStyle='rgba(220,245,255,.6)';ctx.lineWidth=2;ctx.strokeRect(z.x+1,z.y+1,z.w-2,z.h-2);if(Math.random()<.5)spark(z.x+rnd(0,z.w),z.y+rnd(0,z.h),'#dff6ff',1,20,.5,3)}
      else if(z.k==='r'){ctx.fillStyle=`rgba(255,240,220,${.5*(1-q)})`;ctx.fillRect(z.x,z.y,z.w,z.h)}
      else if(z.k==='c'&&z.dur>.1){ctx.fillStyle=`rgba(${z.col},${.35*(1-q)})`;ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.fill()}
    }}
}
function drawZonesTop(){
  ctx.save();
  for(const z of zones){const p=clamp(z.t/z.warn,0,1);
    if(z.k==='c'&&z.pod&&!z.fired&&p>.5){const f=(p-.5)/.5,y=z.y-(1-f)*360;ctx.fillStyle='#6b6f7d';ctx.beginPath();ctx.roundRect(z.x-12,y-18,24,30,8);ctx.fill();ctx.fillStyle='#ff8a3d';ctx.fillRect(z.x-8,y+10,16,6);ctx.fillStyle='rgba(255,160,80,.6)';ctx.beginPath();ctx.moveTo(z.x-6,y-18);ctx.lineTo(z.x,y-40-f*10);ctx.lineTo(z.x+6,y-18);ctx.fill()}
    if(z.k==='c'&&z.rock&&!z.fired&&p>.55){const f=(p-.55)/.45,y=z.y-(1-f)*320;ctx.fillStyle='#8d8577';ctx.beginPath();ctx.arc(z.x,y,z.r*.55,0,TAU);ctx.fill();ctx.fillStyle='#a39a8a';ctx.beginPath();ctx.arc(z.x-4,y-4,z.r*.3,0,TAU);ctx.fill()}
    if(z.k==='l'){
      if(!z.fired){ctx.lineCap='butt';ctx.strokeStyle=`rgba(${z.col},${.1+.14*p})`;ctx.lineWidth=z.w;ctx.beginPath();ctx.moveTo(z.x1,z.y1);ctx.lineTo(z.x2,z.y2);ctx.stroke();ctx.setLineDash([10,8]);ctx.strokeStyle='rgba(12,4,8,.5)';ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle=`rgba(${z.col},${.6+.4*Math.sin(z.t*18)})`;ctx.lineWidth=2.5;ctx.stroke();ctx.setLineDash([])}
      else if(z.beam){ctx.globalCompositeOperation='lighter';ctx.lineCap='round';const fl=1+Math.sin(z.t*50)*.12;ctx.strokeStyle=`rgba(${z.col},.45)`;ctx.lineWidth=z.w*1.5*fl;ctx.beginPath();ctx.moveTo(z.x1,z.y1);ctx.lineTo(z.x2,z.y2);ctx.stroke();ctx.strokeStyle=z.flame?'rgba(255,230,160,.9)':'rgba(255,255,255,.9)';ctx.lineWidth=z.w*.4*fl;ctx.stroke();ctx.globalCompositeOperation='source-over'}
    }
    if(z.k==='wave'&&z.fired&&z.rr>0){const q=(z.t-z.warn)/z.dur;ctx.strokeStyle=`rgba(${z.col},${.9*(1-q*.6)})`;ctx.lineWidth=12;ctx.beginPath();ctx.arc(z.x,z.y,z.rr,0,TAU);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=3;ctx.stroke()}
  }
  ctx.restore();
}
function drawClouds(){for(const c of clouds){const a=Math.min(1,c.t/c.m*2);const g=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,c.r);g.addColorStop(0,c.fire?`rgba(255,140,50,${.35*a})`:`rgba(150,230,80,${.35*a})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,TAU);ctx.fill()}}

/* gates */
const GCOL={good:'61,220,132',bad:'255,77,109',pact:'255,174,52',curse:'224,50,120'};
function drawGates(){
  for(const row of gateRows){
    ctx.save();ctx.globalAlpha=1-row.fade;
    for(const g of row.gates){
      const cls=gateClass(g),col=GCOL[cls],effs=gateEffs(g),y=row.y,x=g.x+3,w=g.w-6,h=62;
      ctx.save();if(row.used)ctx.translate(0,-row.fade*30);
      ctx.fillStyle='rgba(0,0,0,.35)';rr(x+4,y-h/2+8,w,h,10);ctx.fill();
      ctx.fillStyle=`rgba(${col},.24)`;rr(x,y-h/2,w,h,10);ctx.fill();
      const gg=ctx.createLinearGradient(0,y-h/2,0,y+h/2);gg.addColorStop(0,`rgba(${col},.34)`);gg.addColorStop(1,`rgba(${col},.08)`);ctx.fillStyle=gg;rr(x+5,y-h/2+5,w-10,h-10,7);ctx.fill();
      ctx.lineWidth=4;ctx.strokeStyle=g.grow?'#ffd166':`rgb(${col})`;rr(x,y-h/2,w,h,10);ctx.stroke();
      if(cls==='curse'){ctx.strokeStyle='rgba(255,255,255,.25)';ctx.setLineDash([4,5]);ctx.lineWidth=2;rr(x+6,y-h/2+6,w-12,h-12,6);ctx.stroke();ctx.setLineDash([])}
      const sc=1+Math.max(0,g.bump)*1.5;const cx=x+w/2+(g.grow?10:0),maxW=w-(g.grow?46:16);
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
      const i0=effInfo(effs[0]),i1=effs[1]?effInfo(effs[1]):null;
      let bigT=i0.big,line2=i0.sub.toUpperCase(),line3=null,c3='#fff';
      if(i0.curse){const c=CU[effs[0].v];line2=c.s1.toUpperCase();line3=c.s2.toUpperCase();c3='#ff9ab5'}
      else if(i1){line3=(i1.big+' '+i1.sub).toUpperCase();c3=i1.good?'#8ff0b5':'#ff9ab5'}
      const by=line3?y-12:y-5;
      ctx.save();ctx.translate(cx,by);ctx.scale(sc,sc);const fs=fitFont(bigT,maxW,i0.curse?22:(line3?26:30));ctx.lineWidth=5;ctx.strokeStyle='rgba(0,0,0,.6)';ctx.strokeText(bigT,0,0);ctx.fillStyle='#fff';ctx.fillText(bigT,0,0);ctx.restore();
      ctx.font='900 10.5px '+BFONT;ctx.fillStyle=i0.curse?'#8ff0b5':'rgba(255,255,255,.88)';ctx.fillText(line2,cx,line3?y+8:y+17,maxW);
      if(line3){ctx.font='900 10.5px '+BFONT;ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.5)';ctx.strokeText(line3,cx,y+21,maxW);ctx.fillStyle=c3;ctx.fillText(line3,cx,y+21,maxW)}
      if(g.grow){const gx=x+22,gy=y;ctx.strokeStyle='#ffd166';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(gx,gy,10,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(gx,gy,3.5,0,TAU);ctx.fillStyle='#ffd166';ctx.fill();ctx.beginPath();ctx.moveTo(gx-15,gy);ctx.lineTo(gx-7,gy);ctx.moveTo(gx+7,gy);ctx.lineTo(gx+15,gy);ctx.moveTo(gx,gy-15);ctx.lineTo(gx,gy-7);ctx.moveTo(gx,gy+7);ctx.lineTo(gx,gy+15);ctx.stroke();
        const need=gateNeed();if(g.effs[0].v>=GROWCAP){ctx.font='900 9px '+BFONT;ctx.fillStyle='#ffd166';ctx.fillText('MAX',x+w-22,y-h/2+12)}ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(x+12,y+h/2-9,w-24,4);ctx.fillStyle='#ffd166';ctx.fillRect(x+12,y+h/2-9,(w-24)*g.hits/need,4)}
      if(g.opts&&!row.used){for(let i=0;i<g.opts.length;i++){ctx.fillStyle=i===g.oi?'#fff':'rgba(255,255,255,.3)';ctx.beginPath();ctx.arc(cx-10+i*10,y+h/2-8,2.6,0,TAU);ctx.fill()}ctx.fillStyle=`rgba(${col},.9)`;ctx.fillRect(x+10,y-h/2+3,(w-20)*(1-g.ot/.85),3)}
      ctx.restore();
    }
    ctx.restore();
  }
}

/* hazards */
function drawHazardsFloor(){
  const cw=(R-L)/8;
  for(const h of hazards){
    if(h.k==='ice'){ctx.save();ctx.fillStyle='rgba(190,230,255,.28)';ctx.beginPath();ctx.ellipse(h.x,h.y,h.rx,h.ry,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(230,248,255,.6)';ctx.lineWidth=2;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.moveTo(h.x-h.rx*.5,h.y-h.ry*.2);ctx.lineTo(h.x-h.rx*.1,h.y-h.ry*.5);ctx.moveTo(h.x+h.rx*.1,h.y+h.ry*.3);ctx.lineTo(h.x+h.rx*.45,h.y);ctx.stroke();ctx.restore();continue}
    if(h.k==='lava'){const g=ctx.createLinearGradient(0,h.y,0,h.y+h.h);g.addColorStop(0,'#7a1a08');g.addColorStop(.15,'#e2481a');g.addColorStop(.5,'#ff7a1f');g.addColorStop(.85,'#e2481a');g.addColorStop(1,'#7a1a08');ctx.fillStyle=g;ctx.fillRect(L,h.y,R-L,h.h);
      ctx.strokeStyle='rgba(255,230,140,.55)';ctx.lineWidth=2;for(let i=0;i<6;i++){const yy=h.y+20+i*32,ph=runT*1.5+i;ctx.beginPath();for(let x=L;x<=R;x+=16)ctx.lineTo(x,yy+Math.sin(x*.05+ph)*5);ctx.stroke()}
      ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(L,h.y-6,R-L,6);ctx.fillRect(L,h.y+h.h,R-L,6);
      for(const lg of h.logs){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(lg.x+5,h.y+6,lg.w,h.h-6);const lgr=ctx.createLinearGradient(lg.x,0,lg.x+lg.w,0);lgr.addColorStop(0,'#5a3a1e');lgr.addColorStop(.5,'#8a5a30');lgr.addColorStop(1,'#4a2e16');ctx.fillStyle=lgr;ctx.fillRect(lg.x,h.y+2,lg.w,h.h-4);ctx.strokeStyle='rgba(30,15,5,.5)';ctx.lineWidth=2;for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(lg.x+i*lg.w/4,h.y+4);ctx.lineTo(lg.x+i*lg.w/4,h.y+h.h-4);ctx.stroke()}ctx.fillStyle='#b07a44';ctx.fillRect(lg.x,h.y+2,lg.w,6);ctx.fillRect(lg.x,h.y+h.h-8,lg.w,6)}
      if(Math.random()<.5)spark(rnd(L,R),h.y+rnd(0,h.h),pick(['#ffd166','#ff8a3d']),1,40,.6,4);continue}
    if(h.k==='shrine'){ctx.save();ctx.translate(h.x,h.y);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.5+Math.sin(runT*3)*.15;ctx.drawImage(glow('#8fe3ff',.35),-h.r*1.4,-h.r*1.4,h.r*2.8,h.r*2.8);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
      ctx.strokeStyle='rgba(190,240,255,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,h.r,0,TAU);ctx.stroke();ctx.rotate(runT*.8);ctx.lineWidth=2;ctx.setLineDash([8,10]);ctx.beginPath();ctx.arc(0,0,h.r*.72,0,TAU);ctx.stroke();ctx.setLineDash([]);for(let i=0;i<6;i++){ctx.rotate(TAU/6);ctx.fillStyle='rgba(190,240,255,.8)';ctx.fillRect(h.r*.82,-3,10,6)}ctx.restore();
      if(h.prog>0){ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.beginPath();ctx.arc(h.x,h.y,h.r+8,-Math.PI/2,-Math.PI/2+TAU*h.prog);ctx.stroke()}continue}
    if(h.k==='spikes'){for(const q of h.cols){const x=L+q*cw+3,w=cw-6,y=h.y;ctx.fillStyle=h.state===1?'#4a2a30':'#26222b';rr(x,y,w,h.h,5);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=2;ctx.stroke();
      const jit=h.state===1?rnd(-1,1):0;
      for(let i=0;i<3;i++)for(let j=0;j<3;j++){const cx=x+9+i*16+jit,cy=y+10+j*17;if(h.state===2){ctx.fillStyle='#c9cdd8';ctx.beginPath();ctx.moveTo(cx-5,cy+5);ctx.lineTo(cx,cy-9);ctx.lineTo(cx+5,cy+5);ctx.fill();ctx.fillStyle='#8b90a0';ctx.beginPath();ctx.moveTo(cx,cy-9);ctx.lineTo(cx+5,cy+5);ctx.lineTo(cx,cy+3);ctx.fill()}else{ctx.fillStyle=h.state===1?'#ff4d6d':'#111';ctx.beginPath();ctx.arc(cx,cy,2.6,0,TAU);ctx.fill()}}}}
    else if(h.k==='saw'){ctx.fillStyle='rgba(0,0,0,.5)';if(h.vert&&!h.horizLane)ctx.fillRect(h.x-4,h.y-h.amp-10,8,h.amp*2+20);else if(h.horizLane)ctx.fillRect(h.horizLane[0]+6,h.y-4,h.horizLane[1]-h.horizLane[0]-12,8);else ctx.fillRect(L+4,h.y-4,R-L-8,8)}
    else if(h.k==='flame'){const nx=h.side<0?L:R;ctx.fillStyle='#55505e';rr(nx-(h.side<0?4:10),h.y-14,14,28,4);ctx.fill();ctx.fillStyle=h.state===1?'#ff4d1f':'#1a1720';ctx.beginPath();ctx.arc(nx+(h.side<0?8:-8),h.y,6,0,TAU);ctx.fill();
      if(h.state===1){ctx.fillStyle='rgba(255,80,40,.14)';const x0=h.side<0?L:R-h.len;ctx.fillRect(x0,h.y-22,h.len,44);ctx.strokeStyle='rgba(255,80,40,.5)';ctx.setLineDash([6,6]);ctx.strokeRect(x0,h.y-22,h.len,44);ctx.setLineDash([])}}
    else if(h.k==='pool'){const g=ctx.createRadialGradient(h.x,h.y,4,h.x,h.y,h.rx);g.addColorStop(0,'rgba(140,220,60,.55)');g.addColorStop(1,'rgba(80,140,30,.3)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(h.x,h.y,h.rx,h.ry,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(180,255,110,.5)';ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='rgba(220,255,170,.5)';for(let i=0;i<4;i++){const a=runT*1.3+i*1.7;ctx.beginPath();ctx.arc(h.x+Math.cos(a)*h.rx*.5,h.y+Math.sin(a*1.3)*h.ry*.5,2+((runT*3+i)%1)*3,0,TAU);ctx.fill()}}
    else if(h.k==='laser'){const x=h.side<0?L:R;ctx.fillStyle='#55505e';rr(x-(h.side<0?6:14),h.y-12,20,24,4);ctx.fill();ctx.fillStyle=h.state===1?`rgba(255,40,60,${.5+Math.sin(runT*30)*.5})`:h.state===2?'#fff':'#3a2020';ctx.beginPath();ctx.arc(x+(h.side<0?8:-8),h.y,5,0,TAU);ctx.fill();
      if(h.state===1){ctx.strokeStyle=`rgba(255,40,60,${.25+Math.random()*.3})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,h.y);ctx.lineTo(R,h.y);ctx.stroke();ctx.fillStyle='rgba(255,40,60,.08)';ctx.fillRect(L,h.y-10,R-L,20)}}
    else if(h.k==='crusher'){const le=L+(h.gx-h.gw/2-L)*h.e,rs=R-(R-(h.gx+h.gw/2))*h.e,y=h.y,hh=h.h;
      if(h.warnS){ctx.fillStyle='rgba(255,40,70,.13)';ctx.fillRect(L,y,h.gx-h.gw/2-L,hh);ctx.fillRect(h.gx+h.gw/2,y,R-(h.gx+h.gw/2),hh);ctx.strokeStyle='rgba(255,60,80,.6)';ctx.setLineDash([6,6]);ctx.lineWidth=2;ctx.strokeRect(L,y,h.gx-h.gw/2-L,hh);ctx.strokeRect(h.gx+h.gw/2,y,R-(h.gx+h.gw/2),hh);ctx.setLineDash([])}
      for(const [x0,x1,s] of[[L,le,1],[rs,R,-1]]){if(x1-x0<2)continue;const g=ctx.createLinearGradient(0,y,0,y+hh);g.addColorStop(0,'#8b8f9e');g.addColorStop(1,'#4d505c');ctx.fillStyle=g;ctx.fillRect(x0,y,x1-x0,hh);ctx.fillStyle='rgba(0,0,0,.25)';for(let xx=x0+12;xx<x1-6;xx+=26)ctx.fillRect(xx,y+4,3,hh-8);
        const ex=s>0?x1:x0;ctx.fillStyle='#c9cdd8';for(let yy=y+4;yy<y+hh-4;yy+=12){ctx.beginPath();ctx.moveTo(ex,yy);ctx.lineTo(ex+s*9,yy+6);ctx.lineTo(ex,yy+12);ctx.fill()}}}
  }
}
function drawHazardsTop(){
  for(const h of hazards){
    if(h.k==='barrel'){ctx.save();ctx.translate(h.x,h.y);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,h.r*.8,h.r,h.r*.35,0,0,TAU);ctx.fill();ctx.fillStyle=h.flash>0?'#fff':'#b8402c';ctx.beginPath();ctx.arc(0,0,h.r,0,TAU);ctx.fill();ctx.strokeStyle='#5a2a1a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,h.r*.66,0,TAU);ctx.stroke();ctx.fillStyle='#ffd166';ctx.font=`900 16px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!',0,1);ctx.restore()}
    else if(h.k==='pot'){ctx.save();ctx.translate(h.x,h.y);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,8,10,4,0,0,TAU);ctx.fill();ctx.fillStyle='#9a5634';ctx.beginPath();ctx.arc(0,0,h.r,0,TAU);ctx.fill();ctx.fillStyle='#c27548';ctx.beginPath();ctx.arc(-3,-3,h.r*.55,0,TAU);ctx.fill();ctx.fillStyle='#3a1f14';ctx.beginPath();ctx.arc(0,0,h.r*.35,0,TAU);ctx.fill();ctx.restore()}
    else if(h.k==='mine'){ctx.save();ctx.translate(h.x,h.y);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,6,12,5,0,0,TAU);ctx.fill();ctx.fillStyle='#4d505c';ctx.beginPath();ctx.arc(0,0,11,0,TAU);ctx.fill();ctx.fillStyle='#6b6f7d';ctx.beginPath();ctx.arc(-2,-2,6,0,TAU);ctx.fill();
      const blink=h.trig>=0?Math.floor(runT*20)%2:h.arm<=0?Math.floor(runT*3)%2:0;ctx.fillStyle=blink?'#ff3d5a':'#5a1a22';ctx.beginPath();ctx.arc(0,0,3.5,0,TAU);ctx.fill();
      if(h.arm<=0){ctx.strokeStyle=h.trig>=0?'rgba(255,60,80,.8)':'rgba(255,60,80,.18)';ctx.lineWidth=h.trig>=0?3:1.5;ctx.beginPath();ctx.arc(0,0,h.trig>=0?80:52,0,TAU);ctx.stroke()}ctx.restore()}
    else if(h.k==='saw'){const sy=h.y+(h.dy||0);ctx.save();ctx.translate(h.x,sy);ctx.rotate(h.rot);ctx.fillStyle='#c9cdd8';ctx.beginPath();for(let i=0;i<14;i++){const a=i*TAU/14;ctx.lineTo(Math.cos(a)*h.r,Math.sin(a)*h.r);ctx.lineTo(Math.cos(a+.22)*h.r*.78,Math.sin(a+.22)*h.r*.78)}ctx.closePath();ctx.fill();ctx.fillStyle='#8b90a0';ctx.beginPath();ctx.arc(0,0,h.r*.62,0,TAU);ctx.fill();ctx.fillStyle='#3b3743';ctx.beginPath();ctx.arc(0,0,h.r*.2,0,TAU);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,h.r*.45,0,1.2);ctx.stroke();ctx.restore()}
    else if(h.k==='flame'&&h.state===2){ctx.save();ctx.globalCompositeOperation='lighter';const x0=h.side<0?L:R;for(let i=0;i<3;i++){const g=ctx.createLinearGradient(x0,0,x0+(h.side<0?h.len:-h.len),0);g.addColorStop(0,'rgba(255,240,180,.9)');g.addColorStop(.35,'rgba(255,140,40,.75)');g.addColorStop(1,'rgba(255,60,20,0)');ctx.fillStyle=g;ctx.beginPath();const w=18-i*4+Math.sin(performance.now()/40+i)*3;ctx.ellipse(x0+(h.side<0?h.len/2:-h.len/2),h.y+rnd(-2,2),h.len/2,w,0,0,TAU);ctx.fill()}ctx.restore()}
    else if(h.k==='laser'&&h.state===2){ctx.save();ctx.globalCompositeOperation='lighter';const fl=1+Math.sin(runT*60)*.15;ctx.fillStyle='rgba(255,40,60,.4)';ctx.fillRect(L,h.y-12*fl,R-L,24*fl);ctx.fillStyle='rgba(255,220,230,.9)';ctx.fillRect(L,h.y-3*fl,R-L,6*fl);ctx.restore();if(Math.random()<.6)spark(rnd(L,R),h.y,'#ff8aa5',1,120,.25,3)}
    else if(h.k==='boulder'){
      if(h.warn>0){const a=.5+Math.sin(performance.now()/70)*.5;ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#ff4d6d';ctx.beginPath();ctx.moveTo(h.x,78);ctx.lineTo(h.x-20,46);ctx.lineTo(h.x+20,46);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,77,109,.1)';ctx.fillRect(h.x-h.r,0,h.r*2,H);ctx.font=`900 22px ${FONT}`;ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText('!',h.x,70);ctx.restore();continue}
      ctx.save();ctx.translate(h.x,h.y);ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(0,h.r*.8,h.r,h.r*.35,0,0,TAU);ctx.fill();ctx.rotate(h.rot);const g=ctx.createRadialGradient(-10,-12,4,0,0,h.r);g.addColorStop(0,h.flash>0?'#fff':'#a39a8a');g.addColorStop(1,'#4e483f');ctx.fillStyle=g;ctx.beginPath();for(let i=0;i<10;i++){const a=i*TAU/10,r=h.r*(i%2?.93:1);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(30,25,20,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,-6);ctx.lineTo(4,2);ctx.lineTo(10,16);ctx.moveTo(4,2);ctx.lineTo(16,-10);ctx.stroke();ctx.restore();
      if(h.hp<h.max){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(h.x-24,h.y-h.r-12,48,5);ctx.fillStyle='#ffd166';ctx.fillRect(h.x-24,h.y-h.r-12,48*Math.max(0,h.hp/h.max),5)}}
  }
}
function drawGems(){ctx.save();ctx.lineJoin='round';for(const g of gems){
  if(g.pull){const sp=Math.hypot(g.vx,g.vy)||1,ux=g.vx/sp,uy=g.vy/sp,tl=Math.min(14,sp*.02);ctx.strokeStyle=g.coin?'rgba(255,209,102,.45)':'rgba(90,240,140,.45)';ctx.lineWidth=g.big?5:3.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(g.x,g.y);ctx.lineTo(g.x-ux*tl,g.y-uy*tl);ctx.stroke()}
  if(g.coin){ctx.fillStyle='#5a3d05';ctx.beginPath();ctx.ellipse(g.x,g.y+.5,6.5,6,0,0,TAU);ctx.fill();ctx.fillStyle='#ffd166';ctx.beginPath();ctx.ellipse(g.x,g.y,5,4.6,0,0,TAU);ctx.fill();ctx.fillStyle='#fff3c4';ctx.fillRect(g.x-1.5,g.y-3,1.6,4);continue}
  const s=g.big?6.5:4.8;ctx.beginPath();ctx.moveTo(g.x,g.y-s*1.25);ctx.lineTo(g.x+s,g.y);ctx.lineTo(g.x,g.y+s*1.25);ctx.lineTo(g.x-s,g.y);ctx.closePath();ctx.strokeStyle='#0b2a15';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle=g.big?'#9dff5c':'#3ee07a';ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.moveTo(g.x,g.y-s*1.05);ctx.lineTo(g.x+s*.45,g.y-s*.1);ctx.lineTo(g.x,g.y);ctx.closePath();ctx.fill()}ctx.restore()}
function drawPickups(){for(const p of pickups){if(p.t>7&&Math.floor(p.t*8)%2)continue;const b=Math.sin(p.t*5)*3,col=PICKCOL[p.k];ctx.save();ctx.translate(p.x,p.y+b);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55;ctx.drawImage(glow(col,.3),-34,-34,68,68);ctx.restore();
  ctx.save();ctx.translate(p.x,p.y+b);ctx.fillStyle='rgba(20,16,26,.85)';ctx.beginPath();ctx.arc(0,0,17,0,TAU);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,17,0,TAU);ctx.stroke();ctx.rotate(Math.sin(p.t*3)*.15);drawIcon(ctx,p.k,11);ctx.restore()}}

/* enemies */
const FEET={grunt:1,runner:1,brute:1,shield:1,bomber:1,charger:1};
function drawEnemies(){
  for(const e of enemies){if(!e.alive)continue;
    if(e.tw&&e.tw.length&&!e.gone){ctx.save();ctx.strokeStyle='rgba(255,70,70,.6)';ctx.lineWidth=3;ctx.setLineDash([12,9]);ctx.lineDashOffset=-runT*40;ctx.beginPath();ctx.arc(e.x,e.y,e.r+16,0,TAU);ctx.stroke();ctx.restore()}
    if(e.type==='carrier'){drawCarrier(e);continue}
    if(e.under){ctx.fillStyle='#4a3322';ctx.beginPath();ctx.ellipse(e.x,e.y+4,18,9,0,0,TAU);ctx.fill();ctx.fillStyle='#6b4a30';for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(e.x+Math.cos(i*1.3+e.t*6)*12,e.y+2+Math.sin(i*1.7)*4,3,0,TAU);ctx.fill()}continue}
    const sp=SPR[e.type],sc=e.r/e.d.r,s=sp.s*sc;
    const bob=e.d.boss||e.d.mini?Math.sin(e.t*2)*2:Math.sin(e.wob)*1.4;
    if(e.champ){const c=AFFIX[e.aff].c;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(e.x,e.y,e.r*.6,e.x,e.y,e.r*1.7);g.addColorStop(0,c+'66');g.addColorStop(1,c+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(e.x,e.y,e.r*1.7,0,TAU);ctx.fill();ctx.restore();
      ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.setLineDash([5,4]);ctx.lineDashOffset=-runT*20;ctx.beginPath();ctx.arc(e.x,e.y+bob,e.r+5,0,TAU);ctx.stroke();ctx.setLineDash([])}
    if(e.type==='hydra'&&e.phase>1)drawHydraNecks(e);
    if(e.type==='colossus')drawHands(e,false);
    ctx.save();
    if(e.gone)ctx.globalAlpha=.15;else if(e.phased)ctx.globalAlpha=.22;else if(e.type==='ghost')ctx.globalAlpha=.9;
    const sq=1+Math.sin(e.wob*2)*.03;
    let js=1,jy=0;if(e.jump){const p=clamp(e.jump.t/e.jump.T,0,1);js=1+Math.sin(p*Math.PI)*.45;jy=-Math.sin(p*Math.PI)*70;ctx.save();ctx.globalAlpha=.35+p*.3;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(e.jump.tx,e.jump.ty+e.r*.7,e.r*(.5+p*.5),e.r*.35*(.5+p*.5),0,0,TAU);ctx.fill();ctx.restore()}
    ctx.translate(e.x,e.y+bob+jy);if(js!==1)ctx.scale(js,js);
    if(e.inv&&e.d.boss){ctx.globalAlpha*=.8}
    if(e.d.bat)ctx.scale(1+Math.sin(e.wob)*.14,1);else if(e.d.drone)ctx.rotate(e.dirn>0?-.25:.25);else if(!e.d.boss&&!e.d.mini)ctx.scale(1/sq,sq);
    if(e.d.charge&&e.mode===1)ctx.translate(rnd(-2,2),0);
    if(FEET[e.type]&&!e.under){const ph=Math.sin(e.wob*1.6);ctx.fillStyle='#3b2a1c';ctx.strokeStyle='#120a06';ctx.lineWidth=1.5;for(const q of[-1,1]){ctx.beginPath();ctx.ellipse(q*e.r*.45,e.r*.98-(q*ph>0?e.r*.18:0),e.r*.28,e.r*.18,0,0,TAU);ctx.fill();ctx.stroke()}}
    if(e.fuse!=null&&Math.floor(e.fuse*14)%2)ctx.filter='brightness(2.2)';
    if(BART[e.type])bossLive(e);else{ctx.drawImage(sp.c,-s/2,-s/2,s,s);
    if(e.flash>0){const ga=ctx.globalAlpha;ctx.globalAlpha=ga*(e.d.boss||e.d.mini?.35:.75);ctx.drawImage(sp.f,-s/2,-s/2,s,s);ctx.globalAlpha=ga}}
    ctx.filter='none';
    if(e.frzT>0||freezeAll>0){ctx.fillStyle='rgba(150,225,255,.55)';ctx.beginPath();ctx.arc(0,0,e.r*1.05,0,TAU);ctx.fill();ctx.strokeStyle='rgba(230,250,255,.9)';ctx.lineWidth=2;ctx.stroke()}
    else if(e.slowT>0){ctx.strokeStyle='rgba(111,224,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,e.r+3,0,TAU);ctx.stroke()}
    if(e.burnT>0){ctx.fillStyle='rgba(255,120,40,.28)';ctx.beginPath();ctx.arc(0,0,e.r,0,TAU);ctx.fill()}
    if(e.poisSt>0){ctx.fillStyle=`rgba(150,230,80,${.12+Math.min(.3,e.poisSt*.04)})`;ctx.beginPath();ctx.arc(0,0,e.r,0,TAU);ctx.fill()}
    ctx.restore();
    if(e.type==='hydra'&&e.phase===1)drawHydraNecks(e);
    if(e.type==='colossus')drawHands(e,true);
    if(e.d.boss&&e.objInv){ctx.strokeStyle=`rgba(160,200,255,${.35+Math.sin(runT*6)*.15})`;ctx.lineWidth=4;ctx.beginPath();ctx.arc(e.x,e.y,e.r+14,0,TAU);ctx.stroke()}
    if(e.d.part&&e.hp<e.max&&e.type!=='clone'){const w=e.r*1.8;ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(e.x-w/2,e.y-e.r-12,w,5);ctx.fillStyle='#ffb020';ctx.fillRect(e.x-w/2,e.y-e.r-12,w*Math.max(0,e.hp/e.max),5)}
    if(e.type==='crystal'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.4+Math.sin(runT*4)*.2;ctx.drawImage(glow('#7dffb0',.6),e.x-40,e.y-40,80,80);ctx.restore()}
    if(e.stunT>0&&!e.d.boss){ctx.save();ctx.fillStyle='#ffe066';for(let k=0;k<3;k++){const a=runT*6+k*TAU/3;ctx.beginPath();ctx.arc(e.x+Math.cos(a)*e.r*.8,e.y-e.r-6+Math.sin(a)*4,2.6,0,TAU);ctx.fill()}ctx.restore()}
    if(e.fuse!=null){const p=1-e.fuse/.85;ctx.save();ctx.strokeStyle=`rgba(255,140,50,${.5+.4*Math.sin(runT*30)})`;ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.beginPath();ctx.arc(e.x,e.y,80,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=`rgba(255,120,40,${.12+p*.2})`;ctx.beginPath();ctx.arc(e.x,e.y,80*p,0,TAU);ctx.fill();ctx.restore()}
    if(e.d.bomb){const fl=Math.sin(runT*20+e.id)>0;ctx.fillStyle=fl?'#fff3c4':'#ff8a3d';ctx.beginPath();ctx.arc(e.x+Math.sin(e.wob)*2,e.y-e.r*1.2+bob,fl?3.5:2.5,0,TAU);ctx.fill()}
    if(e.shield>0){const a=e.shield/e.shieldMax;ctx.save();ctx.translate(e.x,e.y+bob);ctx.fillStyle='#4d86e8';ctx.strokeStyle='#cfe3ff';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(0,e.r*.75,e.r*1.1,e.r*.5,0,0,Math.PI);ctx.lineTo(-e.r*1.1,e.r*.6);ctx.closePath();ctx.globalAlpha=.4+a*.6;ctx.fill();ctx.stroke();ctx.restore()}
    if(e.d.shoot&&e.mode===1){ctx.strokeStyle=`rgba(194,139,255,${.3+Math.sin(runT*10)*.2})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.r+6,0,TAU);ctx.stroke()}
    if(e.d.charge&&e.mode===2){ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=2;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(e.x+i*8-e.cdx*20,e.y-e.cdy*20);ctx.lineTo(e.x+i*8-e.cdx*50,e.y-e.cdy*50);ctx.stroke()}}
    if(e.champ){ctx.font='900 10px '+BFONT;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.8)';ctx.strokeText(AFFIX[e.aff].n.toUpperCase(),e.x,e.y-e.r-18);ctx.fillStyle=AFFIX[e.aff].c;ctx.fillText(AFFIX[e.aff].n.toUpperCase(),e.x,e.y-e.r-18)}
    if(!e.d.boss&&!e.d.mini&&(e.champ||!['grunt','mini','runner','bat'].includes(e.type))&&e.hp<e.max){const w=e.r*1.8;ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(e.x-w/2,e.y-e.r-12,w,4);ctx.fillStyle='#ff4d6d';ctx.fillRect(e.x-w/2,e.y-e.r-12,w*Math.max(0,e.hp/e.max),4)}
  }
}
function drawHydraNecks(e){ctx.save();ctx.lineCap='round';
  if(e.phase>1){for(const p of e.parts){if(!p.alive)continue;ctx.strokeStyle='#136b5f';ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.quadraticCurveTo((e.x+p.x)/2,e.y-10,p.x,p.y-8);ctx.stroke();ctx.strokeStyle='#1f8f80';ctx.lineWidth=12;ctx.stroke()}
    if(e.headsGone||e.parts.some(p=>!p.alive)){ctx.fillStyle='#0e4a42';for(let i=0;i<3;i++){const p=e.parts[i];if(p&&p.alive)continue;ctx.beginPath();ctx.ellipse(e.x+[-40,0,40][i],e.y+[10,30,10][i],10,7,0,0,TAU);ctx.fill()}}ctx.restore();return}
  const hs=[[-78,48],[0,74],[78,48]];
  hs.forEach(([hx,hy],i)=>{const x=e.x+hx+Math.sin(e.t*2+i)*6,y=e.y+hy+Math.cos(e.t*2.3+i)*5;ctx.strokeStyle='#136b5f';ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(e.x+hx*.3,e.y+e.r*.5);ctx.quadraticCurveTo(e.x+hx*.75,e.y+e.r*.55,x,y);ctx.stroke();ctx.strokeStyle='#1f8f80';ctx.lineWidth=12;ctx.stroke();
    ctx.save();ctx.translate(x,y+6);const s=1.25;ctx.scale(s,s);for(const q of[-1,1]){ctx.fillStyle='#0e4a42';ctx.beginPath();ctx.moveTo(q*6,-12);ctx.lineTo(q*16,-24);ctx.lineTo(q*12,-8);ctx.fill()}ctx.fillStyle='#22a391';ctx.strokeStyle='#0a3a33';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-14,-10);ctx.quadraticCurveTo(0,-20,14,-10);ctx.quadraticCurveTo(15,8,7,20);ctx.quadraticCurveTo(0,24,-7,20);ctx.quadraticCurveTo(-15,8,-14,-10);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#0a3a33';ctx.beginPath();ctx.ellipse(0,17,7,4+Math.max(0,Math.sin(e.t*3+i))*3,0,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-6,13);ctx.lineTo(-4,19);ctx.lineTo(-2,13);ctx.moveTo(2,13);ctx.lineTo(4,19);ctx.lineTo(6,13);ctx.fill();
    ctx.fillStyle='#ffe066';ctx.shadowColor='#ffe066';ctx.shadowBlur=8;ctx.beginPath();ctx.ellipse(-7,0,3.5,2.4,.3,0,TAU);ctx.ellipse(7,0,3.5,2.4,-.3,0,TAU);ctx.fill();ctx.shadowBlur=0;ctx.restore()});ctx.restore()}
function drawHands(e,front){if(!e.hands||e.phase>1)return;e.hands.forEach((h,k)=>{const s=k?1:-1;if(!front){const sx=e.x+s*e.r*1.3,sy=e.y+e.r*.95,mx=(sx+h.x)/2+s*30,my=Math.max(sy,h.y)+40;ctx.save();ctx.lineCap='round';for(const [lw,c] of[[16,'#6b6250'],[11,'#e6dcc6']]){ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(mx,my);ctx.lineTo(h.x,h.y-8);ctx.stroke()}ctx.fillStyle='#e6dcc6';ctx.strokeStyle='#6b6250';ctx.lineWidth=2;ctx.beginPath();ctx.arc(mx,my,10,0,TAU);ctx.fill();ctx.stroke();ctx.restore()}
  if(front!==(h.y>e.y+40))return;const part=e.parts&&e.parts[k],hurt=part&&part.alive?1-part.hp/part.max:0;ctx.save();ctx.translate(h.x,h.y);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,30,36,12,0,0,TAU);ctx.fill();
  ctx.fillStyle='#ece3cf';ctx.strokeStyle='#6b6250';ctx.lineWidth=2;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(-22,-16);ctx.quadraticCurveTo(0,-26,22,-16);ctx.lineTo(24,8);ctx.quadraticCurveTo(0,14,-24,8);ctx.closePath();ctx.fill();ctx.stroke();
  const curl=Math.sin(e.t*3+k)*3;for(let i=0;i<4;i++){const fx=-18+i*12,l=(i===1||i===2?15:12);ctx.beginPath();ctx.roundRect(fx-4.5,8,9,l,4);ctx.fill();ctx.stroke();ctx.beginPath();ctx.roundRect(fx-4,8+l+1+curl*.3,8,l*.8,4);ctx.fill();ctx.stroke();ctx.fillStyle='#fffaf0';ctx.beginPath();ctx.arc(fx,8,4.5,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#ece3cf'}
  ctx.beginPath();ctx.save();ctx.translate(-s*24,-2);ctx.rotate(s*.9);ctx.roundRect(-4.5,0,9,18,4);ctx.fill();ctx.stroke();ctx.restore();
  ctx.fillStyle='rgba(120,105,80,.35)';ctx.beginPath();ctx.ellipse(0,-4,12,6,0,0,TAU);ctx.fill();
  if(hurt>.3){ctx.strokeStyle='#6b5a40';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,-18);ctx.lineTo(-2,-8);ctx.lineTo(-10,2);if(hurt>.6){ctx.moveTo(10,-16);ctx.lineTo(6,-4)}ctx.stroke()}
  ctx.restore()})}
function drawAfter(){const C=CLASSES[P.cls];for(const a of after){ctx.globalAlpha=a.l/.25*.4;ctx.fillStyle=C.hi;ctx.beginPath();ctx.arc(a.x,a.y-2,14,0,TAU);ctx.fill()}ctx.globalAlpha=1}
function drawPlayer(){
  const x=P.x,y=P.y;ctx.save();
  if(P.iframe>0&&P.shieldT<=0&&P.dashT<=0&&Math.floor(runT*18)%2)ctx.globalAlpha=.45;
  if(P.orbN){for(let i=0;i<P.orbN;i++){const a=P.orbA+i*TAU/P.orbN,bx=x+Math.cos(a)*64,by=y+Math.sin(a)*64*.85;ctx.save();ctx.translate(bx,by);ctx.rotate(a*3);ctx.fillStyle=P.fu.has('halo')?'#fff3a0':'#dfe6f2';for(let k=0;k<2;k++){ctx.beginPath();ctx.moveTo(0,-13);ctx.quadraticCurveTo(12,0,0,13);ctx.quadraticCurveTo(4,0,0,-13);ctx.fill();ctx.rotate(Math.PI)}ctx.fillStyle='#8b90a0';ctx.beginPath();ctx.arc(0,0,3,0,TAU);ctx.fill();ctx.restore()}}
  if(P.whirlT>0){const a=P.whirlT<.5?(Math.floor(runT*12)%2?.3:.7):.7;ctx.save();ctx.strokeStyle=`rgba(255,150,120,${a})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y-2,34,0,TAU);ctx.stroke();ctx.fillStyle=`rgba(255,140,110,${a*.22})`;ctx.fill();ctx.strokeStyle=`rgba(255,235,220,${a*.8})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y-2,34,-2.4+runT*6,-1.4+runT*6);ctx.stroke();ctx.restore()}
  if(P.whirlT>0){ctx.save();ctx.translate(x,y);ctx.rotate(runT*18);ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,120,100,.35)';ctx.lineWidth=16;ctx.beginPath();ctx.arc(0,0,70,0,TAU*.7);ctx.stroke();for(let i=0;i<3;i++){ctx.rotate(TAU/3);ctx.fillStyle='#dfe6f2';ctx.beginPath();ctx.moveTo(78,-6);ctx.quadraticCurveTo(98,0,78,10);ctx.lineTo(70,2);ctx.fill()}ctx.restore()}
  {const pc=(P.pal&&P.pal.hi)||CLASSES[P.cls].hi,ga=ctx.globalAlpha;ctx.globalAlpha=1;ctx.strokeStyle='rgba(8,4,10,.6)';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(x,y+15,22,8,0,0,TAU);ctx.stroke();ctx.strokeStyle=pc;ctx.lineWidth=2.5;ctx.stroke();
    const cy=y-46+Math.sin(runT*5)*2;ctx.fillStyle=pc;ctx.strokeStyle='rgba(8,4,10,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-7,cy-6);ctx.lineTo(x+7,cy-6);ctx.lineTo(x,cy+3);ctx.closePath();ctx.fill();ctx.stroke();ctx.globalAlpha=ga}
  drawHero(ctx,x,y,P.cls,{pal:P.pal,walk:P.walk,pull:P.pull,t:runT,noAxe:P.cls==='berserker'&&(P.C.w!=='axe'||projs.some(a=>a.k==='axe'))});
  if(P.shieldT>0){const a=P.shieldT<1.5?(Math.floor(runT*10)%2?.25:.6):.55;ctx.globalAlpha=1;ctx.strokeStyle=`rgba(127,231,255,${a})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y-2,30,0,TAU);ctx.stroke();ctx.fillStyle=`rgba(127,231,255,${a*.2})`;ctx.fill()}
  ctx.restore();
  if(P.wispN){const n=P.fu.has('swarm')?3:1;ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<n;k++){const a=runT*2+k*TAU/3,wx=x+Math.cos(a)*38,wy=y-22+Math.sin(a)*14;ctx.drawImage(glow('#7fe7ff',1),wx-16,wy-16,32,32)}ctx.restore()}
  {let md=1e9;for(const b of ebul){const d=(b.x-x)**2+(b.y-y)**2;if(d<md)md=d}const ha=clamp(1-(Math.sqrt(md)-30)/150,0,1);if(ha>0){ctx.globalAlpha=ha;ctx.fillStyle='#fff';ctx.strokeStyle='#14050b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,5,0,TAU);ctx.fill();ctx.stroke();ctx.globalAlpha=1}}
  const hw=40;ctx.fillStyle='rgba(0,0,0,.6)';rr(x-hw/2-2,y+24,hw+4,8,4);ctx.fill();ctx.fillStyle=P.hp<P.maxHp*.3?'#ff4d6d':'#4be07a';rr(x-hw/2,y+26,Math.max(0,hw*P.hp/P.maxHp),4,2);ctx.fill();
  if(P.dashCd>0){ctx.fillStyle='rgba(127,231,255,.7)';ctx.fillRect(x-hw/2,y+33,hw*(1-P.dashCd/P.dashMax),2)}
}
function drawProjs(){
  const groups=new Map();ctx.save();ctx.lineCap='round';
  for(const a of projs){if(a.k==='arrow'||a.k==='rain'){let g=groups.get(a.col);if(!g){g=[];groups.set(a.col,g)}g.push(a)}}
  for(const [col,arr] of groups){
    ctx.globalCompositeOperation='lighter';ctx.strokeStyle=col;ctx.globalAlpha=.28;ctx.lineWidth=arr[0].sz*1.6;ctx.beginPath();
    for(const a of arr){const sp=Math.hypot(a.vx,a.vy)||1,ux=a.vx/sp,uy=a.vy/sp;ctx.moveTo(a.x,a.y);ctx.lineTo(a.x-ux*a.sz*11,a.y-uy*a.sz*11)}ctx.stroke();
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.strokeStyle='#e8d6b0';ctx.lineWidth=Math.max(1.6,arr[0].sz*.45);ctx.beginPath();
    for(const a of arr){const sp=Math.hypot(a.vx,a.vy)||1,ux=a.vx/sp,uy=a.vy/sp;ctx.moveTo(a.x,a.y);ctx.lineTo(a.x-ux*a.sz*6,a.y-uy*a.sz*6)}ctx.stroke();
    ctx.fillStyle=col;ctx.beginPath();
    for(const a of arr){const sp=Math.hypot(a.vx,a.vy)||1,ux=a.vx/sp,uy=a.vy/sp,s=a.sz;ctx.moveTo(a.x+ux*s*1.6,a.y+uy*s*1.6);ctx.lineTo(a.x-uy*s*.9,a.y+ux*s*.9);ctx.lineTo(a.x+uy*s*.9,a.y-ux*s*.9);ctx.closePath();
      const tx=a.x-ux*s*6,ty=a.y-uy*s*6;ctx.moveTo(tx,ty);ctx.lineTo(tx-ux*s*1.8-uy*s*.9,ty-uy*s*1.8+ux*s*.9);ctx.lineTo(tx-ux*s*1.2,ty-uy*s*1.2);ctx.lineTo(tx-ux*s*1.8+uy*s*.9,ty-uy*s*1.8-ux*s*.9);ctx.closePath()}
    ctx.fill();
  }
  ctx.globalCompositeOperation='lighter';
  for(const a of projs){
    if(a.k==='bullet'){const sp=Math.hypot(a.vx,a.vy)||1,ux=a.vx/sp,uy=a.vy/sp;ctx.strokeStyle=a.col;ctx.globalAlpha=.7;ctx.lineWidth=a.sz*1.3;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x-ux*16,a.y-uy*16);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=a.sz*.5;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x-ux*6,a.y-uy*6);ctx.stroke()}
    else if(a.k==='orb'||a.k==='wbolt'){const r=a.sz*(a.k==='orb'?1.9:1.6);ctx.globalAlpha=.78;ctx.drawImage(glow(a.col),a.x-r,a.y-r,r*2,r*2)}
    else if(a.k==='spear'){const sp=Math.hypot(a.vx,a.vy)||1,ux=a.vx/sp,uy=a.vy/sp;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.strokeStyle='#8a5a30';ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(a.x-ux*6,a.y-uy*6);ctx.lineTo(a.x-ux*44,a.y-uy*44);ctx.stroke();ctx.fillStyle=P.elem?ELEMCOL[P.elem]:'#dfe6f2';ctx.beginPath();ctx.moveTo(a.x+ux*8,a.y+uy*8);ctx.lineTo(a.x-uy*5-ux*6,a.y+ux*5-uy*6);ctx.lineTo(a.x+uy*5-ux*6,a.y-ux*5-uy*6);ctx.closePath();ctx.fill();ctx.globalCompositeOperation='lighter'}
    else if(a.k==='lance'){const sp=Math.hypot(a.vx,a.vy)||1,ux=a.vx/sp,uy=a.vy/sp;ctx.globalAlpha=.5;ctx.strokeStyle=a.col;ctx.lineWidth=a.sz*2.2;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x-ux*70,a.y-uy*70);ctx.stroke();ctx.globalAlpha=1;ctx.strokeStyle='#fff';ctx.lineWidth=a.sz*.7;ctx.stroke()}
  }
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  for(const a of projs){if(a.k==='rocket'){const an=Math.atan2(a.vy,a.vx);ctx.save();ctx.translate(a.x,a.y);ctx.rotate(an);ctx.globalCompositeOperation='lighter';ctx.drawImage(glow('#ff8a3d',.8),-26,-9,18,18);ctx.globalCompositeOperation='source-over';ctx.fillStyle='#dfe6f2';ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(4,-4);ctx.lineTo(-8,-4);ctx.lineTo(-8,4);ctx.lineTo(4,4);ctx.closePath();ctx.fill();ctx.fillStyle='#ff6b3d';ctx.fillRect(-10,-6,4,12);ctx.restore()}
    else if(a.k==='disc'){ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.t*20);const s=a.sz;ctx.fillStyle=P.elem?ELEMCOL[P.elem]:'#dfe6f2';for(let i=0;i<6;i++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(s*.5,-s*.35);ctx.lineTo(s*1.25,0);ctx.lineTo(s*.5,s*.35);ctx.fill()}ctx.strokeStyle='#8b90a0';ctx.lineWidth=s*.35;ctx.beginPath();ctx.arc(0,0,s*.6,0,TAU);ctx.stroke();ctx.restore()}}
  for(const a of projs){if(a.k!=='axe')continue;ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.t*22);const s=a.sz/10;ctx.scale(s,s);ctx.strokeStyle='#6b4423';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(12,0);ctx.stroke();ctx.fillStyle=a.col==='#dfe6f2'?'#dfe6f2':a.col;ctx.beginPath();ctx.moveTo(8,-2);ctx.quadraticCurveTo(22,-14,20,4);ctx.quadraticCurveTo(14,2,8,6);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(-8,2);ctx.quadraticCurveTo(-22,14,-20,-4);ctx.quadraticCurveTo(-14,-2,-8,-6);ctx.closePath();ctx.fill();ctx.restore()}
  ctx.restore();
}
function drawBullets(){ctx.save();for(const b of ebul){
  if(b.skull){ctx.globalCompositeOperation='lighter';const r2=b.r*2.4;ctx.drawImage(glow('#ff6b3d',.5),b.x-r2,b.y-r2,r2*2,r2*2);ctx.globalCompositeOperation='source-over';ctx.save();ctx.translate(b.x,b.y);skull(ctx,b.r,b.pink?'#ff9be6':'#e8e0cc');ctx.fillStyle='#ff3b4f';ctx.beginPath();ctx.arc(-b.r*.27,-b.r*.1,b.r*.1,0,TAU);ctx.arc(b.r*.27,-b.r*.1,b.r*.1,0,TAU);ctx.fill();ctx.restore();continue}
  if(b.bone){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(runT*8+b.x);if(b.pink){ctx.globalCompositeOperation='lighter';ctx.drawImage(glow('#ff6bd6',.6),-22,-22,44,44);ctx.globalCompositeOperation='source-over'}ctx.fillStyle=b.pink?'#ff9be6':'#efe6d2';ctx.strokeStyle='#6b6250';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(-10,-3,20,6,3);ctx.fill();ctx.stroke();for(const s of[-1,1]){ctx.beginPath();ctx.arc(s*10,-3,3.5,0,TAU);ctx.arc(s*10,3,3.5,0,TAU);ctx.fill()}ctx.restore();continue}
  if(b.key){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(runT*10);ctx.globalCompositeOperation='lighter';ctx.drawImage(glow('#ff6bd6',.8),-24,-24,48,48);ctx.globalCompositeOperation='source-over';ctx.fillStyle='#ff9be6';ctx.strokeStyle='#8a1f6a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(-6,0,6,0,TAU);ctx.fill();ctx.stroke();ctx.fillRect(-1,-2.5,14,5);ctx.fillRect(8,2,3,5);ctx.fillRect(12,2,3,4);ctx.restore();continue}
  if(b.missile){const an=Math.atan2(b.vy,b.vx);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(an);ctx.globalCompositeOperation='lighter';ctx.drawImage(glow('#ff8a3d',.7),-30,-10,20,20);ctx.globalCompositeOperation='source-over';ctx.fillStyle=b.pink?'#ff6bd6':'#c9cdd8';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(4,-5);ctx.lineTo(-10,-5);ctx.lineTo(-10,5);ctx.lineTo(4,5);ctx.closePath();ctx.fill();ctx.fillStyle='#d91e3a';ctx.fillRect(-12,-7,5,14);ctx.restore();continue}
  const c=b.pink?'#ff6bd6':b.col||(b.wave?'#ffab2e':'#ff3b4f');ctx.globalCompositeOperation='lighter';const r2=b.r*2.3;ctx.drawImage(glow(c,.7),b.x-r2,b.y-r2,r2*2,r2*2);ctx.globalCompositeOperation='source-over';ctx.fillStyle=b.pink?'#fff':'#14050b';ctx.beginPath();ctx.arc(b.x,b.y,b.r+2.5,0,TAU);ctx.fill();ctx.fillStyle=c;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r*.42,0,TAU);ctx.fill()}ctx.restore()}
function drawNades(){for(const n of nades){const p=n.t/n.T;ctx.fillStyle=`rgba(255,60,60,${.2+.3*p})`;ctx.beginPath();ctx.arc(n.tx,n.ty,140*p,0,TAU);ctx.fill();ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(n.x,n.y+Math.sin(p*Math.PI)*90,8,4,0,0,TAU);ctx.fill();ctx.fillStyle='#3a3a46';ctx.beginPath();ctx.arc(n.x,n.y,8,0,TAU);ctx.fill();ctx.fillStyle=Math.floor(runT*20)%2?'#ffe066':'#ff4d1f';ctx.beginPath();ctx.arc(n.x+3,n.y-7,3,0,TAU);ctx.fill()}}
function drawParts(){
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const p of parts){if(p.k!==0)continue;ctx.globalAlpha=Math.max(0,p.l/p.m);ctx.fillStyle=p.c;ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}
  for(const p of parts){if(p.k!==1)continue;const t=1-p.l/p.m;ctx.globalAlpha=Math.max(0,p.l/p.m);ctx.strokeStyle=`rgb(${p.c})`;ctx.lineWidth=p.w*(1-t)+1;ctx.beginPath();ctx.arc(p.x,p.y,p.s*(.3+t*.8),0,TAU);ctx.stroke()}
  ctx.globalCompositeOperation='source-over';
  for(const p of parts){if(p.k===2){ctx.globalAlpha=Math.max(0,p.l/p.m)*.45;ctx.fillStyle=`rgb(${p.c})`;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,TAU);ctx.fill()}else if(p.k===3){ctx.globalAlpha=Math.max(0,p.l/p.m);ctx.fillStyle=p.c;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);ctx.restore()}}
  ctx.restore();
}
function drawBolts(){ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineJoin='round';for(const b of bolts){const a=b.l/b.m;ctx.strokeStyle=b.c;ctx.globalAlpha=a*.5;ctx.lineWidth=b.w*3;ctx.beginPath();b.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.globalAlpha=a;ctx.strokeStyle='#fff';ctx.lineWidth=b.w*.7;ctx.stroke()}ctx.restore()}
function drawNums(){ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';for(const n of nums){const t=n.l/n.m,s=n.s*(t>.8?1+(t-.8)*2:1);ctx.globalAlpha=Math.min(1,t*2);ctx.font=`900 ${s}px ${FONT}`;ctx.lineWidth=4;ctx.strokeStyle='rgba(20,8,12,.85)';ctx.strokeText(n.v,n.x,n.y);ctx.fillStyle=n.c;ctx.fillText(n.v,n.x,n.y)}ctx.restore()}
function drawPops(){ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';for(const p of pops){const t=p.l/p.m,e=t>.85?1+(t-.85)*3:1;ctx.globalAlpha=Math.min(1,t*2.5);ctx.save();ctx.translate(clamp(p.x,150,W-150),clamp(p.y,120,H-120));ctx.scale(e,e);const fs=fitFont(p.t,W-80,p.s);ctx.lineWidth=7;ctx.strokeStyle='rgba(15,8,12,.9)';ctx.strokeText(p.t,0,0);ctx.fillStyle=p.c;ctx.fillText(p.t,0,0);
  if(p.sub){ctx.font='900 14px '+BFONT;ctx.lineWidth=4;ctx.strokeText(p.sub.toUpperCase(),0,fs*.78,W-60);ctx.fillStyle=p.subc||'#fff';ctx.fillText(p.sub.toUpperCase(),0,fs*.78,W-60)}ctx.restore()}ctx.restore()}

/* ================= HUD ================= */
function hud(){
  $('#lvl').textContent='Lv '+P.level;$('#xpb').style.width=(100*P.xp/P.xpNeed)+'%';
  $('#stg').textContent='Stage '+stage;$('#stb').style.width=(bossE?100:100*Math.min(1,stageT/STAGE_LEN))+'%';
  $('#mmark').style.left=(100*MINI_AT/STAGE_LEN)+'%';$('#mmark').style.opacity=miniDone?.3:1;
  $('#scr').innerHTML=fmt(score)+(P.scoreM>1.01?`<small>score x${P.scoreM.toFixed(2).replace(/\.?0+$/,'')}</small>`:'');
  const B=bossE||miniE;if(B)$('#bossb').style.width=(100*Math.max(0,B.hp/B.max))+'%';
  const b=[];const add=(t,max,lbl,c)=>{if(t>0)b.push(`<div class="chip" style="color:${c}"><b style="background:${c}"></b><span style="color:#f5efe4">${lbl}</span><em><i style="width:${100*Math.min(1,t/max)}%"></i></em></div>`)};
  add(P.shieldT,5,'Shield','#5fb8ff');add(P.rapidT,6,'Rapid attack','#ffd166');add(P.stormT,3+.5*lv('power'),'Arrow Rain','#8fe3ff');add(P.whirlT,2+.3*lv('power'),'Whirlwind','#ff7a6b');add(P.magnetT,8,'Magnet','#ff7a9a');add(freezeAll,3,'Freeze','#8fe3ff');if(B&&B.type==='golem'&&B.vent>0)add(B.vent,2.8,'Core open','#ffb020');
  $('#buffs').innerHTML=b.join('');
  const tags=[];for(const k of P.cu)tags.push(`<span class="tag c">${CU[k].n}</span>`);for(const k of P.fu)tags.push(`<span class="tag f">${FU[k].n}</span>`);for(const k of P.re)tags.push(`<span class="tag r">${RE[k].n}</span>`);
  const th=tags.join('');if($('#tags').dataset.h!==th){$('#tags').innerHTML=th;$('#tags').dataset.h=th}
  $('#stats').innerHTML=`<b class="gold">${P.gold}</b> gold · <b>${P.projN}</b> ${projWord(P.projN)} · <b>${fmt(baseDmg())}</b> dmg · <b>${(1/fireInterval()).toFixed(1)}</b>/s`;
  const ot=objText();const oe=$('#obj');if(oe.textContent!==ot)oe.textContent=ot;
  const c=$('#combo');if(combo>=10){c.innerHTML=`<span class="n">${combo}</span><span class="t">combo</span>`;c.style.opacity=1}else c.style.opacity=0;
  setAct($('#btnSkill'),P.skCd,P.skMax);setAct($('#btnDash'),P.dashCd,P.dashMax);
}
function setAct(el,cd,max){const p=cd>0?100*cd/max:0;el.querySelector('.cd').style.setProperty('--p',p);el.classList.toggle('ready',p<=0)}

/* ================= overlays ================= */
function hideOv(){for(const id of['ovTitle','ovClass','ovLevel','ovPause','ovOver','ovX'])$('#'+id).hidden=true}
function renderDiffs(){const box=$('#diffs');box.innerHTML='';for(const k in DIFF){const b=document.createElement('button');b.className='dbtn'+(k==='nightmare'?' nm':'');b.textContent=DIFF[k].n;b.setAttribute('aria-pressed',k===diff?'true':'false');b.onclick=()=>{diff=k;D=DIFF[k];try{STORE.set('vg_diff',k)}catch(e){}renderDiffs();renderClasses();hdrBest()};box.appendChild(b)}$('#diffD').textContent=DIFF[diff].d}
const bestKey=c=>c+'_'+diff;
function showClass(){state='class';hideOv();$('#ovClass').hidden=false;$('#hud').hidden=true;if(!unlocked('mode',selMode))selMode='gauntlet';renderModes();renderDiffs();renderClasses();setTimeout(()=>$('#btnStart').focus({preventScroll:true}),50)}
function renderModes(){const box=$('#modes');box.innerHTML='';for(const k in MODES){const u=unlocked('mode',k);const b=document.createElement('button');b.className='dbtn';b.textContent=MODES[k].n;b.disabled=!u;b.setAttribute('aria-pressed',k===selMode?'true':'false');b.onclick=()=>{selMode=k;S.sel.mode=k;saveGame();renderModes();renderDiffs();renderClasses()};box.appendChild(b)}
  let d=MODES[selMode].d;for(const k in MODES)if(!unlocked('mode',k)&&k!==selMode)d+=` ${MODES[k].n} unlocks when you: ${lockHint('mode:'+k).toLowerCase()}`;$('#modeD').textContent=d;
  const daily=selMode==='daily';$('#diffs').hidden=daily;$('#diffD').hidden=daily}
let lockPick=null;
function renderClasses(){
  const box=$('#classes');box.innerHTML='';const daily=selMode==='daily',ds=daily?dailySpec():null;if(daily){selCls=ds.cls}
  for(const k in CLASSES){const C=CLASSES[k],ml=mLevel(k),xp=S.mastery[k]||0,nx=MLV[Math.min(ml+1,MLV.length-1)],pv=MLV[ml],pc=ml>=MLV.length-1?100:Math.round(100*(xp-pv)/(nx-pv));
    const b=document.createElement('button');b.className='cls'+(ml>=5?' gold':'');b.setAttribute('aria-pressed',k===selCls?'true':'false');b.setAttribute('aria-label',C.n);if(daily&&k!==selCls)b.disabled=true;
    b.innerHTML=`<canvas width="200" height="120"></canvas><b>${C.n}</b><span class="mb"><i style="width:${pc}%"></i></span>`;
    const g=b.querySelector('canvas').getContext('2d');g.scale(2,2);g.fillStyle='#211b29';g.fillRect(0,0,100,60);drawHero(g,50,38,k,{pal:daily?null:skinOf(k,S.skin[k]||0)});
    b.onclick=()=>{if(daily)return;selCls=k;S.sel.cls=k;lockPick=null;saveGame();renderClasses();setTimeout(()=>{const f=document.querySelector('#classes .cls[aria-pressed="true"]');if(f)f.focus({preventScroll:true})},0)};box.appendChild(b)}
  const k=selCls,C=CLASSES[k],ml=mLevel(k),wi=daily?0:weapOf(k),wd=WEAPS[k][wi].wd||C.wd,bk=k+'_'+(daily?'hard':diff);
  $('#clsInfo').innerHTML=`<div class="ch"><b>${C.n}</b><span class="ml">Mastery ${ml}${ml<MLV.length-1?' · next: '+MREW[ml+1]:''}</span></div><p>${wd}</p><p class="sk">${C.sd}</p><span class="hp">${Math.round((C.hp+(ml>=2?10:0))*DIFF[daily?'hard':diff].pHp)} HP${S.stats.best[bk]?' · Best '+fmt(S.stats.best[bk]):''}</span>`;
  renderLoadout();
}
function renderLoadout(){const box=$('#loadout');const k=selCls;box.innerHTML='';
  if(selMode==='daily'){const ds=dailySpec(),bestT=(S.daily[ds.key]||[])[0];box.innerHTML=`<div class="dnote">Today (${ds.key}): ${CLASSES[ds.cls].n} on Hard. ${ds.mods.map(m=>DMODS[m].n+': '+DMODS[m].d).join(' ')}${bestT?` Your best today: ${fmt(bestT.s)}.`:''}</div>`;return}
  const r1=document.createElement('div');r1.className='lr';r1.innerHTML='<span>Weapon</span>';
  const locked=WEAPS[k].map((wp,v)=>weapOk(k,v)?-1:v).filter(v=>v>=0);if(lockPick==null||!locked.includes(lockPick))lockPick=locked[0]??null;
  WEAPS[k].forEach((wp,v)=>{const lk=!weapOk(k,v),bt=document.createElement('button');bt.className='lbtn'+(lk?' lk':'');if(lk)bt.innerHTML=`<svg viewBox="0 0 10 12" width="9" height="11" aria-hidden="true"><path d="M2.5 5V3.5a2.5 2.5 0 0 1 5 0V5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="1" y="5" width="8" height="6.5" rx="1.5" fill="currentColor"/></svg> ${wp.wn}`;else bt.textContent=wp.wn;bt.setAttribute('aria-pressed',!lk&&weapOf(k)===v?'true':'false');if(lk){bt.title='Locked';bt.classList.toggle('pick',v===lockPick)}
    bt.onclick=()=>{if(lk){lockPick=v;renderLoadout();return}S.weapon[k]=v;saveGame();renderClasses()};r1.appendChild(bt)});
  box.appendChild(r1);
  if(lockPick!=null){const n=document.createElement('div');n.className='dnote';n.textContent=`To unlock ${WEAPS[k][lockPick].wn}: ${weapHint(k,lockPick).replace(/^./,c=>c.toLowerCase())}`;box.appendChild(n)}
  const cur=S.skin[k]||0,opts=[];[0,1,2,3].forEach(i=>{if(i===3&&!unlocked('skin','gold'))return;if(skinOk(k,i))opts.push([i,['Default','Skin 1','Skin 2','Gold'][i],(skinOf(k,i)||CLASSES[k]).col])});BUYSKINS.forEach((b,j)=>{if(skinOk(k,j+4))opts.push([j+4,b.n,b.pal.prism?'conic-gradient(#ff5c8a,#ffd166,#7dffb0,#7fe7ff,#c28bff,#ff5c8a)':b.pal.col])});
  const r2=document.createElement('div');r2.className='lr';const curN=(opts.find(o=>o[0]===cur)||opts[0])[1];r2.innerHTML=`<span>Skin</span>`;
  for(const [i,n,c] of opts){const bt=document.createElement('button');bt.className='sw';bt.title=n;bt.setAttribute('aria-label',n);bt.style.background=c;bt.setAttribute('aria-pressed',cur===i?'true':'false');bt.onclick=()=>{S.skin[k]=i;saveGame();renderClasses()};r2.appendChild(bt)}
  const nm=document.createElement('em');nm.className='swn';nm.textContent=curN;r2.appendChild(nm);box.appendChild(r2)}
function iconCanvas(k){const c=document.createElement('canvas');c.width=108;c.height=108;const g=c.getContext('2d');g.translate(54,54);drawIcon(g,k,38);return c}
function buildOffer(){
  const n=P.cu.has('greed')?4:3,out=[];
  const fus=Object.keys(FU).filter(f=>{const F=FU[f];return!P.fu.has(f)&&(P.sk[F.a]||0)>0&&(P.sk[F.b]||0)>0&&(P.sk[F.a]+P.sk[F.b])>=3});
  if(fus.length&&Math.random()<.75)out.push({t:'fuse',k:pick(fus)});
  const cs=Object.keys(CU).filter(c=>!P.cu.has(c)&&unlocked('curse',c));
  if(cs.length&&P.level>=3&&Math.random()<.4)out.push({t:'curse',k:pick(cs)});
  const pool=Object.keys(SK).filter(k=>(P.sk[k]||0)<SK[k].max&&!P.fused.has(k)&&unlocked('skill',k));
  while(out.length<n&&pool.length)out.push({t:'skill',k:pool.splice(Math.floor(Math.random()*pool.length),1)[0]});
  return shuffle(out);
}
function renderCards(list,relic){
  const box=$('#cards');box.innerHTML='';
  list.forEach((o,i)=>{const b=document.createElement('button');b.className='card'+(o.t==='curse'?' curse':o.t==='fuse'?' fuse':o.t==='relic'?' relic':'');b.id='card'+i;
    let name,tag,desc;
    if(o.t==='skill'){const lvN=P.sk[o.k]||0;name=SK[o.k].n;tag=`<span class="lv ${lvN?'':'new'}">${lvN?'Lv '+(lvN+1):'New'}</span>`;desc=SK[o.k].d}
    else if(o.t==='fuse'){const F=FU[o.k];name=F.n;tag='<span class="lv fu">Fusion</span>';desc=`Uses up ${SK[F.a].n} and ${SK[F.b].n}. ${F.d}`}
    else if(o.t==='curse'){const c=CU[o.k];name=c.n;tag='<span class="lv cu">Curse</span>';desc=`<span class="up">${c.up}.</span> <span class="dn">${c.dn}.</span> Score +25%.`}
    else{name=RE[o.k].n;tag='<span class="lv re">Relic</span>';desc=RE[o.k].d}
    b.appendChild(iconCanvas(o.k));const d=document.createElement('div');d.innerHTML=`<b>${name}</b>${tag}<p>${desc}</p>`;b.appendChild(d);
    const kb=document.createElement('span');kb.className='key';kb.textContent=i+1;b.appendChild(kb);
    b.onclick=()=>relic?chooseRelic(i):chooseCard(i);box.appendChild(b)});
  setTimeout(()=>{const c=$('#card0');if(c)c.focus({preventScroll:true})},50);
}
function openLevel(){
  state='levelup';offerList=buildOffer();$('#lvTitle').textContent='Level '+P.level;$('#lvSub').textContent=P.cu.has('greed')?'Pick one of four.':'Pick one.';
  $('#btnReroll').parentElement.hidden=false;$('#btnReroll').textContent=`Reroll (${P.rerolls})`;$('#btnReroll').disabled=P.rerolls<=0;$('#btnSkip').textContent=`Skip and heal ${Math.round(20*P.healM)}%`;
  renderCards(offerList,false);$('#ovLevel').hidden=false;sfx.level();
}
function afterPick(){if(pendingLv>0){openLevel()}else if(pendingRelic){pendingRelic=false;openRelic()}else if(resumeFn){const f=resumeFn;resumeFn=null;$('#ovLevel').hidden=true;f()}else{state='play';$('#ovLevel').hidden=true;P.iframe=Math.max(P.iframe,.8);last=performance.now()}}
function chooseCard(i){
  if(state!=='levelup')return;const o=offerList[i];if(!o)return;pendingLv--;
  if(o.t==='skill'){P.sk[o.k]=(P.sk[o.k]||0)+1;if(ELEMN[o.k])P.elem=o.k;recalc();if(o.k==='vital')heal(P.maxHp*.25);pop(SK[o.k].n,P.x,P.y-70,'#ffd166',32);spark(P.x,P.y,'#ffd166',30,300,.6,3)}
  else if(o.t==='fuse'){const F=FU[o.k];P.fu.add(o.k);S.codex.fuse[o.k]=1;run.fusions++;if(run.fusions>=3)ach('fuse3');P.fused.add(F.a);P.fused.add(F.b);P.sk[F.a]=0;P.sk[F.b]=0;if(ELEMN[F.a])P.elem=F.a;recalc();pop(F.n,P.x,P.y-70,'#d6c2ff',34,'fusion');sfx.fuse();flashA=.4;flashCol='181,139,255';ringFx(P.x,P.y,'181,139,255',120,.5,6);spark(P.x,P.y,'#d6c2ff',40,380,.7,4)}
  else if(o.t==='curse'){P.cu.add(o.k);recalc();pop(CU[o.k].n,P.x,P.y-70,'#ff4d8a',32,'curse');sfx.curse();flashA=.3;flashCol='255,40,110'}
  afterPick();
}
function reroll(){if(state!=='levelup'||P.rerolls<=0)return;P.rerolls--;offerList=buildOffer();$('#btnReroll').textContent=`Reroll (${P.rerolls})`;$('#btnReroll').disabled=P.rerolls<=0;renderCards(offerList,false)}
function skipCard(){if(state!=='levelup')return;pendingLv--;heal(P.maxHp*.2);pop('Healed',P.x,P.y-70,'#4be07a',30);afterPick()}
function openRelic(){
  const pool=Object.keys(RE).filter(k=>!P.re.has(k)&&unlocked('relic',k));if(!pool.length){afterPick();return}
  state='relic';relicList=shuffle(pool).slice(0,3).map(k=>({t:'relic',k}));
  $('#lvTitle').textContent='Pick a relic';$('#lvSub').textContent='Relics last the whole run.';$('#btnReroll').parentElement.hidden=true;
  renderCards(relicList,true);$('#ovLevel').hidden=false;sfx.fuse();
}
function chooseRelic(i){if(state!=='relic')return;const o=relicList[i];if(!o)return;P.re.add(o.k);S.codex.relic[o.k]=1;if(o.k==='clover')P.rerolls+=3;recalc();pop(RE[o.k].n,P.x,P.y-70,'#ffd166',32,'relic');state='levelup';afterPick()}
function buildTags(){const t=[];for(const k in P.sk)if(P.sk[k])t.push(`<span class="tag">${SK[k].n} ${P.sk[k]}</span>`);for(const k of P.fu)t.push(`<span class="tag f">${FU[k].n}</span>`);for(const k of P.cu)t.push(`<span class="tag c">${CU[k].n}</span>`);for(const k of P.re)t.push(`<span class="tag r">${RE[k].n}</span>`);return t.join('')||'<span class="tag">No skills yet</span>'}
function pause(){if(state!=='play')return;state='paused';$('#build').innerHTML=buildTags();$('#ovPause').hidden=false;$('#btnResume').focus({preventScroll:true})}
function resume(){if(state!=='paused')return;state='play';$('#ovPause').hidden=true;last=performance.now()}
function startRun(){
  const mode=selMode;let cls=selCls;
  run=newRun(mode);if(mode==='daily'){cls=run.daily.cls;run.prevDiff=diff;diff='hard'}run.parts={};D=DIFF[diff];audioInit();
  setBiome(mode==='rush'?'dungeon':'dungeon');reset(cls);applyMeta();
  state='play';hideOv();$('#hud').hidden=false;$('#skName').textContent=CLASSES[cls].skN;
  if(mode==='rush'){stageT=STAGE_LEN;miniDone=true;dir.seq=[]}
  hud();banner(mode==='rush'?`Boss Rush<small>${CLASSES[cls].n} on ${D.n}.</small>`:`Dungeon<small>Stage 1. ${CLASSES[cls].n} on ${D.n}${mode==='daily'?', daily run':''}.</small>`,'#ffc93c');
  emitRun('run-start');last=performance.now();
}
function start(){startRun()}
function die(){if(state!=='play')return;state='dying';dyingT=1.3;tTarget=.2;tHold=9;const c=CLASSES[P.cls];spark(P.x,P.y,c.hi,40,320,.8,4);shards(P.x,P.y,c.col,20);ringFx(P.x,P.y,'255,255,255',80,.4,6);sfx.boom()}
function gameOver(){
  state='over';musSting('over');const r=endRun();const bk=bestKey(P.cls);
  $('#overT').textContent=`Stage ${stage} reached`;
  const m=Math.floor(runT/60),s=Math.floor(runT%60);
  $('#overKV').innerHTML=`<dt>Hero</dt><dd>${CLASSES[P.cls].n}</dd><dt>Mode</dt><dd>${MODES[run.mode].n}, ${D.n}</dd><dt>Score</dt><dd class="${r.nb?'hi':''}">${fmt(score)}${r.nb?' (new best)':''}</dd><dt>Best</dt><dd>${fmt(S.stats.best[bk]||0)}</dd><dt>Kills</dt><dd>${kills}</dd><dt>Boss grades</dt><dd>${run.grades.join(' ')||'none'}</dd><dt>Embers</dt><dd class="emb">+${r.e}</dd><dt>Mastery</dt><dd>+${r.mx}${r.lvUp?' (level '+r.lvUp+')':''}</dd><dt>Time</dt><dd>${m}:${String(s).padStart(2,'0')}</dd>`;
  let nb=buildTags();if(run.newAch.length)nb+=run.newAch.map(k=>`<span class="tag r">Feat: ${ACH[k].n}</span>`).join('');
  $('#overBuild').innerHTML=nb;$('#ovOver').hidden=false;emitRun('run-end','death');setTimeout(()=>$('#btnAgain').focus({preventScroll:true}),50);
}

/* ================= loop ================= */
let last=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  let dt=clamp((now-last)/1000,0,.05);last=Math.max(last,now);pollPad(dt);musUpdate(dt);
  if(state==='play'||state==='dying'){
    if(tHold>0){tHold-=dt;if(tHold<=0)tTarget=1}
    tScale+=(tTarget-tScale)*Math.min(1,dt*6);const sdt=dt*tScale;
    if(state==='dying'){dyingT-=dt;updateFx(sdt);if(dyingT<=0)gameOver()}else update(sdt);
  }else if(['title','class','forge','codex','save'].includes(state)){scrollY+=SCROLL*dt;nextTorch-=SCROLL*dt;if(nextTorch<=0){nextTorch=rnd(260,360);decor.push({k:'torch',side:Math.random()<.5?-1:1,y:-40,f:rnd(0,9)})}for(const d of decor)d.y+=SCROLL*dt;decor=decor.filter(d=>d.y<H+60)}
  render();
}

/* ================= input ================= */
const stageEl=$('#stage');let drag=null,lastTap=0,lastTapX=0,lastTapY=0;
let lastFlick=0;
stageEl.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;audioInit();if(state!=='play')return;
  if(drag&&e.pointerId!==drag.id){dash();return}
  const now=performance.now();if(now-lastTap<280&&Math.hypot(e.clientX-lastTapX,e.clientY-lastTapY)<60*VS)dash();lastTap=now;lastTapX=e.clientX;lastTapY=e.clientY;
  if(!drag){drag={id:e.pointerId,x:e.clientX,y:e.clientY,s:[{t:now,x:e.clientX,y:e.clientY}]};try{stageEl.setPointerCapture(e.pointerId)}catch(_){}}});
stageEl.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id||state!=='play')return;const dx=(e.clientX-drag.x)/VS,dy=(e.clientY-drag.y)/VS;drag.x=e.clientX;drag.y=e.clientY;P.tx+=dx*1.35;P.ty+=dy*1.35;
  // a fast flick of the dragging finger dashes in the flick's direction
  if(!OPT.flick||e.pointerType==='mouse')return;const now=performance.now();drag.s.push({t:now,x:e.clientX,y:e.clientY});while(drag.s.length>2&&now-drag.s[0].t>90)drag.s.shift();
  const a=drag.s[0],fx=e.clientX-a.x,fy=e.clientY-a.y,dist=Math.hypot(fx,fy)/VS,dt=Math.max(16,now-a.t);
  if(now-lastFlick>320&&dist>45&&dist/dt>1.8){lastFlick=now;P.lastDx=fx;P.lastDy=fy;dash();drag.s=[{t:now,x:e.clientX,y:e.clientY}]}});
const endDrag=e=>{if(drag&&e.pointerId===drag.id)drag=null};stageEl.addEventListener('pointerup',endDrag);stageEl.addEventListener('pointercancel',endDrag);
for(const [id,fn] of[['btnDash',()=>dash()],['btnSkill',()=>useSkill()]]){const b=$('#'+id);b.tabIndex=-1;b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();audioInit();fn()})}
const KM={arrowleft:'l',a:'l',arrowright:'r',d:'r',arrowup:'u',w:'u',arrowdown:'d',s:'d'};
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(state!=='play'&&state!=='dying'&&['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){e.preventDefault();navFocus(['arrowup','arrowleft','w','a'].includes(k)?-1:1);return}
  if(KM[k]){keys[KM[k]]=true;if(state==='play')e.preventDefault()}
  if((k===' '||k==='shift')&&state==='play'){e.preventDefault();dash()}
  if((k==='e'||k==='q')&&state==='play')useSkill();
  if(k==='p'||k==='escape'){if(state==='play')pause();else if(state==='paused')resume()}
  if(state==='levelup'&&['1','2','3','4'].includes(k))chooseCard(+k-1);
  if(state==='relic'&&['1','2','3'].includes(k))chooseRelic(+k-1);
  if(state==='levelup'&&k==='r')reroll();
  if(state==='class'&&['1','2','3','4'].includes(k)&&selMode!=='daily'){diff=Object.keys(DIFF)[+k-1];D=DIFF[diff];renderDiffs();renderClasses()}
  if(k==='escape'&&['forge','codex','save','class'].includes(state))toMenu();
});
addEventListener('keyup',e=>{const k=KM[e.key.toLowerCase()];if(k)keys[k]=false});
addEventListener('blur',()=>{keys={};pause()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
$('#btnPlay').onclick=showClass;$('#btnBack').onclick=toMenu;$('#btnStart').onclick=startRun;$('#btnForge').onclick=showForge;$('#btnCodex').onclick=()=>showCodex('en');$('#btnSave').onclick=showSave;
function hdrBest(){const bs=Object.keys(CLASSES).filter(k=>S.stats.best[bestKey(k)]);$('#bestT').innerHTML=`<span class="emb">${S.embers} Embers</span>`+(bs.length?` · Best on ${D.n}: `+bs.map(k=>CLASSES[k].n+' '+fmt(S.stats.best[bestKey(k)])).join(' · '):'')}
function toMenu(){if(run&&state!=='over'&&state!=='win'&&state!=='title'&&state!=='forge'&&state!=='codex'&&state!=='save'&&state!=='class'){emitRun('run-end','quit');endRun()}state='title';if(run&&run.prevDiff){diff=run.prevDiff;D=DIFF[diff]}run=null;hideOv();$('#hud').hidden=true;$('#bossbox').hidden=true;setBiome('dungeon');reset(P?P.cls:'ranger');$('#ovTitle').hidden=false;hdrBest();setTimeout(()=>$('#btnPlay').focus({preventScroll:true}),50)}
$('#btnMenu').onclick=toMenu;$('#btnMenu2').onclick=toMenu;
function navFocus(d){const ov=[...document.querySelectorAll('.ov:not([hidden])')].pop();if(!ov)return;const bs=[...ov.querySelectorAll('button:not([disabled])')];if(!bs.length)return;let i=bs.indexOf(document.activeElement);i=i<0?0:(i+d+bs.length)%bs.length;bs[i].focus({preventScroll:true})}
$('#btnAgain').onclick=startRun;$('#btnSwap').onclick=showClass;$('#btnResume').onclick=resume;$('#btnRestart').onclick=()=>{emitRun('run-end','quit');endRun();startRun()};
const shakeLbl=()=>{$('#btnShake').textContent='Screen shake: '+(shakeOn?'On':'Off')};shakeLbl();
$('#btnShake').onclick=()=>{shakeOn=!shakeOn;shake=0;shakeLbl();try{STORE.set('vg_shake',shakeOn?'on':'off')}catch(e){}};
const musLbl=()=>{$('#btnMusic').textContent='Music: '+(MU.on?'On':'Off')};musLbl();
$('#btnMusic').onclick=()=>{MU.on=!MU.on;musLbl();try{STORE.set('vg_music',MU.on?'on':'off')}catch(e){}};
const optLbl=()=>{$('#btnFlick').textContent='Flick to dash: '+(OPT.flick?'On':'Off');$('#btnAuto').textContent='Auto skill: '+(OPT.auto?'On':'Off');$('#btnSide').textContent='Buttons: '+(OPT.left?'Left':'Right');$('#btnBuzz').textContent='Vibration: '+(OPT.buzz?'On':'Off');$('#acts').classList.toggle('left',OPT.left)};optLbl();
for(const [id,k] of[['btnFlick','flick'],['btnAuto','auto'],['btnSide','left'],['btnBuzz','buzz']])$('#'+id).onclick=()=>{OPT[k]=!OPT[k];saveOpts();optLbl();if(k==='buzz')buzz(30)};
$('#btnReroll').onclick=reroll;$('#btnSkip').onclick=skipCard;
$('#btnPause').onclick=()=>{state==='play'?pause():resume()};
$('#btnMute').onclick=()=>{muted=!muted;$('#wav').style.display=muted?'none':'';try{STORE.set('vg_mute',muted?'1':'0')}catch(e){}};
try{if(STORE.get('vg_mute')==='1'){muted=true;$('#wav').style.display='none'}}catch(e){}
addEventListener('resize',resize);

/* ================= boot ================= */
loadSave();selMode=S.sel.mode||'gauntlet';selCls=S.sel.cls||'ranger';buildSprites();P=newPlayer('ranger');G=newG();resize();reset('ranger');hdrBest();
state='title';
setTimeout(()=>$('#btnPlay').focus({preventScroll:true}),100);
requestAnimationFrame(frame);
/* ================= v3 drawing ================= */
function drawWalls(){for(const w of walls){const y=w.y;ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(L,y+10,R-L,6);
  for(const [x0,x1] of[[L,w.gx-w.gw/2],[w.gx+w.gw/2,R]]){if(x1-x0<2)continue;ctx.fillStyle='#4d505c';ctx.fillRect(x0,y-4,x1-x0,8);ctx.fillStyle='#8b8f9e';ctx.fillRect(x0,y-4,x1-x0,2);for(let x=x0+6;x<x1-2;x+=16){ctx.fillStyle='#3a3d48';ctx.fillRect(x-3,y-16,6,32);ctx.fillStyle='#9ea3b3';ctx.fillRect(x-3,y-16,2,32);ctx.fillStyle='#c9cdd8';ctx.beginPath();ctx.moveTo(x-4,y+16);ctx.lineTo(x,y+23);ctx.lineTo(x+4,y+16);ctx.fill()}}
  ctx.strokeStyle='rgba(255,209,102,.5)';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(w.gx-w.gw/2,y);ctx.lineTo(w.gx+w.gw/2,y);ctx.stroke();ctx.setLineDash([])}}
function drawSqueeze(){if(squeeze<1)return;for(const s of[-1,1]){const x0=s<0?L:R-squeeze,x1=s<0?L+squeeze:R;const g=ctx.createLinearGradient(x0,0,x1,0);g.addColorStop(0,'#3a3d48');g.addColorStop(1,'#6b6f7d');ctx.fillStyle=g;ctx.fillRect(x0,0,x1-x0,H);
  const ex=s<0?x1:x0;ctx.fillStyle='#c9cdd8';for(let y=(scrollY%24)-24;y<H;y+=24){ctx.beginPath();ctx.moveTo(ex,y);ctx.lineTo(ex-s*12,y+12);ctx.lineTo(ex,y+24);ctx.fill()}ctx.fillStyle='rgba(255,40,60,.12)';ctx.fillRect(s<0?ex:ex-14,0,14,H)}}
function drawFlood(){ctx.fillStyle='rgba(50,130,190,.16)';ctx.fillRect(L,0,R-L,H);ctx.strokeStyle='rgba(180,230,255,.16)';ctx.lineWidth=2;for(let i=0;i<14;i++){const y=(i*80+runT*30)%H;ctx.beginPath();for(let x=L;x<=R;x+=20)ctx.lineTo(x,y+Math.sin(x*.04+runT*2+i)*4);ctx.stroke()}}
let darkCv=null;
function drawDark(a){const cw=Math.round(W/2),ch=Math.round(H/2);if(!darkCv||darkCv.height!==ch)darkCv=mk(cw,ch,()=>{});const g=darkCv.getContext('2d');g.globalCompositeOperation='source-over';g.clearRect(0,0,cw,ch);g.fillStyle=`rgba(4,3,8,${.94*a})`;g.fillRect(0,0,cw,ch);g.globalCompositeOperation='destination-out';
  const hole=(x,y,r)=>{g.drawImage(glow('rgba(0,0,0,1)',1),(x-r)/2,(y-r)/2,r,r)};hole(P.x,P.y,340);for(const d of decor)if(d.k==='torch')hole(d.side<0?L:R,d.y,170);for(const e of enemies)if((e.d.boss||e.type==='clone')&&!e.gone)hole(e.x,e.y,e.r*1.6);for(const p of projs)if(p.k==='orb')hole(p.x,p.y,50);
  ctx.drawImage(darkCv,0,0,W,H)}
function drawSetUnder(){if(!setp)return;if(setp.k==='airdrop'){const p=setp.t/setp.dur,y=-260+p*(H+520);ctx.save();ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(W/2,y,200,70,0,0,TAU);ctx.fill();ctx.fillRect(W/2-250,y-12,500,24);for(const s of[-1,1]){ctx.beginPath();ctx.arc(W/2+s*230,y,30,0,TAU);ctx.fill()}ctx.restore()}}
function drawSetOver(){if(!setp)return;
  if(setp.k==='bombrun'){for(const pl of setp.planes){if(pl.x<-60||pl.x>W+60)continue;ctx.save();ctx.translate(pl.x,pl.y);ctx.fillStyle='rgba(20,18,26,.85)';ctx.beginPath();ctx.ellipse(0,0,30,8,0,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(-14,-26);ctx.lineTo(4,-26);ctx.lineTo(8,0);ctx.lineTo(4,26);ctx.lineTo(-14,26);ctx.closePath();ctx.fill();ctx.fillRect(-30,-10,8,20);ctx.fillStyle=Math.floor(runT*6)%2?'#ff3d5a':'#5a1a22';ctx.beginPath();ctx.arc(-12,-24,3,0,TAU);ctx.arc(-12,24,3,0,TAU);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(32,-10+Math.sin(runT*60)*8);ctx.lineTo(32,10-Math.sin(runT*60)*8);ctx.stroke();ctx.restore()}}}
function drawCarrier(e){const x=e.x,y=e.y,K=e.phase===1?1:e.phase===2?'A':'B';ctx.save();
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x,y+190,220,46,0,0,TAU);ctx.fill();
  for(const s of[-1,1]){ctx.fillStyle='#3a3f4c';ctx.beginPath();ctx.moveTo(x+s*120,y-10);ctx.lineTo(x+s*250,y+6);ctx.lineTo(x+s*250,y+24);ctx.lineTo(x+s*120,y+26);ctx.fill();ctx.fillStyle='#2a2e38';ctx.beginPath();ctx.arc(x+s*240,y+14,20,0,TAU);ctx.fill();ctx.strokeStyle='rgba(220,225,235,.5)';ctx.lineWidth=3;const a=runT*30;ctx.beginPath();ctx.moveTo(x+s*240+Math.cos(a)*22,y+14+Math.sin(a)*8);ctx.lineTo(x+s*240-Math.cos(a)*22,y+14-Math.sin(a)*8);ctx.stroke()}
  const g=ctx.createLinearGradient(0,y-55,0,y+55);g.addColorStop(0,'#8a91a3');g.addColorStop(.5,'#5a6070');g.addColorStop(1,'#2f333d');ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(x-190,y-52,380,104,46);ctx.fill();ctx.strokeStyle='#23262e';ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(x-160,y-40,320,5);ctx.fillStyle='rgba(0,0,0,.25)';for(let i=-4;i<=4;i++)ctx.fillRect(x+i*36-1,y-46,2,92);
  ctx.fillStyle='#ffd166';for(let i=-3;i<=3;i++){ctx.beginPath();ctx.arc(x+i*40,y-30,2.5,0,TAU);ctx.fill()}
  const open=K!==1;ctx.fillStyle=open?'#120e14':'#3a3f4c';ctx.fillRect(x-50,y+8,100,34);if(open){ctx.fillStyle=Math.floor(runT*4)%2?'#ff3d5a':'#6a1a22';ctx.fillRect(x-46,y+12,8,8);ctx.fillRect(x+38,y+12,8,8)}else{ctx.strokeStyle='#23262e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+8);ctx.lineTo(x,y+42);ctx.stroke()}
  if(K==='B'){ctx.globalCompositeOperation='lighter';ctx.drawImage(glow('#ff8a3d',1),x-40,y-16,80,80);ctx.globalCompositeOperation='source-over'}
  for(const s of[-1,1]){const tx=x+s*150,ty=y+34,an=Math.atan2(P.y-ty,P.x-tx);ctx.fillStyle='#2a2e38';ctx.beginPath();ctx.arc(tx,ty,16,0,TAU);ctx.fill();ctx.save();ctx.translate(tx,ty);ctx.rotate(an);ctx.fillStyle='#6b6f7d';ctx.fillRect(4,-4,22,8);ctx.restore();ctx.fillStyle='#8b90a0';ctx.beginPath();ctx.arc(tx,ty,9,0,TAU);ctx.fill()}
  if(e.flash>0){ctx.globalAlpha=.35;ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(x-190,y-52,380,104,46);ctx.fill()}
  if(e.inv){ctx.globalAlpha=.3;ctx.strokeStyle='#a0c8ff';ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(x-196,y-58,392,116,50);ctx.stroke()}
  ctx.restore()}
</script>
