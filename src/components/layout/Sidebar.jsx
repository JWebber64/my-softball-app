import React from 'react';
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
  const { signOut, clearAuth } = useSimpleAuth();
  
  const isActive = (path) => location.pathname === path;
  
  const handleLogout = async () => {
    const { success } = await signOut();
    if (success) {
      clearAuth();
      navigate('/');
    }
    if (isMobile && onClose) onClose();
  };

  const handleHome = () => {
    clearAuth();
    navigate('/');
    if (isMobile && onClose) onClose();
  };
  
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onClose) onClose();
  };
  
  const buttonStyle = {
    width: "100%",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: "1rem",
    py: 1.5,
    px: isCollapsed ? 0 : 4,
    _focus: { boxShadow: "none", outline: "none" },
    overflow: "visible",
    fontSize: "sm",
    height: "40px",
    minHeight: "40px",
  };
  
  const navigationContent = (
    <VStack 
      spacing={0}
      align="stretch" 
      w="full"
      h="100%"
    >
      <Box 
        display="flex" 
        justifyContent={isCollapsed ? "center" : "flex-end"}
        p={2}
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

      {isCollapsed ? (
        <VStack 
          spacing={8}
          align="stretch" 
          pt={4}
          h="100%"
        >
          <Tooltip label="Home" placement="right">
            <Button {...buttonStyle} onClick={() => handleHome()}>H</Button>
          </Tooltip>
          <Tooltip label="Score Sheets" placement="right">
            <Button {...buttonStyle} onClick={() => handleNavigation('/scoresheets')}>SS</Button>
          </Tooltip>
          <Tooltip label="Team Stats" placement="right">
            <Button {...buttonStyle} onClick={() => handleNavigation('/team-stats')}>TS</Button>
          </Tooltip>
          <Tooltip label="Team Info" placement="right">
            <Button {...buttonStyle} onClick={() => handleNavigation('/team-info')}>TI</Button>
          </Tooltip>
          <Tooltip label="Team Admin" placement="right">
            <Button {...buttonStyle} onClick={() => handleNavigation('/team-admin')}>TA</Button>
          </Tooltip>
          <Tooltip label="League Info" placement="right">
            <Button {...buttonStyle} onClick={() => handleNavigation('/league-info')}>LI</Button>
          </Tooltip>
          <Tooltip label="League Admin" placement="right">
            <Button {...buttonStyle} onClick={() => handleNavigation('/league-admin')}>LA</Button>
          </Tooltip>
          <Tooltip label="Logout" placement="right">
            <Button 
              {...buttonStyle} 
              bg="black" 
              _hover={{ bg: "#333" }} 
              color="white"
              onClick={handleLogout}
            >
              X
            </Button>
          </Tooltip>
        </VStack>
      ) : (
        <VStack spacing={4} flex="1">
          <VStack spacing={3} align="stretch">
            <Text fontWeight="bold" fontSize="sm" color="brand.text" textAlign="center">Main Menu</Text>
            <Divider borderColor="brand.border" />
            <Button {...buttonStyle} variant={isActive('/') ? 'primary' : 'ghost'} onClick={handleHome}>
              Home
            </Button>
          </VStack>

          <VStack spacing={3} align="stretch">
            <Text fontWeight="bold" fontSize="sm" color="brand.text" textAlign="center">Team</Text>
            <Divider borderColor="brand.border" />
            <Button {...buttonStyle} variant={isActive('/scoresheets') ? 'primary' : 'ghost'} onClick={() => handleNavigation('/scoresheets')}>
              Score Sheets
            </Button>
            <Button {...buttonStyle} variant={isActive('/team-stats') ? 'primary' : 'ghost'} onClick={() => handleNavigation('/team-stats')}>
              Team Stats
            </Button>
            <Button {...buttonStyle} variant={isActive('/team-info') ? 'primary' : 'ghost'} onClick={() => handleNavigation('/team-info')}>
              Team Info
            </Button>
            <Button {...buttonStyle} variant={isActive('/team-admin') ? 'primary' : 'ghost'} onClick={() => handleNavigation('/team-admin')}>
              Team Admin
            </Button>
          </VStack>

          <VStack spacing={3} align="stretch">
            <Text fontWeight="bold" fontSize="sm" color="brand.text" textAlign="center">League</Text>
            <Divider borderColor="brand.border" />
            <Button {...buttonStyle} variant={isActive('/league-info') ? 'primary' : 'ghost'} onClick={() => handleNavigation('/league-info')}>
              League Info
            </Button>
            <Button {...buttonStyle} variant={isActive('/league-admin') ? 'primary' : 'ghost'} onClick={() => handleNavigation('/league-admin')}>
              League Admin
            </Button>
          </VStack>

          <VStack spacing={3} align="stretch">
            <Text fontWeight="bold" fontSize="sm" color="brand.text" textAlign="center">Account</Text>
            <Divider borderColor="brand.border" />
            <Button {...buttonStyle} variant="ghost" onClick={handleLogout} bg="black" _hover={{ bg: "#333" }} color="white">
              Logout
            </Button>
          </VStack>
        </VStack>
      )}
    </VStack>
  );
  
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
            {navigationContent}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Box
      position="fixed"
      left={0}
      w={isCollapsed ? "60px" : "250px"}
      top={0}
      h="100vh"
      bg="#111613"
      bgGradient="linear(to-b, #111613, #1b2c14, #111613)"
      borderRight="1px"
      borderRightColor="brand.border"
      display={{ base: 'none', md: 'block' }}
      zIndex="1"
      overflowY="auto"
      transition="width 0.3s ease"
      p={isCollapsed ? 2 : 4}
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
      {navigationContent}
    </Box>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  isCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func
};

export default Sidebar;
