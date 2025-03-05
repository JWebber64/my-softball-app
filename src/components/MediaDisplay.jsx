import React from 'react';
import { Box, Image } from '@chakra-ui/react';
import { DEFAULT_IMAGES } from '../constants/assets';

const MediaDisplay = ({ url, type, title, handleError }) => {
  const defaultUrl = type === 'video' ? 
    DEFAULT_IMAGES.FALLBACK.VIDEO : 
    DEFAULT_IMAGES.FALLBACK.PHOTO;

  return (
    <Image
      src={url || defaultUrl}
      alt={title || 'Media content'}
      width="100%"
      height="auto"
      objectFit="cover"
      onError={(e) => {
        e.target.src = defaultUrl;
        if (handleError) handleError();
      }}
      borderRadius="md"
    />
  );
};

export default MediaDisplay;
