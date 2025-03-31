import { useEffect, useState } from 'react';
import { STORAGE_BUCKETS } from '../config';
import { supabase } from '../lib/supabaseClient';

export const usePlayerCardData = (playerId) => {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerCard = async () => {
      try {
        const { data, error: cardError } = await supabase
          .from('baseball_cards')
          .select(`
            *,
            players:player_id (
              first_name,
              last_name,
              jersey_number,
              position,
              photo_url
            ),
            teams:team_id (
              name,
              logo_url
            ),
            stats (*)
          `)
          .eq('player_id', playerId)
          .single();

        if (cardError) throw cardError;

        // Get photo URL if exists
        if (data.players.photo_url) {
          const { data: photoUrl } = supabase
            .storage
            .from(STORAGE_BUCKETS.PLAYER_PHOTOS)
            .getPublicUrl(data.players.photo_url);
          
          data.players.photo_url = photoUrl.publicUrl;
        }

        setCardData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayerCard();
    }
  }, [playerId]);

  return { cardData, loading, error };
};
