'use strict';
// ── Grid dimensions ───────────────────────────────────────────────────
const COLS = 10, ROWS = 7;

// ── Map definitions ───────────────────────────────────────────────────
const MAPS = [
  { name:'CORRIDOR',  desc:'Classic horizontal path',
    entry:[0,3], exit:[9,3],
    path:[[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[4,1],[5,1],[5,2],[5,3],[5,4],[5,5],[6,5],[7,5],[8,5],[8,4],[8,3],[9,3]]
  },
  { name:'CROSSROADS', desc:'Winding double-loop',
    entry:[0,0], exit:[9,6],
    path:[[0,0],[1,0],[2,0],[3,0],[3,1],[3,2],[2,2],[1,2],[1,3],[1,4],[2,4],[3,4],[4,4],[4,3],[4,2],[5,2],[6,2],[6,3],[6,4],[6,5],[5,5],[4,5],[4,6],[5,6],[6,6],[7,6],[8,6],[8,5],[8,4],[8,3],[9,3],[9,4],[9,5],[9,6]]
  }
];

// ── BFS pathfinding ───────────────────────────────────────────────────
function bfs(blocked, entry, exit) {
  const key = (c,r) => r*COLS+c;
  const q = [entry], prev = {[key(...entry)]:null}, dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  while(q.length) {
    const [c,r] = q.shift();
    if(c===exit[0]&&r===exit[1]) {
      const path=[]; let cur=[c,r];
      while(cur) { path.unshift(cur); cur=prev[key(...cur)]; }
      return path;
    }
    for(const [dc,dr] of dirs) {
      const nc=c+dc, nr=r+dr, k=key(nc,nr);
      if(nc<0||nc>=COLS||nr<0||nr>=ROWS) continue;
      if(blocked.has(k)||prev[k]!==undefined) continue;
      prev[k]=[[c,r]]; q.push([nc,nr]);
    }
  }
  return null;
}
