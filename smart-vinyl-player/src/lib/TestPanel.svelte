<script>
  // Project info + controls that stand in for physically using the player.
  import { player, MODES, setVolume, setMode, reachForTonearm, nearSideEnd } from './player.svelte.js'
  import { profiles } from './scenarios.js'
  import ModeIcon from './ModeIcon.svelte'

  let { wide = false } = $props() // three columns under the side-by-side view
  let showInfo = $state(false)
</script>

<div class="panel" class:wide>
  <div class="group">
    <h1>Smart Vinyl Player</h1>
    <p class="dim">by Sai Porumamilla · <a href="https://sai-porumamilla.github.io/smart-vinyl-player/" target="_blank" rel="noreferrer">Project write-up</a></p>
    <p>A turntable with a front touchscreen, two physical knobs, and sensors that watch its health. A companion app shows that health and your collection.</p>

    <button class="info" onclick={() => (showInfo = !showInfo)} aria-expanded={showInfo}>ⓘ How the simulation works</button>
    {#if showInfo}
      <ul class="help">
        <li><b>Display & phone</b>: tap them like the real thing. They share one player, so playing from the phone shows up on the display.</li>
        <li><b>Volume knob</b>: drag it to turn the physical knob. The display shows an arched meter.</li>
        <li><b>Mode knob</b>: click a position to switch between 33⅓ RPM, 45 RPM and Bluetooth. The display shows the mode.</li>
        <li><b>Reach for tonearm</b>: simulates a hand near the arm while the needle is down. The display asks you to tap pause instead.</li>
        <li><b>Owner profile</b>: loads one of four owners' sensor readings, collection and listening history into the phone app.</li>
        <li><b>Scrubbing</b>: in 33⅓ or 45 mode, dragging the scrub bar, ±10 s or tapping a lyric makes the automatic tonearm lift, swing to that spot on the record and lower again.</li>
        <li><b>Skip to end of side</b>: jumps to the last few seconds of the side so you can see the flip / swap-disc prompt without waiting. Ctrl is a 2-disc album (Sides A–D); The Lo-Fis has Sides A and B.</li>
        <li>Leave the Now Playing screen untouched for 8 s and it fades to the album art.</li>
      </ul>
    {/if}
  </div>

  <div class="group">
    <h2>Physical controls</h2>
    <label class="knob">
      <span>Volume knob <b>{player.volume}</b></span>
      <input type="range" min="0" max="100" value={player.volume} oninput={(e) => setVolume(+e.currentTarget.value)} />
    </label>

    <span class="label">Mode knob</span>
    <div class="modes" role="radiogroup" aria-label="Mode knob">
      {#each MODES as m, i}
        <button role="radio" aria-checked={player.mode === i} class:on={player.mode === i} onclick={() => setMode(i)}>
          <ModeIcon id={m.id} size={20} />{m.label}
        </button>
      {/each}
    </div>

    <div class="row">
      <button class="act" onclick={reachForTonearm}>✋ Reach for tonearm</button>
      <button class="act" onclick={nearSideEnd}>⏭ Skip to end of side</button>
    </div>
    {#if !player.playing}<p class="dim">Start a song first. The warning only shows while the needle is down.</p>{/if}
  </div>

  <div class="group">
    <h2>Owner profile</h2>
    <div class="profiles">
      {#each profiles as p, i}
        <button class:on={player.profile === i} onclick={() => (player.profile = i)}>
          <b>{p.name}</b><span>{p.blurb}</span>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .panel,
  .group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .panel.wide {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    gap: 28px;
    align-items: start;
  }
  .wide h2 {
    margin-top: 0;
  }
  .panel {
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--panel);
  }
  h2 {
    margin: 14px 0 2px;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text);
  }
  button {
    font: inherit;
    color: var(--text-h);
    cursor: pointer;
  }
  .info {
    align-self: flex-start;
    padding: 6px 10px;
    border: 1px solid var(--accent);
    border-radius: 8px;
    background: var(--accent-bg);
    color: var(--accent);
  }
  .help {
    margin: 0;
    padding-left: 18px;
    font-size: 13px;
  }
  .help li {
    margin: 4px 0;
  }
  .knob {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    color: var(--text-h);
  }
  .knob input {
    accent-color: var(--accent);
  }
  .label {
    font-size: 14px;
    color: var(--text-h);
  }
  .modes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  .modes button,
  .act,
  .profiles button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
  }
  .modes button {
    justify-content: center;
    font-size: 13px;
  }
  .on {
    border-color: var(--accent) !important;
    background: var(--accent-bg) !important;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  }
  .act:hover,
  .modes button:hover,
  .profiles button:hover {
    border-color: var(--accent);
  }
  .profiles {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .profiles button {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    text-align: left;
  }
  .profiles span {
    font-size: 12px;
    color: var(--text);
  }
</style>
