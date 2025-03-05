import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Select,
  NumberInput,
  NumberInputField,
  useToast,
  Avatar,
  Icon,
  Text,
  Grid,
  GridItem,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  Image,
  SimpleGrid,
  useDisclosure
} from '@chakra-ui/react';
import {
  FaChevronRight,
  FaUsers,
  FaUser,
  FaList,
  FaImage,
  FaInstagram,
  FaTwitter
} from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import PropTypes from 'prop-types';
import html2canvas from 'html2canvas';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from '../components/ErrorBoundary';
import BaseballCard from '../components/baseball-card/BaseballCard';
import SectionCard from '../components/common/SectionCard';
import CardContainer from '../components/CardContainer';
import { useTeam } from '../context/TeamContext';

const TeamInfoPage = () => {
  const { teamDetails } = useTeam();
  const toast = useToast();
  const cardRef = useRef();
  
  // State declarations
  const [teamBios, setTeamBios] = useState([]);
  const [biosLoading, setBiosLoading] = useState(true);
  const [biosError, setBiosError] = useState(null);
  const [selectedPlayerForCard, setSelectedPlayerForCard] = useState(null);

  useEffect(() => {
    const fetchTeamBios = async () => {
      try {
        setBiosLoading(true);
        const { data, error } = await supabase
          .from('player_bios')
          .select('*');
        
        if (error) throw error;
        
        setTeamBios(data);
      } catch (error) {
        console.error('Error fetching team bios:', error);
        setBiosError(error.message);
      } finally {
        setBiosLoading(false);
      }
    };

    fetchTeamBios();
  }, []); // Empty dependency array means this runs once on component mount

  // useDisclosure hooks
  const { 
    isOpen: isCardOpen, 
    onOpen: onCardOpen, 
    onClose: onCardClose 
  } = useDisclosure();
  
  const { isOpen: isProfileFormOpen, onOpen: onProfileFormOpen, onClose: onProfileFormClose } = useDisclosure();

  useEffect(() => {
    console.log('Current team details:', teamDetails);
  }, [teamDetails]);

  const handleExportCard = async (player) => {
    if (!player) return;
    
    const cardData = {
      player: {
        id: player.id,
        player_name: player.name,
        jersey_number: player.number,
        position: player.position,
        photoUrl: player.photo_url
      },
      stats: {
        avg: player.batting_average,
        games: player.games_played,
        at_bats: player.at_bats,
        hits: player.hits,
        rbi: player.rbis,
        runs: player.runs,
        home_runs: player.home_runs
      }
    };

    try {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const root = ReactDOM.createRoot(container);
      root.render(
        <ErrorBoundary>
          <BaseballCard
            ref={cardRef}
            {...cardData}
          />
        </ErrorBoundary>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${player.name.replace(/\s+/g, '-')}-card.png`;
      link.href = image;
      link.click();

      document.body.removeChild(container);
    } catch (error) {
      console.error('Error exporting card:', error);
      toast({
        title: 'Export failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateProfile = async (profileData) => {
    try {
      const { error } = await supabase
        .from('player_bios')
        .insert([profileData]);

      if (error) throw error;

      const { data: updatedBios } = await supabase
        .from('player_bios')
        .select('*');
      
      setTeamBios(updatedBios);

      toast({
        title: "Profile created successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error creating profile",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const PlayerProfileForm = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formToast = useToast();

    const [formData, setFormData] = useState({
      name: '',
      number: '',
      position: '',
      bats: 'Right',
      throws: 'Right',
      height: '',
      weight: '',
      photo_url: '',
      instagram_link: '',
      twitter_link: '',
      ...initialData
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.name || !formData.number || !formData.position) {
        formToast({
          title: "Required fields missing",
          description: "Please fill in all required fields",
          status: "error",
          duration: 3000,
        });
        return;
      }

      try {
        setIsSubmitting(true);
        await onSubmit(formData);
        onClose();
      } catch (error) {
        formToast({
          title: "Error saving profile",
          description: error.message,
          status: "error",
          duration: 3000,
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="lg"
        closeOnOverlayClick={!isSubmitting}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {initialData.id ? 'Edit Profile' : 'Create Profile'}
          </ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />
          <form onSubmit={handleSubmit}>
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    isDisabled={isSubmitting}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Jersey Number</FormLabel>
                  <NumberInput min={0} max={99}>
                    <NumberInputField 
                      value={formData.number}
                      onChange={(e) => setFormData({...formData, number: e.target.value})}
                    />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Position</FormLabel>
                  <Select 
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                  >
                    <option value="Pitcher">Pitcher</option>
                    <option value="Catcher">Catcher</option>
                    <option value="First Base">First Base</option>
                    <option value="Second Base">Second Base</option>
                    <option value="Third Base">Third Base</option>
                    <option value="Shortstop">Shortstop</option>
                    <option value="Left Field">Left Field</option>
                    <option value="Center Field">Center Field</option>
                    <option value="Right Field">Right Field</option>
                  </Select>
                </FormControl>

                <HStack width="100%" spacing={4}>
                  <FormControl>
                    <FormLabel>Bats</FormLabel>
                    <Select 
                      value={formData.bats}
                      onChange={(e) => setFormData({...formData, bats: e.target.value})}
                    >
                      <option value="Right">Right</option>
                      <option value="Left">Left</option>
                      <option value="Switch">Switch</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Throws</FormLabel>
                    <Select 
                      value={formData.throws}
                      onChange={(e) => setFormData({...formData, throws: e.target.value})}
                    >
                      <option value="Right">Right</option>
                      <option value="Left">Left</option>
                    </Select>
                  </FormControl>
                </HStack>

                <HStack width="100%" spacing={4}>
                  <FormControl>
                    <FormLabel>Height</FormLabel>
                    <Input 
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      placeholder="5'10&quot;"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Weight</FormLabel>
                    <Input 
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="175 lbs"
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Photo URL</FormLabel>
                  <InputGroup>
                    <Input 
                      value={formData.photo_url}
                      onChange={(e) => setFormData({...formData, photo_url: e.target.value})}
                      isDisabled={isSubmitting}
                    />
                    <InputRightElement>
                      {formData.photo_url && (
                        <Image 
                          src={formData.photo_url} 
                          alt="Preview"
                          boxSize="20px"
                          fallback={<Icon as={FaImage} />}
                        />
                      )}
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>Social Media</FormLabel>
                  <VStack spacing={2}>
                    <InputGroup>
                      <InputLeftAddon><FaInstagram /></InputLeftAddon>
                      <Input 
                        value={formData.instagram_link}
                        onChange={(e) => setFormData({...formData, instagram_link: e.target.value})}
                        placeholder="Instagram profile URL"
                        isDisabled={isSubmitting}
                      />
                    </InputGroup>
                    <InputGroup>
                      <InputLeftAddon><FaTwitter /></InputLeftAddon>
                      <Input 
                        value={formData.twitter_link}
                        onChange={(e) => setFormData({...formData, twitter_link: e.target.value})}
                        placeholder="Twitter profile URL"
                        isDisabled={isSubmitting}
                      />
                    </InputGroup>
                  </VStack>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button 
                colorScheme="blue" 
                mr={3} 
                type="submit"
                isLoading={isSubmitting}
              >
                {initialData.id ? 'Save Changes' : 'Create Profile'}
              </Button>
              <Button onClick={onClose} isDisabled={isSubmitting}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    );
  };

  PlayerProfileForm.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      number: PropTypes.string,
      position: PropTypes.string,
      bats: PropTypes.string,
      throws: PropTypes.string,
      height: PropTypes.string,
      weight: PropTypes.string,
      photo_url: PropTypes.string,
      instagram_link: PropTypes.string,
      twitter_link: PropTypes.string
    })
  };

  PlayerProfileForm.defaultProps = {
    initialData: {}
  };

  useEffect(() => {
    if (selectedPlayerForCard) {
      onCardOpen(); // Open the card modal when a player is selected
    }
  }, [selectedPlayerForCard, onCardOpen]);

  const handlePlayerClick = (player) => {
    setSelectedPlayerForCard({
      id: player.id,
      player_name: player.name,
      jersey_number: player.number,
      position: player.position,
      photoUrl: player.photo_url,
      stats: {
        avg: player.batting_average,
        games: player.games_played,
        at_bats: player.at_bats,
        hits: player.hits,
        rbi: player.rbis,
        runs: player.runs,
        home_runs: player.home_runs
      }
    });
  };

  return (
    <>
      <Box className="container" p={4}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
          <CardContainer>
            <SectionCard
              title="Player Profiles"
              loading={biosLoading}
              error={biosError}
              isEmpty={!teamBios || teamBios.length === 0}
              icon={FaUsers}
            >
              <Box mb={4}>
                <Button
                  leftIcon={<FaUser />}
                  colorScheme="green"
                  onClick={onProfileFormOpen}
                >
                  Create Profile
                </Button>
              </Box>
              <Grid 
                templateColumns="repeat(auto-fill, minmax(150px, 1fr))" 
                gap={4}
                overflowY="auto"
                maxH="400px"
                p={2}
              >
                {teamBios && teamBios.map(player => (
                  <GridItem 
                    key={player.id}
                    as="button"
                    onClick={() => handlePlayerClick(player)}
                    _hover={{ transform: 'scale(1.02)' }}
                    transition="transform 0.2s"
                  >
                    <VStack
                      bg="brand.primary.base"
                      p={3}
                      borderRadius="md"
                      spacing={2}
                      align="center"
                      boxShadow="sm"
                    >
                      <Avatar size="lg" name={player.name} src={player.photo_url} />
                      <Text fontWeight="bold" fontSize="sm" color="brand.text.primary">{player.name}</Text>
                      <Text fontSize="xs" color="brand.text.muted">#{player.number} • {player.position}</Text>
                    </VStack>
                  </GridItem>
                ))}
              </Grid>
            </SectionCard>
          </CardContainer>

          <CardContainer>
            <SectionCard
              title="Team Roster"
              loading={biosLoading}
              error={biosError}
              isEmpty={!teamBios || teamBios.length === 0}
              icon={FaList}
            >
              <VStack spacing={2} align="stretch" maxH="400px" overflowY="auto">
                {teamBios && teamBios.map(player => (
                  <Box 
                    key={player.id}
                    cursor="pointer"
                    onClick={() => handlePlayerClick(player)}
                    _hover={{ bg: 'brand.primary.hover' }}
                    p={3}
                    borderRadius="md"
                    transition="all 0.2s"
                  >
                    <HStack spacing={4}>
                      <Avatar size="sm" name={player.name} src={player.photo_url} />
                      <Box flex="1">
                        <Text fontWeight="bold" color="brand.text.primary">{player.name}</Text>
                        <Text fontSize="sm" color="brand.text.muted">
                          #{player.number} • {player.position} • B: {player.bats} • T: {player.throws}
                        </Text>
                      </Box>
                      <Icon as={FaChevronRight} color="brand.text.muted" />
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </SectionCard>
          </CardContainer>
        </SimpleGrid>
      </Box>
      <Modal isOpen={isCardOpen} onClose={onCardClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Player Card</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPlayerForCard && (
              <BaseballCard
                player={selectedPlayerForCard}
                onExport={() => handleExportCard(selectedPlayerForCard)}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <PlayerProfileForm
        isOpen={isProfileFormOpen}
        onClose={onProfileFormClose}
        onSubmit={handleCreateProfile}
      />
    </>
  );
};

export default TeamInfoPage;
