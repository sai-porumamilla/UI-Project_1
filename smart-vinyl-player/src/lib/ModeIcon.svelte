<script>
  // 33 = LP disc (small spindle hole), 45 = single with the wide 7" adapter hole,
  // bt = the Bluetooth rune.
  let { id, size = 24 } = $props()
</script>

<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
  {#if id === 'bt'}
    <polyline points="6.5,7 17,17 12,22 12,2 17,7 6.5,17" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
  {:else}
    <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.5" />
    <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="0.75" opacity="0.6" />
    <!-- label drawn as a ring so the center hole stays transparent -->
    <circle cx="12" cy="12" r={id === '45' ? 3.4 : 2} fill="none" stroke="currentColor" stroke-width={id === '45' ? 1.6 : 2.4} />
  {/if}
</svg>
