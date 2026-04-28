'use strict';
let mapSelectHover=-1;

function toLogical(clientX, clientY){
  return [(clientX-offX)/scale, (clientY-offY)/scale];
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
      G.speed = G.speed === 1 ? 2 : 1; return;
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
      if(lx>=bx-bw/2&&lx<=bx+bw/2&&ly>=by&&ly<=by+bh){ newGame(i); appState.screen='game'; }
    });
    return;
  }
  if(!G) return;
  if(G.state==='gameOver'){ appState.screen='splash'; G=null; BGM.start(); return; }

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

// ── Event listeners ───────────────────────────────────────────────────
C.addEventListener('click', e=>{
  const [lx,ly]=toLogical(e.clientX,e.clientY);
  handleClick(lx,ly);
});
C.addEventListener('touchstart', e=>{
  e.preventDefault();
  const t=e.touches[0];
  const [lx,ly]=toLogical(t.clientX,t.clientY);
  handleClick(lx,ly);
},{passive:false});
C.addEventListener('mousemove',e=>{
  const [lx,ly]=toLogical(e.clientX,e.clientY);
  handleMouseMove(lx,ly);
});

window.addEventListener('keydown',e=>{
  if(appState.screen==='splash'&&(e.code==='Space'||e.code==='Enter')){
    appState.screen='mapSelect'; e.preventDefault(); return;
  }
  if(appState.screen==='mapSelect'){
    if(e.code==='Digit1'||e.code==='Numpad1'){ newGame(0); appState.screen='game'; }
    if(e.code==='Digit2'||e.code==='Numpad2'){ newGame(1); appState.screen='game'; }
    if(e.code==='Escape'){ appState.screen='splash'; return; }
    return;
  }
  if(e.code==='Escape'){
    if(appState.screen==='game' && G && G.state !== 'gameOver'){
      if(confirm('Quit to menu? Current progress will be lost.')){
        appState.screen='splash'; G=null; BGM.stop();
      }
    } else {
      appState.screen='splash'; G=null;
    }
    return;
  }
  if(!G) return;
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
