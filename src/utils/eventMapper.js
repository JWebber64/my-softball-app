// Event mapping for softball scoresheet
export const EventMapper = {
  // Hits
  '1B': { label: '1B', type: 'hit', description: 'Single' },
  '2B': { label: '2B', type: 'hit', description: 'Double' },
  '3B': { label: '3B', type: 'hit', description: 'Triple' },
  'HR': { label: 'HR', type: 'hit', description: 'Home Run' },
  
  // Outs
  'K': { label: 'K', type: 'out', description: 'Strikeout Swinging' },
  'ꓘ': { label: 'ꓘ', type: 'out', description: 'Strikeout Looking' },
  'FO': { label: 'FO', type: 'out', description: 'Fly Out' },
  'GO': { label: 'GO', type: 'out', description: 'Ground Out' },
  'LO': { label: 'LO', type: 'out', description: 'Line Out' },
  'DP': { label: 'DP', type: 'out', description: 'Double Play' },
  
  // Runner advancement
  '1TO2': { label: '1→2', type: 'advance', description: 'Runner advanced to 2nd' },
  '2TO3': { label: '2→3', type: 'advance', description: 'Runner advanced to 3rd' },
  '3HOME': { label: '3→H', type: 'advance', description: 'Runner scored' },
  
  // Force outs
  'FO2': { label: 'FO@2', type: 'out', description: 'Force Out at 2nd' },
  'FO3': { label: 'FO@3', type: 'out', description: 'Force Out at 3rd' },
  'FOH': { label: 'FO@H', type: 'out', description: 'Force Out at Home' },
  
  // RBIs
  'RBI1': { label: 'RBI', type: 'rbi', description: '1 RBI' },
  'RBI2': { label: 'RBI×2', type: 'rbi', description: '2 RBIs' },
  'RBI3': { label: 'RBI×3', type: 'rbi', description: '3 RBIs' },
  'RBI4': { label: 'RBI×4', type: 'rbi', description: '4 RBIs' },
  
  // Other
  'BB': { label: 'BB', type: 'other', description: 'Base on Balls (Walk)' },
  'FC': { label: 'FC', type: 'other', description: 'Fielder\'s Choice' },
  'SAC': { label: 'SAC', type: 'other', description: 'Sacrifice' },
  
  // Errors
  'E1': { label: 'E1', type: 'error', description: 'Error by Pitcher' },
  'E2': { label: 'E2', type: 'error', description: 'Error by Catcher' },
  'E3': { label: 'E3', type: 'error', description: 'Error by 1st Baseman' },
  'E4': { label: 'E4', type: 'error', description: 'Error by 2nd Baseman' },
  'E5': { label: 'E5', type: 'error', description: 'Error by 3rd Baseman' },
  'E6': { label: 'E6', type: 'error', description: 'Error by Shortstop' },
  'E7': { label: 'E7', type: 'error', description: 'Error by Left Fielder' },
  'E8': { label: 'E8', type: 'error', description: 'Error by Center Fielder' },
  'E9': { label: 'E9', type: 'error', description: 'Error by Right Fielder' },
  'E10': { label: 'E10', type: 'error', description: 'Error by Extra Fielder' },
  
  // Helper function to get event details
  getEventDetails(eventCode) {
    return this[eventCode] || { label: eventCode, type: 'unknown', description: 'Unknown event' };
  }
};

export default EventMapper;
