import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import useVoiceRecognition from '../../hooks/useVoiceRecognition';
import { VoiceCommandManager } from '../../utils/voiceCommands';
import CommandHelpDialog from './CommandHelpDialog';
import UniversalScoreSheet from './UniversalScoreSheet';

/**
 * VoiceCommandPanel - Consolidated component for voice command functionality
 * 
 * This component combines the functionality of VoiceCommandPanel and VoiceInputModal
 */
const VoiceCommandPanel = ({ 
  isActive, 
  onToggle,
  onGameChange,
  currentGame,
  onScoreUpdate,
  onZoom,
  isModal = false,
  onClose = null,
  onSave = null,
  initialData = null
}) => {
  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition();
  const { isOpen, onOpen, onClose: onHelpClose } = useDisclosure();
  const [lastCommand, setLastCommand] = useState('');
  const prevIsActiveRef = useRef(isActive);
  const [scoreSheetData, setScoreSheetData] = useState(initialData);

  // Fix potential recursion with isListening state changes
  useEffect(() => {
    if (isActive !== prevIsActiveRef.current) {
      if (isActive && !isListening) {
        startListening();
      } else if (!isActive && isListening) {
        stopListening();
      }
      prevIsActiveRef.current = isActive;
    }
  }, [isActive, isListening]);

  useEffect(() => {
    if (transcript) {
      const voiceManager = new VoiceCommandManager();
      voiceManager.setActions({
        onGameChange,
        currentGame,
        onScoreUpdate,
        onZoom,
        onToggle
      });
      voiceManager.processCommand(transcript);
    }
  }, [currentGame, onGameChange, onScoreUpdate, onToggle, onZoom, transcript]);

  const handleToggle = () => {
    onToggle(!isActive);
  };

  const handleDataChange = (newData) => {
    setScoreSheetData(newData);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(scoreSheetData);
      if (onClose) onClose();
    }
  };

  // Render as modal if isModal is true
  if (isModal) {
    return (
      <Modal isOpen={true} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxWidth="90vw">
          <ModalHeader>Voice Input Score Sheet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <HStack>
                <IconButton
                  icon={isActive ? <FaMicrophoneSlash /> : <FaMicrophone />}
                  onClick={handleToggle}
                  aria-label={isActive ? "Stop listening" : "Start listening"}
                  colorScheme={isActive ? "red" : "green"}
                />
                <Text>{isActive ? "Listening..." : "Click to start voice input"}</Text>
              </HStack>
              
              <Box p={2} borderWidth="1px" borderRadius="md" minHeight="100px">
                <Text>{transcript || "No speech detected"}</Text>
              </Box>
              
              <Box overflowX="auto">
                <UniversalScoreSheet
                  data={scoreSheetData}
                  onDataChange={handleDataChange}
                  viewMode="edit"
                  canEdit={true}
                  showInningTotals={true}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  // Render as panel
  return (
    <Box mb={4} p={4} borderRadius="md" bg="gray.50">
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontWeight="bold">Voice Commands</Text>
        <Badge colorScheme={isActive ? "green" : "gray"}>
          {isActive ? "Recording" : "Inactive"}
        </Badge>
      </Flex>

      <VStack spacing={2}>
        <Button
          onClick={handleToggle}
          colorScheme={isActive ? "red" : "green"}
          width="100%"
        >
          {isActive ? "Stop Recording" : "Start Recording"}
        </Button>

        {isActive && (
          <Box
            w="100%"
            p={2}
            bg="gray.100"
            borderRadius="md"
            minH="60px"
            maxH="100px"
            overflowY="auto"
          >
            <Text fontSize="sm" fontWeight="bold">Last command: {lastCommand}</Text>
            <Text fontSize="sm">{transcript || "Listening..."}</Text>
          </Box>
        )}

        <Button
          size="sm"
          variant="outline"
          width="100%"
          onClick={onOpen}
        >
          View Command List
        </Button>
      </VStack>

      <CommandHelpDialog isOpen={isOpen} onClose={onHelpClose} />
    </Box>
  );
};

VoiceCommandPanel.propTypes = {
  isActive: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  onGameChange: PropTypes.func,
  currentGame: PropTypes.number,
  onScoreUpdate: PropTypes.func,
  onZoom: PropTypes.func,
  isModal: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  initialData: PropTypes.object
};

export default VoiceCommandPanel;


