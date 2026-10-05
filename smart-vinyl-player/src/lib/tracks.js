// The two records loaded on the mock player. lyricsId is an LRCLIB record id
// picked to match the local MP3's duration. lyricsOffset (s) nudges lyric timing
// if a pressing/upload starts earlier or later than the LRCLIB timing.
const art = (path) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x600bb.jpg`

export const tracks = [
  {
    title: 'Broken Clocks',
    artist: 'SZA',
    album: 'Ctrl',
    src: '/audio/broken-clocks.mp3',
    lyricsId: 34191638,
    lyricsOffset: 0,
    artwork: art('Music124/v4/a2/bc/ad/a2bcad46-b389-4be1-8bac-5a0959b0b8e4/886446548449.jpg'),
  },
  {
    title: 'Sunshine (feat. Fousheé)',
    artist: 'Steve Lacy',
    album: 'Gemini Rights',
    src: '/audio/sunshine.mp3',
    lyricsId: 2840510,
    lyricsOffset: 0,
    artwork: art('Music221/v4/41/cf/77/41cf7744-535f-3679-0ca6-c1b8d3f98c8f/196874557266.jpg'),
  },
]
