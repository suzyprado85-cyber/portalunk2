import React from 'react';
import Icon from '../../../components/AppIcon';

const FinancialSummaryWidget = ({ title, value, change, changeType, icon, color = 'primary' }) => {
  const getIconColor = (colorType) => {
    const colors = {
      primary: 'text-primary',
      success: 'text-success',
      warning: 'text-warning',
      accent: 'text-accent'
    };
    return colors?.[colorType] || colors?.primary;
  };

  const getChangeColor = (type) => {
    return type === 'positive' ? 'text-success' : type === 'negative' ? 'text-error' : 'text-muted-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-transparent`}>
          <Icon name={icon} size={24} className={getIconColor(color)} />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
      {change && (
        <div className="flex items-center space-x-2">
          <Icon 
            name={changeType === 'positive' ? 'TrendingUp' : changeType === 'negative' ? 'TrendingDown' : 'Minus'} 
            size={16} 
            className={getChangeColor(changeType)}
          />
          <span className={`text-sm font-medium ${getChangeColor(changeType)}`}>
            {change}
          </span>
          <span className="text-xs text-muted-foreground">
            {changeType === 'neutral' ? '' : 'vs período anterior'}
          </span>
        </div>
      )}
    </div>
  );
};

export default FinancialSummaryWidget;
