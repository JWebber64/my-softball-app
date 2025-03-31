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
  Progress,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useAuth } from '../../context/AuthContext';
import { useTeam } from '../../context/TeamContext';
import { scoreSheetOperations } from '../../lib/scoreSheetOperations';
import { OCRService } from '../../services/ocrService';

ScoreSheetScanner.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onScanComplete: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

const ScoreSheetScanner = ({ isOpen, onScanComplete, onClose }) => {
  const webcamRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [progress] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const toast = useToast();
  const ocrService = useRef(new OCRService());
  const { user, isAuthenticated } = useAuth();
  const { team } = useTeam();

  // Add a callback to detect when the camera is ready
  const handleUserMedia = useCallback(() => {
    setCameraReady(true);
  }, []);

  const handleCancel = () => {
    if (scanning) {
      setScanning(false);
    }
    onClose();
  };

  const processScoreSheet = async (img) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to process score sheets",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      // Log team context data
      console.log('Team context:', team);
      
      if (!team?.id) {
        throw new Error('No active team selected');
      }

      // Verify team ID format
      if (typeof team.id !== 'string' || !team.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new Error('Invalid team ID format');
      }

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Process with OCR and get parsed data
      const { parsed: scoreSheetData } = await ocrService.current.recognizeText(canvas);

      // Add user metadata
      scoreSheetData.metadata = {
        uploaded_by: user.id,
        upload_date: new Date().toISOString(),
      };

      // Log the data being sent to createScoreSheet
      console.log('Sending to createScoreSheet:', {
        scoreSheetData,
        teamId: team.id
      });

      // Save to database with team_id
      const savedSheet = await scoreSheetOperations.createScoreSheet(scoreSheetData, team.id);
      
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
    } catch (error) {
      console.error('Score sheet processing error:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
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

      processScoreSheet(img);
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
        <Box textAlign="center" width="100%">
          <ModalHeader color="white" textAlign="center">Scan Score Sheet</ModalHeader>
        </Box>
        <ModalCloseButton 
          color="white"
          isDisabled={scanning}
        />
        <ModalBody>
          <VStack spacing={4} align="center">
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
                onUserMedia={handleUserMedia}
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
                    <Text color="white" fontWeight="bold">Processing...</Text>
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
            <Text fontSize="sm" color="white" textAlign="center" fontWeight="medium" maxW="80%" mx="auto">
              Position the score sheet within the frame and ensure good lighting
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter
          display="flex"
          justifyContent="center"
          gap={3}
          bg="#7C866B"
          position="sticky"
          bottom="0"
          p={4}
          borderTop="1px solid"
          borderColor="rgba(255,255,255,0.1)"
        >
          <Button
            bg="#545E46"
            color="#EFF7EC"
            _hover={{ bg: "#6b7660" }}
            onClick={handleCapture}
            size="lg"
            borderRadius="1rem"
            isDisabled={!cameraReady}
          >
            Capture
          </Button>
          <Button 
            bg="#545E46"
            color="#EFF7EC"
            _hover={{ bg: "#6b7660" }}
            onClick={onClose}
            size="lg"
            borderRadius="1rem"
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScoreSheetScanner;






