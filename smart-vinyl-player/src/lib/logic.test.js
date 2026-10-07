// Run: npm test
import assert from 'node:assert/strict'
import { parseLrc, lineAt } from './lyrics.js'
import { profiles, overallLevel, levelOf } from './scenarios.js'
import { records, trackAt, speedFor } from './records.js'

const lines = parseLrc('[ar: x]\n[00:10.00] b\n[00:02.50] a\n[01:00.00]\n')
assert.deepEqual(lines, [
  { time: 2.5, text: 'a' },
  { time: 10, text: 'b' },
  { time: 60, text: '' },
])
assert.equal(lineAt(lines, 0), -1)
assert.equal(lineAt(lines, 2.5), 0)
assert.equal(lineAt(lines, 30), 1)
assert.equal(lineAt(lines, 999), 2)

// Health tiers: thresholds are exclusive upper bounds; one Poor sensor caps overall at Fair.
assert.equal(levelOf(0.29, [0.3, 0.8, 1.5]), 0)
assert.equal(levelOf(0.3, [0.3, 0.8, 1.5]), 1)
assert.equal(levelOf(9, [0.3, 0.8, 1.5]), 3)
assert.equal(overallLevel({ speed: 0, stylus: 0, air: 0, vibration: 0, clipping: 0, tonearm: 9 }), 2)
assert.deepEqual(profiles.map((p) => overallLevel(p.readings)), [0, 2, 1, 3]) // one profile per tier
// Records: sides come from the track list; discs pair up sides A/B, C/D.
const [ctrl, lofis] = records
assert.deepEqual(ctrl.sides.map((s) => [s.name, s.disc, s.start, s.end]), [
  ['A', 1, 0, 950], ['B', 1, 950, 1786], ['C', 2, 1786, 2238], ['D', 2, 2238, 2933],
])
assert.deepEqual(lofis.sides.map((s) => [s.name, s.disc, s.first, s.last]), [['A', 1, 0, 6], ['B', 1, 7, 14]])
assert.equal(ctrl.tracks[8].title, 'Broken Clocks')
assert.equal(trackAt(ctrl, 1785.9), 7) // last second of Side B is still "Garden"
assert.equal(trackAt(ctrl, 1786), 8)
// Disc size picks the speed: 12-inch LP = 33⅓, 7-inch single = 45.
assert.equal(speedFor(ctrl), '33')
assert.equal(speedFor({ size: 7 }), '45')
console.log('logic ok')
