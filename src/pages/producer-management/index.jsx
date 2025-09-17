import React, { useState, useEffect, useMemo } from 'react';
import TopBar from '../../components/ui/TopBar';
import RoleSidebar from '../../components/ui/RoleSidebar';
import AdminBackground from '../../components/AdminBackground';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { producerService, djService } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';

const ProducerCard = ({ producer, onView, onEdit, onChangePassword, onSelectDJ }) => {
  const avatar = producer?.profile_image_url || producer?.avatar_url || null;
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
    const { id, ...updates } = editData;
    const result = await producerService.update(id, updates);
    if (result?.error) {
      alert(result.error);
    } else {
      setEditData(null);
      refetchProducers();
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
            <div className="bg-card border border-border rounded-lg w-full max-w-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Editar Produtor</h2>
                <Button variant="ghost" size="icon" onClick={() => setEditData(null)}><Icon name="X" size={18} /></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input value={editData?.name || ''} onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))} placeholder="Nome" />
                <Input value={editData?.company_name || ''} onChange={(e) => setEditData(prev => ({ ...prev, company_name: e.target.value }))} placeholder="Empresa" />
                <Input value={editData?.email || ''} onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))} placeholder="Email" />
                <Input value={editData?.phone || ''} onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))} placeholder="Telefone" />
                <Input value={editData?.company_document || ''} onChange={(e) => setEditData(prev => ({ ...prev, company_document: e.target.value }))} placeholder="CNPJ" />
                <Input value={editData?.city || ''} onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))} placeholder="Cidade" />
                <Input value={editData?.state || ''} onChange={(e) => setEditData(prev => ({ ...prev, state: e.target.value }))} placeholder="Estado" />
                <Input value={editData?.address || ''} onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))} placeholder="Endereço" />
                <Input value={editData?.contact_person || ''} onChange={(e) => setEditData(prev => ({ ...prev, contact_person: e.target.value }))} placeholder="Pessoa de contato" />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditData(null)}>Cancelar</Button>
                <Button onClick={onSaveEdit}>Salvar</Button>
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
