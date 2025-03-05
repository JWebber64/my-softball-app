import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Container,
  VStack,
  Spinner,
  Flex,
  useToast,
  Image,
  SimpleGrid,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button
} from '@chakra-ui/react';
import { FaCamera, FaFileUpload, FaMicrophone, FaKeyboard } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import ScoreSheetScanner from '../components/scoresheet/ScoreSheetScanner';
import ManualInputModal from '../components/scoresheet/ManualInputModal';
import VoiceInputModal from '../components/scoresheet/VoiceInputModal';
import DigitalScoreSheet from '../components/scoresheet/DigitalScoreSheet';
import ManualEntryModal from '../components/scoresheet/ManualEntryModal';
import ScoreComparisonView from '../components/scoresheet/ScoreComparisonView';
import ScoreSheetViewer from '../components/scoresheet/ScoreSheetViewer';

const ScoreSheetsPage = ({ userRole }) => {
  // State management
  const [scoreSheets, setScoreSheets] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [scoreSheetData, setScoreSheetData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs
  const fileInputRef = useRef(null);
  const isModalOpenRef = useRef(false);

  // Hooks
  const toast = useToast();
  const scannerDisclosure = useDisclosure();
  const manualDisclosure = useDisclosure();
  const voiceDisclosure = useDisclosure();
  const comparisonDisclosure = useDisclosure();

  // Load existing scoresheets on mount
  useEffect(() => {
    fetchScoreSheets();
  }, []);

  // Track modal state
  useEffect(() => {
    isModalOpenRef.current = comparisonDisclosure.isOpen;
  }, [comparisonDisclosure.isOpen]);

  const fetchScoreSheets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('score_sheets')  // Changed from 'scoresheets' to 'score_sheets'
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setScoreSheets(data || []);
    } catch (err) {
      console.error('Error fetching scoresheets:', err);
      setError(err.message);
      toast({
        title: 'Error fetching scoresheets',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processFile = (file) => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'No file selected',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPEG, PNG, or GIF)',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
      setUploadedImage(reader.result);
      comparisonDisclosure.onOpen();
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to read the uploaded file',
        status: 'error',
        duration: 3000,
      });
    };
    
    reader.readAsDataURL(file);
  };

  const handleUploadScoreSheet = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input
    if (event?.target) {
      event.target.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSaveScoreSheet = async () => {
    if (!scoreSheetData) {
      toast({
        title: "No data to save",
        description: "Please enter scoresheet data before saving",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Upload image if exists
      let imageUrl = null;
      if (uploadedImage) {
        const fileName = `scoresheet-${Date.now()}.jpg`;
        const { data: imageData, error: imageError } = await supabase.storage
          .from('scoresheets')
          .upload(fileName, uploadedImage, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (imageError) throw imageError;
        imageUrl = imageData.path;
      }

      // Save scoresheet data
      const { error } = await supabase
        .from('score_sheets')  // Changed from 'scoresheets' to 'score_sheets'
        .insert([{ 
          image_url: imageUrl,
          data: scoreSheetData,
          created_at: new Date()
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scoresheet saved successfully",
        status: "success",
        duration: 3000,
      });

      // Reset states and close modal
      setUploadedImage(null);
      setScoreSheetData(null);
      comparisonDisclosure.onClose();
      
      // Refresh scoresheet list
      fetchScoreSheets();

    } catch (error) {
      console.error('Error saving scoresheet:', error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodSelect = (method) => {
    switch(method) {
      case 'scan':
        scannerDisclosure.onOpen();
        break;
      case 'upload':
        fileInputRef.current?.click();
        break;
      case 'voice':
        voiceDisclosure.onOpen();
        break;
      case 'manual':
        manualDisclosure.onOpen();
        break;
      default:
        break;
    }
  };

  return (
    <Box 
      bg="#7c866b" 
      minH="170vh"    // Increased from 160vh
      py={4}
      px={4} 
      color="#FFFFFF"
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleUploadScoreSheet}
        accept="image/*"
      />

      {/* Method Selection */}
      <ScoreSheetViewer onSelectMethod={handleMethodSelect} />

      {/* Scoresheet Image Viewer */}
      <Box 
        mt={4}
        bg="#545e46"    // Changed from white to match button color
        borderRadius="md" 
        p={4} 
        boxShadow="md"
        maxW="800px"
        mx="auto"
        height="150vh"
        overflow="auto"
      >
        <Box
          bg="#2e3726"
          py={2}
          px={4}
          borderRadius="md"
          mx="auto"
          mb={4}
          textAlign="center"
          width="fit-content"
        >
          <Text color="white" fontWeight="bold">Scoresheet Viewer</Text>
        </Box>
        <Box 
          height="calc(150vh - 100px)"
          bg="white"     // Keep scoresheet area white
          borderRadius="md"
          p={4}
        >
          <Image
            src="/scoresheet.png"
            alt="Scoresheet"
            maxW="700px"
            w="100%"
            h="auto"
            objectFit="contain"
            mx="auto"
            border="1px solid"
            borderColor="gray.200"
          />
        </Box>
      </Box>

      {/* Display existing scoresheets */}
      {isLoading ? (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" color="#E7F8E8" />
        </Flex>
      ) : error ? (
        <Text color="red.500" textAlign="center">{error}</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mt={8}>
          {scoreSheets.map((sheet) => (
            <Box 
              key={sheet.id}
              bg="#545e46"
              p={4}
              borderRadius="md"
              color="#E7F8E8"
            >
              {sheet.image_url && (
                <Image
                  src={sheet.image_url}
                  alt="Scoresheet"
                  mb={4}
                  borderRadius="md"
                />
              )}
              <Text>Created: {new Date(sheet.created_at).toLocaleDateString()}</Text>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* Modals */}
      <ScoreSheetScanner
        isOpen={scannerDisclosure.isOpen}
        onClose={scannerDisclosure.onClose}
        onScan={(data) => {
          setScoreSheetData(data);
          scannerDisclosure.onClose();
          comparisonDisclosure.onOpen();
        }}
      />

      <ManualInputModal
        isOpen={manualDisclosure.isOpen}
        onClose={manualDisclosure.onClose}
        onSubmit={(data) => {
          setScoreSheetData(data);
          manualDisclosure.onClose();
          comparisonDisclosure.onOpen();
        }}
      />

      <VoiceInputModal
        isOpen={voiceDisclosure.isOpen}
        onClose={voiceDisclosure.onClose}
        onSubmit={(data) => {
          setScoreSheetData(data);
          voiceDisclosure.onClose();
          comparisonDisclosure.onOpen();
        }}
      />

      <Modal
        isOpen={comparisonDisclosure.isOpen}
        onClose={comparisonDisclosure.onClose}
        size="full"
      >
        <ModalOverlay />
        <ModalContent bg="#7c866b">
          <ModalHeader color="#E7F8E8">Review Scoresheet</ModalHeader>
          <ModalCloseButton color="#E7F8E8" />
          <ModalBody>
            <ScoreComparisonView
              imageData={uploadedImage}
              scoreData={scoreSheetData}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={comparisonDisclosure.onClose}
              color="#E7F8E8"
            >
              Cancel
            </Button>
            <Button
              bg="#545e46"
              color="#E7F8E8"
              _hover={{ bg: "#6b7660" }}
              onClick={handleSaveScoreSheet}
              isLoading={isLoading}
            >
              Save Scoresheet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ScoreSheetsPage;
