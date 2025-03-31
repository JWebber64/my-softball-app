import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useRealtimeData = (tableName, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      let query = supabase.from(tableName).select('*');

      // Handle filter conditions properly
      if (options.filter) {
        const [column, operator, value] = options.filter.split('.');
        if (operator === 'eq') {
          query = query.eq(column, value);
        }
      }

      // Handle ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, {
          ascending: true,
          nullsFirst: false
        });
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up realtime subscription
    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: tableName,
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName, options.filter, options.orderBy]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
