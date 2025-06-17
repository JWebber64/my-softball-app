import { Box, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const Footer = ({ sidebarWidth }) => {
  return (
    <Box
      as="footer"
      className="app-gradient"
      borderTop="1px"
      borderColor="brand.border"
      right={0}
      left={sidebarWidth}
      height="60px"
      transition="margin-left 0.2s"
      zIndex={2}
    >
      <Box
        height="100%"
        maxW="1200px"
        mx="auto"
        px={6}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          color="brand.text.primary"
          fontSize="sm"
          textAlign="center"
        >
          Copyright © 2025 Diamond Data. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
};

Footer.propTypes = {
  sidebarWidth: PropTypes.string.isRequired
};

export default Footer;

















