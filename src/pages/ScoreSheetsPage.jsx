
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { FaCamera, FaFileUpload, FaKeyboard, FaMicrophone, FaRobot } from 'react-icons/fa';
import GradientIcon from '../components/common/GradientIcon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ManualInputModal from '../components/scoresheet/ManualInputModal';
import ScoreSheetScanner from '../components/scoresheet/ScoreSheetScanner';
import ScoreSheetUploadModal from '../components/scoresheet/ScoreSheetUploadModal';
import ScoreSheetViewer from '../components/scoresheet/ScoreSheetViewer';
import VoiceInputModal from '../components/scoresheet/VoiceInputModal';
import { MEDIA_CONFIG } from '../config';
import { useScoreSheets } from '../hooks/useScoreSheets';
import { useTeam } from '../hooks/useTeam';
import { useTeamAccess } from '../hooks/useTeamAccess';
import { scoreSheetOperations } from '../lib/scoreSheetOperations';

const ScoreSheetsPage = () => {
  const { team, loading: teamLoading, error: teamError } = useTeam();
  const { isAdmin } = useTeamAccess();
  const [viewMode, setViewMode] = useState('side-by-side');
  const fileInputRef = useRef(null);
  const toast = useToast();
  const [activeView, setActiveView] = useState('uploaded');
  const { isOpen: isScannerOpen, onOpen: openScanner, onClose: closeScanner } = useDisclosure();
  const { isOpen: isScoreSheetModalOpen, onOpen: openScoreSheetModal, onClose: closeScoreSheetModal } = useDisclosure();
  const { isOpen: isUploadModalOpen, onOpen: openUploadModal, onClose: closeUploadModal } = useDisclosure();
  const { isOpen: isVoiceModalOpen, onOpen: openVoiceModal, onClose: closeVoiceModal } = useDisclosure();
  const { isOpen: isManualModalOpen, onOpen: openManualModal, onClose: closeManualModal } = useDisclosure();
  const [uploadedScoreSheet, setUploadedScoreSheet] = useState(null);
  const [digitalData, setDigitalData] = useState({});

  // Add OCR scanner modal disclosure
  const { 
    isOpen: isOcrScannerOpen, 
    onOpen: openOcrScanner, 
    onClose: closeOcrScanner 
  } = useDisclosure();

  useEffect(() => {
    // Only show the warning if we're done loading and there's no team
    if (!teamLoading && !team?.id) {
      toast({
        title: "No Team Selected",
        description: "Please select a team to view and upload scoresheets.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [team?.id, teamLoading, toast]);

  const handleMethodSelect = (method) => {
    if (method === 'upload') {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else if (method === 'scan') {
      openScanner();
    } else if (method === 'ocr') {
      openOcrScanner();
    } else if (method === 'voice') {
      openVoiceModal();
    } else if (method === 'manual') {
      openManualModal();
    } else {
      toast({
        title: "Feature not available",
        description: `The ${method} method is not yet implemented.`,
        status: "info",
        duration: 3000,
      });
    }
  };

  const handleScanComplete = (scoreSheetData) => {
    console.log('Scan completed:', scoreSheetData);
    toast({
      title: 'Scan Complete',
      description: 'Score sheet has been successfully processed.',
      status: 'success',
      duration: 3000,
    });
    
    // Refresh the scoresheet list to show the newly scanned sheet
    refresh();
    
    // Close the scanner
    closeScanner();
  };

  const handleOcrScanComplete = (scoreSheetData) => {
    console.log('OCR scan completed:', scoreSheetData);
    toast({
      title: 'OCR Scan Complete',
      description: 'Score sheet has been successfully processed with OCR.',
      status: 'success',
      duration: 3000,
    });
    
    // Refresh the scoresheet list to show the newly scanned sheet
    refresh();
    
    // Close the scanner
    closeOcrScanner();
  };

  const handleUploadScoreSheet = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      if (!team?.id) {
        toast({
          title: "Error",
          description: "No team selected. Please select a team first.",
          status: "error",
          duration: 3000,
        });
        return;
      }
      
      // Check file type
      const fileType = file.type;
      if (!MEDIA_CONFIG.ALLOWED_TYPES.SCORESHEETS.includes(fileType)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid scoresheet file type.",
          status: "error",
          duration: 3000,
        });
        return;
      }
      
      // Show loading toast
      const loadingToastId = toast({
        title: "Uploading scoresheet",
        description: "Please wait while your file is being uploaded...",
        status: "loading",
        duration: null,
      });
      
      try {
        // Use the existing utility function to handle the upload
        const data = await scoreSheetOperations.uploadScoreSheet(file, team.id);
        
        // Close loading toast
        toast.close(loadingToastId);
        
        toast({
          title: "Scoresheet uploaded",
          description: "Your scoresheet has been uploaded successfully.",
          status: "success",
          duration: 3000,
        });
        
        // Set the uploaded scoresheet and open the modal
        setUploadedScoreSheet(data);
        setDigitalData({}); // Reset digital data
        openUploadModal();
        
      } catch (error) {
        // Close loading toast if it exists
        if (loadingToastId) toast.close(loadingToastId);
        
        console.error('Error uploading scoresheet:', error);
        toast({
          title: "Upload failed",
          description: error.message || "Network error occurred during upload. Please try again.",
          status: "error",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        status: "error",
        duration: 5000,
      });
    }
  };

  // Handle save completion
  const handleSaveComplete = (scoreSheetId, digitalData) => {
    // Refresh your views or navigate as needed
    refreshScoreSheets();
    
    // Navigate to the appropriate view if needed
    setActiveView('digital');
    navigateToDigitalGame(scoreSheetId);
  };

  // Handle score sheet deletion
  const handleScoreSheetDelete = (scoreSheetId) => {
    // Refresh the score sheets list
    refresh();
    refreshDigital();
    
    // Navigate to another game if available, or just refresh the view
    if (activeView === 'uploaded' && scoreSheets.length > 1) {
      navigateToGame(scoreSheets[0].id);
    } else if (activeView === 'digital' && digitalScoreSheets.length > 1) {
      navigateToDigitalGame(digitalScoreSheets[0].id);
    } else {
      // If no more score sheets, reset the view
      setActiveView('uploaded');
    }
    
    toast({
      title: "Score sheet deleted",
      description: "The score sheet has been removed from your team.",
      status: "success",
      duration: 3000,
    });
  };

  // Handle digital data reset
  const handleDigitalDataReset = (scoreSheetId) => {
    // Refresh the score sheets
    refresh();
    refreshDigital();
    
    toast({
      title: "Digital data reset",
      description: "You can now re-enter the score sheet data.",
      status: "success",
      duration: 3000,
    });
  };

  const handleVoiceInput = async (transcript) => {
    try {
      if (!team?.id) {
        toast({
          title: "Error",
          description: "No team selected. Please select a team first.",
          status: "error",
          duration: 3000,
        });
        return;
      }

      // Show loading toast
      const loadingToastId = toast({
        title: "Processing voice input",
        description: "Please wait while your input is being processed...",
        status: "loading",
        duration: null,
      });

      try {
        // Create a new digital scoresheet from voice input
        const newScoreSheet = {
          gameInfo: {
            gameNumber: Date.now().toString(),
            gameDate: new Date().toISOString().split('T')[0],
            teamName: team.name || 'Team',
            opponentName: 'Voice Entry',
            location: 'Voice Input'
          },
          innings: [],
          notes: transcript,
          metadata: {
            source: 'voice',
            created_at: new Date().toISOString(),
            team_id: team.id
          }
        };

        // Save the digital scoresheet
        const savedSheet = await scoreSheetOperations.createDigitalScoreSheet(newScoreSheet, team.id);
        
        // Close loading toast
        toast.close(loadingToastId);
        
        toast({
          title: "Voice input saved",
          description: "Your voice input has been saved as a digital scoresheet.",
          status: "success",
          duration: 3000,
        });
        
        // Refresh and navigate to the new sheet
        refresh();
        refreshDigital();
        setActiveView('digital');
        navigateToDigitalGame(savedSheet.id);
        
      } catch (error) {
        // Close loading toast if it exists
        if (loadingToastId) toast.close(loadingToastId);
        
        console.error('Error processing voice input:', error);
        toast({
          title: "Processing failed",
          description: error.message || "Error occurred during processing. Please try again.",
          status: "error",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleManualInput = async (scoreSheetData) => {
    try {
      if (!team?.id) {
        toast({
          title: "Error",
          description: "No team selected. Please select a team first.",
          status: "error",
          duration: 3000,
        });
        return;
      }

      // Show loading toast
      const loadingToastId = toast({
        title: "Saving manual entry",
        description: "Please wait while your scoresheet is being saved...",
        status: "loading",
        duration: null,
      });

      try {
        // Add team ID and metadata
        const dataWithMetadata = {
          ...scoreSheetData,
          metadata: {
            ...scoreSheetData.metadata,
            source: 'manual',
            created_at: new Date().toISOString(),
            team_id: team.id
          }
        };

        // Save the digital scoresheet
        const savedSheet = await scoreSheetOperations.createDigitalScoreSheet(dataWithMetadata, team.id);
        
        // Close loading toast
        toast.close(loadingToastId);
        
        toast({
          title: "Scoresheet saved",
          description: "Your manual entry has been saved successfully.",
          status: "success",
          duration: 3000,
        });
        
        // Refresh and navigate to the new sheet
        refresh();
        refreshDigital();
        setActiveView('digital');
        navigateToDigitalGame(savedSheet.id);
        
      } catch (error) {
        // Close loading toast if it exists
        if (loadingToastId) toast.close(loadingToastId);
        
        console.error('Error saving manual entry:', error);
        toast({
          title: "Save failed",
          description: error.message || "Error occurred during save. Please try again.",
          status: "error",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        status: "error",
        duration: 5000,
      });
    }
  };

  // For uploaded scoresheets
  const {
    scoreSheets,
    currentSheet,
    isLoading,
    error,
    navigateToGame,
    getAdjacentGames,
    refresh,
    totalGames,
  } = useScoreSheets(team?.id, 'uploaded');

  // For digital scoresheets
  const {
    scoreSheets: digitalScoreSheets,
    currentSheet: currentDigitalSheet,
    isLoading: isDigitalLoading,
    error: digitalError,
    navigateToGame: navigateToDigitalGame,
    getAdjacentGames: getDigitalAdjacentGames,
    refresh: refreshDigital,
    totalGames: totalDigitalGames,
  } = useScoreSheets(team?.id, 'digital');

  if (isLoading || isDigitalLoading) {
    return <LoadingSpinner />;
  }

  if (error && digitalError) {
    return <Box>Error loading score sheets: {error || digitalError}</Box>;
  }

  return (
    <>
      <Box minH="100vh" bg="brand.background">
        {/* Debug info - only visible when needed */}
        {process.env.NODE_ENV === 'development' && false && (
          <Box p={2} bg="gray.100" mb={4}>
            <Text fontSize="sm">Team Status: {teamLoading ? 'Loading...' : (team?.id ? `Team: ${team.name} (${team.id})` : 'No team selected')}</Text>
            {teamError && <Text color="red.500" fontSize="sm">Error: {teamError}</Text>}
          </Box>
        )}
        
        <Box p={6} maxWidth="1400px" mx="auto">
          <VStack spacing={6} align="stretch" width="100%">
            <Heading as="h1" size="xl" mb={2} color="var(--app-text)">
              Score Sheets
            </Heading>
            
            {/* Removing the "View and manage your team's score sheets" text */}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadScoreSheet}
              style={{ display: 'none' }}
              accept={MEDIA_CONFIG.ALLOWED_TYPES.SCORESHEETS.join(',')}
            />

            {/* Method Selection Cards - exactly 4 cards in a grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6} width="100%" mb={8}>
              {/* Scan Card */}
              <Box
                bg="var(--app-surface)"
                p={6}
                borderRadius="lg"
                boxShadow="md"
                cursor="pointer"
                onClick={() => handleMethodSelect('scan')}
                _hover={{ transform: 'translateY(-2px)', transition: '0.2s' }}
                width={{ base: "100%", md: "100%", lg: "100%" }}
              >
                <VStack spacing={4} align="center">
                  <GradientIcon icon={FaCamera} />
                  <Heading size="md" color="var(--app-text)" textAlign="center">
                    Scan Scoresheet
                  </Heading>
                  <Text color="var(--app-text)" textAlign="center">
                    Use camera to capture scoresheet image
                  </Text>
                </VStack>
              </Box>

              {/* OCR Scan Card - New */}
              <Box
                bg="var(--app-surface)"
                p={6}
                borderRadius="lg"
                boxShadow="md"
                cursor="pointer"
                onClick={() => handleMethodSelect('ocr')}
                _hover={{ transform: 'translateY(-2px)', transition: '0.2s' }}
                width={{ base: "100%", md: "100%", lg: "100%" }}
              >
                <VStack spacing={4} align="center">
                  <GradientIcon icon={FaRobot} />
                  <Heading size="md" color="var(--app-text)" textAlign="center">
                    Scan with OCR
                  </Heading>
                  <Text color="var(--app-text)" textAlign="center">
                    Automatically extract data from scoresheet
                  </Text>
                </VStack>
              </Box>

              {/* Upload Card */}
              <Box
                bg="var(--app-surface)"
                p={6}
                borderRadius="lg"
                boxShadow="md"
                cursor="pointer"
                onClick={() => handleMethodSelect('upload')}
                _hover={{ transform: 'translateY(-2px)', transition: '0.2s' }}
                width={{ base: "100%", md: "100%", lg: "100%" }}
              >
                <VStack spacing={4} align="center">
                  <GradientIcon icon={FaFileUpload} />
                  <Heading size="md" color="var(--app-text)" textAlign="center">
                    Upload Scoresheet
                  </Heading>
                  <Text color="var(--app-text)" textAlign="center">
                    Upload existing scoresheet file
                  </Text>
                </VStack>
              </Box>
              
              {/* Voice Card */}
              <Box
                bg="var(--app-surface)"
                p={6}
                borderRadius="lg"
                boxShadow="md"
                cursor="pointer"
                onClick={() => handleMethodSelect('voice')}
                _hover={{ transform: 'translateY(-2px)', transition: '0.2s' }}
                width={{ base: "100%", md: "100%", lg: "100%" }}
              >
                <VStack spacing={4} align="center">
                  <GradientIcon icon={FaMicrophone} />
                  <Heading size="md" color="var(--app-text)" textAlign="center">
                    Voice Input
                  </Heading>
                  <Text color="var(--app-text)" textAlign="center">
                    Record game stats using voice commands
                  </Text>
                </VStack>
              </Box>

              {/* Manual Card */}
              <Box
                bg="var(--app-surface)"
                p={6}
                borderRadius="lg"
                boxShadow="md"
                cursor="pointer"
                onClick={() => handleMethodSelect('manual')}
                _hover={{ transform: 'translateY(-2px)', transition: '0.2s' }}
                width={{ base: "100%", md: "100%", lg: "100%" }}
              >
                <VStack spacing={4} align="center">
                  <GradientIcon icon={FaKeyboard} />
                  <Heading size="md" color="var(--app-text)" textAlign="center">
                    Manual Entry
                  </Heading>
                  <Text color="var(--app-text)" textAlign="center">
                    Enter game stats manually
                  </Text>
                </VStack>
              </Box>
            </SimpleGrid>

            {/* Score Sheet Scanner Modal */}
            <ScoreSheetScanner
              isOpen={isScannerOpen}
              onClose={closeScanner}
              onScanComplete={handleScanComplete}
              onSave={handleScanComplete}
            />

            {/* OCR Score Sheet Scanner Modal */}
            <ScoreSheetScanner
              isOpen={isOcrScannerOpen}
              onClose={closeOcrScanner}
              onScanComplete={handleOcrScanComplete}
              onSave={handleOcrScanComplete}
              useOcr={true}
            />

            {/* Score Sheet Viewer - Pass onSelectMethod={null} to prevent duplicate method cards */}
            {activeView === 'uploaded' ? (
              <ScoreSheetViewer
                scoreSheet={currentSheet}
                canEdit={isAdmin}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onGameChange={navigateToGame}
                adjacentGames={getAdjacentGames()}
                totalGames={totalGames}
                sheetType="uploaded"
                onSelectMethod={null}
                onDelete={handleScoreSheetDelete}
                onReset={handleDigitalDataReset}
              />
            ) : (
              <ScoreSheetViewer
                scoreSheet={currentDigitalSheet}
                canEdit={isAdmin}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onGameChange={navigateToDigitalGame}
                adjacentGames={getDigitalAdjacentGames()}
                totalGames={totalDigitalGames}
                sheetType="digital"
                onSelectMethod={null}
                onDelete={handleScoreSheetDelete}
                onReset={handleDigitalDataReset}
              />
            )}
          </VStack>
        </Box>
      </Box>
      {/* Upload Modal */}
      <ScoreSheetUploadModal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        uploadedScoreSheet={uploadedScoreSheet}
        onSaveComplete={handleSaveComplete}
      />
      {/* Voice Input Modal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={closeVoiceModal}
        onSave={handleVoiceInput}
      />
      {/* Manual Input Modal */}
      <ManualInputModal
        isOpen={isManualModalOpen}
        onClose={closeManualModal}
        onSave={handleManualInput}
      />
    </>
  );
};

export default ScoreSheetsPage;
