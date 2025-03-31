import {
  Box,
  Button,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  SimpleGrid,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRole } from '../../hooks/useRole';

const ScoringPanel = ({ onScoreUpdate }) => {
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);
  const updateTimeoutRef = useRef(null);
  const toast = useToast();
  const { role } = useRole();

  const canEditScore = role === 'team-admin' || role === 'league-admin';

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const handleScoreUpdate = useCallback(async (play) => {
    if (loading || !mounted.current || !canEditScore) return;
    
    try {
      setLoading(true);
      await onScoreUpdate(play);
    } catch (error) {
      console.error('Error recording play:', error);
      toast({
        title: "Error recording play",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      if (mounted.current) {
        updateTimeoutRef.current = setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    }
  }, [loading, onScoreUpdate, canEditScore, toast]);

  if (!canEditScore) {
    return <Text>You don't have permission to edit scores</Text>;
  }

  // Simulated player list - replace with actual player data
  const players = [
    { id: '1', name: 'Player 1' },
    { id: '2', name: 'Player 2' },
    { id: '3', name: 'Player 3' },
  ];

  const handleRecordPlay = (playType) => {
    setLoading(true);
    
    try {
      const eventMap = {
        'single': '1B',
        'double': '2B',
        'triple': '3B',
        'homerun': 'HR',
        'strikeout': 'K',
        'walk': 'BB',
        'hitbypitch': 'HBP',
        'sacrifice': 'SAC',
        'sacrificefly': 'SF',
        'fielderschoice': 'FC',
        'flyout': 'F',
        'groundout': 'G',
        'lineout': 'L',
        'popout': 'P',
        'doubleplay': 'DP',
        'error': 'E'
      };

      const event = eventMap[playType.toLowerCase()];
      
      if (!event) {
        throw new Error(`Unknown play type: ${playType}`);
      }

      // Call the callback with the event data
      onPlayRecorded({
        events: [event],
        outDetails: '',
        custom: notes,
        inning: currentInning,
        playerId: selectedPlayer
      });

      // Clear notes after recording
      setNotes('');
      
      // Show success toast
      toast({
        title: "Play recorded",
        description: `Recorded ${playType} (${event})`,
        status: "success",
        duration: 2000,
      });

    } catch (error) {
      console.error('Error recording play:', error);
      toast({
        title: "Error recording play",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={6} p={4} bg="#2e3726" borderRadius="md" w="100%">
      {/* Inning Selector */}
      <Box w="100%" bg="#545e46" p={4} borderRadius="md">
        <HStack justify="space-between" align="center" w="100%">
          <Text color="#E7F8E8" fontSize="lg" fontWeight="semibold">
            Inning
          </Text>
          <NumberInput
            min={1}
            max={7}
            value={currentInning}
            onChange={(_, value) => setCurrentInning(value)}
            w="100px"
            size="lg"
          >
            <NumberInputField 
              variant="filled"
              textAlign="center"
              fontSize="xl"
              fontWeight="bold"
              h="48px"
              px="8px"
            />
            <NumberInputStepper 
              borderColor="transparent" 
              w="24px"
            >
              <NumberIncrementStepper 
                color="#E7F8E8"
                borderColor="transparent"
                _hover={{ bg: "#3e4736" }}
                h="24px"
                fontSize="lg"
              />
              <NumberDecrementStepper 
                color="#E7F8E8"
                borderColor="transparent"
                _hover={{ bg: "#3e4736" }}
                h="24px"
                fontSize="lg"
              />
            </NumberInputStepper>
          </NumberInput>
        </HStack>
      </Box>

      {/* Player Selector */}
      <Select
        placeholder="Select player"
        value={selectedPlayer}
        onChange={(e) => setSelectedPlayer(e.target.value)}
        bg="#545e46"
        color="#E7F8E8"
        border="none"
        _hover={{ bg: "#3e4736" }}
        _focus={{ bg: "#3e4736", boxShadow: "none" }}
      >
        {players.map(player => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))}
      </Select>

      {/* Play Selection Tabs */}
      <Tabs isFitted variant="enclosed" w="100%">
        <TabList mb="1em">
          <Tab color="#E7F8E8" _selected={{ bg: "#545e46", color: "#E7F8E8" }}>Hits</Tab>
          <Tab color="#E7F8E8" _selected={{ bg: "#545e46", color: "#E7F8E8" }}>Outs</Tab>
          <Tab color="#E7F8E8" _selected={{ bg: "#545e46", color: "#E7F8E8" }}>Other</Tab>
        </TabList>

        <TabPanels>
          {/* Hits Panel */}
          <TabPanel>
            <SimpleGrid columns={2} spacing={2}>
              <Button
                onClick={() => handleRecordPlay('single')}
                isLoading={loading}
                colorScheme="green"
                size="sm"
              >
                Single (1B)
              </Button>
              <Button
                onClick={() => handleRecordPlay('double')}
                isLoading={loading}
                colorScheme="green"
                size="sm"
              >
                Double (2B)
              </Button>
              <Button
                onClick={() => handleRecordPlay('triple')}
                isLoading={loading}
                colorScheme="green"
                size="sm"
              >
                Triple (3B)
              </Button>
              <Button
                onClick={() => handleRecordPlay('homerun')}
                isLoading={loading}
                colorScheme="green"
                size="sm"
              >
                Home Run (HR)
              </Button>
            </SimpleGrid>
          </TabPanel>

          {/* Outs Panel */}
          <TabPanel>
            <SimpleGrid columns={2} spacing={2}>
              <Button
                onClick={() => handleRecordPlay('strikeout')}
                isLoading={loading}
                colorScheme="red"
                size="sm"
              >
                Strikeout (K)
              </Button>
              <Button
                onClick={() => handleRecordPlay('flyout')}
                isLoading={loading}
                colorScheme="red"
                size="sm"
              >
                Fly Out (F)
              </Button>
              <Button
                onClick={() => handleRecordPlay('groundout')}
                isLoading={loading}
                colorScheme="red"
                size="sm"
              >
                Ground Out (G)
              </Button>
              <Button
                onClick={() => handleRecordPlay('lineout')}
                isLoading={loading}
                colorScheme="red"
                size="sm"
              >
                Line Out (L)
              </Button>
              <Button
                onClick={() => handleRecordPlay('popout')}
                isLoading={loading}
                colorScheme="red"
                size="sm"
              >
                Pop Out (P)
              </Button>
              <Button
                onClick={() => handleRecordPlay('doubleplay')}
                isLoading={loading}
                colorScheme="red"
                size="sm"
              >
                Double Play (DP)
              </Button>
            </SimpleGrid>
          </TabPanel>

          {/* Other Panel */}
          <TabPanel>
            <SimpleGrid columns={2} spacing={2}>
              <Button
                onClick={() => handleRecordPlay('walk')}
                isLoading={loading}
                colorScheme="blue"
                size="sm"
              >
                Walk (BB)
              </Button>
              <Button
                onClick={() => handleRecordPlay('hitbypitch')}
                isLoading={loading}
                colorScheme="blue"
                size="sm"
              >
                Hit By Pitch (HBP)
              </Button>
              <Button
                onClick={() => handleRecordPlay('sacrifice')}
                isLoading={loading}
                colorScheme="blue"
                size="sm"
              >
                Sacrifice (SAC)
              </Button>
              <Button
                onClick={() => handleRecordPlay('sacrificefly')}
                isLoading={loading}
                colorScheme="blue"
                size="sm"
              >
                Sacrifice Fly (SF)
              </Button>
              <Button
                onClick={() => handleRecordPlay('fielderschoice')}
                isLoading={loading}
                colorScheme="blue"
                size="sm"
              >
                Fielder&apos;s Choice (FC)
              </Button>
              <Button
                onClick={() => handleRecordPlay('error')}
                isLoading={loading}
                colorScheme="blue"
                size="sm"
              >
                Error (E)
              </Button>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Notes Field */}
      <Textarea
        placeholder="Add notes about the play..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        bg="#545e46"
        color="#EFF7EC"
        border="none"
        _hover={{ bg: "#3e4736" }}
        _focus={{ bg: "#3e4736", boxShadow: "none" }}
      />
    </VStack>
  );
};

ScoringPanel.propTypes = {
  onPlayRecorded: PropTypes.func.isRequired,
};

export default ScoringPanel;

