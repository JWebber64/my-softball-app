import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const StatDisplay = ({ stats, previousStats, showComparison = true }) => {
  const calculateChange = (current, previous) => {
    if (!previous) return null;
    return ((current - previous) / previous) * 100;
  };

  const renderStat = (label, value, previousValue) => {
    const change = showComparison ? calculateChange(value, previousValue) : null;

    return (
      <GridItem key={label}>
        <Stat
          p={4}
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          _hover={{ boxShadow: "md" }}
          transition="all 0.2s"
        >
          <StatLabel color="gray.600" fontSize="sm">{label}</StatLabel>
          <StatNumber fontSize="2xl" color="brand.primary.base">
            {typeof value === 'number' ? value.toFixed(3) : value}
          </StatNumber>
          {change !== null && (
            <StatHelpText>
              <StatArrow type={change >= 0 ? 'increase' : 'decrease'} />
              {Math.abs(change).toFixed(1)}%
            </StatHelpText>
          )}
        </Stat>
      </GridItem>
    );
  };

  return (
    <Box>
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)"
        }}
        gap={4}
      >
        {Object.entries(stats).map(([key, value]) => 
          renderStat(key, value, previousStats?.[key])
        )}
      </Grid>
    </Box>
  );
};

StatDisplay.propTypes = {
  stats: PropTypes.object.isRequired,
  previousStats: PropTypes.object,
  showComparison: PropTypes.bool
};

export default StatDisplay;

