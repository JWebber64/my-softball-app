import {
  Box,
  Card,
  CardBody,
  Icon,
  SimpleGrid,
  Text,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';
import { FaCamera, FaFileUpload, FaKeyboard, FaMicrophone } from 'react-icons/fa';

const ScoreSheetViewer = ({ onSelectMethod }) => {
  return (
    <Box width="100%" mb={4} minHeight="200px">
      <SimpleGrid 
        columns={{ base: 2, md: 4 }} 
        spacing={4}
        height="100%"
      >
        <Card 
          cursor="pointer" 
          onClick={() => onSelectMethod('scan')}
          _hover={{ transform: 'scale(1.02)', shadow: "md" }}
          bg="#545e46"
          height="180px"
          minHeight="180px"
        >
          <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3}>
            <Icon as={FaCamera} boxSize={8} mb={3} color="#2e3726" />
            <VStack spacing={2}>
              <Text fontWeight="medium" color="#E7F8E8" textAlign="center">Scan Scoresheet</Text>
              <Text fontSize="sm" color="#E7F8E8" textAlign="center">Use camera to capture scoresheet image</Text>
            </VStack>
          </CardBody>
        </Card>
        
        <Card 
          cursor="pointer" 
          onClick={() => onSelectMethod('upload')}
          _hover={{ transform: 'scale(1.02)', shadow: "md" }}
          bg="#545e46"
          height="180px"
          minHeight="180px"
        >
          <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3}>
            <Icon as={FaFileUpload} boxSize={8} mb={3} color="#2e3726" />
            <VStack spacing={2}>
              <Text fontWeight="medium" color="#E7F8E8" textAlign="center">Upload File</Text>
              <Text fontSize="sm" color="#E7F8E8" textAlign="center">Import existing scoresheet image</Text>
            </VStack>
          </CardBody>
        </Card>
        
        <Card 
          cursor="pointer" 
          onClick={() => onSelectMethod('voice')}
          _hover={{ transform: 'scale(1.02)', shadow: "md" }}
          bg="#545e46"
          height="180px"
          minHeight="180px"
        >
          <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3}>
            <Icon as={FaMicrophone} boxSize={8} mb={3} color="#2e3726" />
            <VStack spacing={2}>
              <Text fontWeight="medium" color="#E7F8E8" textAlign="center">Voice Input</Text>
              <Text fontSize="sm" color="#E7F8E8" textAlign="center">Record game plays using voice commands</Text>
            </VStack>
          </CardBody>
        </Card>
        
        <Card 
          cursor="pointer" 
          onClick={() => onSelectMethod('manual')}
          _hover={{ transform: 'scale(1.02)', shadow: "md" }}
          bg="#545e46"
          height="180px"
          minHeight="180px"
        >
          <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3}>
            <Icon as={FaKeyboard} boxSize={8} mb={3} color="#2e3726" />
            <VStack spacing={2}>
              <Text fontWeight="medium" color="#E7F8E8" textAlign="center">Manual Entry</Text>
              <Text fontSize="sm" color="#E7F8E8" textAlign="center">Enter game data manually using form</Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

ScoreSheetViewer.propTypes = {
  onSelectMethod: PropTypes.func.isRequired,
};

export default ScoreSheetViewer;
