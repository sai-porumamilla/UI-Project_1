<script>
  // Project info + buttons to simulate using the turntable.
  let { onTogglePlay, onNextTrack, onCycleSpeed } = $props()
  let showInfo = $state(false)
</script>

<div class="panel">
  <h1>Smart Vinyl Player</h1>
  <p class="dim">by Sai Porumamilla &middot; <a href="#">Project write-up</a></p>
  <p>
    A turntable that shows the record and track it's playing and lets you pick a
    track by name. Buttons below stand in for physically using it.
  </p>

  <button class="info" onclick={() => (showInfo = !showInfo)}>
    &#9432; How the controls work
  </button>
  {#if showInfo}
    <ul class="help">
      <li><strong>Play / Pause</strong> — drop or lift the tonearm.</li>
      <li><strong>Next track</strong> — move the tonearm to the next track.</li>
      <li><strong>Change speed</strong> — cycle 33 / 45 / 78 RPM.</li>
    </ul>
  {/if}

  <div class="sim">
    <button onclick={onTogglePlay}>Play / Pause</button>
    <button onclick={onNextTrack}>Next track</button>
    <button onclick={onCycleSpeed}>Change speed</button>
  </div>
</div>
