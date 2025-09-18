import { supabase } from '../lib/supabase';

export const paymentService = {
  // Buscar todos os pagamentos
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          event:events(
            id,
            title,
            event_date,
            location,
            cache_value,
            dj:djs(id, name),
            producer:profiles(id, name, company_name, email)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
        return { error: (error && error.message) ? error.message : (typeof error === 'string' ? error : JSON.stringify(error)) };
      }
      
      return { data: data || [] };
    } catch (error) {
      console.error('Erro de conexão ao buscar pagamentos:', error);
      return { error: 'Erro de conexão' };
    }
  },

  // Buscar pagamentos por produtor
  async getByProducer(producerId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          event:events!inner(
            id,
            title,
            event_date,
            location,
            cache_value,
            producer_id,
            dj:djs(id, name)
          )
        `)
        .eq('event.producer_id', producerId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar pagamentos do produtor:', error);
        return { error: (error && error.message) ? error.message : (typeof error === 'string' ? error : JSON.stringify(error)) };
      }
      
      return { data: data || [] };
    } catch (error) {
      console.error('Erro de conexão ao buscar pagamentos do produtor:', error);
      return { error: 'Erro de conexão' };
    }
  },

  // Buscar pagamentos por DJ
  async getByDJ(djId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          event:events!inner(
            id,
            title,
            event_date,
            location,
            cache_value,
            dj_id,
            producer:profiles(id, name, company_name, email)
          )
        `)
        .eq('event.dj_id', djId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar pagamentos do DJ:', error);
        return { error: (error && error.message) ? error.message : (typeof error === 'string' ? error : JSON.stringify(error)) };
      }
      
      return { data: data || [] };
    } catch (error) {
      console.error('Erro de conexão ao buscar pagamentos do DJ:', error);
      return { error: 'Erro de conexão' };
    }
  },

  // Atualizar pagamento com comprovante
  async updateWithProof(paymentId, proofUrl) {
    try {
      // 1. Atualizar pagamento com URL do comprovante
      const { data, error } = await supabase
        .from('payments')
        .update({
          payment_proof_url: proofUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select(`
          *,
          event:events(
            id,
            title,
            cache_value
          )
        `)
        .single();
      
      if (error) {
        console.error('Erro ao atualizar pagamento:', error);
        return { error: (error && error.message) ? error.message : (typeof error === 'string' ? error : JSON.stringify(error)) };
      }

      // 2. Chamar edge function para verificação automática
      try {
        const { data: verificationData } = await supabase.functions.invoke('verify-payment-proof', {
          body: {
            paymentId,
            proofUrl,
            expectedAmount: data.amount,
            expectedCnpj: '59839507000186'
          }
        });

        console.log('Resultado da verificação:', verificationData);
      } catch (verificationError) {
        console.warn('Verificação automática falhou, mas comprovante foi salvo:', verificationError);
      }
      
      return { data };
    } catch (error) {
      console.error('Erro de conexão ao atualizar pagamento:', error);
      return { error: 'Erro de conexão' };
    }
  },

  // Confirmar pagamento com método, data e comprovante
  async confirmPayment(paymentId, { payment_method, paid_at, proofUrl }) {
    try {
      const updates = {
        status: 'paid',
        payment_method: payment_method || null,
        paid_at: paid_at || new Date().toISOString(),
        payment_proof_url: proofUrl || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao confirmar pagamento:', error);
        return { error: (error && error.message) ? error.message : (typeof error === 'string' ? error : JSON.stringify(error)) };
      }

      return { data };
    } catch (error) {
      console.error('Erro de conexão ao confirmar pagamento:', error);
      return { error: 'Erro de conexão' };
    }
  },

  // Marcar pagamento como pago manualmente (admin)
  async markAsPaid(paymentId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao marcar pagamento como pago:', error);
        return { error: (error && error.message) ? error.message : (typeof error === 'string' ? error : JSON.stringify(error)) };
      }
      
      return { data };
    } catch (error) {
      console.error('Erro de conexão ao marcar pagamento como pago:', error);
      return { error: 'Erro de conexão' };
    }
  },

  // Buscar pagamentos pendentes para um DJ específico
  async getPendingByDJ(djId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          event:events!inner(
            id,
            title,
            event_date,
            location,
            cache_value,
            dj_id,
            producer:profiles(id, name, company_name, email)
          )
        `)
        .eq('event.dj_id', djId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar pagamentos pendentes do DJ:', error);
        return { error: (error && error.message) ? error.message : (typeof error === 'string' ? error : JSON.stringify(error)) };
      }
      
      return { data: data || [] };
    } catch (error) {
      console.error('Erro de conexão ao buscar pagamentos pendentes do DJ:', error);
      return { error: 'Erro de conexão' };
    }
  },

  // Calcular métricas financeiras
  async getFinancialMetrics(producerId = null) {
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          event:events(
            id,
            title,
            producer_id,
            dj:djs(id, name)
          )
        `);

      if (producerId) {
        query = query.eq('event.producer_id', producerId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar métricas financeiras:', error);
        return { error: (error && error.message) ? error.message : (typeof error === 'string' ? error : JSON.stringify(error)) };
      }

      const payments = data || [];
      
      const metrics = {
        totalRevenue: payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
        pendingPayments: payments
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
        paidThisMonth: payments
          .filter(p => {
            const paidDate = p.paid_at ? new Date(p.paid_at) : null;
            const now = new Date();
            return p.status === 'paid' && 
                   paidDate && 
                   paidDate.getMonth() === now.getMonth() && 
                   paidDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
        overdueAmount: payments
          .filter(p => p.status === 'overdue')
          .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
        totalCommission: payments.reduce((sum, p) => sum + (parseFloat(p.commission_amount) || 0), 0),
        pendingCount: payments.filter(p => p.status === 'pending').length,
        paidCount: payments.filter(p => p.status === 'paid').length
      };
      
      return { data: metrics };
    } catch (error) {
      console.error('Erro de conexão ao buscar métricas financeiras:', error);
      return { error: 'Erro de conexão' };
    }
  },

  // Excluir pagamento
  async delete(paymentId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao excluir pagamento:', error);
        return { error: (error && error.message) ? error.message : (typeof error === 'string' ? error : JSON.stringify(error)) };
      }

      return { data };
    } catch (error) {
      console.error('Erro de conexão ao excluir pagamento:', error);
      return { error: 'Erro de conexão' };
    }
  }
};

export default paymentService;
