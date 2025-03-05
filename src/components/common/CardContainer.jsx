import { Box } from '@chakra-ui/react';

const CardContainer = ({ children }) => (
  <Box
    height="500px"
    width="100%"
    position="relative"
    bg="brand.primary.base"
    borderRadius="lg"
    overflow="hidden"
    transition="all 0.2s"
    boxShadow="lg"
    borderWidth="1px"
    borderColor="brand.border"
    mb={4}
  >
    {children}
  </Box>
);

export default CardContainer;
