import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSidebar from '../../components/ui/RoleSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import AdminBackground from '../../components/AdminBackground';

import DJFilters from './components/DJFilters';
import DJCards from './components/DJCards';
import DJEditModal from './components/DJEditModal';
import Pagination from './components/Pagination';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { djService } from '../../services/supabaseService';

const DJManagement = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarHover, setIsSidebarHover] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    availability: '',
    location: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });
  const [selectedDJ, setSelectedDJ] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dados reais do Supabase
  const { data: mockToRealDJs } = useSupabaseData(djService, 'getAll', [], []);
  const mockDJs = (mockToRealDJs || [])?.map(dj => ({
    id: dj?.id,
    name: dj?.name,
    email: dj?.email,
    phone: dj?.phone,
    location: dj?.location,
    avatar: dj?.profile_image_url,
    specialties: dj?.specialties || [],
    availability: dj?.availability || (dj?.is_active ? 'available' : 'busy'),
    lastBooking: dj?.last_booking || '',
    lastBookingDate: dj?.last_booking_date || '',
    biography: dj?.bio || '',
    // Campos adicionais para edição
    bio: dj?.bio || '',
    genre: dj?.genre || '',
    instagram: dj?.instagram || '',
    soundcloud: dj?.soundcloud || '',
    youtube: dj?.youtube || '',
    spotify: dj?.spotify || '',
    facebook: dj?.facebook || '',
    twitter: dj?.twitter || '',
    profile_image_url: dj?.profile_image_url || '',
    background_image_url: dj?.background_image_url || '',
    is_active: dj?.is_active ?? true
  }));

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setViewMode('cards');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter and sort DJs
  const filteredDJs = mockDJs?.filter(dj => {
    const matchesSearch = !filters?.search || 
      dj?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
      dj?.specialties?.some(s => s?.toLowerCase()?.includes(filters?.search?.toLowerCase())) ||
      dj?.location?.toLowerCase()?.includes(filters?.search?.toLowerCase());
    
    const matchesGenre = !filters?.genre || 
      dj?.specialties?.some(s => s?.toLowerCase()?.includes(filters?.genre?.toLowerCase()));
    
    const matchesAvailability = !filters?.availability || dj?.availability === filters?.availability;
    
    const matchesLocation = !filters?.location || 
      dj?.location?.toLowerCase()?.includes(filters?.location?.replace('-', ' '));

    return matchesSearch && matchesGenre && matchesAvailability && matchesLocation;
  });

  // Sort DJs
  const sortedDJs = [...filteredDJs]?.sort((a, b) => {
    let aValue = a?.[sortConfig?.key];
    let bValue = b?.[sortConfig?.key];

    if (sortConfig?.key === 'specialties') {
      aValue = a?.specialties?.join(', ');
      bValue = b?.specialties?.join(', ');
    }

    if (typeof aValue === 'string') {
      aValue = aValue?.toLowerCase();
      bValue = bValue?.toLowerCase();
    }

    if (aValue < bValue) {
      return sortConfig?.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig?.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedDJs?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDJs = sortedDJs?.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig?.key === key && prevConfig?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleRowClick = (dj) => {
    navigate(`/dj-profile/${dj.id}`);
  };

  const handleEdit = (dj) => {
    setSelectedDJ(dj);
    setShowEditModal(true);
  };

  const handleViewDetails = (dj) => {
    navigate(`/dj-profile/${dj.id}`);
  };

  const handleManageAvailability = (dj) => {
    console.log('Manage availability for:', dj);
    // Open availability management modal
  };

  const handleCreateEvent = (dj) => {
    // Navegar para o calendário de eventos com o DJ pré-selecionado
    navigate('/event-calendar', { 
      state: { 
        preselectedDJ: {
          id: dj.id,
          name: dj.name
        }
      } 
    });
  };

  const handleViewProfile = (dj) => {
    navigate(`/dj-profile/${dj.id}`);
  };

  const handleAddDJ = () => {
    setSelectedDJ(null);
    setShowEditModal(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <AdminBackground>
      <div className="min-h-screen">
        {/* Sidebar */}
        <RoleSidebar
          userRole="admin"
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onHoverChange={setIsSidebarHover}
        />
        {/* Main Content */}
        <div className={`transition-all duration-300 ${
        isMobile ? 'ml-0 pb-16' : sidebarCollapsed ? (isSidebarHover ? 'ml-60' : 'ml-16') : 'ml-60'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <BreadcrumbTrail />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gerenciamento de DJs</h1>
                <p className="text-muted-foreground">
                  Gerencie perfis, disponibilidade e histórico de contratos dos DJs
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleAddDJ}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Adicionar DJ
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <DJFilters
            onFiltersChange={handleFiltersChange}
            resultsCount={sortedDJs?.length}
          />

          {/* Content */}
          <DJCards
            djs={paginatedDJs}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onViewDetails={handleViewDetails}
            onViewProfile={handleViewProfile}
            onManageAvailability={handleManageAvailability}
            onCreateEvent={handleCreateEvent}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedDJs?.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>
      
      {/* Edit Modal */}
      <DJEditModal
        dj={selectedDJ}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={() => {
          setShowEditModal(false);
          // Recarregar dados se necessário
        }}
      />
      </div>
    </AdminBackground>
  );
};

export default DJManagement;
