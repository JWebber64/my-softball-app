import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, Image, Text, HStack } from '@chakra-ui/react';
import { useTeam } from '../../context/TeamContext';
import { DEFAULT_IMAGES } from '../../constants/assets';

const Header = ({ isCollapsed = false }) => {
  const { teamDetails } = useTeam();
  const sidebarWidth = isCollapsed ? "60px" : "250px";

  return (
    <Box
      as="header"
      bg="#111613"
      bgGradient="linear(to-r, #111613, #2e3726, #111613)"
      height="100px"
      display="flex"
      alignItems="center"
      px={4}
      position="fixed"
      top="0"
      left={{ base: 0, md: sidebarWidth }}
      right="0"
      zIndex="1000"
      transition="left 0.3s ease"
      borderBottom="1px"
      borderBottomColor="brand.border"
    >
      {/* Left side - Team info */}
      {teamDetails && (
        <HStack spacing={4} flex="1">
          {teamDetails.logo_url && (
            <Image
              src={teamDetails.logo_url || DEFAULT_IMAGES.TEAM_LOGO}
              alt={`${teamDetails.name} Logo`}
              height="64px"
              width="64px"
              objectFit="contain"
              borderRadius="full"
              bg="white"
              p={1}
            />
          )}
          <Text
            color="brand.text.primary"
            fontSize="1.25rem"
            fontWeight="bold"
          >
            {teamDetails.name}
          </Text>
        </HStack>
      )}

      {/* Center - App logo */}
      <Flex 
        direction="column" 
        align="center"
        flex="1"
        justifyContent="center"
      >
        <Image
          src="/logo.svg"
          alt="Diamond Data Logo"
          height="64px"
          width="64px"
          objectFit="contain"
          borderRadius="1rem"
          bg="white"
          p={1}
        />
      </Flex>

      {/* Right side - Empty space to balance the layout */}
      <Box flex="1" />
    </Box>
  );
};

Header.propTypes = {
  isCollapsed: PropTypes.bool
};

Header.defaultProps = {
  isCollapsed: false
};

export default Header;
