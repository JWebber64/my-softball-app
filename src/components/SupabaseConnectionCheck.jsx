import { useEffect, useState } from 'react';
import { Box, Text, Spinner } from '@chakra-ui/react';
import { checkSupabaseConnection } from '../lib/supabaseClient';

export default function SupabaseConnectionCheck() {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      const result = await checkSupabaseConnection();
      if (result.status === 'error') {
        setError(result.error);
        setStatus('error');
      } else {
        setStatus('connected');
      }
    };

    checkConnection();
  }, []);

  if (status === 'checking') {
    return <Spinner size="sm" />;
  }

  if (status === 'error') {
    return (
      <Box p={4} bg="red.100" borderRadius="md">
        <Text color="red.600">
          Database connection error: {error}
        </Text>
      </Box>
    );
  }

  return null;
}