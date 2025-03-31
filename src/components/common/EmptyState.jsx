import {
  Box,
  VStack,
  Text,
  Button,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FiInbox } from 'react-icons/fi';
import PropTypes from 'prop-types';
import React from 'react';

const EmptyState = ({
  icon = FiInbox,
  title = 'No Data Found',
  message = 'There are no items to display.',
  action,
  actionText
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Box
      p={8}
      bg={bgColor}
      borderRadius="lg"
      width="100%"
    >
      <VStack spacing={4}>
        <Icon as={icon} boxSize={12} color={textColor} />
        <Text
          fontSize="xl"
          fontWeight="medium"
          color={textColor}
        >
          {title}
        </Text>
        <Text
          color={textColor}
          textAlign="center"
        >
          {message}
        </Text>
        {action && actionText && (
          <Button
            onClick={action}
            colorScheme="blue"
            size="sm"
          >
            {actionText}
          </Button>
        )}
      </VStack>
    </Box>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  message: PropTypes.string,
  action: PropTypes.func,
  actionText: PropTypes.string
};

export default EmptyState;