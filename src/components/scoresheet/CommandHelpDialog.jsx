import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  VStack,
  Heading,
} from '@chakra-ui/react';
import { COMMAND_TYPES, getGroupedCommands } from '../../utils/voiceCommands';

const CommandHelpDialog = ({ isOpen, onClose }) => {
  const groupedCommands = getGroupedCommands();

  const typeLabels = {
    [COMMAND_TYPES.NAVIGATION]: 'Navigation',
    [COMMAND_TYPES.SCORING]: 'Scoring',
    [COMMAND_TYPES.IMAGE]: 'Image Controls',
    [COMMAND_TYPES.SYSTEM]: 'System Commands',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Available Voice Commands</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {Object.entries(groupedCommands).map(([type, commands]) => (
              <Box key={type}>
                <Heading size="sm" color="gray.600" mb={2}>
                  {typeLabels[type]}
                </Heading>
                <VStack align="stretch" spacing={2} pl={4}>
                  {commands.map(({ command, description }) => (
                    <Box key={command}>
                      <Text fontWeight="bold">"{command}"</Text>
                      <Text fontSize="sm" color="gray.600">
                        {description}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CommandHelpDialog;