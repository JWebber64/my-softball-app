import React from 'react';
import PropTypes from 'prop-types';
import { Box, Input, Text } from '@chakra-ui/react';
import { INNING_CELL_STYLES } from '../../styles/constants';

/**
 * Standard inning cell component for the digital scoresheet
 * 
 * Layout follows v1.0-scoresheet-layout:
 * - Left column (5.5rem height):
 *   - RBI text at top
 *   - Centered diamond (1.5rem)
 *   - Equal spacing above/below
 * - Right column:
 *   - 3 vertical inputs (w-14)
 *   - Event/Out/Note fields
 * - 0.75rem column gap
 */
const InningCell = ({ 
  inning, 
  player, 
  data = {}, 
  onChange 
}) => {
  const handleChange = (field, value) => {
    if (onChange) {
      onChange({
        inning,
        player,
        field,
        value
      });
    }
  };

  return (
    <Box sx={INNING_CELL_STYLES.container}>
      {/* Left column with RBI and diamond */}
      <Box sx={INNING_CELL_STYLES.diamondColumn}>
        <Text fontSize="xs">RBI: {data.rbi || 0}</Text>
        <Box 
          sx={INNING_CELL_STYLES.diamond}
          bg={data.hit ? 'green.100' : 'transparent'}
        />
        <Box h="0.5rem" /> {/* Spacer for equal spacing */}
      </Box>

      {/* Right column with input fields */}
      <Box sx={INNING_CELL_STYLES.inputColumn}>
        <Input
          sx={INNING_CELL_STYLES.input}
          placeholder="Event"
          value={data.event || ''}
          onChange={(e) => handleChange('event', e.target.value)}
        />
        <Input
          sx={INNING_CELL_STYLES.input}
          placeholder="Out"
          value={data.out || ''}
          onChange={(e) => handleChange('out', e.target.value)}
        />
        <Input
          sx={INNING_CELL_STYLES.input}
          placeholder="Note"
          value={data.note || ''}
          onChange={(e) => handleChange('note', e.target.value)}
        />
      </Box>
    </Box>
  );
};

InningCell.propTypes = {
  inning: PropTypes.number.isRequired,
  player: PropTypes.number.isRequired,
  data: PropTypes.shape({
    rbi: PropTypes.number,
    hit: PropTypes.bool,
    event: PropTypes.string,
    out: PropTypes.string,
    note: PropTypes.string
  }),
  onChange: PropTypes.func
};

export default InningCell;
