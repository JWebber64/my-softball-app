import React from 'react';
import PropTypes from 'prop-types';
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
  Select,
  VStack
} from '@chakra-ui/react';

const POSITIONS = [
  'Pitcher',
  'Catcher',
  'First Base',
  'Second Base',
  'Third Base',
  'Shortstop',
  'Left Field',
  'Center Field',
  'Right Field',
  'Designated Hitter'
];

const PlayerForm = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const [formData, setFormData] = React.useState({
    player_name: '',
    jersey_number: '',
    position: '',
    ...initialData
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {initialData.id ? 'Edit Player' : 'Add New Player'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="player_name"
                  value={formData.player_name}
                  onChange={handleChange}
                  placeholder="Player name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Jersey Number</FormLabel>
                <Input
                  name="jersey_number"
                  value={formData.jersey_number}
                  onChange={handleChange}
                  placeholder="Jersey number"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Position</FormLabel>
                <Select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Select position"
                >
                  {POSITIONS.map(pos => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              {initialData.id ? 'Save Changes' : 'Add Player'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

PlayerForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    id: PropTypes.string,
    player_name: PropTypes.string,
    jersey_number: PropTypes.string,
    position: PropTypes.string
  })
};

export default PlayerForm;