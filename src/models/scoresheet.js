/**
 * Standard data structure for digital scoresheets
 * This serves as the single source of truth for scoresheet data format
 */

/**
 * Creates an empty inning cell data structure
 * @returns {Object} Empty inning cell data
 */
export const createEmptyInning = () => ({
  diamond: { 
    bases: [false, false, false], 
    scored: false 
  },
  events: { 
    primary: '', 
    out: '', 
    note: '' 
  }
});

/**
 * Creates an empty player data structure
 * @param {number} index - Player index for default ID
 * @param {number} maxInnings - Number of innings to create
 * @returns {Object} Empty player data
 */
export const createEmptyPlayer = (index, maxInnings = 7) => ({
  id: `player-${index}`,
  name: '',
  position: '',
  number: '',
  innings: Array(maxInnings).fill().map(() => createEmptyInning()),
  substitutedInning: null
});

/**
 * Creates an empty scoresheet data structure
 * @param {number} maxInnings - Number of innings to create
 * @param {number} numPlayers - Number of players to create
 * @returns {Object} Empty scoresheet data
 */
export const createEmptyScoreSheet = (maxInnings = 7, numPlayers = 9) => ({
  gameInfo: {
    date: new Date().toISOString().split('T')[0],
    opponent: '',
    location: '',
    isHome: true,
    gameId: null,
    teamId: null,
    weather: '',
    notes: ''
  },
  players: Array(numPlayers).fill().map((_, index) => createEmptyPlayer(index, maxInnings)),
  inningTotals: Array(maxInnings).fill(0),
  totalRuns: 0,
  metadata: {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    createdBy: null,
    isComplete: false,
    isVerified: false
  }
});

/**
 * Validates a scoresheet data structure
 * @param {Object} data - Scoresheet data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateScoreSheet = (data) => {
  const errors = [];
  
  // Check if data exists
  if (!data) {
    return { isValid: false, errors: ['No scoresheet data provided'] };
  }
  
  // Check required top-level properties
  const requiredProps = ['gameInfo', 'players', 'inningTotals', 'totalRuns'];
  requiredProps.forEach(prop => {
    if (!data[prop]) {
      errors.push(`Missing required property: ${prop}`);
    }
  });
  
  // Check players array
  if (data.players && Array.isArray(data.players)) {
    if (data.players.length === 0) {
      errors.push('Players array is empty');
    }
    
    // Check each player
    data.players.forEach((player, index) => {
      if (!player.innings || !Array.isArray(player.innings)) {
        errors.push(`Player at index ${index} is missing innings array`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Converts legacy scoresheet data to the standardized format
 * @param {Object} legacyData - Legacy scoresheet data
 * @returns {Object} Standardized scoresheet data
 */
export const convertLegacyScoreSheet = (legacyData) => {
  if (!legacyData) return createEmptyScoreSheet();
  
  // Start with an empty scoresheet
  const standardData = createEmptyScoreSheet(
    legacyData.players?.[0]?.innings?.length || 7,
    legacyData.players?.length || 9
  );
  
  // Copy game info
  if (legacyData.gameInfo) {
    standardData.gameInfo = {
      ...standardData.gameInfo,
      ...legacyData.gameInfo
    };
  }
  
  // Copy players
  if (legacyData.players && Array.isArray(legacyData.players)) {
    standardData.players = legacyData.players.map((player, index) => {
      const standardPlayer = createEmptyPlayer(index, standardData.players[0].innings.length);
      
      return {
        ...standardPlayer,
        id: player.id || standardPlayer.id,
        name: player.name || '',
        position: player.position || '',
        number: player.number || '',
        substitutedInning: player.substitutedInning || null,
        innings: player.innings?.map(inning => ({
          diamond: {
            bases: inning.diamond?.bases || [false, false, false],
            scored: inning.diamond?.scored || false
          },
          events: {
            primary: inning.events?.primary || '',
            out: inning.events?.out || '',
            note: inning.events?.note || ''
          }
        })) || standardPlayer.innings
      };
    });
  }
  
  // Copy inning totals and total runs
  if (legacyData.inningTotals && Array.isArray(legacyData.inningTotals)) {
    standardData.inningTotals = legacyData.inningTotals;
  }
  
  standardData.totalRuns = legacyData.totalRuns || 0;
  
  // Add metadata
  standardData.metadata = {
    ...standardData.metadata,
    lastUpdated: new Date().toISOString(),
    isComplete: false,
    isVerified: false
  };
  
  return standardData;
};