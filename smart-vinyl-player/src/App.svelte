<script>
  // --- identity ---------------------------------------------------------------
  const AUTHOR = 'Sai Porumamilla'
  const WRITEUP_URL = '#' // placeholder until the write-up is published

  // --- the record currently on the platter (static mock data) ---------------
  const album = {
    title: 'Rumours',
    artist: 'Fleetwood Mac',
    year: 1977,
    side: 'A',
    correctSpeed: 33,
    tracks: [
      { title: 'Second Hand News', dur: '2:56' },
      { title: 'Dreams', dur: '4:17' },
      { title: 'Never Going Back Again', dur: '2:14' },
      { title: "Don't Stop", dur: '3:13' },
      { title: 'Go Your Own Way', dur: '3:38' },
      { title: 'Songbird', dur: '3:20' },
    ],
  }

  // --- device state --------------------------------------------------------
  let recordLoaded = $state(true)
  let poweredOn = $state(false) // platter motor
  let tonearmDown = $state(false)
  let speed = $state(33) // 33 | 45 | 78
  let trackIndex = $state(0)
  let sideEnded = $state(false)
  let playsToday = $state(0)
  let showInfo = $state(false)

  // --- derived indicators -------------------------------------------------
  const playing = $derived(recordLoaded && poweredOn && tonearmDown && !sideEnded)
  const currentTrack = $derived(recordLoaded ? album.tracks[trackIndex] : null)
  const speedOk = $derived(speed === album.correctSpeed)
  const lastTrack = $derived(trackIndex >= album.tracks.length - 1)

  const status = $derived(
    !recordLoaded
      ? 'No record loaded'
      : !poweredOn
        ? 'Platter stopped'
        : sideEnded
          ? `End of Side ${album.side} — lift tonearm`
          : !tonearmDown
            ? 'Cued — tonearm up'
            : !speedOk
              ? `Playing at wrong speed (${speed} RPM)`
              : 'Playing',
  )

  // tonearm rotation: parked off the record, then outer groove -> inner groove
  const armAngle = $derived(
    !tonearmDown
      ? -20
      : -4 + (18 * trackIndex) / Math.max(1, album.tracks.length - 1),
  )

  const artInitials = album.artist
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // --- simulator actions ------------------------------------------------------
  // "start playback" == a spinning platter with the tonearm down on a record
  function countPlayStart() {
    if (recordLoaded && poweredOn && tonearmDown && !sideEnded) playsToday += 1
  }

  function togglePower() {
    poweredOn = !poweredOn
    if (poweredOn) countPlayStart()
  }

  function toggleTonearm() {
    tonearmDown = !tonearmDown
    if (tonearmDown) {
      sideEnded = false
      countPlayStart()
    }
  }

  /** @param {number} i */
  function selectTrack(i) {
    if (!recordLoaded) return
    trackIndex = i
    sideEnded = false
    countPlayStart()
  }

  function prevTrack() {
    if (trackIndex > 0) selectTrack(trackIndex - 1)
  }

  function nextTrack() {
    if (lastTrack) sideEnded = true
    else selectTrack(trackIndex + 1)
  }

  function loadRecord() {
    recordLoaded = true
    trackIndex = 0
    sideEnded = false
  }

  function ejectRecord() {
    recordLoaded = false
    tonearmDown = false
    poweredOn = false
  }

  function endOfSide() {
    if (!recordLoaded) return
    trackIndex = album.tracks.length - 1
    sideEnded = true
  }

  // companion app play/pause maps onto the same physical state
  function appPlayPause() {
    if (playing) {
      tonearmDown = false
      return
    }
    recordLoaded = true
    poweredOn = true
    tonearmDown = true
    sideEnded = false
    countPlayStart()
  }
</script>

<main id="app">
  <!-- ============================ DEVICE UI ============================ -->
  <section class="device" aria-label="Smart vinyl player device UI">
    <div class="placement">
      <svg viewBox="0 0 160 120" width="150" height="112" aria-hidden="true">
        <rect x="4" y="8" width="152" height="104" rx="10" class="pl-body" />
        <circle cx="70" cy="62" r="40" class="pl-platter" />
        <circle cx="70" cy="62" r="6" class="pl-spindle" />
        <rect x="112" y="18" width="38" height="58" rx="6" class="pl-panel" />
        <line x1="120" y1="30" x2="142" y2="30" class="pl-line" />
        <line x1="120" y1="40" x2="142" y2="40" class="pl-line" />
        <line x1="120" y1="50" x2="136" y2="50" class="pl-line" />
      </svg>
      <p>
        This screen lives on the <strong>top-right control panel</strong> of the
        turntable, beside the platter.
      </p>
    </div>

    <div class="turntable" class:on={poweredOn}>
      <div class="deck">
        <div class="platter">
          <div class="record" class:spinning={playing} aria-hidden="true">
            <div class="label">
              <span>{album.title}</span>
              <small>{album.artist}</small>
            </div>
          </div>
        </div>
        <div class="tonearm" style="--arm:{armAngle}deg" aria-hidden="true">
          <div class="pivot"></div>
          <div class="arm"><div class="head"></div></div>
        </div>
      </div>

      <div class="console">
        <div class="nowplaying">
          <span class="eyebrow">Now playing</span>
          {#if currentTrack}
            <h2>{currentTrack.title}</h2>
            <p class="meta">
              {album.title} &middot; {album.artist} &middot; {album.year}
            </p>
            <p class="meta">
              Side {album.side} &middot; Track {trackIndex + 1} of
              {album.tracks.length} &middot; {currentTrack.dur}
            </p>
          {:else}
            <h2>&mdash;</h2>
            <p class="meta">Load a record to begin.</p>
          {/if}
          <span class="status" class:live={playing}>{status}</span>
        </div>

        <ol class="tracklist">
          {#each album.tracks as t, i}
            <li>
              <button
                type="button"
                class:current={recordLoaded && i === trackIndex && !sideEnded}
                disabled={!recordLoaded}
                onclick={() => selectTrack(i)}
              >
                <span class="num">{i + 1}</span>
                <span class="tt">{t.title}</span>
                <span class="dur">{t.dur}</span>
              </button>
            </li>
          {/each}
        </ol>

        <div class="controls">
          <button type="button" class="key" onclick={togglePower}>
            {poweredOn ? 'Stop platter' : 'Start platter'}
          </button>
          <button
            type="button"
            class="key"
            disabled={!recordLoaded}
            onclick={toggleTonearm}
          >
            {tonearmDown ? 'Lift tonearm' : 'Drop tonearm'}
          </button>
          <button
            type="button"
            class="key"
            disabled={!recordLoaded}
            onclick={prevTrack}>&#9664; Prev</button
          >
          <button
            type="button"
            class="key"
            disabled={!recordLoaded}
            onclick={nextTrack}>Next &#9654;</button
          >

          <div class="speed" role="group" aria-label="Playback speed">
            {#each [33, 45, 78] as rpm}
              <button
                type="button"
                aria-pressed={speed === rpm}
                class:sel={speed === rpm}
                onclick={() => (speed = rpm)}>{rpm}</button
              >
            {/each}
            <span class="rpm-light" class:ok={speedOk} title="RPM matches record"
            ></span>
          </div>
        </div>

        <dl class="readout">
          <div><dt>Plays today</dt><dd>{playsToday}</dd></div>
          <div><dt>Speed</dt><dd>{speed} RPM {speedOk ? '' : '(mismatch)'}</dd></div>
          <div><dt>Tonearm</dt><dd>{tonearmDown ? 'down' : 'up'}</dd></div>
        </dl>
      </div>
    </div>

    <!-- secondary UI: companion app -->
    <aside class="companion" aria-label="Mobile companion app">
      <span class="phone-note">Companion app (secondary UI)</span>
      <div class="phone">
        <div class="art">{artInitials}</div>
        <div class="phone-np">
          <strong>{currentTrack ? currentTrack.title : 'No record'}</strong>
          <span>{album.artist}</span>
          <span class="dim"
            >Side {album.side} &middot; {trackIndex + 1}/{album.tracks.length}</span
          >
        </div>
        <button type="button" class="phone-play" onclick={appPlayPause}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <span class="phone-status">{status}</span>
      </div>
    </aside>

    <div class="future">
      <strong>Planned (Level 2+)</strong>
      <ul>
        <li>Record library &amp; cover browser</li>
        <li>Auto-scrobble now-playing to a listening log</li>
        <li>Stylus-wear tracking &amp; clean-record reminders</li>
        <li>Multi-room / Bluetooth output routing</li>
      </ul>
    </div>
  </section>

  <!-- =========================== TESTING UI =========================== -->
  <section class="testbench" aria-label="Project info and simulator">
    <header class="project">
      <h1>Smart Vinyl Player</h1>
      <p class="byline">
        by {AUTHOR} &middot; <a href={WRITEUP_URL}>Project write-up &#8599;</a>
      </p>
      <p>
        A turntable that identifies the record on the platter and lets you drop
        the tonearm straight onto any track — by name, from the deck or from
        your phone — instead of counting grooves by eye. This page mocks the
        deck's control-panel screen and the companion app so the interactions can
        be tried before the hardware exists.
      </p>
    </header>

    <button
      type="button"
      class="info-btn"
      aria-expanded={showInfo}
      onclick={() => (showInfo = !showInfo)}
    >
      &#9432; How to use the simulator
    </button>

    {#if showInfo}
      <div class="infopanel">
        <p>
          These buttons stand in for physically using the turntable. Each one
          updates the Device UI and the companion app on the left.
        </p>
        <ul>
          <li><strong>Load / Eject record</strong> — put a record on the platter or take it off.</li>
          <li><strong>Start / Stop platter</strong> — the motor that spins the record.</li>
          <li><strong>Drop / Lift tonearm</strong> — lower the needle onto the record or raise it.</li>
          <li><strong>Pick a track</strong> — click a track (or Prev / Next) to move the tonearm to it.</li>
          <li><strong>33 / 45 / 78</strong> — set platter speed; the light is green when it matches the record.</li>
          <li><strong>Skip to end of side</strong> — simulate the side finishing.</li>
        </ul>
        <p>
          Playback happens only when a record is loaded, the platter is spinning,
          and the tonearm is down. <strong>Plays today</strong> counts up each
          time playback starts.
        </p>
      </div>
    {/if}

    <div class="sim">
      <h3>Simulate use</h3>
      <div class="grp">
        <span>Record</span>
        <button type="button" onclick={loadRecord} disabled={recordLoaded}>Load record</button>
        <button type="button" onclick={ejectRecord} disabled={!recordLoaded}>Eject record</button>
      </div>
      <div class="grp">
        <span>Platter</span>
        <button type="button" onclick={togglePower}>
          {poweredOn ? 'Stop platter' : 'Start platter'}
        </button>
      </div>
      <div class="grp">
        <span>Tonearm</span>
        <button type="button" onclick={toggleTonearm} disabled={!recordLoaded}>
          {tonearmDown ? 'Lift tonearm' : 'Drop tonearm'}
        </button>
        <button type="button" onclick={prevTrack} disabled={!recordLoaded}>Prev track</button>
        <button type="button" onclick={nextTrack} disabled={!recordLoaded}>Next track</button>
      </div>
      <div class="grp">
        <span>Speed</span>
        {#each [33, 45, 78] as rpm}
          <button type="button" class:sel={speed === rpm} onclick={() => (speed = rpm)}>
            {rpm} RPM
          </button>
        {/each}
      </div>
      <div class="grp">
        <span>Side</span>
        <button type="button" onclick={endOfSide} disabled={!recordLoaded}>
          Skip to end of side
        </button>
      </div>
    </div>

    <div class="about">
      <h3>What this UI covers</h3>
      <p class="lbl">Controls</p>
      <ul>
        <li>Start / stop platter</li>
        <li>Drop / lift tonearm</li>
        <li>Select track (list, or prev / next) — moves the tonearm</li>
        <li>Set speed: 33 / 45 / 78 RPM</li>
      </ul>
      <p class="lbl">Indicators</p>
      <ul>
        <li>Now playing: album, artist, side, track number, length</li>
        <li>Status line: stopped / cued / playing / wrong speed / end of side</li>
        <li>Tonearm position shown on the deck graphic</li>
        <li>RPM-match light; plays-today counter</li>
      </ul>
      <p class="lbl">Design goals</p>
      <ul>
        <li>Pick a track by name, not by dropping the needle blind</li>
        <li>Deck and phone always show the same state</li>
        <li>Controls grouped by action: platter, tonearm, speed</li>
        <li>Wrong-speed playback is visible, not silent</li>
      </ul>
    </div>

    <dl class="state">
      <h3>Live state</h3>
      <div><dt>record</dt><dd>{recordLoaded ? 'loaded' : 'none'}</dd></div>
      <div><dt>platter</dt><dd>{poweredOn ? 'spinning' : 'stopped'}</dd></div>
      <div><dt>tonearm</dt><dd>{tonearmDown ? 'down' : 'up'}</dd></div>
      <div><dt>track</dt><dd>{trackIndex + 1} / {album.tracks.length}</dd></div>
      <div><dt>speed</dt><dd>{speed} RPM</dd></div>
      <div><dt>playing</dt><dd>{playing ? 'yes' : 'no'}</dd></div>
      <div><dt>plays today</dt><dd>{playsToday}</dd></div>
    </dl>
  </section>
</main>
