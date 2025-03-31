import { STORAGE_BUCKETS } from '../constants/storage';
import { supabase } from '../lib/supabaseClient';

export const cleanupTeamLogo = async (fileName) => {
  try {
    if (!fileName) return;

    const { error } = await supabase.storage.from(STORAGE_BUCKETS.TEAM_LOGOS).remove([fileName]);

    if (error) throw error;
  } catch (error) {
    console.error('Error cleaning up team logo:', error);
    throw error;
  }
};

export const deleteTeam = async (teamId) => {
  try {
    // First get the team details to get the logo URL
    const { data: team, error: fetchError } = await supabase
      .from('teams')
      .select('logo_url')
      .eq('id', teamId)
      .single();

    if (fetchError) throw fetchError;

    // Delete the logo if it exists
    if (team?.logo_url) {
      const fileName = team.logo_url.includes('/')
        ? team.logo_url.split('/').pop()
        : team.logo_url;
        
      await cleanupTeamLogo(fileName);
    }

    // Call the delete_team database function
    const { error: deleteError } = await supabase
      .rpc('delete_team', { team_members_team_id: teamId });

    if (deleteError) {
      console.error('Error in delete_team RPC:', deleteError);
      throw deleteError;
    }

  } catch (error) {
    console.error('Delete team operation failed:', {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint
    });
    throw error;
  }
};






