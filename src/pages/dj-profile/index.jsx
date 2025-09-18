import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import SocialPill from '../../components/ui/SocialPill';
import { normalizeSocialUrl } from '../../utils/social';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { djService, eventService, contractService } from '../../services/supabaseService';
import { mediaService } from '../../services/mediaService';
import paymentService from '../../services/paymentService';
import DJMediaGallery from './components/DJMediaGallery';
import DJEditModal from '../dj-management/components/DJEditModal';

const DJProfile = () => {
  const { djId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const isAdmin = userProfile?.role === 'admin';
  const isProducer = userProfile?.role === 'producer';

  // Buscar dados do DJ e relacionados
  const { data: djs, loading: djsLoading } = useSupabaseData(djService, 'getAll', [], []);
  const { data: events } = useSupabaseData(eventService, 'getAll', [], []);
  const { data: contracts } = useSupabaseData(contractService, 'getAll', [], []);
  const { data: payments } = useSupabaseData(paymentService, 'getByDJ', [djId], [djId]);
  const { data: djMedia, refetch: refetchMedia } = useSupabaseData(mediaService, 'getDJMedia', [djId], [djId]);

  // Encontrar o DJ específico
  const dj = djs?.find(d => d.id === djId);

  // Filtrar dados relacionados ao DJ
  const djEvents = useMemo(() => {
    return (events || []).filter(event => event?.dj_id === djId);
  }, [events, djId]);

  // Auto-mark past events as completed (does not mark payments paid)
  const [patchedCompleted, setPatchedCompleted] = useState({});
  useEffect(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const toPatch = (djEvents || []).filter(e => {
      const d = e?.event_date ? new Date(e.event_date) : null;
      if (!d) return false;
      d.setHours(0,0,0,0);
      return d < today && e?.status !== 'completed' && !patchedCompleted[e?.id];
    });
    if (toPatch.length === 0) return;
    (async () => {
      for (const ev of toPatch) {
        try {
          await eventService.update(ev.id, { status: 'completed' });
          setPatchedCompleted(prev => ({ ...prev, [ev.id]: true }));
        } catch (e) {
          console.warn('Falha ao atualizar status do evento para completed:', ev?.id, e);
        }
      }
    })();
  }, [djEvents, patchedCompleted]);

  // Auto-update overdue payments for completed events
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedEvents = djEvents.filter(e => e?.status === 'completed');
    
    completedEvents.forEach(async (event) => {
      const eventDate = new Date(event.event_date);
      eventDate.setHours(23, 59, 59, 999);
      
      if (today > eventDate) {
        // Check if payment is still pending for this completed event
        const payment = paymentsByEvent[event.id];
        if (payment && (payment.status === 'pending' || payment.status === 'processing')) {
          try {
            // Update payment to overdue status
            await paymentService.update(payment.id, { status: 'overdue' });
            console.log(`✅ Pagamento ${payment.id} marcado como atrasado`);
          } catch (error) {
            console.warn('Falha ao marcar pagamento como atrasado:', payment.id, error);
          }
        }
      }
    });
  }, [djEvents, paymentsByEvent]);

  const djContracts = useMemo(() => {
    return (contracts || []).filter(contract => 
      djEvents.find(event => event.id === contract?.event_id)
    );
  }, [contracts, djEvents]);

  const djPayments = useMemo(() => {
    return (payments || []).filter(payment =>
      djEvents.find(event => event.id === payment?.event_id)
    );
  }, [payments, djEvents]);

  const pendingPayments = useMemo(() => (djPayments || []).filter(p => p.status !== 'paid'), [djPayments]);
  const pendingAmount = useMemo(() => pendingPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0), [pendingPayments]);

  const paymentsByEvent = useMemo(() => {
    const map = {};
    (djPayments || []).forEach(p => { if (p?.event_id) map[p.event_id] = p; });
    return map;
  }, [djPayments]);

  const getPaymentStatusFor = (event) => {
    if (!event) return 'pendente';
    const cacheZero = event.cache_value == null || parseFloat(event.cache_value) === 0;
    if (cacheZero) return 'isento';
    const p = paymentsByEvent[event.id];
    if (!p) return 'pendente';
    if (p.status === 'paid') return 'pago';
    if (p.status === 'processing') return 'processando';
    return 'pendente';
  };

  const getPaymentBadgeClass = (status) => {
    if (status === 'pago' || status === 'isento') return 'bg-green-600/20 text-green-400 border border-green-500/30';
    if (status === 'processando') return 'bg-blue-600/20 text-blue-400 border border-blue-500/30';
    return 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30';
  };

  // Obter imagem de fundo - prioritizar background_image_url
  const currentBackgroundImage = dj?.background_image_url || 
    dj?.profile_image_url;

  const getSocialLink = (platform, username) => {
    if (!username) return null;
    
    const links = {
      instagram: `https://instagram.com/${username.replace('@', '')}`,
      soundcloud: username.startsWith('http') ? username : `https://soundcloud.com/${username}`,
      youtube: username.startsWith('http') ? username : `https://youtube.com/${username}`
    };
    
    return links[platform];
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (djsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando perfil do DJ...</p>
        </div>
      </div>
    );
  }

  if (!dj) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            DJ não encontrado
          </h3>
          <Button onClick={() => navigate(-1)} variant="outline">
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative">
      {/* Background Image with Blur Effect */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: currentBackgroundImage ? `url(${currentBackgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* DJ Profile Header - Imersivo como na imagem */}
        <div className="relative overflow-hidden">
          {/* Background da seção com opacidade */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80"></div>
          
          <div className="relative z-10 container mx-auto px-6 py-16">
            {/* Botão de voltar */}
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-8 text-white hover:bg-white/10"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Voltar
            </Button>

            {/* Botão de Editar para Admin */}
            {isAdmin && (
              <Button 
                variant="default" 
                onClick={() => setShowEditModal(true)}
                className="mb-8 ml-4 bg-blue-600 hover:bg-blue-700"
              >
                <Icon name="Edit" size={16} className="mr-2" />
                Editar Perfil
              </Button>
            )}

            {/* Profile Content - Layout como Pedro Theodoro */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0 lg:space-x-12">
              {/* Avatar */}
              <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm flex-shrink-0 border border-white/20">
                {dj.profile_image_url ? (
                  <img
                    src={dj.profile_image_url}
                    alt={dj.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="Music" size={64} className="text-white/60" />
                  </div>
                )}
              </div>

              {/* DJ Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
                  {dj.name}
                </h1>
                
                {dj.bio && (
                  <p className="text-xl text-gray-200 mb-6">{dj.bio}</p>
                )}

                {/* Tags de Gêneros Musicais - Mostrar somente se existir */}
                {Array.isArray(dj.musical_genres) && dj.musical_genres.length > 0 && (
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                    {dj.musical_genres.map((genre, index) => (
                      <span
                        key={index}
                        className="text-white text-sm font-medium rounded-full border border-purple-400/30"
                        style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(41, 14, 66, 0.54)', padding: '2px 16px 5px' }}
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Social Links (discreet) - show only filled ones */}
                {/* Redes sociais - pílulas no estilo solicitado */}
                <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap text-gray-200 mb-[18px]">
                  {dj.soundcloud && (
                    <SocialPill id="soundcloud" name="SoundCloud" icon="SoundCloud" href={normalizeSocialUrl('soundcloud', dj.soundcloud)} />
                  )}
                  {dj.instagram && (
                    <SocialPill id="instagram" name="Instagram" icon="Instagram" href={normalizeSocialUrl('instagram', dj.instagram)} />
                  )}
                  {dj.youtube && (
                    <SocialPill id="youtube" name="YouTube" icon="YouTube" href={normalizeSocialUrl('youtube', dj.youtube)} />
                  )}
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3 text-gray-200 mb-2 hidden">
                  {dj.instagram && (
                    <a href={getSocialLink('instagram', dj.instagram)} target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white text-sm flex items-center space-x-1">
                      <Icon name="Instagram" size={16} />
                    </a>
                  )}
                  {dj.soundcloud && (
                    <a href={getSocialLink('soundcloud', dj.soundcloud)} target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white text-sm flex items-center space-x-1">
                      <Icon name="SoundCloud" size={16} />
                    </a>
                  )}
                  {dj.youtube && (
                    <a href={getSocialLink('youtube', dj.youtube)} target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white text-sm flex items-center space-x-1">
                      <Icon name="YouTube" size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Como na imagem de referência */}
        <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50">
          <div className="container mx-auto px-6">
            <nav className="flex space-x-0">
              {[
                { id: 'overview', label: 'Visão Geral', icon: 'LayoutDashboard' },
                { id: 'agenda', label: 'Agenda', icon: 'Calendar' },
                { id: 'media', label: 'Mídia', icon: 'Image' },
                { id: 'financeiro', label: 'Financeiro', icon: 'DollarSign' }
              ].map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all relative ${
                    activeTab === tab.id
                      ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  } ${index === 0 ? 'rounded-l-lg' : ''} ${index === 3 ? 'rounded-r-lg' : ''}`}
                >
                  <Icon name={tab.icon} size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
                  <Icon name="Calendar" size={48} className="text-blue-400 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-white">{djEvents.length}</h3>
                  <p className="text-gray-400">Eventos Realizados</p>
                </div>
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
                  <Icon name="FileText" size={48} className="text-green-400 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-white">{djContracts.length}</h3>
                  <p className="text-gray-400">Contratos Assinados</p>
                </div>
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
                  <Icon name="DollarSign" size={48} className="text-purple-400 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-white">
                    {formatCurrency(djPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0))}
                  </h3>
                  <p className="text-gray-400">Total de Receita</p>
                </div>
              </div>

              {/* Eventos Recentes */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                <h3 className="text-2xl font-bold mb-6 text-white">Eventos Recentes</h3>
                {djEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="Calendar" size={64} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nenhum evento agendado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {djEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-700/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-2">{event.title}</h4>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-300">
                              <div className="flex items-center">
                                <Icon name="Calendar" size={16} className="mr-2 text-blue-400" />
                                {formatDate(event.event_date)}
                              </div>
                              <div className="flex items-center">
                                <Icon
                                  name={event.status === 'completed' ? 'CheckCircle' : (event.status === 'confirmed' ? 'BadgeCheck' : 'Clock')}
                                  size={16}
                                  className={`mr-2 ${event.status === 'completed' ? 'text-blue-400' : (event.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400')}`}
                                />
                                {event.status === 'completed' ? 'Concluído' : (event.status === 'confirmed' ? 'Confirmado' : 'Pendente')}
                              </div>
                              <div className="flex items-center">
                                <Icon name="MapPin" size={16} className="mr-2 text-green-400" />
                                {event.location}, {event.city}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">{formatCurrency(event.cache_value)}</p>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPaymentBadgeClass(getPaymentStatusFor(event))}`}>
                              {getPaymentStatusFor(event) === 'pago' ? 'Pago' : getPaymentStatusFor(event) === 'isento' ? 'Isento' : getPaymentStatusFor(event) === 'processando' ? 'Processando' : 'Pendente'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Agenda Tab */}
          {activeTab === 'agenda' && (
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <h3 className="text-2xl font-bold mb-6 text-white">Agenda de Eventos</h3>
              {djEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Calendar" size={64} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Nenhum evento na agenda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {djEvents.sort((a, b) => new Date(a.event_date) - new Date(b.event_date)).map((event) => (
                    <div key={event.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-2">{event.title}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-300">
                            <div className="flex items-center">
                              <Icon name="Calendar" size={16} className="mr-2 text-blue-400" />
                              {formatDate(event.event_date)}
                            </div>
                            <div className="flex items-center">
                              <Icon
                                name={event.status === 'completed' ? 'CheckCircle' : (event.status === 'confirmed' ? 'BadgeCheck' : 'Clock')}
                                size={16}
                                className={`mr-2 ${event.status === 'completed' ? 'text-blue-400' : (event.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400')}`}
                              />
                              {event.status === 'completed' ? 'Concluído' : (event.status === 'confirmed' ? 'Confirmado' : 'Pendente')}
                            </div>
                            <div className="flex items-center">
                              <Icon name="MapPin" size={16} className="mr-2 text-green-400" />
                              {event.location}, {event.city}
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mt-2">{event.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">{formatCurrency(event.cache_value)}</p>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${getPaymentBadgeClass(getPaymentStatusFor(event))}`}>
                            {getPaymentStatusFor(event) === 'pago' ? 'Pago' : getPaymentStatusFor(event) === 'isento' ? 'Isento' : getPaymentStatusFor(event) === 'processando' ? 'Processando' : 'Pendente'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mídia Tab */}
          {activeTab === 'media' && (
            <DJMediaGallery
              djId={djId}
              djName={dj?.name}
              dj={dj}
              isAdmin={isAdmin}
              onMediaUpdate={refetchMedia}
            />
          )}

          {/* Financeiro Tab */}
          {activeTab === 'financeiro' && (
            <div className="space-y-8">
              {/* Resumo Financeiro */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <h4 className="text-lg font-semibold text-white mb-4">Total de Receita</h4>
                  <p className="text-3xl font-bold text-green-400">
                    {formatCurrency(djPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0))}
                  </p>
                </div>
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <h4 className="text-lg font-semibold text-white mb-4">Eventos Pagos</h4>
                  <p className="text-3xl font-bold text-blue-400">
                    {djPayments.filter(p => p.status === 'paid').length}
                  </p>
                </div>
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <h4 className="text-lg font-semibold text-white mb-4">Pagamentos Pendentes</h4>
                  <p className="text-3xl font-bold text-yellow-400">
                    {pendingPayments.length}
                  </p>
                </div>
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <h4 className="text-lg font-semibold text-white mb-4">Valor Pendente</h4>
                  <p className="text-3xl font-bold text-amber-400">
                    {formatCurrency(pendingAmount)}
                  </p>
                </div>
              </div>

              {/* Lista de Pagamentos Pendentes */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h4 className="text-lg font-semibold text-white mb-4">Pagamentos Pendentes</h4>
                {pendingPayments.length === 0 ? (
                  <p className="text-gray-400">Nenhum pagamento pendente</p>
                ) : (
                  <div className="space-y-3">
                    {pendingPayments.map((p) => (
                      <div key={p.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                        <div className="flex-1">
                          <div className="text-white font-medium">{p?.event?.title || 'Evento'}</div>
                          <div className="text-sm text-gray-400">{p?.event?.event_date ? formatDate(p.event.event_date) : ''}</div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 sm:mt-0">
                          <span className="text-amber-400 font-semibold">{formatCurrency(parseFloat(p.amount) || 0)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${p.status === 'processing' ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30'}`}>
                            {p.status === 'processing' ? 'Processando' : 'Pendente'}
                          </span>
                          {p.payment_proof_url && (
                            <a href={p.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                              Comprovante
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lista de Pagamentos */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                <h3 className="text-2xl font-bold mb-6 text-white">Histórico de Pagamentos</h3>
                {djPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="DollarSign" size={64} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nenhum pagamento registrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {djPayments.map((payment) => {
                      const event = djEvents.find(e => e.id === payment.event_id);
                      return (
                        <div key={payment.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-2">
                                {event?.title || 'Evento não encontrado'}
                              </h4>
                              <p className="text-sm text-gray-400">
                                {formatDate(payment.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-white">
                                {formatCurrency(payment.amount)}
                              </p>
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                                payment.status === 'paid' 
                                  ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                                  : 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                              }`}>
                                {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para visualizar imagens */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <Icon name="X" size={24} />
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Edição para Admin */}
      {isAdmin && (
        <DJEditModal
          dj={dj}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            window.location.reload(); // Recarregar para mostrar mudanças
          }}
        />
      )}
    </div>
  );
};

export default DJProfile;
