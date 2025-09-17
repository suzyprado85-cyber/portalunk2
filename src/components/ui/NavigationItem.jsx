import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const NavigationItem = ({ 
  path, 
  label, 
  icon, 
  permissions = [], 
  userRole = 'admin',
  isCollapsed = false,
  className = '',
  onClick 
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = location?.pathname === path;
  const hasPermission = permissions?.length === 0 || permissions?.includes(userRole);

  const handleClick = () => {
    if (onClick) {
      onClick(path);
    } else {
      navigate(path);
    }
  };

  if (!hasPermission) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-all duration-150 ease-smooth transform hover:scale-98 ${
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-foreground hover:bg-muted hover:text-foreground'
      } ${className}`}
      title={isCollapsed ? label : undefined}
    >
      <Icon 
        name={icon} 
        size={20} 
        className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}
      />
      {!isCollapsed && (
        <span className="font-medium truncate">
          {label}
        </span>
      )}
      {isActive && !isCollapsed && (
        <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full opacity-75"></div>
      )}
    </button>
  );
};

export default NavigationItem;