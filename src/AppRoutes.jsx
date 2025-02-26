import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Import pages
import LandingPage from './pages/LandingPage';
import ScoreSheetsPage from './pages/ScoreSheetsPage';
import TeamStatsPage from './pages/TeamStatsPage';
import TeamAdminPage from './pages/TeamAdminPage';
import TeamInfoPage from './pages/TeamInfoPage';
import LeagueAdminPage from './pages/LeagueAdminPage';
import LeagueInfoPage from './pages/LeagueInfoPage';
import TestPage from './pages/TestPage';
import SimplePage from './pages/SimplePage';
import NotFound from './pages/NotFound';
import DebugPage from './pages/DebugPage';
import { useSimpleAuth } from './context/SimpleAuthContext';

const AppRoutes = () => {
  const { isAuthenticated, loading } = useSimpleAuth();
  
  // Show loading state if auth is still being determined
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Routes>
      <Route path="/" element={
        <ErrorBoundary>
          <Layout><Outlet /></Layout>
        </ErrorBoundary>
      }>
        <Route index element={<ErrorBoundary><LandingPage /></ErrorBoundary>} />
        <Route path="/debug" element={<ErrorBoundary><DebugPage /></ErrorBoundary>} />
        
        {/* Protected routes */}
        <Route 
          path="/team-stats" 
          element={
            <ErrorBoundary>
              {isAuthenticated ? <TeamStatsPage /> : <Navigate to="/" />}
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/team-info" 
          element={
            <ErrorBoundary>
              {isAuthenticated ? <TeamInfoPage /> : <Navigate to="/" />}
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/team-admin" 
          element={
            <ErrorBoundary>
              {isAuthenticated ? <TeamAdminPage /> : <Navigate to="/" />}
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/league-info" 
          element={
            <ErrorBoundary>
              {isAuthenticated ? <LeagueInfoPage /> : <Navigate to="/" />}
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/league-admin" 
          element={
            <ErrorBoundary>
              {isAuthenticated ? <LeagueAdminPage /> : <Navigate to="/" />}
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/scoresheets" 
          element={
            <ErrorBoundary>
              {isAuthenticated ? <ScoreSheetsPage /> : <Navigate to="/" />}
            </ErrorBoundary>
          } 
        />
        <Route path="/test-page" element={<ErrorBoundary><TestPage /></ErrorBoundary>} />
        <Route path="/simple" element={<ErrorBoundary><SimplePage /></ErrorBoundary>} />
        
        {/* Fallback route */}
        <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
