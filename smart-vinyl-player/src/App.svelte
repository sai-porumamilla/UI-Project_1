<script>
  import DeviceUI from './lib/DeviceUI.svelte'
  import TestPanel from './lib/TestPanel.svelte'

  const album = {
    title: 'Rumours',
    artist: 'Fleetwood Mac',
    side: 'A',
    tracks: [
      { title: 'Second Hand News' },
      { title: 'Dreams' },
      { title: 'Never Going Back Again' },
      { title: "Don't Stop" },
      { title: 'Go Your Own Way' },
    ],
  }
  const speeds = [33, 45, 78]

  let playing = $state(false)
  let trackIndex = $state(0)
  let speedIndex = $state(0)

  const togglePlay = () => (playing = !playing)
  const nextTrack = () =>
    (trackIndex = (trackIndex + 1) % album.tracks.length)
  const cycleSpeed = () =>
    (speedIndex = (speedIndex + 1) % speeds.length)
</script>

<main>
  <section class="region">
    <span class="tag">Device UI &mdash; screen on the turntable</span>
    <DeviceUI {album} {playing} {trackIndex} speed={speeds[speedIndex]} />
    <svg class="placement" viewBox="0 0 120 80" aria-label="Screen sits on the turntable's control panel">
      <rect x="2" y="6" width="116" height="68" rx="6" fill="none" stroke="currentColor" />
      <circle cx="46" cy="40" r="26" fill="none" stroke="currentColor" />
      <rect x="82" y="14" width="28" height="20" fill="var(--accent-bg)" stroke="var(--accent)" />
    </svg>
  </section>

  <section class="region">
    <span class="tag">Testing UI</span>
    <TestPanel onTogglePlay={togglePlay} onNextTrack={nextTrack} onCycleSpeed={cycleSpeed} />
  </section>
</main>
