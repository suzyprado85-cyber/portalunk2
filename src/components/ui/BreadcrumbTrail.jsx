import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbTrail = ({ customBreadcrumbs = null, className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeMap = {
    '/admin-dashboard': { label: 'Admin Dashboard', parent: null },
    '/producer-dashboard': { label: 'Producer Dashboard', parent: null },
    '/dj-management': { label: 'DJ Management', parent: null },
    '/event-calendar': { label: 'Event Calendar', parent: null },
    '/contract-management': { label: 'Contract Management', parent: null },
    '/financial-tracking': { label: 'Financial Tracking', parent: null }
  };

  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const pathSegments = location?.pathname?.split('/')?.filter(Boolean);
    const breadcrumbs = [];

    // Add home/dashboard
    breadcrumbs?.push({
      label: 'Dashboard',
      path: '/admin-dashboard',
      isActive: false
    });

    // Build breadcrumbs from path
    let currentPath = '';
    pathSegments?.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const routeInfo = routeMap?.[currentPath];
      
      if (routeInfo) {
        breadcrumbs?.push({
          label: routeInfo?.label,
          path: currentPath,
          isActive: index === pathSegments?.length - 1
        });
      }
    });

    // Remove duplicate dashboard entries
    if (breadcrumbs?.length > 1 && breadcrumbs?.[0]?.path === breadcrumbs?.[1]?.path) {
      breadcrumbs?.shift();
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleBack = () => {
    if (breadcrumbs?.length > 1) {
      const previousBreadcrumb = breadcrumbs?.[breadcrumbs?.length - 2];
      navigate(previousBreadcrumb?.path);
    } else {
      navigate(-1);
    }
  };

  // Mobile view - show only back button and current page
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    const currentPage = breadcrumbs?.[breadcrumbs?.length - 1];
    const showBackButton = breadcrumbs?.length > 1;

    return (
      <nav className={`flex items-center space-x-2 py-3 ${className}`} aria-label="Breadcrumb">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <Icon name="ChevronLeft" size={16} />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}
        {showBackButton && (
          <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
        )}
        <span className="text-sm font-medium text-foreground truncate">
          {currentPage?.label || 'Current Page'}
        </span>
      </nav>
    );
  }

  // Desktop view - show full breadcrumb trail
  return (
    <nav className={`flex items-center space-x-2 py-3 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs?.map((breadcrumb, index) => (
          <li key={breadcrumb?.path} className="flex items-center space-x-2">
            {index > 0 && (
              <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
            )}
            {breadcrumb?.isActive ? (
              <span className="text-sm font-medium text-foreground">
                {breadcrumb?.label}
              </span>
            ) : (
              <button
                onClick={() => handleNavigation(breadcrumb?.path)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                {breadcrumb?.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbTrail;