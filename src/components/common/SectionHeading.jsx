import { Heading } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const SectionHeading = ({ children, ...props }) => {
  return (
    <Heading
      size="md"
      mb={4}
      width="100%"
      textAlign="center"
      color="brand.text.primary"
      {...props}
    >
      {children}
    </Heading>
  );
};

SectionHeading.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SectionHeading;

