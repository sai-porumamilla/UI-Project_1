<script>
  // A record seen from above: grooves, a label with the album art, and the side letter.
  // motion: '' | 'spin' | 'in' | 'out'. flipTo: { record, side } animates turning it over.
  // Fills its container, so the parent sets the size (and position: relative).
  let { record, side, motion = '', flipTo = null, size = 230 } = $props()
</script>

{#snippet face(r, s, cls)}
  <div class="vinyl {cls}">
    <div class="label" style:background-image="url({r.artwork})"><span style:font-size="{size * 0.1}px">{s.name}</span></div>
  </div>
{/snippet}

{#if flipTo}
  <div class="flip">
    {@render face(record, side, 'face')}
    {@render face(flipTo.record, flipTo.side, 'face back')}
  </div>
{:else}
  {@render face(record, side, motion)}
{/if}

<style>
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
    width: 46%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    font-weight: 800;
    color: #fff;
  }
  .flip {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
    animation: flip 1.1s 0.3s ease-in-out forwards;
  }
  .face {
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
  /* vertical so the discs never pass behind text beside them */
  .out {
    animation: out 0.7s 0.2s ease-in forwards;
  }
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
