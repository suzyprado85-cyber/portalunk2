import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const DJCards = ({ djs, onRowClick, onEdit, onViewDetails, onViewProfile, onManageAvailability, onCreateEvent }) => {
  const getAvailabilityBadge = (status) => {
    const badges = {
      available: { color: 'bg-success/10 text-success', label: 'Disponível', icon: 'CheckCircle' },
      busy: { color: 'bg-error/10 text-error', label: 'Ocupado', icon: 'XCircle' },
      partially: { color: 'bg-warning/10 text-warning', label: 'Parcial', icon: 'Clock' }
    };
    
    const badge = badges?.[status] || badges?.available;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge?.color}`}>
        <Icon name={badge?.icon} size={12} className="mr-1" />
        {badge?.label}
      </span>
    );
  };

  if (djs?.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Nenhum DJ encontrado</h3>
        <p className="text-muted-foreground">
          Tente ajustar os filtros ou adicione novos DJs ao sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {djs?.map((dj) => (
        <div
          key={dj?.id}
          className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => onViewProfile(dj)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                <Image
                  src={dj?.avatar}
                  alt={dj?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{dj?.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Icon name="MapPin" size={12} className="mr-1" />
                  {dj?.location}
                </p>
              </div>
            </div>
            {getAvailabilityBadge(dj?.availability)}
          </div>

          {/* Specialties */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {dj?.specialties?.slice(0, 3)?.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary/10 text-secondary"
                >
                  {specialty}
                </span>
              ))}
              {dj?.specialties?.length > 3 && (
                <span className="text-xs text-muted-foreground px-2 py-1">
                  +{dj?.specialties?.length - 3} mais
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mb-4">
            <div>
              <div className="text-sm font-medium text-foreground mb-1">{dj?.lastBooking}</div>
              <p className="text-xs text-muted-foreground">{dj?.lastBookingDate}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border" onClick={(e) => e?.stopPropagation()}>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(dj)}
                iconName="Eye"
                iconPosition="left"
              >
                Detalhes
              </Button>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(dj)}
                title="Editar"
              >
                <Icon name="Edit" size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCreateEvent(dj)}
                title="Criar evento"
              >
                <Icon name="Calendar" size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onManageAvailability(dj)}
                title="Gerenciar disponibilidade"
              >
                <Icon name="Clock" size={16} />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DJCards;