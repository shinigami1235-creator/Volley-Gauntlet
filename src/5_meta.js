
/* ================= biomes ================= */
const BIOMES={
  dungeon:{n:'Dungeon',boss:'warden',bosses:['warden','slime'],mini:'ogre',d:'Stone halls with a bit of everything.',floor:['#3a3643','#35323e','#3e3a47','#322f3a'],grout:'#17141c',wall:['#2a2630','#26222c','#2e2934'],wallBg:'#1d1a22',ledge:'#4a4553',moss:'rgba(90,120,70,.22)',flame:['#ff6a1f','#ffd166'],glow:[255,150,60],haz:{},set:{}},
  frozen:{n:'Frozen Caves',boss:'lich',bosses:['lich','knight'],mini:'witch',d:'Ice patches slide you around and enemies chill you on touch.',floor:['#4a5a6e','#435368','#506276','#3e4d60'],grout:'#141c28',wall:['#2c3848','#28323f','#314052'],wallBg:'#1c2430',ledge:'#6a7f99',moss:'rgba(210,240,255,.25)',flame:['#3aa0ff','#bfe8ff'],glow:[120,200,255],haz:{ice:3,rocks:1.5},set:{dark:2}},
  forge:{n:'Lava Forge',boss:'colossus',bosses:['colossus','wyrm'],mini:'golem',d:'Lava rivers, flame jets and crushers. Enemies can leave fire where they die.',floor:['#4a3430','#44302c','#503834','#3e2c28'],grout:'#1e1210',wall:['#3a2622','#34221e','#402a26'],wallBg:'#241612',ledge:'#6b4a40',moss:'rgba(255,120,40,.22)',flame:['#ff3d1f','#ffb020'],glow:[255,110,40],haz:{flame:2.5,crusher:1.8},set:{lava:3,squeeze:1.5}},
  ruins:{n:'Sunken Ruins',boss:'hydra',bosses:['hydra'],mini:'witch',d:'Poison pools, saws and old shrines. Enemies poison you on touch.',floor:['#35504a','#304a44','#3a5750','#2c443e'],grout:'#0e1c18',wall:['#26403a','#223834','#2a463f'],wallBg:'#16241f',ledge:'#4f7068',moss:'rgba(120,220,180,.25)',flame:['#1fd18a','#b8ffd8'],glow:[120,255,200],haz:{pool:3,saw:1.6},set:{shrine:2.5}},
  sky:{n:'Sky Fortress',boss:'carrier',bosses:['carrier'],mini:'ogre',d:'Wind pushes you around. Bombing runs and air drops.',floor:['#6b5a44','#63533f','#735f48','#5d4d3a'],grout:'#2a2018',wall:['#3a3f4c','#343944','#40464f'],wallBg:'#22252c',ledge:'#8a91a3',moss:'rgba(255,255,255,.12)',flame:['#ff9a3c','#fff0b0'],glow:[255,200,120],haz:{laser:2,mines:1.6},set:{airdrop:3,bombrun:3}},
};
const BIOME_ORDER=['dungeon','frozen','forge','ruins','sky'];
const RUSHB=['warden','colossus','hydra','lich','carrier','slime','knight','wyrm'];
let BIOME='dungeon';
const bossBiome=b=>BIOME_ORDER.find(k=>BIOMES[k].bosses.includes(b))||'dungeon';
function pickBoss(b){const l=BIOMES[b].bosses,r=run&&run.daily?rngOf(+run.daily.key.replace(/-/g,'')+b.length*7+stage):Math.random;return l[Math.floor(r()*l.length)]}
function setBiome(k){BIOME=k;TORCH=null;buildTiles()}

/* ================= save ================= */
const SAVE_KEY='vg_save3';
let S=null;
function defSave(){return{v:1,embers:0,forge:{},unl:{},ach:{},mastery:{},skin:{},weapon:{},codex:{en:{},boss:{},relic:{},fuse:{},curse:{}},grades:{},stats:{runs:0,bossKills:0,bossBy:{},best:{}},daily:{},own:{},sel:{mode:'gauntlet',cls:'ranger'}}}
function mergeSave(o){
  if(!o||typeof o!=='object'||o.v!==1)return false;const d=defSave();
  for(const k in d){if(o[k]===undefined)continue;if(d[k]&&typeof d[k]==='object'&&!Array.isArray(d[k]))d[k]=Object.assign(d[k],o[k]);else d[k]=o[k]}
  d.codex=Object.assign(defSave().codex,o.codex||{});d.stats=Object.assign(defSave().stats,o.stats||{});S=d;return true;
}
function loadSave(){S=defSave();try{const t=STORE.get(SAVE_KEY);if(t)mergeSave(JSON.parse(t))}catch(e){}
  try{const ob=JSON.parse(STORE.get('vg2_best')||'{}');for(const k in ob)S.stats.best[k]=Math.max(S.stats.best[k]||0,ob[k]||0)}catch(e){}
  best=S.stats.best}
function saveGame(){try{STORE.set(SAVE_KEY,JSON.stringify(S))}catch(e){}}
function saveCode(){return'VG3.'+btoa(unescape(encodeURIComponent(JSON.stringify(S))))}
function loadCode(t){try{t=t.trim();if(!t.startsWith('VG3.'))return false;const o=JSON.parse(decodeURIComponent(escape(atob(t.slice(4)))));if(!mergeSave(o))return false;best=S.stats.best;saveGame();return true}catch(e){return false}}

/* ================= unlocks & achievements ================= */
const LOCKED={relic:['phoenix','hourglass','crown','thorn','mark','charm','purse','ring'],skill:['thunder','wisp'],curse:['blood','hunted'],mode:['endless','rush'],skin:['gold'],weapon:['ranger','mage','gunner','berserker'].flatMap(c=>[1,2,3].map(i=>c+':'+i))};
function unlocked(type,k){return!(LOCKED[type]||[]).includes(k)||!!S.unl[type+':'+k]}
const ACH={
  warden:{n:'Jailbreak',d:'Beat the Warden.',un:'relic:thorn'},
  colossus:{n:'Bonebreaker',d:'Beat the Bone Colossus.',un:'relic:phoenix'},
  hydra:{n:'Three heads down',d:'Beat the Storm Hydra.',un:'curse:blood'},
  lich:{n:'Lights on',d:'Beat the Lich.',un:'relic:hourglass'},
  carrier:{n:'Grounded',d:'Beat the Sky Carrier.',un:'relic:mark'},
  stage3:{n:'Deep dive',d:'Reach stage 3.',un:'mode:endless'},
  bosses3:{n:'Boss hunter',d:'Beat 3 bosses in total.',un:'mode:rush'},
  parry10:{n:'Pink belt',d:'Parry 10 shots in one run.',un:'relic:charm'},
  fuse3:{n:'Alchemist',d:'Make 3 fusions in one run.',un:'skill:thunder'},
  kills1000:{n:'Crowd control',d:'Kill 1000 enemies in one run.',un:'skill:wisp'},
  sgrade:{n:'Flawless',d:'Get an S grade on any boss.',un:'relic:crown'},
  curse3:{n:'Cursed',d:'Carry 3 curses at once.',un:'curse:hunted'},
  gold300:{n:'Hoarder',d:'Hold 300 gold at once.',un:'relic:purse'},
  shrine:{n:'Pilgrim',d:'Finish a shrine.',un:'relic:ring'},
  hardboss:{n:'Hardened',d:'Beat a boss on Hard or Nightmare.',un:'skin:gold'},
  nightmare:{n:'Nightmare walker',d:'Beat a boss on Nightmare.',un:''},
  all4:{n:'Jack of all trades',d:'Beat a boss with every hero.',un:''},
  win:{n:'Gauntlet runner',d:'Finish a Gauntlet run.',un:''},
  slime:{n:'Dethroned',d:'Beat the Slime King.',un:''},
  knight:{n:'Unhorsed',d:'Beat the Frost Knight.',un:''},
  wyrm:{n:'Dug out',d:'Beat the Magma Wyrm.',un:''},
  wranger1:{n:'Bolt action',d:'Beat a boss with the Ranger.',un:'weapon:ranger:1'},
  wmage1:{n:'Static',d:'Beat a boss with the Mage.',un:'weapon:mage:1'},
  wgunner1:{n:'Scattershot',d:'Beat a boss with the Gunner.',un:'weapon:gunner:1'},
  wberserker1:{n:'Spearhead',d:'Beat a boss with the Berserker.',un:'weapon:berserker:1'},
  wranger2:{n:'Sharpshooter',d:'Reach a 150 kill combo with the Ranger.',un:'weapon:ranger:2'},
  wmage2:{n:'Cold snap',d:'Freeze 60 enemies in one run with the Mage.',un:'weapon:mage:2'},
  wgunner2:{n:'Bullet hell',d:'Kill 1500 enemies in one run with the Gunner.',un:'weapon:gunner:2'},
  wberserker2:{n:'Deflector',d:'Parry 15 shots in one run with the Berserker.',un:'weapon:berserker:2'},
  wranger3:{n:'Ranger champion',d:'Finish a Gauntlet run with the Ranger on Normal or harder.',un:'weapon:ranger:3'},
  wmage3:{n:'Mage champion',d:'Finish a Gauntlet run with the Mage on Normal or harder.',un:'weapon:mage:3'},
  wgunner3:{n:'Gunner champion',d:'Finish a Gauntlet run with the Gunner on Normal or harder.',un:'weapon:gunner:3'},
  wberserker3:{n:'Berserker champion',d:'Finish a Gauntlet run with the Berserker on Normal or harder.',un:'weapon:berserker:3'},
};
function unlockName(u){if(!u)return'';const i0=u.indexOf(':'),t=u.slice(0,i0),k=u.slice(i0+1);return t==='relic'?RE[k].n+' relic':t==='skill'?SK[k].n+' skill':t==='curse'?CU[k].n+' curse':t==='mode'?MODES[k].n+' mode':t==='skin'?'Gold skin for every hero':t==='weapon'?(()=>{const[c,i]=k.split(':');return WEAPS[c][+i].wn+' for the '+CLASSES[c].n})():''}
function ach(k){if(!S||S.ach[k])return;S.ach[k]=1;const A=ACH[k];if(A.un)S.unl[A.un]=1;if(run)run.newAch.push(k);saveGame();toast(`${A.n}<small>${A.d}${A.un?' Unlocked: '+unlockName(A.un)+'.':''}</small>`);sfx.level()}
function toast(html){const t=document.createElement('div');t.className='toastI';t.innerHTML=html;$('#toast').appendChild(t);requestAnimationFrame(()=>t.classList.add('on'));setTimeout(()=>{t.classList.remove('on');setTimeout(()=>t.remove(),450)},3400)}

/* ================= forge ================= */
const FORGE={
  vigor:{n:'Vigor',d:'+6 max HP per rank.',max:10,base:20,icon:'vital'},
  might:{n:'Might',d:'+4% damage per rank.',max:10,base:30,icon:'dmg'},
  haste:{n:'Haste',d:'Attack 3% faster per rank.',max:10,base:30,icon:'rate'},
  luck:{n:'Keen eye',d:'+2% crit chance per rank.',max:5,base:40,icon:'crit'},
  step:{n:'Quick step',d:'Dash recharges 5% faster per rank.',max:5,base:30,icon:'swift'},
  fortune:{n:'Fortune',d:'+1 reroll at the start of a run per rank.',max:3,base:60,icon:'clover'},
  purse:{n:'Deep pockets',d:'+12% gold per rank.',max:5,base:20,icon:'greed'},
  scholar:{n:'Scholar',d:'+6% XP per rank.',max:5,base:30,icon:'power'},
  arsenal:{n:'Arsenal',d:'Start each run with a random skill per rank.',max:3,base:150,icon:'multi'},
  heirloom:{n:'Heirloom',d:'Pick a relic at the start of each run.',max:1,base:600,icon:'chest'},
  second:{n:'Second wind',d:'Once per run, a hit that would kill you leaves you at 1 HP.',max:1,base:500,icon:'heart'},
};
const FORGE_OLD={vigor:[30,25],might:[40,30],haste:[40,30],luck:[50,40],step:[35,30],fortune:[60,60],purse:[30,25],scholar:[40,30],arsenal:[150,150],heirloom:[400,0],second:[300,0]};
function forgeRanks(){let t=0;for(const k in FORGE)t+=fr(k);return t}
function forgeCost(k){return Math.round(FORGE[k].base*(fr(k)+1)*(1+.08*forgeRanks()))}
function forgeMigrate(){if(S.forgeSpent!=null)return;let s=0;for(const k in FORGE_OLD){const [a,b]=FORGE_OLD[k];for(let r=0;r<fr(k);r++)s+=a+b*r}S.forgeSpent=s}
const fr=k=>S.forge[k]||0;

/* ================= mastery, weapons, skins ================= */
const MLV=[0,300,900,2000,3600,6000,9000,13000,18000,25000,34000];
const MREW=['','First skin','+10 max HP','+1 reroll at the start','Second skin','Gold name on this hero\'s card','+2% damage','+2% damage','+2% damage','+2% damage','+5% damage'];
function mLevel(c){const x=S.mastery[c]||0;let l=0;while(l<MLV.length-1&&x>=MLV[l+1])l++;return l}
const WEAPS={
  ranger:[{wn:'Bow',id:'bow'},
    {wn:'Crossbow',id:'crossbow',w:'arrow',iv:.8,dmg:24,cap:10,spreadM:.45,basePierce:2,bigM:1.35,psp:1150,pw:['bolt','bolts'],wd:'Heavy bolts that pierce two enemies. Slower.'},
    {wn:'Seeker bow',id:'seeker',w:'arrow',iv:.5,dmg:11,cap:14,spreadM:1.6,homB:1.6,pw:['arrow','arrows'],wd:'Wide fans of arrows that curve toward the nearest enemy.'},
    {wn:'Sky bow',id:'sky',w:'sky',iv:.55,dmg:15,cap:10,pw:['arrow','arrows'],wd:'Arrows drop from above onto the enemies ahead of you.'}],
  mage:[{wn:'Orb staff',id:'orb'},
    {wn:'Storm staff',id:'storm',w:'zap',iv:.36,dmg:14,cap:6,pw:['arc','arcs'],wd:'Lightning jumps to the nearest enemies, then arcs on to more. Pierce and ricochet add arcs.'},
    {wn:'Frost wand',id:'frost',w:'frost',iv:.28,dmg:8,cap:8,pw:['shard','shards'],wd:'Fast ice shards that pierce once and slow whatever they hit.'},
    {wn:'Meteor staff',id:'meteor',w:'meteor',iv:1.05,dmg:26,cap:6,pw:['meteor','meteors'],wd:'Slow fireballs with a big blast that sets enemies on fire.'}],
  gunner:[{wn:'Rifle',id:'rifle'},
    {wn:'Shotgun',id:'shotgun',w:'shot',iv:.55,dmg:4.5,cap:8,pw:['shell','shells'],wd:'A wide blast of pellets. Short range.'},
    {wn:'Minigun',id:'minigun',w:'bullet',iv:.055,dmg:2.2,cap:4,jit:.13,pw:['barrel','barrels'],wd:'Twice the fire rate with a wild spray. Hold still to tighten it.'},
    {wn:'Rocket launcher',id:'rocket',w:'rocket',iv:.9,dmg:17,cap:5,pw:['rocket','rockets'],wd:'Rockets that speed up and blow up on impact.'}],
  berserker:[{wn:'Axes',id:'axes'},
    {wn:'Spears',id:'spears',w:'spear',iv:.66,dmg:15,cap:5,pw:['spear','spears'],wd:'Thrown spears that pierce four enemies.'},
    {wn:'Chakram',id:'chakram',w:'disc',iv:.6,dmg:11,cap:5,pw:['chakram','chakrams'],wd:'Spinning blades that bounce between four enemies.'},
    {wn:'Warhammer',id:'hammer',w:'slam',iv:.7,dmg:32,cap:4,pw:['quake','quakes'],wd:'Slams the ground in front of you and knocks enemies back. Short range, huge hits.'}],
};
function weapOk(c,i){return i===0||unlocked('weapon',c+':'+i)}
function weapOf(c){const i=S&&S.weapon?(+S.weapon[c]||0):0;return WEAPS[c][i]&&weapOk(c,i)?i:0}
function weapHint(c,i){const k=Object.keys(ACH).find(a=>ACH[a].un==='weapon:'+c+':'+i);return k?ACH[k].d:''}
const WENH={bow:{n:'Volley',d:'Fire 1 more arrow per level, past the arrow cap.'},crossbow:{n:'Blasting bolts',d:'Bolts explode where they hit. Each level makes the blast bigger and stronger.'},seeker:{n:'Finisher',d:'+30% damage per level to enemies under half HP.'},sky:{n:'Starfall',d:'1 more arrow falls per level.'},
  orb:{n:'Big bang',d:'Orb blasts are 30% wider and 20% stronger per level.'},storm:{n:'Overcharge',d:'+2 arcs per level, and arcs hit 10% harder.'},frost:{n:'Deep freeze',d:'+10% freeze chance per level. Frozen enemies take 25% more damage per level.'},meteor:{n:'Firestorm',d:'Blasts get wider and burn 2 seconds longer per level.'},
  rifle:{n:'Hollow points',d:'Bullets pierce 1 more enemy per level.'},shotgun:{n:'Buckshot',d:'+3 pellets per level.'},minigun:{n:'Spin up',d:'Fire 12% faster per level.'},rocket:{n:'Cluster rockets',d:'Rockets burst into smaller blasts. Each level makes the blast bigger.'},
  axes:{n:'Whirling axes',d:'Axes hit 2 more enemies per level.'},spears:{n:'Impale',d:'Spears pierce 2 more enemies per level.'},chakram:{n:'Razor rim',d:'Chakrams bounce 2 more times per level.'},hammer:{n:'Aftershock',d:'Each slam sends a second quake. Each level makes it hit harder.'}};
const BASEWN={ranger:'Bow',mage:'Orb staff',gunner:'Rifle',berserker:'Axes'};
const SKINS={
  ranger:[null,{col:'#3a7d2c',hi:'#8fe06b',dk:'#1a3d12'},{col:'#2c4a8a',hi:'#7fa8ff',dk:'#121f40'}],
  mage:[null,{col:'#b0304f',hi:'#ff8aa5',dk:'#4a0f1e'},{col:'#1f7a8a',hi:'#7fe7ff',dk:'#0b3540'}],
  gunner:[null,{col:'#4a5a6e',hi:'#9fb4d8',dk:'#1c2430'},{col:'#8a2c7d',hi:'#ff8ae6',dk:'#3a0f34'}],
  berserker:[null,{col:'#2c6b4a',hi:'#7fe0a8',dk:'#0f2e1f'},{col:'#3a3a46',hi:'#8b90a0',dk:'#15151c'}],
};
const GOLDSKIN={col:'#c9a227',hi:'#ffe58a',dk:'#6b5210'};
const BUYSKINS=[
  {id:'shadow',n:'Shadow',c:400,pal:{col:'#3a2d55',hi:'#9b7fd8',dk:'#140e22'}},
  {id:'frost',n:'Frost',c:400,pal:{col:'#4f8fbf',hi:'#bff0ff',dk:'#1c3a5a'}},
  {id:'ember',n:'Ember',c:800,pal:{col:'#c2451e',hi:'#ffb35c',dk:'#4a1408'}},
  {id:'jade',n:'Jade',c:800,pal:{col:'#1f8f6a',hi:'#8fffcf',dk:'#0a3a2a'}},
  {id:'royal',n:'Royal',c:1500,pal:{col:'#6a2a9a',hi:'#ffd166',dk:'#2a0f40'}},
  {id:'prism',n:'Prism',c:3000,pal:{col:'#c04bd0',hi:'#ffb0ff',dk:'#40104a',prism:true}},
];
function skinOf(c,i){if(i===3)return GOLDSKIN;if(i>=4)return(BUYSKINS[i-4]||{}).pal||null;return SKINS[c][i]||null}
function skinOk(c,i){if(i===0)return true;if(i>=4){const b=BUYSKINS[i-4];return!!(b&&S.own&&S.own[c+':'+b.id])}if(i===1)return mLevel(c)>=1;if(i===2)return mLevel(c)>=4;if(i===3)return unlocked('skin','gold');return false}

/* ================= modes & daily ================= */
const MODES={gauntlet:{n:'Gauntlet',d:'Five stages, one per biome. You pick the route between them.'},endless:{n:'Endless',d:'Stages keep coming until you fall. A shop every other stage.'},rush:{n:'Boss Rush',d:'Every boss back to back. Two skill picks between fights.'},daily:{n:'Daily',d:'The same hero, difficulty and rules for today. Forge upgrades are off.'}};
const DMODS={pacts:{n:'Pacts only',d:'Every gate row is a pact.'},champs:{n:'Champion night',d:'Champions are three times as common.'},glass:{n:'Glass start',d:'You start with Glass Cannon.'},rich:{n:'Rich but pricey',d:'Twice the gold, shops cost 50% more.'},fast:{n:'Fast forward',d:'Enemies are 25% faster. Score +50%.'},relic:{n:'Heirloom',d:'You start with a random relic.'},bats:{n:'Bat cave',d:'Bats show up all the time.'},dark:{n:'Blackout',d:'Lights out is the most common set piece.'}};
function rngOf(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function dayKey(){const d=new Date();return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0')}
function dailySpec(){const k=dayKey(),r=rngOf(+k.replace(/-/g,''));const cls=Object.keys(CLASSES)[Math.floor(r()*4)];const mods=Object.keys(DMODS);const a=mods.splice(Math.floor(r()*mods.length),1)[0],b=mods[Math.floor(r()*mods.length)];return{key:k,cls,diff:'hard',mods:[a,b],seed:r}}
const dm=m=>!!(run&&run.daily&&run.daily.mods.includes(m));

/* ================= run lifecycle ================= */
let run=null,selCls='ranger',selMode='gauntlet',resumeFn=null;
function newRun(mode){return{mode,bosses:0,minis:0,parries:0,fusions:0,gradeB:0,visited:['dungeon'],elite:false,daily:mode==='daily'?dailySpec():null,bstat:null,paid:null,wind:{t:7,dir:0,left:0},loop:0,rushI:0,won:false,newAch:[],grades:[],embersGot:0}}
function applyMeta(){
  const fs=run.mode==='daily'?0:(diff==='nightmare'?.5:1),ml=mLevel(P.cls);
  const md=run.mode!=='daily';
  P.meta={hp:6*fr('vigor')*fs+(ml>=2&&md?10:0),dash:Math.pow(.95,fr('step')*fs),gold:(1+.12*fr('purse')*fs)*(dm('rich')?2:1),xp:1+.06*fr('scholar')*fs,second:fr('second')>0&&fs>0,
    dmg:1+.04*fr('might')*fs,rate:1+.03*fr('haste')*fs,crit:.02*fr('luck')*fs,mdmg:md?1+.02*clamp(ml-5,0,4)+(ml>=10?.05:0):1};
  P.rerolls+=Math.floor(fr('fortune')*fs)+(ml>=3&&md?1:0);
  const WE=WENH[P.C.id||'bow'];SK.wenh.n=P.C.wn+': '+WE.n;SK.wenh.d=WE.d;
  for(let i=0;i<Math.floor(fr('arsenal')*fs);i++){const pool=Object.keys(SK).filter(k=>unlocked('skill',k)&&k!=='vital');const k=pick(pool);P.sk[k]=(P.sk[k]||0)+1;if(ELEMN[k])P.elem=k}
  if(dm('glass'))P.cu.add('glass');
  if(dm('fast')){G.enemySpd*=1.25;G.score*=1.5}
  if(dm('relic'))giveRelic();
  recalc();P.hp=P.maxHp;
  if(fr('heirloom')&&fs>0)pendingRelic=true;
}
function giveRelic(){const pool=Object.keys(RE).filter(k=>!P.re.has(k)&&unlocked('relic',k));if(!pool.length)return'You find nothing new.';const k=pick(pool);P.re.add(k);S.codex.relic[k]=1;if(k==='clover')P.rerolls+=3;recalc();return`You get ${RE[k].n}. ${RE[k].d}`}
function clearField(){enemies=[];projs=[];ebul=[];gems=gems.filter(g=>g.coin);pickups=[];hazards=[];zones=[];clouds=[];nades=[];gateRows=[];walls=[];setp=null;squeeze=0;darkT=0;darkBoss=false;flood=false;bossScrollStop=false;freezeAll=0}
function beginStage(){
  clearField();for(const g of gems){g.pull=true}hideOv();state='play';$('#hud').hidden=false;
  stageT=0;bossWarn=false;miniWarn=false;miniDone=false;dir.next=.6;dir.seq=['crowd','gate','scatter','set','gate'];dir.trick=.8;
  const B=BIOMES[BIOME];banner(`${B.n}<small>Stage ${stage}.${run.elite?' Elite: more champions and a relic after the boss.':' '+B.d}</small>`,'#ffc93c');
  P.iframe=1;last=performance.now();hud();
}
function afterBoss(e){
  const bs=run.bstat;if(bs){const g=gradeOf(bs);run.grades.push(g);const bk=e.type+'_'+diff;if(!S.grades[bk]||GR.indexOf(g)<GR.indexOf(S.grades[bk]))S.grades[bk]=g;S.codex.boss[e.type]=S.codex.boss[e.type]&&GR.indexOf(S.codex.boss[e.type])<GR.indexOf(g)?S.codex.boss[e.type]:g;run.gradeB+={S:20,A:12,B:6,C:2,D:0}[g];if(g==='S')ach('sgrade');run.lastGrade=g}
  run.bosses++;S.stats.bossKills++;S.stats.bossBy[P.cls]=1;ach(e.type);if(run.mode!=='daily')ach('w'+P.cls+'1');if(e.tw&&e.tw.length)run.twists=(run.twists||0)+e.tw.length;if(S.stats.bossKills>=3)ach('bosses3');if(diff==='nightmare')ach('nightmare');if(diff==='hard'||diff==='nightmare')ach('hardboss');if(Object.keys(CLASSES).every(c=>S.stats.bossBy[c]))ach('all4');if(stage>=3)ach('stage3');saveGame();
  if(run.mode==='rush'){run.rushI++;pendingLv+=2;heal(P.maxHp*.5);const nb=RUSHB[run.rushI%RUSHB.length];later(2.4,()=>{setBiome(bossBiome(nb));clearField();stageT=STAGE_LEN;bossWarn=false;miniDone=true;banner(`${ED[nb].name}<small>Boss ${run.rushI+1}.</small>`,'#ff6b85')});return}
  if(run.mode==='endless'){const i=(BIOME_ORDER.indexOf(BIOME)+1)%5;if(i===0)run.loop++;later(1.8,()=>{setBiome(BIOME_ORDER[i]);if(stage%2===1)openShop(beginStage);else beginStage()});return}
  if(run.elite){pendingRelic=true;run.elite=false}
  if(stage>5&&!run.won){later(1.8,openWin);return}
  later(1.8,openMap);
}
const GR=['S','A','B','C','D'];
function gradeOf(bs){const t=runT-bs.t0;const p=100-bs.hits*12-Math.max(0,t-50)*.7+bs.parries*4;return p>=92?'S':p>=78?'A':p>=62?'B':p>=45?'C':'D'}
function endRun(){
  const dmul={story:.5,normal:1,hard:1.6,nightmare:2.4}[diff];const pd=run.paid||{score:0,bosses:0,minis:0,gradeB:0,kills:0,stage:1};const lg=v=>Math.log10(1+v/1000);
  const e=Math.max(0,Math.floor(((stage-(pd.stage||1))*20+(run.bosses-pd.bosses)*25+(run.minis-pd.minis)*8+((run.twists||0)-(pd.twists||0))*10+(run.gradeB-pd.gradeB)+8*(lg(score)-lg(pd.score)))*dmul));
  const mx=Math.floor(((kills-pd.kills)+(stage-(pd.stage||1))*60+(run.bosses-pd.bosses)*150)*Math.max(.5,dmul*.8));
  const before=mLevel(P.cls);if(run.mode!=='daily')S.mastery[P.cls]=(S.mastery[P.cls]||0)+mx;const after=mLevel(P.cls);
  S.embers+=e;S.stats.runs++;run.embersGot+=e;
  const bk=bestKey(P.cls);const nb=score>(S.stats.best[bk]||0);if(nb)S.stats.best[bk]=Math.floor(score);best=S.stats.best;
  if(run.mode==='daily'){const d=S.daily[run.daily.key]||[];d.push({s:Math.floor(score),st:stage});d.sort((a,b)=>b.s-a.s);S.daily[run.daily.key]=d.slice(0,5);const ks=Object.keys(S.daily).sort();while(ks.length>14)delete S.daily[ks.shift()]}
  run.paid={score,bosses:run.bosses,minis:run.minis,gradeB:run.gradeB,kills,stage,twists:run.twists||0};
  saveGame();return{e,mx,nb,lvUp:after>before?after:0};
}

/* ================= generic overlay ================= */
function ovX(title,sub,bodyHTML,buttons,wide){hideOv();const o=$('#ovX');o.hidden=false;$('#xT').textContent=title;$('#xS').innerHTML=sub||'';$('#xS').hidden=!sub;$('#xB').innerHTML=bodyHTML||'';$('#xP').classList.toggle('wide',!!wide);
  const row=$('#xR');row.innerHTML='';for(const b of buttons||[]){const el=document.createElement('button');el.className='btn'+(b.alt?' alt':'')+(b.sm?' sm':'');el.textContent=b.l;if(b.dis)el.disabled=true;el.onclick=b.f;row.appendChild(el)}
  setTimeout(()=>{const f=o.querySelector('button:not([disabled])');if(f)f.focus({preventScroll:true})},50)}
function bindX(sel,fn){for(const el of document.querySelectorAll('#xB '+sel))el.onclick=()=>fn(el.dataset.k,el)}

/* ---------- forge screen ---------- */
let forgeTab='up',wardCls=null,refundArm=false;
function showForge(tab){state='forge';if(tab)forgeTab=tab;forgeMigrate();if(!S.own)S.own={};wardCls=wardCls||selCls||'ranger';
  let h=`<div class="ctabs two"><button class="dbtn" data-k="up" aria-pressed="${forgeTab==='up'}">Upgrades</button><button class="dbtn" data-k="skin" aria-pressed="${forgeTab==='skin'}">Wardrobe</button></div>`;
  let sub=`You have <b class="emb">${S.embers}</b> Embers.`;
  if(forgeTab==='up'){sub+=` Every rank you buy raises the price of all upgrades by 8%.${diff==='nightmare'?' Forge upgrades count half on Nightmare.':''}`;
    h+=`<div class="flist">`;for(const k in FORGE){const F=FORGE[k],r=fr(k),mx=r>=F.max,c=mx?0:forgeCost(k);h+=`<div class="frow"><canvas data-ic="${k}" width="80" height="80"></canvas><div><b>${F.n}</b> <span class="lv">${r}/${F.max}</span><p>${F.d}</p></div><button class="btn sm" data-k="${k}" ${mx||S.embers<c?'disabled':''}>${mx?'Maxed':'Buy '+c}</button></div>`}h+='</div>';
    if(S.forgeSpent>0)h+=`<div class="row"><button class="btn sm alt" id="fRefund">${refundArm?'Click again to refund '+S.forgeSpent+' Embers':'Refund all ('+S.forgeSpent+')'}</button></div>`}
  else{sub+=' Skins you buy work on that hero in every mode except Daily.';
    h+=`<div class="ctabs four">`+Object.keys(CLASSES).map(c=>`<button class="dbtn" data-c="${c}" aria-pressed="${c===wardCls}">${CLASSES[c].n}</button>`).join('')+`</div><div class="flist">`;
    BUYSKINS.forEach((b,j)=>{const own=!!S.own[wardCls+':'+b.id],on=(S.skin[wardCls]||0)===j+4;h+=`<div class="frow"><canvas data-sk="${j}" width="80" height="80"></canvas><div><b>${b.n}</b><p>${own?(on?'Equipped.':'Owned.'):b.c+' Embers.'}</p></div><button class="btn sm" data-k="${b.id}" ${!own&&S.embers<b.c||on?'disabled':''}>${own?(on?'Equipped':'Equip'):'Buy '+b.c}</button></div>`});h+='</div>'}
  ovX('Forge',sub,h,[{l:'Back',alt:true,f:()=>{refundArm=false;toMenu()}}],true);
  for(const cv of document.querySelectorAll('#xB canvas[data-ic]')){const g=cv.getContext('2d');g.translate(40,40);drawIcon(g,FORGE[cv.dataset.ic].icon,28)}
  const drawSk=()=>{for(const cv of document.querySelectorAll('#xB canvas[data-sk]')){const g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,80,80);g.scale(1.7,1.7);drawHero(g,23.5,31,wardCls,{pal:BUYSKINS[+cv.dataset.sk].pal,t:performance.now()/1000})}};drawSk();
  if(forgeTab==='skin'&&BUYSKINS.length){clearInterval(showForge.iv);showForge.iv=setInterval(()=>{if(state!=='forge'||forgeTab!=='skin'){clearInterval(showForge.iv);return}drawSk()},80)}
  for(const el of document.querySelectorAll('#xB .ctabs button[data-k]'))el.onclick=()=>{refundArm=false;showForge(el.dataset.k)};
  for(const el of document.querySelectorAll('#xB .ctabs button[data-c]'))el.onclick=()=>{wardCls=el.dataset.c;showForge()};
  const rf=$('#fRefund');if(rf)rf.onclick=()=>{if(!refundArm){refundArm=true;showForge();return}refundArm=false;S.embers+=S.forgeSpent;S.forgeSpent=0;S.forge={};saveGame();sfx.pick();showForge()};
  if(forgeTab==='up')bindX('.flist button[data-k]',k=>{const F=FORGE[k],r=fr(k);if(r>=F.max)return;const c=forgeCost(k);if(S.embers<c)return;S.embers-=c;S.forgeSpent=(S.forgeSpent||0)+c;S.forge[k]=r+1;refundArm=false;saveGame();sfx.pick();showForge()});
  else bindX('.flist button[data-k]',id=>{const j=BUYSKINS.findIndex(b=>b.id===id),b=BUYSKINS[j],key=wardCls+':'+id;if(!S.own[key]){if(S.embers<b.c)return;S.embers-=b.c;S.own[key]=1;sfx.pick()}S.skin[wardCls]=j+4;saveGame();showForge()});
}
/* ---------- codex screen ---------- */
const EDESC={grunt:'Walks at you in crowds.',runner:'Fast and fragile.',brute:'Slow, heavy and hard to kill.',shield:'Blocks shots from the front with its shield.',splitter:'Splits into three when it dies.',mini:'Comes out of a splitter.',bomber:'Explodes when it dies or touches you.',shooter:'Stops and fires at you.',ghost:'Fades out, and shots pass through it while it does.',bat:'Hovers at the wall, then dives at where you stand.',charger:'Aims a red line at you, then runs along it.',mole:'Tunnels to you and bursts out of the floor.',stalker:'Comes up from behind you.',drone:'Flies across in a line and shoots down.',ogre:'Mini-boss. Charges, slams shockwaves and throws rocks.',witch:'Mini-boss. Teleports, curses the floor and summons ghosts.',golem:'Mini-boss. Armored until its core opens after a laser attack.',warden:'Dungeon boss. Locks the gates, then breaks loose and leaps at you.',colossus:'Forge boss. Its hands slam and sweep, then the skull bites.',hydra:'Ruins boss. Three heads, then a flooded floor that lights up.',lich:'Frozen Caves boss. Crystals shield him, then the lights go out.',carrier:'Sky boss. Turrets, pods, drones and a rotating laser.',slime:'Hops after you, splits into little slimes and leaves slowing puddles. In the last phase it lands on you.',knight:'Cuts blue lines across the floor, drops ice pillars and charges. In the last phase it spins out blades.',wyrm:'Burrows and pops up somewhere else, breathes fire in a sweep and bursts up under you in the last phase.'};
let codexTab='en';
function showCodex(tab){state='codex';codexTab=tab||codexTab;
  const tabs=[['en','Enemies'],['boss','Bosses'],['relic','Relics'],['fuse','Fusions'],['curse','Curses'],['ach','Feats']];
  let h='<div class="ctabs">'+tabs.map(([k,n])=>`<button class="dbtn" data-k="${k}" aria-pressed="${k===codexTab}">${n}</button>`).join('')+'</div><div class="cgrid">';
  let found=0,total=0;const tile=(ic,kind,name,desc,known)=>{total++;if(known)found++;return`<div class="ctile${known?'':' unk'}"><canvas data-${kind}="${ic}" width="88" height="88"></canvas><div><b>${known?name:'???'}</b><p>${desc}</p></div></div>`};
  if(codexTab==='en'){for(const k of['grunt','runner','brute','shield','splitter','mini','bomber','shooter','ghost','bat','charger','mole','stalker','drone','ogre','witch','golem']){const n=S.codex.en[k]||0;h+=tile(k,'en',ED[k].name||k[0].toUpperCase()+k.slice(1),n?`${EDESC[k]} Killed: ${n}.`:'Kill one to learn about it.',n>0)}}
  if(codexTab==='boss'){for(const k of RUSHB){const g=S.codex.boss[k];const per=Object.keys(DIFF).map(d=>S.grades[k+'_'+d]?DIFF[d].n+' '+S.grades[k+'_'+d]:'').filter(Boolean).join(', ');h+=tile(k,'en',ED[k].name,g?`${EDESC[k]} Best grades: ${per}.`:'Beat it to learn about it.',!!g)}}
  if(codexTab==='relic'){for(const k in RE){const u=unlocked('relic',k),kn=!!S.codex.relic[k];h+=tile(k,'ic',RE[k].n,kn?RE[k].d:u?'Not found yet.':'Locked. '+lockHint('relic:'+k),kn)}}
  if(codexTab==='fuse'){for(const k in FU){const F=FU[k],kn=!!S.codex.fuse[k];h+=tile(k,'ic',F.n,kn?`${SK[F.a].n} + ${SK[F.b].n}. ${F.d}`:'Fuse two skills to find it.',kn)}}
  if(codexTab==='curse'){for(const k in CU){const c=CU[k],u=unlocked('curse',k),kn=!!S.codex.curse[k];h+=tile(k,'ic',c.n,kn?`${c.up}. ${c.dn}.`:u?'Not taken yet.':'Locked. '+lockHint('curse:'+k),kn)}}
  if(codexTab==='ach'){for(const k in ACH){const A=ACH[k],kn=!!S.ach[k];h+=tile(kn?'crit':'glass','ic',A.n,A.d+(A.un?' Unlocks '+unlockName(A.un)+'.':''),kn).replace('???',A.n)}}
  h+='</div>';
  ovX('Codex',`Found ${found} of ${total}.`,h,[{l:'Back',alt:true,f:toMenu}],true);
  for(const cv of document.querySelectorAll('#xB canvas')){const g=cv.getContext('2d');if(cv.dataset.en==='carrier'){g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(44,70,34,7,0,0,TAU);g.fill();g.fillStyle='#5a6070';g.beginPath();g.roundRect(8,30,72,26,13);g.fill();g.fillStyle='#2a2e38';g.beginPath();g.arc(22,56,6,0,TAU);g.arc(66,56,6,0,TAU);g.fill();g.fillStyle='#ffd166';for(let i=0;i<5;i++){g.beginPath();g.arc(20+i*12,37,1.8,0,TAU);g.fill()}}else if(cv.dataset.en){const sp=SPR[cv.dataset.en];const s=BART[cv.dataset.en]?200:Math.min(84,sp.s*(ED[cv.dataset.en].r>40?.55:1));g.drawImage(sp.c,44-s/2,44-s/2,s,s)}else{g.translate(44,44);drawIcon(g,cv.dataset.ic,30)}}
  bindX('.ctabs button',k=>showCodex(k));
}
function lockHint(u){for(const k in ACH)if(ACH[k].un===u)return ACH[k].d;return''}
/* ---------- save code screen ---------- */
function showSave(){state='save';
  ovX('Save code','Progress lives in this browser, and some game sites do not keep it after you close the page. Copy the code to move it to another device, or paste a code here to load it. Loading replaces the progress on this device.',`<textarea id="scOut" readonly rows="4"></textarea><div class="row"><button class="btn sm" id="scCopy">Select code</button></div><textarea id="scIn" rows="3" placeholder="Paste a code that starts with VG3."></textarea><p class="muted" id="scMsg"></p>`,[{l:'Load code',f:()=>{const ok=loadCode($('#scIn').value);$('#scMsg').textContent=ok?'Loaded.':'That code did not work. Check that you copied all of it.';if(ok){$('#scOut').value=saveCode()}}},{l:'Back',alt:true,f:toMenu}],true);
  $('#scOut').value=saveCode();
  $('#scCopy').onclick=()=>{const t=$('#scOut');t.focus();t.select();$('#scMsg').textContent='Selected. Press Ctrl+C to copy it.'};
}

/* ---------- route map ---------- */
const STOPS={shop:{n:'Shop',d:'Spend gold before the stage.'},event:{n:'Event',d:'Something is waiting on the way.'},rest:{n:'Campfire',d:'Heal 40% before the stage.'},treasure:{n:'Treasure',d:'50 gold and a free skill.'}};
function openMap(){
  if(state!=='play')return;clearField();state='map';saveGame();
  const r=run.daily?rngOf(+run.daily.key.replace(/-/g,'')*10+stage):Math.random;
  let opts=stage>=5?['sky']:BIOME_ORDER.filter(k=>k!=='sky'&&!run.visited.includes(k));if(!opts.length)opts=['sky'];
  const sp=['shop','event','rest','treasure','shop','event'];
  run.route=opts.slice(0,3).map(k=>({b:k,stop:sp[Math.floor(r()*sp.length)],elite:stage<5&&r()<.35,boss:pickBoss(k)}));
  let h='<div class="mapc">';run.route.forEach((o,i)=>{const B=BIOMES[o.b];h+=`<button class="mcard" data-k="${i}"><span class="sw" style="background:linear-gradient(135deg,${B.floor[0]},${B.floor[2]} 60%,${B.ledge})"></span><b>${B.n}</b><p>${B.d}</p><p class="stop">${STOPS[o.stop].n}: ${STOPS[o.stop].d}</p>${o.elite?'<p class="elite">Elite: more champions, extra relic after the boss.</p>':''}<p class="muted">Boss: ${ED[o.boss].name}</p></button>`});h+='</div>';
  ovX(`Stage ${stage}`,stage>=5?'The last stage. The Sky Fortress is waiting.':'Pick where to go next.',h,[],true);
  bindX('.mcard',k=>chooseRoute(+k));
}
function chooseRoute(i){const o=run.route[i];run.visited.push(o.b);run.elite=o.elite;run.nextBoss=o.boss;setBiome(o.b);
  if(o.stop==='shop')openShop(beginStage);
  else if(o.stop==='event')openEvent(beginStage);
  else if(o.stop==='rest'){heal(P.maxHp*.4);toast('Campfire<small>You rest and heal 40%.</small>');beginStage()}
  else{P.gold+=50;pendingLv++;resumeFn=beginStage;toast('Treasure<small>50 gold and a free skill.</small>');openLevel()}
}
/* ---------- shop ---------- */
let shopBought={};
function price(b){return Math.round(b*(1+.2*(stage-1))*(P.re.has('ring')?.7:1)*(dm('rich')?1.5:1))}
const SHOP=[
  {k:'heal',n:'Bandages',d:'Heal 35% HP.',c:15,ic:'heart',f(){heal(P.maxHp*.35)}},
  {k:'maxhp',n:'Hearty meal',d:'+15 max HP.',c:25,ic:'vital',f(){G.maxHp+=15;recalc()}},
  {k:'reroll',n:'Loaded dice',d:'+2 rerolls.',c:14,ic:'crit',f(){P.rerolls+=2}},
  {k:'skill',n:'Training',d:'Pick a skill.',c:35,ic:'power',f(next){pendingLv++;resumeFn=()=>openShop(next,true);openLevel();return true}},
  {k:'relic',n:'Relic',d:'Pick one of three relics.',c:75,ic:'chest',f(next){pendingRelic=true;resumeFn=()=>openShop(next,true);afterPick();return true}},
  {k:'cleanse',n:'Cleansing',d:'Remove your newest curse.',c:45,ic:'glass',cond:()=>P.cu.size>0,f(){const a=[...P.cu];P.cu.delete(a[a.length-1]);recalc()}},
];
let shopMid=false;
function merchant(){shopMid=true;openShop(()=>{shopMid=false;hideOv();state='play';P.iframe=Math.max(P.iframe,1);last=performance.now()})}
function openShop(next,keep){
  if(!keep)shopBought={};if(!shopMid)clearField();state='shop';
  let h='<div class="flist">';for(const it of SHOP){if(it.cond&&!it.cond())continue;const c=price(it.c),b=shopBought[it.k];h+=`<div class="frow"><canvas data-ic="${it.ic}" width="80" height="80"></canvas><div><b>${it.n}</b><p>${it.d}</p></div><button class="btn sm" data-k="${it.k}" ${b||P.gold<c?'disabled':''}>${b?'Bought':c+' gold'}</button></div>`}h+='</div>';
  ovX(shopMid?'Wandering merchant':'Shop',`You have <b class="gld">${P.gold}</b> gold. One of each per visit.`,h,[{l:'Leave',alt:true,f:()=>next()}],true);
  for(const cv of document.querySelectorAll('#xB canvas[data-ic]')){const g=cv.getContext('2d');g.translate(40,40);drawIcon(g,cv.dataset.ic,28)}
  bindX('button[data-k]',k=>{const it=SHOP.find(s=>s.k===k),c=price(it.c);if(P.gold<c||shopBought[k])return;P.gold-=c;shopBought[k]=1;sfx.pick();if(!it.f(next))openShop(next,true)});
}
/* ---------- events ---------- */
const EVT=[
  {id:'altar',t:'Blood altar',x:'A stone altar sits in the middle of the room with a relic on top. The carving on it says it takes blood.',o:[{l:'Take the relic (-20 max HP)',f(){G.maxHp-=20;recalc();return giveRelic()}},{l:'Leave it',f:()=>'You leave the altar alone.'}]},
  {id:'cart',t:'Tipped cart',x:'A merchant\'s cart has tipped over and his coins are all over the floor. He is stuck under the wheel.',o:[{l:'Lift the cart off him',f(){P.rerolls+=2;P.gold+=20;return'He thanks you and pays you 20 gold. +2 rerolls.'}},{l:'Grab the coins',f(){P.gold+=70;if(unlocked('curse','hunted')&&!P.cu.has('hunted')){P.cu.add('hunted');S.codex.curse.hunted=1;recalc();return'You take 70 gold. His shouting follows you. You gain Hunted.'}G.enemyHp*=1.1;return'You take 70 gold. Enemies get 10% more HP for the run.'}}]},
  {id:'chest',t:'Chained chest',x:'A chest is chained shut and humming. Something inside wants out.',o:[{l:'Break it open',f(){const a=giveRelic();const cs=Object.keys(CU).filter(c=>!P.cu.has(c)&&unlocked('curse',c));if(cs.length){const c=pick(cs);P.cu.add(c);S.codex.curse[c]=1;recalc();return a+` It also leaves you with ${CU[c].n}.`}return a}},{l:'Leave it',f:()=>'The humming fades behind you.'}]},
  {id:'fountain',t:'Fountain',x:'A fountain of clear water. A sign on it says one drink each.',o:[{l:'Drink',f(){heal(P.maxHp*.5);return'You heal 50%.'}},{l:'Throw in 20 gold',need:20,f(){P.gold-=20;P.rerolls+=3;return'The water glows. +3 rerolls.'}}]},
  {id:'prisoner',t:'Prisoner',x:'An adventurer is chained to the wall. The lock is rusted shut and the chain is hot to touch.',o:[{l:'Break the chain (-25% HP)',f(){P.hp=Math.max(1,P.hp-P.maxHp*.25);pendingLv++;return'You burn your hands on the chain. He teaches you a skill before he runs.'}},{l:'Leave him',f:()=>'You leave him there.'}]},
  {id:'imp',t:'Gambling imp',x:'An imp sits on a pile of coins and offers you a bet. Double or nothing.',o:[{l:'Bet 30 gold',need:30,f(){P.gold-=30;if(Math.random()<.5){P.gold+=60;return'You win. The imp pays you 60 gold.'}return'You lose. The imp laughs and keeps your 30 gold.'}},{l:'Walk away',f:()=>'The imp calls you a coward.'}]},
  {id:'anvil',t:'Empty forge',x:'An empty forge with the fire still going. Your weapon fits the anvil.',o:[{l:'Hammer it',f(){G.dmgMul*=1.2;G.rateMul*=.92;recalc();return'+20% damage and 8% slower attacks.'}},{l:'Leave it',f:()=>'You leave the fire burning.'}]},
  {id:'ogre',t:'Sleeping ogre',x:'An ogre is asleep on a pile of gold.',o:[{l:'Take the gold',f(){P.gold+=60;G.enemyHp*=1.15;return'You take 60 gold. Enemies get 15% more HP for the run.'}},{l:'Let him sleep',f:()=>'You tiptoe past.'}]},
  {id:'embers',t:'Ember bowl',x:'A quiet shrine with a bowl of glowing embers.',o:[{l:'Take the embers',f(){S.embers+=10;saveGame();return'+10 Embers for the Forge.'}},{l:'Leave them',f:()=>'The embers keep glowing.'}]},
];
function openEvent(next){
  clearField();state='event';run.seenEv=run.seenEv||[];const pool=EVT.filter(e=>!run.seenEv.includes(e.id));const ev=pick(pool.length?pool:EVT);run.seenEv.push(ev.id);
  ovX(ev.t,'',`<p class="evx">${ev.x}</p>`,ev.o.map(o=>({l:o.l,dis:o.need&&P.gold<o.need,alt:false,f:()=>{const res=o.f();saveGame();ovX(ev.t,'',`<p class="evx">${res}</p>`,[{l:'Continue',f:()=>{if(pendingLv>0){resumeFn=next;openLevel()}else next()}}])}})),false);
}
/* ---------- victory ---------- */
function openWin(){musSting('win');
  if(state!=='play')return;clearField();state='win';run.won=true;ach('win');if(diff!=='story'&&run.mode!=='daily')ach('w'+P.cls+'3');const r=endRun();emitRun('run-complete','won');
  const m=Math.floor(runT/60),s=Math.floor(runT%60);
  ovX('Run complete',`You beat all five bosses on ${D.n}.`,`<dl class="kv"><dt>Score</dt><dd class="hi">${fmt(score)}</dd><dt>Grades</dt><dd>${run.grades.join(' ')}</dd><dt>Embers</dt><dd>+${r.e}</dd><dt>Time</dt><dd>${m}:${String(s).padStart(2,'0')}</dd></dl>`,[{l:'Keep going',f:()=>{run.mode='endless';const i=(BIOME_ORDER.indexOf(BIOME)+1)%5;run.loop++;setBiome(BIOME_ORDER[i]);beginStage()}},{l:'Main menu',alt:true,f:toMenu}]);
}

/* ================= gamepad ================= */
const pad={ax:0,ay:0,prev:[],navT:0,on:false};
function pollPad(dt){
  const gps=navigator.getGamepads?navigator.getGamepads():[];let gp=null;for(const g of gps)if(g&&g.connected){gp=g;break}
  if(!gp){pad.ax=pad.ay=0;return}
  if(!pad.on){pad.on=true;toast('Gamepad connected<small>Stick to move, A to dash, X or B for your skill, Start to pause.</small>')}
  const b=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed),edge=i=>b(i)&&!pad.prev[i];
  const dz=v=>Math.abs(v)>.2?v:0;pad.ax=clamp(dz(gp.axes[0]||0)+(b(15)?1:0)-(b(14)?1:0),-1,1);pad.ay=clamp(dz(gp.axes[1]||0)+(b(13)?1:0)-(b(12)?1:0),-1,1);
  if(state==='play'){if(edge(0)||edge(5)||edge(7))dash();if(edge(1)||edge(2)||edge(3)||edge(4)||edge(6))useSkill();if(edge(9))pause()}
  else{pad.navT-=dt;const m=Math.abs(pad.ay)>Math.abs(pad.ax)?pad.ay:pad.ax;if(Math.abs(m)>.5&&pad.navT<=0){navFocus(m>0?1:-1);pad.navT=.22}else if(Math.abs(m)<.3)pad.navT=0;
    if(edge(0)&&document.activeElement&&document.activeElement.tagName==='BUTTON')document.activeElement.click();
    if((edge(1)||edge(9))&&state==='paused')resume()}
  for(let i=0;i<gp.buttons.length;i++)pad.prev[i]=b(i);
}

/* ================= host integration (run results) ================= */
const GAME_ID='volley-gauntlet',GAME_VER='3.0.0';
let lastResult=null;const resultListeners=[];
function runPayload(type,reason){if(!run.id)run.id=Math.random().toString(36).slice(2,10)+Date.now().toString(36);return{source:GAME_ID,version:GAME_VER,type,reason:reason||null,runId:run.id,mode:run.mode,daily:run.daily?{date:run.daily.key,mods:run.daily.mods.slice()}:null,hero:P.cls,weapon:P.C.wn||BASEWN[P.cls],difficulty:diff,score:Math.floor(score),stage,kills,level:P.level,timeSec:Math.round(runT),bosses:run.bosses,miniBosses:run.minis,grades:run.grades.slice(),won:!!run.won,scoreMult:+P.scoreM.toFixed(3),breakdown:Object.fromEntries(Object.entries(run.parts||{}).map(([k,v])=>[k,Math.round(v)])),endedAt:new Date().toISOString()}}
async function emitRun(type,reason){
  if(!run||!P)return;const p=runPayload(type,reason);
  try{if(window.crypto&&crypto.subtle){const h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(p)));p.checksum=[...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('')}}catch(e){}
  if(type!=='run-start')lastResult=p;
  try{window.dispatchEvent(new CustomEvent('volley-gauntlet',{detail:p}))}catch(e){}
  for(const f of resultListeners){try{f(p)}catch(e){}}
}
window.VolleyGauntlet=Object.freeze({version:GAME_VER,lastResult:()=>lastResult,onResult:f=>{if(typeof f==='function')resultListeners.push(f)}});
