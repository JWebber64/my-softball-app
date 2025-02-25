import React, { createContext, useContext, useState } from 'react';

const BaseballCardContext = createContext();

export const BaseballCardProvider = ({ children }) => {
  const [cardSettings, setCardSettings] = useState({
    showStats: true,
    enableExport: true,
    enableFlip: true,
    theme: {
      primary: '#545e46',
      secondary: '#2d3436',
      text: '#ffffff'
    }
  });

  return (
    <BaseballCardContext.Provider value={{ cardSettings, setCardSettings }}>
      {children}
    </BaseballCardContext.Provider>
  );
};

export const useBaseballCard = () => useContext(BaseballCardContext);