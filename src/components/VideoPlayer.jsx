import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

const VideoPlayer = ({ url, title, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [url]);

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  const handleError = (e) => {
    setIsLoading(false);
    setError('Failed to load video');
    if (onError) {
      onError(e);
    }
  };

  return (
    <Box position="relative" width="100%" aspectRatio={16/9}>
      {isLoading && (
        <VStack
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          justify="center"
          align="center"
          bg="blackAlpha.100"
        >
          <Spinner size="xl" />
          <Text>Loading video...</Text>
        </VStack>
      )}

      {error && (
        <VStack
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          justify="center"
          align="center"
          bg="blackAlpha.100"
        >
          <Text color="red.500">{error}</Text>
        </VStack>
      )}

      <video
        src={url}
        controls
        width="100%"
        height="100%"
        style={{ display: error ? 'none' : 'block' }}
        onLoadedData={handleLoadedData}
        onError={handleError}
        title={title}
        playsInline
      >
        <track kind="captions" />
        Your browser does not support the video tag.
      </video>
    </Box>
  );
};

VideoPlayer.propTypes = {
  url: PropTypes.string.isRequired,
  title: PropTypes.string,
  onError: PropTypes.func
};

VideoPlayer.defaultProps = {
  title: '',
  onError: null
};

export default VideoPlayer;
