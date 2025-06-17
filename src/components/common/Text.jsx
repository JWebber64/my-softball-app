import { Text as ChakraText } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const Text = ({ variant = 'body', children, ...props }) => {
  const variants = {
    body: {
      color: 'brand.text.primary'
    },
    caption: {
      color: 'brand.text.primary',
      opacity: 0.8
    },
    error: {
      color: 'brand.status.error'
    },
    warning: {
      color: 'brand.status.warning'
    },
    success: {
      color: 'brand.status.success'
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






