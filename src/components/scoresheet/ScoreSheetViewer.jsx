import React from 'react';
import { 
  Box, 
  SimpleGrid, 
  Card, 
  CardBody, 
  Icon, 
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { FaCamera, FaFileUpload, FaMicrophone, FaKeyboard } from 'react-icons/fa';

const ScoreSheetViewer = ({ onSelectMethod }) => {
  return (
    <Box>
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
        <Card 
          cursor="pointer" 
          onClick={() => onSelectMethod('scan')}
          _hover={{ borderColor: "blue.500", shadow: "md" }}
        >
          <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3}>
            <Icon as={FaCamera} boxSize={6} mb={2} color="blue.500" />
            <Text fontWeight="medium">Scan Scoresheet</Text>
          </CardBody>
        </Card>
        
        <Card 
          cursor="pointer" 
          onClick={() => onSelectMethod('upload')}
          _hover={{ borderColor: "blue.500", shadow: "md" }}
        >
          <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3}>
            <Icon as={FaFileUpload} boxSize={6} mb={2} color="blue.500" />
            <Text fontWeight="medium">Upload Scoresheet</Text>
          </CardBody>
        </Card>
        
        <Card 
          cursor="pointer" 
          onClick={() => onSelectMethod('voice')}
          _hover={{ borderColor: "blue.500", shadow: "md" }}
        >
          <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3}>
            <Icon as={FaMicrophone} boxSize={6} mb={2} color="blue.500" />
            <Text fontWeight="medium">Voice Recorder</Text>
          </CardBody>
        </Card>
        
        <Card 
          cursor="pointer" 
          onClick={() => onSelectMethod('manual')}
          _hover={{ borderColor: "blue.500", shadow: "md" }}
        >
          <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3}>
            <Icon as={FaKeyboard} boxSize={6} mb={2} color="blue.500" />
            <Text fontWeight="medium">Manual Input</Text>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default ScoreSheetViewer;