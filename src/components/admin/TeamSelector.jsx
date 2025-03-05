import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Select,
  FormControl,
  FormLabel,
  Text,
  Button,
  HStack,
  VStack,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
} from '@chakra-ui/react';
import { useSimpleAuth } from '../../context/SimpleAuthContext';
import CreateTeamModal from './CreateTeamModal';
import { supabase } from '../../lib/supabaseClient';

const DeleteConfirmationDialog = ({ isOpen, onClose, teamName, onDelete, isDeleting }) => {
  const cancelRef = React.useRef();
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText === teamName;
  
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent bg="white">
          <AlertDialogHeader
            fontSize="lg"
            fontWeight="bold"
            color="gray.800"
            borderBottomWidth="1px"
          >
            Delete Team
          </AlertDialogHeader>

          <AlertDialogBody color="gray.800" py={4}>
            <VStack spacing={4} align="stretch">
              <Text>
                Are you sure you want to delete <strong>{teamName}</strong>? 
                This action cannot be undone. All team data including roster, 
                schedule, and other information will be permanently deleted.
              </Text>
              <FormControl>
                <FormLabel>Type "{teamName}" to confirm deletion</FormLabel>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={teamName}
                />
              </FormControl>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter borderTopWidth="1px" pt={4}>
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="outline"
              isDisabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={onDelete}
              ml={3}
              isLoading={isDeleting}
              loadingText="Deleting..."
              isDisabled={!isConfirmed || isDeleting}
            >
              Delete Team
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

const TeamSelector = () => {
  const { activeTeam, allTeams, noTeamsAvailable, setCurrentTeam } = useSimpleAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const [schemaData, setSchemaData] = useState(null);
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState('teams');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTeamChange = async (teamId) => {
    try {
      await setCurrentTeam(teamId);
      toast({
        title: "Team switched successfully",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error switching team",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteTeam = async () => {
    try {
      setIsDeleting(true);
      const { error: deleteError } = await supabase
        .from('teams')
        .delete()
        .eq('id', activeTeam.id);  // Changed from selectedTeam to activeTeam.id

      if (deleteError) {
        throw deleteError;
      }

      toast({
        title: "Team deleted successfully",
        status: "success",
        duration: 3000,
      });

      navigate('/');
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error deleting team",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      onDeleteClose();
    }
  };

  // List of tables we want to be able to debug
  const DEBUGGABLE_TABLES = [
    'teams',
    'team_social_media',
    'score_sheets',
    'player_stats',
    'team_stats',
    'team_record',
    'team_media',
    'team_news',
    'games',
    'players',
    'player_awards',
    'player_bios'
  ];

  const debugTableSchema = async () => {
    if (!selectedTable) {
      toast({
        title: "Error",
        description: "Please select a table to debug",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      // First check if we have an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to debug table schema",
          status: "error",
          duration: 3000,
        });
        return;
      }

      console.log('Fetching schema for:', selectedTable);
      
      const { data, error } = await supabase.rpc('debug_table_structure', {
        target_table: selectedTable
      });
      
      if (error) {
        console.error('Supabase RPC error:', {
          message: error.message,
          code: error.code
        });
        toast({
          title: "Error fetching schema",
          description: `${error.message} (Code: ${error.code})`,
          status: "error",
          duration: 3000,
        });
        return;
      }

      setSchemaData({ tableName: selectedTable, columns: data });
      setIsSchemaOpen(true);
    } catch (error) {
      console.error('Schema fetch error:', error.message);
      toast({
        title: "Error",
        description: "Failed to fetch schema",
        status: "error",
        duration: 3000,
      });
    }
  };

  const inspectDatabaseSchema = async () => {
    try {
      const tables = [
        'teams',
        'team_social_media',
        'score_sheets',
        'player_stats',
        'team_stats',
        'team_record',
        'team_media',
        'team_news',
        'games',
        'players',
        'player_awards',
        'player_bios'
      ];
      
      for (const tableName of tables) {
        console.log(`\n=== ${tableName} ===`);
        
        // Get a sample row to see the structure
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.error(`Error querying ${tableName}:`, error);
        } else {
          if (data && data.length > 0) {
            console.log('Table structure:', Object.keys(data[0]));
            console.log('Sample data:', data[0]);
          } else {
            console.log('No data in table');
          }
        }
      }
    } catch (error) {
      console.error('Inspection error:', error);
    }
  };

  const SchemaModal = () => (
    <Modal isOpen={isSchemaOpen} onClose={() => setIsSchemaOpen(false)} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Table Structure: {schemaData?.tableName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Column Name</Th>
                <Th>Data Type</Th>
                <Th>Nullable</Th>
                <Th>Default</Th>
                <Th>Max Length</Th>
              </Tr>
            </Thead>
            <Tbody>
              {schemaData?.columns?.map((col, idx) => (
                <Tr key={idx}>
                  <Td>{col.column_name}</Td>
                  <Td>{col.data_type}</Td>
                  <Td>{col.is_nullable ? 'Yes' : 'No'}</Td>
                  <Td>{col.column_default || '-'}</Td>
                  <Td>{col.character_maximum_length || '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  const DebugSection = () => (
    <Box mt={4}>
      <FormControl>
        <FormLabel>Select Table to Debug</FormLabel>
        <HStack spacing={4}>
          <Select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            bg="white"
          >
            {DEBUGGABLE_TABLES.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </Select>
          <Button
            onClick={debugTableSchema}
            colorScheme="blue"
            size="md"
          >
            View Schema
          </Button>
        </HStack>
      </FormControl>
    </Box>
  );

  if (noTeamsAvailable) {
    return (
      <Box p={6} bg="brand.primary" borderRadius="md">
        <VStack spacing={4} align="stretch">
          <Text>
            Welcome! You don't have any teams yet. As an admin, you can create your first team to get started.
          </Text>
          <Button
            colorScheme="blue"
            size="md"
            width="fit-content"
            onClick={onOpen}
          >
            Create Your First Team
          </Button>
        </VStack>
        <CreateTeamModal isOpen={isOpen} onClose={onClose} />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Select Team</FormLabel>
          <HStack spacing={4}>
            <Select
              value={activeTeam?.id || ''}
              onChange={(e) => handleTeamChange(e.target.value)}
              bg="white"
              color="gray.800"
            >
              {allTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
            <Button
              colorScheme="blue"
              onClick={onOpen}
              size="md"
            >
              Create New Team
            </Button>
            {activeTeam && (
              <Button
                colorScheme="red"
                onClick={onDeleteOpen}
                size="md"
              >
                Delete Team
              </Button>
            )}
            <Button
              colorScheme="gray"
              onClick={debugTableSchema}
              size="md"
            >
              Debug Schema
            </Button>
          </HStack>
        </FormControl>
      </VStack>

      <CreateTeamModal isOpen={isOpen} onClose={onClose} />
      
      <DeleteConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        teamName={activeTeam?.name}
        onDelete={handleDeleteTeam}
        isDeleting={isDeleting}
      />
      <Button
        onClick={inspectDatabaseSchema}
        colorScheme="blue"
        size="sm"
        mt={2}
      >
        Inspect Tables
      </Button>
      <DebugSection />
      <SchemaModal />
    </Box>
  );
};

export default TeamSelector;
