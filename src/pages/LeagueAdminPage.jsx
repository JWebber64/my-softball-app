import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text,
  Alert,
  AlertIcon,
  VStack,
} from '@chakra-ui/react';

const LeagueAdminPage = () => {
  const [hasLeague, setHasLeague] = useState(false);

  useEffect(() => {
    // Check if admin has already set up a league
    const checkLeagueSetup = async () => {
      // Add your league check logic here
      // setHasLeague(true/false) based on the check
    };

    checkLeagueSetup();
  }, []);

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <Heading mb={6}>League Administration</Heading>
      
      {!hasLeague && (
        <Alert status="info" mb={6}>
          <AlertIcon />
          Welcome! Please start by setting up your league details.
        </Alert>
      )}

      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={4}>League Setup</Heading>
          {/* Add your league setup form here */}
        </Box>
      </VStack>
    </Box>
  );
};

export default LeagueAdminPage;
