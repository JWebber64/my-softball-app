// Constants for parsing
export const PLAY_MAPPINGS = {
  HITS: {
    '1B': 'single',
    '2B': 'double',
    '3B': 'triple',
    'HR': 'homerun',
  },
  OUTS: {
    'K': 'strikeout',
    'F': 'flyout',
    'G': 'groundout',
    'DP': 'doubleplay',
    'L': 'lineout'
  },
  WALKS: {
    'BB': 'walk',
    'IBB': 'intentionalwalk',
    'HBP': 'hitbypitch'
  }
};

export const DIGITAL_SHEET_MAPPINGS = {
  POSITIONS: {
    'P': '1',
    'C': '2',
    '1B': '3',
    '2B': '4',
    '3B': '5',
    'SS': '6',
    'LF': '7',
    'CF': '8',
    'RF': '9',
    'DH': 'DH',
    'EH': 'EH'
  },
  PLAYS: {
    ...PLAY_MAPPINGS,
    ERRORS: {
      'E': 'error',
      'E-T': 'throwingerror'
    },
    OTHER: {
      'SAC': 'sacrifice',
      'FC': 'fielderschoice',
      'RBI': 'rbi'
    }
  }
};

export const PLAY_TYPES = {
  HIT: 'hit',
  OUT: 'out',
  WALK: 'walk',
  ERROR: 'error',
  OTHER: 'other'
};

export const FIELD_POSITIONS = {
  'P': '1',
  'C': '2',
  '1B': '3',
  '2B': '4',
  '3B': '5',
  'SS': '6',
  'LF': '7',
  'CF': '8',
  'RF': '9',
  'DH': 'DH',
  'EH': 'EH'
};

// Utility functions for parsing
export const cleanText = (text) => text.trim().toUpperCase();

export const extractInningNumber = (text) => {
  const match = text.match(/inning\s*(\d+)|^(\d+)(st|nd|rd|th)/i);
  return match ? parseInt(match[1] || match[2]) : null;
};

export const extractScore = (text) => {
  const match = text.match(/(\d+)\s*-\s*(\d+)/);
  return match ? { home: parseInt(match[1]), away: parseInt(match[2]) } : null;
};
