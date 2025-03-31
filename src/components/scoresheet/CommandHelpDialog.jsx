import {
  Box,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';
import { COMMAND_TYPES, getGroupedCommands } from '../../utils/voiceCommands';

/**
 * Dialog component that displays available voice commands
 * Grouped by command type (navigation, scoring, etc.)
 */
const CommandHelpDialog = ({ isOpen, onClose }) => {
  const groupedCommands = getGroupedCommands();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const cardBgColor = useColorModeValue('gray.50', 'gray.700');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');

  const typeLabels = {
    [COMMAND_TYPES.NAVIGATION]: 'Navigation',
    [COMMAND_TYPES.SCORING]: 'Scoring',
    [COMMAND_TYPES.IMAGE]: 'Image Controls',
    [COMMAND_TYPES.SYSTEM]: 'System Commands',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={bgColor} color={textColor}>
        <ModalHeader borderBottomWidth="1px">Available Voice Commands</ModalHeader>
        <ModalCloseButton />
        <ModalBody py={4}>
          {Object.entries(groupedCommands).map(([type, commands]) => (
            <Box key={type} mb={6}>
              <Heading size="sm" mb={2} color="brand.primary">
                {typeLabels[type] || type}
              </Heading>
              <VStack align="stretch" spacing={2}>
                {commands.map((command) => (
                  <Box 
                    key={command.phrase} 
                    p={3} 
                    borderRadius="md" 
                    bg={cardBgColor}
                    boxShadow="sm"
                  >
                    <Text fontWeight="bold">&quot;{command.phrase}&quot;</Text>
                    <Text fontSize="sm" color={descriptionColor}>{command.description}</Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

CommandHelpDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default CommandHelpDialog;
