import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Helper function to handle errors
const handleError = (error, context) => {
  console.error(`${context}:`, error);
  return { error: error?.message || 'Erro inesperado' };
};

export const mediaService = {
  // Upload file to DJ media
  async uploadFile(uploadData) {
    console.log('📁 Fazendo upload de mídia para DJ:', uploadData.djId);
    
    const { djId, djName, file, category, title, description } = uploadData;

    try {
      // Usar apenas bucket dj-media
      const bucketName = 'dj-media';

      // Criar pasta baseada no nome do DJ
      const djFolder = djName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const fileExt = file.name.split('.').pop();
      const fileName = `${djFolder}/${category}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('📤 Fazendo upload para bucket:', bucketName, fileName);

      // Upload do arquivo
      const { data: storageData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError);
        toast.error('Erro ao fazer upload do arquivo');
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      // Salvar metadados no banco
      const mediaData = {
        dj_id: djId,
        file_name: title || file.name,
        file_type: this.getFileType(file.type),
        file_url: urlData.publicUrl,
        file_size: file.size,
        category: category,
        description: description || null
      };

      const { data: mediaRecord, error: mediaError } = await supabase
        .from('dj_media')
        .insert(mediaData)
        .select()
        .single();

      if (mediaError) {
        console.error('❌ Erro ao salvar metadados:', mediaError);
        // Tentar limpar arquivo do storage se falhou ao salvar metadados
        try {
          await supabase.storage
            .from(bucketName)
            .remove([fileName]);
        } catch (cleanupError) {
          console.error('❌ Erro ao limpar arquivo:', cleanupError);
        }
        toast.error('Erro ao salvar informações do arquivo');
        throw mediaError;
      }

      console.log('✅ Upload concluído com sucesso:', mediaRecord.id);
      toast.success('Arquivo enviado com sucesso!');
      return { data: mediaRecord };
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      toast.error('Erro ao fazer upload do arquivo');
      return handleError(error, 'Erro no upload');
    }
  },

  // Upload external link
  async uploadExternalLink(uploadData) {
    console.log('🔗 Fazendo upload de link externo para DJ:', uploadData.djId);
    
    const { djId, externalLink, category, title, fileType } = uploadData;

    try {
      // Determinar o tipo de arquivo baseado na categoria e URL
      let detectedFileType = fileType;
      if (category === 'backdrop' || externalLink.includes('youtube') || externalLink.includes('vimeo') || externalLink.includes('drive.google.com')) {
        detectedFileType = 'video/external';
      }

      // Salvar metadados no banco (sem arquivo físico, apenas o link)
      const mediaData = {
        dj_id: djId,
        file_name: title,
        file_type: detectedFileType,
        file_url: externalLink,
        file_size: null,
        category: category,
        description: null
      };

      const { data: mediaRecord, error: mediaError } = await supabase
        .from('dj_media')
        .insert(mediaData)
        .select()
        .single();

      if (mediaError) {
        console.error('❌ Erro ao salvar link externo:', mediaError);
        toast.error('Erro ao salvar link externo');
        throw mediaError;
      }

      console.log('✅ Link externo salvo com sucesso:', mediaRecord.id);
      toast.success('Link externo adicionado com sucesso!');
      return { data: mediaRecord };
    } catch (error) {
      console.error('❌ Erro ao salvar link externo:', error);
      toast.error('Erro ao adicionar link externo');
      return handleError(error, 'Erro ao salvar link externo');
    }
  },

  // Get DJ media
  async getDJMedia(djId) {
    console.log('🖼️ Buscando mídia do DJ:', djId);
    
    try {
      const { data, error } = await supabase
        .from('dj_media')
        .select('*')
        .eq('dj_id', djId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar mídia:', error);
        throw error;
      }

      console.log('✅ Mídia carregada:', data?.length, 'arquivos');
      return { data: data || [] };
    } catch (error) {
      console.error('❌ Erro ao buscar mídia:', error);
      toast.error('Erro ao carregar mídias');
      return handleError(error, 'Erro ao buscar mídia');
    }
  },

  // Get media by category
  async getMediaByCategory(djId, category) {
    console.log('🎯 Buscando mídia por categoria:', category);
    
    try {
      const { data, error } = await supabase
        .from('dj_media')
        .select('*')
        .eq('dj_id', djId)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar mídia por categoria:', error);
        throw error;
      }

      return { data: data || [] };
    } catch (error) {
      console.error('❌ Erro ao buscar mídia por categoria:', error);
      return handleError(error, 'Erro ao buscar mídia por categoria');
    }
  },

  // Delete media
  async deleteMedia(mediaId) {
    console.log('🗑️ Deletando mídia:', mediaId);
    
    try {
      // Buscar dados da mídia primeiro
      const { data: media } = await supabase
        .from('dj_media')
        .select('file_url, dj_id, file_name')
        .eq('id', mediaId)
        .single();

      if (media && !media.file_url.includes('http://') && !media.file_url.includes('https://')) {
        // Se não é link externo, deletar do storage
        const bucketName = 'dj-media';
        
        // Extrair path do arquivo da URL
        const urlParts = media.file_url.split('/');
        const filePath = urlParts.slice(-3).join('/'); // Pegar últimas 3 partes do path

        // Deletar arquivo do storage
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);

        if (storageError) {
          console.error('❌ Erro ao deletar do storage:', storageError);
          // Continuar mesmo assim para deletar do banco
        }
      }

      // Deletar registro do banco
      const { error } = await supabase
        .from('dj_media')
        .delete()
        .eq('id', mediaId);

      if (error) {
        console.error('❌ Erro ao deletar mídia:', error);
        toast.error('Erro ao deletar mídia');
        return { error: error.message };
      }

      console.log('✅ Mídia deletada com sucesso');
      toast.success('Mídia deletada com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao deletar mídia:', error);
      toast.error('Erro ao deletar mídia');
      return handleError(error, 'Erro ao deletar mídia');
    }
  },

  // Download file
  async downloadFile(fileUrl, fileName) {
    console.log('⬇️ Fazendo download do arquivo:', fileName);
    
    try {
      // Para links externos, abrir em nova aba
      if (fileUrl.includes('drive.google.com') || fileUrl.includes('vimeo.com') || fileUrl.includes('youtube.com') || fileUrl.includes('youtu.be')) {
        window.open(fileUrl, '_blank');
        toast.success('Link aberto em nova aba!');
        return { success: true };
      }

      // Para arquivos hospedados no Supabase
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Erro ao baixar arquivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Manter extensão original para imagens
      const contentType = response.headers.get('content-type');
      let finalFileName = fileName;
      
      if (contentType?.startsWith('image/') && !fileName.includes('.')) {
        const extension = contentType.split('/')[1];
        finalFileName = `${fileName}.${extension}`;
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFileName;
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      console.log('✅ Download concluído');
      toast.success('Download iniciado!');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro no download:', error);
      toast.error('Erro ao fazer download do arquivo');
      return handleError(error, 'Erro no download');
    }
  },

  // Utility functions
  getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive';
    return 'other';
  },

  getFileIcon(fileType) {
    switch (fileType) {
      case 'image': return 'Image';
      case 'video': return 'Video';
      case 'audio': return 'Music';
      case 'document': return 'FileText';
      case 'archive': return 'Archive';
      default: return 'File';
    }
  },

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default mediaService;