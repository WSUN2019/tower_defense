'use strict';
// ── Button bounds helpers ─────────────────────────────────────────────
function resetBtnBounds(){ return {x:LW-58,y:LH-26,w:50,h:18}; }
function viewBtnBounds(){ return {x:LW-156,y:4,w:46,h:42}; }
function commanderAvatarBounds(){ return {cx:LW-202,cy:26,r:20}; }

function drawViewBtn(){
  if(appState.screen!=='game'||!G) return;
  const {x,y,w,h}=viewBtnBounds();
  roundRect(X,x,y,w,h,6);
  X.fillStyle=flatView?'rgba(30,60,30,0.9)':'rgba(20,30,50,0.85)';
  X.fill();
  X.strokeStyle=flatView?'#4f8':'rgba(80,140,220,0.5)'; X.lineWidth=1.5; X.stroke();
  X.fillStyle=flatView?'#8f8':'#7aacde'; X.font='bold 11px monospace'; X.textAlign='center';
  X.fillText(flatView?'FLAT':'3D',x+w/2,y+26);
}

// ── Splash screen state ───────────────────────────────────────────────
let splashStars=[];
let splashMonsters=[];
let splashTowers=[];

function initSplashStars(){
  if(splashStars.length) return;
  for(let i=0;i<160;i++) splashStars.push({x:Math.random()*LW,y:Math.random()*LH,b:Math.random()*255,s:Math.random()<0.05?2:1});
}

// ── HUD / UI rendering ────────────────────────────────────────────────
function drawHUD(now){
  X.fillStyle='rgba(5,10,20,0.92)';
  X.fillRect(0,0,LW,52);
  X.strokeStyle='rgba(60,120,200,0.3)'; X.lineWidth=1;
  X.beginPath(); X.moveTo(0,52); X.lineTo(LW,52); X.stroke();

  X.fillStyle='#f44'; X.font='bold 15px Segoe UI'; X.textAlign='left';
  X.fillText('❤',12,30);
  X.fillStyle='#eee'; X.font='bold 18px monospace';
  X.fillText(G.lives,32,32);

  X.fillStyle='#fd0'; X.font='bold 14px Segoe UI'; X.textAlign='left';
  X.fillText('GOLD',78,22);
  X.fillStyle='#ffe066'; X.font='bold 20px monospace';
  X.fillText(G.gold,78,42);

  X.textAlign='center';
  X.fillStyle='#8af'; X.font='bold 16px monospace';
  X.fillText(`WAVE ${G.wave+1}`, LW/2, 22);
  X.fillStyle='#aaa'; X.font='13px monospace';
  X.fillText(`SCORE: ${G.score}`, LW/2, 40);

  if(G.paused){
    X.fillStyle='rgba(255,200,0,0.9)'; X.font='bold 14px monospace'; X.textAlign='right';
    X.fillText('⏸ PAUSED', isPortrait ? LW-10 : LW-PW-20, 32);
  }
  drawMuteBtn();
  drawSpeedBtn();
  drawViewBtn();
  const {cx:acx,cy:acy,r:ar}=commanderAvatarBounds();
  drawChibiPortrait(acx,acy,ar,now,null);
  // zoom indicator
  if(zoomLevel>1.01){
    X.fillStyle='rgba(10,20,40,0.75)';
    roundRect(X,LW-204,48,44,14,4); X.fill();
    X.fillStyle='#6cf'; X.font='bold 9px monospace'; X.textAlign='center';
    X.fillText(`${zoomLevel.toFixed(1)}x`, LW-182, 58);
  }
}

function drawPanelPortrait(now){
  const px=8, py=PY, pw=LW-16;

  X.fillStyle='rgba(8,14,28,0.97)';
  X.fillRect(0,PY-1,LW,PH+2);
  X.strokeStyle='rgba(60,120,200,0.3)'; X.lineWidth=1;
  X.beginPath(); X.moveTo(0,PY); X.lineTo(LW,PY); X.stroke();

  const placed=placedCount(), limit=getTowerLimit(G.wave);
  X.fillStyle=placed>=limit?'#f84':'#fd0'; X.font='bold 10px monospace'; X.textAlign='right';
  X.fillText(`TOWERS ${placed}/${limit}`, LW-px-2, py+5);

  const nbtn=TORDER.length;
  const bw=Math.floor(pw/nbtn), bh=84, by=py+9;
  for(let i=0;i<nbtn;i++){
    const kind=TORDER[i];
    const td=TDEFS[kind];
    const locked=!isUnlocked(kind,G.wave);
    const isNew=UNLOCK_WAVE[kind]===G.wave;
    const sel=(G.selectedType===kind);
    const canAfford=(G.gold>=td.cost);
    const bx=px+i*bw;
    roundRect(X,bx+2,by,bw-4,bh,6);
    X.fillStyle=sel?'rgba(30,70,120,0.9)':'rgba(15,25,45,0.8)'; X.fill();
    X.strokeStyle=locked?'rgba(60,60,80,0.3)':isNew?'#8f8':sel?'#4af':'rgba(60,100,160,0.4)';
    X.lineWidth=(sel||isNew)?2:1; X.stroke();
    if(locked) X.globalAlpha=0.28; else if(!canAfford) X.globalAlpha=0.45;
    X.save(); X.translate(bx+bw/2, by+28);
    const dT={kind,angle:-Math.PI/4,level:1,flashTimer:0,showRange:false};
    X.scale(0.5,0.5);
    switch(kind){
      case 'gun':    drawGunTower(X,0,0,20,dT,now,1); break;
      case 'flame':  drawFlameTower(X,0,0,20,dT,now,1); break;
      case 'bomb':   drawBombTower(X,0,0,20,dT,now,1); break;
      case 'freeze': drawFreezeTower(X,0,0,20,dT,now,1); break;
      case 'trigun': drawTrigunTower(X,0,0,20,dT,now,1); break;
    }
    X.restore();
    X.fillStyle=locked?'#556':sel?'#8cf':'#aac'; X.font='bold 9px Segoe UI'; X.textAlign='center';
    X.fillText(td.name, bx+bw/2, by+54);
    if(locked){
      X.fillStyle='#556'; X.font='8px monospace';
      X.fillText(`W${UNLOCK_WAVE[kind]}`, bx+bw/2, by+66);
    } else {
      X.fillStyle=canAfford?'#fd0':'#a66'; X.font='bold 9px monospace';
      X.fillText('⬡'+td.cost, bx+bw/2, by+66);
      if(isNew){ X.fillStyle='#8f8'; X.font='bold 8px monospace'; X.fillText('NEW!',bx+bw/2,by+76); }
      else { X.fillStyle='#446'; X.font='8px monospace'; X.fillText(td.key,bx+bw/2,by+76); }
    }
    X.globalAlpha=1;
  }

  let y=by+bh+10;

  if(G.selectedTower){
    const t=G.towers[G.selectedTower];
    if(t){
      const td2=TDEFS[t.kind];
      const maxUpg=getMaxUpgrade(G.wave);
      const upgCost=30*t.level;
      const upgLocked=t.level>=maxUpg&&t.level<3;
      const canUpg=G.gold>=upgCost&&t.level<maxUpg;
      const sellVal=Math.floor(td2.cost*t.level*0.6);
      const hw=Math.floor(pw/2)-4;
      roundRect(X,px,y,hw,34,6);
      X.fillStyle=canUpg?'rgba(20,60,20,0.8)':upgLocked?'rgba(20,20,40,0.7)':'rgba(40,20,20,0.5)'; X.fill();
      X.strokeStyle=canUpg?'#4a4':upgLocked?'#446':'#644'; X.lineWidth=1.5; X.stroke();
      X.fillStyle=canUpg?'#6f6':upgLocked?'#66a':'#866'; X.font='bold 10px monospace'; X.textAlign='center';
      const upgLabel=t.level>=3?'MAX LV':upgLocked?`W${t.level===1?1:3}`:`▲⬡${upgCost}`;
      X.fillText(upgLabel, px+hw/2, y+22);
      roundRect(X,px+hw+8,y,hw,34,6);
      X.fillStyle='rgba(60,15,15,0.8)'; X.fill();
      X.strokeStyle='#844'; X.lineWidth=1; X.stroke();
      X.fillStyle='#f88'; X.font='bold 10px monospace'; X.textAlign='center';
      X.fillText(`SELL ⬡${sellVal}`, px+hw+8+hw/2, y+22);
      X.fillStyle='#cde'; X.font='10px monospace'; X.textAlign='left';
      X.fillText(`${td2.name} Lv${t.level}`, px, y+46);
      y+=52;
    }
  }

  const btnH=46, btnY=LH-btnH-6;
  roundRect(X,px,btnY,pw,btnH,8);
  if(G.state==='prep'){
    X.fillStyle='#112e11'; X.fill(); X.strokeStyle='#4f4'; X.lineWidth=2; X.stroke();
    X.fillStyle='#8f8'; X.font='bold 16px monospace'; X.textAlign='center';
    X.fillText('▶ START WAVE', px+pw/2, btnY+30);
  } else if(G.state==='wave'){
    X.fillStyle='#2a1400'; X.fill(); X.strokeStyle='#f80'; X.lineWidth=1; X.stroke();
    X.fillStyle='#fa6'; X.font='bold 14px monospace'; X.textAlign='center';
    X.fillText(G.paused?'▶ RESUME':'⏸ PAUSE', px+pw/2, btnY+30);
  }
}

function drawPanel(now){
  if(isPortrait){ drawPanelPortrait(now); return; }
  const px=PX, pw=PW;

  X.fillStyle='rgba(8,14,28,0.97)'; X.fillRect(px,52,pw,LH-52);
  X.strokeStyle='rgba(60,120,200,0.25)'; X.lineWidth=1;
  X.beginPath(); X.moveTo(px,52); X.lineTo(px,LH); X.stroke();

  let y=62;
  const placed=placedCount(), limit=getTowerLimit(G.wave);
  X.textAlign='left'; X.fillStyle='#8af'; X.font='bold 13px monospace';
  X.fillText('TOWERS', px+6, y);
  X.fillStyle=placed>=limit?'#f84':'#fd0'; X.textAlign='right';
  X.fillText(`${placed}/${limit}`, px+pw-6, y);
  y+=16;

  for(const kind of TORDER){
    const td=TDEFS[kind];
    const locked=!isUnlocked(kind,G.wave);
    const isNew=UNLOCK_WAVE[kind]===G.wave;
    const sel=(G.selectedType===kind);
    const canAfford=(G.gold>=td.cost);
    const bx=px+6, bw=pw-12, bh=56;

    roundRect(X,bx,y,bw,bh,6);
    X.fillStyle=sel?'rgba(30,70,120,0.9)':'rgba(15,25,45,0.8)';
    X.fill();
    X.strokeStyle=locked?'rgba(60,60,80,0.3)':isNew?'#8f8':sel?'#4af':'rgba(60,100,160,0.4)';
    X.lineWidth=(sel||isNew)?2:1; X.stroke();

    if(locked){ X.globalAlpha=0.28; }
    else if(!canAfford){ X.globalAlpha=0.45; }

    X.save(); X.translate(bx+28,y+bh/2);
    const dummyT={kind,angle:-Math.PI/4,level:1,flashTimer:0,showRange:false};
    X.scale(0.5,0.5);
    switch(kind){
      case 'gun':    drawGunTower(X,0,0,20,dummyT,now,1); break;
      case 'flame':  drawFlameTower(X,0,0,20,dummyT,now,1); break;
      case 'bomb':   drawBombTower(X,0,0,20,dummyT,now,1); break;
      case 'freeze': drawFreezeTower(X,0,0,20,dummyT,now,1); break;
      case 'trigun': drawTrigunTower(X,0,0,20,dummyT,now,1); break;
    }
    X.restore();

    X.fillStyle=locked?'#556':sel?'#8cf':'#aac'; X.font='bold 12px Segoe UI'; X.textAlign='left';
    X.fillText(`${td.key}. ${td.name}`, bx+52, y+18);
    if(locked){
      X.fillStyle='#556'; X.font='10px monospace';
      X.fillText(`Wave ${UNLOCK_WAVE[kind]}`, bx+52, y+32);
    } else {
      X.fillStyle=canAfford?'#fd0':'#a66'; X.font='bold 11px monospace';
      X.fillText(`⬡${td.cost}`, bx+52, y+32);
      if(isNew){ X.fillStyle='#8f8'; X.font='bold 9px monospace'; X.fillText('NEW!', bx+52, y+44); }
      else { X.fillStyle='#667'; X.font='10px Segoe UI'; X.fillText(td.desc, bx+52, y+44); }
    }

    X.globalAlpha=1;
    y+=bh+4;
  }

  y+=4;
  X.strokeStyle='rgba(60,100,160,0.3)'; X.lineWidth=1;
  X.beginPath(); X.moveTo(px+10,y); X.lineTo(px+pw-10,y); X.stroke();
  y+=12;

  if(G.selectedTower){
    const t=G.towers[G.selectedTower];
    if(t){
      const td2=TDEFS[t.kind];
      const maxUpg=getMaxUpgrade(G.wave);
      X.fillStyle='#cde'; X.font='bold 13px monospace'; X.textAlign='center';
      X.fillText(`${td2.name} Lv${t.level}`, px+pw/2, y); y+=16;
      const upgCost=30*t.level;
      const upgLocked=t.level>=maxUpg&&t.level<3;
      const canUpg=G.gold>=upgCost&&t.level<maxUpg;
      roundRect(X,px+8,y,pw-16,34,6);
      X.fillStyle=canUpg?'rgba(20,60,20,0.8)':upgLocked?'rgba(20,20,40,0.7)':'rgba(40,20,20,0.5)'; X.fill();
      X.strokeStyle=canUpg?'#4a4':upgLocked?'#446':'#644'; X.lineWidth=1.5; X.stroke();
      X.fillStyle=canUpg?'#6f6':upgLocked?'#66a':'#866'; X.font='bold 12px monospace'; X.textAlign='center';
      const upgLabel=t.level>=3?'MAX LEVEL':upgLocked?`Lv${t.level+1}: Wave ${t.level===1?1:3}`:`UPGRADE ⬡${upgCost}`;
      X.fillText(upgLabel, px+pw/2, y+20);
      y+=44;

      const sellVal=Math.floor(td2.cost*t.level*0.6);
      roundRect(X,px+8,y,pw-16,28,6);
      X.fillStyle='rgba(60,15,15,0.8)'; X.fill();
      X.strokeStyle='#844'; X.lineWidth=1; X.stroke();
      X.fillStyle='#f88'; X.font='bold 11px monospace'; X.textAlign='center';
      X.fillText(`SELL ⬡${sellVal}`, px+pw/2, y+17);
      y+=36;
    }
  }

  const btnY=LH-70, btnH=50;
  roundRect(X,px+8,btnY,pw-16,btnH,8);
  if(G.state==='prep'){
    X.fillStyle='#112e11'; X.fill();
    X.strokeStyle='#4f4'; X.lineWidth=2; X.stroke();
    X.fillStyle='#8f8'; X.font='bold 15px monospace'; X.textAlign='center';
    X.fillText('▶ START WAVE', px+pw/2, btnY+30);
  } else if(G.state==='wave'){
    X.fillStyle='#2a1400'; X.fill();
    X.strokeStyle='#f80'; X.lineWidth=1; X.stroke();
    X.fillStyle='#fa6'; X.font='bold 13px monospace'; X.textAlign='center';
    X.fillText(G.paused?'▶ RESUME':'⏸ PAUSE', px+pw/2, btnY+30);
  }
}

// ── Chibi anime portrait (oval-framed, scales with r) ─────────────────
function drawChibiPortrait(cx, cy, r, now, label){
  const bob=Math.sin(now*2.2)*r*0.04;
  X.save();
  X.translate(cx, cy+bob);

  // ── Clip to oval frame ────────────────────────────────────────────
  X.save();
  X.beginPath(); X.ellipse(0,0,r,r*1.12,0,0,Math.PI*2); X.clip();

  // Background
  X.fillStyle='#cbb8de';
  X.fillRect(-r*1.2,-r*1.3,r*2.4,r*2.6);
  // subtle vignette
  const vg=X.createRadialGradient(0,0,r*0.4,0,0,r*1.2);
  vg.addColorStop(0,'rgba(220,200,240,0)'); vg.addColorStop(1,'rgba(60,20,80,0.35)');
  X.fillStyle=vg; X.fillRect(-r*1.2,-r*1.3,r*2.4,r*2.6);

  const hc='#0e0e18';

  // ── Hair back (two flowing side pieces behind head) ───────────────
  X.fillStyle=hc;
  X.beginPath();
  X.moveTo(-r*0.18,-r*0.90);
  X.bezierCurveTo(-r*0.55,-r*1.05,-r*1.08,-r*0.55,-r*1.06,-r*0.05);
  X.bezierCurveTo(-r*1.08,r*0.38,-r*0.92,r*0.90,-r*0.68,r*1.12);
  X.bezierCurveTo(-r*0.40,r*1.30,-r*0.05,r*1.22,r*0.00,r*1.0);
  X.bezierCurveTo(-r*0.18,r*0.45,-r*0.38,r*0.05,-r*0.22,-r*0.52);
  X.closePath(); X.fill();
  X.beginPath();
  X.moveTo(r*0.18,-r*0.90);
  X.bezierCurveTo(r*0.55,-r*1.05,r*1.08,-r*0.55,r*1.06,-r*0.05);
  X.bezierCurveTo(r*1.08,r*0.38,r*0.92,r*0.90,r*0.68,r*1.12);
  X.bezierCurveTo(r*0.40,r*1.30,r*0.05,r*1.22,r*0.00,r*1.0);
  X.bezierCurveTo(r*0.18,r*0.45,r*0.38,r*0.05,r*0.22,-r*0.52);
  X.closePath(); X.fill();

  // ── Head / face ───────────────────────────────────────────────────
  X.fillStyle='#fde8ca';
  X.beginPath(); X.ellipse(0,r*0.06,r*0.68,r*0.80,0,0,Math.PI*2); X.fill();

  // ── Hair front cap (center-parted) ────────────────────────────────
  X.fillStyle=hc;
  X.beginPath();
  X.arc(0,-r*0.08,r*0.70,Math.PI*1.07,Math.PI*1.93);
  X.bezierCurveTo(r*0.58,-r*0.12,r*0.52,r*0.08,r*0.32,r*0.04);
  X.quadraticCurveTo(r*0.10,-r*0.22,0,-r*0.32);
  X.quadraticCurveTo(-r*0.10,-r*0.22,-r*0.32,r*0.04);
  X.bezierCurveTo(-r*0.52,r*0.08,-r*0.58,-r*0.12,-r*0.70,-r*0.38);
  X.closePath(); X.fill();
  // hair sheen
  X.fillStyle='rgba(80,60,130,0.14)';
  X.beginPath(); X.ellipse(-r*0.14,-r*0.56,r*0.11,r*0.07,-0.5,0,Math.PI*2); X.fill();
  X.beginPath(); X.ellipse(r*0.10,-r*0.64,r*0.07,r*0.045,0.4,0,Math.PI*2); X.fill();

  // ── Cheeks ────────────────────────────────────────────────────────
  X.fillStyle='rgba(255,110,95,0.22)';
  X.beginPath(); X.ellipse(-r*0.42,r*0.30,r*0.17,r*0.095,0,0,Math.PI*2); X.fill();
  X.beginPath(); X.ellipse(r*0.42,r*0.30,r*0.17,r*0.095,0,0,Math.PI*2); X.fill();

  // ── Eyes ──────────────────────────────────────────────────────────
  const ey=r*0.10, ex=r*0.32;
  const blinkT=now%4.2, blink=blinkT>4.05;
  if(blink){
    X.strokeStyle='#0d0d18'; X.lineWidth=r*0.06; X.lineCap='round';
    X.beginPath(); X.moveTo(-ex-r*0.18,ey); X.lineTo(-ex+r*0.18,ey); X.stroke();
    X.beginPath(); X.moveTo(ex-r*0.18,ey); X.lineTo(ex+r*0.18,ey); X.stroke();
  } else {
    X.fillStyle='#fff';
    X.beginPath(); X.ellipse(-ex,ey,r*0.195,r*0.235,0,0,Math.PI*2); X.fill();
    X.beginPath(); X.ellipse(ex,ey,r*0.195,r*0.235,0,0,Math.PI*2); X.fill();
    // iris — dark, near-black
    X.fillStyle='#161420';
    X.beginPath(); X.ellipse(-ex,ey+r*0.02,r*0.150,r*0.185,0,0,Math.PI*2); X.fill();
    X.beginPath(); X.ellipse(ex,ey+r*0.02,r*0.150,r*0.185,0,0,Math.PI*2); X.fill();
    // upper eyelid arc
    X.strokeStyle='#090910'; X.lineWidth=r*0.055; X.lineCap='round';
    X.beginPath();
    X.moveTo(-ex-r*0.20,ey-r*0.01);
    X.quadraticCurveTo(-ex,ey-r*0.29,-ex+r*0.20,ey-r*0.01);
    X.stroke();
    X.beginPath();
    X.moveTo(ex-r*0.20,ey-r*0.01);
    X.quadraticCurveTo(ex,ey-r*0.29,ex+r*0.20,ey-r*0.01);
    X.stroke();
    // outer lash tips
    X.lineWidth=r*0.038;
    X.beginPath(); X.moveTo(-ex-r*0.20,ey-r*0.01); X.lineTo(-ex-r*0.26,ey-r*0.07); X.stroke();
    X.beginPath(); X.moveTo(ex+r*0.20,ey-r*0.01); X.lineTo(ex+r*0.26,ey-r*0.07); X.stroke();
    // large highlight oval
    X.fillStyle='rgba(255,255,255,0.94)';
    X.beginPath(); X.ellipse(-ex-r*0.055,ey-r*0.075,r*0.072,r*0.090,-0.3,0,Math.PI*2); X.fill();
    X.beginPath(); X.ellipse(ex-r*0.055,ey-r*0.075,r*0.072,r*0.090,-0.3,0,Math.PI*2); X.fill();
    // small lower highlight
    X.beginPath(); X.arc(-ex+r*0.085,ey+r*0.09,r*0.036,0,Math.PI*2); X.fill();
    X.beginPath(); X.arc(ex+r*0.085,ey+r*0.09,r*0.036,0,Math.PI*2); X.fill();
  }

  // ── Eyebrows (thin, slightly arched) ──────────────────────────────
  X.strokeStyle='#1c1428'; X.lineWidth=r*0.042; X.lineCap='round';
  X.beginPath();
  X.moveTo(-ex-r*0.18,ey-r*0.30);
  X.quadraticCurveTo(-ex,ey-r*0.40,-ex+r*0.18,ey-r*0.28);
  X.stroke();
  X.beginPath();
  X.moveTo(ex-r*0.18,ey-r*0.28);
  X.quadraticCurveTo(ex,ey-r*0.40,ex+r*0.18,ey-r*0.30);
  X.stroke();

  // ── Nose (tiny dot) ───────────────────────────────────────────────
  X.fillStyle='rgba(185,125,85,0.65)';
  X.beginPath(); X.arc(0,r*0.36,r*0.032,0,Math.PI*2); X.fill();

  // ── Mouth ─────────────────────────────────────────────────────────
  X.strokeStyle='#b86858'; X.lineWidth=r*0.036; X.lineCap='round';
  X.beginPath(); X.arc(0,r*0.50,r*0.095,0.20,Math.PI-0.20); X.stroke();

  // ── Pearl hair clips ──────────────────────────────────────────────
  [-r*0.20,0,r*0.20].forEach(px2=>{
    X.fillStyle='#eaeaf8';
    X.beginPath(); X.arc(px2,-r*0.78,r*0.055,0,Math.PI*2); X.fill();
    X.strokeStyle='rgba(170,150,210,0.8)'; X.lineWidth=r*0.018; X.stroke();
  });

  X.restore(); // end clip

  // ── Oval border ───────────────────────────────────────────────────
  X.strokeStyle='rgba(150,110,210,0.80)';
  X.lineWidth=r*0.07;
  X.beginPath(); X.ellipse(0,0,r,r*1.12,0,0,Math.PI*2); X.stroke();
  X.strokeStyle='rgba(210,185,255,0.35)';
  X.lineWidth=r*0.03;
  X.beginPath(); X.ellipse(0,0,r*0.90,r*1.01,0,0,Math.PI*2); X.stroke();

  // ── Speech bubble (only for large portrait in popup) ──────────────
  if(label && r>30){
    const fs=Math.round(r*0.19);
    X.font=`bold ${fs}px Segoe UI`;
    const tw=X.measureText(label).width;
    const bw2=Math.max(tw+14,r*1.05), bh2=r*0.40;
    const sbx=r*0.12, sby=-r*1.32;
    X.fillStyle='rgba(255,255,255,0.94)';
    roundRect(X,sbx,sby,bw2,bh2,r*0.12); X.fill();
    X.strokeStyle='rgba(110,75,195,0.55)'; X.lineWidth=r*0.025; X.stroke();
    X.fillStyle='rgba(255,255,255,0.94)';
    X.beginPath();
    X.moveTo(sbx+bw2*0.22,sby+bh2);
    X.lineTo(sbx+bw2*0.10,sby+bh2+r*0.24);
    X.lineTo(sbx+bw2*0.40,sby+bh2);
    X.fill();
    X.fillStyle='#2c1a90'; X.textAlign='left';
    X.fillText(label, sbx+r*0.12, sby+bh2*0.70);
  }

  X.restore();
}

// ── Unlock popup modal ────────────────────────────────────────────────
function drawUnlockPopup(now){
  const pd=G.popupData;
  const isGL=pd.kind==='goodluck';
  const a=pd.angle;

  X.fillStyle='rgba(0,4,14,0.80)'; X.fillRect(0,0,LW,LH);

  const pw=isPortrait?Math.min(LW-24,420):440, ph=isGL?280:360;
  const bx=(LW-pw)/2, by=(LH-ph)/2;

  const pg=X.createLinearGradient(bx,by,bx,by+ph);
  pg.addColorStop(0,'rgba(6,16,38,0.99)'); pg.addColorStop(1,'rgba(3,8,22,0.99)');
  X.fillStyle=pg; roundRect(X,bx,by,pw,ph,18); X.fill();
  X.strokeStyle=isGL?'#ffe066':'#4af'; X.lineWidth=2;
  X.shadowColor=isGL?'#ffe066':'#4af'; X.shadowBlur=14;
  roundRect(X,bx,by,pw,ph,18); X.stroke();
  X.shadowBlur=0;

  const cx=bx+pw/2;

  // chibi girl portrait on left side of popup
  drawChibiPortrait(bx+68, by+(isGL?ph*0.50:ph*0.50), 52, now, isGL?'All set!':'New!');

  if(isGL){
    X.fillStyle='#ffe066'; X.font='bold 22px monospace'; X.textAlign='center';
    X.fillText('Good Luck, Commander!', cx, by+52);
    X.fillStyle='#acd'; X.font='14px Segoe UI';
    X.fillText('All resources are now available.', cx, by+80);
    X.fillStyle='#78a'; X.font='13px Segoe UI';
    X.fillText('The fate of the galaxy is in your hands.', cx, by+102);

    const orbitR=62, count=TORDER.length;
    TORDER.forEach((kind,i)=>{
      const oa=a*0.6+i*Math.PI*2/count;
      const tx=cx+Math.cos(oa)*orbitR, ty=by+165+Math.sin(oa)*orbitR*0.55;
      X.save(); X.translate(tx,ty);
      const dT={kind,angle:a+i,level:3,flashTimer:0,showRange:false};
      X.scale(0.45,0.45);
      switch(kind){
        case 'gun':    drawGunTower(X,0,0,20,dT,now,3); break;
        case 'flame':  drawFlameTower(X,0,0,20,dT,now,3); break;
        case 'bomb':   drawBombTower(X,0,0,20,dT,now,3); break;
        case 'freeze': drawFreezeTower(X,0,0,20,dT,now,3); break;
        case 'trigun': drawTrigunTower(X,0,0,20,dT,now,3); break;
      }
      X.restore();
    });
  } else {
    X.fillStyle='#8f8'; X.font='bold 15px monospace'; X.textAlign='center';
    X.fillText('CONGRATULATIONS, COMMANDER!', cx, by+42);
    X.fillStyle='#acd'; X.font='13px Segoe UI';
    X.fillText('You have unlocked a new resource:', cx, by+64);

    const orbitR=58;
    for(let i=0;i<10;i++){
      const oa=a*1.4+i*Math.PI*2/10;
      X.fillStyle=`rgba(100,200,255,${0.35+0.25*Math.sin(oa+now*4)})`;
      X.beginPath(); X.arc(cx+Math.cos(oa)*orbitR, by+168+Math.sin(oa)*orbitR*0.5, 3,0,Math.PI*2); X.fill();
    }

    X.save(); X.translate(cx, by+168);
    if(pd.kind==='upgrade2'||pd.kind==='upgrade3'){
      const lvl=pd.kind==='upgrade2'?2:3;
      const dT={kind:'gun',angle:a*0.5,level:lvl,flashTimer:0,showRange:false};
      X.save(); X.rotate(a*0.15); drawGunTower(X,0,0,28,dT,now,lvl); X.restore();
      for(let i=0;i<3;i++){
        const ba=a*2.2+i*Math.PI*2/3;
        const bpx=Math.cos(ba)*44, bpy=Math.sin(ba)*44;
        X.fillStyle=lvl===3?'#ffe066':'#4af';
        X.beginPath(); X.arc(bpx,bpy,13,0,Math.PI*2); X.fill();
        X.strokeStyle='#fff'; X.lineWidth=1.5; X.stroke();
        X.fillStyle='#000'; X.font='bold 12px monospace'; X.textAlign='center';
        X.fillText(`L${lvl}`,bpx,bpy+5);
      }
    } else {
      const dT={kind:pd.kind,angle:a*0.7,level:1,flashTimer:0,showRange:false};
      X.save(); X.rotate(a*0.2);
      switch(pd.kind){
        case 'flame':  drawFlameTower(X,0,0,30,dT,now,1); break;
        case 'bomb':   drawBombTower(X,0,0,30,dT,now,1); break;
        case 'freeze': drawFreezeTower(X,0,0,30,dT,now,1); break;
        case 'trigun': drawTrigunTower(X,0,0,30,dT,now,1); break;
      }
      X.restore();
    }
    X.restore();

    X.fillStyle='#fd0'; X.font='bold 17px monospace'; X.textAlign='center';
    X.fillText(pd.title, cx, by+232);
    X.fillStyle='#8ab'; X.font='12px Segoe UI';
    pd.desc.split('\n').forEach((line,i)=>X.fillText(line, cx, by+252+i*17));

    X.fillStyle='rgba(20,50,20,0.7)';
    roundRect(X,cx-90,by+288,180,22,8); X.fill();
    X.strokeStyle='#4a4'; X.lineWidth=1; X.stroke();
    X.fillStyle='#8f8'; X.font='bold 10px monospace'; X.textAlign='center';
    X.fillText(pd.slots, cx, by+303);
  }

  const btnW=150, btnH=38, btnX=cx-75, btnY=by+ph-52;
  roundRect(X,btnX,btnY,btnW,btnH,10);
  const bg2=X.createLinearGradient(btnX,btnY,btnX,btnY+btnH);
  bg2.addColorStop(0,isGL?'#4a3800':'#0c3020'); bg2.addColorStop(1,isGL?'#201800':'#061810');
  X.fillStyle=bg2; X.fill();
  X.strokeStyle=isGL?'#ffe066':'#4f8'; X.lineWidth=1.5; X.stroke();
  X.fillStyle=isGL?'#ffe066':'#8f8'; X.font='bold 14px monospace'; X.textAlign='center';
  X.fillText('CONTINUE', cx, btnY+25);
  X.fillStyle='rgba(100,120,160,0.6)'; X.font='10px Segoe UI';
  X.fillText('or tap anywhere', cx, btnY+btnH+14);
}

// ── Offscreen grid cache ──────────────────────────────────────────────
let _gridCanvas=null, _gridSig=null;
function drawGrid(){
  const hc=G.hoverCell?G.hoverCell.join(','):'-';
  const sig=hc+'|'+(G.selectedTower||'-')+'|'+flatView;
  if(!_gridCanvas||_gridCanvas.width!==LW||_gridCanvas.height!==LH){
    _gridCanvas=document.createElement('canvas');
    _gridCanvas.width=LW; _gridCanvas.height=LH;
    _gridSig=null;
  }
  if(sig!==_gridSig){
    _gridSig=sig;
    const ctx=_gridCanvas.getContext('2d');
    ctx.clearRect(0,0,LW,LH);
    const [tlx,tly]=toIso(GX,GY),[trx,tr_y]=toIso(GX+COLS*CS,GY);
    const [brx,bry]=toIso(GX+COLS*CS,GY+ROWS*CS),[blx,bly]=toIso(GX,GY+ROWS*CS);
    ctx.fillStyle='#080d18';
    ctx.beginPath();ctx.moveTo(tlx,tly);ctx.lineTo(trx,tr_y);ctx.lineTo(brx,bry);ctx.lineTo(blx,bly);ctx.closePath();ctx.fill();
    const [ec,er]=G.path[0],[xc,xr]=G.path[G.path.length-1];
    if(!G._tileCache){
      G._tileCache=[];
      for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) G._tileCache.push({c,r});
      G._tileCache.sort((a,b)=>(a.r+a.c)-(b.r+b.c));
    }
    const sel=G.selectedTower?[G.towers[G.selectedTower]?.col,G.towers[G.selectedTower]?.row]:null;
    for(const t of G._tileCache){
      const {c,r}=t;
      drawTile(c,r,G.pathSet.has(r*COLS+c),c===ec&&r===er,c===xc&&r===xr,G.hoverCell,sel,ctx);
    }
  }
  X.drawImage(_gridCanvas,0,0);
}

// ── Main game renderer ────────────────────────────────────────────────
function drawGame(now){
  X.globalAlpha=1; X.shadowBlur=0; X.setLineDash([]);

  drawGrid();

  if(G.hoverCell&&G.state==='prep'||G.state==='wave'){
    const [hc,hr]=G.hoverCell||[-1,-1];
    if(hc>=0&&hr>=0 && !G.pathSet.has(hr*COLS+hc) && !G.towers[hr*COLS+hc]){
      const [hx,hy]=cellCenter(hc,hr);
      const td=TDEFS[G.selectedType];
      X.globalAlpha=0.25;
      X.fillStyle=td.color;
      X.beginPath(); X.arc(hx,hy,td.rad*CS,0,Math.PI*2); X.fill();
      X.globalAlpha=0.5;
      const dummyT={kind:G.selectedType,angle:0,level:1,flashTimer:0,showRange:false};
      drawTower3D({...dummyT,col:hc,row:hr}, now);
      X.globalAlpha=1;
    }
  }

  drawBullets();

  for(const t of Object.values(G.towers)){
    t.showRange=(G.selectedTower===t.col+t.row*COLS+'');
    drawTower3D(t, now);
  }

  drawParticles();

  for(const m of (G.aliveMonsters||G.monsters)) if(!m.dead) drawMonster(m,now);

  drawHUD(now);
  drawPanel(now);

  if(G.paused){
    X.fillStyle='rgba(0,5,15,0.7)';
    X.fillRect(GX,GY,COLS*CS,ROWS*CS);
    X.fillStyle='#8af'; X.font='bold 40px monospace'; X.textAlign='center';
    X.fillText('PAUSED', GX+COLS*CS/2, GY+ROWS*CS/2-20);
    X.fillStyle='#667'; X.font='16px monospace';
    X.fillText('Press P or tap Resume', GX+COLS*CS/2, GY+ROWS*CS/2+20);
  }

  if(G.state==='gameOver'){
    X.fillStyle='rgba(0,5,15,0.85)';
    X.fillRect(GX,GY,COLS*CS,ROWS*CS);
    X.font='bold 52px monospace'; X.textAlign='center';
    const gx2=GX+COLS*CS/2, gy2=GY+ROWS*CS/2;
    X.fillStyle='#f44';
    X.fillText('GAME OVER', gx2, gy2-40);
    X.fillStyle='#aac'; X.font='bold 18px monospace';
    X.fillText(`Reached Wave ${G.wave}`, gx2, gy2-4);
    X.fillStyle='#888'; X.font='15px monospace';
    X.fillText(`Score: ${G.score}`, gx2, gy2+24);
    if(G.isNewRecord){
      X.fillStyle='#4f4'; X.font='bold 16px monospace';
      X.fillText('NEW RECORD SET!', gx2, gy2+44);
    }
    const hs = getHighScore();
    X.fillStyle='#fd0'; X.font='bold 14px monospace';
    X.fillText(`BEST: ${hs} (${getHighScoreName()})`, gx2, gy2+64);
    X.fillStyle='#6a8'; X.font='14px monospace';
    X.fillText('Tap to play again', gx2, gy2+84);
  }

  if(G.popupData) drawUnlockPopup(now);
}

// ── Splash screen ─────────────────────────────────────────────────────
function drawSplash(now){
  initSplashStars();
  X.fillStyle='#060810'; X.fillRect(0,0,LW,LH);
  for(const s of splashStars){
    const blink=Math.sin(now*1.8+s.x*0.05+s.y*0.03);
    const b=Math.floor(s.b*(0.5+0.5*blink));
    X.fillStyle=`rgb(${b},${b},Math.min(255,b+30))`;
    X.beginPath(); X.arc(s.x,s.y,s.s,0,Math.PI*2); X.fill();
  }

  const scanY=((now*100)%LH);
  X.globalAlpha=0.04;
  X.fillStyle='#60a0ff'; X.fillRect(0,scanY,LW,3);
  X.globalAlpha=1;

  const dt = 0.016;
  if (Math.random() < 0.04 && splashMonsters.length < 12) {
    const type = Object.keys(MCOLORS)[Math.floor(Math.random() * 6)];
    const sRadius = {normal:11,fast:9,tank:13,boss:18,demo:20,blob:14}[type]||11;
    splashMonsters.push({ x: -40, yBase: 230 + Math.random() * 200, radius: sRadius, hp: 1, maxHp: 1, slow: 0, slowMax: 1.5, dot: 0, id: Math.random()*9999|0, type, baseColor: MCOLORS[type], speed: 40 + Math.random() * 70, phase: Math.random() * 6, drawX: -40, drawY: 300, gen: 0, split: false, _rawPos: true });
  }
  if (Math.random() < 0.015 && splashMonsters.length > 2 && splashTowers.length < 2) {
    const target = splashMonsters[Math.floor(Math.random() * splashMonsters.length)];
    if (target.x > 80 && target.x < LW - 80 && !target.dead) {
      const kind = TORDER[Math.floor(Math.random() * TORDER.length)];
      const st = { x: target.x + (Math.random() - 0.5) * 140, y: target.yBase + 80, kind, angle: 0, level: 1, flashTimer: 0.2, life: 1.2 };
      splashTowers.push(st);
      const dx=target.x-st.x, dy=target.yBase-st.y, dist=Math.hypot(dx,dy)||1, spd=420;
      bullets.push({x:st.x,y:st.y,tx:target.x,ty:target.yBase,vx:(dx/dist)*spd,vy:(dy/dist)*spd,color:'#ffe066',r:3,life:1,trail:[],kind});
      if (kind === 'bomb') SFX.bombFire(); else SFX.gunFire();
      setTimeout(() => { if (!target.dead) { target.dead = true; spawnParticles(target.x, target.yBase, 12, { spd: 70, color: target.baseColor }); SFX.monsterDie(); } }, 350);
    }
  }
  for (let i = splashMonsters.length - 1; i >= 0; i--) {
    const sm = splashMonsters[i];
    sm.x += sm.speed * dt; sm.drawX = sm.x; sm.drawY = sm.yBase + Math.sin(now * 3 + sm.phase) * 4;
    if (sm.x > LW + 100 || sm.dead) splashMonsters.splice(i, 1);
    else { X.save(); X.globalAlpha = 0.28; drawMonster(sm, now); X.restore(); }
  }
  for (let i = splashTowers.length - 1; i >= 0; i--) {
    const st = splashTowers[i]; st.life -= dt;
    if (st.life <= 0) splashTowers.splice(i, 1);
    else {
      X.save(); X.globalAlpha = st.life * 0.3;
      const cx = st.x, cy = st.y - 12;
      const bs = 20;
      switch(st.kind){
        case 'gun':    drawGunTower(X,cx,cy,bs,st,now,1); break;
        case 'flame':  drawFlameTower(X,cx,cy,bs,st,now,1); break;
        case 'bomb':   drawBombTower(X,cx,cy,bs,st,now,1); break;
        case 'freeze': drawFreezeTower(X,cx,cy,bs,st,now,1); break;
        case 'trigun': drawTrigunTower(X,cx,cy,bs,st,now,1); break;
      }
      X.restore();
    }
  }
  drawParticles();
  drawBullets();

  const titleFont=isPortrait?'bold 40px monospace':'bold 72px monospace';
  const titleY=isPortrait?110:160;
  X.textAlign='center';
  for(const [spread,alpha] of [[18,0.08],[10,0.2],[5,0.5]]){
    X.shadowColor='#4080ff'; X.shadowBlur=spread;
    X.globalAlpha=alpha;
    X.fillStyle='#4080ff'; X.font=titleFont;
    X.fillText('TOWER DEFENSE', LW/2, titleY);
  }
  X.shadowBlur=0; X.globalAlpha=1;
  X.fillStyle='#fff'; X.font=titleFont;
  X.fillText('TOWER DEFENSE', LW/2, titleY);

  X.fillStyle='rgba(180,210,255,0.9)'; X.font=isPortrait?'14px Segoe UI':'20px Segoe UI';
  X.fillText('Defend the Galaxy from the Alien Invasion.', LW/2, titleY+34);

  const blink=0.55+0.45*Math.sin(now*3.5);
  X.globalAlpha=blink;
  X.fillStyle='#8cf'; X.font=isPortrait?'bold 18px monospace':'bold 22px monospace'; X.textAlign='center';
  X.fillText('TAP  TO  START', LW/2, LH-50);
  X.globalAlpha=1;

  X.fillStyle='rgba(80,100,140,0.7)'; X.font='11px Segoe UI'; X.textAlign='center';
  if(isPortrait){
    X.fillText('Tap grid · select tower · P pause', LW/2, LH-28);
  } else {
    X.fillText('1-5 select  ·  click grid to place  ·  U upgrade  ·  P pause  ·  Space start', LW/2, LH-34);
  }

  // ── Leaderboard ───────────────────────────────────────────────────────
  const scores=getTopScores();
  if(scores.length>0){
    const maxVisible=6, rowH=21, headerH=30;
    const boxW=isPortrait?360:320;
    const bx=LW/2-boxW/2;
    const listRows=Math.min(scores.length,maxVisible);
    const listH=listRows*rowH;
    const boxH=headerH+listH+8;
    const lbTop=titleY+52;
    roundRect(X,bx,lbTop,boxW,boxH,8);
    X.fillStyle='rgba(4,10,24,0.78)'; X.fill();
    X.strokeStyle='rgba(50,90,170,0.3)'; X.lineWidth=1; X.stroke();

    X.fillStyle='#5a9de0'; X.font='bold 11px monospace'; X.textAlign='center';
    X.fillText('── TOP SCORES ──', LW/2, lbTop+18);

    const listTop=lbTop+headerH;
    const totalH=scores.length*rowH;
    const needsScroll=scores.length>maxVisible;

    X.save();
    X.beginPath(); X.rect(bx+4,listTop,boxW-8,listH); X.clip();

    const scrollY=needsScroll?(now*18)%totalH:0;
    const rankCols=['#ffe066','#c8c8d8','#cd9060'];
    for(let pass=0;pass<(needsScroll?2:1);pass++){
      for(let i=0;i<scores.length;i++){
        const s=scores[i];
        const y=listTop+i*rowH-scrollY+pass*totalH+rowH*0.76;
        if(y<listTop-rowH||y>listTop+listH+rowH) continue;
        const col=i<3?rankCols[i]:'#6a7a8a';
        X.fillStyle=col; X.font=(i<3?'bold ':'')+`11px monospace`;
        X.textAlign='left';  X.fillText(`#${i+1}`,bx+8,y);
        X.fillText((s.name||'Commander').slice(0,14),bx+34,y);
        X.textAlign='right'; X.fillText(s.score.toLocaleString(),bx+boxW-32,y);
        X.fillStyle='#3d5068'; X.font='9px monospace';
        X.fillText(`W${s.wave}`,bx+boxW-8,y);
      }
    }
    X.restore();

    if(needsScroll){
      const fg=X.createLinearGradient(0,listTop,0,listTop+14);
      fg.addColorStop(0,'rgba(4,10,24,0.85)'); fg.addColorStop(1,'rgba(4,10,24,0)');
      X.fillStyle=fg; X.fillRect(bx+4,listTop,boxW-8,14);
      const bg2=X.createLinearGradient(0,listTop+listH-14,0,listTop+listH);
      bg2.addColorStop(0,'rgba(4,10,24,0)'); bg2.addColorStop(1,'rgba(4,10,24,0.85)');
      X.fillStyle=bg2; X.fillRect(bx+4,listTop+listH-14,boxW-8,14);
    }

    const rb=resetBtnBounds();
    roundRect(X,rb.x,rb.y,rb.w,rb.h,4);
    X.fillStyle='rgba(55,12,12,0.65)'; X.fill();
    X.strokeStyle='rgba(180,60,60,0.3)'; X.lineWidth=1; X.stroke();
    X.fillStyle='#e07070'; X.font='bold 9px monospace'; X.textAlign='center';
    X.fillText('RESET',rb.x+rb.w/2,rb.y+12);
  }

  drawMuteBtn();
}

// ── Map select screen ─────────────────────────────────────────────────
function drawMapSelect(now){
  initSplashStars();
  X.fillStyle='#060810'; X.fillRect(0,0,LW,LH);
  for(const s of splashStars){
    X.fillStyle=`rgba(${s.b},${s.b},255,0.5)`;
    X.beginPath(); X.arc(s.x,s.y,s.s,0,Math.PI*2); X.fill();
  }
  X.fillStyle='#acd'; X.font='bold 36px monospace'; X.textAlign='center';
  X.fillText('SELECT MAP', LW/2, 80);
  X.fillStyle='#567'; X.font='14px Segoe UI';
  X.fillText('Click a map or press 1/2', LW/2, 110);

  MAPS.forEach((m,i)=>{
    const bx=isPortrait?LW/2:LW/2+(i-1)*320;
    const by=isPortrait?130+i*230:220;
    const bw=isPortrait?420:280, bh=isPortrait?200:320;
    const hover=mapSelectHover===i;
    roundRect(X,bx-bw/2,by,bw,bh,12);
    X.fillStyle=hover?'rgba(20,50,90,0.9)':'rgba(12,25,50,0.8)'; X.fill();
    X.strokeStyle=hover?'#4af':'rgba(40,80,160,0.5)'; X.lineWidth=hover?2:1; X.stroke();

    const ms=18, mx=bx-bw/2+20, my=by+20;
    const pathS=new Set(m.path.map(([c,r])=>r*COLS+c));
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
      const ip=pathS.has(r*COLS+c);
      X.fillStyle=ip?'#2a2215':'#1a2a3a';
      X.fillRect(mx+c*ms,my+r*ms,ms-1,ms-1);
    }
    X.strokeStyle='rgba(255,180,0,0.6)'; X.lineWidth=2;
    X.beginPath();
    m.path.forEach(([c,r],i)=>{
      const px2=mx+c*ms+ms/2, py2=my+r*ms+ms/2;
      i===0?X.moveTo(px2,py2):X.lineTo(px2,py2);
    });
    X.stroke();
    const [ec2,er2]=m.path[0],[xc2,xr2]=m.path[m.path.length-1];
    X.fillStyle='#4f8'; X.beginPath(); X.arc(mx+ec2*ms+ms/2,my+er2*ms+ms/2,5,0,Math.PI*2); X.fill();
    X.fillStyle='#f44'; X.beginPath(); X.arc(mx+xc2*ms+ms/2,my+xr2*ms+ms/2,5,0,Math.PI*2); X.fill();

    X.fillStyle='#cde'; X.font='bold 18px monospace'; X.textAlign='center';
    X.fillText(m.name, bx, by+ROWS*ms+50);
    X.fillStyle='#789'; X.font='13px Segoe UI';
    X.fillText(m.desc, bx, by+ROWS*ms+70);
    X.fillStyle='#4af'; X.font='bold 14px monospace';
    X.fillText(`Press ${i+1}`, bx, by+ROWS*ms+92);
  });
}
