import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react';
import VoiceCommandPanel from './VoiceCommandPanel';

const VoiceInputModal = ({ isOpen, onClose }) => {
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const handleGameChange = (gameNumber) => {
    // TODO: Implement game change logic
    console.log('Game changed to:', gameNumber);
  };

  const handleScoreUpdate = (data) => {
    // TODO: Implement score update logic
    console.log('Score updated:', data);
  };

  const handleZoom = (direction) => {
    // TODO: Implement zoom logic if needed
    console.log('Zoom:', direction);
  };

  const handleClose = () => {
    setIsVoiceActive(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="#545e46">
        <ModalHeader color="#c0fad0">Voice Stats Input</ModalHeader>
        <ModalCloseButton color="#c0fad0" />
        <ModalBody>
          <VoiceCommandPanel
            isActive={isVoiceActive}
            onToggle={setIsVoiceActive}
            onGameChange={handleGameChange}
            currentGame={1}
            onScoreUpdate={handleScoreUpdate}
            onZoom={handleZoom}
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="green" onClick={handleClose}>
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VoiceInputModal;
