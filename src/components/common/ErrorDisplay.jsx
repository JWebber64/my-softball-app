import { WarningIcon } from '@chakra-ui/icons';
import { Button, Heading, Text, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const ErrorDisplay = ({ 
  title = 'An error occurred',
  message,
  onRetry,
  showRetry = true 
}) => {
  return (
    <VStack
      spacing={6}
      p={8}
      borderRadius="lg"
      border="1px"
    >
      <WarningIcon boxSize={8} />
      <VStack spacing={2}>
        <Heading size="md">{title}</Heading>
        <Text textAlign="center">{message}</Text>
      </VStack>
      {showRetry && onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </VStack>
  );
};

ErrorDisplay.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
  showRetry: PropTypes.bool
};

export default ErrorDisplay;