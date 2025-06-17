import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return {
    loading: context.loading, // Remove the forced false value
    error: context.error,
    isAuthenticated: !!context.user,
    user: context.user,
    userRole: context.userRole
  };
};



