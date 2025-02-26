import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const LeagueAdminPage = () => {
  return (
    <Box p={5}>
      <Heading mb={4}>League Administration</Heading>
      <Text>This page allows league administrators to manage league settings and teams.</Text>
    </Box>
  );
};

export default LeagueAdminPage;
