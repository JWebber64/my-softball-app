import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import BaseballCardProvider from '../context/BaseballCardContext';
import NotificationProvider from '../context/NotificationContext';
import { useAuth } from '../hooks/useAuth';
import AuthCallback from '../pages/AuthCallback';
import HomePage from '../pages/HomePage';
import LeagueInfoPage from '../pages/LeagueInfoPage';
import NotFoundPage from '../pages/NotFound';
import ProfilePage from '../pages/ProfilePage';
import ScoreSheetsPage from '../pages/ScoreSheetsPage';
import SignInPage from '../pages/SignInPage';
import TeamAdminPage from '../pages/TeamAdminPage';
import TeamInfoPage from '../pages/TeamInfoPage';
import TeamStatsPage from '../pages/TeamStatsPage';
import Layout from './layout/Layout';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NotificationProvider>
      <BaseballCardProvider>
        <Routes>
          {/* Auth callback route - must be outside other route groups */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Public routes */}
          <Route element={<Layout isPublic />}>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/team-info" element={<TeamInfoPage />} />
            <Route path="/team/:id" element={<TeamInfoPage />} />
            <Route path="/team-stats" element={<TeamStatsPage />} />
          </Route>

          {/* Home route - conditionally public */}
          <Route element={<Layout isPublic={!isAuthenticated} />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          {/* All authenticated routes, including admin */}
          {isAuthenticated ? (
            <Route element={<Layout />}>
              <Route path="/score-sheets" element={<ScoreSheetsPage />} />
              <Route path="/league-info" element={<LeagueInfoPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/team-admin" element={<TeamAdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/signin" replace />} />
          )}
        </Routes>
      </BaseballCardProvider>
    </NotificationProvider>
  );
};

export default AppContent;




