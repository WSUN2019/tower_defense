# Tower Defense

A browser-based tower defense game built with HTML5 Canvas. **No install, no load time** — open `index.html` and play instantly.

🎮 **Play it:** [towerdefensegame.up.railway.app](https://towerdefensegame.up.railway.app)

---

## How to Play

- **Place towers** — click a tower type in the panel (or press 1–5), then click any open grid cell
- **Start a wave** — click **Start Wave** or press **Space**
- **Pause** — press **P** or click **Pause**
- **Upgrade / Sell** — click a placed tower to see options in the panel
- **Escape** — returns to the splash screen

Survive all 10 waves to win.

---

## Towers

| Key | Tower    | Cost | Range | Notes |
|-----|----------|------|-------|-------|
| 1   | Gun      | 5    | 2     | Fast single shot |
| 2   | Flame    | 10   | 2     | Burns over time (DoT) |
| 3   | Bomb     | 20   | 3     | Area explosion |
| 4   | Freeze   | 18   | 2     | Slows enemies |
| 5   | Tri-Gun  | 30   | 2     | Shoots 3 targets at once |

Towers can be upgraded up to **level 3** (30 gold per level).

---

## Enemies

| Type   | Speed | HP     | Notes |
|--------|-------|--------|-------|
| Normal | Med   | Med    | Standard |
| Fast   | High  | Low    | Rushes through |
| Tank   | Low   | High   | Heavily armored |
| Boss   | Med   | V.High | Appears wave 6+ |
| Demo   | Low   | 600+   | Appears wave 9+ |

---

## Maps

| Map        | Description |
|------------|-------------|
| Corridor   | Classic S-curve horizontal path |
| Crossroads | Long winding double-loop |

---

## Deploy

### Local
```
open index.html
```

### Railway
```
git push origin main
```
Railway runs `python app.py` (from `Procfile`), which serves `index.html` via Python's built-in HTTP server on `$PORT`.

### GitHub Pages
Push to a repo, enable Pages on the `main` branch — loads in under 1 second, zero config.

---

## Dev

```bash
bash git_status.sh   # interactive git helper
```

Single-file game: all logic, rendering, and audio are in `index.html`. No build step, no dependencies.
