export function normalizeSocialUrl(platform, value) {
  if (!value) return null;
  const raw = String(value).trim();
  const hasHttp = raw.startsWith('http://') || raw.startsWith('https://');
  switch (platform) {
    case 'instagram': {
      const handle = raw.replace(/^@/, '');
      return hasHttp ? raw : `https://instagram.com/${handle}`;
    }
    case 'soundcloud': {
      return hasHttp ? raw : `https://soundcloud.com/${raw}`;
    }
    case 'youtube': {
      return hasHttp ? raw : `https://youtube.com/${raw}`;
    }
    case 'spotify': {
      return hasHttp ? raw : `https://open.spotify.com/artist/${raw}`;
    }
    case 'facebook': {
      return hasHttp ? raw : `https://facebook.com/${raw}`;
    }
    case 'twitter': {
      const handle = raw.replace(/^@/, '');
      return hasHttp ? raw : `https://twitter.com/${handle}`;
    }
    default:
      return hasHttp ? raw : raw;
  }
}

export function collectAvailableSocials(dj) {
  if (!dj) return [];
  const entries = [
    { id: 'soundcloud', name: 'SoundCloud', icon: 'SoundCloud', value: dj?.soundcloud, bg: 'from-orange-600/80 to-amber-600/80', glow: 'via-orange-500/25' },
    { id: 'instagram', name: 'Instagram', icon: 'Instagram', value: dj?.instagram, bg: 'from-pink-600/80 to-purple-700/80', glow: 'via-pink-500/25' },
    { id: 'youtube', name: 'YouTube', icon: 'YouTube', value: dj?.youtube, bg: 'from-red-600/80 to-red-700/80', glow: 'via-red-500/25' },
    { id: 'spotify', name: 'Spotify', icon: 'Music', value: dj?.spotify, bg: 'from-green-600/80 to-emerald-700/80', glow: 'via-green-500/25' },
    { id: 'facebook', name: 'Facebook', icon: 'Facebook', value: dj?.facebook, bg: 'from-blue-600/80 to-indigo-700/80', glow: 'via-blue-500/25' },
    { id: 'twitter', name: 'Twitter', icon: 'Twitter', value: dj?.twitter, bg: 'from-sky-500/80 to-blue-600/80', glow: 'via-sky-400/25' }
  ];
  return entries
    .map(e => ({ ...e, url: normalizeSocialUrl(e.id, e.value) }))
    .filter(e => !!e.url);
}
