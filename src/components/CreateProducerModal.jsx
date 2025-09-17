import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import Icon from './AppIcon';
import { producerService } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';

const CreateProducerModal = ({ onProducerCreated, onClose, defaultOpen = false, showTrigger = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';
  
  React.useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    company_document: '',
    address: '',
    city: '',
    state: '',
    contact_person: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('Nome e email são obrigatórios');
      return;
    }

    try {
      if (!isAdmin) {
        alert('Ação permitida apenas para administradores');
        return;
      }
      setLoading(true);

      // Gerar senha se não foi fornecida
      const password = formData.password || await producerService.generateRandomPassword();

      const result = await producerService.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        company_name: formData.company_name || undefined,
        company_document: formData.company_document || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        contact_person: formData.contact_person || undefined,
      }, password);

      if (result?.error) {
        throw new Error(result.error);
      }

      // Se há uma imagem de perfil, fazer upload
      if (profileImage && result?.data?.producer?.id) {
        console.log('📸 Fazendo upload da foto de perfil...');
        await producerService.uploadAvatar(result.data.producer.id, profileImage);
      }

      // Mostrar credenciais geradas
      const creds = result?.data?.credentials;
      alert(`Produtor criado! Email: ${creds?.email || formData.email} | Senha: ${creds?.password || password}`);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        company_document: '',
        address: '',
        city: '',
        state: '',
        contact_person: '',
        password: ''
      });
      setProfileImage(null);
      setImagePreview(null);
      
      setOpen(false);
      onClose?.();
      onProducerCreated?.();
    } catch (error) {
      console.error('Erro ao criar produtor:', error);
      const errMsg = error?.message || String(error);

      if (/already registered|already exists|user exists/i.test(errMsg)) {
        alert('Erro: usuário já registrado. Peça para o usuário recuperar a senha ou use o usuário existente.');
      } else if (/row-level security|service_role|service role|policy/i.test(errMsg)) {
        alert('Erro: não é possível criar o perfil do produtor a partir do cliente devido a políticas de segurança (RLS). Crie o usuário/perfil via um endpoint seguro no servidor com a chave service_role do Supabase. Você pode conectar o Supabase nas integrações (MCP) para tarefas administrativas.');
      } else {
        alert('Erro ao criar produtor: ' + (errMsg || 'Erro desconhecido'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.includes('image/jpeg') && !file.type.includes('image/png')) {
        alert('Apenas arquivos PNG e JPEG são permitidos');
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
      }
      
      setProfileImage(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto relative z-[99999]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Adicionar Novo Produtor</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setOpen(false);
                  onClose?.();
                }}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Foto de Perfil */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Foto de Perfil</label>
                <div className="flex items-center space-x-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-lg object-cover border-2 border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={removeImage}
                      >
                        <Icon name="X" size={12} />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                      <Icon name="Image" size={32} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-image"
                    />
                    <label
                      htmlFor="profile-image"
                      className="cursor-pointer inline-flex items-center px-3 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-accent"
                    >
                      <Icon name="Upload" size={16} className="mr-2" />
                      Escolher Foto
                    </label>
                    <p className="text-xs text-muted-foreground">
                      PNG ou JPEG, máximo 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">Nome *</label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email *</label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">Telefone</label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="company_name" className="text-sm font-medium text-foreground">Nome da Empresa</label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Eventos Ltda"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="company_document" className="text-sm font-medium text-foreground">CNPJ</label>
                  <Input
                    id="company_document"
                    value={formData.company_document}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_document: e.target.value }))}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contact_person" className="text-sm font-medium text-foreground">Pessoa de Contato</label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                    placeholder="Nome do responsável"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium text-foreground">Cidade</label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="São Paulo"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium text-foreground">Estado</label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium text-foreground">Endereço</label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Endereço completo"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">Senha (deixe vazio para gerar automaticamente)</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Senha personalizada (opcional)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setOpen(false);
                  onClose?.();
                }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Produtor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTrigger && isAdmin && (
      <Button onClick={() => setOpen(true)}>
        <Icon name="Plus" size={16} className="mr-2" />
        Adicionar Produtor
      </Button>
      )}
    </>
  );
};

export default CreateProducerModal;
