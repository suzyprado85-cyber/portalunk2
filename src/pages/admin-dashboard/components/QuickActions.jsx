import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import CreateProducerModal from '../../../components/CreateProducerModal';

const QuickActions = () => {
  const navigate = useNavigate();
  const [showProducerModal, setShowProducerModal] = useState(false);

  const actions = [
    {
      id: 'dj-management',
      label: 'Novo DJ',
      description: 'Cadastrar novo DJ',
      icon: 'UserPlus',
      path: '/dj-management',
      color: 'purple'
    },
    {
      id: 'create-event',
      label: 'Criar Evento',
      description: 'Agendar novo evento',
      icon: 'Calendar',
      path: '/event-calendar',
      color: 'green'
    },
    {
      id: 'contract-management',
      label: 'Novo Contrato',
      description: 'Criar contrato',
      icon: 'FileText',
      path: '/contract-management',
      color: 'blue'
    },
    {
      id: 'financial-report',
      label: 'Ver Relatórios',
      description: 'Análises financeiras',
      icon: 'BarChart2',
      path: '/financial-tracking',
      color: 'amber'
    },
  ];

  const colorClasses = {
    purple: 'bg-purple-600/10 hover:bg-purple-600/15',
    green: 'bg-green-600/10 hover:bg-green-600/15',
    blue: 'bg-blue-600/10 hover:bg-blue-600/15',
    amber: 'bg-amber-500/10 hover:bg-amber-500/15',
    rose: 'bg-rose-600/10 hover:bg-rose-600/15'
  };

  const borderStyles = {
    purple: '0.8px solid rgba(246, 33, 163, 0.68)',
    green: '0.8px solid rgba(115, 234, 159, 0.64)',
    amber: '0.8px solid rgba(251, 216, 130, 0.71)'
  };

  const handleActionClick = (action) => {
    if (action.action === 'modal') {
      setShowProducerModal(true);
    } else {
      navigate(action.path);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions?.map((action) => (
          <Button
            key={action?.id}
            variant="ghost"
            onClick={() => handleActionClick(action)}
            iconName={action?.icon}
            iconPosition="left"
            className={[
              'h-auto p-6 flex-col items-start text-left gap-1 min-h-[120px] rounded-xl border shadow-none backdrop-blur-xs',
              colorClasses[action.color] || 'bg-muted/10 hover:bg-muted/20'
            ].join(' ')}
            style={{ border: borderStyles[action.color] || undefined }}
            fullWidth
          >
            <div className="w-full">
              <div className="font-semibold text-base mb-1">{action?.label}</div>
              <div className="text-sm text-muted-foreground">{action?.description}</div>
            </div>
          </Button>
        ))}
      </div>

      {/* Modal para cadastrar produtor */}
      <CreateProducerModal
        defaultOpen={showProducerModal}
        showTrigger={false}
        onClose={() => setShowProducerModal(false)}
        onProducerCreated={() => {
          setShowProducerModal(false);
          console.log('Produtor criado com sucesso!');
        }}
      />
    </div>
  );
};

export default QuickActions;
