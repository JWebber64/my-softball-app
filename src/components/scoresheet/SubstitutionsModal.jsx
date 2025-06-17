import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  VStack,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';

const SubstitutionsModal = ({
  isOpen,
  onClose,
  players,
  onSubstitutionChange,
  maxInnings,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [substituteName, setSubstituteName] = useState('');
  const [selectedInning, setSelectedInning] = useState('');

  const handlePlayerChange = (event) => {
    setSelectedPlayer(event.target.value);
  };

  const handleInningChange = (event) => {
    setSelectedInning(event.target.value);
  };

  const handleSubstituteNameChange = (event) => {
    setSubstituteName(event.target.value);
  };

  const handleSave = () => {
    if (selectedPlayer && selectedInning && onSubstitutionChange) {
      onSubstitutionChange(parseInt(selectedPlayer), parseInt(selectedInning) - 1); // Inning is 0-indexed
      onClose();
      setSelectedPlayer('');
      setSelectedInning('');
      setSubstituteName('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Enter Substitution</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Select
              placeholder="Select Player"
              onChange={handlePlayerChange}
              value={selectedPlayer}
            >
              {players.map((player, index) => (
                <option key={player.id} value={index}>
                  {player.name} - {player.position}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Substitute Name"
              onChange={handleSubstituteNameChange}
              value={substituteName}
            />
            <Select
              placeholder="Select Inning"
              onChange={handleInningChange}
              value={selectedInning}
            >
              {Array.from({ length: maxInnings }, (_, i) => i + 1).map(
                (inning) => (
                  <option key={inning} value={inning}>
                    {inning}
                  </option>
                )
              )}
            </Select>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

SubstitutionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      position: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  onSubstitutionChange: PropTypes.func.isRequired,
  maxInnings: PropTypes.number.isRequired,
};

export default SubstitutionsModal;
