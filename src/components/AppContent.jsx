import React from 'react';
import AppRoutes from '../AppRoutes';
import { BaseballCardProvider } from '../context/BaseballCardContext';
import { NotificationProvider } from '../context/NotificationContext';
import TeamProvider from '../context/TeamProvider';

const AppContent = () => {
  return (
    <TeamProvider>
      <NotificationProvider>
        <BaseballCardProvider>
          <AppRoutes />
        </BaseballCardProvider>
      </NotificationProvider>
    </TeamProvider>
  );
};

export default AppContent;




