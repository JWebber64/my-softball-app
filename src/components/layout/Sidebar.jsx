import { Box, Divider, IconButton, Text, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTER_CONFIG } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { useTeam } from '../../hooks/useTeam';
import { supabase } from '../../lib/supabaseClient';
import { clearAuthState } from '../../utils/authErrorHandler';

const Sidebar = ({ onWidthChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    const width = isCollapsed ? "60px" : "240px";
    onWidthChange(width);
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed, onWidthChange]);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { team } = useTeam();

  const onToggle = () => {
    const newWidth = !isCollapsed ? "60px" : "240px";
    setIsCollapsed(!isCollapsed);
    onWidthChange(newWidth);
  };

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
      bg="brand.surface.base"
      borderRight="1px"
      borderColor="brand.border"
      transition="width 0.2s"
      zIndex={3}
      display="flex"
      flexDirection="column"
      py={4}
      willChange="width"
      sx={{
        background: "linear-gradient(to bottom, var(--app-gradient-start), var(--app-gradient-middle), var(--app-gradient-end)) !important"
      }}
    >
      <Box width="100%" display="flex" justifyContent="center" mb={4}>
        <IconButton
          icon={isCollapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
          onClick={onToggle}
          className="app-gradient"
          color="brand.text.primary"
          size="sm"
          _hover={{ opacity: 0.9 }}
        />
      </Box>
      <VStack spacing={4} align="stretch" flex={1} justify="flex-start" pt={8}>
        {navSections.map((section, idx) => (
          <Box key={idx}>
            {!isCollapsed && (
              <Text
                color="brand.text.primary"
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
                <Box
                  key={itemIdx}
                  as="button"
                  height="30px"
                  width={isCollapsed ? "90%" : "80%"}
                  onClick={() => item.onClick ? item.onClick() : navigate(item.path)}
                  color="brand.text.primary"
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  transition="all 0.2s"
                  borderRadius="md"
                  bg="transparent"
                  _hover={{ bg: "#82c785" }}
                  opacity={location.pathname === item.path ? 1 : 0.8}
                >
                  {isCollapsed ? (
                    // Use two-letter abbreviations for menu items when collapsed
                    item.label.split(' ').length > 1 
                      ? `${item.label.split(' ')[0][0]}${item.label.split(' ')[1][0]}`
                      : item.label.substring(0, 2)
                  ) : (
                    item.label
                  )}
                </Box>
              ))}
            </VStack>
            {idx < navSections.length - 1 && (
              <Divider my={2} borderColor="brand.border" opacity={0.3} />
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

Sidebar.propTypes = {
  onWidthChange: PropTypes.func.isRequired
};

export default Sidebar;




















