import {
    Box,
    Button,
    HStack,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    PropTypes,
    Select,
    SimpleGrid,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    Textarea,
    useToast,
    VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';

const ScoringPanel = ({ onPlayRecorded }) => {
  const [currentInning, setCurrentInning] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  ScoringPanel.propTypes = {
    onPlayRecorded: PropTypes.func.isRequired,
  };

  const toast = useToast();

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
            borderColor="transparent"
            max={7}
            value={currentInning}
            onChange={(_, value) => setCurrentInning(value)}
            w="100px"
            size="lg"
          >
            <NumberInputField 
              bg="#2e3726"
              border="none"
              color="#E7F8E8"
              textAlign="center"
              fontSize="xl"
              fontWeight="bold"
              h="48px"
              pl="8px"
              pr="8px"
              _hover={{ bg: "#3e4736" }}
              _focus={{ bg: "#3e4736", boxShadow: "none" }}
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
              />
              <NumberDecrementStepper 
                color="#E7F8E8"
                borderColor="transparent"
                _hover={{ bg: "#3e4736" }}
                h="24px"
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

export default ScoringPanel;
