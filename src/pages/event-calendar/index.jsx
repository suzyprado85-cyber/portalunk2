import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RoleSidebar from '../../components/ui/RoleSidebar';
import TopBar from '../../components/ui/TopBar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import CalendarHeader from './components/CalendarHeader';
import CalendarFilters from './components/CalendarFilters';
import MonthlyCalendar from './components/MonthlyCalendar';
import AgendaView from './components/AgendaView';
import EventModal from './components/EventModal';
import QuickActions from './components/QuickActions';
import Button from '../../components/ui/Button';
import AdminBackground from '../../components/AdminBackground';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { eventService, djService } from '../../services/supabaseService';


const EventCalendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSidebarHover, setIsSidebarHover] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userRole] = useState('admin'); // This would come from auth context
  const [filters, setFilters] = useState({
    search: '',
    eventType: '',
    status: '',
    producer: '',
    dj: ''
  });

  // Dados reais do Supabase
  const { data: rawEvents, loading: eventsLoading, refetch: refetchEvents } = useSupabaseData(eventService, 'getAll', [], []);
  const { data: allDJs } = useSupabaseData(djService, 'getAll', [], []);

  // Normaliza eventos para o formato usado pelos componentes locais
  const events = useMemo(() => {
    return (rawEvents || [])?.map(ev => ({
      id: ev?.id,
      title: ev?.title,
      date: ev?.event_date,
      time: ev?.start_time || null,
      venue: ev?.location,
      description: ev?.description,
      eventType: ev?.type || ev?.event_type || '',
      producerId: ev?.producer?.id,
      producer: ev?.producer?.name || ev?.producer?.company_name,
      djIds: ev?.dj ? [ev?.dj?.id] : [],
      djs: ev?.dj ? [ev?.dj?.name] : [],
      djIsActive: ev?.dj?.is_active ?? true,
      status: ev?.status,
      budget: ev?.cache_value,
      expectedAttendance: ev?.expected_attendance,
      contractId: ev?.contract_id,
      requirements: ev?.requirements
    }));
  }, [rawEvents]);

  // Listas para filtros
  const producersForFilter = useMemo(() => {
    const map = new Map();
    (rawEvents || []).forEach(ev => {
      if (ev?.producer) map.set(ev.producer.id, { id: ev.producer.id, name: ev.producer.name || ev.producer.company_name });
    });
    return Array.from(map.values());
  }, [rawEvents]);

  const djsForFilter = useMemo(() => {
    // Usa todos os DJs cadastrados, não apenas os que já estão em eventos
    return (allDJs || []).map(dj => ({
      id: dj.id,
      name: dj.name,
      genre: dj.genre || dj.specialties?.[0] || 'DJ',
      is_active: dj.is_active ?? true
    }));
  }, [allDJs]);

  // Filter events based on current filters
  const filteredEvents = events?.filter(event => {
    // Exclui eventos cancelados do dashboard por padrão
    if (event?.status === 'cancelled') {
      return false;
    }
    
    if (filters?.search && !event?.title?.toLowerCase()?.includes(filters?.search?.toLowerCase())) {
      return false;
    }
    if (filters?.eventType && event?.eventType !== filters?.eventType) {
      return false;
    }
    if (filters?.status && event?.status !== filters?.status) {
      return false;
    }
    if (filters?.producer && event?.producerId !== filters?.producer) {
      return false;
    }
    if (filters?.dj && !event?.djIds?.includes(filters?.dj)) {
      return false;
    }
    return true;
  });

  const upcomingEvents = filteredEvents?.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate >= today;
  });

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setIsEventModalOpen(true);
  };

  const handleCreateEvent = (date = null, preselectedDJ = null) => {
    setSelectedDate(date || new Date());
    setSelectedEvent(null);
    setIsEventModalOpen(true);
    
    // Se há um DJ pré-selecionado, passar para o modal
    if (preselectedDJ) {
      setSelectedEvent({
        ...selectedEvent,
        djIds: [preselectedDJ.id],
        djs: [preselectedDJ.name]
      });
    }
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (selectedEvent?.id) {
        await eventService?.update(selectedEvent?.id, eventData);
      } else {
        await eventService?.create(eventData);
      }
      await refetchEvents();
      setIsEventModalOpen(false);
    } catch (e) {
      console.error('Erro ao salvar evento:', e);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      // Marca o evento como cancelado ao invés de excluir
      await eventService?.update(eventId, { status: 'cancelled' });
      await refetchEvents();
      setIsEventModalOpen(false);
      // Mostra mensagem de sucesso
      alert('Evento cancelado com sucesso!');
    } catch (e) {
      console.error('Erro ao cancelar evento:', e);
      alert('Erro ao cancelar evento');
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      eventType: '',
      status: '',
      producer: '',
      dj: ''
    });
  };

  const handleExportCalendar = () => {
    // Mock export functionality
    const dataStr = JSON.stringify(filteredEvents, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `eventos_${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement?.setAttribute('href', dataUri);
    linkElement?.setAttribute('download', exportFileDefaultName);
    linkElement?.click();
  };

  const handleImportEvents = () => {
    // Mock import functionality
    alert('Funcionalidade de importação será implementada em breve');
  };

  const handleViewContracts = () => {
    navigate('/contract-management');
  };

  const handleViewFinancials = () => {
    navigate('/financial-tracking');
  };

  // Check for mobile view
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setViewMode('agenda');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Detectar DJ pré-selecionado da navegação
  useEffect(() => {
    if (location.state?.preselectedDJ) {
      const preselectedDJ = location.state.preselectedDJ;
      handleCreateEvent(null, preselectedDJ);
      
      // Limpar o state para evitar reabrir o modal
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  return (
    <AdminBackground>
      <div className="min-h-screen">
        <RoleSidebar
          userRole={userRole}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onHoverChange={setIsSidebarHover}
        />
        <main className={`transition-all duration-300 ${
          isMobile ? 'ml-0 pb-16' : isSidebarCollapsed ? (isSidebarHover ? 'ml-60' : 'ml-16') : 'ml-60'
        }`}>
        <TopBar onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <div className="p-6">
          <BreadcrumbTrail />
          
          <CalendarHeader
            currentDate={currentDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <QuickActions
            onCreateEvent={handleCreateEvent}
            onExportCalendar={handleExportCalendar}
            onImportEvents={handleImportEvents}
            onViewContracts={handleViewContracts}
            onViewFinancials={handleViewFinancials}
            eventCount={events?.length}
            upcomingEvents={upcomingEvents}
          />

          <CalendarFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            producers={producersForFilter}
            djs={djsForFilter}
          />

          {viewMode === 'month' ? (
            <MonthlyCalendar
              currentDate={currentDate}
              events={filteredEvents}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
              selectedDate={selectedDate}
            />
          ) : (
            <AgendaView
              events={filteredEvents}
              onEventClick={handleEventClick}
              onCreateEvent={handleCreateEvent}
              currentDate={currentDate}
            />
          )}

          {/* Floating Action Button for Mobile */}
          {isMobile && (
            <div className="fixed bottom-20 right-6 z-40">
              <Button
                variant="default"
                size="lg"
                onClick={() => handleCreateEvent()}
                iconName="Plus"
                className="rounded-full w-14 h-14 shadow-lg"
              />
            </div>
          )}
        </div>
      </main>
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        producers={producersForFilter}
        djs={djsForFilter}
        selectedDate={selectedDate}
      />
      </div>
    </AdminBackground>
  );
};

export default EventCalendar;
