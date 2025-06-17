// React and PropTypes
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

// Chakra UI components
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  VStack
} from '@chakra-ui/react';

// Project components
import { supabase } from '../../lib/supabaseClient';
import { teamInfoService } from '../../services/teamInfoService';
import { switchStyles } from '../../styles/formFieldStyles';
import ActionButtons from '../common/ActionButtons';
import StyledModal from '../common/StyledModal';

const ScheduleEditor = ({ teamId, isDisabled, buttonProps }) => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [leagues, setLeagues] = useState([]);
  const toast = useToast();
  const [newGame, setNewGame] = useState({
    id: null,
    date: '',
    time: '',
    opponent: '',
    location: '',
    gameType: 'regular',
    status: 'scheduled',
    isHome: false,
    leagueId: ''
  });

  useEffect(() => {
    if (teamId) {
      fetchGames();
      fetchLeagues();
    }
  }, [teamId]);

  const fetchLeagues = async () => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('id, name');
      
      if (error) throw error;
      setLeagues(data || []);
    } catch (error) {
      toast({
        title: 'Error fetching leagues',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

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

  const handleEditGame = (game) => {
    setNewGame({
      id: game.id,
      date: game.date,
      time: game.time,
      opponent: game.opponent,
      location: game.location,
      gameType: game.game_type || 'regular',
      status: game.status || 'scheduled',
      isHome: game.is_home,
      leagueId: game.league_id || ''
    });
    setIsEditing(true);
    setIsAddGameOpen(true);
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    
    setIsLoading(true);
    try {
      await teamInfoService.deleteGame(teamId, gameId);
      toast({
        title: 'Game deleted successfully',
        status: 'success',
        duration: 3000,
      });
      await fetchGames();
    } catch (error) {
      toast({
        title: 'Error deleting game',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGame = async () => {
    setIsLoading(true);
    try {
      if (isEditing) {
        // Handle editing existing game
        await teamInfoService.updateGame(teamId, newGame);
        toast({
          title: 'Game updated successfully',
          status: 'success',
          duration: 3000,
        });
      } else {
        // Handle adding new game
        await teamInfoService.addGameToSchedule(teamId, newGame);
        toast({
          title: 'Game added successfully',
          status: 'success',
          duration: 3000,
        });
      }
      
      await fetchGames();
      setIsAddGameOpen(false);
      setNewGame({
        id: null,
        date: '',
        time: '',
        opponent: '',
        location: '',
        gameType: 'regular',
        status: 'scheduled',
        isHome: false
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: isEditing ? 'Error updating game' : 'Error adding game',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a table to display games with edit/delete actions
  return (
    <Flex direction="column" align="center" width="100%">
      <ButtonGroup spacing={4} mb={4} justifyContent="center">
        <Button
          {...buttonProps.primary}
          onClick={() => {
            setIsEditing(false);
            setNewGame({
              id: null,
              date: '',
              time: '',
              opponent: '',
              location: '',
              gameType: 'regular',
              status: 'scheduled',
              isHome: false
            });
            setIsAddGameOpen(true);
          }}
          isDisabled={isDisabled}
        >
          Add Game
        </Button>
        <Button
          {...buttonProps.primary}
          onClick={() => setIsBulkImportOpen(true)}
          isDisabled={isDisabled}
        >
          Import Schedule
        </Button>
      </ButtonGroup>

      {/* Games Table */}
      {games.length > 0 && (
        <Box overflowX="auto" mb={4} width="100%" maxWidth="900px">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Time</Th>
                <Th>Opponent</Th>
                <Th>Location</Th>
                <Th>Home/Away</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {games.map((game) => (
                <Tr key={game.id}>
                  <Td>{game.date}</Td>
                  <Td>{game.time ? game.time.substring(0, 5) : game.time}</Td>
                  <Td>{game.opponent}</Td>
                  <Td>{game.location}</Td>
                  <Td>{game.is_home ? 'Home' : 'Away'}</Td>
                  <Td>{game.status}</Td>
                  <Td>
                    <ActionButtons 
                      onEdit={() => handleEditGame(game)} 
                      onDelete={() => handleDeleteGame(game.id)}
                      editLabel="Edit game"
                      deleteLabel="Delete game"
                      isDisabled={isDisabled}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Add/Edit Game Modal */}
      <StyledModal 
        isOpen={isAddGameOpen}
        onClose={() => {
          setIsAddGameOpen(false);
          setIsEditing(false);
        }}
        title={isEditing ? 'Edit Game' : 'Add Game'}
        footer={
          <>
            <Button
              className="app-gradient"
              color="brand.text.primary"
              _hover={{ opacity: 0.9 }}
              mr="auto"
              onClick={handleSaveGame}
              isLoading={isLoading}
            >
              {isEditing ? 'Update' : 'Add'}
            </Button>
            <Button
              variant="cancel"
              onClick={() => {
                setIsAddGameOpen(false);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </>
        }
      >
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel color="brand.text.primary">Date</FormLabel>
            <Input
              {...customFormFieldStyles}
              type="date"
              name="date"
              value={newGame.date}
              onChange={handleNewGameChange}
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel color="brand.text.primary">Time</FormLabel>
            <Input
              {...customFormFieldStyles}
              type="time"
              name="time"
              value={newGame.time}
              onChange={handleNewGameChange}
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel color="brand.text.primary">Opponent</FormLabel>
            <Input
              {...customFormFieldStyles}
              type="text"
              name="opponent"
              value={newGame.opponent}
              onChange={handleNewGameChange}
              placeholder="Enter opponent name"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel color="brand.text.primary">Location</FormLabel>
            <Input
              {...customFormFieldStyles}
              type="text"
              name="location"
              value={newGame.location}
              onChange={handleNewGameChange}
              placeholder="Enter game location"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel color="brand.text.primary">Game Type</FormLabel>
            <Select
              {...customFormFieldStyles}
              name="gameType"
              value={newGame.gameType}
              onChange={handleNewGameChange}
            >
              <option value="regular">Regular Season</option>
              <option value="playoff">Playoffs</option>
              <option value="tournament">Tournament</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel color="brand.text.primary">Status</FormLabel>
            <Select
              {...customFormFieldStyles}
              name="status"
              value={newGame.status}
              onChange={handleNewGameChange}
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="postponed">Postponed</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel color="brand.text.primary">Game Location</FormLabel>
            <Flex align="center">
              <Text mr={2} fontSize="sm" color={newGame.isHome ? "gray.400" : "brand.text.primary"}>Away</Text>
              <Switch
                {...switchStyles}
                name="isHome"
                isChecked={newGame.isHome}
                onChange={(e) => setNewGame(prev => ({
                  ...prev,
                  isHome: e.target.checked
                }))}
              />
              <Text ml={2} fontSize="sm" color={newGame.isHome ? "brand.text.primary" : "gray.400"}>Home</Text>
            </Flex>
          </FormControl>
          <FormControl>
            <FormLabel color="brand.text.primary">League</FormLabel>
            <Select
              {...customFormFieldStyles}
              name="leagueId"
              value={newGame.leagueId || ''}
              onChange={handleNewGameChange}
              placeholder="Select league (optional)"
            >
              {leagues.map(league => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </Select>
          </FormControl>
        </VStack>
      </StyledModal>
    </Flex>
  );
};

ScheduleEditor.propTypes = {
  teamId: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool,
  buttonProps: PropTypes.shape({
    primary: PropTypes.object,
    secondary: PropTypes.object
  })
};

// Add the customFormFieldStyles
const customFormFieldStyles = {
  bg: "brand.surface.input",
  color: "black",
  borderColor: "brand.border",
  _hover: { borderColor: 'brand.primary.hover' },
  _focus: { 
    borderColor: 'brand.primary.hover',
    boxShadow: 'none'
  },
  _placeholder: {
    color: 'black'  // Change placeholder color to black
  },
  sx: {
    '& option': {
      bg: 'brand.surface.base',
      color: 'black'
    },
    '&::placeholder': {
      color: 'black !important'  // Additional CSS for placeholder
    }
  }
};

export default ScheduleEditor;




