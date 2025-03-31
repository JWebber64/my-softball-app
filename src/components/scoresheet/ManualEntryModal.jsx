import {
  Box,
  Flex,
  useToast
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const ManualEntryModal = ({ onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const renderComparisonView = () => {
    return (
      <Flex 
        direction={{ base: 'column', lg: 'row' }}
        gap={4}
        w="100%"
        justify="center"
        align="stretch"
      >
        <Box 
          flex="1"
          bg="white"
          p={4}
          borderRadius="md"
          boxShadow="md"
          maxH={{ lg: '80vh' }}
          overflow="auto"
        >
          {/* Content */}
        </Box>
      </Flex>
    );
  };

  return renderComparisonView();
};

ManualEntryModal.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default ManualEntryModal;
