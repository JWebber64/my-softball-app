import { Box, Flex } from '@chakra-ui/react';
import { motion, useSpring } from 'framer-motion';
import React, { useState } from 'react';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const LanyardCard = ({ children, index = 0 }) => {
  // Calculate a more dramatic random horizontal offset between -200 and 200
  const randomX = Math.floor(Math.random() * 400) - 200;
  // Random rotation between -25 and 25 degrees
  const randomRotation = Math.floor(Math.random() * 50) - 25;
  
  // State to track if card is being dragged
  const [isDragging, setIsDragging] = useState(false);
  
  // Use controlled motion values for more precise spring animations
  const x = useSpring(0, { 
    stiffness: 1000, 
    damping: 30, 
    mass: 1 
  });
  
  const y = useSpring(0, { 
    stiffness: 1000, 
    damping: 30, 
    mass: 1 
  });
  
  const rotate = useSpring(0, { 
    stiffness: 700, 
    damping: 30 
  });
  
  return (
    <Box position="relative">
      {/* Container to keep strap and card together */}
      <MotionBox
        id={`lanyard-card-${index}`}
        position="relative"
        initial={{ 
          y: -700, 
          x: randomX, 
          rotate: randomRotation,
          opacity: 0,
          scale: 0.9
        }}
        animate={{ 
          y: 0, 
          x: 0, 
          rotate: 0,
          opacity: 1,
          scale: 1,
          transition: {
            y: {
              type: "spring",
              damping: 5,
              stiffness: 60,
              restDelta: 0.001,
              delay: index * 0.2
            },
            x: {
              type: "spring",
              damping: 7,
              stiffness: 70,
              delay: index * 0.2
            },
            rotate: {
              type: "spring",
              damping: 6,
              stiffness: 80,
              delay: index * 0.2
            },
            opacity: {
              duration: 0.4,
              delay: index * 0.2
            },
            scale: {
              type: "spring",
              damping: 8,
              stiffness: 100,
              delay: index * 0.2
            }
          }
        }}
        // Add drag functionality with return-to-center behavior
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.05} // Reduce elasticity for more precise return
        style={{ 
          x, 
          y, 
          rotate,
          cursor: isDragging ? 'grabbing' : 'grab' 
        }}
        whileDrag={{ 
          scale: 1.05,
          zIndex: 10,
          boxShadow: "0px 10px 25px rgba(0,0,0,0.3)"
        }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setIsDragging(false);
          // Explicitly reset motion values to ensure return to center
          x.set(0);
          y.set(0);
          rotate.set(0);
        }}
        whileTap={{ cursor: 'grabbing' }}
      >
        {/* Lanyard strap - placed INSIDE the motion container so it moves with the card */}
        <Box
          position="absolute"
          top="-2000px" /* Long enough to reach top of page */
          left="50%"
          height="2000px" /* Fixed large height */
          width="12px"
          transform="translateX(-50%)"
          background="linear-gradient(to bottom, var(--app-gradient-start), var(--app-gradient-middle))"
          boxShadow="0 0 5px rgba(0,0,0,0.3)"
          borderRadius="2px"
          zIndex={1}
          pointerEvents="none"
        />
        
        {/* Lanyard clip/attachment point */}
        <Box
          position="absolute"
          top="-5px"
          left="50%"
          transform="translateX(-50%)"
          width="30px"
          height="10px"
          borderRadius="4px 4px 0 0"
          background="linear-gradient(to bottom, #e0e0e0, #a0a0a0)"
          boxShadow="0 0 3px rgba(0,0,0,0.4)"
          zIndex={3}
        >
          {/* Clip hole */}
          <Box
            position="absolute"
            top="3px"
            left="50%"
            transform="translateX(-50%)"
            width="6px"
            height="6px"
            borderRadius="50%"
            background="#555"
            boxShadow="inset 0 0 2px rgba(0,0,0,0.8)"
          />
        </Box>
        
        {/* Card body */}
        <Box
          bg="var(--content-gradient-middle)"
          borderRadius="md"
          boxShadow="lg"
          p={4}
          position="relative"
          overflow="hidden"
          zIndex={2}
          marginTop="5px" /* Add space for the clip */
        >
          {children}
        </Box>
      </MotionBox>
    </Box>
  );
};

export default LanyardCard;









































