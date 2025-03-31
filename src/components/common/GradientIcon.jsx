import { Box, Icon } from '@chakra-ui/react';
import React from 'react';

const GradientIcon = ({ icon, size = "60px" }) => (
  <Box 
    width={size} 
    height={size} 
    display="flex" 
    alignItems="center" 
    justifyContent="center"
  >
    <Icon 
      as={icon} 
      boxSize="100%" 
      color="var(--content-gradient-middle)"
    />
  </Box>
);

export default GradientIcon;





