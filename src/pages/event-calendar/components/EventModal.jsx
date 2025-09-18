import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const EventModal = ({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
  producers,
  djs,
  selectedDate
}) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    venue: '',
    city: '',
    description: '',
    producerId: '',
    djIds: [],
    status: 'pending',
    cache: '',
    cacheIsento: false,
    commissionPercentage: '',
    advancePaid: false,
    advancePercentage: '',
    requirements: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event?.title || '',
        date: event?.date || '',
        venue: event?.venue || '',
        city: event?.city || '',
        description: event?.description || '',
        producerId: event?.producerId || '',
        djIds: event?.djIds || [],
        status: event?.status || 'pending',
        cache: event?.budget || '',
        commissionPercentage: event?.commission_percentage ?? '',
        advancePaid: false,
        advancePercentage: '',
        requirements: event?.requirements || ''
      });
    } else if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`; // local date, no timezone shift
      setFormData(prev => ({
        ...prev,
        date: dateStr
      }));
    }
  }, [event, selectedDate]);

  const statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'completed', label: 'Concluído' }
  ];

  const producerOptions = producers?.map(producer => ({
    value: producer?.id,
    label: producer?.name || producer?.company_name || producer?.email
  }));

  const djOptions = djs?.map(dj => ({
    value: dj?.id,
    label: dj?.name,
    description: dj?.genre
  }));

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleDjSelection = (djId, checked) => {
    setFormData(prev => ({
      ...prev,
      djIds: checked 
        ? [...prev?.djIds, djId]
        : prev?.djIds?.filter(id => id !== djId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.title?.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData?.date) newErrors.date = 'Data é obrigatória';
    if (!formData?.venue?.trim()) newErrors.venue = 'Local é obrigatório';
    if (!formData?.city?.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!formData?.producerId) newErrors.producerId = 'Produtor é obrigatório';
    if (!Array.isArray(formData?.djIds) || formData?.djIds.length === 0) newErrors.djIds = 'Selecione pelo menos um DJ';
    // Cachê é obrigatório apenas quando não for isento
    if (!formData?.cacheIsento && (!formData?.cache || isNaN(parseFloat(formData?.cache)))) newErrors.cache = 'Cachê é obrigatório, ou marque como isento';

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const requirementsNote = formData?.advancePaid
        ? `Pagamento de cachê antecipado: ${formData?.advancePercentage || 0}%\n` : '';

      const payload = {
        title: formData?.title,
        event_date: formData?.date,
        location: formData?.venue,
        city: formData?.city,
        description: formData?.description,
        producer_id: formData?.producerId,
        dj_id: Array.isArray(formData?.djIds) && formData?.djIds?.length > 0 ? formData?.djIds[0] : null,
        dj_ids: Array.isArray(formData?.djIds) ? formData.djIds : [],
        status: formData?.status,
        // cache_value must be NOT NULL in DB; use 0.00 to represent isento
        cache_value: formData?.cacheIsento ? 0.00 : (formData?.cache ? parseFloat(formData?.cache) : 0.00),
        commission_percentage: formData?.commissionPercentage !== '' ? parseFloat(formData?.commissionPercentage) : 20.00,
        requirements: `${requirementsNote}${formData?.requirements || ''}`.trim()
      };

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      setIsLoading(true);
      try {
        await onDelete(event?.id);
        onClose();
      } catch (error) {
        console.error('Erro ao excluir evento:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {event ? 'Editar Evento' : 'Criar Novo Evento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors duration-150"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Título do Evento"
                type="text"
                required
                value={formData?.title}
                onChange={(e) => handleInputChange('title', e?.target?.value)}
                error={errors?.title}
                placeholder="Nome do evento"
              />


              <Input
                label="Data"
                type="date"
                required
                value={formData?.date}
                onChange={(e) => handleInputChange('date', e?.target?.value)}
                error={errors?.date}
              />


              <Input
                label="Local"
                type="text"
                value={formData?.venue}
                onChange={(e) => handleInputChange('venue', e?.target?.value)}
                error={errors?.venue}
                placeholder="Nome do local"
              />

              <Input
                label="Cidade"
                type="text"
                value={formData?.city}
                onChange={(e) => handleInputChange('city', e?.target?.value)}
                error={errors?.city}
                placeholder="Cidade"
              />
            </div>

            {/* Producer and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Produtor"
                options={producerOptions}
                value={formData?.producerId}
                onChange={(value) => handleInputChange('producerId', value)}
                error={errors?.producerId}
                searchable
              />

              <Select
                label="Status"
                options={statusOptions}
                value={formData?.status}
                onChange={(value) => handleInputChange('status', value)}
              />
            </div>

            {/* DJ Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-foreground">
                  Seleção de DJs
                </label>
                <span className="text-xs text-muted-foreground">
                  {djs?.length} DJs disponíveis
                </span>
              </div>
              {errors?.djIds && (
                <p className="text-sm text-error mb-2">{errors?.djIds}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-border rounded-md p-4">
                {djs?.map((dj) => (
                  <div key={dj?.id} className="flex items-center space-x-3">
                    <Checkbox
                      checked={formData?.djIds?.includes(dj?.id)}
                      onChange={(e) => handleDjSelection(dj?.id, e?.target?.checked)}
                      disabled={!dj?.is_active}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {dj?.name}
                        </p>
                        {!dj?.is_active && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            Inativo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {dj?.genre}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cachê, Comissão e Pagamento Antecipado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Cachê (R$)"
                  type="number"
                  value={formData?.cache}
                  onChange={(e) => handleInputChange('cache', e?.target?.value)}
                  placeholder="0,00"
                  error={errors?.cache}
                  disabled={formData?.cacheIsento}
                />
                <div className="mt-2 flex items-center space-x-2">
                  <input
                    id="cacheIsento"
                    type="checkbox"
                    checked={!!formData?.cacheIsento}
                    onChange={(e) => handleInputChange('cacheIsento', e.target.checked)}
                  />
                  <label htmlFor="cacheIsento" className="text-sm text-muted-foreground">Cachê isento</label>
                </div>
              </div>

              <Input
                label="Comissão UNK (%)"
                type="number"
                min={0}
                max={100}
                value={formData?.commissionPercentage}
                onChange={(e) => handleInputChange('commissionPercentage', e?.target?.value)}
                placeholder="Ex: 10"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Pagamento de cachê antecipado?</label>
                <div className="flex items-center space-x-3">
                  <input
                    id="advancePaid"
                    type="checkbox"
                    checked={!!formData?.advancePaid}
                    onChange={(e) => handleInputChange('advancePaid', e.target.checked)}
                  />
                  <label htmlFor="advancePaid" className="text-sm text-foreground">Sim</label>
                </div>
                {formData?.advancePaid && (
                  <Input
                    label="Porcentagem adiantada (%)"
                    type="number"
                    min={0}
                    max={100}
                    value={formData?.advancePercentage}
                    onChange={(e) => handleInputChange('advancePercentage', e?.target?.value)}
                    placeholder="Ex: 50"
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData?.description}
                  onChange={(e) => handleInputChange('description', e?.target?.value)}
                  placeholder="Descrição detalhada do evento..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Observações / Requisitos
                </label>
                <textarea
                  value={formData?.requirements}
                  onChange={(e) => handleInputChange('requirements', e?.target?.value)}
                  placeholder="Observações, requisitos, e detalhes de pagamento antecipado"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
            <div>
              {event && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                  iconName="Trash2"
                  iconPosition="left"
                >
                  Excluir Evento
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="default"
                loading={isLoading}
                iconName="Save"
                iconPosition="left"
              >
                {event ? 'Salvar Alterações' : 'Criar Evento'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
