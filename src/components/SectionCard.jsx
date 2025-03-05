import React from 'react';
import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const SectionCard = ({ children, ...props }) => {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      p={4}
      {...props}
    >
      {children}
    </Box>
  );
};

SectionCard.propTypes = {
  children: PropTypes.node
};

export default SectionCard;