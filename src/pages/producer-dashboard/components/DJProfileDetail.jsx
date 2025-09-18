import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import SocialPill from '../../../components/ui/SocialPill';
import { normalizeSocialUrl } from '../../../utils/social';
import DJMediaGallery from './DJMediaGallery';
import SocialMediaCards from './SocialMediaCards';
import PendingPaymentsManager from './PendingPaymentsManager';
import { useSupabaseData } from '../../../hooks/useSupabaseData';
import { useAuth } from '../../../contexts/AuthContext';
import { eventService, contractService, paymentService, storageService } from '../../../services/supabaseService';

const DJProfileDetail = ({ dj, onBack }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  // Buscar dados relacionados ao DJ
  const { data: events } = useSupabaseData(eventService, 'getAll', [], []);
  const { data: contracts, refetch: refetchContracts } = useSupabaseData(contractService, 'getAll', [], []);
  const { data: payments } = useSupabaseData(paymentService, 'getAll', [], []);

  // Filtrar dados relacionados ao DJ específico
  const djEvents = useMemo(() => {
    let filteredEvents = (events || []).filter(event => {
      // Verificar se é do produtor atual E se o DJ está vinculado
      const isProducerEvent = event?.producer?.id === userProfile?.id;
      const isPrimary = event?.dj?.id === dj?.id;
      const isExtra = Array.isArray(event?.event_djs) && event.event_djs.some(ed => ed?.dj?.id === dj?.id);
      
      return isProducerEvent && (isPrimary || isExtra);
    });

    // Aplicar filtro de data se definido
    if (dateFilter.startDate || dateFilter.endDate) {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event?.event_date);
        const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
        const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

        if (startDate && eventDate < startDate) return false;
        if (endDate && eventDate > endDate) return false;

        return true;
      });
    }

    return filteredEvents;
  }, [events, dj?.id, dateFilter, userProfile?.id]);

  const djContracts = useMemo(() => {
    return (contracts || []).filter(contract => contract?.event?.dj?.id === dj?.id);
  }, [contracts, dj?.id]);

  const djPayments = useMemo(() => {
    return (payments || []).filter(payment => payment?.event?.dj?.id === dj?.id);
  }, [payments, dj?.id]);

  const pendingPayments = useMemo(() => {
    return djPayments.filter(payment => payment?.status !== 'paid');
  }, [djPayments]);



  const handleUploadPaymentProof = (paymentId) => {
    toast?.success(`Upload de comprovante para pagamento ${paymentId} em desenvolvimento`);
  };

  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const handleSignContract = async (contractId) => {
    const result = await contractService.sign(contractId, {});
    if (result?.error) {
      toast?.error('Erro ao assinar contrato');
    } else {
      toast?.success('Contrato assinado com sucesso');
      refetchContracts?.();
    }
  };

  const openContractModal = (contract) => {
    setSelectedContract(contract);
    setShowContractModal(true);
  };

  const closeContractModal = () => {
    setShowContractModal(false);
    setSelectedContract(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })?.format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: 'User' },
    { id: 'agenda', label: 'Agenda', icon: 'Calendar' },
    { id: 'media', label: 'Mídia', icon: 'Image' },
    { id: 'financial', label: 'Financeiro', icon: 'DollarSign' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header com design igual à imagem de referência */}
      <div className="relative">
        {/* Background Image */}
        <div 
          className="h-80 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden relative"
          style={{
            backgroundImage: (dj?.background_image_url || dj?.profile_image_url) ? `url(${dj?.background_image_url || dj?.profile_image_url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          
          {/* Back Button */}
          <button
            onClick={onBack}
            className="absolute top-6 left-6 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors z-20"
          >
            <Icon name="ArrowLeft" size={20} className="text-white" />
          </button>
          
          {/* Profile Content - Layout igual à imagem */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center text-white max-w-2xl">
              {/* Avatar circular */}
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                <img
                  src={dj?.profile_image_url || '/placeholder-dj.jpg'}
                  alt={dj?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Nome do DJ */}
              <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">
                {dj?.name}
              </h1>
              
             
              {/* Links das redes sociais - estilo pílula igual à imagem */}
              <div className="flex justify-center gap-3 flex-wrap">
                {dj?.soundcloud && (
                  <SocialPill id="soundcloud" name="SoundCloud" icon="SoundCloud" href={normalizeSocialUrl('soundcloud', dj?.soundcloud)} />
                )}
                {dj?.instagram && (
                  <SocialPill id="instagram" name="Instagram" icon="Instagram" href={normalizeSocialUrl('instagram', dj?.instagram)} />
                )}
                {dj?.youtube && (
                  <SocialPill id="youtube" name="YouTube" icon="YouTube" href={normalizeSocialUrl('youtube', dj?.youtube)} />
                )}
                {dj?.spotify && (
                  <SocialPill id="spotify" name="Spotify" icon="Music" href={normalizeSocialUrl('spotify', dj?.spotify)} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - igual à imagem */}
      <div className="bg-gray-900/95 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-0">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm transition-all relative ${
                  activeTab === tab.id
                    ? 'text-white font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                } ${index === 0 ? 'rounded-l-lg' : ''} ${index === tabs.length - 1 ? 'rounded-r-lg' : ''}`}
                style={activeTab === tab.id ? {
                  backgroundImage: 'url(https://cdn.builder.io/api/v1/image/assets%2F0f853d9f9b554108a2a6db6f58cbee9d%2F7e3970ebf9a84e61baefb29192632951)',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover'
                } : undefined}
              >
                <Icon name={tab.icon} size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Icon name="Calendar" size={24} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{djEvents?.length}</p>
                    <p className="text-sm text-muted-foreground">Eventos Realizados</p>
                  </div>
                </div>
              </div>
              
              
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Icon name="Clock" size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{pendingPayments?.length}</p>
                    <p className="text-sm text-muted-foreground">Pagamentos Pendentes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Últimos Eventos</h3>
              <div className="space-y-3">
                {djEvents?.slice(0, 5)?.map((event) => (
                  <div key={event?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{event?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event?.event_date)?.toLocaleDateString('pt-BR')} • {event?.location}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event?.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                      event?.status === 'confirmed' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {event?.status === 'completed' ? 'Concluído' :
                       event?.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agenda' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Agenda de Eventos</h3>
              <span className="text-sm text-muted-foreground">
                {djEvents?.length} eventos encontrados
              </span>
            </div>

            {/* Filtros de Data */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Filtrar por Data</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Data Inicial</label>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Data Final</label>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => setDateFilter({ startDate: '', endDate: '' })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {djEvents?.map((event) => {
                const contract = djContracts?.find(c => c?.event?.id === event?.id);
                return (
                  <div key={event?.id} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-foreground mb-2">{event?.title}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p><strong>Data:</strong> {new Date(event?.event_date)?.toLocaleDateString('pt-BR')}</p>
                            <p><strong>Local:</strong> {event?.location}</p>
                            <p><strong>Horário:</strong> {event?.start_time} - {event?.end_time}</p>
                          </div>
                          <div>
                            <p><strong>Valor:</strong> {formatCurrency(parseFloat(event?.cache_value || 0))}</p>
                            <p><strong>Status:</strong> 
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                event?.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                event?.status === 'confirmed' ? 'bg-blue-500/20 text-blue-500' :
                                'bg-yellow-500/20 text-yellow-500'
                              }`}>
                                {event?.status === 'completed' ? 'Concluído' :
                                 event?.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 text-right">
                        <p className="text-sm font-medium text-foreground mb-1">Contrato</p>
                        <div className="flex items-center justify-end space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            contract?.signed ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {contract?.signed ? 'Assinado' : 'Pendente'}
                          </span>
                          {contract && !contract?.signed && (
                            <button
                              className="p-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              title="Assinar contrato"
                              onClick={() => handleSignContract(contract?.id)}
                            >
                              <Icon name="Signature" size={16} />
                            </button>
                          )}
                          {contract && contract?.signed && (
                            <button
                              className="p-2 rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors"
                              title="Visualizar contrato"
                              onClick={() => openContractModal(contract)}
                            >
                              <Icon name="FileText" size={16} />
                            </button>
                          )}
                        </div>
                        {contract && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {contract?.contract_number || `CTR-${contract?.id}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            <DJMediaGallery djId={dj?.id} />
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6">
            <PendingPaymentsManager
              djId={dj?.id}
              events={djEvents}
              payments={djPayments}
              onPaymentUpdate={() => {
                // Recarregar dados quando pagamento for atualizado
                window.location.reload();
              }}
            />

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">Histórico de Pagamentos</h4>
              <div className="space-y-3">
                {djPayments?.map((payment) => (
                  <div key={payment?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{payment?.event?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment?.created_at)?.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(parseFloat(payment?.amount || 0))}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment?.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                        payment?.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {payment?.status === 'paid' ? 'Pago' :
                         payment?.status === 'pending' ? 'Pendente' : 'Atrasado'}
                      </span>
                      {payment?.payment_proof_url && (
                        <div className="mt-1">
                          <button
                            onClick={() => window.open(payment.payment_proof_url, '_blank')}
                            className="text-xs text-blue-500 hover:text-blue-600 flex items-center"
                          >
                            <Icon name="FileText" size={12} className="mr-1" />
                            Ver Comprovante
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showContractModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl p-6 relative">
            <button
              onClick={closeContractModal}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              aria-label="Fechar"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold text-foreground mb-4">Contrato</h3>
            <div className="space-y-2 text-sm text-foreground">
              <p><strong>Número:</strong> {selectedContract?.contract_number || `CTR-${selectedContract?.id}`}</p>
              <p><strong>Status:</strong> {selectedContract?.signed ? 'Assinado' : 'Pendente'}</p>
              <p><strong>Evento:</strong> {selectedContract?.event?.title}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DJProfileDetail;
