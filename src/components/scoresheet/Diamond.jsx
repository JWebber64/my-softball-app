import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * Diamond - Component for displaying and interacting with the baseball diamond
 */
const Diamond = ({
  bases = [false, false, false],
  scored = false,
  event,
  onBaseClick,
  onScoredClick,
  canEdit = true
}) => {
  // Handle clicking on a base
  const handleBaseClick = (index) => {
    if (!canEdit) return;
    
    const newBases = [...bases];
    newBases[index] = !newBases[index];
    
    onBaseClick(newBases);
  };
  
  // Handle clicking on home plate (scored)
  const handleScoredClick = () => {
    if (!canEdit) return;
    onScoredClick(!scored);
  };
  
  // Diamond size
  const size = "1.5rem";
  
  return (
    <Box 
      position="relative" 
      width={size} 
      height={size}
      className="diamond-container"
    >
      {/* Diamond shape */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        transform="rotate(45deg)"
        border="1px solid black"
        backgroundColor={event === 'HR' || scored ? "green.500" : "white"}
        cursor={canEdit ? "pointer" : "default"}
        onClick={handleScoredClick}
      />
      
      {/* Home to first base line */}
      <Box
        position="absolute"
        bottom="50%"
        left="0%"
        width={(event === '1B' || event === '2B' || event === '3B' || event === 'HR') ? "50%" : (event === 'OUT_H' ? "25%" : (event === 'OUT_2' ? "25%" : "0%"))}
        height="2px"
        transform="rotate(45deg)"
        transformOrigin="bottom left"
        backgroundColor={bases[0] ? "green.500" : "transparent"}
        cursor={canEdit ? "pointer" : "default"}
        onClick={() => handleBaseClick(0)}
      />
      
      {/* First to second base line */}
      <Box
        position="absolute"
        bottom="50%"
        left="50%"
        width="50%"
        height="2px"
        transform="rotate(-45deg)"
        backgroundColor={(event === '2B' || event === '3B' || event === 'HR' || (bases[0] && bases[1]) || event === 'OUT_2') ? "green.500" : "transparent"}
        cursor={canEdit ? "pointer" : "default"}
        onClick={() => handleBaseClick(1)}
      />
      
      {/* Second to third base line */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width="50%"
        height="2px"
        transform="rotate(45deg)"
        transformOrigin="top left"
        backgroundColor={(event === '3B' || event === 'HR' || (bases[1] && bases[2]) || event === 'OUT_3') ? "green.500" : "transparent"}
        cursor={canEdit ? "pointer" : "default"}
        onClick={() => handleBaseClick(2)}
      />
      
      {/* Third to home base line */}
      <Box
        position="absolute"
        top="50%"
        left="0"
        width="50%"
        height="2px"
        transform="rotate(-45deg)"
        transformOrigin="top left"
        backgroundColor={(event === 'HR' || scored || event === 'OUT_H') ? "green.500" : "transparent"}
        cursor={canEdit ? "pointer" : "default"}
        onClick={handleScoredClick}
      />
    </Box>
  );
};

Diamond.propTypes = {
  bases: PropTypes.arrayOf(PropTypes.bool),
  scored: PropTypes.bool,
  event: PropTypes.oneOf(['1B', '2B', '3B', 'HR', 'OUT_2', 'OUT_3', 'OUT_H']),
  onBaseClick: PropTypes.func.isRequired,
  onScoredClick: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
};

export default Diamond;














