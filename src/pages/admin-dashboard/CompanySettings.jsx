import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import AdminBackground from '../../components/AdminBackground';
import Input from '../../components/ui/Input';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { storageService, producerService } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';

const CompanySettings = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: 'UNK ASSESSORIA',
    cnpj: '12.345.678/0001-90',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    bank_name: '',
    bank_agency: '',
    bank_account: '',
    pix_key: '',
    contract_template: '',
    payment_instructions: '',
    avatar_url: '',
    avatar_url_preview: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabs = [
    { id: 'company', label: 'Dados da Empresa', icon: 'Building' },
    { id: 'banking', label: 'Dados Bancários', icon: 'CreditCard' },
    { id: 'contracts', label: 'Contratos', icon: 'FileText' },
    { id: 'payments', label: 'Pagamentos', icon: 'DollarSign' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (formData._avatarFile) {
        const file = formData._avatarFile;
        const fileExt = file.name.split('.').pop();
        const fileName = `company_avatar_${Date.now()}.${fileExt}`;
        const path = `company/${fileName}`;
        const { data, error } = await storageService.uploadFile('dj-media', path, file);
        if (error) throw new Error(error);
        const publicUrl = data?.publicUrl;
        setFormData(prev => ({ ...prev, avatar_url: publicUrl, avatar_url_preview: '' }));
        try { localStorage.setItem('company_avatar_url', publicUrl); } catch (e) {}
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      toast?.success('Configurações salvas com sucesso!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast?.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const renderCompanyTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Avatar da Empresa</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
              {(formData.avatar_url_preview || formData.avatar_url) ? (
                <img src={formData.avatar_url_preview || formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted-foreground">UNK</span>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e?.target?.files?.[0];
                  if (!file) return;
                  const previewUrl = URL.createObjectURL(file);
                  setFormData(prev => ({ ...prev, _avatarFile: file, avatar_url_preview: previewUrl }));
                }}
                className="text-sm text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Use uma imagem quadrada para melhores resultados</p>
            </div>
          </div>
        </div>

        <Input
          label="Nome da Empresa"
          required
          value={formData.company_name}
          onChange={(e) => handleInputChange('company_name', e.target.value)}
          placeholder="UNK ASSESSORIA"
        />

        <Input
          label="CNPJ"
          required
          value={formData.cnpj}
          onChange={(e) => handleInputChange('cnpj', e.target.value)}
          placeholder="12.345.678/0001-90"
        />
        
        <Input
          label="Endereço"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Rua das Flores, 123"
        />
        
        <Input
          label="Cidade"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          placeholder="São Paulo"
        />
        
        <Input
          label="Estado"
          value={formData.state}
          onChange={(e) => handleInputChange('state', e.target.value)}
          placeholder="SP"
        />
        
        <Input
          label="CEP"
          value={formData.zip_code}
          onChange={(e) => handleInputChange('zip_code', e.target.value)}
          placeholder="01234-567"
        />
        
        <Input
          label="Telefone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="(11) 99999-9999"
        />
        
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="contato@unkassessoria.com"
        />
      </div>
    </div>
  );

  const renderBankingTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Banco"
          value={formData.bank_name}
          onChange={(e) => handleInputChange('bank_name', e.target.value)}
          placeholder="Banco do Brasil"
        />
        
        <Input
          label="Agência"
          value={formData.bank_agency}
          onChange={(e) => handleInputChange('bank_agency', e.target.value)}
          placeholder="1234"
        />
        
        <Input
          label="Conta"
          value={formData.bank_account}
          onChange={(e) => handleInputChange('bank_account', e.target.value)}
          placeholder="12345-6"
        />
        
        <Input
          label="Chave PIX"
          value={formData.pix_key}
          onChange={(e) => handleInputChange('pix_key', e.target.value)}
          placeholder="contato@unkassessoria.com"
        />
      </div>
      
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-600">
            <p className="font-medium">Informações importantes:</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Os dados bancários serão usados nos contratos e pagamentos</li>
              <li>• A chave PIX será exibida para facilitar transferências</li>
              <li>• Mantenha as informações sempre atualizadas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContractsTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Template de Contrato
        </label>
        <textarea
          value={formData.contract_template}
          onChange={(e) => handleInputChange('contract_template', e.target.value)}
          placeholder="Digite o template padrão dos contratos..."
          rows={10}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Icon name="FileText" size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-600">
            <p className="font-medium">Template de Contrato:</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Use variáveis como {`{DJ_NAME}`, `{EVENT_DATE}`, `{AMOUNT}`} para personalização</li>
              <li>• O template será usado automaticamente na criação de contratos</li>
              <li>• Mantenha o texto claro e profissional</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Instruções de Pagamento
        </label>
        <textarea
          value={formData.payment_instructions}
          onChange={(e) => handleInputChange('payment_instructions', e.target.value)}
          placeholder="Digite as instruções padrão para pagamentos..."
          rows={8}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Icon name="DollarSign" size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-600">
            <p className="font-medium">Instruções de Pagamento:</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Essas instruções aparecerão nos contratos e comprovantes</li>
              <li>• Inclua informações sobre prazos, formas de pagamento, etc.</li>
              <li>• Seja específico sobre valores e condições</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    return () => {
      if (formData.avatar_url_preview) {
        try { URL.revokeObjectURL(formData.avatar_url_preview); } catch {}
      }
    };
  }, [formData.avatar_url_preview]);

  return (
    <AdminBackground>
      <div className="min-h-screen">
        <main className="pb-16 md:pb-0">
        {/* Header */}
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Voltar
              </Button>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Configurações da Empresa
            </h1>
            <p className="text-muted-foreground">
              Gerencie as informações da UNK ASSESSORIA para contratos e pagamentos
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-card border border-border rounded-lg p-6">
            {activeTab === 'company' && renderCompanyTab()}
            {activeTab === 'banking' && renderBankingTab()}
            {activeTab === 'contracts' && renderContractsTab()}
            {activeTab === 'payments' && renderPaymentsTab()}

            {saveSuccess && (
              <div className="mt-4 p-3 rounded-md bg-green-600/10 border border-green-600/20 text-green-700 text-sm">
                Configurações salvas com sucesso
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              loading={loading}
              iconName="Save"
              iconPosition="left"
              size="lg"
            >
              Salvar Configurações
            </Button>
          </div>
        </div>
        </main>
      </div>
    </AdminBackground>
  );
};

export default CompanySettings;
