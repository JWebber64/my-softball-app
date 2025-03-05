import React, { useEffect } from 'react';
import { NotificationProvider } from '../context/NotificationContext';
import { AuthProvider } from '../context/AuthContext';
import { TeamProvider } from '../context/TeamContext';
import AppRoutes from '../AppRoutes';
import { useSimpleAuth } from '../context/SimpleAuthContext';
import { clearAuthState } from '../utils/authUtils';

function AppContent() {
  const { isAuthenticated } = useSimpleAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      clearAuthState();
    }
  }, [isAuthenticated]);

  return (
    <TeamProvider>
      <NotificationProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </NotificationProvider>
    </TeamProvider>
  );
}

export default AppContent;
