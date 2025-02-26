import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Enhanced client configuration with better reconnection settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    },
    // Add reconnection config for realtime subscriptions
    reconnect: true,
    timeout: 60000, // Longer timeout (60 seconds)
    retryAttempts: 5, // More retry attempts
    retryBackoff: true // Exponential backoff for retries
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'x-application-name': 'team-stats' }
  },
  // Increase retry attempts and interval for all operations
  retryAttempts: 5,
  retryInterval: 2000
})

// Add a connection monitor function that can be called periodically
export const monitorConnection = () => {
  let connectionCheckInterval;
  
  const startMonitoring = (checkIntervalMs = 30000) => {
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval);
    }
    
    connectionCheckInterval = setInterval(async () => {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        console.warn('Connection check failed, attempting to reconnect...');
        // Force a reconnection attempt
        const { data, error } = await supabase.auth.refreshSession();
        console.log('Reconnection attempt result:', error ? 'Failed' : 'Success');
      }
    }, checkIntervalMs);
    
    return () => clearInterval(connectionCheckInterval);
  };
  
  return { startMonitoring };
};

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

// Enhanced connection health check with detailed diagnostics
export const checkSupabaseConnectionDetailed = async () => {
  const startTime = performance.now();
  const results = {
    isConnected: false,
    responseTime: 0,
    error: null,
    timestamp: new Date().toISOString(),
    details: {}
  };
  
  try {
    // Test basic query functionality
    const { data, error } = await supabase
      .from('team_news')
      .select('count')
      .limit(1)
      .single();

    if (error) throw error;
    
    // Test auth functionality
    const { data: authData, error: authError } = await supabase.auth.getSession();
    results.details.authStatus = authError ? 'error' : 'ok';
    results.details.hasSession = !!authData?.session;
    
    // Calculate response time
    results.responseTime = Math.round(performance.now() - startTime);
    results.isConnected = true;
    
    return results;
  } catch (error) {
    results.error = {
      message: error.message,
      code: error.code,
      details: error.details
    };
    results.responseTime = Math.round(performance.now() - startTime);
    console.error('Supabase connection check failed:', error);
    return results;
  }
}

// Improved retry mechanism for Supabase queries with exponential backoff
export const retryOperation = async (operation, maxAttempts = 3, initialDelay = 1000) => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`Operation failed (attempt ${attempt}/${maxAttempts}):`, error.message);
      
      if (attempt === maxAttempts) break;
      
      // Exponential backoff with jitter
      const delay = initialDelay * Math.pow(2, attempt - 1) * (0.9 + Math.random() * 0.2);
      console.log(`Retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error(`All ${maxAttempts} retry attempts failed`);
  throw lastError;
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
