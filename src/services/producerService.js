import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { storageService } from './supabaseService';

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

export const producerService = {
  // Create new producer with authentication
  async create(producerData, password) {
    try {
      const adminErr = await ensureAdmin();
      if (adminErr) return adminErr;

      // Sign up user via client-side auth
      const { data: authData, error: authError } = await supabase?.auth?.signUp({
        email: producerData.email,
        password: password
      });

      if (authError) {
        const msg = authError?.message || String(authError);
        if (/already registered|already exists|user exists/i.test(msg)) {
          return handleError(new Error('Usuário já registrado. Peça para o usuário redefinir a senha ou use a conta existente.'), 'Erro ao criar usuário');
        }
        return handleError(authError, 'Erro ao criar usuário');
      }

      const userId = authData?.user?.id;
      if (!userId) {
        return handleError(new Error('Não foi possível obter ID do usuário após cadastro'), 'Erro ao criar usuário');
      }

      // Create the producer profile
      const { data, error } = await supabase?.from('profiles')?.insert({
        user_id: userId,
        name: producerData.name,
        email: producerData.email,
        phone: producerData.phone,
        company_name: producerData.company_name,
        company_document: producerData.company_document,
        address: producerData.address,
        city: producerData.city,
        state: producerData.state,
        contact_person: producerData.contact_person,
        role: 'producer',
        created_at: new Date().toISOString()
      })?.select()?.single();

      if (error) {
        console.error('Erro ao criar perfil do produtor:', error);
        return handleError(error, 'Erro ao criar perfil do produtor');
      }

      toast.success('Produtor criado com sucesso!');
      return {
        data: {
          producer: data,
          credentials: {
            email: producerData.email,
            password: password
          }
        }
      };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao criar produtor');
    }
  },

  // Get all producers
  async getAll() {
    try {
      console.log('🔍 Buscando produtores no Supabase...');
      const { data, error } = await supabase?.from('profiles')?.select('*')?.eq('role', 'producer')?.order('name');
      
      if (error) {
        console.error('❌ Erro ao buscar produtores:', error);
        return handleError(error, 'Erro ao carregar produtores');
      }
      
      console.log('✅ Produtores encontrados:', data?.length || 0);
      return { data: data || [] };
    } catch (error) {
      console.error('❌ Erro de conexão ao buscar produtores:', error);
      return handleError(error, 'Erro de conexão ao carregar produtores');
    }
  },

  // Get producer by ID
  async getById(id) {
    try {
      const { data, error } = await supabase?.from('profiles')?.select('*')?.eq('id', id)?.eq('role', 'producer')?.single();
      
      if (error) return handleError(error, 'Erro ao carregar produtor');
      return { data };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao carregar produtor');
    }
  },

  // Update producer
  async update(id, updates) {
    try {
      const adminErr = await ensureAdmin();
      if (adminErr) return adminErr;

      const { data, error } = await supabase?.from('profiles')?.update(updates)?.eq('id', id)?.eq('role', 'producer')?.select()?.single();
      
      if (error) return handleError(error, 'Erro ao atualizar produtor');
      
      toast.success('Produtor atualizado com sucesso!');
      return { data };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao atualizar produtor');
    }
  },

  // Delete producer
  async delete(id) {
    try {
      const adminErr = await ensureAdmin();
      if (adminErr) return adminErr;

      // Get the user_id first
      const { data: producer } = await this.getById(id);
      if (!producer?.data?.user_id) {
        return handleError(null, 'Produtor não encontrado');
      }

      // Delete the profile
      const { error: profileError } = await supabase?.from('profiles')?.delete()?.eq('id', id);
      if (profileError) {
        return handleError(profileError, 'Erro ao deletar perfil do produtor');
      }

      toast.success('Produtor deletado com sucesso!');
      return { data: { success: true } };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao deletar produtor');
    }
  },

  // Set featured DJ for producer's dashboard
  async setDashboardDJ(producerId, djId) {
    try {
      const adminErr = await ensureAdmin();
      if (adminErr) return adminErr;

      const { error } = await supabase?.from('profiles')?.update({ dashboard_dj_id: djId })?.eq('id', producerId);
      if (error) {
        return handleError(error, 'Erro ao definir DJ do dashboard');
      }
      
      toast.success('DJ definido para o dashboard do produtor!');
      return { data: { success: true } };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao definir DJ do dashboard');
    }
  },

  // Upload avatar
  async uploadAvatar(producerId, file) {
    try {
      if (!file) return { error: 'Nenhum arquivo selecionado' };
      const fileExt = file.name.split('.').pop();
      const fileName = `${producerId}-${Date.now()}.${fileExt}`;
      const filePath = `producers/${fileName}`;

      // Bucket dedicado para produtores (conforme solicitado)
      const bucket = 'producer-avatar';
      const uploadRes = await storageService.uploadFile(bucket, filePath, file);
      if (uploadRes?.error) {
        const msg = typeof uploadRes.error === 'string' ? uploadRes.error : (uploadRes.error?.message || 'Falha no upload');
        return { error: msg };
      }

      const publicUrl = uploadRes?.data?.publicUrl;
      if (!publicUrl) return { error: 'Não foi possível obter URL pública do avatar' };

      // Update profile with avatar URL
      const { error: updateError } = await supabase?.from('profiles')?.update({
        profile_image_url: publicUrl
      })?.eq('id', producerId);

      if (updateError) {
        const msg = updateError?.message || 'Erro ao atualizar avatar';
        return { error: msg };
      }

      toast.success('Avatar atualizado com sucesso!');
      return { data: { url: publicUrl } };
    } catch (error) {
      const msg = error?.message || 'Erro de conexão ao fazer upload';
      return { error: msg };
    }
  },

  // Change producer password via Edge Function
  async changePassword(email, newPassword) {
    try {
      if (!email || !newPassword) return { error: 'Email e nova senha são obrigatórios' };

      // Resolve user_id from profiles by email
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .single();
      if (profileErr || !profile?.user_id) {
        return { error: 'Usuário não encontrado para o email informado' };
      }

      const { data: resp, error } = await supabase.functions.invoke('update-user-password', {
        body: { userId: profile.user_id, newPassword }
      });

      if (error || resp?.error) {
        return { error: error?.message || resp?.error || 'Erro ao atualizar senha' };
      }

      toast.success('Senha atualizada com sucesso!');
      return { data: { success: true } };
    } catch (error) {
      return handleError(error, 'Erro ao alterar senha');
    }
  },

  // Generate random password
  async generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  },

  // Get producer statistics
  async getStatistics(producerId) {
    try {
      const [eventsResult, paymentsResult, contractsResult] = await Promise.all([
        supabase?.from('events')?.select('id, cache_value, status')?.eq('producer_id', producerId),
        supabase?.from('payments')?.select('amount, status')?.eq('event.producer_id', producerId),
        supabase?.from('contracts')?.select('id, signed')?.eq('event.producer_id', producerId)
      ]);

      const events = eventsResult?.data || [];
      const payments = paymentsResult?.data || [];
      const contracts = contractsResult?.data || [];

      const totalSpent = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      const stats = {
        totalEvents: events.length,
        upcomingEvents: events.filter(e => new Date(e.event_date) > new Date()).length,
        totalSpent,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        signedContracts: contracts.filter(c => c.signed).length,
        averageEventCost: events.length > 0 ? 
          events.reduce((sum, e) => sum + (parseFloat(e.cache_value) || 0), 0) / events.length : 0
      };

      return { data: stats };
    } catch (error) {
      return handleError(error, 'Erro ao carregar estatísticas do produtor');
    }
  }
};

export default producerService;
