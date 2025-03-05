import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  }
});

export const STORAGE_BUCKETS = {
  TEAM_LOGOS: 'team-logos',
  TEAM_ASSETS: 'team-assets',
  SCORESHEETS: 'scoresheets',
  PLAYER_PHOTOS: 'player-photos'
};

export const checkUserIsAdmin = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.role === 'admin' || data?.role === 'team-admin';
  } catch (error) {
    console.error('Error in checkUserIsAdmin:', error);
    return false;
  }
};

export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('count');
    
    return !error;
  } catch (error) {
    console.error('Connection check failed:', error);
    return false;
  }
};

export const checkSupabaseConnectionDetailed = async () => {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('count');
    
    return {
      isConnected: !error,
      error: error,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      isConnected: false,
      error: error,
      timestamp: new Date().toISOString()
    };
  }
};

export const monitorConnection = () => {
  let interval;
  
  const startMonitoring = () => {
    interval = setInterval(async () => {
      const status = await checkSupabaseConnection();
      console.log('Connection status:', status ? 'connected' : 'disconnected');
    }, 30000); // Check every 30 seconds
  };

  const stopMonitoring = () => {
    if (interval) {
      clearInterval(interval);
    }
  };

  return { startMonitoring, stopMonitoring };
};
