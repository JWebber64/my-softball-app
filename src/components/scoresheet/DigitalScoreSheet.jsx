import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import SubstitutionsModal from './SubstitutionsModal';
import UniversalScoreSheet from './UniversalScoreSheet';

const DigitalScoreSheet = ({
  data,
  onDataChange,
  viewMode = 'edit',
  canEdit = true,
  editable = true, // For backward compatibility
  showInningTotals = true,
  maxInnings = 7,
  teamId = null,
  enableVoiceCommands = false,
  showExtraInningsToggle = true,
}) => {
  // Combine canEdit and editable for backward compatibility
  const isEditable = canEdit && editable;

  const [isSubstitutionsModalOpen, setIsSubstitutionsModalOpen] = useState(false);

  const handleSubstitutionsOpen = () => {
    setIsSubstitutionsModalOpen(true);
  };

  const handleSubstitutionsClose = () => {
    setIsSubstitutionsModalOpen(false);
  };

  const handleSubstitutionChange = (playerIndex, inning) => {
    // Call the handleSubstitutionChange function from UniversalScoreSheet
    // This will need to be passed down from the parent component
    onDataChange({
      ...data,
      players: data.players.map((player, index) => {
        if (index === playerIndex) {
          return {
            ...player,
            substitutedInning: inning + 1, // Inning is 1-indexed
          };
        }
        return player;
      }),
    });
  };

  return (
    <>
      <Box
        width="100%"
        height="100%"
        overflowY="auto"
        overflowX="auto"
        className="digital-scoresheet-container"
        bg="white"
        color="black"
        borderRadius="md"
        borderColor="black"
        borderWidth="1px"
        p={2}
        sx={{
          '& input, & select, & textarea': {
            bg: 'white',
            color: 'black',
            borderColor: 'black',
          },
          '& input::placeholder, & select::placeholder, & textarea::placeholder': {
            color: 'black',
            opacity: 0.7,
          },
          // Style for the green line indicator for substitutions
          '& .substitution-indicator': {
            borderRight: '3px solid green',
          },
        }}
      >
        <UniversalScoreSheet
          data={data}
          onDataChange={onDataChange}
          viewMode={viewMode}
          canEdit={isEditable}
          showInningTotals={showInningTotals}
          maxInnings={maxInnings}
          teamId={teamId}
          enableVoiceCommands={enableVoiceCommands}
          onSubstitutionsOpen={handleSubstitutionsOpen}
        />
      </Box>
      <SubstitutionsModal
        isOpen={isSubstitutionsModalOpen}
        onClose={handleSubstitutionsClose}
        players={data?.players || []}
        onSubstitutionChange={handleSubstitutionChange}
        maxInnings={maxInnings}
      />
    </>
  );
};

DigitalScoreSheet.propTypes = {
  data: PropTypes.object,
  onDataChange: PropTypes.func,
  viewMode: PropTypes.oneOf(['edit', 'view', 'side-by-side']),
  canEdit: PropTypes.bool,
  editable: PropTypes.bool, // For backward compatibility
  showInningTotals: PropTypes.bool,
  maxInnings: PropTypes.number,
  teamId: PropTypes.string,
  enableVoiceCommands: PropTypes.bool,
  showExtraInningsToggle: PropTypes.bool,
};

export default DigitalScoreSheet;
