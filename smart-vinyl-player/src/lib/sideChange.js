// What to tell the user when a side ends or they change records. Shared by the player's
// screen (display/Changer.svelte) and the phone (phone/PhonePicker.svelte) so both say the
// same thing. Call these inside $derived / markup so they stay reactive.
import { player, now } from './player.svelte.js'
import { records } from './records.js'

export const songs = (s) => s.last - s.first + 1
export const mins = (s) => Math.round((s.end - s.start) / 60)

/** Index of the side a listener would put on next, or null after the last side. */
export function nextSideIndex() {
  const { record } = now()
  return player.sideIndex + 1 < record.sides.length ? player.sideIndex + 1 : null
}

/** The physical action needed to get side `i` of this record face up. */
export function action(i) {
  const { record, side } = now()
  return i === player.sideIndex ? 'Play again' : record.sides[i].disc === side.disc ? 'Flip' : 'Swap disc'
}

/** Highlight: the side that comes next once this one is over. */
export const isUpNext = (i) => player.sideDone && i === nextSideIndex()
/** Highlight: a new album, once the last side is over. */
export const albumUpNext = () => player.sideDone && nextSideIndex() === null

export const otherRecords = () => records.map((r, i) => ({ r, i })).filter(({ i }) => i !== player.recordIndex)

/** [title, subtitle] for the picker. */
export function heading() {
  const { record, side } = now()
  const next = nextSideIndex()
  if (!player.sideDone) return ['Change side or record', 'The needle lifts as soon as you choose.']
  if (next === null) return [`That's the end of ${record.title}`, `Start again from Side ${record.sides[0].name}, or put on a new album.`]
  const n = record.sides[next]
  return n.disc === side.disc
    ? [`Side ${side.name} is over`, `Flip the record to Side ${n.name} to keep listening.`]
    : [`Disc ${side.disc} is over`, `Swap in Disc ${n.disc} and put Side ${n.name} face up.`]
}

/** The change in progress: what's going on, and [title, instruction] for the user. */
export function swapInfo() {
  const swap = player.swap
  if (!swap) return null
  const { record, side } = now()
  const toRecord = records[swap.recordIndex]
  const toSide = toRecord.sides[swap.sideIndex]
  const s = `Side ${toSide.name}`
  const steps = {
    flip: ['Flip the record over', `Place ${s} face up on the platter.`],
    disc: [`Swap in Disc ${toSide.disc}`, `Put Disc ${side.disc} back in its sleeve and place ${s} face up.`],
    record: [`Put on ${toRecord.title}`, `Place ${s} face up on the platter.`],
    replay: [`Starting ${s} again`, 'The tonearm returns to the first groove.'],
  }[swap.kind]
  return { ...swap, record, side, toRecord, toSide, steps }
}
