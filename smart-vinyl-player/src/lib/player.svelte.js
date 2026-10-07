// Single source of truth for the physical player. Both the on-device display
// and the phone app read/write this, so they always stay in sync.
import { records, trackAt, speedFor } from './records.js'

export const MODES = [
  { id: '33', label: '33⅓ RPM', rpm: 33.3 },
  { id: '45', label: '45 RPM', rpm: 45 },
  { id: 'bt', label: 'Bluetooth', rpm: 0 },
]

export const player = $state({
  recordIndex: 0, // which record is on the platter (records.js)
  sideIndex: 0, // which side is face up
  trackIndex: 0, // track under the needle, index into record.tracks
  playing: false,
  time: 0, // seconds into the record's audio file
  volume: 60, // 0-100, set by the physical volume knob
  mode: 0, // index into MODES, set by the physical mode knob
  knob: null, // last knob turn { kind: 'volume' | 'mode' } — new object each turn
  needleAlert: null, // set when a hand is sensed near the tonearm mid-song
  profile: 0, // index into scenarios.js profiles
  plays: [], // songs auto-detected this session: { recordIndex, trackIndex, at }
  // Automatic tonearm. While cueing, audio is paused but `playing` keeps the user's intent.
  arm: { cueing: false, lifted: false, phase: '', pos: 0, ms: 0 }, // pos 0 = first groove of the side, 1 = last
  sideDone: false, // needle reached the run-out groove and returned to rest
  changer: false, // the "put on a side / new album" picker is open on the display
  swap: null, // a chosen change in progress: { phase: 'place' | 'detect', kind, recordIndex, sideIndex }
})

/** Record, side and track under the needle. Call inside $derived to stay reactive. */
export function now() {
  const record = records[player.recordIndex]
  return { record, side: record.sides[player.sideIndex], track: record.tracks[player.trackIndex] }
}

const audio = new Audio()
audio.preload = 'metadata'
audio.volume = player.volume / 100
audio.src = records[0].src
audio.addEventListener('timeupdate', () => {
  const t = (player.time = audio.currentTime)
  const { record, side } = now()
  const i = trackAt(record, t)
  if (i !== player.trackIndex) {
    player.trackIndex = i
    if (player.playing && !player.arm.cueing) detect()
  }
  if (player.playing && !player.arm.cueing && t >= side.end - 0.25) endOfSide()
})
audio.addEventListener('play', () => {
  if (!player.arm.cueing) player.playing = true
  detect()
})
audio.addEventListener('pause', () => !player.arm.cueing && (player.playing = false))
audio.addEventListener('ended', () => endOfSide())

/** Song recognition: log the song under the needle (once per stretch of listening). */
function detect() {
  const last = player.plays[0]
  if (last?.recordIndex === player.recordIndex && last.trackIndex === player.trackIndex) return
  player.plays.unshift({ recordIndex: player.recordIndex, trackIndex: player.trackIndex, at: Date.now() })
}

export function play() {
  if (player.swap) return
  if (player.sideDone) return void (player.changer = true) // needle is parked: ask what to put on
  if (wrongSpeed()) return flash('mismatch') // won't drop the needle at the wrong speed
  if (player.arm.cueing) return (resumeAfter = player.playing = true) // arm drops when the cue ends
  audio.play()
}
export function pause() {
  if (player.swap) return
  if (player.arm.cueing) return (resumeAfter = player.playing = false) // arm stays up after the cue
  audio.pause()
}
export const toggle = () => (player.playing ? pause() : play())

// --- Seeking = cueing the tonearm: lift the needle, swing to the groove, lower it. ---
// Bluetooth mode has no needle, so it seeks instantly.

const LIFT_MS = 400
const LOWER_MS = 450
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const needleMode = () => MODES[player.mode].id !== 'bt'
let cueToken = 0 // bumping it cancels any cue (or record swap) still in flight
let resumeAfter = false
let scrubbing = false

function posOf(t) {
  const { side } = now()
  return (t - side.start) / (side.end - side.start)
}

/** Move the playhead, kept inside the current side (you can't seek across a record's sides). */
function jump(t) {
  const { record, side } = now()
  audio.currentTime = Math.max(side.start, Math.min(t, side.end - 0.5))
  player.time = audio.currentTime
  player.trackIndex = trackAt(record, player.time)
  return player.time
}

/** Lift the needle (if not already mid-cue). Returns false if a newer cue took over. */
async function lift(token) {
  const arm = player.arm
  if (arm.cueing) return true
  resumeAfter = player.playing
  Object.assign(arm, { cueing: true, lifted: true, phase: 'lift', pos: posOf(audio.currentTime), ms: LIFT_MS })
  audio.pause()
  if (resumeAfter) await sleep(LIFT_MS) // when paused the arm is already up
  return token === cueToken
}

/** Drop the needle if the user still wants to hear music; otherwise leave the arm up. */
async function lower(token) {
  if (resumeAfter) {
    Object.assign(player.arm, { phase: 'lower', lifted: false, ms: LOWER_MS })
    await sleep(LOWER_MS)
    if (token !== cueToken) return
  }
  player.arm.cueing = false
  if (resumeAfter) audio.play() // re-checked: pause may have been tapped while lowering
}

export async function seek(t) {
  if (player.sideDone || player.swap) return
  if (!needleMode()) return jump(t)
  const token = ++cueToken
  if (!(await lift(token))) return
  const arm = player.arm
  const to = posOf(jump(t))
  Object.assign(arm, { phase: 'move', ms: Math.min(900, Math.max(300, Math.abs(to - arm.pos) * 1500)), pos: to })
  await sleep(arm.ms)
  if (token === cueToken) lower(token)
}
export const skip = (dt) => seek(audio.currentTime + dt)

// Dragging the scrub bar: the arm lifts on press, follows the thumb, drops on release.
export function scrubStart() {
  if (!needleMode() || player.sideDone || player.swap) return
  lift(++cueToken)
  scrubbing = true
}
export function scrubTo(t) {
  if (!scrubbing) return seek(t) // keyboard arrows: a normal cue
  Object.assign(player.arm, { phase: 'move', ms: 120, pos: posOf(jump(t)) })
}
export function scrubEnd() {
  if (!scrubbing) return
  scrubbing = false
  lower(++cueToken)
}

function cancelCue() {
  ++cueToken
  scrubbing = false
  player.arm.cueing = false
}

// --- Tracks and sides ---

/** Next song on this side. On the last song the side is over: a record can't skip to its other side. */
export function next() {
  const { record, side } = now()
  if (player.trackIndex < side.last) return seek(record.tracks[player.trackIndex + 1].start)
  if (!needleMode() && player.sideIndex + 1 < record.sides.length) {
    player.sideIndex++ // Bluetooth streams straight through the album
    return jump(record.sides[player.sideIndex].start)
  }
  endOfSide()
}
// Like most players: "previous" restarts the song unless you're in its first 3 s.
export function prev() {
  const { record, side, track } = now()
  if (audio.currentTime - track.start > 3 || player.trackIndex === side.first) return seek(track.start)
  seek(record.tracks[player.trackIndex - 1].start)
}

/** Needle hits the run-out groove: the arm returns to rest and the display asks what's next. */
function endOfSide() {
  if (player.sideDone) return
  const { record } = now()
  if (!needleMode() && player.sideIndex + 1 < record.sides.length) return void player.sideIndex++
  cancelCue()
  audio.pause()
  player.playing = false
  player.sideDone = true
  player.changer = true
}

export const openChanger = () => !player.swap && (player.changer = true)
export const closeChanger = () => (player.changer = false)

const PLACE_MS = 1800 // the user flips / swaps the disc
const DETECT_MS = 1100 // the player recognizes what was put on

/**
 * The user puts a side (of this or another record) face up on the platter.
 * kind: 'flip' (other side, same disc), 'disc' (other disc of this record), 'record', 'replay'.
 */
export async function putOn(recordIndex, sideIndex) {
  const from = now()
  const to = records[recordIndex].sides[sideIndex]
  const kind =
    recordIndex !== player.recordIndex ? 'record' : sideIndex === player.sideIndex ? 'replay' : to.disc === from.side.disc ? 'flip' : 'disc'
  cancelCue()
  const token = cueToken
  audio.pause()
  Object.assign(player, { changer: false, playing: false, swap: { phase: 'place', kind, recordIndex, sideIndex } })
  await sleep(PLACE_MS)
  if (token !== cueToken) return

  if (recordIndex !== player.recordIndex) {
    player.recordIndex = recordIndex
    audio.src = records[recordIndex].src
  }
  Object.assign(player, { sideIndex, sideDone: false, trackIndex: to.first, time: to.start })
  audio.currentTime = to.start
  player.swap.phase = 'detect'
  await sleep(DETECT_MS)
  if (token !== cueToken) return

  // Drop the needle onto the lead-in groove, unless the speed knob doesn't suit this disc.
  player.swap = null
  if (wrongSpeed()) return flash('mismatch')
  Object.assign(player.arm, { cueing: true, lifted: true, phase: 'lift', pos: 0, ms: 0 })
  resumeAfter = player.playing = true
  lower(token)
}

// --- Physical inputs (simulated from the testing panel) ---

/** Tell the display to show a knob overlay (a fresh object each time re-triggers it). */
function flash(kind, from = 'knob') {
  player.knob = { kind, from }
}

/**
 * Speaker volume, from the physical knob or remotely from the phone ('phone'). The knob is an
 * endless encoder with an LED ring, so a remote change never fights the knob's position.
 */
export function setVolume(v, from = 'knob') {
  player.volume = Math.max(0, Math.min(100, Math.round(v)))
  audio.volume = player.volume / 100
  flash('volume', from)
}

/** The speed knob locks while the needle is on the record. */
export const speedLocked = () => player.playing && needleMode()
/** Knob is on a record speed that doesn't match the size of the disc on the platter. */
export const wrongSpeed = () => needleMode() && MODES[player.mode].id !== speedFor(now().record)

export function setMode(i) {
  if (i === player.mode) return
  if (speedLocked()) return flash('locked') // knob doesn't move; the display says why
  if (player.playing) pause() // leaving Bluetooth: stop the stream before the needle is involved
  player.mode = i
  flash(wrongSpeed() ? 'mismatch' : 'mode')
}

/** Proximity sensor on the tonearm: only a problem while the needle is on the record. */
export function reachForTonearm() {
  if (player.playing && needleMode() && !player.arm.cueing) player.needleAlert = { at: Date.now() }
}

/** Testing shortcut: jump to the last few seconds of the side so its end can be demoed. */
export const nearSideEnd = () => !player.sideDone && !player.swap && jump(now().side.end - 6)
