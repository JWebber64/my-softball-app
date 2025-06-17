import { Box, HStack, Image, Text, VStack, useTheme } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { STAT_DISPLAY_CONFIG } from '../../config/baseballCardPresets';

// Utility functions defined before the component
const getBorderColor = (color) => {
  const colors = {
    gold: 'brand.card.gold',
    silver: 'brand.card.silver',
    bronze: 'brand.card.bronze',
    platinum: 'brand.card.platinum',
    default: 'brand.border'
  };
  return colors[color] || colors.default;
};

const getBackgroundStyle = (style) => {
  const { pattern, texture } = style;
  
  if (pattern === 'gradient') {
    return 'var(--app-card-gradient)';
  } 
  
  if (pattern === 'textured') {
    return texture === 'clean' ? 'var(--app-card-clean)' : 'var(--app-card-textured)';
  }
  
  return 'var(--app-card-default-bg)';
};

const getRarityColor = (rarity) => {
  const colors = {
    common: 'var(--app-rarity-common)',
    uncommon: 'var(--app-rarity-uncommon)',
    rare: 'var(--app-rarity-rare)',
    legendary: 'var(--app-rarity-legendary)',
    mythic: 'var(--app-rarity-mythic)',
    default: 'var(--app-rarity-common)'
  };
  return colors[rarity] || colors.default;
};

const defaultStyle = {
  borderStyle: {
    type: 'rounded',
    effect: 'none',
    color: 'silver'
  },
  backgroundStyle: {
    pattern: 'solid',
    texture: 'clean',
    effect: 'none'
  },
  photoStyle: {
    frame: 'standard',
    effect: 'none',
    filter: 'none'
  },
  statsLayout: {
    type: 'modern',
    showDividers: true
  }
};

const BaseballCard = ({
  frontImage,
  backImage,
  isFlipped,
  onFlip,
  customStyle = defaultStyle,
  playerStats,
  teamLogo,
  playerName,
  position,
  teamName,
  jerseyNumber,
  season,
  cardNumber,
  isParallel = false,
  rarityLevel = 'common'
}) => {
  const theme = useTheme();
  const MotionBox = motion(Box);
  
  const { borderStyle, backgroundStyle, photoStyle, statsLayout } = customStyle;

  const getPhotoFilter = (style) => {
    const filters = {
      sepia: "sepia(1)",
      grayscale: "grayscale(1)",
      vintage: "sepia(0.5) contrast(1.1)",
      sharp: "contrast(1.2) brightness(1.1)",
      none: "none"
    };
    return filters[style.filter] || filters.none;
  };

  const cardStyles = useMemo(() => ({
    wrapper: {
      perspective: "1000px",
      width: "350px",
      height: "500px",
      position: "relative",
    },
    container: {
      width: "100%",
      height: "100%",
      position: "relative",
      transformStyle: "preserve-3d",
      transition: "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)",
      cursor: "pointer",
    },
    side: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backfaceVisibility: "hidden",
      borderRadius: borderStyle.type === 'rounded' ? "15px" : "0",
      border: `8px solid var(--app-border)`,
      backgroundColor: "var(--app-surface)",
      overflow: "hidden",
      padding: "20px",
      boxShadow: isParallel ? "0 0 20px rgba(255,255,255,0.5)" : "0 4px 12px rgba(0,0,0,0.1)",
    },
    image: {
      width: "100%",
      height: "60%",
      objectFit: "cover",
      filter: getPhotoFilter(photoStyle),
      borderRadius: "8px",
      transition: "transform 0.3s ease",
    },
    teamLogo: {
      position: "absolute",
      top: "10px",
      right: "10px",
      width: "50px",
      height: "50px",
      opacity: 0.8,
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
    },
    statsContainer: {
      width: "100%",
      marginTop: "20px",
      display: statsLayout.type === 'modern' ? 'flex' : 'grid',
      gridTemplateColumns: statsLayout.type === 'compact' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
      gap: "10px",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    statItem: {
      textAlign: "center",
      borderBottom: statsLayout.showDividers ? "1px solid brand.text.primary" : "none",  // ✅ Changed from var(--app-text)
      padding: "5px",
      transition: "transform 0.2s ease",
      _hover: {
        transform: "scale(1.05)",
      },
    },
    cardInfo: {
      position: "absolute",
      bottom: "10px",
      left: "10px",
      fontSize: "xs",
      color: "gray.500",
      fontStyle: "italic",
    },
    rarityBadge: {
      position: "absolute",
      top: "10px",
      left: "10px",
      padding: "4px 8px",
      borderRadius: "full",
      fontSize: "xs",
      fontWeight: "bold",
      background: getRarityColor(rarityLevel),
      color: "white",
      textTransform: "uppercase",
    }
  }), [borderStyle, backgroundStyle, photoStyle, statsLayout, isFlipped, isParallel]);

  const renderStats = () => {
    if (!playerStats) return null;
    
    return (
      <VStack spacing={2} mt={4}>
        {Object.entries(playerStats).map(([key, value]) => {
          const statConfig = STAT_DISPLAY_CONFIG[key] || { label: key, format: 'text' };
          // Extract the label from the config object
          const label = typeof statConfig === 'string' ? statConfig : statConfig.label;
          
          return (
            <HStack key={key} sx={cardStyles.statItem}>
              <Text fontWeight="bold">{label}:</Text>
              <Text>{value}</Text>
            </HStack>
          );
        })}
      </VStack>
    );
  };

  return (
    <Box sx={cardStyles.wrapper}>
      <MotionBox
        sx={cardStyles.container}
        onClick={onFlip}
      >
        {/* Front of card */}
        <Box
          sx={cardStyles.side}
          className={borderStyle.effect === 'holographic' ? 'card-holographic' : ''}
        >
          {rarityLevel !== 'common' && (
            <Box sx={cardStyles.rarityBadge}>{rarityLevel}</Box>
          )}
          
          {teamLogo && (
            <Image
              src={teamLogo}
              alt="Team Logo"
              sx={cardStyles.teamLogo}
            />
          )}
          
          {frontImage && (
            <Image
              src={frontImage}
              alt="Player"
              sx={{
                ...cardStyles.image,
                objectFit: "cover", // This ensures the image covers the entire container
                width: "100%",
                height: "auto",
              }}
            />
          )}

          <VStack spacing={2} mt={4}>
            <HStack spacing={2}>
              <Text fontSize="2xl" fontWeight="bold">{playerName}</Text>
              {jerseyNumber && (
                <Text fontSize="xl" color="gray.500">#{jerseyNumber}</Text>
              )}
            </HStack>
            <HStack spacing={2}>
              <Text>{position}</Text>
              <Text>•</Text>
              <Text>{teamName}</Text>
            </HStack>
          </VStack>

          {renderStats()}

          <Text sx={cardStyles.cardInfo}>
            {season} • Card #{cardNumber}
          </Text>
        </Box>

        {/* Back of card */}
        <Box
          sx={{
            ...cardStyles.side,
            transform: "rotateY(180deg)",
          }}
          className={borderStyle.effect === 'holographic' ? 'card-holographic' : ''}
        >
          {backImage && (
            <Image
              src={backImage}
              alt="Card Back"
              sx={{
                ...cardStyles.image,
                objectFit: "cover",
                width: "100%",
                height: "auto",
              }}
            />
          )}
        </Box>
      </MotionBox>
    </Box>
  );
};

BaseballCard.propTypes = {
  frontImage: PropTypes.string,
  backImage: PropTypes.string,
  isFlipped: PropTypes.bool,
  onFlip: PropTypes.func,
  customStyle: PropTypes.object,
  playerStats: PropTypes.object,
  teamLogo: PropTypes.string,
  playerName: PropTypes.string.isRequired,
  position: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  jerseyNumber: PropTypes.string,
  season: PropTypes.string.isRequired,
  cardNumber: PropTypes.string.isRequired,
  isParallel: PropTypes.bool,
  rarityLevel: PropTypes.string
};

export default BaseballCard;















