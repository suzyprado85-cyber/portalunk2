import React from 'react';

const VinylRecord = ({ isPlaying = true, logoSrc = '/favicon.ico', size = 220 }) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className="relative select-none"
      style={{ width: dimension, height: dimension }}
      aria-hidden
    >
      {/* Disco de vinil */}
      <div
        className={`relative rounded-full bg-[radial-gradient(circle,_#111_35%,_#0b0b0b_36%,_#101010_38%,_#0a0a0a_40%,_#0f0f0f_42%,_#0a0a0a_44%,_#0f0f0f_46%,_#0a0a0a_48%,_#0f0f0f_50%)] border border-gray-800/80 shadow-[0_0_40px_rgba(0,0,0,0.6)] ${isPlaying ? 'animate-spin-slow' : ''}`}
        style={{ width: dimension, height: dimension }}
      >
        {/* Sulcos (anéis) */}
        <div className="absolute inset-0 rounded-full pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-black/20"
              style={{
                transform: `scale(${1 - i * 0.03})`,
                opacity: 0.5 - i * 0.03
              }}
            />
          ))}
        </div>

        {/* Rótulo central com logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/80 border border-gray-700 overflow-hidden" style={{ width: '34%', height: '34%' }}>
            <img
              src={logoSrc}
              alt="Logo"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        </div>

        {/* Pino central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shadow" />
        </div>
      </div>

      {/* Braço do toca-discos (palheta) + agulha — lado direito */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base do pivô (lado direito) */}
        <div
          className="absolute rounded-full bg-[radial-gradient(circle_at_30%_30%,_#444,_#1f2937_60%)] border border-gray-700 shadow-[0_6px_16px_rgba(0,0,0,0.45)]"
          style={{ top: '22%', right: '-7%', width: '16%', height: '16%', zIndex: 20 }}
        >
          <div className="absolute inset-0 m-[14%] rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border border-gray-600" />
        </div>

        {/* Braço alinhado no lado direito, estendendo-se para a esquerda sobre o disco */}
        <div
          className={`${isPlaying ? 'tonearm-sway' : ''}`}
          style={{
            position: 'absolute',
            top: '28%',
            right: '1.5%',
            width: '52%',
            height: '1.8%',
            transformOrigin: 'right center',
            transform: 'rotate(-16deg)',
            zIndex: 30
          }}
        >
          <div
            className="w-full h-full rounded-full border border-gray-700"
            style={{
              background: 'linear-gradient(90deg, #9ca3af 0%, #6b7280 45%, #9ca3af 100%)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.35)'
            }}
          />

          {/* Headshell (palheta) */}
          <div
            className="absolute"
            style={{
              left: '-3%',
              top: '-70%',
              width: '9%',
              height: '150%',
              transform: 'rotate(6deg)',
              transformOrigin: 'right center'
            }}
          >
            <div
              className="w-full h-full rounded-md border border-gray-700"
              style={{
                background: 'linear-gradient(180deg, #111827, #1f2937)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.45)'
              }}
            >
              <div className="absolute left-[18%] top-[18%] w-1 h-1 rounded-full bg-gray-400" />
              <div className="absolute left-[18%] bottom-[18%] w-1 h-1 rounded-full bg-gray-400" />
            </div>

            {/* Agulha encostando no disco */}
            <div
              className="absolute"
              style={{
                left: '-10%',
                top: '50%',
                width: '24%',
                height: '2px',
                background: '#cbd5e1',
                transform: 'rotate(-12deg) translateY(2px)',
                transformOrigin: 'right center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            />
          </div>
        </div>

        {/* Sombra da agulha sobre o disco (lado direito) */}
        <div
          className="absolute rounded-full"
          style={{
            left: '62%',
            top: '48%',
            width: '6%',
            height: '6%',
            boxShadow: '12px 12px 32px rgba(0,0,0,0.45)',
            zIndex: 10
          }}
        />
      </div>

      {/* Estilos utilitários */}
      <style>{`
        .animate-spin-slow { animation: spin 6s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .tonearm-sway { animation: tonearmSway 6s ease-in-out infinite; }
        @keyframes tonearmSway { 0% { transform: rotate(-16deg); } 50% { transform: rotate(-14deg); } 100% { transform: rotate(-16deg); } }
      `}</style>
    </div>
  );
};

export default VinylRecord;
