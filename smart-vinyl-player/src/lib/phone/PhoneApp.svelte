<script>
  // Companion app. Shares state with the player, so controls here move the real deck.
  import { fly } from 'svelte/transition'
  import { player, MODES, toggle, next, prev, now, setVolume, scrubStart, scrubTo, scrubEnd, openChanger } from '../player.svelte.js'
  import { profiles } from '../scenarios.js'
  import { discLabel } from '../records.js'
  import Icon from '../Icon.svelte'
  import ModeIcon from '../ModeIcon.svelte'
  import Health from './Health.svelte'
  import Library from './Library.svelte'
  import PhonePicker from './PhonePicker.svelte'

  let tab = $state('health')
  const { record, side, track } = $derived(now())
  const mode = $derived(MODES[player.mode])
  const profile = $derived(profiles[player.profile])

  let expanded = $state(false) // full Now Playing sheet, opened by tapping the mini player
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, '0')}`
  const songPct = $derived(((player.time - track.start) / (track.end - track.start)) * 100)
  const upNext = $derived.by(() => {
    if (player.trackIndex < side.last) return `Up next: ${record.tracks[player.trackIndex + 1].title}`
    const after = record.sides[player.sideIndex + 1]
    if (!after) return `Last song on ${record.title}`
    return `Last song on Side ${side.name}. ${after.disc === side.disc ? 'Flip' : 'Swap in Disc ' + after.disc} for Side ${after.name}.`
  })
</script>

<!-- pointerup can land anywhere (and the display may not be on screen), so drop the needle from here too -->
<svelte:window onkeydown={(e) => e.key === 'Escape' && (expanded = false)} onpointerup={scrubEnd} />

{#snippet volume()}
  <!-- remote volume for the player's speakers -->
  <div class="vol" role="group" aria-label="Speaker volume">
    <button onclick={() => setVolume(player.volume - 5, 'phone')} aria-label="Volume down"><Icon name="volDown" size={20} /></button>
    <input
      type="range"
      min="0"
      max="100"
      value={player.volume}
      oninput={(e) => setVolume(+e.currentTarget.value, 'phone')}
      style:--pct="{player.volume}%"
      aria-label="Speaker volume"
    />
    <button onclick={() => setVolume(player.volume + 5, 'phone')} aria-label="Volume up"><Icon name="volUp" size={20} /></button>
    <span class="v">{player.volume}</span>
  </div>
{/snippet}

<div class="phone">
  <div class="status"><span>9:41</span><span class="notch"></span><span>5G ▮</span></div>

  <header>
    <div>
      <p class="hi">My turntable</p>
      <p class="conn"><span class="dot"></span> Connected · <ModeIcon id={mode.id} size={12} /> {mode.label} · Vol {player.volume}</p>
    </div>
  </header>

  {#if player.sideDone && !player.changer && !player.swap}
    <!-- push notification from the player; the picker itself was dismissed with "Not now" -->
    <button class="notice" onclick={openChanger}>
      <ModeIcon id="33" size={18} />
      <span><b>Side {side.name} is over.</b> Tap to flip, swap discs or pick a new album.</span>
    </button>
  {/if}

  <div class="now">
    <button class="open" onclick={() => (expanded = true)} aria-expanded={expanded} aria-label="Show what's playing">
      <img src={record.artwork} alt="" />
      <span class="txt"><b>{track.title}</b><span>{record.artist} · Side {side.name}</span></span>
    </button>
    <button class="ctl" onclick={prev} aria-label="Previous"><Icon name="prev" /></button>
    <button class="ctl" onclick={toggle} aria-label={player.playing ? 'Pause' : 'Play'}><Icon name={player.playing ? 'pause' : 'play'} /></button>
    <button class="ctl" onclick={next} aria-label="Next"><Icon name="next" /></button>
    <div class="prog" style:width="{((player.time - side.start) / (side.end - side.start)) * 100}%"></div>
  </div>

  {@render volume()}

  <main>
    {#if tab === 'health'}
      <Health {profile} />
    {:else}
      <Library {profile} />
    {/if}
  </main>

  {#if expanded}
    <section class="sheet" transition:fly={{ y: 500, duration: 300 }} aria-label="Now playing">
      <button class="collapse" onclick={() => (expanded = false)} aria-label="Collapse"><Icon name="chevronDown" size={30} /></button>
      <button class="side-chip" onclick={openChanger} aria-label="Change side or record">Side {side.name} ⇄</button>
      <img class="big-art" src={record.artwork} alt="{record.title} cover" />
      <h2>{track.title}</h2>
      <p class="sub">{record.artist} — {record.title}</p>
      <p class="meta">Side {side.name} · Song {player.trackIndex - side.first + 1} of {side.last - side.first + 1} · {discLabel(record)} · {mode.label}</p>
      <!-- scrubbing here moves the player's tonearm (lift, swing, drop), same as on the display -->
      <input
        class="song-bar"
        type="range"
        min={track.start}
        max={track.end}
        step="0.1"
        value={player.time}
        onpointerdown={scrubStart}
        oninput={(e) => scrubTo(Math.min(+e.currentTarget.value, track.end - 0.5))}
        onchange={scrubEnd}
        style:--pct="{songPct}%"
        aria-label="Scrub through {track.title}"
      />
      <div class="song-times">
        <span>{fmt(player.time - track.start)}</span>
        {#if player.arm.cueing}<span class="cueing">Moving the needle…</span>{/if}
        <span>-{fmt(track.end - player.time)}</span>
      </div>
      <div class="transport">
        <button onclick={prev} aria-label="Previous"><Icon name="prev" size={32} /></button>
        <button class="big" onclick={toggle} aria-label={player.playing ? 'Pause' : 'Play'}><Icon name={player.playing ? 'pause' : 'play'} size={34} /></button>
        <button onclick={next} aria-label="Next"><Icon name="next" size={32} /></button>
      </div>
      {@render volume()}
      <p class="up-next">{upNext}</p>
    </section>
  {/if}

  {#if player.changer || player.swap}
    <PhonePicker />
  {/if}

  <nav>
    <button class:on={tab === 'health'} onclick={() => (tab = 'health')}>
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h4l2-5 4 10 2-5h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" /></svg>
      Health
    </button>
    <button class:on={tab === 'library'} onclick={() => (tab = 'library')}>
      <ModeIcon id="33" size={22} />
      Library
    </button>
  </nav>
</div>

<style>
  .phone {
    position: relative;
    width: 380px;
    aspect-ratio: 1 / 1.41;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 36px;
    background: #111114;
    color: #fff;
    box-shadow: 0 0 0 10px #1b1b1f, 0 20px 50px rgba(0, 0, 0, 0.35);
    font-size: 14px;
  }
  .status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 26px 0;
    font-size: 12px;
    font-weight: 600;
  }
  .notch {
    width: 90px;
    height: 22px;
    border-radius: 12px;
    background: #000;
  }
  header {
    padding: 10px 18px 8px;
  }
  p {
    margin: 0;
  }
  .hi {
    font-size: 20px;
    font-weight: 700;
  }
  .conn {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #a1a1aa;
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #0ca30c;
  }
  .notice {
    text-align: left;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 14px 8px;
    padding: 10px 12px;
    border-radius: 14px;
    background: #2a2a33;
    font-size: 12px;
    color: #e4e4e7;
  }
  .now {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 14px;
    padding: 8px;
    border-radius: 14px;
    background: #1c1c22;
    overflow: hidden;
  }
  .open {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0;
    text-align: left;
  }
  .now img {
    width: 40px;
    border-radius: 6px;
  }
  .txt {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: 13px;
  }
  .txt b {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .txt span {
    color: #a1a1aa;
    font-size: 12px;
  }
  button {
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .ctl {
    flex-shrink: 0;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
  }
  .sheet {
    position: absolute;
    inset: 34px 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 24px 18px;
    background: linear-gradient(180deg, color-mix(in oklab, var(--art-color) 60%, #111114), #111114 75%);
    text-align: center;
  }
  .sheet > * {
    flex-shrink: 0; /* overflow:hidden on the title would otherwise let it collapse */
  }
  .side-chip {
    position: absolute;
    top: 6px;
    right: 14px;
    padding: 4px 10px;
    border-radius: 999px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
    font-size: 11px;
    color: #e4e4e7;
  }
  .collapse {
    display: grid;
    place-items: center;
    width: 44px;
    height: 34px;
    color: rgba(255, 255, 255, 0.8);
  }
  .big-art {
    width: 180px;
    margin: 2px 0 12px;
    border-radius: 10px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  }
  .sheet h2 {
    margin: 0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 21px;
  }
  .sub {
    margin-top: 2px;
    font-size: 14px;
    color: #d4d4d8;
  }
  .meta {
    margin-top: 4px;
    font-size: 11px;
    color: #a1a1aa;
  }
  .song-bar {
    align-self: stretch;
    height: 4px;
    margin: 18px 0 0;
    appearance: none;
    border-radius: 2px;
    background: linear-gradient(90deg, #fff var(--pct), rgba(255, 255, 255, 0.2) var(--pct));
    cursor: pointer;
  }
  .song-bar::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
  }
  .song-bar::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border: 0;
    border-radius: 50%;
    background: #fff;
  }
  .cueing {
    color: #fff;
  }
  .song-times {
    align-self: stretch;
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 11px;
    color: #a1a1aa;
    font-variant-numeric: tabular-nums;
  }
  .transport {
    display: flex;
    align-items: center;
    gap: 28px;
    margin-top: 4px;
  }
  .transport button {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }
  .transport .big {
    width: 62px;
    height: 62px;
    background: #fff;
    color: #000;
  }
  .sheet .vol {
    align-self: stretch;
    margin: 12px 0 0;
  }
  .up-next {
    margin-top: 12px;
    font-size: 12px;
    color: #d4d4d8;
  }
  .vol {
    --fill: color-mix(in oklab, var(--art-color), white 45%); /* follows the artwork */
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 8px 14px 0;
    padding: 4px 10px 4px 4px;
    border-radius: 14px;
    background: #1c1c22;
  }
  @supports (color: oklch(from red l c h)) {
    .vol {
      --fill: oklch(from var(--art-color) 0.75 0.12 h);
    }
  }
  .vol button {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    color: #d4d4d8;
  }
  .vol button:active {
    background: rgba(255, 255, 255, 0.1);
  }
  .vol input {
    flex: 1;
    height: 6px;
    appearance: none;
    border-radius: 3px;
    background: linear-gradient(90deg, var(--fill) var(--pct), #3a3a44 var(--pct));
    cursor: pointer;
  }
  .vol input::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
  }
  .vol input::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border: 0;
    border-radius: 50%;
    background: #fff;
  }
  .v {
    width: 26px;
    text-align: right;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    color: #d4d4d8;
  }
  .prog {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 2px;
    background: #fff;
  }
  main {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px 16px;
    scrollbar-width: none;
  }
  nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 6px 0 14px;
    border-top: 1px solid #222228;
    background: #141418;
  }
  nav button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-size: 11px;
    color: #71717a;
  }
  nav button.on {
    color: #fff;
  }
</style>
