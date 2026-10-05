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
npm test         # node assert checks for LRC parsing + health tiers (src/lib/logic.test.js)
```

No linter or type-checker. `npm run build` surfaces Svelte a11y warnings; keep it warning-free.

## Architecture

- Components use Svelte 5 runes (`$state`, `$props`, `$derived`, `$effect`), not Svelte 4 syntax (`export let`, `$:`).
- **`src/lib/player.svelte.js` is the single source of truth** for the physical player: one module-level `Audio` element plus an exported `$state` object (track, playing, time, volume, mode, profile, detected plays). Both device UIs and the testing panel import it directly and call its functions (`toggle`, `seek`, `setVolume`, `setMode`, `reachForTonearm`, ...); there is no prop drilling. That's how phone actions show up on the display (Option 2).
- Physical-knob turns set `player.knob` to a fresh object; `PlayerDisplay` watches it in an `$effect` to show a timed overlay. `player.needleAlert` works the same way for the tonearm warning.
- `App.svelte` is the master page: a view switch (`display` / `phone`), the placement graphic, and `TestPanel` (stands in for physical actions: knobs, hand near tonearm, owner profile).
- `src/lib/display/` = player touchscreen (720px wide, `aspect-ratio: 1.41`). `src/lib/phone/` = companion app (380px wide, `1 / 1.41`). Device UIs are always dark; only the surrounding page follows `prefers-color-scheme` via tokens in `src/app.css`.
- `src/lib/tracks.js`: the two playable songs (audio in `public/audio/`, served as `/audio/<file>.mp3`), artwork hotlinked from Apple's mzstatic CDN, LRCLIB ids. `lyricsOffset` per track is the calibration knob if lyrics drift from the audio.
- `src/lib/scenarios.js`: the 4 owner profiles (sensor readings, collection, top artists, generated 7×24 heatmap), sensor thresholds and the overall-tier rule (mean of sensor levels, but one Poor sensor caps overall at Fair).
- Health tiers use the dataviz status palette (`#0ca30c / #fab219 / #ec835a / #d03b3b`) and always pair color with a glyph + label.

## Design spec

**Master page** — one page that chooses between the two UIs below. Must still satisfy Level 0: a Device UI region plus a Testing region with project title, author name, write-up link, a graphic showing where the UI sits on the physical object, and an info button explaining the simulation controls.

**Aspect ratio** — both device UIs are fixed at **1.41:1 (ISO A-series, √2)**: the player display landscape, the phone portrait (1:1.41). The assignment says the UI does not need to be responsive.

**Shared state** — both UIs represent the same physical player (REQUIREMENTS Option 2: connecting to a mock secondary device), so playback state should be shared, and actions on one should be reflected on the other.

### Sub-project 1: display on the player

Forward-facing screen on the front of the player, below the turntable, between left/right speakers.

1. **Playback page**: play/pause/resume, prev/next, forward/backward scrubbing. When idle (not touched), it fades to album artwork with album name, artist name, and song name.
2. **Lyrics page**: time-synced lyrics like Apple Music/Spotify, the current line highlighted as it plays (line-level timing, an accepted compromise: LRC has no per-letter timing). Tapping a line seeks to it.

Signifiers/affordances:
- While a song plays, warn the user **not to touch the needle arm** and to tap play/pause on the display instead.
- Two physical knobs at the bottom-right of the top view (the traditional spot). Simulate them from the Testing region; the display reacts when either changes:
  - **Volume knob** → an arched dial-gauge / panel-meter overlay.
  - **Playback-mode knob** (bottom one): 33 RPM, 45 RPM, or Bluetooth → show the mode's name and a universally recognized symbol.

Tracks: "Broken Clocks" by SZA (album *Ctrl*) and "Sunshine" by Steve Lacy ft. Fousheé (album *Gemini Rights*). Lyrics are fetched at runtime from **LRCLIB** (free, no API key, CORS `*`): `GET https://lrclib.net/api/get/{id}` and read `syncedLyrics` (LRC format, `[mm:ss.xx] line`). IDs that match the local MP3 durations: Broken Clocks `34191638` (232 s), Sunshine `2840510` (293 s). Never hardcode lyrics into the repo or write them from memory.

### Sub-project 2: mobile companion app

Two main sections:

1. **Health telemetry**: a headline quality indicator at the top with all four tiers (Excellent / Good / Fair / Poor), derived from the sensors: belt (platter turning, speed calibrated), stylus/needle cleanliness, ambient air quality (dust risk), vibration, audio clipping from the stylus, and tonearm parallel to the record (calibration).
2. **Library**: show off the collection (e.g. special/limited editions) plus listening insights like stats.fm: heatmaps and listening statistics, fed by the player auto-detecting which record/song is playing.

This covers REQUIREMENTS Option 3, which also requires **4 selectable scenarios/user profiles** in the Testing region that load different data into the UI.
