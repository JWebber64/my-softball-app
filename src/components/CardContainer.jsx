import React from 'react';
import { Grid } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const CardContainer = ({ children, ...props }) => {
  return (
    <Grid
      templateColumns={{ 
        base: "1fr", 
        md: "repeat(2, 1fr)", 
        lg: "repeat(3, 1fr)" 
      }}
      gap={6}
      width="100%"
      {...props}
    >
      {children}
    </Grid>
  );
};

CardContainer.propTypes = {
  children: PropTypes.node
};

export default CardContainer;