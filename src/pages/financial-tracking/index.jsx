import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSidebar from '../../components/ui/RoleSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import FinancialSummaryWidget from './components/FinancialSummaryWidget';
import TransactionTable from './components/TransactionTable';
import FinancialFilters from './components/FinancialFilters';
import PaymentUploadModal from './components/PaymentUploadModal';
import TransactionDetailsModal from './components/TransactionDetailsModal';
import TopBar from '../../components/ui/TopBar';
import AdminBackground from '../../components/AdminBackground';
import { useFinancialStats, usePendingPayments } from '../../hooks/usePendingPayments';

const FinancialTracking = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userRole] = useState('admin');
  const [isSidebarHover, setIsSidebarHover] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  
  // Use the financial hooks
  const financialStats = useFinancialStats();
  const { 
    payments, 
    exportPayments,
    formatCurrency 
  } = usePendingPayments();

  // Transform payments data to transaction format
  const transactions = useMemo(() => {
    return (payments || [])?.map(payment => ({
      id: payment?.id,
      date: payment?.created_at,
      eventName: payment?.event?.title || 'N/A',
      eventType: payment?.event?.type || 'N/A',
      eventDate: payment?.event?.event_date,
      eventLocation: payment?.event?.location || 'N/A',
      djName: payment?.event?.dj?.name || 'N/A',
      djEmail: payment?.event?.dj?.email || 'N/A',
      producerName: payment?.event?.producer?.name || payment?.event?.producer?.company_name || 'N/A',
      producerEmail: payment?.event?.producer?.email || 'N/A',
      totalAmount: parseFloat(payment?.amount || 0),
      distribution: {
        unkCommission: parseFloat(payment?.amount || 0) * 0.1, // 10% comissão UNK
        djNet: parseFloat(payment?.amount || 0) * 0.9,        // 90% valor líquido para DJ
        producer: 0 // Produtor não recebe nada, ele é quem paga
      },
      status: payment?.status || 'pending',
      paymentMethod: payment?.payment_method || 'N/A',
      dueDate: payment?.due_date,
      paidDate: payment?.paid_at,
      reference: payment?.reference || `TXN-${payment?.id}`,
      contractId: payment?.contract_id || 'N/A',
      contractStatus: payment?.contract?.signed ? 'Assinado' : 'Pendente',
      updatedAt: payment?.updated_at || payment?.created_at,
      attachments: payment?.attachments || []
    }));
  }, [payments]);

  // Calculate summary data
  const calculateSummaryData = (transactions) => {
    const totalRevenue = transactions?.reduce((sum, t) => sum + t?.totalAmount, 0);
    const pendingPayments = transactions?.filter(t => t?.status === 'pending' || t?.status === 'processing')?.reduce((sum, t) => sum + t?.totalAmount, 0);
    const paidThisMonth = transactions?.filter(t => t?.status === 'paid' && new Date(t.paidDate)?.getMonth() === new Date()?.getMonth())?.reduce((sum, t) => sum + t?.totalAmount, 0);
    const overdueAmount = transactions?.filter(t => t?.status === 'overdue')?.reduce((sum, t) => sum + t?.totalAmount, 0);

    return {
      totalRevenue,
      pendingPayments,
      paidThisMonth,
      overdueAmount,
      totalTransactions: transactions?.length,
      unkCommission: transactions?.reduce((sum, t) => sum + t?.distribution?.unkCommission, 0),
      djNet: transactions?.reduce((sum, t) => sum + t?.distribution?.djNet, 0),
      producerShare: 0 // Produtor não recebe nada, ele é quem paga
    };
  };

  const summaryData = calculateSummaryData(filteredTransactions?.length > 0 ? filteredTransactions : transactions);




  useEffect(() => {
    // Set initial filtered transactions
    setFilteredTransactions(transactions);
    setLoading(false);
  }, [transactions]);

  const handleFiltersChange = (filters) => {
    let filtered = [...transactions];

    // Apply date filters
    if (filters?.dateFrom) {
      filtered = filtered?.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    }
    if (filters?.dateTo) {
      filtered = filtered?.filter(t => new Date(t.date) <= new Date(filters.dateTo));
    }

    // Apply status filter
    if (filters?.status) {
      filtered = filtered?.filter(t => t?.status === filters?.status);
    }

    // Apply transaction type filter
    if (filters?.transactionType) {
      filtered = filtered?.filter(t => t?.eventType?.toLowerCase()?.includes(filters?.transactionType?.toLowerCase()));
    }

    // Apply amount filters
    if (filters?.minAmount) {
      filtered = filtered?.filter(t => t?.totalAmount >= parseFloat(filters?.minAmount));
    }
    if (filters?.maxAmount) {
      filtered = filtered?.filter(t => t?.totalAmount <= parseFloat(filters?.maxAmount));
    }

    setFilteredTransactions(filtered);
  };

  const handleClearFilters = () => {
    setFilteredTransactions(transactions);
  };

  const handleExport = () => {
    // Simulate export functionality
    console.log('Exporting financial data...');
    // In a real app, this would generate and download a CSV/Excel file
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailsModalOpen(true);
  };

  const handleProcessPayment = (transactionIds) => {
    console.log('Processing payments for:', transactionIds);
    // In a real app, this would update transaction statuses
  };

  const handleUploadReceipt = (transactionIds) => {
    setSelectedTransactionIds(transactionIds);
    setUploadModalOpen(true);
  };

  const handleUploadComplete = (uploadedFiles) => {
    console.log('Upload completed:', uploadedFiles);
    // In a real app, this would update the transactions with the uploaded files
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleSidebar
          userRole={userRole}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onHoverChange={setIsSidebarHover}
        />
        <main className={`transition-all duration-300 ${sidebarCollapsed ? (isSidebarHover ? 'ml-60' : 'ml-16') : 'ml-60'}`}>
          <TopBar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <div className="flex items-center justify-center h-[calc(100vh-4rem)] p-6">
            <div className="text-center">
              <Icon name="Loader" size={48} className="animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando dados financeiros...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <AdminBackground>
      <div className="min-h-screen">
        <RoleSidebar
          userRole={userRole}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onHoverChange={setIsSidebarHover}
        />
        <main className={`transition-all duration-300 ${sidebarCollapsed ? (isSidebarHover ? 'ml-60' : 'ml-16') : 'ml-60'} pb-16 md:pb-0`}>
        <TopBar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        {/* Header */}
        <div className="bg-card border-b border-border p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <BreadcrumbTrail />
              <div className="flex items-center space-x-3 mt-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-transparent">
                  <Icon name="DollarSign" size={24} className="text-success" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Rastreamento Financeiro</h1>
                  <p className="text-muted-foreground">
                    Gerencie transações e distribuições de pagamentos
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                iconName="Plus"
                iconPosition="left"
                onClick={() => navigate('/contract-management')}
              >
                Nova Transação
              </Button>
              <Button
                variant="default"
                iconName="Download"
                iconPosition="left"
                onClick={handleExport}
              >
                Exportar Relatório
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Summary Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {financialStats && (
              <>
                <FinancialSummaryWidget
                  title="Receita Total"
                  value={formatCurrency(financialStats.totalRevenue)}
                  change="+12.5%"
                  changeType="positive"
                  icon="TrendingUp"
                  color="success"
                />
                <FinancialSummaryWidget
                  title="Pagamentos Pendentes"
                  value={formatCurrency(financialStats.pendingRevenue)}
                  change={`${financialStats.pendingCount} pendentes`}
                  changeType="neutral"
                  icon="Clock"
                  color="warning"
                />
                <FinancialSummaryWidget
                  title="Pago Este Mês"
                  value={formatCurrency(financialStats.thisMonthRevenue)}
                  change="+8.7%"
                  changeType="positive"
                  icon="CheckCircle"
                  color="primary"
                />
                <FinancialSummaryWidget
                  title="Valores em Atraso"
                  value={`${financialStats.overdueCount} pagamentos`}
                  change={financialStats.overdueCount > 0 ? 'Ação necessária' : 'Em dia'}
                  changeType={financialStats.overdueCount > 0 ? 'negative' : 'positive'}
                  icon="AlertCircle"
                  color="accent"
                />
              </>
            )}
          </div>


          {/* Distribution Summary */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Icon name="PieChart" size={20} className="mr-2" />
              Distribuição de Receita
            </h2>
            {financialStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 bg-transparent">
                    <Icon name="Shield" size={20} className="text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground">Comissão UNK</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(financialStats.totalCommission)}</p>
                  <p className="text-xs text-muted-foreground">
                    {financialStats.totalRevenue > 0 ? ((financialStats.totalCommission / financialStats.totalRevenue) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 bg-transparent">
                    <Icon name="Headphones" size={20} className="text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">DJs (Valor Líquido)</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(financialStats.netRevenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    {financialStats.totalRevenue > 0 ? ((financialStats.netRevenue / financialStats.totalRevenue) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 bg-transparent">
                    <Icon name="User" size={20} className="text-secondary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Produtores (Pagam)</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(financialStats.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    100% (Valor Bruto)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <FinancialFilters
            onFiltersChange={handleFiltersChange}
            onExport={() => exportPayments()}
            onClearFilters={handleClearFilters}
          />

          {/* Transactions Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Transações ({filteredTransactions?.length})
              </h2>
              <div className="text-sm text-muted-foreground">
                Última atualização: {new Date()?.toLocaleString('pt-BR')}
              </div>
            </div>
            
            <TransactionTable
              transactions={filteredTransactions}
              onViewDetails={handleViewDetails}
              onProcessPayment={handleProcessPayment}
              onUploadReceipt={handleUploadReceipt}
            />
          </div>
        </div>
      </main>
      {/* Modals */}
      <PaymentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        transactionIds={selectedTransactionIds}
        onUploadComplete={handleUploadComplete}
      />
      <TransactionDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        transaction={selectedTransaction}
      />
      </div>
    </AdminBackground>
  );
};

export default FinancialTracking;
