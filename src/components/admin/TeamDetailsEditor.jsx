import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Switch,
  VStack,
  useToast
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTeam } from '../../hooks/useTeam';
import { supabase } from '../../lib/supabaseClient';
import { formFieldStyles, switchStyles } from '../../styles/formFieldStyles';
import LocationEditor from '../admin/LocationEditor';

const TeamDetailsEditor = ({ isDisabled }) => {
  const { team, setTeam } = useTeam();
  const { user } = useAuth();
  const toast = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [newTeam, setNewTeam] = useState({
    name: '',
    password: '',
    latitude: null,
    longitude: null,
    location_name: '',
    is_public: true
  });

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

  const handleLocationSuccess = (location) => {
    console.log('Location update success:', location); // Debug log
    
    // Update the team state with new location
    setTeam(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
      location_name: location.name || 'Team Location'
    }));

    // Show success toast
    toast({
      title: 'Location Updated',
      description: 'Team location has been updated successfully',
      status: 'success',
      duration: 3000,
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

      setIsEditModalOpen(false);
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
      <ButtonGroup spacing={4} mb={4}>
        <Button variant="primary">Create Team</Button>
        <Button variant="primary" isDisabled={!team}>Edit Team</Button>
        <Button 
          variant="danger"
          onClick={handleDeleteTeam} 
          isDisabled={!team}
        >
          Delete Team
        </Button>
      </ButtonGroup>

      <FormControl mb={4}>
        <FormLabel>Selected Team</FormLabel>
        <Select
          {...formFieldStyles}
          value={team?.id || ""}
          onChange={(e) => {
            const selectedTeam = availableTeams.find(t => t.id === e.target.value);
            setTeam(selectedTeam);
          }}
          placeholder="Select a team"
        >
          {availableTeams.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      </FormControl>

      {team && (
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Upload Logo</FormLabel>
            <Input
              {...formFieldStyles}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Team Name</FormLabel>
            <Input
              {...formFieldStyles}
              value={team.name}
              onChange={(e) => setTeam({ ...team, name: e.target.value })}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Location</FormLabel>
            <Input
              {...formFieldStyles}
              value={team.location_name}
              onChange={(e) => setTeam({ ...team, location_name: e.target.value })}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Team Password</FormLabel>
            <Input
              {...formFieldStyles}
              type="password"
              value={team.team_password}
              onChange={(e) => setTeam({ ...team, team_password: e.target.value })}
            />
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">Team Visibility</FormLabel>
            <Switch
              {...switchStyles}
              isChecked={team.is_public}
              onChange={(e) => {
                const isPublic = e.target.checked;
                setTeam({ ...team, is_public: isPublic });
              }}
            />
          </FormControl>
        </VStack>
      )}

      {/* Create Team Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Team</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Team Name</FormLabel>
                <Input
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </FormControl>

              <LocationEditor 
                onLocationSelect={handleLocationSuccess}
                onSuccess={handleLocationSuccess}
                onError={handleLocationError}
              />

              <FormControl>
                <FormLabel>Team Password</FormLabel>
                <Input
                  type="password"
                  value={newTeam.password}
                  onChange={(e) => setNewTeam({ ...newTeam, password: e.target.value })}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Team Visibility</FormLabel>
                <Switch
                  isChecked={newTeam.is_public}
                  onChange={(e) => setNewTeam({ ...newTeam, is_public: e.target.checked })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCreateTeam}>
              Create
            </Button>
            <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Team Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Team</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Team Name</FormLabel>
                <Input
                  value={team?.name || ''}
                  onChange={(e) => setTeam({ ...team, name: e.target.value })}
                />
              </FormControl>

              <LocationEditor 
                teamId={team?.id} // Make sure to pass the teamId
                onLocationSelect={handleLocationSuccess}
                onSuccess={handleLocationSuccess}
                onError={handleLocationError}
                currentLocation={team ? {
                  lat: team.latitude,
                  lng: team.longitude,
                  name: team.location_name
                } : null}
                buttonOnly={false}
              />

              <FormControl>
                <FormLabel>Team Password</FormLabel>
                <Input
                  type="password"
                  value={team?.team_password || ''}
                  onChange={(e) => setTeam({ ...team, team_password: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleEditTeam}>
              Save Changes
            </Button>
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TeamDetailsEditor;

// Replace hardcoded button styles with theme tokens
const buttonStyles = {
  bg: 'brand.primary.base',
  color: 'brand.text.primary',
  _hover: {
    bg: 'brand.primary.hover',
    transform: 'translateY(-2px)',
    boxShadow: 'lg',
  },
  _active: {
    bg: 'brand.primary.active',
    transform: 'translateY(0)',
  }
};



















