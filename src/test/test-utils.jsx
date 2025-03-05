import React from 'react';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BaseballCardProvider } from '../context/BaseballCardContext';

const AllProviders = ({ children }) => {
  return (
    <ChakraProvider>
      <BaseballCardProvider>
        {children}
      </BaseballCardProvider>
    </ChakraProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };