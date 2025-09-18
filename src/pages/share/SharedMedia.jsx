import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { storageService } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';
import { mediaService } from '../../services/mediaService';

const sha256 = async (text) => {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const SharedMedia = () => {
  const { token } = useParams();
  const [meta, setMeta] = useState(null);
  const [pass, setPass] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [media, setMedia] = useState([]);
  const [error, setError] = useState('');

  const categories = useMemo(() => ([
    { id: 'logo', name: 'Logo', icon: 'Image' },
    { id: 'presskit', name: 'Presskit', icon: 'Camera' },
    { id: 'backdrop', name: 'Backdrop', icon: 'Monitor' },
    { id: 'performance', name: 'Performance', icon: 'Play' },
    { id: 'video', name: 'Vídeos', icon: 'Video' },
    { id: 'audio', name: 'Áudio', icon: 'Music' },
    { id: 'other', name: 'Outros', icon: 'File' }
  ]), []);
  const [selectedCategory, setSelectedCategory] = useState('logo');

  useEffect(() => {
    const loadMeta = async () => {
      setChecking(true);
      setError('');
      try {
        const path = `links/${token}.json`;
        const text = await storageService.downloadText('shared-links', path);
        if (!text) {
          setError('Link inválido ou expirado');
          return;
        }
        const data = JSON.parse(text);
        setMeta(data);
      } catch (e) {
        setError('Falha ao carregar link compartilhado');
      } finally {
        setChecking(false);
      }
    };
    if (token) loadMeta();
  }, [token]);

  const verifyPassword = async (e) => {
    e?.preventDefault?.();
    if (!meta) return;
    const enteredHash = await sha256(pass || '');
    if (enteredHash === meta.password_hash) {
      setAuthorized(true);
      await fetchMedia();
    } else {
      setAuthorized(false);
      setError('Senha incorreta');
    }
  };

  const fetchMedia = async () => {
    if (!meta?.djId) return;
    setLoadingMedia(true);
    try {
      const { data, error } = await supabase.from('dj_media').select('*').eq('dj_id', meta.djId).order('created_at', { ascending: false });
      if (error) throw error;
      setMedia(data || []);
      // Pick first non-empty category
      const grouped = {};
      (data || []).forEach(m => {
        const cat = m.category || 'other';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(m);
      });
      const firstNonEmpty = Object.keys(grouped).find(k => grouped[k]?.length > 0);
      if (firstNonEmpty) setSelectedCategory(firstNonEmpty);
    } catch (e) {
      setError('Não foi possível carregar as mídias');
    } finally {
      setLoadingMedia(false);
    }
  };

  const groupedMedia = useMemo(() => {
    const g = {};
    (media || []).forEach(m => {
      const cat = m.category || 'other';
      if (!g[cat]) g[cat] = [];
      g[cat].push(m);
    });
    return g;
  }, [media]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando link...</p>
        </div>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card border border-border rounded-lg p-6 max-w-md text-center">
          <Icon name="AlertTriangle" size={32} className="text-red-500 mx-auto mb-2" />
          <p className="text-foreground">{error || 'Link inválido'}</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
          <div className="text-center mb-4">
            <Icon name="Lock" size={24} className="text-muted-foreground mx-auto mb-2" />
            <h1 className="text-xl font-semibold text-foreground">Acesso às mídias de {meta.djName || 'DJ'}</h1>
            <p className="text-sm text-muted-foreground">Digite a senha do produtor para visualizar e baixar</p>
          </div>
          <form onSubmit={verifyPassword} className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Senha</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" iconName="LogIn" iconPosition="left">
              Entrar
            </Button>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  const currentFiles = groupedMedia[selectedCategory] || [];
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    count: groupedMedia[cat.id]?.length || 0
  })).filter(cat => cat.count > 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Mídias de {meta.djName || 'DJ'}</h2>
          {currentFiles.length > 0 && (
            <Button
              onClick={async () => {
                for (const m of currentFiles) {
                  await mediaService.downloadFile(m.file_url, m.file_name);
                  await new Promise(r => setTimeout(r, 100));
                }
              }}
              iconName="Download"
              iconPosition="left"
              variant="outline"
            >
              Baixar Tudo
            </Button>
          )}
        </div>

        <div className="flex space-x-2 bg-muted p-1 rounded-lg w-fit mb-4">
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

        {loadingMedia ? (
          <div className="flex items-center justify-center py-20">
            <Icon name="Loader" size={40} className="animate-spin text-primary" />
          </div>
        ) : currentFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentFiles.map((m) => (
              <div key={m.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-muted flex items-center justify-center relative group">
                  {m.file_type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="Play" size={32} className="text-muted-foreground" />
                    </div>
                  ) : (
                    <img
                      src={m.file_url}
                      alt={m.file_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        (e.currentTarget.nextSibling)?.classList?.remove('hidden');
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-muted flex items-center justify-center hidden">
                    <Icon name="Image" size={32} className="text-muted-foreground" />
                  </div>

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button
                      onClick={() => window.open(m.file_url, '_blank')}
                      size="sm"
                      iconName="ExternalLink"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      Ver
                    </Button>
                    <Button
                      onClick={() => mediaService.downloadFile(m.file_url, m.file_name)}
                      size="sm"
                      iconName="Download"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      Baixar
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate" title={m.file_name}>
                    {m.file_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Icon name="Image" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">Nenhuma mídia encontrada</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedMedia;
