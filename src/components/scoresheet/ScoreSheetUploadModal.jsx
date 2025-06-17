import {
  Box,
  Button,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  VStack
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { scoreSheetOperations } from '../../lib/scoreSheetOperations';
import DigitalScoreSheet from './DigitalScoreSheet';
import ImageViewer from './ImageViewer';

const ScoreSheetUploadModal = ({ 
  isOpen, 
  onClose, 
  uploadedScoreSheet, 
  onSaveComplete 
}) => {
  const [digitalData, setDigitalData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const handleDigitalDataChange = (newData) => {
    setDigitalData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  const handleSaveDigitalData = async () => {
    if (!uploadedScoreSheet || !uploadedScoreSheet.id) return;
    
    try {
      setIsSaving(true);
      await scoreSheetOperations.saveDigitalScoreSheet(uploadedScoreSheet.id, digitalData);
      
      toast({
        title: "Score sheet saved",
        description: "Digital score sheet data has been saved and stats updated.",
        status: "success",
        duration: 3000,
      });
      
      // Notify parent component that save is complete
      if (onSaveComplete) {
        onSaveComplete(uploadedScoreSheet.id, digitalData);
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error saving digital data:', error);
      toast({
        title: "Error saving score sheet",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="6xl"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader bg="var(--app-primary)" color="white">Enter Score Sheet Data</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody p={4}>
          <HStack spacing={4} align="stretch" height="100%">
            {/* Left Side - Original Image */}
            <Box flex="1" bg="var(--app-surface)" borderRadius="lg" overflow="hidden">
              <VStack spacing={0} height="100%">
                <Heading size="md" p={2} textAlign="center" width="100%" bg="var(--app-primary)" color="white">
                  Original Score Sheet
                </Heading>
                
                <Box flex="1" borderRadius="md" p={2} height="calc(100% - 40px)">
                  {uploadedScoreSheet && (
                    <ImageViewer 
                      scoresheetUrl={uploadedScoreSheet.file_url || uploadedScoreSheet.image_url} 
                      viewMode="single"
                      gameNumber={uploadedScoreSheet.game_number}
                    />
                  )}
                </Box>
              </VStack>
            </Box>

            {/* Right Side - Digital Score Sheet */}
            <Box 
              flex="1" 
              className="digital-scoresheet-container"
              bg="brand.scoresheet.background" 
              borderRadius="lg" 
              overflow="hidden"
              borderWidth="1px"
              borderColor="brand.scoresheet.border"
            >
              <VStack spacing={0} height="100%" className="digital-scoresheet-stack">
                <Heading 
                  size="md" 
                  p={2} 
                  textAlign="center" 
                  width="100%" 
                  className="digital-scoresheet-header"
                  bg="brand.scoresheet.headerBg" 
                  color="brand.scoresheet.text"
                >
                  Digital Score Sheet
                </Heading>
                
                <Box 
                  flex="1" 
                  p={2} 
                  width="100%" 
                  height="calc(100% - 40px)" 
                  overflowY="auto"
                  className="digital-scoresheet"
                  bg="brand.scoresheet.background"
                  color="brand.scoresheet.text"
                >
                  {/* This is the critical container for horizontal scrolling */}
                  <div style={{
                    width: "100%",
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch"
                  }}>
                    {/* Force minimum width to ensure horizontal scrolling */}
                    <div style={{ minWidth: "1200px" }}>
                      <DigitalScoreSheet 
                        data={digitalData} 
                        onDataChange={handleDigitalDataChange}
                        viewMode="edit"
                        canEdit={true}
                        showInningTotals={true}
                      />
                    </div>
                  </div>
                </Box>
              </VStack>
            </Box>
          </HStack>
        </ModalBody>
        <ModalFooter bg="var(--app-surface)">
          <Button 
            variant="primary"
            mr={3} 
            onClick={handleSaveDigitalData}
            isLoading={isSaving}
          >
            Save Digital Score Sheet
          </Button>
          <Button variant="cancel" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScoreSheetUploadModal;














