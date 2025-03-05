// Remove unused import

export const clearAuthState = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

export const handleAuthError = (error) => {
  console.error('Authentication error:', error);
  clearAuthState();
  return {
    success: false,
    message: error.message
  };
};

export const handleAuthSuccess = (session) => {
  return {
    success: true,
    user: session?.user
  };
};

// Then export the consolidated object
export const authUtils = {
  clearAuthState,
  handleAuthError,
  handleAuthSuccess
};
