import { debounce } from 'lodash';

// Command types
export const COMMAND_TYPES = {
  NAVIGATION: 'navigation',
  SCORING: 'scoring',
  IMAGE: 'image',
  SYSTEM: 'system'
};

// Command definitions with their handlers
export const VOICE_COMMANDS = {
  // Navigation commands
  'next game': {
    type: COMMAND_TYPES.NAVIGATION,
    description: 'Move to next game',
    handler: (actions) => actions.onGameChange(actions.currentGame + 1),
    validation: (actions) => actions.currentGame < actions.totalGames
  },
  'previous game': {
    type: COMMAND_TYPES.NAVIGATION,
    description: 'Move to previous game',
    handler: (actions) => actions.onGameChange(actions.currentGame - 1),
    validation: (actions) => actions.currentGame > 1
  },

  // Scoring commands
  'record hit': {
    type: COMMAND_TYPES.SCORING,
    description: 'Record a hit for current batter',
    handler: (actions) => actions.onScoreUpdate({ type: 'hit' }),
    validation: (actions) => actions.isGameActive && !actions.isInningComplete
  },
  'record out': {
    type: COMMAND_TYPES.SCORING,
    description: 'Record an out',
    handler: (actions) => actions.onScoreUpdate({ type: 'out' }),
    validation: (actions) => actions.isGameActive && !actions.isInningComplete
  },
  'record run': {
    type: COMMAND_TYPES.SCORING,
    description: 'Record a run scored',
    handler: (actions) => actions.onScoreUpdate({ type: 'run' }),
    validation: (actions) => actions.isGameActive && !actions.isInningComplete
  },

  // Image commands
  'take photo': {
    type: COMMAND_TYPES.IMAGE,
    description: 'Capture scoresheet photo',
    handler: (actions) => actions.onCaptureImage(),
    validation: (actions) => actions.hasCamera
  },
  'scan sheet': {
    type: COMMAND_TYPES.IMAGE,
    description: 'Scan and process scoresheet',
    handler: (actions) => actions.onScanSheet(),
    validation: (actions) => actions.hasCamera && actions.isOcrReady
  },

  // System commands
  'undo last': {
    type: COMMAND_TYPES.SYSTEM,
    description: 'Undo last action',
    handler: (actions) => actions.onUndo(),
    validation: (actions) => actions.canUndo
  },
  'save game': {
    type: COMMAND_TYPES.SYSTEM,
    description: 'Save current game state',
    handler: (actions) => actions.onSaveGame(),
    validation: (actions) => actions.isGameActive && actions.hasUnsavedChanges
  }
};

export class VoiceCommandManager {
  constructor(options = {}) {
    this.recognition = null;
    this.isListening = false;
    this.actions = {};
    this.onCommandExecuted = options.onCommandExecuted || (() => {});
    this.onError = options.onError || console.error;
    
    this.debouncedProcess = debounce(this.processCommand.bind(this), 300);
    
    this.initializeSpeechRecognition();
  }

  initializeSpeechRecognition() {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.toLowerCase().trim();
      this.debouncedProcess(command);
    };

    this.recognition.onerror = (event) => {
      this.onError(event.error);
    };
  }

  setActions(actions) {
    this.actions = actions;
  }

  start() {
    if (this.isListening) return;
    
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      this.onError(error);
    }
  }

  stop() {
    if (!this.isListening) return;
    
    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (error) {
      this.onError(error);
    }
  }

  processCommand(command) {
    const matchedCommand = Object.entries(VOICE_COMMANDS)
      .find(([key]) => command.includes(key));

    if (!matchedCommand) return;

    const [key, commandConfig] = matchedCommand;

    if (commandConfig.validation && !commandConfig.validation(this.actions)) {
      this.onError(`Command "${key}" validation failed`);
      return;
    }

    try {
      commandConfig.handler(this.actions);
      this.onCommandExecuted(key, commandConfig.type);
    } catch (error) {
      this.onError(`Error executing command "${key}": ${error.message}`);
    }
  }

  destroy() {
    this.stop();
    this.recognition = null;
    if (this.debouncedProcess) {
      this.debouncedProcess.cancel();
    }
  }
}

export function parseVoiceCommand(transcript) {
  const command = transcript.toLowerCase().trim();
  
  const matchedCommand = Object.entries(VOICE_COMMANDS)
    .find(([key]) => command.includes(key));

  if (!matchedCommand) return null;

  const [key, commandConfig] = matchedCommand;
  
  return {
    command: key,
    type: commandConfig.type,
    handler: commandConfig.handler
  };
}

