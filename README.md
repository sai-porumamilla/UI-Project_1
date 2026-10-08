# Smart Vinyl Player

A mock-up of a smart record player for UI Project 1: a touchscreen on the front
of the turntable, plus a companion phone app that tracks the player's health,
shows your collection and listening stats, and works as a remote.

- **Live app:** <https://sai-porumamilla.github.io/UI-Project_1/>
- **Project write-up:** <https://sai-porumamilla.github.io/smart-vinyl-player/>

## Run it

The app lives in `smart-vinyl-player/` (Svelte 5 + Vite):

```sh
cd smart-vinyl-player
npm install
npm run dev     # local dev server
npm test        # logic checks
npm run build   # production build
```

Pushing to `main` deploys to GitHub Pages through
`.github/workflows/deploy.yml`.

## What's in the repo

- `smart-vinyl-player/`: the app. See `CLAUDE.md` for how it's put together.
- `interview.md`: anonymized notes from the three user interviews.
- `REQUIREMENTS.md`: the assignment.

Lyrics load at runtime from [LRCLIB](https://lrclib.net), and album artwork
is loaded from Apple Music and Deezer, so the app needs an internet connection.
