import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  useToast,
  Box,
  Text,
  Flex,
  Image,
  Heading,
} from '@chakra-ui/react';
import DigitalScoreSheet from './DigitalScoreSheet';

// COMPLETELY REWRITTEN VERSION - 2023-06-15-12-34-56

const ManualEntryModal = ({ 
  isOpen, 
  onClose, 
  originalImage = null, 
  onSave = null 
}) => {
  const [scoreSheetData, setScoreSheetData] = useState({
    gameNumber: '',
    gameDate: '',
    gameTime: '',
    field: '',
    opponent: '',
    isHomeTeam: false,
    innings: [],
    lineup: [],
    final_score: { home: 0, away: 0 }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleDataChange = (newData) => {
    setScoreSheetData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (onSave) {
        await onSave(scoreSheetData);
      }
      onClose();
      toast({
        title: 'Success',
        description: 'Score sheet saved successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving scoresheet:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save score sheet',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inline comparison view instead of using a separate component
  const renderComparisonView = () => {
    return (
      <Flex 
        direction={{ base: 'column', lg: 'row' }}
        gap={4}
        w="100%"
        justify="center"
        align="stretch"
      >
        {/* Original Image Side */}
        <Box 
          flex="1"
          bg="white"
          p={4}
          borderRadius="md"
          boxShadow="md"
          maxH={{ lg: '80vh' }}
          overflow="auto"
        >
          <Heading size="md" mb={4} textAlign="center">Original Scoresheet</Heading>
          {originalImage ? (
            <Image 
              src={originalImage} 
              alt="Original scoresheet" 
              maxW="100%" 
              mx="auto"
              border="1px solid"
              borderColor="gray.200"
            />
          ) : (
            <Text textAlign="center" color="gray.500" py={10}>
              No original image available
            </Text>
          )}
        </Box>

        {/* Digital Scoresheet Side */}
        <Box 
          flex="1"
          maxH={{ lg: '80vh' }}
          overflow="auto"
        >
          <Heading size="md" mb={4} textAlign="center">Digital Entry</Heading>
          <Box
            bg="white"
            p={6}
            borderRadius="lg"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          >
            <DigitalScoreSheet 
              data={scoreSheetData}
              onDataChange={handleDataChange}
              editable={true}
            />
          </Box>
        </Box>
      </Flex>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="full"
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent 
        maxH="90vh"
        bg="#7C866B"
        my="5vh"
      >
        <Text fontSize="3xl" color="purple.600" bg="green.200" p={2} textAlign="center">
          COMPLETELY REWRITTEN MANUAL ENTRY MODAL
        </Text>
        <ModalHeader 
          color="black"
          textAlign="center"
        >
          Manual Score Entry - {new Date().toLocaleTimeString()}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody 
          p={6} 
          overflow="auto"
        >
          {renderComparisonView()}
        </ModalBody>
        <ModalFooter
          display="flex"
          justifyContent="center"
          gap={3}
        >
          <Button
            bg="#545e46"
            color="#EFF7EC"
            _hover={{ bg: "#3a4531" }}
            onClick={handleSave}
            isLoading={isSubmitting}
          >
            Save
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

ManualEntryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  originalImage: PropTypes.string,
  onSave: PropTypes.func
};

export default ManualEntryModal;
