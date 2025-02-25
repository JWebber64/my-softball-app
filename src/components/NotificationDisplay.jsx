import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { Alert, AlertIcon, AlertTitle, Box } from '@chakra-ui/react';

const NotificationDisplay = () => {
  const { notification } = useNotification();

  if (!notification) return null;

  return (
    <Box
      position="fixed"
      top="20px"
      right="20px"
      zIndex="toast"
      maxWidth="400px"
    >
      <Alert
        status={notification.type}
        variant="solid"
        borderRadius="md"
      >
        <AlertIcon />
        <AlertTitle>{notification.message}</AlertTitle>
      </Alert>
    </Box>
  );
};

export default NotificationDisplay;