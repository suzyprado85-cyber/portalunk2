import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { djService, storageService } from '../../../services/supabaseService';

const DJEditModal = ({ dj, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    genre: '',
    specialties: [],
    instagram: '',
    soundcloud: '',
    youtube: '',
    spotify: '',
    facebook: '',
    twitter: '',
    profile_image_url: '',
    background_image_url: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (dj) {
      console.log('DJ data received:', dj);
      setFormData({
        name: dj?.name || '',
        email: dj?.email || '',
        phone: dj?.phone || '',
        bio: dj?.bio || '',
        location: dj?.location || '',
        genre: dj?.genre || '',
        specialties: dj?.specialties || [],
        instagram: dj?.instagram || '',
        soundcloud: dj?.soundcloud || '',
        youtube: dj?.youtube || '',
        spotify: dj?.spotify || '',
        facebook: dj?.facebook || '',
        twitter: dj?.twitter || '',
        profile_image_url: dj?.profile_image_url || '',
        background_image_url: dj?.background_image_url || '',
        is_active: dj?.is_active ?? true
      });
    }
  }, [dj]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${dj?.id || 'new'}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `dj-images/${fileName}`;

      const { data, error } = await storageService.uploadFile('dj-media', filePath, file);

      if (error) {
        toast?.error('Erro ao fazer upload da imagem');
        return;
      }

      const publicUrl = storageService.getPublicUrl('dj-media', filePath);

      setFormData(prev => ({
        ...prev,
        [type === 'profile' ? 'profile_image_url' : 'background_image_url']: publicUrl
      }));
      
      toast?.success('Imagem enviada com sucesso');
    } catch (error) {
      toast?.error('Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSpecialtiesChange = (value) => {
    const specialties = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({
      ...prev,
      specialties
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Submitting DJ data:', { djId: dj?.id, formData });
      
      if (dj?.id) {
        const result = await djService.update(dj.id, formData);
        console.log('Update result:', result);
        toast?.success('DJ atualizado com sucesso');
      } else {
        const result = await djService.create(formData);
        console.log('Create result:', result);
        if (result?.data) {
          toast?.success('DJ criado com sucesso! Estrutura de pastas configurada.');
        }
      }
      
      onSave?.(formData);
      onClose();
    } catch (error) {
      console.error('Error saving DJ:', error);
      toast?.error('Erro ao salvar DJ');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h1 className="text-xl font-semibold text-foreground">
            {dj?.id ? 'Editar DJ' : 'Criar Novo DJ'}
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome do DJ"
              />
              
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
              
              <Input
                label="Telefone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
              
              <Input
                label="Localização"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Cidade, Estado"
              />
            </div>

            {/* Biografia */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Biografia
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Descrição do DJ, experiência, etc..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Gênero e Especialidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Gênero Principal"
                value={formData.genre}
                onChange={(e) => handleInputChange('genre', e.target.value)}
                placeholder="House, Techno, etc..."
              />
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Especialidades
                </label>
                <input
                  type="text"
                  value={formData.specialties.join(', ')}
                  onChange={(e) => handleSpecialtiesChange(e.target.value)}
                  placeholder="House, Techno, Progressive (separados por vírgula)"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Redes Sociais */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Redes Sociais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Instagram"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/usuario"
                />
                
                <Input
                  label="SoundCloud"
                  value={formData.soundcloud}
                  onChange={(e) => handleInputChange('soundcloud', e.target.value)}
                  placeholder="https://soundcloud.com/usuario"
                />
                
                <Input
                  label="YouTube"
                  value={formData.youtube}
                  onChange={(e) => handleInputChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/c/usuario"
                />
                
                <Input
                  label="Spotify"
                  value={formData.spotify}
                  onChange={(e) => handleInputChange('spotify', e.target.value)}
                  placeholder="https://open.spotify.com/artist/..."
                />
                
                <Input
                  label="Facebook"
                  value={formData.facebook}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/usuario"
                />
                
                <Input
                  label="Twitter"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/usuario"
                />
              </div>
            </div>

            {/* Imagens */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Imagens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Foto de Perfil */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Foto de Perfil
                  </label>
                  <div className="space-y-3">
                    {formData.profile_image_url && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-border">
                        <img
                          src={formData.profile_image_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'profile')}
                      disabled={uploadingImage}
                      className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                </div>

                {/* Imagem de Fundo */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Imagem de Fundo
                  </label>
                  <div className="space-y-3">
                    {formData.background_image_url && (
                      <div className="w-32 h-20 rounded-lg overflow-hidden border border-border">
                        <img
                          src={formData.background_image_url}
                          alt="Background"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'background')}
                      disabled={uploadingImage}
                      className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-foreground">DJ Ativo</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/30">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              iconName="Save"
              iconPosition="left"
            >
              {dj?.id ? 'Salvar Alterações' : 'Criar DJ'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DJEditModal;
