'use strict';
// ── Wave helpers ──────────────────────────────────────────────────────
function waveCount(w){ return Math.min(8+w*3, 55); }
function spawnInterval(w){ return Math.max(0.22, 1.2-w*0.055); }
function monsterScale(w){ return (1+w*0.18) * Math.pow(1.06, Math.max(0,w-8)); }

// ── Progression system ────────────────────────────────────────────────
const UNLOCK_WAVE={flame:2,bomb:4,freeze:5,trigun:6};
const POPUP_INFO={
  1:{kind:'upgrade2', title:'Level 2 Upgrades',    desc:'Upgrade your Gun Tower to boost\ndamage output and range.'},
  2:{kind:'flame',    title:'Flame Tower',          desc:'Burns enemies over time with\nsearing fire damage.'},
  3:{kind:'upgrade3', title:'Level 3 — Max Power',  desc:'Unlock the full potential of\nevery tower on the field!'},
  4:{kind:'bomb',     title:'Bomb Tower',           desc:'Massive area explosions that\nwipe out enemy clusters.'},
  5:{kind:'freeze',   title:'Freeze Tower',         desc:'Locks enemies in ice, giving\nyour towers extra firing time.'},
  6:{kind:'trigun',   title:'Tri-Gun Tower',        desc:'Fires at three targets at once —\nthe ultimate defensive weapon.'},
  7:{kind:'goodluck', title:'',                     desc:''},
};
function getTowerLimit(w){ return 5+w*2; }
function getMaxUpgrade(w){ return w>=3?3:w>=1?2:1; }
function isUnlocked(kind,w){ const u=UNLOCK_WAVE[kind]; return u===undefined||w>=u; }
function placedCount(){ return Object.keys(G.towers).length; }

// ── High score ────────────────────────────────────────────────────────
function getTopScores(){
  try{
    const arr=JSON.parse(localStorage.getItem('td_scores')||'[]');
    if(!arr.length){
      const hs=parseInt(localStorage.getItem('td_highscore'))||0;
      if(hs>0) return [{score:hs,name:localStorage.getItem('td_highscore_name')||'Commander',wave:0}];
    }
    return arr;
  }catch(e){return[];}
}
function getHighScore(){ const s=getTopScores(); return s.length?s[0].score:0; }
function getHighScoreName(){ const s=getTopScores(); return s.length?s[0].name:'Commander'; }
function saveHighScore(score,name){
  const arr=getTopScores();
  arr.push({score,name:name||'Commander',wave:G?G.wave:0});
  arr.sort((a,b)=>b.score-a.score);
  arr.splice(10);
  localStorage.setItem('td_scores',JSON.stringify(arr));
}

// ── Game state ────────────────────────────────────────────────────────
let G = null;

function newGame(mapIdx){
  const map=MAPS[mapIdx];
  const pathSet=new Set(map.path.map(([c,r])=>r*COLS+c));
  particles.length = 0;
  bullets.length = 0;
  G={
    state:'prep',
    map: mapIdx,
    path: map.path,
    pathSet,
    towers:{},
    monsters:[],
    wave:0,
    lives:20,
    gold:80,
    score:0,
    selectedType:'gun',
    hoverCell:null,
    selectedTower:null,
    spawnTimer:0,
    spawnCount:0,
    stateTimer:0,
    waveCount:0,
    paused:false,
    speed:1,
    time:0,
    popupData:null,
  };
}

// ── Main game logic update ────────────────────────────────────────────
function updateGame(dt, now){
  if(!G||G.state==='splash'||G.state==='mapSelect'||G.state==='gameOver') return;
  if(G.paused) return;
  dt *= G.speed;
  G.time+=dt;

  for(const t of Object.values(G.towers))
    t.update(dt, G.monsters, now);

  const newBlobs=[];
  for(const m of G.monsters){
    m.advance(dt);
    if(m.reached){
      G.lives--; m.reached=false; m.dead=true; m._rewarded=true;
      SFX.lifeLost(); if(G.lives<=0){endGame();return;}
    }
    if(m.dead && !m._rewarded){
      m._rewarded=true;
      if(m.hp<=0){ G.gold+=m.reward; G.score+=m.reward*10; SFX.monsterDie(); }
      spawnParticles(m.x,m.y,8,{spd:50,life:0.5,r:4,color:m.baseColor,gravity:20}); }
    if(m.type==='blob'&&!m.split&&m.gen<2&&m.hp>0&&m.hp<=m.maxHp*0.5){
      m.split=true;
      newBlobs.push(createBlobChild(m),createBlobChild(m));
      spawnParticles(m.x,m.y,18,{spd:80,life:0.55,r:6,color:'#d080ff',gravity:20});
      spawnParticles(m.x,m.y,8,{spd:35,life:0.8,r:10,color:'#b050e0',gravity:8});
      SFX.blobSplit();
    }
  }
  G.monsters.push(...newBlobs);
  G.monsters=G.monsters.filter(m=>!m.dead||!m._rewarded);

  if(G.state==='wave'){
    G.stateTimer-=dt;
    if(G.spawnCount < G.waveCount){
      G.spawnTimer-=dt;
      if(G.spawnTimer<=0){
        G.monsters.push(new Monster(G.path, G.wave));
        G.spawnCount++;
        G.spawnTimer=spawnInterval(G.wave);
      }
    }
    if(G.spawnCount>=G.waveCount && G.monsters.length===0){
      G.wave++;
      G.state='prep';
      G.gold+=Math.min(60, 20+G.wave*3);
      G.score+=G.wave*50;
      const pi=POPUP_INFO[G.wave];
      if(pi) G.popupData={...pi, angle:0, slots:`+2 tower slots  (now ${getTowerLimit(G.wave)})`};
      if(!isUnlocked(G.selectedType, G.wave)) G.selectedType='gun';
      if(!G.popupData) startWave();
    }
  }

  if(G.popupData) G.popupData.angle+=dt*1.8;
  updateParticles(dt);
  updateBullets(dt);
}

function startWave(){
  if(G.state!=='prep') return;
  G.state='wave';
  G.waveCount=waveCount(G.wave);
  G.spawnCount=0;
  G.spawnTimer=0;
  SFX.waveStart();
}

function endGame(){
  G.state='gameOver';
  const prevBest=getHighScore();
  if(G.score>0){
    const name=prompt('Game over! Enter your name for the leaderboard:','Commander');
    saveHighScore(G.score,name||'Commander');
    G.isNewRecord=G.score>prevBest;
  } else {
    G.isNewRecord=false;
  }
  SFX.gameOver();
  BGM.stop();
}
