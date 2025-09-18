import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSidebar from '../../components/ui/RoleSidebar';
import TopBar from '../../components/ui/TopBar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import MetricsCard from './components/MetricsCard';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import SummaryTable from './components/SummaryTable';
import Icon from '../../components/AppIcon';
import AdminBackground from '../../components/AdminBackground';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsService, eventService, contractService, djService } from '../../services/supabaseService';
import paymentService from '../../services/paymentService';
import { useSupabaseData, useRealtimeData } from '../../hooks/useSupabaseData';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarHover, setIsSidebarHover] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch real data from Supabase
  const { data: metrics, loading: metricsLoading } = useSupabaseData(
    analyticsService, 'getDashboardMetrics', [], []
  );
  
  const { data: contracts } = useSupabaseData(
    contractService, 'getAll', [], []
  );
  
  const { data: events } = useSupabaseData(
    eventService, 'getAll', [], []
  );
  
  const { data: payments } = useSupabaseData(
    paymentService, 'getAll', [], []
  );
  
  const { data: djs } = useSupabaseData(
    djService, 'getAll', [], []
  );

  // Real-time updates
  const { data: realtimeContracts } = useRealtimeData('contracts', contracts);
  const { data: realtimeEvents } = useRealtimeData('events', events);
  const { data: realtimePayments } = useRealtimeData('payments', payments);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Transform real data for metrics cards
  const metricsData = [
    {
      title: 'Total de DJs',
      value: metrics?.totalDJs?.toString() || '0',
      change: metrics?.djsChange || 'Sem dados',
      changeType: metrics?.djsChangeType || 'neutral',
      icon: 'Users',
      color: 'primary',
      clickable: false
    },
    {
      title: 'Eventos Ativos',
      value: metrics?.totalEvents?.toString() || '0',
      change: metrics?.eventsChange || 'Sem dados',
      changeType: metrics?.eventsChangeType || 'neutral',
      icon: 'Calendar',
      color: 'success',
      clickable: true,
      onClick: () => navigate('/event-calendar')
    },
    {
      title: 'Contratos Pendentes',
      value: metrics?.pendingContracts?.toString() || '0',
      change: metrics?.contractsChange || 'Sem dados',
      changeType: metrics?.contractsChangeType || 'neutral',
      icon: 'FileText',
      color: 'error',
      clickable: true,
      onClick: () => navigate('/contract-management')
    }
  ];

  // Generate recent activities from real data
  const activitiesData = [
    ...(realtimeContracts?.filter(c => c?.signed)?.slice(0, 2)?.map(contract => ({
      id: contract?.id,
      type: 'contract',
      title: 'Contrato Assinado',
      description: `Contrato para evento "${contract?.event?.title}" foi assinado`,
      timestamp: new Date(contract?.signed_at),
      status: 'success'
    })) || []),
    ...(realtimePayments?.filter(p => p?.status === 'paid')?.slice(0, 2)?.map(payment => ({
      id: payment?.id,
      type: 'payment',
      title: 'Pagamento Recebido',
      description: `Pagamento de R$ ${parseFloat(payment?.amount || 0)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} confirmado`,
      timestamp: new Date(payment?.paid_at || payment?.created_at),
      status: 'success'
    })) || []),
    ...(realtimeEvents?.slice(0, 1)?.map(event => ({
      id: event?.id,
      type: 'event',
      title: 'Novo Evento',
      description: `Evento "${event?.title}" agendado para ${new Date(event?.event_date)?.toLocaleDateString('pt-BR')}`,
      timestamp: new Date(event?.created_at),
      status: 'pending'
    })) || [])
  ]?.sort((a, b) => new Date(b?.timestamp) - new Date(a?.timestamp))?.slice(0, 5);

  // Transform contracts data for table
  const contractsData = realtimeContracts?.slice(0, 5)?.map(contract => ({
    id: contract?.id,
    dj: contract?.event?.dj?.name || 'N/A',
    evento: contract?.event?.title || 'N/A',
    produtor: contract?.event?.producer?.name || contract?.event?.producer?.company_name || 'N/A',
    valor: parseFloat(contract?.event?.cache_value || 0),
    status: contract?.signed ? 'assinado' : (contract?.signature_status || 'pendente'),
    data: contract?.event?.event_date || contract?.created_at
  })) || [];

  const contractColumns = [
    { key: 'dj', label: 'DJ', sortable: true, type: 'avatar' },
    { key: 'evento', label: 'Evento', sortable: true },
    { key: 'produtor', label: 'Produtor', sortable: true },
    { key: 'valor', label: 'Valor', sortable: true, type: 'currency' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'data', label: 'Data', sortable: true, type: 'date' }
  ];

  // Transform events data for table
  // Calculate upcoming events: sort ascending and pick 4 events starting from the next upcoming one
  const eventsData = (() => {
    if (!realtimeEvents || realtimeEvents.length === 0) return [];
    const sorted = [...realtimeEvents].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    const now = new Date();
    // Find first index of an event that is in the future OR confirmed
    let startIdx = sorted.findIndex(e => new Date(e.event_date) >= now || e.status === 'confirmed');
    if (startIdx === -1) startIdx = 0; // fallback to beginning
    const slice = sorted.slice(startIdx, startIdx + 4);
    return slice.map(event => ({
      id: event?.id,
      nome: event?.title,
      data: event?.event_date,
      local: event?.location,
      djs: 1,
      status: event?.status
    }));
  })();

  const eventColumns = [
    { key: 'nome', label: 'Evento', sortable: true },
    { key: 'data', label: 'Data', sortable: true, type: 'date' },
    { key: 'local', label: 'Local', sortable: true },
    { key: 'djs', label: 'DJs', sortable: true },
    { key: 'status', label: 'Status', type: 'status' }
  ];

  // Transform payments data for table
  const paymentsData = realtimePayments?.slice(0, 5)?.map(payment => ({
    id: payment?.id,
    produtor: payment?.event?.producer?.name || payment?.event?.producer?.company_name || 'N/A',
    evento: payment?.event?.title || 'N/A',
    valor: parseFloat(payment?.amount || 0),
    data: payment?.paid_at || payment?.created_at,
    status: payment?.status === 'paid' ? 'concluido' : payment?.status
  })) || [];

  const paymentColumns = [
    { key: 'produtor', label: 'Produtor', sortable: true, type: 'avatar' },
    { key: 'evento', label: 'Evento', sortable: true },
    { key: 'valor', label: 'Valor', sortable: true, type: 'currency' },
    { key: 'data', label: 'Data', sortable: true, type: 'date' },
    { key: 'status', label: 'Status', type: 'status' }
  ];

  // Dados reais dos gráficos baseados nos dados do Supabase
  const revenueChartData = useMemo(() => {
    // Agrupa pagamentos por mês dos últimos 6 meses
    const monthlyRevenue = {};
    const now = new Date();
    
    // Inicializa os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short' });
      monthlyRevenue[monthKey] = 0;
    }
    
    // Soma os pagamentos por mês
    (realtimePayments || []).forEach(payment => {
      if (payment?.status === 'paid' && payment?.paid_at) {
        const paymentDate = new Date(payment.paid_at);
        const monthKey = paymentDate.toLocaleDateString('pt-BR', { month: 'short' });
        if (monthlyRevenue[monthKey] !== undefined) {
          monthlyRevenue[monthKey] += parseFloat(payment.amount || 0);
        }
      }
    });
    
    return Object.entries(monthlyRevenue).map(([name, value]) => ({ name, value }));
  }, [realtimePayments]);

  const djDistributionData = useMemo(() => {
    // Agrupa DJs por gênero/specialty
    const genreCount = {};
    (djs || []).forEach(dj => {
      const genres = dj?.specialties || [dj?.genre] || ['Outros'];
      genres.forEach(genre => {
        if (genre) {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        }
      });
    });
    
    return Object.entries(genreCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 gêneros
  }, [djs]);

  const eventTrendData = useMemo(() => {
    // Agrupa eventos por semana dos últimos 6 meses
    const weeklyEvents = {};
    const now = new Date();
    
    // Inicializa as últimas 6 semanas
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekKey = `Sem ${6 - i}`;
      weeklyEvents[weekKey] = 0;
    }
    
    // Conta eventos por semana
    (realtimeEvents || []).forEach(event => {
      if (event?.event_date) {
        const eventDate = new Date(event.event_date);
        const weeksAgo = Math.floor((now - eventDate) / (7 * 24 * 60 * 60 * 1000));
        if (weeksAgo >= 0 && weeksAgo <= 5) {
          const weekKey = `Sem ${6 - weeksAgo}`;
          if (weeklyEvents[weekKey] !== undefined) {
            weeklyEvents[weekKey] += 1;
          }
        }
      }
    });
    
    return Object.entries(weeklyEvents).map(([name, value]) => ({ name, value }));
  }, [realtimeEvents]);

  return (
    <AdminBackground>
      <div className="min-h-screen">
        <RoleSidebar
          userRole="admin"
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onHoverChange={setIsSidebarHover}
        />
        <main className={`transition-all duration-300 ${sidebarCollapsed ? (isSidebarHover ? 'ml-60' : 'ml-16') : 'ml-60'} pb-16 md:pb-0`}>
        <TopBar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-6">
            <BreadcrumbTrail />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard Administrativo</h1>
                <p className="text-muted-foreground mt-1">
                  Visão geral das operações - {currentTime?.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Clock" size={16} />
                  <span>{currentTime?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {user && (
                  <div className="glass-surface px-3 py-1 rounded-full text-sm text-blue-300">
                    {user?.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metricsLoading ? (
              // Loading skeleton
              (Array.from({ length: 3 })?.map((_, index) => (
                <div key={index} className="glass-card h-32 animate-pulse">
                  <div className="h-4 bg-blue-500/20 rounded mb-2"></div>
                  <div className="h-8 bg-blue-500/20 rounded mb-2"></div>
                  <div className="h-3 bg-blue-500/20 rounded w-2/3"></div>
                </div>
              )))
            ) : (
              metricsData?.map((metric, index) => (
                <MetricsCard
                  key={index}
                  title={metric?.title}
                  value={metric?.value}
                  change={metric?.change}
                  changeType={metric?.changeType}
                  icon={metric?.icon}
                  color={metric?.color}
                  clickable={metric?.clickable}
                  onClick={metric?.onClick}
                />
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions />
          </div>


          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Tables */}
            <div className="xl:col-span-2 space-y-6">
              <SummaryTable
                title="Próximos Eventos"
                data={eventsData}
                columns={eventColumns}
                type="events"
              />
            </div>

            {/* Right Column - Activity Feed */}
            <div className="xl:col-span-1">
              <ActivityFeed activities={activitiesData} />
            </div>
          </div>
        </div>
        </main>
        
      </div>
    </AdminBackground>
  );
};

export default AdminDashboard;
