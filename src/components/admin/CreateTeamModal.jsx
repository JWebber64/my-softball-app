import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Text,
  VStack,
  Box,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
} from '@chakra-ui/react';
import { supabase } from '../../lib/supabaseClient';
import { useSimpleAuth } from '../../context/SimpleAuthContext';
import InteractiveMap from '../InteractiveMap';

const CreateTeamModal = ({ isOpen, onClose }) => {
  const [teamName, setTeamName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, fetchTeamInfo } = useSimpleAuth();
  const toast = useToast();

  const steps = [
    { title: 'Team Name', description: 'Enter your team name' },
    { title: 'Location', description: 'Select your home field' }
  ];

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleNext = () => {
    if (!teamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team name",
        status: "error",
        duration: 3000,
      });
      return;
    }
    setActiveStep(1);
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!selectedLocation) {
      toast({
        title: 'Error',
        description: 'Please select a team location on the map',
        status: 'error',
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: teamName,
          admin_id: user.id,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          location_name: selectedLocation.name
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchTeamInfo(user.id);

      toast({
        title: 'Team created successfully',
        status: 'success',
        duration: 3000,
      });

      setTeamName('');
      setSelectedLocation(null);
      setActiveStep(0);
      onClose();
    } catch (error) {
      toast({
        title: 'Error creating team',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTeamName('');
    setSelectedLocation(null);
    setActiveStep(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Team</ModalHeader>
        <ModalBody>
          <Stepper index={activeStep} mb={6}>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus />
                </StepIndicator>
                <StepTitle>{step.title}</StepTitle>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 ? (
            <FormControl>
              <FormLabel>Team Name</FormLabel>
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </FormControl>
          ) : (
            <VStack spacing={4}>
              <Text>Double-click on the map to select your home field location:</Text>
              <Box height="400px" width="100%">
                <InteractiveMap
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={selectedLocation}
                  selectionMode={true}
                />
              </Box>
              
              {selectedLocation && (
                <Text color="green.500">
                  Selected location: {selectedLocation.name || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`}
                </Text>
              )}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          {activeStep === 0 ? (
            <Button
              colorScheme="blue"
              onClick={handleNext}
              isDisabled={!teamName.trim()}
            >
              Next
            </Button>
          ) : (
            <>
              <Button variant="ghost" mr={3} onClick={handleBack}>
                Back
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={isLoading}
                isDisabled={!selectedLocation}
              >
                Create Team
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateTeamModal;
