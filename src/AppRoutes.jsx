import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { useSimpleAuth } from './context/SimpleAuthContext';
import { ROUTER_CONFIG } from './constants/routing';
import PropTypes from 'prop-types';

// Import pages
import HomePage from './pages/HomePage';
import ScoreSheetsPage from './pages/ScoreSheetsPage';
import TeamStatsPage from './pages/TeamStatsPage';
import TeamAdminPage from './pages/TeamAdminPage';
import TeamInfoPage from './pages/TeamInfoPage';
import LeagueAdminPage from './pages/LeagueAdminPage';
import LeagueInfoPage from './pages/LeagueInfoPage';
import SimplePage from './pages/SimplePage';
import SignInPage from './pages/SignInPage';
import NotFound from './pages/NotFound';
import DebugPage from './pages/DebugPage';
import TestPage from './pages/TestPage';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useSimpleAuth();

  if (loading) {
    return <Layout showSidebar={false}><div>Loading...</div></Layout>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTER_CONFIG.ROUTES.SIGNIN} replace />;
  }

  if (requiredRole && (!user?.role || !user.role.includes(requiredRole))) {
    return <Navigate to={ROUTER_CONFIG.ROUTES.HOME} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string
};

const AppRoutes = () => {
  const { loading } = useSimpleAuth();

  if (loading) {
    return (
      <Layout showSidebar={false} showFooter={false}>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Routes>
      <Route
        path={ROUTER_CONFIG.ROUTES.HOME}
        element={
          <ErrorBoundary>
            <Layout showSidebar={true} showFooter={true}>
              <HomePage />
            </Layout>
          </ErrorBoundary>
        }
      />

      <Route
        path={ROUTER_CONFIG.ROUTES.SIGNIN}
        element={
          <ErrorBoundary>
            <Layout showSidebar={false} showFooter={false}>
              <SignInPage />
            </Layout>
          </ErrorBoundary>
        }
      />

      {/* Protected Routes */}
      <Route
        path={ROUTER_CONFIG.ROUTES.SCORESHEETS}
        element={
          <ProtectedRoute requiredRole="scoresheets">
            <Layout showSidebar={true} showFooter={true}>
              <ScoreSheetsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTER_CONFIG.ROUTES.TEAM_STATS}
        element={
          <ProtectedRoute requiredRole="team-stats">
            <Layout showSidebar={true} showFooter={true}>
              <TeamStatsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTER_CONFIG.ROUTES.TEAM_ADMIN}
        element={
          <ProtectedRoute requiredRole="team-admin">
            <Layout showSidebar={true} showFooter={true}>
              <TeamAdminPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTER_CONFIG.ROUTES.TEAM_INFO}
        element={
          <ProtectedRoute>
            <Layout showSidebar={true} showFooter={true}>
              <TeamInfoPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTER_CONFIG.ROUTES.LEAGUE_ADMIN}
        element={
          <ProtectedRoute requiredRole="league-admin">
            <Layout showSidebar={true} showFooter={true}>
              <LeagueAdminPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTER_CONFIG.ROUTES.LEAGUE_INFO}
        element={
          <ProtectedRoute>
            <Layout showSidebar={true} showFooter={true}>
              <LeagueInfoPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTER_CONFIG.ROUTES.DEBUG}
        element={
          <ProtectedRoute>
            <Layout showSidebar={true} showFooter={true}>
              <DebugPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTER_CONFIG.ROUTES.SIMPLE}
        element={
          <ErrorBoundary>
            <Layout showSidebar={true} showFooter={true}>
              <SimplePage />
            </Layout>
          </ErrorBoundary>
        }
      />

      <Route
        path={ROUTER_CONFIG.ROUTES.TEST}
        element={
          <ErrorBoundary>
            <Layout showSidebar={true} showFooter={true}>
              <TestPage />
            </Layout>
          </ErrorBoundary>
        }
      />

      <Route
        path="*"
        element={
          <Layout showSidebar={false} showFooter={true}>
            <NotFound />
          </Layout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
