# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A class project (UC UI course, Project 1): a mock-up UI for a **Smart Vinyl Player**. The full assignment rubric is in `REQUIREMENTS.md` — read it before adding features, since grading depends on its Level 0/1 checklist and the chosen Level 2–4 options. Code must be **Svelte + JavaScript** (no TypeScript).

## Commands

All app code lives in `smart-vinyl-player/` (Vite + Svelte 5). Run from that directory:

```sh
npm install
npm run dev      # dev server with HMR
npm run build    # production build to dist/
npm run preview  # serve the build
npm test         # node assert checks: LRC parsing, health tiers, sides/discs from track lists, disc size → speed (src/lib/logic.test.js)
```

No linter or type-checker. `npm run build` surfaces Svelte a11y warnings; keep it warning-free.

To check UI changes in a browser, run your own server on a dedicated port with `npx vite --port 5199 --strictPort` and stop only that port afterwards. The user usually has `npm run dev` on 5173; without `--strictPort` Vite silently moves to another port, and a port-based kill on 5173 would stop the user's server.

## Architecture

- Components use Svelte 5 runes (`$state`, `$props`, `$derived`, `$effect`), not Svelte 4 syntax (`export let`, `$:`).
- **`src/lib/player.svelte.js` is the single source of truth** for the physical player: one module-level `Audio` element plus an exported `$state` object (record/side/track indexes, playing, time, volume, mode, `arm`, `sideDone`/`changer`/`swap`, profile, detected plays). Both device UIs and the testing panel import it directly and call its functions (`toggle`, `seek`, `setVolume`, `setMode`, `reachForTonearm`, ...); there is no prop drilling. That's how phone actions show up on the display (Option 2).
- **Seeking cues the automatic tonearm.** In 33/45 modes `seek`/`skip` and the scrub bar (`scrubStart`/`scrubTo`/`scrubEnd`) run lift → move → lower in `player.svelte.js`; `player.arm` drives `display/Tonearm.svelte` (top-down platter view). While `arm.cueing`, audio is paused but `player.playing` keeps the user's intent (the audio play/pause listeners ignore cue-driven events), and `cueToken` cancels a cue in flight. Bluetooth mode seeks instantly.
- Phone (`phone/PhoneApp.svelte`): mini player (prev/play/next) opens a Now Playing sheet (artwork, song details, a song scrubber that drives the same `scrubStart`/`scrubTo`/`scrubEnd` tonearm cue as the display — clamped to the current song, with its own window `pointerup` because the display may not be mounted — transport, "up next"); the volume row is a `{#snippet}` rendered in both places.
- `setVolume(v, from)` is shared by the physical knob (`'knob'`) and the phone's remote volume row (`'phone'`); the display's volume overlay labels phone changes. The knob is modelled as an endless encoder, so there's no position conflict.
- Physical-knob turns set `player.knob` to a fresh object; `PlayerDisplay` watches it in an `$effect` to show a timed overlay. `player.needleAlert` works the same way for the tonearm warning.
- `App.svelte` is the master page: a view switch (`display` / `phone` / `both`; `both` puts the devices side by side and lays `TestPanel` out in 3 columns underneath), the placement graphic, and `TestPanel` (stands in for physical actions: knobs, hand near tonearm, owner profile).
- `src/lib/display/` = player touchscreen (720px wide, `aspect-ratio: 1.41`). `src/lib/phone/` = companion app (380px wide, `1 / 1.41`). Device UIs are always dark; only the surrounding page follows `prefers-color-scheme` via tokens in `src/app.css`.
- **Accent color comes from the artwork.** Each record has a `color` (dominant cover color) in `records.js`; `App.svelte` sets it as `--art-color` on `<html>`. `app.css` registers `--art-color` with `@property` (so it fades on a record swap) and derives `--accent`/`--accent-bg`/`--on-accent` with `oklch(from var(--art-color) L C h)` — the hue follows the art, lightness/chroma are pinned for contrast (light L 0.5, dark L 0.8; checked ≥ 4.5:1). The display's `--glow` derives the same way. Don't hardcode accent colors; the phone's data-viz blues and the status palette are intentionally separate.
- `src/lib/records.js`: the playable records. Each is **one audio file of the whole album** (`public/audio/*.m4a`, AAC 128 kbps to keep files under GitHub's 50 MB warning, URL built from `import.meta.env.BASE_URL` since the app is served from a subpath) plus `[side, title, start, lyricsId]` rows; `build()` derives tracks and sides (`start`/`end` seconds, `disc` = sides paired A/B, C/D, `first`/`last` track index). Artwork is hotlinked (Apple mzstatic, Deezer). `lyricsOffset` per track is the calibration knob if lyrics drift.
- **Sides are the unit of playback**, like a real record: `player.time` is seconds into the album file, the scrub bar/tonearm span only the current side, and `next` on a side's last song ends the side. In 33/45 modes `endOfSide()` parks the needle and sets `player.changer`, which opens both `display/Changer.svelte` and `phone/PhonePicker.svelte` (flip / swap disc / new album). Their wording comes from `sideChange.js` and the record graphic and flip/swap animations from `Disc.svelte`, so change those, not the two pickers; `putOn(record, side)` plays the place → detect → needle-drop sequence. Bluetooth mode streams straight through sides. `now()` returns `{ record, side, track }` and must be called inside `$derived`.
- **Speed lock.** `records.js` gives each record a `size` (12 = LP → 33⅓, 7 = single → 45; `speedFor`). In `player.svelte.js`, `speedLocked()` (needle on the record) makes `setMode` refuse and flash `'locked'`; `wrongSpeed()` (knob ≠ disc speed) blocks `play()` and the needle drop after `putOn`, flashing `'mismatch'`. All knob overlays go through `flash(kind)` — assign `player.knob` as a statement, never inside an expression (Svelte warns `assignment_value_stale` for proxied objects).
- `src/lib/scenarios.js`: the 4 owner profiles (sensor readings, collection, top artists, generated 7×24 heatmap), sensor thresholds and the overall-tier rule (mean of sensor levels, but one Poor sensor caps overall at Fair).
- Health tiers use the dataviz status palette (`#0ca30c / #fab219 / #ec835a / #d03b3b`) and always pair color with a glyph + label.

## Hosting

- App: GitHub Pages at https://sai-porumamilla.github.io/UI-Project_1/, deployed by `.github/workflows/deploy.yml` on push to `main`. `vite.config.js` uses `base: './'`, so never hardcode root-absolute (`/...`) asset paths.
- Write-up (required by the rubric): https://sai-porumamilla.github.io/smart-vinyl-player/, a page in the separate `sai-porumamilla.github.io` portfolio repo. The Testing panel links to it.

## Design spec

**Master page** — one page that chooses between the two UIs below. Must still satisfy Level 0: a Device UI region plus a Testing region with project title, author name, write-up link, a graphic showing where the UI sits on the physical object, and an info button explaining the simulation controls.

**Aspect ratio** — both device UIs are fixed at **1.41:1 (ISO A-series, √2)**: the player display landscape, the phone portrait (1:1.41). The assignment says the UI does not need to be responsive.

**Shared state** — both UIs represent the same physical player (REQUIREMENTS Option 2: connecting to a mock secondary device), so playback state should be shared, and actions on one should be reflected on the other.

### Sub-project 1: display on the player

Forward-facing screen on the front of the player, below the turntable, between left/right speakers.

1. **Playback page**: play/pause/resume, prev/next, forward/backward scrubbing. Scrubbing physically moves the needle: the arm lifts, swings to the groove for the target time (shown on a top-down platter view in place of the art), then lowers and resumes. When idle (not touched), it fades to album artwork with album name, artist name, and song name.
2. **Lyrics page**: time-synced lyrics like Apple Music/Spotify, the current line highlighted as it plays (line-level timing, an accepted compromise: LRC has no per-letter timing). Tapping a line seeks to it.

Signifiers/affordances:
- While a song plays, warn the user **not to touch the needle arm** and to tap play/pause on the display instead.
- Two physical knobs at the bottom-right of the top view (the traditional spot). Simulate them from the Testing region; the display reacts when either changes:
  - **Volume knob** → an arched dial-gauge / panel-meter overlay.
  - **Playback-mode knob** (bottom one): 33 RPM, 45 RPM, or Bluetooth → show the mode's name and a universally recognized symbol.
  - **Speed can't change while a record plays** (knob locks, display explains), and the player detects disc size (12″ LP = 33⅓, 7″ single = 45); at a mismatched speed the needle won't drop. Signifiers: lock icon on the speed chip, amber "Set speed to …" chip, disc size on Now Playing and in "Detected".

Records: **Ctrl** by SZA (2 discs, Sides A–D) and **The Lo-Fis** by Steve Lacy (1 disc, Sides A–B), with side/track timestamps from the user. When a side ends, the display tells the user to flip the record (same disc), swap discs (other disc) or put on a new album, offering every side plus the other albums; choosing one shows the physical step, then "detected" with the new artwork, then the needle drops. Lyrics are fetched at runtime from **LRCLIB** (free, no API key, CORS `*`): `GET https://lrclib.net/api/get/{id}`, `syncedLyrics` (LRC, `[mm:ss.xx] line`, times relative to the song, so offset by `track.start`). IDs were matched by title + song length. Never hardcode lyrics into the repo or write them from memory.

### Sub-project 2: mobile companion app

Two main sections:

1. **Health telemetry**: a headline quality indicator at the top with all four tiers (Excellent / Good / Fair / Poor), derived from the sensors: belt (platter turning, speed calibrated), stylus/needle cleanliness, ambient air quality (dust risk), vibration, audio clipping from the stylus, and tonearm parallel to the record (calibration).
2. **Library**: show off the collection (e.g. special/limited editions) plus listening insights like stats.fm: heatmaps and listening statistics, fed by the player auto-detecting which record/song is playing.

This covers REQUIREMENTS Option 3, which also requires **4 selectable scenarios/user profiles** in the Testing region that load different data into the UI.
