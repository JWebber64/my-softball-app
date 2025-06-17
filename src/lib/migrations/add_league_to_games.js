import { supabase } from '../supabaseClient';

export const addLeagueToGames = async () => {
  // 1. Add league_id column to games table
  const { error: addColumnError } = await supabase.rpc('add_column_if_not_exists', {
    table_name: 'games',
    column_name: 'league_id',
    column_type: 'uuid'
  });
  
  if (addColumnError) {
    console.error('Error adding league_id to games:', addColumnError);
    return false;
  }
  
  // 2. Add league_id column to game_scores table
  const { error: addScoreColumnError } = await supabase.rpc('add_column_if_not_exists', {
    table_name: 'game_scores',
    column_name: 'league_id',
    column_type: 'uuid'
  });
  
  if (addScoreColumnError) {
    console.error('Error adding league_id to game_scores:', addScoreColumnError);
    return false;
  }
  
  // 3. Create team_leagues junction table if it doesn't exist
  const { error: createTableError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'team_leagues',
    table_definition: `
      team_id uuid references teams(id) not null,
      league_id uuid references leagues(id) not null,
      primary key (team_id, league_id)
    `
  });
  
  if (createTableError) {
    console.error('Error creating team_leagues table:', createTableError);
    return false;
  }
  
  // 4. Create league_standings table if it doesn't exist
  const { error: createStandingsError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'league_standings',
    table_definition: `
      id uuid primary key default uuid_generate_v4(),
      league_id uuid references leagues(id) not null,
      team_id uuid references teams(id) not null,
      name text not null,
      games_played integer not null default 0,
      wins integer not null default 0,
      losses integer not null default 0,
      games_behind numeric not null default 0,
      unique(league_id, team_id)
    `
  });
  
  if (createStandingsError) {
    console.error('Error creating league_standings table:', createStandingsError);
    return false;
  }
  
  return true;
};