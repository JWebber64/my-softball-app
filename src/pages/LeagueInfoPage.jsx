import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const LeagueInfoPage = () => {
  return (
    <Box p={5}>
      <Heading mb={4}>League Information</Heading>
      <Text>This page displays information about the league, including standings, schedules, and news.</Text>
    </Box>
  );
};

export default LeagueInfoPage;
