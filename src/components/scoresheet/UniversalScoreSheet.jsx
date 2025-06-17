import {
  Box,
  Button,
  Flex,
  HStack,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { convertLegacyScoreSheet, createEmptyScoreSheet, validateScoreSheet } from '../../models/scoresheet';
import InningCell from './InningCell';
import PlayerCell from './PlayerCell';

/**
 * UniversalScoreSheet - Core component for digital scoresheet display and editing
 * 
 * This component serves as the single source of truth for all scoresheet functionality
 * and can be used in various contexts (manual entry, voice input, side-by-side view, etc.)
 */
const UniversalScoreSheet = ({
  data,
  onDataChange,
  viewMode = 'edit',
  isLoading = false,
  canEdit = true,
  showInningTotals = true,
  maxInnings = 7,
  teamId = null,
  enableVoiceCommands = false,
  showExtraInningsToggle = false,
  onSubstitutionsOpen = null,
}) => {
  // State for tracking the current scoresheet data
  const [scoreSheetData, setScoreSheetData] = useState(() => {
    // If data is provided, convert it to standard format if needed
    if (data) {
      const validation = validateScoreSheet(data);
      return validation.isValid ? data : convertLegacyScoreSheet(data);
    }
    // Otherwise create empty scoresheet
    return createEmptyScoreSheet(maxInnings);
  });
  
  // Voice command state
  const [voiceCommandActive, setVoiceCommandActive] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  
  // Extra innings toggle state
  const [showExtraInnings, setShowExtraInnings] = useState(false);

  // Update internal state when external data changes
  useEffect(() => {
    if (data) {
      const validation = validateScoreSheet(data);
      const standardizedData = validation.isValid ? data : convertLegacyScoreSheet(data);
      setScoreSheetData(standardizedData);
    }
  }, [data]);

  // Handle changes to player data
  const handlePlayerChange = (playerIndex, updatedPlayer) => {
    const newData = { ...scoreSheetData };
    newData.players[playerIndex] = updatedPlayer;
    setScoreSheetData(newData);
    onDataChange?.(newData);
  };

  // Handle changes to inning data
  const handleInningChange = (playerIndex, inningIndex, field, value) => {
    if (!canEdit) return;
    
    const updatedPlayers = [...scoreSheetData.players];
    const updatedInnings = [...updatedPlayers[playerIndex].innings];
    
    // Handle nested fields (diamond.bases, diamond.scored, events.primary, etc.)
    if (field.includes('.')) {
      const [parentField, childField] = field.split('.');
      updatedInnings[inningIndex] = {
        ...updatedInnings[inningIndex],
        [parentField]: {
          ...updatedInnings[inningIndex][parentField],
          [childField]: value,
        },
      };
    } else {
      updatedInnings[inningIndex] = {
        ...updatedInnings[inningIndex],
        [field]: value,
      };
    }
    
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      innings: updatedInnings,
    };
    
    // Recalculate inning totals if a run is scored
    let updatedInningTotals = [...scoreSheetData.inningTotals];
    if (field === 'diamond.scored') {
      updatedInningTotals = scoreSheetData.players.map((player, pIdx) => {
        return Array(maxInnings).fill().map((_, iIdx) => {
          // Count scored runs for this inning across all players
          return scoreSheetData.players.reduce((total, p, idx) => {
            // If this is the current player being updated, use the new value
            if (idx === playerIndex && iIdx === inningIndex) {
              return total + (value ? 1 : 0);
            }
            // Otherwise use the existing value
            return total + (p.innings[iIdx]?.diamond?.scored ? 1 : 0);
          }, 0);
        });
      })[0]; // Take the first player's calculation (they should all be the same)
    }
    
    const totalRuns = updatedInningTotals.reduce((sum, runs) => sum + runs, 0);
    
    const updatedData = {
      ...scoreSheetData,
      players: updatedPlayers,
      inningTotals: updatedInningTotals,
      totalRuns,
      metadata: {
        ...scoreSheetData.metadata,
        lastUpdated: new Date().toISOString()
      }
    };
    
    setScoreSheetData(updatedData);
    if (onDataChange) onDataChange(updatedData);
  };

  // Handle substitution changes
  const handleSubstitutionChange = (playerIndex, inning) => {
    if (!canEdit) return;
    
    const updatedPlayers = [...scoreSheetData.players];
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      substitutedInning: inning,
    };
    
    const updatedData = {
      ...scoreSheetData,
      players: updatedPlayers,
    };
    
    setScoreSheetData(updatedData);
    if (onDataChange) onDataChange(updatedData);
// Call this function when a substitution is made from the substitutions modal
  };

  // Generate inning header cells
  const renderInningHeaders = () => {
    const displayInnings = showExtraInnings ? maxInnings : 7;
    return Array(displayInnings).fill().map((_, index) => (
      <Th 
        key={`inning-header-${index}`}
        textAlign="center"
        width="100px"
        borderColor="brand.border"
        color="brand.text.primary"
      >
        {index + 1}
      </Th>
    ));
  };

  // Generate inning total cells
  const renderInningTotals = () => {
    const displayInnings = showExtraInnings ? maxInnings : 7;
    return scoreSheetData.inningTotals.slice(0, displayInnings).map((total, index) => (
      <Td 
        key={`inning-total-${index}`}
        textAlign="center"
        borderColor="brand.border"
        fontWeight="bold"
        color="brand.text.primary"
      >
        {total}
      </Td>
    ));
  };

  // If loading, show spinner
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="400px">
        <Spinner size="xl" color="brand.primary.base" />
      </Flex>
    );
  }

  return (
    <Box width="100%">
      {/* Control Buttons */}
{(showExtraInningsToggle || onSubstitutionsOpen) && (
  <HStack mb={4} spacing={4} justify="flex-end">
    {showExtraInningsToggle && (
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
    )}
    {onSubstitutionsOpen && (
      <Button
        size="md"
        bg="#2e3726"
        color="white"
        _hover={{ bg: "#3a4531" }}
        onClick={onSubstitutionsOpen}
        leftIcon={
          <Box as="span" fontSize="1.2em">
            ⇄
          </Box>
        }
      >
        Substitutions
      </Button>
    )}
  </HStack>
)}

      {/* Scoresheet Table */}
      <Box 
        width="100%" 
        overflowX="auto"
        bg="white"
        borderWidth="1px"
        borderColor="black"
        borderRadius="md"
      >
        <Table variant="simple" size="sm" bg="white">
          <Thead>
            <Tr>
              <Th 
                width="200px"
                borderColor="black"
                color="black"
              >
                Player
              </Th>
              {renderInningHeaders()}
              <Th 
                textAlign="center"
                borderColor="black"
                color="black"
              >
                Total
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {scoreSheetData.players.map((player, playerIndex) => (
              <Tr key={`player-row-${playerIndex}`}>
                <Td 
                  borderColor="black"
                  padding="0"
                >
                  <PlayerCell 
                    player={player}
                    onPlayerChange={(updatedPlayer) => handlePlayerChange(playerIndex, updatedPlayer)}
                    editable={canEdit}
                    viewMode={viewMode}
                  />
                </Td>
                
                {player.innings.slice(0, showExtraInnings ? maxInnings : 7).map((inning, inningIndex) => (
                  <Td 
                    key={`inning-${playerIndex}-${inningIndex}`}
                    borderColor="black"
                    padding="0"
                  >
                    <InningCell 
                      inning={inningIndex + 1}
                      player={playerIndex}
                      data={inning}
                      onInningChange={(field, value) => 
                        handleInningChange(playerIndex, inningIndex, field, value)
                      }
                      canEdit={canEdit}
                      viewMode={viewMode}
                      isSubstituted={player.substitutedInning !== null && 
                                    inningIndex + 1 < player.substitutedInning}
                    />
                  </Td>
                ))}
                
                <Td 
                  textAlign="center"
                  borderColor="black"
                  fontWeight="bold"
                  color="black"
                >
                  {player.innings.reduce((total, inning) => 
                    total + (inning.diamond?.scored ? 1 : 0), 0)}
                </Td>
              </Tr>
            ))}
            
            {showInningTotals && (
              <Tr>
                <Td 
                  borderColor="black"
                  fontWeight="bold"
                  color="black"
                >
                  Inning Totals
                </Td>
                {renderInningTotals()}
                <Td 
                  textAlign="center"
                  borderColor="black"
                  fontWeight="bold"
                  color="black"
                >
                  {scoreSheetData.totalRuns}
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

UniversalScoreSheet.propTypes = {
  data: PropTypes.shape({
    gameInfo: PropTypes.object,
    players: PropTypes.array,
    inningTotals: PropTypes.array,
    totalRuns: PropTypes.number,
  }),
  onDataChange: PropTypes.func,
  viewMode: PropTypes.oneOf(['edit', 'view', 'side-by-side']),
  isLoading: PropTypes.bool,
  canEdit: PropTypes.bool,
  showInningTotals: PropTypes.bool,
  maxInnings: PropTypes.number,
  teamId: PropTypes.string,
  enableVoiceCommands: PropTypes.bool,
  showExtraInningsToggle: PropTypes.bool,
  onSubstitutionsOpen: PropTypes.func,
};

export default UniversalScoreSheet;







