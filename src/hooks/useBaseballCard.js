import { useContext } from 'react';
import { BaseballCardContext } from '../context/BaseballCardContext';

export const useBaseballCard = () => {
  const context = useContext(BaseballCardContext);
  
  if (!context) {
    throw new Error('useBaseballCard must be used within a BaseballCardProvider');
  }
  
  const {
    frontImage,
    setFrontImage,
    backImage,
    setBackImage,
    isFlipped,
    handleFlip,
    isLoading
  } = context;

  return {
    frontImage,
    setFrontImage,
    backImage,
    setBackImage,
    isFlipped,
    handleFlip,
    isLoading
  };
};