import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Button,
  Input,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Box,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { supabase } from '../../lib/supabaseClient';

const ScheduleEditor = () => {
  const [games, setGames] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    opponent: '',
    location: '',
    gameType: 'regular', // regular, playoff, tournament
    isHome: true,
    status: 'scheduled' // scheduled, completed, cancelled, postponed
  });
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      toast({
        title: "Error fetching games",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from('games')
          .update(formData)
          .eq('id', editingId);
        
        if (error) throw error;
        
        toast({
          title: "Game updated",
          status: "success",
          duration: 3000,
        });
      } else {
        const { error } = await supabase
          .from('games')
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Game added",
          status: "success",
          duration: 3000,
        });
      }

      setFormData({
        date: '',
        time: '',
        opponent: '',
        location: '',
        gameType: 'regular',
        isHome: true,
        status: 'scheduled'
      });
      setEditingId(null);
      fetchGames();
    } catch (error) {
      toast({
        title: "Error saving game",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleEdit = (game) => {
    setFormData({
      date: game.date,
      time: game.time,
      opponent: game.opponent,
      location: game.location,
      gameType: game.gameType,
      isHome: game.isHome,
      status: game.status
    });
    setEditingId(game.id);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Game deleted",
        status: "success",
        duration: 3000,
      });

      fetchGames();
    } catch (error) {
      toast({
        title: "Error deleting game",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box as="form" onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <HStack spacing={4}>
            <FormControl>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Time</FormLabel>
              <Input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </FormControl>
          </HStack>

          <HStack spacing={4}>
            <FormControl>
              <FormLabel>Opponent</FormLabel>
              <Input
                name="opponent"
                value={formData.opponent}
                onChange={handleInputChange}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </FormControl>
          </HStack>

          <HStack spacing={4}>
            <FormControl>
              <FormLabel>Game Type</FormLabel>
              <Select
                name="gameType"
                value={formData.gameType}
                onChange={handleInputChange}
              >
                <option value="regular">Regular Season</option>
                <option value="playoff">Playoff</option>
                <option value="tournament">Tournament</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Home/Away</FormLabel>
              <Select
                name="isHome"
                value={formData.isHome}
                onChange={handleInputChange}
              >
                <option value={true}>Home</option>
                <option value={false}>Away</option>
              </Select>
            </FormControl>
          </HStack>

          <Button type="submit" colorScheme="green" alignSelf="flex-start">
            {editingId ? 'Update Game' : 'Add Game'}
          </Button>
        </VStack>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Time</Th>
            <Th>Opponent</Th>
            <Th>Location</Th>
            <Th>Type</Th>
            <Th>Status</Th>
            <Th>Home/Away</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {games.map((game) => (
            <Tr key={game.id}>
              <Td>{game.date}</Td>
              <Td>{game.time}</Td>
              <Td>{game.opponent}</Td>
              <Td>{game.location}</Td>
              <Td>{game.gameType}</Td>
              <Td>{game.status}</Td>
              <Td>{game.isHome ? 'Home' : 'Away'}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    icon={<EditIcon />}
                    onClick={() => handleEdit(game)}
                    aria-label="Edit game"
                    size="sm"
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => handleDelete(game.id)}
                    aria-label="Delete game"
                    size="sm"
                    colorScheme="red"
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </VStack>
  );
};

export default ScheduleEditor;
