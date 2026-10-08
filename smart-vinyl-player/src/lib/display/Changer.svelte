<script>
  // Side / record picker on the player's screen. Opens when a side runs out (or from the side
  // chip), then walks the user through the physical change until the player detects it.
  // The wording lives in sideChange.js so the phone says the same thing.
  import { fade } from 'svelte/transition'
  import { player, now, putOn, closeChanger, MODES } from '../player.svelte.js'
  import { discLabel, speedFor } from '../records.js'
  import { songs, mins, action, isUpNext, albumUpNext, otherRecords, heading, swapInfo } from '../sideChange.js'
  import Disc from '../Disc.svelte'

  const { record } = $derived(now())
  const discs = $derived([...new Set(record.sides.map((s) => s.disc))])
  const head = $derived(heading())
  const swap = $derived(swapInfo())
</script>

<div class="overlay" transition:fade={{ duration: 200 }}>
  {#if swap}
    <div class="swap" role="status">
      <div class="stage">
        {#if swap.phase === 'detect'}
          <Disc record={swap.toRecord} side={swap.toSide} />
        {:else if swap.kind === 'flip'}
          <Disc record={swap.record} side={swap.side} flipTo={{ record: swap.toRecord, side: swap.toSide }} />
        {:else if swap.kind === 'replay'}
          <Disc record={swap.record} side={swap.side} motion="spin" />
        {:else}
          <Disc record={swap.record} side={swap.side} motion="out" />
          <Disc record={swap.toRecord} side={swap.toSide} motion="in" />
        {/if}
      </div>
      <div class="text">
        {#if swap.phase === 'detect'}
          <span class="ok">✓ Detected · {discLabel(swap.toRecord)}</span>
          <h2>{swap.toRecord.title} · Side {swap.toSide.name}</h2>
          <p>{swap.toRecord.artist}. Plays at {MODES.find((m) => m.id === speedFor(swap.toRecord)).label}. Starting with “{swap.toRecord.tracks[swap.toSide.first].title}”.</p>
        {:else}
          <span class="eyebrow">Your turn</span>
          <h2>{swap.steps[0]}</h2>
          <p>{swap.steps[1]}</p>
        {/if}
      </div>
    </div>
  {:else}
    <div class="picker" role="dialog" aria-label="Choose a side or record">
      <div class="head">
        <div>
          <h2>{head[0]}</h2>
          <p>{head[1]}</p>
        </div>
        <button class="close" onclick={closeChanger}>Not now</button>
      </div>

      <h3>Put on a side of {record.title}</h3>
      <div class="discs">
        {#each discs as d}
          <div class="disc-group">
            {#if discs.length > 1}<span class="disc-label">Disc {d}</span>{/if}
            <div class="sides">
              {#each record.sides as s, i}
                {#if s.disc === d}
                  <button class="side" class:next={isUpNext(i)} class:current={i === player.sideIndex} onclick={() => putOn(player.recordIndex, i)}>
                    <span class="letter">{s.name}</span>
                    <span class="info">
                      <b>{action(i)}{isUpNext(i) ? ' · Up next' : ''}</b>
                      <span>{songs(s)} songs · {mins(s)} min</span>
                      <span class="first">{record.tracks[s.first].title}</span>
                    </span>
                  </button>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <h3>Or play a new album</h3>
      <div class="albums">
        {#each otherRecords() as { r, i }}
          <button class="album" class:next={albumUpNext()} onclick={() => putOn(i, 0)}>
            <img src={r.artwork} alt="" />
            <span class="info"><b>{r.title}</b><span>{r.artist} · {r.sides.length} sides</span></span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(8, 8, 10, 0.82);
    backdrop-filter: blur(10px);
  }
  button {
    font: inherit;
    color: inherit;
    border: 0;
    cursor: pointer;
  }
  h2 {
    margin: 0 0 4px;
    font-size: 26px;
    color: #fff;
  }
  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
  }

  .picker {
    width: 640px;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
  .close {
    padding: 8px 16px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    white-space: nowrap;
  }
  h3 {
    margin: 20px 0 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
  }
  .discs {
    display: flex;
    gap: 16px;
  }
  .disc-group {
    flex: 1;
  }
  .disc-label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
  }
  .sides {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .side,
  .album {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.07);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    text-align: left;
  }
  .side:hover,
  .album:hover {
    background: rgba(255, 255, 255, 0.12);
  }
  .next {
    box-shadow: inset 0 0 0 2px var(--glow);
    background: color-mix(in oklab, var(--glow) 18%, transparent);
  }
  .letter {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #fff;
    color: #000;
    font-size: 20px;
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
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }
  .info b {
    font-size: 13px;
    color: #fff;
  }
  .first {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .albums {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .album img {
    width: 48px;
    border-radius: 6px;
  }

  .swap {
    display: flex;
    align-items: center;
    gap: 40px;
    padding: 0 40px;
  }
  .stage {
    position: relative;
    width: 230px;
    height: 230px;
    flex-shrink: 0;
    perspective: 900px;
  }
  .text {
    max-width: 330px;
  }
  .eyebrow,
  .ok {
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
  }
  .ok {
    color: #0ca30c;
    font-weight: 700;
  }
  .text h2 {
    margin-top: 6px;
    font-size: 30px;
  }

</style>
