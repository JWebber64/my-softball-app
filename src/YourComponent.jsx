import { Badge, Box, Button, Text, useToast, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { teamService } from './services/teamService';

const AdminSetupComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  const toast = useToast();

  useEffect(() => {
    console.log('Component mounted, checking status...');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('Checking auth status...');
    try {
      const { isAdmin, teams } = await teamService.verifyTeamAdmin();
      console.log('Auth status result:', { isAdmin, teams });
      setAuthStatus({ isAdmin, teams });
    } catch (error) {
      console.error('Error checking status:', error);
      setAuthStatus(null);
      toast({
        title: 'Error checking admin status',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <VStack spacing={4} align="stretch" border="1px solid red" p={4}>
      <Text>Admin Setup Component</Text>
      <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
        <Text fontWeight="bold" mb={2}>Current Status:</Text>
        {authStatus ? (
          <>
            <Badge 
              colorScheme={authStatus.isAdmin ? "green" : "gray"}
              mb={2}
            >
              {authStatus.isAdmin ? "Team Admin" : "Not Admin"}
            </Badge>
            <Text fontSize="sm">
              Teams: {authStatus.teams.length > 0 
                ? authStatus.teams.map(t => t.name).join(', ') 
                : 'No teams'}
            </Text>
          </>
        ) : (
          <Text>Checking status...</Text>
        )}
      </Box>

      <Button
        onClick={checkAuthStatus}
        isLoading={isLoading}
        colorScheme="blue"
        size="sm"
      >
        Refresh Status
      </Button>
    </VStack>
  );
};

export default AdminSetupComponent;

