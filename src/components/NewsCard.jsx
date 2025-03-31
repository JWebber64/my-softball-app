import {
  Box
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const NewsCard = ({ 
  title, 
  content, 
  created_at, 
  size = 'medium',
  variant = 'default',
  isModal = false, // New prop
  onClose = null   // New prop
}) => {
  // Remove useColorModeValue since we're using our theme tokens
  return (
    <Box
      bg="brand.primary.base"
      borderColor="brand.border"
      color="brand.text.primary"
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      _hover={{ boxShadow: 'md' }}
      transition="all 0.2s"
    >
      {/* Rest of the component */}
    </Box>
  );
};

NewsCard.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['default', 'featured', 'highlight']),
  isModal: PropTypes.bool,
  onClose: PropTypes.func,
};

NewsCard.defaultProps = {
  size: 'medium',
  variant: 'default',
};

export default NewsCard;
