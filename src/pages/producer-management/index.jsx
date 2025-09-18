import React, { useState, useEffect, useMemo, useRef } from 'react';
import TopBar from '../../components/ui/TopBar';
import RoleSidebar from '../../components/ui/RoleSidebar';
import AdminBackground from '../../components/AdminBackground';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { producerService, djService, storageService } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const ProducerCard = ({ producer, onView, onEdit, onChangePassword, onSelectDJ }) => {
  const rawAvatar = producer?.profile_image_url || producer?.avatar_url || '';

  const getAvatarUrl = (raw) => {
    if (!raw) return null;
    if (typeof raw === 'string' && raw.startsWith('http')) return raw;
    // If value looks like a storage path, try common buckets
    try {
      const candidates = ['avatars', 'producers', 'public'];
      for (const bucket of candidates) {
        const url = storageService.getPublicUrl(bucket, raw);
        if (url) return url;
      }
    } catch (e) {
      // ignore
    }
    // fallback to raw
    return raw;
  };

  const avatar = getAvatarUrl(rawAvatar);

  return (
    <div className="bg-card/90 backdrop-blur-md border border-border/60 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 min-h-[220px]">
      <div className="flex items-start space-x-5">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 border-border/60 flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt={producer?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-2xl font-semibold">
              {(producer?.name || producer?.company_name || 'P').charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-2xl font-semibold text-foreground truncate">{producer?.name || 'Sem nome'}</h3>
              <p className="text-sm text-muted-foreground truncate">{producer?.company_name || producer?.email}</p>
            </div>
            {producer?.is_active !== undefined && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${producer?.is_active ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
                {producer?.is_active ? 'Ativo' : 'Inativo'}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-x-6 gap-y-2 mt-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center min-w-0 max-w-full truncate"><Icon name="Mail" size={14} className="mr-2 text-blue-500" /> <span className="truncate">{producer?.email}</span></span>
            {producer?.phone && <span className="inline-flex items-center break-all"><Icon name="Phone" size={14} className="mr-2 text-emerald-500" /> {producer?.phone}</span>}
            {producer?.company_document && <span className="inline-flex items-center"><Icon name="FileText" size={14} className="mr-2 text-purple-400" /> {producer?.company_document}</span>}
            {(producer?.city || producer?.state) && <span className="inline-flex items-center"><Icon name="MapPin" size={14} className="mr-2 text-cyan-400" /> {producer?.city}{producer?.state ? `, ${producer?.state}` : ''}</span>}
          </div>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-border/60 bg-muted/10 rounded-b-2xl grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Button size="lg" variant="ghost" fullWidth onClick={() => onView(producer)} iconName="Eye" iconPosition="left">Detalhes</Button>
        <Button size="lg" variant="ghost" fullWidth onClick={() => onEdit(producer)} iconName="Pencil" iconPosition="left">Editar</Button>
        <Button size="lg" variant="ghost" fullWidth onClick={() => onChangePassword(producer)} iconName="Key" iconPosition="left">Senha</Button>
        <Button size="lg" variant="ghost" fullWidth onClick={() => onSelectDJ(producer)} iconName="Users" iconPosition="left">Selecionar DJ</Button>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-border/60">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm text-foreground max-w-[60%] text-right truncate">{value || '-'}</span>
  </div>
);

const ProducerManagement = () => {
  const { userProfile, loading, profileLoading, isAuthenticated } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  const { data: producers = [], loading: loadingProducers, refetch: refetchProducers } = useSupabaseData(producerService, 'getAll', [], []);
  const { data: djs = [], loading: loadingDjs } = useSupabaseData(djService, 'getAll', [], []);

  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState(null);
  const [passwordFor, setPasswordFor] = useState(null);
  const [selectDJFor, setSelectDJFor] = useState(null);

  const [search, setSearch] = useState('');
  const [isSidebarHover, setIsSidebarHover] = useState(false);

  // Edit form state
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
    is_active: true,
    avatar_url: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedAvatarPreview, setSelectedAvatarPreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData?.name || '',
        email: editData?.email || '',
        phone: editData?.phone || '',
        company_name: editData?.company_name || '',
        company_document: editData?.company_document || '',
        address: editData?.address || '',
        city: editData?.city || '',
        state: editData?.state || '',
        contact_person: editData?.contact_person || '',
        is_active: editData?.is_active ?? true,
        avatar_url: editData?.avatar_url || editData?.profile_image_url || ''
      });
      setSelectedAvatar(null);
      setSelectedAvatarPreview('');
      setNewPassword('');
      setShowPassword(false);
    }
  }, [editData]);

  // Generate preview URL when a file is selected
  useEffect(() => {
    if (!selectedAvatar) {
      setSelectedAvatarPreview('');
      return;
    }
    const url = URL.createObjectURL(selectedAvatar);
    setSelectedAvatarPreview(url);
    return () => {
      try { URL.revokeObjectURL(url); } catch {}
    };
  }, [selectedAvatar]);

  const handleAvatarSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }
    setSelectedAvatar(file);
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return producers || [];
    return (producers || []).filter(p =>
      (p?.name || '').toLowerCase().includes(term) ||
      (p?.company_name || '').toLowerCase().includes(term) ||
      (p?.email || '').toLowerCase().includes(term)
    );
  }, [search, producers]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const onSaveEdit = async () => {
    if (!editData) return;
    if (!formData?.name || !formData?.email) {
      alert('Nome e email são obrigatórios');
      return;
    }

    try {
      // Upload avatar if selected
      if (selectedAvatar) {
        setUploadingAvatar(true);
        try {
          const res = await producerService.uploadAvatar(editData.id, selectedAvatar);
          if (res?.error) {
            alert(`Erro ao atualizar avatar: ${res.error}`);
            setUploadingAvatar(false);
            return;
          }
          if (res?.data?.url) {
            setFormData(prev => ({ ...prev, avatar_url: res.data.url }));
          }
        } finally {
          setUploadingAvatar(false);
        }
      }

      // Update profile via Edge Function to also sync Auth email when changed
      const updates = { ...formData };
      const { data: updateRes, error: updateErr } = await supabase.functions.invoke('update-producer', {
        body: { producerId: editData.id, updates }
      });
      if (updateErr || updateRes?.error) {
        alert(updateErr?.message || updateRes?.error || 'Erro ao atualizar produtor');
        return;
      }

      // Update password if provided
      if (newPassword?.trim()) {
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('id', editData.id)
          .single();
        if (profErr || !prof?.user_id) {
          alert('Erro ao obter usuário para atualizar senha');
          return;
        }
        const { data: pwRes, error: pwErr } = await supabase.functions.invoke('update-user-password', {
          body: { userId: prof.user_id, newPassword }
        });
        if (pwErr || pwRes?.error) {
          alert(pwErr?.message || pwRes?.error || 'Erro ao atualizar senha');
          return;
        }
      }

      alert(newPassword?.trim() ? 'Produtor atualizado e senha alterada com sucesso!' : 'Produtor atualizado com sucesso!');
      setEditData(null);
      setSelectedAvatar(null);
      setNewPassword('');
      refetchProducers();
    } catch (e) {
      console.error('Erro ao atualizar produtor:', e);
      alert('Erro ao atualizar produtor');
    }
  };

  const onSubmitPassword = async (producer) => {
    const newPass = window.prompt('Nova senha para ' + (producer?.email || 'produtor') + ':');
    if (!newPass) return;
    const res = await producerService.changePassword(producer?.email, newPass);
    if (res?.error) {
      alert(res.error);
    } else {
      alert('Senha alterada com sucesso');
    }
    setPasswordFor(null);
  };

  const onSubmitSelectDJ = async (producer, djId) => {
    const res = await producerService.setDashboardDJ(producer?.id, djId);
    if (res?.error) {
      alert(res.error);
    } else {
      alert('DJ definido para o dashboard do produtor');
      setSelectDJFor(null);
      refetchProducers();
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && userProfile && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="ShieldAlert" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">Acesso restrito a administradores</p>
        </div>
      </div>
    );
  }


  return (
    <AdminBackground>
      <div className="min-h-screen">
        <RoleSidebar userRole="admin" isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} onHoverChange={setIsSidebarHover} />
        <div className={`transition-all duration-300 ${isMobile ? 'ml-0 pb-16' : sidebarCollapsed ? (isSidebarHover ? 'ml-60' : 'ml-16') : 'ml-60'}`}>
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Produtores</h1>
              <p className="text-muted-foreground">Gerencie os produtores cadastrados</p>
            </div>
            <div className="w-full max-w-xs">
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, empresa ou email" />
            </div>
          </div>

          {loadingProducers ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {(filtered || []).map((p) => (
                <ProducerCard
                  key={p?.id}
                  producer={p}
                  onView={setSelected}
                  onEdit={setEditData}
                  onChangePassword={setPasswordFor}
                  onSelectDJ={setSelectDJFor}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Detalhes do Produtor</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelected(null)}><Icon name="X" size={18} /></Button>
              </div>
              <div className="space-y-2">
                <DetailRow label="Nome" value={selected?.name} />
                <DetailRow label="Empresa" value={selected?.company_name} />
                <DetailRow label="Email" value={selected?.email} />
                <DetailRow label="Telefone" value={selected?.phone} />
                <DetailRow label="CNPJ" value={selected?.company_document} />
                <DetailRow label="Cidade" value={selected?.city} />
                <DetailRow label="Estado" value={selected?.state} />
                <DetailRow label="Contato" value={selected?.contact_person} />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Editar Produtor</h2>
                <Button variant="ghost" size="icon" onClick={() => setEditData(null)}><Icon name="X" size={18} /></Button>
              </div>

              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4 p-4 border border-border/60 rounded-lg mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border">
                    {selectedAvatarPreview ? (
                      <img src={selectedAvatarPreview} alt={formData?.name || 'Produtor'} className="w-full h-full object-cover object-center" />
                    ) : formData?.avatar_url || editData?.profile_image_url ? (
                      <img src={formData?.avatar_url || editData?.profile_image_url} alt={formData?.name || 'Produtor'} className="w-full h-full object-cover object-center" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xl font-semibold">
                        {(formData?.name || 'P').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-foreground">Foto do Perfil</div>
                    <div className="flex items-center space-x-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}>
                        <Icon name="Upload" size={14} className="mr-2" />
                        {selectedAvatar ? 'Trocar Foto' : 'Adicionar Foto'}
                      </Button>
                      {selectedAvatar && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedAvatar(null)}>
                          <Icon name="X" size={14} />
                        </Button>
                      )}
                    </div>
                    {selectedAvatar && (
                      <p className="text-sm text-muted-foreground">{selectedAvatar.name}</p>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input value={formData?.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Nome *" />
                <Input value={formData?.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="Email *" type="email" />
                <Input value={formData?.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="Telefone" />
                <Input value={formData?.company_name} onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))} placeholder="Nome da Empresa" />
                <Input value={formData?.company_document} onChange={(e) => setFormData(prev => ({ ...prev, company_document: e.target.value }))} placeholder="CNPJ" />
                <Input value={formData?.contact_person} onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))} placeholder="Pessoa de Contato" />
                <Input value={formData?.city} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} placeholder="Cidade" />
                <Input value={formData?.state} onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))} placeholder="Estado" />
              </div>

              <div className="mt-4">
                <Input value={formData?.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="Endereço" />
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <input id="is_active" type="checkbox" checked={!!formData?.is_active} onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))} />
                <label htmlFor="is_active" className="text-sm text-foreground">Produtor ativo</label>
              </div>

              <div className="space-y-2 mt-4">
                <div className="text-sm text-foreground">Nova Senha (opcional)</div>
                <div className="relative">
                  <Input id="new_password" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha (deixe vazio para manter)" />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditData(null)}>Cancelar</Button>
                <Button onClick={onSaveEdit} disabled={uploadingAvatar}>{uploadingAvatar ? 'Enviando foto...' : 'Salvar Alterações'}</Button>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal (prompt-based simple flow) */}
        {passwordFor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Alterar senha</h2>
                <Button variant="ghost" size="icon" onClick={() => setPasswordFor(null)}><Icon name="X" size={18} /></Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Defina uma nova senha para {passwordFor?.email}. Esta ação pode requerer um endpoint seguro no servidor (service_role) dependendo da sua configuração do Supabase.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPasswordFor(null)}>Cancelar</Button>
                <Button onClick={() => onSubmitPassword(passwordFor)}>Definir nova senha</Button>
              </div>
            </div>
          </div>
        )}

        {/* Select DJ Modal */}
        {selectDJFor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Selecionar DJ para o dashboard</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectDJFor(null)}><Icon name="X" size={18} /></Button>
              </div>
              {loadingDjs ? (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {(djs || []).map((dj) => (
                    <button key={dj?.id} className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted text-left" onClick={() => onSubmitSelectDJ(selectDJFor, dj?.id)}>
                      <span className="text-sm text-foreground">{dj?.name}</span>
                      <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </AdminBackground>
  );
};

export default ProducerManagement;
