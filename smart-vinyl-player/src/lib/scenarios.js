// Four mock owners for the companion app (REQUIREMENTS Option 3).
// Sensor readings drive the health score; library + history drive insights.

export const TIERS = ['Excellent', 'Good', 'Fair', 'Poor']

// thresholds: value below t[0] = Excellent, below t[1] = Good, below t[2] = Fair, else Poor.
export const SENSORS = [
  { key: 'speed', name: 'Belt & platter speed', unit: '% off', t: [0.3, 0.8, 1.5], tip: 'Belt may be slipping. Recalibrate speed or replace the belt.' },
  { key: 'stylus', name: 'Stylus cleanliness', unit: 'h since clean', t: [10, 25, 50], tip: 'Dust on the needle. Brush the stylus back-to-front.' },
  { key: 'air', name: 'Air quality (dust)', unit: 'µg/m³ PM2.5', t: [12, 35, 55], tip: 'Dusty room. Keep the lid closed between plays.' },
  { key: 'vibration', name: 'Vibration', unit: 'mm/s', t: [0.5, 1.5, 3], tip: 'Move the player off the speaker shelf or add isolation feet.' },
  { key: 'clipping', name: 'Stylus clipping', unit: 'events/h', t: [0.5, 3, 10], tip: 'Distortion detected. Check tracking force and anti-skate.' },
  { key: 'tonearm', name: 'Tonearm level', unit: '° off parallel', t: [0.5, 1, 2], tip: 'Tonearm is tilted. Adjust the arm height (VTA).' },
]

export const levelOf = (v, t) => {
  const i = t.findIndex((x) => v < x)
  return i === -1 ? 3 : i
}

/** Mean of sensor levels, but one Poor sensor caps the overall at Fair. */
export function overallLevel(readings) {
  const levels = SENSORS.map((s) => levelOf(readings[s.key], s.t))
  const mean = levels.reduce((a, b) => a + b, 0) / levels.length
  return Math.max(Math.round(mean), Math.max(...levels) - 1)
}

// 7×24 plays (Mon..Sun × hour) shaped by listening habits; deterministic "noise".
function heatmap(peaks, weekend, scale, seed) {
  return Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => {
      let v = 0
      for (const p of peaks) {
        const dist = Math.min(Math.abs(h - p), 24 - Math.abs(h - p))
        v += Math.exp(-(dist ** 2) / 4)
      }
      if (d >= 5) v *= weekend
      const noise = (Math.sin(seed * 97 + d * 31 + h * 7) + 1) * 0.3 + 0.7
      return Math.round(v * noise * scale)
    }),
  )
}

const ctrl = { title: 'Ctrl', artist: 'SZA', year: 2017 }
const gemini = { title: 'Gemini Rights', artist: 'Steve Lacy', year: 2022 }

export const profiles = [
  {
    name: 'Maya',
    blurb: 'Audiophile collector, dedicated listening room',
    readings: { speed: 0.1, stylus: 4, air: 6, vibration: 0.3, clipping: 0, tonearm: 0.2 },
    stylusLife: [310, 1000],
    records: [
      { ...ctrl, variant: '5th anniversary, red translucent', color: '#c8323c', special: true },
      { ...gemini, variant: 'Limited blue marble', color: '#3a6fd8', special: true },
      { title: 'Blonde', artist: 'Frank Ocean', year: 2016, variant: 'Black Friday press', color: '#e9e6df', special: true },
      { title: 'Kind of Blue', artist: 'Miles Davis', year: 1959, variant: '180g reissue', color: '#111' },
      { title: 'Rumours', artist: 'Fleetwood Mac', year: 1977, variant: 'Original 1977 pressing', color: '#111', special: true },
      { title: 'SOS', artist: 'SZA', year: 2022, variant: 'Signed, smoke grey', color: '#7d7f86', special: true },
      { title: 'Igor', artist: 'Tyler, the Creator', year: 2019, variant: 'Standard black', color: '#111' },
      { title: 'Random Access Memories', artist: 'Daft Punk', year: 2013, variant: '10th anniv. gold', color: '#c9a646', special: true },
    ],
    top: [['SZA', 58], ['Frank Ocean', 41], ['Steve Lacy', 33], ['Miles Davis', 27], ['Daft Punk', 19]],
    stats: { hours: 46, spins: 132, streak: 21 },
    heat: heatmap([20, 22], 1.6, 6, 1),
  },
  {
    name: 'Jordan',
    blurb: 'College dorm, player shares a desk with a subwoofer',
    readings: { speed: 0.5, stylus: 38, air: 41, vibration: 2.2, clipping: 2, tonearm: 0.6 },
    stylusLife: [520, 1000],
    records: [
      { ...ctrl, variant: 'Standard black', color: '#111' },
      { ...gemini, variant: 'Urban Outfitters yellow', color: '#e3c13b', special: true },
      { title: 'Channel Orange', artist: 'Frank Ocean', year: 2012, variant: 'Orange vinyl', color: '#e8762d', special: true },
      { title: 'To Pimp a Butterfly', artist: 'Kendrick Lamar', year: 2015, variant: 'Standard black', color: '#111' },
      { title: 'Currents', artist: 'Tame Impala', year: 2015, variant: 'Standard black', color: '#111' },
    ],
    top: [['Steve Lacy', 44], ['SZA', 39], ['Tame Impala', 30], ['Kendrick Lamar', 22], ['Frank Ocean', 12]],
    stats: { hours: 31, spins: 97, streak: 6 },
    heat: heatmap([23, 1], 1.2, 5, 2),
  },
  {
    name: 'Sam',
    blurb: 'First turntable, weekend afternoon listener',
    readings: { speed: 0.4, stylus: 12, air: 18, vibration: 0.8, clipping: 1, tonearm: 0.9 },
    stylusLife: [40, 1000],
    records: [
      { ...ctrl, variant: 'Standard black', color: '#111' },
      { ...gemini, variant: 'Standard black', color: '#111' },
      { title: 'Abbey Road', artist: 'The Beatles', year: 1969, variant: 'Anniversary edition', color: '#111', special: true },
    ],
    top: [['SZA', 14], ['Steve Lacy', 11], ['The Beatles', 9]],
    stats: { hours: 9, spins: 34, streak: 2 },
    heat: heatmap([14, 16], 3, 2, 3),
  },
  {
    name: 'Pat',
    blurb: 'Inherited player, set up in a garage workshop',
    readings: { speed: 1.9, stylus: 70, air: 62, vibration: 1.2, clipping: 14, tonearm: 2.4 },
    stylusLife: [940, 1000],
    records: [
      { ...ctrl, variant: 'Standard black', color: '#111' },
      { ...gemini, variant: 'Standard black', color: '#111' },
      { title: 'Rumours', artist: 'Fleetwood Mac', year: 1977, variant: "Dad's original pressing", color: '#111', special: true },
      { title: 'Led Zeppelin IV', artist: 'Led Zeppelin', year: 1971, variant: 'Original pressing', color: '#111', special: true },
      { title: 'Hotel California', artist: 'Eagles', year: 1976, variant: 'Standard black', color: '#111' },
      { title: 'Thriller', artist: 'Michael Jackson', year: 1982, variant: 'Standard black', color: '#111' },
    ],
    top: [['Fleetwood Mac', 18], ['Eagles', 12], ['SZA', 8], ['Led Zeppelin', 7], ['Steve Lacy', 4]],
    stats: { hours: 14, spins: 41, streak: 3 },
    heat: heatmap([8, 10], 1.4, 3, 4),
  },
]
