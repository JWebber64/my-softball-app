import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  VStack,
  Button,
  Text,
  Divider,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
  Flex,
  useToast,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useSimpleAuth } from '../../context/SimpleAuthContext';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  isCollapsed = false, 
  onToggleCollapse = () => {} 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { signOut } = useSimpleAuth();
  const toast = useToast();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const handleLogout = async () => {
    const { success } = await signOut();
    if (success) {
      console.log("Logout successful");
      navigate('/');
    } else {
      console.error("Logout failed");
    }
    if (isMobile) onClose();
  };
  
  const handleNavigation = (path) => {
    // For home route, use a completely different approach
    if (path === '/') {
      console.log("FORCE NAVIGATING TO HOME with complete reset");
      
      try {
        // Clear ALL localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        
        // Set only the essential bypass flag with a fresh timestamp
        const timestamp = new Date().getTime();
        localStorage.setItem('bypassRedirect', 'true');
        localStorage.setItem('bypassTimestamp', timestamp.toString());
        console.log(`Reset storage and set bypass flags at ${timestamp}`);
        
        // Force reload the page completely, bypassing cache
        document.location.href = '/?forcereload=' + timestamp;
        
        // As an extra measure, if the above doesn't trigger immediately
        setTimeout(() => {
          window.location.replace('/');
        }, 100);
        
        return;
      } catch (error) {
        console.error("Critical navigation error:", error);
        // Last resort - most basic approach
        window.location = '/';
      }
      return;
    }
    
    // For other routes, navigate normally
    navigate(path);
    if (isMobile) onClose();
  };
  
  // Button style to apply consistently
  const buttonStyle = {
    width: "100%",
    justifyContent: isCollapsed ? "center" : "center",
    textAlign: "center",
    borderRadius: "1rem",
    py: 2,
    _focus: { boxShadow: "none", outline: "none" },
    overflow: "visible"
  };
  
  // Main navigation content
  const navigationContent = (
    <VStack spacing={4} align="stretch" w="full">
      {!isCollapsed && (
        <>
          <Text fontWeight="bold" fontSize="lg" color="brand.text">Main Menu</Text>
          <Divider borderColor="brand.border" />
        </>
      )}
      
      {/* Add top margin to the first button when collapsed to avoid overlap with toggle button */}
      <Tooltip label="Home" placement="right" isDisabled={!isCollapsed}>
        <Button
          variant={isActive('/') ? 'primary' : 'ghost'}
          onClick={() => handleNavigation('/')}
          {...buttonStyle}
          mt={isCollapsed ? 10 : 0} // Add top margin when collapsed
        >
          {isCollapsed ? "H" : "Home"}
        </Button>
      </Tooltip>
      
      {!isCollapsed && (
        <>
          <Text fontWeight="bold" fontSize="md" color="brand.text" mt={2}>Team</Text>
          <Divider borderColor="brand.border" />
        </>
      )}
      
      <Tooltip label="Score Sheets" placement="right" isDisabled={!isCollapsed}>
        <Button
          variant={isActive('/scoresheets') ? 'primary' : 'ghost'}
          onClick={() => handleNavigation('/scoresheets')}
          {...buttonStyle}
        >
          {isCollapsed ? "SS" : "Score Sheets"}
        </Button>
      </Tooltip>
      
      <Tooltip label="Team Stats" placement="right" isDisabled={!isCollapsed}>
        <Button
          variant={isActive('/team-stats') ? 'primary' : 'ghost'}
          onClick={() => handleNavigation('/team-stats')}
          {...buttonStyle}
        >
          {isCollapsed ? "TS" : "Team Stats"}
        </Button>
      </Tooltip>
      
      <Tooltip label="Team Info" placement="right" isDisabled={!isCollapsed}>
        <Button
          variant={isActive('/team-info') ? 'primary' : 'ghost'}
          onClick={() => handleNavigation('/team-info')}
          {...buttonStyle}
        >
          {isCollapsed ? "TI" : "Team Info"}
        </Button>
      </Tooltip>
      
      <Tooltip label="Team Admin" placement="right" isDisabled={!isCollapsed}>
        <Button
          variant={isActive('/team-admin') ? 'primary' : 'ghost'}
          onClick={() => handleNavigation('/team-admin')}
          {...buttonStyle}
        >
          {isCollapsed ? "TA" : "Team Admin"}
        </Button>
      </Tooltip>
      
      {!isCollapsed && (
        <>
          <Text fontWeight="bold" fontSize="md" color="brand.text" mt={2}>League</Text>
          <Divider borderColor="brand.border" />
        </>
      )}
      
      <Tooltip label="League Info" placement="right" isDisabled={!isCollapsed}>
        <Button
          variant={isActive('/league-info') ? 'primary' : 'ghost'}
          onClick={() => handleNavigation('/league-info')}
          {...buttonStyle}
        >
          {isCollapsed ? "LI" : "League Info"}
        </Button>
      </Tooltip>
      
      <Tooltip label="League Admin" placement="right" isDisabled={!isCollapsed}>
        <Button
          variant={isActive('/league-admin') ? 'primary' : 'ghost'}
          onClick={() => handleNavigation('/league-admin')}
          {...buttonStyle}
        >
          {isCollapsed ? "LA" : "League Admin"}
        </Button>
      </Tooltip>
    </VStack>
  );
  
  // Logout section
  const logoutSection = (
    <Box w="full" mt={4} pb={4}>
      {!isCollapsed && (
        <>
          <Text fontWeight="bold" fontSize="md" color="brand.text">Account</Text>
          <Divider borderColor="brand.border" mb={4} />
        </>
      )}
      
      <Tooltip label="Logout" placement="right" isDisabled={!isCollapsed}>
        <Button
          variant="logout"
          onClick={handleLogout}
          {...buttonStyle}
        >
          {isCollapsed ? "X" : "Logout"}
        </Button>
      </Tooltip>
    </Box>
  );
  
  // Combined sidebar content with flex layout to push logout to bottom
  const sidebarContent = (
    <Flex direction="column" h="full" p={isCollapsed ? 2 : 4}>
      <Box flex="1" overflowY="auto" pr={isCollapsed ? 0 : 2}>
        {navigationContent}
      </Box>
      {logoutSection}
    </Flex>
  );
  
  // For mobile: render in a drawer
  if (isMobile) {
    return (
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent 
          bg="#111613"
          bgGradient="linear(to-r, #111613, #2e3726, #111613)"
        >
          <DrawerCloseButton color="brand.text" _focus={{ boxShadow: "none", outline: "none" }} />
          <DrawerHeader borderBottomWidth="1px" borderColor="brand.border">
            Diamond Data
          </DrawerHeader>
          <DrawerBody p={0}>
            {sidebarContent}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }
  
  // For desktop: render as a fixed sidebar
  return (
    <Box
      position="fixed"
      left={0}
      w={isCollapsed ? "60px" : "250px"}
      top={0}
      bottom={0}
      bg="#111613"
      bgGradient="linear(to-b, #111613, #2e3726, #111613)"
      borderRight="1px"
      borderRightColor="brand.border"
      display={{ base: 'none', md: 'block' }}
      zIndex="1"
      overflowY="auto"
      transition="width 0.3s ease"
      sx={{
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#2e3726",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#7c866b",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#6b7660",
        },
      }}
    >
      {/* Collapse toggle button - positioned at the top */}
      <Box 
        position="absolute" 
        top="10px" 
        width="100%" 
        display="flex" 
        justifyContent={isCollapsed ? "center" : "flex-end"}
        px={3}
        zIndex="2"
      >
        <IconButton
          icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          size="sm"
          variant="ghost"
          color="brand.text"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          _focus={{ boxShadow: "none", outline: "none" }}
        />
      </Box>
      {sidebarContent}
    </Box>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func
};

export default Sidebar;
