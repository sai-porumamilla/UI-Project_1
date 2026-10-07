<script>
  // Transport icons shared by the player display and the phone.
  let { name, size = 24 } = $props()
  const paths = {
    play: 'M8 5v14l11-7z',
    pause: 'M6 5h4v14H6zM14 5h4v14h-4z',
    next: 'M6 18l8.5-6L6 6v12zM16 6h2v12h-2z',
    prev: 'M6 6h2v12H6zm3.5 6l8.5 6V6z',
    lock: 'M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1zm2 0h6V7a3 3 0 0 0-6 0v3z',
    volDown: 'M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z',
    volUp: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
    chevronDown: 'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z',
    replay: 'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z',
  }
</script>

{#if name === 'back10' || name === 'fwd10'}
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d={paths.replay} fill="currentColor" transform={name === 'fwd10' ? 'translate(24 0) scale(-1 1)' : ''} />
    <text x="12" y="16.2" text-anchor="middle" font-size="6.5" font-weight="700" fill="currentColor">10</text>
  </svg>
{:else}
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d={paths[name]} fill="currentColor" />
  </svg>
{/if}
