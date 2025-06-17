import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsEditor from '../components/admin/NewsEditor';
import PlayerOfWeekEditor from '../components/admin/PlayerOfWeekEditor';
import RosterEditor from '../components/admin/RosterEditor';
import ScheduleEditor from '../components/admin/ScheduleEditor';
import SocialEmbedEditor from '../components/admin/SocialEmbedEditor';
import SocialMediaEditor from '../components/admin/SocialMediaEditor';
import TeamDetailsEditor from '../components/admin/TeamDetailsEditor';
import TeamFinancesEditor from '../components/admin/TeamFinancesEditor';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PlayerOfWeek from '../components/PlayerOfWeek';
import { ROUTER_CONFIG } from '../config';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';
import { checkTeamAdminAccess } from '../lib/roles';
import { supabase } from '../lib/supabaseClient';
import { deleteTeam } from '../utils/teamUtils';

const TeamAdminPage = () => {
  const { isAuthenticated, authLoading, user } = useAuth();
  const { team, loading: teamLoading, setTeam } = useTeam(); // Added setTeam here
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  
  // Add disclosures for the popups
  const teamDetailsDisclosure = useDisclosure();
  const playerOfWeekDisclosure = useDisclosure();
  const createTeamDisclosure = useDisclosure();

  // Remove these state variables
  // const [teamPassword, setTeamPassword] = useState('');
  // const [isSavingPassword, setIsSavingPassword] = useState(false);

  const containerStyles = {
    bg: 'brand.surface.base',
    borderColor: 'brand.border',
    borderWidth: '1px',
    borderRadius: 'md',
    p: 4,
    mb: 4,
    textAlign: 'center' // Center all text in containers
  };

  const headerStyles = {
    size: "md",
    color: "brand.text.primary",
    mb: 4,
    textAlign: 'center' // Ensure headers are centered
  };

  const buttonStyles = {
    className: "app-gradient",
    color: "brand.text.primary",
    _hover: { opacity: 0.9 },
    mb: 4
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteTeam(team.id);
      toast({
        title: 'Team deleted successfully',
        status: 'success',
        duration: 3000,
      });
      // Reset team state after deletion
      setTeam(null);
    } catch (error) {
      toast({
        title: 'Error deleting team',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleDeletePlayerOfWeek = async () => {
    if (!team) return;
    
    if (!window.confirm('Are you sure you want to delete the Player of the Week?')) {
      return;
    }
    
    try {
      // Simple direct deletion approach
      const { error } = await supabase
        .from('player_of_week')
        .delete()
        .eq('team_id', team.id);

      if (error) throw error;

      toast({
        title: 'Player of the Week deleted successfully',
        status: 'success',
        duration: 3000,
      });
      
      // Refresh team data after deletion
      await refreshTeam();
      
    } catch (error) {
      toast({
        title: 'Error deleting Player of the Week',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  // Add this function to refresh team data after changes
  const refreshTeam = async () => {
    if (!team?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*, player_of_week(*)')
        .eq('id', team.id)
        .single();
        
      if (error) throw error;
      
      setTeam({
        ...data,
        playerOfWeek: data.player_of_week
      });
      
    } catch (error) {
      console.error('Error refreshing team data:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkAccess = async () => {
      if (authLoading || teamLoading) return;
      
      if (!isAuthenticated) {
        navigate(ROUTER_CONFIG.ROUTES.SIGNIN);
        return;
      }

      try {
        const hasAccess = await checkTeamAdminAccess();
        if (mounted) {
          setIsAuthorized(hasAccess);
          // Only open modal if we have both authorization and team data
          // setIsModalOpen(hasAccess && !!team);
        }
        if (!hasAccess) {
          navigate(ROUTER_CONFIG.ROUTES.HOME);
        }
      } catch (error) {
        console.error('TeamAdminPage: Access check failed:', error);
        navigate(ROUTER_CONFIG.ROUTES.HOME);
      } finally {
        if (mounted) {
          setIsCheckingAccess(false);
        }
      }
    };

    checkAccess();
    return () => { 
      mounted = false;
      // Ensure modal is closed when component unmounts
      // setIsModalOpen(false);
    };
  }, [isAuthenticated, authLoading, teamLoading, navigate, user, team]);

  // Show loading spinner while checking auth, team data, or access
  if (authLoading || teamLoading || isCheckingAccess) {
    return <LoadingSpinner message="Loading..." />;
  }

  // Don't render anything if not authorized
  if (!isAuthorized || !team) {
    return null;
  }

  // Remove the handleSaveTeamPassword function
  // const handleSaveTeamPassword = async () => { ... };

  return (
    <Container maxW="1800px" py={6} px={4} mt="80px">
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Team Details */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Team Details</Heading>
          
          {/* Center the buttons */}
          <Flex justify="center" mb={4}>
            <HStack spacing={4}>
              <Button 
                className="app-gradient"
                color="brand.text.primary"
                _hover={{ opacity: 0.9 }}
                onClick={createTeamDisclosure.onOpen}
              >
                Create Team
              </Button>
              
              <Button 
                className="app-gradient"
                color="brand.text.primary"
                _hover={{ opacity: 0.9 }}
                onClick={teamDetailsDisclosure.onOpen}
                isDisabled={!team}
              >
                Edit Team Details
              </Button>
              
              <Button 
                variant="danger"
                onClick={handleDeleteTeam}
                isDisabled={!team}
              >
                Delete Team
              </Button>
            </HStack>
          </Flex>
          
          {/* Simple Team Info Display */}
          {team ? (
            <Box mt={4}>
              <Heading size="sm" mb={2}>Team Name: {team.name}</Heading>
              <Heading size="sm" mb={2}>Location: {team.location_name || 'Not set'}</Heading>
            </Box>
          ) : (
            <Box mt={4}>
              <Heading size="sm" mb={2}>No team selected</Heading>
            </Box>
          )}
          
          {/* Team Details Editor Modal */}
          <TeamDetailsEditor 
            isOpen={teamDetailsDisclosure.isOpen} 
            onClose={teamDetailsDisclosure.onClose}
          />
          
          {/* Create Team Modal */}
          <TeamDetailsEditor 
            isOpen={createTeamDisclosure.isOpen} 
            onClose={createTeamDisclosure.onClose}
            isCreateMode={true}
          />
        </Box>

        {/* Player of the Week */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Player of the Week</Heading>
          <Flex justify="center" mb={4}>
            <Button 
              className="app-gradient"
              color="brand.text.primary"
              _hover={{ opacity: 0.9 }}
              onClick={playerOfWeekDisclosure.onOpen}
              isDisabled={!team}
            >
              Add Player of the Week
            </Button>
          </Flex>
          
          <PlayerOfWeek 
            onDelete={handleDeletePlayerOfWeek} 
            hideAddButton={true} 
            onSave={refreshTeam}
          />
          
          <PlayerOfWeekEditor 
            isOpen={playerOfWeekDisclosure.isOpen} 
            onClose={playerOfWeekDisclosure.onClose}
            onSave={refreshTeam}
          />
        </Box>

        {/* Team Schedule */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Team Schedule</Heading>
          <Flex justify="center" mb={4}>
            <ScheduleEditor 
              teamId={team?.id} 
              isDisabled={!team}
              buttonProps={{
                primary: {
                  className: "app-gradient",
                  color: "brand.text.primary",
                  _hover: { opacity: 0.9 }
                },
                secondary: {
                  variant: "outline",
                  borderColor: "brand.border",
                  color: "brand.text.primary",
                  _hover: { bg: "brand.primary.hover", opacity: 0.9 }
                }
              }}
            />
          </Flex>
        </Box>

        {/* Team News */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Team News</Heading>
          <Flex justify="center" mb={4}>
            <NewsEditor 
              teamId={team?.id} 
              isDisabled={!team}
              buttonProps={{
                primary: {
                  className: "app-gradient",
                  color: "brand.text.primary",
                  _hover: { opacity: 0.9 }
                },
                secondary: {
                  variant: "outline",
                  borderColor: "brand.border",
                  color: "brand.text.primary",
                  _hover: { bg: "brand.primary.hover", opacity: 0.9 }
                }
              }}
            />
          </Flex>
        </Box>

        {/* Team Roster */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Team Roster</Heading>
          <Flex justify="center" mb={4}>
            <RosterEditor 
              isDisabled={!team}
              buttonProps={{
                primary: {
                  className: "app-gradient",
                  color: "brand.text.primary",
                  _hover: { opacity: 0.9 }
                },
                secondary: {
                  variant: "outline",
                  borderColor: "brand.border",
                  color: "brand.text.primary",
                  _hover: { bg: "brand.primary.hover", opacity: 0.9 }
                }
              }}
            />
          </Flex>
        </Box>

        {/* Team Finances */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Team Finances</Heading>
          <Flex justify="center" mb={4}>
            <TeamFinancesEditor 
              teamId={team?.id || ''} 
              isDisabled={!team}
              buttonProps={{
                primary: {
                  className: "app-gradient",
                  color: "brand.text.primary",
                  _hover: { opacity: 0.9 }
                },
                secondary: {
                  variant: "outline",
                  borderColor: "brand.border",
                  color: "brand.text.primary",
                  _hover: { bg: "brand.primary.hover", opacity: 0.9 }
                }
              }}
            />
          </Flex>
        </Box>

        {/* Social Media Embeds */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Social Media Embeds</Heading>
          <Flex justify="center" mb={4}>
            <SocialEmbedEditor 
              teamId={team?.id || ''} 
              isDisabled={!team}
              buttonProps={{
                primary: {
                  className: "app-gradient",
                  color: "brand.text.primary",
                  _hover: { opacity: 0.9 }
                },
                secondary: {
                  variant: "outline",
                  borderColor: "brand.border",
                  color: "brand.text.primary",
                  _hover: { bg: "brand.primary.hover", opacity: 0.9 }
                }
              }}
            />
          </Flex>
        </Box>

        {/* Social Media Links */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Social Media Links</Heading>
          <Box width="100%">
            <SocialMediaEditor 
              teamId={team?.id || ''} 
              isDisabled={!team}
              buttonProps={{
                primary: {
                  className: "app-gradient",
                  color: "brand.text.primary",
                  _hover: { opacity: 0.9 }
                },
                secondary: {
                  variant: "outline",
                  borderColor: "brand.border",
                  color: "brand.text.primary",
                  _hover: { bg: "brand.primary.hover", opacity: 0.9 }
                }
              }}
            />
          </Box>
        </Box>

        {/* Team Password Box removed */}
      </SimpleGrid>
    </Container>
  );
};

export default TeamAdminPage;
