import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const DJTable = ({ djs, onSort, sortConfig, onRowClick, onEdit, onViewDetails, onViewProfile, onManageAvailability, onCreateEvent }) => {
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(djs?.map(dj => dj?.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (djId, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, djId]);
    } else {
      setSelectedRows(selectedRows?.filter(id => id !== djId));
    }
  };

  const getAvailabilityBadge = (status) => {
    const badges = {
      available: { color: 'bg-success/10 text-success', label: 'Disponível' },
      busy: { color: 'bg-error/10 text-error', label: 'Ocupado' },
      partially: { color: 'bg-warning/10 text-warning', label: 'Parcial' }
    };
    
    const badge = badges?.[status] || badges?.available;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge?.color}`}>
        {badge?.label}
      </span>
    );
  };

  const getSortIcon = (column) => {
    if (sortConfig?.key !== column) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-primary" />
      : <Icon name="ArrowDown" size={14} className="text-primary" />;
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Bulk Actions Bar */}
      {selectedRows?.length > 0 && (
        <div className="bg-primary/5 border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {selectedRows?.length} DJ{selectedRows?.length !== 1 ? 's' : ''} selecionado{selectedRows?.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" iconName="Mail">
                Enviar Email
              </Button>
              <Button variant="outline" size="sm" iconName="Calendar">
                Gerenciar Disponibilidade
              </Button>
              <Button variant="outline" size="sm" iconName="FileText">
                Exportar
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedRows?.length === djs?.length && djs?.length > 0}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => onSort('name')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>DJ</span>
                  {getSortIcon('name')}
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => onSort('specialties')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Especialidades</span>
                  {getSortIcon('specialties')}
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => onSort('availability')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Disponibilidade</span>
                  {getSortIcon('availability')}
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => onSort('lastBooking')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Último Evento</span>
                  {getSortIcon('lastBooking')}
                </button>
              </th>
              <th className="text-right px-4 py-3">
                <span className="text-sm font-medium text-foreground">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {djs?.map((dj) => (
              <tr
                key={dj?.id}
                className="border-t border-border hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => onRowClick(dj)}
              >
                <td className="px-4 py-4" onClick={(e) => e?.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedRows?.includes(dj?.id)}
                    onChange={(e) => handleSelectRow(dj?.id, e?.target?.checked)}
                    className="rounded border-border"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <Image
                        src={dj?.avatar}
                        alt={dj?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{dj?.name}</div>
                      <div className="text-sm text-muted-foreground">{dj?.location}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {dj?.specialties?.slice(0, 2)?.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary/10 text-secondary"
                      >
                        {specialty}
                      </span>
                    ))}
                    {dj?.specialties?.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{dj?.specialties?.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  {getAvailabilityBadge(dj?.availability)}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-foreground">{dj?.lastBooking}</div>
                  <div className="text-xs text-muted-foreground">{dj?.lastBookingDate}</div>
                </td>
                <td className="px-4 py-4" onClick={(e) => e?.stopPropagation()}>
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(dj)}
                      title="Ver detalhes"
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {djs?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum DJ encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou adicione novos DJs ao sistema.
          </p>
        </div>
      )}
    </div>
  );
};

export default DJTable;