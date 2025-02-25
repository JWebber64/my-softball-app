import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getPlayerPhotoUrl } from '../utils/supabaseStorage';

export const usePlayerCardData = (playerId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        
        // Fetch player info
        const { data: player, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();

        if (playerError) throw playerError;

        // Fetch player stats
        const { data: playerStats, error: statsError } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_id', playerId)
          .single();

        if (statsError) throw statsError;

        // Get photo URL if exists
        if (player.photo_path) {
          player.photoUrl = getPlayerPhotoUrl(player.photo_path);
        }

        setPlayerData(player);
        setStats(playerStats);
      } catch (err) {
        setError(err);
        console.error('Error fetching player data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayerData();
    }
  }, [playerId]);

  return { loading, error, playerData, stats };
};