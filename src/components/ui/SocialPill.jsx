import React from 'react';
import Icon from '../AppIcon';

const brandStyles = {
  instagram: {
    ring: 'ring-pink-400/30',
    gradient: 'from-neutral-800/80 via-neutral-900/80 to-black/80',
    iconBg: 'from-pink-500 to-purple-600'
  },
  soundcloud: {
    ring: 'ring-pink-400/30',
    gradient: 'from-neutral-800/80 via-neutral-900/80 to-black/80',
    iconBg: 'from-orange-500 to-amber-600'
  },
  youtube: {
    ring: 'ring-red-400/30',
    gradient: 'from-neutral-800/80 via-neutral-900/80 to-black/80',
    iconBg: 'from-red-600 to-red-700'
  },
  spotify: {
    ring: 'ring-green-400/30',
    gradient: 'from-neutral-800/80 via-neutral-900/80 to-black/80',
    iconBg: 'from-green-500 to-emerald-600'
  },
  facebook: {
    ring: 'ring-blue-400/30',
    gradient: 'from-neutral-800/80 via-neutral-900/80 to-black/80',
    iconBg: 'from-blue-600 to-indigo-700'
  },
  twitter: {
    ring: 'ring-sky-400/30',
    gradient: 'from-neutral-800/80 via-neutral-900/80 to-black/80',
    iconBg: 'from-sky-500 to-blue-600'
  }
};

export default function SocialPill({ id, name, icon = 'Share2', href }) {
  const s = brandStyles[id] || brandStyles.instagram;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-white
        bg-gradient-to-br ${s.gradient} border border-white/10 shadow-inner
        ring-1 ${s.ring} hover:border-white/20 hover:ring-white/40 transition
        backdrop-blur-xs ${id === 'soundcloud' ? 'ml-2' : ''}`}
    >
      {id === 'soundcloud' ? (
        <img
          loading="lazy"
          srcSet="https://cdn.builder.io/api/v1/image/assets%2F767561424d3b4ac1ada515139f8110f4%2F889da6c93b0e4d83aedd6f98a0cc7575?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2F767561424d3b4ac1ada515139f8110f4%2F889da6c93b0e4d83aedd6f98a0cc7575?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2F767561424d3b4ac1ada515139f8110f4%2F889da6c93b0e4d83aedd6f98a0cc7575?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2F767561424d3b4ac1ada515139f8110f4%2F889da6c93b0e4d83aedd6f98a0cc7575?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2F767561424d3b4ac1ada515139f8110f4%2F889da6c93b0e4d83aedd6f98a0cc7575?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2F767561424d3b4ac1ada515139f8110f4%2F889da6c93b0e4d83aedd6f98a0cc7575?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2F767561424d3b4ac1ada515139f8110f4%2F889da6c93b0e4d83aedd6f98a0cc7575?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2F767561424d3b4ac1ada515139f8110f4%2F889da6c93b0e4d83aedd6f98a0cc7575"
          className="aspect-square object-cover object-center w-full -ml-[5px] min-w-[20px] min-h-[20px] overflow-hidden"
          alt={name}
        />
      ) : (
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${s.iconBg} shadow-md`}>
          <Icon name={icon} size={id === 'youtube' ? 20 : 16} className="text-white" />
        </span>
      )}
      <span className="text-sm font-medium">{name}</span>
      <span className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 blur-xl" />
    </a>
  );
}
