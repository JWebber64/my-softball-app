import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useBaseRealtimeData = (tableName, initialQuery = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user for RLS
        const { data: { user } } = await supabase.auth.getUser();
        
        // Build query with explicit filters for better performance
        let query = supabase
          .from(tableName)
          .select(initialQuery.select || '*')
          .eq('active', true); // Add filter for better query plan

        // Add user-specific filter if applicable
        if (initialQuery.userSpecific && user) {
          const userIdColumn = `${tableName}_user_id`;
          query = query.eq(userIdColumn, user.id);
        }

        // Add ordering with explicit index
        query = query.order(initialQuery.orderBy || 'created_at', { 
          ascending: false,
          nullsFirst: false 
        });

        const { data: initialData, error: queryError } = await query;

        if (queryError) throw queryError;
        setData(initialData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: 'active=eq.true' // Add filter for better performance
        }, 
        (payload) => {
          if (payload.new) {
            setData(currentData => {
              if (!currentData) return [payload.new];
              return [...currentData, payload.new];
            });
          }
        }
      )
      .subscribe();

    fetchData();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName, initialQuery]);

  return { data, error, loading };
};


