import { supabase } from '../lib/supabase';
import djServiceModule from './djService.js';
import mediaServiceModule from './mediaService.js';
import producerServiceModule from './producerService.js';

// Helper function to handle errors
const toMessage = (err) => {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  if (typeof err.message === 'string' && err.message) return err.message;
  if (typeof err.error_description === 'string') return err.error_description;
  if (typeof err.details === 'string' && err.details) return err.details;
  try { return JSON.stringify(err); } catch { return String(err); }
};
const handleError = (error, context) => {
  console.error(`${context}:`, toMessage(error));
  return { error: toMessage(error) };
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

// ========================
// DJ SERVICES (Legacy - use djService.js)
// ========================

const djServiceLegacy = {
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
      
      // Criar pastas no bucket dj-media para o novo DJ
      if (data?.id && data?.name) {
        const djFolderName = data.name.toLowerCase().replace(/\s+/g, '-');
        const folders = ['logo', 'presskit', 'backdrop'];
        
        // Criar pastas no storage (cada pasta será criada quando o primeiro arquivo for enviado)
        // Por enquanto, apenas logamos a estrutura que será criada
        console.log(`Estrutura de pastas criada para DJ ${data.name}:`, folders.map(f => `${djFolderName}/${f}`));
      }
      
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
      return { data };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao atualizar DJ');
    }
  },

  // Delete DJ
  async delete(id) {
    try {
      const adminErr = await ensureAdmin();
      if (adminErr) return adminErr;

      const { error } = await supabase?.from('djs')?.update({ is_active: false })?.eq('id', id);
      
      if (error) return handleError(error, 'Erro ao desativar DJ');
      return { success: true };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao desativar DJ');
    }
  }
};

// ========================
// EVENT SERVICES
// ========================

export const eventService = {
  // Get all events
  async getAll() {
    try {
      const { data, error } = await supabase?.from('events')?.select(`
          *,
          dj:djs(id, name, profile_image_url, is_active),
          producer:profiles(id, name, company_name)
        `)?.order('event_date', { ascending: false });
      
      if (error) return handleError(error, 'Erro ao carregar eventos');
      return { data: data || [] };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao carregar eventos');
    }
  },

  // Get events by producer
  async getByProducer(producerId) {
    try {
      const { data, error } = await supabase?.from('events')?.select(`
          *,
          dj:djs(id, name, profile_image_url),
          producer:profiles(id, name, company_name)
        `)?.eq('producer_id', producerId)?.order('event_date', { ascending: false });
      
      if (error) return handleError(error, 'Erro ao carregar eventos do produtor');
      return { data: data || [] };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao carregar eventos do produtor');
    }
  },

  // Create new event
  async create(eventData) {
    try {
      const attemptInsert = async (payload) => {
        const { data, error } = await supabase?.from('events')?.insert(payload)?.select(`
          *,
          dj:djs(id, name, profile_image_url),
          producer:profiles(id, name, company_name)
        `)?.single();
        return { data, error };
      };

      // First attempt
      let { data, error } = await attemptInsert(eventData);

      // If error indicates missing column(s), try to remove them and retry once
      if (error && typeof error.message === 'string') {
        const missingColMatch = error.message.match(/Could not find the '([^']+)' column/);
        if (missingColMatch) {
          const missingCol = missingColMatch[1];
          console.warn(`Coluna ausente detectada ao criar evento: ${missingCol}. Tentando novamente sem esse campo.`);
          const cleaned = { ...eventData };
          delete cleaned[missingCol];
          const retry = await attemptInsert(cleaned);
          if (retry.error) return handleError(retry.error, 'Erro ao criar evento');
          return { data: retry.data };
        }
        return handleError(error, 'Erro ao criar evento');
      }

      return { data };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao criar evento');
    }
  },

  // Update event
  async update(id, updates) {
    try {
      const attemptUpdate = async (payload) => {
        const { data, error } = await supabase?.from('events')?.update(payload)?.eq('id', id)?.select(`
          *,
          dj:djs(id, name, profile_image_url),
          producer:profiles(id, name, company_name)
        `)?.single();
        return { data, error };
      };

      // First attempt
      let { data, error } = await attemptUpdate(updates);

      // If error indicates missing column(s), try to remove them and retry once
      if (error && typeof error.message === 'string') {
        const missingColMatch = error.message.match(/Could not find the '([^']+)' column/);
        if (missingColMatch) {
          const missingCol = missingColMatch[1];
          console.warn(`Coluna ausente detectada ao atualizar evento: ${missingCol}. Tentando novamente sem esse campo.`);
          const cleaned = { ...updates };
          delete cleaned[missingCol];
          const retry = await attemptUpdate(cleaned);
          if (retry.error) return handleError(retry.error, 'Erro ao atualizar evento');
          return { data: retry.data };
        }
        return handleError(error, 'Erro ao atualizar evento');
      }

      return { data };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao atualizar evento');
    }
  }
};

// ========================
// CONTRACT SERVICES
// ========================

export const contractService = {
  // Get all contracts
  async getAll() {
    try {
      const { data, error } = await supabase?.from('contracts')?.select(`
          *,
          event:events(id, title, event_date, location),
          producer:profiles(id, name, company_name)
        `)?.order('created_at', { ascending: false });
      
      if (error) return handleError(error, 'Erro ao carregar contratos');
      return { data: data || [] };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao carregar contratos');
    }
  },

  // Get contracts by producer
  async getByProducer(producerId) {
    try {
      const { data, error } = await supabase?.from('contracts')?.select(`
          *,
          event:events(id, title, event_date, location, dj:djs(name))
        `)?.eq('event.producer_id', producerId)?.order('created_at', { ascending: false });
      
      if (error) return handleError(error, 'Erro ao carregar contratos do produtor');
      return { data: data || [] };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao carregar contratos do produtor');
    }
  },

  // Sign contract
  async sign(contractId, signatureData) {
    try {
      const { data, error } = await supabase?.from('contracts')?.update({
          signed: true,
          signed_at: new Date()?.toISOString(),
          signature_status: 'signed',
          signed_by_producer_at: new Date()?.toISOString(),
          ...signatureData
        })?.eq('id', contractId)?.select()?.single();
      
      if (error) return handleError(error, 'Erro ao assinar contrato');
      return { data };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao assinar contrato');
    }
  }
};

// ========================
// PAYMENT SERVICES
// ========================

// Import the enhanced payment service
import paymentServiceModule from './paymentService.js';
export const paymentService = paymentServiceModule;

// ========================
// USER PROFILE SERVICES
// ========================

export const profileService = {
  // Get user profile
  async getByUserId(userId) {
    try {
      const { data, error } = await supabase?.from('profiles')?.select('*')?.eq('user_id', userId)?.single();
      
      if (error) return handleError(error, 'Erro ao carregar perfil');
      return { data };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao carregar perfil');
    }
  },

  // Update user profile
  async update(userId, updates) {
    try {
      const { data, error } = await supabase?.from('profiles')?.update(updates)?.eq('user_id', userId)?.select()?.single();
      
      if (error) return handleError(error, 'Erro ao atualizar perfil');
      return { data };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao atualizar perfil');
    }
  }
};

// ========================
// STORAGE SERVICES
// ========================

export const storageService = {
  // Upload file to storage
  async uploadFile(bucket, path, file) {
    try {
      const { data, error } = await supabase?.storage?.from(bucket)?.upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) return handleError(error, 'Erro ao fazer upload do arquivo');
      
      // Get public URL
      const { data: { publicUrl } } = supabase?.storage?.from(bucket)?.getPublicUrl(data?.path);
      
      return { data: { ...data, publicUrl } };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao fazer upload');
    }
  },

  // Delete file from storage
  async deleteFile(bucket, path) {
    try {
      const { error } = await supabase?.storage?.from(bucket)?.remove([path]);
      
      if (error) return handleError(error, 'Erro ao deletar arquivo');
      return { success: true };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao deletar arquivo');
    }
  }
};

// Extra storage helpers
storageService.listFiles = async (bucket, path) => {
  try {
    const { data, error } = await supabase?.storage?.from(bucket)?.list(path, { limit: 100 });
    if (error) return handleError(error, 'Erro ao listar arquivos');
    return { data: data || [] };
  } catch (error) {
    return handleError(error, 'Erro de conexão ao listar arquivos');
  }
};

storageService.getPublicUrl = (bucket, path) => {
  const { data } = supabase?.storage?.from(bucket)?.getPublicUrl(path);
  return data?.publicUrl;
};

// Upload a JSON metadata file alongside media
storageService.uploadJson = async (bucket, path, obj) => {
  try {
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
    const { data, error } = await supabase?.storage?.from(bucket)?.upload(path, blob, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'application/json'
    });
    if (error) return handleError(error, 'Erro ao enviar metadata JSON');
    return { data };
  } catch (error) {
    return handleError(error, 'Erro de conexão ao enviar metadata JSON');
  }
};

// Download a text file from storage (used for JSON metadata)
storageService.downloadText = async (bucket, path) => {
  try {
    const { data, error } = await supabase?.storage?.from(bucket)?.download(path);
    if (error) return null; // Se não existir, retornamos null silenciosamente
    const text = await data?.text?.();
    return text || null;
  } catch {
    return null;
  }
};

// ========================
// REAL-TIME SUBSCRIPTIONS
// ========================

export const realtimeService = {
  // Subscribe to table changes
  subscribeToTable(table, callback) {
    const channel = supabase?.channel(`${table}-changes`)?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          callback?.(payload);
        }
      )?.subscribe();

    return channel;
  },

  // Unsubscribe from channel
  unsubscribe(channel) {
    if (channel) {
      supabase?.removeChannel(channel);
    }
  }
};

// ========================
// ANALYTICS SERVICES
// ========================

export const analyticsService = {
  // Get dashboard metrics
  async getDashboardMetrics() {
    try {
      const [djsResult, eventsResult, paymentsResult, contractsResult] = await Promise.all([
        supabase?.from('djs')?.select('id', { count: 'exact' })?.eq('is_active', true),
        supabase?.from('events')?.select('id', { count: 'exact' })?.neq('status', 'cancelled'),
        supabase?.from('payments')?.select('amount'),
        supabase?.from('contracts')?.select('id', { count: 'exact' })?.eq('signed', false)
      ]);

      // Calculate total revenue
      const totalRevenue = paymentsResult?.data?.reduce((sum, payment) => 
        sum + (parseFloat(payment?.amount) || 0), 0) || 0;

      return {
        data: {
          totalDJs: djsResult?.count || 0,
          totalEvents: eventsResult?.count || 0,
          totalRevenue,
          pendingContracts: contractsResult?.count || 0
        }
      };
    } catch (error) {
      return handleError(error, 'Erro ao carregar métricas');
    }
  },

  // Get monthly revenue data
  async getMonthlyRevenue() {
    try {
      const { data, error } = await supabase?.rpc('get_monthly_revenue'); // Custom function if exists
      
      if (error) return handleError(error, 'Erro ao carregar receita mensal');
      return { data: data || [] };
    } catch (error) {
      return handleError(error, 'Erro de conexão ao carregar receita mensal');
    }
  }
};

// Producer Service
export const producerService = producerServiceModule;

// ========================
// MEDIA SERVICES
// ========================

export const mediaService = mediaServiceModule;

export const djService = djServiceModule;

export default {
  dj: djServiceModule,
  event: eventService,
  contract: contractService,
  payment: paymentService,
  profile: profileService,
  producer: producerServiceModule,
  media: mediaServiceModule,
  storage: storageService,
  realtime: realtimeService,
  analytics: analyticsService
};
