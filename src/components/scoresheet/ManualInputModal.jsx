import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import DigitalScoreSheet from './DigitalScoreSheet';

const ManualInputModal = ({ 
  isOpen, 
  onClose, 
  onSave = () => {} 
}) => {
  const [gameData, setGameData] = useState({
    gameInfo: {
      gameNumber: '',
      gameDate: new Date().toISOString().split('T')[0],
      teamName: '',
      opponentName: '',
      location: ''
    },
    notes: '',
    // Initialize innings as a 2D array matching what DigitalScoreSheet expects
    innings: Array(9).fill().map(() => Array(10).fill(null)),
    players: Array(9).fill().map((_, i) => ({
      id: `player-${i+1}`,
      name: '',
      position: i+1,
      sub: { name: '', inning: '' }
    }))
  });
  const [activeTab, setActiveTab] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setGameData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setGameData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDigitalDataChange = (newData) => {
    setGameData(prev => ({
      ...prev,
      players: newData.players || prev.players,
      innings: newData.innings || prev.innings
    }));
  };

  const handleSubmit = () => {
    // Create a new scoresheet object with the entered data
    const newScoreSheet = {
      ...gameData,
      metadata: {
        source: 'manual',
        created_at: new Date().toISOString()
      }
    };
    
    onSave(newScoreSheet);
    
    // Reset form
    setGameData({
      gameInfo: {
        gameNumber: '',
        gameDate: new Date().toISOString().split('T')[0],
        teamName: '',
        opponentName: '',
        location: ''
      },
      notes: '',
      innings: [],
      players: Array(9).fill().map((_, i) => ({
        id: `player-${i+1}`,
        name: `Player ${i+1}`,
        position: i+1
      }))
    });
    
    onClose();
  };

  const nextTab = () => {
    if (activeTab < 1) setActiveTab(activeTab + 1);
  };

  const prevTab = () => {
    if (activeTab > 0) setActiveTab(activeTab - 1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" maxH="90vh">
        <Box bg="var(--app-surface)" borderTopRadius="md">
          <ModalHeader color="var(--app-text)">Manual Entry</ModalHeader>
        </Box>
        <ModalCloseButton color="var(--app-text)" />
        <ModalBody bg="var(--app-surface)" overflowY="auto">
          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
            <TabList>
              <Tab>Game Information</Tab>
              <Tab>Digital Scoresheet</Tab>
            </TabList>
            
            <TabPanels>
              {/* Game Info Tab */}
              <TabPanel>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="var(--app-text)">Game Number</FormLabel>
                    <Input 
                      name="gameInfo.gameNumber"
                      value={gameData.gameInfo.gameNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., 1, 2, etc."
                      bg="var(--app-input-bg)"
                      color="var(--app-text)"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel color="var(--app-text)">Game Date</FormLabel>
                    <Input 
                      type="date"
                      name="gameInfo.gameDate"
                      value={gameData.gameInfo.gameDate}
                      onChange={handleInputChange}
                      bg="var(--app-input-bg)"
                      color="var(--app-text)"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel color="var(--app-text)">Team Name</FormLabel>
                    <Input 
                      name="gameInfo.teamName"
                      value={gameData.gameInfo.teamName}
                      onChange={handleInputChange}
                      placeholder="Your team name"
                      bg="var(--app-input-bg)"
                      color="var(--app-text)"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel color="var(--app-text)">Opponent Name</FormLabel>
                    <Input 
                      name="gameInfo.opponentName"
                      value={gameData.gameInfo.opponentName}
                      onChange={handleInputChange}
                      placeholder="Opponent team name"
                      bg="var(--app-input-bg)"
                      color="var(--app-text)"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel color="var(--app-text)">Location</FormLabel>
                    <Input 
                      name="gameInfo.location"
                      value={gameData.gameInfo.location}
                      onChange={handleInputChange}
                      placeholder="Game location"
                      bg="var(--app-input-bg)"
                      color="var(--app-text)"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel color="var(--app-text)">Notes</FormLabel>
                    <Textarea 
                      name="notes"
                      value={gameData.notes}
                      onChange={handleInputChange}
                      placeholder="Add any game notes here..."
                      bg="var(--app-input-bg)"
                      color="var(--app-text)"
                    />
                  </FormControl>
                </VStack>
              </TabPanel>
              
              {/* Digital Scoresheet Tab */}
              <TabPanel>
                <Box 
                  width="100%" 
                  overflowX="auto"
                  bg="white !important"
                  p={4}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="#333333"
                >
                  <div style={{ minWidth: "1200px" }}>
                    <DigitalScoreSheet 
                      data={{
                        players: gameData.players,
                        innings: gameData.innings
                      }} 
                      onDataChange={handleDigitalDataChange}
                      canEdit={true}
                    />
                  </div>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter bg="var(--app-surface)" borderBottomRadius="md">
          {activeTab === 0 ? (
            <>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={nextTab}
                isDisabled={!gameData.gameInfo.gameNumber || !gameData.gameInfo.teamName || !gameData.gameInfo.opponentName}
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" mr={3} onClick={prevTab}>
                Back
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleSubmit}
              >
                Save Scoresheet
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

ManualInputModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func
};

export default ManualInputModal;








