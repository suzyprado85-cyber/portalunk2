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
    time: '',
    venue: '',
    description: '',
    eventType: '',
    producerId: '',
    djIds: [],
    status: 'pending',
    budget: '',
    expectedAttendance: '',
    requirements: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event?.title || '',
        date: event?.date || '',
        time: event?.time || '',
        venue: event?.venue || '',
        description: event?.description || '',
        eventType: event?.eventType || '',
        producerId: event?.producerId || '',
        djIds: event?.djIds || [],
        status: event?.status || 'pending',
        budget: event?.budget || '',
        expectedAttendance: event?.expectedAttendance || '',
        requirements: event?.requirements || ''
      });
    } else if (selectedDate) {
      const dateStr = selectedDate?.toISOString()?.split('T')?.[0];
      setFormData(prev => ({
        ...prev,
        date: dateStr,
        time: '20:00'
      }));
    }
  }, [event, selectedDate]);

  const eventTypeOptions = [
    { value: 'show', label: 'Show' },
    { value: 'festival', label: 'Festival' },
    { value: 'private', label: 'Evento Privado' },
    { value: 'corporate', label: 'Evento Corporativo' },
    { value: 'wedding', label: 'Casamento' }
  ];

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

    // Apenas título e data são obrigatórios
    if (!formData?.title?.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData?.date) {
      newErrors.date = 'Data é obrigatória';
    }

    // Removido validações obrigatórias para:
    // - time (horário)
    // - venue (local)
    // - eventType (tipo de evento)
    // - producerId (produtor)
    // - djIds (DJs)

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
      const eventData = {
        ...formData,
        id: event?.id || `event_${Date.now()}`,
        createdAt: event?.createdAt || new Date()?.toISOString(),
        updatedAt: new Date()?.toISOString()
      };

      await onSave(eventData);
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

              <Select
                label="Tipo de Evento"
                options={eventTypeOptions}
                value={formData?.eventType}
                onChange={(value) => handleInputChange('eventType', value)}
                error={errors?.eventType}
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
                label="Horário"
                type="time"
                value={formData?.time}
                onChange={(e) => handleInputChange('time', e?.target?.value)}
                error={errors?.time}
              />

              <Input
                label="Local"
                type="text"
                value={formData?.venue}
                onChange={(e) => handleInputChange('venue', e?.target?.value)}
                error={errors?.venue}
                placeholder="Nome do local"
                className="md:col-span-2"
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

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Orçamento (R$)"
                type="number"
                value={formData?.budget}
                onChange={(e) => handleInputChange('budget', e?.target?.value)}
                placeholder="0,00"
              />

              <Input
                label="Público Esperado"
                type="number"
                value={formData?.expectedAttendance}
                onChange={(e) => handleInputChange('expectedAttendance', e?.target?.value)}
                placeholder="Número de pessoas"
              />
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
                  Requisitos Especiais
                </label>
                <textarea
                  value={formData?.requirements}
                  onChange={(e) => handleInputChange('requirements', e?.target?.value)}
                  placeholder="Equipamentos, rider técnico, etc..."
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
