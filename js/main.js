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
  updateZoomTransform();
}
window.addEventListener('resize', resize);

// ── Zoom / pan ────────────────────────────────────────────────────────
let zoomLevel=1.0, zoomPanX=0, zoomPanY=0;
const ZOOM_MIN=1.0, ZOOM_MAX=3.5;
let effectiveOffX=0, effectiveOffY=0, effectiveScale=1;

function updateZoomTransform(){
  effectiveScale=scale*zoomLevel;
  const csx=offX+LW*scale/2, csy=offY+LH*scale/2;
  effectiveOffX=csx-LW*effectiveScale/2+zoomPanX;
  effectiveOffY=csy-LH*effectiveScale/2+zoomPanY;
}

function clampPan(){
  // keep at least half the canvas visible in each direction
  const es=scale*zoomLevel;
  const mx=LW*es*0.5, my=LH*es*0.5;
  zoomPanX=Math.max(-mx,Math.min(mx,zoomPanX));
  zoomPanY=Math.max(-my,Math.min(my,zoomPanY));
}

function applyZoomAt(factor, clientX, clientY){
  updateZoomTransform();
  const lx=(clientX-effectiveOffX)/effectiveScale;
  const ly=(clientY-effectiveOffY)/effectiveScale;
  const newZ=Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,zoomLevel*factor));
  const newES=scale*newZ;
  const csx=offX+LW*scale/2, csy=offY+LH*scale/2;
  const baseOX=csx-LW*newES/2, baseOY=csy-LH*newES/2;
  zoomPanX=clientX-baseOX-lx*newES;
  zoomPanY=clientY-baseOY-ly*newES;
  zoomLevel=newZ;
  clampPan();
  updateZoomTransform();
  _gridSig=null; // invalidate tile cache
}

function resetZoom(){
  zoomLevel=1.0; zoomPanX=0; zoomPanY=0;
  updateZoomTransform();
  _gridSig=null;
}

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

  updateZoomTransform();
  X.save();
  X.translate(effectiveOffX,effectiveOffY);
  X.scale(effectiveScale,effectiveScale);

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

resize();
requestAnimationFrame(frame);
