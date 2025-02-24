import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Box,
} from '@chakra-ui/react';
import DigitalScoreSheet from './DigitalScoreSheet';

const ManualInputModal = ({ isOpen, onClose }) => {
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
          color="black"
          textAlign="center"
        >
          Manual Score Entry
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
            <DigitalScoreSheet />
          </Box>
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
            onClick={onClose}
            size="lg"
          >
            Save
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            size="lg"
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ManualInputModal;
