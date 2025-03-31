import { } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';
 
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

GameStatsPanel.propTypes = {
  playerData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    stats: PropTypes.shape({
      atBats: PropTypes.number.isRequired,
      hits: PropTypes.number.isRequired,
      singles: PropTypes.number.isRequired,
      doubles: PropTypes.number.isRequired,
      triples: PropTypes.number.isRequired,
      homeRuns: PropTypes.number.isRequired,
      walks: PropTypes.number.isRequired,
      battingAvg: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default GameStatsPanel;
