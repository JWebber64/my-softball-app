import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Flex, 
  Image, 
  Text, 
  VStack,
  useStyleConfig,
  IconButton
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const Header = ({ onOpenSidebar }) => {
  const styles = useStyleConfig("Header");
  const navigate = useNavigate();
  
  const handleLogoClick = () => {
    // Set bypass flag before navigation to home with a timestamp
    const timestamp = new Date().getTime();
    localStorage.setItem('bypassRedirect', 'true');
    localStorage.setItem('bypassTimestamp', timestamp.toString());
    console.log(`Header: Set bypass flag at ${timestamp} before navigating to /`);
    navigate('/');
  };
  
  return (
    <Box __css={styles} as="header">
      <Flex 
        maxW="container.2xl" 
        mx="auto" 
        position="relative" 
        justifyContent="center" 
        alignItems="center"
        px={4}
      >
        {/* Mobile menu button - only visible on small screens */}
        <IconButton
          icon={<HamburgerIcon />}
          aria-label="Open menu"
          variant="ghost"
          color="brand.text"
          onClick={onOpenSidebar}
          position="absolute"
          left={4}
          display={{ base: 'flex', md: 'none' }}
        />
        
        {/* Logo and Title - Make clickable to go home */}
        <VStack spacing={2} cursor="pointer" onClick={handleLogoClick}>
          <Image 
            src="/logo.svg" 
            alt="Logo" 
            boxSize="64px"
            borderRadius="1rem" 
            fallbackSrc="/images/default-team-logo.png"
            onError={(e) => {
              console.error("Logo failed to load:", e);
            }}
          />
          <Text 
            bg="brand.primary" 
            color="brand.text" 
            px={4}
            py={2}
            borderRadius="1rem" 
            fontSize="xl" 
            fontWeight="bold"
          >
            Diamond Data
          </Text>
        </VStack>
      </Flex>
    </Box>
  );
};

Header.propTypes = {
  onOpenSidebar: PropTypes.func.isRequired
};

export default Header;
