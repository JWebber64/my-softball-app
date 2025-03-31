import { Text as ChakraText } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const Text = ({ variant = 'body', children, ...props }) => {
  const variants = {
    body: {
      color: 'var(--app-text)'
    },
    caption: {
      color: 'var(--app-text)',
      opacity: 0.8
    },
    error: {
      color: 'var(--app-error)'
    },
    warning: {
      color: 'var(--app-warning)'
    },
    success: {
      color: 'var(--app-success)'
    }
  };

  return (
    <ChakraText {...variants[variant]} {...props}>
      {children}
    </ChakraText>
  );
};

Text.propTypes = {
  variant: PropTypes.oneOf(['body', 'caption', 'error', 'warning', 'success']),
  children: PropTypes.node.isRequired
};

export default Text;





