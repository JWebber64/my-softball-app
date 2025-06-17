import {
  Avatar,
  Box,
  Flex,
  HStack,
  Image,
  Skeleton,
  Text
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_ASSETS } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { usePlayerProfile } from '../../hooks/usePlayerProfile';
import { useTeam } from '../../hooks/useTeam';

const Header = ({ sidebarWidth }) => {
  const { team, loading: teamLoading } = useTeam();
  const { user, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading } = usePlayerProfile(user?.id);
  const location = useLocation();
  const isSignInPage = location.pathname === '/signin';
  const isHomePage = location.pathname === '/';
  const showUserInfo = isAuthenticated && !isSignInPage && !isHomePage;

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  useEffect(() => {
    if (profile?.profile_image_url) {
      setAvatarLoadError(false);
      const newUrl = `${profile.profile_image_url}?v=${Date.now()}`;
      setAvatarUrl(newUrl);
    } else {
      setAvatarUrl(DEFAULT_ASSETS.IMAGES.PLAYER_PHOTO);
    }
  }, [profile?.profile_image_url]);

  // Combine loading states
  const isLoading = teamLoading;

  return (
    <Box
      as="header"
      className="app-gradient"
      borderBottom="1px"
      borderColor="brand.border"
      position="fixed"
      top={0}
      right={0}
      left={sidebarWidth}
      height="80px"
      zIndex={2}
      transition="left 0.2s"
      willChange="left"
    >
      <Flex 
        height="100%"
        width="100%"
        position="relative"
        align="center"
        justify="space-between"
        px={4}
      >
        {/* Team logo and name - Left side */}
        {showUserInfo && (
          <HStack 
            spacing={4}
            opacity={isLoading ? 0.5 : 1}
            pointerEvents={isLoading ? "none" : "auto"}
          >
            <Skeleton isLoaded={!isLoading}>
              <Image
                src={team?.logo_url || DEFAULT_ASSETS.IMAGES.TEAM_LOGO}
                alt="Team Logo"
                h="40px"
                w="40px"
                objectFit="contain"
                borderRadius="md"
              />
            </Skeleton>
            <Skeleton isLoaded={!isLoading}>
              <Text 
                color="brand.text.primary" 
                fontSize="xl" 
                fontWeight="bold"
              >
                {team?.name || "No Team Selected"}
              </Text>
            </Skeleton>
          </HStack>
        )}
        {(!showUserInfo && !isSignInPage) && <Box width="40px" />}

        {/* Diamond Data logo - Center */}
        <Box 
          position="absolute"
          left="50%"
          top="50%"
          transform="translate(-50%, -50%)"
          zIndex={1}
        >
          <Image
            src="/Diamonddata.png"
            alt="Diamond Data Logo"
            h="60px"
            w="60px"
            objectFit="contain"
          />
        </Box>

        {/* Avatar - Right side */}
        {showUserInfo ? (
          <Box>
            <Skeleton isLoaded={!profileLoading} borderRadius="full">
              <Avatar
                size="md"
                name={profile?.name || 'User'}
                src={avatarLoadError ? DEFAULT_ASSETS.IMAGES.PLAYER_PHOTO : avatarUrl}
                bg="brand.surface.base"
                color="brand.text.primary"
                onError={(e) => {
                  setAvatarLoadError(true);
                  e.target.src = DEFAULT_ASSETS.IMAGES.PLAYER_PHOTO;
                }}
              />
            </Skeleton>
          </Box> 
        ) : (
          /* Empty box to maintain spacing when on sign-in page or homepage */
          <Box width="40px" />
        )}
      </Flex>
    </Box>
  );
};

Header.propTypes = {
  sidebarWidth: PropTypes.string.isRequired
};

export default Header;





