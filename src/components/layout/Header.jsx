import { Avatar, Box, Center, Flex, HStack, Image, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { DEFAULT_ASSETS } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { usePlayerProfile } from '../../hooks/usePlayerProfile';
import { useTeam } from '../../hooks/useTeam';

const Header = ({ sidebarWidth }) => {
  const { team } = useTeam();
  const { user } = useAuth();
  const { profile, loading } = usePlayerProfile(user?.id);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (!loading && user?.id && profile?.profile_image_url) {
      // Add cache-busting query parameter
      const newUrl = `${profile.profile_image_url}?v=${Date.now()}`;
      console.log('Setting new avatar URL in Header:', newUrl);
      setAvatarUrl(newUrl);
    } else {
      setAvatarUrl(null);
    }
  }, [profile?.profile_image_url, loading, user?.id]);

  return (
    <Box
      as="header"
      bgGradient="linear(to-r, var(--app-gradient-start), var(--app-gradient-middle), var(--app-gradient-end))"
      borderBottom="1px"
      borderColor="var(--app-border)"
      position="fixed"
      top={0}
      right={0}
      left={sidebarWidth}
      height="80px"
      zIndex={999}
      transition="left 0.2s"
    >
      <Flex 
        height="100%"
        maxW="1200px"
        mx="auto"
        px={6}
        position="relative"
        align="center"
      >
        {/* Team logo and name beside sidebar */}
        {team?.logo_url && sidebarWidth !== "0" && (
          <HStack 
            spacing={4} 
            position="fixed"
            left={sidebarWidth === "60px" ? "75px" : "255px"}  // Increased to 15px from sidebar edge
            top="20px"
            zIndex={1000}
            transition="all 0.2s"  // Match the sidebar transition timing
          >
            <Image
              src={team.logo_url}
              alt={`${team.name} Logo`}
              h="40px"
              w="40px"
              objectFit="contain"
              borderRadius="md"
            />
            <Text 
              color="var(--app-text)" 
              fontSize="xl" 
              fontWeight="bold"
              transition="opacity 0.2s"  // Smooth text transition
            >
              {team.name}
            </Text>
          </HStack>
        )}

        {/* Diamond Data logo centered */}
        <Center flex="1">
          <Image
            src="/Diamonddata.png"
            alt="Diamond Data Logo"
            h="60px"
            w="60px"
            objectFit="contain"
          />
        </Center>

        {/* Avatar on right */}
        {sidebarWidth !== "0" && user && (
          <Box position="absolute" right={6}>
            <Avatar
              key={avatarUrl || 'default'}
              size="md"
              name={profile?.name}
              src={avatarUrl}
              bg="brand.primary.base"
              color="white"
              onError={(e) => {
                console.error('Avatar load error:', e);
                e.target.src = DEFAULT_ASSETS.IMAGES.PLAYER_PHOTO;
              }}
              fallback={
                <Image 
                  src={DEFAULT_ASSETS.IMAGES.PLAYER_PHOTO} 
                  alt="Default profile"
                />
              }
            />
            {avatarUrl && (
              <Box
                position="absolute"
                bottom="-2px"
                right="-2px"
                width="8px"
                height="8px"
                borderRadius="full"
                bg="green.500"
              />
            )}
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default Header;





































