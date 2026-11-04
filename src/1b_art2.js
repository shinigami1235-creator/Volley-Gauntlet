
/* ================= art pass 2: distinct enemy bodies and floor decoration ================= */
// Enemies use flat two-tone shading (a lit side and a shadow crescent) and each common type has its own body shape,
// so a crowd reads as different enemies instead of one mass of round faces.
let ART2=true;
// Brighter, warmer floors than the original dark stone, like the mobile ads the game is built from. Enemies and shots read against them.
const FLOOR2={};function floor2(k,floor,grout,o={}){FLOOR2[k]=()=>Object.assign({},BIOMES[k],{floor,grout},o)}
floor2('dungeon',['#77708a','#6f6883','#7e7791','#686179'],'#2c2836',{moss:'rgba(110,150,80,.3)'});
floor2('frozen',['#8fb0c8','#87a8c0','#97b8d0','#7fa0b8'],'#2c4256');
floor2('forge',['#8a6152','#82594b','#926959','#7a5245'],'#2e1a14');
floor2('ruins',['#6f9a86','#67927e','#77a28e','#5f8a76'],'#1c3a30');
floor2('sky',['#b08e66','#a8865e','#b8966e','#a07e56'],'#4a3420');
floor2('ad',['#6e5aa8','#6652a0','#7662b0','#5e4a98'],'#241a48');
function cel(g,col,r,path,lx=-.18,ly=-.24,lw){
  g.save();g.beginPath();path();g.fillStyle=shade(col,-.34);g.fill();g.clip();
  g.fillStyle=col;g.beginPath();g.ellipse(r*lx,r*ly,r*.98,r*.92,0,0,TAU);g.fill();
  g.fillStyle='rgba(255,255,255,.2)';g.beginPath();g.ellipse(r*(lx-.28),r*(ly-.36),r*.36,r*.2,-.5,0,TAU);g.fill();g.restore();
  g.beginPath();path();g.strokeStyle=shade(col,-.72);g.lineWidth=lw||Math.max(1.3,r*.08);g.lineJoin='round';g.stroke()}
function eyes2(g,r,y,sp=.3,sz=1,pup='#140a10',brow=true){
  for(const s of[-1,1]){g.fillStyle='#fff';g.beginPath();g.ellipse(s*r*sp,r*y,r*.2*sz,r*.23*sz,0,0,TAU);g.fill();
    g.fillStyle=pup;g.beginPath();g.arc(s*r*(sp-.03),r*(y+.06),r*.11*sz,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(s*r*(sp-.06),r*(y+.01),r*.035*sz,0,TAU);g.fill()}
  if(brow){g.strokeStyle='rgba(20,5,10,.9)';g.lineWidth=r*.1;g.lineCap='round';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*(sp+.24),r*(y-.27));g.lineTo(s*r*(sp-.16),r*(y-.13));g.stroke()}}}
function glow2(g,r,y,c,sp=.3,sz=.12){g.save();for(const s of[-1,1]){g.fillStyle=c;g.shadowColor=c;g.shadowBlur=r*.5;g.beginPath();g.ellipse(s*r*sp,r*y,r*sz*1.35,r*sz,s*-.25,0,TAU);g.fill()}g.restore()}
const PAINT2={
  // imp with a club: squat pear body, little horns, pointed ears
  grunt(g,r,col){
    g.save();g.translate(r*.95,r*.1);g.rotate(-.5);g.fillStyle='#8a5a30';g.strokeStyle='#3a2410';g.lineWidth=1.4;g.beginPath();g.moveTo(-r*.08,r*.6);g.lineTo(-r*.16,-r*.4);g.quadraticCurveTo(0,-r*.95,r*.2,-r*.45);g.lineTo(r*.08,r*.6);g.closePath();g.fill();g.stroke();
      g.fillStyle='#d8cdb4';for(const [x,y] of[[-.12,-.5],[.12,-.35],[0,-.7]]){g.beginPath();g.arc(r*x,r*y,r*.06,0,TAU);g.fill()}g.restore();
    for(const s of[-1,1]){g.fillStyle=shade(col,-.15);g.strokeStyle=shade(col,-.72);g.lineWidth=1.3;g.beginPath();g.moveTo(s*r*.5,-r*.35);g.lineTo(s*r*1.25,-r*.7);g.lineTo(s*r*.72,r*.05);g.closePath();g.fill();g.stroke()}
    cel(g,col,r,()=>{g.moveTo(0,-r*.82);g.quadraticCurveTo(r*.72,-r*.8,r*.86,r*.15);g.quadraticCurveTo(r*.95,r*.9,0,r*.9);g.quadraticCurveTo(-r*.95,r*.9,-r*.86,r*.15);g.quadraticCurveTo(-r*.72,-r*.8,0,-r*.82)});
    for(const s of[-1,1]){g.fillStyle='#f3e6c8';g.strokeStyle='#5a3a20';g.lineWidth=1;g.beginPath();g.moveTo(s*r*.22,-r*.72);g.quadraticCurveTo(s*r*.5,-r*1.05,s*r*.42,-r*1.28);g.quadraticCurveTo(s*r*.32,-r*1.0,s*r*.05,-r*.78);g.closePath();g.fill();g.stroke()}
    g.fillStyle='rgba(255,220,200,.35)';g.beginPath();g.ellipse(0,r*.45,r*.45,r*.3,0,0,TAU);g.fill();
    eyes2(g,r,-.12,.28);g.fillStyle='#2a0a10';g.beginPath();g.moveTo(-r*.32,r*.28);g.quadraticCurveTo(0,r*.6,r*.32,r*.28);g.closePath();g.fill();g.fillStyle='#fff';for(const x of[-.18,0,.18]){g.beginPath();g.moveTo(r*(x-.07),r*.29);g.lineTo(r*x,r*.42);g.lineTo(r*(x+.07),r*.29);g.fill()}},
  // fast kobold: tall lean teardrop leaning forward, long ears, bushy tail
  runner(g,r,col){
    g.fillStyle=shade(col,-.1);g.strokeStyle=shade(col,-.72);g.lineWidth=1.3;g.beginPath();g.moveTo(-r*.35,r*.55);g.quadraticCurveTo(-r*1.7,r*.9,-r*1.5,-r*.2);g.quadraticCurveTo(-r*1.25,r*.3,-r*.4,r*.2);g.closePath();g.fill();g.stroke();
    g.fillStyle='#fff6e0';g.beginPath();g.moveTo(-r*1.5,-r*.2);g.quadraticCurveTo(-r*1.62,r*.2,-r*1.35,r*.35);g.quadraticCurveTo(-r*1.38,r*.05,-r*1.5,-r*.2);g.fill();
    for(const s of[-1,1]){cel(g,col,r*.5,()=>{g.moveTo(s*r*.12,-r*.72);g.lineTo(s*r*.48,-r*1.75);g.lineTo(s*r*.6,-r*.5);g.closePath()});g.fillStyle='#ffd9b0';g.beginPath();g.moveTo(s*r*.22,-r*.75);g.lineTo(s*r*.46,-r*1.45);g.lineTo(s*r*.5,-r*.62);g.fill()}
    cel(g,col,r,()=>{g.moveTo(r*.1,-r*1.0);g.quadraticCurveTo(r*.85,-r*.75,r*.72,r*.3);g.quadraticCurveTo(r*.55,r*1.0,0,r*1.0);g.quadraticCurveTo(-r*.62,r*1.0,-r*.66,r*.25);g.quadraticCurveTo(-r*.7,-r*.75,r*.1,-r*1.0)});
    g.fillStyle='#fff6e0';g.beginPath();g.ellipse(r*.05,r*.4,r*.4,r*.42,0,0,TAU);g.fill();
    g.fillStyle='#1a0e0a';g.beginPath();g.ellipse(r*.08,r*.16,r*.12,r*.08,0,0,TAU);g.fill();
    eyes2(g,r,-.3,.26,.85,'#1a0e0a',false);g.strokeStyle='rgba(20,5,10,.9)';g.lineWidth=r*.08;g.lineCap='round';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.48,-r*.56);g.lineTo(s*r*.14,-r*.46);g.stroke()}},
  // brute: broad-shouldered trapezoid with a horned helmet and big fists
  brute(g,r,col){
    for(const s of[-1,1]){g.save();g.translate(s*r*1.02,r*.45);cel(g,shade(col,.05),r*.36,()=>g.arc(0,0,r*.36,0,TAU));g.strokeStyle=shade(col,-.6);g.lineWidth=1.2;g.beginPath();for(const k of[-1,0,1]){g.moveTo(k*r*.12,-r*.3);g.lineTo(k*r*.12,-r*.12)}g.stroke();g.restore()}
    cel(g,col,r,()=>{g.moveTo(-r*1.1,-r*.45);g.quadraticCurveTo(-r*1.05,-r*.8,-r*.5,-r*.82);g.lineTo(r*.5,-r*.82);g.quadraticCurveTo(r*1.05,-r*.8,r*1.1,-r*.45);g.lineTo(r*.75,r*.82);g.quadraticCurveTo(0,r*.98,-r*.75,r*.82);g.closePath()});
    for(const s of[-1,1]){g.fillStyle='#8f93a3';g.strokeStyle='#33363f';g.lineWidth=1.8;g.beginPath();g.ellipse(s*r*.82,-r*.52,r*.38,r*.27,0,Math.PI,TAU);g.closePath();g.fill();g.stroke();g.fillStyle='#dfe3ec';g.beginPath();g.moveTo(s*r*.7,-r*.75);g.lineTo(s*r*.82,-r*1.02);g.lineTo(s*r*.94,-r*.74);g.fill()}
    g.fillStyle='#4a2a14';g.fillRect(-r*.8,r*.4,r*1.6,r*.17);g.fillStyle='#e0b24a';g.strokeStyle='#5a3a10';g.lineWidth=1.2;g.beginPath();g.roundRect(-r*.14,r*.36,r*.28,r*.25,2);g.fill();g.stroke();
    cel(g,'#8f93a3',r*.45,()=>{g.arc(0,-r*.55,r*.45,Math.PI,TAU);g.lineTo(r*.45,-r*.35);g.lineTo(-r*.45,-r*.35);g.closePath()});
    for(const s of[-1,1]){g.fillStyle='#efe2c4';g.strokeStyle='#5a3a20';g.lineWidth=1;g.beginPath();g.moveTo(s*r*.36,-r*.75);g.quadraticCurveTo(s*r*.75,-r*1.1,s*r*.62,-r*1.45);g.quadraticCurveTo(s*r*.5,-r*1.05,s*r*.2,-r*.85);g.closePath();g.fill();g.stroke()}
    g.fillStyle='#120a10';g.fillRect(-r*.32,-r*.58,r*.64,r*.12);glow2(g,r,-.52,'#ffcf4a',.16,.07);
    g.fillStyle='#fff6e0';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.12,-r*.12);g.lineTo(s*r*.2,-r*.42);g.lineTo(s*r*.28,-r*.12);g.fill()}},
  // knight behind a tower shield: the shield is the silhouette
  shield(g,r,col){
    g.strokeStyle='#5a3a20';g.lineWidth=r*.12;g.lineCap='round';g.beginPath();g.moveTo(r*.98,r*.6);g.lineTo(r*.98,-r*1.45);g.stroke();g.fillStyle='#dfe3ec';g.strokeStyle='#4a5060';g.lineWidth=1.2;g.beginPath();g.moveTo(r*.86,-r*1.4);g.lineTo(r*.98,-r*1.9);g.lineTo(r*1.1,-r*1.4);g.closePath();g.fill();g.stroke();
    cel(g,col,r,()=>g.roundRect(-r*.7,-r*1.0,r*1.4,r*1.5,r*.5));
    cel(g,'#9aa1b4',r*.6,()=>{g.arc(0,-r*.62,r*.55,Math.PI,TAU);g.lineTo(r*.58,-r*.42);g.lineTo(-r*.58,-r*.42);g.closePath()});
    g.fillStyle='#141a28';g.fillRect(-r*.4,-r*.6,r*.8,r*.13);glow2(g,r,-.54,'#8fe3ff',.17,.07);
    g.fillStyle='#e0443d';g.beginPath();g.moveTo(-r*.05,-r*1.15);g.quadraticCurveTo(-r*.15,-r*1.7,r*.5,-r*1.5);g.quadraticCurveTo(r*.1,-r*1.35,r*.1,-r*1.1);g.closePath();g.fill();
    cel(g,'#c9cdd8',r,()=>{g.moveTo(-r*.95,-r*.35);g.lineTo(r*.95,-r*.35);g.lineTo(r*.9,r*.55);g.quadraticCurveTo(0,r*1.15,-r*.9,r*.55);g.closePath()},-.2,-.3);
    g.fillStyle=col;g.beginPath();g.moveTo(-r*.68,-r*.2);g.lineTo(r*.68,-r*.2);g.lineTo(r*.64,r*.45);g.quadraticCurveTo(0,r*.92,-r*.64,r*.45);g.closePath();g.fill();
    g.fillStyle='#ffd166';g.strokeStyle='#7a5a10';g.lineWidth=1;g.beginPath();g.moveTo(0,-r*.1);g.lineTo(r*.2,r*.15);g.lineTo(0,r*.5);g.lineTo(-r*.2,r*.15);g.closePath();g.fill();g.stroke()},
  // slime with the cores it splits into visible inside
  splitter(g,r,col){
    const path=()=>{g.moveTo(-r*1.05,r*.5);g.quadraticCurveTo(-r*1.1,-r*.92,0,-r*.95);g.quadraticCurveTo(r*1.1,-r*.92,r*1.05,r*.5);g.quadraticCurveTo(r*.95,r*.85,r*.5,r*.8);g.quadraticCurveTo(r*.35,r*1.05,r*.18,r*.8);g.quadraticCurveTo(-r*.6,r*.86,-r*1.05,r*.5)};
    cel(g,col,r,path);g.save();g.beginPath();path();g.clip();g.fillStyle='rgba(20,70,25,.45)';for(const [x,y] of[[-.45,.25],[.42,.2],[0,.5]]){g.beginPath();g.arc(r*x,r*y,r*.2,0,TAU);g.fill()}g.restore();
    g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(-r*.45,-r*.52,r*.22,r*.11,-.5,0,TAU);g.fill();eyes2(g,r,-.18,.32,.95,'#0e3a14')},
  mini(g,r,col){cel(g,col,r,()=>{g.moveTo(-r,r*.55);g.quadraticCurveTo(-r*1.05,-r*.95,0,-r*.95);g.quadraticCurveTo(r*1.05,-r*.95,r,r*.55);g.quadraticCurveTo(0,r*.95,-r,r*.55)});g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(-r*.4,-r*.5,r*.24,r*.12,-.5,0,TAU);g.fill();eyes2(g,r,0,.32,1.05,'#0e3a14',false)},
  // hooded caster: a tall robe cone with one glowing eye and an orb
  shooter(g,r,col){
    cel(g,col,r,()=>{g.moveTo(0,-r*1.35);g.quadraticCurveTo(r*.55,-r*.9,r*.7,-r*.1);g.lineTo(r*1.0,r*.95);g.quadraticCurveTo(0,r*1.08,-r*1.0,r*.95);g.lineTo(-r*.7,-r*.1);g.quadraticCurveTo(-r*.55,-r*.9,0,-r*1.35)});
    g.strokeStyle='#ffd166';g.lineWidth=1.5;g.beginPath();g.moveTo(-r*.92,r*.78);g.quadraticCurveTo(0,r*.95,r*.92,r*.78);g.moveTo(0,r*.05);g.lineTo(0,r*.9);g.stroke();
    g.fillStyle='#071010';g.beginPath();g.ellipse(0,-r*.42,r*.44,r*.4,0,0,TAU);g.fill();
    g.save();g.fillStyle='#7dfff0';g.shadowColor='#7dfff0';g.shadowBlur=r*.6;g.beginPath();g.ellipse(0,-r*.42,r*.2,r*.15,0,0,TAU);g.fill();g.restore();g.fillStyle='#071010';g.beginPath();g.ellipse(0,-r*.42,r*.07,r*.12,0,0,TAU);g.fill();
    const og=g.createRadialGradient(0,r*.38,0,0,r*.38,r*.38);og.addColorStop(0,'#fff');og.addColorStop(.4,'#c28bff');og.addColorStop(1,'rgba(194,139,255,0)');g.fillStyle=og;g.beginPath();g.arc(0,r*.38,r*.38,0,TAU);g.fill();
    g.fillStyle=shade(col,-.4);for(const s of[-1,1]){g.beginPath();g.ellipse(s*r*.42,r*.38,r*.2,r*.17,0,0,TAU);g.fill()}},
  // boar: wide body, big tusks, ridge of bristles
  charger(g,r,col){
    g.fillStyle=shade(col,-.5);for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(r*i*.2-r*.1,-r*.75);g.lineTo(r*i*.2,-r*(1.12-Math.abs(i)*.06));g.lineTo(r*i*.2+r*.1,-r*.75);g.fill()}
    cel(g,col,r,()=>g.ellipse(0,0,r*1.12,r*.88,0,0,TAU));
    g.fillStyle='#e7a08f';g.strokeStyle='#6b2f25';g.lineWidth=1.2;g.beginPath();g.ellipse(0,r*.52,r*.42,r*.3,0,0,TAU);g.fill();g.stroke();g.fillStyle='#6b2f25';g.beginPath();g.ellipse(-r*.14,r*.52,r*.07,r*.09,0,0,TAU);g.ellipse(r*.14,r*.52,r*.07,r*.09,0,0,TAU);g.fill();
    for(const s of[-1,1]){g.fillStyle='#fff6e0';g.strokeStyle='#8a7a5a';g.lineWidth=1;g.beginPath();g.moveTo(s*r*.36,r*.6);g.quadraticCurveTo(s*r*.8,r*.62,s*r*.75,r*.05);g.lineTo(s*r*.55,r*.5);g.closePath();g.fill();g.stroke()}
    for(const s of[-1,1]){g.fillStyle=shade(col,-.3);g.beginPath();g.moveTo(s*r*.6,-r*.55);g.lineTo(s*r*1.05,-r*.95);g.lineTo(s*r*.9,-r*.35);g.closePath();g.fill()}
    g.fillStyle='#1a0e0a';for(const s of[-1,1]){g.beginPath();g.arc(s*r*.4,r*.0,r*.1,0,TAU);g.fill()}g.fillStyle='#ff6b4a';for(const s of[-1,1]){g.beginPath();g.arc(s*r*.4,r*.0,r*.04,0,TAU);g.fill()}
    g.strokeStyle='rgba(20,5,10,.9)';g.lineWidth=r*.09;g.lineCap='round';for(const s of[-1,1]){g.beginPath();g.moveTo(s*r*.62,-r*.22);g.lineTo(s*r*.2,-r*.08);g.stroke()}},
  // assassin: hooded diamond with two daggers out to the sides and a trailing scarf
  stalker(g,r,col){
    const c='#5c4c7c';
    g.fillStyle='#b8283f';g.beginPath();g.moveTo(-r*.3,r*.2);g.quadraticCurveTo(-r*1.1,r*.7,-r*1.3,r*1.15);g.quadraticCurveTo(-r*.8,r*.95,-r*.1,r*.45);g.closePath();g.fill();
    for(const s of[-1,1]){g.save();g.translate(s*r*.82,r*.12);g.rotate(s*.9);g.fillStyle='#3a2a1a';g.fillRect(-r*.06,-r*.05,r*.12,r*.3);g.fillStyle='#e8ecf4';g.strokeStyle='#5a6070';g.lineWidth=1;g.beginPath();g.moveTo(-r*.09,-r*.05);g.lineTo(0,-r*.75);g.lineTo(r*.09,-r*.05);g.closePath();g.fill();g.stroke();g.restore()}
    cel(g,c,r,()=>{g.moveTo(0,-r*1.4);g.quadraticCurveTo(r*.95,-r*.6,r*.85,r*.3);g.quadraticCurveTo(r*.4,r*1.0,0,r*1.0);g.quadraticCurveTo(-r*.4,r*1.0,-r*.85,r*.3);g.quadraticCurveTo(-r*.95,-r*.6,0,-r*1.4)});
    g.fillStyle='#0c0812';g.beginPath();g.ellipse(0,-r*.22,r*.56,r*.46,0,0,TAU);g.fill();glow2(g,r,-.3,'#d6a8ff',.24,.11);
    g.fillStyle='#b8283f';g.beginPath();g.roundRect(-r*.62,r*.12,r*1.24,r*.2,r*.08);g.fill()},
};
// Floor decoration painted into each biome's floor tile: low contrast so it never competes with the action
function floorDecor(g,fw,th,sr,biome){
  const n=biome==='ad'?18:12,rx=()=>8+sr()*(fw-16),ry=()=>8+sr()*(th-16);
  for(let i=0;i<n;i++){const x=rx(),y=ry(),k=sr();g.save();g.translate(x,y);g.rotate(sr()*TAU);
    switch(biome){
      case'frozen':if(k<.5){g.fillStyle='rgba(220,245,255,.16)';g.beginPath();g.ellipse(0,0,14+sr()*16,6+sr()*6,0,0,TAU);g.fill()}else{g.fillStyle='rgba(190,235,255,.28)';for(let j=0;j<3;j++){g.rotate(TAU/3);g.beginPath();g.moveTo(0,0);g.lineTo(2,-9);g.lineTo(0,-13);g.lineTo(-2,-9);g.closePath();g.fill()}}break;
      case'forge':if(k<.45){g.strokeStyle='rgba(255,120,40,.35)';g.lineWidth=1.6;g.beginPath();g.moveTo(-10,0);g.lineTo(-3,2);g.lineTo(2,-3);g.lineTo(11,1);g.stroke()}else if(k<.75){g.fillStyle='rgba(30,20,18,.45)';g.beginPath();g.roundRect(-9,-9,18,18,3);g.fill();g.fillStyle='rgba(120,100,90,.25)';for(const [a,b] of[[-6,-6],[6,-6],[-6,6],[6,6]]){g.beginPath();g.arc(a,b,1.3,0,TAU);g.fill()}}else{g.fillStyle='rgba(255,170,60,.4)';g.beginPath();g.arc(0,0,1.4,0,TAU);g.fill()}break;
      case'ruins':if(k<.45){g.strokeStyle='rgba(90,160,110,.3)';g.lineWidth=2;g.beginPath();g.moveTo(-14,0);g.quadraticCurveTo(-4,-8,4,0);g.quadraticCurveTo(10,6,16,-2);g.stroke();g.fillStyle='rgba(90,160,110,.3)';g.beginPath();g.ellipse(-4,-4,3,1.6,.5,0,TAU);g.ellipse(9,3,3,1.6,-.5,0,TAU);g.fill()}else{g.fillStyle='rgba(120,200,190,.12)';g.beginPath();g.ellipse(0,0,16+sr()*10,7+sr()*4,0,0,TAU);g.fill()}break;
      case'sky':if(k<.5){g.strokeStyle='rgba(40,28,18,.4)';g.lineWidth=1.2;g.beginPath();g.moveTo(-18,0);g.lineTo(18,0);g.stroke();g.fillStyle='rgba(200,190,170,.25)';g.beginPath();g.arc(-15,-3,1.2,0,TAU);g.arc(15,-3,1.2,0,TAU);g.fill()}else{g.strokeStyle='rgba(150,120,80,.35)';g.lineWidth=2;g.beginPath();g.arc(0,0,6,0,TAU*.8);g.stroke()}break;
      case'ad':g.fillStyle=pick(['rgba(255,79,163,.35)','rgba(93,255,154,.3)','rgba(127,231,255,.3)','rgba(255,209,102,.35)']);g.fillRect(-3,-1.5,6,3);break;
      default:if(k<.3){g.fillStyle='rgba(225,215,195,.2)';g.beginPath();g.roundRect(-8,-1.5,16,3,1.5);g.fill();for(const s of[-1,1]){g.beginPath();g.arc(s*8,-1.5,2.2,0,TAU);g.arc(s*8,1.5,2.2,0,TAU);g.fill()}}
        else if(k<.45){g.fillStyle='rgba(225,215,195,.2)';g.beginPath();g.arc(0,0,5,0,TAU);g.fill();g.fillRect(-3,3,6,3);g.fillStyle='rgba(10,8,14,.35)';g.beginPath();g.arc(-2,-.5,1.3,0,TAU);g.arc(2,-.5,1.3,0,TAU);g.fill()}
        else if(k<.75){g.fillStyle='rgba(20,16,24,.35)';for(let j=0;j<4;j++){g.beginPath();g.arc((sr()-.5)*14,(sr()-.5)*10,1.5+sr()*2.5,0,TAU);g.fill()}}
        else{g.fillStyle='rgba(120,150,190,.1)';g.beginPath();g.ellipse(0,0,14+sr()*8,6+sr()*4,0,0,TAU);g.fill()}}
    g.restore()}}
