import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Box, ChakraProvider } from '@chakra-ui/react';
import { SimpleAuthProvider } from './context/SimpleAuthContext';
import theme from './theme/theme';
import AppRoutes from './routes/index';

function App() {
  return (
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <SimpleAuthProvider>
          <Router>
            <Box className="app-container">
              <AppRoutes />
            </Box>
          </Router>
        </SimpleAuthProvider>
      </ChakraProvider>
    </React.StrictMode>
  );
}

export default App;
