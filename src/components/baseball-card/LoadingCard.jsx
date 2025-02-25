import React from 'react';
import { Box, Skeleton, VStack } from '@chakra-ui/react';

const LoadingCard = () => {
  return (
    <Box
      w="63.5mm"
      h="88.9mm"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="lg"
      bg="white"
    >
      <Skeleton height="20%" />
      <Skeleton height="60%" mt="20%" />
      <VStack p={2} spacing={1}>
        <Skeleton height="20px" width="80%" />
        <Skeleton height="16px" width="60%" />
      </VStack>
    </Box>
  );
};

export default LoadingCard;