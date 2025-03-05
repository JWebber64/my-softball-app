import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { signInWithGoogle } from '../Auth/googleSignIn';
import { Button, Image, HStack, Text } from '@chakra-ui/react';

const GoogleSignInButton = ({ role }) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await signInWithGoogle(role);
      
      if (error) throw error;

      if (data?.user) {
        if (role === 'team-admin') {
          navigate('/team-admin', { replace: true });
        }
        showNotification(`Successfully signed in as ${role}`, 'success');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      showNotification('Failed to sign in with Google: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      width="100%"
      height="40px"
      backgroundColor="black"
      color="white"
      borderRadius="0.5rem"
      display="flex"
      alignItems="center"
      justifyContent="center"
      isLoading={isLoading}
      loadingText="Signing in..."
      _hover={{ backgroundColor: "#333" }}
    >
      <HStack spacing={2}>
        <Image
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google Logo"
          width="18px"
          height="18px"
        />
        <Text>Sign in with Google</Text>
      </HStack>
    </Button>
  );
};

export default GoogleSignInButton;
