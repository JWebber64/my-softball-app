import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * CommandHelpDialog - Displays help information for voice and keyboard commands
 * Used with UniversalScoreSheet for voice input functionality
 */
const CommandHelpDialog = ({ isOpen, onClose }) => {
  const commands = [
    { command: "Player [name]", description: "Set player name", example: "Player John Smith" },
    { command: "Number [#]", description: "Set player number", example: "Number 42" },
    { command: "Position [pos]", description: "Set player position", example: "Position SS" },
    { command: "Inning [#]", description: "Select inning", example: "Inning 3" },
    { command: "Single", description: "Record a single", example: "Single" },
    { command: "Double", description: "Record a double", example: "Double" },
    { command: "Triple", description: "Record a triple", example: "Triple" },
    { command: "Home run", description: "Record a home run", example: "Home run" },
    { command: "Out [type]", description: "Record an out", example: "Out fly to center" },
    { command: "Score", description: "Mark player as scored", example: "Score" },
    { command: "First base", description: "Mark player on first", example: "First base" },
    { command: "Second base", description: "Mark player on second", example: "Second base" },
    { command: "Third base", description: "Mark player on third", example: "Third base" },
    { command: "Note [text]", description: "Add a note", example: "Note great hit" },
    { command: "Clear", description: "Clear current selection", example: "Clear" },
    { command: "Next player", description: "Move to next player", example: "Next player" },
    { command: "Previous player", description: "Move to previous player", example: "Previous player" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Voice & Keyboard Commands</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4}>
            Use these commands when using voice input with the Universal Score Sheet.
            The same patterns can be used for keyboard shortcuts.
          </Text>
          
          <Box overflowY="auto" maxHeight="400px">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Command</Th>
                  <Th>Description</Th>
                  <Th>Example</Th>
                </Tr>
              </Thead>
              <Tbody>
                {commands.map((cmd, index) => (
                  <Tr key={index}>
                    <Td fontWeight="bold">{cmd.command}</Td>
                    <Td>{cmd.description}</Td>
                    <Td fontStyle="italic">{cmd.example}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

CommandHelpDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default CommandHelpDialog;

