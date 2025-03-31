import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack
} from '@chakra-ui/react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const ModalSignup = ({ isOpen, onClose, role }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = await captchaRef.current.execute();
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role || 'user'
          },
          captchaToken: token
        }
      });

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error signing up:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sign Up</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSignup}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <HCaptcha
                ref={captchaRef}
                sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
                size="invisible"
              />
              <Button
                type="submit"
                colorScheme="green"
                width="full"
                isLoading={loading}
              >
                Sign Up
              </Button>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

ModalSignup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  role: PropTypes.string
};

export default ModalSignup;  // Ensure default export
