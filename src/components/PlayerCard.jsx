import {
  Badge,
  Box,
  HStack,
  Image,
  Text,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const PlayerCard = ({ 
  firstName, 
  lastName, 
  number, 
  position, 
  photoUrl, 
  stats,
  achievement,
  featured,
  size = 'medium'
}) => {
  const cardStyles = {
    backgroundColor: "var(--app-surface)",
    color: "var(--app-text)",
    border: "1px solid var(--app-border)",
  };
  
  const sizes = {
    small: {
      width: '200px',
      imageHeight: '150px',
      nameSize: 'md',
      numberSize: 'xl',
    },
    medium: {
      width: '300px',
      imageHeight: '225px',
      nameSize: 'lg',
      numberSize: '2xl',
    },
    large: {
      width: '400px',
      imageHeight: '300px',
      nameSize: 'xl',
      numberSize: '3xl',
    }
  };

  const currentSize = sizes[size];

  return (
    <Box
      width={currentSize.width}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={cardStyles.backgroundColor}
      borderColor={cardStyles.border}
      position="relative"
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.02)' }}
    >
      {featured && (
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme="yellow"
          variant="solid"
          zIndex={1}
        >
          Featured
        </Badge>
      )}

      <Box
        height={currentSize.imageHeight}
        position="relative"
        overflow="hidden"
      >
        <Image
          src={photoUrl || '/default-player.png'}
          alt={`${firstName} ${lastName}`}
          objectFit="cover"
          width="100%"
          height="100%"
          fallback={
            <Box
              width="100%"
              height="100%"
              bg="gray.200"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="gray.500">No Photo</Text>
            </Box>
          }
        />
      </Box>

      <VStack p={4} spacing={2} align="stretch">
        <HStack justify="space-between" align="center">
          <Text
            fontSize={currentSize.nameSize}
            fontWeight="bold"
            noOfLines={1}
          >
            {firstName} {lastName}
          </Text>
          <Text
            fontSize={currentSize.numberSize}
            fontWeight="bold"
            color="blue.500"
          >
            #{number}
          </Text>
        </HStack>

        <Badge colorScheme="green" alignSelf="flex-start">
          {position}
        </Badge>

        {stats && (
          <Text fontSize="sm" color="gray.600">
            {stats}
          </Text>
        )}

        {achievement && (
          <Text
            fontSize="sm"
            fontStyle="italic"
            color="blue.600"
            noOfLines={2}
          >
            {achievement}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

PlayerCard.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  number: PropTypes.string.isRequired,
  position: PropTypes.string.isRequired,
  photoUrl: PropTypes.string,
  stats: PropTypes.string,
  achievement: PropTypes.string,
  featured: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

PlayerCard.defaultProps = {
  photoUrl: '',
  stats: '',
  achievement: '',
  featured: false,
  size: 'medium',
};

export default PlayerCard;
