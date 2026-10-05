// Run: npm test
import assert from 'node:assert/strict'
import { parseLrc, lineAt } from './lyrics.js'
import { profiles, overallLevel, levelOf } from './scenarios.js'

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
console.log('logic ok')
