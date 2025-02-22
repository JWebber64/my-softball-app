import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  useToast,
} from '@chakra-ui/react';
import DigitalScoreSheet from './DigitalScoreSheet';
import ComparisonView from './ComparisonView';
import { scoreSheetOperations } from '../../lib/scoreSheetOperations';

const ManualEntryModal = ({ isOpen, onClose, originalImage }) => {
  const [scoreSheetData, setScoreSheetData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleDataChange = (newData) => {
    setScoreSheetData(newData);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const gameNumber = scoreSheetData.gameInfo?.gameNumber;
      if (!gameNumber) {
        throw new Error('Game number is required');
      }

      await scoreSheetOperations.createScoreSheet({
        gameNumber,
        gameDate: scoreSheetData.gameInfo?.date,
        gameTime: scoreSheetData.gameInfo?.time,
        field: scoreSheetData.gameInfo?.field,
        opponent: scoreSheetData.teams?.away,
        isHomeTeam: true,
        lineup: scoreSheetData.lineup,
        final_score: {
          us: scoreSheetData.score?.home,
          them: scoreSheetData.score?.away
        }
      });
      
      toast({
        title: 'Success',
        description: 'Score sheet saved successfully',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      console.error('Error saving scoresheet:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save score sheet',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="2xl"
      isCentered
    >
      <ModalOverlay />
      <ModalContent maxH="70vh">
        <ModalHeader>Manual Score Entry</ModalHeader>
        <ModalCloseButton />
        <ModalBody p={2} overflow="hidden">
          <ComparisonView 
            originalImage={originalImage}
            digitalScoreSheet={
              <DigitalScoreSheet 
                data={scoreSheetData}
                onDataChange={handleDataChange}
              />
            }
          />
        </ModalBody>
        <ModalFooter>
          <Button 
            colorScheme="blue" 
            mr={3} 
            onClick={handleSave}
            isLoading={isSubmitting}
          >
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ManualEntryModal;
