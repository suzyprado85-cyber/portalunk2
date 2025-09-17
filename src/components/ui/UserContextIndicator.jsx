import React, { useState } from 'react';
import Icon from '../AppIcon';

const UserContextIndicator = ({ 
  userRole = 'admin', 
  userName = 'User', 
  userEmail = 'user@example.com',
  isCollapsed = false,
  onRoleChange,
  onLogout 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Administrator',
          subtitle: 'Full Access',
          color: 'bg-accent',
          icon: 'Shield'
        };
      case 'producer':
        return {
          title: 'Producer',
          subtitle: 'Producer Access',
          color: 'bg-success',
          icon: 'Headphones'
        };
      default:
        return {
          title: 'User',
          subtitle: 'Limited Access',
          color: 'bg-muted',
          icon: 'User'
        };
    }
  };

  const roleInfo = getRoleDisplay(userRole);

  const handleDropdownToggle = () => {
    if (!isCollapsed) {
      setShowDropdown(!showDropdown);
    }
  };

  const handleLogout = () => {
    setShowDropdown(false);
    if (onLogout) {
      onLogout();
    }
  };

  if (isCollapsed) {
    return (
      <div className="flex justify-center">
        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center relative">
          <Icon name={roleInfo?.icon} size={16} color="white" />
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${roleInfo?.color}`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleDropdownToggle}
        className="w-full flex items-center space-x-3 p-3 rounded-md hover:bg-muted transition-colors duration-150"
      >
        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center relative">
          <Icon name={roleInfo?.icon} size={20} color="white" />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${roleInfo?.color} flex items-center justify-center`}>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-foreground truncate">
            {userName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {roleInfo?.title}
          </p>
        </div>
        <Icon 
          name={showDropdown ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-muted-foreground"
        />
      </button>
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-md shadow-lg z-50">
          <div className="p-3 border-b border-border">
            <p className="text-sm font-medium text-popover-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
            <div className="flex items-center mt-2">
              <div className={`w-2 h-2 rounded-full ${roleInfo?.color} mr-2`}></div>
              <span className="text-xs text-muted-foreground">{roleInfo?.subtitle}</span>
            </div>
          </div>
          
          <div className="py-2">
            <button
              onClick={() => {
                setShowDropdown(false);
                // Handle profile navigation
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
            >
              <Icon name="User" size={16} />
              <span>Profile Settings</span>
            </button>
            
            <button
              onClick={() => {
                setShowDropdown(false);
                // Handle preferences navigation
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
            >
              <Icon name="Settings" size={16} />
              <span>Preferences</span>
            </button>
            
            <div className="border-t border-border my-2"></div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors duration-150"
            >
              <Icon name="LogOut" size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserContextIndicator;