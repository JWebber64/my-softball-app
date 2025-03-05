import { supabase, STORAGE_BUCKETS } from '../lib/supabaseClient';

export const uploadFile = async (file, bucket) => {
  if (!Object.values(STORAGE_BUCKETS).includes(bucket)) {
    throw new Error(`Invalid bucket: ${bucket}`);
  }

  try {
    // Generate a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    console.log('Uploading file:', {
      bucket,
      fileName,
      fileType: file.type,
      fileSize: file.size
    });

    // Upload the file
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('Upload successful:', data);

    // Return only the filename - NOT the full URL
    return fileName;
  } catch (error) {
    console.error('Upload file error:', error);
    throw error;
  }
};

export const deleteFile = async (filePath, bucket) => {
  if (!Object.values(STORAGE_BUCKETS).includes(bucket)) {
    throw new Error(`Invalid bucket: ${bucket}`);
  }

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Delete file error:', error);
    throw error;
  }
};

export const cleanupTeamLogo = async (oldLogoUrl) => {
  if (!oldLogoUrl) return;
  
  try {
    // Extract filename from URL
    const urlParts = oldLogoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    await deleteFile(fileName, STORAGE_BUCKETS.TEAM_LOGOS);
  } catch (error) {
    console.error('Failed to cleanup old logo:', error);
  }
};
