import { CloseIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Select,
  Table,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  useToast
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useTeam } from '../../hooks/useTeam';
import { teamInfoService } from '../../services/teamInfoService';
import { formFieldStyles } from '../../styles/formFieldStyles';

const POSITIONS = [
  'Pitcher',
  'Catcher',
  'First Base',
  'Second Base',
  'Third Base',
  'Shortstop',
  'Left Field',
  'Center Field',
  'Right Field',
  'Designated Hitter'
];

const RosterEditor = ({ isDisabled }) => {
  const [players, setPlayers] = useState([]);
  const toast = useToast();
  const { team } = useTeam();
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    number: '',
    positions: []  // Changed to array for multiple positions
  });
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (team?.id) {
      fetchRoster();
    }
  }, [team?.id]);

  const fetchRoster = async () => {
    try {
      const data = await teamInfoService.getTeamRoster(team.id);
      setPlayers(data);
    } catch (error) {
      toast({
        title: 'Error fetching roster',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handlePositionAdd = (position) => {
    if (!newPlayer.positions.includes(position)) {
      setNewPlayer(prev => ({
        ...prev,
        positions: [...prev.positions, position]
      }));
    }
  };

  const handlePositionRemove = (positionToRemove) => {
    setNewPlayer(prev => ({
      ...prev,
      positions: prev.positions.filter(pos => pos !== positionToRemove)
    }));
  };

  const handleNewPlayerChange = (e) => {
    const { name, value } = e.target;
    setNewPlayer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();

    if (!team?.id) {
      toast({
        title: 'Error',
        description: 'No team selected',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!newPlayer.name || newPlayer.positions.length === 0) {
      toast({
        title: 'Error',
        description: 'Name and at least one position are required',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await teamInfoService.addPlayerToRoster(team.id, {
        name: newPlayer.name.trim(),
        number: newPlayer.number ? newPlayer.number.trim() : null,
        positions: newPlayer.positions  // Send array of positions
      });
      
      await fetchRoster();
      setNewPlayer({ name: '', number: '', positions: [] });
      toast({
        title: 'Success',
        description: 'Player added successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add player',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;

    try {
      await teamInfoService.deleteRosterPlayer(team.id, playerId);
      await fetchRoster();
      toast({
        title: 'Player deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting player',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleEditClick = (player) => {
    setEditingPlayer({
      id: player.id,
      name: player.name,
      number: player.number || '',
      positions: player.positions || []
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await teamInfoService.updateRosterPlayer(team.id, editingPlayer.id, {
        name: editingPlayer.name,
        number: editingPlayer.number,
        positions: editingPlayer.positions
      });
      
      await fetchRoster();
      setIsEditModalOpen(false);
      setEditingPlayer(null);
      
      toast({
        title: 'Player updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error updating player',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingPlayer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditPositionAdd = (position) => {
    if (!editingPlayer.positions.includes(position)) {
      setEditingPlayer(prev => ({
        ...prev,
        positions: [...prev.positions, position]
      }));
    }
  };

  const handleEditPositionRemove = (positionToRemove) => {
    setEditingPlayer(prev => ({
      ...prev,
      positions: prev.positions.filter(pos => pos !== positionToRemove)
    }));
  };

  return (
    <VStack spacing={4} align="stretch" opacity={isDisabled ? 0.6 : 1}>
      <VStack as="form" onSubmit={handleAddPlayer} spacing={4} align="stretch">
        <FormControl isDisabled={isDisabled}>
          <FormLabel color="brand.text.primary">Player Name</FormLabel>
          <Input
            {...formFieldStyles}
            type="text"
            value={newPlayer.name}
            onChange={handleNewPlayerChange}
          />
        </FormControl>

        <FormControl isDisabled={isDisabled}>
          <FormLabel color="brand.text.primary">Positions</FormLabel>
          <VStack align="stretch" spacing={2}>
            <Select
              {...formFieldStyles}
              placeholder="Select position"
              onChange={(e) => handlePositionAdd(e.target.value)}
              value=""
            >
              {POSITIONS.map(pos => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </Select>
            <HStack spacing={2} wrap="wrap">
              {newPlayer.positions.map(position => (
                <Tag
                  key={position}
                  size="md"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="green"
                >
                  {position}
                  <IconButton
                    size="xs"
                    ml={1}
                    icon={<CloseIcon />}
                    onClick={() => handlePositionRemove(position)}
                    variant="ghost"
                    colorScheme="green"
                    aria-label={`Remove ${position}`}
                  />
                </Tag>
              ))}
            </HStack>
          </VStack>
        </FormControl>

        <FormControl isDisabled={isDisabled}>
          <FormLabel color="brand.text.primary">Jersey Number</FormLabel>
          <NumberInput min={0} max={99} isDisabled={isDisabled}>
            <NumberInputField
              {...formFieldStyles}
              name="number"
              value={newPlayer.number}
              onChange={(e) => handleNewPlayerChange({
                target: { name: 'number', value: e.target.value }
              })}
            />
          </NumberInput>
        </FormControl>

        <Button
          type="submit"
          // Remove the hardcoded gradient
          // bgGradient="linear(to-r, #111613, #1b2c14, #111613)"
          // color="brand.text.primary"
          // _hover={{ opacity: 0.9 }}
          isDisabled={isDisabled}
        >
          Add Player
        </Button>
      </VStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th color="brand.text.primary">#</Th>
            <Th color="brand.text.primary">Name</Th>
            <Th color="brand.text.primary">Positions</Th>
            <Th color="brand.text.primary">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {players.map((player) => (
            <Tr key={player.id}>
              <Td color="brand.text.primary">{player.number}</Td>
              <Td color="brand.text.primary">{player.name}</Td>
              <Td color="brand.text.primary">
                <HStack spacing={1}>
                  {(player.positions || []).map(pos => (
                    <Tag key={pos} size="sm" colorScheme="green">
                      {pos}
                    </Tag>
                  ))}
                </HStack>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    icon={<EditIcon />}
                    colorScheme="blue"
                    size="sm"
                    aria-label="Edit player"
                    onClick={() => handleEditClick(player)}
                    isDisabled={isDisabled}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    variant="danger"
                    size="sm"
                    aria-label="Delete player"
                    onClick={() => handleDeletePlayer(player.id)}
                    isDisabled={isDisabled}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleEditSubmit}>
            <ModalHeader>Edit Player</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="brand.text.primary">Player Name</FormLabel>
                  <Input
                    {...formFieldStyles}
                    type="text"
                    value={editingPlayer?.name || ''}
                    onChange={handleEditChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="brand.text.primary">Jersey Number</FormLabel>
                  <NumberInput min={0} max={99}>
                    <NumberInputField
                      {...formFieldStyles}
                      name="number"
                      value={editingPlayer?.number || ''}
                      onChange={(e) => handleEditChange({
                        target: { name: 'number', value: e.target.value }
                      })}
                    />
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="brand.text.primary">Positions</FormLabel>
                  <HStack spacing={2} wrap="wrap">
                    {editingPlayer?.positions.map(pos => (
                      <Tag 
                        key={pos} 
                        size="md" 
                        colorScheme="green"
                        cursor="pointer"
                        onClick={() => handleEditPositionRemove(pos)}
                      >
                        {pos} ✕
                      </Tag>
                    ))}
                  </HStack>
                  <Menu>
                    <MenuButton as={Button} mt={2}>
                      Add Position
                    </MenuButton>
                    <MenuList>
                      {POSITIONS.map(pos => (
                        <MenuItem
                          key={pos}
                          onClick={() => handleEditPositionAdd(pos)}
                        >
                          {pos}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit"
                // Remove the hardcoded gradient
                // bgGradient="linear(to-r, #111613, #1b2c14, #111613)"
                // color="brand.text.primary"
                // _hover={{ opacity: 0.9 }}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default RosterEditor;




















