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
      label: 'Gerenciar DJs',
      description: 'Adicionar, editar e visualizar perfis de DJs',
      icon: 'Users',
      path: '/dj-management',
      variant: 'outline'
    },
    {
      id: 'create-event',
      label: 'Criar Evento',
      description: 'Agendar novo evento no calendário',
      icon: 'Calendar',
      path: '/event-calendar',
      variant: 'outline'
    },
    {
      id: 'financial-report',
      label: 'Relatório Financeiro',
      description: 'Visualizar transações e pagamentos',
      icon: 'DollarSign',
      path: '/financial-tracking',
      variant: 'outline'
    },
    {
      id: 'contract-management',
      label: 'Contratos',
      description: 'Gerenciar contratos e assinaturas',
      icon: 'FileText',
      path: '/contract-management',
      variant: 'outline'
    },
    {
      id: 'add-producer',
      label: 'Adicionar Produtor',
      description: 'Cadastrar novo produtor no sistema',
      icon: 'UserPlus',
      variant: 'outline',
      action: 'modal'
    }
  ];

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
