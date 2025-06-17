import { Box, Heading, Image, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import LanyardCard from '../components/common/LanyardCard';
import { useAuth } from '../hooks/useAuth';

const SignInPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  const roleConfigs = [
    { id: 'player', role: 'player', title: 'Player', index: 0 },
    { id: 'teamAdmin', role: 'team-admin', title: 'Team Admin', index: 1 },
    { id: 'leagueAdmin', role: 'league-admin', title: 'League Admin', index: 2 }
  ];

  useEffect(() => {
    // Wait for auth to be checked before redirecting
    if (loading) return;

    // Prevent authenticated users from accessing sign-in page
    if (isAuthenticated) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, navigate, loading]);

  // Show nothing while checking auth
  if (loading || isAuthenticated) {
    return null;
  }

  return (
    <Box 
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
      minHeight="calc(100vh - 140px)" /* Subtract header (80px) and footer (60px) heights */
      py={8}
      bg="brand.background"
    >
      <Box
        display="flex"
        gap={{ base: "40px", lg: "120px" }}
        justifyContent="center"
        alignItems="center"
        maxW="1400px"
        mx="auto"
        px={4}
        flexWrap={{ base: "wrap", lg: "nowrap" }}
        mt="80px" /* Add margin to push content down */
      >
        {roleConfigs.map(({ id, role, title, index }) => (
          <Box
            key={id}
            width="300px"
            position="relative"
          >
            <LanyardCard index={index}>
              <VStack spacing={4} align="stretch">
                <Image 
                  src="/Diamonddata.png"
                  alt="Diamond Data Logo"
                  height="60px"
                  width="60px"
                  objectFit="contain"
                  mx="auto"
                />
                <Heading 
                  size="md" 
                  color="whiteAlpha.900" 
                  textAlign="center"
                >
                  {title}
                </Heading>
                <LoginForm
                  role={role}
                  showGoogleSignIn={true}
                />
              </VStack>
            </LanyardCard>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SignInPage;
