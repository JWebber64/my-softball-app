import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './constants/roles';
import AuthCallback from './pages/AuthCallback';
import HomePage from './pages/HomePage';
import LeagueAdminPage from './pages/LeagueAdminPage';
import LeagueInfoPage from './pages/LeagueInfoPage';
import NotFound from './pages/NotFound';
import ProfilePage from './pages/ProfilePage';
import ScoreSheetsPage from './pages/ScoreSheetsPage';
import SignInPage from './pages/SignInPage';
import TeamAdminPage from './pages/TeamAdminPage';
import TeamInfoPage from './pages/TeamInfoPage';
import TeamStatsPage from './pages/TeamStatsPage';

const AppRoutes = () => {
  console.log('AppRoutes rendering');
  
  return (
    <Routes>
      {/* All routes with layout */}
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/" element={<HomePage />} />
        
        {/* Auth routes */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Profile route */}
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Team routes */}
        <Route 
          path="/team-admin" 
          element={
            <ProtectedRoute requiredRole={ROLES.TEAM_ADMIN}>
              <TeamAdminPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/team-info" element={<TeamInfoPage />} />
        <Route path="/team/:id" element={<TeamInfoPage />} />
        <Route path="/team-stats" element={<TeamStatsPage />} />
        <Route path="/score-sheets" element={<ScoreSheetsPage />} />
        
        {/* League routes */}
        <Route path="/league-info" element={<LeagueInfoPage />} />
        <Route path="/league-admin" element={<LeagueAdminPage />} />

        {/* Catch unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;













