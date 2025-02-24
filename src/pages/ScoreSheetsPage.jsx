import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  Button,
  useToast,
  Grid,
  Text,
  Progress,
  Image,
  useDisclosure,
  Heading,
  HStack,
} from '@chakra-ui/react';
import { FaCamera, FaUpload, FaMicrophone, FaKeyboard } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import ScoreSheetScanner from '../components/scoresheet/ScoreSheetScanner';
import DigitalScoreSheet from '../components/scoresheet/DigitalScoreSheet';
import ManualEntryModal from '../components/scoresheet/ManualEntryModal';
import ManualInputModal from '../components/scoresheet/ManualInputModal';
import { scoreSheetOperations } from '../lib/scoreSheetOperations';
import { OCRService } from '../services/ocrService';
import { EventMapper } from "../utils/eventMapper";

const sheetContainerStyles = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr', // Creates two equal columns
  gap: '2rem',
  width: '100%',
  maxWidth: '1800px', // Adjust based on your needs
  margin: '0 auto',
  padding: '1rem'
};

const sheetStyles = {
  width: '100%',
  maxHeight: '80vh',
  overflow: 'auto',
  padding: '1rem',
  borderRadius: '8px',
  backgroundColor: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const imageStyles = {
  maxWidth: '100%',
  height: 'auto',
  objectFit: 'contain'
};

const ScoreSheetsPage = () => {
  const [scoreSheetImage, setScoreSheetImage] = useState(null);
  const [scoreSheetData, setScoreSheetData] = useState({
    players: Array(11).fill().map(() => ({
      name: '',
      number: '',
      position: '',
      sub: { name: '', inning: '' },
      innings: Array(7).fill().map(() => ({
        event: '',
        outDetails: '',
        custom: ''
      }))
    })),
    gameInfo: {
      gameNumber: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      field: ''
    },
    teams: {
      home: '',
      away: ''
    }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef(null);
  const ocrService = useRef(new OCRService());
  const toast = useToast();
  const { isOpen: isManualEntryOpen, onOpen: onManualEntryOpen, onClose: onManualEntryClose } = useDisclosure();
  const [showManualEntry, setShowManualEntry] = useState(false);
  const { isOpen: isManualInputOpen, onOpen: onManualInputOpen, onClose: onManualInputClose } = useDisclosure();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const processImageWithOCR = async () => {
    if (!scoreSheetImage) {
      toast({
        title: 'No image to process',
        description: 'Please upload an image first',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);

      // Create an Image object from the scoreSheetImage URL
      const img = new window.Image();
      img.src = scoreSheetImage;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      // Process with OCR and enhance the data
      const { parsed: ocrData } = await ocrService.current.recognizeText(canvas);
      
      // Transform the OCR data into the format expected by DigitalScoreSheet
      const digitalSheetData = {
        players: ocrData.players.map(player => ({
          name: player.name,
          sub: player.sub,
          innings: player.innings.map(inning => {
            // Use EventMapper to convert each play
            const mappedEvent = EventMapper.mapOCRToDigitalEvent({
              event: inning.event,
              outDetails: inning.outDetails,
              custom: inning.custom
            });
            
            return mappedEvent || {
              event: '',
              outDetails: '',
              custom: ''
            };
          })
        }))
      };

      setScoreSheetData(digitalSheetData);
      
      console.log('Processed data:', digitalSheetData); // For debugging
      
      clearInterval(progressInterval);
      setProgress(100);

      toast({
        title: 'OCR Processing Complete',
        description: 'Score sheet has been processed successfully',
        status: 'success',
        duration: 3000,
      });

    } catch (error) {
      console.error('OCR processing error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process score sheet',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to upload score sheets',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create a temporary URL for the image immediately
      const imageUrl = URL.createObjectURL(file);
      setScoreSheetImage(imageUrl);

      // Generate game number
      const gameNumber = Date.now();

      // Set initial data and open modal immediately
      const initialScoreSheetData = {
        gameInfo: {
          gameNumber,
          date: new Date().toISOString().split('T')[0],
        },
      };
      setScoreSheetData(initialScoreSheetData);
      onManualEntryOpen();

      // Handle upload in the background
      scoreSheetOperations.uploadImage(gameNumber, file)
        .catch(uploadError => {
          console.warn('Image upload failed:', uploadError);
          // Don't block the UI for upload errors
        });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleScanComplete = (scannedData) => {
    setScoreSheetData(scannedData);
    setIsProcessing(false);
    setProgress(100);
  };

  const handleDataChange = (newData) => {
    setScoreSheetData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  // Add debug logging for render conditions
  console.log('Render state:', {
    hasImage: !!scoreSheetImage,
    hasData: !!scoreSheetData,
    isProcessing
  });

  // Add this useEffect to log state changes
  useEffect(() => {
    console.log('ScoreSheet Data Updated:', scoreSheetData);
  }, [scoreSheetData]);

  // Add this useEffect to log state changes
  useEffect(() => {
    console.log('showManualEntry changed:', showManualEntry);
  }, [showManualEntry]);

  const handleManualEntryClick = () => {
    // Clear any existing image
    setScoreSheetImage(null);
    // Initialize empty scoresheet data
    setScoreSheetData({
      players: Array(11).fill().map(() => ({
        name: '',
        number: '',
        position: '',
        sub: { name: '', inning: '' },
        innings: Array(7).fill().map(() => ({
          event: '',
          outDetails: '',
          custom: ''
        }))
      })),
      gameInfo: {
        gameNumber: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        field: ''
      },
      teams: {
        home: '',
        away: ''
      }
    });
  };

  return (
    <Box p={4}>
      {/* Input method buttons */}
      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={6}>
        <Button
          leftIcon={<FaCamera />}
          bg="#545e46"
          color="#EFF7EC"
          _hover={{ bg: "#3a4531" }}
          height="100px"
          onClick={() => setIsScannerOpen(true)}
          borderRadius="1rem"
        >
          <VStack>
            <Text>Scan Score Sheet</Text>
            <Text fontSize="sm">Use camera to capture</Text>
          </VStack>
        </Button>

        <Button
          leftIcon={<FaUpload />}
          bg="#545e46"
          color="#EFF7EC"
          _hover={{ bg: "#3a4531" }}
          height="100px"
          onClick={() => fileInputRef.current?.click()}
          borderRadius="1rem"
        >
          <VStack>
            <Text>Upload Score Sheet</Text>
            <Text fontSize="sm">Select image file</Text>
          </VStack>
        </Button>

        <Button
          leftIcon={<FaMicrophone />}
          bg="#545e46"
          color="#EFF7EC"
          _hover={{ bg: "#3a4531" }}
          height="100px"
          onClick={() => {
            toast({
              title: 'Voice input coming soon',
              status: 'info',
              duration: 3000,
            });
          }}
          borderRadius="1rem"
        >
          <VStack>
            <Text>Voice Input</Text>
            <Text fontSize="sm">Record game stats by voice</Text>
          </VStack>
        </Button>

        <Button
          leftIcon={<FaKeyboard />}
          bg="#545e46"
          color="#EFF7EC"
          _hover={{ bg: "#3a4531" }}
          height="100px"
          onClick={onManualInputOpen}
          borderRadius="1rem"
        >
          <VStack>
            <Text>Manual Input</Text>
            <Text fontSize="sm">Enter game stats manually</Text>
          </VStack>
        </Button>
      </Grid>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept="image/*"
      />

      {/* Progress indicator */}
      {isProcessing && (
        <Progress value={progress} size="sm" colorScheme="green" mb={4} />
      )}

      {/* Modals */}
      <ScoreSheetScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />
      <ManualEntryModal 
        isOpen={isManualEntryOpen}
        onClose={onManualEntryClose}
        originalImage={scoreSheetImage}
      />
      <ManualInputModal 
        isOpen={isManualInputOpen}
        onClose={onManualInputClose}
      />
    </Box>
  );
};

// Helper function to map OCR events to digital format
const mapOCREventToDigital = (event) => {
  // Map common baseball events
  const eventMappings = {
    'SINGLE': '1B',
    'DOUBLE': '2B',
    'TRIPLE': '3B',
    'HOME RUN': 'HR',
    'HOMERUN': 'HR',
    'STRIKEOUT': 'K',
    'WALK': 'BB',
    'HIT BY PITCH': 'HBP',
    'SACRIFICE': 'SAC',
    'SACRIFICE FLY': 'SF',
    'FIELDERS CHOICE': 'FC',
    // Add more mappings as needed
  };

  if (!event) return '';
  return eventMappings[event.toUpperCase()] || event;
};

export default ScoreSheetsPage;
