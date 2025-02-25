import { useState, useEffect, useCallback } from 'react';
import { supabase, retryOperation } from '../lib/supabaseClient';

export const useRealtimeData = (tableName, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchOperation = async () => {
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
        return result;
      };

      const result = await retryOperation(fetchOperation);
      setData(result);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error(`Error in useRealtimeData for ${tableName}:`, err);
      setError(err);
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [tableName, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();

    let subscription;
    const setupSubscription = async () => {
      try {
        subscription = supabase
          .channel(`${tableName}_changes`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: tableName
          }, () => {
            console.log(`${tableName} changed, refreshing data...`);
            fetchData();
          })
          .subscribe((status) => {
            console.log(`Subscription status for ${tableName}:`, status);
          });
      } catch (err) {
        console.error(`Error setting up subscription for ${tableName}:`, err);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [tableName, fetchData]);

  // Auto-retry on connection errors
  useEffect(() => {
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Retrying ${tableName} fetch... Attempt ${retryCount + 1}`);
        fetchData();
      }, 2000 * (retryCount + 1)); // Exponential backoff

      return () => clearTimeout(timer);
    }
  }, [error, retryCount, fetchData, tableName]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    retryCount
  };
};
