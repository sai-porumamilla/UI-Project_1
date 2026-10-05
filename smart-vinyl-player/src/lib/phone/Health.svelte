<script>
  import { SENSORS, TIERS, levelOf, overallLevel } from '../scenarios.js'

  let { profile } = $props()

  // Status palette (dataviz reference): always shown with an icon + label.
  const COLORS = ['#0ca30c', '#fab219', '#ec835a', '#d03b3b']
  const GLYPH = ['★', '✓', '!', '✕']

  const overall = $derived(overallLevel(profile.readings))
  const rows = $derived(SENSORS.map((s) => ({ ...s, value: profile.readings[s.key], level: levelOf(profile.readings[s.key], s.t) })))
  const healthy = $derived(rows.filter((r) => r.level <= 1).length)
  const [used, life] = $derived(profile.stylusLife)

  // 4 arc segments across a 240° sweep; the tier lights (4 - level) of them.
  const seg = (i) => {
    const r = 62, cx = 80, cy = 80
    const a0 = ((-210 + i * 60 + 3) * Math.PI) / 180
    const a1 = ((-210 + (i + 1) * 60 - 3) * Math.PI) / 180
    const p = (a) => `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`
    return `M ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)}`
  }
</script>

<section class="hero">
  <svg viewBox="0 0 160 130" width="190" role="img" aria-label="Player health: {TIERS[overall]}">
    {#each [0, 1, 2, 3] as i}
      <path d={seg(i)} fill="none" stroke-width="12" stroke-linecap="round" stroke={i < 4 - overall ? COLORS[overall] : '#2a2a31'} />
    {/each}
    <text x="80" y="76" text-anchor="middle" font-size="26" fill={COLORS[overall]}>{GLYPH[overall]}</text>
    <text x="80" y="104" text-anchor="middle" font-size="22" font-weight="700" fill="#fff">{TIERS[overall]}</text>
  </svg>
  <p>{healthy} of {rows.length} sensors healthy</p>
</section>

<ul class="sensors">
  {#each rows as r}
    <li>
      <div class="top">
        <span class="name">{r.name}</span>
        <span class="tier" style:--c={COLORS[r.level]}><b>{GLYPH[r.level]}</b> {TIERS[r.level]}</span>
      </div>
      <div class="value">{r.value} <small>{r.unit}</small></div>
      <div class="segs" aria-hidden="true">
        {#each [0, 1, 2, 3] as i}
          <span style:background={i < 4 - r.level ? COLORS[r.level] : '#2a2a31'}></span>
        {/each}
      </div>
      {#if r.level >= 2}<p class="tip">{r.tip}</p>{/if}
    </li>
  {/each}
  <li>
    <div class="top"><span class="name">Stylus lifetime</span><span class="muted">{used} / {life} h</span></div>
    <div class="life"><span style:width="{(used / life) * 100}%" class:old={used / life > 0.9}></span></div>
    {#if used / life > 0.9}<p class="tip">Stylus is near end of life. Order a replacement.</p>{/if}
  </li>
</ul>

<style>
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0 4px;
  }
  .hero p {
    margin: -6px 0 0;
    font-size: 13px;
    color: #a1a1aa;
  }
  .sensors {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }
  li {
    padding: 12px 14px;
    border-radius: 14px;
    background: #1c1c22;
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .name {
    font-size: 13px;
    color: #d4d4d8;
  }
  .tier {
    font-size: 12px;
    color: #e4e4e7;
  }
  .tier b {
    display: inline-grid;
    place-items: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    font-size: 10px;
    background: var(--c);
    color: #000;
  }
  .value {
    margin: 2px 0 8px;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    font-variant-numeric: tabular-nums;
  }
  .value small {
    font-size: 12px;
    font-weight: 400;
    color: #a1a1aa;
  }
  .segs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2px;
  }
  .segs span {
    height: 5px;
    border-radius: 3px;
  }
  .tip {
    margin: 8px 0 0;
    font-size: 12px;
    color: #a1a1aa;
  }
  .muted {
    font-size: 12px;
    color: #a1a1aa;
  }
  .life {
    height: 6px;
    margin-top: 8px;
    border-radius: 3px;
    background: #2a2a31;
  }
  .life span {
    display: block;
    height: 100%;
    border-radius: 3px;
    background: #3987e5;
  }
  .life span.old {
    background: #d03b3b;
  }
</style>
