import { Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ROUTER_CONFIG } from '../config';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <VStack
      spacing={6}
      justify="center"
      align="center"
      minH="100vh"
      p={4}
      bg="brand.background"
    >
      <Heading size="xl" color="brand.text.primary">404 - Page Not Found</Heading>
      <Text color="brand.text.primary">The page you're looking for doesn't exist.</Text>
      <Button
        onClick={() => navigate(ROUTER_CONFIG.ROUTES.HOME)}
        colorScheme="brand"
        variant="solid"
      >
        Return Home
      </Button>
    </VStack>
  );
};

export default NotFound;
