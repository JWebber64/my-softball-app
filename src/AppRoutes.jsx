import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import AuthCallback from './pages/AuthCallback';
import HomePage from './pages/HomePage';
import LeagueAdminPage from './pages/LeagueAdminPage';
import LeagueInfoPage from './pages/LeagueInfoPage';
import NotFound from './pages/NotFound';
import ProfilePage from './pages/ProfilePage';
import ScoreSheetsPage from './pages/ScoreSheetsPage';
import TeamAdminPage from './pages/TeamAdminPage';
import TeamInfoPage from './pages/TeamInfoPage';
import TeamStatsPage from './pages/TeamStatsPage';

const AppRoutes = () => {
  const { error, isAuthenticated } = useAuth();
  
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="auth/callback" element={<AuthCallback />} />
        <Route path="team-info" element={<TeamInfoPage />} />
        <Route path="team/:id" element={<TeamInfoPage />} />
        <Route path="team-stats" element={<TeamStatsPage />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="team-admin" element={<TeamAdminPage />} />
          <Route path="score-sheets" element={<ScoreSheetsPage />} />
          <Route path="league-info" element={<LeagueInfoPage />} />
          <Route path="league-admin" element={<LeagueAdminPage />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;


