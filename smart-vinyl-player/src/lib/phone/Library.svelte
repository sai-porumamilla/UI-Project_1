<script>
  import { player } from '../player.svelte.js'
  import { records as playable } from '../records.js'

  let { profile } = $props()

  let tab = $state('collection')
  let specialOnly = $state(false)
  let hover = $state(null)

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hourLabel = (h) => `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`

  const records = $derived(specialOnly ? profile.records.filter((r) => r.special) : profile.records)
  const specials = $derived(profile.records.filter((r) => r.special).length)
  const max = $derived(Math.max(1, ...profile.heat.flat()))
  const topMax = $derived(profile.top[0][1])
  const ago = (t) => {
    const m = Math.round((Date.now() - t) / 60000)
    return m < 1 ? 'just now' : `${m} min ago`
  }
</script>

<div class="seg">
  <button class:on={tab === 'collection'} onclick={() => (tab = 'collection')}>Collection</button>
  <button class:on={tab === 'insights'} onclick={() => (tab = 'insights')}>Insights</button>
</div>

{#if tab === 'collection'}
  <div class="row">
    <p class="muted">{profile.records.length} records · {specials} special editions</p>
    <label class="toggle"><input type="checkbox" bind:checked={specialOnly} /> Special only</label>
  </div>
  <ul class="grid">
    {#each records as r}
      <li>
        <div class="vinyl" style:--c={r.color}><span></span></div>
        <b>{r.title}</b>
        <span class="muted">{r.artist} · {r.year}</span>
        <span class="variant" class:special={r.special}>{r.special ? '★ ' : ''}{r.variant}</span>
      </li>
    {/each}
  </ul>
{:else}
  <div class="tiles">
    <div><b>{profile.stats.hours}</b><span>hours this month</span></div>
    <div><b>{profile.stats.spins}</b><span>songs spun</span></div>
    <div><b>{profile.stats.streak}</b><span>day streak</span></div>
  </div>

  {#if player.plays.length}
    <h3>Detected on the player</h3>
    <ul class="plays">
      {#each player.plays.slice(0, 3) as p}
        {@const r = playable[p.recordIndex]}
        {@const t = r.tracks[p.trackIndex]}
        <li><img src={r.artwork} alt="" /><div><b>{t.title}</b><span class="muted">{r.artist} · {r.title} · Side {t.side}</span></div><span class="muted">{ago(p.at)}</span></li>
      {/each}
    </ul>
  {/if}

  <h3>When you listen</h3>
  <div class="heat" role="img" aria-label="Plays by day of week and hour">
    {#each profile.heat as row, d}
      <span class="day">{DAYS[d][0]}</span>
      {#each row as v, h}
        <span
          class="cell"
          role="presentation"
          style:background="color-mix(in oklab, #6da7ec {(v / max) * 100}%, #24242b)"
          onpointerenter={() => (hover = { d, h, v })}
          onpointerleave={() => (hover = null)}
        ></span>
      {/each}
    {/each}
    <span></span>
    {#each Array(24) as _, h}<span class="hr">{h % 6 ? '' : hourLabel(h)}</span>{/each}
  </div>
  <p class="readout">
    {#if hover}{DAYS[hover.d]} {hourLabel(hover.h)}: <b>{hover.v} plays</b>{:else}Hover a cell for plays · darker = fewer{/if}
  </p>

  <h3>Top artists</h3>
  <ol class="top">
    {#each profile.top as [name, plays]}
      <li><span class="n">{name}</span><span class="bar"><span style:width="{(plays / topMax) * 100}%"></span></span><span class="v">{plays}</span></li>
    {/each}
  </ol>
{/if}

<style>
  .seg {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 3px;
    border-radius: 10px;
    background: #1c1c22;
  }
  .seg button {
    padding: 7px;
    border: 0;
    border-radius: 8px;
    background: none;
    color: #a1a1aa;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
  .seg button.on {
    background: #3a3a44;
    color: #fff;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 12px 0 8px;
  }
  .muted {
    margin: 0;
    font-size: 12px;
    color: #a1a1aa;
  }
  .toggle {
    font-size: 12px;
    color: #d4d4d8;
    display: flex;
    gap: 4px;
    align-items: center;
  }
  ul,
  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .grid li {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px;
    border-radius: 14px;
    background: #1c1c22;
    font-size: 13px;
    color: #fff;
  }
  .vinyl {
    aspect-ratio: 1;
    margin-bottom: 6px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: repeating-radial-gradient(circle, var(--c) 0 2px, color-mix(in oklab, var(--c) 82%, #fff) 2px 3px);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  }
  .vinyl span {
    width: 32%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #e4e4e7;
    box-shadow: 0 0 0 3px var(--c);
  }
  .variant {
    margin-top: 4px;
    font-size: 11px;
    color: #a1a1aa;
  }
  .variant.special {
    color: #f5d37a;
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 12px;
  }
  .tiles div {
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-radius: 14px;
    background: #1c1c22;
  }
  .tiles b {
    font-size: 24px;
    color: #fff;
  }
  .tiles span {
    font-size: 11px;
    color: #a1a1aa;
  }
  h3 {
    margin: 18px 0 8px;
    font-size: 14px;
    color: #fff;
  }
  .plays li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    font-size: 13px;
    color: #fff;
  }
  .plays img {
    width: 36px;
    border-radius: 4px;
  }
  .plays div {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .heat {
    display: grid;
    grid-template-columns: 14px repeat(24, minmax(0, 1fr));
    gap: 2px;
  }
  .day,
  .hr {
    font-size: 9px;
    color: #a1a1aa;
  }
  .hr {
    white-space: nowrap;
  }
  .cell {
    aspect-ratio: 1;
    border-radius: 2px;
  }
  .cell:hover {
    outline: 2px solid #fff;
  }
  .readout {
    margin: 6px 0 0;
    min-height: 16px;
    font-size: 12px;
    color: #a1a1aa;
  }
  .readout b {
    color: #fff;
  }
  .top li {
    display: grid;
    grid-template-columns: 96px 1fr 28px;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    font-size: 13px;
    color: #e4e4e7;
  }
  .n {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .bar span {
    display: block;
    height: 8px;
    border-radius: 0 4px 4px 0;
    background: #3987e5;
  }
  .v {
    text-align: right;
    color: #a1a1aa;
    font-variant-numeric: tabular-nums;
  }
</style>
