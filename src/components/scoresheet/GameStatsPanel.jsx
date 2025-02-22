import React, { useMemo } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
} from '@chakra-ui/react';

const GameStatsPanel = ({ playerData }) => {
  return (
    <div className="stats-panel">
      <h3>{playerData.name}</h3>
      <div className="stats-grid">
        <div>AB: {playerData.stats.atBats}</div>
        <div>H: {playerData.stats.hits}</div>
        <div>1B: {playerData.stats.singles}</div>
        <div>2B: {playerData.stats.doubles}</div>
        <div>3B: {playerData.stats.triples}</div>
        <div>HR: {playerData.stats.homeRuns}</div>
        <div>BB: {playerData.stats.walks}</div>
        <div>AVG: {playerData.stats.battingAvg}</div>
      </div>
    </div>
  );
};

export default GameStatsPanel;
