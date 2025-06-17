import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import BaseballCardGenerator from '../components/baseball-card/BaseballCardGenerator';
import ConnectToTeamSection from '../components/profile/ConnectToTeamSection';
import { useAuth } from '../hooks/useAuth';
import { usePlayerProfile } from '../hooks/usePlayerProfile';
import { supabase } from '../lib/supabaseClient';
import { updateProfile } from '../services/profileService';

const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, loading, error } = usePlayerProfile(user?.id);
  const [imageError, setImageError] = useState(false);
  const [baseballCards, setBaseballCards] = useState([]);
  const toast = useToast();
  
  // Fetch baseball cards
  useEffect(() => {
    const fetchBaseballCards = async () => {
      if (!user?.id) return;
      
      try {
        // First get the basic card info
        const { data, error } = await supabase
          .from('baseball_cards')
          .select('id, created_at')
          .eq('player_id', user.id);
          
        if (error) throw error;
        
        // Add player name to each card for display purposes
        const cardsWithNames = data.map(card => ({
          ...card,
          displayName: `Card #${card.id} - ${formData.first_name} ${formData.last_name}`
        }));
        
        setBaseballCards(cardsWithNames || []);
      } catch (err) {
        console.error('Error fetching baseball cards:', err);
      }
    };
    
    fetchBaseballCards();
  }, [user?.id]);
  
  // Remove email and role from formData
  const [formData, setFormData] = useState({
    profile_image_url: '',
    first_name: '',
    last_name: '',
    jersey_number: '',
    positions: [], // We'll use this for the UI
    is_public: false
  });

  // Update the useEffect to convert the position string to an array
  useEffect(() => {
    if (profile) {
      const positionsArray = profile.position ? 
        profile.position.split(',').map(p => p.trim()) : [];
      
      setFormData({
        profile_image_url: profile.profile_image_url || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        jersey_number: profile.jersey_number || '',
        positions: positionsArray,
        is_public: profile.is_public || false
      });
    }
  }, [profile]);

  if (loading) {
    return <Box>Loading...</Box>;
  }

  if (error) {
    return (
      <Container>
        <VStack spacing={4}>
          <Heading>Error loading profile</Heading>
          <Text>{error}</Text>
        </VStack>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <VStack spacing={4}>
          <Heading>Please log in to view your profile</Heading>
        </VStack>
      </Container>
    );
  }

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        ...formData,
        userId: user.id
      });
      toast({
        title: "Profile updated",
        status: "success",
        duration: 3000,
        bg: "brand.primary.base",
        color: "brand.text.primary"
      });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        status: "error",
        duration: 3000,
        bg: "brand.primary.base",
        color: "brand.text.primary"
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePositionAdd = (position) => {
    if (position && !formData.positions.includes(position)) {
      setFormData(prev => ({
        ...prev,
        positions: [...prev.positions, position]
      }));
    }
  };

  const handlePositionRemove = (positionToRemove) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.filter(pos => pos !== positionToRemove)
    }));
  };

  return (
    <Box mt="80px">
      <Container maxW="container.xl" py={6}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Box 
            bg="brand.surface.base"
            p={6} 
            borderRadius="lg"
            borderColor="brand.border"
            borderWidth="1px"
          >
            <Stack spacing={4}>
              <Heading size="md" color="brand.text.primary">Profile Information</Heading>
              <Divider borderColor="brand.border" />
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel color="brand.text.primary">First Name</FormLabel>
                  <Input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    bg="brand.surface.input"
                    color="brand.text.primary"
                    borderColor="brand.border"
                    _hover={{ borderColor: 'brand.primary.hover' }}
                    _focus={{ 
                      borderColor: 'brand.primary.hover',
                      boxShadow: 'none'
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="brand.text.primary">Last Name</FormLabel>
                  <Input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    bg="brand.surface.input"
                    color="brand.text.primary"
                    borderColor="brand.border"
                    _hover={{ borderColor: 'brand.primary.hover' }}
                    _focus={{ 
                      borderColor: 'brand.primary.hover',
                      boxShadow: 'none'
                    }}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel color="brand.text.primary">Jersey Number</FormLabel>
                  <NumberInput
                    name="jersey_number"
                    value={formData.jersey_number}
                    onChange={(valueString) => setFormData({...formData, jersey_number: valueString})}
                    min={0}
                    max={99}
                  >
                    <NumberInputField 
                      bg="brand.surface.input"
                      color="brand.text.primary"
                      borderColor="brand.border"
                      _hover={{ borderColor: 'brand.primary.hover' }}
                      _focus={{ 
                        borderColor: 'brand.primary.hover',
                        boxShadow: 'none'
                      }}
                    />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel color="brand.text.primary">Positions</FormLabel>
                  <Select
                    placeholder="Select position"
                    onChange={(e) => handlePositionAdd(e.target.value)}
                    value=""
                    bg="brand.surface.input"
                    color="brand.text.primary"
                    borderColor="brand.border"
                    _hover={{ borderColor: 'brand.primary.hover' }}
                    _focus={{ 
                      borderColor: 'brand.primary.hover',
                      boxShadow: 'none'
                    }}
                  >
                    <option value="P">P (Pitcher)</option>
                    <option value="C">C (Catcher)</option>
                    <option value="1B">1B (First Base)</option>
                    <option value="2B">2B (Second Base)</option>
                    <option value="3B">3B (Third Base)</option>
                    <option value="SS">SS (Shortstop)</option>
                    <option value="IF">IF (Infield)</option>
                    <option value="LF">LF (Left Field)</option>
                    <option value="LCF">LCF (Left-Center Field)</option>
                    <option value="CF">CF (Center Field)</option>
                    <option value="RCF">RCF (Right-Center Field)</option>
                    <option value="RF">RF (Right Field)</option>
                    <option value="OF">OF (Outfield)</option>
                    <option value="DH">DH (Designated Hitter)</option>
                  </Select>
                  
                  <HStack spacing={2} mt={2} wrap="wrap">
                    {formData.positions.map(position => (
                      <Tag
                        key={position}
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="green"
                        mb={1}
                      >
                        <TagLabel>{position}</TagLabel>
                        <TagCloseButton onClick={() => handlePositionRemove(position)} />
                      </Tag>
                    ))}
                  </HStack>
                </FormControl>
              </SimpleGrid>

              <FormControl display='flex' alignItems='center' gap={2}>
                <FormLabel color="brand.text.primary" mb='0'>
                  Make Profile Public?
                </FormLabel>
                <Flex align="center" gap={2}>
                  <Switch
                    name="is_public"
                    isChecked={formData.is_public}
                    onChange={handleChange}
                    colorScheme="green"
                    size="lg"
                  />
                  <Text 
                    color={formData.is_public ? "green.400" : "red.400"}
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    {formData.is_public ? "Public" : "Private"}
                  </Text>
                </Flex>
              </FormControl>

              <FormControl mt={4}>
                <FormLabel color="brand.text.primary">Baseball Card</FormLabel>
                <Select
                  placeholder="Select your baseball card"
                  value={formData.baseball_card_id || ''}
                  onChange={(e) => setFormData({...formData, baseball_card_id: e.target.value})}
                  bg="brand.surface.input"
                  color="brand.text.primary"
                  borderColor="brand.border"
                  _hover={{ borderColor: 'brand.primary.hover' }}
                  _focus={{ 
                    borderColor: 'brand.primary.hover',
                    boxShadow: 'none'
                  }}
                >
                  {baseballCards.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.displayName}
                    </option>
                  ))}
                </Select>
                <Text fontSize="sm" color="brand.text.primary" mt={1}>
                  This card will be shown when someone clicks on your profile
                </Text>
              </FormControl>

              <Flex justify="center" w="full">
                <Button
                  onClick={handleUpdateProfile}
                  bgGradient="linear(to-r, brand.gradient.start, brand.gradient.middle, brand.gradient.end)"
                  color="brand.text.primary"
                  _hover={{ opacity: 0.9 }}
                  w={{ base: "full", md: "200px" }}
                  mt={4}
                >
                  Save Profile
                </Button>
              </Flex>
            </Stack>
          </Box>

          <Box 
            bg="brand.surface.base"
            p={6} 
            borderRadius="lg"
            borderColor="brand.border"
            borderWidth="1px"
          >
            <BaseballCardGenerator userId={user.id} />
          </Box>

          {!profile?.team_id && (
            <ConnectToTeamSection />
          )}

          {profile?.team_id && (
            <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
              <Heading size="md" mb={4}>Team Connection</Heading>
              <Text>
                You are connected to: <strong>{profile.team_name}</strong>
              </Text>
              <Text mt={2}>
                View team information, stats, and score sheets on the team page.
              </Text>
              <Button 
                mt={4} 
                colorScheme="blue" 
                onClick={() => navigate(`/team/${profile.team_id}`)}
              >
                Go to Team Page
              </Button>
            </Box>
          )}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default ProfilePage;





















































