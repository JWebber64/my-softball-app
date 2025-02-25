import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Button,
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
  Textarea,
  Image,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { supabase } from '../../lib/supabaseClient';

const PlayerOfWeekEditor = () => {
  const [awards, setAwards] = useState([]);
  const [players, setPlayers] = useState([]);
  const [formData, setFormData] = useState({
    playerId: '',
    weekOf: '',
    achievement: '',
    stats: '',
    featured: false
  });
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchAwards();
    fetchPlayers();
  }, []);

  const fetchAwards = async () => {
    try {
      const { data, error } = await supabase
        .from('player_awards')
        .select(`
          *,
          players (
            id,
            firstName,
            lastName,
            number,
            photoUrl
          )
        `)
        .order('weekOf', { ascending: false });

      if (error) throw error;
      setAwards(data || []);
    } catch (error) {
      toast({
        title: "Error fetching awards",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, firstName, lastName, number')
        .order('lastName');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      toast({
        title: "Error fetching players",
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
          .from('player_awards')
          .update(formData)
          .eq('id', editingId);
        
        if (error) throw error;
        
        toast({
          title: "Award updated",
          status: "success",
          duration: 3000,
        });
      } else {
        const { error } = await supabase
          .from('player_awards')
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Award added",
          status: "success",
          duration: 3000,
        });
      }

      setFormData({
        playerId: '',
        weekOf: '',
        achievement: '',
        stats: '',
        featured: false
      });
      setEditingId(null);
      fetchAwards();
    } catch (error) {
      toast({
        title: "Error saving award",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleEdit = (award) => {
    setFormData({
      playerId: award.playerId,
      weekOf: award.weekOf,
      achievement: award.achievement,
      stats: award.stats,
      featured: award.featured
    });
    setEditingId(award.id);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('player_awards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Award deleted",
        status: "success",
        duration: 3000,
      });

      fetchAwards();
    } catch (error) {
      toast({
        title: "Error deleting award",
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
              <FormLabel>Player</FormLabel>
              <Select
                name="playerId"
                value={formData.playerId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Player</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>
                    {`${player.lastName}, ${player.firstName} (#${player.number})`}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Week Of</FormLabel>
              <Input
                type="date"
                name="weekOf"
                value={formData.weekOf}
                onChange={handleInputChange}
                required
              />
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel>Achievement</FormLabel>
            <Textarea
              name="achievement"
              value={formData.achievement}
              onChange={handleInputChange}
              required
            />
          </FormControl>

          <FormControl>
            <FormLabel>Stats</FormLabel>
            <Textarea
              name="stats"
              value={formData.stats}
              onChange={handleInputChange}
              required
            />
          </FormControl>

          <FormControl>
            <FormLabel>Featured</FormLabel>
            <Select
              name="featured"
              value={formData.featured}
              onChange={handleInputChange}
            >
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </Select>
          </FormControl>

          <Button type="submit" colorScheme="green" alignSelf="flex-start">
            {editingId ? 'Update Award' : 'Add Award'}
          </Button>
        </VStack>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Player</Th>
            <Th>Week Of</Th>
            <Th>Achievement</Th>
            <Th>Stats</Th>
            <Th>Featured</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {awards.map((award) => (
            <Tr key={award.id}>
              <Td>
                <HStack>
                  {award.players.photoUrl && (
                    <Image
                      src={award.players.photoUrl}
                      alt={`${award.players.firstName} ${award.players.lastName}`}
                      boxSize="40px"
                      objectFit="cover"
                      borderRadius="full"
                    />
                  )}
                  <Box>
                    {`${award.players.firstName} ${award.players.lastName}`}
                    <Text fontSize="sm" color="gray.500">
                      #{award.players.number}
                    </Text>
                  </Box>
                </HStack>
              </Td>
              <Td>{award.weekOf}</Td>
              <Td>{award.achievement}</Td>
              <Td>{award.stats}</Td>
              <Td>{award.featured ? 'Yes' : 'No'}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    icon={<EditIcon />}
                    onClick={() => handleEdit(award)}
                    aria-label="Edit award"
                    size="sm"
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => handleDelete(award.id)}
                    aria-label="Delete award"
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

export default PlayerOfWeekEditor;