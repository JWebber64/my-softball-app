import { ChakraProvider } from '@chakra-ui/react';
import { render } from '@testing-library/react';
import PropTypes from 'prop-types';
import React from 'react';
import { BaseballCardProvider } from '../context/BaseballCardContext';
import theme from '../theme/theme';

const AllProviders = ({ children }) => {
  return (
    <ChakraProvider theme={theme}>
      <BaseballCardProvider>
        {children}
      </BaseballCardProvider>
    </ChakraProvider>
  );
};

AllProviders.propTypes = {
  children: PropTypes.node.isRequired
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

