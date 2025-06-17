import { Box, Center, Spinner, Text, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  fullScreen = true,
  debug = false,
  height = '100vh',
  bgColor = 'brand.background'
}) => {
  // Add timestamp for tracking
  const mountTime = React.useRef(Date.now());
  
  React.useEffect(() => {
    // Log if loading takes too long
    const timeoutId = setTimeout(() => {
      console.warn(`LoadingSpinner stuck: ${message} - mounted for ${Date.now() - mountTime.current}ms`);
    }, 5000); // Warn after 5 seconds

    return () => clearTimeout(timeoutId);
  }, [message]);

  console.log('LoadingSpinner: Rendering with props:', {
    message,
    fullScreen,
    debug,
    height,
    bgColor,
    mountTime: new Date(mountTime.current).toISOString()
  });

  const SpinnerContent = (
    <VStack 
      spacing={4} 
      bg={bgColor}
      p={4}
      rounded="md"
      border="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="whiteAlpha.200"
        color="white"
        size="xl"
      />
      <Text color="white" fontSize="lg" fontWeight="medium">{message}</Text>
      
      {/* Debug info */}
      {debug && (
        <Box mt={2} p={2} bg="blackAlpha.300" rounded="md">
          <Text color="white" fontSize="sm">
            Debug: fullScreen={String(fullScreen)}, height={height}
          </Text>
        </Box>
      )}
    </VStack>
  );

  // Debug mode just shows a simpler version
  if (debug) {
    return (
      <Box 
        minH={height} 
        w="100%" 
        bg={bgColor}
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        {SpinnerContent}
      </Box>
    );
  }

  // Full screen mode centers the content
  if (fullScreen) {
    return (
      <Center 
        h={height} 
        w="100%" 
        bg={bgColor}
        position="fixed"
        top="0"
        left="0"
        zIndex="overlay"
      >
        {SpinnerContent}
      </Center>
    );
  }

  // Default inline mode
  return SpinnerContent;
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  debug: PropTypes.bool,
  height: PropTypes.string,
  bgColor: PropTypes.string
};

export default LoadingSpinner;


