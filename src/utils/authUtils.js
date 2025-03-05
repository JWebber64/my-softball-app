export const clearAuthState = () => {
  // Clear all auth-related localStorage items
  const authItems = [
    'supabase.auth.token',
    'bypassRedirect',
    'bypassTimestamp',
    'activeTeamId',
    'supabase.auth.refreshToken',
    'supabase.auth.accessToken',
  ];
  
  // Clear localStorage items
  authItems.forEach(item => localStorage.removeItem(item));
  localStorage.clear(); // Clear all for good measure
  
  // Clear session cookies
  document.cookie.split(";").forEach(cookie => {
    document.cookie = cookie
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });

  // Clear any remaining Supabase session
  if (window.supabase) {
    window.supabase.auth.signOut();
  }
};

export const handleAuthError = (error, showNotification) => {
  clearAuthState(); // Clear auth state on error
  const message = getAuthErrorMessage(error);
  showNotification(message, 'error', 7000);
  return message;
};
