import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const RoleSidebar = ({ userRole = 'admin', isCollapsed = false, onToggleCollapse, onHoverChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: userRole === 'admin' ? '/admin-dashboard' : '/producer-dashboard',
      icon: 'LayoutDashboard',
      permissions: ['admin', 'producer']
    },
    {
      id: 'events',
      label: 'Calendário',
      path: '/event-calendar',
      icon: 'Calendar',
      permissions: ['admin', 'producer']
    },
    {
      id: 'dj-management',
      label: 'DJs',
      path: '/dj-management',
      icon: 'Users',
      permissions: ['admin', 'producer']
    },
    {
      id: 'contracts',
      label: 'Contratos',
      path: '/contract-management',
      icon: 'FileText',
      permissions: ['admin', 'producer']
    },
    {
      id: 'producers',
      label: 'Produtores',
      path: '/producer-management',
      icon: 'UserSquare2',
      permissions: ['admin']
    },
    {
      id: 'financial',
      label: 'Financeiro',
      path: '/financial-tracking',
      icon: 'DollarSign',
      permissions: ['admin', 'producer']
    },
    {
      id: 'company-settings',
      label: 'Configurações',
      path: '/company-settings',
      icon: 'Settings',
      permissions: ['admin']
    }
  ];

  const filteredItems = navigationItems?.filter(item => 
    item?.permissions?.includes(userRole)
  );

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location?.pathname === path;
  };

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border/50 z-200">
        <div className="flex items-center justify-around h-14 px-2">
          {filteredItems?.map((item) => (
            <button
              key={item?.id}
              onClick={() => handleNavigation(item?.path)}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-1 rounded-md transition-all duration-150 ease-smooth ${
                isActive(item?.path)
                  ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon
                name={item?.icon}
                size={20}
                className="mb-1"
              />
              <span className="text-xs font-medium truncate max-w-[72px]">
                {item?.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <aside
      onMouseEnter={() => isCollapsed && onHoverChange?.(true)}
      onMouseLeave={() => isCollapsed && onHoverChange?.(false)}
      className={`group fixed left-0 top-0 h-full bg-card/80 backdrop-blur-md border-r border-border/50 z-100 transition-all duration-300 ease-smooth ${
        isCollapsed ? 'w-16 hover:w-60' : 'w-60'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className={`${isCollapsed ? 'hidden group-hover:flex' : 'flex'} items-center space-x-2`}>
            <img src="/logo.png" alt="Portal UNK" className="w-8 h-8 rounded-md object-contain bg-transparent" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Portal UNK</h1>
            </div>
          </div>
          {isCollapsed && (
            <img src="/logo.png" alt="Portal UNK" className="w-8 h-8 rounded-md object-contain bg-transparent mx-auto group-hover:hidden" />
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md hover:bg-muted transition-colors duration-150"
            >
              <Icon
                name={isCollapsed ? "ChevronRight" : "ChevronLeft"}
                size={16}
                className="text-muted-foreground"
              />
            </button>
          )}
        </div>


        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {filteredItems?.map((item) => (
              <li key={item?.id}>
                <button
                  onClick={() => handleNavigation(item?.path)}
                  className={`relative w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-all duration-150 ease-smooth transform hover:scale-98 ${
                    isActive(item?.path)
                      ? 'relative overflow-visible bg-gradient-to-r from-[#160423] via-[#2b0b3c] to-[#3b1b6b] text-white shadow-[0_0_30px_rgba(124,58,237,0.28)] border border-purple-700/30'
                      : 'text-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={isCollapsed ? item?.label : undefined}
                >

                  {/* Colored glow behind active button */}
                  {isActive(item?.path) && (
                    <span className="pointer-events-none absolute -inset-px rounded-md blur-xl opacity-70 bg-gradient-to-r from-purple-600/40 via-indigo-500/30 to-pink-600/20" />
                  )}
                  <Icon
                    name={item?.icon}
                    size={20}
                    className={isActive(item?.path) ? 'text-white' : 'text-muted-foreground'}
                  />
                  <span className={`font-medium truncate ${isCollapsed ? 'hidden group-hover:inline' : 'inline'}`}>
                    {item?.label}
                  </span>

                  {/* active badge removed */}
                </button>
              </li>
            ))}
          </ul>
        </nav>



        {/* Footer */}
        <div className="p-4 border-t border-border">
          {!isCollapsed ? (
            <div className="text-xs text-muted-foreground text-center">
              <p>© 2025 Portal UNK</p>
              <p>Assessoria Musical</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <img src="/logo.png" alt="Portal UNK" className="w-6 h-6 object-contain opacity-80" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default RoleSidebar;
