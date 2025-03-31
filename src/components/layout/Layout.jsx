import { Box, useDisclosure } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router-dom';
import { ROUTER_CONFIG } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });
  const { user } = useAuth();
  const location = useLocation();
  const sidebarWidth = isOpen ? '240px' : '60px';

  // Check if we should show sidebar
  const shouldShowSidebar = () => {
    if (!user && (
      location.pathname === ROUTER_CONFIG.ROUTES.HOME || 
      location.pathname === ROUTER_CONFIG.ROUTES.SIGNIN
    )) {
      return false;
    }
    return true;
  };

  const showSidebar = shouldShowSidebar();

  return (
    <Box display="flex">
      {showSidebar && (
        <Sidebar 
          isCollapsed={!isOpen} 
          onToggle={onToggle}
        />
      )}
      <Box
        flex="1"
        marginLeft={showSidebar ? sidebarWidth : "0"}
        transition="all 0.2s"
        minHeight="100vh"
        position="relative"
        display="flex"
        flexDirection="column"
      >
        <Header sidebarWidth={showSidebar ? sidebarWidth : "0"} />
        <Box 
          as="main"
          pt="80px"
          flex="1"
          px={4}
        >
          <Outlet />
        </Box>
        <Footer sidebarWidth="0" />
      </Box>
    </Box>
  );
};

export default Layout;





























