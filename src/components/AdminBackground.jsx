import React from 'react';

const AdminBackground = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background pattern - positioned behind all content */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute top-20 left-20 w-32 h-32 border border-primary/20 rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-primary/20 rounded-lg rotate-45"></div>
          <div className="absolute bottom-32 left-40 w-40 h-40 border border-primary/20 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 border border-primary/20 rounded-lg rotate-12"></div>
        </div>
        
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] via-transparent to-purple-500/[0.01]"></div>
      </div>
      
      {/* Content container with proper z-index */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default AdminBackground;
