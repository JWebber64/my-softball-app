import { Box, Heading, Image, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import LoginForm from '../components/auth/LoginForm';
import LanyardCard from '../components/common/LanyardCard';
import { NotificationProvider } from '../context/NotificationContext';

const SignInPage = () => {
  const roleConfigs = [
    { id: 'player', role: 'player', title: 'Player', index: 0 },
    { id: 'teamAdmin', role: 'team-admin', title: 'Team Admin', index: 1 },
    { id: 'leagueAdmin', role: 'league-admin', title: 'League Admin', index: 2 }
  ];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <NotificationProvider>
      <Box 
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        width="100%"
        py={8}
        bg="var(--app-background)"
        overflow="hidden"
      >
        <Box
          display="flex"
          gap={{ base: "40px", lg: "120px" }} // Increased gap on larger screens
          justifyContent="center"
          alignItems="center"
          maxW="1400px" // Increased max width to accommodate spread
          mx="auto"
          px={4}
          flexWrap={{ base: "wrap", lg: "nowrap" }}
          position="relative" // Added for absolute positioning reference
        >
          {roleConfigs.map(({ id, role, title, index }) => (
            <Box
              key={id}
              width="300px"
              transform={
                role === 'player' 
                  ? { lg: 'translateX(-80px)' } 
                  : role === 'league-admin' 
                    ? { lg: 'translateX(80px)' }
                    : 'none'
              }
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
    </NotificationProvider>
  );
};

export default SignInPage;
