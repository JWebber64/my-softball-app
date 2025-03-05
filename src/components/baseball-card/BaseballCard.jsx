import React, { useRef, useState } from 'react';
import { Box, Image, Text, VStack, HStack, Grid, GridItem, IconButton, useTheme } from '@chakra-ui/react';
import { FaSync } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import PropTypes from 'prop-types';
import { DEFAULT_IMAGES } from '../../constants/assets';

const BaseballCard = ({ player, stats, onExport }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [exportError, setExportError] = useState(false);
  const cardRef = useRef();
  const theme = useTheme();

  const handleImageError = () => {
    setImageError(true);
    console.error('Failed to load player image');
  };

  const handleExport = async () => {
    try {
      setExportError(false);
      if (!cardRef.current) return;
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });
      
      const image = canvas.toDataURL('image/png');
      onExport?.(image);
    } catch (error) {
      setExportError(true);
      console.error('Export failed:', error);
    }
  };

  return (
    <Box
      position="relative"
      w="63.5mm"
      h="88.9mm"
      cursor="pointer"
      perspective="1000px"
    >
      <Box
        ref={cardRef}
        position="relative"
        w="100%"
        h="100%"
        transition="transform 0.8s"
        transformStyle="preserve-3d"
        transform={isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <Box
          position="absolute"
          w="100%"
          h="100%"
          backfaceVisibility="hidden"
          bg={theme.colors.brand.primary}
          borderRadius="lg"
          overflow="hidden"
          boxShadow="lg"
        >
          {/* Team banner */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="20%"
            bg={theme.colors.brand.secondary}
            p={2}
          >
            <Text color={theme.colors.brand.text} fontSize="xl" fontWeight="bold">
              Team Name
            </Text>
          </Box>

          {/* Player photo */}
          <Image
            src={imageError ? DEFAULT_IMAGES.PLAYER_PHOTO : (player.photoUrl || DEFAULT_IMAGES.PLAYER_PHOTO)}
            alt={player.player_name}
            w="100%"
            h="60%"
            objectFit="cover"
            mt="20%"
            onError={handleImageError}
          />

          {/* Player info */}
          <VStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg="rgba(84, 94, 70, 0.9)"
            p={2}
            spacing={0}
            color="white"
          >
            <Text fontSize="lg" fontWeight="bold">{player.player_name}</Text>
            <Text>#{player.jersey_number} · {player.position}</Text>
          </VStack>
        </Box>

        {/* Back of card */}
        <Box
          position="absolute"
          w="100%"
          h="100%"
          backfaceVisibility="hidden"
          bg="white"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="lg"
          transform="rotateY(180deg)"
          p={4}
        >
          <VStack align="stretch" spacing={2}>
            <Text fontSize="sm" fontWeight="bold" textAlign="center">
              {new Date().getFullYear()} Statistics
            </Text>
            
            <Grid templateColumns="repeat(2, 1fr)" gap={2} fontSize="xs">
              <GridItem>AVG</GridItem>
              <GridItem textAlign="right">{stats?.avg || '.000'}</GridItem>
              
              <GridItem>Games</GridItem>
              <GridItem textAlign="right">{stats?.games || '0'}</GridItem>
              
              <GridItem>At Bats</GridItem>
              <GridItem textAlign="right">{stats?.at_bats || '0'}</GridItem>
              
              <GridItem>Hits</GridItem>
              <GridItem textAlign="right">{stats?.hits || '0'}</GridItem>
              
              <GridItem>RBI</GridItem>
              <GridItem textAlign="right">{stats?.rbi || '0'}</GridItem>
              
              <GridItem>Runs</GridItem>
              <GridItem textAlign="right">{stats?.runs || '0'}</GridItem>
              
              <GridItem>HR</GridItem>
              <GridItem textAlign="right">{stats?.home_runs || '0'}</GridItem>
            </Grid>
          </VStack>
        </Box>
      </Box>

      {/* Flip indicator */}
      <IconButton
        icon={<FaSync />}
        size="sm"
        position="absolute"
        bottom={2}
        right={2}
        zIndex={2}
        opacity={0.7}
        _hover={{ opacity: 1 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsFlipped(!isFlipped);
        }}
        aria-label="Flip card"
      />
    </Box>
  );
};

BaseballCard.propTypes = {
  player: PropTypes.shape({
    player_name: PropTypes.string.isRequired,
    jersey_number: PropTypes.string,
    position: PropTypes.string,
    photoUrl: PropTypes.string
  }).isRequired,
  stats: PropTypes.shape({
    avg: PropTypes.string,
    games: PropTypes.number,
    at_bats: PropTypes.number,
    hits: PropTypes.number,
    rbi: PropTypes.number,
    runs: PropTypes.number,
    home_runs: PropTypes.number
  }),
  onExport: PropTypes.func
};

export default BaseballCard;
