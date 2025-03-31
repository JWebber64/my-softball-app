import { Center, Spinner } from '@chakra-ui/react';

const LoadingSpinner = () => {
  return (
    <Center h="100vh">
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="brand.primary.base"
        color="brand.text.primary"
        size="xl"
      />
    </Center>
  );
};

export default LoadingSpinner;


