export const getAuthErrorMessage = (error) => {
  const errorCode = typeof error === 'string' ? error : error?.message?.toLowerCase() || '';

  const errorMap = {
    'invalid_credentials': 'Invalid email or password',
    'user_not_found': 'No account found with this email',
    'email_taken': 'An account with this email already exists',
    'weak_password': 'Password must be at least 8 characters with numbers and symbols',
    'invalid_email': 'Please enter a valid email address',
    'expired_token': 'Your session has expired. Please sign in again',
    'network_error': 'Network error. Please check your connection',
    'rate_limit': 'Too many attempts. Please try again later',
    'server_error': 'Server error. Please try again later',
    'unauthorized': 'You are not authorized to perform this action',
    'validation_error': 'Please check your input and try again',
    'role_required': 'Please select a role to continue',
    'profile_error': 'Error updating profile information',
    'auth/popup-closed-by-user': 'Sign-in window was closed. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in cancelled. Please try again.',
    'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups and try again.',
    'captcha verification process failed': 'Sign-in verification failed. Please try again or use email sign-in.',
    'auth/captcha-check-failed': 'Sign-in verification failed. Please try again or use email sign-in.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.'
  };

  return errorMap[errorCode] || 'An unexpected error occurred. Please try again.';
};

export const clearAuthState = () => {
  const authItems = [
    'supabase.auth.token',
    'bypassRedirect',
    'bypassTimestamp',
    'activeTeamId',
    'supabase.auth.refreshToken',
    'supabase.auth.accessToken',
    'supabase.auth.expires_at',
    'supabase.auth.provider',
    'last_auth_role'
  ];
  
  authItems.forEach(item => localStorage.removeItem(item));
  
  // Clear all cookies
  document.cookie.split(";").forEach(cookie => {
    document.cookie = cookie
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });
};

export const handleAuthError = (error, showNotification) => {
  const message = getAuthErrorMessage(error);
  
  if (showNotification) {
    // Call showNotification with the message string and type
    showNotification(message, 'error');
  }
  
  return message;
};

export const handleAuthSuccess = (action, showNotification) => {
  if (!showNotification) return;

  const messages = {
    signin: 'Successfully signed in! Welcome back! 👋',
    signup: 'Account created successfully! Please check your email for verification. ✉️',
    signout: 'Successfully signed out. See you soon! 👋',
    reset: 'Password reset email sent. Please check your inbox. ✉️',
    verify: 'Email verification successful! You can now sign in.',
    update: 'Account updated successfully.',
    delete: 'Account deleted successfully.',
    refresh: 'Session refreshed successfully.'
  };

  const message = messages[action] || 'Operation completed successfully.';
  
  // Call showNotification with the message string and type
  showNotification(message, 'success');
  
  return message;
};

export const handleAuthEvent = (event, showNotification) => {
  const eventMap = {
    SIGNED_IN: () => handleAuthSuccess('signin', showNotification),
    SIGNED_OUT: () => handleAuthSuccess('signout', showNotification),
    USER_UPDATED: () => handleAuthSuccess('update', showNotification),
    USER_DELETED: () => handleAuthSuccess('delete', showNotification),
    PASSWORD_RECOVERY: () => handleAuthSuccess('reset', showNotification),
    TOKEN_REFRESHED: () => handleAuthSuccess('refresh', showNotification)
  };

  const handler = eventMap[event];
  if (handler) {
    handler();
  }
};
