import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  storage: {
    defaultBucket: import.meta.env.VITE_STORAGE_BUCKET || 'scoresheets',
  },
});

export const checkSupabaseConnection = async () => {
  try {
    // Try to make a simple query to test the connection
    const { data, error } = await supabase
      .from('user_roles')
      .select('count')
      .limit(1);

    if (error) {
      return {
        status: 'error',
        error: error.message,
        details: {
          url: supabaseUrl,
          code: error.code,
          hint: error.hint || 'Check your environment variables and database access'
        }
      };
    }

    return {
      status: 'connected',
      details: {
        url: supabaseUrl,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      details: {
        url: supabaseUrl,
        type: 'Connection Error',
        hint: 'Check if Supabase is running and accessible'
      }
    };
  }
};

export const deleteStorageFile = async (bucket, fileName) => {
  if (!fileName) return;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);

  if (error) throw error;
};

export const initializeUserRole = async (userId) => {
  if (!userId) return;

  try {
    // First check if role exists
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('role_user_id', userId)
      .maybeSingle();

    if (checkError) throw checkError;

    // If no role exists, create default
    if (!existingRole) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          role_user_id: userId,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error initializing user role:', error);
    throw error; // Re-throw to handle in calling code
  }
};

