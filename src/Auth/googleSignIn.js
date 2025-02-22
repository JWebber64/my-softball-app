import { supabase } from '../lib/supabaseClient';

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });
  
  if (error) {
    console.error('Error:', error.message);
    throw error;
  }
  
  return data;
}
