import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

SubstitutionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const SubstitutionsModal = ({ isOpen, onClose, onSubmit }) => {
  const [substitution, setSubstitution] = useState({
    inning: '',
    outPlayer: '',
    inPlayer: ''
  });

  // Generate innings 1-12 for the dropdown
  const innings = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleSubmit = () => {
    if (substitution.inning && substitution.outPlayer && substitution.inPlayer) {
      onSubmit(substitution);
      setSubstitution({
        inning: '',
        outPlayer: '',
        inPlayer: ''
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader borderBottom="1px solid" borderColor="gray.200">
          Player Substitution
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} py={2}>
            <FormControl isRequired>
              <FormLabel>Inning</FormLabel>
              <Select
                placeholder="Select inning"
                value={substitution.inning}
                onChange={(e) => setSubstitution({
                  ...substitution,
                  inning: e.target.value
                })}
              >
                {innings.map(inning => (
                  <option key={inning} value={inning}>
                    {inning}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <HStack width="100%" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Player Out</FormLabel>
                <Input
                  value={substitution.outPlayer}
                  onChange={(e) => setSubstitution({
                    ...substitution,
                    outPlayer: e.target.value
                  })}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Player In</FormLabel>
                <Input
                  value={substitution.inPlayer}
                  onChange={(e) => setSubstitution({
                    ...substitution,
                    inPlayer: e.target.value
                  })}
                />
              </FormControl>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="gray.200">
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Add Substitution
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SubstitutionsModal;
