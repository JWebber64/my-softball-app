import { supabase } from '../lib/supabaseClient';

const teamService = {
  createTeam: async (teamData) => {
    try {
      // First verify if user can create a team
      const { data: canCreate, error: checkError } = await supabase
        .rpc('can_create_team', { check_user_id: supabase.auth.user()?.id });

      if (checkError) throw checkError;
      if (!canCreate) throw new Error('Not authorized to create a team');

      // Create the team
      const { data: team, error } = await supabase
        .from('teams')
        .insert([teamData])
        .select()
        .single();

      if (error) throw error;

      // Add creator as team admin
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: team.id,
          team_members_user_id: supabase.auth.user()?.id,
          role: 'admin'
        }]);

      if (memberError) throw memberError;

      return team;
    } catch (error) {
      console.error('Error in createTeam:', error);
      throw error;
    }
  },

  deleteTeam: async (teamId) => {
    const { error } = await supabase
      .rpc('delete_team', { team_id: teamId });
    
    if (error) throw error;
  },

  getTeamMembers: async (teamId) => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId);

    if (error) throw error;
    return data;
  },

  verifyTeamAdmin: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isAdmin: false, teams: [] };

      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name
        `)
        .eq('team_members.team_members_user_id', user.id);

      if (error) throw error;

      return {
        isAdmin: data && data.length > 0,
        teams: data || []
      };
    } catch (error) {
      console.error('Error in verifyTeamAdmin:', error);
      throw error;
    }
  },

  verifyTeamInDatabase: async (teamId) => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();
    
    if (error) {
      console.error('Team verification failed:', error);
      return false;
    }
    
    console.log('Team verified in database:', data);
    return true;
  }
};

export { teamService }; // Change to default export













