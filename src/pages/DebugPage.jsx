import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  Code,
  useToast,
  Switch,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { useSimpleAuth } from '../context/SimpleAuthContext';
import { supabase } from '../lib/supabaseClient';

const DebugPage = () => {
  const [info, setInfo] = useState({});
  const { user, isAuthenticated, signOut } = useSimpleAuth();
  const toast = useToast();
  const [bypassRedirect, setBypassRedirect] = useState(
    localStorage.getItem('bypassRedirect') === 'true'
  );

  const refreshInfo = () => {
    setInfo({
      isAuthenticated,
      user,
      currentUrl: window.location.href,
      timestamp: new Date().toISOString(),
    });
  };

  useEffect(() => {
    refreshInfo();
  }, [isAuthenticated, user]);

  const forceLogout = async () => {
    try {
      // Use the context's signOut function instead of direct Supabase call
      await signOut();
      
      toast({
        title: "Force logout executed",
        description: "Auth state has been cleared",
        status: "success",
        duration: 3000,
      });
      
      // Use replace to prevent back navigation
      window.location.replace('/');
    } catch (error) {
      console.error('Force logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message,
        status: "error",
        duration: 3000,
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
      <Heading mb={4}>Debug Page</Heading>
      
      <VStack spacing={4} align="stretch">
        <Box p={4} bg="gray.100" borderRadius="md">
          <Heading size="md" mb={4}>Auth State</Heading>
          <Code p={4} display="block" whiteSpace="pre" overflowX="auto">
            {JSON.stringify(info, null, 2)}
          </Code>
        </Box>
        
        <Button onClick={refreshInfo}>Refresh Info</Button>
        <Button colorScheme="red" onClick={forceLogout}>Force Logout</Button>
        
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
      </VStack>
    </Box>
  );
};

export default DebugPage;
