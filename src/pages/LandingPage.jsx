import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, Button, VStack, Grid, GridItem, Card, CardBody, Input, Flex, Divider } from '@chakra-ui/react';
import { signInWithGoogle } from '../Auth/googleSignIn';
import { useSimpleAuth } from '../context/SimpleAuthContext';
import { supabase } from '../lib/supabaseClient';

const LandingPage = () => {
  const { isAuthenticated, signInWithEmail, signUpWithEmail } = useSimpleAuth();
  const navigate = useNavigate();
  const bypassProcessedRef = useRef(false);
  
  // State for form inputs
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [teamAdminEmail, setTeamAdminEmail] = useState('');
  const [teamAdminPassword, setTeamAdminPassword] = useState('');
  const [leagueAdminEmail, setLeagueAdminEmail] = useState('');
  const [leagueAdminPassword, setLeagueAdminPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Handle bypass redirect logic
  useEffect(() => {
    const bypassRedirect = localStorage.getItem('bypassRedirect');
    const bypassTimestamp = localStorage.getItem('bypassTimestamp');
    const forceHomeNavigation = localStorage.getItem('forceHomeNavigation');
    
    console.log("LandingPage: Checking bypass flags:", { 
      bypassRedirect, 
      bypassTimestamp,
      forceHomeNavigation,
      current: new Date().getTime()
    });
    
    if (bypassRedirect && bypassTimestamp && !bypassProcessedRef.current) {
      const now = new Date().getTime();
      const timestamp = parseInt(bypassTimestamp, 10);
      
      // If the timestamp is less than 5 minutes old, honor the bypass
      if (now - timestamp < 5 * 60 * 1000) {
        console.log("Bypass redirect active - STAYING ON LANDING PAGE");
        localStorage.removeItem('bypassRedirect');
        localStorage.removeItem('bypassTimestamp');
        localStorage.removeItem('forceHomeNavigation');
        bypassProcessedRef.current = true;
        return; // Exit early to prevent redirect
      }
      
      localStorage.removeItem('bypassRedirect');
      localStorage.removeItem('bypassTimestamp');
      localStorage.removeItem('forceHomeNavigation');
      bypassProcessedRef.current = true;
    }
    
    // Only redirect if authenticated and no bypass flag
    if (isAuthenticated) {
      console.log("Authenticated user, redirecting to team stats");
      navigate('/team-stats');
    }
  }, [isAuthenticated, navigate]);

  // Handle Google Sign In
  const handleGoogleSignIn = async (role) => {
    try {
      await signInWithGoogle();
      // Role will be set in the profile after sign-in
      console.log(`Google sign in as ${role}`);
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  // Handle Email Sign In/Sign Up
  const handleEmailAuth = async (email, password, role, isSigningUp) => {
    try {
      if (isSigningUp) {
        const { success, error } = await signUpWithEmail(email, password, { role });
        if (success) {
          alert(`Signed up as ${role}. Please check your email for confirmation.`);
        } else {
          alert(`Sign up error: ${error.message}`);
        }
      } else {
        const { success, error } = await signInWithEmail(email, password);
        if (success) {
          alert(`Logged in as ${role}`);
        } else {
          alert(`Login error: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Email auth error:', error);
      alert(`Authentication error: ${error.message}`);
    }
  };

  return (
    <Box width="100%" maxW="1200px" mx="auto" px={4} py={6}>
      {/* Welcome Banner */}
      <Card bg="#545E46" color="#c0fad0" mb={8} borderRadius="1rem" boxShadow="lg">
        <CardBody p={6}>
          <VStack spacing={4} align="center">
            <Heading size="xl" textAlign="center">Welcome to the Softball App</Heading>
            <Text fontSize="lg" textAlign="center">
              Track your team's stats, manage scoresheets, and stay connected with your league
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Auth Cards */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} mb={8}>
        {/* User Card */}
        <GridItem>
          <Card 
            bg="#545E46" 
            color="#c0fad0" 
            height="100%" 
            borderRadius="1rem"
            boxShadow="md"
          >
            <CardBody p={6}>
              <VStack spacing={4} align="center">
                <Heading size="md">Player / User</Heading>
                <Divider />
                
                <Input 
                  placeholder="Email" 
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  bg="rgba(255,255,255,0.1)"
                  color="#c0fad0"
                  _placeholder={{ color: "rgba(192,250,208,0.7)" }}
                />
                
                <Input 
                  placeholder="Password" 
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  bg="rgba(255,255,255,0.1)"
                  color="#c0fad0"
                  _placeholder={{ color: "rgba(192,250,208,0.7)" }}
                />
                
                <Button 
                  width="100%"
                  colorScheme="green" 
                  bg="#6b7660" 
                  _hover={{ bg: "#7c866b" }}
                  onClick={() => handleEmailAuth(userEmail, userPassword, 'user', isSignUp)}
                >
                  {isSignUp ? 'Sign Up' : 'Login'}
                </Button>
                
                <Button
                  width="100%"
                  onClick={() => handleGoogleSignIn('user')}
                  bg="#2e3726"
                  color="#c0fad0"
                  _hover={{ bg: "#3a4632" }}
                >
                  Sign in with Google
                </Button>
                
                <Button 
                  variant="link" 
                  color="#c0fad0" 
                  onClick={() => setIsSignUp(!isSignUp)}
                  fontSize="sm"
                >
                  {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Team Admin Card */}
        <GridItem>
          <Card 
            bg="#545E46" 
            color="#c0fad0" 
            height="100%" 
            borderRadius="1rem"
            boxShadow="md"
          >
            <CardBody p={6}>
              <VStack spacing={4} align="center">
                <Heading size="md">Team Admin</Heading>
                <Divider />
                
                <Input 
                  placeholder="Email" 
                  value={teamAdminEmail}
                  onChange={(e) => setTeamAdminEmail(e.target.value)}
                  bg="rgba(255,255,255,0.1)"
                  color="#c0fad0"
                  _placeholder={{ color: "rgba(192,250,208,0.7)" }}
                />
                
                <Input 
                  placeholder="Password" 
                  type="password"
                  value={teamAdminPassword}
                  onChange={(e) => setTeamAdminPassword(e.target.value)}
                  bg="rgba(255,255,255,0.1)"
                  color="#c0fad0"
                  _placeholder={{ color: "rgba(192,250,208,0.7)" }}
                />
                
                <Button 
                  width="100%"
                  colorScheme="green" 
                  bg="#6b7660" 
                  _hover={{ bg: "#7c866b" }}
                  onClick={() => handleEmailAuth(teamAdminEmail, teamAdminPassword, 'team-admin', isSignUp)}
                >
                  {isSignUp ? 'Sign Up' : 'Login'}
                </Button>
                
                <Button
                  width="100%"
                  onClick={() => handleGoogleSignIn('team-admin')}
                  bg="#2e3726"
                  color="#c0fad0"
                  _hover={{ bg: "#3a4632" }}
                >
                  Sign in with Google
                </Button>
                
                <Button 
                  variant="link" 
                  color="#c0fad0" 
                  onClick={() => setIsSignUp(!isSignUp)}
                  fontSize="sm"
                >
                  {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* League Admin Card */}
        <GridItem>
          <Card 
            bg="#545E46" 
            color="#c0fad0" 
            height="100%" 
            borderRadius="1rem"
            boxShadow="md"
          >
            <CardBody p={6}>
              <VStack spacing={4} align="center">
                <Heading size="md">League Admin</Heading>
                <Divider />
                
                <Input 
                  placeholder="Email" 
                  value={leagueAdminEmail}
                  onChange={(e) => setLeagueAdminEmail(e.target.value)}
                  bg="rgba(255,255,255,0.1)"
                  color="#c0fad0"
                  _placeholder={{ color: "rgba(192,250,208,0.7)" }}
                />
                
                <Input 
                  placeholder="Password" 
                  type="password"
                  value={leagueAdminPassword}
                  onChange={(e) => setLeagueAdminPassword(e.target.value)}
                  bg="rgba(255,255,255,0.1)"
                  color="#c0fad0"
                  _placeholder={{ color: "rgba(192,250,208,0.7)" }}
                />
                
                <Button 
                  width="100%"
                  colorScheme="green" 
                  bg="#6b7660" 
                  _hover={{ bg: "#7c866b" }}
                  onClick={() => handleEmailAuth(leagueAdminEmail, leagueAdminPassword, 'league-admin', isSignUp)}
                >
                  {isSignUp ? 'Sign Up' : 'Login'}
                </Button>
                
                <Button
                  width="100%"
                  onClick={() => handleGoogleSignIn('league-admin')}
                  bg="#2e3726"
                  color="#c0fad0"
                  _hover={{ bg: "#3a4632" }}
                >
                  Sign in with Google
                </Button>
                
                <Button 
                  variant="link" 
                  color="#c0fad0" 
                  onClick={() => setIsSignUp(!isSignUp)}
                  fontSize="sm"
                >
                  {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default LandingPage;
