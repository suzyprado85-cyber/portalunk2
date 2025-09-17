import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { usePendingPayments } from '../../../hooks/usePendingPayments';
import { useAuth } from '../../../contexts/AuthContext';

const PendingPaymentsManager = ({ onPaymentUpdate }) => {
  const { userProfile } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [description, setDescription] = useState('');

  // Use the hook with producer filter
  const {
    payments,
    financialStats,
    loading,
    uploadingProof,
    uploadPaymentProof,
    formatCurrency,
    formatDate,
    isOverdue,
    refetchPayments
  } = usePendingPayments({ 
    producerId: userProfile?.id 
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Apenas arquivos JPG, PNG ou PDF são permitidos');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile || !selectedPaymentId) {
      toast.error('Selecione um arquivo e um pagamento');
      return;
    }

    const result = await uploadPaymentProof(selectedPaymentId, selectedFile, description);
    
    if (!result?.error) {
      setShowUploadModal(false);
      setSelectedFile(null);
      setSelectedPaymentId(null);
      setDescription('');
      onPaymentUpdate?.();
    }
  };

  const openUploadModal = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setSelectedPaymentId(null);
    setDescription('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando pagamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pagamentos Pendentes</p>
              <p className="text-xl font-bold text-foreground">{financialStats?.pendingCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Icon name="AlertTriangle" size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Atraso</p>
              <p className="text-xl font-bold text-foreground">{financialStats?.overdueCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pendente</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(financialStats?.totalPending || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Pagamentos Pendentes</h3>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="CheckCircle" size={48} className="text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">
              Todos os pagamentos estão em dia!
            </h4>
            <p className="text-muted-foreground">
              Não há pagamentos pendentes no momento.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {payments.map((payment) => (
              <div key={payment.id} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">
                          {payment?.event?.title || 'Evento sem título'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          DJ: {payment?.event?.dj?.name || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">
                          {formatCurrency(payment?.amount)}
                        </p>
                        {isOverdue(payment) && (
                          <div className="flex items-center text-red-500 text-sm mt-1">
                            <Icon name="AlertTriangle" size={14} className="mr-1" />
                            <span>Em atraso</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                      <div>
                        <p><strong>Data do Evento:</strong> {formatDate(payment?.event?.event_date)}</p>
                        <p><strong>Local:</strong> {payment?.event?.location || 'N/A'}</p>
                      </div>
                      <div>
                        <p><strong>Criado em:</strong> {formatDate(payment?.created_at)}</p>
                        <p><strong>Comissão UNK:</strong> {formatCurrency(payment?.commission_amount || 0)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isOverdue(payment) 
                            ? 'bg-red-500/20 text-red-500' 
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {isOverdue(payment) ? 'Em Atraso' : 'Pendente'}
                        </span>
                        {payment?.payment_proof_url && (
                          <a
                            href={payment.payment_proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-500 hover:text-blue-600 text-sm"
                          >
                            <Icon name="FileText" size={14} className="mr-1" />
                            Ver Comprovante
                          </a>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => openUploadModal(payment.id)}
                        variant="outline"
                        size="sm"
                        iconName="Upload"
                        iconPosition="left"
                        disabled={!!payment?.payment_proof_url}
                      >
                        {payment?.payment_proof_url ? 'Comprovante Enviado' : 'Enviar Comprovante'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Enviar Comprovante
              </h3>
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={closeUploadModal}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Arquivo do Comprovante
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceitos: JPG, PNG, PDF (máximo 10MB)
                </p>
              </div>

              <Input
                label="Descrição (opcional)"
                placeholder="Descrição do comprovante..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {selectedFile && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <Icon name="File" size={20} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={closeUploadModal}
                disabled={uploadingProof}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUploadProof}
                disabled={!selectedFile || uploadingProof}
                loading={uploadingProof}
                iconName="Upload"
                iconPosition="left"
              >
                Enviar Comprovante
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingPaymentsManager;