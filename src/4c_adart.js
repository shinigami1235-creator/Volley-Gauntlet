
/* ---- The Ad Maker: a grinning phone in a top hat, with a megaphone and a Play Now button ---- */
BART.admaker=1;
BPAINT.admaker=function(g,e,r,t){
  const ph=e.phase||1,wind=bWind(e,.6),bob=Math.sin(t*2.2)*r*.05,rage=ph>=3,px=(typeof P!=='undefined'&&P&&e.x!=null)?clamp((P.x-e.x)/220,-1,1):0,py=(typeof P!=='undefined'&&P&&e.y!=null)?clamp((P.y-e.y)/400,-1,1):.5;
  bShadow(g,r*.85,r*.22,r*1.25);g.save();g.translate(0,bob);
  const bw=r*1.5,bh=r*2.15,bx=-bw/2,by=-bh/2-r*.1;
  // arms: left hand waves, right hand holds the megaphone
  g.strokeStyle='#241a3a';g.lineWidth=r*.12;g.lineCap='round';g.beginPath();g.moveTo(bx+r*.1,r*.1);g.quadraticCurveTo(bx-r*.5,r*.1,bx-r*.62,-r*.35+Math.sin(t*5)*r*.12);g.stroke();
  g.beginPath();g.moveTo(-bx-r*.1,r*.1);g.quadraticCurveTo(-bx+r*.45,r*.2,-bx+r*.55,-r*.1-wind*r*.3);g.stroke();
  for(const [hx,hy] of[[bx-r*.66,-r*.42+Math.sin(t*5)*r*.12],[-bx+r*.58,-r*.16-wind*r*.3]]){g.fillStyle='#fdfbff';g.strokeStyle='#b9a8cc';g.lineWidth=1.6;g.beginPath();g.arc(hx,hy,r*.17,0,TAU);g.fill();g.stroke();for(let k=0;k<3;k++){g.beginPath();g.ellipse(hx-r*.1+k*r*.1,hy-r*.15,r*.05,r*.09,0,0,TAU);g.fill();g.stroke()}}
  // megaphone
  g.save();g.translate(-bx+r*.62,-r*.26-wind*r*.3);g.rotate(-.5-wind*.6);g.fillStyle='#ff4fa3';g.strokeStyle='#6a1240';g.lineWidth=2;g.beginPath();g.moveTo(0,-r*.08);g.lineTo(r*.55,-r*.26);g.lineTo(r*.55,r*.26);g.lineTo(0,r*.08);g.closePath();g.fill();g.stroke();g.fillStyle='#ffd166';g.beginPath();g.ellipse(r*.55,0,r*.06,r*.26,0,0,TAU);g.fill();g.restore();
  // phone body
  const fr=g.createLinearGradient(bx,by,-bx,-by);fr.addColorStop(0,'#ff7ab6');fr.addColorStop(1,'#a8206a');g.fillStyle=fr;g.beginPath();g.roundRect(bx,by,bw,bh,r*.24);g.fill();g.strokeStyle='#4a0f2e';g.lineWidth=3;g.stroke();
  g.fillStyle='#1c1430';g.beginPath();g.roundRect(bx+r*.09,by+r*.12,bw-r*.18,bh-r*.24,r*.16);g.fill();
  // screen
  const sx=bx+r*.15,sy=by+r*.22,sw=bw-r*.3,sh=r*1.25;const sg=g.createLinearGradient(0,sy,0,sy+sh);sg.addColorStop(0,rage?'#ffb0b8':'#fff0f8');sg.addColorStop(1,rage?'#ff6b7f':'#ffc2e0');g.fillStyle=sg;g.beginPath();g.roundRect(sx,sy,sw,sh,r*.1);g.fill();
  g.fillStyle='#1c1430';g.beginPath();g.roundRect(-r*.18,sy+r*.03,r*.36,r*.07,r*.035);g.fill();
  if(rage){g.save();g.globalAlpha=.35;for(let k=0;k<4;k++){const yy=sy+((t*90+k*37)%sh);g.fillStyle=k%2?'#7fe7ff':'#ff4fa3';g.fillRect(sx,yy,sw,r*.05)}g.restore()}
  // face
  const ey=sy+sh*.38,ex=sw*.22;for(const s of[-1,1]){g.fillStyle='#fff';g.strokeStyle='#2a1640';g.lineWidth=2;g.beginPath();g.ellipse(s*ex,ey,r*.17,r*.21,0,0,TAU);g.fill();g.stroke();
    g.fillStyle=rage?'#d91e3a':'#2a1640';g.beginPath();g.arc(s*ex+px*r*.07,ey+py*r*.06,r*.085,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(s*ex+px*r*.07-r*.03,ey+py*r*.06-r*.03,r*.03,0,TAU);g.fill();
    g.strokeStyle='#2a1640';g.lineWidth=r*.05;g.beginPath();if(rage){g.moveTo(s*ex-s*r*.18,ey-r*.33);g.lineTo(s*ex+s*r*.12,ey-r*.22)}else if(ph===2){g.moveTo(s*ex-r*.16,ey-r*.3);g.lineTo(s*ex+r*.16,ey-r*.3)}else{g.arc(s*ex,ey-r*.2,r*.17,Math.PI*1.15,Math.PI*1.85)}g.stroke()}
  g.fillStyle='rgba(255,90,150,.45)';for(const s of[-1,1]){g.beginPath();g.ellipse(s*sw*.33,ey+r*.22,r*.1,r*.06,0,0,TAU);g.fill()}
  const my=sy+sh*.72,mw=sw*(rage?.5:.62),open=rage?r*.2:r*.12+wind*r*.08;g.fillStyle='#2a1640';g.beginPath();g.moveTo(-mw/2,my-r*.03);g.quadraticCurveTo(0,my+open*2.1,mw/2,my-r*.03);g.quadraticCurveTo(0,my+open*.6,-mw/2,my-r*.03);g.fill();
  g.fillStyle='#fff';g.beginPath();g.moveTo(-mw*.42,my-r*.01);g.lineTo(mw*.42,my-r*.01);g.lineTo(mw*.36,my+open*.45);g.lineTo(-mw*.36,my+open*.45);g.closePath();g.fill();
  if(rage){g.strokeStyle='rgba(42,22,64,.6)';g.lineWidth=1.5;g.beginPath();g.moveTo(sx+sw*.7,sy);g.lineTo(sx+sw*.55,sy+sh*.3);g.lineTo(sx+sw*.78,sy+sh*.45);g.lineTo(sx+sw*.6,sy+sh*.7);g.stroke()}
  // play now button under the screen
  const pb=by+bh-r*.42,pw2=bw*.7,pulse=1+Math.sin(t*6)*.04;g.save();g.translate(0,pb);g.scale(pulse,pulse);const pg=g.createLinearGradient(0,-r*.14,0,r*.14);pg.addColorStop(0,'#7dffb0');pg.addColorStop(1,'#14c060');g.fillStyle=pg;g.beginPath();g.roundRect(-pw2/2,-r*.14,pw2,r*.28,r*.14);g.fill();g.strokeStyle='#073d22';g.lineWidth=2;g.stroke();
  g.fillStyle='#fff';g.font=`900 ${Math.round(r*.15)}px "Segoe UI Black","Arial Black",system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('PLAY NOW',0,r*.01);g.restore();
  // top hat
  g.fillStyle='#1c1430';g.beginPath();g.ellipse(0,by+r*.02,r*.62,r*.12,0,0,TAU);g.fill();g.beginPath();g.roundRect(-r*.38,by-r*.62,r*.76,r*.64,r*.06);g.fill();g.fillStyle='#ff4fa3';g.fillRect(-r*.38,by-r*.16,r*.76,r*.12);
  g.fillStyle='#ffd166';g.font=`900 ${Math.round(r*.14)}px system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('$',0,by-r*.38);
  // sparkles
  for(let k=0;k<3;k++){const a=t*1.4+k*2.1,sx2=Math.cos(a)*r*1.05,sy2=-r*.9+Math.sin(a*1.3)*r*.3,s=r*(.06+.03*Math.sin(t*6+k));g.fillStyle='#ffe08a';g.beginPath();g.moveTo(sx2,sy2-s*2);g.lineTo(sx2+s*.6,sy2);g.lineTo(sx2,sy2+s*2);g.lineTo(sx2-s*.6,sy2);g.closePath();g.fill()}
  g.restore();
};
