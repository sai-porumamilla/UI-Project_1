<script>
  import { player, seek } from '../player.svelte.js'
  import { tracks } from '../tracks.js'
  import { fetchLyrics, lineAt } from '../lyrics.js'

  let lines = $state([])
  let status = $state('loading')
  let box
  let els = []

  const track = $derived(tracks[player.trackIndex])
  const current = $derived(lineAt(lines, player.time + track.lyricsOffset))

  $effect(() => {
    let live = true
    status = 'loading'
    lines = []
    fetchLyrics(track.lyricsId)
      .then((l) => {
        if (!live) return
        lines = l
        status = l.length ? 'ok' : 'none'
      })
      .catch(() => live && (status = 'error'))
    return () => (live = false)
  })

  // Keep the sung line centered.
  $effect(() => {
    const el = els[current]
    if (el && box) box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.offsetHeight / 2, behavior: 'smooth' })
  })
</script>

<div class="lyrics" bind:this={box}>
  {#if status === 'loading'}
    <p class="msg">Loading lyrics…</p>
  {:else if status === 'error'}
    <p class="msg">Lyrics unavailable. The player is offline.</p>
  {:else if status === 'none'}
    <p class="msg">No synced lyrics for this song.</p>
  {:else}
    <div class="pad"></div>
    {#each lines as line, i}
      <button
        bind:this={els[i]}
        class="line"
        class:past={i < current}
        class:now={i === current}
        onclick={() => seek(line.time - track.lyricsOffset)}
      >
        {line.text || '♪'}
      </button>
    {/each}
    <div class="pad"></div>
  {/if}
</div>

<style>
  .lyrics {
    position: relative;
    height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
    padding: 0 48px;
    mask-image: linear-gradient(transparent, #000 18%, #000 82%, transparent);
  }
  .pad {
    height: 45%;
  }
  .msg {
    margin-top: 160px;
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 18px;
  }
  .line {
    display: block;
    width: 100%;
    padding: 8px 0;
    border: 0;
    background: none;
    text-align: left;
    font: 700 28px/1.25 system-ui, sans-serif;
    color: rgba(255, 255, 255, 0.28);
    cursor: pointer;
    transition: color 0.35s, transform 0.35s, filter 0.35s;
    transform-origin: left center;
    filter: blur(0.6px);
  }
  .line.past {
    color: rgba(255, 255, 255, 0.45);
  }
  .line.now {
    color: #fff;
    transform: scale(1.04);
    filter: none;
  }
  .line:hover {
    color: rgba(255, 255, 255, 0.7);
  }
</style>
