
/* ================= weapon evolutions ================= */
// A weapon evolves when its weapon upgrade is maxed and you hold the matching relic.
// The evolution then shows up as a gold card at the next level-up. Each relic matches one weapon.
const EVO={
  bow:{re:'quiver',n:'Thousand Arrows',d:'The arrow cap triples, and every third attack also fires a ring of arrows around you.'},
  crossbow:{re:'whet',n:'Siege Bolt',d:'Bolts pierce everything and blast on every hit.'},
  seeker:{re:'lens',n:'Hawkeye',d:'Arrows home in hard, and crits on enemies under half HP deal double.'},
  sky:{re:'mark',n:'Meteor Shower',d:'Falling arrows explode where they hit.'},
  orb:{re:'keg',n:'Singularity',d:'Orbs pull nearby enemies in, then blast a second time.'},
  storm:{re:'boots',n:'Tempest',d:'+4 arcs, and each hit can call down a lightning strike.'},
  frost:{re:'frost',n:'Absolute Zero',d:'Shards freeze more often, and hitting a frozen enemy shatters it in a blast.'},
  meteor:{re:'phoenix',n:'Sunfall',d:'Each meteor bursts into three smaller meteors.'},
  rifle:{re:'drum',n:'Gatling Rifle',d:'Fire 40% faster, and bullets pierce 2 more enemies.'},
  shotgun:{re:'iron',n:"Dragon's Breath",d:'+4 pellets that fly 60% farther and set enemies on fire.'},
  minigun:{re:'feather',n:'Bullet Storm',d:'No spray while you move, and fire 25% faster.'},
  rocket:{re:'crown',n:'Doomsday Battery',d:'Every rocket splits into 3 homing mini rockets when it hits.'},
  axes:{re:'fang',n:'Blood Reapers',d:'Axes are 50% bigger, and every 10 axe hits heal 1 HP.'},
  spears:{re:'thorn',n:'Thornspear',d:'Spears pierce everything and shoot 2 thorns sideways from each enemy they pass through.'},
  chakram:{re:'echo',n:'Eternal Edge',d:'Chakrams bounce 8 more times and fly 30% faster.'},
  hammer:{re:'mirror',n:'Earthshaker',d:'Every slam sends out a shockwave that knocks enemies back and wipes out shots.'},
  bone:{re:'spring',n:'Bone Legion',d:'+6 skeletons, and each skeleton gets back up once.'},
  wolf:{re:'tooth',n:'Dire Pack',d:'Wolves bite 60% harder and make enemies bleed.'},
  golem:{re:'plug',n:'Titan Core',d:'Golems are bigger, and their slams are 50% wider and stun.'},
  lantern:{re:'magnet',n:'Soul Lantern',d:'Twice the spirits, and their bolts pierce 2 enemies.'},
};
function evoId(){return P.C.id||'bow'}
function evoOn(id){return!!P.evo&&evoId()===id}
function evoReady(){const E=EVO[evoId()];return!!E&&!P.evo&&(P.sk.wenh||0)>=SK.wenh.max&&P.re.has(E.re)}
function weapById(id){for(const c in WEAPS){const w=WEAPS[c].find(x=>x.id===id);if(w)return{c,w}}return null}
function evolve(){
  const id=evoId(),E=EVO[id];P.evo=true;if(S){S.codex.evo=S.codex.evo||{};S.codex.evo[id]=1}recalc();
  pop(E.n,P.x,P.y-70,'#ffd166',34,'evolution');flashA=.5;flashCol='255,209,102';ringFx(P.x,P.y,'255,209,102',140,.5,7);ringFx(P.x,P.y,'255,255,255',90,.35,4);spark(P.x,P.y,'#ffe9a8',40,380,.7,4);sfx.fuse();addShake(8);
  ach('evolve');
}
function evoHint(){const E=EVO[evoId()];if(!E||P.evo)return;const R=RE[E.re];
  toast(`${P.C.wn} maxed<small>${P.re.has(E.re)?'Your next level-up can evolve it.':unlocked('relic',E.re)?`Find the ${R.n} relic to evolve it.`:`It evolves with the ${R.n} relic, which is still locked.`}</small>`)}
// relic offers always include the matching relic once the weapon is maxed
function evoRelicPick(list){const E=EVO[evoId()];if(!E||P.evo||(P.sk.wenh||0)<SK.wenh.max||P.re.has(E.re)||!unlocked('relic',E.re))return list;if(list.some(o=>o.k===E.re))return list;list[0]={t:'relic',k:E.re};return list}
// Hammer evolution: a shockwave after each slam
function shockwave(x,y,rad){ringFx(x,y,'255,230,170',rad,.4,6);ringFx(x,y,'255,255,255',rad*.6,.25,3);
  forNear(x,y,rad+50,e=>{if(!pushable(e))return;const dx=e.x-x,dy=e.y-y;if(dx*dx+dy*dy<(rad+e.r)**2){knock(e,x,y,520);e.stunT=Math.max(e.stunT||0,.4)}});
  for(const b of ebul)if(!b.dead&&!b.skull&&(b.x-x)**2+(b.y-y)**2<rad*rad){b.dead=true;spark(b.x,b.y,'#ffe9a8',2,100,.2,2.5)}}
