import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { mediaService } from '../../../services/mediaService';
import { djService } from '../../../services/djService';

const DJMediaGallery = ({ djId }) => {
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
  const [djName, setDjName] = useState('');

  const categories = [
    { id: 'logo', name: 'Logo', icon: 'Image' },
    { id: 'presskit', name: 'Presskit', icon: 'Camera' },
    { id: 'backdrop', name: 'Backdrop', icon: 'Monitor' },
    { id: 'performance', name: 'Performance', icon: 'Play' },
    { id: 'video', name: 'Vídeos', icon: 'Video' },
    { id: 'audio', name: 'Áudio', icon: 'Music' },
    { id: 'other', name: 'Outros', icon: 'File' }
  ];

  useEffect(() => {
    if (djId) {
      loadMediaFiles();
    }
  }, [djId]);

  const loadMediaFiles = async () => {
    setLoading(true);
    try {
      // Buscar o nome do DJ
      const { data: djData } = await djService.getById(djId);
      if (djData) {
        setDjName(djData.name || '');
        
        // Buscar todas as mídias do DJ
        const { data: allMedia, error } = await mediaService.getDJMedia(djId);
        
        if (error) {
          toast.error('Erro ao carregar mídias');
          return;
        }

        // Agrupar por categoria
        const newMediaFiles = {
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
          if (newMediaFiles[category]) {
            newMediaFiles[category].push({
              id: media.id,
              name: media.file_name,
              url: media.file_url,
              size: media.file_size,
              type: media.file_type,
              description: media.description,
              updated_at: media.created_at
            });
          }
        });

        setMediaFiles(newMediaFiles);
      }
    } catch (error) {
      console.error('Erro ao carregar mídias:', error);
      toast?.error('Erro ao carregar mídias do DJ');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = (file) => {
    try {
      mediaService.downloadFile(file.url, file.name);
    } catch (error) {
      toast.error('Erro ao baixar arquivo');
    }
  };

  const handleDownloadAll = async () => {
    const files = mediaFiles[selectedCategory];
    if (files.length === 0) {
      toast.error('Nenhum arquivo encontrado nesta categoria');
      return;
    }

    try {
      for (const file of files) {
        await mediaService.downloadFile(file.url, file.name);
        // Pequeno delay entre downloads
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      toast.success(`${files.length} arquivos preparados para download`);
    } catch (error) {
      toast.error('Erro ao baixar arquivos');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const currentFiles = mediaFiles[selectedCategory] || [];
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    count: mediaFiles[cat.id]?.length || 0
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Galeria de Mídia</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icon name="Loader" size={48} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando mídias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Galeria de Mídia {djName && `- ${djName}`}
        </h3>
        {currentFiles.length > 0 && (
          <Button
            onClick={handleDownloadAll}
            iconName="Download"
            iconPosition="left"
            variant="outline"
          >
            Baixar Tudo
          </Button>
        )}
      </div>

      {/* Folder Navigation */}
      <div className="flex space-x-2 bg-muted p-1 rounded-lg w-fit">
        {categoriesWithCounts.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={category.icon} size={16} />
            <span>{category.name}</span>
            <span className="text-xs bg-muted-foreground/20 px-2 py-0.5 rounded-full">
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {currentFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentFiles.map((file, index) => (
            <div key={index} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* Preview */}
              <div className="aspect-square bg-muted flex items-center justify-center relative group">
                {file.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="Play" size={32} className="text-muted-foreground" />
                  </div>
                ) : (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-muted flex items-center justify-center hidden">
                  <Icon name="Image" size={32} className="text-muted-foreground" />
                </div>
                
                {/* Action Buttons Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <Button
                    onClick={() => window.open(file.url, '_blank')}
                    size="sm"
                    iconName="ExternalLink"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Ver
                  </Button>
                  <Button
                    onClick={() => handleDownloadFile(file)}
                    size="sm"
                    iconName="Download"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Baixar
                  </Button>
                </div>
              </div>

              {/* File Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-foreground truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} • {file.type === 'video' ? 'Vídeo' : 'Imagem'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="Image" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">
            Nenhuma mídia encontrada
          </h4>
          <p className="text-muted-foreground">
            {djName ? `Não há arquivos na categoria ${categories.find(c => c.id === selectedCategory)?.name} do DJ ${djName}` : 'Carregando informações do DJ...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DJMediaGallery;

