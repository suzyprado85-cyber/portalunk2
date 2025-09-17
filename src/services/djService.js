import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Helper function to handle errors
const handleError = (error, context) => {
  console.error(`${context}:`, error);
  return { error: error?.message || 'Erro inesperado' };
};

// Ensure current user has admin role
const ensureAdmin = async () => {
  try {
    const { data: { user } = {} } = await supabase?.auth?.getUser();
    if (!user) return { error: 'Usuário não autenticado' };

    const { data: profile, error } = await supabase?.from('profiles')?.select('role')?.eq('user_id', user.id)?.single();
    if (error) return { error: 'Falha ao carregar perfil do usuário' };
    if (profile?.role !== 'admin') return { error: 'Ação permitida apenas para administradores' };
    return null;
  } catch {
    return { error: 'Falha ao validar privilégios do usuário' };
  }
};

export const djService = {
  // Get all DJs (active and inactive)
  async getAll() {
    try {
      console.log('🔍 Buscando DJs no Supabase...');
      const { data, error } = await supabase?.from('djs')?.select('*')?.order('name');
      
      if (error) {
        console.error('❌ Erro ao buscar DJs:', error);
        return handleError(error, 'Erro ao carregar DJs');
      }
      
      console.log('✅ DJs encontrados:', data?.length || 0, data);
      return { data: data || [] };
    } catch (error) {
      console.error('❌ Erro de conexão ao buscar DJs:', error);
      return handleError(error, 'Erro de conexão ao carregar DJs');
    }
  },

  // Get DJ by ID
  async getById(id) {
    try {
      const { data, error } = await supabase?.from('djs')?.select('*')?.eq('id', id)?.single();
      
      if (error) return handleError(error, 'Erro ao carregar DJ');
      return { data };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao carregar DJ');
    }
  },

  // Create new DJ
  async create(djData) {
    try {
      const adminErr = await ensureAdmin();
      if (adminErr) return adminErr;

      const { data, error } = await supabase?.from('djs')?.insert(djData)?.select()?.single();
      
      if (error) return handleError(error, 'Erro ao criar DJ');
      
      console.log(`✅ DJ criado com sucesso: ${data.name}`);
      toast.success('DJ criado com sucesso!');
      return { data };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao criar DJ');
    }
  },

  // Update DJ
  async update(id, updates) {
    try {
      const adminErr = await ensureAdmin();
      if (adminErr) return adminErr;

      const { data, error } = await supabase?.from('djs')?.update(updates)?.eq('id', id)?.select()?.single();
      
      if (error) return handleError(error, 'Erro ao atualizar DJ');
      
      console.log(`✅ DJ atualizado com sucesso: ${data.name}`);
      toast.success('DJ atualizado com sucesso!');
      return { data };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao atualizar DJ');
    }
  },

  // Delete DJ (soft delete)
  async delete(id) {
    try {
      const adminErr = await ensureAdmin();
      if (adminErr) return adminErr;

      const { error } = await supabase?.from('djs')?.update({ is_active: false })?.eq('id', id);
      
      if (error) return handleError(error, 'Erro ao desativar DJ');
      
      console.log(`✅ DJ desativado com sucesso`);
      toast.success('DJ desativado com sucesso!');
      return { success: true };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao desativar DJ');
    }
  },

  // Get DJ statistics
  async getStatistics(djId) {
    try {
      const [eventsResult, paymentsResult, contractsResult] = await Promise.all([
        supabase?.from('events')?.select('id, cache_value, status')?.eq('dj_id', djId),
        supabase?.from('payments')?.select('amount, status')?.eq('event.dj_id', djId),
        supabase?.from('contracts')?.select('id, signed')?.eq('event.dj_id', djId)
      ]);

      const events = eventsResult?.data || [];
      const payments = paymentsResult?.data || [];
      const contracts = contractsResult?.data || [];

      const totalRevenue = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      const stats = {
        totalEvents: events.length,
        completedEvents: events.filter(e => e.status === 'completed').length,
        totalRevenue,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        signedContracts: contracts.filter(c => c.signed).length,
        averageEventValue: events.length > 0 ? 
          events.reduce((sum, e) => sum + (parseFloat(e.cache_value) || 0), 0) / events.length : 0
      };

      return { data: stats };
    } catch (error) {
      return handleError(error, 'Erro ao carregar estatísticas do DJ');
    }
  },

  // Upload DJ profile image
  async uploadProfileImage(djId, file) {
    try {
      const adminErr = await ensureAdmin();
      if (adminErr) return adminErr;

      const fileExt = file.name.split('.').pop();
      const fileName = `${djId}_profile_${Date.now()}.${fileExt}`;
      const filePath = `dj-profiles/${fileName}`;

      const { data, error } = await supabase?.storage?.from('dj-media')?.upload(filePath, file);

      if (error) return handleError(error, 'Erro ao fazer upload da imagem');

      const { data: { publicUrl } } = supabase?.storage?.from('dj-media')?.getPublicUrl(filePath);

      // Update DJ with new profile image URL
      const { error: updateError } = await supabase?.from('djs')?.update({ 
        profile_image_url: publicUrl 
      })?.eq('id', djId);

      if (updateError) return handleError(updateError, 'Erro ao atualizar imagem do perfil');

      toast.success('Imagem do perfil atualizada com sucesso!');
      return { data: { url: publicUrl } };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao fazer upload');
    }
  }
};

export default djService;