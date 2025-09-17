import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const QuickActions = ({ 
  onCreateEvent, 
  onExportCalendar, 
  onImportEvents,
  onViewContracts,
  onViewFinancials,
  eventCount,
  upcomingEvents 
}) => {
  const today = new Date();
  const thisWeekEvents = upcomingEvents?.filter(event => {
    const eventDate = new Date(event.date);
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= today && eventDate <= weekFromNow;
  });

  const pendingEvents = upcomingEvents?.filter(event => event?.status === 'pending');

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg mx-auto mb-2 bg-transparent">
              <Icon name="Calendar" size={24} className="text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{eventCount}</div>
            <div className="text-sm text-muted-foreground">Total de Eventos</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg mx-auto mb-2 bg-transparent">
              <Icon name="Clock" size={24} className="text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground">{thisWeekEvents?.length}</div>
            <div className="text-sm text-muted-foreground">Esta Semana</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg mx-auto mb-2 bg-transparent">
              <Icon name="AlertCircle" size={24} className="text-warning" />
            </div>
            <div className="text-2xl font-bold text-foreground">{pendingEvents?.length}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg mx-auto mb-2 bg-transparent">
              <Icon name="TrendingUp" size={24} className="text-secondary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {upcomingEvents?.filter(e => e?.status === 'confirmed')?.length}
            </div>
            <div className="text-sm text-muted-foreground">Confirmados</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="default"
            onClick={() => onCreateEvent(new Date())}
            iconName="Plus"
            iconPosition="left"
          >
            Novo Evento
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={onViewContracts}
              iconName="FileText"
              iconPosition="left"
            >
              Contratos
            </Button>

            <Button
              variant="outline"
              size="default"
              onClick={onViewFinancials}
              iconName="DollarSign"
              iconPosition="left"
            >
              Financeiro
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="default"
              onClick={onExportCalendar}
              iconName="Download"
              title="Exportar Calendário"
            />

            <Button
              variant="ghost"
              size="default"
              onClick={onImportEvents}
              iconName="Upload"
              title="Importar Eventos"
            />
          </div>
        </div>
      </div>
      {/* Upcoming Events Preview */}
      {thisWeekEvents?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
            <Icon name="Clock" size={16} className="mr-2 text-muted-foreground" />
            Próximos Eventos (Esta Semana)
          </h4>
          <div className="space-y-2">
            {thisWeekEvents?.slice(0, 3)?.map((event) => (
              <div
                key={event?.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    event?.status === 'confirmed' ? 'bg-success' :
                    event?.status === 'pending'? 'bg-warning' : 'bg-muted'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {event?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date)?.toLocaleDateString('pt-BR')} às {event?.time} - {event?.venue}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {event?.djs?.length} DJ{event?.djs?.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
            {thisWeekEvents?.length > 3 && (
              <div className="text-center">
                <button className="text-sm text-primary hover:text-primary/80 font-medium">
                  Ver mais {thisWeekEvents?.length - 3} eventos
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
