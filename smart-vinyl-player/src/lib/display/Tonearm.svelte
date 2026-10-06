<script>
  // Top-down view of the platter while the automatic tonearm cues to a new spot.
  import { player, MODES, now } from '../player.svelte.js'

  let { size = 250 } = $props()

  // Geometry (viewBox 300×300): the arm pivots at P and is L long. Angles were solved
  // so the stylus lands on the outer groove (r≈112) at pos 0 and the inner groove (r≈52) at pos 1.
  const P = [255, 45], L = 170, C = [125, 155]
  const OUTER = 101.4, INNER = 122.2

  const arm = $derived(player.arm)
  const angle = $derived(OUTER + arm.pos * (INNER - OUTER))
  const rpm = $derived(MODES[player.mode].rpm || 33.3)
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  const label = { lift: 'Lifting needle', move: 'Cueing to', lower: 'Lowering needle' }
</script>

<svg viewBox="0 0 300 300" width={size} height={size} role="img" aria-label="{label[arm.phase]} {fmt(player.time)}" style:--ms="{arm.ms}ms">
  <defs>
    <clipPath id="label-clip"><circle cx={C[0]} cy={C[1]} r="40" /></clipPath>
  </defs>

  <g class="platter" style:--rpm={rpm} style:transform-origin="{C[0]}px {C[1]}px">
    <circle cx={C[0]} cy={C[1]} r="120" fill="#101012" stroke="#2a2a30" stroke-width="2" />
    {#each Array(14) as _, i}
      <circle cx={C[0]} cy={C[1]} r={52 + i * 4.6} fill="none" stroke="rgba(255,255,255,.06)" />
    {/each}
    <image href={now().record.artwork} x={C[0] - 40} y={C[1] - 40} width="80" height="80" clip-path="url(#label-clip)" />
    <circle cx={C[0]} cy={C[1]} r="3" fill="#ccc" />
  </g>

  <!-- landing groove -->
  <circle cx={C[0]} cy={C[1]} r={112 - arm.pos * 60} fill="none" stroke="var(--glow)" stroke-width="2" opacity=".55" class="groove" />

  <circle cx={P[0]} cy={P[1]} r="16" fill="#26262c" stroke="#3a3a42" />
  <!-- shadow drifts away from the arm as it lifts -->
  <g class="arm" style:transform="translate({arm.lifted ? 9 : 2}px, {arm.lifted ? 12 : 3}px) rotate({angle}deg)" style:transform-origin="{P[0]}px {P[1]}px" opacity=".45">
    <line x1={P[0]} y1={P[1]} x2={P[0] + L - 8} y2={P[1]} stroke="#000" stroke-width="5" stroke-linecap="round" />
    <rect x={P[0] + L - 14} y={P[1] - 6} width="20" height="12" rx="2" fill="#000" />
  </g>
  <g class="arm" style:transform="rotate({angle}deg)" style:transform-origin="{P[0]}px {P[1]}px">
    <line x1={P[0]} y1={P[1]} x2={P[0] + L - 8} y2={P[1]} stroke="#d4d4d8" stroke-width="4" stroke-linecap="round" />
    <rect x={P[0] + L - 14} y={P[1] - 6} width="20" height="12" rx="2" fill="#e4e4e7" />
    <circle cx={P[0] + L} cy={P[1]} r="2.2" fill="var(--glow)" />
  </g>
  <circle cx={P[0]} cy={P[1]} r="7" fill="#71717a" />

  <text x="8" y="16" font-size="12" letter-spacing="1.5" fill="rgba(255,255,255,.6)">{label[arm.phase]?.toUpperCase()}</text>
  <text x="8" y="292" font-size="22" font-weight="700" fill="#fff">{fmt(player.time)}</text>
</svg>

<style>
  .platter {
    animation: spin calc(60s / var(--rpm)) linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  .arm {
    transition: transform var(--ms) ease-in-out;
  }
  .groove {
    transition: r var(--ms) ease-in-out;
  }
</style>
