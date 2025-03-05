import { supabase, STORAGE_BUCKETS } from '../lib/supabaseClient';
import { DEFAULT_IMAGES } from '../constants/assets';

export const getStorageUrl = (path, bucket) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  const { data: { publicUrl } } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path);
    
  return publicUrl;
};

export const getMediaUrl = (url, type = 'photo') => {
  if (!url) return null;
  
  // If URL starts with http or https, it's already a valid external URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a storage path, generate the proper URL
  return getStorageUrl(url, STORAGE_BUCKETS.TEAM_LOGOS);
};
