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
    purple: 'bg-purple-600/10 border-purple-500/20 hover:bg-purple-600/15',
    green: 'bg-green-600/10 border-green-500/20 hover:bg-green-600/15',
    blue: 'bg-blue-600/10 border-blue-500/20 hover:bg-blue-600/15',
    amber: 'bg-amber-500/10 border-amber-400/20 hover:bg-amber-500/15',
    rose: 'bg-rose-600/10 border-rose-500/20 hover:bg-rose-600/15'
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {actions?.map((action) => (
          <Button
            key={action?.id}
            variant={action?.variant}
            onClick={() => handleActionClick(action)}
            iconName={action?.icon}
            iconPosition="left"
            className="h-auto p-4 flex-col items-start text-left gap-1 min-h-[96px]"
            fullWidth
          >
            <div className="w-full" style={{minHeight: '64px'}}>
              <div className="font-medium text-sm md:text-base mb-1 whitespace-normal break-words line-clamp-2">{action?.label}</div>
              <div className="text-xs md:text-sm opacity-75 font-normal whitespace-normal break-words line-clamp-2">{action?.description}</div>
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
