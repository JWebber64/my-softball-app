import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { SimpleAuthProvider } from './context/SimpleAuthContext';
import AppContent from './components/AppContent';
import theme from './theme/theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <SimpleAuthProvider>
        <AppContent />
      </SimpleAuthProvider>
    </ChakraProvider>
  );
}

export default App;
