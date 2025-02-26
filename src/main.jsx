import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme'; // Updated path to theme file
import './index.css';
import AppRoutes from './routes/index';
import { SimpleAuthProvider } from './context/SimpleAuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        <SimpleAuthProvider>
          <AppRoutes />
        </SimpleAuthProvider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);
