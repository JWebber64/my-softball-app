import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import UniversalScoreSheet from './UniversalScoreSheet';

/**
 * ManualEntryModal - Consolidated modal for manual scoresheet data entry
 * 
 * This component replaces both ManualEntryModal and ManualInputModal
 */
const ManualEntryModal = ({
  isOpen,
  onClose,
  initialData = {},
  onSave,
  title = "Manual Score Entry",
  showMetadata = true,
  teamId = null,
  maxInnings = 7
}) => {
  const [scoreSheetData, setScoreSheetData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const handleDataChange = (newData) => {
    setScoreSheetData(newData);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(scoreSheetData);
      onClose();
    } catch (error) {
      console.error('Error saving scoresheet data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg="var(--app-surface)">
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box 
              width="100%" 
              height="calc(100vh - 200px)" 
              overflowY="auto"
              bg="brand.scoresheet.background"
              color="brand.scoresheet.text"
              borderRadius="md"
              p={2}
            >
              <UniversalScoreSheet
                data={scoreSheetData}
                onDataChange={handleDataChange}
                viewMode="edit"
                canEdit={true}
                showInningTotals={true}
                maxInnings={maxInnings}
                teamId={teamId}
                showMetadata={showMetadata}
              />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Score Sheet
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

ManualEntryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  title: PropTypes.string,
  showMetadata: PropTypes.bool,
  teamId: PropTypes.string,
  maxInnings: PropTypes.number
};

export default ManualEntryModal;



