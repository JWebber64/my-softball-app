import React, { useEffect, useState } from 'react';
import { Box, Button, Text, Badge, Flex, VStack, useDisclosure, Switch, HStack, UnorderedList, ListItem } from '@chakra-ui/react';
import useVoiceRecognition from '../../hooks/useVoiceRecognition';
import { parseVoiceCommand } from '../../utils/voiceCommands';
import CommandHelpDialog from './CommandHelpDialog';

const VoiceCommandPanel = ({ 
  isActive, 
  onToggle,
  onGameChange,
  currentGame,
  onScoreUpdate,
  onZoom 
}) => {
  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [lastCommand, setLastCommand] = useState('');

  useEffect(() => {
    if (isActive && !isListening) {
      startListening();
    } else if (!isActive && isListening) {
      stopListening();
    }
  }, [isActive, isListening]);

  useEffect(() => {
    if (transcript) {
      const matchedCommand = parseVoiceCommand(transcript);
      if (matchedCommand) {
        setLastCommand(matchedCommand.command);
        matchedCommand.handler({
          onGameChange,
          currentGame,
          onScoreUpdate,
          onZoom,
          onToggle
        });
      }
    }
  }, [transcript]);

  const handleToggle = () => {
    onToggle(!isActive);
  };

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

      <CommandHelpDialog isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default VoiceCommandPanel;
