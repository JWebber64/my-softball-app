import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const usePlayerProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('profile_user_id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      setProfile(data || null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    let channel;

    const initializeSubscription = async () => {
      if (!userId) return;

      // Only fetch if component is still mounted
      if (mounted) {
        await fetchProfile();
      }

      channel = supabase
        .channel(`profile_changes_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'player_profiles',
            filter: `profile_user_id=eq.${userId}`
          },
          (payload) => {
            if (mounted && payload.new) {
              setProfile(payload.new);
            }
          }
        )
        .subscribe();
    };

    initializeSubscription();

    return () => {
      mounted = false;
      if (channel) {
        channel.unsubscribe();
        supabase.removeChannel(channel);
      }
    };
  }, [userId, fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
};





























