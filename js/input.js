'use strict';
let mapSelectHover=-1;

function toLogical(clientX, clientY){
  return [(clientX-effectiveOffX)/effectiveScale, (clientY-effectiveOffY)/effectiveScale];
}

function panelClickLandscape(lx,ly){
  const btnY=LH-70, btnH=50;
  if(lx>=PX+8&&lx<=PX+PW-8&&ly>=btnY&&ly<=btnY+btnH){
    if(G.state==='prep') startWave();
    else if(G.state==='wave') G.paused=!G.paused;
    return true;
  }
  let ty=62+16;
  for(const kind of TORDER){
    if(lx>=PX+6&&lx<=PX+PW-6&&ly>=ty&&ly<=ty+56){
      if(isUnlocked(kind,G.wave)){ G.selectedType=kind; G.selectedTower=null; }
      return true;
    }
    ty+=60;
  }
  ty+=16;
  if(G.selectedTower){
    const t=G.towers[G.selectedTower];
    if(t){
      const upgCost=30*t.level;
      if(lx>=PX+8&&lx<=PX+PW-8&&ly>=ty&&ly<=ty+34){
        if(t.level<getMaxUpgrade(G.wave)&&G.gold>=upgCost){ G.gold-=upgCost; t.level++; SFX.place(); }
        return true;
      }
      if(lx>=PX+8&&lx<=PX+PW-8&&ly>=ty+44&&ly<=ty+72){
        const sellVal=Math.floor(TDEFS[t.kind].cost*t.level*0.6);
        G.gold+=sellVal; delete G.towers[G.selectedTower]; G.selectedTower=null;
        return true;
      }
    }
  }
  return false;
}

function panelClickPortrait(lx,ly){
  const px=8, pw=LW-16;
  const bw=Math.floor(pw/TORDER.length), bh=84, by=PY+6;
  for(let i=0;i<TORDER.length;i++){
    const bx=px+i*bw;
    if(lx>=bx+2&&lx<=bx+bw-2&&ly>=by&&ly<=by+bh){
      if(isUnlocked(TORDER[i],G.wave)){ G.selectedType=TORDER[i]; G.selectedTower=null; }
      return true;
    }
  }
  let y=by+bh+10;
  if(G.selectedTower){
    const t=G.towers[G.selectedTower];
    if(t){
      const hw=Math.floor(pw/2)-4;
      const upgCost=30*t.level;
      if(lx>=px&&lx<=px+hw&&ly>=y&&ly<=y+34){
        if(t.level<getMaxUpgrade(G.wave)&&G.gold>=upgCost){ G.gold-=upgCost; t.level++; SFX.place(); }
        return true;
      }
      if(lx>=px+hw+8&&lx<=px+hw+8+hw&&ly>=y&&ly<=y+34){
        const sellVal=Math.floor(TDEFS[t.kind].cost*t.level*0.6);
        G.gold+=sellVal; delete G.towers[G.selectedTower]; G.selectedTower=null; return true;
      }
      y+=52;
    }
  }
  const btnH=46, btnY=LH-btnH-6;
  if(lx>=px&&lx<=px+pw&&ly>=btnY&&ly<=btnY+btnH){
    if(G.state==='prep') startWave();
    else if(G.state==='wave') G.paused=!G.paused;
    return true;
  }
  return false;
}

function handleClick(lx,ly){
  const mb=muteBtnBounds();
  if(lx>=mb.x&&lx<=mb.x+mb.w&&ly>=mb.y&&ly<=mb.y+mb.h){ toggleMute(); return; }

  if(appState.screen==='game' && G){
    const sb=speedBtnBounds();
    if(lx>=sb.x&&lx<=sb.x+sb.w&&ly>=sb.y&&ly<=sb.y+sb.h){
      G.speed = G.speed === 1 ? 2 : G.speed === 2 ? 4 : G.speed === 4 ? 8 : 1; return;
    }
    const vb=viewBtnBounds();
    if(lx>=vb.x&&lx<=vb.x+vb.w&&ly>=vb.y&&ly<=vb.y+vb.h){
      flatView=!flatView; _gridSig=null; return;
    }
  }

  if(appState.screen==='splash'){
    const rb=resetBtnBounds();
    if(getTopScores().length>0&&lx>=rb.x&&lx<=rb.x+rb.w&&ly>=rb.y&&ly<=rb.y+rb.h){
      if(confirm('Reset all scores?')){
        localStorage.removeItem('td_scores');
        localStorage.removeItem('td_highscore');
        localStorage.removeItem('td_highscore_name');
        SFX.monsterDie();
      }
      return;
    }
    appState.screen='mapSelect'; if(!BGM.isPlaying) BGM.start(); return;
  }
  if(appState.screen==='mapSelect'){
    MAPS.forEach((_,i)=>{
      const bx=isPortrait?LW/2:LW/2+(i-1)*320;
      const by=isPortrait?130+i*230:220;
      const bw=isPortrait?420:280, bh=isPortrait?200:320;
      if(lx>=bx-bw/2&&lx<=bx+bw/2&&ly>=by&&ly<=by+bh){ newGame(i); appState.screen='game'; resetZoom(); }
    });
    return;
  }
  if(!G) return;
  if(G.state==='gameOver'){ appState.screen='splash'; G=null; BGM.start(); resetZoom(); return; }

  if(G.popupData){
    G.popupData=null;
    return;
  }

  if(isPortrait){ if(panelClickPortrait(lx,ly)) return; }
  else           { if(panelClickLandscape(lx,ly)) return; }

  if(lx>=GX&&lx<GX+COLS*CS&&ly>=GY&&ly<GY+ROWS*CS){
    const [gc,gr]=worldToGrid(lx,ly);
    const key=gr*COLS+gc;
    if(G.pathSet.has(key)) return;
    if(G.towers[key]){
      G.selectedTower=G.selectedTower===String(key)?null:String(key); return;
    }
    if((G.state==='prep'||G.state==='wave')&&!G.paused){
      const td=TDEFS[G.selectedType];
      if(!isUnlocked(G.selectedType,G.wave)) return;
      if(placedCount()>=getTowerLimit(G.wave)) return;
      if(G.gold>=td.cost){
        G.gold-=td.cost;
        G.towers[key]=new Tower(gc,gr,G.selectedType);
        G.selectedTower=null; SFX.place();
      }
    }
  }
}

function handleMouseMove(lx,ly){
  if(appState.screen==='mapSelect'){
    mapSelectHover=-1;
    MAPS.forEach((_,i)=>{
      const bx=isPortrait?LW/2:LW/2+(i-1)*320;
      const by=isPortrait?130+i*230:220;
      const bw=isPortrait?420:280, bh=isPortrait?200:320;
      if(lx>=bx-bw/2&&lx<=bx+bw/2&&ly>=by&&ly<=by+bh) mapSelectHover=i;
    });
    return;
  }
  if(!G) return;
  if(lx>=GX&&lx<GX+COLS*CS&&ly>=GY&&ly<GY+ROWS*CS){
    G.hoverCell=worldToGrid(lx,ly);
  } else { G.hoverCell=null; }
}

// ── Touch state ───────────────────────────────────────────────────────
const _touches={};          // identifier → {x,y,startX,startY}
let _wasMultiTouch=false;   // was 2+ fingers used this gesture?
let _lastPinchDist=null;
let _lastPinchMidX=0, _lastPinchMidY=0;
let _panLastX=0, _panLastY=0;
let _isPanning=false;

function _pinchDist(t0,t1){
  const dx=t0.clientX-t1.clientX, dy=t0.clientY-t1.clientY;
  return Math.sqrt(dx*dx+dy*dy);
}
function _pinchMid(t0,t1){
  return {x:(t0.clientX+t1.clientX)/2, y:(t0.clientY+t1.clientY)/2};
}

C.addEventListener('touchstart', e=>{
  e.preventDefault();
  for(const t of e.changedTouches){
    _touches[t.identifier]={x:t.clientX,y:t.clientY,startX:t.clientX,startY:t.clientY};
  }
  if(e.touches.length>=2){
    _wasMultiTouch=true;
    _isPanning=false;
    _lastPinchDist=_pinchDist(e.touches[0],e.touches[1]);
    const m=_pinchMid(e.touches[0],e.touches[1]);
    _lastPinchMidX=m.x; _lastPinchMidY=m.y;
  } else {
    if(!_wasMultiTouch){
      _panLastX=e.touches[0].clientX;
      _panLastY=e.touches[0].clientY;
      _isPanning=false;
    }
  }
},{passive:false});

C.addEventListener('touchmove', e=>{
  e.preventDefault();
  if(e.touches.length>=2){
    _wasMultiTouch=true;
    const dist=_pinchDist(e.touches[0],e.touches[1]);
    const mid=_pinchMid(e.touches[0],e.touches[1]);
    if(_lastPinchDist!==null){
      const factor=dist/_lastPinchDist;
      applyZoomAt(factor, mid.x, mid.y);
      // pan by midpoint movement
      if(zoomLevel>1){
        zoomPanX+=mid.x-_lastPinchMidX;
        zoomPanY+=mid.y-_lastPinchMidY;
        clampPan(); updateZoomTransform();
      }
    }
    _lastPinchDist=dist;
    _lastPinchMidX=mid.x; _lastPinchMidY=mid.y;
  } else if(e.touches.length===1){
    const t=e.touches[0];
    const dx=t.clientX-_panLastX, dy=t.clientY-_panLastY;
    if(zoomLevel>1){
      _isPanning=true;
      zoomPanX+=dx; zoomPanY+=dy;
      clampPan(); updateZoomTransform(); _gridSig=null;
    } else {
      // check if moved enough to count as pan even at zoom=1
      const ts=_touches[t.identifier];
      if(ts){
        const adx=t.clientX-ts.startX, ady=t.clientY-ts.startY;
        if(Math.sqrt(adx*adx+ady*ady)>10) _isPanning=true;
      }
    }
    _panLastX=t.clientX; _panLastY=t.clientY;
    // update hover
    const [lx,ly]=toLogical(t.clientX,t.clientY);
    handleMouseMove(lx,ly);
  }
},{passive:false});

C.addEventListener('touchend', e=>{
  e.preventDefault();
  if(e.touches.length<2) _lastPinchDist=null;
  for(const t of e.changedTouches){
    const start=_touches[t.identifier];
    // fire click only for clean single taps
    if(start && !_wasMultiTouch && !_isPanning && e.touches.length===0){
      const dx=t.clientX-start.startX, dy=t.clientY-start.startY;
      if(Math.sqrt(dx*dx+dy*dy)<12){
        const [lx,ly]=toLogical(t.clientX,t.clientY);
        handleClick(lx,ly);
      }
    }
    delete _touches[t.identifier];
  }
  if(e.touches.length===0){ _wasMultiTouch=false; _isPanning=false; }
},{passive:false});

// ── Mouse events ──────────────────────────────────────────────────────
C.addEventListener('click', e=>{
  const [lx,ly]=toLogical(e.clientX,e.clientY);
  handleClick(lx,ly);
});

// Middle or right-click drag to pan
let _mousePan=false, _mousePanX=0, _mousePanY=0;
C.addEventListener('mousedown', e=>{
  if(e.button===1||e.button===2){
    _mousePan=true; _mousePanX=e.clientX; _mousePanY=e.clientY;
    e.preventDefault();
  }
});
C.addEventListener('contextmenu', e=>e.preventDefault());

C.addEventListener('mousemove', e=>{
  if(_mousePan){
    zoomPanX+=e.clientX-_mousePanX; zoomPanY+=e.clientY-_mousePanY;
    _mousePanX=e.clientX; _mousePanY=e.clientY;
    clampPan(); updateZoomTransform(); _gridSig=null;
  }
  const [lx,ly]=toLogical(e.clientX,e.clientY);
  handleMouseMove(lx,ly);
});
C.addEventListener('mouseup', e=>{ if(e.button===1||e.button===2) _mousePan=false; });

// Scroll to zoom
C.addEventListener('wheel', e=>{
  e.preventDefault();
  const factor=e.deltaY<0?1.12:1/1.12;
  applyZoomAt(factor, e.clientX, e.clientY);
},{passive:false});

// ── Keyboard ──────────────────────────────────────────────────────────
window.addEventListener('keydown',e=>{
  // zoom shortcuts (always active)
  if(e.code==='Equal'||e.code==='NumpadAdd'){
    applyZoomAt(1.20, C.width/2, C.height/2); e.preventDefault(); return;
  }
  if(e.code==='Minus'||e.code==='NumpadSubtract'){
    applyZoomAt(1/1.20, C.width/2, C.height/2); e.preventDefault(); return;
  }
  if(e.code==='Digit0'||e.code==='Numpad0'){
    resetZoom(); e.preventDefault(); return;
  }

  if(appState.screen==='splash'&&(e.code==='Space'||e.code==='Enter')){
    appState.screen='mapSelect'; e.preventDefault(); return;
  }
  if(appState.screen==='mapSelect'){
    if(e.code==='Digit1'||e.code==='Numpad1'){ newGame(0); appState.screen='game'; resetZoom(); }
    if(e.code==='Digit2'||e.code==='Numpad2'){ newGame(1); appState.screen='game'; resetZoom(); }
    if(e.code==='Escape'){ appState.screen='splash'; return; }
    return;
  }
  if(e.code==='Escape'){
    if(appState.screen==='game' && G && G.state !== 'gameOver'){
      if(confirm('Quit to menu? Current progress will be lost.')){
        appState.screen='splash'; G=null; BGM.stop(); resetZoom();
      }
    } else {
      appState.screen='splash'; G=null; resetZoom();
    }
    return;
  }
  if(!G) return;
  if(e.code==='Space'&&G.popupData){ G.popupData=null; e.preventDefault(); return; }
  if(e.code==='KeyP'||e.code==='Space'&&G.state==='wave'){ G.paused=!G.paused; e.preventDefault(); return; }
  if(e.code==='Space'&&G.state==='prep'){ startWave(); e.preventDefault(); return; }
  if(e.code==='KeyU' && G.selectedTower){
    const t = G.towers[G.selectedTower];
    if(t){
      const upgCost = 30 * t.level;
      if(t.level < getMaxUpgrade(G.wave) && G.gold >= upgCost){
        G.gold -= upgCost; t.level++; SFX.place();
      }
    }
  }
  const keyMap={'Digit1':'gun','Digit2':'flame','Digit3':'bomb','Digit4':'freeze','Digit5':'trigun'};
  if(keyMap[e.code]){ G.selectedType=keyMap[e.code]; G.selectedTower=null; }
});
