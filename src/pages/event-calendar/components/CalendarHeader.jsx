import React from 'react';

import Button from '../../../components/ui/Button';

const CalendarHeader = ({ 
  currentDate, 
  onPreviousMonth, 
  onNextMonth, 
  onToday,
  viewMode,
  onViewModeChange 
}) => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const formatMonthYear = (date) => {
    return `${monthNames?.[date?.getMonth()]} ${date?.getFullYear()}`;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-foreground">
          Calendário de Eventos
        </h1>
        <div className="hidden sm:flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousMonth}
            iconName="ChevronLeft"
            iconPosition="left"
          >
            Anterior
          </Button>
          <div className="px-4 py-2 bg-card border border-border rounded-md">
            <span className="text-sm font-medium text-foreground">
              {formatMonthYear(currentDate)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextMonth}
            iconName="ChevronRight"
            iconPosition="right"
          >
            Próximo
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onToday}
          iconName="Calendar"
          iconPosition="left"
        >
          Hoje
        </Button>
        
        <div className="flex items-center bg-muted rounded-md p-1">
          <button
            onClick={() => onViewModeChange('month')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors duration-150 ${
              viewMode === 'month' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mês
          </button>
          <button
            onClick={() => onViewModeChange('agenda')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors duration-150 ${
              viewMode === 'agenda' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Agenda
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="flex sm:hidden items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousMonth}
          iconName="ChevronLeft"
        />
        <div className="px-4 py-2 bg-card border border-border rounded-md">
          <span className="text-sm font-medium text-foreground">
            {formatMonthYear(currentDate)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextMonth}
          iconName="ChevronRight"
        />
      </div>
    </div>
  );
};

export default CalendarHeader;