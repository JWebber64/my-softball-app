import { Container } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const PageContainer = ({ children }) => {
  return (
    <Container
      maxW="1800px"
      py={4}
      px={4}
      minH="100vh"
      bg="brand.background"
      color="brand.text.primary"
      borderColor="brand.border"
    >
      {children}
    </Container>
  );
};

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PageContainer;


