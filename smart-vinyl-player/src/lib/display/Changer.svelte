<script>
  // Side / record picker. Opens when a side runs out (or from the side chip), then walks the
  // user through the physical change (flip, swap disc, new record) until the player detects it.
  import { fade } from 'svelte/transition'
  import { player, now, putOn, closeChanger } from '../player.svelte.js'
  import { records } from '../records.js'

  const { record, side } = $derived(now())
  const nextSide = $derived(player.sideIndex + 1 < record.sides.length ? player.sideIndex + 1 : null)
  const discs = $derived([...new Set(record.sides.map((s) => s.disc))])
  const others = $derived(records.map((r, i) => ({ r, i })).filter(({ i }) => i !== player.recordIndex))

  const swap = $derived(player.swap)
  const toRecord = $derived(swap && records[swap.recordIndex])
  const toSide = $derived(swap && toRecord.sides[swap.sideIndex])

  const songs = (s) => s.last - s.first + 1
  const mins = (s) => Math.round((s.end - s.start) / 60)
  const action = (i) => (i === player.sideIndex ? 'Play again' : record.sides[i].disc === side.disc ? 'Flip' : 'Swap disc')

  const heading = $derived.by(() => {
    if (!player.sideDone) return ['Change side or record', 'The needle lifts as soon as you choose.']
    if (nextSide === null) return [`That's the end of ${record.title}`, `Start again from Side ${record.sides[0].name}, or put on a new album.`]
    const n = record.sides[nextSide]
    return n.disc === side.disc
      ? [`Side ${side.name} is over`, `Flip the record to Side ${n.name} to keep listening.`]
      : [`Disc ${side.disc} is over`, `Swap in Disc ${n.disc} and put Side ${n.name} face up.`]
  })

  const steps = $derived.by(() => {
    if (!swap) return []
    const s = `Side ${toSide.name}`
    return {
      flip: ['Flip the record over', `Place ${s} face up on the platter.`],
      disc: [`Swap in Disc ${toSide.disc}`, `Put Disc ${side.disc} back in its sleeve and place ${s} face up.`],
      record: [`Put on ${toRecord.title}`, `Place ${s} face up on the platter.`],
      replay: [`Starting ${s} again`, 'The tonearm returns to the first groove.'],
    }[swap.kind]
  })
</script>

{#snippet disc(r, s, cls = '')}
  <div class="vinyl {cls}">
    <div class="label" style:background-image="url({r.artwork})"><span>{s.name}</span></div>
  </div>
{/snippet}

<div class="overlay" transition:fade={{ duration: 200 }}>
  {#if swap}
    <div class="swap" role="status">
      <div class="stage">
        {#if swap.phase === 'detect'}
          {@render disc(toRecord, toSide)}
        {:else if swap.kind === 'flip'}
          <div class="flip">
            <div class="face">{@render disc(record, side)}</div>
            <div class="face back">{@render disc(toRecord, toSide)}</div>
          </div>
        {:else if swap.kind === 'replay'}
          {@render disc(record, side, 'spin')}
        {:else}
          {@render disc(record, side, 'out')}
          {@render disc(toRecord, toSide, 'in')}
        {/if}
      </div>
      <div class="text">
        {#if swap.phase === 'detect'}
          <span class="ok">✓ Detected</span>
          <h2>{toRecord.title} · Side {toSide.name}</h2>
          <p>{toRecord.artist}. Starting with “{toRecord.tracks[toSide.first].title}”.</p>
        {:else}
          <span class="eyebrow">Your turn</span>
          <h2>{steps[0]}</h2>
          <p>{steps[1]}</p>
        {/if}
      </div>
    </div>
  {:else}
    <div class="picker" role="dialog" aria-label="Choose a side or record">
      <div class="head">
        <div>
          <h2>{heading[0]}</h2>
          <p>{heading[1]}</p>
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
                  <button class="side" class:next={player.sideDone && i === nextSide} class:current={i === player.sideIndex} onclick={() => putOn(player.recordIndex, i)}>
                    <span class="letter">{s.name}</span>
                    <span class="info">
                      <b>{action(i)}{player.sideDone && i === nextSide ? ' · Up next' : ''}</b>
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
        {#each others as { r, i }}
          <button class="album" class:next={player.sideDone && nextSide === null} onclick={() => putOn(i, 0)}>
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
    background: rgba(57, 135, 229, 0.18);
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

  .vinyl {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: repeating-radial-gradient(circle, #111 0 2px, #1e1e22 2px 3px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  }
  .label {
    display: grid;
    place-items: center;
    width: 40%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: center / cover;
  }
  .label span {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    font-size: 24px;
    font-weight: 800;
  }
  .flip {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
    animation: flip 1.1s 0.3s ease-in-out forwards;
  }
  .face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
  }
  .face.back {
    transform: rotateY(180deg);
  }
  @keyframes flip {
    to {
      transform: rotateY(180deg);
    }
  }
  .out {
    animation: out 0.7s 0.2s ease-in forwards;
  }
  /* vertical so the discs never pass behind the instructions */
  .in {
    transform: translateY(-70%) scale(0.85);
    opacity: 0;
    animation: in 0.8s 0.8s ease-out forwards;
  }
  @keyframes out {
    to {
      transform: translateY(70%) scale(0.85);
      opacity: 0;
    }
  }
  @keyframes in {
    to {
      transform: none;
      opacity: 1;
    }
  }
  .spin {
    animation: spin 1.8s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
