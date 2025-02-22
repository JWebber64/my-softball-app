import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
} from '@chakra-ui/react';

const SubstitutionsModal = ({ isOpen, onClose, onSubmit }) => {
  const [substitution, setSubstitution] = useState({
    inning: '',
    outPlayer: '',
    inPlayer: '',
    position: ''
  });

  const positions = [
    'P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH', 'EH'
  ];

  const handleSubmit = () => {
    if (substitution.inning && substitution.outPlayer && substitution.inPlayer && substitution.position) {
      onSubmit(substitution);
      setSubstitution({
        inning: '',
        outPlayer: '',
        inPlayer: '',
        position: ''
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
              <Input
                type="number"
                min="1"
                value={substitution.inning}
                onChange={(e) => setSubstitution({
                  ...substitution,
                  inning: e.target.value
                })}
              />
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

            <FormControl isRequired>
              <FormLabel>Position</FormLabel>
              <Select
                value={substitution.position}
                onChange={(e) => setSubstitution({
                  ...substitution,
                  position: e.target.value
                })}
              >
                <option value="">Select position</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </Select>
            </FormControl>
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
