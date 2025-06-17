import { Box, Image } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { STORAGE_BUCKETS } from '../../constants/storage';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner';

const ImageViewer = ({ 
  scoresheetUrl, 
  viewMode = 'single', 
  gameNumber,
  onLoadError 
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      // Check if we have a URL to use
      if (!scoresheetUrl) {
        setError('No scoresheet URL provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error: downloadError } = await supabase.storage
          .from(STORAGE_BUCKETS.SCORESHEETS)
          .download(scoresheetUrl);

        if (downloadError) throw downloadError;

        const url = URL.createObjectURL(data);
        setImageUrl(url);
        setError(null);
      } catch (err) {
        setError(err.message);
        onLoadError?.(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [scoresheetUrl, onLoadError]);

  if (isLoading) {
    return <LoadingSpinner 
      message="Loading image..." 
      fullScreen={false}
      height="100%"
    />;
  }

  if (error) {
    return (
      <Box
        height="600px"
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="var(--app-surface)"
        color="var(--app-text)"
        borderRadius="lg"
      >
        Error loading scoresheet: {error}
      </Box>
    );
  }

  const viewModeStyles = {
    single: {
      width: '100%',
      height: '600px',
    },
    'side-by-side': {
      width: '50%',
      height: '600px',
    },
    fullscreen: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1000,
    },
  };

  return (
    <Box
      position="relative"
      {...viewModeStyles[viewMode]}
      transition="all 0.3s ease"
    >
      <Image
        src={imageUrl}
        alt={`Game ${gameNumber} Scoresheet`}
        objectFit="contain"
        width="100%"
        height="100%"
        borderRadius="md"
        loading="lazy"
      />
    </Box>
  );
};

ImageViewer.propTypes = {
  scoresheetUrl: PropTypes.string,
  viewMode: PropTypes.oneOf(['single', 'side-by-side', 'fullscreen']),
  gameNumber: PropTypes.number,
  onLoadError: PropTypes.func,
};

export default ImageViewer;





