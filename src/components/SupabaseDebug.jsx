import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Icon from './AppIcon';
import Button from './ui/Button';

const SupabaseDebug = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [djsCount, setDjsCount] = useState(0);
  const [producersCount, setProducersCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [error, setError] = useState(null);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      setError(null);

      // Testar conexão básica
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError && authError.message !== 'Auth session missing!') {
        throw authError;
      }

      // Contar DJs
      const { count: djsCountRes, error: djsError } = await supabase.from('djs').select('*', { count: 'exact', head: true });
      if (djsError) throw djsError;
      setDjsCount(djsCountRes || 0);

      // Contar produtores
      const { count: producersCountRes, error: producersError } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'producer');
      if (producersError) throw producersError;
      setProducersCount(producersCountRes || 0);

      // Contar eventos
      const { count: eventsCountRes, error: eventsError } = await supabase.from('events').select('*', { count: 'exact', head: true });
      if (eventsError) throw eventsError;
      setEventsCount(eventsCountRes || 0);

      setConnectionStatus('connected');
    } catch (err) {
      console.error('Erro na conexão com Supabase:', err);
      setError(err.message);
      setConnectionStatus('error');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return 'CheckCircle';
      case 'error': return 'XCircle';
      default: return 'Loader';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-[99999] max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Debug Supabase</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkConnection}
          className="h-6 w-6 p-0"
        >
          <Icon name="RefreshCw" size={14} />
        </Button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center space-x-2">
          <Icon name={getStatusIcon()} size={14} className={getStatusColor()} />
          <span className="text-muted-foreground">
            Status: <span className={getStatusColor()}>
              {connectionStatus === 'checking' ? 'Verificando...' :
               connectionStatus === 'connected' ? 'Conectado' : 'Erro'}
            </span>
          </span>
        </div>

        {connectionStatus === 'connected' && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">DJs:</span>
              <span className="text-foreground font-medium">{djsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Produtores:</span>
              <span className="text-foreground font-medium">{producersCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Eventos:</span>
              <span className="text-foreground font-medium">{eventsCount}</span>
            </div>
          </>
        )}

        {error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
            <strong>Erro:</strong> {error}
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-border">
          <div className="text-muted-foreground">
            <strong>URL:</strong> {import.meta.env?.VITE_SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada'}
          </div>
          <div className="text-muted-foreground">
            <strong>Key:</strong> {import.meta.env?.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDebug;
