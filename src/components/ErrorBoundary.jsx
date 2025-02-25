import React from 'react';
import { Box, Button, Text } from '@chakra-ui/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Section Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={4} bg="red.50" borderRadius="md">
          <Text color="red.500" mb={2}>Something went wrong loading this section.</Text>
          <Button
            size="sm"
            onClick={() => {
              this.setState({ hasError: false });
              if (this.props.onRetry) this.props.onRetry();
            }}
          >
            Try again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;