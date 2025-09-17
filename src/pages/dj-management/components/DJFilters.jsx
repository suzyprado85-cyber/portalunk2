import React, { useState } from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DJFilters = ({ onFiltersChange, resultsCount = 0 }) => {
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    availability: '',
    location: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const genreOptions = [
    { value: '', label: 'Todos os Gêneros' },
    { value: 'house', label: 'House' },
    { value: 'techno', label: 'Techno' },
    { value: 'funk', label: 'Funk' },
    { value: 'sertanejo', label: 'Sertanejo' },
    { value: 'eletronica', label: 'Eletrônica' },
    { value: 'pop', label: 'Pop' },
    { value: 'rock', label: 'Rock' }
  ];

  const availabilityOptions = [
    { value: '', label: 'Todas as Disponibilidades' },
    { value: 'available', label: 'Disponível' },
    { value: 'busy', label: 'Ocupado' },
    { value: 'partially', label: 'Parcialmente Disponível' }
  ];

  const locationOptions = [
    { value: '', label: 'Todas as Localizações' },
    { value: 'sao-paulo', label: 'São Paulo' },
    { value: 'rio-janeiro', label: 'Rio de Janeiro' },
    { value: 'belo-horizonte', label: 'Belo Horizonte' },
    { value: 'brasilia', label: 'Brasília' },
    { value: 'salvador', label: 'Salvador' },
    { value: 'recife', label: 'Recife' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      genre: '',
      availability: '',
      location: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
          iconPosition="right"
          fullWidth
        >
          Filtros {hasActiveFilters && `(${Object.values(filters)?.filter(v => v)?.length})`}
        </Button>
      </div>
      {/* Filter Controls */}
      <div className={`space-y-4 ${!isExpanded ? 'hidden md:block' : ''}`}>
        {/* Search Bar */}
        <div className="w-full">
          <Input
            type="search"
            placeholder="Buscar DJs por nome, especialidade ou localização..."
            value={filters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
            className="w-full"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Gênero Musical"
            options={genreOptions}
            value={filters?.genre}
            onChange={(value) => handleFilterChange('genre', value)}
            placeholder="Selecionar gênero"
          />

          <Select
            label="Disponibilidade"
            options={availabilityOptions}
            value={filters?.availability}
            onChange={(value) => handleFilterChange('availability', value)}
            placeholder="Selecionar disponibilidade"
          />

          <Select
            label="Localização"
            options={locationOptions}
            value={filters?.location}
            onChange={(value) => handleFilterChange('location', value)}
            placeholder="Selecionar localização"
          />
        </div>

        {/* Filter Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {resultsCount} DJ{resultsCount !== 1 ? 's' : ''} encontrado{resultsCount !== 1 ? 's' : ''}
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                iconName="X"
                iconPosition="left"
              >
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters?.genre && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                  {genreOptions?.find(g => g?.value === filters?.genre)?.label}
                  <button
                    onClick={() => handleFilterChange('genre', '')}
                    className="ml-1 hover:text-primary/80"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              )}
              {filters?.availability && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success/10 text-success">
                  {availabilityOptions?.find(a => a?.value === filters?.availability)?.label}
                  <button
                    onClick={() => handleFilterChange('availability', '')}
                    className="ml-1 hover:text-success/80"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              )}
              {filters?.location && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                  {locationOptions?.find(l => l?.value === filters?.location)?.label}
                  <button
                    onClick={() => handleFilterChange('location', '')}
                    className="ml-1 hover:text-accent/80"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DJFilters;