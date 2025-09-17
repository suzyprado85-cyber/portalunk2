import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { eventService, djService, profileService, storageService } from '../services/supabaseService';
import paymentService from '../services/paymentService';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const usePendingPayments = (filters = {}) => {
  const [loading, setLoading] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState([]);

  // Fetch all required data
  const { data: payments, loading: paymentsLoading, refetch: refetchPayments } = useSupabaseData(
    paymentService, 'getAll', [], []
  );
  const { data: events } = useSupabaseData(eventService, 'getAll', [], []);
  const { data: djs } = useSupabaseData(djService, 'getAll', [], []);

  // Filter pending payments based on provided filters
  const filteredPayments = useMemo(() => {
    let filtered = (payments || []).filter(payment => payment?.status === 'pending');

    // Apply DJ filter
    if (filters?.djId) {
      filtered = filtered.filter(payment => payment?.event?.dj?.id === filters.djId);
    }

    // Apply producer filter
    if (filters?.producerId) {
      filtered = filtered.filter(payment => payment?.event?.producer?.id === filters.producerId);
    }

    // Apply date range filter
    if (filters?.startDate) {
      filtered = filtered.filter(payment => 
        new Date(payment?.created_at) >= new Date(filters.startDate)
      );
    }

    if (filters?.endDate) {
      filtered = filtered.filter(payment => 
        new Date(payment?.created_at) <= new Date(filters.endDate)
      );
    }

    // Apply amount range filter
    if (filters?.minAmount) {
      filtered = filtered.filter(payment => 
        parseFloat(payment?.amount || 0) >= parseFloat(filters.minAmount)
      );
    }

    if (filters?.maxAmount) {
      filtered = filtered.filter(payment => 
        parseFloat(payment?.amount || 0) <= parseFloat(filters.maxAmount)
      );
    }

    // Apply search filter
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(payment => 
        payment?.event?.title?.toLowerCase()?.includes(searchTerm) ||
        payment?.event?.dj?.name?.toLowerCase()?.includes(searchTerm) ||
        payment?.event?.producer?.name?.toLowerCase()?.includes(searchTerm) ||
        payment?.event?.producer?.company_name?.toLowerCase()?.includes(searchTerm)
      );
    }

    return filtered;
  }, [
    payments,
    filters?.djId,
    filters?.producerId,
    filters?.startDate,
    filters?.endDate,
    filters?.minAmount,
    filters?.maxAmount,
    filters?.search
  ]);

  // Calculate overdue payments (payments older than 30 days)
  const overduePayments = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return filteredPayments.filter(payment => {
      const paymentDate = new Date(payment?.created_at);
      return paymentDate < thirtyDaysAgo;
    });
  }, [filteredPayments]);

  // Calculate financial statistics
  const financialStats = useMemo(() => {
    const totalPending = filteredPayments.reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);
    const totalOverdue = overduePayments.reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);
    const totalCommission = filteredPayments.reduce((sum, p) => sum + (parseFloat(p?.commission_amount) || 0), 0);
    
    // Group by DJ for distribution analysis
    const djDistribution = {};
    filteredPayments.forEach(payment => {
      const djId = payment?.event?.dj?.id;
      const djName = payment?.event?.dj?.name;
      if (djId && djName) {
        if (!djDistribution[djId]) {
          djDistribution[djId] = {
            djId,
            djName,
            totalAmount: 0,
            paymentCount: 0,
            events: []
          };
        }
        djDistribution[djId].totalAmount += parseFloat(payment?.amount || 0);
        djDistribution[djId].paymentCount += 1;
        djDistribution[djId].events.push(payment?.event?.title);
      }
    });

    // Group by producer for distribution analysis
    const producerDistribution = {};
    filteredPayments.forEach(payment => {
      const producerId = payment?.event?.producer?.id;
      const producerName = payment?.event?.producer?.name || payment?.event?.producer?.company_name;
      if (producerId && producerName) {
        if (!producerDistribution[producerId]) {
          producerDistribution[producerId] = {
            producerId,
            producerName,
            totalAmount: 0,
            paymentCount: 0,
            events: []
          };
        }
        producerDistribution[producerId].totalAmount += parseFloat(payment?.amount || 0);
        producerDistribution[producerId].paymentCount += 1;
        producerDistribution[producerId].events.push(payment?.event?.title);
      }
    });

    return {
      totalPending,
      totalOverdue,
      totalCommission,
      pendingCount: filteredPayments.length,
      overdueCount: overduePayments.length,
      djDistribution: Object.values(djDistribution),
      producerDistribution: Object.values(producerDistribution),
      averagePayment: filteredPayments.length > 0 ? totalPending / filteredPayments.length : 0
    };
  }, [filteredPayments, overduePayments]);

  // Upload payment proof
  const uploadPaymentProof = useCallback(async (paymentId, file, description = '') => {
    if (!paymentId || !file) {
      toast.error('ID do pagamento e arquivo são obrigatórios');
      return { error: 'Parâmetros inválidos' };
    }

    setUploadingProof(true);
    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `payment_${paymentId}_${Date.now()}.${fileExt}`;
      const filePath = `payment-proofs/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await storageService.uploadFile(
        'payment-proofs', 
        filePath, 
        file
      );

      if (uploadError) {
        throw new Error(uploadError);
      }

      // Update payment with proof URL
      const result = await paymentService.updateWithProof(paymentId, uploadData.publicUrl);
      
      if (result?.error) {
        throw new Error(result.error);
      }

      // Refresh payments data
      await refetchPayments();
      
      toast.success('Comprovante enviado com sucesso!');
      return { data: result.data };
    } catch (error) {
      console.error('Erro ao enviar comprovante:', error);
      toast.error('Erro ao enviar comprovante: ' + error.message);
      return { error: error.message };
    } finally {
      setUploadingProof(false);
    }
  }, [refetchPayments]);

  // Mark payment as paid (admin only)
  const markAsPaid = useCallback(async (paymentId) => {
    if (!paymentId) {
      toast.error('ID do pagamento é obrigatório');
      return { error: 'ID inválido' };
    }

    setLoading(true);
    try {
      const result = await paymentService.markAsPaid(paymentId);
      
      if (result?.error) {
        throw new Error(result.error);
      }

      await refetchPayments();
      toast.success('Pagamento marcado como pago!');
      return { data: result.data };
    } catch (error) {
      console.error('Erro ao marcar pagamento como pago:', error);
      toast.error('Erro ao atualizar pagamento: ' + error.message);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  }, [refetchPayments]);

  // Bulk operations
  const bulkMarkAsPaid = useCallback(async (paymentIds) => {
    if (!paymentIds || paymentIds.length === 0) {
      toast.error('Selecione pelo menos um pagamento');
      return { error: 'Nenhum pagamento selecionado' };
    }

    setLoading(true);
    try {
      const results = await Promise.all(
        paymentIds.map(id => paymentService.markAsPaid(id))
      );

      const errors = results.filter(r => r?.error);
      const successes = results.filter(r => !r?.error);

      if (errors.length > 0) {
        toast.error(`${errors.length} pagamentos falharam ao atualizar`);
      }

      if (successes.length > 0) {
        toast.success(`${successes.length} pagamentos marcados como pagos!`);
      }

      await refetchPayments();
      return { 
        data: { 
          successes: successes.length, 
          errors: errors.length 
        } 
      };
    } catch (error) {
      console.error('Erro na operação em lote:', error);
      toast.error('Erro na operação em lote');
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  }, [refetchPayments]);

  // Get overdue notifications
  const getOverdueNotifications = useCallback(() => {
    return overduePayments.map(payment => ({
      id: `overdue_${payment.id}`,
      type: 'payment',
      priority: 'high',
      title: 'Pagamento em Atraso',
      message: `Pagamento para "${payment?.event?.title}" está ${Math.floor((new Date() - new Date(payment?.created_at)) / (1000 * 60 * 60 * 24))} dias em atraso`,
      timestamp: payment?.created_at,
      actionUrl: `/financial-tracking`,
      actionText: 'Ver Detalhes',
      data: payment
    }));
  }, [overduePayments]);

  // Get payments by specific criteria
  const getPaymentsByDJ = useCallback((djId) => {
    return filteredPayments.filter(payment => payment?.event?.dj?.id === djId);
  }, [filteredPayments]);

  const getPaymentsByProducer = useCallback((producerId) => {
    return filteredPayments.filter(payment => payment?.event?.producer?.id === producerId);
  }, [filteredPayments]);

  const getPaymentsByEvent = useCallback((eventId) => {
    return filteredPayments.filter(payment => payment?.event?.id === eventId);
  }, [filteredPayments]);

  // Selection management
  const togglePaymentSelection = useCallback((paymentId) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  }, []);

  const selectAllPayments = useCallback(() => {
    setSelectedPayments(filteredPayments.map(p => p.id));
  }, [filteredPayments]);

  const clearSelection = useCallback(() => {
    setSelectedPayments([]);
  }, []);

  // Export functionality
  const exportPayments = useCallback((paymentIds = null) => {
    const paymentsToExport = paymentIds 
      ? filteredPayments.filter(p => paymentIds.includes(p.id))
      : filteredPayments;

    const csvData = paymentsToExport.map(payment => ({
      'ID': payment.id,
      'Evento': payment?.event?.title || 'N/A',
      'DJ': payment?.event?.dj?.name || 'N/A',
      'Produtor': payment?.event?.producer?.name || payment?.event?.producer?.company_name || 'N/A',
      'Valor': parseFloat(payment?.amount || 0),
      'Comissão': parseFloat(payment?.commission_amount || 0),
      'Status': payment?.status || 'pending',
      'Data Criação': new Date(payment?.created_at).toLocaleDateString('pt-BR'),
      'Data Pagamento': payment?.paid_at ? new Date(payment.paid_at).toLocaleDateString('pt-BR') : 'N/A'
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pagamentos_pendentes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Relatório exportado com sucesso!');
  }, [filteredPayments]);

  // Real-time subscription for payment updates
  useEffect(() => {
    const channel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          console.log('Payment update received:', payload);
          refetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchPayments]);

  return {
    // Data
    payments: filteredPayments,
    overduePayments,
    financialStats,
    selectedPayments,
    
    // Loading states
    loading: paymentsLoading || loading,
    uploadingProof,
    
    // Actions
    uploadPaymentProof,
    markAsPaid,
    bulkMarkAsPaid,
    refetchPayments,
    
    // Filters and queries
    getPaymentsByDJ,
    getPaymentsByProducer,
    getPaymentsByEvent,
    
    // Selection management
    togglePaymentSelection,
    selectAllPayments,
    clearSelection,
    
    // Notifications
    getOverdueNotifications,
    
    // Export
    exportPayments,
    
    // Utilities
    formatCurrency: (amount) => new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount || 0),
    
    formatDate: (date) => new Date(date).toLocaleDateString('pt-BR'),
    
    isOverdue: (payment) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(payment?.created_at) < thirtyDaysAgo;
    }
  };
};

// Specialized hook for producer dashboard
export const useProducerPayments = (producerId) => {
  const filters = useMemo(() => ({ producerId }), [producerId]);
  return usePendingPayments(filters);
};

// Specialized hook for DJ payments
export const useDJPayments = (djId) => {
  const filters = useMemo(() => ({ djId }), [djId]);
  return usePendingPayments(filters);
};

// Hook for financial statistics across all payments
export const useFinancialStats = () => {
  const { data: allPayments } = useSupabaseData(paymentService, 'getAll', [], []);
  
  return useMemo(() => {
    if (!allPayments) return null;

    const totalRevenue = allPayments.reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);
    const paidRevenue = allPayments
      .filter(p => p?.status === 'paid')
      .reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);
    const pendingRevenue = allPayments
      .filter(p => p?.status === 'pending')
      .reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);
    const totalCommission = allPayments.reduce((sum, p) => sum + (parseFloat(p?.commission_amount) || 0), 0);
    
    // Calculate this month's revenue
    const now = new Date();
    const thisMonthRevenue = allPayments
      .filter(p => {
        const paidDate = p?.paid_at ? new Date(p.paid_at) : null;
        return p?.status === 'paid' && 
               paidDate && 
               paidDate.getMonth() === now.getMonth() && 
               paidDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);

    return {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      totalCommission,
      netRevenue: totalRevenue - totalCommission,
      thisMonthRevenue,
      transactionCount: allPayments.length,
      pendingCount: allPayments.filter(p => p?.status === 'pending').length,
      paidCount: allPayments.filter(p => p?.status === 'paid').length,
      overdueCount: allPayments.filter(p => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return p?.status === 'pending' && new Date(p?.created_at) < thirtyDaysAgo;
      }).length
    };
  }, [allPayments]);
};

export default usePendingPayments;
