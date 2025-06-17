import { supabase } from '../lib/supabaseClient';

export const updateProfile = async ({ userId, first_name, last_name, jersey_number, positions, is_public, profile_image_url }) => {
  if (!userId) throw new Error('User ID is required');

  // Convert positions array to a string for the position column
  const position = Array.isArray(positions) && positions.length > 0 
    ? positions.join(', ') 
    : null;

  const { data, error } = await supabase
    .from('player_profiles')
    .update({
      first_name,
      last_name,
      jersey_number,
      position, // Use singular 'position' column
      is_public,
      profile_image_url,
      updated_at: new Date().toISOString()
    })
    .eq('profile_user_id', userId) // Make sure we're using the correct column name for the user ID
    .select()
    .single();

  if (error) throw error;
  return data;
};



