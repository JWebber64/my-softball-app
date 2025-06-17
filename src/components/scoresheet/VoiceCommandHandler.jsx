import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Button, 
  Text, 
  useToast, 
  HStack, 
  Badge,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

/**
 * Voice Command Handler for Universal ScoreSheet
 * 
 * This component listens for voice commands and translates them into
 * scoresheet data updates.
 */
const VoiceCommandHandler = ({ 
  isActive = false, 
  onCommand, 
  onToggle,
  recognizedText = '',
  setRecognizedText
}) => {
  const [isListening, setIsListening] = useState(isActive);
  const [recognition, setRecognition] = useState(null);
  const toast = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Browser compatibility check
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          setRecognizedText(transcript);
          
          // Process commands when we have a final result
          const isFinal = event.results[0].isFinal;
          if (isFinal) {
            processCommand(transcript);
          }
        };
        
        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          if (event.error === 'not-allowed') {
            toast({
              title: 'Microphone access denied',
              description: 'Please allow microphone access to use voice commands',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            setIsListening(false);
            onToggle(false);
          }
        };
        
        setRecognition(recognitionInstance);
      } else {
        toast({
          title: 'Speech recognition not supported',
          description: 'Your browser does not support speech recognition',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  // Toggle listening state based on isActive prop
  useEffect(() => {
    setIsListening(isActive);
    
    if (recognition) {
      if (isActive) {
        try {
          recognition.start();
        } catch (e) {
          // Already started
        }
      } else {
        recognition.stop();
      }
    }
  }, [isActive, recognition]);

  // Process voice commands
  const processCommand = (transcript) => {
    // Convert to lowercase for easier matching
    const command = transcript.toLowerCase().trim();
    
    // Command patterns
    const playerPattern = /player (\d+)/i;
    const inningPattern = /inning (\d+)/i;
    const eventPattern = /(single|double|triple|home run|walk|strikeout|flyout|groundout|hit|out)/i;
    const scorePattern = /(scored|run)/i;
    
    // Extract player number
    const playerMatch = command.match(playerPattern);
    const playerNum = playerMatch ? parseInt(playerMatch[1], 10) - 1 : null;
    
    // Extract inning number
    const inningMatch = command.match(inningPattern);
    const inningNum = inningMatch ? parseInt(inningMatch[1], 10) - 1 : null;
    
    // Extract event type
    const eventMatch = command.match(eventPattern);
    const eventType = eventMatch ? eventMatch[1] : null;
    
    // Check if player scored
    const scoreMatch = command.match(scorePattern);
    const didScore = scoreMatch !== null;
    
    // If we have player and inning, process the command
    if (playerNum !== null && inningNum !== null) {
      let update = {
        playerIndex: playerNum,
        inningIndex: inningNum,
        updates: {}
      };
      
      // Add event if recognized
      if (eventType) {
        update.updates['events.primary'] = eventType;
        
        // If it's an out, mark it
        if (eventType.includes('out') || eventType === 'strikeout') {
          update.updates['events.out'] = 'out';
        }
      }
      
      // Add scoring if mentioned
      if (didScore) {
        update.updates['diamond.scored'] = true;
        
        // If it's a home run, mark all bases
        if (eventType === 'home run') {
          update.updates['diamond.bases'] = [true, true, true];
        }
      }
      
      // If we have updates to make, send the command
      if (Object.keys(update.updates).length > 0) {
        onCommand(update);
        
        toast({
          title: 'Command recognized',
          description: `Updated player ${playerNum + 1}, inning ${inningNum + 1}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleToggle = () => {
    const newState = !isListening;
    setIsListening(newState);
    onToggle(newState);
    
    if (recognition) {
      if (newState) {
        try {
          recognition.start();
          toast({
            title: 'Voice commands activated',
            description: 'Listening for scoresheet commands',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        } catch (e) {
          // Already started
        }
      } else {
        recognition.stop();
        toast({
          title: 'Voice commands deactivated',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Box>
      <HStack spacing={2} mb={2}>
        <Tooltip label={isListening ? 'Stop voice commands' : 'Start voice commands'}>
          <IconButton
            icon={isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
            onClick={handleToggle}
            colorScheme={isListening ? 'red' : 'green'}
            aria-label={isListening ? 'Stop voice commands' : 'Start voice commands'}
          />
        </Tooltip>
        
        <Badge colorScheme={isListening ? 'green' : 'gray'}>
          {isListening ? 'Listening' : 'Microphone Off'}
        </Badge>
        
        {isListening && recognizedText && (
          <Text fontSize="sm" fontStyle="italic" ml={2}>
            "{recognizedText}"
          </Text>
        )}
      </HStack>
      
      {isListening && (
        <Box fontSize="xs" mb={2}>
          <Text fontWeight="bold">Voice Command Examples:</Text>
          <Text>"Player 3 inning 2 single"</Text>
          <Text>"Player 5 inning 4 home run scored"</Text>
          <Text>"Player 1 inning 3 groundout"</Text>
        </Box>
      )}
    </Box>
  );
};

VoiceCommandHandler.propTypes = {
  isActive: PropTypes.bool,
  onCommand: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  recognizedText: PropTypes.string,
  setRecognizedText: PropTypes.func.isRequired
};

export default VoiceCommandHandler;