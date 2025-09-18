import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import TopBar from '../../components/ui/TopBar';
import DJCardNew from './components/DJCardNew';
import DJProfileDetail from './components/DJProfileDetail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useSupabaseData, useRealtimeData } from '../../hooks/useSupabaseData';
import { analyticsService, eventService, contractService, djService, storageService } from '../../services/supabaseService';
import paymentService from '../../services/paymentService';
import PendingPaymentsManager from './components/PendingPaymentsManager';
import { useAuth } from '../../contexts/AuthContext';

const ProducerDashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDJ, setSelectedDJ] = useState(null);
  const [showPendingPayments, setShowPendingPayments] = useState(false);

  // Dados reais: métricas, eventos, contratos, pagamentos e DJs
  const { data: metrics } = useSupabaseData(analyticsService, 'getDashboardMetrics', [], []);
  const { data: events } = useSupabaseData(eventService, 'getAll', [], []);
  const { data: contracts } = useSupabaseData(contractService, 'getAll', [], []);
  const { data: payments, refetch: refetchPayments } = useSupabaseData(paymentService, 'getByProducer', [userProfile?.id], [userProfile?.id]);
  const { data: djs } = useSupabaseData(djService, 'getAll', [], []);

  const { data: realtimeEvents } = useRealtimeData('events', events);
  const { data: realtimeContracts } = useRealtimeData('contracts', contracts);
  const { data: realtimePayments } = useRealtimeData('payments', payments);

  // Calcular pagamentos pendentes do produtor
  const pendingPaymentsCount = (realtimePayments || []).filter(p => p.status === 'pending').length;
  const totalPendingAmount = (realtimePayments || [])
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  // Filtrar apenas DJs que têm eventos contratados com este produtor
  const contractedDJs = useMemo(() => {
    // Filtrar eventos apenas do produtor atual
    const producerEvents = (events || []).filter(event => 
      event?.producer?.id === userProfile?.id
    );
    
    const djIdsWithEvents = new Set();
    producerEvents.forEach(event => {
      // DJ principal do evento
      if (event?.dj?.id) {
        djIdsWithEvents.add(event.dj.id);
      }
      // DJs extras vinculados via event_djs
      if (Array.isArray(event?.event_djs)) {
        event.event_djs.forEach(ed => {
          const edj = ed?.dj;
          if (edj?.id) djIdsWithEvents.add(edj.id);
        });
      }
    });

    return (djs || [])
      .filter(dj => djIdsWithEvents.has(dj.id))
      .map(dj => ({
        id: dj?.id,
        name: dj?.name,
        genre: dj?.genre || dj?.specialties?.[0] || 'DJ',
        specialties: dj?.specialties || [dj?.genre],
        bio: dj?.bio,
        profile_image_url: dj?.profile_image_url,
        background_image_url: dj?.background_image_url,
        instagram: dj?.instagram,
        soundcloud: dj?.soundcloud,
        youtube: dj?.youtube,
        spotify: dj?.spotify,
        facebook: dj?.facebook,
        twitter: dj?.twitter,
        is_active: dj?.is_active,
        experience: dj?.experience || null,
        rating: dj?.rating || 0,
        status: dj?.is_active ? 'active' : 'inactive',
        availability: dj?.availability || 'available'
      }));
  }, [djs, events, userProfile?.id]);

  // Handlers
  const handleViewDJDetails = (dj) => {
    setSelectedDJ(dj);
  };

  const handleBackToDashboard = () => {
    setSelectedDJ(null);
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-foreground">Carregando Dashboard...</p>
        </div>
      </div>
    );
  }

  // Se um DJ foi selecionado, mostrar o perfil detalhado
  if (selectedDJ) {
    return (
      <DJProfileDetail 
        dj={selectedDJ} 
        onBack={handleBackToDashboard} 
      />
    );
  }

  // Dashboard principal com cards dos DJs
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-16 md:pb-0">
        <TopBar onMenuClick={() => {}} />
        
        {/* Header */}
        <div className="p-8">
          {/* Alerta de Pagamentos Pendentes */}
          {pendingPaymentsCount > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon name="AlertTriangle" size={20} className="text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Você tem {pendingPaymentsCount} pagamento{pendingPaymentsCount !== 1 ? 's' : ''} pendente{pendingPaymentsCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendingAmount)}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowPendingPayments(true)}
                  iconName="CreditCard"
                  iconPosition="left"
                >
                  Gerenciar Pagamentos
                </Button>
              </div>
            </div>
          )}

          <div className="mb-8">
            <p className="text-lg text-muted-foreground">
              Gerencie seus eventos e download de mídias, clique em ver detalhes.
            </p>
          </div>

          {/* DJs Cards */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-muted-foreground" />
            </div>
            
            {contractedDJs?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contractedDJs?.map((dj) => (
                  <DJCardNew
                    key={dj?.id}
                    dj={dj}
                    onViewDetails={handleViewDJDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum DJ contratado
                </h3>
                <p className="text-muted-foreground mb-6">
                  Você ainda não tem DJs contratados. Entre em contato com a administração para contratar DJs.
                </p>
                <Button
                  onClick={() => navigate('/event-calendar')}
                  iconName="Calendar"
                  iconPosition="left"
                >
                  Ver Eventos
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Modal de Pagamentos Pendentes */}
      {showPendingPayments && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Gerenciar Pagamentos</h2>
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={() => setShowPendingPayments(false)}
              />
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <PendingPaymentsManager
                events={realtimeEvents}
                payments={realtimePayments}
                onPaymentUpdate={() => {
                  refetchPayments();
                  setShowPendingPayments(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProducerDashboard;
