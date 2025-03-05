import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  VStack, 
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Button,
  Stack,
  Divider,
  Input,
  FormControl,
  useToast,
  Flex, // Added Flex
} from '@chakra-ui/react';
import { useSimpleAuth } from '../context/SimpleAuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import CreateTeamModal from '../components/admin/CreateTeamModal';

const AuthForm = ({ isLogin, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={3}>
        <FormControl>
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            bg="white"
            color="black"
            _placeholder={{ color: 'gray.500' }}
          />
        </FormControl>
        <FormControl>
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            bg="white"
            color="black"
            _placeholder={{ color: 'gray.500' }}
          />
        </FormControl>
      </VStack>
    </form>
  );
};

const RoleCard = ({ role, title }) => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const { signIn, signUp } = useSimpleAuth();

  const handleSubmit = async (credentials) => {
    try {
      if (isLogin) {
        const success = await signIn(credentials);
        if (success) {
          // Wait for auth state to be confirmed
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error) throw error;
          
          // Update user role and redirect
          const { error: updateError } = await supabase.auth.updateUser({
            data: { role: role }
          });
          if (updateError) throw updateError;

          // Navigate based on role
          switch (role) {
            case 'team-admin':
              navigate('/team-admin');
              break;
            case 'league-admin':
              navigate('/league-admin');
              break;
            case 'user':
              navigate('/');
              break;
            default:
              navigate('/');
          }
        }
      } else {
        const success = await signUp(credentials);
        if (success) {
          handlePostSignup(role);
        }
      }
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) throw error;

      if (user) {
        // Update user role and redirect
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: role }
        });
        if (updateError) throw updateError;

        // Navigate based on role
        switch (role) {
          case 'team-admin':
            navigate('/team-admin');
            break;
          case 'league-admin':
            navigate('/league-admin');
            break;
          case 'user':
            navigate('/');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error) {
      toast({
        title: "Google Sign In Error",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handlePostSignup = async (role) => {
    try {
      // Wait for auth state to be fully updated
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      // Ensure role is set in metadata before redirecting
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { role: role }
      });
      if (updateError) throw updateError;

      switch (role) {
        case 'team-admin':
          setShowTeamModal(true); // Show team creation modal instead of immediate navigation
          break;
        case 'league-admin':
          navigate('/league-admin');
          toast({
            title: "League Admin Account Created",
            description: "Please complete your league setup to allow teams to join.",
            status: "success",
            duration: 5000,
          });
          break;
        case 'user':
          navigate('/');
          toast({
            title: "Account Created",
            description: "You can now search and join your team.",
            status: "success",
            duration: 5000,
          });
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Post-signup error:', error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handlePostLogin = async (role) => {
    // Wait for authentication state to be confirmed
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Failed to confirm user login",
        status: "error",
        duration: 5000,
      });
      return;
    }

    // Ensure role is set in metadata before redirecting
    const { data, error: updateError } = await supabase.auth.updateUser({
      data: { role: role }
    });
    if (updateError) throw updateError;

    switch (role) {
      case 'team-admin':
        navigate('/team-admin');
        break;
      case 'league-admin':
        navigate('/league-admin');
        break;
      case 'user':
        navigate('/');
        break;
      default:
        navigate('/');
    }
  };

  const buttonStyles = {
    bg: '#2e3726',
    color: '#EFF7EC',
    _hover: { bg: '#3a4531' },
    _active: { bg: '#252d1f' },
    size: 'sm',
    borderRadius: '0.5rem',
  };

  const activeButtonStyles = {
    bg: '#7c866b',
    color: '#EFF7EC',
    _hover: { bg: '#7c866b' },
    _active: { bg: '#7c866b' },
    size: 'sm',
    borderRadius: '0.5rem',
  };

  return (
    <Card 
      bg="brand.primary" 
      color="white"
      borderRadius="1rem"
      boxShadow="lg"
      p={4}
    >
      <CardHeader pb={2}>
        <Heading size="md" textAlign="center">{title}</Heading>
        {!isLogin && role === 'user' && (
          <Text fontSize="sm" mt={2} textAlign="center" color="gray.200">
            Create an account to join your team
          </Text>
        )}
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <GoogleSignInButton role={role} onSuccess={(user) => {
            handlePostLogin(role);
          }} />
          
          <Divider />

          <Stack direction="row" spacing={4} justify="center">
            <Button
              {...(isLogin ? activeButtonStyles : buttonStyles)}
              onClick={() => setIsLogin(true)}
              width="50%"
            >
              Login
            </Button>
            <Button
              {...(!isLogin ? activeButtonStyles : buttonStyles)}
              onClick={() => setIsLogin(false)}
              width="50%"
            >
              Sign Up
            </Button>
          </Stack>

          <AuthForm isLogin={isLogin} onSubmit={handleSubmit} />

          <Button
            bg="#2e3726"
            color="#EFF7EC"
            _hover={{ bg: '#3a4531' }}
            _active={{ bg: '#252d1f' }}
            mt={2}
            onClick={() => handleSubmit()}
          >
            {isLogin ? 'Login' : 'Create Account'}
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

const SignInPage = () => {
  const [showTeamModal, setShowTeamModal] = useState(false);

  return (
    <>
      <Flex 
        direction="column" 
        minH="100vh"
        pt="2rem"  // Remove mt="84px" and adjust padding-top
        px={6}
        pb={6}
        bg="brand.background"  // Ensure background color is consistent
      >
        <Box maxW="1200px" mx="auto" flex="1" width="100%">
          <VStack spacing={8}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} width="100%">
              <RoleCard role="user" title="Player Login" />
              <RoleCard role="team-admin" title="Team Admin" />
              <RoleCard role="league-admin" title="League Admin" />
            </SimpleGrid>
          </VStack>
        </Box>
      </Flex>
      <CreateTeamModal 
        isOpen={showTeamModal} 
        onClose={() => {
          setShowTeamModal(false);
          navigate('/team-admin');
        }} 
      />
    </>
  );
};

export default SignInPage;
