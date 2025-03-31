import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { handleAuthError, handleAuthSuccess } from '../../utils/authErrorHandler';

const SignupForm = ({ onSuccess }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
          }
        }
      });
      
      if (error) throw error;
      
      handleAuthSuccess('signup', (message) => {
        toast({
          title: 'Success',
          description: message,
          status: 'success',
          duration: 5000,
        });
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
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

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="green"
          width="100%"
          isLoading={isLoading}
        >
          Sign Up
        </Button>
      </VStack>
    </Box>
  );
};

SignupForm.propTypes = {
  onSuccess: PropTypes.func
};

export default SignupForm;
