import { Input, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * PlayerCell - Component for displaying and editing player information
 */
const PlayerCell = ({
  player,
  onPlayerChange,
  editable = true,
  viewMode = 'edit',
  inningCount = 7,
}) => {
  // Generate innings 1-inningCount for the dropdown
  const innings = Array.from({ length: inningCount }, (_, i) => i + 1);

  // Handle player name change
  const handleNameChange = (e) => {
    if (!editable) return;
    onPlayerChange({
      ...player,
      name: e.target.value,
    });
  };

  return (
    <VStack spacing={2} align="stretch" p={1}>
      <Input
        size="sm"
        placeholder="Player Name"
        value={player.name || ''}
        onChange={handleNameChange}
        isReadOnly={!editable}
      />
    </VStack>
  );
};

PlayerCell.propTypes = {
  player: PropTypes.object.isRequired,
  onPlayerChange: PropTypes.func.isRequired,
  editable: PropTypes.bool,
  viewMode: PropTypes.string,
  inningCount: PropTypes.number,
};

export default PlayerCell;
