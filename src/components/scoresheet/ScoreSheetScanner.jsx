import { Box, Button, HStack, Text, useToast, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { OCRService } from '../../services/ocrService';
import DigitalScoreSheet from './DigitalScoreSheet';

/**
 * ScoreSheetScanner - Component for scanning physical scoresheets and converting to digital format
 * Uses DigitalScoreSheetWrapper for displaying the converted data
 */
const ScoreSheetScanner = ({ 
  isOpen, 
  onClose, 
  onSave = () => {},
  useOcr = false 
}) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scoreSheetData, setScoreSheetData] = useState(null);
  const webcamRef = useRef(null);
  const toast = useToast();
  const ocrService = useRef(new OCRService());

  // If not open, don't render anything
  if (!isOpen) return null;

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    processImage(imageSrc);
  };

  const processImage = async (imageSrc) => {
    setIsProcessing(true);
    try {
      let processedData;
      
      if (useOcr) {
        // Use OCR processing
        toast({
          title: "Processing with OCR",
          description: "Analyzing scoresheet with optical character recognition...",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        
        // Initialize OCR service if needed
        if (!ocrService.current.initialized) {
          await ocrService.current.initialize();
        }
        
        // Process the image with OCR
        const ocrResult = await ocrService.current.recognizeText(imageSrc);
        
        // Convert OCR result to scoresheet data structure
        processedData = {
          gameInfo: {
            date: new Date().toISOString().split('T')[0],
            opponent: ocrResult.parsed?.opponentName || '',
            location: ocrResult.parsed?.location || '',
            isHome: true,
          },
          players: Array(9).fill().map((_, index) => ({
            id: `player-${index}`,
            name: ocrResult.parsed?.players?.[index]?.name || '',
            position: ocrResult.parsed?.players?.[index]?.position || '',
            number: ocrResult.parsed?.players?.[index]?.number || '',
            innings: Array(7).fill().map(() => ({
              diamond: { bases: [false, false, false], scored: false },
              events: { primary: '', out: '', note: '' },
            })),
            substitutedInning: null,
          })),
          inningTotals: Array(7).fill(0),
          totalRuns: 0,
        };
      } else {
        // Create empty scoresheet data structure (no OCR)
        processedData = {
          gameInfo: {
            date: new Date().toISOString().split('T')[0],
            opponent: '',
            location: '',
            isHome: true,
          },
          players: Array(9).fill().map((_, index) => ({
            id: `player-${index}`,
            name: '',
            position: '',
            number: '',
            innings: Array(7).fill().map(() => ({
              diamond: { bases: [false, false, false], scored: false },
              events: { primary: '', out: '', note: '' },
            })),
            substitutedInning: null,
          })),
          inningTotals: Array(7).fill(0),
          totalRuns: 0,
        };
      }
      
      setScoreSheetData(processedData);
      toast({
        title: useOcr ? "OCR processing complete" : "Scoresheet processed",
        description: "Please review and edit the digital scoresheet.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: useOcr ? "OCR processing failed" : "Processing failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataChange = (newData) => {
    setScoreSheetData(newData);
  };

  const handleSave = () => {
    if (scoreSheetData) {
      onSave(scoreSheetData, capturedImage);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {!capturedImage ? (
        <Box>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            height="auto"
          />
          <Button 
            onClick={captureImage} 
            mt={2} 
            colorScheme="blue"
            isLoading={isProcessing}
          >
            Capture Scoresheet
          </Button>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          <HStack>
            <Button onClick={() => setCapturedImage(null)}>
              Take New Photo
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSave}
              isDisabled={!scoreSheetData}
            >
              Save Digital Scoresheet
            </Button>
          </HStack>
          
          <Box>
            <Text fontWeight="bold" mb={2}>Captured Image:</Text>
            <img src={capturedImage} alt="Captured scoresheet" style={{ maxWidth: '100%' }} />
          </Box>
          
          {scoreSheetData && (
            <Box>
              <Text fontWeight="bold" mb={2}>Digital Scoresheet:</Text>
              <DigitalScoreSheet
                data={scoreSheetData}
                onDataChange={handleDataChange}
                viewMode="edit"
                canEdit={true}
                showInningTotals={true}
              />
            </Box>
          )}
        </VStack>
      )}
    </VStack>
  );
};

ScoreSheetScanner.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  useOcr: PropTypes.bool
};

export default ScoreSheetScanner;









