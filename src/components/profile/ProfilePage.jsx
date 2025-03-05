import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Heading,
  useToast,
  VStack,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useUserProfile } from '../../hooks/useUserProfile';
import RoleSpecificFields from '../auth/RoleSpecificFields';

const ProfilePage = () => {
  const { profile, loading, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const toast = useToast();

  // Initialize form values when profile loads
  React.useEffect(() => {
    if (profile) {
      setValues(profile);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = {
      'user': ['first_name', 'last_name'],
      'team-admin': ['team_name', 'phone_number'],
      'league-admin': ['league_name', 'organization', 'phone_number']
    }[profile?.role || 'user'];

    requiredFields.forEach(field => {
      if (!values[field]?.trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      await updateProfile(values);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container centerContent py={10}>
        <Text>No profile found. Please sign in.</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <Card>
        <CardHeader>
          <Heading size="lg">Profile Settings</Heading>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {isEditing ? (
                <RoleSpecificFields
                  role={profile.role}
                  values={values}
                  errors={errors}
                  handleChange={handleChange}
                />
              ) : (
                <Box>
                  {Object.entries(values).map(([key, value]) => (
                    key !== 'id' && key !== 'created_at' && key !== 'updated_at' && (
                      <Box key={key} mb={4}>
                        <Text fontWeight="bold" textTransform="capitalize">
                          {key.replace(/_/g, ' ')}
                        </Text>
                        <Text>{value || 'Not set'}</Text>
                      </Box>
                    )
                  ))}
                </Box>
              )}
              
              <Box display="flex" justifyContent="flex-end" gap={4}>
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setValues(profile);
                        setErrors({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      colorScheme="blue"
                      type="submit"
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    colorScheme="blue"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default ProfilePage;