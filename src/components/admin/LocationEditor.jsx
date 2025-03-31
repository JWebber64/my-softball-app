import {
  Box, Button, Flex, Modal, ModalBody,
  ModalCloseButton, ModalContent,
  ModalHeader, ModalOverlay, Text,
  useDisclosure, useToast, VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTeam } from '../../hooks/useTeam';
import { supabase } from '../../lib/supabaseClient';
import InteractiveMap from '../InteractiveMap';

const LocationEditor = ({ 
  teamId, 
  currentLocation, 
  onError, 
  onSuccess, 
  buttonOnly = false, 
  onLocationSelect 
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const getPopupContent = (loc) => {
    if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') {
      return `
        <div class="custom-popup">
          <strong>Team Location</strong><br>
          New Team Location<br>
          Location not set
          <button class="view-team-btn" id="confirm-location-btn">
            Confirm Location
          </button>
        </div>
      `;
    }

    return `
      <div class="custom-popup">
        <strong>Team Location</strong><br>
        ${loc.name || 'New Team Location'}<br>
        ${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}
        <button class="view-team-btn" id="confirm-location-btn">
          Confirm Location
        </button>
      </div>
    `;
  };

  const [location, setLocation] = useState(currentLocation && currentLocation.lat && currentLocation.lng ? {
    ...currentLocation,
    id: 'team-location',
    type: 'team',
    popupContent: getPopupContent(currentLocation)
  } : null);
  const { updateTeamDetails } = useTeam();

  const handleLocationSelect = (newLocation) => {
    // Create enhanced location object
    const enhancedLocation = {
      ...newLocation,
      id: 'team-location',
      type: 'team',
      name: 'New Team Location',
      popupContent: getPopupContent(newLocation)
    };
    
    // Update local state
    setLocation(enhancedLocation);
    
    // Call parent handler if provided
    if (onLocationSelect) {
      onLocationSelect(enhancedLocation);
    }
  };

  const handleMarkerClick = (markerId) => {
    console.log('Marker clicked:', markerId);
  };

  const handleSave = async () => {
    try {
      if (!location) {
        throw new Error('Please select a location');
      }

      console.log('Saving location:', location); // Debug log

      if (teamId) {
        // Update existing team
        const { data, error } = await supabase
          .from('teams')
          .update({ 
            latitude: location.lat,
            longitude: location.lng,
            location_name: location.name || 'Team Location'
          })
          .eq('id', teamId)
          .select()
          .single();

        console.log('Supabase update response:', { data, error }); // Debug log

        if (error) throw error;

        const updatedTeam = {
          ...data,
          location: {
            lat: data.latitude,
            lng: data.longitude,
            name: data.location_name || 'Team Location'
          }
        };
        
        // Update local state
        setLocation(updatedTeam.location);
        
        onSuccess('Team location updated successfully');
      } else {
        // Creating new team - just pass the location back
        onLocationSelect(location);
        onSuccess('Location selected successfully');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      onError(error);
    }
  };

  const modalContent = (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxW="800px">
        <ModalHeader>
          {teamId ? 'Update Team Location' : 'Choose Team Location'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Box
            h="400px"
            borderRadius="md"
            overflow="hidden"
            border="1px solid"
            borderColor="gray.200"
          >
            <InteractiveMap
              onLocationSelect={handleLocationSelect}
              selectionMode={true}
              defaultMarkers={location ? [location] : []}
              showCrosshair={true}
              showPopups={true}
              onMarkerClick={handleMarkerClick}
            />
          </Box>
          <Flex justify="flex-end" mt={4}>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              isDisabled={!location}
            >
              {teamId ? 'Save Location' : 'Confirm Location'}
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  if (buttonOnly) {
    return (
      <>
        <Button
          onClick={onOpen}
          size="md"
          colorScheme="blue"
        >
          {teamId ? 'Update Location' : 'Choose Location'}
        </Button>
        {modalContent}
      </>
    );
  }

  return (
    <VStack align="center" spacing={4}>
      <Text fontWeight="medium">Home Field Location</Text>
      <Box
        borderRadius="lg"
        border="1px"
        borderColor="brand.border"
        p={4}
        bg="brand.primary.base"
        textAlign="center"
        width="100%"
      >
        {location && location.lat && location.lng ? (
          <Text color="white">
            Current Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </Text>
        ) : (
          <Text color="gray.500">No location set</Text>
        )}
        <Button
          mt={4}
          colorScheme="blue"
          onClick={onOpen}
        >
          {teamId ? 'Update Location' : 'Choose Location'}
        </Button>
      </Box>
      {modalContent}
    </VStack>
  );
};

LocationEditor.propTypes = {
  teamId: PropTypes.string, // Make teamId optional
  currentLocation: PropTypes.object,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  buttonOnly: PropTypes.bool,
  onLocationSelect: PropTypes.func
};

export default LocationEditor;


