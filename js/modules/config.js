/* ── Shared Configuration & Utilities ── */
export const CONFIG = {
  usernames: {
    letterboxd: 'asad_k',
    lastfm: 'Asad991',
    github: 'Asad101001',
    twitter: 'As4d_41'
  },
  currently: {
    reading: '1984 George Orwell',
    tv: {
      title: 'House of the Dragon',
      season: 3,
      episode: 8,
      watching: false,
      lastWatched: '2026-08-18T05:06:00.000Z'
    },
    series: ['House of the Dragon', 'Off Campus', 'Adults', 'Widow\'s Bay', 'Euphoria', 'The Great', 'Shrinking', 'Batman: The Animated Series', 'Dark', 'Lost']
  },
  big3: {
    players: [
      { name: 'Lamine Yamal', shortName: 'LAMINE', fallback: '⚽', image: '/images/footballers/lamine.jpg' },
      { name: 'Pedri',        shortName: 'PEDRI',  fallback: '⚽', image: '/images/footballers/pedri.jpg' },
      { name: 'Rayan Cherki', shortName: 'CHERKI', fallback: '⚽', image: '/images/footballers/cherki.jpg' }
    ],
    watchlist: [
      { title: 'Dune: Part Three', searchQuery: 'Dune: Part Three' },
      { title: 'Dune: Part Three', searchQuery: 'Dune: Part Three' },
      { title: 'Dune: Part Three', searchQuery: 'Dune: Part Three' }
    ],
    seriesWatchlist: [
      { title: 'Lost' },
      { title: 'Dark' },
      { title: 'Cape Fear' },
      { title: 'The Wire' }
    ]
  }
};

/**
 * Simple HTML escaping to prevent XSS.
 */
export function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
