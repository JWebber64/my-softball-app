import { supabase } from '../lib/supabaseClient';

export const updateProfile = async (profileData) => {
  const { error } = await supabase
    .from('player_profiles')
    .update({ 
      profile_image_url: profileData.profile_image_url,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      jersey_number: profileData.jersey_number || null,
      position: profileData.position,
      is_public: profileData.is_public,
      updated_at: new Date().toISOString()
    })
    .eq('profile_user_id', profileData.userId);

  if (error) throw error;
};



