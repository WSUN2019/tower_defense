'use strict';
// ── Monster colors per type ───────────────────────────────────────────
const MCOLORS={normal:'#4a8a30',fast:'#e8c020',tank:'#506088',boss:'#a02020',demo:'#904010',blob:'#8a3ab0'};

// ── Monster drawing ───────────────────────────────────────────────────
function drawMonster(m, now){
  let mx, my_base;
  if(m._rawPos){ mx=m.drawX; my_base=m.drawY; }
  else { [mx,my_base]=toIso(m.drawX,m.drawY); }
  const r=m.radius;
  const bob=Math.sin(now*3+m.id*1.7)*2;
  const bodyY=my_base-4+bob;
  const bc=m.slow>0?'#8df':m.baseColor;
  const hpPct=m.hp/m.maxHp;
  const blink=Math.sin(now*0.4+m.id)*10>9.5;

  X.save();
  X.globalAlpha=0.25; X.fillStyle='rgba(0,0,0,0.6)';
  X.beginPath(); X.ellipse(mx+2,my_base,r*0.9,r*0.35,0,0,Math.PI*2); X.fill();
  X.globalAlpha=1;

  X.save(); X.translate(mx,bodyY);

  switch(m.type){
    case 'fast': {
      X.globalAlpha=0.5; X.fillStyle=lightenColor(bc,25);
      X.beginPath(); X.moveTo(-r*0.2,-r*0.25); X.bezierCurveTo(-r*0.5,-r*0.9,-r*1.2,-r*0.85,-r*1.0,-r*0.35); X.bezierCurveTo(-r*0.7,0,-r*0.35,-r*0.05,-r*0.2,-r*0.25); X.fill();
      X.beginPath(); X.moveTo(-r*0.2,r*0.25); X.bezierCurveTo(-r*0.5,r*0.9,-r*1.2,r*0.85,-r*1.0,r*0.35); X.bezierCurveTo(-r*0.7,0,-r*0.35,r*0.05,-r*0.2,r*0.25); X.fill();
      X.globalAlpha=1;
      const gF=X.createLinearGradient(-r,0,r*1.1,0);
      gF.addColorStop(0,shadeColor(bc,-45)); gF.addColorStop(0.3,lightenColor(bc,40)); gF.addColorStop(0.8,bc); gF.addColorStop(1,shadeColor(bc,-20));
      X.fillStyle=gF;
      X.beginPath(); X.moveTo(r*1.1,0); X.bezierCurveTo(r*0.7,-r*0.55,-r*0.2,-r*0.65,-r*1.0,-r*0.38); X.lineTo(-r*1.0,r*0.38); X.bezierCurveTo(-r*0.2,r*0.65,r*0.7,r*0.55,r*1.1,0); X.fill();
      X.strokeStyle=lightenColor(bc,25); X.lineWidth=1.2; X.stroke();
      X.strokeStyle='rgba(255,255,255,0.35)'; X.lineWidth=1;
      X.beginPath(); X.moveTo(-r*0.1,-r*0.28); X.bezierCurveTo(r*0.3,-r*0.28,r*0.7,-r*0.14,r*1.0,-r*0.04); X.stroke();
      if(!blink){
        X.fillStyle='rgba(0,0,0,0.6)'; X.beginPath(); X.ellipse(r*0.5,0,r*0.32,r*0.14,0,0,Math.PI*2); X.fill();
        X.fillStyle='#ff0'; X.beginPath(); X.ellipse(r*0.5,0,r*0.22,r*0.09,0,0,Math.PI*2); X.fill();
        X.globalAlpha=0.4; X.fillStyle='#ff0'; X.beginPath(); X.ellipse(r*0.5,0,r*0.4,r*0.22,0,0,Math.PI*2); X.fill(); X.globalAlpha=1;
      }
      break;
    }
    case 'tank': {
      X.beginPath();
      for(let i=0;i<6;i++){
        const a=i*Math.PI/3, rx2=r*(i%2===0?1.05:0.88), ry2=r*(i%2===0?0.92:1.05);
        i===0?X.moveTo(Math.cos(a)*rx2,Math.sin(a)*ry2):X.lineTo(Math.cos(a)*rx2,Math.sin(a)*ry2);
      }
      X.closePath();
      const gT=X.createRadialGradient(-r*0.25,-r*0.25,r*0.05,0,0,r*1.1);
      gT.addColorStop(0,lightenColor(bc,40)); gT.addColorStop(0.6,bc); gT.addColorStop(1,shadeColor(bc,-55));
      X.fillStyle=gT; X.fill(); X.strokeStyle=lightenColor(bc,20); X.lineWidth=2; X.stroke();
      X.strokeStyle='rgba(0,0,0,0.25)'; X.lineWidth=1.2;
      X.beginPath(); X.moveTo(-r*0.88,0); X.lineTo(r*0.88,0); X.stroke();
      X.beginPath(); X.moveTo(-r*0.44,-r*0.76); X.lineTo(-r*0.44,r*0.76); X.stroke();
      X.beginPath(); X.moveTo(r*0.44,-r*0.76); X.lineTo(r*0.44,r*0.76); X.stroke();
      X.fillStyle=lightenColor(bc,30);
      [[-r*0.7,-r*0.52],[r*0.7,-r*0.52],[-r*0.7,r*0.52],[r*0.7,r*0.52]].forEach(([bx2,by2])=>{X.beginPath(); X.arc(bx2,by2,r*0.08,0,Math.PI*2); X.fill();});
      X.fillStyle=shadeColor(bc,-20); X.beginPath(); X.ellipse(0,-r*0.32,r*0.28,r*0.2,0,0,Math.PI*2); X.fill();
      X.strokeStyle=lightenColor(bc,10); X.lineWidth=1; X.stroke();
      if(!blink){
        X.fillStyle='rgba(0,0,0,0.7)'; X.beginPath(); X.ellipse(-r*0.38,r*0.12,r*0.24,r*0.1,0,0,Math.PI*2); X.fill();
        X.fillStyle='rgba(0,0,0,0.7)'; X.beginPath(); X.ellipse(r*0.38,r*0.12,r*0.24,r*0.1,0,0,Math.PI*2); X.fill();
        X.fillStyle='#f33'; X.beginPath(); X.ellipse(-r*0.38,r*0.12,r*0.18,r*0.07,0,0,Math.PI*2); X.fill();
        X.fillStyle='#f33'; X.beginPath(); X.ellipse(r*0.38,r*0.12,r*0.18,r*0.07,0,0,Math.PI*2); X.fill();
        X.globalAlpha=0.4; X.fillStyle='#f88'; X.beginPath(); X.ellipse(-r*0.38,r*0.12,r*0.3,r*0.17,0,0,Math.PI*2); X.fill();
        X.fillStyle='#f88'; X.beginPath(); X.ellipse(r*0.38,r*0.12,r*0.3,r*0.17,0,0,Math.PI*2); X.fill(); X.globalAlpha=1;
      }
      break;
    }
    case 'boss': {
      const pulse=0.5+0.5*Math.sin(now*3.5+m.id);
      X.globalAlpha=0.1+pulse*0.1;
      const aG=X.createRadialGradient(0,0,r*0.5,0,0,r*2.2); aG.addColorStop(0,lightenColor(bc,50)); aG.addColorStop(1,'transparent');
      X.fillStyle=aG; X.beginPath(); X.arc(0,0,r*2.2,0,Math.PI*2); X.fill(); X.globalAlpha=1;
      X.beginPath(); X.moveTo(-r,r*0.2); X.bezierCurveTo(-r*1.15,r*1.15,r*1.15,r*1.15,r,r*0.2); X.closePath();
      const rG=X.createLinearGradient(0,r*0.2,0,r*1.15); rG.addColorStop(0,shadeColor(bc,-10)); rG.addColorStop(1,shadeColor(bc,-60));
      X.fillStyle=rG; X.fill();
      const hG=X.createRadialGradient(-r*0.2,-r*0.2,r*0.1,0,-r*0.05,r);
      hG.addColorStop(0,lightenColor(bc,55)); hG.addColorStop(0.4,bc); hG.addColorStop(1,shadeColor(bc,-55));
      X.fillStyle=hG; X.beginPath(); X.ellipse(0,-r*0.05,r*0.92,r*0.95,0,0,Math.PI*2); X.fill();
      X.strokeStyle=shadeColor(bc,-30); X.lineWidth=2; X.stroke();
      for(const s of [-1,1]){
        X.fillStyle=shadeColor(bc,-15);
        X.beginPath(); X.moveTo(s*r*0.5,-r*0.55); X.bezierCurveTo(s*r*0.9,-r*1.0,s*r*0.75,-r*1.5,s*r*0.5,-r*1.7);
        X.bezierCurveTo(s*r*0.28,-r*1.5,s*r*0.3,-r*0.95,s*r*0.27,-r*0.65); X.closePath();
        X.fill(); X.strokeStyle=shadeColor(bc,-50); X.lineWidth=1.2; X.stroke();
      }
      if(!blink){
        X.globalAlpha=0.35+pulse*0.3; X.fillStyle='#ff3300';
        X.beginPath(); X.arc(-r*0.3,-r*0.12,r*0.28,0,Math.PI*2); X.fill();
        X.beginPath(); X.arc(r*0.3,-r*0.12,r*0.28,0,Math.PI*2); X.fill(); X.globalAlpha=1;
        X.fillStyle='#ff5500'; X.beginPath(); X.arc(-r*0.3,-r*0.12,r*0.19,0,Math.PI*2); X.fill();
        X.fillStyle='#ff5500'; X.beginPath(); X.arc(r*0.3,-r*0.12,r*0.19,0,Math.PI*2); X.fill();
        X.fillStyle='#ffcc00'; X.beginPath(); X.arc(-r*0.3,-r*0.12,r*0.08,0,Math.PI*2); X.fill();
        X.fillStyle='#ffcc00'; X.beginPath(); X.arc(r*0.3,-r*0.12,r*0.08,0,Math.PI*2); X.fill();
      }
      X.fillStyle='rgba(255,255,255,0.75)';
      [[-r*0.28,r*0.42],[-r*0.12,r*0.4],[r*0.12,r*0.4],[r*0.28,r*0.42]].forEach(([tx2,ty2])=>{
        X.beginPath(); X.moveTo(tx2,ty2); X.lineTo(tx2-r*0.05,ty2+r*0.2); X.lineTo(tx2+r*0.05,ty2+r*0.2); X.closePath(); X.fill();
      });
      break;
    }
    case 'demo': {
      X.globalAlpha=0.22+0.18*Math.sin(now*5+m.id); X.strokeStyle='#ff8800'; X.lineWidth=1.5;
      for(let i=0;i<6;i++){ const ca=now*1.8+m.id+i*Math.PI*2/6; X.beginPath(); X.moveTo(Math.cos(ca)*r*0.55,Math.sin(ca)*r*0.55); X.lineTo(Math.cos(ca+0.25)*r*1.28,Math.sin(ca+0.25)*r*1.28); X.stroke(); }
      X.globalAlpha=1;
      const gD=X.createRadialGradient(-r*0.3,-r*0.3,r*0.1,0,0,r);
      gD.addColorStop(0,lightenColor(bc,50)); gD.addColorStop(0.4,bc); gD.addColorStop(1,shadeColor(bc,-55));
      X.fillStyle=gD; X.beginPath(); X.arc(0,0,r,0,Math.PI*2); X.fill(); X.strokeStyle=lightenColor(bc,15); X.lineWidth=2; X.stroke();
      X.fillStyle=shadeColor(bc,-30);
      for(let i=0;i<6;i++){ const sa=i*Math.PI/3+Math.PI/6; X.beginPath(); X.moveTo(Math.cos(sa)*r,Math.sin(sa)*r); X.lineTo(Math.cos(sa-0.24)*r*1.38,Math.sin(sa-0.24)*r*1.38); X.lineTo(Math.cos(sa+0.24)*r*1.38,Math.sin(sa+0.24)*r*1.38); X.closePath(); X.fill(); }
      X.lineCap='round'; X.strokeStyle='rgba(255,50,0,0.75)'; X.lineWidth=r*0.22;
      X.beginPath(); X.moveTo(-r*0.5,-r*0.5); X.lineTo(r*0.5,r*0.5); X.stroke();
      X.beginPath(); X.moveTo(r*0.5,-r*0.5); X.lineTo(-r*0.5,r*0.5); X.stroke(); X.lineCap='butt';
      const detOn=Math.sin(now*7+m.id)>0;
      X.fillStyle=detOn?'#f00':'#500'; X.beginPath(); X.arc(0,-r*0.82,r*0.18,0,Math.PI*2); X.fill();
      if(detOn){ X.globalAlpha=0.4; X.fillStyle='#f22'; X.beginPath(); X.arc(0,-r*0.82,r*0.34,0,Math.PI*2); X.fill(); X.globalAlpha=1; }
      if(!blink){
        X.fillStyle='rgba(0,0,0,0.7)'; X.beginPath(); X.arc(-r*0.3,r*0.08,r*0.19,0,Math.PI*2); X.fill();
        X.fillStyle='rgba(0,0,0,0.7)'; X.beginPath(); X.arc(r*0.3,r*0.08,r*0.19,0,Math.PI*2); X.fill();
        X.fillStyle='#f80'; X.beginPath(); X.arc(-r*0.3,r*0.08,r*0.13,0,Math.PI*2); X.fill();
        X.fillStyle='#f80'; X.beginPath(); X.arc(r*0.3,r*0.08,r*0.13,0,Math.PI*2); X.fill();
      }
      break;
    }
    case 'blob': {
      const wobble=Math.sin(now*5+m.id*2.1)*0.12;
      const gBl=X.createRadialGradient(0,0,0,0,0,r*1.7); gBl.addColorStop(0,'rgba(200,100,255,0.25)'); gBl.addColorStop(1,'transparent');
      X.fillStyle=gBl; X.beginPath(); X.arc(0,0,r*1.7,0,Math.PI*2); X.fill();
      X.save(); X.scale(1+wobble,1-wobble);
      const bgBl=X.createRadialGradient(-r*0.3,-r*0.3,0,0,0,r); bgBl.addColorStop(0,'#e0a0ff'); bgBl.addColorStop(0.55,bc); bgBl.addColorStop(1,shadeColor(bc,-40));
      X.fillStyle=bgBl; X.beginPath(); X.arc(0,0,r,0,Math.PI*2); X.fill(); X.strokeStyle='rgba(220,140,255,0.55)'; X.lineWidth=1.5; X.stroke();
      for(let i=0;i<3;i++){ const ba=now*1.6+m.id+i*Math.PI*2/3; X.globalAlpha=0.45; X.fillStyle='rgba(235,185,255,0.75)'; X.beginPath(); X.arc(Math.cos(ba)*r*0.44,Math.sin(ba)*r*0.44,r*0.22,0,Math.PI*2); X.fill(); }
      X.globalAlpha=1; X.restore();
      if(!blink){
        X.fillStyle='rgba(0,0,0,0.55)'; X.beginPath(); X.arc(-r*0.3,-r*0.2,r*0.22,0,Math.PI*2); X.fill();
        X.fillStyle='rgba(0,0,0,0.55)'; X.beginPath(); X.arc(r*0.3,-r*0.2,r*0.22,0,Math.PI*2); X.fill();
        X.fillStyle='#ff0'; X.beginPath(); X.arc(-r*0.3,-r*0.2,r*0.16,0,Math.PI*2); X.fill();
        X.fillStyle='#ff0'; X.beginPath(); X.arc(r*0.3,-r*0.2,r*0.16,0,Math.PI*2); X.fill();
        X.fillStyle='rgba(255,255,255,0.8)'; X.beginPath(); X.arc(-r*0.25,-r*0.25,r*0.06,0,Math.PI*2); X.fill();
        X.fillStyle='rgba(255,255,255,0.8)'; X.beginPath(); X.arc(r*0.25,-r*0.25,r*0.06,0,Math.PI*2); X.fill();
      }
      if(m.gen>0){ X.fillStyle='rgba(255,255,255,0.9)'; X.font=`bold ${Math.max(7,Math.floor(r*0.75))}px monospace`; X.textAlign='center'; X.fillText('\xd7'+Math.pow(2,m.gen),0,r*0.4); }
      break;
    }
    default: {
      const gN=X.createRadialGradient(-r*0.25,-r*0.25,r*0.1,0,r*0.05,r*1.1);
      gN.addColorStop(0,lightenColor(bc,55)); gN.addColorStop(0.45,bc); gN.addColorStop(1,shadeColor(bc,-55));
      X.fillStyle=gN; X.beginPath(); X.ellipse(0,r*0.08,r*0.88,r,0,0,Math.PI*2); X.fill();
      X.strokeStyle=shadeColor(bc,-25); X.lineWidth=1.5; X.stroke();
      X.strokeStyle='rgba(255,255,255,0.1)'; X.lineWidth=1;
      X.beginPath(); X.arc(-r*0.1,-r*0.2,r*0.55,Math.PI*0.9,Math.PI*1.9); X.stroke();
      X.strokeStyle=lightenColor(bc,50); X.lineWidth=1.5;
      X.beginPath(); X.moveTo(-r*0.28,-r*0.65); X.quadraticCurveTo(-r*0.65,-r*1.1,-r*0.5,-r*1.4); X.stroke();
      X.beginPath(); X.moveTo(r*0.28,-r*0.65); X.quadraticCurveTo(r*0.65,-r*1.1,r*0.5,-r*1.4); X.stroke();
      X.fillStyle='#ffe060';
      X.beginPath(); X.arc(-r*0.5,-r*1.4,r*0.12,0,Math.PI*2); X.fill();
      X.beginPath(); X.arc(r*0.5,-r*1.4,r*0.12,0,Math.PI*2); X.fill();
      if(!blink){
        X.fillStyle='rgba(0,0,0,0.6)'; X.beginPath(); X.ellipse(-r*0.28,-r*0.15,r*0.22,r*0.2,0,0,Math.PI*2); X.fill();
        X.fillStyle='rgba(0,0,0,0.6)'; X.beginPath(); X.ellipse(r*0.28,-r*0.15,r*0.22,r*0.2,0,0,Math.PI*2); X.fill();
        X.fillStyle='#ff0'; X.beginPath(); X.arc(-r*0.28,-r*0.15,r*0.15,0,Math.PI*2); X.fill();
        X.fillStyle='#ff0'; X.beginPath(); X.arc(r*0.28,-r*0.15,r*0.15,0,Math.PI*2); X.fill();
        X.fillStyle='rgba(255,255,255,0.8)'; X.beginPath(); X.arc(-r*0.22,-r*0.2,r*0.06,0,Math.PI*2); X.fill();
        X.fillStyle='rgba(255,255,255,0.8)'; X.beginPath(); X.arc(r*0.22,-r*0.2,r*0.06,0,Math.PI*2); X.fill();
        X.fillStyle='#000'; X.beginPath(); X.arc(-r*0.28,-r*0.15,r*0.07,0,Math.PI*2); X.fill();
        X.fillStyle='#000'; X.beginPath(); X.arc(r*0.28,-r*0.15,r*0.07,0,Math.PI*2); X.fill();
      } else {
        X.strokeStyle='#ff0'; X.lineWidth=1.5;
        X.beginPath(); X.moveTo(-r*0.46,-r*0.15); X.lineTo(-r*0.14,-r*0.15); X.stroke();
        X.beginPath(); X.moveTo(r*0.14,-r*0.15); X.lineTo(r*0.46,-r*0.15); X.stroke();
      }
      X.strokeStyle='rgba(0,0,0,0.35)'; X.lineWidth=1.2;
      X.beginPath(); X.arc(0,r*0.28,r*0.22,0.25,Math.PI-0.25); X.stroke();
      break;
    }
  }

  X.restore();

  if(m.slow>0){
    X.globalAlpha=m.slow/m.slowMax*0.35; X.fillStyle='rgba(160,230,255,0.7)';
    X.beginPath(); X.arc(mx,bodyY,r*1.1,0,Math.PI*2); X.fill();
    X.globalAlpha=m.slow/m.slowMax*0.7; X.strokeStyle='#aef'; X.lineWidth=1;
    for(let i=0;i<6;i++){ const fa=i*Math.PI/3; X.beginPath(); X.moveTo(mx,bodyY); X.lineTo(mx+Math.cos(fa)*r*0.9,bodyY+Math.sin(fa)*r*0.9); X.stroke(); }
    X.globalAlpha=1;
  }

  const hpOff=(m.type==='boss'||m.type==='demo')?r*1.9:(m.type==='normal'?r*1.55:r+10);
  const hbW=r*2.4, hbH=4, hbX=mx-hbW/2, hbY=bodyY-hpOff;
  X.fillStyle='rgba(0,0,0,0.55)'; X.fillRect(hbX-1,hbY-1,hbW+2,hbH+2);
  X.fillStyle='#111'; X.fillRect(hbX,hbY,hbW,hbH);
  X.fillStyle=hpPct>0.6?'#4f4':hpPct>0.3?'#fa0':'#f44'; X.fillRect(hbX,hbY,hbW*hpPct,hbH);
  X.strokeStyle='rgba(0,0,0,0.4)'; X.lineWidth=0.5; X.strokeRect(hbX,hbY,hbW,hbH);

  X.restore();
}

// ── Monster class ─────────────────────────────────────────────────────
let monsterIdCounter=0;
class Monster {
  constructor(path, wave){
    this.id = monsterIdCounter++;
    this.pathIdx = 0;
    this.path = path;
    const [sc,sr]=path[0];
    this.x = GX+sc*CS+CS/2;
    this.y = GY+sr*CS+CS/2;
    this.drawX = this.x; this.drawY = this.y;

    const r=Math.random();
    const ms=monsterScale(wave);
    const rew=n=>Math.round(n*(1+wave*0.04));
    if(wave>5 && r<0.07)      { this.type='demo';   this.speed=38+wave*0.3;  this.maxHp=Math.round(600*ms);  this.reward=rew(25); this.radius=22; }
    else if(wave>2 && r<0.13) { this.type='boss';   this.speed=40+wave*0.3;  this.maxHp=Math.round(300*ms);  this.reward=rew(15); this.radius=19; }
    else if(r<0.22)           { this.type='tank';   this.speed=45+wave*0.2;  this.maxHp=Math.round(80*ms);   this.reward=rew(8);  this.radius=13; }
    else if(r<0.42)           { this.type='fast';   this.speed=Math.min(160,110+wave*0.8); this.maxHp=Math.round(20*ms); this.reward=rew(4); this.radius=9; }
    else if(r<0.56)           { this.type='blob';   this.speed=Math.min(55,28+wave*0.25);  this.maxHp=Math.round(120*ms); this.reward=rew(12); this.radius=16; }
    else                      { this.type='normal'; this.speed=Math.min(100,65+wave*0.4);  this.maxHp=Math.round(30*ms); this.reward=rew(5); this.radius=11; }

    this.hp = this.maxHp;
    this.baseColor = MCOLORS[this.type]||'#4a8a30';
    this.slow = 0; this.slowMax=1.5; this.dot=0; this.dotTimer=0;
    this.dead=false; this.reached=false;
    this.gen=0; this.split=false;
  }
  advance(dt){
    if(this.dead||this.reached) return;
    const spd = this.speed * (this.slow>0 ? 0.35 : 1);
    this.slow = Math.max(0, this.slow-dt);
    if(this.dot>0){ this.dotTimer-=dt; if(this.dotTimer<=0){ this.hp-=this.dot; this.dotTimer=0.5; } }
    if(this.hp<=0){ this.dead=true; return; }

    if(this.pathIdx >= this.path.length-1){ this.reached=true; return; }
    const [nc,nr]=this.path[this.pathIdx+1];
    const tx=GX+nc*CS+CS/2, ty=GY+nr*CS+CS/2;
    const dx=tx-this.x, dy=ty-this.y, dist=Math.hypot(dx,dy);
    const step=spd*dt;
    if(step>=dist){ this.x=tx; this.y=ty; this.pathIdx++; }
    else { this.x+=dx/dist*step; this.y+=dy/dist*step; }

    this.drawX=lerp(this.drawX,this.x,0.3);
    this.drawY=lerp(this.drawY,this.y,0.3);
  }
}

function createBlobChild(parent){
  const m=new Monster(parent.path, 0);
  m.pathIdx=parent.pathIdx;
  m.x=parent.x+(Math.random()-0.5)*16; m.y=parent.y+(Math.random()-0.5)*16;
  m.drawX=m.x; m.drawY=m.y;
  m.type='blob'; m.gen=parent.gen+1; m.baseColor=MCOLORS.blob;
  m.radius=Math.max(8, parent.radius-5);
  m.speed=parent.speed*1.15;
  m.maxHp=Math.floor(parent.maxHp*0.45); m.hp=m.maxHp;
  m.reward=Math.floor(parent.reward*0.5);
  m.split=false; m.dead=false; m.reached=false;
  return m;
}
