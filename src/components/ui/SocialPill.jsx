import React from 'react';
import Icon from '../AppIcon';

const brandStyles = {
  instagram: {
    ring: 'ring-pink-400/30',
    gradient: 'from-neutral-800/80 via-neutral-900/80 to-black/80',
    iconBg: 'from-pink-500 to-purple-600'
  },
  soundcloud: {
    ring: 'ring-orange-400/30',
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
      className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-white 
        bg-gradient-to-br ${s.gradient} border border-white/10 shadow-inner 
        ring-1 ${s.ring} hover:border-white/20 hover:ring-white/40 transition 
        backdrop-blur-xs`}
    >
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${s.iconBg} shadow-md`}>
        <Icon name={icon} size={16} className="text-white" />
      </span>
      <span className="text-sm font-medium">{name}</span>
      <span className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 blur-xl" />
    </a>
  );
}
