import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Input,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const ScoreSheet = ({ gameNumber, teamName = "Your Team" }) => {
  const [showExtraInnings, setShowExtraInnings] = useState(false);
  const [opponent, setOpponent] = useState("");
  const { onOpen } = useDisclosure();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
      minH="100vh"
      p={6}
      bg="#f5f7f2"
    >
      <Box
        w="210mm"
        minH="297mm"
        bg="white"
        border="2px solid #545e46"
        borderRadius="lg"
        mx="auto"
        p={8}
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
      >
        {/* Title Section */}
        <VStack mb={6} spacing={2}>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="#545e46"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Game Scoresheet
          </Text>
          <Text color="#7c866b" fontSize="md">
            {teamName}
          </Text>
        </VStack>

        {/* Game Info Section */}
        <Box
          mb={6}
          bg="#2e3726"
          border="1px solid #545e46"
          borderRadius="md"
          overflow="hidden"
        >
          {/* Header */}
          <Text
            bg="#1a1f15"
            color="#EFF7EC"
            p={3}
            fontWeight="bold"
            fontSize="lg"
            textAlign="center"
          >
            Game Information
          </Text>
          
          {/* Form Content */}
          <Box p={6}>
            <Grid
              templateColumns="repeat(3, 1fr)"
              gap={6}
            >
              {/* Left Column */}
              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel 
                    color="#EFF7EC" 
                    fontWeight="bold" 
                    fontSize="sm"
                  >
                    Game #
                  </FormLabel>
                  <Input
                    bg="white"
                    border="1px solid #545e46"
                    size="md"
                    value={gameNumber}
                    readOnly
                    _readOnly={{
                      bg: "#f0f2ed",
                      cursor: "default"
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel 
                    color="#EFF7EC" 
                    fontWeight="bold" 
                    fontSize="sm"
                  >
                    League
                  </FormLabel>
                  <Input
                    bg="white"
                    border="1px solid #545e46"
                    size="md"
                    _hover={{ borderColor: "#7c866b" }}
                    _focus={{ 
                      borderColor: "#7c866b",
                      boxShadow: "0 0 0 1px #7c866b"
                    }}
                  />
                </FormControl>
              </VStack>

              {/* Middle Column */}
              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel 
                    color="#EFF7EC" 
                    fontWeight="bold" 
                    fontSize="sm"
                  >
                    Date
                  </FormLabel>
                  <Input
                    type="date"
                    bg="white"
                    border="1px solid #545e46"
                    size="md"
                    _hover={{ borderColor: "#7c866b" }}
                    _focus={{ 
                      borderColor: "#7c866b",
                      boxShadow: "0 0 0 1px #7c866b"
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel 
                    color="#EFF7EC" 
                    fontWeight="bold" 
                    fontSize="sm"
                  >
                    Start Time
                  </FormLabel>
                  <Input
                    type="time"
                    bg="white"
                    border="1px solid #545e46"
                    size="md"
                    _hover={{ borderColor: "#7c866b" }}
                    _focus={{ 
                      borderColor: "#7c866b",
                      boxShadow: "0 0 0 1px #7c866b"
                    }}
                  />
                </FormControl>
              </VStack>

              {/* Right Column */}
              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel 
                    color="#EFF7EC" 
                    fontWeight="bold" 
                    fontSize="sm"
                  >
                    Field
                  </FormLabel>
                  <Input
                    bg="white"
                    border="1px solid #545e46"
                    size="md"
                    _hover={{ borderColor: "#7c866b" }}
                    _focus={{ 
                      borderColor: "#7c866b",
                      boxShadow: "0 0 0 1px #7c866b"
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel 
                    color="#EFF7EC" 
                    fontWeight="bold" 
                    fontSize="sm"
                  >
                    Opponent
                  </FormLabel>
                  <Input
                    bg="white"
                    border="1px solid #545e46"
                    size="md"
                    value={opponent}
                    onChange={(e) => setOpponent(e.target.value)}
                    _hover={{ borderColor: "#7c866b" }}
                    _focus={{ 
                      borderColor: "#7c866b",
                      boxShadow: "0 0 0 1px #7c866b"
                    }}
                  />
                </FormControl>
              </VStack>
            </Grid>
          </Box>
        </Box>

        {/* Control Buttons */}
        <HStack mb={6} spacing={4} justify="flex-end">
          <Button
            size="md"
            bg="#545e46"
            color="white"
            _hover={{ bg: "#7c866b" }}
            onClick={() => setShowExtraInnings(!showExtraInnings)}
            leftIcon={
              <Box as="span" fontSize="1.2em">
                {showExtraInnings ? "−" : "+"}
              </Box>
            }
          >
            {showExtraInnings ? 'Hide Extra Innings' : 'Show Extra Innings'}
          </Button>
          <Button
            size="md"
            bg="#2e3726"
            color="white"
            _hover={{ bg: "#3a4531" }}
            onClick={onOpen}
            leftIcon={
              <Box as="span" fontSize="1.2em">
                ⇄
              </Box>
            }
          >
            Substitutions
          </Button>
        </HStack>

        {/* Add your scoring table and other sections here */}

      </Box>
    </Box>
  );
};

ScoreSheet.propTypes = {
  gameNumber: PropTypes.string.isRequired,
  teamName: PropTypes.string,
};

export default ScoreSheet;
