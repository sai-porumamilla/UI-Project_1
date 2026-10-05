<script>
  // Master page: pick which device UI to show. Both share one player state.
  import PlayerDisplay from './lib/display/PlayerDisplay.svelte'
  import PhoneApp from './lib/phone/PhoneApp.svelte'
  import TestPanel from './lib/TestPanel.svelte'

  let view = $state('display')
</script>

<div class="page">
  <header>
    <div class="switch" role="tablist" aria-label="Choose interface">
      <button role="tab" aria-selected={view === 'display'} class:on={view === 'display'} onclick={() => (view = 'display')}>Player display</button>
      <button role="tab" aria-selected={view === 'phone'} class:on={view === 'phone'} onclick={() => (view = 'phone')}>Companion app</button>
    </div>
  </header>

  <main>
    <section class="device">
      <span class="tag">{view === 'display' ? 'Device UI: front touchscreen on the player' : 'Device UI: mobile companion app'}</span>
      {#if view === 'display'}<PlayerDisplay />{:else}<PhoneApp />{/if}

      <figure>
        <!-- Front view: turntable on top, display between the speakers, knobs top-right; phone beside. -->
        <svg viewBox="0 0 300 130" width="300" aria-label="Where this interface lives on the player">
          <ellipse cx="115" cy="28" rx="80" ry="7" fill="none" stroke="currentColor" />
          <rect x="35" y="18" width="160" height="6" fill="var(--border)" />
          <rect x="182" y="10" width="8" height="8" rx="2" fill={view === 'display' ? 'var(--accent)' : 'currentColor'} opacity=".7" />
          <rect x="170" y="12" width="8" height="6" rx="2" fill={view === 'display' ? 'var(--accent)' : 'currentColor'} opacity=".7" />
          <rect x="15" y="35" width="200" height="85" rx="6" fill="none" stroke="currentColor" />
          <circle cx="40" cy="78" r="16" fill="none" stroke="currentColor" />
          <circle cx="190" cy="78" r="16" fill="none" stroke="currentColor" />
          <rect x="68" y="50" width="94" height="56" rx="3"
            fill={view === 'display' ? 'var(--accent-bg)' : 'none'}
            stroke={view === 'display' ? 'var(--accent)' : 'currentColor'} stroke-width={view === 'display' ? 2 : 1} />
          <rect x="250" y="44" width="34" height="56" rx="6"
            fill={view === 'phone' ? 'var(--accent-bg)' : 'none'}
            stroke={view === 'phone' ? 'var(--accent)' : 'currentColor'} stroke-width={view === 'phone' ? 2 : 1} />
          <path d="M226 64 q8 8 0 16 M233 59 q12 13 0 26" fill="none" stroke="currentColor" stroke-dasharray="2 2" />
        </svg>
        <figcaption>
          {view === 'display'
            ? 'Front view: the touchscreen sits between the speakers, under the platter. The volume and mode knobs are on top, at the front right corner.'
            : 'The phone pairs with the player over Bluetooth / Wi-Fi.'}
        </figcaption>
      </figure>
    </section>

    <aside>
      <span class="tag">Testing UI</span>
      <TestPanel />
    </aside>
  </main>
</div>

<style>
  .page {
    width: 1180px;
    margin: 0 auto;
    padding: 24px;
    box-sizing: border-box;
  }
  header {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  .switch {
    display: flex;
    gap: 4px;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--panel);
  }
  .switch button {
    padding: 8px 20px;
    border: 0;
    border-radius: 999px;
    background: none;
    color: var(--text);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
  .switch button.on {
    background: var(--accent);
    color: #fff;
  }
  main {
    display: grid;
    grid-template-columns: 760px 1fr;
    gap: 28px;
    align-items: start;
  }
  section,
  aside {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .device {
    align-items: center;
  }
  .tag {
    align-self: flex-start;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text);
  }
  figure {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 16px 0 0;
    color: var(--text);
  }
  figcaption {
    max-width: 320px;
    font-size: 13px;
  }
</style>
