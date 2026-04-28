'use strict';
// ── Audio (Web Audio API procedural) ─────────────────────────────────
let AC = null;
let muteAll = false;
function getAC() {
  if (!AC) { try { AC = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){} }
  return AC;
}

// ── Background Music ──────────────────────────────────────────────────
const BGM = (() => {
  let ac, mg, playing=false, nxt=0, barIdx=0;
  const BPM=118, b=60/BPM;

  function note(f, t, dur, v, type='sine', det=0){
    if(!playing||!ac||muteAll) return;
    const o=ac.createOscillator(), g=ac.createGain();
    o.type=type; o.frequency.value=f; o.detune.value=det;
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(v, t+Math.min(0.022,dur*0.12));
    g.gain.exponentialRampToValueAtTime(0.001, t+dur);
    o.connect(g); g.connect(mg); o.start(t); o.stop(t+dur+0.05);
  }

  // 4-bar chord loop: Am → F → C → G
  const PROG=[
    {bass:55,    pad:[110,  130.8, 164.8]},
    {bass:87.3,  pad:[87.3, 110,   130.8]},
    {bass:130.8, pad:[130.8,164.8, 196  ]},
    {bass:98,    pad:[98,   123.5, 164.8]},
  ];
  // A minor pentatonic arpeggio: A3 C4 D4 E4 G4
  const ARP=[
    [0,   220,  b*0.38, 0.055],
    [0.5, 261.6,b*0.38, 0.044],
    [1,   293.7,b*0.38, 0.055],
    [1.5, 329.6,b*0.38, 0.044],
    [2,   392,  b*0.32, 0.060],
    [2.5, 329.6,b*0.38, 0.044],
    [3,   261.6,b*0.48, 0.055],
    [3.5, 220,  b*0.38, 0.038],
  ];

  function schedBar(t, bi){
    const p=PROG[bi%4];
    p.pad.forEach(f=>{
      note(f, t, b*3.92, 0.025, 'sine');
      note(f, t, b*3.92, 0.011, 'sawtooth', 7);
    });
    note(p.bass,   t,     b*0.60, 0.11, 'triangle');
    note(p.bass,   t+b*2, b*0.50, 0.08, 'triangle');
    note(p.bass/2, t,     b*0.28, 0.04, 'sine');
    ARP.forEach(([beat,f,dur,v])=> note(f, t+beat*b, dur, v));
    if(bi%2===0) note(880,    t+b*1.5, b*0.18, 0.013);
    if(bi%4===1) note(1108.7, t+b*3.0, b*0.13, 0.010);
    if(bi%4===3) note(660,    t+b*0.5, b*0.15, 0.012);
  }

  function tick(){
    if(!playing) return;
    const now=ac.currentTime;
    while(nxt < now+0.55){ schedBar(nxt, barIdx++); nxt+=b*4; }
    setTimeout(tick, 220);
  }

  return {
    start(){
      ac=getAC(); if(!ac||playing) return;
      mg=ac.createGain(); mg.gain.value=0.38; mg.connect(ac.destination);
      playing=true; nxt=ac.currentTime+0.08; barIdx=0; tick();
    },
    stop(){
      if(!playing) return; playing=false;
      if(mg){ const n=ac.currentTime; mg.gain.setValueAtTime(mg.gain.value,n); mg.gain.exponentialRampToValueAtTime(0.001,n+1.5); }
    },
    get isPlaying(){ return playing; },
  };
})();

function toggleMute(){
  muteAll=!muteAll;
  if(muteAll) BGM.stop(); else BGM.start();
}
function muteBtnBounds(){
  return {x:LW-52, y:4, w:46, h:42};
}
function drawMuteBtn(){
  const {x,y,w,h}=muteBtnBounds();
  roundRect(X,x,y,w,h,8);
  X.fillStyle=muteAll?'rgba(80,20,20,0.85)':'rgba(10,30,60,0.85)'; X.fill();
  X.strokeStyle=muteAll?'#f44':'#4af'; X.lineWidth=1; X.stroke();
  X.fillStyle=muteAll?'#f88':'#8cf'; X.font='bold 11px monospace'; X.textAlign='center';
  X.fillText(muteAll?'MUTE':'SOUND', x+w/2, y+h/2-3);
  X.fillStyle=muteAll?'#a44':'#46a'; X.font='9px monospace';
  X.fillText(muteAll?'OFF':'ON', x+w/2, y+h/2+9);
}
function speedBtnBounds(){
  return {x:LW-104, y:4, w:46, h:42};
}
function drawSpeedBtn(){
  if(!G) return;
  const {x,y,w,h}=speedBtnBounds();
  roundRect(X,x,y,w,h,8);
  const fast = G.speed > 1;
  X.fillStyle=fast?'rgba(20,80,40,0.85)':'rgba(10,30,60,0.85)'; X.fill();
  X.strokeStyle=fast?'#4f4':'#4af'; X.lineWidth=1; X.stroke();
  X.fillStyle=fast?'#8f8':'#8cf'; X.font='bold 11px monospace'; X.textAlign='center';
  X.fillText('SPEED', x+w/2, y+h/2-3);
  X.fillStyle=fast?'#4a4':'#46a'; X.font='9px monospace';
  X.fillText(G.speed+'X', x+w/2, y+h/2+9);
}

// ── SFX ───────────────────────────────────────────────────────────────
function playTone(freq, dur, vol=0.18, type='square', detune=0) {
  if(muteAll) return;
  const a = getAC(); if(!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type=type; o.frequency.value=freq; o.detune.value=detune;
  g.gain.setValueAtTime(vol, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime+dur);
  o.connect(g); g.connect(a.destination);
  o.start(); o.stop(a.currentTime+dur);
}
function playNoise(dur, vol=0.1, filterFreq=2000) {
  if(muteAll) return;
  const a = getAC(); if(!a) return;
  const buf = a.createBuffer(1, a.sampleRate*dur, a.sampleRate);
  const d = buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
  const src = a.createBufferSource();
  const flt = a.createBiquadFilter(); flt.frequency.value=filterFreq;
  const g = a.createGain();
  g.gain.setValueAtTime(vol, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime+dur);
  src.buffer=buf; src.connect(flt); flt.connect(g); g.connect(a.destination);
  src.start();
}
const SFX = {
  gunFire:    () => { playNoise(0.06,0.12,3000); playTone(180,0.05,0.08,'sawtooth'); },
  flameFire:  () => { playNoise(0.3,0.06,800); playTone(80,0.25,0.05,'sawtooth'); },
  bombFire:   () => { playTone(60,0.4,0.2,'sine'); playNoise(0.35,0.18,400); playTone(120,0.2,0.1,'sine'); },
  freezeFire: () => { playTone(1200,0.3,0.08,'sine',1200); playTone(900,0.3,0.06,'sine'); },
  monsterDie: () => { playNoise(0.15,0.1,600); playTone(220,0.1,0.06,'sawtooth'); },
  lifeLost:   () => { playTone(220,0.3,0.2,'sine'); playTone(180,0.4,0.2,'sine'); },
  place:      () => { playTone(440,0.1,0.12,'sine'); playTone(660,0.1,0.1,'sine'); },
  waveStart:  () => { [440,554,660].forEach((f,i) => setTimeout(()=>playTone(f,0.2,0.12,'sine'),i*120)); },
  victory:    () => { [523,659,784,1047].forEach((f,i) => setTimeout(()=>playTone(f,0.4,0.15,'sine'),i*180)); },
  gameOver:   () => { [440,330,220,165].forEach((f,i) => setTimeout(()=>playTone(f,0.4,0.15,'sawtooth'),i*200)); },
};

// Resume AudioContext on first user interaction
['touchstart','click','keydown'].forEach(ev =>
  document.addEventListener(ev, ()=>{
    const a=getAC(); if(a&&a.state==='suspended') a.resume();
    if(!BGM.isPlaying) BGM.start();
  }, {passive:true})
);
