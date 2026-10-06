'use strict';
const $=s=>document.querySelector(s);
const cv=$('#cv'),ctx=cv.getContext('2d');
const TAU=Math.PI*2;
const rnd=(a,b)=>a+Math.random()*(b-a), ri=(a,b)=>Math.floor(rnd(a,b+1)), pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Saves use browser storage when the host allows it. In a sandboxed player without storage, everything is kept in memory for the session. */
const STORE=(()=>{const mem=new Map();let ls=null;try{ls=window.localStorage;ls.setItem('vg_probe','1');ls.removeItem('vg_probe')}catch(e){ls=null}
  return{get(k){if(ls){try{return ls.getItem(k)}catch(e){}}return mem.has(k)?mem.get(k):null},set(k,v){mem.set(k,String(v));if(ls){try{ls.setItem(k,String(v))}catch(e){}}}}})();
const OPT=(()=>{let o={};try{o=JSON.parse(STORE.get('vg_opts')||'{}')||{}}catch(e){o={}}return Object.assign({flick:true,auto:false,left:false,buzz:true,full:true},o)})();
function saveOpts(){STORE.set('vg_opts',JSON.stringify(OPT))}
function buzz(p){if(OPT.buzz&&navigator.vibrate){try{navigator.vibrate(p)}catch(e){}}}
const FONT='"Segoe UI Black","Arial Black",system-ui,sans-serif';
const BFONT='system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
function shade(hex,p){let n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;if(p>=0){r+=(255-r)*p;g+=(255-g)*p;b+=(255-b)*p}else{r*=1+p;g*=1+p;b*=1+p}return`rgb(${r|0},${g|0},${b|0})`}
function fmt(n){n=Math.round(n);return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e4?(n/1e3).toFixed(1)+'k':String(n)}
function mk(w,h,fn){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));fn(c.getContext('2d'),c.width,c.height);return c}
function flashOf(c){return mk(c.width,c.height,g=>{g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height)})}
function wpick(o){let t=0;for(const k in o)t+=o[k];let r=Math.random()*t;for(const k in o){r-=o[k];if(r<=0)return k}return Object.keys(o)[0]}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function segDist(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy||1;let t=((px-x1)*dx+(py-y1)*dy)/l;t=clamp(t,0,1);const cx=x1+dx*t,cy=y1+dy*t;return Math.hypot(px-cx,py-cy)}

/* ---------------- layout ---------------- */
const W=540, WALL=20, L=WALL, R=W-WALL;
let H=960, VS=1, DPR=1, TS=1;
let ZTOP=500, ZBOT=900;
function resize(){
  const box=$('#wrap'),bw=box.clientWidth,bh=box.clientHeight;
  H=Math.round(clamp(W*bh/Math.max(1,bw),880,1170));
  VS=Math.min(bw/W,bh/H);DPR=Math.min(2,window.devicePixelRatio||1);
  const st=$('#stage');st.style.width=W*VS+'px';st.style.height=H*VS+'px';st.style.setProperty('--u',VS);
  cv.width=Math.round(W*VS*DPR);cv.height=Math.round(H*VS*DPR);
  const nts=VS*DPR;if(!floorTile||Math.abs(nts-TS)>.05){TS=nts;buildTiles()}
  buildVignette();
  ZTOP=Math.round(H*.32);ZBOT=H-64;
  if(P){P.y=clamp(P.y,ZTOP,ZBOT);P.ty=clamp(P.ty,ZTOP,ZBOT)}
}

/* ---------------- background art ---------------- */
let floorTile,wallL,wallR,vignette;const TH=384;
function seeded(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
function buildTiles(){
  const fw=R-L,sr=seeded(7),BB=(typeof BIOMES!=='undefined'&&BIOMES[BIOME])||{floor:['#3a3643','#35323e','#3e3a47','#322f3a'],grout:'#17141c',wall:['#2a2630','#26222c','#2e2934'],wallBg:'#1d1a22',ledge:'#4a4553',moss:'rgba(90,120,70,.22)'};
  floorTile=mk(fw*TS,TH*TS,g=>{
    g.scale(TS,TS);g.fillStyle=BB.grout;g.fillRect(0,0,fw,TH);
    const cols=4,sw=fw/cols,sh=96;
    for(let row=0;row<4;row++){const off=row%2?sw/2:0;
      for(let c=-1;c<=cols;c++){const x=c*sw+off,y=row*sh,v=sr();
        g.fillStyle=BB.floor[Math.floor(v*4)];g.beginPath();g.roundRect(x+3,y+3,sw-6,sh-6,5);g.fill();
        g.fillStyle='rgba(255,255,255,.06)';g.fillRect(x+6,y+4,sw-12,3);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x+6,y+sh-8,sw-12,4);
        const gr=g.createRadialGradient(x+sw*sr(),y+sh*sr(),2,x+sw/2,y+sh/2,sw*.8);gr.addColorStop(0,'rgba(0,0,0,.16)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x+3,y+3,sw-6,sh-6);
        if(sr()<.55){g.strokeStyle='rgba(10,8,14,.55)';g.lineWidth=1.3;g.beginPath();let cx=x+10+sr()*(sw-20),cy=y+8+sr()*20;g.moveTo(cx,cy);for(let k=0;k<4;k++){cx+=(sr()-.5)*28;cy+=8+sr()*10;if(cy>y+sh-8)break;g.lineTo(cx,cy)}g.stroke()}
        if(sr()<.35){g.fillStyle=BB.moss;for(let k=0;k<6;k++){g.beginPath();g.arc(x+6+sr()*(sw-12),y+sh-10-sr()*12,1+sr()*2.2,0,TAU);g.fill()}}
      }}
  });
  const wallArt=side=>mk(WALL*TS,TH*TS,g=>{
    g.scale(TS,TS);g.fillStyle=BB.wallBg;g.fillRect(0,0,WALL,TH);
    for(let y=0;y<TH;y+=32){const off=(y/32)%2?12:0;for(let x=-24+off;x<WALL;x+=24){g.fillStyle=BB.wall[Math.floor(sr()*3)];g.fillRect(x+1,y+1,22,30);g.fillStyle='rgba(255,255,255,.04)';g.fillRect(x+1,y+1,22,2)}}
    const lx=side<0?WALL-12:0;g.fillStyle=BB.ledge;g.fillRect(lx,0,12,TH);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(side<0?WALL-12:9,0,3,TH);
    for(let y=0;y<TH;y+=48){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(lx,y,12,2)}
  });
  wallL=wallArt(-1);wallR=wallArt(1);
}
function buildVignette(){vignette=mk(W*VS*DPR/2,H*VS*DPR/2,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h*.55,Math.min(w,h)*.25,w/2,h*.55,Math.max(w,h)*.75);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(4,2,8,.7)');g.fillStyle=gr;g.fillRect(0,0,w,h)})}

/* ---------------- enemies: data ---------------- */
const ED={
  grunt:{r:15,hp:10,spd:52,col:'#e0443d',xp:1,dmg:10,sc:10},
  runner:{r:11,hp:6,spd:125,col:'#f0ab2c',xp:1,dmg:8,sc:12},
  brute:{r:30,hp:120,spd:30,col:'#8a4bd4',xp:6,dmg:25,sc:60,heavy:1},
  shield:{r:19,hp:30,spd:42,col:'#3d7ee2',xp:3,dmg:12,sc:30,shield:50},
  splitter:{r:22,hp:32,spd:44,col:'#48b957',xp:3,dmg:12,sc:25,split:1},
  mini:{r:10,hp:7,spd:85,col:'#86dd6f',xp:0,dmg:6,sc:4},
  bomber:{r:17,hp:14,spd:62,col:'#ff7a2f',xp:2,dmg:24,sc:20,bomb:1},
  shooter:{r:16,hp:26,spd:42,col:'#27c1b3',xp:3,dmg:12,sc:30,shoot:1},
  ghost:{r:16,hp:24,spd:55,col:'#c8c2ff',xp:3,dmg:12,sc:30,ghost:1},
  bat:{r:12,hp:7,spd:280,col:'#6a3f8e',xp:1,dmg:12,sc:14,bat:1},
  charger:{r:20,hp:44,spd:40,col:'#8a5a3a',xp:3,dmg:22,sc:35,charge:1},
  mole:{r:17,hp:36,spd:130,col:'#7a5236',xp:3,dmg:16,sc:35,mole:1},
  stalker:{r:14,hp:22,spd:82,col:'#403852',xp:2,dmg:14,sc:25,stalk:1},
  ogre:{r:44,hp:900,spd:40,col:'#6f8f3a',xp:30,dmg:30,sc:900,heavy:1,mini:1,name:'Ogre Chief'},
  witch:{r:32,hp:780,spd:0,col:'#7a3fb0',xp:30,dmg:20,sc:900,heavy:1,mini:1,name:'Hex Witch'},
  golem:{r:46,hp:1000,spd:30,col:'#7d7f8c',xp:30,dmg:30,sc:900,heavy:1,mini:1,name:'Iron Golem'},
  warden:{r:62,hp:2600,spd:0,col:'#b3122e',xp:60,dmg:40,sc:3000,heavy:1,boss:1,name:'The Warden'},
  colossus:{r:66,hp:3200,spd:0,col:'#e6dcc6',xp:60,dmg:40,sc:3000,heavy:1,boss:1,name:'Bone Colossus'},
  slime:{r:62,hp:2600,spd:0,col:'#4fd06a',xp:60,dmg:40,sc:3000,heavy:1,boss:1,name:'Slime King'},
  knight:{r:56,hp:2600,spd:0,col:'#7fa6d6',xp:60,dmg:40,sc:3000,heavy:1,boss:1,name:'Frost Knight'},
  wyrm:{r:58,hp:2600,spd:0,col:'#d9642b',xp:60,dmg:40,sc:3000,heavy:1,boss:1,name:'Magma Wyrm'},
  hydra:{r:54,hp:3000,spd:0,col:'#1f8f80',xp:60,dmg:40,sc:3000,heavy:1,boss:1,name:'Storm Hydra'},
  lich:{r:44,hp:2800,spd:0,col:'#3a2d55',xp:60,dmg:40,sc:3000,heavy:1,boss:1,name:'The Lich'},
  carrier:{r:88,hp:1250,spd:0,col:'#5a6070',xp:60,dmg:40,sc:3000,heavy:1,boss:1,name:'Sky Carrier'},
  hand:{r:26,hp:100,spd:0,col:'#e6dcc6',xp:6,dmg:24,sc:300,heavy:1,part:1},
  head:{r:18,hp:100,spd:0,col:'#22a391',xp:6,dmg:20,sc:300,heavy:1,part:1},
  crystal:{r:18,hp:100,spd:0,col:'#7dffb0',xp:6,dmg:0,sc:300,heavy:1,part:1},
  clone:{r:44,hp:1,spd:0,col:'#3a2d55',xp:0,dmg:20,sc:50,heavy:1,part:1},
  drone:{r:13,hp:14,spd:170,col:'#c0392b',xp:1,dmg:14,sc:20,drone:1},
};
const AFFIX={
  swift:{n:'Swift',c:'#ffd166'},armored:{n:'Armored',c:'#9fb4d8'},vampiric:{n:'Vampiric',c:'#ff4d6d'},
  volatile:{n:'Volatile',c:'#ff8a3d'},gunner:{n:'Gunner',c:'#c28bff'},shielded:{n:'Shielded',c:'#5fb8ff'},
};

/* ---------------- enemy sprites ---------------- */
const SPR={};
function paintEnemy(g,type,r,col){
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(0,r*.8,r*.95,r*.34,0,0,TAU);g.fill();
  const body=fn=>{const gr=g.createRadialGradient(-r*.35,-r*.45,r*.1,0,0,r*1.1);gr.addColorStop(0,shade(col,.4));gr.addColorStop(.55,col);gr.addColorStop(1,shade(col,-.5));g.fillStyle=gr;g.beginPath();fn();g.fill();g.strokeStyle=shade(col,-.65);g.lineWidth=Math.max(1,r*.07);g.stroke()};
  const eyes=(dy=.1,pup='#120a10',sz=1)=>{for(const s of[-1,1]){g.fillStyle='#fff';g.beginPath();g.ellipse(s*r*.34,r*dy,r*.22*sz,r*.25*sz,0,0,TAU);g.fill();g.fillStyle=pup;g.beginPath();g.arc(s*r*.31,r*(dy+.08),r*.11*sz,0,TAU);g.fill()}
    g.strokeStyle='rgba(20,5,10,.85)';g.lineWidth=r*.1;g.lineCap='round';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.58,r*(dy-.28));g.lineTo(s*r*.14,r*(dy-.1));g.stroke()}};
  const glowEyes=(dy,c,sz=.13)=>{for(const s of[-1,1]){g.fillStyle=c;g.shadowColor=c;g.shadowBlur=r*.4;g.beginPath();g.ellipse(s*r*.3,r*dy,r*sz*1.3,r*sz,0,0,TAU);g.fill()}g.shadowBlur=0};
  const fangs=()=>{g.fillStyle='rgba(30,5,10,.8)';g.beginPath();g.ellipse(0,r*.55,r*.24,r*.1,0,0,TAU);g.fill();g.fillStyle='#fff';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.16,r*.5);g.lineTo(s*r*.08,r*.5);g.lineTo(s*r*.12,r*.64);g.fill()}};
  const horn=(s,big,c='#efe2c4')=>{g.fillStyle=c;g.strokeStyle='rgba(40,20,10,.5)';g.lineWidth=1;g.beginPath();g.moveTo(s*r*.3,-r*.78);g.quadraticCurveTo(s*r*(big?1.2:.9),-r*(big?1.15:1),s*r*(big?1.05:.72),-r*(big?1.6:1.3));g.quadraticCurveTo(s*r*.8,-r*.95,s*r*.72,-r*.48);g.closePath();g.fill();g.stroke()};
  switch(type){
  case'grunt':{
    g.save();g.translate(r*.95,r*.15);g.rotate(-.55);g.fillStyle='#8a5a30';g.strokeStyle='#3a2410';g.lineWidth=1.5;g.beginPath();g.moveTo(-r*.09,r*.55);g.lineTo(-r*.17,-r*.45);g.quadraticCurveTo(0,-r*1.0,r*.22,-r*.5);g.lineTo(r*.09,r*.55);g.closePath();g.fill();g.stroke();g.fillStyle='#d9dde6';g.fillRect(r*.1,-r*.62,r*.16,r*.07);g.fillRect(r*.12,-r*.35,r*.14,r*.07);g.restore();
    for(const s of[-1,1]){g.fillStyle=shade(col,-.12);g.strokeStyle=shade(col,-.65);g.lineWidth=1.5;g.beginPath();g.moveTo(s*r*.55,-r*.4);g.lineTo(s*r*1.5,-r*.8);g.lineTo(s*r*.78,r*.02);g.closePath();g.fill();g.stroke();g.fillStyle='rgba(255,170,160,.6)';g.beginPath();g.moveTo(s*r*.7,-r*.35);g.lineTo(s*r*1.25,-r*.64);g.lineTo(s*r*.8,-r*.12);g.closePath();g.fill()}
    body(()=>{g.moveTo(0,-r*.95);g.quadraticCurveTo(r*.85,-r*.92,r*.95,r*.3);g.quadraticCurveTo(r*.92,r*.92,0,r*.9);g.quadraticCurveTo(-r*.92,r*.92,-r*.95,r*.3);g.quadraticCurveTo(-r*.85,-r*.92,0,-r*.95)});
    g.fillStyle='rgba(255,215,190,.32)';g.beginPath();g.ellipse(0,r*.48,r*.5,r*.32,0,0,TAU);g.fill();
    horn(-1,0);horn(1,0);eyes(-.02);fangs();return}
  case'runner':{
    g.fillStyle=shade(col,-.1);g.strokeStyle=shade(col,-.65);g.lineWidth=1.4;g.beginPath();g.moveTo(-r*.5,r*.45);g.quadraticCurveTo(-r*1.8,r*.7,-r*1.65,-r*.45);g.quadraticCurveTo(-r*1.15,r*.1,-r*.45,r*.05);g.closePath();g.fill();g.stroke();g.fillStyle='#fff6e0';g.beginPath();g.arc(-r*1.58,-r*.34,r*.22,0,TAU);g.fill();
    for(const s of[-1,1]){g.fillStyle=col;g.strokeStyle=shade(col,-.65);g.beginPath();g.moveTo(s*r*.18,-r*.7);g.lineTo(s*r*.62,-r*1.65);g.lineTo(s*r*.78,-r*.42);g.closePath();g.fill();g.stroke();g.fillStyle='#ffd9b0';g.beginPath();g.moveTo(s*r*.32,-r*.72);g.lineTo(s*r*.6,-r*1.32);g.lineTo(s*r*.64,-r*.56);g.closePath();g.fill()}
    body(()=>g.ellipse(0,0,r*.86,r*1.0,0,0,TAU));
    g.fillStyle='#fff6e0';g.beginPath();g.ellipse(0,r*.38,r*.52,r*.46,0,0,TAU);g.fill();g.fillStyle='#1a0e0a';g.beginPath();g.ellipse(0,r*.18,r*.13,r*.1,0,0,TAU);g.fill();
    for(const s of[-1,1]){g.fillStyle='#1a0e0a';g.beginPath();g.ellipse(s*r*.36,-r*.18,r*.12,r*.17,s*.25,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(s*r*.33,-r*.24,r*.05,0,TAU);g.fill()}return}
  case'brute':{
    for(const s of[-1,1]){g.fillStyle=shade(col,-.2);g.strokeStyle=shade(col,-.7);g.lineWidth=2;g.beginPath();g.roundRect(s*r*1.0-r*.2,-r*.35,r*.4,r*.6,r*.18);g.fill();g.stroke()}
    body(()=>{g.moveTo(-r*1.0,-r*.25);g.quadraticCurveTo(-r*1.0,-r*.85,0,-r*.82);g.quadraticCurveTo(r*1.0,-r*.85,r*1.0,-r*.25);g.lineTo(r*.78,r*.78);g.quadraticCurveTo(0,r*.95,-r*.78,r*.78);g.closePath()});
    g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.ellipse(0,r*.25,r*.5,r*.35,0,0,TAU);g.fill();
    g.fillStyle='#4a2a14';g.fillRect(-r*.85,r*.42,r*1.7,r*.16);g.fillStyle='#c8a14a';g.fillRect(-r*.12,r*.39,r*.24,r*.22);
    for(const s of[-1,1]){g.fillStyle='#8f93a3';g.strokeStyle='#3a3d48';g.lineWidth=2;g.beginPath();g.ellipse(s*r*.78,-r*.42,r*.36,r*.26,0,Math.PI,TAU);g.closePath();g.fill();g.stroke();g.fillStyle='#dfe3ec';g.beginPath();g.moveTo(s*r*.66,-r*.62);g.lineTo(s*r*.76,-r*.95);g.lineTo(s*r*.86,-r*.62);g.fill()}
    horn(-1,1);horn(1,1);
    g.fillStyle='#8f93a3';g.strokeStyle='#3a3d48';g.lineWidth=2;g.beginPath();g.arc(0,-r*.5,r*.42,Math.PI,TAU);g.lineTo(r*.42,-r*.38);g.lineTo(-r*.42,-r*.38);g.closePath();g.fill();g.stroke();
    g.fillStyle='#1a0e14';g.fillRect(-r*.3,-r*.55,r*.6,r*.1);glowEyes(-.5,'#ffcf4a',.07);
    g.fillStyle='#fff6e0';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.2,-r*.1);g.lineTo(s*r*.28,-r*.4);g.lineTo(s*r*.36,-r*.1);g.fill()}
    for(const s of[-1,1]){const gr=g.createRadialGradient(s*r*1.0-r*.1,r*.3,r*.05,s*r*1.0,r*.4,r*.4);gr.addColorStop(0,shade(col,.3));gr.addColorStop(1,shade(col,-.4));g.fillStyle=gr;g.strokeStyle=shade(col,-.7);g.lineWidth=2;g.beginPath();g.arc(s*r*1.0,r*.42,r*.34,0,TAU);g.fill();g.stroke();g.fillStyle='#8f93a3';g.fillRect(s*r*1.0-r*.3,r*.2,r*.6,r*.1)}
    return}
  case'shield':{
    g.strokeStyle='#5a3a20';g.lineWidth=r*.12;g.lineCap='round';g.beginPath();g.moveTo(r*.95,r*.9);g.lineTo(r*.95,-r*1.3);g.stroke();g.fillStyle='#dfe3ec';g.strokeStyle='#5a5f6e';g.lineWidth=1.2;g.beginPath();g.moveTo(r*.83,-r*1.25);g.lineTo(r*.95,-r*1.7);g.lineTo(r*1.07,-r*1.25);g.closePath();g.fill();g.stroke();
    body(()=>g.roundRect(-r*.85,-r*.7,r*1.7,r*1.55,r*.55));
    g.fillStyle='#e0443d';g.beginPath();g.moveTo(-r*.1,-r*.95);g.quadraticCurveTo(-r*.2,-r*1.55,r*.55,-r*1.35);g.quadraticCurveTo(r*.1,-r*1.2,r*.12,-r*.95);g.closePath();g.fill();
    g.fillStyle='#9aa1b4';g.strokeStyle='#4a5060';g.lineWidth=1.8;g.beginPath();g.arc(0,-r*.2,r*.82,Math.PI,TAU);g.lineTo(r*.9,-r*.12);g.lineTo(-r*.9,-r*.12);g.closePath();g.fill();g.stroke();
    g.fillStyle='#141a28';g.fillRect(-r*.55,-r*.34,r*1.1,r*.15);glowEyes(-.27,'#8fe3ff',.08);g.fillStyle='#dfe3ec';g.fillRect(-r*.06,-r*1.0,r*.12,r*.5);return}
  case'bomber':{
    const gr=g.createRadialGradient(-r*.35,-r*.4,r*.1,0,0,r*1.05);gr.addColorStop(0,'#6a5a66');gr.addColorStop(.6,'#2f252c');gr.addColorStop(1,'#140e12');g.fillStyle=gr;g.beginPath();g.arc(0,r*.05,r*.95,0,TAU);g.fill();g.strokeStyle='#0a0608';g.lineWidth=2;g.stroke();
    g.save();g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=6;g.lineWidth=1.6;g.beginPath();g.moveTo(-r*.7,-r*.2);g.lineTo(-r*.45,r*.05);g.lineTo(-r*.6,r*.35);g.moveTo(r*.65,-r*.35);g.lineTo(r*.4,-r*.1);g.lineTo(r*.55,r*.2);g.stroke();g.restore();
    g.fillStyle='#4a4048';g.strokeStyle='#0a0608';g.lineWidth=1.5;g.beginPath();g.roundRect(-r*.25,-r*1.12,r*.5,r*.32,3);g.fill();g.stroke();
    g.strokeStyle='#c8a878';g.lineWidth=2;g.beginPath();g.moveTo(0,-r*1.1);g.quadraticCurveTo(r*.35,-r*1.35,r*.12,-r*1.55);g.stroke();
    g.fillStyle='rgba(255,255,255,.2)';g.beginPath();g.ellipse(-r*.4,-r*.45,r*.22,r*.12,-.6,0,TAU);g.fill();
    for(const s of[-1,1]){g.fillStyle='#fff';g.beginPath();g.ellipse(s*r*.32,-r*.02,r*.2,r*.22,0,0,TAU);g.fill();g.fillStyle=col;g.beginPath();g.arc(s*r*.28,r*.04,r*.1,0,TAU);g.fill();g.strokeStyle='#0a0608';g.lineWidth=r*.09;g.beginPath();g.moveTo(s*r*.56,-r*.3);g.lineTo(s*r*.12,-r*.16);g.stroke()}
    g.fillStyle='#fff6e0';g.beginPath();g.moveTo(-r*.35,r*.42);g.quadraticCurveTo(0,r*.72,r*.35,r*.42);g.quadraticCurveTo(0,r*.52,-r*.35,r*.42);g.fill();return}
  case'shooter':{
    body(()=>{g.moveTo(0,-r*1.25);g.quadraticCurveTo(r*.72,-r*.95,r*.75,-r*.1);g.lineTo(r*1.0,r*.9);g.quadraticCurveTo(0,r*1.05,-r*1.0,r*.9);g.lineTo(-r*.75,-r*.1);g.quadraticCurveTo(-r*.72,-r*.95,0,-r*1.25)});
    g.strokeStyle='#ffd166';g.lineWidth=1.6;g.beginPath();g.moveTo(-r*.9,r*.72);g.quadraticCurveTo(0,r*.9,r*.9,r*.72);g.moveTo(0,r*.1);g.lineTo(0,r*.85);g.stroke();
    g.fillStyle='#0c1414';g.beginPath();g.ellipse(0,-r*.4,r*.46,r*.42,0,0,TAU);g.fill();glowEyes(-.42,'#7dfff0',.1);
    g.fillStyle=shade(col,-.35);for(const s of[-1,1]){g.beginPath();g.ellipse(s*r*.42,r*.3,r*.24,r*.2,s*.5,0,TAU);g.fill()}
    const og=g.createRadialGradient(0,r*.32,0,0,r*.32,r*.36);og.addColorStop(0,'#fff');og.addColorStop(.4,'#c28bff');og.addColorStop(1,'rgba(194,139,255,0)');g.fillStyle=og;g.beginPath();g.arc(0,r*.32,r*.36,0,TAU);g.fill();return}
  case'ghost':{const gr=g.createLinearGradient(0,-r,0,r);gr.addColorStop(0,'#f4f1ff');gr.addColorStop(1,'#9c93e0');g.fillStyle=gr;
    g.beginPath();g.arc(0,-r*.1,r,Math.PI,0);g.lineTo(r,r*.75);for(let i=0;i<4;i++){const x0=r-i*r/2;g.quadraticCurveTo(x0-r/8,r*1.05,x0-r/4,r*.75);g.quadraticCurveTo(x0-r*3/8,r*.5,x0-r/2,r*.75)}g.closePath();g.fill();
    g.fillStyle='#2a2150';for(const s of[-1,1]){g.beginPath();g.ellipse(s*r*.35,0,r*.16,r*.24,0,0,TAU);g.fill()}g.beginPath();g.ellipse(0,r*.42,r*.14,r*.18,0,0,TAU);g.fill();return}
  case'splitter':case'mini':
    body(()=>{g.moveTo(-r*1.05,r*.45);g.quadraticCurveTo(-r*1.1,-r*.95,0,-r*.95);g.quadraticCurveTo(r*1.1,-r*.95,r*1.05,r*.45);g.quadraticCurveTo(r*.9,r*.8,0,r*.78);g.quadraticCurveTo(-r*.9,r*.8,-r*1.05,r*.45)});
    g.fillStyle='rgba(255,255,255,.45)';g.beginPath();g.ellipse(-r*.4,-r*.5,r*.22,r*.12,-.5,0,TAU);g.fill();
    if(type==='splitter'){g.fillStyle='rgba(20,60,20,.35)';g.beginPath();g.arc(r*.35,-r*.35,r*.14,0,TAU);g.arc(-r*.1,-r*.6,r*.1,0,TAU);g.fill()}
    eyes(.15);return;
  case'bat':
    g.fillStyle=shade(col,-.35);for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.5,-r*.2);g.quadraticCurveTo(s*r*1.6,-r*1.1,s*r*2.2,-r*.2);g.lineTo(s*r*1.75,r*.1);g.lineTo(s*r*1.45,-r*.05);g.lineTo(s*r*1.1,r*.3);g.lineTo(s*r*.8,r*.05);g.lineTo(s*r*.5,r*.35);g.closePath();g.fill()}
    body(()=>g.arc(0,0,r*.72,0,TAU));g.fillStyle=col;for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.2,-r*.55);g.lineTo(s*r*.5,-r*1.05);g.lineTo(s*r*.55,-r*.4);g.fill()}
    glowEyes(.05,'#ff3d5a',.13);g.fillStyle='#fff';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.12,r*.3);g.lineTo(s*r*.04,r*.3);g.lineTo(s*r*.08,r*.45);g.fill()}return;
  case'charger':
    g.fillStyle=shade(col,-.45);g.beginPath();g.ellipse(0,-r*.55,r*.35,r*.45,0,0,TAU);g.fill();
    body(()=>g.ellipse(0,0,r*.95,r*1.05,0,0,TAU));
    g.fillStyle='#e7a08f';g.beginPath();g.ellipse(0,r*.62,r*.38,r*.28,0,0,TAU);g.fill();g.fillStyle='#6b2f25';g.beginPath();g.arc(-r*.13,r*.62,r*.07,0,TAU);g.arc(r*.13,r*.62,r*.07,0,TAU);g.fill();
    g.fillStyle='#fff6e0';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.32,r*.6);g.quadraticCurveTo(s*r*.62,r*.6,s*r*.58,r*.2);g.lineTo(s*r*.46,r*.52);g.closePath();g.fill()}
    g.fillStyle='#1a0e0a';for(const s of[-1,1]){g.beginPath();g.arc(s*r*.36,r*.12,r*.1,0,TAU);g.fill()}
    g.strokeStyle='rgba(20,5,10,.85)';g.lineWidth=r*.09;g.lineCap='round';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.56,-r*.06);g.lineTo(s*r*.18,r*.04);g.stroke()}return;
  case'mole':
    g.fillStyle='#f3e6d0';for(const s of[-1,1])for(let i=0;i<3;i++){g.beginPath();g.ellipse(s*(r*.85+i*r*.1),r*.25+i*r*.12,r*.08,r*.22,s*.6,0,TAU);g.fill()}
    body(()=>g.arc(0,0,r,0,TAU));g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.ellipse(0,r*.3,r*.55,r*.45,0,0,TAU);g.fill();
    g.fillStyle='#ff9fb4';g.beginPath();g.ellipse(0,r*.5,r*.2,r*.15,0,0,TAU);g.fill();
    g.strokeStyle='#1a0e0a';g.lineWidth=r*.1;for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.48,r*.05);g.lineTo(s*r*.22,r*.1);g.stroke()}return;
  case'stalker':
    body(()=>{g.moveTo(0,-r*1.35);g.quadraticCurveTo(r*1.05,-r*.6,r*.95,r*.35);g.quadraticCurveTo(0,r*1.05,-r*.95,r*.35);g.quadraticCurveTo(-r*1.05,-r*.6,0,-r*1.35)});
    g.fillStyle='#120e18';g.beginPath();g.ellipse(0,-r*.25,r*.6,r*.5,0,0,TAU);g.fill();glowEyes(-.35,'#c28bff',.12);
    g.fillStyle='#c9cdd8';g.beginPath();g.moveTo(r*.8,-r*1.2);g.lineTo(r*1.0,-r*.2);g.lineTo(r*.7,-r*.2);g.closePath();g.fill();return;
  case'ogre':
    body(()=>g.arc(0,0,r,0,TAU));horn(0,0,'#e8dcb8');
    g.fillStyle='#e8dcb8';g.beginPath();g.moveTo(-r*.12,-r*.8);g.lineTo(0,-r*1.35);g.lineTo(r*.12,-r*.8);g.fill();
    g.fillStyle='#5b3a1e';g.fillRect(-r*.98,r*.28,r*1.96,r*.18);g.fillStyle='#c8a14a';g.fillRect(-r*.14,r*.26,r*.28,r*.22);
    eyes(.02,'#3a0a00',.8);
    g.fillStyle='#fff6e0';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.28,r*.58);g.lineTo(s*r*.2,r*.3);g.lineTo(s*r*.12,r*.58);g.fill()}
    g.fillStyle='#6b4423';g.save();g.translate(r*1.05,-r*.1);g.rotate(-.35);g.beginPath();g.roundRect(-r*.12,-r*.9,r*.24,r*1.3,r*.1);g.fill();g.fillStyle='#8a5a30';g.beginPath();g.ellipse(0,-r*.85,r*.26,r*.34,0,0,TAU);g.fill();g.fillStyle='#ddd';for(let i=0;i<3;i++){g.beginPath();g.arc(-r*.12+i*r*.12,-r*.95+i*r*.08,r*.05,0,TAU);g.fill()}g.restore();return;
  case'witch':
    body(()=>g.arc(0,r*.1,r*.9,0,TAU));
    g.fillStyle='#2a1640';g.beginPath();g.ellipse(0,-r*.35,r*1.3,r*.32,0,0,TAU);g.fill();
    g.fillStyle='#3a1f5a';g.beginPath();g.moveTo(-r*.7,-r*.45);g.quadraticCurveTo(-r*.2,-r*1.2,r*.45,-r*1.9);g.quadraticCurveTo(r*.25,-r*1.05,r*.7,-r*.45);g.closePath();g.fill();
    g.fillStyle='#ffd166';g.fillRect(-r*.65,-r*.62,r*1.3,r*.12);
    glowEyes(.12,'#7dff8a',.14);g.fillStyle='#2a0f20';g.beginPath();g.ellipse(0,r*.55,r*.2,r*.07,0,0,TAU);g.fill();return;
  case'golem':{
    g.fillStyle=shade(col,-.2);for(const s of[-1,1]){g.beginPath();g.roundRect(s*r*1.0-r*.3,-r*.3,r*.6,r*.9,r*.15);g.fill()}
    body(()=>g.roundRect(-r*.9,-r*.95,r*1.8,r*1.85,r*.35));
    g.strokeStyle='rgba(20,20,30,.5)';g.lineWidth=2;g.beginPath();g.moveTo(-r*.9,-r*.2);g.lineTo(r*.9,-r*.2);g.moveTo(-r*.2,-r*.95);g.lineTo(-r*.25,-r*.2);g.moveTo(r*.3,-r*.2);g.lineTo(r*.35,r*.9);g.moveTo(-r*.6,r*.3);g.lineTo(-r*.3,r*.5);g.stroke();
    g.fillStyle='#2a2a33';g.beginPath();g.arc(0,r*.25,r*.34,0,TAU);g.fill();
    g.fillStyle='#1a1a22';g.fillRect(-r*.55,-r*.62,r*1.1,r*.22);glowEyes(-.51,'#ffb020',.1);return}
  case'warden':horn(-1,1);horn(1,1);body(()=>g.arc(0,0,r,0,TAU));
    g.fillStyle='#ffc93c';g.strokeStyle='#8a5a00';g.lineWidth=2;g.beginPath();g.moveTo(-r*.55,-r*.62);g.lineTo(-r*.6,-r*1.05);g.lineTo(-r*.28,-r*.8);g.lineTo(0,-r*1.18);g.lineTo(r*.28,-r*.8);g.lineTo(r*.6,-r*1.05);g.lineTo(r*.55,-r*.62);g.closePath();g.fill();g.stroke();
    g.fillStyle='#ff2d55';g.beginPath();g.arc(0,-r*.82,r*.08,0,TAU);g.fill();eyes(.05,'#ffd21f');fangs();return;
  case'colossus':{
    const gr=g.createRadialGradient(-r*.3,-r*.5,r*.1,0,0,r*1.1);gr.addColorStop(0,'#fffaf0');gr.addColorStop(.6,'#e6dcc6');gr.addColorStop(1,'#9c917a');g.fillStyle=gr;
    g.beginPath();g.arc(0,-r*.1,r,Math.PI*.85,Math.PI*2.15);g.lineTo(r*.6,r*.75);g.lineTo(-r*.6,r*.75);g.closePath();g.fill();g.strokeStyle='#6b6250';g.lineWidth=2;g.stroke();
    g.fillStyle='#d8cdb4';g.beginPath();g.roundRect(-r*.55,r*.5,r*1.1,r*.45,r*.12);g.fill();g.stroke();
    g.fillStyle='#fffaf0';for(let i=0;i<6;i++){g.fillRect(-r*.45+i*r*.16,r*.5,r*.12,r*.2)}
    g.fillStyle='#1a1010';for(const s of[-1,1]){g.beginPath();g.ellipse(s*r*.38,-r*.02,r*.26,r*.3,s*.2,0,TAU);g.fill()}
    g.beginPath();g.moveTo(0,r*.18);g.lineTo(-r*.1,r*.4);g.lineTo(r*.1,r*.4);g.closePath();g.fill();
    glowEyes(0,'#ff3030',.1);
    g.strokeStyle='#6b6250';g.lineWidth=1.5;g.beginPath();g.moveTo(-r*.2,-r*1.05);g.lineTo(-r*.1,-r*.7);g.lineTo(-r*.25,-r*.5);g.moveTo(r*.5,-r*.85);g.lineTo(r*.35,-r*.6);g.stroke();return}
  case'hydra':
    body(()=>g.ellipse(0,r*.1,r*1.05,r*.9,0,0,TAU));
    g.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<5;i++){g.beginPath();g.ellipse(0,-r*.35+i*r*.22,r*.45-i*r*.02,r*.08,0,0,TAU);g.fill()}
    g.fillStyle=shade(col,-.4);for(let i=0;i<9;i++){const a=Math.PI*1.1+i*.15;g.beginPath();g.moveTo(Math.cos(a)*r*.95,Math.sin(a)*r*.8+r*.1);g.lineTo(Math.cos(a+.07)*r*1.25,Math.sin(a+.07)*r*1.05+r*.1);g.lineTo(Math.cos(a+.14)*r*.95,Math.sin(a+.14)*r*.8+r*.1);g.fill()}return;
  case'slime':
    body(()=>{g.moveTo(-r*1.1,r*.55);g.quadraticCurveTo(-r*1.15,-r*.9,0,-r*.9);g.quadraticCurveTo(r*1.15,-r*.9,r*1.1,r*.55);g.quadraticCurveTo(r*.95,r*.85,0,r*.82);g.quadraticCurveTo(-r*.95,r*.85,-r*1.1,r*.55)});
    g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(-r*.45,-r*.45,r*.26,r*.13,-.5,0,TAU);g.fill();g.fillStyle='rgba(20,90,30,.3)';for(const [x,y,s] of[[.45,-.2,.12],[-.2,.35,.09],[.6,.35,.07]]){g.beginPath();g.arc(x*r,y*r,s*r,0,TAU);g.fill()}
    g.fillStyle='#ffc93c';g.strokeStyle='#8a5a00';g.lineWidth=2;g.beginPath();g.moveTo(-r*.45,-r*.78);g.lineTo(-r*.5,-r*1.2);g.lineTo(-r*.22,-r*.98);g.lineTo(0,-r*1.3);g.lineTo(r*.22,-r*.98);g.lineTo(r*.5,-r*1.2);g.lineTo(r*.45,-r*.78);g.closePath();g.fill();g.stroke();
    g.fillStyle='#7fe7ff';g.beginPath();g.arc(0,-r*.95,r*.07,0,TAU);g.fill();eyes(.12,'#0e3a14');g.fillStyle='#1d5a26';g.beginPath();g.ellipse(0,r*.5,r*.3,r*.12,0,0,Math.PI);g.fill();return;
  case'knight':
    g.fillStyle='#c9cdd8';g.save();g.translate(r*1.05,-r*.1);g.rotate(.35);g.fillRect(-r*.07,-r*1.35,r*.14,r*1.3);g.fillStyle='#8a5a30';g.fillRect(-r*.28,-r*.08,r*.56,r*.12);g.fillRect(-r*.07,0,r*.14,r*.35);g.restore();
    body(()=>{g.moveTo(-r*.9,r*.8);g.lineTo(-r*.95,-r*.35);g.quadraticCurveTo(-r*.9,-r*1.05,0,-r*1.05);g.quadraticCurveTo(r*.9,-r*1.05,r*.95,-r*.35);g.lineTo(r*.9,r*.8);g.quadraticCurveTo(0,r*1.0,-r*.9,r*.8)});
    g.fillStyle='#14202e';g.beginPath();g.roundRect(-r*.7,-r*.35,r*1.4,r*.26,r*.1);g.fill();glowEyes(-.22,'#7fe7ff',.1);
    g.strokeStyle=shade(col,-.55);g.lineWidth=r*.06;g.beginPath();g.moveTo(0,-r*.05);g.lineTo(0,r*.75);for(let i=0;i<3;i++){g.moveTo(-r*.35,r*(.1+i*.2));g.lineTo(r*.35,r*(.1+i*.2))}g.stroke();
    g.fillStyle='#4fb6ff';g.beginPath();g.moveTo(0,-r*1.05);g.quadraticCurveTo(-r*.5,-r*1.6,-r*.15,-r*1.75);g.quadraticCurveTo(r*.15,-r*1.4,r*.3,-r*1.05);g.closePath();g.fill();return;
  case'wyrm':
    horn(-1,1,'#3a2a24');horn(1,1,'#3a2a24');body(()=>g.ellipse(0,0,r,r*.95,0,0,TAU));
    g.strokeStyle='#ffb020';g.lineWidth=r*.05;g.beginPath();g.moveTo(-r*.7,-r*.3);g.lineTo(-r*.4,-r*.1);g.lineTo(-r*.55,r*.2);g.moveTo(r*.6,-r*.45);g.lineTo(r*.35,-r*.2);g.moveTo(r*.5,r*.3);g.lineTo(r*.75,r*.1);g.stroke();
    g.fillStyle=shade(col,-.45);for(let i=0;i<4;i++){g.beginPath();g.ellipse(0,-r*.7+i*r*.18,r*.3-i*r*.03,r*.06,0,0,TAU);g.fill()}
    glowEyes(0,'#ffe066',.12);fangs();g.fillStyle='rgba(255,176,32,.5)';g.beginPath();g.ellipse(0,r*.55,r*.24,r*.08,0,0,TAU);g.fill();return;
  case'carrier':return;
  case'hand':g.fillStyle='#e6dcc6';g.strokeStyle='#6b6250';g.lineWidth=2;g.beginPath();g.roundRect(-r*.9,-r*.8,r*1.8,r*1.2,r*.35);g.fill();g.stroke();for(let i=0;i<4;i++){g.beginPath();g.roundRect(-r*.82+i*r*.45,r*.3,r*.34,r*(1-Math.abs(i-1.5)*.18),r*.15);g.fill();g.stroke()}g.fillStyle='#2a2320';for(let i=0;i<4;i++){g.beginPath();g.arc(-r*.65+i*r*.45,r*.55,r*.05,0,TAU);g.fill()}return;
  case'head':{body(()=>g.ellipse(0,0,r*.85,r*1.05,0,0,TAU));g.fillStyle='#0e4a42';g.beginPath();g.ellipse(0,r*.62,r*.5,r*.32,0,0,TAU);g.fill();g.fillStyle='#fff';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.35,r*.45);g.lineTo(s*r*.22,r*.8);g.lineTo(s*r*.1,r*.45);g.fill()}g.fillStyle=shade(col,-.4);for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.4,-r*.6);g.lineTo(s*r*.8,-r*1.2);g.lineTo(s*r*.7,-r*.4);g.fill()}glowEyes(-.05,'#ffe066',.16);return}
  case'crystal':{g.fillStyle='rgba(125,255,176,.25)';g.beginPath();g.arc(0,0,r*1.3,0,TAU);g.fill();const gr=g.createLinearGradient(-r,-r,r,r);gr.addColorStop(0,'#e8fff0');gr.addColorStop(.5,'#7dffb0');gr.addColorStop(1,'#1f8f5a');g.fillStyle=gr;g.beginPath();g.moveTo(0,-r*1.4);g.lineTo(r*.7,0);g.lineTo(0,r*1.1);g.lineTo(-r*.7,0);g.closePath();g.fill();g.strokeStyle='#dffff0';g.lineWidth=1.5;g.stroke();g.beginPath();g.moveTo(0,-r*1.4);g.lineTo(0,r*1.1);g.moveTo(-r*.7,0);g.lineTo(r*.7,0);g.stroke();return}
  case'drone':g.fillStyle='#3a3f4c';g.beginPath();g.moveTo(-r*1.6,-r*.1);g.lineTo(r*1.6,-r*.1);g.lineTo(r*1.3,r*.35);g.lineTo(-r*1.3,r*.35);g.closePath();g.fill();g.fillStyle=col;g.beginPath();g.ellipse(0,0,r*.5,r*1.1,0,0,TAU);g.fill();g.fillStyle='#8fe3ff';g.beginPath();g.ellipse(0,r*.35,r*.25,r*.35,0,0,TAU);g.fill();g.fillStyle='#ffd166';g.fillRect(-r*.2,-r*1.25,r*.4,r*.2);g.fillStyle='#ff3d5a';g.beginPath();g.arc(-r*1.5,0,r*.12,0,TAU);g.arc(r*1.5,0,r*.12,0,TAU);g.fill();return;
  case'lich':case'clone':
    g.fillStyle='#1e1630';g.beginPath();g.moveTo(-r*1.05,r*.9);g.quadraticCurveTo(-r*1.1,-r*.4,0,-r*.9);g.quadraticCurveTo(r*1.1,-r*.4,r*1.05,r*.9);g.quadraticCurveTo(0,r*1.1,-r*1.05,r*.9);g.fill();
    g.fillStyle='#3a2d55';g.beginPath();g.moveTo(-r*.8,r*.8);g.quadraticCurveTo(-r*.8,-r*.2,0,-r*.6);g.quadraticCurveTo(r*.8,-r*.2,r*.8,r*.8);g.fill();
    g.fillStyle='#e8e0cc';g.beginPath();g.arc(0,-r*.05,r*.46,0,TAU);g.fill();g.fillRect(-r*.28,r*.25,r*.56,r*.22);
    g.fillStyle='#120a18';for(const s of[-1,1]){g.beginPath();g.ellipse(s*r*.18,-r*.08,r*.12,r*.14,0,0,TAU);g.fill()}
    glowEyes(-.06,'#7dffb0',.07);
    g.fillStyle='#cfc3a9';for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*r*.16-r*.06,-r*.45);g.lineTo(i*r*.16,-r*(.8+.1*(2-Math.abs(i))));g.lineTo(i*r*.16+r*.06,-r*.45);g.fill()}return;
  }
  if(type==='grunt'){horn(-1,0);horn(1,0)}
  if(type==='runner'){g.fillStyle='#efe2c4';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.6,-r*.4);g.lineTo(s*r*1.5,-r*.75);g.lineTo(s*r*.8,-r*.05);g.fill()}}
  if(type==='brute'){horn(-1,1);horn(1,1)}
  body(()=>g.arc(0,0,r,0,TAU));
  if(type==='brute'){g.fillStyle='#8f93a3';g.beginPath();g.arc(0,0,r*.98,Math.PI*1.12,Math.PI*1.88);g.lineTo(r*.55,-r*.45);g.quadraticCurveTo(0,-r*.62,-r*.55,-r*.45);g.closePath();g.fill();g.fillStyle='#4a2a14';g.fillRect(-r*.95,r*.3,r*1.9,r*.16)}
  if(type==='shield'){g.fillStyle='#9aa1b4';g.beginPath();g.arc(0,0,r,Math.PI*1.05,Math.PI*1.95);g.quadraticCurveTo(0,-r*.35,-r*.98,-r*.18);g.fill();g.fillStyle='#dfe3ec';g.fillRect(-r*.08,-r*1.12,r*.16,r*.5)}
  if(type==='bomber'){g.fillStyle='#2c2025';g.beginPath();g.roundRect(-r*.22,-r*1.15,r*.44,r*.4,3);g.fill();g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.arc(0,r*.25,r*.48,0,TAU);g.fill()}
  if(type==='shooter'){g.fillStyle='#a57bff';g.beginPath();g.moveTo(0,-r*1.55);g.lineTo(r*.32,-r*.85);g.lineTo(0,-r*.55);g.lineTo(-r*.32,-r*.85);g.closePath();g.fill();
    g.fillStyle='#fff';g.beginPath();g.ellipse(0,r*.12,r*.42,r*.38,0,0,TAU);g.fill();g.fillStyle='#113';g.beginPath();g.arc(0,r*.24,r*.2,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(-r*.07,r*.16,r*.06,0,TAU);g.fill();return}
  eyes(.1);if(type==='grunt'||type==='brute')fangs();
}
function buildSprites(){for(const t in ED){if(BART[t]){const b=bossStill(t,ED[t].r);SPR[t]={c:b.c,f:b.c,s:b.s};continue}const r=ED[t].r,S=Math.ceil(r*(t==='bat'?5:3.8))*2;const c=mk(S,S,g=>{g.translate(S/2,S/2);g.scale(2,2);paintEnemy(g,t==='clone'?'lich':t,r,ED[t].col)});SPR[t]={c,f:flashOf(c),s:S/2}}}

/* ---------------- heroes ---------------- */
const CLASSES={
  ranger:{n:'Ranger',col:'#1f9f92',hi:'#5fe0cf',dk:'#0d5a54',hp:100,w:'arrow',iv:.42,dmg:10,cap:24,proj:1,sk:'rain',skN:'Rain',cd:12,
    wd:'Fans of arrows. Wide and fast.',sd:'Arrow Rain: arrows fall over the whole corridor for 3 seconds.'},
  mage:{n:'Mage',col:'#6a3fc0',hi:'#a88af0',dk:'#2e1a5e',hp:85,w:'orb',iv:.62,dmg:17,cap:10,proj:1,sk:'nova',skN:'Nova',cd:9,
    wd:'Slow orbs that explode where they hit.',sd:'Frost Nova: freezes everything near you and wipes out nearby shots.'},
  gunner:{n:'Gunner',col:'#d9772b',hi:'#ffb46b',dk:'#6b3410',hp:100,w:'bullet',iv:.1,dmg:3.2,cap:6,proj:1,sk:'grenade',skN:'Bomb',cd:7,
    wd:'A stream of bullets. Aim drifts while you move.',sd:'Grenade: a big blast where the enemies are thickest.'},
  berserker:{n:'Berserker',col:'#b8322e',hi:'#ff7a6b',dk:'#5a1210',hp:130,w:'axe',iv:.62,dmg:11,cap:5,proj:1,sk:'whirl',skN:'Spin',cd:13,
    wd:'Axes fly out and come back, hitting 3 enemies each. More HP, heals on kills.',sd:'Whirlwind: spin for 2 seconds behind a shield. Hits and knocks back everything around you, and nothing hurts you by touching you.'},
};
function drawHero(g,x,y,cls,o={}){
  const C=Object.assign({},CLASSES[cls],o.pal||{}),walk=o.walk||0,pull=o.pull||0,t=o.t||0;if(C.prism){const h=(t*90)%360;C.col=`hsl(${h},62%,50%)`;C.hi=`hsl(${(h+40)%360},95%,78%)`;C.dk=`hsl(${h},65%,20%)`}
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(x,y+13,16,6,0,0,TAU);g.fill();
  const st=Math.sin(walk)*2;g.fillStyle='#3b2a1c';g.beginPath();g.ellipse(x-6,y+8+st,4,5,0,0,TAU);g.ellipse(x+6,y+8-st,4,5,0,0,TAU);g.fill();
  let gr=g.createRadialGradient(x-5,y-4,2,x,y,19);gr.addColorStop(0,C.hi);gr.addColorStop(.6,C.col);gr.addColorStop(1,C.dk);
  g.fillStyle=gr;g.beginPath();g.moveTo(x-15,y+10);g.quadraticCurveTo(x-17,y-8,x,y-14);g.quadraticCurveTo(x+17,y-8,x+15,y+10);g.quadraticCurveTo(x,y+15,x-15,y+10);g.fill();g.strokeStyle=C.dk;g.lineWidth=1.5;g.stroke();
  gr=g.createRadialGradient(x-3,y-8,1,x,y-5,11);gr.addColorStop(0,C.hi);gr.addColorStop(1,C.dk);g.fillStyle=gr;g.beginPath();g.arc(x,y-5,10,0,TAU);g.fill();
  if(cls==='ranger'){g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x-2,y-15,2,18);g.fillStyle='#c58b4a';g.fillRect(x+7,y-4,4,14);
    const by=y-20;g.strokeStyle='#8a5a2b';g.lineWidth=4;g.lineCap='round';g.beginPath();g.arc(x,by+12,17,Math.PI*1.18,Math.PI*1.82);g.stroke();g.strokeStyle='#c58b4a';g.lineWidth=2;g.stroke();
    const ex=Math.cos(Math.PI*1.18)*17,ey=Math.sin(Math.PI*1.18)*17+12;g.strokeStyle='rgba(244,239,230,.8)';g.lineWidth=1;g.beginPath();g.moveTo(x+ex,by+ey);g.lineTo(x,by+3+pull*6);g.lineTo(x-ex,by+ey);g.stroke();
    if(pull<.4){g.strokeStyle='#e8d6b0';g.lineWidth=2;g.beginPath();g.moveTo(x,by+4);g.lineTo(x,by-12);g.stroke();g.fillStyle='#d8dde8';g.beginPath();g.moveTo(x,by-17);g.lineTo(x-3.5,by-10);g.lineTo(x+3.5,by-10);g.fill()}}
  if(cls==='mage'){g.fillStyle=C.dk;g.beginPath();g.moveTo(x-12,y-6);g.quadraticCurveTo(x-2,y-14,x+4,y-30);g.quadraticCurveTo(x+4,y-14,x+12,y-6);g.closePath();g.fill();g.fillStyle='#ffd166';g.fillRect(x-11,y-9,22,3);
    g.strokeStyle='#8a5a2b';g.lineWidth=3;g.beginPath();g.moveTo(x+14,y+10);g.lineTo(x+14,y-22);g.stroke();
    const og=g.createRadialGradient(x+14,y-25,0,x+14,y-25,9+pull*4);og.addColorStop(0,'#fff');og.addColorStop(.4,'#b58bff');og.addColorStop(1,'rgba(181,139,255,0)');g.fillStyle=og;g.beginPath();g.arc(x+14,y-25,10+pull*4,0,TAU);g.fill()}
  if(cls==='gunner'){g.fillStyle='#2a2a33';g.fillRect(x-9,y-9,18,5);g.fillStyle='#7fe7ff';g.beginPath();g.arc(x-4,y-7,2.6,0,TAU);g.arc(x+4,y-7,2.6,0,TAU);g.fill();
    g.fillStyle='#3a3a46';g.fillRect(x-4,y-30+pull*3,8,22);g.fillStyle='#6b6b7a';g.fillRect(x-5.5,y-14+pull*3,11,8);g.fillStyle='#222';g.fillRect(x-2,y-33+pull*3,4,4);
    if(pull>.5){g.fillStyle='#ffe066';g.beginPath();g.moveTo(x,y-44);g.lineTo(x-5,y-33);g.lineTo(x+5,y-33);g.fill()}}
  if(cls==='berserker'){g.fillStyle='#8b90a0';g.beginPath();g.arc(x,y-6,10.5,Math.PI,0);g.fill();g.fillStyle='#efe2c4';for(const s of[-1,1]){g.beginPath();g.moveTo(x+s*8,y-10);g.quadraticCurveTo(x+s*18,y-14,x+s*16,y-24);g.quadraticCurveTo(x+s*14,y-15,x+s*6,y-6);g.fill()}
    if(!o.noAxe){g.strokeStyle='#6b4423';g.lineWidth=3;g.beginPath();g.moveTo(x+13,y+8);g.lineTo(x+13,y-18);g.stroke();g.fillStyle='#c9cdd8';g.beginPath();g.moveTo(x+13,y-18);g.quadraticCurveTo(x+26,y-20,x+24,y-6);g.lineTo(x+13,y-10);g.fill()}}
}

/* ---------------- icons ---------------- */
function arrowIcon(g,x1,y1,x2,y2,w,col){g.strokeStyle=col;g.fillStyle=col;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();const a=Math.atan2(y2-y1,x2-x1),h=w*3.2;g.beginPath();g.moveTo(x2+Math.cos(a)*h*.7,y2+Math.sin(a)*h*.7);g.lineTo(x2+Math.cos(a+2.4)*h,y2+Math.sin(a+2.4)*h);g.lineTo(x2+Math.cos(a-2.4)*h,y2+Math.sin(a-2.4)*h);g.closePath();g.fill()}
function starPath(g,n,ro,ri_){g.beginPath();for(let i=0;i<n*2;i++){const a=i*Math.PI/n-Math.PI/2,r=i%2?ri_:ro;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath()}
function heartPath(g,s){g.beginPath();g.moveTo(0,s*.75);g.bezierCurveTo(-s*1.1,0,-s*.7,-s*.9,0,-s*.35);g.bezierCurveTo(s*.7,-s*.9,s*1.1,0,0,s*.75);g.closePath()}
function flame(g,s,c1='#ff4d1f',c2='#ffd166'){const gr=g.createLinearGradient(0,s,0,-s);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.beginPath();g.moveTo(0,s*.9);g.bezierCurveTo(-s*.9,s*.7,-s*.6,-s*.1,-s*.1,-s*.95);g.bezierCurveTo(-s*.05,-s*.3,s*.35,-s*.4,s*.35,-s*.7);g.bezierCurveTo(s*.95,-s*.1,s*.8,s*.7,0,s*.9);g.fill()}
function flake(g,s,c='#8fe3ff'){g.strokeStyle=c;g.lineWidth=s*.13;g.lineCap='round';for(let i=0;i<3;i++){g.save();g.rotate(i*Math.PI/3);g.beginPath();g.moveTo(0,-s*.9);g.lineTo(0,s*.9);for(const d of[-1,1]){g.moveTo(0,d*s*.55);g.lineTo(s*.25,d*s*.8);g.moveTo(0,d*s*.55);g.lineTo(-s*.25,d*s*.8)}g.stroke();g.restore()}}
function boltShape(g,s,c){g.fillStyle=c;g.beginPath();g.moveTo(s*.2,-s*.95);g.lineTo(-s*.55,s*.12);g.lineTo(-s*.02,s*.12);g.lineTo(-s*.25,s*.95);g.lineTo(s*.55,-s*.18);g.lineTo(s*.02,-s*.18);g.closePath();g.fill()}
function burst(g,s,a='#ff5d3d',b='#ffd166'){g.fillStyle=a;starPath(g,10,s*.95,s*.5);g.fill();g.fillStyle=b;starPath(g,10,s*.6,s*.3);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(0,0,s*.2,0,TAU);g.fill()}
function drop(g,s,c='#9be15d'){g.fillStyle=c;g.beginPath();g.moveTo(0,-s*.95);g.bezierCurveTo(s*.2,-s*.5,s*.7,-s*.05,s*.62,s*.35);g.arc(0,s*.35,s*.62,0,Math.PI);g.bezierCurveTo(-s*.7,-s*.05,-s*.2,-s*.5,0,-s*.95);g.fill()}
function skull(g,s,c='#e8e0cc'){g.fillStyle=c;g.beginPath();g.arc(0,-s*.1,s*.7,0,TAU);g.fill();g.fillRect(-s*.4,s*.3,s*.8,s*.4);g.fillStyle='#1a1020';g.beginPath();g.arc(-s*.27,-s*.1,s*.2,0,TAU);g.arc(s*.27,-s*.1,s*.2,0,TAU);g.fill();g.fillRect(-s*.06,s*.2,s*.12,s*.2)}
function drawIcon(g,k,s){
  g.save();g.lineJoin='round';g.lineCap='round';const Y='#ffd166';
  switch(k){
    case'multi':for(const a of[-.5,0,.5])arrowIcon(g,Math.sin(a)*s*.15,s*.85,Math.sin(a)*s*1.3,-s*.65,s*.11,Y);break;
    case'side':arrowIcon(g,-s*.1,s*.6,-s*.8,-s*.4,s*.12,Y);arrowIcon(g,s*.1,s*.6,s*.8,-s*.4,s*.12,Y);g.strokeStyle='#8a7d9c';g.lineWidth=s*.1;g.beginPath();g.moveTo(-s*.95,-s*.9);g.lineTo(-s*.95,s*.9);g.moveTo(s*.95,-s*.9);g.lineTo(s*.95,s*.9);g.stroke();break;
    case'back':arrowIcon(g,0,-s*.2,0,s*.85,s*.12,Y);arrowIcon(g,0,s*.1,0,-s*.85,s*.12,'#8a7d9c');break;
    case'pierce':g.fillStyle='#e0443d';g.beginPath();g.arc(0,0,s*.42,0,TAU);g.fill();arrowIcon(g,0,s*.9,0,-s*.8,s*.12,Y);break;
    case'ric':g.strokeStyle=Y;g.lineWidth=s*.12;g.beginPath();g.moveTo(-s*.7,s*.8);g.lineTo(-s*.1,-s*.3);g.lineTo(s*.3,s*.2);g.stroke();arrowIcon(g,s*.3,s*.2,s*.8,-s*.7,s*.12,Y);g.fillStyle='#e0443d';g.beginPath();g.arc(-s*.1,-s*.45,s*.2,0,TAU);g.fill();break;
    case'rate':for(const x of[-.5,0,.5])arrowIcon(g,x*s,s*.8-(x===0?s*.3:0),x*s,-s*.5-(x===0?s*.3:0),s*.1,Y);break;
    case'dmg':g.fillStyle='#e8e2f0';g.beginPath();g.moveTo(0,-s*.95);g.lineTo(s*.6,s*.2);g.lineTo(0,-s*.05);g.lineTo(-s*.6,s*.2);g.closePath();g.fill();g.strokeStyle='#c58b4a';g.lineWidth=s*.16;g.beginPath();g.moveTo(0,0);g.lineTo(0,s*.9);g.stroke();break;
    case'crit':g.fillStyle='#ffd166';starPath(g,8,s*.95,s*.42);g.fill();g.fillStyle='#fff6d8';starPath(g,8,s*.45,s*.2);g.fill();break;
    case'fire':flame(g,s);g.fillStyle='#fff3c4';g.beginPath();g.ellipse(0,s*.45,s*.22,s*.32,0,0,TAU);g.fill();break;
    case'ice':case'freeze':flake(g,s);break;
    case'volt':boltShape(g,s,'#c3b0ff');break;
    case'rapid':boltShape(g,s,'#ffd166');break;
    case'poison':drop(g,s);g.fillStyle='rgba(255,255,255,.45)';g.beginPath();g.ellipse(-s*.25,s*.3,s*.1,s*.2,.3,0,TAU);g.fill();break;
    case'expl':case'nuke':burst(g,s);break;
    case'giant':arrowIcon(g,0,s*.9,0,-s*.55,s*.26,Y);break;
    case'homing':g.strokeStyle=Y;g.lineWidth=s*.12;g.beginPath();g.moveTo(-s*.7,s*.8);g.quadraticCurveTo(-s*.7,-s*.4,s*.35,-s*.45);g.stroke();arrowIcon(g,s*.2,-s*.45,s*.55,-s*.45,s*.12,Y);g.fillStyle='#e0443d';g.beginPath();g.arc(s*.62,s*.35,s*.25,0,TAU);g.fill();break;
    case'orbit':g.strokeStyle='rgba(200,210,230,.35)';g.lineWidth=s*.06;g.beginPath();g.arc(0,0,s*.7,0,TAU);g.stroke();g.fillStyle='#2fb7a6';g.beginPath();g.arc(0,0,s*.25,0,TAU);g.fill();for(let i=0;i<3;i++){const a=i*TAU/3;g.save();g.translate(Math.cos(a)*s*.7,Math.sin(a)*s*.7);g.rotate(a+1.2);g.fillStyle='#dfe6f2';g.beginPath();g.moveTo(0,-s*.28);g.quadraticCurveTo(s*.25,0,0,s*.28);g.quadraticCurveTo(s*.08,0,0,-s*.28);g.fill();g.restore()}break;
    case'wisp':{const gr=g.createRadialGradient(0,0,0,0,0,s);gr.addColorStop(0,'#fff');gr.addColorStop(.35,'#7fe7ff');gr.addColorStop(1,'rgba(127,231,255,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,s,0,TAU);g.fill();break}
    case'thunder':g.fillStyle='#8d86a8';g.beginPath();g.arc(-s*.35,-s*.35,s*.35,0,TAU);g.arc(s*.1,-s*.5,s*.42,0,TAU);g.arc(s*.5,-s*.3,s*.32,0,TAU);g.fill();g.fillRect(-s*.65,-s*.4,s*1.4,s*.35);g.save();g.translate(0,s*.35);g.scale(.6,.6);boltShape(g,s,'#ffe066');g.restore();break;
    case'vital':case'heart':g.fillStyle='#ff4d6d';heartPath(g,s*.95);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(-s*.35,-s*.25,s*.15,s*.1,-.6,0,TAU);g.fill();break;
    case'armor':case'shield':g.fillStyle=k==='armor'?'#9fb4d8':'#5fb8ff';g.beginPath();g.moveTo(0,-s*.95);g.lineTo(s*.8,-s*.6);g.quadraticCurveTo(s*.75,s*.5,0,s*.95);g.quadraticCurveTo(-s*.75,s*.5,-s*.8,-s*.6);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(0,-s*.75);g.lineTo(0,s*.7);g.quadraticCurveTo(-s*.55,s*.35,-s*.6,-s*.45);g.closePath();g.fill();break;
    case'regen':g.fillStyle='#4be07a';g.fillRect(-s*.2,-s*.8,s*.4,s*1.6);g.fillRect(-s*.8,-s*.2,s*1.6,s*.4);break;
    case'swift':g.strokeStyle='#7fe7ff';g.lineWidth=s*.14;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-s*.8+i*s*.2,-s*.5+i*s*.5);g.lineTo(s*.3+i*s*.2,-s*.5+i*s*.5);g.stroke()}arrowIcon(g,s*.2,0,s*.9,0,s*.12,'#7fe7ff');break;
    case'power':g.fillStyle='#ffd166';starPath(g,5,s*.95,s*.42);g.fill();break;
    case'storm':for(const x of[-.55,0,.55])arrowIcon(g,x*s,-s*.85+(x?0:s*.25),x*s,s*.55+(x?0:s*.25),s*.11,'#8fe3ff');break;
    case'magnet':g.strokeStyle='#ff4d6d';g.lineWidth=s*.32;g.lineCap='butt';g.beginPath();g.arc(0,-s*.05,s*.5,Math.PI,0,true);g.stroke();g.strokeStyle='#e8e2f0';g.beginPath();g.moveTo(-s*.5,-s*.05);g.lineTo(-s*.5,-s*.55);g.moveTo(s*.5,-s*.05);g.lineTo(s*.5,-s*.55);g.stroke();break;
    // fusions
    case'thermal':g.save();g.translate(-s*.35,0);flame(g,s*.6);g.restore();g.save();g.translate(s*.35,0);flake(g,s*.55);g.restore();break;
    case'plasma':{const gr=g.createLinearGradient(0,s,0,-s);gr.addColorStop(0,'#ff8a3d');gr.addColorStop(1,'#c3b0ff');g.fillStyle=gr;g.beginPath();g.moveTo(0,-s);g.lineTo(s*.25,s*.9);g.lineTo(-s*.25,s*.9);g.closePath();g.fill();g.save();g.scale(.5,.5);boltShape(g,s,'#fff');g.restore();break}
    case'crystal':g.fillStyle='#8fe3ff';g.beginPath();g.moveTo(0,-s);g.lineTo(s*.55,0);g.lineTo(0,s);g.lineTo(-s*.55,0);g.closePath();g.fill();g.save();g.scale(.55,.55);boltShape(g,s,'#fff');g.restore();break;
    case'plague':g.fillStyle='rgba(155,225,93,.35)';g.beginPath();g.arc(0,0,s,0,TAU);g.fill();skull(g,s*.7,'#c8f59a');break;
    case'cluster':for(const [x,y,z] of[[0,-.3,.55],[-.5,.4,.4],[.5,.4,.4]]){g.save();g.translate(x*s,y*s);burst(g,s*z);g.restore()}break;
    case'nova':for(let i=0;i<8;i++){const a=i*TAU/8;arrowIcon(g,Math.cos(a)*s*.2,Math.sin(a)*s*.2,Math.cos(a)*s*.85,Math.sin(a)*s*.85,s*.08,Y)}break;
    case'halo':g.strokeStyle='#ffe066';g.lineWidth=s*.1;g.beginPath();g.arc(0,0,s*.7,0,TAU);g.stroke();g.save();g.scale(.6,.6);boltShape(g,s,'#ffe066');g.restore();break;
    case'exec':g.fillStyle='#c9cdd8';g.beginPath();g.moveTo(-s*.1,-s*.95);g.quadraticCurveTo(s*.9,-s*.7,s*.8,s*.1);g.lineTo(-s*.1,-s*.2);g.closePath();g.fill();g.strokeStyle='#6b4423';g.lineWidth=s*.16;g.beginPath();g.moveTo(-s*.1,-s*.9);g.lineTo(-s*.1,s*.95);g.stroke();break;
    case'ballista':arrowIcon(g,0,s*.95,0,-s*.5,s*.3,'#e8e2f0');g.strokeStyle='#ff4d6d';g.lineWidth=s*.08;g.beginPath();g.arc(0,-s*.2,s*.6,Math.PI*1.1,Math.PI*1.9);g.stroke();break;
    case'swarm':for(const [x,y] of[[-.45,.3],[.45,.3],[0,-.4]]){g.save();g.translate(x*s,y*s);const gr=g.createRadialGradient(0,0,0,0,0,s*.45);gr.addColorStop(0,'#fff');gr.addColorStop(.4,'#7fe7ff');gr.addColorStop(1,'rgba(127,231,255,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,s*.45,0,TAU);g.fill();g.restore()}break;
    // curses
    case'glass':g.strokeStyle='#bfe8ff';g.lineWidth=s*.1;g.beginPath();g.moveTo(-s*.5,-s*.9);g.lineTo(s*.5,-s*.9);g.lineTo(s*.35,s*.9);g.lineTo(-s*.35,s*.9);g.closePath();g.stroke();g.beginPath();g.moveTo(-s*.2,-s*.4);g.lineTo(s*.1,0);g.lineTo(-s*.1,s*.3);g.stroke();break;
    case'overdraw':arrowIcon(g,0,s*.9,0,-s*.6,s*.18,'#ff4d6d');g.strokeStyle='#8a5a2b';g.lineWidth=s*.14;g.beginPath();g.arc(0,s*.3,s*.8,Math.PI*1.2,Math.PI*1.8);g.stroke();break;
    case'frenzy':boltShape(g,s,'#ff4d6d');break;
    case'heavy':g.fillStyle='#6b4423';g.beginPath();g.roundRect(-s*.45,-s*.5,s*.9,s*1.4,s*.2);g.fill();for(const x of[-.25,0,.25])arrowIcon(g,x*s,-s*.3,x*s,-s*.95,s*.08,Y);break;
    case'greed':g.fillStyle='#ffd166';for(let i=0;i<3;i++){g.beginPath();g.ellipse(0,s*.5-i*s*.4,s*.7,s*.22,0,0,TAU);g.fill();g.strokeStyle='#b8820c';g.lineWidth=s*.06;g.stroke()}break;
    case'blood':drop(g,s,'#d91e3a');break;
    case'berserk':g.fillStyle='#d91e3a';heartPath(g,s*.95);g.fill();g.strokeStyle='#1a0a0e';g.lineWidth=s*.1;g.beginPath();g.moveTo(-s*.05,-s*.35);g.lineTo(s*.1,0);g.lineTo(-s*.1,s*.25);g.lineTo(s*.05,s*.6);g.stroke();break;
    case'hunted':g.strokeStyle='#ff4d6d';g.lineWidth=s*.12;g.beginPath();g.arc(0,0,s*.7,0,TAU);g.stroke();g.beginPath();g.arc(0,0,s*.3,0,TAU);g.stroke();g.beginPath();g.moveTo(-s,0);g.lineTo(-s*.45,0);g.moveTo(s,0);g.lineTo(s*.45,0);g.moveTo(0,-s);g.lineTo(0,-s*.45);g.moveTo(0,s);g.lineTo(0,s*.45);g.stroke();break;
    // relics
    case'phoenix':g.save();g.scale(1,1.1);flame(g,s,'#ff3d1f','#ffe066');g.restore();break;
    case'hourglass':g.fillStyle='#c58b4a';g.fillRect(-s*.6,-s*.95,s*1.2,s*.18);g.fillRect(-s*.6,s*.77,s*1.2,s*.18);g.fillStyle='rgba(180,220,255,.5)';g.beginPath();g.moveTo(-s*.45,-s*.77);g.lineTo(s*.45,-s*.77);g.lineTo(0,0);g.lineTo(s*.45,s*.77);g.lineTo(-s*.45,s*.77);g.lineTo(0,0);g.closePath();g.fill();g.fillStyle='#ffd166';g.beginPath();g.moveTo(-s*.25,s*.77);g.lineTo(s*.25,s*.77);g.lineTo(0,s*.35);g.fill();break;
    case'thorn':g.fillStyle='#6b8f3a';g.beginPath();g.arc(0,0,s*.55,0,TAU);g.fill();g.fillStyle='#d8e6b0';for(let i=0;i<8;i++){const a=i*TAU/8;g.beginPath();g.moveTo(Math.cos(a-.2)*s*.5,Math.sin(a-.2)*s*.5);g.lineTo(Math.cos(a)*s,Math.sin(a)*s);g.lineTo(Math.cos(a+.2)*s*.5,Math.sin(a+.2)*s*.5);g.fill()}break;
    case'echo':for(const d of[-.3,.3])arrowIcon(g,d*s,s*.8,d*s,-s*.7,s*.11,d<0?'rgba(255,209,102,.5)':Y);break;
    case'fang':g.fillStyle='#fff';for(const s2 of[-1,1]){g.beginPath();g.moveTo(s2*s*.5,-s*.7);g.lineTo(s2*s*.1,-s*.7);g.lineTo(s2*s*.3,s*.8);g.fill()}g.fillStyle='#d91e3a';g.beginPath();g.arc(s*.3,s*.85,s*.12,0,TAU);g.fill();break;
    case'boots':g.fillStyle='#6b4423';g.beginPath();g.moveTo(-s*.4,-s*.9);g.lineTo(s*.2,-s*.9);g.lineTo(s*.2,s*.3);g.lineTo(s*.8,s*.5);g.lineTo(s*.8,s*.9);g.lineTo(-s*.4,s*.9);g.closePath();g.fill();g.save();g.translate(-s*.1,-s*.1);g.scale(.45,.45);boltShape(g,s,'#ffe066');g.restore();break;
    case'crown':g.fillStyle='#ffd166';g.beginPath();g.moveTo(-s*.9,s*.5);g.lineTo(-s*.9,-s*.5);g.lineTo(-s*.45,0);g.lineTo(0,-s*.8);g.lineTo(s*.45,0);g.lineTo(s*.9,-s*.5);g.lineTo(s*.9,s*.5);g.closePath();g.fill();g.fillStyle='#d91e3a';g.beginPath();g.arc(0,s*.15,s*.16,0,TAU);g.fill();break;
    case'iron':g.fillStyle='#8b90a0';heartPath(g,s*.95);g.fill();g.strokeStyle='#c9cdd8';g.lineWidth=s*.08;g.stroke();break;
    case'clover':g.fillStyle='#4be07a';for(let i=0;i<4;i++){const a=i*TAU/4+Math.PI/4;g.beginPath();g.arc(Math.cos(a)*s*.38,Math.sin(a)*s*.38,s*.36,0,TAU);g.fill()}break;
    case'mark':g.strokeStyle='#ffd166';g.lineWidth=s*.14;g.beginPath();g.arc(0,0,s*.7,0,TAU);g.stroke();g.fillStyle='#ff4d6d';g.beginPath();g.arc(0,0,s*.25,0,TAU);g.fill();break;
    case'charm':g.fillStyle='#ff6bd6';heartPath(g,s*.8);g.fill();g.strokeStyle='#fff';g.lineWidth=s*.08;g.stroke();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(-s*.28,-s*.2,s*.12,0,TAU);g.fill();break;
    case'purse':g.fillStyle='#8a5a30';g.beginPath();g.moveTo(-s*.35,-s*.55);g.lineTo(s*.35,-s*.55);g.lineTo(s*.2,-s*.3);g.quadraticCurveTo(s*.9,s*.1,s*.6,s*.8);g.lineTo(-s*.6,s*.8);g.quadraticCurveTo(-s*.9,s*.1,-s*.2,-s*.3);g.closePath();g.fill();g.fillStyle='#ffd166';g.beginPath();g.arc(0,s*.3,s*.28,0,TAU);g.fill();break;
    case'ring':g.strokeStyle='#ffd166';g.lineWidth=s*.22;g.beginPath();g.arc(0,s*.15,s*.55,0,TAU);g.stroke();g.fillStyle='#7fe7ff';g.beginPath();g.moveTo(0,-s*.95);g.lineTo(s*.28,-s*.6);g.lineTo(0,-s*.35);g.lineTo(-s*.28,-s*.6);g.closePath();g.fill();break;
    case'quiver':g.fillStyle='#8a5a30';g.beginPath();g.roundRect(-s*.35,-s*.2,s*.7,s*1.1,s*.15);g.fill();for(const x of[-.2,0,.2])arrowIcon(g,x*s,s*.1,x*s*1.6,-s*.9,s*.09,'#ffd166');break;
    case'whet':g.save();g.rotate(-.5);g.fillStyle='#8b90a0';g.beginPath();g.roundRect(-s*.8,-s*.25,s*1.6,s*.5,s*.15);g.fill();g.fillStyle='#c9cdd8';g.fillRect(-s*.7,-s*.25,s*1.4,s*.12);g.restore();g.strokeStyle='#ffe066';g.lineWidth=s*.08;for(const [x,y] of[[.55,-.6],[.8,-.3],[.3,-.85]]){g.beginPath();g.moveTo(x*s,y*s);g.lineTo(x*s+s*.18,y*s-s*.18);g.stroke()}break;
    case'feather':g.save();g.rotate(.5);g.fillStyle='#f5efe4';g.beginPath();g.moveTo(0,-s*.95);g.quadraticCurveTo(s*.55,-s*.2,0,s*.8);g.quadraticCurveTo(-s*.55,-s*.2,0,-s*.95);g.fill();g.strokeStyle='#8a7a60';g.lineWidth=s*.07;g.beginPath();g.moveTo(0,-s*.8);g.lineTo(0,s*.95);g.stroke();g.restore();break;
    case'spring':drop(g,s,'#7fe7ff');g.fillStyle='#fff';g.fillRect(-s*.08,-s*.1,s*.16,s*.6);g.fillRect(-s*.3,s*.12,s*.6,s*.16);break;
    case'mirror':g.fillStyle='#c9cdd8';g.beginPath();g.moveTo(0,-s*.9);g.lineTo(s*.75,-s*.55);g.quadraticCurveTo(s*.7,s*.5,0,s*.95);g.quadraticCurveTo(-s*.7,s*.5,-s*.75,-s*.55);g.closePath();g.fill();g.fillStyle='#7fe7ff';g.beginPath();g.arc(0,-s*.05,s*.38,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(-s*.12,-s*.18,s*.12,0,TAU);g.fill();break;
    case'keg':g.fillStyle='#8a5a30';g.beginPath();g.ellipse(0,s*.1,s*.6,s*.75,0,0,TAU);g.fill();g.strokeStyle='#4a3020';g.lineWidth=s*.1;for(const y of[-.3,.5]){g.beginPath();g.moveTo(-s*.58,y*s);g.lineTo(s*.58,y*s);g.stroke()}g.strokeStyle='#c9cdd8';g.lineWidth=s*.07;g.beginPath();g.moveTo(0,-s*.6);g.quadraticCurveTo(s*.3,-s*.9,s*.5,-s*.85);g.stroke();g.fillStyle='#ffe066';g.beginPath();g.arc(s*.55,-s*.85,s*.13,0,TAU);g.fill();break;
    case'frost':g.strokeStyle='#bfe8ff';g.lineWidth=s*.12;g.lineCap='round';for(let i=0;i<3;i++){g.save();g.rotate(i*Math.PI/3);g.beginPath();g.moveTo(0,-s*.9);g.lineTo(0,s*.9);g.moveTo(-s*.25,-s*.65);g.lineTo(0,-s*.45);g.lineTo(s*.25,-s*.65);g.moveTo(-s*.25,s*.65);g.lineTo(0,s*.45);g.lineTo(s*.25,s*.65);g.stroke();g.restore()}break;
    case'lens':g.strokeStyle='#ffd166';g.lineWidth=s*.14;g.beginPath();g.arc(-s*.15,-s*.15,s*.5,0,TAU);g.stroke();g.fillStyle='rgba(127,231,255,.45)';g.fill();g.strokeStyle='#8a5a30';g.lineWidth=s*.2;g.lineCap='round';g.beginPath();g.moveTo(s*.22,s*.22);g.lineTo(s*.75,s*.75);g.stroke();break;
    case'drum':g.fillStyle='#d91e3a';g.fillRect(-s*.65,-s*.35,s*1.3,s*.9);g.fillStyle='#f5efe4';g.beginPath();g.ellipse(0,-s*.35,s*.65,s*.22,0,0,TAU);g.fill();g.strokeStyle='#ffd166';g.lineWidth=s*.07;g.beginPath();g.moveTo(-s*.65,-s*.2);g.lineTo(-s*.2,s*.5);g.lineTo(s*.2,-s*.2);g.lineTo(s*.65,s*.5);g.stroke();g.strokeStyle='#8a5a30';g.lineWidth=s*.09;g.beginPath();g.moveTo(-s*.2,-s*.55);g.lineTo(-s*.75,-s*.95);g.moveTo(s*.2,-s*.55);g.lineTo(s*.75,-s*.95);g.stroke();break;
    case'tooth':g.fillStyle='#ffd166';g.beginPath();g.moveTo(-s*.6,-s*.6);g.quadraticCurveTo(0,-s*.95,s*.6,-s*.6);g.quadraticCurveTo(s*.7,0,s*.4,s*.3);g.lineTo(s*.3,s*.9);g.lineTo(s*.05,s*.3);g.lineTo(-s*.05,s*.3);g.lineTo(-s*.3,s*.9);g.lineTo(-s*.4,s*.3);g.quadraticCurveTo(-s*.7,0,-s*.6,-s*.6);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(-s*.25,-s*.45,s*.15,s*.08,0,0,TAU);g.fill();break;
    case'plug':g.fillStyle='#3a3d48';g.beginPath();g.arc(0,0,s*.8,0,TAU);g.fill();g.save();g.scale(.75,.75);boltShape(g,s,'#ffe066');g.restore();break;
    case'magnet':g.strokeStyle='#d91e3a';g.lineWidth=s*.38;g.beginPath();g.arc(0,-s*.05,s*.5,Math.PI,0);g.stroke();g.beginPath();g.moveTo(-s*.5,-s*.05);g.lineTo(-s*.5,s*.5);g.moveTo(s*.5,-s*.05);g.lineTo(s*.5,s*.5);g.stroke();g.fillStyle='#c9cdd8';g.fillRect(-s*.69,s*.45,s*.38,s*.35);g.fillRect(s*.31,s*.45,s*.38,s*.35);break;
    case'wenh':g.fillStyle='#ffd166';starPath(g,5,s*.95,s*.42);g.fill();g.strokeStyle='#8a5a00';g.lineWidth=s*.07;g.stroke();arrowIcon(g,0,s*.35,0,-s*.45,s*.14,'#2a1d00');break;
    case'coin':g.fillStyle='#ffd166';g.beginPath();g.arc(0,0,s*.8,0,TAU);g.fill();g.fillStyle='#b8820c';g.beginPath();g.arc(0,0,s*.55,0,TAU);g.fill();break;
    case'chest':g.fillStyle='#8a5a30';g.fillRect(-s*.8,-s*.3,s*1.6,s*1.0);g.fillStyle='#a8703c';g.beginPath();g.roundRect(-s*.8,-s*.8,s*1.6,s*.55,s*.2);g.fill();g.fillStyle='#ffd166';g.fillRect(-s*.8,-s*.32,s*1.6,s*.1);g.fillRect(-s*.12,-s*.4,s*.24,s*.32);break;
  }
  g.restore();
}

/* ---------------- audio ---------------- */
let AC=null,muted=false,noiseBuf=null;const sfxLast={};
function audioInit(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();noiseBuf=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}catch(e){AC=null}}if(AC&&AC.state==='suspended')AC.resume()}
function thr(k,ms){const n=performance.now();if(sfxLast[k]&&n-sfxLast[k]<ms)return true;sfxLast[k]=n;return false}
function tone(f,dur,type,vol,slide=0,delay=0){if(!AC||muted)return;const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+dur+.02)}
function noise(dur,vol,freq){if(!AC||muted)return;const t=AC.currentTime,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseBuf;f.type='lowpass';f.frequency.setValueAtTime(freq,t);f.frequency.exponentialRampToValueAtTime(60,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f).connect(g).connect(AC.destination);s.start(t);s.stop(t+dur)}
const sfx={
  shoot(){if(thr('s',75))return;const c=P&&P.cls;if(c==='gunner')tone(rnd(180,240),.04,'square',.012,-60);else if(c==='mage')tone(rnd(500,600),.08,'sine',.02,300);else if(c==='berserker')noise(.06,.02,3000);else tone(rnd(820,980),.05,'triangle',.018,-420)},
  hit(){if(thr('h',45))return;tone(rnd(300,380),.04,'square',.012,-120)},
  kill(){if(thr('k',55))return;tone(rnd(180,240),.09,'square',.022,-110);noise(.06,.03,2200)},
  gate(good){if(good){[523,659,784,1046].forEach((f,i)=>tone(f,.12,'square',.035,0,i*.05))}else{tone(300,.25,'sawtooth',.04,-180)}},
  grow(){if(thr('g',70))return;tone(rnd(900,1100),.04,'sine',.02,200)},
  level(){[392,523,659,784,1046].forEach((f,i)=>tone(f,.16,'triangle',.05,0,i*.06))},
  curse(){[220,207,196,185].forEach((f,i)=>tone(f,.25,'sawtooth',.04,0,i*.08))},
  fuse(){[523,784,1046,1568].forEach((f,i)=>tone(f,.2,'sine',.05,0,i*.07));noise(.4,.05,6000)},
  boom(){if(thr('b',60))return;noise(.45,.12,900);tone(90,.35,'sine',.08,-50)},
  hurt(){tone(160,.2,'sawtooth',.06,-90);noise(.15,.05,1200)},
  pick(){[660,880,1320].forEach((f,i)=>tone(f,.09,'sine',.05,0,i*.045))},
  coin(){if(thr('cn',50))return;tone(rnd(1500,1700),.05,'square',.012);tone(2200,.06,'square',.01,0,.04)},
  gem(){if(thr('gm',40))return;tone(rnd(1200,1500),.05,'sine',.018)},
  boss(){tone(110,.9,'sawtooth',.06,-40);tone(82,.9,'sawtooth',.05,-20,.1)},
  zap(){if(thr('z',60))return;noise(.08,.04,5000);tone(1400,.06,'square',.012,-900)},
  warn(){if(thr('w',120))return;tone(880,.08,'square',.02);tone(660,.08,'square',.02,0,.09)},
  dash(){noise(.12,.05,4000);tone(500,.1,'sine',.03,500)},
  laser(){if(thr('l',100))return;tone(1200,.3,'sawtooth',.03,-900)},
  parry(){[880,1320,1760].forEach((f,i)=>tone(f,.1,'square',.04,0,i*.03));noise(.1,.05,8000)},
  ko(){[392,330,262,196].forEach((f,i)=>tone(f,.25,'square',.05,0,i*.12));noise(.6,.1,1500)},
  skill(){[330,440,660].forEach((f,i)=>tone(f,.14,'square',.04,0,i*.04));noise(.2,.05,3000)},
};
