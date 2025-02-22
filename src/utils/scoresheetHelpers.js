export const getBasePosition = (baseIndex) => {
  const positions = [
    { bottom: '0', right: '0' },    // First base
    { top: '0', left: '50%' },      // Second base
    { bottom: '0', left: '0' },     // Third base
  ];
  return positions[baseIndex];
};

export const calculatePlayerTotals = (data, playerIndex) => {
  let hits = 0;
  let atBats = 0;

  data.plays?.[playerIndex]?.forEach(play => {
    if (play?.result) {
      if (['1B', '2B', '3B', 'HR'].includes(play.result)) {
        hits++;
        atBats++;
      } else if (['K', 'F', 'G'].includes(play.result)) {
        atBats++;
      }
    }
  });

  return `${hits}/${atBats}`;
};
