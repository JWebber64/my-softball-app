import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useTeamData(section, limit = null) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    if (!section) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(section);
      
      // Section-specific query modifications
      switch (section) {
        case 'team_news':
          query = query
            .select('*')
            .order('created_at', { ascending: false });
          break;
        case 'team_schedule':
          query = query
            .select('*')
            .gte('event_date', new Date().toISOString())
            .order('event_date', { ascending: true });
          break;
        case 'players_of_week':
          query = query
            .select('*')
            .order('week_start', { ascending: false });
          break;
        case 'social_media_embeds':
          query = query
            .select('*')
            .order('created_at', { ascending: false });
          break;
        default:
          query = query.select('*');
      }

      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }

      const { data: result, error: queryError } = await query;
      
      if (queryError) throw queryError;
      
      setData(result || []);
      setLastUpdated(new Date());
      setError(null);
      
      // Cache the result
      localStorage.setItem(`${section}_cache`, JSON.stringify({
        data: result,
        timestamp: new Date().toISOString()
      }));
      
    } catch (err) {
      console.error(`Error fetching ${section}:`, err);
      setError(err.message);
      
      // Try to load from cache if available
      try {
        const cached = localStorage.getItem(`${section}_cache`);
        if (cached) {
          const { data: cachedData } = JSON.parse(cached);
          setData(cachedData);
        }
      } catch (cacheErr) {
        console.error('Error loading from cache:', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  }, [section, limit]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    data, 
    loading, 
    error, 
    lastUpdated, 
    refresh: fetchData 
  };
}
