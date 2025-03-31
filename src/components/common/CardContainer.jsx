import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const CardContainer = ({ children, ...props }) => {
  return (
    <Box
      bg="brand.primary.base"  // Correct usage
      p={6}
      borderRadius="lg"
      boxShadow="md"
      display="flex"
      flexDirection="column"
      alignItems="center"
      width="100%"
      {...props}
    >
      {children}
    </Box>
  );
};

CardContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CardContainer;




