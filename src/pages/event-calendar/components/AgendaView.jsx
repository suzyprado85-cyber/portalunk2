import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AgendaView = ({ events, onEventClick, onCreateEvent, currentDate }) => {
  const today = new Date();
  
  // Group events by date
  const groupedEvents = events?.reduce((groups, event) => {
    const eventDate = new Date(event.date);
    const dateKey = eventDate?.toISOString()?.split('T')?.[0];
    
    if (!groups?.[dateKey]) {
      groups[dateKey] = [];
    }
    groups?.[dateKey]?.push(event);
    return groups;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedEvents)?.sort();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date?.toLocaleDateString('pt-BR', options);
  };

  const isToday = (dateStr) => {
    const date = new Date(dateStr);
    return date?.toDateString() === today?.toDateString();
  };

  const getEventStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'border-success bg-success/10 text-success';
      case 'pending':
        return 'border-warning bg-warning/10 text-warning';
      case 'cancelled':
        return 'border-error bg-error/10 text-error';
      case 'completed':
        return 'border-primary bg-primary/10 text-primary';
      default:
        return 'border-muted bg-muted/10 text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return 'CheckCircle';
      case 'pending':
        return 'Clock';
      case 'cancelled':
        return 'XCircle';
      case 'completed':
        return 'Check';
      default:
        return 'Calendar';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return 'Indefinido';
    }
  };

  if (sortedDates?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhum evento encontrado
        </h3>
        <p className="text-muted-foreground mb-4">
          Não há eventos programados para o período selecionado.
        </p>
        <Button
          variant="primary"
          onClick={() => onCreateEvent(new Date())}
          iconName="Plus"
          iconPosition="left"
        >
          Criar Primeiro Evento
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates?.map((dateStr) => (
        <div key={dateStr} className="bg-card border border-border rounded-lg overflow-hidden">
          <div className={`px-6 py-4 border-b border-border ${
            isToday(dateStr) ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isToday(dateStr) && (
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                )}
                <h3 className="text-lg font-semibold text-foreground">
                  {formatDate(dateStr)}
                </h3>
                {isToday(dateStr) && (
                  <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Hoje
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {groupedEvents?.[dateStr]?.length} evento{groupedEvents?.[dateStr]?.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {groupedEvents?.[dateStr]?.sort((a, b) => a?.time?.localeCompare(b?.time))?.map((event) => (
                  <div
                    key={event?.id}
                    onClick={() => onEventClick(event)}
                    className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors duration-150"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center ${getEventStatusColor(event?.status)}`}>
                        <Icon name={getStatusIcon(event?.status)} size={20} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-foreground truncate">
                            {event?.title}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Icon name="Clock" size={14} />
                              <span>{event?.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Icon name="MapPin" size={14} />
                              <span className="truncate">{event?.venue}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventStatusColor(event?.status)}`}>
                            {getStatusLabel(event?.status)}
                          </span>
                          <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                          <Icon name="User" size={14} className="text-muted-foreground" />
                          <span className="text-muted-foreground">Produtor:</span>
                          <span className="font-medium text-foreground">{event?.producer}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Icon name="Users" size={14} className="text-muted-foreground" />
                          <span className="text-muted-foreground">DJs:</span>
                          <span className="font-medium text-foreground">
                            {event?.djs?.length} DJ{event?.djs?.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {event?.contractId && (
                          <div className="flex items-center space-x-2">
                            <Icon name="FileText" size={14} className="text-muted-foreground" />
                            <span className="text-success font-medium">Contrato Ativo</span>
                          </div>
                        )}
                      </div>

                      {event?.description && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {event?.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgendaView;