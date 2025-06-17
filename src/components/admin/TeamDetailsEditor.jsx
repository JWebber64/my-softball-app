import {
  Button,
  Flex,
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
  Switch,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTeam } from '../../hooks/useTeam';
import { supabase } from '../../lib/supabaseClient';
import { formLabelStyles } from '../../styles/formFieldStyles';
import LocationEditor from './LocationEditor';

const switchStyles = {
  colorScheme: 'brand',
  size: 'md'
};

// Add custom form field styles with black text
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

// Custom switch styles for team visibility
const teamVisibilityStyles = {
  colorScheme: 'brand',
  size: 'md',
  sx: {
    '& .chakra-switch__track': {
      bg: 'red.500', // Red for private (when unchecked)
    },
    '&[data-checked] .chakra-switch__track': {
      bg: 'green.400', // Light green for public (when checked)
    }
  }
};

const TeamDetailsEditor = ({ isDisabled, isOpen, onClose }) => {
  const { team, setTeam } = useTeam();
  const { user } = useAuth();
  const toast = useToast();
  const [availableTeams, setAvailableTeams] = useState([]);
  const [newTeam, setNewTeam] = useState({
    name: '',
    password: '',
    latitude: null,
    longitude: null,
    location_name: '',
    is_public: true
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleLocationSuccess = (location) => {
    console.log('Location success:', location);
    // For existing team
    if (team) {
      setTeam({
        ...team,
        latitude: location.lat,
        longitude: location.lng,
        location_name: location.name || 'Team Location'
      });
    } 
    // For new team
    else {
      setNewTeam({
        ...newTeam,
        latitude: location.lat,
        longitude: location.lng,
        location_name: location.name || 'Team Location'
      });
    }
    
    toast({
      title: 'Location updated',
      description: 'Team location has been updated successfully',
      status: 'success',
      duration: 3000,
    });
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        console.log('TeamDetailsEditor: Fetching teams for user:', user?.id);
        
        const { data: teamData, error } = await supabase
          .rpc('get_user_teams', {
            p_user_id: user.id
          });

        if (error) {
          console.error('TeamDetailsEditor: Error fetching teams:', error);
          throw error;
        }
        
        console.log('TeamDetailsEditor: Teams data:', teamData);
        const filteredTeams = teamData?.filter(team => team?.id) || [];
        setAvailableTeams(filteredTeams);
      } catch (error) {
        console.error('TeamDetailsEditor: Error in fetchTeams:', error);
        toast({
          title: 'Error fetching teams',
          description: error.message,
          status: 'error',
          duration: 5000,
        });
      }
    };

    if (user) {
      fetchTeams();
    }
  }, [user]);

  const handleLocationSelect = (location) => {
    console.log('Location selected:', location);
    setTeam({
      ...team,
      latitude: location.lat,
      longitude: location.lng,
      location_name: location.name || 'Team Location'
    });
  };

  const handleLocationError = (error) => {
    toast({
      title: 'Location Error',
      description: error.message,
      status: 'error',
      duration: 5000,
    });
  };

  const handleCreateTeam = async () => {
    try {
      const { data, error } = await supabase.rpc('create_team', {
        p_name: newTeam.name,
        p_location_name: newTeam.location_name,
        p_latitude: newTeam.latitude,
        p_longitude: newTeam.longitude
      });

      if (error) throw error;

      // Update team password and visibility
      const { error: updateError } = await supabase
        .from('teams')
        .update({
          team_password: newTeam.password,
          is_public: newTeam.is_public
        })
        .eq('id', data);

      if (updateError) throw updateError;

      setTeam(data);
      setIsCreateModalOpen(false);
      toast({
        title: 'Team created successfully',
        status: 'success',
        duration: 3000,
        variant: 'solid',
        bg: 'var(--app-success)',
        color: 'var(--app-text)'
      });
    } catch (error) {
      toast({
        title: 'Error creating team',
        description: error.message,
        status: 'error',
        duration: 5000,
        variant: 'solid',
        bg: 'var(--app-error)',
        color: 'var(--app-text)'
      });
    }
  };

  const handleDeleteTeam = async () => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', team.id);

      if (error) throw error;

      setTeam(null);
      toast({
        title: 'Team deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting team',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleLogoUpload = async (event) => {
    try {
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${team.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('team-logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('team-logos')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('teams')
        .update({ logo_url: publicUrl })
        .eq('id', team.id);

      if (updateError) throw updateError;

      setTeam({ ...team, logo_url: publicUrl });
      toast({
        title: 'Logo uploaded successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error uploading logo',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleEditTeam = async () => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: team.name,
          location_name: team.location_name,
          latitude: team.latitude,
          longitude: team.longitude,
          team_password: team.team_password,
          is_public: team.is_public
        })
        .eq('id', team.id);

      if (error) throw error;

      onClose(); // Close the modal after successful update
      toast({
        title: 'Team updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error updating team',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="brand.overlay" />
        <ModalContent bg="brand.surface.base" color="brand.text.primary">
          <ModalHeader borderBottomWidth="1px" borderColor="brand.border">
            Edit Team Details
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel {...formLabelStyles}>Team Name</FormLabel>
                <Input
                  {...customFormFieldStyles}
                  value={team?.name || ''}
                  onChange={(e) => setTeam({ ...team, name: e.target.value })}
                />
              </FormControl>
              
              <LocationEditor 
                teamId={team?.id}
                currentLocation={{
                  lat: team?.latitude,
                  lng: team?.longitude,
                  name: team?.location_name
                }}
                onLocationSelect={handleLocationSelect}
                onSuccess={handleLocationSuccess}
                onError={handleLocationError}
                useFormFieldStyles={true}
                buttonProps={{ 
                  colorScheme: 'blue', 
                  className: 'app-gradient',
                  color: "brand.text.primary",
                  _hover: { opacity: 0.9 }
                }}
              />
              
              <FormControl>
                <FormLabel {...formLabelStyles}>Team Password</FormLabel>
                <Input
                  {...customFormFieldStyles}
                  type="password"
                  value={team?.team_password || ''}
                  onChange={(e) => setTeam({ ...team, team_password: e.target.value })}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel {...formLabelStyles} mb="0">Team Visibility</FormLabel>
                <Flex align="center">
                  <Text mr={2} fontSize="sm" color={!team?.is_public ? "red.500" : "gray.400"}>Private</Text>
                  <Switch
                    {...teamVisibilityStyles}
                    isChecked={team?.is_public}
                    onChange={(e) => {
                      const isPublic = e.target.checked;
                      setTeam({ ...team, is_public: isPublic });
                    }}
                  />
                  <Text ml={2} fontSize="sm" color={team?.is_public ? "green.400" : "gray.400"}>Public</Text>
                </Flex>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="brand.border">
            <Button 
              className="app-gradient"
              color="brand.text.primary"
              _hover={{ opacity: 0.9 }}
              mr="auto"  // This pushes the button to the left
              onClick={handleEditTeam}
            >
              Save
            </Button>
            <Button 
              variant="outline" 
              bg="black"
              color="white"
              borderColor="brand.border"
              _hover={{ 
                bg: "gray.800",
                opacity: 0.9 
              }}
              onClick={onClose}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Team Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalOverlay bg="brand.overlay" />
        <ModalContent bg="brand.surface.base" color="brand.text.primary">
          <ModalHeader borderBottomWidth="1px" borderColor="brand.border">
            Create New Team
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel {...formLabelStyles}>Team Name</FormLabel>
                <Input
                  {...customFormFieldStyles}
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </FormControl>

              <LocationEditor 
                onLocationSelect={(location) => {
                  setNewTeam({
                    ...newTeam,
                    latitude: location.lat,
                    longitude: location.lng,
                    location_name: location.name || 'Team Location'
                  });
                }}
                onSuccess={handleLocationSuccess}
                onError={handleLocationError}
                useFormFieldStyles={true}
                buttonProps={{ 
                  colorScheme: 'blue', 
                  className: 'app-gradient',
                  color: "brand.text.primary",
                  _hover: { opacity: 0.9 }
                }}
              />

              <FormControl>
                <FormLabel {...formLabelStyles}>Team Password</FormLabel>
                <Input
                  {...customFormFieldStyles}
                  type="password"
                  value={newTeam.password}
                  onChange={(e) => setNewTeam({ ...newTeam, password: e.target.value })}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel {...formLabelStyles} mb="0">Team Visibility</FormLabel>
                <Flex align="center">
                  <Text mr={2} fontSize="sm" color={!newTeam.is_public ? "red.500" : "gray.400"}>Private</Text>
                  <Switch
                    {...teamVisibilityStyles}
                    isChecked={newTeam.is_public}
                    onChange={(e) => setNewTeam({ ...newTeam, is_public: e.target.checked })}
                  />
                  <Text ml={2} fontSize="sm" color={newTeam.is_public ? "green.400" : "gray.400"}>Public</Text>
                </Flex>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="brand.border">
            <Button 
              className="app-gradient"
              color="brand.text.primary"
              _hover={{ opacity: 0.9 }}
              mr="auto"  // This pushes the button to the left
              onClick={handleCreateTeam}
            >
              Create
            </Button>
            <Button 
              variant="outline" 
              borderColor="brand.border"
              onClick={onClose}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

TeamDetailsEditor.propTypes = {
  isDisabled: PropTypes.bool,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default TeamDetailsEditor;




















