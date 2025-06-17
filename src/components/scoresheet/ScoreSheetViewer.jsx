import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Center,
  Container,
  Heading,
  HStack,
  IconButton,
  Image,
  Text,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { IMAGES } from '../../constants/paths';
import { scoreSheetOperations } from '../../lib/scoreSheetOperations';
import ComparisonView from './ComparisonView';
import DigitalScoreSheet from './DigitalScoreSheet';
import ImageViewer from './ImageViewer';
import ViewControls from './ViewControls';

const ScoreSheetViewer = ({ 
  scoreSheet = null, 
  canEdit = false, 
  viewMode = 'side-by-side',
  onViewModeChange,
  onGameChange,
  adjacentGames,
  totalGames,
  sheetType,
  onSelectMethod,
  onSaveComplete,
  onDelete,
  onReset
}) => {
  const [digitalData, setDigitalData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const { isOpen: isDeleteAlertOpen, onOpen: openDeleteAlert, onClose: closeDeleteAlert } = useDisclosure();
  const { isOpen: isResetAlertOpen, onOpen: openResetAlert, onClose: closeResetAlert } = useDisclosure();
  const cancelRef = useRef();
  
  const handleDigitalDataChange = (newData) => {
    setDigitalData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  const handleSaveDigitalData = async () => {
    if (!scoreSheet || !scoreSheet.id) return;
    
    try {
      setIsSaving(true);
      await scoreSheetOperations.saveDigitalScoreSheet(scoreSheet.id, digitalData);
      
      toast({
        title: "Score sheet saved",
        description: "Digital score sheet data has been saved and stats updated.",
        status: "success",
        duration: 3000,
      });
      
      // Notify parent component that save is complete
      if (onSaveComplete) {
        onSaveComplete();
      }
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

  const handleDeleteScoreSheet = async () => {
    if (!scoreSheet || !scoreSheet.id) return;
    
    try {
      await scoreSheetOperations.deleteScoreSheet(scoreSheet.id);
      
      toast({
        title: "Score sheet deleted",
        description: "The score sheet has been permanently deleted.",
        status: "success",
        duration: 3000,
      });
      
      // Notify parent component
      if (onDelete) {
        onDelete(scoreSheet.id);
      }
      
      closeDeleteAlert();
    } catch (error) {
      console.error('Error deleting score sheet:', error);
      toast({
        title: "Error deleting score sheet",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };
  
  const handleResetDigitalData = async () => {
    if (!scoreSheet || !scoreSheet.id) return;
    
    try {
      await scoreSheetOperations.resetDigitalData(scoreSheet.id);
      
      toast({
        title: "Digital data reset",
        description: "The digital score sheet data has been reset.",
        status: "success",
        duration: 3000,
      });
      
      // Notify parent component
      if (onReset) {
        onReset(scoreSheet.id);
      }
      
      closeResetAlert();
    } catch (error) {
      console.error('Error resetting digital data:', error);
      toast({
        title: "Error resetting data",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleEdit = () => {
    if (sheetType === 'digital') {
      openResetAlert();
    } else {
      // For uploaded sheets, you might want to open a different modal
      // or navigate to an edit page
      toast({
        title: "Edit Original Sheet",
        description: "This feature is not yet implemented. You can delete and re-upload the sheet.",
        status: "info",
        duration: 3000,
      });
    }
  };
  
  const handleDelete = () => {
    openDeleteAlert();
  };

  const renderScoreSheetView = () => {
    if (!scoreSheet) {
      return (
        <Center height="100%">
          <Text>No score sheet uploaded</Text>
        </Center>
      );
    }

    // Handle different view modes
    if (viewMode === 'digital-only') {
      return (
        <Box width="100%" height="calc(100% - 50px)">
          <Box 
            bg="var(--app-surface)" 
            p={4} 
            borderRadius="md" 
            boxShadow="sm"
            mb={4}
          >
            <Heading size="md" color="var(--app-text)">Digital Scoresheet</Heading>
          </Box>
          <DigitalScoreSheet 
            data={digitalData} 
            onChange={handleDigitalDataChange}
            canEdit={canEdit && viewMode === 'edit'}
          />
          {renderSaveButton()}
        </Box>
      );
    } else if (viewMode === 'image-only') {
      return (
        <Box width="100%" height="calc(100% - 50px)">
          <Box 
            bg="var(--app-surface)" 
            p={4} 
            borderRadius="md" 
            boxShadow="sm"
            mb={4}
          >
            <Heading size="md" color="var(--app-text)">Original Scoresheet</Heading>
          </Box>
          <ImageViewer 
            scoresheetUrl={scoreSheet.file_url || scoreSheet.image_url} 
            scoreSheet={scoreSheet}
            viewMode="single"
            gameNumber={scoreSheet.game_number}
          />
        </Box>
      );
    } else {
      return (
        <Box width="100%" height="calc(100% - 50px)">
          <ComparisonView
            scoreSheet={scoreSheet}
            digitalData={digitalData}
            onDigitalDataChange={handleDigitalDataChange}
            viewMode={viewMode}
            canEdit={canEdit && viewMode === 'edit'}
          />
          {renderSaveButton()}
        </Box>
      );
    }
  };

  const renderSaveButton = () => {
    if (!canEdit) return null;
    
    return (
      <Center mt={4} mb={4}>
        <Button
          variant="primary"
          className="app-gradient"
          isLoading={isSaving}
          onClick={handleSaveDigitalData}
        >
          Save Digital Score Sheet
        </Button>
      </Center>
    );
  };

  return (
    <>
      <Container maxW="container.xl" h="calc(100vh - 100px)" p={0}>
        {/* Main Content */}
        <HStack spacing={4} h="100%" alignItems="stretch">
          {/* Left Side - Original Image */}
          <Box flex="1" bg="var(--app-surface)" borderRadius="lg" overflow="hidden" borderWidth="1px" borderColor="var(--app-border)">
            <VStack spacing={0} height="100%">
              <Heading size="md" p={2} textAlign="center" width="100%" bg="var(--app-surface)" color="var(--app-text)">
                Original Score Sheet
              </Heading>
              
              {/* Navigation controls */}
              {scoreSheet && (
                <Box width="100%" p={2} borderBottom="1px" borderColor="var(--app-border)">
                  <HStack justifyContent="space-between">
                    <HStack>
                      <Button
                        size="sm"
                        isDisabled={!adjacentGames?.prev}
                        onClick={() => onGameChange(adjacentGames.prev)}
                      >
                        Previous
                      </Button>
                      <Text>
                        Game {scoreSheet.game_number} of {totalGames}
                      </Text>
                      <Button
                        size="sm"
                        isDisabled={!adjacentGames?.next}
                        onClick={() => onGameChange(adjacentGames.next)}
                      >
                        Next
                      </Button>
                    </HStack>
                    
                    <HStack>
                      <ViewControls 
                        viewMode={viewMode} 
                        onViewModeChange={onViewModeChange} 
                      />
                      
                      <IconButton
                        icon={<FaTrash />}
                        size="sm"
                        variant="danger"
                        bg="var(--button-delete)"
                        color="var(--app-text)"
                        _hover={{ bg: "var(--button-delete-hover)" }}
                        onClick={handleDelete}
                        aria-label="Delete sheet"
                      />
                    </HStack>
                  </HStack>
                </Box>
              )}
              
              <Box flex="1" borderRadius="md" p={2} height="calc(100% - 80px)">
                {scoreSheet ? (
                  <ImageViewer 
                    scoresheetUrl={scoreSheet.file_url || scoreSheet.image_url} 
                    scoreSheet={scoreSheet}
                    viewMode="single"
                    gameNumber={scoreSheet.game_number}
                  />
                ) : (
                  <Image 
                    src={IMAGES.EMPTY_SCORESHEET} 
                    alt="No score sheet" 
                    maxHeight="100%" 
                    mx="auto"
                  />
                )}
              </Box>
            </VStack>
          </Box>
        
          {/* Right Side - Digital Score Sheet */}
          <Box 
            flex="1" 
            className="digital-scoresheet-container"
            bg="var(--app-surface)" 
            borderRadius="lg" 
            overflow="hidden" 
            borderWidth="1px" 
            borderColor="var(--app-border)"
            position="relative"
            zIndex="1"
          >
            <VStack spacing={0} height="100%" className="digital-scoresheet-stack">
              <Heading 
                size="md" 
                p={2} 
                textAlign="center" 
                width="100%" 
                bg="var(--app-surface)"
                color="var(--app-text)"
                position="relative"
                zIndex="2"
              >
                Digital Score Sheet
              </Heading>
              
              {/* Navigation Controls for Digital Sheet */}
              {scoreSheet && (
                <Box width="100%" p={2} bg="var(--app-surface)">
                  <HStack justifyContent="space-between">
                    <HStack>
                      <Button
                        variant="primary"
                        className="app-gradient"
                        size="sm"
                        onClick={() => onGameChange(adjacentGames.prev)}
                        isDisabled={!adjacentGames.prev}
                      >
                        Previous
                      </Button>
                      <Text color="var(--app-text)">Game:</Text>
                      <Text color="var(--app-text)" fontWeight="bold" width="2rem" textAlign="center">
                        {scoreSheet?.game_number || 0}
                      </Text>
                      <Button
                        variant="primary"
                        className="app-gradient"
                        size="sm"
                        onClick={() => onGameChange(adjacentGames.next)}
                        isDisabled={!adjacentGames.next}
                      >
                        Next
                      </Button>
                    </HStack>
                    
                    <HStack>
                      <IconButton
                        icon={<FaEdit />}
                        size="sm"
                        className="app-gradient"
                        color="brand.text.primary"
                        _hover={{ opacity: 0.9 }}
                        onClick={handleEdit}
                        aria-label="Edit sheet"
                      />
                      
                      <IconButton
                        icon={<FaTrash />}
                        size="sm"
                        variant="danger"
                        bg="var(--button-delete)"
                        color="var(--app-text)"
                        _hover={{ bg: "var(--button-delete-hover)" }}
                        onClick={handleDelete}
                        aria-label="Delete sheet"
                      />
                    </HStack>
                  </HStack>
                </Box>
              )}
              
              {renderScoreSheetView()}
            </VStack>
          </Box>
        </HStack>
      </Container>

      {/* Alert Dialogs */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDeleteAlert}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Score Sheet
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This will permanently delete this score sheet and all associated data.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeDeleteAlert}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteScoreSheet} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isResetAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeResetAlert}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Reset Digital Data
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This will reset all digital data for this score sheet.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeResetAlert}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleResetDigitalData} ml={3}>
                Reset
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

ScoreSheetViewer.propTypes = {
  scoreSheet: PropTypes.shape({
    id: PropTypes.string,
    game_number: PropTypes.number,
    game_date: PropTypes.string,
    opponent_name: PropTypes.string,
    file_url: PropTypes.string,
    final_score: PropTypes.shape({
      us: PropTypes.number,
      them: PropTypes.number
    })
  }),
  canEdit: PropTypes.bool,
  viewMode: PropTypes.oneOf(['side-by-side', 'overlay', 'image-only']),
  onViewModeChange: PropTypes.func,
  onGameChange: PropTypes.func,
  adjacentGames: PropTypes.object,
  totalGames: PropTypes.number,
  sheetType: PropTypes.oneOf(['uploaded', 'digital']),
  onSelectMethod: PropTypes.func,
  onSaveComplete: PropTypes.func,
  onDelete: PropTypes.func,
  onReset: PropTypes.func
};

export default ScoreSheetViewer;






























































