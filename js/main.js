'use strict';
// ── Canvas setup ──────────────────────────────────────────────────────
const C = document.getElementById('c');
const X = C.getContext('2d');

// ── Layout (recomputed on resize) ─────────────────────────────────────
let LW, LH, isPortrait=false;
let scale=1, offX=0, offY=0;
let CS, GX, GY, PX, PY, PW, PH;

function computeLayout(){
  isPortrait = window.innerHeight > window.innerWidth * 1.15;
  if(isPortrait){
    LW=480; LH=760; CS=44; GX=20; GY=52;
    PX=0; PY=GY+ROWS*CS+12;
    PW=LW; PH=LH-PY;
  } else {
    LW=960; LH=640; CS=64; GX=10; GY=56;
    PX=GX+COLS*CS+14; PY=52;
    PW=LW-PX-6; PH=LH-PY;
  }
}

function resize(){
  C.width=window.innerWidth;
  C.height=window.innerHeight;
  computeLayout();
  scale=Math.min(C.width/LW, C.height/LH);
  offX=(C.width-LW*scale)/2;
  offY=(C.height-LH*scale)/2;
}
window.addEventListener('resize', resize);
resize();

// ── App state & render loop ───────────────────────────────────────────
const appState={screen:'splash'};
let lastTime=0;
const FRAME_MS=1000/30;

function frame(ts){
  requestAnimationFrame(frame);
  if(ts-lastTime<FRAME_MS) return;
  const dt=Math.min((ts-lastTime)/1000, 0.05);
  lastTime=ts;
  const now=ts/1000;

  X.setTransform(1,0,0,1,0,0);
  X.clearRect(0,0,C.width,C.height);

  X.save();
  X.translate(offX,offY);
  X.scale(scale,scale);

  if(appState.screen==='splash'){
    drawSplash(now);
  } else if(appState.screen==='mapSelect'){
    drawMapSelect(now);
  } else {
    updateGame(dt,now);
    drawGame(now);
  }

  X.restore();
}

requestAnimationFrame(frame);
