import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';


const CalendarFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  producers,
  djs 
}) => {
  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'pending', label: 'Pendente' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'completed', label: 'Concluído' }
  ];

  const producerOptions = [
    { value: '', label: 'Todos os Produtores' },
    ...producers?.map(producer => ({
      value: producer?.id,
      label: producer?.name
    }))
  ];

  const djOptions = [
    { value: '', label: 'Todos os DJs' },
    ...djs?.map(dj => ({
      value: dj?.id,
      label: dj?.name
    }))
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            iconName="X"
            iconPosition="left"
          >
            Limpar Filtros
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Input
          label="Buscar Evento"
          type="search"
          placeholder="Nome do evento..."
          value={filters?.search}
          onChange={(e) => handleFilterChange('search', e?.target?.value)}
        />

        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />

        <Select
          label="Produtor"
          options={producerOptions}
          value={filters?.producer}
          onChange={(value) => handleFilterChange('producer', value)}
          searchable
        />

        <Select
          label="DJ"
          options={djOptions}
          value={filters?.dj}
          onChange={(value) => handleFilterChange('dj', value)}
          searchable
        />
      </div>
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {filters?.search && (
              <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                <span>Busca: "{filters?.search}"</span>
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-2 hover:bg-primary/20 rounded-full p-1"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            )}
            {filters?.status && (
              <div className="flex items-center bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                <span>Status: {statusOptions?.find(opt => opt?.value === filters?.status)?.label}</span>
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-2 hover:bg-accent/20 rounded-full p-1"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarFilters;
