import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ContractModal = ({ 
  isOpen, 
  onClose, 
  contract = null, 
  mode = 'view', // 'view', 'edit', 'create'
  onSave,
  onSendForSignature 
}) => {
  const [formData, setFormData] = useState({
    contractId: contract?.contractId || '',
    eventName: contract?.eventName || '',
    eventDate: contract?.eventDate || '',
    parties: contract?.parties || [],
    terms: contract?.terms || '',
    status: contract?.status || 'draft',
    signatures: contract?.signatures || [],
    ...contract
  });

  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen) return null;

  const statusOptions = [
    { value: 'draft', label: 'Rascunho' },
    { value: 'pending', label: 'Pendente' },
    { value: 'signed', label: 'Assinado' },
    { value: 'expired', label: 'Expirado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Rascunho' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      signed: { color: 'bg-green-100 text-green-800', label: 'Assinado' },
      expired: { color: 'bg-red-100 text-red-800', label: 'Expirado' },
      cancelled: { color: 'bg-gray-100 text-gray-600', label: 'Cancelado' }
    };

    const config = statusConfig?.[status] || statusConfig?.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const tabs = [
    { id: 'details', label: 'Detalhes', icon: 'FileText' },
    { id: 'parties', label: 'Partes', icon: 'Users' },
    { id: 'signatures', label: 'Assinaturas', icon: 'PenTool' },
    { id: 'history', label: 'Histórico', icon: 'Clock' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={20} color="white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {mode === 'create' ? 'Novo Contrato' : `Contrato ${formData?.contractId}`}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(formData?.status)}
                <span className="text-sm text-muted-foreground">
                  {formData?.eventName}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {mode === 'view' && (
              <>
                <Button
                  variant="outline"
                  iconName="Edit"
                  onClick={() => {/* Switch to edit mode */}}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  iconName="Send"
                  onClick={() => onSendForSignature(formData)}
                  disabled={formData?.status === 'signed'}
                >
                  Enviar para Assinatura
                </Button>
                <Button
                  variant="outline"
                  iconName="Download"
                  onClick={() => {/* Download contract */}}
                >
                  Download
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              iconName="X"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="ID do Contrato"
                  value={formData?.contractId}
                  onChange={(e) => handleInputChange('contractId', e?.target?.value)}
                  disabled={mode === 'view'}
                />
                <Input
                  label="Nome do Evento"
                  value={formData?.eventName}
                  onChange={(e) => handleInputChange('eventName', e?.target?.value)}
                  disabled={mode === 'view'}
                />
                <Input
                  label="Data do Evento"
                  type="date"
                  value={formData?.eventDate}
                  onChange={(e) => handleInputChange('eventDate', e?.target?.value)}
                  disabled={mode === 'view'}
                />
                <Select
                  label="Status"
                  options={statusOptions}
                  value={formData?.status}
                  onChange={(value) => handleInputChange('status', value)}
                  disabled={mode === 'view'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Termos do Contrato
                </label>
                <textarea
                  value={formData?.terms}
                  onChange={(e) => handleInputChange('terms', e?.target?.value)}
                  disabled={mode === 'view'}
                  rows={8}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Digite os termos e condições do contrato..."
                />
              </div>
            </div>
          )}

          {activeTab === 'parties' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">Partes Envolvidas</h3>
                {mode !== 'view' && (
                  <Button
                    variant="outline"
                    iconName="Plus"
                    onClick={() => {/* Add new party */}}
                  >
                    Adicionar Parte
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                {formData?.parties?.map((party, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                        <Icon name="User" size={20} color="white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{party?.name}</p>
                        <p className="text-sm text-muted-foreground">{party?.role}</p>
                        <p className="text-sm text-muted-foreground">{party?.email}</p>
                      </div>
                    </div>
                    {mode !== 'view' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Trash2"
                        onClick={() => {/* Remove party */}}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'signatures' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Status das Assinaturas</h3>
              
              <div className="space-y-3">
                {formData?.signatures?.map((signature, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        signature?.signed ? 'bg-success' : 'bg-warning'
                      }`}>
                        <Icon 
                          name={signature?.signed ? "CheckCircle" : "Clock"} 
                          size={20} 
                          color="white" 
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{signature?.signerName}</p>
                        <p className="text-sm text-muted-foreground">{signature?.signerRole}</p>
                        {signature?.signed && signature?.signedAt && (
                          <p className="text-sm text-success">
                            Assinado em {new Date(signature.signedAt)?.toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {signature?.signed ? (
                        <span className="text-success font-medium">Assinado</span>
                      ) : (
                        <span className="text-warning font-medium">Pendente</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Histórico de Modificações</h3>
              
              <div className="space-y-3">
                {formData?.history?.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="Clock" size={16} color="white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{entry?.action}</p>
                      <p className="text-sm text-muted-foreground">{entry?.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(entry.timestamp)?.toLocaleString('pt-BR')} - {entry?.user}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum histórico disponível
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {mode !== 'view' && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
            >
              {mode === 'create' ? 'Criar Contrato' : 'Salvar Alterações'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractModal;