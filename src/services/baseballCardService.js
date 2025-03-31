import { supabase } from '../lib/supabaseClient';

export const baseballCardService = {
  async createBaseballCard(playerId, teamId, cardData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // The supabase client will automatically include the auth header
    const { data, error } = await supabase
      .from('baseball_cards')
      .insert([{ 
        player_id: playerId,
        team_id: teamId,
        ...cardData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPlayerCards(playerId, teamId = null) {
    let query = supabase
      .from('baseball_cards')
      .select(`
        *,
        players:player_id (
          first_name,
          last_name,
          jersey_number,
          position
        ),
        teams:team_id (
          name,
          logo_url
        )
      `)
      .eq('player_id', playerId);
      
    if (teamId) {
      query = query.eq('team_id', teamId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};




