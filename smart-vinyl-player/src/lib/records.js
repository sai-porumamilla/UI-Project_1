// The records you can put on the mock player. Each record is one audio file of the
// whole album; sides and tracks are time ranges inside it (from the album timestamps).
// lyricsId is an LRCLIB id; lyricsOffset (s) nudges a track's lyrics if they drift.

const audio = (file) => `${import.meta.env?.BASE_URL ?? '/'}audio/${file}`
const sec = (mmss) => {
  const [m, s] = mmss.split(':')
  return +m * 60 + +s
}

/** Expand [side, title, start, lyricsId] rows into tracks + sides with start/end seconds. */
export function build({ tracks: rows, length, ...record }) {
  const tracks = rows.map(([side, title, at, lyricsId]) => ({ side, title, start: sec(at), lyricsId, lyricsOffset: 0 }))
  tracks.forEach((t, i) => (t.end = tracks[i + 1]?.start ?? sec(length)))
  const sides = [...new Set(tracks.map((t) => t.side))].map((name, i) => {
    const on = tracks.filter((t) => t.side === name)
    return { name, disc: Math.floor(i / 2) + 1, start: on[0].start, end: on.at(-1).end, first: tracks.indexOf(on[0]), last: tracks.indexOf(on.at(-1)) }
  })
  return { ...record, tracks, sides }
}

export const records = [
  {
    title: 'Ctrl',
    artist: 'SZA',
    size: 12, // inches: double LP
    src: audio('ctrl.m4a'),
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a2/bc/ad/a2bcad46-b389-4be1-8bac-5a0959b0b8e4/886446548449.jpg/600x600bb.jpg',
    length: '48:53',
    tracks: [
      ['A', 'Supermodel', '0:00', 36257896],
      ['A', 'Love Galore (feat. Travis Scott)', '3:00', 4198201],
      ['A', 'Doves In The Wind (feat. Kendrick Lamar)', '7:34', 9047729],
      ['A', 'Drew Barrymore', '12:00', 34202942],
      ['B', 'Prom', '15:50', 997015],
      ['B', 'The Weekend', '19:05', 34590777],
      ['B', 'Go Gina', '23:37', 23405583],
      ['B', 'Garden (Say It Like Dat)', '26:17', 18359161],
      ['C', 'Broken Clocks', '29:46', 648115],
      ['C', 'Anything', '33:34', 33440671],
      ['C', 'Wavy (Interlude) (feat. James Fauntleroy)', '36:03', 9597295],
      ['D', 'Normal Girl', '37:18', 34968634],
      ['D', 'Pretty Little Birds (feat. Isaiah Rashad)', '41:30', 14313753],
      ['D', '20 Something', '45:35', 36257616],
    ],
  },
  {
    title: 'The Lo-Fis',
    artist: 'Steve Lacy',
    size: 12,
    src: audio('the-lo-fis.m4a'),
    artwork: 'https://cdn-images.dzcdn.net/images/cover/aab27852a05351552e9dcacdbb14ec3a/500x500-000000-80-0-0.jpg',
    length: '25:22',
    tracks: [
      ['A', 'Atomic Vomit', '0:00', 2228840],
      ['A', 'When I', '1:30', 3683712],
      ['A', 'That’s No Fun', '2:31', 2553559],
      ['A', 'Cocky Girl', '5:13', 3681631],
      ['A', 'Uuuu', '6:07', 2553600],
      ['A', 'Jars of It', '7:37', 3682305],
      ['A', 'Bars. 16', '10:02', 3680731],
      ['B', 'Infrunami', '10:49', 2553357],
      ['B', 'Hummer', '13:47', 3104336],
      ['B', '4real', '14:59', 3680447],
      ['B', 'I Think I Should', '17:23', 3682208],
      ['B', 'Daze', '19:02', 3681720],
      ['B', 'Out of Me Head', '20:15', 3682847],
      ['B', 'Donchano', '22:36', 3681803],
      ['B', 'The Song', '24:15', 3683487],
    ],
  },
].map(build)

/**
 * A sensor on the platter measures the disc's size, and size tells the speed it was cut for:
 * a 12-inch LP plays at 33⅓ RPM, a 7-inch single at 45. Returns a MODES id.
 */
export const speedFor = (record) => (record.size === 7 ? '45' : '33')
export const discLabel = (record) => (record.size === 7 ? '7″ single' : '12″ LP')

/** Index of the track playing at `time` (seconds into the record's audio file). */
export const trackAt = (record, time) => {
  let i = 0
  while (i + 1 < record.tracks.length && record.tracks[i + 1].start <= time) i++
  return i
}
