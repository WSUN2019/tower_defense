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
  const sg=X.createRadialGradient(cx+4,cy+6,0,cx+4,cy+6,bs+4);
  sg.addColorStop(0,'#000'); sg.addColorStop(1,'transparent');
  X.fillStyle=sg; X.beginPath(); X.ellipse(cx+4,cy+6,bs+4,bs/2,0,0,Math.PI*2); X.fill();
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

function drawGunTower(ctx,cx,cy,bs,t,now,lvl, rotOff=0){
  ctx.save();
  ctx.translate(cx,cy);
  const c=TDEFS.gun.color;
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

  ctx.fillStyle='#1c4060';
  ctx.beginPath(); ctx.arc(0,0,bs*0.45,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#3af'; ctx.lineWidth=1; ctx.stroke();

  ctx.save(); ctx.rotate(t.angle||0);
  ctx.fillStyle='#5ac';
  ctx.fillRect(0,-4,bs*0.8,8);
  ctx.fillStyle='#8df';
  ctx.fillRect(bs*0.7,-3,bs*0.25,6);
  ctx.fillStyle='rgba(255,255,255,0.2)';
  ctx.fillRect(2,-2,bs*0.7,2);
  ctx.restore();

  ctx.fillStyle='#ffe'; ctx.beginPath(); ctx.arc(0,0,3,0,Math.PI*2); ctx.fill();
  if(t.flashTimer>0){
    ctx.globalAlpha=t.flashTimer*0.8;
    ctx.fillStyle='#4af';
    ctx.beginPath(); ctx.arc(0,0,bs*0.8,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  }
  ctx.restore();
}

function drawFlameTower(ctx,cx,cy,bs,t,now,lvl, rotOff=0){
  ctx.save(); ctx.translate(cx,cy);
  ctx.beginPath(); ctx.ellipse(0,4,bs,bs*0.4,0,0,Math.PI*2);
  ctx.fillStyle='#301008'; ctx.fill(); ctx.strokeStyle='#f63'; ctx.lineWidth=1.5; ctx.stroke();
  const bg=ctx.createLinearGradient(-bs,0,bs,0);
  bg.addColorStop(0,'#2a1008'); bg.addColorStop(0.4,'#6a2010'); bg.addColorStop(1,'#1a0806');
  ctx.fillStyle=bg; ctx.fillRect(-bs*0.5,-bs,bs,bs);
  ctx.strokeStyle='#f84'; ctx.lineWidth=1; ctx.strokeRect(-bs*0.5,-bs,bs,bs);
  ctx.save(); ctx.rotate((t.angle||0) + rotOff);
  ctx.fillStyle='#8a3010';
  ctx.fillRect(0,-4,bs*0.7,8);
  ctx.fillStyle='#f84';
  ctx.beginPath(); ctx.arc(bs*0.7,0,5,0,Math.PI*2); ctx.fill();
  ctx.restore();
  if(t.flashTimer>0){
    for(let i=0;i<6;i++){
      const fa=(t.angle + rotOff)+(Math.random()-0.5)*0.6;
      const fd=bs*0.8+Math.random()*bs*0.5;
      const fx=Math.cos(fa)*fd, fy=Math.sin(fa)*fd;
      const fr=4+Math.random()*8;
      ctx.globalAlpha=t.flashTimer*(0.5+Math.random()*0.5);
      const flg=ctx.createRadialGradient(fx,fy,0,fx,fy,fr);
      flg.addColorStop(0,'#fff8a0'); flg.addColorStop(0.5,'#ff6a00'); flg.addColorStop(1,'transparent');
      ctx.fillStyle=flg; ctx.beginPath(); ctx.arc(fx,fy,fr,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  }
  ctx.restore();
}

function drawBombTower(ctx,cx,cy,bs,t,now,lvl, rotOff=0){
  ctx.save(); ctx.translate(cx,cy);
  const base=ctx.createLinearGradient(0,-bs,0,bs);
  base.addColorStop(0,'#3a2020'); base.addColorStop(1,'#1a0e0e');
  roundRect(ctx,-bs*0.7,-bs*0.6,bs*1.4,bs*1.2,4);
  ctx.fillStyle=base; ctx.fill();
  ctx.strokeStyle='#a44'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle='#1a0e0e';
  for(let i=0;i<3;i++){
    ctx.fillRect(-bs*0.6+i*bs*0.43,-bs*0.6,bs*0.2,bs*0.2);
  }
  ctx.save(); ctx.rotate((t.angle||(-Math.PI/3)) + rotOff);
  ctx.fillStyle='#6a3a20';
  ctx.fillRect(-4,-bs*0.2,bs*0.65,8);
  ctx.fillStyle='#8a4a30';
  ctx.fillRect(-4,-bs*0.2,bs*0.65,3);
  ctx.fillStyle='#110';
  ctx.beginPath(); ctx.arc(bs*0.6,0,5,0,Math.PI*2); ctx.fill();
  ctx.restore();
  if(t.flashTimer>0){
    ctx.globalAlpha=t.flashTimer*0.6;
    const g2=ctx.createRadialGradient(0,0,0,0,0,bs*1.5);
    g2.addColorStop(0,'#f84'); g2.addColorStop(1,'transparent');
    ctx.fillStyle=g2; ctx.beginPath(); ctx.arc(0,0,bs*1.5,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  }
  ctx.restore();
}

function drawFreezeTower(ctx,cx,cy,bs,t,now,lvl, rotOff=0){
  ctx.save(); ctx.translate(cx,cy);
  const pts=6, spikes=[];
  for(let i=0;i<pts;i++){
    const a=i/pts*Math.PI*2-Math.PI/6;
    const r2=(i%2===0)?bs:bs*0.55;
    spikes.push([Math.cos(a)*r2, Math.sin(a)*r2]);
  }
  ctx.beginPath(); ctx.moveTo(...spikes[0]);
  spikes.slice(1).forEach(p=>ctx.lineTo(...p)); ctx.closePath();
  const cg=ctx.createRadialGradient(0,-bs*0.3,0,0,0,bs);
  cg.addColorStop(0,'#b0e8ff'); cg.addColorStop(0.5,'#3090c0'); cg.addColorStop(1,'#104060');
  ctx.fillStyle=cg; ctx.fill();
  ctx.strokeStyle='#8ef'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle='rgba(200,240,255,0.4)';
  ctx.beginPath(); ctx.arc(0,0,bs*0.4,0,Math.PI*2); ctx.fill();
  ctx.save(); ctx.rotate(now*0.8);
  ctx.strokeStyle='rgba(160,230,255,0.6)'; ctx.lineWidth=2;
  for(let i=0;i<4;i++){
    ctx.rotate(Math.PI/2);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(bs*0.8,0); ctx.stroke();
  }
  ctx.restore();
  if(t.flashTimer>0){
    ctx.globalAlpha=t.flashTimer*0.5;
    ctx.fillStyle='#8ef';
    ctx.beginPath(); ctx.arc(0,0,bs*1.2,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  }
  ctx.restore();
}

function drawTrigunTower(ctx,cx,cy,bs,t,now,lvl, rotOff=0){
  ctx.save(); ctx.translate(cx,cy);
  ctx.beginPath();
  for(let i=0;i<3;i++){
    const a=-Math.PI/2+i*Math.PI*2/3;
    i===0?ctx.moveTo(Math.cos(a)*bs,Math.sin(a)*bs):ctx.lineTo(Math.cos(a)*bs,Math.sin(a)*bs);
  }
  ctx.closePath();
  const tg=ctx.createRadialGradient(0,-bs/2,0,0,0,bs);
  tg.addColorStop(0,'#4a2060'); tg.addColorStop(1,'#1a0830');
  ctx.fillStyle=tg; ctx.fill(); ctx.strokeStyle='#c8f'; ctx.lineWidth=1.5; ctx.stroke();
  for(let i=0;i<3;i++){
    ctx.save();
    ctx.rotate((t.angle||0) + rotOff + i*Math.PI*2/3);
    ctx.fillStyle='#9a6cc0';
    ctx.fillRect(2,-3,bs*0.75,6);
    ctx.fillStyle='#c8f';
    ctx.fillRect(bs*0.65,-2,bs*0.22,4);
    ctx.restore();
  }
  ctx.fillStyle='#e0c0ff'; ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fill();
  if(t.flashTimer>0){
    ctx.globalAlpha=t.flashTimer*0.6;
    ctx.fillStyle='#c8f';
    ctx.beginPath(); ctx.arc(0,0,bs*0.9,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
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
