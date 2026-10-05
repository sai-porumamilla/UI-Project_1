<script>
  // Arched panel meter shown when the physical volume knob turns.
  let { value } = $props()
  const cx = 150, cy = 150, r = 116
  const ticks = Array.from({ length: 21 }, (_, i) => i * 5)
  const at = (v, rr) => {
    const a = Math.PI * (1 - v / 100)
    return [cx + rr * Math.cos(a), cy - rr * Math.sin(a)]
  }
  const needle = $derived(at(value, r - 30))
</script>

<svg viewBox="0 22 300 214" width="340" role="img" aria-label="Volume {value} percent">
  <path d="M {cx - r} {cy} A {r} {r} 0 0 1 {cx + r} {cy}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="14" stroke-linecap="round" />
  <path
    d="M {cx - r} {cy} A {r} {r} 0 0 1 {cx + r} {cy}"
    pathLength="100"
    stroke-dasharray="{value} 100"
    fill="none"
    stroke="var(--glow)"
    stroke-width="14"
    stroke-linecap="round"
    class:hot={value > 85}
  />
  {#each ticks as t}
    {@const [x1, y1] = at(t, r - 14)}
    {@const [x2, y2] = at(t, r - (t % 25 ? 20 : 26))}
    <line {x1} {y1} {x2} {y2} stroke="rgba(255,255,255,{t <= value ? 0.85 : 0.3})" stroke-width={t % 25 ? 1 : 2} />
  {/each}
  {#each [0, 100] as t}
    {@const [x, y] = at(t, r - 40)}
    <text {x} y={y + 4} text-anchor="middle" font-size="11" fill="rgba(255,255,255,.55)">{t}</text>
  {/each}
  <line x1={cx} y1={cy} x2={needle[0]} y2={needle[1]} stroke="#fff" stroke-width="3" stroke-linecap="round" />
  <circle {cx} {cy} r="7" fill="#fff" />
  <text x={cx} y={cy + 52} text-anchor="middle" font-size="44" font-weight="700" fill="#fff">{value}</text>
  <text x={cx} y={cy + 74} text-anchor="middle" font-size="12" letter-spacing="2" fill="rgba(255,255,255,.6)">VOLUME</text>
</svg>

<style>
  path.hot {
    stroke: #ec835a;
  }
</style>
