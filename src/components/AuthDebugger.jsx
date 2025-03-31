import { Badge, Box, Code, Heading, Text, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { roleService } from '../utils/roleService';
import { supabase } from '../utils/supabaseClient';

const ROLES = {
  PLAYER: 'player',
  TEAM_ADMIN: 'team-admin',
  LEAGUE_ADMIN: 'league-admin',
};

const AuthDebugger = ({ showDetails = false }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState('Checking connection...');
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [error, setError] = useState(null);

  const checkUserRole = async (userId) => {
    try {
      // Use roleService instead of direct table query
      const role = await roleService.getUserRole(userId);
      const isValidRole = Object.values(ROLES).includes(role);
      console.log('User role:', role, 'Valid:', isValidRole);
      return role;
    } catch (err) {
      console.error('Error checking user role:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function checkConnection() {
      try {
        const startTime = performance.now();
        
        // Test the connection with abort signal
        const { error: queryError } = await supabase
          .from('player_stats')
          .select('count')
          .abortSignal(controller.signal);
        
        if (!mounted) return;
        if (queryError) throw queryError;

        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);

        if (!mounted) return;

        // Gather connection details
        const details = {
          url: import.meta.env.VITE_SUPABASE_URL,
          latency: `${latency}ms`,
          timestamp: new Date().toISOString(),
          status: 'connected'
        };

        setConnectionDetails(details);
        setStatus('Connected to Supabase successfully');
        setError(null);

      } catch (err) {
        if (!mounted) return;
        if (err.name === 'AbortError') return;
        
        console.error('Connection error:', err);
        setStatus('Connection failed');
        setError(err.message);
        setConnectionDetails(null);
      }
    }

    checkConnection();
    
    // Set up periodic checks
    const interval = setInterval(checkConnection, 30000);

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="lg"
      bg={error ? 'red.50' : 'green.50'}
    >
      <VStack align="start" spacing={3}>
        <Heading size="sm">
          Database Connection Status{' '}
          <Badge colorScheme={error ? 'red' : 'green'}>
            {error ? 'Error' : status}
          </Badge>
        </Heading>

        {error && (
          <Text color="red.500">
            Error: {error}
          </Text>
        )}

        {showDetails && connectionDetails && (
          <VStack align="start" spacing={2}>
            <Text fontSize="sm">Connection Details:</Text>
            <Code p={2} borderRadius="md">
              {JSON.stringify(connectionDetails, null, 2)}
            </Code>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

AuthDebugger.propTypes = {
  showDetails: PropTypes.bool
};

export default AuthDebugger;



