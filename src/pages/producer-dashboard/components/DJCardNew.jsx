import React from 'react';
import Button from '../../../components/ui/Button';

const DJCardNew = ({ dj, onViewDetails }) => {
  return (
    <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={dj?.background_image_url || dj?.profile_image_url || '/placeholder-dj.jpg'}
          alt={dj?.name}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-80 flex flex-col justify-end p-6">
        {/* DJ Logo/Initial */}
        <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <span className="text-white font-bold text-sm">
            {dj?.name?.charAt(0)?.toUpperCase()}
          </span>
        </div>

        {/* DJ Info */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg" style={{ opacity: 0.65 }}>
            {dj?.name}
          </h3>

        </div>

        {/* Action Button */}
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => onViewDetails(dj)}
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm"
          >
            Ver detalhes
          </Button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/10 group-hover:to-blue-600/10 transition-all duration-300"></div>
    </div>
  );
};

export default DJCardNew;
