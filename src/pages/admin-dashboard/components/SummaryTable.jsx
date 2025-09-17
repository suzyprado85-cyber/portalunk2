import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SummaryTable = ({ title, data = [], columns = [], type = 'contracts' }) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data]?.sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a?.[sortField];
    const bValue = b?.[sortField];
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue?.localeCompare(bValue)
        : bValue?.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      ativo: { bg: 'bg-success/10', text: 'text-success', label: 'Ativo' },
      pendente: { bg: 'bg-warning/10', text: 'text-warning', label: 'Pendente' },
      concluido: { bg: 'bg-primary/10', text: 'text-primary', label: 'Concluído' },
      cancelado: { bg: 'bg-error/10', text: 'text-error', label: 'Cancelado' },
      assinado: { bg: 'bg-success/10', text: 'text-success', label: 'Assinado' },
      rascunho: { bg: 'bg-muted/50', text: 'text-muted-foreground', label: 'Rascunho' }
    };
    
    const config = statusConfig?.[status?.toLowerCase()] || statusConfig?.pendente;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config?.bg} ${config?.text}`}>
        {config?.label}
      </span>
    );
  };

  const handleViewAll = () => {
    const routes = {
      contracts: '/contract-management',
      events: '/event-calendar',
      payments: '/financial-tracking'
    };
    navigate(routes?.[type] || '/admin-dashboard');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })?.format(value);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('pt-BR');
  };

  const renderCellContent = (item, column) => {
    const value = item?.[column?.key];
    
    switch (column?.type) {
      case 'status':
        return getStatusBadge(value);
      case 'currency':
        return formatCurrency(value);
      case 'date':
        return formatDate(value);
      case 'avatar':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <Icon name="User" size={16} color="white" />
            </div>
            <span>{item?.name || value}</span>
          </div>
        );
      default:
        return value;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewAll}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Ver Todos
        </Button>
      </div>
      {data?.length === 0 ? (
        <div className="p-8 text-center">
          <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {columns?.map((column) => (
                  <th
                    key={column?.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                      column?.sortable ? 'cursor-pointer hover:bg-muted' : ''
                    }`}
                    onClick={column?.sortable ? () => handleSort(column?.key) : undefined}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column?.label}</span>
                      {column?.sortable && sortField === column?.key && (
                        <Icon 
                          name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                          size={14} 
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedData?.slice(0, 5)?.map((item, index) => (
                <tr key={item?.id || index} className="hover:bg-muted/25 transition-colors duration-150">
                  {columns?.map((column) => (
                    <td key={column?.key} className="px-6 py-4 whitespace-nowrap text-sm">
                      {renderCellContent(item, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SummaryTable;