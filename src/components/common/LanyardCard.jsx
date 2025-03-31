import { Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import React from 'react';
import { useLocation } from 'react-router-dom';

const MotionBox = motion(Box);

const LanyardCard = ({ children, index }) => {
  const location = useLocation();
  const isSignInPage = location.pathname === '/signin';

  const dropAnimation = {
    hidden: {
      y: -1000,
      rotate: 15,
      x: 0
    },
    visible: {
      y: 0,
      x: isSignInPage ? [0, -30, 20, -10, 5, 0] : 0,
      rotate: isSignInPage ? [15, -8, 4, -2, 0] : 0,
      transition: {
        type: "spring",
        duration: isSignInPage ? 2 : 0,
        bounce: 0.5,
        delay: isSignInPage ? index * 0.2 : 0
      }
    }
  };

  const hoverAnimation = {
    hover: {
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 20,  // Reduced from 50 to make it less reactive
        damping: 15     // Increased from 10 to reduce oscillation
      }
    }
  };

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={{
        ...dropAnimation,
        ...hoverAnimation
      }}
      drag
      dragConstraints={{
        top: -50,
        bottom: 50,
        left: -50,
        right: 50
      }}
      dragElastic={0.2}
      style={{ 
        transformOrigin: "center -100vh", // Change this to match the string's top position
        position: "relative",
        pointerEvents: location.pathname === '/auth/callback' ? 'none' : 'auto',
        animation: 'none'
      }}
      bg="var(--content-gradient-middle)"
      borderRadius="md"
      boxShadow="lg"
      p={4}
    >
      {/* Updated string effect */}
      <Box
        position="absolute"
        top="-100vh" // Changed from -150px to -100vh
        left="50%"
        transform="translateX(-50%)"
        width="8px"
        height="100vh" // Changed from 150px to 100vh
        bgGradient="linear(to-b, transparent, whiteAlpha.600)"
        borderRadius="full"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-2px',
          right: '-2px',
          bottom: 0,
          bgGradient: "linear(to-b, transparent, whiteAlpha.300)",
          filter: 'blur(2px)',
          borderRadius: 'full'
        }}
      />
      
      {children}
    </MotionBox>
  );
};

LanyardCard.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.number.isRequired
};

export default LanyardCard;



















