import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const SimplePage = () => {
  return (
    <Box p={5} bg="brand.background" borderRadius="md">
      <Heading>Simple Test Page</Heading>
      <Text mt={4}>This is a simple page to test if routing is working correctly.</Text>
    </Box>
  );
};

export default SimplePage;
