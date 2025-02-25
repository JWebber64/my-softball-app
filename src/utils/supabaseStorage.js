import { supabase } from './supabaseClient';

export const uploadPlayerPhoto = async (file, playerId) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${playerId}.${fileExt}`;
    const filePath = `player-photos/${fileName}`;

    const { data, error } = await supabase.storage
      .from('players')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('players')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

export const getPlayerPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  
  const { data: { publicUrl } } = supabase.storage
    .from('players')
    .getPublicUrl(photoPath);
    
  return publicUrl;
};