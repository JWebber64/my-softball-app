import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '@chakra-ui/react';
import debounce from 'lodash/debounce';
import { validateData } from '../utils/validation';

export function useRealtimeData(tableName, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingUpdates, setPendingUpdates] = useState(new Map());
  const toast = useToast();
  const optimisticTimeout = useRef(null);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce(async (updateData) => {
      try {
        const { data: result, error: updateError } = await supabase
          .from(tableName)
          .upsert(updateData);

        if (updateError) throw updateError;

        setPendingUpdates(prev => {
          const next = new Map(prev);
          next.delete(updateData.id);
          return next;
        });

        toast({
          title: "Changes saved",
          status: "success",
          duration: 2000,
        });
      } catch (error) {
        console.error('Update error:', error);
        toast({
          title: "Error saving changes",
          description: error.message,
          status: "error",
          duration: 3000,
        });
      }
    }, 1000),
    [tableName, toast]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from(tableName).select('*');

      if (options.filter) {
        Object.entries(options.filter).forEach(([column, value]) => {
          query = query.eq(column, value);
        });
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending
        });
      }

      const { data: result, error: queryError } = await query;
      if (queryError) throw queryError;
      setData(result);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error fetching data",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [tableName, options, toast]);

  // Subscribe to realtime changes
  useEffect(() => {
    fetchData();

    const subscription = supabase
      .channel(`${tableName}-changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: tableName
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setData(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(item => item.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => prev.map(item => 
            item.id === payload.new.id ? payload.new : item
          ));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName, fetchData]);

  const updateItem = async (id, updates, type) => {
    if (type) {
      const { isValid, errors } = await validateData(type, updates);
      if (!isValid) {
        toast({
          title: "Validation Error",
          description: Object.values(errors)[0],
          status: "error",
          duration: 3000,
        });
        return false;
      }
    }

    const originalData = data.find(item => item.id === id);
    setPendingUpdates(prev => {
      const next = new Map(prev);
      next.set(id, { originalData, updates });
      return next;
    });

    setData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );

    debouncedUpdate({ id, ...updates });
    return true;
  };

  return {
    data,
    loading,
    error,
    pendingUpdates,
    updateItem,
    refresh: fetchData
  };
}
