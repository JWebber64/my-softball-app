import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  },
  storage: {
    retryAttempts: 3,
    retryInterval: 1000
  }
})

export const checkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth check error:', error);
      throw error;
    }
    
    if (!session) {
      throw new Error('User must be authenticated to perform this action');
    }
    
    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    throw error;
  }
}

export const initializeStorage = async () => {
  try {
    // First check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User must be authenticated to initialize storage');
    }

    // List all buckets to check if our bucket exists
    const { data: bucketList, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      throw listError;
    }

    const scoreSheetsBucket = bucketList?.find(bucket => bucket.name === 'scoresheets');

    if (!scoreSheetsBucket) {
      console.log('Scoresheets bucket not found, creating...');
      
      // Create bucket with configuration
      const { data: newBucket, error: createError } = await supabase
        .storage
        .createBucket('scoresheets', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        });

      if (createError) {
        console.error('Bucket creation error:', createError);
        throw createError;
      }

      console.log('Storage bucket created successfully:', newBucket);
    } else {
      console.log('Scoresheets bucket already exists');
    }

    // Update bucket public access
    const { error: updateError } = await supabase
      .storage
      .updateBucket('scoresheets', {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

    if (updateError) {
      console.error('Bucket update error:', updateError);
      throw updateError;
    }

    console.log('Storage initialized successfully');
    return true;
  } catch (error) {
    console.error('Storage initialization error:', error);
    throw new Error(`Storage initialization failed: ${error.message}`);
  }
}
