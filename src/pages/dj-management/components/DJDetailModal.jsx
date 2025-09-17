import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const DJDetailModal = ({ dj, isOpen, onClose, onEdit, onManageAvailability }) => {
  const [activeTab, setActiveTab] = useState('profile');

  if (!isOpen || !dj) return null;

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: 'User' },
    { id: 'media', label: 'Mídia', icon: 'Image' },
    { id: 'calendar', label: 'Calendário', icon: 'Calendar' },
    { id: 'contracts', label: 'Contratos', icon: 'FileText' }
  ];

  // Dados reais de contratos serão carregados via props ou hook
  const contracts = [];

  const mockAvailability = [
    { date: '2025-01-15', status: 'available' },
    { date: '2025-01-16', status: 'busy' },
    { date: '2025-01-17', status: 'available' },
    { date: '2025-01-18', status: 'partially' },
    { date: '2025-01-19', status: 'available' }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-success/10 text-success', label: 'Ativo' },
      completed: { color: 'bg-muted text-muted-foreground', label: 'Concluído' },
      pending: { color: 'bg-warning/10 text-warning', label: 'Pendente' },
      cancelled: { color: 'bg-error/10 text-error', label: 'Cancelado' }
    };
    
    const badge = badges?.[status] || badges?.pending;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge?.color}`}>
        {badge?.label}
      </span>
    );
  };

  const getAvailabilityColor = (status) => {
    const colors = {
      available: 'bg-success',
      busy: 'bg-error',
      partially: 'bg-warning'
    };
    return colors?.[status] || colors?.available;
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="flex items-start space-x-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
          <Image
            src={dj?.avatar}
            alt={dj?.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground mb-2">{dj?.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Icon name="MapPin" size={16} className="text-muted-foreground" />
              <span className="text-foreground">{dj?.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Mail" size={16} className="text-muted-foreground" />
              <span className="text-foreground">{dj?.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Phone" size={16} className="text-muted-foreground" />
              <span className="text-foreground">{dj?.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-3">Especialidades</h3>
        <div className="flex flex-wrap gap-2">
          {dj?.specialties?.map((specialty, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary/10 text-secondary"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Biography */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-3">Biografia</h3>
        <p className="text-muted-foreground leading-relaxed">
          {dj?.biography || `DJ ${dj?.name} é um profissional experiente com mais de 5 anos no mercado musical. Especializado em eventos corporativos e festas privadas, traz sempre o melhor da música eletrônica e popular para criar atmosferas únicas e memoráveis.`}
        </p>
      </div>

      {/* Equipment */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-3">Equipamentos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Som</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Mesa de Som Pioneer DJM-900NXS2</li>
              <li>• CDJs Pioneer CDJ-3000 (2x)</li>
              <li>• Sistema de Som JBL PRX815W</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Iluminação</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Moving Heads LED (4x)</li>
              <li>• Strobo LED</li>
              <li>• Máquina de Fumaça</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMediaTab = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Icon name="ExternalLink" size={48} className="text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">
          Para gerenciar mídias do DJ, acesse o perfil completo
        </p>
        <Button
          onClick={() => window.open(`/dj-profile/${dj?.id}`, '_blank')}
          iconName="ExternalLink"
          iconPosition="left"
        >
          Abrir Perfil do DJ
        </Button>
      </div>
    </div>
  );

  const renderCalendarTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Disponibilidade - Janeiro 2025</h3>
        <Button
          variant="outline"
          onClick={() => onManageAvailability(dj)}
          iconName="Edit"
          iconPosition="left"
        >
          Editar Disponibilidade
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']?.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        
        {Array.from({ length: 31 }, (_, i) => {
          const day = i + 1;
          const availability = mockAvailability?.find(a => 
            new Date(a.date)?.getDate() === day
          );
          
          return (
            <div
              key={day}
              className={`aspect-square rounded-lg border border-border flex items-center justify-center text-sm relative ${
                availability ? getAvailabilityColor(availability?.status) + ' text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-success"></div>
          <span className="text-muted-foreground">Disponível</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-warning"></div>
          <span className="text-muted-foreground">Parcialmente</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-error"></div>
          <span className="text-muted-foreground">Ocupado</span>
        </div>
      </div>
    </div>
  );

  const renderContractsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Histórico de Contratos</h3>
        <Button variant="outline" iconName="Plus" iconPosition="left">
          Novo Contrato
        </Button>
      </div>

      <div className="space-y-4">
        {contracts?.map((contract) => (
          <div key={contract?.id} className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-foreground">{contract?.event}</h4>
                <p className="text-sm text-muted-foreground">{contract?.producer}</p>
              </div>
              {getStatusBadge(contract?.status)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
                <span className="text-foreground">{contract?.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="DollarSign" size={16} className="text-muted-foreground" />
                <span className="text-foreground">{contract?.value}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" iconName="Eye">
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h1 className="text-xl font-semibold text-foreground">Detalhes do DJ</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onEdit(dj)}
              iconName="Edit"
              iconPosition="left"
            >
              Editar
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'media' && renderMediaTab()}
          {activeTab === 'calendar' && renderCalendarTab()}
          {activeTab === 'contracts' && renderContractsTab()}
        </div>
      </div>
    </div>
  );
};

export default DJDetailModal;