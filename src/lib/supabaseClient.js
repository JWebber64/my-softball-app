import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'x-application-name': 'team-stats' }
  },
  retryAttempts: 3,
  retryInterval: 1000
})

// Function to check if a user has admin role
export const checkUserIsAdmin = async (userId) => {
  if (!userId) return false;
  
  try {
    // First check if there's a user_roles table
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
      
    if (userRoles && !rolesError) {
      console.log('User role from user_roles table:', userRoles);
      return userRoles.role === 'admin' || userRoles.role === 'team-admin';
    }
    
    // If no user_roles table or no entry, check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (profile && !profileError) {
      console.log('User role from profiles table:', profile);
      return profile.role === 'admin' || profile.role === 'team-admin';
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Connection health check function
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('team_news')
      .select('count')
      .limit(1)
      .single()

    if (error) throw error
    return true
  } catch (error) {
    console.error('Supabase connection check failed:', error)
    return false
  }
}

// Retry mechanism for Supabase queries
export const retryOperation = async (operation, maxAttempts = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation()
      return result
    } catch (error) {
      if (attempt === maxAttempts) throw error
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
}

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
