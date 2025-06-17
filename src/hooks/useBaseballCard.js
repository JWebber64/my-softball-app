import { useState } from 'react';

export const useBaseballCard = () => {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return {
    frontImage,
    setFrontImage,
    backImage,
    setBackImage,
    isFlipped,
    handleFlip,
    isLoading,
    setIsLoading
  };
};
