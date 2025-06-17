import {
  Box,
  HStack,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import Diamond from './Diamond';

// Event options for the dropdown - updated with all events from eventMapper.js
const EVENT_OPTIONS = [
  // Clear option
  { value: '', label: '-- Clear --' },
  
  // Hits
  { value: '1B', label: '1B (Single)' },
  { value: '2B', label: '2B (Double)' },
  { value: '3B', label: '3B (Triple)' },
  { value: 'HR', label: 'HR (Home Run)' },
  
  // Outs
  { value: 'K', label: 'K (Strikeout Swinging)' },
  { value: 'ꓘ', label: 'ꓘ (Strikeout Looking)' },
  { value: 'FO', label: 'FO (Fly Out)' },
  { value: 'GO', label: 'GO (Ground Out)' },
  { value: 'LO', label: 'LO (Line Out)' },
  { value: 'DP', label: 'DP (Double Play)' },
  
  // Runner advancement
  { value: '1TO2', label: '1→2 (Runner advanced to 2nd)' },
  { value: '2TO3', label: '2→3 (Runner advanced to 3rd)' },
  { value: '3HOME', label: '3→H (Runner scored)' },
  
  // Force outs
  { value: 'FO2', label: 'FO@2 (Force Out at 2nd)' },
  { value: 'FO3', label: 'FO@3 (Force Out at 3rd)' },
  { value: 'FOH', label: 'FO@H (Force Out at Home)' },
  
  // RBIs
  { value: 'RBI1', label: 'RBI (1 RBI)' },
  { value: 'RBI2', label: 'RBI×2 (2 RBIs)' },
  { value: 'RBI3', label: 'RBI×3 (3 RBIs)' },
  { value: 'RBI4', label: 'RBI×4 (4 RBIs)' },
  
  // Other
  { value: 'BB', label: 'BB (Base on Balls/Walk)' },
  { value: 'IBB', label: 'IBB (Intentional Walk)' },
  { value: 'HBP', label: 'HBP (Hit By Pitch)' },
  { value: 'FC', label: 'FC (Fielder\'s Choice)' },
  { value: 'SAC', label: 'SAC (Sacrifice)' },
  { value: 'SF', label: 'SF (Sacrifice Fly)' },
  
  // Errors
  { value: 'E1', label: 'E1 (Error by Pitcher)' },
  { value: 'E2', label: 'E2 (Error by Catcher)' },
  { value: 'E3', label: 'E3 (Error by 1st Baseman)' },
  { value: 'E4', label: 'E4 (Error by 2nd Baseman)' },
  { value: 'E5', label: 'E5 (Error by 3rd Baseman)' },
  { value: 'E6', label: 'E6 (Error by Shortstop)' },
  { value: 'E7', label: 'E7 (Error by Left Fielder)' },
  { value: 'E8', label: 'E8 (Error by Center Fielder)' },
  { value: 'E9', label: 'E9 (Error by Right Fielder)' },
  { value: 'E10', label: 'E10 (Error by Extra Fielder)' }
];

/**
 * InningCell - Component for displaying and editing inning data
 */
const InningCell = ({ 
  inning, 
  player,
  data = null,
  onInningChange, 
  canEdit = true, 
  viewMode = 'edit',
  isSubstituted = false,
}) => {
  // Default inning data structure
  const defaultInning = {
    diamond: { bases: [false, false, false], scored: false, rbi: 0 },
    events: { primary: '', out: '', note: '' },
  };
  
  // Use provided inning data or default
  const inningData = data || defaultInning;
  
  // State for showing RBI input
  const [showRbiInput, setShowRbiInput] = useState(false);
  
  // Ref for the select element
  const selectRef = useRef(null);
  
  // Handle inning data changes
  const handleInningChange = (field, value) => {
    if (!canEdit) return;
    
    // If field is empty, it means we're resetting the entire inning data
    if (field === '') {
      onInningChange(inning, player, value);
      return;
    }
    
    // Create a deep copy of the inning data
    const updatedInning = JSON.parse(JSON.stringify(inningData));
    
    // Update the field using dot notation
    const fieldParts = field.split('.');
    let current = updatedInning;
    
    for (let i = 0; i < fieldParts.length - 1; i++) {
      current = current[fieldParts[i]];
}
    
    current[fieldParts[fieldParts.length - 1]] = value;
    
    // Call the parent's onInningChange with the updated data
    onInningChange(inning, player, updatedInning);
  };
  
  // Handle diamond base changes
  const handleBaseChange = (newBases) => {
    handleInningChange('diamond.bases', newBases);
  };
  
  // Handle scored run changes
  const handleScoredChange = (scored) => {
    handleInningChange('diamond.scored', scored);
    
    // Show RBI input when a run is scored
    if (scored && !showRbiInput) {
      setShowRbiInput(true);
    }
  };

  // Handle RBI count change
  const handleRbiChange = (value) => {
    handleInningChange('diamond.rbi', parseInt(value, 10) || 0);
  };

  // Handle event selection
  const handleEventChange = (e) => {
    if (!canEdit) return;
    const value = e.target.value;
    
    // If clear option is selected, reset everything
    if (value === '') {
      // Create a completely new default inning data
      const resetData = {
        diamond: { bases: [false, false, false], scored: false, rbi: 0 },
        events: { primary: '', out: '', note: '' },
      };
      
      // Pass the entire reset data to the parent component
      onInningChange(inning, player, resetData);
      setShowRbiInput(false);
      return;
    }
    
    // Set the primary event
    handleInningChange('events.primary', value);
    
    // Auto-update bases based on hit type
    switch (value) {
      case '1B':
        handleInningChange('diamond.bases', [true, false, false]);
        break;
      case '2B':
        handleInningChange('diamond.bases', [false, true, false]);
        break;
      case '3B':
        handleInningChange('diamond.bases', [false, false, true]);
        break;
      case 'HR':
        handleInningChange('diamond.bases', [false, false, false]);
        handleInningChange('diamond.scored', true);
        setShowRbiInput(true);
        break;
      case 'BB':
      case 'IBB':
      case 'HBP':
        handleInningChange('diamond.bases', [true, false, false]);
        break;
      case 'FC':
        // Fielder's choice - runner on first (assuming batter is out)
        handleInningChange('diamond.bases', [true, false, false]);
        break;
      default:
        // For other events, reset bases
        handleInningChange('diamond.bases', [false, false, false]);
        handleInningChange('diamond.scored', false);
        setShowRbiInput(false);
        break;
    }
  };
  
  return (
    <HStack 
      spacing="0" 
      height="5.5rem" 
      width="100%" 
      p="0.25rem" 
      bg="white" 
      borderColor="black"
      borderWidth="1px"
      position="relative"
    >
      {/* Substitution indicator line */}
      {isSubstituted && (
        <Box 
          position="absolute" 
          right="0" 
          top="0" 
          bottom="0" 
          width="3px" 
          bg="green.500" 
          zIndex="1"
        />
      )}
      
      {/* Left side - Diamond */}
      <Box 
        width="40%" 
        display="flex" 
        justifyContent="center" 
        alignItems="center"
      >
        <Diamond
          bases={inningData.diamond.bases}
          scored={inningData.diamond.scored}
          event={inningData.events.primary || ''}
          onBaseClick={handleBaseChange}
          onScoredClick={handleScoredChange}
          canEdit={canEdit}
        />
        
        {/* RBI input */}
        {(showRbiInput || inningData.diamond.scored) && (
          <NumberInput 
            size="xs" 
            min={0} 
            max={4}
            value={inningData.diamond.rbi} 
            onChange={handleRbiChange}
            isReadOnly={!canEdit}
            mt="0.25rem"
            position="absolute"
            top="0.5rem"
            left="20%"
            width="3rem"
          >
            <NumberInputField placeholder="RBI" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        )}
      </Box>
      
      {/* Right side - Event selection */}
      <VStack 
        spacing="0.25rem" 
        align="stretch" 
        width="60%" 
      >
        {/* Primary event dropdown (Event field) - using Input with native select */}
        <Box position="relative" width="100%" height="1.5rem">
          <Input
            size="xs"
            value={inningData.events.primary ? 
              EVENT_OPTIONS.find(opt => opt.value === inningData.events.primary)?.label : ''}
            placeholder="Event"
            readOnly
            onClick={() => {
              if (canEdit && selectRef.current) {
                selectRef.current.focus();
                selectRef.current.click();
              }
            }}
            cursor={canEdit ? "pointer" : "default"}
            height="1.5rem"
            width="100%"
          />
          <Box 
            as="select"
            ref={selectRef}
            value={inningData.events.primary || ''}
            onChange={handleEventChange}
            disabled={!canEdit}
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            opacity="0"
            cursor="pointer"
          >
            <option value="" disabled>Event</option>
            {EVENT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Box>
        </Box>
        
        {/* Out field - for recording how a batter gets out */}
        <Input 
          size="xs" 
          placeholder="Out" 
          value={inningData.events.out || ''}
          onChange={(e) => handleInningChange('events.out', e.target.value)}
          isReadOnly={!canEdit}
          height="1.5rem"
        />
        
        {/* Note field - for additional information */}
        <Input 
          size="xs" 
          placeholder="Note" 
          value={inningData.events.note || ''}
          onChange={(e) => handleInningChange('events.note', e.target.value)}
          isReadOnly={!canEdit}
          height="1.5rem"
        />
      </VStack>
    </HStack>
  );
};

InningCell.propTypes = {
  inning: PropTypes.number,
  player: PropTypes.object,
  data: PropTypes.shape({
    diamond: PropTypes.shape({
      bases: PropTypes.array,
      scored: PropTypes.bool,
      rbi: PropTypes.number
    }),
    events: PropTypes.shape({
      primary: PropTypes.string,
      out: PropTypes.string,
      note: PropTypes.string
    })
  }),
  onInningChange: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  viewMode: PropTypes.string,
  isSubstituted: PropTypes.bool
};

export default InningCell;
