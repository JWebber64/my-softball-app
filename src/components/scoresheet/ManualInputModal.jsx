import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Text,
  Heading,
} from '@chakra-ui/react';
import DigitalScoreSheet from './DigitalScoreSheet';

const ManualInputModal = ({ isOpen, onClose, onSave }) => {
  const [scoreSheetData, setScoreSheetData] = useState({});

  const handleDataChange = (newData) => {
    setScoreSheetData(newData);
  };

  const handleSave = () => {
    onSave?.(scoreSheetData);
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
        position="relative"
      >
        <ModalHeader 
          color="white"
          textAlign="center"
        >
          <Box
            bg="#2e3726"
            py={2}
            px={4}
            borderRadius="md"
            mx="auto"
            textAlign="center"
            width="fit-content"
          >
            <Text fontWeight="bold">Manual Score Entry</Text>
          </Box>
        </ModalHeader>
        <ModalBody 
          p={6} 
          overflow="auto"
        >
          <Box 
            px={4}
            mx="auto"
            maxW="160mm"
            w="100%"
            bg="white"
            p={6}
            borderRadius="lg"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          >
            <Box
              bg="#2e3726"
              py={2}
              px={4}
              borderRadius="md"
              mx="auto"
              mb={4}
              textAlign="center"
              width="fit-content"
            >
              <Text color="white" fontWeight="bold">Digital Scoresheet</Text>
            </Box>
            <DigitalScoreSheet 
              editable={true} 
              onDataChange={handleDataChange}
            />
          </Box>
        </ModalBody>
        <ModalFooter
          display="flex"
          justifyContent="center"
          gap={3}
          bg="#7C866B"
          position="sticky"
          bottom="0"
          p={4}
          borderTop="1px solid"
          borderColor="rgba(255,255,255,0.1)"
        >
          <Button
            bg="#545E46"
            color="#EFF7EC"
            _hover={{ bg: "#6b7660" }}
            onClick={handleSave}
            size="lg"
            borderRadius="1rem"
          >
            Save
          </Button>
          <Button 
            bg="#545E46"
            color="#EFF7EC"
            _hover={{ bg: "#6b7660" }}
            onClick={onClose}
            size="lg"
            borderRadius="1rem"
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ManualInputModal;
