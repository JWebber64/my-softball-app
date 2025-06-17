import { Button, Image, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../lib/supabaseClient';

const GoogleSignInButton = ({ onSuccess, onError, role }) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log('Initiating Google sign-in with role:', role);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          data: {
            requested_role: role,
            active_role: role,
            login_role: role
          }
        }
      });

      if (error) throw error;
      
      // Store role in localStorage as fallback
      localStorage.setItem('requested_role', role);
      
      console.log('Google sign-in successful:', {
        data,
        requestedRole: role
      });

      onSuccess?.(role);
    } catch (error) {
      console.error('Google sign-in error:', error);
      onError?.(error);
      showNotification({
        title: 'Sign-in Error',
        description: error.message || 'Failed to sign in with Google',
        status: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      isLoading={isLoading}
      w="full"
      className="app-gradient"
      color="brand.text.primary"
      _hover={{ opacity: 0.9 }}
      leftIcon={
        <Image
          src="/google-icon.svg"
          alt="Google"
          boxSize="20px"
        />
      }
    >
      <Text>Continue with Google</Text>
    </Button>
  );
};

GoogleSignInButton.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  role: PropTypes.string.isRequired
};

export default GoogleSignInButton;























