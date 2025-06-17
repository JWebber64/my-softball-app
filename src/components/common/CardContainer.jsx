import { Box } from '@chakra-ui/react';
import React from 'react';

const CardContainer = ({ children, ...props }) => {
  return (
    <Box 
      p={5} 
      borderWidth="1px" 
      borderRadius="lg" 
      bg="brand.surface.base" 
      color="brand.text.primary"
      borderColor="brand.border"
      mb={6}
      boxShadow="sm"
      className="content-gradient"
      {...props}
    >
      {children}
    </Box>
  );
};

export default CardContainer;


