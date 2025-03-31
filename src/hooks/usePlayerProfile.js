import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const usePlayerProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching profile for user:', userId);
      const { data, error: fetchError } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('profile_user_id', userId)
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      console.log('Fetched profile:', data);
      setProfile(data || null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    // Set up real-time subscription
    const channel = supabase
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
          console.log('Profile change detected:', payload);
          if (payload.new) {
            setProfile(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { profile, loading, error, refetch: fetchProfile };
};

























