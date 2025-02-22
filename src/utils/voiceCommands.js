// Command types
export const COMMAND_TYPES = {
  NAVIGATION: 'navigation',
  SCORING: 'scoring',
  IMAGE: 'image',
  SYSTEM: 'system',
};

// Command definitions with their handlers
export const VOICE_COMMANDS = {
  // Navigation commands
  'next game': {
    type: COMMAND_TYPES.NAVIGATION,
    description: 'Move to next game',
    handler: (actions) => actions.onGameChange(actions.currentGame + 1),
  },
  'previous game': {
    type: COMMAND_TYPES.NAVIGATION,
    description: 'Move to previous game',
    handler: (actions) => actions.onGameChange(actions.currentGame - 1),
  },

  // Scoring commands
  'record hit': {
    type: COMMAND_TYPES.SCORING,
    description: 'Record a hit for current batter',
    handler: (actions) => actions.onScoreUpdate({ type: 'hit' }),
  },
  'record out': {
    type: COMMAND_TYPES.SCORING,
    description: 'Record an out for current batter',
    handler: (actions) => actions.onScoreUpdate({ type: 'out' }),
  },

  // Image controls
  'zoom in': {
    type: COMMAND_TYPES.IMAGE,
    description: 'Zoom in on scoresheet',
    handler: (actions) => actions.onZoom('+'),
  },
  'zoom out': {
    type: COMMAND_TYPES.IMAGE,
    description: 'Zoom out on scoresheet',
    handler: (actions) => actions.onZoom('-'),
  },

  // System commands
  'stop listening': {
    type: COMMAND_TYPES.SYSTEM,
    description: 'Stop voice recognition',
    handler: (actions) => actions.onToggle(false),
  },
};

// Helper function to parse spoken text and find matching commands
export const parseVoiceCommand = (spokenText) => {
  const normalizedText = spokenText.toLowerCase().trim();
  
  // Find the first matching command
  const matchedCommand = Object.entries(VOICE_COMMANDS).find(([command]) => 
    normalizedText.includes(command)
  );

  return matchedCommand ? {
    command: matchedCommand[0],
    ...matchedCommand[1]
  } : null;
};

// Group commands by type for the help dialog
export const getGroupedCommands = () => {
  const grouped = {};
  
  Object.entries(VOICE_COMMANDS).forEach(([command, details]) => {
    if (!grouped[details.type]) {
      grouped[details.type] = [];
    }
    grouped[details.type].push({
      command,
      description: details.description
    });
  });

  return grouped;
};