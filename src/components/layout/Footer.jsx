import React from 'react';
import { Box, Text, Flex, useBreakpointValue } from '@chakra-ui/react';

const Footer = ({ isCollapsed }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const sidebarWidth = isCollapsed ? "60px" : "250px";

  return (
    <Box 
      as="footer" 
      p={4} 
      color="white"
      bg="#111613"
      bgGradient="linear(to-r, #111613, #1b2c14, #111613)"
      borderTop="1px"
      borderTopColor="brand.border"
      width="100%"
    >
      <Flex 
        direction="column" 
        align="center" 
        maxW="container.2xl" 
        mx="auto"
        py={2}
      >
        <Text fontSize="sm" color="brand.text">
          &copy; {new Date().getFullYear()} Diamond Data. All rights reserved.
        </Text>
      </Flex>
    </Box>
  );
};

export default Footer;
