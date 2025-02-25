import React, { useState, useEffect, useRef } from 'react';
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
  NumberInput,
  NumberInputField,
  Select,
  Image,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Checkbox,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Heading,
  Text,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { supabase } from '../../lib/supabaseClient';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useEnhancedRealtimeData } from '../../hooks/useEnhancedRealtimeData';

const RosterEditor = () => {
  const { 
    data: players, 
    loading, 
    updateItem, 
    addItem, 
    deleteItem, 
    pendingUpdates 
  } = useEnhancedRealtimeData('players');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    number: '',
    position: '',
    battingOrder: '',
    status: 'active',
    photoUrl: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const cancelRef = useRef();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('lastName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = (
      player.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.number.toString().includes(searchTerm)
    );
    const matchesStatus = filterStatus === 'all' || player.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === 'asc' 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `player-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      throw error;
    }
  };

  const validateForm = () => {
    if (!formData.number) {
      toast({
        title: "Invalid number",
        description: "Player number is required",
        status: "error",
        duration: 3000,
      });
      return false;
    }
    
    // Check for duplicate numbers
    const duplicateNumber = players.find(
      p => p.number === formData.number && p.id !== editingId
    );
    if (duplicateNumber) {
      toast({
        title: "Duplicate number",
        description: "This player number is already in use",
        status: "error",
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const success = editingId ? 
      await updateItem(editingId, formData, 'player') :
      await addItem(formData, 'player');

    if (success) {
      setFormData({
        firstName: '',
        lastName: '',
        number: '',
        position: '',
        status: 'active'
      });
      setEditingId(null);
    }
  };

  const handleEdit = (player) => {
    setFormData({
      firstName: player.firstName,
      lastName: player.lastName,
      number: player.number,
      position: player.position,
      battingOrder: player.battingOrder,
      status: player.status,
      photoUrl: player.photoUrl
    });
    setEditingId(player.id);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await handleDelete(deleteId);
    } finally {
      setDeleteId(null);
    }
  };

  const handleDelete = async (id) => {
    await deleteItem(id);
  };

  const handleBulkAction = async (action) => {
    try {
      switch (action) {
        case 'delete':
          await supabase
            .from('players')
            .delete()
            .in('id', selectedPlayers);
          break;
        case 'updateStatus':
          await supabase
            .from('players')
            .update({ status: 'inactive' })
            .in('id', selectedPlayers);
          break;
      }
      setSelectedPlayers([]);
      fetchPlayers();
    } catch (error) {
      toast({
        title: "Error performing bulk action",
        description: error.message,
        status: "error",
      });
    }
  };

  const handleExport = () => {
    const csv = players.map(player => 
      Object.values(player).join(',')
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roster.csv';
    a.click();
  };

  const handleImport = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split('\n');
      const newPlayers = rows.map(row => {
        const [firstName, lastName, number, position] = row.split(',');
        return { firstName, lastName, number, position };
      });

      try {
        await supabase.from('players').insert(newPlayers);
        fetchPlayers();
      } catch (error) {
        toast({
          title: "Import failed",
          description: error.message,
          status: "error",
        });
      }
    };
    reader.readAsText(file);
  };

  const RosterStats = () => {
    const stats = {
      totalPlayers: players.length,
      activePlayers: players.filter(p => p.status === 'active').length,
      injuredPlayers: players.filter(p => p.status === 'injured').length,
      positionBreakdown: players.reduce((acc, p) => {
        acc[p.position] = (acc[p.position] || 0) + 1;
        return acc;
      }, {})
    };

    return (
      <SimpleGrid columns={4} spacing={4} mb={6}>
        <Stat>
          <StatLabel>Total Players</StatLabel>
          <StatNumber>{stats.totalPlayers}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Active Players</StatLabel>
          <StatNumber>{stats.activePlayers}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Injured Players</StatLabel>
          <StatNumber>{stats.injuredPlayers}</StatNumber>
        </Stat>
        <Box>
          <Heading size="sm">Position Breakdown</Heading>
          {Object.entries(stats.positionBreakdown).map(([pos, count]) => (
            <Text key={pos}>{pos}: {count}</Text>
          ))}
        </Box>
      </SimpleGrid>
    );
  };

  return (
    <>
      <VStack spacing={6} align="stretch">
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>First Name</FormLabel>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </FormControl>

              <FormControl>
                <FormLabel>Last Name</FormLabel>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Number</FormLabel>
                <NumberInput min={0} max={99}>
                  <NumberInputField
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    required
                  />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Position</FormLabel>
                <Select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Position</option>
                  <option value="P">Pitcher</option>
                  <option value="C">Catcher</option>
                  <option value="1B">First Base</option>
                  <option value="2B">Second Base</option>
                  <option value="3B">Third Base</option>
                  <option value="SS">Shortstop</option>
                  <option value="LF">Left Field</option>
                  <option value="CF">Center Field</option>
                  <option value="RF">Right Field</option>
                  <option value="DH">Designated Hitter</option>
                </Select>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Batting Order</FormLabel>
                <NumberInput min={1} max={9}>
                  <NumberInputField
                    name="battingOrder"
                    value={formData.battingOrder}
                    onChange={handleInputChange}
                  />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="injured">Injured</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Photo</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files[0])}
              />
            </FormControl>

            <Button 
              type="submit" 
              colorScheme="blue"
              isLoading={isSubmitting}
              loadingText="Saving..."
            >
              {editingId ? 'Update Player' : 'Add Player'}
            </Button>
          </VStack>
        </Box>

        {loading ? (
          <Spinner size="xl" />
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>
                  <Checkbox
                    isChecked={selectedPlayers.length === players.length}
                    onChange={(e) => {
                      setSelectedPlayers(
                        e.target.checked 
                          ? players.map(p => p.id)
                          : []
                      );
                    }}
                  />
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort('photoUrl')}
                >
                  Photo
                  {sortField === 'photoUrl' && (
                    <Icon 
                      ml={2}
                      as={sortDirection === 'asc' ? FaArrowUp : FaArrowDown}
                    />
                  )}
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort('firstName')}
                >
                  First Name
                  {sortField === 'firstName' && (
                    <Icon 
                      ml={2}
                      as={sortDirection === 'asc' ? FaArrowUp : FaArrowDown}
                    />
                  )}
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort('lastName')}
                >
                  Last Name
                  {sortField === 'lastName' && (
                    <Icon 
                      ml={2}
                      as={sortDirection === 'asc' ? FaArrowUp : FaArrowDown}
                    />
                  )}
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort('number')}
                >
                  Number
                  {sortField === 'number' && (
                    <Icon 
                      ml={2}
                      as={sortDirection === 'asc' ? FaArrowUp : FaArrowDown}
                    />
                  )}
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort('position')}
                >
                  Position
                  {sortField === 'position' && (
                    <Icon 
                      ml={2}
                      as={sortDirection === 'asc' ? FaArrowUp : FaArrowDown}
                    />
                  )}
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort('battingOrder')}
                >
                  Batting Order
                  {sortField === 'battingOrder' && (
                    <Icon 
                      ml={2}
                      as={sortDirection === 'asc' ? FaArrowUp : FaArrowDown}
                    />
                  )}
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => handleSort('status')}
                >
                  Status
                  {sortField === 'status' && (
                    <Icon 
                      ml={2}
                      as={sortDirection === 'asc' ? FaArrowUp : FaArrowDown}
                    />
                  )}
                </Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedPlayers.map((player) => (
                <Tr key={player.id}>
                  <Td>
                    <Checkbox
                      isChecked={selectedPlayers.includes(player.id)}
                      onChange={(e) => {
                        setSelectedPlayers(prev => 
                          e.target.checked 
                            ? [...prev, player.id]
                            : prev.filter(id => id !== player.id)
                        );
                      }}
                    />
                  </Td>
                  <Td>
                    {player.photoUrl && (
                      <Image
                        src={player.photoUrl}
                        alt={`${player.firstName} ${player.lastName}`}
                        boxSize="50px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    )}
                  </Td>
                  <Td>{player.firstName}</Td>
                  <Td>{player.lastName}</Td>
                  <Td>{player.number}</Td>
                  <Td>{player.position}</Td>
                  <Td>{player.battingOrder}</Td>
                  <Td>{player.status}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        onClick={() => handleEdit(player)}
                        aria-label="Edit player"
                        size="sm"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(player.id)}
                        aria-label="Delete player"
                        size="sm"
                        colorScheme="red"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </VStack>
      {selectedPlayers.length > 0 && (
        <HStack>
          <Button
            onClick={() => handleBulkAction('updateStatus')}
            colorScheme="blue"
          >
            Update Status
          </Button>
          <Button
            onClick={() => handleBulkAction('delete')}
            colorScheme="red"
          >
            Delete Selected
          </Button>
        </HStack>
      )}
      <AlertDialog
        isOpen={!!deleteId}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeleteId(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Player</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <HStack>
        <Button onClick={handleExport}>
          Export CSV
        </Button>
        <Input
          type="file"
          accept=".csv"
          onChange={(e) => handleImport(e.target.files[0])}
        />
      </HStack>
    </>
  );
};

export default RosterEditor;
