import React from 'react';
import Icon from '../AppIcon';

const palettes = {
  yellow: {
    ring: 'ring-amber-400/30',
    gradient: 'from-neutral-800/80 via-neutral-900/80 to-black/80',
    iconBg: 'from-amber-500 to-yellow-600'
  },
  red: {
    ring: 'ring-red-400/30',
    gradient: 'from-neutral-800/80 via-neutral-900/80 to-black/80',
    iconBg: 'from-red-600 to-rose-700'
  },
  blue: {
    ring: 'ring-blue-400/30',
    gradient: 'from-neutral-800/80 via-neutral-900/80 to-black/80',
    iconBg: 'from-blue-500 to-indigo-600'
  },
  green: {
    ring: 'ring-green-400/30',
    gradient: 'from-neutral-800/80 via-neutral-900/80 to-black/80',
    iconBg: 'from-green-500 to-emerald-600'
  },
  purple: {
    ring: 'ring-purple-400/30',
    gradient: 'from-neutral-800/80 via-neutral-900/80 to-black/80',
    iconBg: 'from-purple-600 to-fuchsia-600'
  }
};

export default function PillActionButton({ color='purple', iconName='Share2', children, className='', disabled=false, onClick, type='button' }) {
  const s = palettes[color] || palettes.purple;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-white 
        bg-gradient-to-br ${s.gradient} border border-white/10 shadow-inner ring-1 ${s.ring}
        hover:border-white/20 hover:ring-white/40 transition backdrop-blur-xs disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full shadow-md`}
        style={{
          backgroundImage: 'url(https://cdn.builder.io/api/v1/image/assets%2F0f853d9f9b554108a2a6db6f58cbee9d%2Fc91455788a454e77862557660ba55374)',
          backgroundColor: 'rgba(103, 16, 229, 1)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <Icon name={iconName} size={16} className="text-white" />
      </span>
      <span className="text-sm font-medium">{children}</span>
      <span className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 blur-xl" />
    </button>
  );
}
