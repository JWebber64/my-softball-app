import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  useToast,
  VStack,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';

const TOURNAMENT_TYPES = {
  SINGLE_ELIMINATION: 'single_elimination',
  DOUBLE_ELIMINATION: 'double_elimination',
  ROUND_ROBIN: 'round_robin'
};

const CreateTournamentModal = ({ isOpen, onClose, onSuccess, leagueId }) => {
  const { user } = useAuth();
  const toast = useToast();
  
  // If no leagueId is provided, close the modal and show an error
  useEffect(() => {
    if (isOpen && !leagueId) {
      toast({
        title: 'Error',
        description: 'No league selected. Please create or select a league first.',
        status: 'error',
        duration: 5000,
      });
      onClose();
    }
  }, [isOpen, leagueId, toast, onClose]);

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    type: TOURNAMENT_TYPES.SINGLE_ELIMINATION,
    maxTeams: 8,
    description: '',
    isLoading: false,
    errors: {}
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Tournament name is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errors.endDate = 'End date must be after start date';
    }
    if (formData.maxTeams < 2) errors.maxTeams = 'Minimum 2 teams required';
    if (formData.maxTeams > 64) errors.maxTeams = 'Maximum 64 teams allowed';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormData(prev => ({ ...prev, errors }));
      return;
    }

    setFormData(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert([{
          name: formData.name,
          start_date: formData.startDate,
          end_date: formData.endDate,
          tournament_type: formData.type,
          max_teams: formData.maxTeams,
          description: formData.description,
          league_id: leagueId,
          created_by: user.id,
          status: 'pending' // pending, active, completed, cancelled
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Tournament created successfully',
        status: 'success',
        duration: 3000,
      });

      if (onSuccess) onSuccess(data);
      handleClose();
    } catch (error) {
      toast({
        title: 'Error creating tournament',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setFormData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      type: TOURNAMENT_TYPES.SINGLE_ELIMINATION,
      maxTeams: 8,
      description: '',
      isLoading: false,
      errors: {}
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Tournament</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isInvalid={!!formData.errors.name}>
              <FormLabel>Tournament Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value,
                  errors: { ...prev.errors, name: null }
                }))}
                placeholder="Enter tournament name"
              />
              <FormErrorMessage>{formData.errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Tournament Type</FormLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  type: e.target.value
                }))}
              >
                <option value={TOURNAMENT_TYPES.SINGLE_ELIMINATION}>Single Elimination</option>
                <option value={TOURNAMENT_TYPES.DOUBLE_ELIMINATION}>Double Elimination</option>
                <option value={TOURNAMENT_TYPES.ROUND_ROBIN}>Round Robin</option>
              </Select>
            </FormControl>

            <FormControl isInvalid={!!formData.errors.maxTeams}>
              <FormLabel>Maximum Teams</FormLabel>
              <NumberInput
                value={formData.maxTeams}
                onChange={(valueString) => setFormData(prev => ({
                  ...prev,
                  maxTeams: parseInt(valueString),
                  errors: { ...prev.errors, maxTeams: null }
                }))}
                min={2}
                max={64}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formData.errors.maxTeams}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!formData.errors.startDate}>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  startDate: e.target.value,
                  errors: { ...prev.errors, startDate: null }
                }))}
              />
              <FormErrorMessage>{formData.errors.startDate}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!formData.errors.endDate}>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  endDate: e.target.value,
                  errors: { ...prev.errors, endDate: null }
                }))}
              />
              <FormErrorMessage>{formData.errors.endDate}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Description (Optional)</FormLabel>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Enter tournament description"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSubmit}
            isLoading={formData.isLoading}
          >
            Create Tournament
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

CreateTournamentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  leagueId: PropTypes.string.isRequired
};

export default CreateTournamentModal;