import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  SimpleGrid, 
  Card, 
  CardBody, 
  Icon, 
  Text,
  useDisclosure,
  Container,
  VStack,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Flex,
  useToast,
  Image
} from '@chakra-ui/react';
import { FaCamera, FaFileUpload, FaMicrophone, FaKeyboard } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import ScoreSheetScanner from '../components/scoresheet/ScoreSheetScanner';
import ManualInputModal from '../components/scoresheet/ManualInputModal';
import VoiceInputModal from '../components/scoresheet/VoiceInputModal';
import DigitalScoreSheet from '../components/scoresheet/DigitalScoreSheet';

const ScoreSheetsPage = ({ userRole }) => {
  const [scoreSheets, setScoreSheets] = useState([
    { id: 1, image: "https://via.placeholder.com/300", description: "Game 1 Score Sheet" },
    { id: 2, image: "https://via.placeholder.com/300", description: "Game 2 Score Sheet" },
  ]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [scoreSheetData, setScoreSheetData] = useState(null);
  const toast = useToast();
  const fileInputRef = useRef(null);
  
  // Modal controls - use refs to access current state in callbacks
  const scannerDisclosure = useDisclosure();
  const manualDisclosure = useDisclosure();
  const voiceDisclosure = useDisclosure();
  const comparisonDisclosure = useDisclosure();
  const isModalOpenRef = useRef(false);

  // Track modal state changes
  useEffect(() => {
    isModalOpenRef.current = comparisonDisclosure.isOpen;
    console.log('Modal state changed:', comparisonDisclosure.isOpen);
  }, [comparisonDisclosure.isOpen]);

  // Separate function to handle file reading
  const processFile = (file) => {
    console.log('Processing file:', file.name);
    
    if (!file) {
      console.warn('No file provided to processFile');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = () => {
      console.log('File read complete');
      setUploadedImage(reader.result);
      
      setScoreSheets(prev => [...prev, { 
        id: prev.length + 1, 
        image: reader.result, 
        description: `Game ${prev.length + 1} Score Sheet` 
      }]);
      
      // Reset scoresheet data when uploading a new image
      setScoreSheetData(null);
      
      // Ensure modal opens
      console.log('Opening comparison modal');
      comparisonDisclosure.onOpen();
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast({
        title: "Error reading file",
        description: "There was a problem reading the uploaded file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    };
    
    reader.readAsDataURL(file);
  };

  const handleUploadScoreSheet = (event) => {
    console.log('Upload triggered');
    
    // Defensive check for event
    if (!event || !event.target) {
      console.error('Invalid event in handleUploadScoreSheet');
      return;
    }
    
    const file = event.target.files?.[0];
    
    if (file) {
      console.log('File selected:', file.name);
      processFile(file);
    } else {
      console.warn('No file selected');
    }
    
    // Reset the file input value so the same file can be selected again
    if (event.target) {
      event.target.value = '';
      console.log('File input reset');
    }
  };

  // Direct file upload method that bypasses the input element
  const triggerFileUpload = () => {
    console.log('Triggering file upload');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input ref is null');
    }
  };

  const handleScanScoreSheet = () => {
    scannerDisclosure.onOpen();
  };

  const handleManualInput = () => {
    manualDisclosure.onOpen();
  };

  const handleVoiceRecognition = () => {
    voiceDisclosure.onOpen();
  };

  const handleMethodSelect = (method) => {
    console.log('Method selected:', method);
    
    switch(method) {
      case 'scan':
        handleScanScoreSheet();
        break;
      case 'upload':
        triggerFileUpload(); // Use the ref-based approach instead
        break;
      case 'voice':
        handleVoiceRecognition();
        break;
      case 'manual':
        handleManualInput();
        break;
      default:
        console.warn('Unknown method selected:', method);
    }
  };

  const handleScoreSheetDataChange = (newData) => {
    setScoreSheetData(newData);
  };

  const handleCancelComparison = () => {
    console.log('Canceling comparison');
    // Reset state when canceling
    comparisonDisclosure.onClose();
    
    // Small delay to ensure state is updated properly
    setTimeout(() => {
      console.log('Modal closed state confirmed:', !comparisonDisclosure.isOpen);
    }, 100);
  };

  const handleSaveScoreSheet = async () => {
    if (!scoreSheetData) {
      toast({
        title: "No data to save",
        description: "Please enter scoresheet data before saving",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Save the image to storage
      const { data: imageData, error: imageError } = await supabase.storage
        .from('scoresheets')
        .upload(`scoresheet-${Date.now()}.jpg`, uploadedImage, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (imageError) throw imageError;

      // Save the scoresheet data to the database
      const { data, error } = await supabase
        .from('scoresheets')
        .insert([
          { 
            image_url: imageData.path,
            data: scoreSheetData,
            created_at: new Date()
          }
        ]);

      if (error) throw error;

      toast({
        title: "Scoresheet saved",
        description: "Your scoresheet has been saved successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      comparisonDisclosure.onClose();
    } catch (error) {
      console.error('Error saving scoresheet:', error);
      toast({
        title: "Error saving scoresheet",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Force modal to close on unmount
  useEffect(() => {
    return () => {
      if (comparisonDisclosure.isOpen) {
        comparisonDisclosure.onClose();
      }
    };
  }, []);

  return (
    <Box bg="#7c866b" minH="100vh" py={8} px={4} color="#FFFFFF">
      <Container maxW="container.xl">
        <VStack spacing={8}>
          {/* Input Method Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
            <Card 
              cursor="pointer" 
              onClick={() => handleMethodSelect('scan')}
              _hover={{ transform: "translateY(-5px)", shadow: "lg" }}
              transition="all 0.3s"
              bg="#545e46"
              color="#FFFFFF"
            >
              <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5}>
                <Icon as={FaCamera} boxSize={10} mb={4} color="#FFFFFF" />
                <Text fontWeight="bold" fontSize="lg" textAlign="center">Scan Scoresheet</Text>
                <Text fontSize="sm" textAlign="center" mt={2}>
                  Take a picture of your paper scoresheet
                </Text>
              </CardBody>
            </Card>
            
            <Card 
              cursor="pointer" 
              onClick={() => handleMethodSelect('upload')}
              _hover={{ transform: "translateY(-5px)", shadow: "lg" }}
              transition="all 0.3s"
              bg="#545e46"
              color="#FFFFFF"
            >
              <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5}>
                <Icon as={FaFileUpload} boxSize={10} mb={4} color="#FFFFFF" />
                <Text fontWeight="bold" fontSize="lg" textAlign="center">Upload Scoresheet</Text>
                <Text fontSize="sm" textAlign="center" mt={2}>
                  Upload an existing scoresheet image
                </Text>
              </CardBody>
            </Card>
            
            <Card 
              cursor="pointer" 
              onClick={() => handleMethodSelect('voice')}
              _hover={{ transform: "translateY(-5px)", shadow: "lg" }}
              transition="all 0.3s"
              bg="#545e46"
              color="#FFFFFF"
            >
              <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5}>
                <Icon as={FaMicrophone} boxSize={10} mb={4} color="#FFFFFF" />
                <Text fontWeight="bold" fontSize="lg" textAlign="center">Voice Input</Text>
                <Text fontSize="sm" textAlign="center" mt={2}>
                  Record game events with voice
                </Text>
              </CardBody>
            </Card>
            
            <Card 
              cursor="pointer" 
              onClick={() => handleMethodSelect('manual')}
              _hover={{ transform: "translateY(-5px)", shadow: "lg" }}
              transition="all 0.3s"
              bg="#545e46"
              color="#FFFFFF"
            >
              <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5}>
                <Icon as={FaKeyboard} boxSize={10} mb={4} color="#FFFFFF" />
                <Text fontWeight="bold" fontSize="lg" textAlign="center">Manual Entry</Text>
                <Text fontSize="sm" textAlign="center" mt={2}>
                  Enter game data manually
                </Text>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Comparison Modal */}
          <Modal 
            isOpen={comparisonDisclosure.isOpen} 
            onClose={handleCancelComparison}
            size="full"
            scrollBehavior="inside"
          >
            <ModalOverlay />
            <ModalContent 
              maxH="90vh"
              bg="#7c866b"
              my="5vh"
              position="relative"
              display="flex"
              flexDirection="column"
            >
              <ModalHeader color="#FFFFFF" textAlign="center">
                <Box
                  bg="#545e46"
                  py={2}
                  px={4}
                  borderRadius="md"
                  mx="auto"
                  textAlign="center"
                  width="fit-content"
                >
                  <Text color="#FFFFFF" fontWeight="bold">Score Sheet Comparison</Text>
                </Box>
              </ModalHeader>
              
              <ModalBody 
                p={6} 
                overflow="auto"
                flex="1"
                maxH="calc(90vh - 180px)" /* Ensure space for footer */
              >
                <Flex 
                  direction={{ base: 'column', lg: 'row' }}
                  gap={4}
                  w="100%"
                  justify="center"
                  align="stretch"
                >
                  {/* Original Image Side */}
                  <Box 
                    flex="1"
                    bg="#7c866b"
                    borderRadius="md"
                    boxShadow="md"
                    maxH={{ lg: '100%' }}
                    overflow="auto"
                    p={4}
                  >
                    <Box
                      bg="#545e46"
                      py={2}
                      px={4}
                      borderRadius="md"
                      mx="auto"
                      mb={4}
                      textAlign="center"
                      width="fit-content"
                    >
                      <Text color="#FFFFFF" fontWeight="bold">Uploaded Score Sheet</Text>
                    </Box>
                    {uploadedImage ? (
                      <Image 
                        src={uploadedImage} 
                        alt="Uploaded Score Sheet" 
                        maxW="100%" 
                        mx="auto"
                        borderRadius="md"
                      />
                    ) : (
                      <Box 
                        p={4} 
                        bg="#545e46" 
                        color="#FFFFFF" 
                        borderRadius="md"
                        textAlign="center"
                      >
                        No image uploaded
                      </Box>
                    )}
                  </Box>

                  {/* Digital Entry Side */}
                  <Box 
                    flex="1"
                    bg="#7c866b"
                    borderRadius="md"
                    boxShadow="md"
                    maxH={{ lg: '100%' }}
                    overflow="auto"
                    p={4}
                  >
                    <Box
                      bg="#545e46"
                      py={2}
                      px={4}
                      borderRadius="md"
                      mx="auto"
                      mb={4}
                      textAlign="center"
                      width="fit-content"
                    >
                      <Text color="#FFFFFF" fontWeight="bold">Digital Entry</Text>
                    </Box>
                    <DigitalScoreSheet 
                      editable={true}
                      onDataChange={handleScoreSheetDataChange}
                      data={scoreSheetData}
                    />
                  </Box>
                </Flex>
              </ModalBody>
              
              <ModalFooter
                display="flex"
                justifyContent="center"
                gap={3}
                bg="#7c866b"
                position="sticky"
                bottom="0"
                p={4}
                borderTop="1px solid"
                borderColor="rgba(255,255,255,0.1)"
              >
                <Button
                  bg="#545e46"
                  color="#FFFFFF"
                  _hover={{ bg: "#6b7660" }}
                  onClick={handleSaveScoreSheet}
                  size="lg"
                  borderRadius="1rem"
                >
                  Save
                </Button>
                <Button 
                  bg="#545e46"
                  color="#FFFFFF"
                  _hover={{ bg: "#6b7660" }}
                  onClick={handleCancelComparison}
                  size="lg"
                  borderRadius="1rem"
                >
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          
          {/* Scanner Modal */}
          <ScoreSheetScanner 
            isOpen={scannerDisclosure.isOpen} 
            onClose={scannerDisclosure.onClose}
            onScanComplete={(scoreSheetData) => {
              setScoreSheetData(scoreSheetData);
              comparisonDisclosure.onOpen();
            }}
          />
          
          {/* Manual Input Modal */}
          <ManualInputModal 
            isOpen={manualDisclosure.isOpen} 
            onClose={manualDisclosure.onClose}
            onSave={(data) => {
              setScoreSheetData(data);
              manualDisclosure.onClose();
              comparisonDisclosure.onOpen();
            }}
          />
          
          {/* Voice Input Modal */}
          <Modal 
            isOpen={voiceDisclosure.isOpen} 
            onClose={voiceDisclosure.onClose}
            size="xl"
          >
            <ModalOverlay />
            <ModalContent bg="#545e46">
              <ModalHeader color="#c0fad0">Voice Score Entry</ModalHeader>
              <ModalBody>
                <VoiceInputModal 
                  onSave={(data) => {
                    setScoreSheetData(data);
                    voiceDisclosure.onClose();
                    comparisonDisclosure.onOpen();
                  }}
                  onCancel={voiceDisclosure.onClose}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </VStack>
      </Container>
    </Box>
  );
};

export default ScoreSheetsPage;
