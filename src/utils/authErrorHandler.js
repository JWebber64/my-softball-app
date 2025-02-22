export const getAuthErrorMessage = (error) => {
  if (!error) return null;

  // Supabase specific error codes
  const errorCode = error?.message?.toLowerCase() || '';
  
  if (errorCode.includes('invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (errorCode.includes('email not confirmed')) {
    return 'Please verify your email address before logging in.';
  }
  if (errorCode.includes('user already registered')) {
    return 'An account with this email already exists.';
  }
  if (errorCode.includes('password should be')) {
    return 'Password must be at least 6 characters long.';
  }
  if (errorCode.includes('rate limit exceeded')) {
    return 'Too many attempts. Please try again in a few minutes.';
  }
  if (errorCode.includes('invalid oauth')) {
    return 'There was a problem with Google sign-in. Please try again.';
  }
  if (errorCode.includes('access token')) {
    return 'Your session has expired. Please sign in again.';
  }
  if (errorCode.includes('network')) {
    return 'Network error. Please check your internet connection.';
  }

  // Default error message
  return error.message || 'An unexpected error occurred. Please try again.';
};

export const handleAuthError = (error, showNotification) => {
  const message = getAuthErrorMessage(error);
  showNotification(message, 'error', 7000); // Show error messages longer
  return message;
};

export const handleAuthSuccess = (action, showNotification) => {
  let message;
  let duration = 5000;

  switch (action) {
    case 'signin':
      message = 'Successfully signed in! Welcome back! 👋';
      break;
    case 'signup':
      message = 'Account created successfully! Please check your email for verification. ✉️';
      duration = 8000; // Show verification messages longer
      break;
    case 'signout':
      message = 'Successfully signed out. See you soon! 👋';
      break;
    case 'reset':
      message = 'Password reset email sent. Please check your inbox. ✉️';
      duration = 8000;
      break;
    case 'update':
      message = 'Your profile has been updated successfully! ✅';
      break;
    case 'verify':
      message = 'Email verified successfully! You can now sign in. ✅';
      break;
    default:
      message = 'Operation completed successfully! ✅';
  }
  
  showNotification(message, 'success', duration);
  return message;
};

export const handleAuthWarning = (message, showNotification) => {
  showNotification(message, 'warning', 6000);
  return message;
};
