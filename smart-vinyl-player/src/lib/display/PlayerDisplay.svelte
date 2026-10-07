<script>
  // Front-facing touchscreen on the player, between the two speakers.
  import { onMount } from 'svelte'
  import { fade, scale } from 'svelte/transition'
  import { player, MODES, now, speedLocked, wrongSpeed, toggle, next, prev, skip, scrubStart, scrubTo, scrubEnd, openChanger } from '../player.svelte.js'
  import Icon from '../Icon.svelte'
  import ModeIcon from '../ModeIcon.svelte'
  import VolumeGauge from './VolumeGauge.svelte'
  import Lyrics from './Lyrics.svelte'
  import Tonearm from './Tonearm.svelte'
  import Changer from './Changer.svelte'
  import { speedFor, discLabel } from '../records.js'

  const IDLE_MS = 8000 // untouched this long on Now Playing -> fade to artwork
  const KNOB_MS = 1800
  const WARN_MS = 3500 // speed lock / wrong-speed explanations stay up longer
  const NEEDLE_MS = 5000

  let page = $state('playback')
  let idle = $state(false)
  let knobShown = $state(null)
  let needleShown = $state(false)
  let timer

  const { record, side, track } = $derived(now())
  const pct = $derived(((player.time - side.start) / (side.end - side.start)) * 100)
  const mode = $derived(MODES[player.mode])
  const locked = $derived(speedLocked())
  const mismatch = $derived(wrongSpeed())
  const cut = $derived(MODES.find((m) => m.id === speedFor(record))) // speed this disc was made for
  const needleDown = $derived(player.playing && mode.id !== 'bt' && !player.arm.cueing)

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  function wake() {
    idle = false
    clearTimeout(timer)
    timer = setTimeout(() => (idle = true), IDLE_MS)
  }
  onMount(() => {
    wake()
    return () => clearTimeout(timer)
  })

  $effect(() => {
    if (!player.knob) return
    const kind = player.knob.kind // read once: reading knobShown here would re-trigger this effect
    knobShown = kind
    const id = setTimeout(() => (knobShown = null), ['volume', 'mode'].includes(kind) ? KNOB_MS : WARN_MS)
    return () => clearTimeout(id)
  })

  $effect(() => {
    if (!player.needleAlert) return
    needleShown = true
    const id = setTimeout(() => (needleShown = false), NEEDLE_MS)
    return () => clearTimeout(id)
  })
  // Pausing (the action we asked for) dismisses the warning.
  $effect(() => {
    if (!player.playing) needleShown = false
  })
</script>

<svelte:window onpointerup={scrubEnd} />

<div class="screen" role="application" aria-label="Player touchscreen" onpointerdown={wake} style:--art="url({record.artwork})">
  <header>
    <nav>
      <button class:on={page === 'playback'} onclick={() => (page = 'playback')}>Now Playing</button>
      <button class:on={page === 'lyrics'} onclick={() => (page = 'lyrics')}>Lyrics</button>
    </nav>
    <div class="status">
      <button class="chip side-chip" onclick={openChanger} aria-label="Change side or record">
        {record.sides.length > 2 ? `Disc ${side.disc} · ` : ''}Side {side.name} <span aria-hidden="true">⇄</span>
      </button>
      <span class="chip" class:warn-chip={mismatch} title={locked ? 'Speed is locked while the record plays' : ''}>
        {#if locked}<Icon name="lock" size={13} />{/if}
        <ModeIcon id={mode.id} size={16} />
        {mismatch ? `Set speed to ${cut.label}` : mode.label}
      </span>
      <span class="chip">Vol {player.volume}</span>
    </div>
  </header>

  {#if page === 'playback'}
    <section class="playback">
      <div class="disc-wrap">
        {#if player.arm.cueing}
          <div class="cue" transition:fade={{ duration: 150 }}><Tonearm /></div>
        {:else}
          <div class="disc" class:spin={player.playing && mode.rpm} style:--rpm={mode.rpm || 33}></div>
          <img class="art" src={record.artwork} alt="{record.title} cover" />
        {/if}
      </div>
      <div class="meta">
        <span class="eyebrow">{player.sideDone ? `Side ${side.name} finished` : player.arm.cueing ? 'Moving the needle' : player.playing ? 'Playing' : 'Paused'} · {mode.label}</span>
        <h2>{track.title}</h2>
        <p>{record.artist} — {record.title}</p>
        <p class="dim">Side {side.name} · Song {player.trackIndex - side.first + 1} of {side.last - side.first + 1} · {discLabel(record)}</p>

        <!-- one scrub bar per side, like the record itself; marks show the gaps between songs -->
        <div class="scrub-wrap">
          {#each record.tracks.slice(side.first + 1, side.last + 1) as t}
            <span class="tick" style:left="{((t.start - side.start) / (side.end - side.start)) * 100}%"></span>
          {/each}
        <input
          class="scrub"
          type="range"
          min={side.start}
          max={side.end}
          step="0.1"
          value={player.time}
          onpointerdown={scrubStart}
          oninput={(e) => scrubTo(+e.currentTarget.value)}
          onchange={scrubEnd}
          style:--pct="{pct}%"
          aria-label="Scrub through Side {side.name}"
        />
        </div>
        <div class="times"><span>{fmt(player.time - side.start)}</span><span>-{fmt(Math.max(0, side.end - player.time))}</span></div>

        <div class="controls">
          <button onclick={prev} aria-label="Previous"><Icon name="prev" size={30} /></button>
          <button onclick={() => skip(-10)} aria-label="Back 10 seconds"><Icon name="back10" size={30} /></button>
          <button class="big" class:pulse={needleShown} onclick={toggle} aria-label={player.playing ? 'Pause' : 'Play'}>
            <Icon name={player.playing ? 'pause' : 'play'} size={40} />
          </button>
          <button onclick={() => skip(10)} aria-label="Forward 10 seconds"><Icon name="fwd10" size={30} /></button>
          <button onclick={next} aria-label="Next"><Icon name="next" size={30} /></button>
        </div>
      </div>
    </section>
  {:else}
    <section class="lyrics-page">
      <Lyrics />
      <div class="mini">
        <button onclick={prev} aria-label="Previous"><Icon name="prev" /></button>
        <button class="big" class:pulse={needleShown} onclick={toggle} aria-label={player.playing ? 'Pause' : 'Play'}>
          <Icon name={player.playing ? 'pause' : 'play'} size={28} />
        </button>
        <button onclick={next} aria-label="Next"><Icon name="next" /></button>
        <div class="bar"><div style:width="{pct}%"></div></div>
        <span class="t">{fmt(player.time - side.start)}</span>
      </div>
    </section>
  {/if}

  <footer class:show={needleDown}>
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20 L14 10 M14 10 L19 3 M12 12l3 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" /></svg>
    Needle is on the record. Please don't lift the tonearm. Tap <b>⏸</b> to pause.
  </footer>

  {#if idle && page === 'playback'}
    <button class="idle" transition:fade={{ duration: 700 }} aria-label="Wake display">
      <img src={record.artwork} alt="" />
      <div>
        <h1>{track.title}</h1>
        <p>{record.artist}</p>
        <p class="dim">{record.title} · Side {side.name}</p>
      </div>
    </button>
  {/if}

  {#if player.changer || player.swap}
    <Changer />
  {/if}

  {#if player.arm.cueing && page === 'lyrics'}
    <div class="overlay" transition:fade={{ duration: 150 }}>
      <div class="card"><Tonearm size={270} /></div>
    </div>
  {/if}

  {#if knobShown}
    <!-- informational HUD: taps pass through to the controls underneath -->
    <div class="overlay hud" transition:fade={{ duration: 200 }}>
      <div class="card" transition:scale={{ start: 0.92, duration: 200 }}>
        {#if knobShown === 'volume'}
          <VolumeGauge value={player.volume} />
        {:else if knobShown === 'locked'}
          <Icon name="lock" size={64} />
          <h2 class="mode-name">Speed locked</h2>
          <p class="dim">The needle is on the record. Pause first, then change the speed.</p>
          <button class="big pulse hud-action" onclick={toggle}><Icon name="pause" size={30} /> Pause</button>
        {:else if knobShown === 'mismatch'}
          <!-- disc size is what tells the speed: highlight the size on the platter -->
          <svg width="220" height="110" viewBox="0 0 220 110" aria-hidden="true">
            {#each [{ size: 12, r: 46, x: 62 }, { size: 7, r: 28, x: 170 }] as d}
              <circle cx={d.x} cy="52" r={d.r} fill="#141418" stroke={d.size === record.size ? 'var(--glow)' : 'rgba(255,255,255,.25)'} stroke-width={d.size === record.size ? 3 : 1.5} />
              <circle cx={d.x} cy="52" r={d.r * 0.32} fill={d.size === record.size ? 'var(--glow)' : 'rgba(255,255,255,.2)'} />
              <text x={d.x} y="108" text-anchor="middle" font-size="12" fill={d.size === record.size ? '#fff' : 'rgba(255,255,255,.45)'}>{d.size}″ · {d.size === 7 ? '45' : '33⅓'}</text>
            {/each}
          </svg>
          <h2 class="mode-name">This is a {discLabel(record)}</h2>
          <p class="dim">It plays at {cut.label}. Turn the speed knob to {cut.label} to play it.</p>
        {:else}
          <ModeIcon id={mode.id} size={96} />
          <h2 class="mode-name">{mode.label}</h2>
          <p class="dim">{mode.id === 'bt' ? 'Speakers ready for your phone' : 'Platter speed set'}</p>
        {/if}
      </div>
    </div>
  {/if}

  {#if needleShown}
    <div class="overlay warn" transition:fade={{ duration: 200 }} role="alert">
      <div class="card">
        <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2 L23 21 H1 Z" fill="none" stroke="#fab219" stroke-width="1.8" stroke-linejoin="round" />
          <path d="M12 9v5" stroke="#fab219" stroke-width="2" stroke-linecap="round" /><circle cx="12" cy="17.3" r="1.2" fill="#fab219" />
        </svg>
        <h2>Hands off the tonearm</h2>
        <p>Lifting the needle mid-song can scratch the record.<br />Tap pause instead and the arm lifts itself.</p>
        <button class="big pulse" onclick={toggle}><Icon name="pause" size={36} /> Pause</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .screen {
    --glow: #3987e5;
    position: relative;
    width: 720px;
    aspect-ratio: 1.41;
    overflow: hidden;
    border-radius: 18px;
    background: #0d0d10;
    color: #fff;
    box-shadow: 0 0 0 10px #1b1b1f, 0 20px 50px rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
    user-select: none;
  }
  .screen::before {
    content: '';
    position: absolute;
    inset: -40px;
    background: var(--art) center / cover;
    filter: blur(60px) saturate(1.4);
    opacity: 0.35;
    pointer-events: none;
  }
  header,
  section,
  footer {
    position: relative;
  }
  button {
    font: inherit;
    color: inherit;
    border: 0;
    background: none;
    cursor: pointer;
  }
  h2 {
    margin: 4px 0;
    font-size: 30px;
    color: #fff;
  }
  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.75);
  }
  .dim {
    color: rgba(255, 255, 255, 0.5);
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px 0;
  }
  nav {
    display: flex;
    gap: 4px;
    padding: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
  }
  nav button {
    padding: 8px 18px;
    border-radius: 999px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
  }
  nav button.on {
    background: rgba(255, 255, 255, 0.92);
    color: #000;
  }
  .status {
    display: flex;
    gap: 8px;
  }
  .warn-chip {
    color: #fab219 !important;
    box-shadow: inset 0 0 0 1px #fab219;
  }
  .chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
  }

  .playback {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 0 36px 0 26px;
  }
  .disc-wrap {
    position: relative;
    width: 310px;
    height: 250px;
    flex-shrink: 0;
  }
  .cue {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center start;
  }
  .art {
    position: absolute;
    inset: 0;
    width: 250px;
    border-radius: 6px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  }
  .disc {
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: 76px;
    aspect-ratio: 1;
    border-radius: 50%;
    background: repeating-radial-gradient(circle, #121212 0 2px, #1e1e1e 2px 3px);
  }
  .disc::after {
    content: '';
    position: absolute;
    inset: 36%;
    border-radius: 50%;
    background: var(--art) center / cover;
  }
  .disc.spin {
    /* one turn per (60 / rpm) seconds — real platter speed */
    animation: spin calc(60s / var(--rpm)) linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  .meta {
    flex: 1;
    min-width: 0;
  }
  .eyebrow {
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
  }
  .scrub-wrap {
    position: relative;
    margin: 22px 0 4px;
  }
  .tick {
    position: absolute;
    top: -6px;
    width: 2px;
    height: 6px;
    border-radius: 1px;
    background: rgba(255, 255, 255, 0.45);
  }
  .side-chip {
    border: 0;
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
  }
  .scrub {
    display: block;
    width: 100%;
    margin: 0;
    height: 6px;
    appearance: none;
    border-radius: 3px;
    background: linear-gradient(90deg, #fff var(--pct), rgba(255, 255, 255, 0.2) var(--pct));
    cursor: pointer;
  }
  .scrub::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
  }
  .scrub::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border: 0;
    border-radius: 50%;
    background: #fff;
  }
  .times {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.55);
    font-variant-numeric: tabular-nums;
  }
  .controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 18px;
  }
  .controls button,
  .mini button {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 50%;
  }
  .controls button:active,
  .mini button:active {
    background: rgba(255, 255, 255, 0.12);
  }
  button.big {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: #fff;
    color: #000;
  }

  .lyrics-page {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .mini {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 24px 10px;
  }
  .mini button.big {
    width: 52px;
    height: 52px;
  }
  .bar {
    flex: 1;
    height: 4px;
    margin-left: 12px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.2);
  }
  .bar div {
    height: 100%;
    border-radius: 2px;
    background: #fff;
  }
  .t {
    width: 40px;
    text-align: right;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    font-variant-numeric: tabular-nums;
  }

  footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 34px;
    font-size: 13px;
    color: #fab219;
    background: rgba(250, 178, 25, 0.1);
    transform: translateY(100%);
    transition: transform 0.3s;
  }
  footer.show {
    transform: none;
  }

  .idle {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    gap: 40px;
    padding: 0 56px;
    text-align: left;
    background: #000;
    overflow: hidden;
  }
  .idle::before {
    content: '';
    position: absolute;
    inset: -60px;
    background: var(--art) center / cover;
    filter: blur(70px) saturate(1.5);
    opacity: 0.6;
  }
  .idle > * {
    position: relative;
  }
  .idle img {
    width: 330px;
    border-radius: 8px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  }
  .idle h1 {
    margin: 0 0 8px;
    font-size: 36px;
    line-height: 1.1;
    color: #fff;
  }
  .idle p {
    font-size: 20px;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(6px);
  }
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 24px 36px;
    border-radius: 24px;
    background: rgba(20, 20, 24, 0.85);
    text-align: center;
  }
  .mode-name {
    font-size: 40px;
  }
  .hud {
    pointer-events: none;
  }
  .hud-action {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    width: auto !important;
    height: auto !important;
    margin-top: 12px;
    padding: 10px 24px 10px 18px;
    border-radius: 999px !important;
    font-size: 18px;
    font-weight: 700;
  }
  .warn .card {
    border: 2px solid #fab219;
    max-width: 440px;
  }
  .warn button.big {
    display: flex;
    align-items: center;
    gap: 8px;
    width: auto;
    height: auto;
    margin-top: 14px;
    padding: 12px 28px 12px 20px;
    border-radius: 999px;
    font-size: 20px;
    font-weight: 700;
  }
  .pulse {
    animation: pulse 1.1s ease-in-out infinite;
  }
  @keyframes pulse {
    50% {
      box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.25);
    }
  }
</style>
