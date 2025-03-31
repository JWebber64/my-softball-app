import { supabase } from '../lib/supabaseClient';

const getTeamRoster = async (teamId) => {
  const { data, error } = await supabase
    .from('team_roster')
    .select('id, name, number, positions')  // Added positions to select
    .eq('team_id', teamId)
    .order('number', { ascending: true });
    
  if (error) throw error;
  return data || [];
};

const addPlayerToRoster = async (teamId, { name, number, positions }) => {
  if (!teamId) throw new Error('Team ID is required');
  if (!name) throw new Error('Player name is required');
  if (!positions?.length) throw new Error('At least one position is required');
  
  const { data, error } = await supabase
    .from('team_roster')
    .insert({
      team_id: teamId,
      name: name.trim(),
      number: number?.trim() || null,
      positions: positions, // Send as array directly, don't join to string
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  
  return data;
};

const checkAdminAccess = async (teamId, userId) => {
  if (!userId) throw new Error('User ID is required');
  if (!teamId) throw new Error('Team ID is required');
  
  console.log('Checking admin access for:', { userId, teamId });

  // First try to get the team member record
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .eq('team_members_user_id', userId)
    .single();
    
  console.log('Team member check result:', { data, error });

  if (error) {
    console.error('Team member check failed:', error);
    throw error;
  }

  if (!data) {
    throw new Error('User is not a member of this team');
  }

  // Now check if they're an admin using the correct function name
  const { data: adminData, error: adminError } = await supabase
    .rpc('is_team_admin', {  // Changed from check_team_admin_access to is_team_admin
      check_team_id: teamId, // Changed parameter names to match function definition
      check_user_id: userId
    });

  console.log('Admin check result:', { adminData, adminError });

  if (adminError) {
    console.error('Admin check failed:', adminError);
    throw adminError;
  }

  if (!adminData) {
    throw new Error('User is not an admin of this team');
  }

  return true;
};

const updateRosterEntry = async (teamId, rosterId, { name, number }) => {
  // First check admin access
  await checkAdminAccess(teamId, supabase.auth.user()?.id);

  const { data, error } = await supabase
    .from('team_roster')
    .update({ 
      name, 
      number,
      updated_at: new Date().toISOString() 
    })
    .eq('team_id', teamId)
    .eq('id', rosterId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

const joinTeam = async (playerId, teamId, rosterEntryId) => {
  const { data, error } = await supabase
    .from('player_team_memberships')
    .insert([{
      player_profile_user_id: playerId,
      team_id: teamId,
      roster_entry_id: rosterEntryId
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

const getUnclaimedRosterEntries = async (teamId) => {
  const { data, error } = await supabase
    .from('team_roster')
    .select('*')
    .eq('team_id', teamId)
    .is('user_id', null); // Only get unclaimed entries
    
  if (error) throw error;
  return data;
};

const claimRosterEntry = async ({ team_members_user_id, rosterId, teamId, teamPassword }) => {
  // First verify team password
  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select('score_sheet_password') // We'll use the same password field for both purposes
    .eq('id', teamId)
    .single();
    
  if (teamError) throw teamError;
  
  if (teamData.score_sheet_password !== teamPassword) {
    throw new Error('Invalid team password');
  }

  // If password is correct, proceed with claiming roster entry
  const { error: rosterError } = await supabase
    .from('team_roster')
    .update({ team_members_user_id })
    .eq('id', rosterId)
    .eq('team_id', teamId);
    
  if (rosterError) throw rosterError;

  // Then create/update the player profile
  const { error: profileError } = await supabase
    .from('player_profiles')
    .upsert({
      profile_user_id: team_members_user_id,
      team_id: teamId,
      roster_entry_id: rosterId,
      is_public: false
    });
    
  if (profileError) throw profileError;
};

const getTeamPlayers = async (teamId) => {
  const { data, error } = await supabase
    .from('team_players')  // Separate from auth profiles
    .select(`
      id,
      first_name,
      last_name,
      jersey_number,
      position,
      avatar_url,
      is_public,
      bio,
      season_stats:player_season_stats(*)
    `)
    .eq('team_id', teamId);
    
  if (error) throw error;
  return data;
};

const updateTeamPlayer = async (playerId, updates) => {
  const { data, error } = await supabase
    .from('team_players')
    .update(updates)
    .eq('id', playerId)
    .single();
    
  if (error) throw error;
  return data;
};

const getSchedule = async (teamId) => {
  // No need to check can_view_game explicitly since the RLS policy handles it
  const { data, error } = await supabase
    .from('games')
    .select(`
      id,
      team_id,
      date,
      time,
      opponent,
      location,
      is_home,
      status
    `)
    .eq('team_id', teamId)
    .order('date', { ascending: true });
    
  if (error) throw error;
  return data || [];
};

const getPlayerOfWeek = async (teamId) => {
  const { data, error } = await supabase
    .from('player_of_week')
    .select(`
      id,
      week_start,
      week_end,
      achievements,
      player_id
    `)
    .eq('team_id', teamId)
    .order('week_start', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

const getNews = async (teamId) => {
  const { data, error } = await supabase
    .from('news') // Assuming the table name is 'news' instead of 'team_news'
    .select(`
      id,
      title,
      content,
      published_at,
      image_url
    `)
    .eq('team_id', teamId)
    .order('published_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

const getSocialConfig = async (teamId) => {
  const { data, error } = await supabase
    .from('team_social_config')
    .select('*')
    .eq('team_id', teamId)
    .maybeSingle();
    
  if (error && error.code !== 'PGRST116') throw error;
  
  return {
    embedCode: data?.embed_code || '',
    socialLinks: data?.social_links || []  // Changed from {} to []
  };
};

const addGameScore = async (teamId, scoreData) => {
  const { data, error } = await supabase
    .from('game_scores')
    .insert([{
      team_id: teamId,
      opponent: scoreData.opponent,
      date: scoreData.date,
      location: scoreData.location,
      home_score: scoreData.homeScore,
      away_score: scoreData.awayScore,
      is_home_team: scoreData.isHomeTeam
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

const getTeamGameScores = async (teamId) => {
  const { data, error } = await supabase
    .from('game_scores')
    .select('*')
    .eq('team_id', teamId)
    .order('date', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

const connectProfileToRoster = async ({ profileId, rosterId }) => {
  const { error } = await supabase
    .from('player_profiles')
    .upsert({
      profile_user_id: profileId,
      roster_entry_id: rosterId
    });
    
  if (error) throw error;
};

const addGameToSchedule = async (teamId, gameData) => {
  // Get current user using the correct method
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Not authenticated');

  // First verify admin access using existing function
  const { data: isAdmin, error: accessError } = await supabase
    .rpc('is_team_admin', {
      check_team_id: teamId,
      check_user_id: user.id
    });

  if (accessError) throw accessError;
  if (!isAdmin) throw new Error('Not authorized to manage games');

  // Extract only the fields that exist in the games table
  const gamePayload = {
    team_id: teamId,
    date: gameData.date,
    time: gameData.time,
    opponent: gameData.opponent,
    location: gameData.location,
    is_home: gameData.isHome || false,
    status: gameData.status || 'scheduled',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('games')
    .insert(gamePayload)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

const deleteRosterPlayer = async (teamId, playerId) => {
  if (!teamId) throw new Error('Team ID is required');
  if (!playerId) throw new Error('Player ID is required');
  
  const { error } = await supabase
    .from('team_roster')
    .delete()
    .eq('team_id', teamId)
    .eq('id', playerId);
    
  if (error) throw error;
};

const updateRosterPlayer = async (teamId, playerId, { name, number, positions }) => {
  if (!teamId) throw new Error('Team ID is required');
  if (!playerId) throw new Error('Player ID is required');
  if (!name) throw new Error('Player name is required');
  if (!positions?.length) throw new Error('At least one position is required');
  
  const { data, error } = await supabase
    .from('team_roster')
    .update({
      name: name.trim(),
      number: number?.trim() || null,
      positions,
      updated_at: new Date().toISOString()
    })
    .eq('team_id', teamId)
    .eq('id', playerId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Export as a service object
export const teamInfoService = {
  getTeamRoster,
  addPlayerToRoster,
  updateRosterEntry,
  joinTeam,
  getUnclaimedRosterEntries,
  claimRosterEntry,
  getTeamPlayers,
  updateTeamPlayer,
  addGameToSchedule,
  getSchedule,
  getPlayerOfWeek,
  getNews,
  getSocialConfig,
  addGameScore,
  getTeamGameScores,
  connectProfileToRoster,
  deleteRosterPlayer,
  updateRosterPlayer
};

export {
  addPlayerToRoster,
  updateRosterEntry
};






































