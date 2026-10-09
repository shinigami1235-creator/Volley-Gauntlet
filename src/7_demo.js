/* style demos (not shipped) */
Object.assign(IP,{sawlead:{a:.005,r:.12,v:.42},sqlead:{a:.003,r:.1,v:.26},synbass:{a:.003,r:.06,v:.6},pad:{a:.3,r:.6,v:.55,loop:1},organ:{a:.01,r:.12,v:.32,loop:1},dist:{a:.004,r:.08,v:.42},pluck:{a:.002,r:.2,v:.5},fbass:{a:.004,r:.06,v:.8}});
Object.assign(DV,{pkick:1,psnare:.75,kick808:1,clap808:.6,hat808:.45,ohat808:.35,ekick:1,esnare:.7});
MEL.demo=`E5:.5 G5:.5 B5:1 A5:.5 G5:.5 E5:1 | E5:.5 G5:.5 C6:1 B5:.5 A5:.5 G5:1 | D5:.5 G5:.5 B5:1 D6:1 B5:1 | A5:1.5 F#5:.5 D5:2 |
 E5:.5 G5:.5 B5:1 A5:.5 G5:.5 E5:1 | G5:.5 A5:.5 C6:1 E6:1 C6:1 | C6:.5 B5:.5 A5:.5 E5:.5 A5:1 C6:1 | B5:1.5 A5:.5 F#5:1 D#5:1 |
 E6:1 D6:.5 B5:.5 G5:1 B5:1 | C6:1 B5:.5 G5:.5 E5:1 G5:1 | D6:1 B5:.5 G5:.5 D5:1 G5:1 | F#5:.5 G5:.5 A5:.5 B5:.5 C6:.5 B5:.5 A5:1 |
 E5:.5 G5:.5 C6:1 B5:.5 C6:.5 E6:1 | D6:.5 C6:.5 A5:.5 F#5:.5 D6:2 | B5:1 G5:.5 E5:.5 B5:1 E6:1 | E6:2 r:2 |`;
const DCH='Em|C|G|D|Em|C|Am|B|Em|C|G|D|C|D|Em|Em',HALF=c=>c.b>=4;
MTH.demoA={bpm:164,B:4,g:1,ch:DCH,
  parts:{bass:[.75,.08],dr:[.7,.1],str:[.35,.25],pad:[.25,.4],lead:[1.35,.28],lead2:[.7,.3],hi:[.45,.3]},
  tr:[{part:'lead',inst:'pluck',m:'demo',when:FIRST8},{part:'lead2',inst:'glock',m:'demo',when:FIRST8,v:.6},{part:'lead',inst:'sawlead',m:'demo',when:LAST8},{part:'lead2',inst:'trumpet',m:'demo',o:-12,when:LAST8}],
  bar(c){ost(c,'bass','synbass',33,[0,0,12,0,0,0,12,0],.5,.9);perc(c,'dr',[[0,'pkick',.9],[1,'psnare',.7],[1,'clap808',.4],[2,'pkick',.8],[2.5,'pkick',.5],[3,'psnare',.75],[3,'clap808',.45]]);
    for(let i=0;i<8;i++)c.d('dr','hat808',i/2,i%2?.35:.5);c.d('dr','ohat808',3.5,.4);if(c.b%4===0)c.d('dr','crash',0,.4);
    if(HALF(c)){ost(c,'str','strings',50,[0,7,12,7,'T',7,12,7],.5,.5);stab(c,'hi','brass',57,[[0,.25],[.75,.25],[2.5,.3]],.7)}mPad(c,'pad','pad',55,.6)}};
MTH.demoB={bpm:164,B:4,g:1,ch:DCH,
  parts:{bass:[.65,.06],gtr:[.42,.12],org:[.28,.25],dr:[.7,.1],lead:[1.45,.25],lead2:[.55,.25]},
  tr:[{part:'lead',inst:'sawlead',m:'demo'},{part:'lead2',inst:'organ',m:'demo',when:LAST8}],
  bar(c){ost(c,'bass','fbass',33,[0,0,0,0,0,0,12,0],.5,.9);for(const C of c.ch){const r0=near(C.r,40,38,49);for(let i=0;i<C.len*2;i++){const acc=i%4===0||i%4===3;c.n('gtr','dist',r0,C.at+i*.5,acc?.45:.28,acc?.95:.7,{tight:1});c.n('gtr','dist',r0+7,C.at+i*.5,acc?.45:.28,acc?.8:.6,{tight:1})}}
    mPad(c,'org','organ',60,.6);perc(c,'dr',[[0,'pkick',1],[1,'psnare',.8],[1.5,'pkick',.6],[2,'pkick',.9],[3,'psnare',.85],[3.75,'psnare',.35]]);for(let i=0;i<8;i++)c.d('dr','chh',i/2,i%2?.35:.55);if(c.b%4===0)c.d('dr','crash',0,.55)}};
MTH.demoC={bpm:164,B:4,g:1,ch:DCH,
  parts:{bass:[.65,.06],dr:[.7,.08],arp:[.22,.25],pad:[.2,.4],lead:[2,.2]},
  tr:[{part:'lead',inst:'sqlead',m:'demo'},{part:'lead',inst:'sqlead',m:'demo',o:-12,v:.5,when:LAST8}],
  bar(c){ost(c,'bass','synbass',33,[0,12,0,12,0,12,0,12],.5,.85);perc(c,'dr',[[0,'kick808',1],[1,'kick808',.9],[2,'kick808',1],[3,'kick808',.9],[1,'clap808',.7],[3,'clap808',.75]]);
    for(let i=0;i<16;i++)c.d('dr',i%4===2?'ohat808':'hat808',i/4,i%2?.3:.45);arp(c,'arp','sqlead',64,[1,2,3,4,3,2,1,2],.25,.5,.2);if(HALF(c))mPad(c,'pad','pad',55,.6)}};
