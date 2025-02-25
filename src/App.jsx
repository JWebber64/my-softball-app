import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import theme from './theme/theme';
import './styles/global.css';
import TestComponent from './components/scoresheet/TestComponent';

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <TestComponent />
        <AppRoutes />
      </BrowserRouter>
    </ChakraProvider>
  );
};

export default App;

