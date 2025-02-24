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
  Box,
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
      size="full"
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent 
        maxH="90vh"
        bg="#7C866B"
        my="5vh"
      >
        <ModalHeader 
          color="black"
          textAlign="center"
        >
          Manual Score Entry
        </ModalHeader>
        <ModalBody 
          p={6} 
          overflow="auto"
        >
          <ComparisonView 
            originalImage={originalImage}
            digitalScoreSheet={
              <Box
                bg="white"
                p={6}
                borderRadius="lg"
                boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
              >
                <DigitalScoreSheet 
                  data={scoreSheetData}
                  onDataChange={handleDataChange}
                  editable={true}
                />
              </Box>
            }
          />
        </ModalBody>
        <ModalFooter
          display="flex"
          justifyContent="center"
          gap={3}
        >
          <Button
            bg="#545e46"
            color="#EFF7EC"
            _hover={{ bg: "#3a4531" }}
            onClick={handleSave}
            isLoading={isSubmitting}
          >
            Save
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ManualEntryModal;
