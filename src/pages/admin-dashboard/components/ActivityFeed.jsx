import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    const icons = {
      contract: 'FileText',
      payment: 'DollarSign',
      event: 'Calendar',
      dj: 'Users',
      producer: 'Headphones',
      system: 'Settings'
    };
    return icons?.[type] || 'Bell';
  };

  const getActivityColor = (type) => {
    const colors = {
      contract: 'text-primary',
      payment: 'text-success',
      event: 'text-warning',
      dj: 'text-secondary',
      producer: 'text-accent',
      system: 'text-muted-foreground'
    };
    return colors?.[type] || 'text-foreground';
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return time?.toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Atividades Recentes</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {activities?.length === 0 ? (
          <div className="p-6 text-center">
            <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activities?.map((activity) => (
              <div key={activity?.id} className="p-4 hover:bg-muted/50 transition-colors duration-150">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
                    <Icon name={getActivityIcon(activity?.type)} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity?.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{activity?.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatTime(activity?.timestamp)}</p>
                  </div>
                  {activity?.status && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      activity?.status === 'success' ? 'bg-success/10 text-success' :
                      activity?.status === 'pending' ? 'bg-warning/10 text-warning' :
                      activity?.status === 'error'? 'bg-error/10 text-error' : 'bg-muted text-muted-foreground'
                    }`}>
                      {activity?.status === 'success' ? 'Concluído' :
                       activity?.status === 'pending' ? 'Pendente' :
                       activity?.status === 'error' ? 'Erro' : activity?.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;