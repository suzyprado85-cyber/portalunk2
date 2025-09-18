import React from 'react';
import Button from './Button';
import Icon from '../AppIcon';
import { useAuth } from '../../contexts/AuthContext';

const TopBar = ({ onMenuClick }) => {
  const { userProfile, signOut } = useAuth();

  const getInitials = () => {
    const name = userProfile?.name || userProfile?.company_name || 'Usuário';
    return name?.split(' ')
      ?.map(word => word?.charAt(0))
      ?.join('')
      ?.substring(0, 2)
      ?.toUpperCase();
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  // Prefer company avatar if set in localStorage (admin)
  let companyAvatar = null;
  try { companyAvatar = typeof window !== 'undefined' ? localStorage.getItem('company_avatar_url') : null; } catch (e) { companyAvatar = null; }

  const displayedAvatar = companyAvatar || userProfile?.avatar_url || userProfile?.profile_image_url;

  return (
    <header className="glass-card flex items-center justify-between px-6 rounded-2xl" style={{ backdropFilter: 'blur(24px)', backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))', border: '0.8px solid rgba(63, 23, 97, 0.89)', height: '64px', padding: '50px 24px 24px' }}>
      <div className="flex items-center space-x-4 -mt-5">
        {/* Avatar / Inicial */}
        <button className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 cursor-pointer overflow-hidden">
          {displayedAvatar ? (
            <img
              src={displayedAvatar}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-medium">{getInitials()}</span>
          )}
        </button>



        <div className="flex items-center space-x-3">
          <span className="text-white font-medium">
            Olá, {userProfile?.name || userProfile?.company_name || 'Usuário'}! 👋
          </span>

          <div
            className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${
              userProfile?.role === 'admin'
                ? 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
            }`}
          >
            {userProfile?.role === 'admin' ? 'Admin' : 'Produtor'}
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 -mt-6"
        style={{ border: '1px solid rgba(122, 33, 33, 0.71)' }}
      >
        <Icon name="LogOut" size={16} />
        <span className="ml-2">Sair</span>
      </Button>
    </header>
  );
};

export default TopBar;
