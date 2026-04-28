'use strict';
// ── Utility drawing helpers ───────────────────────────────────────────
function hsl(h,s,l,a=1){return `hsla(${h},${s}%,${l}%,${a})`}
function roundRect(ctx,x,y,w,h,r){
  r = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);  ctx.quadraticCurveTo(x+w, y,   x+w, y+r);
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);   ctx.quadraticCurveTo(x,   y+h, x,   y+h-r);
  ctx.lineTo(x,   y+r);   ctx.quadraticCurveTo(x,   y,   x+r, y);
  ctx.closePath();
}

// ── Color helpers (memoized) ──────────────────────────────────────────
const _shadeCache = {};
function shadeColor(col, pct){
  const key = col + pct;
  if(_shadeCache[key]) return _shadeCache[key];
  if(col.length===4) col='#'+col[1]+col[1]+col[2]+col[2]+col[3]+col[3];
  let r2=parseInt(col.slice(1,3),16)||0, g2=parseInt(col.slice(3,5),16)||0, b2=parseInt(col.slice(5,7),16)||0;
  r2=Math.max(0,Math.min(255,r2+pct)); g2=Math.max(0,Math.min(255,g2+pct)); b2=Math.max(0,Math.min(255,b2+pct));
  return (_shadeCache[key]='#'+[r2,g2,b2].map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''));
}
function lightenColor(col,pct){return shadeColor(col,pct);}

// ── View mode ─────────────────────────────────────────────────────────
let flatView = false;

// ── Isometric projection helpers ──────────────────────────────────────
function toIso(lx, ly) {
  if(flatView) return [lx, ly];
  const c = (lx - GX) / CS;
  const r = (ly - GY) / CS;
  const centerX = isPortrait ? LW / 2 : GX + (COLS * CS) / 2;
  const centerY = GY + (ROWS * CS) / 4;
  const x = centerX + (c - r) * (CS * 0.5);
  const y = centerY + (c + r) * (CS * 0.25);
  return [x, y];
}

function cellCenter(col, row) {
  if(flatView) return [GX + col*CS + CS/2, GY + row*CS + CS/2];
  return toIso(GX + col * CS + CS / 2, GY + row * CS + CS / 2);
}

function worldToGrid(wx, wy){
  if(flatView) return [Math.floor((wx-GX)/CS), Math.floor((wy-GY)/CS)];
  const centerX = isPortrait ? LW / 2 : GX + (COLS * CS) / 2;
  const centerY = GY + (ROWS * CS) / 4;
  const dx = wx - centerX;
  const dy = wy - centerY;
  const c = (dy / (CS * 0.25) + dx / (CS * 0.5)) / 2;
  const r = (dy / (CS * 0.25) - dx / (CS * 0.5)) / 2;
  return [Math.floor(c), Math.floor(r)];
}

function lerp(a,b,t){return a+(b-a)*t;}

// ── Particle system ───────────────────────────────────────────────────
const particles=[];
function spawnParticles(x,y,n,opts={}) {
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2, spd=(opts.spd||60)*(0.5+Math.random());
    const [ix, iy] = toIso(x, y);
    particles.push({
      x:ix, y:iy, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd - (opts.up||0),
      life:1, maxLife:(opts.life||0.6)*(0.7+Math.random()*0.6),
      r:(opts.r||4)*(0.5+Math.random()), color:opts.color||'#fa4',
      gravity:opts.gravity||60, fade:opts.fade||1,
    });
  }
}
function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=p.gravity*dt;
    p.life-=dt/p.maxLife;
    if(p.life<=0) particles.splice(i,1);
  }
}
function drawParticles(){
  for(const p of particles){
    X.globalAlpha=Math.max(0,p.life)*p.fade;
    X.fillStyle=p.color;
    X.beginPath(); X.arc(p.x,p.y,p.r*p.life+0.5,0,Math.PI*2); X.fill();
  }
  X.globalAlpha=1;
}

// ── Bullet/effect system ──────────────────────────────────────────────
const bullets=[];
function spawnBullet(x,y,tx,ty,opts={}){
  const [sx, sy] = toIso(x, y);
  const [ex, ey] = toIso(tx, ty);
  const dx=ex-sx, dy=ey-sy, dist=Math.hypot(dx,dy)||1;
  const spd=opts.spd||420;
  bullets.push({x:sx, y:sy, tx:ex, ty:ey, vx:(dx/dist)*spd, vy:(dy/dist)*spd,
    color:opts.color||'#ffe066',r:opts.r||3,life:1,
    trail:[], kind:opts.kind||'bullet'});
}
function updateBullets(dt){
  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i];
    b.trail.unshift({x:b.x,y:b.y});
    if(b.trail.length>8) b.trail.pop();
    b.x+=b.vx*dt; b.y+=b.vy*dt;
    const dist=Math.hypot(b.tx-b.x,b.ty-b.y);
    if(dist<6||b.life<0) bullets.splice(i,1);
  }
}
function drawBullets(){
  for(const b of bullets){
    for(let i=0;i<b.trail.length;i++){
      const a=(1-i/b.trail.length)*0.5;
      X.globalAlpha=a; X.fillStyle=b.color;
      X.beginPath(); X.arc(b.trail[i].x,b.trail[i].y,(b.r*(1-i/b.trail.length))||0.5,0,Math.PI*2); X.fill();
    }
    X.globalAlpha=1; X.fillStyle=b.color;
    X.beginPath(); X.arc(b.x,b.y,b.r,0,Math.PI*2); X.fill();
    X.globalAlpha=0.3;
    X.fillStyle=b.color;
    X.beginPath(); X.arc(b.x,b.y,b.r*2.5,0,Math.PI*2); X.fill();
    X.globalAlpha=1;
  }
}

// ── Tile drawing ──────────────────────────────────────────────────────
function drawTile(col,row,isPath,isEntry,isExit,hover,selected,ctx=X){
  if(flatView){
    const tx=GX+col*CS, ty=GY+row*CS;
    const hov=hover&&hover[0]===col&&hover[1]===row;
    const sel=selected&&selected[0]===col&&selected[1]===row;
    ctx.fillStyle=isPath?'#221c0f':sel?'#1e3028':hov?'#1f3050':'#192330';
    ctx.fillRect(tx,ty,CS-1,CS-1);
    ctx.strokeStyle=isPath?'rgba(0,0,0,0.3)':'rgba(100,180,255,0.1)';
    ctx.lineWidth=1; ctx.strokeRect(tx,ty,CS-1,CS-1);
    if(isEntry||isExit){
      const mc=isEntry?'#4f8':'#f44';
      ctx.fillStyle=mc+'44'; ctx.fillRect(tx,ty,CS-1,CS-1);
      ctx.strokeStyle=mc; ctx.lineWidth=2; ctx.strokeRect(tx,ty,CS-1,CS-1);
      ctx.fillStyle=mc; ctx.font='bold 11px monospace'; ctx.textAlign='center';
      ctx.fillText(isEntry?'IN':'OUT',tx+CS/2,ty+CS/2+4);
    }
    return;
  }
  const [cx, cy] = cellCenter(col, row);
  const hw = CS * 0.5;
  const hh = CS * 0.25;
  const h = isPath ? 4 : 12;
  const hoverShift = (hover && hover[0] === col && hover[1] === row) ? 2 : 0;
  const sel = selected && selected[0] === col && selected[1] === row;

  const topY = cy - h - hoverShift;
  const top = [[cx, topY - hh], [cx + hw, topY], [cx, topY + hh], [cx - hw, topY]];
  const bot = [[cx, cy - hh], [cx + hw, cy], [cx, cy + hh], [cx - hw, cy]];

  ctx.beginPath();
  ctx.moveTo(top[1][0], top[1][1]);
  ctx.lineTo(top[2][0], top[2][1]);
  ctx.lineTo(top[3][0], top[3][1]);
  ctx.lineTo(bot[3][0], bot[3][1]);
  ctx.lineTo(bot[2][0], bot[2][1]);
  ctx.lineTo(bot[1][0], bot[1][1]);
  ctx.closePath();
  ctx.fillStyle = isPath ? '#1a150e' : (sel ? '#0a1d13' : '#0a141e');
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.moveTo(top[2][0], top[2][1]); ctx.lineTo(top[3][0], top[3][1]); ctx.lineTo(bot[3][0], bot[3][1]); ctx.lineTo(bot[2][0], bot[2][1]); ctx.fill();

  if(isPath){
    ctx.fillStyle='#221c0f';
  } else {
    ctx.fillStyle = sel?'#1e3028': (hoverShift?'#1a2c40':'#192330');
  }

  ctx.beginPath();
  ctx.moveTo(top[0][0], top[0][1]);
  top.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = isPath ? 'rgba(0,0,0,0.3)' : 'rgba(100,180,255,0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  if(isEntry||isExit){
    const col2=isEntry?'#4f8':'#f44';
    ctx.fillStyle=col2+'33';
    ctx.beginPath();
    ctx.moveTo(top[0][0], top[0][1]);
    top.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle=col2; ctx.lineWidth=2;
    ctx.stroke();
    const lbl=isEntry?'IN':'OUT';
    ctx.fillStyle=col2; ctx.font='bold 11px monospace'; ctx.textAlign='center';
    ctx.fillText(lbl,cx,topY+4);
  }
}
