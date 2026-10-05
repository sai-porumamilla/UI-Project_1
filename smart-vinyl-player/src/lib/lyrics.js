// Time-synced lyrics from LRCLIB (free, no key). Timing is per line.

const LINE = /^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/

/** "[01:02.50] hello" lines -> [{ time: 62.5, text: 'hello' }], sorted by time. */
export function parseLrc(lrc) {
  const lines = []
  for (const raw of lrc.split('\n')) {
    const m = raw.trim().match(LINE)
    if (m) lines.push({ time: +m[1] * 60 + +m[2], text: m[3] })
  }
  return lines.sort((a, b) => a.time - b.time)
}

/** Index of the line being sung at `time`, or -1 before the first line. */
export function lineAt(lines, time) {
  let i = -1
  while (i + 1 < lines.length && lines[i + 1].time <= time) i++
  return i
}

const cache = new Map()

export function fetchLyrics(id) {
  if (!cache.has(id)) {
    cache.set(
      id,
      fetch(`https://lrclib.net/api/get/${id}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d) => parseLrc(d.syncedLyrics ?? ''))
        .catch((e) => {
          cache.delete(id) // allow a retry next time
          throw e
        }),
    )
  }
  return cache.get(id)
}
