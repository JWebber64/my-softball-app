import React from 'react';
import { Box, Text, Link, useStyleConfig } from '@chakra-ui/react';

const Footer = () => {
  const styles = useStyleConfig("Footer");
  
  return (
    <Box __css={styles} as="footer">
      <Text fontSize="sm">
        &copy; {new Date().getFullYear()} Softball Stats App. All rights reserved.
      </Text>
      <Text fontSize="xs" mt={1}>
        <Link href="/privacy" mr={2}>Privacy Policy</Link>
        <Link href="/terms" mr={2}>Terms of Service</Link>
        <Link href="/contact">Contact Us</Link>
      </Text>
    </Box>
  );
};

export default Footer;