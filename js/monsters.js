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
  X.globalAlpha=0.28; X.fillStyle='rgba(0,0,0,0.6)';
  X.beginPath(); X.ellipse(mx+2,my_base,r*0.92,r*0.36,0,0,Math.PI*2); X.fill();
  X.globalAlpha=1;

  X.save(); X.translate(mx,bodyY);

  switch(m.type){

    case 'fast': {
      // Speed streak shadows
      for(let s=1;s<=3;s++){
        X.globalAlpha=0.16-s*0.04;
        X.fillStyle=lightenColor(bc,20);
        X.beginPath();
        X.moveTo(-r*(0.7+s*0.3),0);
        X.bezierCurveTo(-r*(0.5+s*0.25),-r*0.28,-r*(0.2+s*0.2),-r*0.2,-r*0.18,-r*0.12);
        X.lineTo(-r*0.18,r*0.12);
        X.bezierCurveTo(-r*(0.2+s*0.2),r*0.2,-r*(0.5+s*0.25),r*0.28,-r*(0.7+s*0.3),0);
        X.fill();
      }
      X.globalAlpha=1;
      // Wings
      X.globalAlpha=0.5; X.fillStyle=lightenColor(bc,25);
      X.beginPath(); X.moveTo(-r*0.18,-r*0.2); X.bezierCurveTo(-r*0.45,-r*0.88,-r*1.15,-r*0.82,-r*0.96,-r*0.28); X.bezierCurveTo(-r*0.65,0,-r*0.32,-r*0.04,-r*0.18,-r*0.2); X.fill();
      X.beginPath(); X.moveTo(-r*0.18,r*0.2); X.bezierCurveTo(-r*0.45,r*0.88,-r*1.15,r*0.82,-r*0.96,r*0.28); X.bezierCurveTo(-r*0.65,0,-r*0.32,r*0.04,-r*0.18,r*0.2); X.fill();
      X.globalAlpha=1;
      // Body
      const gF=X.createLinearGradient(-r,0,r*1.1,0);
      gF.addColorStop(0,shadeColor(bc,-50)); gF.addColorStop(0.25,lightenColor(bc,45)); gF.addColorStop(0.72,bc); gF.addColorStop(1,shadeColor(bc,-25));
      X.fillStyle=gF;
      X.beginPath(); X.moveTo(r*1.1,0); X.bezierCurveTo(r*0.6,-r*0.52,-r*0.1,-r*0.6,-r*0.9,-r*0.32); X.bezierCurveTo(-r*1.1,-r*0.14,-r*1.1,r*0.14,-r*0.9,r*0.32); X.bezierCurveTo(-r*0.1,r*0.6,r*0.6,r*0.52,r*1.1,0); X.fill();
      X.strokeStyle=lightenColor(bc,30); X.lineWidth=1.2; X.stroke();
      // Highlight streak
      X.globalAlpha=0.32; X.strokeStyle='#fff'; X.lineWidth=1.5;
      X.beginPath(); X.moveTo(-r*0.05,-r*0.26); X.bezierCurveTo(r*0.3,-r*0.26,r*0.7,-r*0.13,r*1.0,-r*0.03); X.stroke(); X.globalAlpha=1;
      // Afterburner glow at tail
      const pulse=0.5+0.5*Math.sin(now*18+m.id);
      X.globalAlpha=0.38+pulse*0.38; X.fillStyle=lightenColor(bc,65);
      X.beginPath(); X.arc(-r*0.9,0,r*0.22,0,Math.PI*2); X.fill();
      X.globalAlpha=0.18+pulse*0.15; X.fillStyle='#fff';
      X.beginPath(); X.arc(-r*0.9,0,r*0.4,0,Math.PI*2); X.fill(); X.globalAlpha=1;
      // Eye
      if(!blink){
        X.fillStyle='rgba(0,0,0,0.72)'; X.beginPath(); X.ellipse(r*0.52,0,r*0.32,r*0.14,0,0,Math.PI*2); X.fill();
        X.fillStyle='#0ff'; X.beginPath(); X.ellipse(r*0.52,0,r*0.22,r*0.09,0,0,Math.PI*2); X.fill();
        X.globalAlpha=0.35; X.fillStyle='#0ff'; X.beginPath(); X.ellipse(r*0.52,0,r*0.42,r*0.21,0,0,Math.PI*2); X.fill(); X.globalAlpha=1;
        X.fillStyle='#fff'; X.beginPath(); X.arc(r*0.44,r*0.02,r*0.055,0,Math.PI*2); X.fill();
      } else {
        X.strokeStyle='#0ff'; X.lineWidth=1.5;
        X.beginPath(); X.moveTo(r*0.25,0); X.lineTo(r*0.8,0); X.stroke();
      }
      break;
    }

    case 'tank': {
      X.beginPath();
      for(let i=0;i<6;i++){
        const a=i*Math.PI/3, rx2=r*(i%2===0?1.06:0.88), ry2=r*(i%2===0?0.92:1.06);
        i===0?X.moveTo(Math.cos(a)*rx2,Math.sin(a)*ry2):X.lineTo(Math.cos(a)*rx2,Math.sin(a)*ry2);
      }
      X.closePath();
      const gT=X.createRadialGradient(-r*0.28,-r*0.28,r*0.06,0,0,r*1.15);
      gT.addColorStop(0,lightenColor(bc,48)); gT.addColorStop(0.5,bc); gT.addColorStop(1,shadeColor(bc,-58));
      X.fillStyle=gT; X.fill(); X.strokeStyle=lightenColor(bc,22); X.lineWidth=2.5; X.stroke();
      // Armor plate dividers
      X.strokeStyle='rgba(0,0,0,0.28)'; X.lineWidth=1.5;
      X.beginPath(); X.moveTo(-r*0.9,0); X.lineTo(r*0.9,0); X.stroke();
      X.beginPath(); X.moveTo(-r*0.45,-r*0.78); X.lineTo(-r*0.45,r*0.78); X.stroke();
      X.beginPath(); X.moveTo(r*0.45,-r*0.78); X.lineTo(r*0.45,r*0.78); X.stroke();
      // Rivets at plate corners
      X.fillStyle=lightenColor(bc,18);
      [[-r*0.82,0],[r*0.82,0],[0,-r*0.72],[0,r*0.72],
       [-r*0.42,-r*0.66],[r*0.42,-r*0.66],[-r*0.42,r*0.66],[r*0.42,r*0.66]].forEach(([bx2,by2])=>{
        X.beginPath(); X.arc(bx2,by2,r*0.072,0,Math.PI*2); X.fill();
        X.strokeStyle='rgba(0,0,0,0.4)'; X.lineWidth=0.5; X.stroke();
      });
      // Central gun turret
      X.fillStyle=shadeColor(bc,-22); X.beginPath(); X.ellipse(0,-r*0.3,r*0.34,r*0.24,0,0,Math.PI*2); X.fill();
      X.strokeStyle=lightenColor(bc,12); X.lineWidth=1.2; X.stroke();
      X.fillStyle=shadeColor(bc,-42); X.beginPath(); X.ellipse(0,-r*0.3,r*0.19,r*0.14,0,0,Math.PI*2); X.fill();
      // Eyes
      if(!blink){
        [-r*0.36,r*0.36].forEach(ex=>{
          X.fillStyle='rgba(0,0,0,0.78)'; X.beginPath(); X.ellipse(ex,r*0.16,r*0.26,r*0.12,0,0,Math.PI*2); X.fill();
          X.fillStyle='#f33'; X.beginPath(); X.ellipse(ex,r*0.16,r*0.19,r*0.085,0,0,Math.PI*2); X.fill();
          X.globalAlpha=0.48; X.fillStyle='#f88'; X.beginPath(); X.ellipse(ex,r*0.16,r*0.32,r*0.19,0,0,Math.PI*2); X.fill(); X.globalAlpha=1;
          X.fillStyle='#fff'; X.beginPath(); X.arc(ex-r*0.06,r*0.1,r*0.042,0,Math.PI*2); X.fill();
        });
      }
      break;
    }

    case 'boss': {
      const pulse=0.5+0.5*Math.sin(now*3.5+m.id);
      // Outer aura rings
      X.globalAlpha=0.06+pulse*0.07;
      X.fillStyle=lightenColor(bc,50);
      X.beginPath(); X.arc(0,0,r*2.6,0,Math.PI*2); X.fill(); X.globalAlpha=1;
      X.globalAlpha=0.14+pulse*0.1; X.strokeStyle=lightenColor(bc,35); X.lineWidth=1.5;
      X.beginPath(); X.arc(0,0,r*1.9,0,Math.PI*2); X.stroke(); X.globalAlpha=1;
      // Cape
      X.beginPath(); X.moveTo(-r,r*0.22); X.bezierCurveTo(-r*1.2,r*1.2,r*1.2,r*1.2,r,r*0.22); X.closePath();
      const rG=X.createLinearGradient(0,r*0.22,0,r*1.22); rG.addColorStop(0,shadeColor(bc,-8)); rG.addColorStop(1,shadeColor(bc,-72));
      X.fillStyle=rG; X.fill();
      // Crown — 5 spikes
      [-0.78,-0.44,0,0.44,0.78].forEach((off,si)=>{
        const sa=off-Math.PI/2;
        const slen=si===2?r*1.88:r*1.38;
        X.fillStyle=si===2?lightenColor(bc,8):shadeColor(bc,-18);
        X.beginPath();
        X.moveTo(Math.cos(sa-0.17)*r*0.9,Math.sin(sa-0.17)*r*0.9);
        X.lineTo(Math.cos(sa)*slen,Math.sin(sa)*slen);
        X.lineTo(Math.cos(sa+0.17)*r*0.9,Math.sin(sa+0.17)*r*0.9);
        X.closePath(); X.fill();
        X.strokeStyle=shadeColor(bc,-42); X.lineWidth=1.2; X.stroke();
        if(si===2){
          X.globalAlpha=0.5+pulse*0.5; X.fillStyle='rgba(255,120,80,1)';
          X.beginPath(); X.arc(Math.cos(sa)*slen,Math.sin(sa)*slen,r*0.13,0,Math.PI*2); X.fill(); X.globalAlpha=1;
        }
      });
      // Main head
      const hG=X.createRadialGradient(-r*0.24,-r*0.22,r*0.08,0,0,r);
      hG.addColorStop(0,lightenColor(bc,62)); hG.addColorStop(0.35,bc); hG.addColorStop(1,shadeColor(bc,-55));
      X.fillStyle=hG; X.beginPath(); X.ellipse(0,0,r*0.92,r*0.94,0,0,Math.PI*2); X.fill();
      X.strokeStyle=shadeColor(bc,-28); X.lineWidth=2.5; X.stroke();
      // Orbiting energy orbs
      for(let o=0;o<3;o++){
        const oa=now*1.8+m.id+o*Math.PI*2/3;
        const ox=Math.cos(oa)*r*1.52, oy=Math.sin(oa)*r*0.82;
        X.globalAlpha=0.5+0.4*Math.sin(now*4+o); X.fillStyle=lightenColor(bc,52);
        X.beginPath(); X.arc(ox,oy,r*0.15,0,Math.PI*2); X.fill();
        X.globalAlpha=0.22; X.strokeStyle=lightenColor(bc,30); X.lineWidth=1;
        X.beginPath(); X.moveTo(0,0); X.lineTo(ox,oy); X.stroke(); X.globalAlpha=1;
      }
      // Chest gem
      X.fillStyle=`rgba(255,100,50,${0.62+pulse*0.38})`; X.beginPath(); X.arc(0,r*0.24,r*0.19,0,Math.PI*2); X.fill();
      X.fillStyle='rgba(255,210,200,0.82)'; X.beginPath(); X.arc(-r*0.055,r*0.19,r*0.065,0,Math.PI*2); X.fill();
      // Eyes
      if(!blink){
        [-r*0.3,r*0.3].forEach(ex=>{
          X.globalAlpha=0.38+pulse*0.42; X.fillStyle='#f40';
          X.beginPath(); X.arc(ex,-r*0.12,r*0.32,0,Math.PI*2); X.fill(); X.globalAlpha=1;
          X.fillStyle='#f55'; X.beginPath(); X.arc(ex,-r*0.12,r*0.21,0,Math.PI*2); X.fill();
          X.fillStyle='#fc0'; X.beginPath(); X.arc(ex,-r*0.12,r*0.1,0,Math.PI*2); X.fill();
          X.fillStyle='rgba(255,255,255,0.72)'; X.beginPath(); X.arc(ex-r*0.07,-r*0.18,r*0.045,0,Math.PI*2); X.fill();
        });
      }
      // Teeth
      X.fillStyle='rgba(255,255,255,0.88)';
      for(let t2=0;t2<4;t2++){
        X.beginPath(); X.moveTo(-r*0.24+t2*r*0.16,r*0.43); X.lineTo(-r*0.18+t2*r*0.16,r*0.26); X.lineTo(-r*0.12+t2*r*0.16,r*0.43); X.fill();
      }
      break;
    }

    case 'demo': {
      // Pulsing outer ring
      X.globalAlpha=0.2+0.14*Math.sin(now*5+m.id);
      X.strokeStyle='#f80'; X.lineWidth=2;
      X.beginPath(); X.arc(0,0,r*1.42,0,Math.PI*2); X.stroke(); X.globalAlpha=1;
      // Rotating energy tendrils
      X.globalAlpha=0.28+0.18*Math.sin(now*4+m.id); X.strokeStyle='#ff8800'; X.lineWidth=1.5;
      for(let i=0;i<6;i++){ const ca=now*1.8+m.id+i*Math.PI*2/6; X.beginPath(); X.moveTo(Math.cos(ca)*r*0.56,Math.sin(ca)*r*0.56); X.lineTo(Math.cos(ca+0.28)*r*1.32,Math.sin(ca+0.28)*r*1.32); X.stroke(); }
      X.globalAlpha=1;
      // Body
      const gD=X.createRadialGradient(-r*0.3,-r*0.3,r*0.1,0,0,r);
      gD.addColorStop(0,lightenColor(bc,55)); gD.addColorStop(0.38,bc); gD.addColorStop(1,shadeColor(bc,-55));
      X.fillStyle=gD; X.beginPath(); X.arc(0,0,r,0,Math.PI*2); X.fill(); X.strokeStyle=lightenColor(bc,18); X.lineWidth=2.5; X.stroke();
      // Spikes with glowing tips
      for(let i=0;i<6;i++){
        const sa=i*Math.PI/3+Math.PI/6;
        X.fillStyle=shadeColor(bc,-22);
        X.beginPath(); X.moveTo(Math.cos(sa)*r,Math.sin(sa)*r);
        X.lineTo(Math.cos(sa-0.28)*r*1.46,Math.sin(sa-0.28)*r*1.46);
        X.lineTo(Math.cos(sa+0.28)*r*1.46,Math.sin(sa+0.28)*r*1.46); X.closePath(); X.fill();
        X.strokeStyle=lightenColor(bc,8); X.lineWidth=1; X.stroke();
        X.globalAlpha=0.55+0.3*Math.sin(now*4+i); X.fillStyle='#f80';
        X.beginPath(); X.arc(Math.cos(sa)*r*1.46,Math.sin(sa)*r*1.46,r*0.1,0,Math.PI*2); X.fill(); X.globalAlpha=1;
      }
      // X slash
      X.lineCap='round'; X.strokeStyle='rgba(255,80,0,0.88)'; X.lineWidth=r*0.24;
      X.beginPath(); X.moveTo(-r*0.45,-r*0.45); X.lineTo(r*0.45,r*0.45); X.stroke();
      X.beginPath(); X.moveTo(r*0.45,-r*0.45); X.lineTo(-r*0.45,r*0.45); X.stroke(); X.lineCap='butt';
      // Detonator with animated spark
      const detOn=Math.sin(now*7+m.id)>0;
      X.fillStyle=detOn?'#f00':'#600'; X.beginPath(); X.arc(0,-r*0.82,r*0.2,0,Math.PI*2); X.fill();
      if(detOn){
        X.globalAlpha=0.5; X.fillStyle='#f22'; X.beginPath(); X.arc(0,-r*0.82,r*0.38,0,Math.PI*2); X.fill(); X.globalAlpha=1;
        X.strokeStyle='#ff0'; X.lineWidth=1.5;
        X.beginPath(); X.moveTo(0,-r*1.02); X.lineTo(Math.cos(now*22)*r*0.18,-r*1.05-r*0.12); X.stroke();
      }
      // Eyes
      if(!blink){
        [-r*0.3,r*0.3].forEach(ex=>{
          X.fillStyle='rgba(0,0,0,0.75)'; X.beginPath(); X.arc(ex,r*0.1,r*0.2,0,Math.PI*2); X.fill();
          X.fillStyle='#f80'; X.beginPath(); X.arc(ex,r*0.1,r*0.14,0,Math.PI*2); X.fill();
          X.fillStyle='rgba(255,255,255,0.65)'; X.beginPath(); X.arc(ex-r*0.06,r*0.04,r*0.05,0,Math.PI*2); X.fill();
        });
      }
      break;
    }

    case 'blob': {
      const wobble=Math.sin(now*5+m.id*2.1)*0.14;
      const crackPct=Math.max(0,(0.5-hpPct)/0.5);
      // Outer glow
      X.globalAlpha=0.14+0.08*Math.sin(now*2.8+m.id); X.fillStyle=lightenColor(bc,28);
      X.beginPath(); X.arc(0,0,r*1.82,0,Math.PI*2); X.fill(); X.globalAlpha=1;

      X.save(); X.scale(1+wobble,1-wobble*0.85);
      // Translucent outer skin
      X.globalAlpha=0.38; X.fillStyle=lightenColor(bc,18);
      X.beginPath(); X.arc(0,0,r*1.1,0,Math.PI*2); X.fill(); X.globalAlpha=1;
      // Core body
      const bgBl=X.createRadialGradient(-r*0.3,-r*0.34,0,0,0,r);
      bgBl.addColorStop(0,'#f0c0ff'); bgBl.addColorStop(0.42,bc); bgBl.addColorStop(1,shadeColor(bc,-44));
      X.fillStyle=bgBl; X.beginPath(); X.arc(0,0,r,0,Math.PI*2); X.fill();
      X.strokeStyle='rgba(225,158,255,0.62)'; X.lineWidth=2; X.stroke();
      // Floating internal bubbles
      for(let i=0;i<4;i++){
        const ba=now*1.2+m.id+i*Math.PI/2;
        X.globalAlpha=0.28+0.18*Math.sin(now*2+i);
        X.fillStyle='rgba(245,205,255,0.82)';
        X.beginPath(); X.arc(Math.cos(ba)*r*(0.3+i*0.07),Math.sin(ba)*r*(0.3+i*0.07),r*(0.12-i*0.02),0,Math.PI*2); X.fill();
      }
      X.globalAlpha=1;
      // Highlight
      X.globalAlpha=0.52; X.fillStyle='rgba(255,242,255,0.65)';
      X.beginPath(); X.ellipse(-r*0.28,-r*0.3,r*0.28,r*0.17,-0.38,0,Math.PI*2); X.fill(); X.globalAlpha=1;
      X.restore();

      // Crack lines when near split
      if(crackPct>0){
        X.strokeStyle=`rgba(255,210,255,${crackPct*0.92})`; X.lineWidth=1.4+crackPct;
        X.beginPath(); X.moveTo(0,-r*0.1); X.lineTo(-r*0.36,r*0.28); X.lineTo(-r*0.16,r*0.68); X.stroke();
        X.beginPath(); X.moveTo(0,-r*0.1); X.lineTo(r*0.42,r*0.18); X.lineTo(r*0.26,r*0.64); X.stroke();
        X.beginPath(); X.moveTo(0,-r*0.1); X.lineTo(r*0.08,-r*0.62); X.stroke();
        X.globalAlpha=crackPct*0.45; X.fillStyle='rgba(255,220,255,0.5)';
        X.beginPath(); X.arc(0,0,r*1.12,0,Math.PI*2); X.fill(); X.globalAlpha=1;
      }

      // Eyes
      if(!blink){
        [-r*0.3,r*0.3].forEach(ex=>{
          X.fillStyle='rgba(0,0,0,0.58)'; X.beginPath(); X.arc(ex,-r*0.2,r*0.24,0,Math.PI*2); X.fill();
          X.fillStyle='#ff0'; X.beginPath(); X.arc(ex,-r*0.2,r*0.17,0,Math.PI*2); X.fill();
          X.fillStyle='rgba(255,255,255,0.82)'; X.beginPath(); X.arc(ex-r*0.07,-r*0.27,r*0.062,0,Math.PI*2); X.fill();
        });
      }
      if(m.gen>0){ X.fillStyle='rgba(255,255,255,0.92)'; X.font=`bold ${Math.max(7,Math.floor(r*0.75))}px monospace`; X.textAlign='center'; X.fillText('\xd7'+Math.pow(2,m.gen),0,r*0.46); }
      break;
    }

    default: { // normal
      const breathe=1+Math.sin(now*2.2+m.id)*0.038;
      const gN=X.createRadialGradient(-r*0.22,-r*0.3,r*0.08,0,r*0.05,r*1.1);
      gN.addColorStop(0,lightenColor(bc,62)); gN.addColorStop(0.42,bc); gN.addColorStop(1,shadeColor(bc,-55));
      X.fillStyle=gN;
      X.beginPath(); X.ellipse(0,r*0.06,r*0.86*breathe,r*0.98,0,0,Math.PI*2); X.fill();
      X.strokeStyle=shadeColor(bc,-22); X.lineWidth=2; X.stroke();
      // Body segments
      X.strokeStyle='rgba(0,0,0,0.18)'; X.lineWidth=1;
      for(let s=0;s<3;s++){
        const sy=r*(-0.08+s*0.28);
        X.beginPath(); X.moveTo(-r*(0.66-s*0.08),sy); X.lineTo(r*(0.66-s*0.08),sy); X.stroke();
      }
      // Inner highlight
      X.strokeStyle='rgba(255,255,255,0.1)'; X.lineWidth=1;
      X.beginPath(); X.arc(-r*0.1,-r*0.2,r*0.52,Math.PI*0.88,Math.PI*1.96); X.stroke();
      // Antennae
      X.strokeStyle=lightenColor(bc,42); X.lineWidth=1.5;
      X.beginPath(); X.moveTo(-r*0.28,-r*0.65); X.quadraticCurveTo(-r*0.62,-r*1.08,-r*0.48,-r*1.38); X.stroke();
      X.beginPath(); X.moveTo(r*0.28,-r*0.65); X.quadraticCurveTo(r*0.62,-r*1.08,r*0.48,-r*1.38); X.stroke();
      // Pulsing antenna tips
      const antP=0.5+0.5*Math.sin(now*4.2+m.id);
      [-r*0.48,r*0.48].forEach(ax=>{
        X.globalAlpha=0.38+antP*0.52; X.fillStyle=lightenColor(bc,58);
        X.beginPath(); X.arc(ax,-r*1.38,r*0.19,0,Math.PI*2); X.fill(); X.globalAlpha=1;
        X.fillStyle='#ffe060'; X.beginPath(); X.arc(ax,-r*1.38,r*0.12,0,Math.PI*2); X.fill();
      });
      // Eyes
      if(!blink){
        [-r*0.28,r*0.28].forEach(ex=>{
          X.fillStyle='rgba(0,0,0,0.65)'; X.beginPath(); X.ellipse(ex,-r*0.15,r*0.23,r*0.21,0,0,Math.PI*2); X.fill();
          X.fillStyle='#ff0'; X.beginPath(); X.arc(ex,-r*0.15,r*0.15,0,Math.PI*2); X.fill();
          X.fillStyle='rgba(255,255,255,0.82)'; X.beginPath(); X.arc(ex-r*0.06,-r*0.2,r*0.062,0,Math.PI*2); X.fill();
          X.fillStyle='#000'; X.beginPath(); X.arc(ex,-r*0.15,r*0.072,0,Math.PI*2); X.fill();
        });
      } else {
        X.strokeStyle='#ff0'; X.lineWidth=1.5;
        X.beginPath(); X.moveTo(-r*0.46,-r*0.15); X.lineTo(-r*0.12,-r*0.15); X.stroke();
        X.beginPath(); X.moveTo(r*0.12,-r*0.15); X.lineTo(r*0.46,-r*0.15); X.stroke();
      }
      // Mouth
      X.strokeStyle='rgba(0,0,0,0.38)'; X.lineWidth=1.5;
      X.beginPath(); X.arc(0,r*0.28,r*0.24,0.22,Math.PI-0.22); X.stroke();
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

  const hpOff=(m.type==='boss'||m.type==='demo')?r*1.95:(m.type==='normal'?r*1.58:r+10);
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
