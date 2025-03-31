import { Box, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const Footer = ({ sidebarWidth }) => {
  return (
    <Box
      as="footer"
      bgGradient="linear(to-r, var(--app-gradient-start), var(--app-gradient-middle), var(--app-gradient-end))"
      borderTop="1px"
      borderColor="var(--app-border)"
      right={0}
      left={sidebarWidth}
      height="60px"
      transition="left 0.2s"
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
          color="white"
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







