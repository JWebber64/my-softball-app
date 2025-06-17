import { Heading } from '@chakra-ui/react';
import React from 'react';

const SectionHeading = ({ children, ...props }) => {
  return (
    <Heading 
      size="md" 
      borderBottom="2px solid"
      borderColor="gray.200"
      pb={2}
      {...props}
    >
      {children}
    </Heading>
  );
};

export default SectionHeading;


