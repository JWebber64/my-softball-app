import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { OCRService } from '../../services/ocrService';
import { scoreSheetOperations } from '../../lib/scoreSheetOperations';
import { 
  Box, 
  Button, 
  Progress, 
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Text
} from '@chakra-ui/react';

const ScoreSheetScanner = ({ isOpen, onScanComplete, onClose }) => {
  const webcamRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const toast = useToast();
  const ocrService = useRef(new OCRService());

  const handleCancel = () => {
    if (scanning) {
      setScanning(false);
    }
    onClose();
  };

  const handleCapture = async () => {
    if (!webcamRef.current) return;

    try {
      setScanning(true);
      const imageSrc = webcamRef.current.getScreenshot();
      
      // Create an Image object
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => { img.onload = resolve; });

      // Create canvas and process image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Process with OCR and get parsed data
      const { parsed: scoreSheetData } = await ocrService.current.recognizeText(canvas);

      // Save to database
      const savedSheet = await scoreSheetOperations.createScoreSheet(scoreSheetData);
      
      // Create file from canvas
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `scoresheet-${scoreSheetData.gameInfo.gameNumber}.png`, { type: 'image/png' });
        
        // Upload the image
        await scoreSheetOperations.uploadImage(savedSheet.game_number, file);
      });

      if (onScanComplete) {
        onScanComplete(scoreSheetData);
      }

      toast({
        title: 'Scan Complete',
        description: 'Score sheet has been successfully processed and saved.',
        status: 'success',
        duration: 5000,
      });

      onClose();
    } catch (error) {
      console.error('Capture error:', error);
      toast({
        title: 'Scan Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel} 
      size="xl"
      closeOnEsc={true}
      closeOnOverlayClick={!scanning}
    >
      <ModalOverlay />
      <ModalContent bg="#545e46">
        <ModalHeader color="#c0fad0">Scan Score Sheet</ModalHeader>
        <ModalCloseButton 
          color="#c0fad0"
          isDisabled={scanning}
        />
        <ModalBody>
          <VStack spacing={4}>
            <Box
              width="100%"
              height="400px"
              position="relative"
              borderRadius="md"
              overflow="hidden"
            >
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {scanning && (
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="blackAlpha.50"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <VStack>
                    <Text color="#c0fad0">Processing...</Text>
                    <Progress
                      value={progress}
                      size="sm"
                      width="200px"
                      colorScheme="green"
                    />
                  </VStack>
                </Box>
              )}
            </Box>
            <Text fontSize="sm" color="#c0fad0">
              Position the score sheet within the frame and ensure good lighting
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={4}>
            <Button
              colorScheme="green"
              onClick={handleCapture}
              isLoading={scanning}
              loadingText="Scanning..."
              isDisabled={scanning}
            >
              Capture & Process
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              colorScheme="red"
              isDisabled={scanning}
            >
              {scanning ? 'Stop Scan' : 'Cancel'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScoreSheetScanner;
