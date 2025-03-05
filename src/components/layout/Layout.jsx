import React, { useState, useEffect } from 'react';
import { Box, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import PropTypes from 'prop-types';

const Layout = ({ children, showSidebar = true, showFooter = true }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();  // Need isOpen for Sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  const sidebarWidth = isCollapsed ? "60px" : "250px";

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset collapse state on mobile/desktop switch
  useEffect(() => {
    if (mounted) {
      if (isMobile) {
        setIsCollapsed(false);
        onClose();
      }
    }
  }, [isMobile, mounted, onClose]);

  return (
    <Box height="100vh" overflow="hidden">
      {/* Desktop Sidebar */}
      {showSidebar && !isMobile && (
        <Box
          position="fixed"
          left={0}
          top={0}
          height="100vh"
          width={sidebarWidth}
          bg="brand.primary.base"
          zIndex={100}
          transition="all 0.3s ease"
        >
          <Sidebar
            isOpen={isOpen}  // Pass isOpen here
            onClose={onClose}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            variant="desktop"
          />
        </Box>
      )}

      {/* Main Content */}
      <Box
        marginLeft={showSidebar && !isMobile ? sidebarWidth : "0"}
        transition="margin 0.3s ease"
      >
        <Header 
          onOpenSidebar={onOpen} 
          showSidebar={showSidebar}
          isCollapsed={isCollapsed}  // Pass isCollapsed to Header
        />
        <Box as="main" pt="100px">
          {children}
        </Box>
        {showFooter && <Footer isCollapsed={isCollapsed} />}
      </Box>
    </Box>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  showSidebar: PropTypes.bool,
  showFooter: PropTypes.bool,
};

export default Layout;
