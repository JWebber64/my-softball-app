import { supabase } from '../lib/supabaseClient';

export async function signInWithGoogle(role) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/team-admin`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
        skipBrowserRedirect: false, // Explicitly set to false
        scopes: 'email profile',    // Explicitly specify required scopes
      }
    });
    
    if (error) throw error;

    // After successful sign in, update the user's role
    if (data?.user) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role: role }
      });
      if (updateError) throw updateError;
    }

    return data;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}
