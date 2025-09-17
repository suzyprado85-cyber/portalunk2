import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { mediaService } from '../../../services/mediaService';

// Helper to build social links safely
const getSocialLink = (platform, username) => {
  if (!username) return null;
  const clean = `${username}`.trim();
  const links = {
    instagram: `https://instagram.com/${clean.replace('@', '')}`,
    soundcloud: clean.startsWith('http') ? clean : `https://soundcloud.com/${clean}`,
    youtube: clean.startsWith('http') ? clean : `https://youtube.com/${clean}`
  };
  return links[platform] || null;
};

const DJMediaGallery = ({ djId, djName, dj = null, isAdmin = false, onMediaUpdate }) => {
  const [mediaFiles, setMediaFiles] = useState({
    logo: [],
    presskit: [],
    backdrop: [],
    performance: [],
    video: [],
    audio: [],
    other: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('logo');
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'link'
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null,
    externalLink: ''
  });

  const categories = [
    { id: 'logo', name: 'Logo', icon: 'Image', count: 0 },
    { id: 'presskit', name: 'Presskit', icon: 'Camera', count: 0 },
    { id: 'backdrop', name: 'Backdrop', icon: 'Monitor', count: 0 },
    { id: 'performance', name: 'Performance', icon: 'Play', count: 0 },
    { id: 'video', name: 'Vídeos', icon: 'Video', count: 0 },
    { id: 'audio', name: 'Áudio', icon: 'Music', count: 0 },
    { id: 'other', name: 'Outros', icon: 'File', count: 0 }
  ];

  useEffect(() => {
    if (djId) {
      loadMediaFiles();
    }
  }, [djId]);

  const loadMediaFiles = async () => {
    setLoading(true);
    try {
      const { data: allMedia, error } = await mediaService.getDJMedia(djId);
      
      if (error) {
        toast.error('Erro ao carregar mídias');
        return;
      }

      // Agrupar por categoria
      const grouped = {
        logo: [],
        presskit: [],
        backdrop: [],
        performance: [],
        video: [],
        audio: [],
        other: []
      };

      (allMedia || []).forEach(media => {
        const category = media.category || 'other';
        if (grouped[category]) {
          grouped[category].push(media);
        }
      });

      setMediaFiles(grouped);
    } catch (error) {
      console.error('Erro ao carregar mídias:', error);
      toast.error('Erro ao carregar mídias do DJ');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (uploadType === 'file' && !uploadData.file) {
      toast.error('Selecione um arquivo');
      return;
    }

    if (uploadType === 'link' && !uploadData.externalLink) {
      toast.error('Insira um link válido');
      return;
    }

    if (!uploadData.title) {
      toast.error('Título é obrigatório');
      return;
    }

    setUploading(true);
    try {
      let result;

      if (uploadType === 'file') {
        result = await mediaService.uploadFile({
          djId,
          djName,
          file: uploadData.file,
          category: selectedCategory,
          title: uploadData.title,
          description: uploadData.description
        });
      } else {
        result = await mediaService.uploadExternalLink({
          djId,
          djName,
          externalLink: uploadData.externalLink,
          category: selectedCategory,
          title: uploadData.title,
          fileType: 'link'
        });
      }

      if (!result?.error) {
        await loadMediaFiles();
        onMediaUpdate?.();
        setShowAddModal(false);
        setUploadData({
          title: '',
          description: '',
          file: null,
          externalLink: ''
        });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Tem certeza que deseja deletar esta mídia?')) {
      return;
    }

    const result = await mediaService.deleteMedia(mediaId);
    if (!result?.error) {
      await loadMediaFiles();
      onMediaUpdate?.();
    }
  };

  const handleDownloadFile = async (media) => {
    await mediaService.downloadFile(media.file_url, media.file_name);
  };

  const currentFiles = mediaFiles[selectedCategory] || [];
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    count: mediaFiles[cat.id]?.length || 0
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icon name="Loader" size={48} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-white">Carregando galeria de mídia...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Galeria de Mídia</h3>
        {isAdmin && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Adicionar Mídia
          </Button>
        )}
      </div>

      {/* Category Navigation */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex flex-wrap gap-2">
          {categoriesWithCounts.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <Icon name={category.icon} size={16} />
              <span>{category.name}</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-bold text-white">
            {categories.find(c => c.id === selectedCategory)?.name}
          </h4>
          <span className="text-gray-400">
            {currentFiles.length} arquivo{currentFiles.length !== 1 ? 's' : ''}
          </span>
        </div>

        {currentFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentFiles.map((media) => (
              <div key={media.id} className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group">
                {/* Preview */}
                <div className="aspect-square bg-gray-700 flex items-center justify-center relative">
                  {media.file_type === 'image' ? (
                    <img
                      src={media.file_url}
                      alt={media.file_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : media.file_type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="Play" size={32} className="text-gray-400" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name={mediaService.getFileIcon(media.file_type)} size={32} className="text-gray-400" />
                    </div>
                  )}
                  
                  {/* Fallback icon */}
                  <div className="absolute inset-0 bg-gray-700 flex items-center justify-center hidden">
                    <Icon name="File" size={32} className="text-gray-400" />
                  </div>
                  
                  {/* Action Buttons Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button
                      onClick={() => window.open(media.file_url, '_blank')}
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Icon name="ExternalLink" size={16} />
                    </Button>
                    <Button
                      onClick={() => handleDownloadFile(media)}
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Icon name="Download" size={16} />
                    </Button>
                    {isAdmin && (
                      <Button
                        onClick={() => handleDeleteMedia(media.id)}
                        size="sm"
                        variant="destructive"
                        className="bg-red-500/80 hover:bg-red-600"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    )}
                  </div>
                </div>

                {/* File Info */}
                <div className="p-4">
                  <p className="text-white font-medium truncate" title={media.file_name}>
                    {media.file_name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {media.file_size ? mediaService.formatFileSize(media.file_size) : 'Link externo'}
                  </p>
                  {media.description && (
                    <p className="text-gray-500 text-xs mt-1 truncate" title={media.description}>
                      {media.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Icon name="Image" size={64} className="text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">
              Nenhuma mídia encontrada
            </h4>
            <p className="text-gray-400">
              Não há arquivos na categoria {categories.find(c => c.id === selectedCategory)?.name}
            </p>
            {isAdmin && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Adicionar Primeira Mídia
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Social Media Links */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
        <h3 className="text-2xl font-bold mb-6 text-white">Redes Sociais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dj?.instagram && (
            <a 
              href={getSocialLink('instagram', dj.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl hover:from-purple-600/30 hover:to-pink-600/30 transition-all"
            >
              <Icon name="Instagram" size={24} className="text-pink-400 mr-3" />
              <div>
                <p className="text-white font-medium">Instagram</p>
                <p className="text-gray-400 text-sm">{dj.instagram}</p>
              </div>
            </a>
          )}
          {dj?.soundcloud && (
            <a 
              href={getSocialLink('soundcloud', dj.soundcloud)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-xl hover:from-orange-600/30 hover:to-red-600/30 transition-all"
            >
              <Icon name="Music" size={24} className="text-orange-400 mr-3" />
              <div>
                <p className="text-white font-medium">SoundCloud</p>
                <p className="text-gray-400 text-sm">Ouça as músicas</p>
              </div>
            </a>
          )}
          {dj?.youtube && (
            <a 
              href={getSocialLink('youtube', dj.youtube)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30 rounded-xl hover:from-red-600/30 hover:to-red-700/30 transition-all"
            >
              <Icon name="Play" size={24} className="text-red-400 mr-3" />
              <div>
                <p className="text-white font-medium">YouTube</p>
                <p className="text-gray-400 text-sm">Vídeos e sets</p>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* Add Media Modal */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Adicionar Mídia
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Upload Type Selection */}
              <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setUploadType('file')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    uploadType === 'file'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Arquivo
                </button>
                <button
                  onClick={() => setUploadType('link')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    uploadType === 'link'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Link Externo
                </button>
              </div>

              {/* Category Selection */}
              <Select
                label="Categoria"
                options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                value={selectedCategory}
                onChange={setSelectedCategory}
                className="bg-gray-800 border-gray-600 text-white"
              />

              {/* Title */}
              <Input
                label="Título"
                placeholder="Nome do arquivo ou link"
                value={uploadData.title}
                onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="bg-gray-800 border-gray-600 text-white"
              />

              {/* File Upload or Link Input */}
              {uploadType === 'file' ? (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Arquivo
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*,audio/*,.pdf"
                    onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files?.[0] }))}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                  />
                </div>
              ) : (
                <Input
                  label="Link Externo"
                  placeholder="https://exemplo.com/arquivo"
                  value={uploadData.externalLink}
                  onChange={(e) => setUploadData(prev => ({ ...prev, externalLink: e.target.value }))}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                />
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  placeholder="Descrição da mídia..."
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleFileUpload}
                disabled={uploading}
                loading={uploading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {uploading ? 'Enviando...' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DJMediaGallery;
