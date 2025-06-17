import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTeam } from '../../hooks/useTeam';
import LoadingSpinner from '../common/LoadingSpinner';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ isPublic = false }) => {
  const { loading: teamLoading } = useTeam();
  const { isAuthenticated } = useAuth();
  const [sidebarWidth, setSidebarWidth] = useState("240px");
  const [isInitialized, setIsInitialized] = useState(false);
  const location = useLocation();

  // Check if current route is admin page
  const isAdminPage = location.pathname.includes('/team/admin');
  const isSignInPage = location.pathname === '/signin';
  
  // Check if current route is team info or stats page
  const isTeamPage = location.pathname.includes('/team/') || 
                     location.pathname.includes('/team-stats');
  
  // Determine if sidebar should be shown
  const showSidebar = isAuthenticated || isTeamPage;

  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebarWidth') || "240px";
    setSidebarWidth(savedWidth);
    setIsInitialized(true);
  }, []);

  if (!isInitialized || (!isPublic && teamLoading && !isAdminPage && !isTeamPage)) {
    return <LoadingSpinner message="Loading..." />;
  }
  
  return (
    <Box minH="100vh" bg="brand.background">
      {/* Show sidebar for authenticated users or team pages */}
      {showSidebar && (
        <Sidebar 
          width={sidebarWidth} 
          onWidthChange={setSidebarWidth}
        />
      )}
      
      <Box
        ml={showSidebar ? sidebarWidth : "0"}
        transition="margin-left 0.3s"
      >
        <Header sidebarWidth={showSidebar ? sidebarWidth : "0"} />
        <Box as="main" p={4}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;














