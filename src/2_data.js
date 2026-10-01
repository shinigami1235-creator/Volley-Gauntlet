
/* ---------------- skills, fusions, curses, relics ---------------- */
const SK={
  multi:{n:'Multishot',d:'+1 projectile in every attack.',max:99},
  side:{n:'Side shot',d:'Two more shots fly out at an angle and bounce off the walls.',max:4},
  back:{n:'Back shot',d:'One more shot fires straight behind you at anything coming up from below.',max:3},
  pierce:{n:'Pierce',d:'Shots pass through one more enemy.',max:5},
  ric:{n:'Ricochet',d:'Shots jump to the nearest enemy after a hit.',max:4},
  rate:{n:'Quick hands',d:'Attack 18% faster.',max:99},
  dmg:{n:'Sharp edge',d:'+25% damage.',max:99},
  crit:{n:'Crit',d:'+10% chance to hit for 2.5 times damage.',max:5},
  giant:{n:'Giant shots',d:'Bigger shots with 30% more damage.',max:3},
  homing:{n:'Homing',d:'Shots curve toward enemies.',max:3},
  fire:{n:'Fire',d:'Hits set enemies on fire for 3 seconds.',max:5},
  ice:{n:'Frost',d:'Hits slow enemies and sometimes freeze them solid.',max:5},
  volt:{n:'Chain lightning',d:'Hits can arc to nearby enemies. Each level adds a jump.',max:5},
  poison:{n:'Venom',d:'Hits stack poison that ticks for 4 seconds.',max:5},
  expl:{n:'Blast',d:'Shots explode where they hit.',max:5},
  orbit:{n:'Blade ring',d:'+1 blade circling you. Blades knock enemies back and cut red shots out of the air.',max:6},
  wisp:{n:'Wisp',d:'A wisp flies next to you and shoots homing bolts.',max:3},
  thunder:{n:'Thunder',d:'Lightning strikes a random enemy every few seconds.',max:5},
  vital:{n:'Vitality',d:'+20 max HP and heal 25%.',max:5},
  armor:{n:'Tough skin',d:'Take 10% less damage.',max:3},
  regen:{n:'Regen',d:'Heal 1 HP every 3 seconds. It pauses for 2 seconds after you get hit.',max:3},
  swift:{n:'Light feet',d:'Move 10% faster and dash 15% more often.',max:3},
  power:{n:'Mastery',d:'Your class skill recharges 20% faster and hits harder.',max:4},
  wenh:{n:'Weapon upgrade',d:'Makes your weapon stronger.',max:3},
};
const FU={
  thermal:{n:'Thermal Shock',a:'fire',b:'ice',gives:{fire:3,ice:3},d:'Hits burn and chill. An enemy that is burning and chilled at once shatters for 3 times damage around it.'},
  plasma:{n:'Plasma Lance',a:'fire',b:'volt',gives:{fire:3,volt:2},d:'Every third attack adds a lance that pierces everything and sets it on fire.'},
  crystal:{n:'Storm Crystal',a:'ice',b:'volt',gives:{ice:3,volt:3},d:'Chilled enemies always arc lightning to 4 more when hit, and freezing happens twice as often.'},
  plague:{n:'Plague',a:'poison',b:'fire',gives:{poison:4,fire:2},d:'Poison ticks twice as hard and a poisoned enemy leaves a toxic cloud when it dies.'},
  cluster:{n:'Cluster Bombs',a:'expl',b:'ric',gives:{expl:3,ric:2},d:'Every explosion throws out 3 bomblets that explode again.'},
  nova:{n:'Nova',a:'multi',b:'side',gives:{multi:2,side:2},d:'Every 1.8 seconds a ring of 16 shots fires out around you.'},
  halo:{n:'Storm Halo',a:'orbit',b:'thunder',gives:{orbit:3,thunder:2},d:'Your blades zap the nearest enemy every half second.'},
  exec:{n:'Executioner',a:'crit',b:'dmg',gives:{crit:3,dmg:2},d:'Crits kill any enemy under 35% HP outright, bosses excepted.'},
  ballista:{n:'Ballista',a:'pierce',b:'giant',gives:{pierce:3,giant:2},d:'Every fourth attack adds a huge bolt that pierces everything and shoves enemies back.'},
  swarm:{n:'Wisp Swarm',a:'homing',b:'wisp',gives:{homing:2,wisp:3},d:'Three wisps whose bolts home in hard and pierce 2 enemies.'},
};
const CU={
  glass:{s1:'+70% damage',s2:'-35% max HP',n:'Glass Cannon',up:'+70% damage',dn:'Max HP -35%'},
  overdraw:{s1:'+100% damage',s2:'-35% attack speed',n:'Overdraw',up:'+100% damage',dn:'Attack 35% slower'},
  frenzy:{s1:'+60% attack speed',s2:'+20% enemy speed',n:'Frenzy',up:'+60% attack speed',dn:'Enemies move 20% faster'},
  heavy:{s1:'+4 projectiles',s2:'-25% move speed',n:'Heavy Load',up:'+4 projectiles',dn:'Move 25% slower and dash cooldown +50%'},
  greed:{s1:'4 cards, +50% XP',s2:'+30% enemy HP',n:'Greed',up:'Level-ups show 4 cards and gems give 50% more XP',dn:'Enemies +30% HP'},
  blood:{s1:'+3 projectiles',s2:'-2 HP per second',n:'Blood Pact',up:'+3 projectiles',dn:'Lose 2 HP per second. Each kill heals 1 HP'},
  berserk:{s1:'Low HP, more damage',s2:'Healing halved',n:'Berserk Blood',up:'Up to +100% damage as your HP drops',dn:'Healing is halved'},
  hunted:{s1:'x2 score',s2:'x2 champions',n:'Hunted',up:'Score x2',dn:'Champions show up twice as often'},
};
const RE={
  phoenix:{n:'Phoenix Feather',d:'Come back once with half your HP.'},
  hourglass:{n:'Hourglass',d:'Dashing slows time for a second.'},
  thorn:{n:'Thorn Mail',d:'Enemies that touch you take 4 times your damage.'},
  echo:{n:'Echo Quiver',d:'Every fourth attack fires twice.'},
  fang:{n:'Vampire Fang',d:'Every 6 kills heal 1 HP.'},
  boots:{n:'Storm Boots',d:'Dashing releases lightning around you.'},
  crown:{n:'Cursed Crown',d:'+40% damage and +50% score. Champions twice as common.'},
  iron:{n:'Iron Heart',d:'+50 max HP. Move 10% slower.'},
  clover:{n:'Lucky Clover',d:'+3 rerolls. Pickups drop 50% more often.'},
  mark:{n:"Hunter's Mark",d:'Bosses, mini-bosses and champions take 30% more damage.'},
  charm:{n:'Pink Charm',d:'Parries heal 6 more HP and fully recharge your dash.'},
  purse:{n:'Golden Purse',d:'Enemies drop 50% more gold.'},
  ring:{n:"Haggler's Ring",d:'Shops are 30% cheaper.'},
  quiver:{n:'Spare Quiver',d:'+1 projectile.'},
  whet:{n:'Whetstone',d:'+15% damage. Crits deal 3 times damage instead of 2.5.'},
  feather:{n:'Swift Feather',d:'Dash recharges 35% faster.'},
  spring:{n:'Spring Water',d:'Heal 1 HP every 2.5 seconds. It pauses for 2 seconds after you get hit.'},
  mirror:{n:'Mirror Shield',d:'Every 12 seconds you get a shield that blocks shots for 1.5 seconds.'},
  keg:{n:'Powder Keg',d:'Enemies you kill have a 1 in 5 chance to explode.'},
  frost:{n:'Frost Heart',d:'Enemies close to you move at half speed.'},
  lens:{n:'Eagle Lens',d:'+12% crit chance.'},
  drum:{n:'War Drum',d:'After a dash you attack 50% faster for 2.5 seconds.'},
  tooth:{n:'Gold Tooth',d:'Every 12 gold you pick up heals 3 HP.'},
  plug:{n:'Spark Plug',d:'Your class skill recharges 30% faster.'},
  magnet:{n:'Magnet Stone',d:'Gems and gold fly to you from twice as far.'},
};
const ELEMN={fire:'Fire',ice:'Frost',volt:'Lightning',poison:'Venom'};
const ELEMCOL={fire:'#ff8a3d',ice:'#6fe0ff',volt:'#c3a8ff',poison:'#a6e85f'};
const PICKS=['heart','shield','rapid','magnet','freeze','nuke'];
const PICKNAME={heart:'Heal',shield:'Shield',rapid:'Rapid attack',magnet:'Magnet',freeze:'Freeze',nuke:'Blast',chest:'Relic'};
const PICKCOL={heart:'#ff4d6d',shield:'#5fb8ff',rapid:'#ffd166',magnet:'#ff7a9a',freeze:'#8fe3ff',nuke:'#ff7a3d',chest:'#ffd166'};

/* ---------------- gate effects ---------------- */
function projWord(n){if(P.C&&P.C.pw)return n===1?P.C.pw[0]:P.C.pw[1];const w=CLASSES[P.cls].w;return n===1?{arrow:'arrow',orb:'orb',bullet:'barrel',axe:'axe'}[w]:{arrow:'arrows',orb:'orbs',bullet:'barrels',axe:'axes'}[w]}
function effInfo(e){
  const v=e.v,sg=v>0?'+':'';
  switch(e.t){
    case'proj':return{big:sg+v,sub:projWord(),good:v>0};
    case'projx':return{big:v>=1?'x'+v:'÷'+Math.round(1/v),sub:projWord(),good:v>=1};
    case'dmg':return{big:sg+v+'%',sub:'damage',good:v>0};
    case'rate':return{big:sg+v+'%',sub:'attack speed',good:v>0};
    case'pierce':return{big:'+'+v,sub:'pierce',good:true};
    case'elem':return{big:ELEMN[v],sub:'shots',good:true};
    case'heal':return{big:sg+v+'%',sub:'HP',good:v>0};
    case'maxhp':return{big:sg+v,sub:'max HP',good:v>0};
    case'ehp':return{big:sg+v+'%',sub:'enemy HP',good:v<0};
    case'espd':return{big:sg+v+'%',sub:'enemy speed',good:v<0};
    case'score':return{big:'x'+v,sub:'score',good:true};
    case'crit':return{big:'+'+v+'%',sub:'crit',good:true};
    case'dash':return{big:sg+v+'%',sub:'dash cooldown',good:v<0};
    case'curse':return{big:CU[v].n,sub:'curse: '+CU[v].up.toLowerCase(),good:true,curse:true};
  }
}

/* ---------------- difficulty ---------------- */
const DIFF={
  story:{n:'Story',d:'For kids and first runs. Slow shots, long warnings, soft hits. Bosses have 2 phases.',dmg:.4,bspd:.7,tele:1.5,ehp:.7,espd:.8,dens:.75,pHp:1.5,heal:1.3,champ:.3,phases:2,pow:.35,iframe:1.3,set:.6,sc:.5,bcd:1.4,pinkX:0,extra:false},
  normal:{n:'Normal',d:'The main game. Bosses have 3 phases.',dmg:1.5,bspd:1.05,tele:.95,ehp:1.25,espd:1.08,dens:1.2,pHp:1,heal:1,champ:1,phases:3,pow:.45,iframe:1,set:1,sc:1,bcd:1,pinkX:0,extra:false},
  hard:{n:'Hard',d:'Faster shots, shorter warnings and more set pieces. Bosses attack more often.',dmg:2.2,bspd:1.25,tele:.78,ehp:1.6,espd:1.2,dens:1.5,pHp:1,heal:.8,champ:1.8,phases:3,pow:.55,iframe:.85,set:1.5,sc:1.6,bcd:.8,pinkX:.06,extra:false},
  nightmare:{n:'Nightmare',d:'Every hit hurts, warnings are short and healing is halved. Bosses get extra attacks. More shots can be parried, and parries heal in full.',dmg:2.9,bspd:1.4,tele:.6,ehp:1.8,espd:1.3,dens:1.4,pHp:.8,heal:.5,champ:2.5,phases:3,pow:.65,iframe:.7,set:2,sc:2.5,bcd:.66,pinkX:.16,extra:true},
};
