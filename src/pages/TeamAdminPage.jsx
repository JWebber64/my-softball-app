import React, { useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Container,
  Text,
  Divider,
} from '@chakra-ui/react';
import TeamSelector from '../components/admin/TeamSelector';
import TeamDetailsEditor from '../components/admin/TeamDetailsEditor';
import { useSimpleAuth } from '../context/SimpleAuthContext';

const TeamAdminPage = () => {
  const { activeTeam } = useSimpleAuth();

  useEffect(() => {
    if (activeTeam) {
      console.log('Active team changed:', activeTeam);
      // Add any additional team-specific data loading here
    }
  }, [activeTeam]);

  return (
    <Container maxW="container.xl" mt="84px" p={6}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Team Administration</Heading>
        
        <TeamSelector />
        
        {activeTeam && (
          <>
            <Divider />
            <Box p={6} borderWidth="1px" borderRadius="lg" bg="brand.primary">
              <Heading size="md" mb={4}>Team Details</Heading>
              <TeamDetailsEditor initialData={activeTeam} />
            </Box>
            {/* Add other team management sections below */}
          </>
        )}
      </VStack>
    </Container>
  );
};

export default TeamAdminPage;
