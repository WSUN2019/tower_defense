'use strict';
// ── Tower definitions ─────────────────────────────────────────────────
const TDEFS = {
  gun:    {name:'Gun',     key:'1',cost:5,  dmg:4,  rad:2.0,cd:0.22,multi:1, color:'#4af',  aoe:0, desc:'Fast single shot'},
  flame:  {name:'Flame',   key:'2',cost:10, dmg:10, rad:2.0,cd:1.1, multi:1, color:'#f84',  aoe:0, dot:1, desc:'Burns over time'},
  bomb:   {name:'Bomb',    key:'3',cost:20, dmg:35, rad:3.0,cd:3.8, multi:1, color:'#a66',  aoe:1, aoeR:48, desc:'Area explosion'},
  freeze: {name:'Freeze',  key:'4',cost:18, dmg:2,  rad:2.0,cd:1.9, multi:1, color:'#8ef',  aoe:0, slow:1, desc:'Slows enemies'},
  trigun: {name:'Tri-Gun', key:'5',cost:30, dmg:3,  rad:2.0,cd:0.28,multi:3, color:'#c8f',  aoe:0, desc:'Triple shot'},
};
const TORDER = ['gun','flame','bomb','freeze','trigun'];

// ── Tower drawing (3D style) ──────────────────────────────────────────
function drawTower3D(t, now){
  let [cx,cy]=cellCenter(t.col,t.row);
  cy -= 12;
  const td=TDEFS[t.kind];
  const lvl=t.level||1;
  const bs=20+lvl*2;

  X.save();

  X.globalAlpha=0.3;
  X.fillStyle='#000';
  X.beginPath(); X.ellipse(cx+4,cy+6,bs+4,bs/2,0,0,Math.PI*2); X.fill();
  X.globalAlpha=1;

  switch(t.kind){
    case 'gun':    drawGunTower(X,cx,cy,bs,t,now,lvl); break;
    case 'flame':  drawFlameTower(X,cx,cy,bs,t,now,lvl); break;
    case 'bomb':   drawBombTower(X,cx,cy,bs,t,now,lvl); break;
    case 'freeze': drawFreezeTower(X,cx,cy,bs,t,now,lvl); break;
    case 'trigun': drawTrigunTower(X,cx,cy,bs,t,now,lvl); break;
  }

  if(t.showRange){
    const rr=TDEFS[t.kind].rad*CS;
    X.strokeStyle='rgba(255,255,255,0.15)'; X.lineWidth=1.5;
    X.setLineDash([4,4]);
    X.beginPath(); X.arc(cx,cy,rr,0,Math.PI*2); X.stroke();
    X.setLineDash([]);
  }

  if(lvl>1){
    for(let i=0;i<lvl-1;i++){
      const px2=cx-6+i*6, py2=cy+bs-2;
      X.fillStyle='#ffe066'; X.beginPath(); X.arc(px2,py2,2.5,0,Math.PI*2); X.fill();
    }
  }

  X.restore();
}

function drawGunTower(ctx,cx,cy,bs,t,now,lvl,rotOff=0){
  ctx.save(); ctx.translate(cx,cy);
  // Scanning arc
  const scanA=(now||0)*1.4;
  ctx.globalAlpha=0.22;
  ctx.strokeStyle='#4af'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(0,0,bs*1.15,scanA,scanA+Math.PI*0.55); ctx.stroke();
  ctx.globalAlpha=1;
  // Hex base
  ctx.beginPath();
  for(let i=0;i<6;i++){
    const a=Math.PI/6+i*Math.PI/3;
    i===0?ctx.moveTo(Math.cos(a)*bs,Math.sin(a)*bs):ctx.lineTo(Math.cos(a)*bs,Math.sin(a)*bs);
  }
  ctx.closePath();
  const bg=ctx.createRadialGradient(0,-bs/3,0,0,0,bs);
  bg.addColorStop(0,'#2a5a7a'); bg.addColorStop(1,'#0e2535');
  ctx.fillStyle=bg; ctx.fill();
  ctx.strokeStyle='#4af'; ctx.lineWidth=1.5; ctx.stroke();
  // Inner ring
  ctx.strokeStyle='rgba(70,160,255,0.28)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(0,0,bs*0.74,0,Math.PI*2); ctx.stroke();
  // Hub
  ctx.fillStyle='#1c4060'; ctx.beginPath(); ctx.arc(0,0,bs*0.46,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#3af'; ctx.lineWidth=1.2; ctx.stroke();
  // Barrel
  ctx.save(); ctx.rotate((t.angle||0)+rotOff);
  ctx.fillStyle='#1a3a50'; ctx.fillRect(-bs*0.04,-bs*0.07,bs*0.82,bs*0.14);
  ctx.fillStyle='#5ac'; ctx.fillRect(0,-bs*0.12,bs*0.82,bs*0.24);
  ctx.fillStyle='rgba(255,255,255,0.18)'; ctx.fillRect(2,-bs*0.06,bs*0.72,bs*0.06);
  ctx.fillStyle='#8df'; ctx.fillRect(bs*0.72,-bs*0.1,bs*0.22,bs*0.2);
  // Banding on barrel
  ctx.fillStyle='rgba(0,0,0,0.22)';
  [bs*0.22,bs*0.44,bs*0.64].forEach(bx=>ctx.fillRect(bx-1,-bs*0.12,2,bs*0.24));
  // Muzzle glow
  ctx.globalAlpha=0.5; ctx.fillStyle='rgba(80,210,255,0.5)';
  ctx.beginPath(); ctx.arc(bs*0.94,0,bs*0.1,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  ctx.restore();
  // Center gem
  ctx.fillStyle='#ffe'; ctx.beginPath(); ctx.arc(0,0,3,0,Math.PI*2); ctx.fill();
  if(t.flashTimer>0){
    ctx.globalAlpha=t.flashTimer*0.8; ctx.fillStyle='#4af';
    ctx.beginPath(); ctx.arc(0,0,bs*0.85,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  }
  ctx.restore();
}

function drawFlameTower(ctx,cx,cy,bs,t,now,lvl,rotOff=0){
  ctx.save(); ctx.translate(cx,cy);
  // Base ellipse
  ctx.beginPath(); ctx.ellipse(0,4,bs,bs*0.4,0,0,Math.PI*2);
  ctx.fillStyle='#301008'; ctx.fill(); ctx.strokeStyle='#f63'; ctx.lineWidth=1.5; ctx.stroke();
  // Body
  ctx.fillStyle='#5a1808'; ctx.fillRect(-bs*0.5,-bs,bs,bs);
  ctx.strokeStyle='#f84'; ctx.lineWidth=1; ctx.strokeRect(-bs*0.5,-bs,bs,bs);
  // Rivets
  ctx.fillStyle='#8a2010';
  [[-bs*0.36,-bs*0.82],[bs*0.36,-bs*0.82],[-bs*0.36,-bs*0.22],[bs*0.36,-bs*0.22]].forEach(([rx,ry])=>{
    ctx.beginPath(); ctx.arc(rx,ry,bs*0.065,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=0.5; ctx.stroke();
  });
  // Heat grate slots
  ctx.fillStyle='rgba(0,0,0,0.35)';
  for(let g=0;g<3;g++) ctx.fillRect(-bs*0.38+g*bs*0.26,-bs*0.55,bs*0.16,bs*0.08);
  // Barrel
  ctx.save(); ctx.rotate((t.angle||0)+rotOff);
  ctx.fillStyle='#8a3010'; ctx.fillRect(0,-bs*0.18,bs*0.72,bs*0.36);
  ctx.strokeStyle='#c53'; ctx.lineWidth=1; ctx.strokeRect(0,-bs*0.18,bs*0.72,bs*0.36);
  ctx.fillStyle='rgba(0,0,0,0.25)';
  [bs*0.2,bs*0.42,bs*0.62].forEach(bx=>ctx.fillRect(bx-1,-bs*0.18,2,bs*0.36));
  // Always-on idle flame at nozzle
  const fn=now||0;
  for(let f=0;f<4;f++){
    const fp=f/4;
    ctx.globalAlpha=(0.72-fp*0.45)*(0.55+0.45*Math.sin(fn*13+f*2.2));
    ctx.fillStyle=fp<0.25?'#fff8b0':fp<0.55?'#ff9900':'#cc3300';
    ctx.beginPath(); ctx.arc(
      bs*0.72+fp*bs*0.22+Math.sin(fn*9+f)*bs*0.04,
      Math.sin(fn*7+f*1.8)*bs*0.07,
      bs*(0.13-fp*0.055), 0, Math.PI*2
    ); ctx.fill();
  }
  ctx.globalAlpha=1;
  ctx.restore();
  if(t.flashTimer>0){
    for(let i=0;i<7;i++){
      const fa=(t.angle+rotOff)+(Math.random()-0.5)*0.65;
      const fd=bs*0.85+Math.random()*bs*0.55;
      ctx.globalAlpha=t.flashTimer*(0.55+Math.random()*0.45);
      ctx.fillStyle=Math.random()<0.35?'#fff8a0':'#ff6a00';
      ctx.beginPath(); ctx.arc(Math.cos(fa)*fd,Math.sin(fa)*fd,3+Math.random()*10,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  }
  ctx.restore();
}

function drawBombTower(ctx,cx,cy,bs,t,now,lvl,rotOff=0){
  ctx.save(); ctx.translate(cx,cy);
  // Main body
  roundRect(ctx,-bs*0.72,-bs*0.62,bs*1.44,bs*1.24,5);
  ctx.fillStyle='#2a1518'; ctx.fill();
  ctx.strokeStyle='#a44'; ctx.lineWidth=1.5; ctx.stroke();
  // Hazard stripes
  ctx.save();
  roundRect(ctx,-bs*0.72,-bs*0.62,bs*1.44,bs*1.24,5); ctx.clip();
  ctx.globalAlpha=0.18; ctx.fillStyle='#ff3300';
  for(let s=-3;s<5;s++) ctx.fillRect(-bs*0.72+s*bs*0.46,-bs*0.62,bs*0.22,bs*1.24);
  ctx.globalAlpha=1; ctx.restore();
  // Vent windows
  ctx.fillStyle='#110';
  for(let i=0;i<3;i++){
    ctx.fillRect(-bs*0.62+i*bs*0.43,-bs*0.62,bs*0.2,bs*0.22);
    ctx.strokeStyle='rgba(160,0,0,0.45)'; ctx.lineWidth=0.5;
    ctx.strokeRect(-bs*0.62+i*bs*0.43,-bs*0.62,bs*0.2,bs*0.22);
  }
  // Barrel
  ctx.save(); ctx.rotate((t.angle||(-Math.PI/3))+rotOff);
  ctx.fillStyle='#7a3a20'; ctx.fillRect(-4,-bs*0.22,bs*0.68,bs*0.44);
  ctx.fillStyle='#9a4a30'; ctx.fillRect(-4,-bs*0.22,bs*0.68,bs*0.14);
  ctx.fillStyle='rgba(0,0,0,0.35)';
  [bs*0.14,bs*0.34,bs*0.52].forEach(bx=>ctx.fillRect(bx-1,-bs*0.22,2,bs*0.44));
  // Bomb tip
  ctx.fillStyle='#1a0a0a'; ctx.beginPath(); ctx.arc(bs*0.64,0,bs*0.16,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#f44'; ctx.lineWidth=1.2; ctx.stroke();
  ctx.fillStyle='rgba(255,100,0,0.35)'; ctx.beginPath(); ctx.arc(bs*0.64,0,bs*0.26,0,Math.PI*2); ctx.fill();
  ctx.restore();
  if(t.flashTimer>0){
    ctx.globalAlpha=t.flashTimer*0.65; ctx.fillStyle='#f84';
    ctx.beginPath(); ctx.arc(0,0,bs*1.58,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  }
  ctx.restore();
}

function drawFreezeTower(ctx,cx,cy,bs,t,now,lvl,rotOff=0){
  ctx.save(); ctx.translate(cx,cy);
  // Orbiting ice shards
  for(let i=0;i<6;i++){
    const oa=((now||0)*0.88)+i*Math.PI/3;
    const ox=Math.cos(oa)*bs*1.22, oy=Math.sin(oa)*bs*0.72;
    ctx.save(); ctx.translate(ox,oy); ctx.rotate(oa+Math.PI/4);
    ctx.fillStyle='rgba(168,242,255,0.65)';
    ctx.fillRect(-bs*0.07,-bs*0.22,bs*0.14,bs*0.44); ctx.restore();
  }
  // 12-point crystal star
  const spikes=[];
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2-Math.PI/6;
    spikes.push([Math.cos(a)*(i%2===0?bs:bs*0.5), Math.sin(a)*(i%2===0?bs:bs*0.5)]);
  }
  ctx.beginPath(); ctx.moveTo(...spikes[0]);
  spikes.slice(1).forEach(p=>ctx.lineTo(...p)); ctx.closePath();
  const cg=ctx.createRadialGradient(0,-bs*0.3,0,0,0,bs);
  cg.addColorStop(0,'#d8f6ff'); cg.addColorStop(0.38,'#50c0e8'); cg.addColorStop(1,'#0e3d58');
  ctx.fillStyle=cg; ctx.fill();
  ctx.strokeStyle='#aef'; ctx.lineWidth=2; ctx.stroke();
  // Inner crystal layers
  ctx.fillStyle='rgba(195,245,255,0.52)'; ctx.beginPath(); ctx.arc(0,0,bs*0.44,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(235,252,255,0.88)'; ctx.beginPath(); ctx.arc(0,0,bs*0.22,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,0,bs*0.1,0,Math.PI*2); ctx.fill();
  // Rotating cross rays
  ctx.save(); ctx.rotate(((now||0)*0.8)+rotOff);
  ctx.strokeStyle='rgba(190,245,255,0.72)'; ctx.lineWidth=2;
  for(let i=0;i<4;i++){
    ctx.rotate(Math.PI/2);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(bs*0.82,0); ctx.stroke();
  }
  ctx.restore();
  if(t.flashTimer>0){
    ctx.globalAlpha=t.flashTimer*0.55; ctx.fillStyle='#8ef';
    ctx.beginPath(); ctx.arc(0,0,bs*1.25,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  }
  ctx.restore();
}

function drawTrigunTower(ctx,cx,cy,bs,t,now,lvl,rotOff=0){
  ctx.save(); ctx.translate(cx,cy);
  // Triangle base
  ctx.beginPath();
  for(let i=0;i<3;i++){
    const a=-Math.PI/2+i*Math.PI*2/3;
    i===0?ctx.moveTo(Math.cos(a)*bs,Math.sin(a)*bs):ctx.lineTo(Math.cos(a)*bs,Math.sin(a)*bs);
  }
  ctx.closePath();
  const tg=ctx.createRadialGradient(0,-bs/2,0,0,0,bs);
  tg.addColorStop(0,'#5a2878'); tg.addColorStop(0.5,'#2a1050'); tg.addColorStop(1,'#120828');
  ctx.fillStyle=tg; ctx.fill(); ctx.strokeStyle='#c8f'; ctx.lineWidth=2; ctx.stroke();
  // Edge inner frame lines
  ctx.strokeStyle='rgba(200,150,255,0.28)'; ctx.lineWidth=1;
  for(let i=0;i<3;i++){
    const a=-Math.PI/2+i*Math.PI*2/3, b=-Math.PI/2+(i+1)*Math.PI*2/3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a)*bs*0.68,Math.sin(a)*bs*0.68);
    ctx.lineTo(Math.cos(b)*bs*0.68,Math.sin(b)*bs*0.68);
    ctx.stroke();
  }
  // Spinning inner energy triangle
  ctx.save(); ctx.rotate(((now||0)*2.2)+rotOff);
  ctx.strokeStyle='rgba(210,160,255,0.55)'; ctx.lineWidth=1.5;
  ctx.beginPath();
  for(let i=0;i<3;i++){
    const a=-Math.PI/2+i*Math.PI*2/3;
    i===0?ctx.moveTo(Math.cos(a)*bs*0.4,Math.sin(a)*bs*0.4):ctx.lineTo(Math.cos(a)*bs*0.4,Math.sin(a)*bs*0.4);
  }
  ctx.closePath(); ctx.stroke(); ctx.restore();
  // 3 Barrels
  for(let i=0;i<3;i++){
    ctx.save(); ctx.rotate((t.angle||0)+rotOff+i*Math.PI*2/3);
    ctx.fillStyle='rgba(55,18,75,0.82)'; ctx.fillRect(bs*0.1,-bs*0.1,bs*0.74,bs*0.2);
    ctx.fillStyle='#9a6cc0'; ctx.fillRect(bs*0.14,-bs*0.08,bs*0.66,bs*0.16);
    ctx.fillStyle='rgba(0,0,0,0.28)';
    [bs*0.25,bs*0.48,bs*0.66].forEach(bx=>ctx.fillRect(bx-1,-bs*0.08,2,bs*0.16));
    ctx.fillStyle='#c8f'; ctx.fillRect(bs*0.76,-bs*0.065,bs*0.18,bs*0.13);
    ctx.globalAlpha=0.52; ctx.fillStyle='rgba(210,160,255,0.65)';
    ctx.beginPath(); ctx.arc(bs*0.94,0,bs*0.09,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
    ctx.restore();
  }
  // Center orb
  ctx.fillStyle='#e0c0ff'; ctx.beginPath(); ctx.arc(0,0,bs*0.21,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.82)'; ctx.beginPath(); ctx.arc(-bs*0.055,-bs*0.065,bs*0.075,0,Math.PI*2); ctx.fill();
  if(t.flashTimer>0){
    ctx.globalAlpha=t.flashTimer*0.62; ctx.fillStyle='#c8f';
    ctx.beginPath(); ctx.arc(0,0,bs*1.0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  }
  ctx.restore();
}

// ── Tower class ───────────────────────────────────────────────────────
class Tower {
  constructor(col,row,kind){
    this.col=col; this.row=row; this.kind=kind;
    this.level=1; this.angle=0; this.cooldown=0; this.flashTimer=0;
    this.showRange=false;
  }
  update(dt, monsters, now){
    this.flashTimer=Math.max(0,this.flashTimer-dt);
    const td=TDEFS[this.kind];
    this.cooldown-=dt;
    if(this.cooldown>0) return;

    const lx = GX + this.col * CS + CS / 2;
    const ly = GY + this.row * CS + CS / 2;
    const rng=td.rad*CS;
    const inRange=monsters.filter(m=>!m.dead&&!m.reached&&Math.hypot(m.x-lx,m.y-ly)<=rng);
    if(!inRange.length) return;

    inRange.sort((a,b)=>b.pathIdx-a.pathIdx);
    const targets=inRange.slice(0,td.multi);
    this.angle=Math.atan2(targets[0].y-ly,targets[0].x-lx);
    this.cooldown=td.cd/(0.8+this.level*0.2);
    this.flashTimer=0.15;

    for(const m of targets){
      if(td.aoe){
        const aoeR=td.aoeR;
        spawnParticles(m.x,m.y,18,{spd:90,life:0.6,r:6,color:'#fa4',gravity:30});
        spawnParticles(m.x,m.y,8,{spd:40,life:0.8,r:10,color:'#f80',gravity:10});
        spawnParticles(m.x,m.y,10,{spd:60,life:0.4,r:3,color:'#fff',gravity:50});
        SFX.bombFire();
        monsters.forEach(em=>{
          if(!em.dead&&!em.reached&&Math.hypot(em.x-m.x,em.y-m.y)<=aoeR)
            em.hp-=td.dmg*(1+this.level*0.4);
        });
        spawnBullet(lx,ly,m.x,m.y,{color:'#f80',r:5,spd:300,kind:'bomb'});
      } else {
        m.hp -= td.dmg*(1+this.level*0.4);
        if(td.slow) { m.slow=m.slowMax; }
        if(td.dot)  { m.dot=td.dmg*0.3; m.dotTimer=0.5; }
        const bcolor={'gun':'#ffe066','flame':'#ff8040','freeze':'#80e8ff','trigun':'#e0a0ff'}[this.kind]||'#ffe066';
        spawnBullet(lx,ly,m.x,m.y,{color:bcolor,r:this.kind==='trigun'?2.5:3,kind:this.kind});
        if(this.kind==='flame') SFX.flameFire();
        else if(this.kind==='freeze') SFX.freezeFire();
        else SFX.gunFire();
      }
    }
  }
}
