import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../AppIcon';
import GlassCard from './GlassCard';

// Add this utility function
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon,
  color = 'primary'
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'primary': return 'text-blue-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <GlassCard hover className="relative overflow-hidden">
      {/* Background gradient based on color */}
      <div className={cn(
        'absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full opacity-10',
        color === 'primary' && 'bg-blue-500',
        color === 'success' && 'bg-green-500',
        color === 'warning' && 'bg-yellow-500',
        color === 'error' && 'bg-red-500'
      )} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              {title}
            </p>
            <motion.p 
              className="text-2xl font-bold text-foreground mt-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {value}
            </motion.p>
          </div>
          
          <div className={cn(
            'p-2 rounded-lg glass-surface',
            getIconColor()
          )}>
            <Icon name={icon} size={20} />
          </div>
        </div>

        {change && (
          <div className="flex items-center gap-1">
            <Icon 
              name={changeType === 'positive' ? 'TrendingUp' : 'TrendingDown'} 
              size={14}
              className={getChangeColor()}
            />
            <p className={cn('text-sm font-medium', getChangeColor())}>
              {change}
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default MetricCard;