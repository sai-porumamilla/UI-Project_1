// Single source of truth for the physical player. Both the on-device display
// and the phone app read/write this, so they always stay in sync.
import { tracks } from './tracks.js'

export const MODES = [
  { id: '33', label: '33⅓ RPM', rpm: 33.3 },
  { id: '45', label: '45 RPM', rpm: 45 },
  { id: 'bt', label: 'Bluetooth', rpm: 0 },
]

export const player = $state({
  trackIndex: 0,
  playing: false,
  time: 0,
  duration: 0,
  volume: 60, // 0-100, set by the physical volume knob
  mode: 0, // index into MODES, set by the physical mode knob
  knob: null, // last knob turn { kind: 'volume' | 'mode' } — new object each turn
  needleAlert: null, // set when a hand is sensed near the tonearm mid-song
  profile: 0, // index into scenarios.js profiles
  plays: [], // songs auto-detected this session: { trackIndex, at }
})

const audio = new Audio()
audio.preload = 'metadata'
audio.volume = player.volume / 100
audio.addEventListener('timeupdate', () => (player.time = audio.currentTime))
audio.addEventListener('loadedmetadata', () => (player.duration = audio.duration))
audio.addEventListener('play', () => (player.playing = true))
audio.addEventListener('pause', () => (player.playing = false))
audio.addEventListener('ended', () => {
  next()
  play()
})

function load(i) {
  player.trackIndex = (i + tracks.length) % tracks.length
  player.time = 0
  audio.src = tracks[player.trackIndex].src
}
load(0)

export function play() {
  if (audio.currentTime < 1) player.plays.unshift({ trackIndex: player.trackIndex, at: Date.now() })
  audio.play()
}
export const pause = () => audio.pause()
export const toggle = () => (player.playing ? pause() : play())

export function seek(t) {
  audio.currentTime = Math.max(0, Math.min(t, player.duration || 0))
  player.time = audio.currentTime
}
export const skip = (dt) => seek(audio.currentTime + dt)

function change(i) {
  const was = player.playing
  load(i)
  if (was) play()
}
export const next = () => change(player.trackIndex + 1)
// Like most players: "previous" restarts the song unless you're in the first 3 s.
export const prev = () => (audio.currentTime > 3 ? seek(0) : change(player.trackIndex - 1))

// --- Physical inputs (simulated from the testing panel) ---

export function setVolume(v) {
  player.volume = Math.max(0, Math.min(100, Math.round(v)))
  audio.volume = player.volume / 100
  player.knob = { kind: 'volume' }
}

export function setMode(i) {
  player.mode = i
  player.knob = { kind: 'mode' }
}

/** Proximity sensor on the tonearm: only a problem while the needle is on the record. */
export function reachForTonearm() {
  if (player.playing && MODES[player.mode].id !== 'bt') player.needleAlert = { at: Date.now() }
}
