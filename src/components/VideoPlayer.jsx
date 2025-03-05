import React, { useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { DEFAULT_IMAGES } from '../constants/assets';

const VideoPlayer = ({ url, title, onError }) => {
  const [error, setError] = useState(false);

  const FallbackDisplay = () => (
    <Box 
      width="100%" 
      height="200px" 
      bg="gray.200" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      borderRadius="md"
      backgroundImage={`url(${DEFAULT_IMAGES.FALLBACK.VIDEO})`}
      backgroundSize="cover"
      backgroundPosition="center"
    >
      <Text color="gray.500">Video not available</Text>
    </Box>
  );

  if (!url || error) {
    return <FallbackDisplay />;
  }

  return (
    <video
      controls
      width="100%"
      height="200px"
      onError={() => {
        setError(true);
        if (onError) onError();
      }}
      style={{ borderRadius: '0.375rem' }}
    >
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;
