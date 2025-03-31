import PropTypes from 'prop-types';
import React, { createContext, useState } from 'react';

export const BaseballCardContext = createContext(); // Export the context directly

export const BaseballCardProvider = ({ children }) => {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playerData, setPlayerData] = useState({
    name: '',
    position: '',
    teamName: '',
    jerseyNumber: '',
    stats: {},
    season: '',
    cardNumber: '',
    teamLogo: ''
  });

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const updatePlayerData = (newData) => {
    setPlayerData(prev => ({
      ...prev,
      ...newData
    }));
  };

  const value = {
    frontImage,
    setFrontImage,
    backImage,
    setBackImage,
    isFlipped,
    isLoading,
    setIsLoading,
    handleFlip,
    playerData,
    updatePlayerData
  };

  return (
    <BaseballCardContext.Provider value={value}>
      {children}
    </BaseballCardContext.Provider>
  );
};

BaseballCardProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Export the provider as default
export default BaseballCardProvider;


