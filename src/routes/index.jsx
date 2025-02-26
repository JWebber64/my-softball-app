import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ErrorBoundary from '../components/ErrorBoundary';

// Import pages
import LandingPage from '../pages/LandingPage';
import ScoreSheetsPage from '../pages/ScoreSheetsPage';
import TeamStatsPage from '../pages/TeamStatsPage';
import TeamAdminPage from '../pages/TeamAdminPage';
import TeamInfoPage from '../pages/TeamInfoPage';
import LeagueAdminPage from '../pages/LeagueAdminPage';
import LeagueInfoPage from '../pages/LeagueInfoPage';
import TestPage from '../pages/TestPage';
import SimplePage from '../pages/SimplePage';
import NotFound from '../pages/NotFound';
import DebugPage from '../pages/DebugPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <ErrorBoundary>
          <Layout><Outlet /></Layout>
        </ErrorBoundary>
      }>
        <Route index element={<ErrorBoundary><LandingPage /></ErrorBoundary>} />
        <Route path="/scoresheets" element={<ErrorBoundary><ScoreSheetsPage /></ErrorBoundary>} />
        <Route path="/team-stats" element={<ErrorBoundary><TeamStatsPage /></ErrorBoundary>} />
        <Route path="/team-admin" element={<ErrorBoundary><TeamAdminPage /></ErrorBoundary>} />
        <Route path="/team-info" element={<ErrorBoundary><TeamInfoPage /></ErrorBoundary>} />
        <Route path="/league-admin" element={<ErrorBoundary><LeagueAdminPage /></ErrorBoundary>} />
        <Route path="/league-info" element={<ErrorBoundary><LeagueInfoPage /></ErrorBoundary>} />
        <Route path="/test-page" element={<ErrorBoundary><TestPage /></ErrorBoundary>} />
        <Route path="/simple" element={<ErrorBoundary><SimplePage /></ErrorBoundary>} />
        <Route path="/debug" element={<ErrorBoundary><DebugPage /></ErrorBoundary>} />
        <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
