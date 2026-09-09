<script>
  // The screen on the turntable itself: shows what's playing.
  let { album, playing, trackIndex, speed } = $props()
  const track = $derived(album.tracks[trackIndex])
</script>

<div class="device">
  <span class="eyebrow">Now playing</span>
  <h2>{track.title}</h2>
  <p>{album.title} &middot; {album.artist}</p>
  <p class="dim">
    Side {album.side} &middot; Track {trackIndex + 1} of {album.tracks.length}
  </p>

  <div class="row">
    <span class="badge" class:live={playing}>{playing ? 'Playing' : 'Paused'}</span>
    <span class="badge">{speed} RPM</span>
  </div>

  <div class="platter" class:spin={playing} aria-hidden="true">
    <div class="hole"></div>
  </div>
</div>
