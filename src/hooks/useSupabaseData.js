import { useState, useEffect, useCallback } from 'react';
import { realtimeService } from '../services/supabaseService';

export const useSupabaseData = (service, method, params = [], dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 useSupabaseData: Buscando ${service?.name || 'dados'} com método ${method}`);
      const result = await service?.[method](...params);
      
      if (result?.error) {
        console.error(`❌ useSupabaseData: Erro em ${method}:`, result.error);
        setError(result?.error);
      } else {
        console.log(`✅ useSupabaseData: Dados recebidos para ${method}:`, result?.data?.length || 0, 'itens');
        setData(result?.data);
      }
    } catch (err) {
      console.error(`❌ useSupabaseData: Erro inesperado em ${method}:`, err);
      setError('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [service, method, ...params, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};

export const useRealtimeData = (table, initialData = [], onUpdate) => {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const channel = realtimeService?.subscribeToTable(table, (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload || {};
      
      setData(prevData => {
        let updatedData = [...prevData];
        
        switch (eventType) {
          case 'INSERT':
            updatedData = [...prevData, newRecord];
            break;
          case 'UPDATE':
            updatedData = prevData?.map(item => 
              item?.id === newRecord?.id ? newRecord : item
            );
            break;
          case 'DELETE':
            updatedData = prevData?.filter(item => item?.id !== oldRecord?.id);
            break;
          default:
            break;
        }
        
        // Call external update handler if provided
        onUpdate?.(updatedData, payload);
        
        return updatedData;
      });
    });

    return () => {
      realtimeService?.unsubscribe(channel);
    };
  }, [table, onUpdate]);

  return { data, setData };
};

export const useSupabaseQuery = (queryFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const executeQuery = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await queryFn();
      if (result?.error) {
        setError(result?.error);
      } else {
        setData(result?.data);
      }
    } catch (err) {
      setError('Erro ao executar consulta');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

  return {
    data,
    loading,
    error,
    refetch: executeQuery
  };
};

export default {
  useSupabaseData,
  useRealtimeData,
  useSupabaseQuery
};