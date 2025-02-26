import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useSimpleAuth } from '../../context/SimpleAuthContext';

/**
 * Main layout component that wraps the entire application
 * Provides consistent structure with header, footer, and optional sidebar
 */
const Layout = ({ children, showSidebar = true, showFooter = true }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated } = useSimpleAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Only show sidebar if user is authenticated
  const shouldShowSidebar = showSidebar && isAuthenticated;
  
  // Handle sidebar collapse toggle
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <Flex 
      direction="column" 
      minH="100vh"
      bg="brand.background"
    >
      {/* Header is now positioned relative to accommodate the sidebar */}
      <Box
        ml={{ md: shouldShowSidebar ? (isSidebarCollapsed ? '60px' : '250px') : 0 }}
        transition="margin-left 0.3s"
      >
        <Header onOpenSidebar={onOpen} />
      </Box>
      
      <Flex flex="1">
        {shouldShowSidebar && (
          <Sidebar 
            isOpen={isOpen} 
            onClose={onClose} 
            display={{ base: 'none', md: 'block' }}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />
        )}
        
        <Box 
          as="main"
          flex="1"
          p={{ base: 4, md: 6, lg: 8 }}
          ml={{ md: shouldShowSidebar ? (isSidebarCollapsed ? '60px' : '250px') : 0 }}
          transition="margin-left 0.3s"
          pt={{ md: 2 }} // Add some padding at the top
        >
          {children}
        </Box>
      </Flex>
      
      {showFooter && (
        <Box
          ml={{ md: shouldShowSidebar ? (isSidebarCollapsed ? '60px' : '250px') : 0 }}
          transition="margin-left 0.3s"
        >
          <Footer />
        </Box>
      )}
    </Flex>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  showSidebar: PropTypes.bool,
  showFooter: PropTypes.bool
};

export default Layout;
