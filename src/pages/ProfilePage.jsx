import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import BaseballCardGenerator from '../components/baseball-card/BaseballCardGenerator';
import ProfileImageUploader from '../components/ProfileImageUploader';
import { DEFAULT_ASSETS } from '../config';
import { useAuth } from '../hooks/useAuth';
import { usePlayerProfile } from '../hooks/usePlayerProfile';
import { updateProfile } from '../services/profileService';

const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, loading, error } = usePlayerProfile(user?.id);
  const [imageError, setImageError] = useState(false);
  const toast = useToast();
  
  // Remove email and role from formData
  const [formData, setFormData] = useState({
    profile_image_url: '',
    first_name: '',
    last_name: '',
    jersey_number: '',
    position: '',
    is_public: false
  });

  // Update formData when profile is loaded - remove email and role
  useEffect(() => {
    if (profile) {
      setFormData({
        profile_image_url: profile.profile_image_url || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        jersey_number: profile.jersey_number || '',
        position: profile.position || '',
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

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box 
          textAlign="center"
          bg="brand.primary.base"
          p={6}
          borderRadius="lg"
          borderColor="brand.border"
          borderWidth="1px"
        >
          <Box
            position="relative"
            width="128px"
            height="128px"
            margin="0 auto"
            mb={4}
          >
            <Avatar 
              size="2xl" 
              name={formData.email}
              src={imageError ? DEFAULT_ASSETS.IMAGES.PLAYER_PHOTO : formData.profile_image_url}
              onError={(e) => {
                console.log('Avatar failed to load:', formData.profile_image_url);
                setImageError(true);
                e.target.src = DEFAULT_ASSETS.IMAGES.PLAYER_PHOTO;
              }}
              fallback={<Image src={DEFAULT_ASSETS.IMAGES.PLAYER_PHOTO} alt="Default profile" />}
            />
          </Box>
          <ProfileImageUploader
            userId={user.id}
            currentImageUrl={formData.profile_image_url}
            onImageUpdate={(url) => {
              console.log('New image URL received:', url);
              setImageError(false);
              setFormData(prev => ({
                ...prev,
                profile_image_url: url
              }));
            }}
          />
        </Box>

        <Stack 
          spacing={4} 
          bg="brand.primary.base"
          p={6} 
          borderRadius="lg"
          borderColor="brand.border"
          borderWidth="1px"
        >
          <Heading size="md" color="brand.text.primary">Profile Information</Heading>
          <Divider borderColor="brand.border" />
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel color="brand.text.primary">First Name</FormLabel>
              <Input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                bg="brand.background"
                color="brand.text.primary"
              />
            </FormControl>

            <FormControl>
              <FormLabel color="brand.text.primary">Last Name</FormLabel>
              <Input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                bg="brand.background"
                color="brand.text.primary"
              />
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel color="brand.text.primary">Jersey Number</FormLabel>
              <NumberInput
                min={1}
                max={99}
                value={formData.jersey_number}
                onChange={(valueString) => 
                  setFormData(prev => ({
                    ...prev,
                    jersey_number: valueString
                  }))
                }
              >
                <NumberInputField
                  name="jersey_number"
                  bg="brand.background"
                  color="brand.text.primary"
                />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel color="brand.text.primary">Position</FormLabel>
              <Input
                name="position"
                value={formData.position}
                onChange={handleChange}
                bg="brand.background"
                color="brand.text.primary"
              />
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

          <Button
            onClick={handleUpdateProfile}
            bgGradient="linear(to-r, brand.gradient.start, brand.gradient.middle, brand.gradient.end)"
            color="brand.text.primary"
            _hover={{ opacity: 0.9 }}
          >
            Save Profile
          </Button>
        </Stack>

        <Box 
          bg="brand.primary.base"
          p={6} 
          borderRadius="lg"
          borderColor="brand.border"
          borderWidth="1px"
        >
          <BaseballCardGenerator 
            players={[{
              id: user.id,
              player_name: `${formData.first_name} ${formData.last_name}`,
              jersey_number: String(formData.jersey_number),
              position: formData.position,
              photoUrl: DEFAULT_ASSETS.IMAGES.PLAYER_PHOTO // Use default photo initially
            }]}
            stats={{
              [user.id]: profile?.stats || {}
            }}
          />
        </Box>
      </VStack>
    </Container>
  );
};

export default ProfilePage;

























