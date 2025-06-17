import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  useToast,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { ROLES } from '../../constants/roles';
import { useAuth } from '../../hooks/useAuth';
import { handleAuthError } from '../../utils/authErrorHandler';
import GoogleSignInButton from '../GoogleSignInButton';

const formFieldStyles = {
  bg: 'brand.background',
  color: 'brand.text.primary'
};

const LoginForm = ({
  role: initialRole,
  onSuccess,
  onError,
  showGoogleSignIn = true,
  mode = 'page'
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { signIn, supabase } = useAuth();

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;

      const { user } = data;
      if (!user) throw new Error('No user returned from sign in');

      // Use the initial role or existing role from metadata
      const roleToUse = initialRole || user.user_metadata?.active_role;
      console.log('Role being set:', roleToUse); // Add logging
      
      if (roleToUse) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { 
            active_role: roleToUse,
            login_role: roleToUse
          }
        });
        if (updateError) throw updateError;
        console.log('User metadata updated with role:', roleToUse); // Add logging
      }

      onSuccess?.();
      
    } catch (error) {
      console.error('Login error:', error);
      onError?.(error);
      handleAuthError(error, (message) => {
        toast({
          title: 'Error',
          description: message,
          status: 'error',
          duration: 5000,
        });
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      if (response?.user) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Google sign-in success handler error:', error);
      onError?.(error);
      handleAuthError(error, (message) => {
        toast({
          title: 'Error',
          description: message,
          status: 'error',
          duration: 5000,
        });
      });
    }
  };

  const handleRoleSelect = async (selectedRole) => {
    try {
      await supabase.auth.updateUser({
        data: { 
          active_role: selectedRole,
          login_role: selectedRole
        }
      });

      const { error: activeRoleError } = await supabase
        .from('active_role')
        .upsert({
          active_role_user_id: user.id,
          role: selectedRole,
          updated_at: new Date().toISOString()
        }, { onConflict: 'active_role_user_id' });

      if (activeRoleError) throw activeRoleError;

      onSuccess?.();
    } catch (error) {
      console.error('Role selection error:', error);
      onError?.(error);
      handleAuthError(error, (message) => {
        toast({
          title: 'Error',
          description: message,
          status: 'error',
          duration: 5000,
        });
      });
    }
  };

  return (
    <VStack spacing={6} w="100%">
      {showGoogleSignIn && (
        <>
          <GoogleSignInButton
            role={initialRole}
            onSuccess={handleGoogleSuccess}
            onError={(error) => {
              console.error('Google sign-in error:', error);
              onError?.(error);
            }}
          />
          <Divider />
        </>
      )}
      <FormControl>
        <FormLabel color="brand.text.primary">Email</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...formFieldStyles}
        />
      </FormControl>
      <FormControl>
        <FormLabel color="brand.text.primary">Password</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...formFieldStyles}
        />
      </FormControl>
      <Button
        w="100%"
        onClick={handleEmailSignIn}
        isLoading={isLoading}
        className="app-gradient"
        color="brand.text.primary"
        _hover={{ opacity: 0.9 }}
      >
        Sign In
      </Button>
    </VStack>
  );
};

LoginForm.propTypes = {
  role: PropTypes.oneOf(Object.values(ROLES)),
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  showGoogleSignIn: PropTypes.bool,
  mode: PropTypes.oneOf(['page', 'modal'])
};

export default LoginForm;





















