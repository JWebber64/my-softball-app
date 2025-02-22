import { createWorker } from 'tesseract.js';
import * as tf from '@tensorflow/tfjs';
import { PLAY_MAPPINGS, DIGITAL_SHEET_MAPPINGS } from '../utils/scoresheetParser';

function cleanText(text) {
  return text.replace(/[^\w\s\-\/|]|_/g, '').trim();
}

function parsePlay(text) {
  const cleanedText = cleanText(text).toUpperCase();
  
  // If empty or whitespace, return empty play
  if (!cleanedText) {
    return {
      event: '',
      type: 'empty',
      value: '',
      label: '',
      custom: ''
    };
  }
  
  // Check hits
  for (const [key, value] of Object.entries(PLAY_MAPPINGS.HITS)) {
    if (cleanedText.includes(key)) {
      return {
        event: value,
        type: 'hit',
        value: value,
        label: key.toLowerCase(),
        custom: text.trim()
      };
    }
  }

  // Check outs
  for (const [key, value] of Object.entries(PLAY_MAPPINGS.OUTS)) {
    if (cleanedText.includes(key)) {
      return {
        event: value,
        type: 'out',
        value: value,
        label: key.toLowerCase(),
        custom: text.trim()
      };
    }
  }

  // Check walks
  for (const [key, value] of Object.entries(PLAY_MAPPINGS.WALKS)) {
    if (cleanedText.includes(key)) {
      return {
        event: value,
        type: 'walk',
        value: value,
        label: key.toLowerCase(),
        custom: text.trim()
      };
    }
  }

  // If no match found, return unknown play
  return {
    event: 'unknown',
    type: 'unknown',
    value: cleanedText,
    label: cleanedText,
    custom: text.trim()
  };
}

function parseScoreSheet(text) {
  const lines = text.split('\n');
  const players = [];
  let currentPlayer = null;
  
  // Initialize innings with empty plays arrays
  const innings = Array(7).fill().map((_, idx) => ({
    number: idx + 1,
    plays: []
  }));

  // Parse the text and extract player data
  for (let i = 0; i < lines.length; i++) {
    const line = cleanText(lines[i]);
    
    if (!line) continue;

    // Check if line contains player name
    if (/^[A-Za-z]+\s*\d*\s*$/i.test(line) && line.length > 2) {
      if (currentPlayer) {
        players.push(currentPlayer);
      }
      
      currentPlayer = {
        name: line.trim(),
        number: '',
        position: '',
        sub: { name: '', inning: '' },
        innings: Array(7).fill().map(() => ({
          event: '',
          outDetails: '',
          custom: ''
        }))
      };
    }
    
    // Parse play data and assign to current player's innings
    if (currentPlayer && /[1-7][A-Z]+/.test(line)) {
      const inningMatch = line.match(/^(\d)/);
      if (inningMatch) {
        const inningIndex = parseInt(inningMatch[1]) - 1;
        const playData = parsePlay(line.substring(1));
        
        if (inningIndex >= 0 && inningIndex < 7) {
          currentPlayer.innings[inningIndex] = {
            event: playData.event,
            outDetails: playData.type === 'out' ? playData.value : '',
            custom: playData.custom
          };
        }
      }
    }
  }

  // Don't forget to push the last player
  if (currentPlayer) {
    players.push(currentPlayer);
  }

  // Return the formatted data structure
  return {
    players,
    gameInfo: {
      gameNumber: extractGameNumber(text),
      date: extractDate(text),
      time: extractTime(text),
      field: extractField(text)
    },
    teams: {
      home: extractHomeTeam(text),
      away: extractAwayTeam(text)
    }
  };
}

// Helper functions to extract specific data
function extractGameNumber(text) {
  const match = text.match(/Game\s*#?\s*(\d+)/i);
  return match ? match[1] : '';
}

function extractDate(text) {
  const match = text.match(/Date:\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
  return match ? match[1] : new Date().toISOString().split('T')[0];
}

function extractTime(text) {
  const match = text.match(/Time:\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
  return match ? match[1] : '';
}

function extractField(text) {
  const match = text.match(/Field:\s*([^,\n]+)/i);
  return match ? match[1].trim() : '';
}

function extractHomeTeam(text) {
  const match = text.match(/Home:\s*([^,\n]+)/i);
  return match ? match[1].trim() : '';
}

function extractAwayTeam(text) {
  const match = text.match(/Away:\s*([^,\n]+)/i);
  return match ? match[1].trim() : '';
}

export class OCRService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    this.onProgress = null;
    this.opencvReady = false;
  }

  // Add OpenCV waiting function
  waitForOpenCV() {
    return new Promise((resolve, reject) => {
      if (window.cv) {
        this.opencvReady = true;
        resolve();
      } else {
        // Wait for OpenCV to be loaded
        const maxAttempts = 30;
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (window.cv) {
            clearInterval(interval);
            this.opencvReady = true;
            resolve();
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error('OpenCV failed to load'));
          }
        }, 250);
      }
    });
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Get the base URL for the public folder
      const publicUrl = window.location.origin;
      
      // Test if we can access the training data
      const response = await fetch(`${publicUrl}/tessdata/eng.traineddata`);
      if (!response.ok) {
        throw new Error('Could not load training data file');
      }
      console.log('Training data file accessible');

      this.worker = await createWorker({
        logger: m => {
          console.log('Tesseract progress:', m);
          if (this.onProgress) {
            this.onProgress({
              status: m.status,
              progress: m.progress || 0
            });
          }
        },
        langPath: `${publicUrl}/tessdata`,
        gzip: false
      });

      console.log('Loading English language data...');
      await this.worker.loadLanguage('eng');
      
      console.log('Initializing Tesseract with English...');
      await this.worker.initialize('eng');

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize OCR service:', error);
      throw new Error('OCR initialization failed: ' + error.message);
    }
  }

  async preprocessImage(imageData) {
    // Skip preprocessing if OpenCV isn't available
    if (!window.cv) {
      console.log('OpenCV not available, proceeding with original image');
      return imageData;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      ctx.drawImage(imageData, 0, 0);

      const mat = window.cv.imread(canvas);
      
      // Convert to grayscale
      const gray = new window.cv.Mat();
      window.cv.cvtColor(mat, gray, window.cv.COLOR_RGBA2GRAY);

      // Apply Gaussian blur to reduce noise
      const blurred = new window.cv.Mat();
      window.cv.GaussianBlur(gray, blurred, new window.cv.Size(3, 3), 0);

      // Apply adaptive threshold
      const binary = new window.cv.Mat();
      window.cv.adaptiveThreshold(
        blurred, 
        binary, 
        255,
        window.cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        window.cv.THRESH_BINARY,
        21, 
        10
      );

      // Display result on canvas
      window.cv.imshow(canvas, binary);

      // Clean up
      mat.delete();
      gray.delete();
      blurred.delete();
      binary.delete();

      return canvas;
    } catch (error) {
      console.warn('Image preprocessing failed:', error);
      return imageData;
    }
  }

  calculateLocalThreshold(data, index, width) {
    // Calculate local threshold based on surrounding pixels
    const windowSize = 15;
    let sum = 0;
    let count = 0;
    
    for (let y = -windowSize; y <= windowSize; y++) {
      for (let x = -windowSize; x <= windowSize; x++) {
        const idx = index + (y * width + x) * 4;
        if (idx >= 0 && idx < data.length) {
          sum += data[idx];
          count++;
        }
      }
    }
    
    return (sum / count) - 10; // Slightly lower threshold for better text detection
  }

  async recognizeText(canvas) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Get image data from canvas
      const imageData = canvas.toDataURL('image/png');
      
      // Perform OCR
      const result = await this.worker.recognize(imageData);
      
      // Parse the result using parseScoreSheet instead of parseToDigitalFormat
      const parsedData = parseScoreSheet(result.data.text);
      
      return {
        raw: result.data,
        parsed: parsedData
      };
    } catch (error) {
      console.error('OCR recognition error:', error);
      throw new Error('Failed to process image: ' + error.message);
    }
  }

  async checkImageQuality(imageData) {
    // Check image dimensions
    console.log('Checking image dimensions:', imageData.width, 'x', imageData.height);
    if (imageData.width < 800 || imageData.height < 600) {
      throw new Error('Image resolution too low. Please use a higher quality image.');
    }

    // Create a canvas and draw the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.drawImage(imageData, 0, 0);
    
    // Get image data
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    
    // Calculate brightness
    let totalBrightness = 0;
    let pixelCount = 0;
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Calculate perceived brightness using human perception weights
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
      totalBrightness += brightness;
      pixelCount++;
    }
    
    const avgBrightness = totalBrightness / pixelCount;
    console.log('Average brightness:', avgBrightness);

    // More lenient brightness thresholds (was 50-200 before)
    if (avgBrightness < 30 || avgBrightness > 225) {
      console.log('Brightness outside acceptable range:', avgBrightness);
      throw new Error(`Image brightness (${Math.round(avgBrightness)}) is outside acceptable range (30-225). Please adjust lighting.`);
    }

    return true;
  }

  transformToDigitalFormat(gameData) {
    console.log('Transforming OCR data to digital format:', gameData);
    
    const transformedData = {
      gameNumber: gameData.gameNumber,
      opponent: gameData.opponent,
      isHomeTeam: gameData.isHomeTeam,
      innings: gameData.innings.map(inning => ({
        number: inning.number,
        plays: inning.plays.map(play => ({
          value: play.value,
          type: play.type,
          label: play.label,
          custom: play.custom,
          playerId: play.playerId
        }))
      })),
      players: gameData.players.map(player => ({
        name: player.name,
        innings: player.innings.map(inning => ({
          value: inning.value,
          type: inning.type,
          label: inning.label,
          custom: inning.custom
        }))
      }))
    };

    console.log('Transformed data:', transformedData);
    return transformedData;
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.isInitialized = false;
    }
  }

  recognizePlay(cell, patterns) {
    // Check for hits
    for (const [notation, event] of Object.entries(patterns.HITS)) {
      if (cell.includes(notation)) {
        return { event, type: 'hit' };
      }
    }

    // Check for outs
    for (const [notation, details] of Object.entries(patterns.OUTS)) {
      if (new RegExp(`^${notation}$`).test(cell)) {
        return { ...details, type: 'out' };
      }
    }

    // Check for walks
    for (const [notation, event] of Object.entries(patterns.WALKS)) {
      if (cell.includes(notation)) {
        return { event, type: 'walk' };
      }
    }

    return null;
  }

  calculateStats(plays) {
    const stats = {
      atBats: 0,
      hits: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      walks: 0,
      strikeouts: 0,
      battingAvg: 0
    };

    plays.forEach(play => {
      switch (play.event) {
        case 'single':
          stats.hits++;
          stats.singles++;
          stats.atBats++;
          break;
        case 'double':
          stats.hits++;
          stats.doubles++;
          stats.atBats++;
          break;
        case 'triple':
          stats.hits++;
          stats.triples++;
          stats.atBats++;
          break;
        case 'homerun':
          stats.hits++;
          stats.homeRuns++;
          stats.atBats++;
          break;
        case 'out':
          stats.atBats++;
          if (play.outDetails === 'strikeout') {
            stats.strikeouts++;
          }
          break;
        case 'walk':
        case 'intentional walk':
        case 'hit by pitch':
          stats.walks++;
          break;
      }
    });

    // Calculate batting average
    stats.battingAvg = stats.atBats > 0 ? (stats.hits / stats.atBats).toFixed(3) : '.000';

    return stats;
  }

  standardizePlayData(ocrPlay) {
    const standardized = {
      event: '',
      outDetails: '',
      custom: ''
    };

    // Clean and standardize the play text
    const cleanPlay = cleanText(ocrPlay).toUpperCase();

    // Check for hits
    if (cleanPlay.match(/1B|SINGLE/)) {
      standardized.event = '1B';
    } else if (cleanPlay.match(/2B|DOUBLE/)) {
      standardized.event = '2B';
    } else if (cleanPlay.match(/3B|TRIPLE/)) {
      standardized.event = '3B';
    } else if (cleanPlay.match(/HR|HOME RUN/)) {
      standardized.event = 'HR';
    }
    // Check for outs
    else if (cleanPlay.match(/K|SO|STRIKEOUT/)) {
      standardized.event = 'K';
      standardized.outDetails = 'strikeout';
    }
    // Add more patterns as needed

    return standardized;
  }

  enhanceOCRData(rawOCRData) {
    const enhanced = {
      players: rawOCRData.players.map(player => ({
        ...player,
        innings: player.innings.map(inning => 
          this.standardizePlayData(inning.event)
        )
      }))
    };
    
    return enhanced;
  }
}

export default new OCRService();
