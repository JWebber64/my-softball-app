import { WarningIcon } from '@chakra-ui/icons';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Spinner,
  Text,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const SectionCard = ({
  title,
  children,
  loading,
  error,
  isEmpty,
  icon
}) => {
  return (
    <Box
      bg="brand.primary.base"
      color="brand.text.primary"
      borderRadius="md"
      p={6}
      shadow="sm"
      borderWidth="1px"
      borderColor="brand.border"
      height="100%"
    >
      <VStack spacing={4} align="stretch">
        <HStack>
          {icon && <Icon as={icon} boxSize={6} color="brand.text.primary" />}
          <Heading size="md" color="brand.text.primary">{title}</Heading>
        </HStack>

        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" color="brand.text.primary" />
          </Box>
        ) : error ? (
          <Box textAlign="center" py={8}>
            <WarningIcon boxSize={8} color="red.500" />
            <Text mt={2} color="red.500">Error loading data</Text>
          </Box>
        ) : isEmpty ? (
          <Box textAlign="center" py={8}>
            <Text color="brand.text.secondary">No data available</Text>
          </Box>
        ) : (
          children
        )}
      </VStack>
    </Box>
  );
};

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  loading: PropTypes.bool,
  error: PropTypes.any,
  isEmpty: PropTypes.bool,
  icon: PropTypes.elementType
};

SectionCard.defaultProps = {
  loading: false,
  error: null,
  isEmpty: false
};

export default SectionCard;

