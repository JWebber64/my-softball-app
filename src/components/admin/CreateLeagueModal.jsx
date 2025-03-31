import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    VStack,
    useToast
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const CreateLeagueModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    season: '',
    startDate: '',
    endDate: '',
    isLoading: false
  });

  const handleSubmit = async () => {
    try {
      setFormData(prev => ({ ...prev, isLoading: true }));
      
      const { data, error } = await supabase
        .from('leagues')
        .insert([{
          name: formData.name,
          season: formData.season,
          start_date: formData.startDate,
          end_date: formData.endDate
        }])
        .select()
        .single();

      if (error) throw error;

      onSuccess(data);
      onClose();
      
      toast({
        title: 'League created successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error creating league',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setFormData(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New League</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>League Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Season</FormLabel>
              <Input
                value={formData.season}
                onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={formData.isLoading}
          >
            Create League
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

CreateLeagueModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default CreateLeagueModal;
