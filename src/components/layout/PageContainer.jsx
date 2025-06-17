import { Box } from '@chakra-ui/react';

const PageContainer = ({ children }) => (
  <Box
    as="main"
    bg="brand.background"
    minH="100vh"
    pt="80px" // Header height
    pb="60px" // Footer height
  >
    {children}
  </Box>
);

export default PageContainer;

