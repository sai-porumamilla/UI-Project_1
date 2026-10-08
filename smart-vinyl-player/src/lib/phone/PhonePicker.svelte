<script>
  // The phone's version of the side / record picker. Same state and wording as the player's
  // screen (sideChange.js), so choosing here or there does the same thing.
  import { fly } from 'svelte/transition'
  import { player, now, putOn, closeChanger, MODES } from '../player.svelte.js'
  import { discLabel, speedFor } from '../records.js'
  import { songs, mins, action, isUpNext, albumUpNext, otherRecords, heading, swapInfo } from '../sideChange.js'
  import Disc from '../Disc.svelte'

  const { record } = $derived(now())
  const discs = $derived([...new Set(record.sides.map((s) => s.disc))])
  const head = $derived(heading())
  const swap = $derived(swapInfo())
</script>

<section class="sheet" transition:fly={{ y: 500, duration: 300 }} aria-label="Change side or record">
  {#if swap}
    <div class="swap" role="status">
      <div class="stage">
        {#if swap.phase === 'detect'}
          <Disc record={swap.toRecord} side={swap.toSide} size={150} />
        {:else if swap.kind === 'flip'}
          <Disc record={swap.record} side={swap.side} flipTo={{ record: swap.toRecord, side: swap.toSide }} size={150} />
        {:else if swap.kind === 'replay'}
          <Disc record={swap.record} side={swap.side} motion="spin" size={150} />
        {:else}
          <Disc record={swap.record} side={swap.side} motion="out" size={150} />
          <Disc record={swap.toRecord} side={swap.toSide} motion="in" size={150} />
        {/if}
      </div>
      {#if swap.phase === 'detect'}
        <span class="ok">✓ Detected · {discLabel(swap.toRecord)}</span>
        <h2>{swap.toRecord.title} · Side {swap.toSide.name}</h2>
        <p>Plays at {MODES.find((m) => m.id === speedFor(swap.toRecord)).label}. Starting with “{swap.toRecord.tracks[swap.toSide.first].title}”.</p>
      {:else}
        <span class="eyebrow">On the player</span>
        <h2>{swap.steps[0]}</h2>
        <p>{swap.steps[1]}</p>
      {/if}
    </div>
  {:else}
    <div class="head">
      <div>
        <h2>{head[0]}</h2>
        <p>{head[1]}</p>
      </div>
      <button class="close" onclick={closeChanger}>Not now</button>
    </div>

    <h3>Put on a side of {record.title}</h3>
    {#each discs as d}
      {#if discs.length > 1}<span class="disc-label">Disc {d}</span>{/if}
      <div class="sides">
        {#each record.sides as s, i}
          {#if s.disc === d}
            <button class="side" class:next={isUpNext(i)} class:current={i === player.sideIndex} onclick={() => putOn(player.recordIndex, i)}>
              <span class="letter">{s.name}</span>
              <span class="info">
                <b>{action(i)}</b>
                {#if isUpNext(i)}<em>Up next</em>{/if}
                <span>{songs(s)} songs · {mins(s)} min</span>
              </span>
            </button>
          {/if}
        {/each}
      </div>
    {/each}

    <h3>Or play a new album</h3>
    {#each otherRecords() as { r, i }}
      <button class="album" class:next={albumUpNext()} onclick={() => putOn(i, 0)}>
        <img src={r.artwork} alt="" />
        <span class="info"><b>{r.title}</b><span>{r.artist} · {r.sides.length} sides</span></span>
      </button>
    {/each}
  {/if}
</section>

<style>
  .sheet {
    --glow: color-mix(in oklab, var(--art-color), white 40%);
    position: absolute;
    inset: 34px 0 0;
    display: flex;
    flex-direction: column;
    padding: 14px 18px 18px;
    overflow-y: auto;
    scrollbar-width: none;
    background: linear-gradient(180deg, color-mix(in oklab, var(--art-color) 55%, #111114), #111114 60%);
  }
  @supports (color: oklch(from red l c h)) {
    .sheet {
      --glow: oklch(from var(--art-color) 0.75 0.12 h);
    }
  }
  button {
    font: inherit;
    color: inherit;
    border: 0;
    cursor: pointer;
  }
  h2 {
    margin: 0;
    font-size: 20px;
    color: #fff;
  }
  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.72);
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }
  .close {
    flex-shrink: 0;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    font-size: 12px;
  }
  h3 {
    margin: 18px 0 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
  }
  .disc-label {
    margin: 4px 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.55);
  }
  .sides {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 6px;
  }
  .side,
  .album {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.07);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    text-align: left;
  }
  .next {
    box-shadow: inset 0 0 0 2px var(--glow);
    background: color-mix(in oklab, var(--glow) 18%, transparent);
  }
  .letter {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #fff;
    color: #000;
    font-size: 17px;
    font-weight: 800;
  }
  .current .letter {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
  }
  .info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
  }
  .info b {
    font-size: 13px;
    color: #fff;
  }
  .info em {
    font-style: normal;
    font-weight: 600;
    color: var(--glow);
  }
  .album {
    margin-bottom: 8px;
  }
  .album img {
    width: 44px;
    border-radius: 6px;
  }

  .swap {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: auto 0;
    text-align: center;
  }
  .stage {
    position: relative;
    width: 150px;
    height: 150px;
    margin-bottom: 22px;
    perspective: 700px;
  }
  .eyebrow,
  .ok {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
  }
  .ok {
    color: #0ca30c;
    font-weight: 700;
  }
  .swap h2 {
    margin-top: 6px;
    font-size: 22px;
  }
</style>
