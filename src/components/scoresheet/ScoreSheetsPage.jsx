import React, { useState } from 'react';
import DigitalScoreSheet from './DigitalScoreSheet';

// Rename this component to avoid conflict with the page component
const ScoreSheetViewer = () => {
  const [scoreSheetData, setScoreSheetData] = useState({});

  return (
    <div>
      <DigitalScoreSheet 
        data={scoreSheetData}
        onDataChange={setScoreSheetData}
      />
    </div>
  );
};

export default ScoreSheetViewer;
