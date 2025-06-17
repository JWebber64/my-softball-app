import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

/**
 * GameStatsPanel - Displays game statistics calculated from UniversalScoreSheet data
 */
const GameStatsPanel = ({ scoreSheetData }) => {
  const stats = useMemo(() => {
    if (!scoreSheetData || !scoreSheetData.players) {
      return {
        totalRuns: 0,
        totalHits: 0,
        totalOuts: 0,
        battingAverage: '0.000',
        onBasePercentage: '0.000'
      };
    }

    // Calculate stats from UniversalScoreSheet data format
    let runs = 0;
    let hits = 0;
    let outs = 0;
    let atBats = 0;
    let onBase = 0;

    scoreSheetData.players.forEach(player => {
      player.innings.forEach(inning => {
        if (inning.diamond?.scored) runs++;
        
        // Count hits based on primary event
        if (inning.events?.primary?.includes('1B') || 
            inning.events?.primary?.includes('2B') || 
            inning.events?.primary?.includes('3B') || 
            inning.events?.primary?.includes('HR')) {
          hits++;
          atBats++;
          onBase++;
        } 
        // Count outs
        else if (inning.events?.out) {
          outs++;
          atBats++;
        }
        // Count walks/HBP for OBP
        else if (inning.events?.primary?.includes('BB') || 
                inning.events?.primary?.includes('HBP')) {
          onBase++;
        }
      });
    });

    const battingAvg = atBats > 0 ? (hits / atBats).toFixed(3) : '0.000';
    const obp = (atBats + (onBase - hits)) > 0 ? 
      (onBase / (atBats + (onBase - hits))).toFixed(3) : '0.000';

    return {
      totalRuns: runs,
      totalHits: hits,
      totalOuts: outs,
      battingAverage: battingAvg,
      onBasePercentage: obp
    };
  }, [scoreSheetData]);

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
      <Heading size="md" mb={4}>Game Statistics</Heading>
      <SimpleGrid columns={[2, null, 5]} spacing={4}>
        <Stat>
          <StatLabel>Runs</StatLabel>
          <StatNumber>{stats.totalRuns}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Hits</StatLabel>
          <StatNumber>{stats.totalHits}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Outs</StatLabel>
          <StatNumber>{stats.totalOuts}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Batting Avg</StatLabel>
          <StatNumber>{stats.battingAverage}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>OBP</StatLabel>
          <StatNumber>{stats.onBasePercentage}</StatNumber>
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

GameStatsPanel.propTypes = {
  scoreSheetData: PropTypes.shape({
    players: PropTypes.array,
    inningTotals: PropTypes.array,
    totalRuns: PropTypes.number
  })
};

export default GameStatsPanel;

