import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const GlassCard = ({ 
  children, 
  className, 
  hover = false,
  glow = false,
  ...props 
}) => {
  return (
    <motion.div
      className={cn(
        'glass-card rounded-lg p-6 transition-smooth',
        hover && 'hover-glass',
        glow && 'blue-glow',
        className
      )}
      whileHover={hover ? { scale: 1.02 } : undefined}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;