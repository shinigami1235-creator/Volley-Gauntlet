
/* ================= music: sampled instruments, adaptive score ================= */
/* Instrument samples rendered from FluidR3_GM (MIT licence, Frank Wen). Notes are composed in code below. */
/* Instrument samples for the music: short single notes rendered from the FluidR3_GM SoundFont (MIT licence) and stored as base64 MP3 so the game stays one offline file. They are only decoded with atob() and decodeAudioData() in mLoad below. */
const MSAMP=/*SAMPLES*/{};
const MMETA=/*SMETA*/{};
const MU={on:true,ready:false,load:false,I:{},Dr:{},cur:null,pos:{},intS:0,ph:1,hold:0,vol:.5,lt:0};
try{MU.on=STORE.get('vg_music')!=='off'}catch(e){}
const IP={sqlead:{a:.003,r:.1,v:.45},sawlead:{a:.005,r:.12,v:.45},pluck:{a:.002,r:.2,v:.5},synbass:{a:.003,r:.06,v:.6},pad:{a:.3,r:.6,v:.55,loop:1},glock:{a:.002,r:.6,v:.3}};
const DV={kick808:1,clap808:.6,hat808:.45,ohat808:.35,esnare:.7,crash:.4,tom808:.7};
const NPC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function nm(s){const m=/^([A-G])(#|b)?(-?\d)$/.exec(s);return 12*(+m[3]+1)+NPC[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)}
const CQ={'':[0,4,7],m:[0,3,7],'7':[0,4,7,10],m7:[0,3,7,10],maj7:[0,4,7,11],'6':[0,4,7,9],m6:[0,3,7,9],m7b5:[0,3,6,10],dim7:[0,3,6,9],'7b9':[0,4,7,10,13],'9':[0,4,7,10,14],m9:[0,3,7,10,14]};
function cp(s){const m=/^([A-G])(#|b)?(.*)$/.exec(s);return{r:(NPC[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+12)%12,q:CQ[m[3]]}}
function prog(str,B){return str.split('|').map(bar=>{const cs=bar.trim().split(/\s+/).map(cp),len=B/cs.length;cs.forEach((c,i)=>{c.at=i*len;c.len=len});return cs})}
function mMel(str){const ev=[];let p=0;for(const tk of str.trim().split(/\s+/)){if(tk==='|')continue;const i=tk.lastIndexOf(':'),a=tk.slice(0,i),b=tk.slice(i+1),d=parseFloat(b);if(a!=='r')ev.push({p,n:a.split('+').map(nm),d,v:b.endsWith('!')?1.05:.85});p+=d}return{ev,len:p}}
function mrng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function swg(p,S){const i=Math.floor(p),f=p-i;return i+(f<=.5?f/.5*S:S+(f-.5)/.5*(1-S))}
function near(pc,ref,lo,hi){let b=null;for(let n=lo;n<=hi;n++)if(n%12===pc&&(b===null||Math.abs(n-ref)<Math.abs(b-ref)))b=n;return b===null?lo:b}
function voice(C,F){const q=C.q;const iv=q.length>=4?[q[1],q[3],q[4]!==undefined?q[4]%12:(q[2]===6?6:2)]:[0,q[1],q[2]];return iv.map(x=>F+(((C.r+x-F)%12)+12)%12).sort((a,b)=>a-b)}

/* ---------- players ---------- */
function mnote(th,pt,inst,n,t,dur,v,o){
  const Ls=MU.I[inst],dest=th.P[pt];if(!Ls||!dest)return;let s=Ls[0];for(const x of Ls)if(Math.abs(x.n-n)<Math.abs(s.n-n))s=x;
  const p=IP[inst],src=AC.createBufferSource(),g=AC.createGain(),rate=Math.pow(2,(n-s.n)/12);t=Math.max(t,AC.currentTime);
  src.buffer=s.b;src.playbackRate.value=rate;
  const pk=Math.pow(v,1.5)*s.g*p.v,end=t+Math.max(dur,p.a+.02);
  if(p.loop&&dur>(s.b.duration-.4)/rate){src.loop=true;src.loopStart=Math.min(.7,s.b.duration*.3);src.loopEnd=s.b.duration-.4}
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+p.a);g.gain.setValueAtTime(pk,end);g.gain.setTargetAtTime(0,end,p.r/3);
  if(o&&o.vib&&src.detune){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=5.2;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(o.vib,t+dur*.6);l.connect(lg).connect(src.detune);l.start(t);l.stop(end+p.r*2)}
  src.connect(g);g.connect(dest);src.start(t);src.stop(end+p.r*1.6+.05);
}
function mdrum(th,pt,k,t,v){const s=MU.Dr[k],dest=th.P[pt];if(!s||!dest)return;const src=AC.createBufferSource(),g=AC.createGain();src.buffer=s.b;g.gain.value=Math.pow(v,1.5)*s.g*(DV[k]||1);src.connect(g);g.connect(dest);src.start(Math.max(t,AC.currentTime))}

/* ---------- arranging helpers ---------- */
function ost(c,pt,inst,lo,offs,step,v=.8){for(const C of c.ch){const r0=near(C.r,lo+5,lo,lo+11);const cnt=Math.round(C.len/step);for(let i=0;i<cnt;i++){let o=offs[i%offs.length];if(o==='t')o=C.q[1];else if(o==='T')o=C.q[1]+12;else if(o==='f')o=C.q[2];c.n(pt,inst,r0+o,C.at+i*step,step*.92,v*(i%2?.8:1))}}}
function sost(c,pt,inst,sc,base,degs,step,v=.8){const pcs=sc.map(x=>x%12),abs=j=>sc[((j%7)+7)%7]+12*Math.floor(j/7);
  for(const C of c.ch){let idx=pcs.indexOf(C.r);if(idx<0)idx=0;const rn=near(C.r,base,base-5,base+6),cnt=Math.round(C.len/step);
    for(let i=0;i<cnt;i++){const k=degs[i%degs.length];c.n(pt,inst,rn+abs(idx+k)-abs(idx),C.at+i*step,step*1.6,v*(i%4===0?1:.8))}}}
function arp(c,pt,inst,F,idx,step,v=.6,len=1.5){for(const C of c.ch){const V=voice(C,F),S=[V[0]-12,V[0],V[1],V[2],V[0]+12,V[1]+12,V[2]+12],cnt=Math.round(C.len/step);for(let i=0;i<cnt;i++)c.n(pt,inst,S[idx[i%idx.length]],C.at+i*step,len,v*(i%idx.length===0?1:.85))}}
function stab(c,pt,inst,F,pat,v=.8,oct=true){for(const C of c.ch){const V=voice(C,F);if(oct)V.push(V[0]+12);for(const [p,d] of pat)if(p>=C.at&&p<C.at+C.len)for(const n of V)c.n(pt,inst,n,p,d,v)}}
function mPad(c,pt,inst,F,v=.6){for(const C of c.ch)for(const n of voice(C,F))c.n(pt,inst,n,C.at,C.len*.98,v)}
function root(c,pt,inst,lo,v=.8,oct=false){for(const C of c.ch){const r0=near(C.r,lo+5,lo,lo+11);c.n(pt,inst,r0,C.at,C.len*.97,v,{tight:1});if(oct)c.n(pt,inst,r0+12,C.at,C.len*.97,v*.7,{tight:1})}}
function perc(c,pt,list,s=1){for(const [p,k,v] of list){if(k==='T'||k==='t')c.n(pt,'taiko',k==='T'?45:57,p,.8,v*s,{tight:1});else c.d(pt,k,p,v*s)}}
function roll(c,pt,k,p0,p1,step,v0,v1){const n=Math.round((p1-p0)/step);for(let i=0;i<n;i++){const v=v0+(v1-v0)*i/Math.max(1,n-1);if(k==='timp')c.n(pt,'timp',c.T.timpN||45,p0+i*step,step*1.5,v,{tight:1});else c.d(pt,k,p0+i*step,v)}}

/* ---------- the score (chip club) ---------- */
const MEL={
menu:`E5:1 G5:.5 E5:.5 C5:1 G4:1 | A4:.5 C5:.5 E5:1 D5:.5 C5:.5 A4:1 | F4:.5 A4:.5 C5:.5 F5:.5 E5:1 C5:1 | D5:1.5 B4:.5 G4:2 |
 E5:1 G5:.5 E5:.5 C6:1 G5:1 | A5:.5 G5:.5 E5:.5 C5:.5 E5:2 | F5:1 A5:1 G5:.5 F5:.5 D5:1 | C5:2 r:2 |`,
map:`B5:.5 A5:.5 G5:1 D5:1 G5:1 | E5:.5 G5:.5 C6:1 B5:.5 A5:.5 G5:1 | F#5:1 A5:.5 F#5:.5 D5:2 | G5:1.5 B5:.5 D6:2 |
 E6:.5 D6:.5 B5:.5 G5:.5 E5:2 | E5:.5 G5:.5 C6:.5 E6:.5 D6:1 C6:1 | A5:1 F#5:.5 A5:.5 D6:1 C6:1 | B5:2 r:2 |`,
dungeon:`E5:.5 G5:.5 B5:1 A5:.5 G5:.5 E5:1 | E5:.5 G5:.5 C6:1 B5:.5 A5:.5 G5:1 | D5:.5 G5:.5 B5:1 D6:1 B5:1 | A5:1.5 F#5:.5 D5:2 |
 E5:.5 G5:.5 B5:1 A5:.5 G5:.5 E5:1 | G5:.5 A5:.5 C6:1 E6:1 C6:1 | C6:.5 B5:.5 A5:.5 E5:.5 A5:1 C6:1 | B5:1.5 A5:.5 F#5:1 D#5:1 |
 E6:1 D6:.5 B5:.5 G5:1 B5:1 | C6:1 B5:.5 G5:.5 E5:1 G5:1 | D6:1 B5:.5 G5:.5 D5:1 G5:1 | F#5:.5 G5:.5 A5:.5 B5:.5 C6:.5 B5:.5 A5:1 |
 E5:.5 G5:.5 C6:1 B5:.5 C6:.5 E6:1 | D6:.5 C6:.5 A5:.5 F#5:.5 D6:2 | B5:1 G5:.5 E5:.5 B5:1 E6:1 | E6:2 r:2 |`,
frozen:`D5:.5 G5:.5 B5:1 A5:.5 G5:.5 D5:1 | E5:.5 G5:.5 B5:1 D6:2 | E6:1 D6:.5 B5:.5 G5:1 E5:1 | F#5:.5 G5:.5 A5:.5 B5:.5 G5:2 |
 E5:.5 G5:.5 C6:1 B5:.5 A5:.5 G5:1 | F#5:.5 A5:.5 D6:1 C6:.5 A5:.5 F#5:1 | G5:1 B5:.5 D6:.5 G6:2 | F#6:1 E6:.5 D6:.5 A5:2 |
 B5:.5 D6:.5 B5:.5 G5:.5 D5:1 G5:1 | F#5:.5 A5:.5 D#6:1 B5:2 | E6:.5 D6:.5 B5:.5 G5:.5 E5:1 G5:1 | B5:3 r:1 |
 C6:.5 B5:.5 G5:.5 E5:.5 G5:1 C6:1 | D6:.5 C6:.5 A5:.5 F#5:.5 A5:1 D6:1 | B5:1 G5:.5 B5:.5 D6:1 B5:1 | G5:2 r:2 |`,
forge:`D4:.5 F4:.5 A4:1 G#4:.5 A4:.5 D5:1 | C5:.5 A4:.5 F4:.5 A4:.5 D4:2 | Bb4:.5 D5:.5 F5:1 E5:.5 D5:.5 Bb4:1 | C#5:1.5 A4:.5 E4:1 A4:1 |
 D5:.5 D5:.5 r:.5 D5:.5 F5:1 D5:1 | E5:.5 F5:.5 E5:.5 D5:.5 A4:2 | Bb4:1 G4:1 C#5:1 E5:1 | D5:3 r:1 |
 G4:.5 Bb4:.5 D5:1 C5:.5 Bb4:.5 G4:1 | F4:.5 A4:.5 D5:1 C5:.5 A4:.5 F4:1 | Bb4:.5 C5:.5 D5:.5 F5:.5 D5:1 Bb4:1 | A4:.5 C#5:.5 E5:1 G5:1 E5:1 |
 Bb4:1.5 A4:.5 G4:1 D4:1 | F4:1.5 E4:.5 D4:1 A4:1 | G#4:1 B4:1 D5:1 E5:1 | C#5:.5 E5:.5 A5:1 A4:2 |`,
ruins:`D4:1 Eb4:.5 F#4:.5 G4:1 F#4:.5 Eb4:.5 | D4:3 r:1 | G4:1 Bb4:.5 A4:.5 G4:1 F#4:.5 Eb4:.5 | F#4:1.5 Eb4:.5 D4:2 |
 A4:1 Bb4:.5 C5:.5 D5:1 C5:.5 Bb4:.5 | A4:3 r:1 | G4:1 Eb4:.5 G4:.5 C5:1 Bb4:.5 A4:.5 | F#4:1.5 G4:.5 A4:2 |
 Bb4:1 D5:1 C5:.5 Bb4:.5 A4:1 | A4:1 C5:1 Bb4:.5 A4:.5 G4:1 | G4:1 Bb4:.5 G4:.5 F#4:1 Eb4:1 | D4:3 r:1 |
 D5:1.5 Eb5:.5 D5:1 Bb4:1 | C5:1.5 D5:.5 C5:1 G4:1 | Bb4:.5 A4:.5 G4:.5 F#4:.5 Eb4:1 F#4:1 | D4:4 |`,
sky:`E5:.5 A5:.5 C#6:1 B5:.5 A5:.5 E5:1 | F#5:.5 G#5:.5 A5:.5 B5:.5 C#6:2 | D6:1 C#6:.5 B5:.5 A5:1 F#5:1 | G#5:1.5 E5:.5 B4:1 E5:1 |
 E5:.5 A5:.5 C#6:1 E6:1 C#6:1 | A5:.5 C#6:.5 F#6:1 E6:.5 C#6:.5 A5:1 | F#5:.5 A5:.5 D6:1 C#6:.5 B5:.5 A5:1 | B5:3 r:1 |
 A5:.5 B5:.5 D6:1 F#6:1 D6:1 | G#5:.5 B5:.5 E6:1 D6:.5 B5:.5 G#5:1 | E6:1 C#6:.5 G#5:.5 C#6:1 E6:1 | F#6:1.5 E6:.5 C#6:1 A5:1 |
 D6:.5 C#6:.5 B5:.5 A5:.5 F#5:1 A5:1 | G#5:.5 A5:.5 B5:.5 C#6:.5 D6:1 E6:1 | C#6:1 E6:1 A6:2 | G#6:1 E6:1 B5:1 r:1 |`,
mini:`B4:.5 B4:.5 D5:.5 B4:.5 F#5:1 D5:1 | E5:.5 D5:.5 C#5:.5 B4:.5 A4:1 F#4:1 | G#4:.5 B4:.5 E5:1 G#5:1 E5:1 | F#5:.5 E5:.5 D5:.5 C#5:.5 B4:2 |
 B4:.5 D5:.5 G5:1 F#5:.5 E5:.5 D5:1 | C#5:.5 E5:.5 A5:1 G5:.5 F#5:.5 E5:1 | F#5:1 D5:.5 B4:.5 F#5:1 B5:1 | A#5:1 F#5:.5 C#5:.5 F#5:1 r:1 |`,
boss:`D4:1.5 A4:.5 A4:2 | Bb4:.5 A4:.5 G4:.5 F4:.5 E4:1 A3:1 | D4:1.5 F4:.5 Bb4:2 | C5:.5 Bb4:.5 A4:.5 F4:.5 D4:2 |
 G4:1.5 Bb4:.5 D5:2 | Eb5:.5 D5:.5 C5:.5 Bb4:.5 A4:1 G4:1 | E4:1 A4:1 C#5:2 | E5:1 C#5:.5 A4:.5 G4:2 |
 F5:1.5 E5:.5 D5:2 | C5:.5 D5:.5 E5:.5 F5:.5 A5:2 | G5:1.5 F5:.5 D5:2 | E5:.5 F5:.5 G5:.5 E5:.5 C5:2 |
 D5:1.5 Eb5:.5 D5:1 Bb4:1 | G5:1.5 F5:.5 Eb5:1 Bb4:1 | C#5:1 E5:1 A5:1 G5:1 | E5:.5 F5:.5 E5:.5 D5:.5 C#5:2 |`,
};
const EVEN=c=>c.loop%2===0,ODD=c=>c.loop%2===1,FIRST8=c=>c.b<8,LAST8=c=>c.b>=8;
const RUIN_SC=[2,3,6,7,9,10,12];
const OCT=[0,12,0,12,0,12,0,12],PUL=[0,0,12,0,0,0,12,0],GAL=[0,0,7,0,12,0,7,0],ROLLB=[0,0,0,12,0,0,7,12];
const FOUR=[[0,'kick808',1],[1,'kick808',.9],[2,'kick808',1],[3,'kick808',.9],[1,'clap808',.7],[3,'clap808',.75]];
const BREAK=[[0,'kick808',1],[1.5,'kick808',.8],[2.5,'kick808',.85],[1,'esnare',.7],[3,'esnare',.75],[3.75,'esnare',.35]];
const HALF=[[0,'kick808',.9],[2.5,'kick808',.7],[2,'clap808',.7]];
function hats(c,pt,step=.25,v=.42,open=true){const n=Math.round(c.B/step);for(let i=0;i<n;i++){const p=i*step,off=Math.abs(p%1-.5)<1e-6;c.d(pt,open&&off?'ohat808':'hat808',p,(p%1===0?1:off?.75:.55)*v)}}
function fill(c,pt){if(c.b%4===3){for(let i=0;i<4;i++)c.d(pt,'clap808',3+i*.25,.35+i*.12);c.d(pt,'tom808',3.5,.5)}if(c.b%8===0)c.d(pt,'crash',0,.45)}
const MTH={
menu:{bpm:120,B:4,g:1.1,ch:'C|Am|F|G|C|Am|Dm G|C',
  parts:{bass:[.6,.08],dr:[.55,.1],arp:[.2,.3],pad:[.3,.45],lead:[1.4,.3]},
  tr:[{part:'lead',inst:'pluck',m:'menu',when:EVEN},{part:'lead',inst:'sqlead',m:'menu',when:ODD,v:.85}],
  bar(c){ost(c,'bass','synbass',33,PUL,.5,.8);perc(c,'dr',HALF,.8);hats(c,'dr',.5,.35,false);mPad(c,'pad','pad',55,.6);arp(c,'arp','sqlead',64,[1,2,3,4,3,2,1,2],.5,.45,.3)}},
map:{bpm:112,B:4,g:1.2,ch:'G|C|D|G|Em|C|D|G',
  parts:{bass:[.6,.08],dr:[.5,.12],arp:[.22,.35],pad:[.3,.45],lead:[1.4,.35]},
  tr:[{part:'lead',inst:'pluck',m:'map'},{part:'lead',inst:'glock',m:'map',v:.5,when:ODD}],
  bar(c){ost(c,'bass','synbass',33,[0,0,0,7,0,0,12,7],.5,.75);perc(c,'dr',HALF,.75);hats(c,'dr',.5,.3,false);mPad(c,'pad','pad',55,.55);arp(c,'arp','pluck',64,[1,2,3,2],.5,.35,.4)}},
dungeon:{bpm:164,B:4,g:1,resume:1,ch:'Em|C|G|D|Em|C|Am|B|Em|C|G|D|C|D|Em|Em',
  parts:{bass:[.65,.06],dr:[.7,.08],arp:[.22,.25],pad:[.2,.4],lead:[1.6,.2],hi:[.45,.25],hid:[.5,.1]},lay:{hi:'int',hid:'int'},
  tr:[{part:'lead',inst:'sqlead',m:'dungeon'},{part:'hi',inst:'sawlead',m:'dungeon',o:-12,v:.6}],
  bar(c){ost(c,'bass','synbass',33,OCT,.5,.85);perc(c,'dr',FOUR);hats(c,'dr',.25,.45);arp(c,'arp','sqlead',64,[1,2,3,4,3,2,1,2],.25,.5,.2);if(c.b>=4)mPad(c,'pad','pad',55,.6);fill(c,'hid');hats(c,'hid',.125,.25,false)}},
frozen:{bpm:156,B:4,g:1.1,resume:1,ch:'G|G|Em|Em|C|D|G|D|G|B7|Em|Em|C|D|G|G',
  parts:{bass:[.6,.08],dr:[.6,.1],arp:[.25,.35],pad:[.28,.5],lead:[1.6,.35],hi:[.45,.4],hid:[.5,.12]},lay:{hi:'int',hid:'int'},
  tr:[{part:'lead',inst:'sqlead',m:'frozen'},{part:'hi',inst:'glock',m:'frozen',v:.7}],
  bar(c){ost(c,'bass','synbass',33,PUL,.5,.8);perc(c,'dr',BREAK,.9);hats(c,'dr',.25,.35,false);arp(c,'arp','pluck',67,[1,2,3,4,5,4,3,2],.25,.5,.3);mPad(c,'pad','pad',55,.6);fill(c,'hid');arp(c,'hi','glock',72,[1,3,5,3],.5,.35,.6)}},
forge:{bpm:170,B:4,g:.95,resume:1,ch:'Dm|Dm|Bb|A|Dm|Dm|Gm A|Dm|Gm|Dm|Bb|A|Gm|Dm|E7|A',
  parts:{bass:[.7,.05],dr:[.75,.08],arp:[.2,.2],lead:[1.6,.18],lead2:[.5,.2],hi:[.45,.2],hid:[.5,.1]},lay:{hi:'int',hid:'int'},
  tr:[{part:'lead',inst:'sawlead',m:'forge'},{part:'lead2',inst:'sqlead',m:'forge',o:12,v:.6,when:ODD},{part:'hi',inst:'sqlead',m:'forge',o:12,v:.5}],
  bar(c){ost(c,'bass','synbass',33,ROLLB,.5,.9);perc(c,'dr',FOUR);perc(c,'dr',[[.5,'kick808',.5],[2.5,'kick808',.55]]);hats(c,'dr',.25,.45);arp(c,'arp','sawlead',62,[0,1,2,1],.25,.45,.2);fill(c,'hid');perc(c,'hid',[[1.75,'esnare',.4],[3.25,'esnare',.4]])}},
ruins:{bpm:150,B:4,g:1.05,resume:1,ch:'D|D|Eb|D|D|D|Cm|D|Gm|Cm|Eb|D|Gm|Cm|Eb|D',
  parts:{bass:[.6,.08],dr:[.65,.12],arp:[.3,.3],pad:[.2,.45],lead:[1.6,.3],hi:[.45,.3],hid:[.5,.12]},lay:{hi:'int',hid:'int'},
  tr:[{part:'lead',inst:'pluck',m:'ruins',o:12},{part:'hi',inst:'sqlead',m:'ruins',o:12,v:.6}],
  bar(c){ost(c,'bass','synbass',33,[0,0,7,0,1,0,7,0],.5,.8);perc(c,'dr',BREAK);perc(c,'dr',[[.5,'tom808',.4],[2,'tom808',.45]]);hats(c,'dr',.25,.35,false);sost(c,'arp','pluck',RUIN_SC,62,[0,1,2,4,5,4,2,1],.25,.55);if(c.b>=4)mPad(c,'pad','pad',55,.5);fill(c,'hid')}},
sky:{bpm:172,B:4,g:1,resume:1,ch:'A|A|D|E|A|F#m|D|E|D|E|C#m|F#m|D|E|A|E',
  parts:{bass:[.6,.06],dr:[.7,.08],arp:[.22,.3],pad:[.22,.45],lead:[1.6,.25],hi:[.45,.3],hid:[.5,.1]},lay:{hi:'int',hid:'int'},
  tr:[{part:'lead',inst:'sqlead',m:'sky'},{part:'hi',inst:'sawlead',m:'sky',o:-12,v:.6}],
  bar(c){ost(c,'bass','synbass',33,GAL,.5,.85);perc(c,'dr',FOUR);hats(c,'dr',.25,.45);arp(c,'arp','sqlead',64,[1,2,3,4,5,4,3,2],.25,.45,.2);mPad(c,'pad','pad',57,.55);fill(c,'hid');hats(c,'hid',.125,.25,false)}},
mini:{bpm:168,B:4,g:1.05,ch:'Bm|Bm|E|E|G|A|Bm|F#',
  parts:{bass:[.65,.05],dr:[.75,.08],arp:[.22,.2],lead:[1.6,.2],lead2:[.5,.2],hi:[.45,.2],hid:[.5,.1]},lay:{hi:'int',hid:'int'},
  tr:[{part:'lead',inst:'sawlead',m:'mini'},{part:'lead2',inst:'sqlead',m:'mini',o:12,v:.55},{part:'hi',inst:'sqlead',m:'mini',o:-12,v:.5}],
  bar(c){ost(c,'bass','synbass',33,ROLLB,.5,.9);perc(c,'dr',BREAK);perc(c,'dr',[[0,'clap808',.4],[2,'kick808',.8]]);hats(c,'dr',.25,.45);arp(c,'arp','sqlead',62,[0,1,2,3,2,1],.25,.45,.2);fill(c,'hid');hats(c,'hid',.125,.25,false)}},
boss:{bpm:172,B:4,g:.95,ch:'Dm|Dm|Bb|Bb|Gm|Gm|A|A7|Dm|Dm|Bb|C|Gm|Eb|A|A',
  parts:{bass:[.7,.05],dr:[.75,.08],arp:[.22,.2],lead:[1.6,.2],p2:[.55,.22],p2d:[.5,.1],p3:[.35,.45],p3d:[.5,.12]},lay:{p2:'p2',p2d:'p2',p3:'p3',p3d:'p3'},
  tr:[{part:'lead',inst:'sawlead',m:'boss'},{part:'p2',inst:'sqlead',m:'boss',o:12,v:.6},{part:'p3',inst:'sawlead',m:'boss',o:-12,v:.7}],
  bar(c){ost(c,'bass','synbass',33,ROLLB,.5,.9);perc(c,'dr',FOUR);hats(c,'dr',.25,.45);arp(c,'arp','sqlead',62,[0,1,2,3,2,1],.25,.45,.2);
    fill(c,'p2d');perc(c,'p2d',[[1.75,'esnare',.45],[3.25,'esnare',.45]]);mPad(c,'p3','pad',55,.7);hats(c,'p3d',.125,.3,false);if(c.b%2===0)c.d('p3d','crash',0,.4)}},
ko:{bpm:150,B:5,once:1,g:1.8,parts:{a:[1,.3],b:[.7,.15],d:[.7,.2]},
  bar(c){['D5','F#5','A5','D6','F#6','A6'].forEach((s,i)=>c.n('a','sqlead',nm(s),i*.125,.2,.8,{tight:1}));for(const s of['D6','F#6','A6'])c.n('a','sawlead',nm(s)-12,1,2.6,.8,{tight:1});c.n('a','sqlead',nm('D6'),1,2.6,.9,{tight:1});
    c.n('b','synbass',nm('D2'),1,2,1,{tight:1});c.d('d','kick808',1,1);c.d('d','crash',1,.7);for(let i=0;i<4;i++)c.d('d','clap808',.5+i*.125,.3+i*.12)}},
win:{bpm:140,B:8,once:1,g:1.2,parts:{a:[1,.3],b:[.7,.15],d:[.7,.2],p:[.4,.45]},
  bar(c){const ar=(p,ns)=>ns.forEach((s,i)=>c.n('a','sqlead',nm(s),p+i*.125,.2,.8,{tight:1}));ar(0,['D5','F#5','A5','D6']);ar(.5,['D5','F#5','A5','D6']);ar(1,['G5','B5','D6','G6']);ar(2,['A5','C#6','E6','A6']);
    for(const s of['D5','F#5','A5','D6'])c.n('a','sawlead',nm(s),3,4.5,.7,{tight:1});c.n('a','sqlead',nm('D6'),3,4.5,.9,{tight:1});for(const s of['D4','F#4','A4'])c.n('p','pad',nm(s),3,5,.7,{tight:1});
    c.n('b','synbass',nm('D2'),3,3,1,{tight:1});c.d('d','kick808',3,1);c.d('d','crash',3,.8);for(let i=0;i<8;i++)c.d('d','hat808',i*.25,.4);for(let i=0;i<4;i++)c.d('d','clap808',2+i*.25,.3+i*.12);
    ['D6','A6','F#6','D7'].forEach((s,i)=>c.n('p','glock',nm(s)-12,3.5+i*.25,.8,.5,{tight:1}))}},
over:{bpm:100,B:6,once:1,g:1.3,parts:{a:[.9,.35],b:[.6,.15],p:[.4,.45]},
  bar(c){['A5','G5','F5','E5'].forEach((s,i)=>c.n('a','sqlead',nm(s),i*.75,.6,.8,{tight:1}));c.n('a','pluck',nm('F#5'),3,2.5,.8,{tight:1});c.n('a','sqlead',nm('D5'),3,2.5,.6,{tight:1});
    for(const s of['D4','F#4','A4'])c.n('p','pad',nm(s),3,3,.7,{tight:1});['D3','C3','Bb2','A2'].forEach((s,i)=>c.n('b','synbass',nm(s),i*.75,.6,.8,{tight:1}));c.n('b','synbass',nm('D2'),3,2,.9,{tight:1})}}
};
function prepTheme(T){if(T.ok)return;T.ok=1;if(T.ch){T.C=prog(T.ch,T.B);T.bars=T.C.length}else T.bars=1;
  for(const tr of T.tr||[]){const {ev,len}=mMel(MEL[tr.m]),nb=Math.max(1,Math.round(len/T.B));tr.bars=Array.from({length:nb},()=>[]);for(const e of ev){const b=Math.floor(e.p/T.B+1e-6);tr.bars[b%nb].push(Object.assign({},e,{p:e.p-b*T.B}))}}}

/* ---------- engine ---------- */
function mImpulse(sec){const sr=AC.sampleRate,n=Math.floor(sr*sec),b=AC.createBuffer(2,n,sr);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let lp=0;for(let i=0;i<n;i++){const t=i/sr,x=(Math.random()*2-1)*Math.pow(1-i/n,2)*Math.exp(-t*1.6);lp+=(x-lp)*(.25+.55*(1-i/n));d[i]=t<.015?0:lp}}return b}
function mTrim(buf){const d=buf.getChannelData(0);let pk=0;for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(a>pk)pk=a}const th=pk*.02;let i=0;while(i<d.length&&Math.abs(d[i])<th)i++;i=Math.max(0,i-Math.floor(buf.sampleRate*.003));
  const nb=AC.createBuffer(1,d.length-i,buf.sampleRate),o=nb.getChannelData(0);o.set(d.subarray(i));for(let j=0;j<96&&j<o.length;j++)o[j]*=j/96;return nb}
function musGraph(){
  MU.out=AC.createGain();MU.out.gain.value=0;MU.lp=AC.createBiquadFilter();MU.lp.type='lowpass';MU.lp.frequency.value=18000;MU.lp.Q.value=.5;
  MU.cmp=AC.createDynamicsCompressor();MU.cmp.threshold.value=-14;MU.cmp.knee.value=10;MU.cmp.ratio.value=3;MU.cmp.attack.value=.01;MU.cmp.release.value=.25;
  MU.mix=AC.createGain();MU.rvIn=AC.createGain();MU.rv=AC.createConvolver();MU.rv.buffer=mImpulse(2.3);MU.rvOut=AC.createGain();MU.rvOut.gain.value=.8;
  MU.mix.connect(MU.cmp);MU.rvIn.connect(MU.rv);MU.rv.connect(MU.rvOut);MU.rvOut.connect(MU.cmp);MU.cmp.connect(MU.lp);MU.lp.connect(MU.out);MU.out.connect(AC.destination);
}
async function musInit(){
  if(MU.load||!AC||!MSAMP||!Object.keys(MSAMP).length)return;MU.load=true;
  try{musGraph()}catch(e){return}
  await Promise.all(Object.keys(MSAMP).map(async k=>{try{const bin=atob(MSAMP[k]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    const raw=await new Promise((res,rej)=>{const p=AC.decodeAudioData(u.buffer,res,rej);if(p&&p.catch)p.catch(rej)});const b=mTrim(raw),m=MMETA[k],g=Math.min(2.6,Math.max(.4,.2/m.rms));
    if(m.drum)MU.Dr[m.inst]={b,g};else(MU.I[m.inst]=MU.I[m.inst]||[]).push({n:m.note,b,g})}catch(e){}}));
  for(const k in MTH)prepTheme(MTH[k]);
  MU.ready=true;MU.out.gain.setTargetAtTime(MU.vol,AC.currentTime,.1);setInterval(musTick,50);
}
function mLayLv(T,k){const m=T.lay&&T.lay[k];return !m?1:m==='int'?MU.intS:m==='p2'?+(MU.ph>=2):m==='p3'?+(MU.ph>=3):1}
function mkTh(k){const T=MTH[k];prepTheme(T);const th={k,bar:0,loop:0,next:AC.currentTime+.08,bp:null,P:{}};
  th.dry=AC.createGain();th.wet=AC.createGain();th.dry.gain.value=0;th.wet.gain.value=0;th.dry.connect(MU.mix);th.wet.connect(MU.rvIn);
  const g=T.g||1,now=AC.currentTime;th.dry.gain.setTargetAtTime(g,now,.08);th.wet.gain.setTargetAtTime(g,now,.08);
  for(const p in T.parts){const [gv,rv]=T.parts[p],n=AC.createGain(),s=AC.createGain();n.gain.value=gv*mLayLv(T,p);s.gain.value=rv;n.connect(th.dry);n.connect(s);s.connect(th.wet);th.P[p]=n}
  return th}
function mKill(th,fade=.25){const now=AC.currentTime;th.dead=true;th.dry.gain.cancelScheduledValues(now);th.wet.gain.cancelScheduledValues(now);th.dry.gain.setTargetAtTime(0,now,fade);th.wet.gain.setTargetAtTime(0,now,fade);
  setTimeout(()=>{try{th.dry.disconnect();th.wet.disconnect()}catch(e){}},6000)}
function mBar(th){const T=MTH[th.k],spb=60/T.bpm,B=T.B,b=th.bar,t0=th.next;
  const c={th,T,b,loop:th.loop,B,spb,ch:T.C?T.C[b]:[],nx:T.C?T.C[(b+1)%T.bars][0]:null,r:mrng(th.loop*977+b*31+7),
    t:p=>t0+swg(p,T.swing||.5)*spb,
    n:(pt,inst,n,p,d,v=.85,o)=>mnote(th,pt,inst,n,c.t(p)+(o&&o.tight?0:(c.r()-.5)*.012),d*spb,v,o),
    d:(pt,k,p,v=.8)=>mdrum(th,pt,k,c.t(p)+(c.r()-.5)*.004,v)};
  T.bar(c);
  for(const tr of T.tr||[]){if(tr.when&&!tr.when(c))continue;for(const e of tr.bars[b%tr.bars.length])for(const n of e.n)c.n(tr.part,tr.inst,n+(tr.o||0),e.p,e.d*.95,e.v*(tr.v||1))}
  th.next=t0+B*spb;th.bar++;if(th.bar>=T.bars){th.bar=0;th.loop++}}
function musTick(){if(!MU.ready||AC.state!=='running')return;const th=MU.cur;if(!th)return;const now=AC.currentTime;if(th.next<now-.05)th.next=now+.05;let n=0;while(th.next<now+.3&&n++<4)mBar(th)}
function musPlay(k){if(!MU.ready)return;
  if(MU.cur){const o=MU.cur;MU.pos[o.k]={bar:o.bar,loop:o.loop};mKill(o)}MU.cur=null;
  if(!k||!MTH[k])return;const T=MTH[k],th=mkTh(k);
  if(T.resume&&MU.pos[k]){th.bar=MU.pos[k].bar-MU.pos[k].bar%4;th.loop=MU.pos[k].loop}
  MU.cur=th}
function musSting(k){if(!MU.ready||muted||!MU.on)return;musPlay('');if(MU.st&&!MU.st.dead)mKill(MU.st,.08);const T=MTH[k],th=mkTh(k);MU.st=th;th.next=AC.currentTime+.05;mBar(th);MU.hold=AC.currentTime+T.B*60/T.bpm+.3;
  setTimeout(()=>{try{th.dry.disconnect();th.wet.disconnect()}catch(e){}},(T.B*60/T.bpm+5)*1000)}
function musWant(){
  if(['title','class','forge','codex','save'].includes(state))return'menu';
  if(['map','shop','event'].includes(state))return'map';
  if(!run||state==='over'||state==='win'||state==='dying')return'';
  if(bossE||(bossWarn&&dir&&dir.bossIn>0))return'boss';
  if(miniE)return'mini';
  return MTH[BIOME]?BIOME:'dungeon';
}
function musUpdate(dt){
  if(!MU.ready)return;const now=AC.currentTime;
  const w=MU.on&&!muted?musWant():'';if(now>=MU.hold&&w!==(MU.cur?MU.cur.k:''))musPlay(w);
  if(state==='play'){let it=Math.min(1,Math.max(0,(enemies.length-14)/36+ebul.length/70));if(setp)it=Math.max(it,.7);if(P&&P.hp<P.maxHp*.3)it=1;if(stage>=4)it=Math.max(it,.3);MU.intS+=(it-MU.intS)*Math.min(1,dt*(it>MU.intS?.9:.35))}
  MU.ph=bossE&&bossE.phase?bossE.phase:1;
  MU.lt-=dt;if(MU.lt>0)return;MU.lt=.2;
  const th=MU.cur;if(th){const T=MTH[th.k];if(T.lay)for(const p in T.lay)th.P[p].gain.setTargetAtTime(T.parts[p][0]*mLayLv(T,p),now,.35)}
  const pz=state==='paused',soft=state==='levelup'||state==='relic';
  MU.lp.frequency.setTargetAtTime(pz?900:soft?3200:18000,now,.12);MU.out.gain.setTargetAtTime(MU.vol*(pz?.6:1),now,.12);
}
const _audioInit0=audioInit;audioInit=function(){_audioInit0();musInit()};
addEventListener('pointerdown',()=>audioInit(),true);addEventListener('keydown',()=>audioInit(),true);
document.addEventListener('visibilitychange',()=>{if(!AC)return;try{document.hidden?AC.suspend():AC.resume()}catch(e){}});
