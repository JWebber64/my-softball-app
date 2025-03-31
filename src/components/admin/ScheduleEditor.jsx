// React and PropTypes
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

// Chakra UI components
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast
} from '@chakra-ui/react';

// Project components
import { teamInfoService } from '../../services/teamInfoService';
import { formFieldStyles } from '../../styles/formFieldStyles';

const tableStyles = {
  bg: 'brand.surface.base',
  color: 'brand.text.primary',
  borderColor: 'brand.border'
};

const headerCellStyles = {
  bg: 'brand.primary.base',
  color: 'brand.text.primary',
  fontWeight: 'semibold'
};

const cellStyles = {
  borderColor: 'brand.border',
  _hover: {
    bg: 'brand.primary.hover'
  }
};

const ScheduleEditor = ({ teamId, isDisabled = false }) => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [newGame, setNewGame] = useState({
    date: '',
    time: '',
    opponent: '',
    location: '',
    gameType: 'regular',
    status: 'scheduled'
  });

  useEffect(() => {
    if (teamId) {
      fetchGames();
    }
  }, [teamId]);

  const fetchGames = async () => {
    try {
      const gamesData = await teamInfoService.getSchedule(teamId);
      setGames(gamesData);
    } catch (error) {
      toast({
        title: 'Error fetching games',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleNewGameChange = (e) => {
    const { name, value } = e.target;
    setNewGame(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    
    if (!teamId) {
      toast({
        title: 'Error',
        description: 'Team ID is missing',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    if (!newGame.date || !newGame.time) {
      toast({
        title: 'Required fields missing',
        description: 'Date and time are required',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    setIsLoading(true);

    try {
      console.log('Adding game with teamId:', teamId); // Debug log
      await teamInfoService.addGameToSchedule(teamId, {
        ...newGame,
        isHome: false, // Add default value
      });

      setNewGame({
        date: '',
        time: '',
        opponent: '',
        location: '',
        gameType: 'regular',
        status: 'scheduled'
      });

      await fetchGames();

      toast({
        title: 'Game added successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error adding game',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <form onSubmit={handleAddGame}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel color="brand.text.primary">Date and Time</FormLabel>
              <Input
                {...formFieldStyles}
                type="datetime-local"
                name="date"
                value={newGame.date}
                onChange={handleNewGameChange}
                isDisabled={isDisabled}
                bg="brand.surface.input"
                color="brand.text.primary"
                borderColor="brand.border"
                _hover={{ borderColor: 'brand.primary.hover' }}
                _focus={{ borderColor: 'brand.states.focus' }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="brand.text.primary">Opponent</FormLabel>
              <Input
                name="opponent"
                value={newGame.opponent}
                onChange={handleNewGameChange}
                isDisabled={isDisabled}
                bg="brand.surface.input"
                color="brand.text.primary"
                borderColor="brand.border"
                _hover={{ borderColor: 'brand.primary.hover' }}
                _focus={{ borderColor: 'brand.states.focus' }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="brand.text.primary">Location</FormLabel>
              <Input
                {...formFieldStyles}
                name="location"
                value={newGame.location}
                onChange={handleNewGameChange}
                isDisabled={isDisabled}
                bg="brand.surface.input"
                color="brand.text.primary"
                borderColor="brand.border"
                _hover={{ borderColor: 'brand.primary.hover' }}
                _focus={{ borderColor: 'brand.states.focus' }}
              />
            </FormControl>

            <Button
              type="submit"
              bg="brand.primary.base"
              color="brand.text.primary"
              _hover={{ bg: 'brand.primary.hover' }}
              _active={{ bg: 'brand.primary.active' }}
              isLoading={isLoading}
              isDisabled={isDisabled}
              w="100%"
            >
              Add Game
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

ScheduleEditor.propTypes = {
  teamId: PropTypes.string,
  isDisabled: PropTypes.bool
};

export default ScheduleEditor;










































