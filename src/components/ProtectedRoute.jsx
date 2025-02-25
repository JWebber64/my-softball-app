import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from '../context/AuthContext';
import { Box, Progress, Text } from '@chakra-ui/react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  console.log('ProtectedRoute:', {
    path: location.pathname,
    hasUser: !!user,
    loading,
  });

  if (loading) {
    return (
      <Box p={4}>
        <Progress size="xs" isIndeterminate />
        <Text mt={2}>Checking authentication...</Text>
      </Box>
    );
  }

  if (!user) {
    console.log('User not authenticated, redirecting to home');
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;
