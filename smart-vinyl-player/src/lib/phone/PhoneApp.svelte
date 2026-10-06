<script>
  // Companion app. Shares state with the player, so controls here move the real deck.
  import { player, MODES, toggle, next, now } from '../player.svelte.js'
  import { profiles } from '../scenarios.js'
  import Icon from '../Icon.svelte'
  import ModeIcon from '../ModeIcon.svelte'
  import Health from './Health.svelte'
  import Library from './Library.svelte'

  let tab = $state('health')
  const { record, side, track } = $derived(now())
  const mode = $derived(MODES[player.mode])
  const profile = $derived(profiles[player.profile])
</script>

<div class="phone">
  <div class="status"><span>9:41</span><span class="notch"></span><span>5G ▮</span></div>

  <header>
    <div>
      <p class="hi">{profile.name}'s turntable</p>
      <p class="conn"><span class="dot"></span> Connected · <ModeIcon id={mode.id} size={12} /> {mode.label} · Vol {player.volume}</p>
    </div>
  </header>

  {#if player.sideDone || player.swap}
    <!-- push notification from the player -->
    <div class="notice" role="status">
      <ModeIcon id="33" size={18} />
      {#if player.swap}
        <span>{player.swap.phase === 'place' ? 'Changing the record…' : 'New side detected on the player'}</span>
      {:else}
        <span><b>Side {side.name} is over.</b> Choose what to put on next on the player.</span>
      {/if}
    </div>
  {/if}

  <div class="now">
    <img src={record.artwork} alt="" />
    <div class="txt"><b>{track.title}</b><span>{record.artist} · Side {side.name}</span></div>
    <button onclick={toggle} aria-label={player.playing ? 'Pause' : 'Play'}><Icon name={player.playing ? 'pause' : 'play'} /></button>
    <button onclick={next} aria-label="Next"><Icon name="next" /></button>
    <div class="prog" style:width="{((player.time - side.start) / (side.end - side.start)) * 100}%"></div>
  </div>

  <main>
    {#if tab === 'health'}
      <Health {profile} />
    {:else}
      <Library {profile} />
    {/if}
  </main>

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
  .now button {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
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
