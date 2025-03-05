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
      // Extract just the filename if it's a full URL
      const fileName = team.logo_url.includes('/')
        ? team.logo_url.split('/').pop()
        : team.logo_url;
        
      await cleanupTeamLogo(fileName);
    }

    // Delete the team
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (deleteError) throw deleteError;
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
};
