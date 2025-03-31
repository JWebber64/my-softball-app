import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Switch,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Updated import path
import { clearAuthState } from '../utils/authErrorHandler';

const DebugPage = () => {
  const { signOut } = useAuth();
  const toast = useToast();
  const [bypassRedirect, setBypassRedirect] = useState(
    localStorage.getItem('bypassRedirect') === 'true'
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      clearAuthState();
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const toggleBypass = () => {
    const newValue = !bypassRedirect;
    setBypassRedirect(newValue);
    localStorage.setItem('bypassRedirect', newValue.toString());
    toast({
      title: `Landing page redirect ${newValue ? 'disabled' : 'enabled'}`,
      status: "info",
      duration: 3000,
    });
  };

  return (
    <Box p={4}>
      <Heading mb={4}>Settings</Heading>
      
      <VStack spacing={4} align="stretch">
        <Box p={4} bg="gray.100" borderRadius="md">
          <Heading size="md" mb={4}>Navigation Links</Heading>
          <VStack align="stretch">
            <Link to="/">Home</Link>
            <Link to="/team-info">Team Info</Link>
            <Link to="/team-stats">Team Stats</Link>
            <Link to="/simple">Simple Page</Link>
          </VStack>
        </Box>
        
        <Box p={4} bg="gray.700" color="white" borderRadius="md">
          <Heading size="md" mb={4}>Redirect Settings</Heading>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="bypass-redirect" mb="0">
              Bypass Landing Page Redirect
            </FormLabel>
            <Switch 
              id="bypass-redirect" 
              isChecked={bypassRedirect}
              onChange={toggleBypass}
              colorScheme="green"
            />
          </FormControl>
          <Text mt={2} fontSize="sm">
            When enabled, you can access the landing page even when logged in.
          </Text>
        </Box>

        <Button colorScheme="red" onClick={handleSignOut}>Sign Out</Button>
      </VStack>
    </Box>
  );
};

export default DebugPage;


