import { Box, Button, Divider, IconButton, Text, VStack } from '@chakra-ui/react';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTER_CONFIG } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { useTeam } from '../../hooks/useTeam';
import { supabase } from '../../lib/supabaseClient';
import { clearAuthState } from '../../utils/authErrorHandler';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { team } = useTeam();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      clearAuthState();
      navigate(ROUTER_CONFIG.ROUTES.SIGNIN);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navSections = [
    {
      title: 'General',
      items: [
        { label: 'Home', path: ROUTER_CONFIG.ROUTES.HOME },
        { label: 'Profile', path: ROUTER_CONFIG.ROUTES.PROFILE }
      ]
    },
    {
      title: 'Team',
      items: [
        { label: 'Team Info', path: ROUTER_CONFIG.ROUTES.TEAM_INFO },
        { label: 'Team Stats', path: ROUTER_CONFIG.ROUTES.TEAM_STATS },
        { label: 'Score Sheets', path: ROUTER_CONFIG.ROUTES.SCORE_SHEETS },
        { label: 'Team Admin', path: ROUTER_CONFIG.ROUTES.TEAM_ADMIN }
      ]
    },
    {
      title: 'League',
      items: [
        { label: 'League Info', path: ROUTER_CONFIG.ROUTES.LEAGUE_INFO },
        { label: 'League Admin', path: ROUTER_CONFIG.ROUTES.LEAGUE_ADMIN }
      ]
    },
    {
      title: 'Account',
      items: [
        { 
          label: user ? 'Logout' : 'Sign In',
          path: user ? null : ROUTER_CONFIG.ROUTES.SIGNIN,
          onClick: user ? handleSignOut : null
        }
      ]
    }
  ];

  return (
    <Box
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      w={isCollapsed ? "60px" : "240px"}
      bgGradient="linear(to-b, var(--app-gradient-start), var(--app-gradient-middle), var(--app-gradient-end))"
      borderRight="1px"
      borderColor="var(--app-border)"
      transition="width 0.2s"
      zIndex={1000}
      display="flex"
      flexDirection="column"
      py={4}
    >
      <Box width="100%" display="flex" justifyContent="center" mb={4}>
        <IconButton
          icon={isCollapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
          onClick={onToggle}
          bgGradient="linear(to-r, var(--app-gradient-start), var(--app-gradient-middle), var(--app-gradient-end))"
          color="var(--app-text)"
          size="sm"
        />
      </Box>
      <VStack 
        spacing={4} 
        align="stretch" 
        flex={1} 
        justify="flex-start"
        pt={8} // Reduced from 20 to 8 to move buttons up
      >
        {navSections.map((section, idx) => (
          <Box key={idx}>
            {!isCollapsed && (
              <Text
                color="var(--app-text)"
                fontSize="xs"
                mb={2}
                textAlign="center"
                fontWeight="semibold"
              >
                {section.title}
              </Text>
            )}
            <VStack spacing={3} align="center" width="100%">
              {section.items.map((item, itemIdx) => (
                <Button
                  key={itemIdx}
                  size="sm"
                  height="30px"
                  fontSize="sm"
                  variant="solid"
                  justifyContent="center"
                  width={isCollapsed ? "90%" : "80%"}
                  onClick={() => item.onClick ? item.onClick() : navigate(item.path)}
                  opacity={location.pathname === item.path ? 1 : 0.8}
                  bg="transparent"
                  color="var(--app-text)"
                  _hover={{ bg: "var(--app-background)" }}
                >
                  {isCollapsed ? item.label.charAt(0) : item.label}
                </Button>
              ))}
            </VStack>
            {idx < navSections.length - 1 && (
              <Divider my={2} borderColor="var(--app-border)" opacity={0.3} />
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar;


