import { Button, HStack } from '@chakra-ui/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <HStack spacing={4} p={4}>
      <Button onClick={() => navigate('/')}>Home</Button>
      <Button onClick={() => navigate('/scoresheets')}>Scoresheets</Button>
      <Button onClick={() => navigate('/stats')}>Stats</Button>
      <Button onClick={() => navigate('/admin')}>Admin</Button>
    </HStack>
  );
};

export default Navigation;
