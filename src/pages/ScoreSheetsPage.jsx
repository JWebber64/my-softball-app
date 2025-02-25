import React, { useState } from 'react';
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
  Input
} from '@chakra-ui/react';
import { FaCamera, FaFileUpload, FaMicrophone, FaKeyboard } from 'react-icons/fa';
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
  const [showDigitalSheet, setShowDigitalSheet] = useState(false);
  
  // Modal controls
  const scannerDisclosure = useDisclosure();
  const manualDisclosure = useDisclosure();
  const voiceDisclosure = useDisclosure();

  const handleUploadScoreSheet = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setShowDigitalSheet(true);
        setScoreSheets([...scoreSheets, { 
          id: scoreSheets.length + 1, 
          image: reader.result, 
          description: `Game ${scoreSheets.length + 1} Score Sheet` 
        }]);
      };
      reader.readAsDataURL(file);
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
    switch(method) {
      case 'scan':
        handleScanScoreSheet();
        break;
      case 'upload':
        document.getElementById('file-upload').click();
        break;
      case 'voice':
        handleVoiceRecognition();
        break;
      case 'manual':
        handleManualInput();
        break;
      default:
        break;
    }
  };

  return (
    <Box bg="#7c866b" minH="100vh" py={8} px={4} color="#dbe0da">
      <Container maxW="container.xl">
        <VStack spacing={8}>
          <Heading as="h1" size="xl" textAlign="center" color="#dbe0da">
            Score Sheets
          </Heading>
          
          {/* Input Method Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
            <Card 
              cursor="pointer" 
              onClick={() => handleMethodSelect('scan')}
              _hover={{ transform: "translateY(-5px)", shadow: "lg" }}
              transition="all 0.3s"
              bg="#545e46"
              color="#dbe0da"
            >
              <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5}>
                <Icon as={FaCamera} boxSize={10} mb={4} color="#2e3726" />
                <Text fontWeight="bold" fontSize="lg">Scan Scoresheet</Text>
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
              color="#dbe0da"
            >
              <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5}>
                <Icon as={FaFileUpload} boxSize={10} mb={4} color="#2e3726" />
                <Text fontWeight="bold" fontSize="lg">Upload Scoresheet</Text>
                <Text fontSize="sm" textAlign="center" mt={2}>
                  Upload an image of your scoresheet
                </Text>
                <Input 
                  id="file-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleUploadScoreSheet} 
                  display="none" 
                />
              </CardBody>
            </Card>
            
            <Card 
              cursor="pointer" 
              onClick={() => handleMethodSelect('voice')}
              _hover={{ transform: "translateY(-5px)", shadow: "lg" }}
              transition="all 0.3s"
              bg="#545e46"
              color="#dbe0da"
            >
              <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5}>
                <Icon as={FaMicrophone} boxSize={10} mb={4} color="#2e3726" />
                <Text fontWeight="bold" fontSize="lg">Voice Recorder</Text>
                <Text fontSize="sm" textAlign="center" mt={2}>
                  Input stats using voice commands
                </Text>
              </CardBody>
            </Card>
            
            <Card 
              cursor="pointer" 
              onClick={() => handleMethodSelect('manual')}
              _hover={{ transform: "translateY(-5px)", shadow: "lg" }}
              transition="all 0.3s"
              bg="#545e46"
              color="#dbe0da"
            >
              <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5}>
                <Icon as={FaKeyboard} boxSize={10} mb={4} color="#2e3726" />
                <Text fontWeight="bold" fontSize="lg">Manual Input</Text>
                <Text fontSize="sm" textAlign="center" mt={2}>
                  Enter stats using digital scoresheet
                </Text>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Display area for uploaded image and digital scoresheet */}
          {showDigitalSheet && uploadedImage && (
            <Box 
              w="full" 
              display="grid" 
              gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }} 
              gap={6} 
              mt={8}
              p={4}
              bg="#3a4531"
              borderRadius="lg"
              shadow="xl"
            >
              <Box>
                <Heading as="h3" size="md" mb={4} color="#dbe0da">Original Scoresheet</Heading>
                <Box 
                  borderRadius="md" 
                  overflow="hidden" 
                  bg="white" 
                  maxH="800px"
                  display="flex"
                  justifyContent="center"
                >
                  <img src={uploadedImage} alt="Uploaded scoresheet" style={{ maxWidth: "100%", maxHeight: "800px" }} />
                </Box>
              </Box>
              
              <Box>
                <Heading as="h3" size="md" mb={4} color="#dbe0da">Digital Scoresheet</Heading>
                <Box 
                  borderRadius="md" 
                  bg="white" 
                  p={4}
                  maxH="800px"
                  overflowY="auto"
                >
                  <DigitalScoreSheet />
                </Box>
              </Box>
            </Box>
          )}
        </VStack>
      </Container>
      
      {/* Modals */}
      <ScoreSheetScanner 
        isOpen={scannerDisclosure.isOpen} 
        onClose={scannerDisclosure.onClose} 
      />
      
      <ManualInputModal 
        isOpen={manualDisclosure.isOpen} 
        onClose={manualDisclosure.onClose} 
      />
      
      <VoiceInputModal 
        isOpen={voiceDisclosure.isOpen} 
        onClose={voiceDisclosure.onClose} 
      />
    </Box>
  );
};

export default ScoreSheetsPage;
