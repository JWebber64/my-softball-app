import PropTypes from 'prop-types';
import React from 'react';
import ViewControls from './ViewControls';

/**
 * NavigationControls - Wrapper for backward compatibility
 * 
 * This component uses the consolidated ViewControls with canNavigate=true
 */
const NavigationControls = ({
  currentGame,
  totalGames,
  onGameChange,
  additionalControls
}) => {
  return (
    <ViewControls
      viewMode="digital" // Default view mode
      onViewModeChange={() => {}} // No-op function
      canNavigate={true}
      currentGame={currentGame}
      totalGames={totalGames}
      onGameChange={onGameChange}
      additionalControls={additionalControls}
    />
  );
};

NavigationControls.propTypes = {
  currentGame: PropTypes.number.isRequired,
  totalGames: PropTypes.number.isRequired,
  onGameChange: PropTypes.func.isRequired,
  additionalControls: PropTypes.node
};

export default NavigationControls;


