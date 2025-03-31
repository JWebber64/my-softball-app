import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Code,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const ErrorBoundaryFallback = ({ error, resetErrorBoundary }) => {
  return (
    <Box p={4}>
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        borderRadius="lg"
        py={6}
      >
        <AlertIcon boxSize="40px" mr={0} />
        <VStack spacing={4} mt={4}>
          <AlertTitle fontSize="lg">Something went wrong</AlertTitle>
          <AlertDescription maxWidth="sm">
            {error.message}
            <Code
              display="block"
              whiteSpace="pre-wrap"
              p={2}
              mt={2}
              fontSize="sm"
              variant="subtle"
            >
              {error.stack}
            </Code>
          </AlertDescription>
          <Button
            colorScheme="red"
            onClick={resetErrorBoundary}
            size="sm"
          >
            Try Again
          </Button>
        </VStack>
      </Alert>
    </Box>
  );
};

ErrorBoundaryFallback.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
    stack: PropTypes.string
  }).isRequired,
  resetErrorBoundary: PropTypes.func.isRequired
};

export default ErrorBoundaryFallback;
